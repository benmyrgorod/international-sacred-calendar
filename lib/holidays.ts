import {
  dateFromFixed,
  fixedFromGregorian,
  fixedFromJulian,
  isHebrewLeapYear,
  type CalendarKind,
} from "./sacred-calendar.ts";

export interface MajorHoliday {
  id: string;
  name: string;
  fixed: number;
}

const INTERNATIONAL_HOLIDAYS = [
  { month: 1, day: 1, name: "New Year’s Day" },
  { month: 3, day: 8, name: "International Women’s Day" },
  { month: 4, day: 22, name: "Earth Day" },
  { month: 5, day: 1, name: "International Workers’ Day" },
  { month: 6, day: 5, name: "World Environment Day" },
  { month: 9, day: 21, name: "International Day of Peace" },
  { month: 10, day: 24, name: "United Nations Day" },
  { month: 12, day: 10, name: "Human Rights Day" },
] as const;

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function gregorianEasterFixed(year: number): number {
  const a = mod(year, 19);
  const b = Math.floor(year / 100);
  const c = mod(year, 100);
  const d = Math.floor(b / 4);
  const e = mod(b, 4);
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = mod(19 * a + b - d - g + 15, 30);
  const i = Math.floor(c / 4);
  const k = mod(c, 4);
  const l = mod(32 + 2 * e + 2 * i - h - k, 7);
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = mod(h + l - 7 * m + 114, 31) + 1;

  return fixedFromGregorian({ year, month, day });
}

function julianPaschaFixed(year: number): number {
  const goldenNumber = mod(year, 19);
  const epact = mod(19 * goldenNumber + 15, 30);
  const weekdayCorrection = mod(year + Math.floor(year / 4) + epact, 7);
  const offset = epact - weekdayCorrection;
  const month = 3 + Math.floor((offset + 40) / 44);
  const day = offset + 28 - 31 * Math.floor(month / 4);

  return fixedFromJulian({ year, month, day });
}

function hebrewHolidayNames(year: number, month: number, day: number): string[] {
  if (year < 1) return [];
  if (month === 7 && day === 1) return ["Rosh Hashanah"];
  if (month === 7 && day === 10) return ["Yom Kippur"];
  if (month === 7 && day === 15) return ["Sukkot"];
  if (month === 7 && day === 22) return ["Shemini Atzeret / Simchat Torah"];
  if (month === 9 && day === 25) return ["Hanukkah"];
  if (month === (isHebrewLeapYear(year) ? 13 : 12) && day === 14) {
    return ["Purim"];
  }
  if (month === 1 && day === 15) return ["Passover"];
  if (month === 3 && day === 6) return ["Shavuot"];
  return [];
}

function gregorianChristianHolidayNames(fixed: number, year: number): string[] {
  if (year < 1) return [];
  const easter = gregorianEasterFixed(year);
  const date = dateFromFixed("gregorian", fixed);
  const names: string[] = [];

  if (date.month === 1 && date.day === 6) names.push("Epiphany");
  if (date.month === 12 && date.day === 25) names.push("Christmas Day");
  if (fixed === easter - 7) names.push("Palm Sunday");
  if (fixed === easter - 2) names.push("Good Friday");
  if (fixed === easter) names.push("Easter Sunday");
  if (fixed === easter + 39) names.push("Ascension");
  if (fixed === easter + 49) names.push("Pentecost");
  return names;
}

function orthodoxHolidayNames(fixed: number, year: number): string[] {
  if (year < 1) return [];
  const pascha = julianPaschaFixed(year);
  const date = dateFromFixed("julian", fixed);
  const names: string[] = [];

  if (date.month === 1 && date.day === 6) names.push("Theophany");
  if (date.month === 3 && date.day === 25) names.push("Annunciation");
  if (date.month === 12 && date.day === 25) names.push("Nativity of Christ");
  if (fixed === pascha - 7) names.push("Palm Sunday (Orthodox)");
  if (fixed === pascha - 2) names.push("Great and Holy Friday");
  if (fixed === pascha) names.push("Pascha");
  if (fixed === pascha + 39) names.push("Ascension (Orthodox)");
  if (fixed === pascha + 49) names.push("Pentecost (Orthodox)");
  return names;
}

