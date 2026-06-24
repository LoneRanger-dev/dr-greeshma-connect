import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { getDaySlots } from "../slots/slots.service";
import { getISTDateString } from "../../utils/istUtils";
import { writeAuditLog } from "../../middleware/auditLog";
import { logger } from "../../utils/logger";
import * as googleSvc from "../google/google.service";
import { sendNotification } from "../notifications/notifications.service";
import type {
  BookAppointmentInput,
  RescheduleAppointmentInput,
  AppointmentFilterInput,
} from "@dr-greeshma/shared";

// ── Google Meet helpers ───────────────────────────────────────────────────────
// All Google calls are fire-and-forget — they never block or throw to the caller.

async function attachMeetLink(appointmentId: string): Promise<void> {
  const appt = await prisma.appointment.findUnique({
    where:  { id: appointmentId },
    select: {
      id:           true,
      startsAt:     true,
      endsAt:       true,
      patientEmail: true,
      patientName:  true,
      service:      { select: { title: true } },
      doctor:       { select: { id: true, user: { select: { email: true } } } },
    },
  });
  if (!appt) return;

  const result = await googleSvc.createCalendarEvent({
    appointmentId:   appt.id,
    doctorProfileId: appt.doctor.id,
    doctorEmail:     appt.doctor.user.email,
    patientEmail:    appt.patientEmail ?? "",
    patientName:     appt.patientName  ?? "Patient",
    serviceName:     appt.service.title,
    startsAt:        appt.startsAt,
    endsAt:          appt.endsAt,
  });

  if (!result) return;

  await prisma.appointment.update({
    where: { id: appointmentId },
    data:  { meetLink: result.meetLink, googleEventId: result.eventId },
  }).catch((err) => logger.warn("Failed to save meetLink on appointment:", err));
}

async function updateMeetTime(appointment: {
  id:            string;
  doctorId:      string;
  googleEventId: string | null;
  startsAt:      Date;
  endsAt:        Date;
}): Promise<void> {
  if (!appointment.googleEventId) return;
  await googleSvc.patchCalendarEvent({
    doctorProfileId: appointment.doctorId,
    googleEventId:   appointment.googleEventId,
    startsAt:        appointment.startsAt,
    endsAt:          appointment.endsAt,
  });
}

async function removeMeetEvent(appointment: {
  doctorId:      string;
  googleEventId: string | null;
}): Promise<void> {
  if (!appointment.googleEventId) return;
  await googleSvc.deleteCalendarEvent({
    doctorProfileId: appointment.doctorId,
    googleEventId:   appointment.googleEventId,
  });
}

// ── Shape returned to callers ────────────────────────────────────────────────

const APPOINTMENT_SELECT = {
  id:                 true,
  status:             true,
  startsAt:           true,
  endsAt:             true,
  amountInr:          true,
  notes:              true,
  patientName:        true,
  patientEmail:       true,
  patientPhone:       true,
  cancellationReason: true,
  meetLink:           true,
  googleEventId:      true,
  createdAt:          true,
  updatedAt:          true,
  patient: { select: { id: true, name: true, email: true, phone: true } },
  service: { select: { id: true, slug: true, title: true, durationMin: true, priceInr: true } },
  doctor:  { select: { id: true, userId: true, user: { select: { name: true } } } },
} as const;

// ── Ownership guard ─────────────────────────────────────────────────────────

function assertCanAccess(
  appointment: { patientId: string; doctor: { userId: string } } | null,
  userId: string,
  role: string,
) {
  if (!appointment) throw new AppError(404, "Appointment not found", "NOT_FOUND");
  if (role === "ADMIN" || role === "DOCTOR") return;
  if (appointment.patientId !== userId)
    throw new AppError(403, "Access denied", "FORBIDDEN");
}

// ── Book ────────────────────────────────────────────────────────────────────

