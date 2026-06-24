import { describe, it, expect } from "vitest";
import { generateSlotsFromRule } from "../modules/slots/slots.service";
import { parseISTMidnight, formatISTTime, getISTWeekday, addDays, todayIST } from "../utils/istUtils";

// ── IST util tests ──────────────────────────────────────────────────────────

describe("istUtils", () => {
  it("parseISTMidnight: 2026-06-24 IST midnight = 2026-06-23T18:30:00Z", () => {
    const d = parseISTMidnight("2026-06-24");
    expect(d.toISOString()).toBe("2026-06-23T18:30:00.000Z");
  });

  it("formatISTTime: UTC 03:30 → IST 09:00", () => {
    const utc = new Date("2026-06-24T03:30:00.000Z");
    expect(formatISTTime(utc)).toBe("09:00");
  });

  it("getISTWeekday: 2026-06-24 (Wednesday) → 3", () => {
    expect(getISTWeekday("2026-06-24")).toBe(3);
  });

  it("addDays: 2026-06-24 + 7 = 2026-07-01", () => {
    expect(addDays("2026-06-24", 7)).toBe("2026-07-01");
  });

  it("addDays wraps month correctly", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });
});

// ── generateSlotsFromRule tests ─────────────────────────────────────────────

const RULE_30 = { startTime: "09:00", endTime: "18:00", slotIntervalMin: 30 };
const RULE_15 = { startTime: "09:00", endTime: "12:00", slotIntervalMin: 15 };
const RULE_60 = { startTime: "09:00", endTime: "17:00", slotIntervalMin: 60 };

// "now" injected at 2026-06-24 00:00 UTC (IST 05:30) — all 09:00+ slots are in the future
const NOW_BEFORE_SLOTS = new Date("2026-06-24T00:00:00.000Z").getTime();
const DATE = "2026-06-24";

describe("generateSlotsFromRule", () => {
  it("returns empty array when blocked", () => {
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: [], isBlocked: true, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    expect(slots).toHaveLength(0);
  });

  it("generates correct count for 09:00–18:00 with 30-min interval, 30-min service", () => {
    // 09:00 to 18:00 = 9h = 18 slots of 30min (last slot starts at 17:30)
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    expect(slots).toHaveLength(18);
  });

  it("generates correct count for 09:00–12:00 with 15-min interval, 15-min service", () => {
    // 9:00–12:00 = 3h = 12 slots of 15min
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_15, durationMin: 15,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    expect(slots).toHaveLength(12);
  });

  it("generates correct count for 09:00–17:00 with 60-min interval, 60-min service", () => {
    // 9:00–17:00 = 8 slots of 60min
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_60, durationMin: 60,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    expect(slots).toHaveLength(8);
  });

  it("first slot starts at 09:00 IST", () => {
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    // IST 09:00 = UTC 03:30
    expect(new Date(slots[0].startsAt).toISOString()).toBe("2026-06-24T03:30:00.000Z");
    expect(slots[0].label).toBe("09:00");
  });

  it("last slot for 09:00–18:00 starts at 17:30 IST", () => {
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    const last = slots[slots.length - 1];
    expect(last.label).toBe("17:30");
  });

  it("slots with 60-min duration don't overflow past endTime", () => {
    // 09:00–18:00, 60-min duration, 30-min interval
    // Last valid start: 17:00 (17:00 + 60min = 18:00 = endTime ✓)
    // 17:30 + 60min = 18:30 > 18:00 → should NOT appear
    const slots = generateSlotsFromRule({
      dateStr: DATE,
      rule: { startTime: "09:00", endTime: "18:00", slotIntervalMin: 30 },
      durationMin: 60,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    const labels = slots.map((s) => s.label);
    expect(labels).not.toContain("17:30");
    expect(labels[labels.length - 1]).toBe("17:00");
  });

  it("excludes already-booked slots (double-booking guard)", () => {
    // Book the 09:00 slot
    const istMidnightMs = parseISTMidnight(DATE).getTime();
    const slot0900Ms    = istMidnightMs + 9 * 60 * 60_000;

    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: [slot0900Ms], isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    const labels = slots.map((s) => s.label);
    expect(labels).not.toContain("09:00");
    expect(slots).toHaveLength(17); // 18 - 1 booked
  });

  it("excludes past slots when 'now' is mid-day", () => {
    // now = 2026-06-24 09:30 UTC = 15:00 IST
    // slots before 15:00 IST should be excluded
    const nowMidDay = new Date("2026-06-24T09:30:00.000Z").getTime(); // IST 15:00

    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: nowMidDay,
    });
    // First slot should be 15:30 IST (all slots <= 15:00 IST excluded)
    expect(slots[0].label).toBe("15:30");
  });

  it("returns empty when all slots are in the past", () => {
    // now = 2026-06-24 18:00 UTC = 23:30 IST (after all slots)
    const nowEvening = new Date("2026-06-24T18:00:00.000Z").getTime();
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: [], isBlocked: false, nowUtcMs: nowEvening,
    });
    expect(slots).toHaveLength(0);
  });

  it("correctly excludes multiple booked slots", () => {
    const istMidnightMs = parseISTMidnight(DATE).getTime();
    const booked = [
      istMidnightMs + 9  * 60 * 60_000, // 09:00
      istMidnightMs + 10 * 60 * 60_000, // 10:00
      istMidnightMs + 11 * 60 * 60_000, // 11:00
    ];
    const slots = generateSlotsFromRule({
      dateStr: DATE, rule: RULE_30, durationMin: 30,
      bookedStartUtcMs: booked, isBlocked: false, nowUtcMs: NOW_BEFORE_SLOTS,
    });
    const labels = slots.map((s) => s.label);
    expect(labels).not.toContain("09:00");
    expect(labels).not.toContain("10:00");
    expect(labels).not.toContain("11:00");
    expect(labels).toContain("09:30");
    expect(slots).toHaveLength(15); // 18 - 3 booked
  });

  it("todayIST returns a valid YYYY-MM-DD string", () => {
    const today = todayIST();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(today).toString()).not.toBe("Invalid Date");
  });
});
