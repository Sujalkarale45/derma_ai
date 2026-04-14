/**
 * Generates a deterministic Google Meet room link based on a seed string
 * (doctor ID + appointment slot). Same appointment always = same Meet room.
 * Format: https://meet.google.com/xxx-xxxx-xxx
 */
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function deterministicSegment(seed: string, offset: number, length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let h = hashCode(seed + offset);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[h % chars.length];
    h = Math.imul(31, h) + (i + offset * 7) | 0;
    h = Math.abs(h);
  }
  return result;
}

/**
 * Generate a stable Meet link. Pass a seed (e.g. doctorId + slotISO)
 * so the same appointment always produces the same room URL.
 */
export function generateMeetLink(seed?: string): string {
  const s = seed ?? `${Date.now()}-${Math.random()}`;
  const a = deterministicSegment(s, 1, 3);
  const b = deterministicSegment(s, 2, 4);
  const c = deterministicSegment(s, 3, 3);
  return `https://meet.google.com/${a}-${b}-${c}`;
}

// ─── WhatsApp message helpers ─────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function openWhatsApp(phone: string | undefined, message: string): void {
  const url = phone
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ─── Patient confirmation ─────────────────────────────────────────────────────

export function shareToPatientWhatsApp(
  doctorName: string,
  dateTimeISO: string,
  meetLink: string,
  patientPhone?: string
): void {
  const message = [
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `DERMA AI — Appointment Confirmation`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Your video consultation has been successfully scheduled.`,
    ``,
    `Appointment Details`,
    `Doctor: ${doctorName}`,
    `Date: ${formatDateTime(dateTimeISO)}`,
    ``,
    `Google Meet Link`,
    `${meetLink}`,
    ``,
    `Instructions`,
    `• Please join the meeting at the scheduled time using the link above`,
    `• Ensure that your camera and microphone are enabled prior to joining`,
    `• Kindly be available a few minutes in advance to avoid any delays`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `DERMA AI — Skin Care, Anywhere`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
  ].join('\n');

  openWhatsApp(patientPhone, message);
}

// ─── Doctor notification ──────────────────────────────────────────────────────

export function shareToDocterWhatsApp(
  doctorName: string,
  patientName: string,
  dateTimeISO: string,
  meetLink: string,
  doctorPhone: string
): void {
  const message = [
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `DERMA AI — New Appointment`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Hello ${doctorName},`,
    ``,
    `A patient has scheduled a video consultation with you.`,
    ``,
    `Appointment Details`,
    `Patient: ${patientName}`,
    `Date: ${formatDateTime(dateTimeISO)}`,
    ``,
    `Google Meet Link`,
    `${meetLink}`,
    ``,
    `Instructions`,
    `• Please join the meeting at the scheduled time using the link above`,
    `• The patient's AI scan report is available in your consultation dashboard`,
    `• Kindly be available a few minutes in advance to avoid any delays`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `DERMA AI — Telemedicine Platform`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
  ].join('\n');

  openWhatsApp(doctorPhone, message);
}

/** Legacy alias */
export function shareViaWhatsApp(
  doctorName: string,
  dateTimeISO: string,
  meetLink: string,
  patientPhone?: string
): void {
  shareToPatientWhatsApp(doctorName, dateTimeISO, meetLink, patientPhone);
}