export async function bookAppointment(input: BookAppointmentInput, patientId: string) {
  // 1. Validate the service exists
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
  if (!service || !service.isActive)
    throw new AppError(404, "Service not found or inactive", "SERVICE_NOT_FOUND");

  // 2. Validate the slot is still free
  const startsAt  = new Date(input.startsAt);
  const dateStr   = getISTDateString(startsAt);
  const freeSlots = await getDaySlots(dateStr, input.serviceId);
  const slotOk    = freeSlots.some((s) => new Date(s.startsAt).getTime() === startsAt.getTime());

  if (!slotOk)
    throw new AppError(400, "This slot is not available. Please choose another time.", "SLOT_UNAVAILABLE");

  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);

  // 3. Create — let the DB unique constraint (doctorId, startsAt) be the race-condition guard
  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        serviceId:   input.serviceId,
        doctorId:    input.doctorId,
        startsAt,
        endsAt,
        status:      "PENDING",
        amountInr:   service.priceInr,
        notes:       input.notes,
        patientName:  input.patientName,
        patientEmail: input.patientEmail,
        patientPhone: input.patientPhone,
      },
      select: APPOINTMENT_SELECT,
    });

    await writeAuditLog({
      actorId:  patientId,
      action:   "APPOINTMENT_CREATED",
      entity:   "Appointment",
      entityId: appointment.id,
      metadata: { serviceId: input.serviceId, startsAt: input.startsAt },
    });

    return appointment;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new AppError(409, "This slot was just taken. Please choose another time.", "SLOT_TAKEN");
    }
    throw err;
  }
}

// ── Reschedule ───────────────────────────────────────────────────────────────

export async function rescheduleAppointment(
  id: string,
  input: RescheduleAppointmentInput,
  userId: string,
  role: string,
) {
  const existing = await prisma.appointment.findUnique({
    where:  { id },
    select: { ...APPOINTMENT_SELECT, patientId: true },
  });

  assertCanAccess(existing, userId, role);

  if (existing!.status === "CANCELLED" || existing!.status === "COMPLETED")
    throw new AppError(400, "Cannot reschedule a completed or cancelled appointment", "INVALID_STATUS");

  const newStartsAt = new Date(input.startsAt);
  const dateStr     = getISTDateString(newStartsAt);

  // Verify the new slot is free (excluding current appointment)
  const freeSlots = await getDaySlots(dateStr, existing!.service.id);

  // getDaySlots already excludes existing!.id's startsAt if it falls on the same day.
  // But if we're rescheduling to the same day we need to ensure the slot is actually free.
  const slotOk = freeSlots.some((s) => new Date(s.startsAt).getTime() === newStartsAt.getTime());
  if (!slotOk)
    throw new AppError(400, "The new slot is not available", "SLOT_UNAVAILABLE");

  const newEndsAt = new Date(newStartsAt.getTime() + existing!.service.durationMin * 60_000);

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data:  {
        startsAt: newStartsAt,
        endsAt:   newEndsAt,
        status:   "RESCHEDULED",
      },
      select: APPOINTMENT_SELECT,
    });

    await writeAuditLog({
      actorId:  userId,
      action:   "APPOINTMENT_RESCHEDULED",
      entity:   "Appointment",
      entityId: id,
      metadata: { from: existing!.startsAt.toISOString(), to: input.startsAt },
    });

    // Fire-and-forget: patch Google event + send reschedule notification
    updateMeetTime({
      id,
      doctorId:      updated.doctor.id,
      googleEventId: updated.googleEventId,
      startsAt:      newStartsAt,
      endsAt:        newEndsAt,
    }).catch((err) => logger.warn("updateMeetTime failed:", err));
    sendNotification("BOOKING_RESCHEDULED", id).catch((err) => logger.warn("BOOKING_RESCHEDULED notify failed:", err));

    return updated;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")
      throw new AppError(409, "That slot was just taken. Choose another time.", "SLOT_TAKEN");
    throw err;
  }
}

// ── Cancel ───────────────────────────────────────────────────────────────────

export async function cancelAppointment(
  id: string,
  userId: string,
  role: string,
  reason?: string,
) {
  const existing = await prisma.appointment.findUnique({
    where:  { id },
    select: { ...APPOINTMENT_SELECT, patientId: true },
  });

  assertCanAccess(existing, userId, role);

  if (existing!.status === "CANCELLED")
    throw new AppError(400, "Appointment is already cancelled", "ALREADY_CANCELLED");
  if (existing!.status === "COMPLETED")
    throw new AppError(400, "Cannot cancel a completed appointment", "INVALID_STATUS");

  const updated = await prisma.appointment.update({
    where: { id },
    data:  {
      status:             "CANCELLED",
      cancellationReason: reason,
    },
    select: APPOINTMENT_SELECT,
  });

  await writeAuditLog({
    actorId:  userId,
    action:   "APPOINTMENT_CANCELLED",
    entity:   "Appointment",
    entityId: id,
    metadata: { reason },
  });

  // Fire-and-forget: delete Google event + send cancellation notification
  removeMeetEvent({
    doctorId:      existing!.doctor.id,
    googleEventId: existing!.googleEventId,
  }).catch((err) => logger.warn("removeMeetEvent failed:", err));
  sendNotification("BOOKING_CANCELLED", id).catch((err) => logger.warn("BOOKING_CANCELLED notify failed:", err));

  return updated;
}

