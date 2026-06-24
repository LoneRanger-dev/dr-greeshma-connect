import { prisma } from "../../utils/prisma";
import { logger } from "../../utils/logger";
import { sendEmail } from "./email.service";
import { sendWhatsApp } from "./whatsapp.service";
import { config } from "../../config";
import * as tmpl from "./email-templates";
import * as wa from "./whatsapp.service";

// ── Notification types ────────────────────────────────────────────────────────

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_CANCELLED"
  | "REMINDER_24H"
  | "REMINDER_1H";

// ── DB appointment shape for notifications ────────────────────────────────────

const NOTIF_SELECT = {
  id:                 true,
  patientName:        true,
  patientEmail:       true,
  patientPhone:       true,
  startsAt:           true,
  endsAt:             true,
  meetLink:           true,
  cancellationReason: true,
  service: { select: { title: true, durationMin: true, priceInr: true } },
  doctor:  { select: { user: { select: { name: true } } } },
} as const;

export type ApptForNotif = {
  id:                 string;
  patientName:        string | null;
  patientEmail:       string | null;
  patientPhone:       string | null;
  startsAt:           Date;
  endsAt:             Date;
  meetLink:           string | null;
  cancellationReason: string | null;
  service: { title: string; durationMin: number; priceInr: number };
  doctor:  { user: { name: string } };
};

export async function fetchAppt(appointmentId: string): Promise<ApptForNotif | null> {
  return prisma.appointment.findUnique({
    where:  { id: appointmentId },
    select: NOTIF_SELECT,
  });
}

// ── Core: send + log ──────────────────────────────────────────────────────────

export async function sendNotification(
  type:          NotificationType,
  appointmentId: string,
  apptOverride?: ApptForNotif, // pass pre-loaded appointment to avoid extra DB call
): Promise<void> {
  const appt = apptOverride ?? await fetchAppt(appointmentId);
  if (!appt) {
    logger.warn(`sendNotification(${type}): appointment ${appointmentId} not found`);
    return;
  }

  // Run email + WhatsApp in parallel — failures are logged but never throw
  await Promise.allSettled([
    sendEmailNotification(type, appt),
    sendWhatsAppNotification(type, appt),
  ]);
}

// ── Email ─────────────────────────────────────────────────────────────────────

async function sendEmailNotification(type: NotificationType, appt: ApptForNotif): Promise<void> {
  if (!appt.patientEmail) return;

  const emailAppt: tmpl.EmailAppt = {
    id:                 appt.id,
    patientName:        appt.patientName  ?? "Patient",
    patientEmail:       appt.patientEmail,
    startsAt:           appt.startsAt,
    endsAt:             appt.endsAt,
    meetLink:           appt.meetLink,
    cancellationReason: appt.cancellationReason,
    service:            appt.service,
    doctor:             appt.doctor,
  };

  const { subject, html } = buildEmailTemplate(type, emailAppt);

  const result = await sendEmail(appt.patientEmail, subject, html);

  await logNotification({
    appointmentId: appt.id,
    channel:       "EMAIL",
    type,
    success:       result.success,
    error:         result.error,
  });
}

function buildEmailTemplate(type: NotificationType, appt: tmpl.EmailAppt): { subject: string; html: string } {
  switch (type) {
    case "BOOKING_CONFIRMED":   return tmpl.bookingConfirmedEmail(appt);
    case "BOOKING_RESCHEDULED": return tmpl.bookingRescheduledEmail(appt);
    case "BOOKING_CANCELLED":   return tmpl.bookingCancelledEmail(appt);
    case "REMINDER_24H":        return tmpl.reminder24hEmail(appt);
    case "REMINDER_1H":         return tmpl.reminder1hEmail(appt);
  }
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

async function sendWhatsAppNotification(type: NotificationType, appt: ApptForNotif): Promise<void> {
  if (!appt.patientPhone) return;

  const waAppt: wa.WaAppt = {
    patientName:        appt.patientName ?? "Patient",
    service:            appt.service,
    startsAt:           appt.startsAt,
    meetLink:           appt.meetLink,
    cancellationReason: appt.cancellationReason,
  };

  const { templateName, components } = buildWaTemplate(type, waAppt);

  const result = await sendWhatsApp(appt.patientPhone, templateName, components);

  await logNotification({
    appointmentId: appt.id,
    channel:       "WHATSAPP",
    type,
    success:       result.success,
    error:         result.error,
  });
}

function buildWaTemplate(type: NotificationType, appt: wa.WaAppt): {
  templateName: string;
  components:   wa.WaTemplateComponent[];
} {
  switch (type) {
    case "BOOKING_CONFIRMED":
      return { templateName: config.whatsapp.templates.bookingConfirmed,   components: wa.waBookingConfirmedComponents(appt) };
    case "BOOKING_RESCHEDULED":
      return { templateName: config.whatsapp.templates.bookingRescheduled, components: wa.waBookingRescheduledComponents(appt) };
    case "BOOKING_CANCELLED":
      return { templateName: config.whatsapp.templates.bookingCancelled,   components: wa.waBookingCancelledComponents(appt) };
    case "REMINDER_24H":
      return { templateName: config.whatsapp.templates.reminder24h,        components: wa.waReminder24hComponents(appt) };
    case "REMINDER_1H":
      return { templateName: config.whatsapp.templates.reminder1h,         components: wa.waReminder1hComponents(appt) };
  }
}

// ── Notification DB logger ────────────────────────────────────────────────────

async function logNotification(params: {
  appointmentId: string;
  channel:       "EMAIL" | "WHATSAPP" | "SMS";
  type:          string;
  success:       boolean;
  error?:        string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        appointmentId: params.appointmentId,
        channel:       params.channel,
        type:          params.type,
        status:        params.success ? "SENT" : "FAILED",
        sentAt:        params.success ? new Date() : undefined,
        error:         params.error,
      },
    });
  } catch (err) {
    logger.warn("Failed to log notification:", err);
  }
}

// ── Check if a reminder was already sent ─────────────────────────────────────

export async function reminderAlreadySent(
  appointmentId: string,
  type:          "REMINDER_24H" | "REMINDER_1H",
): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: {
      appointmentId,
      type,
      status: "SENT",
    },
    select: { id: true },
  });
  return !!existing;
}
