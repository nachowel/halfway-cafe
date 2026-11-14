/* Halfway Cafe — Opening hours data & status helpers */

import { OpeningHours, OpenStatus } from '@/types';
import { getLondonMinutesOfDay, getLondonWeekdayIndex } from '@/lib/london-time';

export const openingHours: OpeningHours[] = [
  { day: 'Monday',    open: '07:00', close: '15:00', closed: false },
  { day: 'Tuesday',   open: '07:00', close: '15:00', closed: false },
  { day: 'Wednesday', open: '07:00', close: '15:00', closed: false },
  { day: 'Thursday',  open: '07:00', close: '15:00', closed: false },
  { day: 'Friday',    open: '07:00', close: '15:00', closed: false },
  { day: 'Saturday',  open: '07:00', close: '15:00', closed: false },
  { day: 'Sunday',    open: '00:00', close: '00:00', closed: true },
];

/**
 * Check if the cafe is currently open.
 * Returns { isOpen, message } with a human-friendly status string.
 */
export function isOpenNow(): OpenStatus {
  const dayIndex = getLondonWeekdayIndex(); // 0 = Sunday
  // Map weekday index (0=Sun) to our array (0=Mon)
  const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  const today = openingHours[mappedIndex];

  if (today.closed) {
    const next = findNextOpenDay(mappedIndex);
    return {
      isOpen: false,
      message: `Closed · Opens ${next.day} at ${next.open}`,
    };
  }

  const currentMinutes = getLondonMinutesOfDay();
  const openMinutes = timeToMinutes(today.open);
  const closeMinutes = timeToMinutes(today.close);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      isOpen: true,
      message: `Open · Closes at ${today.close}`,
    };
  }

  // Before opening time today
  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      message: `Closed · Opens today at ${today.open}`,
    };
  }

  // After closing time — find next open day
  const next = findNextOpenDay(mappedIndex);
  return {
    isOpen: false,
    message: `Closed · Opens ${next.day} at ${next.open}`,
  };
}

// ─── Internal Helpers ───

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function findNextOpenDay(currentIndex: number): OpeningHours {
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentIndex + i) % 7;
    if (!openingHours[nextIndex].closed) {
      return openingHours[nextIndex];
    }
  }
  // Fallback (should never happen — at least one day is open)
  return openingHours[0];
}
