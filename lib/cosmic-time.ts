import {
  SACRED_DAYS_PER_YEAR,
  SACRED_EPOCH_FIXED,
  SACRED_ROTATION_YEARS,
} from "./sacred-calendar.ts";

export const CIVIL_SECONDS_PER_DAY = 24 * 60 * 60;
export const COSMIC_DAY_CIVIL_DAYS =
  SACRED_ROTATION_YEARS * SACRED_DAYS_PER_YEAR;

export interface CosmicDate {
  week: number;
  weekdayIndex: number;
  hour: number;
  minute: number;
  second: number;
}

export interface CivilDuration {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function cosmicWeekdayIndex(alignmentNumber: number): number {
  if (!Number.isInteger(alignmentNumber)) {
    throw new RangeError("Cosmic alignment number must be an integer.");
  }
  return positiveModulo(alignmentNumber - 1, 7);
}

export function cosmicWeekNumber(alignmentNumber: number): number {
  if (!Number.isInteger(alignmentNumber)) {
    throw new RangeError("Cosmic alignment number must be an integer.");
  }
  return Math.floor((alignmentNumber - 1) / 7) + 1;
}

export function cosmicAlignmentNumber(
  week: number,
  weekdayIndex: number,
): number {
  if (!Number.isInteger(week)) {
    throw new RangeError("Cosmic Week must be an integer.");
  }
  if (
    !Number.isInteger(weekdayIndex) ||
    weekdayIndex < 0 ||
    weekdayIndex > 6
  ) {
    throw new RangeError("Cosmic Day must be from Monday through Sunday.");
  }
  return (week - 1) * 7 + weekdayIndex + 1;
}

export function cosmicDateFromFixed(fixed: number): CosmicDate {
  if (!Number.isInteger(fixed)) {
    throw new RangeError("Fixed day must be an integer.");
  }

  const elapsedCosmicDays =
    (fixed - SACRED_EPOCH_FIXED) / COSMIC_DAY_CIVIL_DAYS;
  const alignmentNumber = Math.floor(elapsedCosmicDays);
  const fraction = elapsedCosmicDays - alignmentNumber;
  const totalCosmicSeconds = fraction * 24 * 60 * 60;
  const hour = Math.floor(totalCosmicSeconds / 3600);
  const minute = Math.floor((totalCosmicSeconds - hour * 3600) / 60);
  const second = totalCosmicSeconds - hour * 3600 - minute * 60;

  return {
    week: cosmicWeekNumber(alignmentNumber),
    weekdayIndex: cosmicWeekdayIndex(alignmentNumber),
    hour,
    minute,
    second,
  };
}

export function fixedFromCosmicDate(
  cosmic: Pick<
    CosmicDate,
    "week" | "weekdayIndex" | "hour" | "minute" | "second"
  >,
): number {
  if (!Number.isInteger(cosmic.week)) {
    throw new RangeError("Cosmic Week must be an integer.");
  }
  const alignmentNumber = cosmicAlignmentNumber(
    cosmic.week,
    cosmic.weekdayIndex,
  );
  if (!Number.isInteger(cosmic.hour) || cosmic.hour < 0 || cosmic.hour > 23) {
    throw new RangeError("Cosmic Hour must be from 0 to 23.");
  }
  if (!Number.isInteger(cosmic.minute) || cosmic.minute < 0 || cosmic.minute > 59) {
    throw new RangeError("Cosmic Minute must be from 0 to 59.");
  }
  if (!Number.isFinite(cosmic.second) || cosmic.second < 0 || cosmic.second >= 60) {
    throw new RangeError("Cosmic Second must be from 0 up to 60.");
  }

  const fraction =
    (cosmic.hour * 3600 + cosmic.minute * 60 + cosmic.second) /
    CIVIL_SECONDS_PER_DAY;
  return Math.round(
    SACRED_EPOCH_FIXED +
      (alignmentNumber + fraction) * COSMIC_DAY_CIVIL_DAYS,
  );
}

export function cosmicUnitDuration(
  unitsPerCosmicDay: number,
): CivilDuration {
  if (!Number.isInteger(unitsPerCosmicDay) || unitsPerCosmicDay < 1) {
    throw new RangeError("Cosmic-day subdivisions must be positive integers.");
  }

  const totalSeconds =
    (COSMIC_DAY_CIVIL_DAYS * CIVIL_SECONDS_PER_DAY) /
    unitsPerCosmicDay;
  if (!Number.isInteger(totalSeconds)) {
    throw new RangeError("Cosmic unit does not resolve to whole civil seconds.");
  }

  const days = Math.floor(totalSeconds / CIVIL_SECONDS_PER_DAY);
  const afterDays = totalSeconds % CIVIL_SECONDS_PER_DAY;
  const hours = Math.floor(afterDays / 3600);
  const afterHours = afterDays % 3600;
  const minutes = Math.floor(afterHours / 60);
  const seconds = afterHours % 60;

  return { totalSeconds, days, hours, minutes, seconds };
}

export const COSMIC_HOUR_DURATION = cosmicUnitDuration(24);
export const COSMIC_MINUTE_DURATION = cosmicUnitDuration(24 * 60);
export const COSMIC_SECOND_DURATION = cosmicUnitDuration(24 * 60 * 60);
export const COSMIC_DAY_DURATION = cosmicUnitDuration(1);
