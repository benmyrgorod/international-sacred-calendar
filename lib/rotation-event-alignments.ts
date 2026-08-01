import {
  SACRED_DAYS_PER_YEAR,
  fixedFromDate,
  fixedFromSacred,
  sacredRotationAnniversary,
} from "./sacred-calendar.ts";

export const NEAR_ROTATION_ALIGNMENT_YEARS = 33;

export interface RotationAlignmentProximity {
  alignmentNumber: number;
  alignmentFixed: number;
  offsetDays: number;
  offsetSacredYears: number;
  isNear: boolean;
}

export const FEATURED_ALIGNMENT_EVENT_IDS = [
  "great-pyramid",
  "covenant-circumcision",
  "isaac-born",
  "first-temple-work",
  "second-temple-destroyed",
  "hijra",
  "magna-carta",
  "columbus-americas",
  "us-declaration",
  "french-revolution",
] as const;

export type FeaturedAlignmentEventId =
  (typeof FEATURED_ALIGNMENT_EVENT_IDS)[number];

export function nearestRotationAlignment(
  startFixed: number,
  endFixed = startFixed,
  maximumAlignment = 20,
): RotationAlignmentProximity {
  if (!Number.isInteger(startFixed) || !Number.isInteger(endFixed)) {
    throw new RangeError("Historical fixed days must be integers.");
  }
  if (endFixed < startFixed) {
    throw new RangeError("Historical range must end on or after it starts.");
  }

  const midpoint = (startFixed + endFixed) / 2;
  let closest: RotationAlignmentProximity | null = null;

  for (let alignmentNumber = 1; alignmentNumber <= maximumAlignment; alignmentNumber++) {
    const alignmentFixed = fixedFromSacred(
      sacredRotationAnniversary(alignmentNumber),
    );
    const offsetDays = midpoint - alignmentFixed;
    const candidate: RotationAlignmentProximity = {
      alignmentNumber,
      alignmentFixed,
      offsetDays,
      offsetSacredYears: offsetDays / SACRED_DAYS_PER_YEAR,
      isNear:
        Math.abs(offsetDays) <=
        NEAR_ROTATION_ALIGNMENT_YEARS * SACRED_DAYS_PER_YEAR,
    };

    if (!closest || Math.abs(candidate.offsetDays) < Math.abs(closest.offsetDays)) {
      closest = candidate;
    }
  }

  if (!closest) throw new RangeError("At least one alignment is required.");
  return closest;
}

export const EGYPT_SOJOURN_MIDPOINT = (() => {
  const arrivalStart = fixedFromDate("hebrew", {
    year: 2238,
    month: 7,
    day: 1,
  });
  const exodus = fixedFromDate("hebrew", {
    year: 2448,
    month: 1,
    day: 15,
  });
  const fixed = Math.round((arrivalStart + exodus) / 2);
  return {
    fixed,
    proximity: nearestRotationAlignment(fixed),
  };
})();

export const MAINSTREAM_BABYLONIAN_EXILE = (() => {
  const startFixed = fixedFromDate("gregorian", {
    year: -586,
    month: 1,
    day: 1,
  });
  const endFixed = fixedFromDate("gregorian", {
    year: -539,
    month: 12,
    day: 31,
  });
  const alignmentNumber = 11;
  const alignmentFixed = fixedFromSacred(
    sacredRotationAnniversary(alignmentNumber),
  );

  return {
    startFixed,
    endFixed,
    alignmentNumber,
    alignmentFixed,
    containsAlignment:
      alignmentFixed >= startFixed && alignmentFixed <= endFixed,
  };
})();
