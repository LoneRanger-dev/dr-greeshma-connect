import { Router, IRouter } from "express";
import { prisma } from "../../utils/prisma";

export const doctorRouter: IRouter = Router();

// GET /doctor — public; returns the single doctor's profile id for bookings
doctorRouter.get("/", async (_req, res, next) => {
  try {
    const profile = await prisma.doctorProfile.findFirst({
      select: {
        id: true,
        bio: true,
        specialties: true,
        user: { select: { name: true } },
      },
    });
    if (!profile) {
      res.status(404).json({ error: "Doctor profile not found", code: "NOT_FOUND" });
      return;
    }
    res.json({ data: profile });
  } catch (err) { next(err); }
});
