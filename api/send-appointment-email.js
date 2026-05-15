/**
 * /api/send-appointment-email.js
 * ================================
 * Vercel Node.js Serverless Function — sends appointment confirmation emails
 * to BOTH the patient and the doctor using the Resend API.
 *
 * POST /api/send-appointment-email
 * Body: {
 *   doctor_name:    string,
 *   doctor_email:   string,
 *   patient_name:   string,
 *   patient_email:  string,
 *   slot_datetime:  string   (ISO 8601, e.g. "2026-04-16T10:00:00.000Z"),
 *   meet_link:      string
 * }
 *
 * Returns: { success: true, patient_sent: bool, doctor_sent: bool }
 *
 * Environment variable required (set in Vercel dashboard — NOT in frontend .env):
 *   RESEND_API_KEY   — from https://resend.com/api-keys
 *   EMAIL_FROM       — verified sender address, e.g. "DERMA AI <noreply@yourdomain.com>"
 *                      Use "onboarding@resend.dev" for testing (Resend sandbox)
 */

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats an ISO datetime string into a readable IST string.
 * e.g. "Wednesday, 16 April 2026 at 10:00 AM IST"
 */
function formatDateTimeIST(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    weekday:  'long',
    day:      'numeric',
    month:    'long',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
    timeZone: 'Asia/Kolkata',
  }) + ' IST';
}

/**
 * Builds the HTML email body for the patient.
 */
