# Sacred Calendar

An interactive web converter and standalone TypeScript calendar module for:

- Sacred Calendar
- Hebrew Calendar
- Gregorian civil calendar
- Muslim (tabular Islamic) Calendar

The converter accepts any of the four calendars as its source and any other as
its destination. It also shows the uninterrupted weekday and the current
position in the Sacred Calendar's long rotation.

## Sacred Calendar definition

The Sacred Calendar follows the week-based calendar shown in the supplied
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

Sacred `Year 1 · Month 1 · Day 1` is anchored to **25 Elul AM 1**, the
traditional first day of Creation. This is five days before 1 Tishrei AM 2,
the traditional sixth day of Creation.

The module converts 25 Elul AM 1 with the arithmetic Hebrew calendar and uses
its actual fixed weekday. That calculated date is a **Monday**. The Sacred
Calendar therefore starts on Monday in this implementation; it does not force
the first date onto Sunday. This is what keeps Sacred, Hebrew, Gregorian, and
Islamic conversions on the same uninterrupted seven-day week.

The religious tradition describes Creation Week as beginning on Sunday, while
the proleptic arithmetic Hebrew calendar's postponement rules yield Monday for
the fixed 25 Elul AM 1 calculation. The converter deliberately preserves the
calculated Hebrew result, as requested.

References for the traditional Creation-week date:

- [Chabad: Creation](https://www.chabad.org/calendar/view/day_cdo/aid/156820/jewish/Creation.htm)
- [TheTorah.com: When did we begin counting from Creation?](https://www.thetorah.com/article/the-calendar-when-did-we-begin-counting-from-creation)

## What the approximately 293-year rotation means

A Sacred year contains 364 days. A mean Hebrew year is approximately
365.246822 days. The Sacred year boundary therefore moves earlier by about
1.2468 days for each average Hebrew year.

The two counts nearly meet again at:

```text
293 Sacred years × 364 days        = 106,652 days
292 mean Hebrew years × 365.246822 = 106,652.072 days
```

After 292 average Hebrew years, 293 whole Sacred years have elapsed. Their year
boundaries are only about `0.072` day, or **1 hour 44 minutes**, apart.

This is a **year-boundary/date realignment**, not a weekday rotation. Sacred
weekdays do not rotate or break: 364 is always exactly 52 weeks. The
293-to-292 relationship is an approximation based on the mean Hebrew year;
individual Hebrew years vary between 353 and 385 days.

## Calendar conventions

- **Hebrew:** arithmetic Hebrew calendar with its 19-year leap cycle and
  postponement rules.
- **Gregorian:** the standard proleptic Gregorian civil calendar.
- **Muslim:** tabular Islamic calendar. Observational or local religious dates
  may differ by one day.
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
- `fixedFromIslamic` / `islamicFromFixed`
- `convertDate`
- `sacredRotation`
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

The tests cover known Hebrew, Gregorian, and Islamic anchor dates, round trips,
the Creation-week epoch, weekday reconciliation, the 293-year rotation, and
the server-rendered web page.
