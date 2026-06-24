import { Router, IRouter, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { writeAuditLog } from "../../middleware/auditLog";
import { AppError } from "../../middleware/errorHandler";
import {
  todayIST,
  addDays,
  parseISTMidnight,
  parseUTCMidnight,
  getISTDateString,
} from "../../utils/istUtils";

export const adminRouter: IRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole("DOCTOR", "ADMIN"));

// ── Helper ───────────────────────────────────────────────────────────────────

async function getDoctorProfileId(userId: string): Promise<string> {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new AppError(404, "Doctor profile not found", "NOT_FOUND");
  return profile.id;
}

// ── GET /admin/stats ─────────────────────────────────────────────────────────

adminRouter.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today      = todayIST();
    const todayStart = parseISTMidnight(today);
    const tomorrow   = parseISTMidnight(addDays(today, 1));
    const weekStart  = parseISTMidnight(addDays(today, -6));
    const next7      = parseISTMidnight(addDays(today, 7));

    const [
      todayCount,
      weekRevenueAgg,
      upcomingCount,
      cancellationsCount,
      recentAppointments,
      byService,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { startsAt: { gte: todayStart, lt: tomorrow }, status: { not: "CANCELLED" } },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: weekStart } },
        _sum:  { amountInr: true },
      }),
      prisma.appointment.count({
        where: { startsAt: { gte: todayStart, lt: next7 }, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.appointment.count({
        where: { startsAt: { gte: weekStart }, status: "CANCELLED" },
      }),
      prisma.appointment.findMany({
        where:   { startsAt: { gte: todayStart }, status: { in: ["PENDING", "CONFIRMED"] } },
        select:  {
          id: true, startsAt: true, endsAt: true, status: true, amountInr: true,
          patientName: true, patientEmail: true, meetLink: true,
          service: { select: { id: true, title: true, durationMin: true } },
        },
        orderBy: { startsAt: "asc" },
        take:    5,
      }),
      prisma.appointment.groupBy({
        by:    ["serviceId"],
        where: {
          startsAt: { gte: parseISTMidnight(`${today.slice(0, 7)}-01`) },
          status:   { not: "CANCELLED" },
        },
        _count: { id: true },
      }),
    ]);

    // Revenue by day (last 7 days)
    const revenueByDay = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const day      = addDays(today, -(6 - i));
        const dayStart = parseISTMidnight(day);
        const dayEnd   = parseISTMidnight(addDays(day, 1));
        return prisma.payment
          .aggregate({ where: { status: "PAID", createdAt: { gte: dayStart, lt: dayEnd } }, _sum: { amountInr: true } })
          .then((r) => ({ date: day, amount: r._sum.amountInr ?? 0 }));
      }),
    );

    // Map serviceId → title
    const serviceIds = byService.map((b) => b.serviceId);
    const services   = serviceIds.length
      ? await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, title: true } })
      : [];
    const svcMap = Object.fromEntries(services.map((s) => [s.id, s.title]));

    res.json({
      data: {
        todayAppointments:    todayCount,
        weekRevenue:          weekRevenueAgg._sum.amountInr ?? 0,
        upcomingAppointments: upcomingCount,
        cancellations:        cancellationsCount,
        recentAppointments,
        revenueByDay,
        appointmentsByService: byService.map((b) => ({
          service: svcMap[b.serviceId] ?? "Unknown",
          count:   b._count.id,
        })),
      },
    });
  } catch (err) { next(err); }
});

// ── AvailabilityRule CRUD ────────────────────────────────────────────────────

const RuleCreateSchema = z.object({
  weekday:        z.number().int().min(0).max(6),
  startTime:      z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  endTime:        z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  slotIntervalMin: z.union([z.literal(10), z.literal(15), z.literal(30), z.literal(60)]),
  isRecurring:    z.boolean().optional().default(true),
  validFrom:      z.string().optional(), // "YYYY-MM-DD"
  validTo:        z.string().nullable().optional(),
});

adminRouter.get(
  "/availability-rules",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = await getDoctorProfileId(req.user!.sub);
      const rules    = await prisma.availabilityRule.findMany({
        where:   { doctorId },
        orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      });
      res.json({ data: rules });
    } catch (err) { next(err); }
  },
);

adminRouter.post(
  "/availability-rules",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body     = RuleCreateSchema.parse(req.body);
      const doctorId = await getDoctorProfileId(req.user!.sub);

      const validFrom = body.validFrom
        ? new Date(body.validFrom)
        : new Date();
      const validTo   = body.validTo ? new Date(body.validTo) : null;

      const rule = await prisma.availabilityRule.create({
        data: {
          doctorId,
          weekday:         body.weekday,
          startTime:       body.startTime,
          endTime:         body.endTime,
          slotIntervalMin: body.slotIntervalMin,
          isRecurring:     body.isRecurring ?? true,
          validFrom,
          validTo,
        },
      });

      await writeAuditLog({
        actorId:  req.user!.sub,
        action:   "AVAILABILITY_RULE_CREATED",
        entity:   "AvailabilityRule",
        entityId: rule.id,
        metadata: body as Record<string, unknown>,
      });

      res.status(201).json({ data: rule });
    } catch (err) { next(err); }
  },
);

