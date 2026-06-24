import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../../utils/prisma";
import { config } from "../../config";
import { logger } from "../../utils/logger";
import { AppError } from "../../middleware/errorHandler";
import { writeAuditLog } from "../../middleware/auditLog";
import * as googleSvc from "../google/google.service";
import { sendNotification } from "../notifications/notifications.service";

// ── Razorpay client (lazy — only constructed when keys are present) ──────────

let _rzp: Razorpay | null = null;

function getRzp(): Razorpay {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new AppError(503, "Razorpay is not configured on this server", "NOT_CONFIGURED");
  }
  if (!_rzp) {
    _rzp = new Razorpay({
      key_id:     config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return _rzp;
}

// ── Create order ─────────────────────────────────────────────────────────────

export async function createOrder(appointmentId: string, patientId: string) {
  const appt = await prisma.appointment.findUnique({
    where:  { id: appointmentId },
    select: { id: true, amountInr: true, status: true, patientId: true, payment: { select: { id: true, razorpayOrderId: true, status: true } } },
  });
  if (!appt)                               throw new AppError(404, "Appointment not found", "NOT_FOUND");
  if (appt.patientId !== patientId)        throw new AppError(403, "Access denied", "FORBIDDEN");
  if (appt.status === "CANCELLED")         throw new AppError(400, "Appointment is cancelled", "INVALID_STATUS");
  if (appt.status === "CONFIRMED")         throw new AppError(400, "Appointment is already confirmed", "ALREADY_CONFIRMED");

  // If a CREATED order already exists, return it (idempotent)
  if (appt.payment?.status === "CREATED") {
    return { orderId: appt.payment.razorpayOrderId, keyId: config.razorpay.keyId };
  }

  const rzpOrder = await getRzp().orders.create({
    amount:   appt.amountInr * 100, // paise
    currency: "INR",
    receipt:  `appt_${appointmentId.slice(-12)}`,
    notes:    { appointmentId },
  });

  // Upsert Payment row (handles the case where a previous FAILED payment exists)
  await prisma.payment.upsert({
    where:  { appointmentId },
    create: {
      appointmentId,
      razorpayOrderId: rzpOrder.id,
      status:          "CREATED",
      amountInr:       appt.amountInr,
    },
    update: {
      razorpayOrderId: rzpOrder.id,
      status:          "CREATED",
    },
  });

  return { orderId: rzpOrder.id, keyId: config.razorpay.keyId };
}

// ── Verify payment ───────────────────────────────────────────────────────────

export async function verifyPayment(
  razorpayOrderId:   string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  patientId:         string,
) {
  // 1. HMAC verify
  const expectedSig = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSig !== razorpaySignature) {
    throw new AppError(400, "Invalid payment signature", "INVALID_SIGNATURE");
  }

  // 2. Load payment + appointment
  const payment = await prisma.payment.findUnique({
    where:  { razorpayOrderId },
    select: {
      id:            true,
      status:        true,
      appointmentId: true,
      appointment: {
        select: {
          id:       true,
          status:   true,
          patientId: true,
          doctor:   { select: { id: true } },
        },
      },
    },
  });
  if (!payment)                                      throw new AppError(404, "Order not found", "NOT_FOUND");
  if (payment.appointment.patientId !== patientId)   throw new AppError(403, "Access denied", "FORBIDDEN");
  if (payment.status === "PAID")                     return { appointmentId: payment.appointmentId }; // idempotent
  if (payment.appointment.status === "CONFIRMED")    return { appointmentId: payment.appointmentId };

  // 3. Mark PAID + CONFIRMED in a transaction
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data:  { status: "PAID", razorpayPaymentId },
    }),
    prisma.appointment.update({
      where: { id: payment.appointmentId },
      data:  { status: "CONFIRMED" },
    }),
  ]);

  await writeAuditLog({
    actorId:  patientId,
    action:   "PAYMENT_VERIFIED",
    entity:   "Payment",
    entityId: payment.id,
    metadata: { razorpayOrderId, razorpayPaymentId },
  });

  // 4. Fire-and-forget: create Google Meet + send confirmation notification
  attachMeetLinkBackground(payment.appointmentId).catch((err) =>
    logger.warn("attachMeetLink after payment failed:", err),
  );
  sendNotification("BOOKING_CONFIRMED", payment.appointmentId).catch((err) =>
    logger.warn("BOOKING_CONFIRMED notification failed:", err),
  );

  return { appointmentId: payment.appointmentId };
}

// ── Webhook handler ──────────────────────────────────────────────────────────
// Called with the raw request body string + Razorpay-Signature header.

