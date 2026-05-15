function formatIST(iso: string): string {
  return (
    new Date(iso).toLocaleString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }) + " IST"
  );
}

function patientHtml(p: {
  doctorName: string;
  patientName: string;
  slotDatetime: string;
  meetLink: string;
}): string {
  const when = formatIST(p.slotDatetime);
  return `<!DOCTYPE html><html><body style="font-family:Segoe UI,sans-serif;background:#f4f7f6;padding:24px">
<table width="600" style="margin:0 auto;background:#fff;border-radius:12px;padding:32px">
<tr><td style="background:#1D9E75;padding:24px;text-align:center;border-radius:12px 12px 0 0">
<h1 style="color:#fff;margin:0">DERMA AI</h1></td></tr>
<tr><td style="padding:24px">
<h2>Appointment Confirmed</h2>
<p>Hello <strong>${p.patientName}</strong>, your consultation with <strong>${p.doctorName}</strong> is scheduled for <strong>${when}</strong>.</p>
<p style="background:#1a2e25;color:#fff;padding:16px;border-radius:8px">
<strong>Google Meet:</strong><br><a href="${p.meetLink}" style="color:#6befc0">${p.meetLink}</a>
</p>
</td></tr></table></body></html>`;
}

function doctorHtml(p: {
  doctorName: string;
  patientName: string;
  slotDatetime: string;
  meetLink: string;
}): string {
  const when = formatIST(p.slotDatetime);
  return `<!DOCTYPE html><html><body style="font-family:Segoe UI,sans-serif;background:#f4f7f6;padding:24px">
<table width="600" style="margin:0 auto;background:#fff;border-radius:12px;padding:32px">
<tr><td style="background:#1D9E75;padding:24px;text-align:center;border-radius:12px 12px 0 0">
<h1 style="color:#fff;margin:0">DERMA AI</h1></td></tr>
<tr><td style="padding:24px">
<h2>New Patient Appointment</h2>
<p>Hello <strong>${p.doctorName}</strong>, <strong>${p.patientName}</strong> booked a consultation for <strong>${when}</strong>.</p>
<p style="background:#1a2e25;color:#fff;padding:16px;border-radius:8px">
<strong>Google Meet:</strong><br><a href="${p.meetLink}" style="color:#6befc0">${p.meetLink}</a>
</p>
</td></tr></table></body></html>`;
}

async function sendOne(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM") ?? "DERMA AI <onboarding@resend.dev>";
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { success: false, error: (data as { message?: string }).message ?? res.statusText };
  }
  return { success: true };
}

export async function sendAppointmentEmails(p: {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  slotDatetime: string;
  meetLink: string;
}): Promise<{ patientSent: boolean; doctorSent: boolean }> {
  const [patientResult, doctorResult] = await Promise.all([
    p.patientEmail
      ? sendOne(
        p.patientEmail,
        `Your DERMA AI Appointment — ${p.doctorName}`,
        patientHtml(p),
      )
      : Promise.resolve({ success: false }),
    p.doctorEmail
      ? sendOne(
        p.doctorEmail,
        `New Patient — ${p.patientName} | DERMA AI`,
        doctorHtml(p),
      )
      : Promise.resolve({ success: false }),
  ]);

  return {
    patientSent: patientResult.success,
    doctorSent: doctorResult.success,
  };
}
