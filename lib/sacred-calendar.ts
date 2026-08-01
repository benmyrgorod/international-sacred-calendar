/**
 * Sacred Calendar conversion library.
 *
 * All calendars convert through a fixed-day number where Gregorian
 * 0001-01-01 CE is day 1. The Sacred epoch is Hebrew 25 Elul AM 1,
 * the traditional first day of Creation.
 */

export type CalendarKind =
  | "sacred"
  | "hebrew"
  | "gregorian"
  | "julian"
  | "islamic"
  | "chinese"
  | "saka"
  | "buddhist";

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
  leapMonth?: boolean;
}

export interface ChineseMonthInfo {
  month: number;
  leapMonth: boolean;
  days: number;
  startFixed: number;
}

export interface RotationPosition {
  cycle: number;
  yearInCycle: number;
  dayInCycle: number;
  progress: number;
}

export interface MoonMonthAlignment {
  sacred: CalendarDate;
  fixed: number;
  meanNewMoonFixed: number;
  offsetHours: number;
}

export interface MeanNewMoon {
  fixed: number;
  meanNewMoonFixed: number;
}

const HEBREW_EPOCH = -1_373_429;
const ISLAMIC_EPOCH = 227_015;

export const SACRED_MONTHS_PER_YEAR = 13;
export const SACRED_DAYS_PER_MONTH = 28;
export const SACRED_DAYS_PER_YEAR = 364;
export const SACRED_WEEKS_PER_YEAR = 52;
export const SACRED_ROTATION_YEARS = 293;
export const HEBREW_YEARS_PER_ROTATION = 292;
export const MEAN_SYNODIC_MONTH_DAYS = 29.530588853;
export const SACRED_LUNAR_BEAT_DAYS =
  1 /
  Math.abs(
    1 / SACRED_DAYS_PER_MONTH - 1 / MEAN_SYNODIC_MONTH_DAYS,
  );

// Mean-phase reference: new moon on 2000-01-06 at approximately 18:14 UTC.
const MEAN_NEW_MOON_REFERENCE_FIXED =
  fixedFromGregorian({ year: 2000, month: 1, day: 6 }) +
  (18 + 14 / 60) / 24;

export const HEBREW_MONTH_NAMES = [
  "",
  "Nisan",
  "Iyar",
  "Sivan",
  "Tammuz",
  "Av",
  "Elul",
  "Tishrei",
  "Cheshvan",
  "Kislev",
  "Tevet",
  "Shevat",
  "Adar",
  "Adar II",
] as const;

export const GREGORIAN_MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const ISLAMIC_MONTH_NAMES = [
  "",
  "Muharram",
  "Safar",
  "Rabi I",
  "Rabi II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qadah",
  "Dhu al-Hijjah",
] as const;

export const SAKA_MONTH_NAMES = [
  "",
  "Chaitra",
  "Vaisakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadra",
  "Ashvina",
  "Kartika",
  "Agrahayana",
  "Pausha",
  "Magha",
  "Phalguna",
] as const;