export async function handleWebhook(rawBody: string, signature: string): Promise<void> {
  // Verify webhook signature
  if (config.razorpay.webhookSecret) {
    const expected = crypto
      .createHmac("sha256", config.razorpay.webhookSecret)
      .update(rawBody)
      .digest("hex");
    if (expected !== signature) {
      throw new AppError(400, "Invalid webhook signature", "INVALID_SIGNATURE");
    }
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody) as { event: string; payload: Record<string, unknown> };
  } catch {
    throw new AppError(400, "Invalid JSON body", "INVALID_JSON");
  }

  const { event: eventType, payload } = event;
  const paymentEntity = (payload["payment"] as { entity?: Record<string, unknown> } | undefined)?.entity;
  const orderId       = paymentEntity?.["order_id"] as string | undefined;
  const paymentId     = paymentEntity?.["id"]       as string | undefined;

  logger.info(`Razorpay webhook received: ${eventType}, order: ${orderId}`);

  if (!orderId) return; // nothing to do

  if (eventType === "payment.captured") {
    const payment = await prisma.payment.findUnique({
      where:  { razorpayOrderId: orderId },
      select: { id: true, status: true, appointmentId: true },
    });
    if (!payment || payment.status === "PAID") return; // already handled

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data:  { status: "PAID", razorpayPaymentId: paymentId },
      }),
      prisma.appointment.update({
        where: { id: payment.appointmentId },
        data:  { status: "CONFIRMED" },
      }),
    ]);

    await writeAuditLog({
      actorId:  null,
      action:   "PAYMENT_CAPTURED_WEBHOOK",
      entity:   "Payment",
      entityId: payment.id,
      metadata: { orderId, paymentId },
    });

    attachMeetLinkBackground(payment.appointmentId).catch((err) =>
      logger.warn("attachMeetLink via webhook failed:", err),
    );
    sendNotification("BOOKING_CONFIRMED", payment.appointmentId).catch((err) =>
      logger.warn("BOOKING_CONFIRMED webhook notification failed:", err),
    );
  }

  if (eventType === "payment.failed") {
    const payment = await prisma.payment.findUnique({
      where:  { razorpayOrderId: orderId },
      select: { id: true, status: true },
    });
    if (!payment || payment.status !== "CREATED") return;

    await prisma.payment.update({
      where: { id: payment.id },
      data:  { status: "FAILED" },
    });
  }

  if (eventType === "refund.created") {
    const refundEntity  = (payload["refund"] as { entity?: Record<string, unknown> } | undefined)?.entity;
    const refundOrderId = refundEntity?.["order_id"] as string | undefined;
    if (!refundOrderId) return;

    const payment = await prisma.payment.findUnique({
      where:  { razorpayOrderId: refundOrderId },
      select: { id: true },
    });
    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data:  { status: "REFUNDED" },
    });

    await writeAuditLog({
      actorId:  null,
      action:   "PAYMENT_REFUNDED_WEBHOOK",
      entity:   "Payment",
      entityId: payment.id,
      metadata: { refundOrderId },
    });
  }
}

// ── Get payment status for an appointment ───────────────────────────────────

export async function getPaymentStatus(appointmentId: string, requesterId: string, role: string) {
  const payment = await prisma.payment.findUnique({
    where:  { appointmentId },
    select: {
      id:                true,
      status:            true,
      amountInr:         true,
      razorpayOrderId:   true,
      razorpayPaymentId: true,
      createdAt:         true,
      updatedAt:         true,
      appointment: { select: { patientId: true } },
    },
  });
  if (!payment) throw new AppError(404, "Payment not found", "NOT_FOUND");

  const isOwner = payment.appointment.patientId === requesterId;
  if (role === "PATIENT" && !isOwner) throw new AppError(403, "Access denied", "FORBIDDEN");

  const { appointment: _, ...rest } = payment;
  return rest;
}

// ── Internal helper ──────────────────────────────────────────────────────────

async function attachMeetLinkBackground(appointmentId: string): Promise<void> {
  const appt = await prisma.appointment.findUnique({
    where:  { id: appointmentId },
    select: {
      id:           true,
      startsAt:     true,
      endsAt:       true,
      patientEmail: true,
      patientName:  true,
      meetLink:     true,
      service:      { select: { title: true } },
      doctor:       { select: { id: true, user: { select: { email: true } } } },
    },
  });
  if (!appt || appt.meetLink) return; // already has a link

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
  }).catch((err) => logger.warn("Failed to save meetLink:", err));
}
