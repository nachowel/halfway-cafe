import test from "node:test";
import assert from "node:assert/strict";

import {
  getLondonMinutesOfDay,
  getLondonWeekdayIndex,
  getLondonWeekdayName,
} from "./london-time.ts";

test("resolves the Europe/London weekday regardless of the runtime zone", () => {
  // Saturday 14 November 2026, 12:00 UTC (GMT).
  const date = new Date("2026-11-14T12:00:00Z");

  assert.equal(getLondonWeekdayIndex(date), 6);
  assert.equal(getLondonWeekdayName(date), "Saturday");
  assert.equal(getLondonMinutesOfDay(date), 12 * 60);
});

test("uses British Summer Time in July and GMT in December", () => {
  assert.equal(getLondonMinutesOfDay(new Date("2026-07-01T12:00:00Z")), 13 * 60);
  assert.equal(getLondonMinutesOfDay(new Date("2026-12-01T12:00:00Z")), 12 * 60);
});

test("rolls over to the next London day at midnight BST", () => {
  // Saturday 4 July 2026, 23:30 UTC is Sunday 00:30 in London.
  const date = new Date("2026-07-04T23:30:00Z");

  assert.equal(getLondonWeekdayIndex(date), 0);
  assert.equal(getLondonWeekdayName(date), "Sunday");
  assert.equal(getLondonMinutesOfDay(date), 30);
});

test("reports midnight as 0 minutes, not 24 hours", () => {
  const date = new Date("2026-11-15T00:05:00Z");

  assert.equal(getLondonMinutesOfDay(date), 5);
});
