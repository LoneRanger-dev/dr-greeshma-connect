import { Router, IRouter } from "express";
import { requireAuth } from "../../middleware/requireAuth";
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
