import { JWT } from "npm:google-auth-library@9";

export interface MeetEventResult {
  meet_link: string;
  event_id: string;
  event_link: string;
}

async function getAccessToken(saJson: string): Promise<string> {
  const credentials = JSON.parse(saJson);
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  const { credentials: tokens } = await client.authorize();
  if (!tokens.access_token) {
    throw new Error("Failed to obtain Google access token");
  }
  return tokens.access_token;
}

export async function createMeetEvent(params: {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  slotDatetime: string;
  durationMinutes?: number;
}): Promise<MeetEventResult> {
  const saJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!saJson || !calendarId) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CALENDAR_ID not configured");
  }

  const accessToken = await getAccessToken(saJson);
  const start = new Date(params.slotDatetime);
  const end = new Date(start.getTime() + (params.durationMinutes ?? 30) * 60_000);

  const attendees: { email: string; displayName?: string }[] = [];
  if (params.doctorEmail) {
    attendees.push({ email: params.doctorEmail, displayName: params.doctorName });
  }
  if (params.patientEmail) {
    attendees.push({ email: params.patientEmail, displayName: params.patientName });
  }

  const eventBody = {
    summary: `DERMA AI — ${params.patientName} with ${params.doctorName}`,
    description: [
      "DERMA AI Telemedicine Consultation",
      `Doctor: ${params.doctorName}`,
      `Patient: ${params.patientName}`,
    ].join("\n"),
    start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
    attendees,
    conferenceData: {
      createRequest: {
        requestId: `derma-ai-${Math.floor(start.getTime() / 1000)}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 10 },
      ],
    },
    guestsCanModifyEvent: false,
  };

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${errText}`);
  }

  const event = await res.json();
  const entryPoints = event.conferenceData?.entryPoints ?? [];
  const meetLink = entryPoints.find(
    (ep: { entryPointType?: string }) => ep.entryPointType === "video",
  )?.uri;

  if (!meetLink) {
    throw new Error("Google Meet link was not generated. Check calendar sharing with the service account.");
  }

  return {
    meet_link: meetLink,
    event_id: event.id,
    event_link: event.htmlLink ?? "",
  };
}

export async function cancelMeetEvent(eventId: string): Promise<void> {
  const saJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!saJson || !calendarId || !eventId) return;

  const accessToken = await getAccessToken(saJson);
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;

  await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
