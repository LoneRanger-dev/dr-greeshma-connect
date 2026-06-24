import { Request, Response, NextFunction } from "express";
import * as svc from "./appointments.service";

export async function bookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await svc.bookAppointment(req.body, req.user!.sub);
    res.status(201).json({ data: appointment });
  } catch (err) { next(err); }
}

export async function listHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listAppointments(req.user!.sub, req.user!.role, req.query as never);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getOneHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await svc.getAppointment(req.params.id, req.user!.sub, req.user!.role);
    res.json({ data: appointment });
  } catch (err) { next(err); }
}

export async function rescheduleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await svc.rescheduleAppointment(
      req.params.id,
      req.body,
      req.user!.sub,
      req.user!.role,
    );
    res.json({ data: appointment });
  } catch (err) { next(err); }
}

export async function cancelHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await svc.cancelAppointment(
      req.params.id,
      req.user!.sub,
      req.user!.role,
      (req.body as { reason?: string })?.reason,
    );
    res.json({ data: appointment });
  } catch (err) { next(err); }
}
