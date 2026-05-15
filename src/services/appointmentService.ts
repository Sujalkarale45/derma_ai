import { supabase, isConfigured } from './supabase';
import type { Appointment } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

export interface BookAppointmentPayload {
  doctor_id: string;
  doctor_name: string;
  doctor_email: string;
  specialisation: string;
  slot_datetime: string;
  patient_name: string;
  patient_email: string;
}

export interface BookAppointmentResult {
  appointment: Appointment;
  meet_link: string;
  emails: { patientSent: boolean; doctorSent: boolean };
}

/** Book via Supabase Edge Function (production path). */
async function bookViaEdgeFunction(
  payload: BookAppointmentPayload,
  accessToken: string,
): Promise<BookAppointmentResult> {
  const res = await fetch(`${supabaseUrl}/functions/v1/book-appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Booking failed (${res.status})`);
  }

  return data as BookAppointmentResult;
}

/**
 * Fallback when Edge Function is not deployed: Vercel /api routes + Supabase insert.
 * Still requires real Google Calendar via /api/create-appointment — no fake Meet links.
 */
async function bookViaLegacyApi(
  payload: BookAppointmentPayload,
  patientId: string,
): Promise<BookAppointmentResult> {
  const meetRes = await fetch('/api/create-appointment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctor_name: payload.doctor_name,
      doctor_email: payload.doctor_email,
      patient_name: payload.patient_name,
      patient_email: payload.patient_email,
      slot_datetime: payload.slot_datetime,
    }),
  });

  const meetData = await meetRes.json().catch(() => ({}));
  if (!meetRes.ok || !(meetData as { meet_link?: string }).meet_link) {
    const msg = (meetData as { error?: string }).error
      ?? 'Google Calendar is not configured. Deploy the book-appointment edge function or set GOOGLE_SERVICE_ACCOUNT_JSON on Vercel.';
    throw new Error(msg);
  }

  const meetLink = (meetData as { meet_link: string }).meet_link;
  const eventId = (meetData as { event_id?: string }).event_id;

  const { data: appt, error: insertErr } = await supabase
    .from('appointments')
    .insert({
      patient_id: patientId,
      doctor_id: payload.doctor_id,
      doctor_name: payload.doctor_name,
      patient_name: payload.patient_name,
      specialisation: payload.specialisation,
      slot_datetime: payload.slot_datetime,
      status: 'confirmed',
      meet_link: meetLink,
      calendar_event_id: eventId ?? null,
    })
    .select()
    .single();

  if (insertErr) {
    throw new Error(insertErr.message);
  }

  let emails = { patientSent: false, doctorSent: false };
  try {
    const emailRes = await fetch('/api/send-appointment-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor_name: payload.doctor_name,
        doctor_email: payload.doctor_email,
        patient_name: payload.patient_name,
        patient_email: payload.patient_email,
        slot_datetime: payload.slot_datetime,
        meet_link: meetLink,
      }),
    });
    if (emailRes.ok) {
      const emailData = await emailRes.json();
      emails = {
        patientSent: emailData.patient_sent === true,
        doctorSent: emailData.doctor_sent === true,
      };
    }
  } catch {
    // non-blocking
  }

  return {
    appointment: appt as Appointment,
    meet_link: meetLink,
    emails,
  };
}

/**
 * Books an appointment: Meet link → Supabase row → confirmation emails.
 */
export async function bookAppointment(
  payload: BookAppointmentPayload,
): Promise<BookAppointmentResult> {
  if (!isConfigured) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be logged in to book an appointment.');
  }

  try {
    return await bookViaEdgeFunction(payload, session.access_token);
  } catch (edgeErr) {
    const message = edgeErr instanceof Error ? edgeErr.message : String(edgeErr);
    const useLegacy =
      message.includes('Failed to fetch') ||
      message.includes('404') ||
      message.includes('not configured') ||
      message.includes('Function');

    if (useLegacy) {
      console.warn('Edge function unavailable, trying legacy /api path:', message);
      return bookViaLegacyApi(payload, session.user.id);
    }
    throw edgeErr;
  }
}
