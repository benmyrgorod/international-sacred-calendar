# International Sacred Calendar

URL: https://sacredcal.one

An interactive multilingual web converter and standalone TypeScript calendar
module for:

- International Sacred Calendar
- Hebrew Calendar
- Gregorian civil calendar
- Julian civil calendar
- Muslim (tabular Islamic) Calendar

The converter accepts any of the five calendars as its source and any other as
its destination. It also shows the uninterrupted weekday and the current
position in the International Sacred Calendar's long rotation.

The page includes English, Hebrew, Arabic, Italian, Greek, Russian, Simplified
Chinese (Mandarin), Hindi, Spanish, French, and Japanese. Hebrew and Arabic
switch the complete interface to right-to-left layout. The selected language
is stored as a device-local preference.

## International Sacred Calendar definition

The International Sacred Calendar follows the week-based calendar shown in the supplied
definition:

- 13 equal months
- 28 days in every month
- 4 complete seven-day weeks in every month
- 364 days, or exactly 52 weeks, in every year
- no leap days and no days outside the week
- the same month/day always has the same weekday

It is a week-based calendar rather than a solar, lunar, or lunisolar calendar.
Because its year is shorter than a solar or Hebrew year, it drifts through the
seasons and against Hebrew dates.

## Creation-week epoch and weekday reconciliation

International Sacred `Year 1 · Month 1 · Day 1` is anchored to **25 Elul AM 1**, the
traditional first day of Creation. This is five days before 1 Tishrei AM 2,
the traditional sixth day of Creation.

The module converts 25 Elul AM 1 with the arithmetic Hebrew calendar and uses
its actual fixed weekday. That calculated date is a **Monday**. The Sacred
Calendar therefore starts on Monday in this implementation; it does not force
the first date onto Sunday. This is what keeps International Sacred, Hebrew,
Gregorian, Julian, and Islamic conversions on the same uninterrupted seven-day
week.

The religious tradition describes Creation Week as beginning on Sunday, while
the proleptic arithmetic Hebrew calendar's postponement rules yield Monday for
the fixed 25 Elul AM 1 calculation. The converter deliberately preserves the
calculated Hebrew result, as requested. This implementation therefore uses
Monday for conversion consistency; it does **not** claim that Jewish tradition
assigns the first day of Creation to Monday.

References for the traditional Creation-week date:

