// UTC day/week arithmetic shared by the pillar routes and pages.
//
// Pillar weeks run Monday → Sunday in UTC, which is what makes the cardio
// nudge ("two 35-min sessions before Sunday") and the free-day naming line up
// with what the user sees in the 8-week chart. Pure functions only — this file
// is imported from both server route handlers and client components.

export const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Midnight UTC of the given instant's calendar day. */
export function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDaysUtc(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS);
}

/** Monday 00:00 UTC of the week containing `d`. */
export function weekStartUtc(d: Date): Date {
  const day = utcDayStart(d);
  const back = (day.getUTCDay() + 6) % 7; // Monday → 0
  return addDaysUtc(day, -back);
}

/** 0 (Monday) … 6 (Sunday) for the given instant. */
export function weekdayIndex(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

/** Days left in the week including today: 7 on Monday, 1 on Sunday. */
export function daysLeftInWeek(d: Date): number {
  return 7 - weekdayIndex(d);
}

/** The last `count` week starts, oldest → newest, ending with this week. */
export function recentWeekStarts(now: Date, count: number): Date[] {
  const current = weekStartUtc(now);
  const out: Date[] = [];
  for (let i = count - 1; i >= 0; i--) out.push(addDaysUtc(current, -7 * i));
  return out;
}

/** Whole-day difference (UTC) between two instants. */
export function daysBetween(from: Date, to: Date): number {
  return Math.floor(
    (utcDayStart(to).getTime() - utcDayStart(from).getTime()) / DAY_MS,
  );
}

export function weekdayNameUtc(d: Date): string {
  return WEEKDAY_NAMES[d.getUTCDay()];
}
