import assert from "node:assert/strict";
import test from "node:test";
import {
  HEBREW_YEARS_PER_ROTATION,
  SACRED_DAYS_PER_YEAR,
  SACRED_EPOCH_FIXED,
  SACRED_EPOCH_HEBREW,
  SACRED_ROTATION_YEARS,
  convertDate,
  dateFromFixed,
  fixedFromDate,
  fixedFromSacred,
  sacredRotation,
  sacredRotationAnniversary,
  weekdayFromFixed,
  type CalendarKind,
} from "../lib/sacred-calendar.ts";

test("matches the Hebrew New Year anchor", () => {
  assert.deepEqual(
    convertDate({ year: 2023, month: 9, day: 16 }, "gregorian", "hebrew"),
    { year: 5784, month: 7, day: 1 },
  );
});

test("matches the tabular Islamic epoch anchor", () => {
  assert.deepEqual(
    convertDate({ year: 2023, month: 7, day: 19 }, "gregorian", "islamic"),
    { year: 1445, month: 1, day: 1 },
  );
});

test("supports proleptic tabular Islamic dates before the Hijra", () => {
  const beforeHijra = { year: -200, month: 3, day: 5 };
  assert.deepEqual(
    dateFromFixed("islamic", fixedFromDate("islamic", beforeHijra)),
    beforeHijra,
  );
});

test("anchors Sacred day one to 25 Elul AM 1 without forcing Sunday", () => {
  assert.deepEqual(
    dateFromFixed("hebrew", SACRED_EPOCH_FIXED),
    SACRED_EPOCH_HEBREW,
  );
  assert.deepEqual(dateFromFixed("sacred", SACRED_EPOCH_FIXED), {
    year: 1,
    month: 1,
    day: 1,
  });
  assert.equal(weekdayFromFixed(SACRED_EPOCH_FIXED), "Monday");
});

test("round-trips representative dates in every calendar", () => {
  const cases: Array<[CalendarKind, { year: number; month: number; day: number }]> = [
    ["gregorian", { year: 2026, month: 7, day: 29 }],
    ["hebrew", { year: 5786, month: 5, day: 15 }],
    ["islamic", { year: 1448, month: 2, day: 14 }],
    ["sacred", { year: 5787, month: 13, day: 28 }],
  ];

  for (const [kind, date] of cases) {
    assert.deepEqual(dateFromFixed(kind, fixedFromDate(kind, date)), date);
  }
});

test("calculates the 293-year Sacred rotation", () => {
  assert.deepEqual(sacredRotation({ year: 1, month: 1, day: 1 }), {
    cycle: 1,
    yearInCycle: 1,
    dayInCycle: 1,
    progress: 1 / (SACRED_ROTATION_YEARS * SACRED_DAYS_PER_YEAR),
  });
  assert.equal(
    sacredRotation({ year: 294, month: 1, day: 1 }).cycle,
    2,
  );

  const meanHebrewYear =
    (235 / 19) * (29 + 12 / 24 + 793 / (1080 * 24));
  const difference =
    SACRED_ROTATION_YEARS * SACRED_DAYS_PER_YEAR -
    HEBREW_YEARS_PER_ROTATION * meanHebrewYear;
  assert.ok(Math.abs(difference * 24 + 1.73002) < 0.0001);
});

test("lists rotation anniversaries at completed 293-year boundaries", () => {
  assert.deepEqual(sacredRotationAnniversary(1), {
    year: 294,
    month: 1,
    day: 1,
  });
  assert.deepEqual(sacredRotationAnniversary(2), {
    year: 587,
    month: 1,
    day: 1,
  });
  assert.deepEqual(sacredRotationAnniversary(20), {
    year: 5861,
    month: 1,
    day: 1,
  });
  assert.equal(
    fixedFromSacred(sacredRotationAnniversary(20)) - SACRED_EPOCH_FIXED,
    20 * SACRED_ROTATION_YEARS * SACRED_DAYS_PER_YEAR,
  );
});
