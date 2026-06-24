import { Router, IRouter } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validate } from "../../middleware/validate";
import {
  BookAppointmentSchema,
  RescheduleAppointmentSchema,
  CancelAppointmentSchema,
  AppointmentFilterSchema,
} from "@dr-greeshma/shared";
import {
  bookHandler,
  listHandler,
  getOneHandler,
  rescheduleHandler,
  cancelHandler,
  confirmHandler,
  completeHandler,
  noShowHandler,
} from "./appointments.controller";

export const appointmentsRouter: IRouter = Router();

// All appointment routes require authentication
appointmentsRouter.use(requireAuth);

// GET  /appointments        — list (role-scoped)
appointmentsRouter.get(
  "/",
  validate(AppointmentFilterSchema, "query"),
  listHandler,
);

// GET  /appointments/:id
appointmentsRouter.get("/:id", getOneHandler);

// POST /appointments        — book
appointmentsRouter.post(
  "/",
  validate(BookAppointmentSchema),
  bookHandler,
);

// PATCH /appointments/:id/reschedule
appointmentsRouter.patch(
  "/:id/reschedule",
  validate(RescheduleAppointmentSchema),
  rescheduleHandler,
);

// PATCH /appointments/:id/cancel
appointmentsRouter.patch(
  "/:id/cancel",
  validate(CancelAppointmentSchema),
  cancelHandler,
);

// PATCH /appointments/:id/confirm  — DOCTOR/ADMIN only
appointmentsRouter.patch("/:id/confirm",  requireRole("DOCTOR", "ADMIN"), confirmHandler);

// PATCH /appointments/:id/complete — DOCTOR/ADMIN only
appointmentsRouter.patch("/:id/complete", requireRole("DOCTOR", "ADMIN"), completeHandler);

// PATCH /appointments/:id/no-show  — DOCTOR/ADMIN only
appointmentsRouter.patch("/:id/no-show",  requireRole("DOCTOR", "ADMIN"), noShowHandler);

// GET /appointments/:id/meet — return the Meet link for an appointment
appointmentsRouter.get("/:id/meet", async (req, res, next) => {
  try {
    const appt = await import("../../utils/prisma").then(({ prisma }) =>
      prisma.appointment.findUnique({
        where:  { id: req.params.id },
        select: { id: true, meetLink: true, status: true, patientId: true, doctor: { select: { userId: true } } },
      }),
    );
    if (!appt) { res.status(404).json({ error: "Appointment not found", code: "NOT_FOUND" }); return; }
    // Ownership check
    const isOwner = appt.patientId === req.user!.sub || appt.doctor.userId === req.user!.sub;
    if (req.user!.role === "PATIENT" && !isOwner) {
      res.status(403).json({ error: "Access denied", code: "FORBIDDEN" }); return;
    }
    res.json({ data: { id: appt.id, meetLink: appt.meetLink, status: appt.status } });
  } catch (err) { next(err); }
});
