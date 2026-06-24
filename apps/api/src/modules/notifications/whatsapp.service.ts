import { config } from "../../config";
import { logger } from "../../utils/logger";

// ── Meta WhatsApp Cloud API ───────────────────────────────────────────────────
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages

const META_API_BASE = "https://graph.facebook.com/v19.0";

export type WaTemplateComponent = {
  type:       "body" | "header" | "button";
  parameters: { type: "text" | "image"; text?: string; image?: { link: string } }[];
  sub_type?:  "url";
  index?:     number;
};

export async function sendWhatsApp(
  phone:        string,
  templateName: string,
  components:   WaTemplateComponent[],
  language =    "en",
): Promise<{ success: boolean; error?: string }> {
  if (!config.whatsapp.token || !config.whatsapp.phoneId) {
    logger.info(`[WHATSAPP DEV] To: ${phone} | Template: ${templateName}`);
    return { success: true };
  }

  const url  = `${META_API_BASE}/${config.whatsapp.phoneId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to:                phone.replace(/\D/g, ""),
    type:              "template",
    template: {
      name:       templateName,
      language:   { code: language },
      components: components.filter((c) => c.parameters.length > 0),
    },
  };

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${config.whatsapp.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      logger.warn(`WhatsApp API error for ${phone}: ${res.status} ${errBody}`);
      return { success: false, error: `HTTP ${res.status}: ${errBody}` };
    }

    logger.info(`WhatsApp sent to ${phone}: ${templateName}`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`WhatsApp send failed for ${phone}: ${msg}`);
    return { success: false, error: msg };
  }
}

// ── Template component builders ───────────────────────────────────────────────
// These must match the APPROVED template variable order in Meta Business Manager.
// All text values are truncated to 1024 chars (Meta limit).

function txt(s: string): { type: "text"; text: string } {
  return { type: "text", text: s.slice(0, 1024) };
}

function fmtIST(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday:  "long",
    month:    "long",
    day:      "numeric",
    hour:     "numeric",
    minute:   "2-digit",
    hour12:   true,
  });
}

export interface WaAppt {
  patientName:  string;
  service:      { title: string };
  startsAt:     Date;
  meetLink:     string | null;
  cancellationReason?: string | null;
}

// Each function returns the body component parameters array.
// Callers are responsible for constructing the full components array if they
// also need a header or button component.

export function waBookingConfirmedComponents(appt: WaAppt): WaTemplateComponent[] {
  return [
    {
      type: "body",
      parameters: [
        txt(appt.patientName),
        txt(appt.service.title),
        txt(fmtIST(appt.startsAt)),
        txt(appt.meetLink ?? "Link will be shared by doctor"),
      ],
    },
  ];
}

export function waBookingRescheduledComponents(appt: WaAppt): WaTemplateComponent[] {
  return [
    {
      type: "body",
      parameters: [
        txt(appt.patientName),
        txt(appt.service.title),
        txt(fmtIST(appt.startsAt)),
      ],
    },
  ];
}

export function waBookingCancelledComponents(appt: WaAppt): WaTemplateComponent[] {
  return [
    {
      type: "body",
      parameters: [
        txt(appt.patientName),
        txt(appt.service.title),
        txt(appt.cancellationReason ?? "No reason provided"),
      ],
    },
  ];
}

export function waReminder24hComponents(appt: WaAppt): WaTemplateComponent[] {
  return [
    {
      type: "body",
      parameters: [
        txt(appt.patientName),
        txt(appt.service.title),
        txt(fmtIST(appt.startsAt)),
        txt(appt.meetLink ?? "Link will be shared by doctor"),
      ],
    },
  ];
}

export function waReminder1hComponents(appt: WaAppt): WaTemplateComponent[] {
  return [
    {
      type: "body",
      parameters: [
        txt(appt.patientName),
        txt(appt.service.title),
        txt(appt.meetLink ?? "Check your email for the link"),
      ],
    },
  ];
}

// ── Twilio SMS fallback stub ──────────────────────────────────────────────────
// Wired up in Step 13 but real credentials come later.
// Drop-in: replace this stub with the Twilio SDK call.

export async function sendSmsFallback(
  phone:   string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  // Stub — log in dev, no-op until TWILIO_* env vars are set
  logger.info(`[SMS STUB] To: ${phone} | ${message}`);
  return { success: true };
}
