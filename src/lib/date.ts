/* Date helpers. Native Date only. All "day" math is local-time, midnight-based. */

export const DAY_MS = 86_400_000;

/** Local midnight for a given date. */
export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** YYYY-MM-DD local key, used to bucket logs by day. */
export function dayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const local = startOfDay(date);
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole days between two dates (a - b), by local midnight. */
export function daysBetween(a: Date, b: Date): number {
  return Math.round(
    (startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS,
  );
}

/** True when iso timestamp is within `days` of now. */
export function withinDays(iso: string, days: number): boolean {
  return daysBetween(new Date(), new Date(iso)) < days;
}

/** Ordered array of the last `n` day keys, oldest → newest (today last). */
export function lastNDays(n: number, from: Date = new Date()): string[] {
  const base = startOfDay(from);
  return Array.from({ length: n }, (_, i) =>
    dayKey(new Date(base.getTime() - (n - 1 - i) * DAY_MS)),
  );
}

/** ISO week-ish label like "Jun 23" for the Monday of the week. */
export function weekStart(d: Date): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  return new Date(x.getTime() - day * DAY_MS);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function shortDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "2h 30m left" style from seconds. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