function buildPatientEmail({ doctor_name, patient_name, slot_datetime, meet_link }) {
  const formattedDate = formatDateTimeIST(slot_datetime);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Appointment Confirmed — DERMA AI</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a7a5a,#1D9E75);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">DERMA AI</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Skin Care, Anywhere</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#1a2e25;font-size:20px;margin:0 0 8px;">Appointment Confirmed!</h2>
            <p style="color:#4a6356;margin:0 0 28px;font-size:15px;line-height:1.6;">
              Hello <strong>${patient_name}</strong>, your video consultation has been successfully scheduled on DERMA AI.
            </p>

            <!-- Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf6;border-radius:8px;border:1px solid #c3e8d8;margin-bottom:28px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr>
                    <td width="120" style="color:#5a7a6a;font-size:13px;padding:6px 0;vertical-align:top;">Doctor</td>
                    <td style="color:#1a2e25;font-size:14px;font-weight:600;padding:6px 0;">${doctor_name}</td>
                  </tr>
                  <tr>
                    <td style="color:#5a7a6a;font-size:13px;padding:6px 0;vertical-align:top;">Date &amp; Time</td>
                    <td style="color:#1a2e25;font-size:14px;font-weight:600;padding:6px 0;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="color:#5a7a6a;font-size:13px;padding:6px 0;vertical-align:top;">Format</td>
                    <td style="color:#1a2e25;font-size:14px;font-weight:600;padding:6px 0;">Video Consultation</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Meet Link -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a2e25;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:24px;">
                <p style="color:#6befc0;margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Your Google Meet Link</p>
                <p style="color:#ffffff;margin:0 0 16px;font-size:13px;word-break:break-all;font-family:monospace;">${meet_link}</p>
                <a href="${meet_link}" style="display:inline-block;background:#1D9E75;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">Join Google Meet</a>
              </td></tr>
            </table>

            <!-- Instructions -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #1D9E75;padding-left:16px;margin-bottom:28px;">
              <tr><td>
                <p style="color:#1a2e25;font-size:13px;font-weight:700;margin:0 0 8px;">Before your appointment:</p>
                <ul style="color:#4a6356;font-size:13px;margin:0;padding-left:16px;line-height:1.8;">
                  <li>Ensure a stable internet connection</li>
                  <li>Enable your camera and microphone</li>
                  <li>Join 2–3 minutes before the scheduled time</li>
                  <li>Have your AI scan report ready if applicable</li>
                </ul>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0faf6;padding:20px 40px;text-align:center;border-top:1px solid #dceee7;">
            <p style="color:#8aab99;margin:0;font-size:12px;">DERMA AI · Telemedicine Platform · Skin Care, Anywhere</p>
            <p style="color:#aac5b8;margin:4px 0 0;font-size:11px;">This is an automated message. Please do not reply to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Builds the HTML email body for the doctor.
 */
function buildDoctorEmail({ doctor_name, patient_name, slot_datetime, meet_link }) {
  const formattedDate = formatDateTimeIST(slot_datetime);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Appointment — DERMA AI</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a7a5a,#1D9E75);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">DERMA AI</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">New Appointment Notification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#1a2e25;font-size:20px;margin:0 0 8px;">New Patient Appointment</h2>
            <p style="color:#4a6356;margin:0 0 28px;font-size:15px;line-height:1.6;">
              Hello <strong>${doctor_name}</strong>, a patient has scheduled a video consultation with you on DERMA AI.
            </p>

            <!-- Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf6;border-radius:8px;border:1px solid #c3e8d8;margin-bottom:28px;">
              <tr><td style="padding:24px;">
                <table width="100%" cellpadding="0" cellspacing="6">
                  <tr>
                    <td width="120" style="color:#5a7a6a;font-size:13px;padding:6px 0;vertical-align:top;">Patient</td>
                    <td style="color:#1a2e25;font-size:14px;font-weight:600;padding:6px 0;">${patient_name}</td>
                  </tr>
                  <tr>
                    <td style="color:#5a7a6a;font-size:13px;padding:6px 0;vertical-align:top;">Date &amp; Time</td>
                    <td style="color:#1a2e25;font-size:14px;font-weight:600;padding:6px 0;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="color:#5a7a6a;font-size:13px;padding:6px 0;vertical-align:top;">Format</td>
                    <td style="color:#1a2e25;font-size:14px;font-weight:600;padding:6px 0;">Video Consultation</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Meet Link -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a2e25;border-radius:8px;margin-bottom:28px;">
              <tr><td style="padding:24px;">
                <p style="color:#6befc0;margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Google Meet Link</p>
                <p style="color:#ffffff;margin:0 0 16px;font-size:13px;word-break:break-all;font-family:monospace;">${meet_link}</p>
                <a href="${meet_link}" style="display:inline-block;background:#1D9E75;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">Join Google Meet</a>
              </td></tr>
            </table>

            <!-- Reminder -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #1D9E75;padding-left:16px;">
              <tr><td>
                <p style="color:#1a2e25;font-size:13px;font-weight:700;margin:0 0 8px;">Consultation notes:</p>
                <ul style="color:#4a6356;font-size:13px;margin:0;padding-left:16px;line-height:1.8;">
                  <li>Patient's AI scan report is available in your consultation dashboard</li>
                  <li>Please review the case before the session if possible</li>
                  <li>Join the meet link 2–3 minutes before the scheduled time</li>
                </ul>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0faf6;padding:20px 40px;text-align:center;border-top:1px solid #dceee7;">
            <p style="color:#8aab99;margin:0;font-size:12px;">DERMA AI · Telemedicine Platform · Skin Care, Anywhere</p>
            <p style="color:#aac5b8;margin:4px 0 0;font-size:11px;">This is an automated message. Please do not reply to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends a single email via the Resend REST API.
 * Returns { success: boolean, error?: string }
 */
async function sendEmail({ apiKey, from, to, subject, html }) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[Resend] Error sending to ${to}:`, data);
      return { success: false, error: data.message || 'Unknown Resend error' };
    }

    console.log(`[Resend] Email sent to ${to} | ID: ${data.id}`);
    return { success: true };
  } catch (err) {
    console.error(`[Resend] Network error sending to ${to}:`, err);
    return { success: false, error: String(err) };
  }
}

// ─── CORS helper ───────────────────────────────────────────────────────────────

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ─── Vercel Handler ────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...corsHeaders(), 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body;
  try {
    // Vercel Node functions receive body as stream; collect it
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    body = JSON.parse(raw);
  } catch {
    res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  // ── Validate required fields ─────────────────────────────────────────────────
  const required = ['doctor_name', 'doctor_email', 'patient_name', 'patient_email', 'slot_datetime', 'meet_link'];
  const missing  = required.filter(f => !body[f]);
  if (missing.length > 0) {
    res.writeHead(400, { ...corsHeaders(), 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }));
    return;
  }

  // ── Read environment variables ───────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.EMAIL_FROM || 'DERMA AI <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY is not set');
    res.writeHead(500, { ...corsHeaders(), 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'RESEND_API_KEY not configured in environment' }));
    return;
  }

  const { doctor_name, doctor_email, patient_name, patient_email, slot_datetime, meet_link } = body;

  // ── Send emails in parallel ──────────────────────────────────────────────────
  const [patientResult, doctorResult] = await Promise.all([
    sendEmail({
      apiKey,
      from,
      to:      patient_email,
      subject: `Your DERMA AI Appointment is Confirmed — ${doctor_name}`,
      html:    buildPatientEmail({ doctor_name, patient_name, slot_datetime, meet_link }),
    }),
    sendEmail({
      apiKey,
      from,
      to:      doctor_email,
      subject: `New Patient Appointment — ${patient_name} | DERMA AI`,
      html:    buildDoctorEmail({ doctor_name, patient_name, slot_datetime, meet_link }),
    }),
  ]);

  // ── Respond ──────────────────────────────────────────────────────────────────
  const success = patientResult.success || doctorResult.success;
  const status  = success ? 200 : 500;

  res.writeHead(status, { ...corsHeaders(), 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success,
    patient_sent:  patientResult.success,
    doctor_sent:   doctorResult.success,
    patient_error: patientResult.error,
    doctor_error:  doctorResult.error,
  }));
}
