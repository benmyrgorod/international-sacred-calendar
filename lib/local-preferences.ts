export const PLANETARY_SUNRISE_STORAGE_KEY = "isc-planetary-sunrise";
export const PLANETARY_SUNSET_STORAGE_KEY = "isc-planetary-sunset";
export const SELECTED_DATE_STORAGE_KEY = "isc-selected-fixed-day";

const TIME_VALUE_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

// Roughly ±27,000 years around the Gregorian epoch; wide enough for every date
// the converter can produce and narrow enough to reject nonsense storage values.
const FIXED_DAY_LIMIT = 10_000_000;

export function normalizeTimePreference(
  value: string | null,
  fallback: string,
): string {
  return value !== null && TIME_VALUE_PATTERN.test(value) ? value : fallback;
}

export function isValidTimePreference(value: string): boolean {
  return TIME_VALUE_PATTERN.test(value);
}

export function normalizeFixedDayPreference(
  value: string | null,
  fallback: number,
): number {
  if (value === null || !/^-?\d{1,9}$/.test(value)) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return fallback;
  if (Math.abs(parsed) > FIXED_DAY_LIMIT) return fallback;
  return parsed;
}

export function formatLocalTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}
