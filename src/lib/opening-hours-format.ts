import type { OpeningHours } from "@/types";

const DAYS = [
  { name: "Monday", shortName: "Mon", dayIndex: 1 },
  { name: "Tuesday", shortName: "Tue", dayIndex: 2 },
  { name: "Wednesday", shortName: "Wed", dayIndex: 3 },
  { name: "Thursday", shortName: "Thu", dayIndex: 4 },
  { name: "Friday", shortName: "Fri", dayIndex: 5 },
  { name: "Saturday", shortName: "Sat", dayIndex: 6 },
  { name: "Sunday", shortName: "Sun", dayIndex: 0 },
] as const;

export type OpeningHoursStatus = "open" | "closed" | "unavailable";

export interface NormalizedOpeningDay {
  day: (typeof DAYS)[number]["name"];
  shortDay: (typeof DAYS)[number]["shortName"];
  dayIndex: number;
  status: OpeningHoursStatus;
  open?: string;
  close?: string;
}

export interface FooterHoursGroup {
  label: string;
  value: string;
  dayIndexes: number[];
}

export interface OpeningHoursSpecification {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function normalizeRow(row: OpeningHours): Pick<NormalizedOpeningDay, "status" | "open" | "close"> {
  if (row.closed === true) {
    return { status: "closed" };
  }

  if (
    row.closed !== false ||
    !TIME_PATTERN.test(row.open) ||
    !TIME_PATTERN.test(row.close) ||
    row.open === row.close
  ) {
    return { status: "unavailable" };
  }

  return { status: "open", open: row.open, close: row.close };
}

function sameHours(
  left: Pick<NormalizedOpeningDay, "status" | "open" | "close">,
  right: Pick<NormalizedOpeningDay, "status" | "open" | "close">,
) {
  return (
    left.status === right.status &&
    left.open === right.open &&
    left.close === right.close
  );
}

export function normalizeOpeningHours(rows: OpeningHours[]): NormalizedOpeningDay[] {
  return DAYS.map((day) => {
    const matches = rows.filter(
      (row) => row.day.trim().toLowerCase() === day.name.toLowerCase(),
    );

    if (matches.length === 0) {
      return { ...day, day: day.name, shortDay: day.shortName, status: "unavailable" };
    }

    const candidates = matches.map(normalizeRow);
    const first = candidates[0];
    const resolved = candidates.every((candidate) => sameHours(candidate, first))
      ? first
      : { status: "unavailable" as const };

    return {
      day: day.name,
      shortDay: day.shortName,
      dayIndex: day.dayIndex,
      ...resolved,
    };
  });
}

function formatDisplayTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")}${suffix}`;
}

function buildLabel(days: NormalizedOpeningDay[]) {
  if (days.length === 1) return `${days[0].day}:`;
  return `${days[0].shortDay} – ${days[days.length - 1].shortDay}:`;
}

function buildValue(day: NormalizedOpeningDay) {
  if (day.status === "closed") return "Closed";
  if (day.status === "unavailable" || !day.open || !day.close) {
    return "Hours unavailable";
  }

  return `${formatDisplayTime(day.open)} – ${formatDisplayTime(day.close)}`;
}

function groupConsecutiveDays(days: NormalizedOpeningDay[]) {
  return days.reduce<NormalizedOpeningDay[][]>((groups, day) => {
    const current = groups.at(-1);
    if (current && sameHours(current[0], day)) {
      current.push(day);
    } else {
      groups.push([day]);
    }
    return groups;
  }, []);
}

export function buildFooterHours(days: NormalizedOpeningDay[]): FooterHoursGroup[] {
  return groupConsecutiveDays(days).map((group) => ({
    label: buildLabel(group),
    value: buildValue(group[0]),
    dayIndexes: group.map((day) => day.dayIndex),
  }));
}

export function buildOpeningHoursSpecification(
  days: NormalizedOpeningDay[],
): OpeningHoursSpecification[] {
  return groupConsecutiveDays(days)
    .filter((group) => group[0].status === "open")
    .map((group) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: group.map((day) => day.day),
      opens: group[0].open!,
      closes: group[0].close!,
    }));
}
