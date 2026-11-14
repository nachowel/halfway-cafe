"use client";

import { useLondonWeekdayIndex } from "@/lib/use-london-today";

export interface FooterHoursEntry {
  label: string;
  value: string;
  /** True for the combined Mon – Sat row, false for the Sunday row. */
  isWeekday: boolean;
  /** Server-computed highlight, used for the first render. */
  isToday: boolean;
}

/**
 * Footer opening hours with a "today" highlight that stays correct on cached
 * pages. The server-provided `isToday` is rendered first (matching the cached
 * HTML), then replaced with the visitor's actual Europe/London day after mount.
 */
export default function FooterOpeningHours({
  hours,
}: {
  hours: FooterHoursEntry[];
}) {
  const weekdayIndex = useLondonWeekdayIndex();

  const entries =
    weekdayIndex === null
      ? hours
      : hours.map((entry) => ({
          ...entry,
          isToday: entry.isWeekday ? weekdayIndex !== 0 : weekdayIndex === 0,
        }));

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.label}
          className="flex justify-between gap-4 font-inter text-sm"
        >
          <span
            className={
              entry.isToday ? "font-bold text-orange-400" : "text-gray-400"
            }
          >
            {entry.label}
          </span>
          <span
            className={
              entry.isToday
                ? "text-right font-bold text-orange-400"
                : "text-right text-gray-500"
            }
          >
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
