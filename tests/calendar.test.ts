import assert from "node:assert/strict";
import test from "node:test";
import {
  internationalHolidaysBetween,
  majorHolidaySymbol,
  majorHolidaysBetween,
} from "../lib/holidays.ts";
import {
  HISTORICAL_EVENTS,
  SORTED_HISTORICAL_EVENTS,
  historicalEventRange,
} from "../lib/historical-events.ts";
import {
  HISTORICAL_EVENT_NAME_TRANSLATIONS,
  historicalEventName,
} from "../lib/event-name-translations.ts";
import {
  HOLIDAY_NAME_TRANSLATIONS,
  holidayName,
} from "../lib/holiday-name-translations.ts";
import {
  formatLocalTime,
  isValidTimePreference,
  normalizeTimePreference,
} from "../lib/local-preferences.ts";
import {
  calculatePlanetaryHour,
  planetForPlanetaryHour,
} from "../lib/planetary-hours.ts";
import {
  EGYPT_SOJOURN_MIDPOINT,
  FEATURED_ALIGNMENT_EVENT_IDS,
  MAINSTREAM_BABYLONIAN_EXILE,
  nearestRotationHalfAlignment,
  nearestRotationAlignment,
} from "../lib/rotation-event-alignments.ts";
import {
  HEBREW_YEARS_PER_ROTATION,
  SACRED_LUNAR_BEAT_DAYS,
  SACRED_DAYS_PER_YEAR,
  SACRED_EPOCH_FIXED,
  SACRED_EPOCH_HEBREW,
  SACRED_ROTATION_YEARS,
  THAI_BUDDHIST_MONTH_NAMES,
  convertDate,
  dateFromFixed,
  fixedFromDate,
  fixedFromSacred,
  meanFullMoonsBetween,
  meanNewMoonsBetween,
  moonAlignmentAtSacredMonth,
  moonAlignmentsAround,
  sacredRotation,
  sacredRotationAnniversary,
  weekdayFromFixed,
  type CalendarDate,
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

test("follows the seven-planet weekday and hourly sequence", () => {
  assert.equal(planetForPlanetaryHour(5, 1).id, "saturn");
  assert.equal(planetForPlanetaryHour(5, 13).id, "mercury");
  assert.equal(planetForPlanetaryHour(6, 1).id, "sun");
});

test("calculates unequal daylight and night planetary hours", () => {
  const middayWednesday = calculatePlanetaryHour(2, "06:00", "18:00", "12:00");
  assert.equal(middayWednesday.period, "day");
  assert.equal(middayWednesday.hour, 7);
  assert.equal(middayWednesday.planet.id, "venus");

  const beforeSunriseThursday = calculatePlanetaryHour(
    3,
    "06:00",
    "18:00",
    "00:30",
  );
  assert.equal(beforeSunriseThursday.period, "night");
  assert.equal(beforeSunriseThursday.rulingWeekdayIndex, 2);
  assert.equal(beforeSunriseThursday.hour, 7);
  assert.equal(beforeSunriseThursday.planet.id, "mars");

  const longSummerDay = calculatePlanetaryHour(0, "05:30", "20:30", "10:00");
  assert.equal(longSummerDay.durationMinutes, 75);
});

test("maintains exactly 80 unique historical dates in chronological order", () => {
  assert.equal(HISTORICAL_EVENTS.length, 80);
  assert.equal(new Set(HISTORICAL_EVENTS.map((event) => event.id)).size, 80);
  assert.equal(SORTED_HISTORICAL_EVENTS[0].id, "creation-begins");
  assert.equal(SORTED_HISTORICAL_EVENTS.at(-1)?.id, "isc-discovery");
  assert.ok(HISTORICAL_EVENTS.filter((event) => event.symbolism).length >= 8);

  for (let index = 1; index < SORTED_HISTORICAL_EVENTS.length; index++) {
    assert.ok(
      historicalEventRange(SORTED_HISTORICAL_EVENTS[index - 1]).startFixed <=
        historicalEventRange(SORTED_HISTORICAL_EVENTS[index]).startFixed,
    );
  }
});

test("places Abraham's circumcision covenant one year before Isaac's birth", () => {
  const covenant = HISTORICAL_EVENTS.find(
    (event) => event.id === "covenant-circumcision",
  );
  const isaacBirth = HISTORICAL_EVENTS.find(
    (event) => event.id === "isaac-born",
  );
  assert.ok(covenant);
  assert.ok(isaacBirth);
  assert.deepEqual(covenant.date, {
    calendar: "hebrew",
    year: 2047,
    month: 1,
    day: 13,
    precision: "day",
  });
  assert.equal(isaacBirth.date.calendar, "hebrew");
  assert.equal(isaacBirth.date.year, 2048);
  assert.ok(
    historicalEventRange(isaacBirth).startFixed -
      historicalEventRange(covenant).startFixed >
      350,
  );
});

test("maps the featured historical events to their nearest 293-year alignments", () => {
  const expectedAlignments = new Map([
    ["great-pyramid", 4],
    ["covenant-circumcision", 7],
    ["isaac-born", 7],
    ["first-temple-work", 10],
    ["second-temple-destroyed", 13],
    ["hijra", 15],
    ["magna-carta", 17],
    ["columbus-americas", 18],
    ["us-declaration", 19],
    ["french-revolution", 19],
  ]);

  for (const eventId of FEATURED_ALIGNMENT_EVENT_IDS) {
    const event = HISTORICAL_EVENTS.find((candidate) => candidate.id === eventId);
    assert.ok(event);
    const range = historicalEventRange(event);
    const proximity = nearestRotationAlignment(range.startFixed, range.endFixed);
    assert.equal(proximity.alignmentNumber, expectedAlignments.get(eventId));
    assert.equal(proximity.isNear, true);
  }

  assert.equal(EGYPT_SOJOURN_MIDPOINT.proximity.alignmentNumber, 8);
  assert.ok(
    Math.abs(EGYPT_SOJOURN_MIDPOINT.proximity.offsetSacredYears - 5.3) < 0.1,
  );
  assert.equal(MAINSTREAM_BABYLONIAN_EXILE.alignmentNumber, 11);
  assert.equal(MAINSTREAM_BABYLONIAN_EXILE.containsAlignment, true);
});

test("maps historical events to 293-year half-cycle marks", () => {
  const westernRome = HISTORICAL_EVENTS.find(
    (event) => event.id === "western-rome-falls",
  );
  const creation = HISTORICAL_EVENTS.find(
    (event) => event.id === "creation-begins",
  );
  assert.ok(westernRome);
  assert.ok(creation);

  const westernRomeRange = historicalEventRange(westernRome);
  const westernRomeHalfAlignment = nearestRotationHalfAlignment(
    westernRomeRange.startFixed,
    westernRomeRange.endFixed,
  );
  assert.equal(westernRomeHalfAlignment.alignmentNumber, 14.5);
  assert.ok(Math.abs(westernRomeHalfAlignment.offsetSacredYears - 1) < 0.1);
  assert.equal(westernRomeHalfAlignment.isNear, true);

  const creationRange = historicalEventRange(creation);
  assert.equal(
    nearestRotationHalfAlignment(
      creationRange.startFixed,
      creationRange.endFixed,
    ).isNear,
    false,
  );

  const halfCycleMatches = HISTORICAL_EVENTS.filter((event) => {
    const range = historicalEventRange(event);
    return nearestRotationHalfAlignment(
      range.startFixed,
      range.endFixed,
    ).isNear;
  });
  assert.equal(halfCycleMatches.length, 26);
});

test("localizes all 80 historical event names in every supported language", () => {
  const translatedLanguages = [
    "he",
    "ar",
    "it",
    "el",
    "ru",
    "zh",
    "hi",
    "es",
    "fr",
    "ja",
    "ko",
  ] as const;

  for (const language of translatedLanguages) {
    assert.equal(HISTORICAL_EVENT_NAME_TRANSLATIONS[language]?.length, 80);
    assert.notEqual(
      historicalEventName(
        HISTORICAL_EVENTS[79].id,
        language,
        HISTORICAL_EVENTS[79].title,
      ),
      HISTORICAL_EVENTS[79].title,
    );
  }

  assert.equal(
    historicalEventName("covenant-circumcision", "he", ""),
    "ברית המילה עם אברהם",
  );
  assert.equal(
    historicalEventName("purim", "ar", ""),
    "الخلاص الذي يحييه عيد بوريم",
  );
  assert.equal(
    historicalEventName("talmud-completed", "ru", ""),
    "Редактирование Вавилонского Талмуда",
  );
  assert.equal(historicalEventName("mishnah-compiled", "ja", ""), "ミシュナ編纂");
});

test("localizes every holiday name in every supported language", () => {
  for (const translations of Object.values(HOLIDAY_NAME_TRANSLATIONS)) {
    assert.equal(Object.keys(translations ?? {}).length, 46);
  }
  assert.equal(holidayName("Passover", "it"), "Pesach");
  assert.equal(holidayName("Passover", "es"), "Pésaj");
  assert.equal(holidayName("Rosh Hashanah", "ar"), "رأس السنة العبرية");
  assert.equal(holidayName("Chinese New Year", "zh"), "中国新年");
  assert.equal(holidayName("New Year’s Day", "en"), "New Year’s Day");
});

test("uses Hebrew chronology and honest ranges for ancient sacred events", () => {
  const creation = HISTORICAL_EVENTS.find((event) => event.id === "creation-begins");
  const templeCompletion = HISTORICAL_EVENTS.find(
    (event) => event.id === "first-temple-completed",
  );
  const templeDedication = HISTORICAL_EVENTS.find(
    (event) => event.id === "first-temple-dedicated",
  );
  const templeDestruction = HISTORICAL_EVENTS.find(
    (event) => event.id === "first-temple-destroyed",
  );
  assert.ok(creation && templeCompletion && templeDedication && templeDestruction);
  assert.equal(historicalEventRange(creation).startFixed, SACRED_EPOCH_FIXED);
  assert.equal(templeCompletion.date.calendar, "hebrew");
  assert.equal(templeCompletion.date.precision, "month");
  assert.ok(
    historicalEventRange(templeCompletion).endFixed >
      historicalEventRange(templeCompletion).startFixed,
  );
  assert.deepEqual(templeDedication.date, {
    calendar: "hebrew",
    year: 2936,
    month: 7,
    day: 8,
    precision: "day",
  });
  const templeGap =
    historicalEventRange(templeDedication).startFixed -
    historicalEventRange(templeCompletion).startFixed;
  assert.ok(templeGap > 300 && templeGap < 360);
  assert.deepEqual(templeDestruction.date, {
    calendar: "hebrew",
    year: 3338,
    month: 5,
    day: 9,
    precision: "day",
  });
});

test("includes requested secular and symbolic chronology anchors", () => {
  const frenchRevolution = HISTORICAL_EVENTS.find(
    (event) => event.id === "french-revolution",
  );
  const armistice = HISTORICAL_EVENTS.find((event) => event.id === "armistice");
  const beijing = HISTORICAL_EVENTS.find((event) => event.id === "beijing-olympics");
  assert.deepEqual(frenchRevolution?.date, {
    calendar: "gregorian",
    year: 1789,
    month: 7,
    day: 14,
    precision: "day",
    approximate: false,
  });
  assert.match(armistice?.symbolism ?? "", /eleventh hour/i);
  assert.match(beijing?.symbolism ?? "", /8\/8\/08/);
});

test("round-trips representative dates in every calendar", () => {
  const cases: Array<[CalendarKind, CalendarDate]> = [
    ["gregorian", { year: 2026, month: 7, day: 29 }],
    ["julian", { year: 1900, month: 2, day: 29 }],
    ["hebrew", { year: 5786, month: 5, day: 15 }],
    ["islamic", { year: 1448, month: 2, day: 14 }],
    ["sacred", { year: 5787, month: 13, day: 28 }],
    ["chinese", { year: 2025, month: 6, day: 7, leapMonth: true }],
    ["saka", { year: 1948, month: 5, day: 9 }],
    ["buddhist", { year: 2569, month: 7, day: 31 }],
  ];

  for (const [kind, date] of cases) {
    assert.deepEqual(dateFromFixed(kind, fixedFromDate(kind, date)), date);
  }
});

test("matches Chinese, Saka, and Thai Buddhist calendar anchors", () => {
  assert.deepEqual(
    convertDate({ year: 2026, month: 2, day: 17 }, "gregorian", "chinese"),
    { year: 2026, month: 1, day: 1, leapMonth: false },
  );
  assert.deepEqual(
    convertDate(
      { year: 2025, month: 6, day: 1, leapMonth: true },
      "chinese",
      "gregorian",
    ),
    { year: 2025, month: 7, day: 25 },
  );
  assert.deepEqual(
    convertDate({ year: 2026, month: 3, day: 22 }, "gregorian", "saka"),
    { year: 1948, month: 1, day: 1 },
  );
  assert.deepEqual(
    convertDate({ year: 2026, month: 7, day: 31 }, "gregorian", "buddhist"),
    { year: 2569, month: 7, day: 31 },
  );
  assert.equal(THAI_BUDDHIST_MONTH_NAMES[7], "Karakadakhom");
});

test("converts any supported calendar to any other", () => {
  const calendars: CalendarKind[] = [
    "sacred",
    "hebrew",
    "gregorian",
    "julian",
    "islamic",
    "chinese",
    "saka",
    "buddhist",
  ];
  const fixed = fixedFromDate("gregorian", {
    year: 2026,
    month: 7,
    day: 31,
  });

  for (const from of calendars) {
    const source = dateFromFixed(from, fixed);
    for (const to of calendars) {
      assert.equal(fixedFromDate(to, convertDate(source, from, to)), fixed);
    }
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
  assert.deepEqual(sacredRotationAnniversary(21), {
    year: 6154,
    month: 1,
    day: 1,
  });
  assert.deepEqual(sacredRotationAnniversary(22), {
    year: 6447,
    month: 1,
    day: 1,
  });
  assert.equal(
    fixedFromSacred(sacredRotationAnniversary(22)) - SACRED_EPOCH_FIXED,
    22 * SACRED_ROTATION_YEARS * SACRED_DAYS_PER_YEAR,
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

test("lists mean full moons by their UTC calendar day", () => {
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
  const events = meanFullMoonsBetween(januaryStart, januaryEnd);

  assert.equal(events.length, 1);
  assert.equal(
    events[0].fixed,
    fixedFromDate("gregorian", { year: 2000, month: 1, day: 21 }),
  );
  assert.ok(events[0].meanFullMoonFixed > events[0].fixed);
  assert.ok(events[0].meanFullMoonFixed < events[0].fixed + 1);
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
  const chineseNewYear = fixedFromDate("chinese", {
    year: 2026,
    month: 1,
    day: 1,
    leapMonth: false,
  });
  assert.equal(
    majorHolidaysBetween("chinese", chineseNewYear, chineseNewYear)[0].name,
    "Chinese New Year",
  );
  const sakaNewYear = fixedFromDate("saka", { year: 1948, month: 1, day: 1 });
  assert.equal(
    majorHolidaysBetween("saka", sakaNewYear, sakaNewYear)[0].name,
    "Saka New Year",
  );
  const songkran = fixedFromDate("buddhist", {
    year: 2569,
    month: 4,
    day: 13,
  });
  assert.equal(
    majorHolidaysBetween("buddhist", songkran, songkran)[0].name,
    "Songkran (Thai New Year)",
  );
  assert.deepEqual(
    majorHolidaysBetween("sacred", roshHashanah, roshHashanah),
    [],
  );
});

test("uses a distinct major-holiday symbol for every calendar", () => {
  assert.equal(majorHolidaySymbol("hebrew"), "✡");
  assert.equal(majorHolidaySymbol("gregorian"), "✝");
  assert.equal(majorHolidaySymbol("julian"), "☦");
  assert.equal(majorHolidaySymbol("islamic"), "☾");
  assert.equal(majorHolidaySymbol("chinese"), "🏮");
  assert.equal(majorHolidaySymbol("saka"), "ॐ");
  assert.equal(majorHolidaySymbol("buddhist"), "☸");
});

test("accepts valid saved sunrise and sunset times and rejects invalid values", () => {
  assert.equal(normalizeTimePreference("05:42", "06:00"), "05:42");
  assert.equal(normalizeTimePreference("19:18", "18:00"), "19:18");
  assert.equal(normalizeTimePreference("25:00", "06:00"), "06:00");
  assert.equal(normalizeTimePreference(null, "18:00"), "18:00");
  assert.equal(isValidTimePreference("00:00"), true);
  assert.equal(isValidTimePreference("23:59"), true);
  assert.equal(isValidTimePreference("24:00"), false);
  assert.equal(formatLocalTime(new Date(2026, 0, 1, 3, 4)), "03:04");
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
