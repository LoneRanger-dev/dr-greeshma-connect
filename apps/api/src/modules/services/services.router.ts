import { Router, IRouter } from "express";
import { prisma } from "../../utils/prisma";

export const servicesRouter: IRouter = Router();

// GET /services — public, returns active consultation types
servicesRouter.get("/", async (_req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where:   { isActive: true },
      orderBy: { createdAt: "asc" },
      select:  { id: true, slug: true, title: true, description: true, durationMin: true, priceInr: true },
    });
    res.json({ data: services });
  } catch (err) { next(err); }
});
