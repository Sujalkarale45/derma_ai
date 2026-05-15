import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createMeetEvent, cancelMeetEvent } from "../_shared/google-calendar.ts";
import { sendAppointmentEmails } from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) {
      return json({ error: "Invalid session" }, 401);
    }

    const body = await req.json();
    const {
      doctor_id,
      doctor_name,
      doctor_email,
      specialisation,
      slot_datetime,
      patient_name,
      patient_email,
    } = body;

    if (!doctor_id || !doctor_name || !slot_datetime) {
      return json({ error: "doctor_id, doctor_name, and slot_datetime are required" }, 400);
    }

    const slotDate = new Date(slot_datetime);
    if (Number.isNaN(slotDate.getTime())) {
      return json({ error: "Invalid slot_datetime" }, 400);
    }
    if (slotDate.getTime() < Date.now()) {
      return json({ error: "Cannot book an appointment in the past" }, 400);
    }

    const resolvedPatientName =
      patient_name ?? (user.user_metadata?.name as string) ?? "Patient";
    const resolvedPatientEmail = patient_email ?? user.email ?? "";

    // 1) Create real Google Meet via Calendar API
    const meet = await createMeetEvent({
      doctorName: doctor_name,
      doctorEmail: doctor_email ?? "",
      patientName: resolvedPatientName,
      patientEmail: resolvedPatientEmail,
      slotDatetime: slot_datetime,
    });

    // 2) Insert appointment with service role (includes meet_link)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: appt, error: insertErr } = await supabaseAdmin
      .from("appointments")
      .insert({
        patient_id: user.id,
        doctor_id,
        doctor_name,
        patient_name: resolvedPatientName,
        specialisation: specialisation ?? null,
        slot_datetime,
        status: "confirmed",
        meet_link: meet.meet_link,
        calendar_event_id: meet.event_id,
      })
      .select()
      .single();

    if (insertErr) {
      try {
        await cancelMeetEvent(meet.event_id);
      } catch {
        // best-effort rollback
      }
      const status = insertErr.code === "23505" ? 409 : 500;
      return json({ error: insertErr.message }, status);
    }

    // 3) Send confirmation emails
    let emails = { patientSent: false, doctorSent: false };
    try {
      emails = await sendAppointmentEmails({
        doctorName: doctor_name,
        doctorEmail: doctor_email ?? "",
        patientName: resolvedPatientName,
        patientEmail: resolvedPatientEmail,
        slotDatetime: slot_datetime,
        meetLink: meet.meet_link,
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    return json({
      appointment: appt,
      meet_link: meet.meet_link,
      emails,
    });
  } catch (e) {
    console.error("book-appointment error:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