function islamicHolidayNames(year: number, month: number, day: number): string[] {
  if (year < 1) return [];
  if (month === 1 && day === 1) return ["Islamic New Year"];
  if (month === 1 && day === 10) return ["Ashura"];
  if (month === 3 && day === 12) return ["Mawlid"];
  if (month === 9 && day === 1) return ["Ramadan begins"];
  if (month === 9 && day === 27) return ["Laylat al-Qadr"];
  if (month === 10 && day === 1) return ["Eid al-Fitr"];
  if (month === 12 && day === 9) return ["Day of Arafah"];
  if (month === 12 && day === 10) return ["Eid al-Adha"];
  return [];
}

function chineseHolidayNames(
  month: number,
  day: number,
  leapMonth: boolean,
): string[] {
  if (leapMonth) return [];
  if (month === 1 && day === 1) return ["Chinese New Year"];
  if (month === 1 && day === 15) return ["Lantern Festival"];
  if (month === 5 && day === 5) return ["Dragon Boat Festival"];
  if (month === 8 && day === 15) return ["Mid-Autumn Festival"];
  if (month === 9 && day === 9) return ["Double Ninth Festival"];
  return [];
}

export function majorHolidaysBetween(
  kind: CalendarKind,
  startFixed: number,
  endFixed: number,
): MajorHoliday[] {
  if (!Number.isInteger(startFixed) || !Number.isInteger(endFixed)) {
    throw new TypeError("Holiday range must use integer fixed days.");
  }
  if (endFixed < startFixed) {
    throw new RangeError("Holiday range end must not precede its start.");
  }
  if (kind === "sacred") return [];

  const holidays: MajorHoliday[] = [];
  for (let fixed = startFixed; fixed <= endFixed; fixed++) {
    const date = dateFromFixed(kind, fixed);
    let names: string[];

    switch (kind) {
      case "hebrew":
        names = hebrewHolidayNames(date.year, date.month, date.day);
        break;
      case "gregorian":
        names = gregorianChristianHolidayNames(fixed, date.year);
        break;
      case "julian":
        names = orthodoxHolidayNames(fixed, date.year);
        break;
      case "islamic":
        names = islamicHolidayNames(date.year, date.month, date.day);
        break;
      case "chinese":
        names = chineseHolidayNames(
          date.month,
          date.day,
          Boolean(date.leapMonth),
        );
        break;
      case "saka":
        names = date.month === 1 && date.day === 1 ? ["Saka New Year"] : [];
        break;
      case "buddhist":
        names =
          date.month === 4 && date.day === 13
            ? ["Songkran (Thai New Year)"]
            : [];
        break;
    }

    names.forEach((name, index) => {
      holidays.push({
        id: `${kind}-${date.year}-${date.month}-${date.day}-${index}`,
        name,
        fixed,
      });
    });
  }

  return holidays;
}

export function internationalHolidaysBetween(
  startFixed: number,
  endFixed: number,
): MajorHoliday[] {
  if (!Number.isInteger(startFixed) || !Number.isInteger(endFixed)) {
    throw new TypeError("Holiday range must use integer fixed days.");
  }
  if (endFixed < startFixed) {
    throw new RangeError("Holiday range end must not precede its start.");
  }

  const holidays: MajorHoliday[] = [];
  for (let fixed = startFixed; fixed <= endFixed; fixed++) {
    const date = dateFromFixed("gregorian", fixed);
    const holiday = INTERNATIONAL_HOLIDAYS.find(
      (candidate) =>
        candidate.month === date.month && candidate.day === date.day,
    );
    if (holiday) {
      holidays.push({
        id: `international-${date.month}-${date.day}`,
        name: holiday.name,
        fixed,
      });
    }
  }

  return holidays;
}
