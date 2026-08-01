export const PLANETARY_SUNRISE_STORAGE_KEY = "isc-planetary-sunrise";
export const PLANETARY_SUNSET_STORAGE_KEY = "isc-planetary-sunset";

const TIME_VALUE_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function normalizeTimePreference(
  value: string | null,
  fallback: string,
): string {
  return value !== null && TIME_VALUE_PATTERN.test(value) ? value : fallback;
}

export function isValidTimePreference(value: string): boolean {
  return TIME_VALUE_PATTERN.test(value);
}

export function formatLocalTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}