adminRouter.patch(
  "/availability-rules/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body     = RuleCreateSchema.partial().parse(req.body);
      const doctorId = await getDoctorProfileId(req.user!.sub);

      const existing = await prisma.availabilityRule.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.doctorId !== doctorId)
        throw new AppError(404, "Rule not found", "NOT_FOUND");

      const updateData: Record<string, unknown> = { ...body };
      if (body.validFrom) updateData.validFrom = new Date(body.validFrom as string);
      if (body.validTo !== undefined) updateData.validTo = body.validTo ? new Date(body.validTo as string) : null;

      const rule = await prisma.availabilityRule.update({
        where: { id: req.params.id },
        data:  updateData as Parameters<typeof prisma.availabilityRule.update>[0]["data"],
      });

      await writeAuditLog({
        actorId:  req.user!.sub,
        action:   "AVAILABILITY_RULE_UPDATED",
        entity:   "AvailabilityRule",
        entityId: rule.id,
        metadata: body as Record<string, unknown>,
      });

      res.json({ data: rule });
    } catch (err) { next(err); }
  },
);

adminRouter.delete(
  "/availability-rules/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = await getDoctorProfileId(req.user!.sub);
      const existing = await prisma.availabilityRule.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.doctorId !== doctorId)
        throw new AppError(404, "Rule not found", "NOT_FOUND");

      await prisma.availabilityRule.delete({ where: { id: req.params.id } });

      await writeAuditLog({
        actorId:  req.user!.sub,
        action:   "AVAILABILITY_RULE_DELETED",
        entity:   "AvailabilityRule",
        entityId: req.params.id,
        metadata: {},
      });

      res.json({ message: "Rule deleted" });
    } catch (err) { next(err); }
  },
);

// ── BlockedDate CRUD ─────────────────────────────────────────────────────────

const BlockedDatesCreateSchema = z.object({
  dates:  z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  reason: z.string().max(200).nullable().optional(),
});

adminRouter.get(
  "/blocked-dates",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = await getDoctorProfileId(req.user!.sub);
      const { from, to } = req.query as { from?: string; to?: string };

      const dateFilter: Prisma.BlockedDateWhereInput["date"] = {};
      if (from) dateFilter.gte = parseUTCMidnight(from);
      if (to)   dateFilter.lte = parseUTCMidnight(to);

      const where: Prisma.BlockedDateWhereInput = {
        doctorId,
        ...(from || to ? { date: dateFilter } : {}),
      };

      const rows = await prisma.blockedDate.findMany({
        where,
        orderBy: { date: "asc" },
      });

      // Return dates as "YYYY-MM-DD" strings
      const data = rows.map((r) => ({
        id:        r.id,
        date:      r.date.toISOString().slice(0, 10),
        reason:    r.reason,
        createdAt: r.createdAt.toISOString(),
      }));

      res.json({ data });
    } catch (err) { next(err); }
  },
);

adminRouter.post(
  "/blocked-dates",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dates, reason } = BlockedDatesCreateSchema.parse(req.body);
      const doctorId          = await getDoctorProfileId(req.user!.sub);

      const created = await Promise.all(
        dates.map((dateStr) =>
          prisma.blockedDate
            .upsert({
              where:  { doctorId_date: { doctorId, date: parseUTCMidnight(dateStr) } },
              update: { reason: reason ?? null },
              create: { doctorId, date: parseUTCMidnight(dateStr), reason: reason ?? null },
            })
            .then((r) => ({ id: r.id, date: r.date.toISOString().slice(0, 10), reason: r.reason })),
        ),
      );

      await writeAuditLog({
        actorId:  req.user!.sub,
        action:   "BLOCKED_DATES_CREATED",
        entity:   "BlockedDate",
        entityId: doctorId,
        metadata: { dates, reason } as Record<string, unknown>,
      });

      res.status(201).json({ data: created });
    } catch (err) { next(err); }
  },
);

adminRouter.delete(
  "/blocked-dates/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = await getDoctorProfileId(req.user!.sub);
      const existing = await prisma.blockedDate.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.doctorId !== doctorId)
        throw new AppError(404, "Blocked date not found", "NOT_FOUND");

      await prisma.blockedDate.delete({ where: { id: req.params.id } });

      await writeAuditLog({
        actorId:  req.user!.sub,
        action:   "BLOCKED_DATE_DELETED",
        entity:   "BlockedDate",
        entityId: req.params.id,
        metadata: { date: getISTDateString(existing.date) },
      });

      res.json({ message: "Blocked date removed" });
    } catch (err) { next(err); }
  },
);

// ── GET /admin/patients ──────────────────────────────────────────────────────

adminRouter.get(
  "/patients",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q        = ((req.query.q as string) ?? "").trim();
      const page     = Math.max(1, Number(req.query.page     ?? 1));
      const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20)));

      const where: Prisma.UserWhereInput = {
        role: "PATIENT",
        ...(q
          ? {
              OR: [
                { name:  { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const [total, patients] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          select: {
            id: true, name: true, email: true, phone: true, createdAt: true,
            _count: { select: { appointments: true } },
            appointments: {
              select: {
                id:      true,
                status:  true,
                startsAt: true,
                service: { select: { title: true } },
              },
              orderBy: { startsAt: "desc" },
              take:    5,
            },
          },
          orderBy: { createdAt: "desc" },
          skip:    (page - 1) * pageSize,
          take:    pageSize,
        }),
      ]);

      res.json({
        data: patients,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (err) { next(err); }
  },
);