// ── List ─────────────────────────────────────────────────────────────────────

export async function listAppointments(
  userId: string,
  role: string,
  filter: AppointmentFilterInput,
) {
  const { status, serviceId, from, to, page, pageSize } = filter;

  // Role-aware scoping
  let patientWhere: Prisma.AppointmentWhereInput["patientId"] | undefined;
  let doctorWhere:  Prisma.AppointmentWhereInput = {};

  if (role === "PATIENT") {
    patientWhere = userId;
  }
  // DOCTOR / ADMIN: see all

  const where: Prisma.AppointmentWhereInput = {
    ...(patientWhere !== undefined ? { patientId: patientWhere } : {}),
    ...doctorWhere,
    ...(status    ? { status }                                  : {}),
    ...(serviceId ? { serviceId }                               : {}),
    ...(from || to
      ? {
          startsAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to   ? { lte: new Date(to)   } : {}),
          },
        }
      : {}),
  };

  const [total, appointments] = await prisma.$transaction([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      select:  APPOINTMENT_SELECT,
      orderBy: { startsAt: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
  ]);

  return {
    data:       appointments,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

// ── Get single ───────────────────────────────────────────────────────────────

export async function getAppointment(id: string, userId: string, role: string) {
  const appointment = await prisma.appointment.findUnique({
    where:  { id },
    select: { ...APPOINTMENT_SELECT, patientId: true },
  });

  assertCanAccess(appointment, userId, role);
  return appointment;
}

// ── Doctor status transitions ─────────────────────────────────────────────────

export async function confirmAppointment(id: string, actorId: string) {
  const existing = await prisma.appointment.findUnique({ where: { id }, select: { status: true } });
  if (!existing) throw new AppError(404, "Appointment not found", "NOT_FOUND");
  if (!["PENDING", "RESCHEDULED"].includes(existing.status))
    throw new AppError(400, "Only PENDING or RESCHEDULED appointments can be confirmed", "INVALID_STATUS");

  const updated = await prisma.appointment.update({
    where:  { id },
    data:   { status: "CONFIRMED" },
    select: APPOINTMENT_SELECT,
  });

  await writeAuditLog({ actorId, action: "APPOINTMENT_CONFIRMED", entity: "Appointment", entityId: id, metadata: {} });

  // Fire-and-forget: Google Calendar + confirmation notification
  attachMeetLink(id).catch((err) => logger.warn("attachMeetLink failed:", err));
  sendNotification("BOOKING_CONFIRMED", id).catch((err) => logger.warn("BOOKING_CONFIRMED notify failed:", err));

  return updated;
}

export async function completeAppointment(id: string, actorId: string) {
  const existing = await prisma.appointment.findUnique({ where: { id }, select: { status: true } });
  if (!existing) throw new AppError(404, "Appointment not found", "NOT_FOUND");
  if (existing.status !== "CONFIRMED")
    throw new AppError(400, "Only CONFIRMED appointments can be marked completed", "INVALID_STATUS");

  const updated = await prisma.appointment.update({
    where:  { id },
    data:   { status: "COMPLETED" },
    select: APPOINTMENT_SELECT,
  });

  await writeAuditLog({ actorId, action: "APPOINTMENT_COMPLETED", entity: "Appointment", entityId: id, metadata: {} });
  return updated;
}

export async function noShowAppointment(id: string, actorId: string) {
  const existing = await prisma.appointment.findUnique({ where: { id }, select: { status: true } });
  if (!existing) throw new AppError(404, "Appointment not found", "NOT_FOUND");
  if (existing.status !== "CONFIRMED")
    throw new AppError(400, "Only CONFIRMED appointments can be marked no-show", "INVALID_STATUS");

  const updated = await prisma.appointment.update({
    where:  { id },
    data:   { status: "NO_SHOW" },
    select: APPOINTMENT_SELECT,
  });

  await writeAuditLog({ actorId, action: "APPOINTMENT_NO_SHOW", entity: "Appointment", entityId: id, metadata: {} });
  return updated;
}
