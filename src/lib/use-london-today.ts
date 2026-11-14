"use client";

import { useEffect, useState } from "react";
import { getLondonWeekdayIndex } from "./london-time";

/**
 * Current Europe/London weekday index (0 = Sunday) once mounted, or `null`
 * during server rendering and the hydration pass.
 *
 * Callers must fall back to a server-provided value while this is `null`, so
 * the first client render matches the cached HTML exactly. The value then
 * self-corrects (within a minute) when the visitor's day differs from the day
 * the page was cached on, without triggering a hydration mismatch.
 */
export function useLondonWeekdayIndex(): number | null {
  const [weekdayIndex, setWeekdayIndex] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setWeekdayIndex(getLondonWeekdayIndex());

    sync();
    const interval = window.setInterval(sync, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  return weekdayIndex;
}
