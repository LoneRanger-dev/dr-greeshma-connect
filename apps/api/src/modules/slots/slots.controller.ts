import { Request, Response, NextFunction } from "express";
import { getDaySlots, getAvailabilityRange } from "./slots.service";

export async function getSlotsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, serviceId } = req.query as { date: string; serviceId?: string };
    const slots = await getDaySlots(date, serviceId);
    res.json({ data: { date, slots, count: slots.length } });
  } catch (err) { next(err); }
}

export async function getAvailabilityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as { from: string; to: string };
    const available = await getAvailabilityRange(from, to);
    res.json({ data: { from, to, available } });
  } catch (err) { next(err); }
}