- [Chabad: Creation](https://www.chabad.org/calendar/view/day_cdo/aid/156820/jewish/Creation.htm)
- [TheTorah.com: When did we begin counting from Creation?](https://www.thetorah.com/article/the-calendar-when-did-we-begin-counting-from-creation)

## What the approximately 293-year rotation means

An International Sacred year contains 364 days. A mean Hebrew year is approximately
365.246822 days. The Sacred year boundary therefore moves earlier by about
1.2468 days for each average Hebrew year.

The two counts nearly meet again at:

```text
293 International Sacred years × 364 days = 106,652 days
292 mean Hebrew years × 365.246822 = 106,652.072 days
```

After 292 average Hebrew years, 293 whole International Sacred years have elapsed. Their year
boundaries are only about `0.072` day, or **1 hour 44 minutes**, apart.

This is a **year-boundary/date realignment**, not a weekday rotation. International Sacred
weekdays do not rotate or break: 364 is always exactly 52 weeks. The
293-to-292 relationship is an approximation based on the mean Hebrew year;
individual Hebrew years vary between 353 and 385 days.

### Rotation anniversaries

A rotation anniversary is the first day after a whole number of 293-year
International Sacred rotations. The site lists every anniversary from 1
through 20:

- 1st anniversary: Sacred Year 294, Month 1, Day 1
- 2nd anniversary: Sacred Year 587, Month 1, Day 1
- 20th anniversary: Sacred Year 5861, Month 1, Day 1

The web page lists the equivalent Hebrew, Gregorian, Julian, and tabular
Islamic dates for all 20 milestones. Clicking a milestone opens its month in
the calendar grid. The 20th-anniversary countdown is recalculated from the date
currently selected in the converter and reports complete International Sacred
years plus the remaining days.

## Approximate 1.48-year moon alignment

International Sacred months begin every 28 days. NASA gives the mean synodic
month—the phase cycle from new moon to new moon—as **29.53059 days**. The beat
period between those two intervals is:

```text
1 / |1/28 - 1/29.530588853| = 540.22 days ≈ 1.48 years
```

That supports the requested “about 1.5 years” recurrence: a Sacred month
boundary and the **mean** new moon return near one another about every 540
days. It is not a Hebrew-calendar synchronization rule, and it is not a
prediction of the exact observed new moon.

The library uses a mean-phase reference and finds the Sacred month boundary
closest to each mean new moon recurrence. The page lists five past and five
future alignments around the selected date, including the offset in hours.
True astronomical new moons vary, so these events are explicitly labeled as
approximations.

Reference:

- [NASA: Eclipses and the Moon's Orbit](https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html)

## Calendar grid

The 28-day grid displays one International Sacred month at a time. It marks:

- the currently selected date;
- approximate moon/month-start alignments;
- 293-year rotation anniversaries.

The week-start selector supports Monday or Sunday. Monday is selected by
default, matching the calculated weekday of International Sacred Month 1 Day
1. The optional Sunday-first view includes an empty Sunday cell before Day 1.

The prefix for International Sacred dates is **ISC**, for example
`ISC 5805 · 04 · 12`.

## Important dates

Two founding milestones are anchored to their Gregorian dates and then repeat
annually on the same International Sacred month and day:

- **27 July 2026 — Discovery of the International Sacred Calendar:**
  `ISC 5805 · 09 · 22`. Its first Sacred anniversary is
  `ISC 5806 · 09 · 22`, 364 days later.
- **28 July 2026 — 40th birthday of Ovadia Binyamin, discoverer of the Sacred
  Calendar:** `ISC 5805 · 09 · 23`. The next annual occurrence is his 41st
  Sacred-calendar birthday at `ISC 5806 · 09 · 23`.

The grid labels the original dates and every future annual occurrence. The
discovery marker shows its anniversary number, while the birthday marker shows
Ovadia Binyamin’s advancing age. Its legend also identifies approximate moon
alignments and 293-year rotation anniversaries.

## Calendar conventions

- **Hebrew:** arithmetic Hebrew calendar with its 19-year leap cycle and
  postponement rules.
- **Gregorian:** the standard proleptic Gregorian civil calendar.
- **Julian:** the proleptic Julian civil calendar, including its every-fourth-
  year leap rule. Dates use CE/BCE notation in the interface.
- **Muslim:** tabular Islamic calendar. Dates before 1 AH are shown as BH
  (Before Hijra). Observational or local religious dates may differ by one day.
- **Weekday:** all calendars pass through one integer fixed-day count, where
  Gregorian 1 January 1 CE is fixed day 1, a Monday.

## Library usage

The reusable module is [`lib/sacred-calendar.ts`](./lib/sacred-calendar.ts).
Every calendar converts through the same fixed-day representation.

```ts
import {
  convertDate,
  fixedFromSacred,
  sacredFromFixed,
  sacredRotation,
  weekdayFromFixed,
} from "./lib/sacred-calendar";

const sacred = convertDate(
  { year: 2026, month: 7, day: 29 },
  "gregorian",
  "sacred",
);

const fixed = fixedFromSacred(sacred);
const weekday = weekdayFromFixed(fixed);
const rotation = sacredRotation(sacred);

console.log({ sacred, weekday, rotation });
```

Public conversion helpers include:

- `fixedFromSacred` / `sacredFromFixed`
- `fixedFromHebrew` / `hebrewFromFixed`
- `fixedFromGregorian` / `gregorianFromFixed`
- `fixedFromJulian` / `julianFromFixed`
- `fixedFromIslamic` / `islamicFromFixed`
- `convertDate`
- `sacredRotation`
- `sacredRotationAnniversary`
- `moonAlignmentAtSacredMonth`
- `moonAlignmentsAround`
- `weekdayFromFixed`
- date validation and month-length helpers

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Validate

```bash
npm test
```

The tests cover known Hebrew, Gregorian, Julian, and Islamic anchor dates,
round trips, the Creation-week epoch, weekday reconciliation, the 293-year
rotation, and the server-rendered web page.
