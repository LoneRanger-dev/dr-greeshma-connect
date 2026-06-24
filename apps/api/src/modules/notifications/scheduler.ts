import cron from "node-cron";
import { prisma } from "../../utils/prisma";
import { logger } from "../../utils/logger";
import { sendNotification, reminderAlreadySent } from "./notifications.service";

// ── Reminder windows ──────────────────────────────────────────────────────────
// The cron runs every 15 minutes. We use ±15 min windows so an appointment
// is caught exactly once regardless of which 15-min tick fires first.

const WINDOW_MS      = 15 * 60_000; // 15 minutes
const TARGET_24H_MS  = 24 * 60 * 60_000;
const TARGET_1H_MS   =  1 * 60 * 60_000;

async function sendPendingReminders(): Promise<void> {
  const now = Date.now();

  // ── 24h reminders ──────────────────────────────────────────────────────────
  const from24 = new Date(now + TARGET_24H_MS - WINDOW_MS);
  const to24   = new Date(now + TARGET_24H_MS + WINDOW_MS);

  const upcoming24 = await prisma.appointment.findMany({
    where: {
      status:   { in: ["CONFIRMED", "PENDING"] },
      startsAt: { gte: from24, lte: to24 },
    },
    select: { id: true, patientName: true },
  });

  for (const appt of upcoming24) {
    try {
      if (await reminderAlreadySent(appt.id, "REMINDER_24H")) continue;
      await sendNotification("REMINDER_24H", appt.id);
      logger.info(`24h reminder sent for appointment ${appt.id} (${appt.patientName})`);
    } catch (err) {
      logger.warn(`24h reminder failed for ${appt.id}:`, err);
    }
  }

  // ── 1h reminders ───────────────────────────────────────────────────────────
  const from1h = new Date(now + TARGET_1H_MS - WINDOW_MS);
  const to1h   = new Date(now + TARGET_1H_MS + WINDOW_MS);

  const upcoming1h = await prisma.appointment.findMany({
    where: {
      status:   { in: ["CONFIRMED", "PENDING"] },
      startsAt: { gte: from1h, lte: to1h },
    },
    select: { id: true, patientName: true },
  });

  for (const appt of upcoming1h) {
    try {
      if (await reminderAlreadySent(appt.id, "REMINDER_1H")) continue;
      await sendNotification("REMINDER_1H", appt.id);
      logger.info(`1h reminder sent for appointment ${appt.id} (${appt.patientName})`);
    } catch (err) {
      logger.warn(`1h reminder failed for ${appt.id}:`, err);
    }
  }

  if (upcoming24.length + upcoming1h.length > 0) {
    logger.info(`Reminder run: ${upcoming24.length} × 24h, ${upcoming1h.length} × 1h`);
  }
}

// ── Start scheduler ───────────────────────────────────────────────────────────

export function startReminderScheduler(): void {
  // Run every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    sendPendingReminders().catch((err) =>
      logger.error("Reminder scheduler error:", err),
    );
  });

  logger.info("Reminder scheduler started (every 15 min)");
}