export const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function assertInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${label} must be a safe integer.`);
  }
}

export function isGregorianLeapYear(year: number): boolean {
  return mod(year, 4) === 0 && (mod(year, 100) !== 0 || mod(year, 400) === 0);
}

export function gregorianMonthDays(year: number, month: number): number {
  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

export function fixedFromGregorian(date: CalendarDate): number {
  validateDate("gregorian", date);
  const { year, month, day } = date;
  const priorYear = year - 1;
  const correction =
    month <= 2 ? 0 : isGregorianLeapYear(year) ? -1 : -2;

  return (
    365 * priorYear +
    floorDiv(priorYear, 4) -
    floorDiv(priorYear, 100) +
    floorDiv(priorYear, 400) +
    floorDiv(367 * month - 362, 12) +
    correction +
    day
  );
}

export function gregorianFromFixed(fixed: number): CalendarDate {
  assertInteger(fixed, "Fixed day");
  let year = floorDiv(fixed - 1, 366) + 1;

  while (fixed >= fixedFromGregorian({ year: year + 1, month: 1, day: 1 })) year++;
  while (fixed < fixedFromGregorian({ year, month: 1, day: 1 })) year--;

  const priorDays = fixed - fixedFromGregorian({ year, month: 1, day: 1 });
  const correction =
    fixed < fixedFromGregorian({ year, month: 3, day: 1 })
      ? 0
      : isGregorianLeapYear(year)
        ? 1
        : 2;
  const month = floorDiv(12 * (priorDays + correction) + 373, 367);
  const day = fixed - fixedFromGregorian({ year, month, day: 1 }) + 1;

  return { year, month, day };
}

export function isJulianLeapYear(year: number): boolean {
  return mod(year, 4) === 0;
}

export function julianMonthDays(year: number, month: number): number {
  if (month === 2) return isJulianLeapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

/**
 * Converts a proleptic Julian date to the shared fixed-day count.
 * Astronomical year zero is used internally and represents 1 BCE.
 */
export function fixedFromJulian(date: CalendarDate): number {
  validateDate("julian", date);
  const { year, month, day } = date;
  const priorYear = year - 1;
  const correction = month <= 2 ? 0 : isJulianLeapYear(year) ? -1 : -2;

  return (
    365 * priorYear +
    floorDiv(priorYear, 4) +
    floorDiv(367 * month - 362, 12) +
    correction +
    day -
    2
  );
}

export function julianFromFixed(fixed: number): CalendarDate {
  assertInteger(fixed, "Fixed day");
  let year = floorDiv(fixed + 1, 366) + 1;

  while (fixed >= fixedFromJulian({ year: year + 1, month: 1, day: 1 })) year++;
  while (fixed < fixedFromJulian({ year, month: 1, day: 1 })) year--;

  const priorDays = fixed - fixedFromJulian({ year, month: 1, day: 1 });
  const correction =
    fixed < fixedFromJulian({ year, month: 3, day: 1 })
      ? 0
      : isJulianLeapYear(year)
        ? 1
        : 2;
  const month = floorDiv(12 * (priorDays + correction) + 373, 367);
  const day = fixed - fixedFromJulian({ year, month, day: 1 }) + 1;

  return { year, month, day };
}

export function isHebrewLeapYear(year: number): boolean {
  return mod(7 * year + 1, 19) < 7;
}

export function hebrewYearMonths(year: number): number {
  return isHebrewLeapYear(year) ? 13 : 12;
}

function hebrewDelayOne(year: number): number {
  const months = floorDiv(235 * year - 234, 19);
  const parts = 12_084 + 13_753 * months;
  let day = 29 * months + floorDiv(parts, 25_920);

  if (mod(3 * (day + 1), 7) < 3) day++;
  return day;
}

function hebrewDelayTwo(year: number): number {
  const last = hebrewDelayOne(year - 1);
  const present = hebrewDelayOne(year);
  const next = hebrewDelayOne(year + 1);

  if (next - present === 356) return 2;
  if (present - last === 382) return 1;
  return 0;
}

export function hebrewYearDays(year: number): number {
  return (
    hebrewDelayOne(year + 1) +
    hebrewDelayTwo(year + 1) -
    hebrewDelayOne(year) -
    hebrewDelayTwo(year)
  );
}

export function hebrewMonthDays(year: number, month: number): number {
  if ([2, 4, 6, 10, 13].includes(month)) return 29;
  if (month === 12 && !isHebrewLeapYear(year)) return 29;
  if (month === 8 && mod(hebrewYearDays(year), 10) !== 5) return 29;
  if (month === 9 && mod(hebrewYearDays(year), 10) === 3) return 29;
  return 30;
}

export function fixedFromHebrew(date: CalendarDate): number {
  validateDate("hebrew", date);
  const { year, month, day } = date;
  let elapsed = day;

  if (month < 7) {
    for (let candidate = 7; candidate <= hebrewYearMonths(year); candidate++) {
      elapsed += hebrewMonthDays(year, candidate);
    }
    for (let candidate = 1; candidate < month; candidate++) {
      elapsed += hebrewMonthDays(year, candidate);
    }
  } else {
    for (let candidate = 7; candidate < month; candidate++) {
      elapsed += hebrewMonthDays(year, candidate);
    }
  }

  return HEBREW_EPOCH + hebrewDelayOne(year) + hebrewDelayTwo(year) + elapsed + 1;
}

export function hebrewFromFixed(fixed: number): CalendarDate {
  assertInteger(fixed, "Fixed day");
  let year = Math.max(1, floorDiv(fixed - HEBREW_EPOCH, 366));

  while (fixed >= fixedFromHebrew({ year: year + 1, month: 7, day: 1 })) year++;
  while (year > 1 && fixed < fixedFromHebrew({ year, month: 7, day: 1 })) year--;

  const nisanOne = fixedFromHebrew({ year, month: 1, day: 1 });
  let month = fixed < nisanOne ? 7 : 1;

  while (
    month <= hebrewYearMonths(year) &&
    fixed > fixedFromHebrew({ year, month, day: hebrewMonthDays(year, month) })
  ) {
    month++;
    if (month > hebrewYearMonths(year)) month = 1;
  }

  const day = fixed - fixedFromHebrew({ year, month, day: 1 }) + 1;
  return { year, month, day };
}

export function isIslamicLeapYear(year: number): boolean {
  return mod(14 + 11 * year, 30) < 11;
}

export function islamicMonthDays(year: number, month: number): number {
  if (month === 12) return isIslamicLeapYear(year) ? 30 : 29;
  return month % 2 === 1 ? 30 : 29;
}

export function fixedFromIslamic(date: CalendarDate): number {
  validateDate("islamic", date);
  const { year, month, day } = date;

  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    354 * (year - 1) +
    floorDiv(3 + 11 * year, 30) +
    ISLAMIC_EPOCH -
    1
  );
}

export function islamicFromFixed(fixed: number): CalendarDate {
  assertInteger(fixed, "Fixed day");
  const year = floorDiv(30 * (fixed - ISLAMIC_EPOCH) + 10_646, 10_631);
  const month = Math.min(
    12,
    Math.ceil(
      (fixed - 29 - fixedFromIslamic({ year, month: 1, day: 1 })) / 29.5,
    ) + 1,
  );
  const day = fixed - fixedFromIslamic({ year, month, day: 1 }) + 1;

  return { year, month, day };
}

const CHINESE_DATE_FORMATTER = new Intl.DateTimeFormat("en-u-ca-chinese", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});
const chineseYearCache = new Map<number, ChineseMonthInfo[]>();

function utcDateFromFixed(fixed: number): Date {
  const gregorian = gregorianFromFixed(fixed);
  const date = new Date(0);
  date.setUTCFullYear(gregorian.year, gregorian.month - 1, gregorian.day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function chinesePartsFromFixed(fixed: number): CalendarDate {
  const parts = CHINESE_DATE_FORMATTER.formatToParts(utcDateFromFixed(fixed));
  const year = Number(
    parts.find((part) => (part.type as string) === "relatedYear")?.value ??
      parts.find((part) => part.type === "year")?.value,
  );
  const monthPart = parts.find((part) => part.type === "month")?.value ?? "";
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const month = Number.parseInt(monthPart, 10);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new RangeError("Chinese calendar conversion is unavailable for this date.");
  }

  return {
    year,
    month,
    day,
    leapMonth: monthPart.toLowerCase().includes("bis"),
  };
}

function chineseNewYearFixed(year: number): number {
  const searchStart = fixedFromGregorian({ year, month: 1, day: 1 });
  const searchEnd = fixedFromGregorian({ year, month: 3, day: 31 });

  for (let fixed = searchStart; fixed <= searchEnd; fixed++) {
    const date = chinesePartsFromFixed(fixed);
    if (
      date.year === year &&
      date.month === 1 &&
      date.day === 1 &&
      !date.leapMonth
    ) {
      return fixed;
    }
  }

  throw new RangeError(`Unable to resolve Chinese year ${year}.`);
}

export function chineseMonthsInYear(year: number): ChineseMonthInfo[] {
  assertInteger(year, "Chinese year");
  if (year < 1) throw new RangeError("Chinese year must be 1 or later.");

  const cached = chineseYearCache.get(year);
  if (cached) return cached.map((month) => ({ ...month }));

  const start = chineseNewYearFixed(year);
  const end = chineseNewYearFixed(year + 1);
  const monthStarts: Array<Omit<ChineseMonthInfo, "days">> = [];

  for (let fixed = start; fixed < end; fixed++) {
    const date = chinesePartsFromFixed(fixed);
    if (date.day === 1) {
      monthStarts.push({
        month: date.month,
        leapMonth: Boolean(date.leapMonth),
        startFixed: fixed,
      });
    }
  }

  const months = monthStarts.map((month, index) => ({
    ...month,
    days: (monthStarts[index + 1]?.startFixed ?? end) - month.startFixed,
  }));
  chineseYearCache.set(year, months);
  return months.map((month) => ({ ...month }));
}

export function fixedFromChinese(date: CalendarDate): number {
  validateDate("chinese", date);
  const month = chineseMonthsInYear(date.year).find(
    (candidate) =>
      candidate.month === date.month &&
      candidate.leapMonth === Boolean(date.leapMonth),
  );
  if (!month) throw new RangeError("That Chinese month does not exist in this year.");
  return month.startFixed + date.day - 1;
}

export function chineseFromFixed(fixed: number): CalendarDate {
  assertInteger(fixed, "Fixed day");
  return chinesePartsFromFixed(fixed);
}

export function fixedFromSaka(date: CalendarDate): number {
  validateDate("saka", date);
  const gregorianYear = date.year + 78;
  const chaitraDays = isGregorianLeapYear(gregorianYear) ? 31 : 30;
  const yearStart = fixedFromGregorian({
    year: gregorianYear,
    month: 3,
    day: chaitraDays === 31 ? 21 : 22,
  });
  const priorDays =
    date.month === 1
      ? 0
      : chaitraDays +
        Math.min(date.month - 2, 5) * 31 +
        Math.max(date.month - 7, 0) * 30;
  return yearStart + priorDays + date.day - 1;
}

export function sakaFromFixed(fixed: number): CalendarDate {
  assertInteger(fixed, "Fixed day");
  const gregorian = gregorianFromFixed(fixed);
  let gregorianYear = gregorian.year;
  let chaitraDays = isGregorianLeapYear(gregorianYear) ? 31 : 30;
  let yearStart = fixedFromGregorian({
    year: gregorianYear,
    month: 3,
    day: chaitraDays === 31 ? 21 : 22,
  });

  if (fixed < yearStart) {
    gregorianYear -= 1;
    chaitraDays = isGregorianLeapYear(gregorianYear) ? 31 : 30;
    yearStart = fixedFromGregorian({
      year: gregorianYear,
      month: 3,
      day: chaitraDays === 31 ? 21 : 22,
    });
  }

  const year = gregorianYear - 78;
  let offset = fixed - yearStart;
  if (offset < chaitraDays) return { year, month: 1, day: offset + 1 };

  offset -= chaitraDays;
  if (offset < 5 * 31) {
    return {
      year,
      month: Math.floor(offset / 31) + 2,
      day: mod(offset, 31) + 1,
    };
  }

  offset -= 5 * 31;
  return {
    year,
    month: Math.floor(offset / 30) + 7,
    day: mod(offset, 30) + 1,
  };
}

export function fixedFromBuddhist(date: CalendarDate): number {
  validateDate("buddhist", date);
  return fixedFromGregorian({ ...date, year: date.year - 543 });
}

export function buddhistFromFixed(fixed: number): CalendarDate {
  const gregorian = gregorianFromFixed(fixed);
  return { ...gregorian, year: gregorian.year + 543 };
}

/**
 * Hebrew 25 Elul AM 1: the traditional first day of Creation.
 * In the calculated Hebrew calendar this fixed day is a Monday, so Sacred
 * weekdays inherit Monday at the epoch rather than resetting to Sunday.
 */
export const SACRED_EPOCH_HEBREW: CalendarDate = { year: 1, month: 6, day: 25 };
export const SACRED_EPOCH_FIXED = fixedFromHebrew(SACRED_EPOCH_HEBREW);

export function fixedFromSacred(date: CalendarDate): number {
  validateDate("sacred", date);
  return (
    SACRED_EPOCH_FIXED +
    (date.year - 1) * SACRED_DAYS_PER_YEAR +
    (date.month - 1) * SACRED_DAYS_PER_MONTH +
    date.day -
    1
  );
}

export function sacredFromFixed(fixed: number): CalendarDate {
  assertInteger(fixed, "Fixed day");
  const offset = fixed - SACRED_EPOCH_FIXED;
  const year = floorDiv(offset, SACRED_DAYS_PER_YEAR) + 1;
  const dayOfYear = mod(offset, SACRED_DAYS_PER_YEAR);
  const month = floorDiv(dayOfYear, SACRED_DAYS_PER_MONTH) + 1;
  const day = mod(dayOfYear, SACRED_DAYS_PER_MONTH) + 1;

  return { year, month, day };
}

export function fixedFromDate(kind: CalendarKind, date: CalendarDate): number {
  switch (kind) {
    case "sacred":
      return fixedFromSacred(date);
    case "hebrew":
      return fixedFromHebrew(date);
    case "gregorian":
      return fixedFromGregorian(date);
    case "julian":
      return fixedFromJulian(date);
    case "islamic":
      return fixedFromIslamic(date);
    case "chinese":
      return fixedFromChinese(date);
    case "saka":
      return fixedFromSaka(date);
    case "buddhist":
      return fixedFromBuddhist(date);
  }
}

export function dateFromFixed(kind: CalendarKind, fixed: number): CalendarDate {
  switch (kind) {
    case "sacred":
      return sacredFromFixed(fixed);
    case "hebrew":
      return hebrewFromFixed(fixed);
    case "gregorian":
      return gregorianFromFixed(fixed);
    case "julian":
      return julianFromFixed(fixed);
    case "islamic":
      return islamicFromFixed(fixed);
    case "chinese":
      return chineseFromFixed(fixed);
    case "saka":
      return sakaFromFixed(fixed);
    case "buddhist":
      return buddhistFromFixed(fixed);
  }
}

export function convertDate(
  date: CalendarDate,
  from: CalendarKind,
  to: CalendarKind,
): CalendarDate {
  return dateFromFixed(to, fixedFromDate(from, date));
}

export function weekdayFromFixed(fixed: number): (typeof WEEKDAY_NAMES)[number] {
  return WEEKDAY_NAMES[mod(fixed - 1, 7)];
}

export function sacredRotation(date: CalendarDate): RotationPosition {
  validateDate("sacred", date);
  const elapsedYears = date.year - 1;
  const cycle = floorDiv(elapsedYears, SACRED_ROTATION_YEARS) + 1;
  const yearInCycle = mod(elapsedYears, SACRED_ROTATION_YEARS) + 1;
  const dayInYear =
    (date.month - 1) * SACRED_DAYS_PER_MONTH + (date.day - 1);
  const dayInCycle = (yearInCycle - 1) * SACRED_DAYS_PER_YEAR + dayInYear + 1;

  return {
    cycle,
    yearInCycle,
    dayInCycle,
    progress: dayInCycle / (SACRED_ROTATION_YEARS * SACRED_DAYS_PER_YEAR),
  };
}

/**
 * Returns the first Sacred date after a whole number of 293-year rotations.
 * Anniversary 1 is Sacred Year 294, Month 1, Day 1.
 */
export function sacredRotationAnniversary(anniversary: number): CalendarDate {
  assertInteger(anniversary, "Rotation anniversary");
  if (anniversary < 1) {
    throw new RangeError("Rotation anniversary must be 1 or later.");
  }

  return {
    year: anniversary * SACRED_ROTATION_YEARS + 1,
    month: 1,
    day: 1,
  };
}

function sacredMonthIndex(date: CalendarDate): number {
  return (date.year - 1) * SACRED_MONTHS_PER_YEAR + date.month - 1;
}

function sacredMonthFromIndex(index: number): CalendarDate {
  return {
    year: floorDiv(index, SACRED_MONTHS_PER_YEAR) + 1,
    month: mod(index, SACRED_MONTHS_PER_YEAR) + 1,
    day: 1,
  };
}

function meanMoonOffsetAtMonthIndex(index: number): MoonMonthAlignment {
  const sacred = sacredMonthFromIndex(index);
  const fixed = fixedFromSacred(sacred);
  const lunation = Math.round(
    (fixed - MEAN_NEW_MOON_REFERENCE_FIXED) / MEAN_SYNODIC_MONTH_DAYS,
  );
  const meanNewMoonFixed =
    MEAN_NEW_MOON_REFERENCE_FIXED + lunation * MEAN_SYNODIC_MONTH_DAYS;

  return {
    sacred,
    fixed,
    meanNewMoonFixed,
    offsetHours: (fixed - meanNewMoonFixed) * 24,
  };
}

/**
 * Returns an approximate lunar alignment when this Sacred month boundary is
 * the closest boundary to a mean new moon in the local 28-day sequence.
 */
export function moonAlignmentAtSacredMonth(
  sacredDate: CalendarDate,
): MoonMonthAlignment | null {
  validateDate("sacred", sacredDate);
  const index = sacredMonthIndex({ ...sacredDate, day: 1 });
  if (index < 1) return null;

  const previous = meanMoonOffsetAtMonthIndex(index - 1);
  const current = meanMoonOffsetAtMonthIndex(index);
  const next = meanMoonOffsetAtMonthIndex(index + 1);
  const currentDistance = Math.abs(current.offsetHours);

  return currentDistance <= Math.abs(previous.offsetHours) &&
    currentDistance < Math.abs(next.offsetHours)
    ? current
    : null;
}

/**
 * Finds approximate Sacred-month/new-moon alignments around a fixed date.
 * The result contains the requested past events followed by future events.
 */
export function moonAlignmentsAround(
  fixed: number,
  pastCount = 5,
  futureCount = 5,
): MoonMonthAlignment[] {
  assertInteger(fixed, "Fixed day");
  const center = sacredFromFixed(fixed);
  const centerIndex = sacredMonthIndex(center);
  const searchStart = Math.max(1, centerIndex - 180);
  const searchEnd = centerIndex + 180;
  const events: MoonMonthAlignment[] = [];

  for (let index = searchStart; index <= searchEnd; index++) {
    const candidate = moonAlignmentAtSacredMonth(sacredMonthFromIndex(index));
    if (candidate) events.push(candidate);
  }

  const past = events.filter((event) => event.fixed <= fixed).slice(-pastCount);
  const future = events.filter((event) => event.fixed > fixed).slice(0, futureCount);
  return [...past, ...future];
}

/**
 * Lists mean new-moon instants whose UTC dates fall within an inclusive
 * fixed-day range. This is a mean-phase model, not an observed moon forecast.
 */
export function meanNewMoonsBetween(
  startFixed: number,
  endFixed: number,
): MeanNewMoon[] {
  assertInteger(startFixed, "Start fixed day");
  assertInteger(endFixed, "End fixed day");
  if (endFixed < startFixed) {
    throw new RangeError("End fixed day must not be earlier than start fixed day.");
  }

  const firstLunation = Math.ceil(
    (startFixed - MEAN_NEW_MOON_REFERENCE_FIXED) / MEAN_SYNODIC_MONTH_DAYS,
  );
  const events: MeanNewMoon[] = [];

  for (let lunation = firstLunation; ; lunation++) {
    const meanNewMoonFixed =
      MEAN_NEW_MOON_REFERENCE_FIXED + lunation * MEAN_SYNODIC_MONTH_DAYS;
    if (meanNewMoonFixed >= endFixed + 1) break;

    const fixed = Math.floor(meanNewMoonFixed);
    if (fixed >= startFixed && fixed <= endFixed) {
      events.push({ fixed, meanNewMoonFixed });
    }
  }

  return events;
}

export function maxDayForDate(
  kind: CalendarKind,
  year: number,
  month: number,
  leapMonth = false,
): number {
  switch (kind) {
    case "sacred":
      return 28;
    case "hebrew":
      return hebrewMonthDays(year, month);
    case "gregorian":
      return gregorianMonthDays(year, month);
    case "julian":
      return julianMonthDays(year, month);
    case "islamic":
      return islamicMonthDays(year, month);
    case "chinese": {
      const info = chineseMonthsInYear(year).find(
        (candidate) =>
          candidate.month === month &&
          candidate.leapMonth === leapMonth,
      );
      if (!info) throw new RangeError("That Chinese month does not exist in this year.");
      return info.days;
    }
    case "saka":
      if (month === 1) return isGregorianLeapYear(year + 78) ? 31 : 30;
      return month >= 2 && month <= 6 ? 31 : 30;
    case "buddhist":
      return gregorianMonthDays(year - 543, month);
  }
}

export function validateDate(kind: CalendarKind, date: CalendarDate): void {
  const { year, month, day } = date;
  assertInteger(year, "Year");
  assertInteger(month, "Month");
  assertInteger(day, "Day");

  if (
    (kind === "sacred" ||
      kind === "hebrew" ||
      kind === "chinese" ||
      kind === "saka" ||
      kind === "buddhist") &&
    year < 1
  ) {
    throw new RangeError(`${kind} year must be 1 or later.`);
  }
  if ((kind === "gregorian" || kind === "julian") && year === 0) {
    // Astronomical year zero is supported internally and represents 1 BCE.
  }

  const maxMonth =
    kind === "sacred" ? 13 : kind === "hebrew" ? hebrewYearMonths(year) : 12;
  if (month < 1 || month > maxMonth) {
    throw new RangeError(`Month must be between 1 and ${maxMonth}.`);
  }

  const maxDay = maxDayForDate(kind, year, month, Boolean(date.leapMonth));
  if (day < 1 || day > maxDay) {
    throw new RangeError(`Day must be between 1 and ${maxDay}.`);
  }
}
