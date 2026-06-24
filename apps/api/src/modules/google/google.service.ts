import { google } from "googleapis";
import { prisma } from "../../utils/prisma";
import { config } from "../../config";
import { logger } from "../../utils/logger";

// ── OAuth2 client factory ─────────────────────────────────────────────────────

function makeOAuth2Client() {
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri,
  );
}

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

// ── Auth URL ──────────────────────────────────────────────────────────────────

export function getAuthUrl(): string {
  return makeOAuth2Client().generateAuthUrl({
    access_type: "offline",
    scope:       CALENDAR_SCOPES,
    prompt:      "consent", // ensures refresh_token is returned
  });
}

// ── Code exchange ─────────────────────────────────────────────────────────────

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token?:  string | null;
  refresh_token?: string | null;
  expiry_date?:   number | null;
  token_type?:    string | null;
  id_token?:      string | null;
  scope?:         string;
}> {
  const { tokens } = await makeOAuth2Client().getToken(code);
  return tokens;
}

// ── Refresh token persistence ─────────────────────────────────────────────────

export async function saveRefreshToken(doctorProfileId: string, refreshToken: string): Promise<void> {
  await prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data:  { googleRefreshToken: refreshToken },
  });
}

// ── Get auth client with refresh token ───────────────────────────────────────
// Returns null when Google Calendar is not configured or no token is available.

async function getAuthClient(doctorProfileId: string): Promise<InstanceType<typeof google.auth.OAuth2> | null> {
  if (!config.google.clientId || !config.google.clientSecret) return null;

  // Prefer env var (simpler single-doctor setup) over DB-stored token
  let refreshToken = config.google.refreshToken;

  if (!refreshToken) {
    const profile = await prisma.doctorProfile.findUnique({
      where:  { id: doctorProfileId },
      select: { googleRefreshToken: true },
    });
    refreshToken = profile?.googleRefreshToken ?? "";
  }

  if (!refreshToken) return null;

  const client = makeOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

// ── Connection status ─────────────────────────────────────────────────────────

export async function getConnectionStatus(doctorProfileId: string): Promise<{
  connected: boolean;
  source:    "env" | "db" | null;
}> {
  if (config.google.clientId && config.google.clientSecret && config.google.refreshToken) {
    return { connected: true, source: "env" };
  }

  const profile = await prisma.doctorProfile.findUnique({
    where:  { id: doctorProfileId },
    select: { googleRefreshToken: true },
  });

  if (profile?.googleRefreshToken) {
    return { connected: true, source: "db" };
  }

  return { connected: false, source: null };
}

// ── Calendar event CRUD ───────────────────────────────────────────────────────

export interface CreateEventParams {
  appointmentId:   string;
  doctorProfileId: string;
  doctorEmail:     string;
  patientEmail:    string;
  patientName:     string;
  serviceName:     string;
  startsAt:        Date;
  endsAt:          Date;
}

export interface EventResult {
  eventId:  string;
  meetLink: string;
}

export async function createCalendarEvent(params: CreateEventParams): Promise<EventResult | null> {
  const auth = await getAuthClient(params.doctorProfileId);
  if (!auth) return null;

  try {
    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.insert({
      calendarId:             config.google.calendarId,
      conferenceDataVersion:  1,
      sendUpdates:            "all",
      requestBody: {
        summary:     `${params.serviceName} — ${params.patientName}`,
        description: `Telehealth appointment\nPatient: ${params.patientName}\nEmail: ${params.patientEmail}`,
        start:       { dateTime: params.startsAt.toISOString(), timeZone: "Asia/Kolkata" },
        end:         { dateTime: params.endsAt.toISOString(),   timeZone: "Asia/Kolkata" },
        attendees: [
          { email: params.patientEmail, displayName: params.patientName },
        ],
        conferenceData: {
          createRequest: {
            requestId:            `drg-${params.appointmentId}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email",  minutes: 1440 }, // 24 h
            { method: "popup",  minutes: 60   }, // 1 h
          ],
        },
      },
    });

    const evt      = response.data as Record<string, unknown>;
    const meetLink =
      (evt["hangoutLink"] as string | undefined) ??
      response.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ??
      "";

    return { eventId: response.data.id ?? "", meetLink };
  } catch (err) {
    logger.warn("Google Calendar createEvent failed — appointment will still be confirmed:", err);
    return null;
  }
}

export async function patchCalendarEvent(params: {
  doctorProfileId: string;
  googleEventId:   string;
  startsAt:        Date;
  endsAt:          Date;
}): Promise<void> {
  const auth = await getAuthClient(params.doctorProfileId);
  if (!auth) return;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.patch({
      calendarId: config.google.calendarId,
      eventId:    params.googleEventId,
      requestBody: {
        start: { dateTime: params.startsAt.toISOString(), timeZone: "Asia/Kolkata" },
        end:   { dateTime: params.endsAt.toISOString(),   timeZone: "Asia/Kolkata" },
      },
    });
  } catch (err) {
    logger.warn("Google Calendar patchEvent failed:", err);
  }
}

export async function deleteCalendarEvent(params: {
  doctorProfileId: string;
  googleEventId:   string;
}): Promise<void> {
  const auth = await getAuthClient(params.doctorProfileId);
  if (!auth) return;

  try {
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({
      calendarId:  config.google.calendarId,
      eventId:     params.googleEventId,
      sendUpdates: "all",
    });
  } catch (err) {
    logger.warn("Google Calendar deleteEvent failed:", err);
  }
}
