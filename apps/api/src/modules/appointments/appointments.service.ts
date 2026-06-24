import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import { getDaySlots } from "../slots/slots.service";
import { getISTDateString } from "../../utils/istUtils";
import { writeAuditLog } from "../../middleware/auditLog";
import type {
  BookAppointmentInput,
  RescheduleAppointmentInput,
  AppointmentFilterInput,
} from "@dr-greeshma/shared";

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
