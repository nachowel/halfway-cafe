/* Europe/London time helpers — shared by server and client code.
 *
 * The cafe is in Sidcup (Europe/London), so "today" must be resolved in that
 * zone rather than the server's UTC clock or the visitor's device zone.
 * Everything here is pure and safe to run in either environment.
 */

export const LONDON_TIME_ZONE = "Europe/London";

/** Sunday-first weekday names, matching `Date#getDay()` ordering. */
export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const SHORT_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Current Europe/London weekday index (0 = Sunday). */
export function getLondonWeekdayIndex(date: Date = new Date()): number {
  const shortName = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: LONDON_TIME_ZONE,
  }).format(date);

  return SHORT_WEEKDAY_INDEX[shortName] ?? 0;
}

/** Current Europe/London weekday name, e.g. "Monday". */
export function getLondonWeekdayName(date: Date = new Date()): string {
  return WEEKDAY_NAMES[getLondonWeekdayIndex(date)];
}

/** Minutes elapsed since midnight in Europe/London (0–1439). */
export function getLondonMinutesOfDay(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: LONDON_TIME_ZONE,
  }).formatToParts(date);

  const hour =
    Number(parts.find((part) => part.type === "hour")?.value ?? "0") % 24;
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );

  return hour * 60 + minute;
}
