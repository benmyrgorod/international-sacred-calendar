import assert from "node:assert/strict";
import test from "node:test";
import {
  internationalHolidaysBetween,
  majorHolidaysBetween,
} from "../lib/holidays.ts";
import {
  HEBREW_YEARS_PER_ROTATION,
  SACRED_LUNAR_BEAT_DAYS,
  SACRED_DAYS_PER_YEAR,
  SACRED_EPOCH_FIXED,
  SACRED_EPOCH_HEBREW,
  SACRED_ROTATION_YEARS,
  convertDate,
  dateFromFixed,
  fixedFromDate,
  fixedFromSacred,
  meanNewMoonsBetween,
  moonAlignmentAtSacredMonth,
  moonAlignmentsAround,
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

test("matches the Gregorian reform Julian date", () => {
  assert.deepEqual(
    convertDate({ year: 1582, month: 10, day: 15 }, "gregorian", "julian"),
    { year: 1582, month: 10, day: 5 },
  );
  assert.deepEqual(
    convertDate({ year: 1582, month: 10, day: 5 }, "julian", "gregorian"),
    { year: 1582, month: 10, day: 15 },
  );
});

test("anchors important dates and repeats them by Sacred year", () => {
  const discoveryFixed = fixedFromDate("gregorian", {
    year: 2026,
    month: 7,
    day: 27,
  });
  const birthdayFixed = fixedFromDate("gregorian", {
    year: 2026,
    month: 7,
    day: 28,
  });
  const discoverySacred = dateFromFixed("sacred", discoveryFixed);

  assert.deepEqual(discoverySacred, { year: 5805, month: 9, day: 22 });
  assert.deepEqual(dateFromFixed("sacred", birthdayFixed), {
    year: 5805,
    month: 9,
    day: 23,
  });
  assert.equal(
    fixedFromDate("sacred", {
      ...discoverySacred,
      year: discoverySacred.year + 1,
    }) - discoveryFixed,
    SACRED_DAYS_PER_YEAR,
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
    ["julian", { year: 1900, month: 2, day: 29 }],
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

test("finds five past and five future mean-moon alignments", () => {
  const selected = fixedFromDate(
    "gregorian",
    { year: 2026, month: 7, day: 29 },
  );
  const alignments = moonAlignmentsAround(selected, 5, 5);

  assert.equal(alignments.length, 10);
  assert.equal(alignments.filter((event) => event.fixed <= selected).length, 5);
  assert.equal(alignments.filter((event) => event.fixed > selected).length, 5);
  assert.ok(Math.abs(SACRED_LUNAR_BEAT_DAYS - 540.22116) < 0.0001);

  for (const alignment of alignments) {
    assert.equal(alignment.sacred.day, 1);
    assert.ok(Math.abs(alignment.offsetHours) < 19);
    assert.deepEqual(
      moonAlignmentAtSacredMonth(alignment.sacred),
      alignment,
    );
  }
});

test("lists mean new moons by their UTC calendar day", () => {
  const januaryStart = fixedFromDate("gregorian", {
    year: 2000,
    month: 1,
    day: 1,
  });
  const januaryEnd = fixedFromDate("gregorian", {
    year: 2000,
    month: 1,
    day: 31,
  });
  const events = meanNewMoonsBetween(januaryStart, januaryEnd);

  assert.equal(events.length, 1);
  assert.equal(
    events[0].fixed,
    fixedFromDate("gregorian", { year: 2000, month: 1, day: 6 }),
  );
  assert.ok(events[0].meanNewMoonFixed > events[0].fixed);
  assert.ok(events[0].meanNewMoonFixed < events[0].fixed + 1);
});

test("lists major holidays for each selected calendar", () => {
  const roshHashanah = fixedFromDate("hebrew", {
    year: 5787,
    month: 7,
    day: 1,
  });
  const easter = fixedFromDate("gregorian", {
    year: 2026,
    month: 4,
    day: 5,
  });
  const orthodoxPascha = fixedFromDate("julian", {
    year: 2026,
    month: 3,
    day: 30,
  });
  const eidAlFitr = fixedFromDate("islamic", {
    year: 1448,
    month: 10,
    day: 1,
  });

  assert.equal(
    majorHolidaysBetween("hebrew", roshHashanah, roshHashanah)[0].name,
    "Rosh Hashanah",
  );
  assert.equal(
    majorHolidaysBetween("gregorian", easter, easter)[0].name,
    "Easter Sunday",
  );
  assert.equal(
    majorHolidaysBetween("julian", orthodoxPascha, orthodoxPascha)[0].name,
    "Pascha",
  );
  assert.equal(
    majorHolidaysBetween("islamic", eidAlFitr, eidAlFitr)[0].name,
    "Eid al-Fitr",
  );
  assert.deepEqual(
    majorHolidaysBetween("sacred", roshHashanah, roshHashanah),
    [],
  );
});

test("lists international holidays independently of the selected calendar", () => {
  const newYear = fixedFromDate("gregorian", {
    year: 2027,
    month: 1,
    day: 1,
  });
  assert.equal(
    internationalHolidaysBetween(newYear, newYear)[0].name,
    "New Year’s Day",
  );
});
