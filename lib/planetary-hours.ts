export type PlanetId =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn";

export interface PlanetDefinition {
  id: PlanetId;
  name: string;
  symbol: string;
}

export interface PlanetaryHourResult {
  planet: PlanetDefinition;
  dayRuler: PlanetDefinition;
  period: "day" | "night";
  hour: number;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  rulingWeekdayIndex: number;
}

export const PLANETS: Record<PlanetId, PlanetDefinition> = {
  sun: { id: "sun", name: "Sun", symbol: "☉" },
  moon: { id: "moon", name: "Moon", symbol: "☽" },
  mercury: { id: "mercury", name: "Mercury", symbol: "☿" },
  venus: { id: "venus", name: "Venus", symbol: "♀" },
  mars: { id: "mars", name: "Mars", symbol: "♂" },
  jupiter: { id: "jupiter", name: "Jupiter", symbol: "♃" },
  saturn: { id: "saturn", name: "Saturn", symbol: "♄" },
};

export const PLANETARY_SEQUENCE: PlanetId[] = [
  "saturn",
  "jupiter",
  "mars",
  "sun",
  "venus",
  "mercury",
  "moon",
];

// Weekday indices follow the calendar library: Monday = 0, Sunday = 6.
export const WEEKDAY_RULERS: PlanetId[] = [
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
  "sun",
];

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function parseClockTime(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) throw new RangeError("Time must use HH:MM format.");
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new RangeError("Time must be a valid local clock time.");
  }
  return hours * 60 + minutes;
}

export function formatClockMinutes(value: number): string {
  const normalized = mod(Math.round(value), 24 * 60);
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(
    normalized % 60,
  ).padStart(2, "0")}`;
}

export function planetForPlanetaryHour(
  weekdayIndex: number,
  hour: number,
): PlanetDefinition {
  if (!Number.isInteger(weekdayIndex) || weekdayIndex < 0 || weekdayIndex > 6) {
    throw new RangeError("Weekday index must be between 0 and 6.");
  }
  if (!Number.isInteger(hour) || hour < 1 || hour > 24) {
    throw new RangeError("Planetary hour must be between 1 and 24.");
  }

  const dayRuler = WEEKDAY_RULERS[weekdayIndex];
  const startIndex = PLANETARY_SEQUENCE.indexOf(dayRuler);
  return PLANETS[PLANETARY_SEQUENCE[mod(startIndex + hour - 1, 7)]];
}

export function calculatePlanetaryHour(
  weekdayIndex: number,
  sunriseValue: string,
  sunsetValue: string,
  timeValue: string,
): PlanetaryHourResult {
  const sunrise = parseClockTime(sunriseValue);
  const sunset = parseClockTime(sunsetValue);
  const time = parseClockTime(timeValue);
  if (sunrise >= sunset) {
    throw new RangeError("Sunrise must be earlier than sunset.");
  }

  const daylightDuration = sunset - sunrise;
  const nightDuration = 24 * 60 - daylightDuration;
  let rulingWeekdayIndex = weekdayIndex;
  let period: "day" | "night";
  let hour: number;
  let startMinutes: number;
  let endMinutes: number;
  let durationMinutes: number;
  let sequenceHour: number;

  if (time >= sunrise && time < sunset) {
    period = "day";
    durationMinutes = daylightDuration / 12;
    hour = Math.min(12, Math.floor((time - sunrise) / durationMinutes) + 1);
    startMinutes = sunrise + (hour - 1) * durationMinutes;
    endMinutes = sunrise + hour * durationMinutes;
    sequenceHour = hour;
  } else {
    period = "night";
    durationMinutes = nightDuration / 12;
    const elapsed =
      time >= sunset ? time - sunset : time + 24 * 60 - sunset;
    if (time < sunrise) rulingWeekdayIndex = mod(weekdayIndex - 1, 7);
    hour = Math.min(12, Math.floor(elapsed / durationMinutes) + 1);
    startMinutes = sunset + (hour - 1) * durationMinutes;
    endMinutes = sunset + hour * durationMinutes;
    sequenceHour = 12 + hour;
  }

  return {
    planet: planetForPlanetaryHour(rulingWeekdayIndex, sequenceHour),
    dayRuler: PLANETS[WEEKDAY_RULERS[rulingWeekdayIndex]],
    period,
    hour,
    startMinutes,
    endMinutes,
    durationMinutes,
    rulingWeekdayIndex,
  };
}
