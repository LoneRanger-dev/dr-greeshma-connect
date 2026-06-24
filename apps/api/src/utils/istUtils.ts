// IST = UTC + 5 hours 30 minutes
export const IST_OFFSET_MS = 330 * 60 * 1000;

/** "YYYY-MM-DD" string that represents today in IST */
export function todayIST(): string {
  return getISTDateString(new Date());
}

/** UTC Date → "YYYY-MM-DD" in IST */
export function getISTDateString(utcDate: Date): string {
  const ist = new Date(utcDate.getTime() + IST_OFFSET_MS);
  return ist.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" IST → JS Date at IST midnight (expressed as UTC) */
export function parseISTMidnight(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  // IST midnight = UTC midnight of that date minus IST offset
  return new Date(Date.UTC(y, m - 1, d) - IST_OFFSET_MS);
}

/**
 * "YYYY-MM-DD" → JS Date at UTC midnight of that calendar date.
 * Use this for @db.Date column comparisons (Supabase stores/compares in UTC).
 */
export function parseUTCMidnight(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Day-of-week (0=Sun … 6=Sat) for an IST date string */
export function getISTWeekday(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** UTC Date → "HH:MM" in IST (for slot labels) */
export function formatISTTime(utcDate: Date): string {
  const ist = new Date(utcDate.getTime() + IST_OFFSET_MS);
  const h = ist.getUTCHours().toString().padStart(2, "0");
  const min = ist.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${min}`;
}

/** Add N days to a "YYYY-MM-DD" string */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** Compare two "YYYY-MM-DD" strings lexicographically (ISO dates sort correctly) */
export function compareDateStr(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
