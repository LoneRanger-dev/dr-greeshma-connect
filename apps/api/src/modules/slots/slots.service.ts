import { prisma } from "../../utils/prisma";
import { AppError } from "../../middleware/errorHandler";
import {
  todayIST,
  addDays,
  getISTWeekday,
  parseISTMidnight,
  parseUTCMidnight,
  formatISTTime,
} from "../../utils/istUtils";

export interface SlotInfo {
  startsAt: string; // ISO UTC
  endsAt:   string; // ISO UTC
  label:    string; // "09:00" IST for display
}

export const BOOKING_WINDOW_DAYS = 30;

// ── Pure slot generator ─────────────────────────────────────────────────────
// Separated from DB calls so it's testable without mocking Prisma.

export function generateSlotsFromRule(params: {
  dateStr:          string;
  rule:             { startTime: string; endTime: string; slotIntervalMin: number };
  durationMin:      number;
  bookedStartUtcMs: number[];
  isBlocked:        boolean;
  nowUtcMs?:        number; // injected in tests
}): SlotInfo[] {
  const { dateStr, rule, durationMin, bookedStartUtcMs, isBlocked, nowUtcMs } = params;

  if (isBlocked) return [];

  const [sH, sM] = rule.startTime.split(":").map(Number);
  const [eH, eM] = rule.endTime.split(":").map(Number);
  const startMin  = sH * 60 + sM;
  const endMin    = eH * 60 + eM;
  const interval  = rule.slotIntervalMin;

  const istMidnightMs = parseISTMidnight(dateStr).getTime();
  const bookedSet     = new Set(bookedStartUtcMs);
  const now           = nowUtcMs ?? Date.now();

  const slots: SlotInfo[] = [];

  for (let offsetMin = startMin; offsetMin + durationMin <= endMin; offsetMin += interval) {
    const startsAtMs = istMidnightMs + offsetMin * 60_000;
    const endsAtMs   = startsAtMs   + durationMin * 60_000;

    if (startsAtMs <= now)       continue; // past
    if (bookedSet.has(startsAtMs)) continue; // already booked

    const startsAt = new Date(startsAtMs);
    const endsAt   = new Date(endsAtMs);

    slots.push({
      startsAt: startsAt.toISOString(),
      endsAt:   endsAt.toISOString(),
      label:    formatISTTime(startsAt),
    });
  }

  return slots;
}

// ── DB helpers ──────────────────────────────────────────────────────────────

async function getDoctorProfileId(): Promise<string> {
  const profile = await prisma.doctorProfile.findFirst();
  if (!profile) throw new AppError(503, "No doctor profile found", "DOCTOR_NOT_FOUND");
  return profile.id;
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getDaySlots(dateStr: string, serviceId?: string): Promise<SlotInfo[]> {
  const today   = todayIST();
  const maxDate = addDays(today, BOOKING_WINDOW_DAYS);

  if (dateStr < today)   throw new AppError(400, "Cannot view slots in the past",              "DATE_IN_PAST");
  if (dateStr > maxDate) throw new AppError(400, `Booking window is ${BOOKING_WINDOW_DAYS} days`, "DATE_TOO_FAR");

  const doctorId = await getDoctorProfileId();
  const weekday  = getISTWeekday(dateStr);

  const rule = await prisma.availabilityRule.findFirst({
    where:   { doctorId, weekday, isRecurring: true },
    orderBy: { validFrom: "desc" },
  });
  if (!rule) return [];

  // Check for a blocked date (DATE column stored as UTC date string)
  const utcMid     = parseUTCMidnight(dateStr);
  const nextUTCMid = new Date(utcMid.getTime() + 86_400_000);

  const blocked = await prisma.blockedDate.findFirst({
    where: { doctorId, date: { gte: utcMid, lt: nextUTCMid } },
  });

  // Already-booked start times for this IST day
  const istMidnightMs  = parseISTMidnight(dateStr).getTime();
  const istEndOfDayMs  = istMidnightMs + 86_400_000;

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId,
      startsAt: { gte: new Date(istMidnightMs), lt: new Date(istEndOfDayMs) },
      status:   { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
    },
    select: { startsAt: true },
  });

  // Service duration overrides slot interval for endsAt calculation
  let durationMin = rule.slotIntervalMin;
  if (serviceId) {
    const svc = await prisma.service.findUnique({ where: { id: serviceId }, select: { durationMin: true } });
    if (svc) durationMin = svc.durationMin;
  }

  return generateSlotsFromRule({
    dateStr,
    rule:             { startTime: rule.startTime, endTime: rule.endTime, slotIntervalMin: rule.slotIntervalMin },
    durationMin,
    bookedStartUtcMs: booked.map((a) => a.startsAt.getTime()),
    isBlocked:        !!blocked,
  });
}

export async function getAvailabilityRange(from: string, to: string): Promise<string[]> {
  const today   = todayIST();
  const maxDate = addDays(today, BOOKING_WINDOW_DAYS);

  // Clamp to valid booking window
  const start = from < today   ? today   : from;
  const end   = to   > maxDate ? maxDate : to;
  if (start > end) return [];

  const doctorId = await getDoctorProfileId();

  const rules = await prisma.availabilityRule.findMany({
    where: { doctorId, isRecurring: true },
  });
  const ruleWeekdays = new Set(rules.map((r) => r.weekday));

  const utcStart = parseUTCMidnight(start);
  const utcEnd   = new Date(parseUTCMidnight(end).getTime() + 86_400_000);

  const blockedRows = await prisma.blockedDate.findMany({
    where:  { doctorId, date: { gte: utcStart, lt: utcEnd } },
    select: { date: true },
  });
  // Convert stored UTC-date back to "YYYY-MM-DD" calendar date string
  const blockedSet = new Set(blockedRows.map((b) => b.date.toISOString().slice(0, 10)));

  const available: string[] = [];
  let cur = start;
  while (cur <= end) {
    const weekday = getISTWeekday(cur);
    if (ruleWeekdays.has(weekday) && !blockedSet.has(cur)) {
      available.push(cur);
    }
    cur = addDays(cur, 1);
  }

  return available;
}
