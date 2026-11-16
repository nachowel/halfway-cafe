import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildFooterHours,
  buildOpeningHoursSpecification,
  normalizeOpeningHours,
} from "./opening-hours-format.ts";

const OWNER_CONFIRMED_HOURS = [
  { day: "Monday", open: "07:00", close: "15:00", closed: false },
  { day: "Tuesday", open: "07:00", close: "15:00", closed: false },
  { day: "Wednesday", open: "07:00", close: "15:00", closed: false },
  { day: "Thursday", open: "07:00", close: "15:00", closed: false },
  { day: "Friday", open: "07:00", close: "15:00", closed: false },
  { day: "Saturday", open: "08:00", close: "15:00", closed: false },
  { day: "Sunday", open: "09:00", close: "14:00", closed: false },
];

test("owner-confirmed hours produce matching footer groups and JSON-LD", () => {
  const normalized = normalizeOpeningHours(OWNER_CONFIRMED_HOURS);

  assert.deepEqual(buildFooterHours(normalized), [
    {
      label: "Mon – Fri:",
      value: "7:00am – 3:00pm",
      dayIndexes: [1, 2, 3, 4, 5],
    },
    {
      label: "Saturday:",
      value: "8:00am – 3:00pm",
      dayIndexes: [6],
    },
    {
      label: "Sunday:",
      value: "9:00am – 2:00pm",
      dayIndexes: [0],
    },
  ]);

  assert.deepEqual(buildOpeningHoursSpecification(normalized), [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "15:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "08:00",
      closes: "15:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "09:00",
      closes: "14:00",
    },
  ]);
});

test("missing, malformed, and conflicting duplicate days never invent hours", () => {
  const normalized = normalizeOpeningHours([
    { day: "Monday", open: "00:00", close: "00:00", closed: true },
    { day: "Wednesday", open: "07:00", close: "15:00", closed: false },
    { day: "Wednesday", open: "08:00", close: "15:00", closed: false },
    { day: "Thursday", open: "07:00", close: "15:00", closed: false },
    { day: "Thursday", open: "07:00", close: "15:00", closed: false },
    { day: "Friday", open: "not-a-time", close: "15:00", closed: false },
  ]);

  assert.deepEqual(
    normalized.map(({ day, status }) => ({ day, status })),
    [
      { day: "Monday", status: "closed" },
      { day: "Tuesday", status: "unavailable" },
      { day: "Wednesday", status: "unavailable" },
      { day: "Thursday", status: "open" },
      { day: "Friday", status: "unavailable" },
      { day: "Saturday", status: "unavailable" },
      { day: "Sunday", status: "unavailable" },
    ],
  );

  assert.deepEqual(buildOpeningHoursSpecification(normalized), [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Thursday"],
      opens: "07:00",
      closes: "15:00",
    },
  ]);

  assert.deepEqual(
    buildFooterHours(normalized).map(({ label, value }) => ({ label, value })),
    [
      { label: "Monday:", value: "Closed" },
      { label: "Tue – Wed:", value: "Hours unavailable" },
      { label: "Thursday:", value: "7:00am – 3:00pm" },
      { label: "Fri – Sun:", value: "Hours unavailable" },
    ],
  );
});
