# International Sacred Calendar

URL: https://sacredcal.one

## A personal coincidence

I discovered the International Sacred Calendar on **July 27, 2026**—one day
before my 40th birthday according to this calendar. I found the timing
personally meaningful and felt encouraged to continue researching its
mathematical, historical, and spiritual patterns.

## The 293-year alignment cycle

A Sacred year contains exactly 364 days. A cycle of 293 Sacred years is
remarkably close to 292 mean Hebrew years:

```text
293 Sacred years × 364 days       = 106,652 days
292 mean Hebrew years × 365.246822 = 106,652.072 days
```

The two spans differ by only about **one hour and forty-four minutes**. Several
important religious and historical events occurred on or close to these
293-year alignment boundaries:

| Alignment | Event | Position relative to the alignment |
| ---: | --- | --- |
| #4 | Completion of the Great Pyramid of Giza | approximately 32 Sacred years after |
| #7 | Covenant of circumcision with Abraham | approximately 1.6 Sacred years after |
| #7 | Birth of Isaac | approximately 2.6 Sacred years after |
| #8 | Midpoint of Israel’s traditional period in Egypt | approximately 5.3 Sacred years after |
| #10 | Beginning of construction of the First Temple | approximately 6.6 Sacred years after |
| #11 | Babylonian exile | the alignment falls within the commonly accepted 586–539 BCE exile period |
| #13 | Destruction of the Second Temple | approximately 32 Sacred years after |
| #15 | The Hijra and beginning of the Islamic calendar | approximately 312 days after |
| #17 | Sealing of Magna Carta | approximately 9.8 Sacred years after |
| #18 | Columbus’s arrival in the Americas | approximately 4.9 Sacred years before |
| #19 | United States Declaration of Independence | approximately 13.2 Sacred years before |
| #19 | Storming of the Bastille and the French Revolution | approximately 62 days before |

I do not suggest that the cycle caused these events. Rather, the alignments
seem to highlight important moments in religious and world history, making the
pattern an interesting subject for further study.

## Lunar alignments and Monday

The calendar also identifies recurring occasions when the beginning of a
28-day Sacred month closely approaches the mean new moon. Because every Sacred
month begins on Monday, all of these lunar-alignment dates occur on Monday—the
weekday traditionally associated with the Moon.

The calendar itself also begins on Monday, corresponding to 25 Elul AM 1 when
the rules of the modern fixed Hebrew calendar are mathematically extended
backward toward Creation week. This mathematical result is kept distinct from
the religious tradition that describes Creation week as beginning on Sunday.

I warmly invite you to explore the calendar, its date converter, historical
chronology, solar cycle, and lunar alignments. I would be very grateful for
your thoughts—especially regarding the traditional chronology and any
interpretations that should be corrected or refined.

## Website and library

An interactive multilingual web converter and standalone TypeScript calendar
module for:

- International Sacred Calendar
- Hebrew Calendar
- Gregorian civil calendar
- Julian civil calendar
- Muslim (tabular Islamic) Calendar
- Chinese Traditional Calendar, including leap months
- Indian National Calendar (standardized Saka solar calendar)
- Thai Buddhist Calendar (B.E.)

The converter accepts any of the eight calendars as its source and any other as
its destination. It also shows the uninterrupted weekday and the current
position in the International Sacred Calendar's long rotation. The selected date
is kept as a device-local preference, so returning to the page restores the last
date instead of resetting to today. It is restored as a Gregorian date, and an
unreadable or out-of-range stored value falls back to the built-in date.

The page includes English, Hebrew, Arabic, Italian, Greek, Russian, Simplified
Chinese, Hindi, Spanish, French, Japanese, and Korean. Only Simplified Chinese
is offered. Hebrew and Arabic switch the complete interface to right-to-left
layout. The selected language is stored as a device-local preference.
Chronology event titles, major-holiday names, and international-holiday names
are localized in every interface language.

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
the first date onto Sunday. This keeps every supported conversion on the same
uninterrupted seven-day week.

The religious tradition describes Creation Week as beginning on Sunday, while
the proleptic arithmetic Hebrew calendar's postponement rules yield Monday for
the fixed 25 Elul AM 1 calculation. The converter deliberately preserves the
calculated Hebrew result, as requested. This implementation therefore uses
Monday for conversion consistency; it does **not** claim that Jewish tradition
assigns the first day of Creation to Monday.

References for the traditional Creation-week date:

- [Chabad: Creation](https://www.chabad.org/calendar/view/day_cdo/aid/156820/jewish/Creation.htm)
- [TheTorah.com: When did we begin counting from Creation?](https://www.thetorah.com/article/the-calendar-when-did-we-begin-counting-from-creation)

## Rotation calculation and implementation

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
through 22:

- 1st anniversary: Sacred Year 294, Month 1, Day 1
- 2nd anniversary: Sacred Year 587, Month 1, Day 1
- 20th anniversary: Sacred Year 5861, Month 1, Day 1
- 21st anniversary: Sacred Year 6154, Month 1, Day 1
- 22nd anniversary: Sacred Year 6447, Month 1, Day 1

The web page lists the equivalent Hebrew, Gregorian, Julian, and tabular
Islamic dates for all 22 milestones. Clicking a milestone opens its month in
the calendar grid. The 20th-anniversary countdown is recalculated from the date
currently selected in the converter and reports complete International Sacred
years plus the remaining days.

The table also includes a symbolic Cosmic week sequence. Alignments #1 through
#7 are Monday through Sunday of **Cosmic Week 1**; #8 starts **Cosmic Week 2**
on Monday. Thus #1 is Monday, Week 1; #2 is Tuesday, Week 1; #7 is Sunday,
Week 1; and #8 is Monday, Week 2. This symbolic sequence is separate from the
calculated civil weekday column. Because each International Sacred year
contains exactly 52 weeks, every actual 293-year anniversary boundary remains
a Monday in the civil-week calculation.

### Historical events near rotation boundaries

The rotation section also compares the 293-year boundaries with dated events
from the 80-event chronology. A signed offset is calculated from the event's
fixed-day midpoint: negative values are before the boundary and positive
values are after it. Events within 33 International Sacred years of their
nearest boundary receive a highlighted marker in the chronology and calendar
grid. Twelve illustrated event cards connect the featured comparisons directly
to their matching chronology entries.

The chronology also calculates the midpoint between each pair of 293-year
boundaries. Events within the same 33-ISC-year proximity window of these
146.5-year half-cycle marks receive a separate sapphire highlight and a
numbered half-cycle marker such as 14.5. This visual comparison is distinct
from the gold full-cycle alignment highlight.

Two interval annotations are kept separate from the 80 dated events. The
Egypt card is a calculated midpoint between Jacob's family entering Egypt and
the Exodus in traditional Hebrew chronology. The Babylonian-exile card uses
the mainstream 586–539 BCE interval to show that Alignment 11 falls within
that period, while the main chronology continues to use traditional Hebrew
dating. Calendar proximity is presented as a pattern for exploration, not as
evidence that the rotation caused an event.

### Cosmic time scale

The Cosmic time infographic treats one complete 293-ISC-year rotation as one
Cosmic Day. Since each ISC year has 364 days, one Cosmic Day contains 106,652
civil days. Dividing it like a 24-hour clock gives:

- 1 Cosmic Hour = 293 / 24 ISC years = 4,443 days and 20 hours;
- 1 Cosmic Minute = 293 / 1,440 ISC years = 74 days, 1 hour, and 32 minutes;
- 1 Cosmic Second = 293 / 86,400 ISC years = 1 day, 5 hours, 37 minutes, and
  32 seconds.

For compact display, the infographic also decomposes long durations using a
**365-day common year**:

- 1 Cosmic Day = 292 common years and 72 days;
- 1 Cosmic Hour = 12 common years, 63 days, and 20 hours;
- 1 Cosmic Minute = 74 days, 1 hour, and 32 minutes;
- 1 Cosmic Second = 1 day, 5 hours, 37 minutes, and 32 seconds.

This `365-day year` is only a readable duration unit; it is not a mean
Gregorian, Hebrew, or astronomical year.

The selected Cosmic Date is measured from the ISC epoch. Each completed
293-year interval is one Cosmic Day. Seven consecutive Cosmic Days form one
Cosmic Week: Days #1–#7 make Week 1, Days #8–#14 make Week 2, and so on. The
date editor therefore accepts both the Cosmic Week and the Monday-through-
Sunday Cosmic Day, while hour, minute, and second locate the selected date
proportionally within that 293-year day. A switch chooses whether the card reads
the selected converter date or the current date; applying edited values always
updates the main source date to the nearest civil day and returns the card to
that selected date. Three decimal places on Cosmic Seconds preserve civil-day
round trips. This is a proportional calendar model, not an astronomical time
standard.

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
- a secondary date from the selected converter source calendar in every day
  cell (Gregorian by default);
- approximate mean new-moon dates;
- approximate mean full-moon dates;
- approximate moon/month-start alignments;
- major holidays from the selected grid calendar;
- international holidays and observances on their Gregorian anniversaries;
- annual anniversaries of all 80 chronology events on their International
  Sacred month/day;
- 293-year half-cycle anniversaries every 146.5 ISC years;
- 293-year rotation anniversaries.

The week-start selector supports Monday or Sunday. Monday is selected by
default, matching the calculated weekday of International Sacred Month 1 Day
1. The optional Sunday-first view includes an empty Sunday cell before Day 1.
The grid-calendar selector stays synchronized with the converter’s **From**
calendar, so changing either control updates both while preserving the selected
fixed date.

The 80 chronology events are carried forward on their ISC month and day in
every later Sacred year. The grid labels the original event separately;
Anniversary #1 is exactly 364 days later, Anniversary #2 is another 364 days
later, and so on. These event markers remain visible when the grid’s secondary
dates are switched to Hebrew, Gregorian, Julian, Muslim, Chinese, Saka,
Buddhist, or ISC.
Only the secondary date label changes—the anniversary remains anchored to the
same fixed day in the 364-day Sacred cycle. For year- or month-range events,
the recurrence uses the first day of the documented range and keeps the
approximation marker visible.

The sapphire half-cycle marker identifies the midpoint between successive
293-year boundaries. These marks are numbered `0.5`, `1.5`, `2.5`, and so on.
Because half of 293 ISC years is 146 years plus 182 days, every half-cycle mark
falls on ISC Month 7, Day 15: `ISC 147 · 07 · 15` for 0.5, then
`ISC 440 · 07 · 15` for 1.5, continuing every 293 ISC years.

Holiday markers follow the selected calendar: Jewish holidays for Hebrew,
Western Christian holidays for Gregorian, Russian Orthodox holidays calculated
on the Julian calendar, major Muslim holidays for the tabular Islamic calendar,
traditional Chinese festivals, Saka New Year, and Songkran (Thai New Year).
The grid marks the principal day of multi-day observances. Islamic
observational dates and local practices can differ from the arithmetic dates
shown here.

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

## Planetary hour correspondence

The planetary-hours section follows the supplied Talmudic chart. Each weekday
is ruled by one of seven traditional celestial bodies:

| Day | Ruler |
| --- | --- |
| Sunday | Sun ☉ |
| Monday | Moon ☽ |
| Tuesday | Mars ♂ |
| Wednesday | Mercury ☿ |
| Thursday | Jupiter ♃ |
| Friday | Venus ♀ |
| Saturday | Saturn ♄ |

The hourly sequence repeats continuously as Saturn → Jupiter → Mars → Sun →
Venus → Mercury → Moon. The first hour after local sunrise takes the ruler of
that weekday. Daylight and darkness are each divided into twelve equal parts,
so a planetary hour is generally not sixty clock minutes. Enter local sunrise,
sunset, and clock time in the calculator, and choose whether the weekday comes
from the selected converter date or from the current date. These correspondences
are traditional and symbolic, not a scientific prediction.

## Eighty major events

The separate world-chronology section lists exactly 80 dates from the first day
of Creation through the discovery of the International Sacred Calendar. It can
be searched or filtered by Hebrew chronology, civilizations, freedom and
ideas, science, the modern world, or dates with special symbolism. Expanding an
event shows its date or date range in every supported calendar; its action
jumps directly to the matching ISC calendar-grid marker.
Each event’s ISC month/day also repeats annually on the grid with a running
anniversary count, regardless of which supported calendar is selected for the
grid’s secondary date labels.
All 80 event titles use stable event IDs for localization so sorting the
chronology cannot associate a translated title with the wrong date.

Biblical milestones follow traditional Hebrew chronology. Exact dates remain
exact, while events known only by a month or year convert to a full fixed-day
range. For those ranges, the calendar grid places a visibly approximate marker
on the first day rather than inventing historical day precision. Secular events
retain their stated historical civil calendar, including Julian dates where
appropriate. Each entry identifies its reference collection and notes major
chronology disagreements, including the traditional and academic dating of the
First Temple's destruction.

Dates shown in calendars that were not historically used at the time are
proleptic mathematical equivalents. They make cross-calendar comparison
possible but do not claim that a historical community recorded the event in
that calendar.

Several entries also explain why the date itself became symbolic—for example,
the eleventh hour of 11 November 1918, Earth Day, Pi Day, Human Rights Day, and
the Beijing opening ceremony at 8:08 p.m. on 8/8/08.

Chronology data and fixed-day ranges are provided by
[`lib/historical-events.ts`](./lib/historical-events.ts).
Rotation proximity calculations and the featured illustrated comparisons are
provided by
[`lib/rotation-event-alignments.ts`](./lib/rotation-event-alignments.ts).

## Calendar conventions

- **Hebrew:** arithmetic Hebrew calendar with its 19-year leap cycle and
  postponement rules.
- **Gregorian:** the standard proleptic Gregorian civil calendar.
- **Julian:** the proleptic Julian civil calendar, including its every-fourth-
  year leap rule. Dates use CE/BCE notation in the interface.
- **Muslim:** tabular Islamic calendar. Dates before 1 AH are shown as BH
  (Before Hijra). Observational or local religious dates may differ by one day.
- **Chinese Traditional:** lunisolar dates use the runtime’s standardized
  Chinese calendar data and explicitly distinguish leap months.
- **Indian National (Saka):** the standardized Indian National solar calendar, with
  Chaitra beginning on 21 or 22 March. This is not one of the many regional
  Hindu lunar calendars, whose month rules vary by tradition and location.
- **Thai Buddhist:** the Thai solar Buddhist Era calendar. It shares its
  month/day structure with the Gregorian calendar, but the interface uses Thai
  month names and Buddhist Era year numbering so Buddhist dates remain clearly
  identified.
- **Weekday:** all calendars pass through one integer fixed-day count, where
  Gregorian 1 January 1 CE is fixed day 1, a Monday.

## Install and offline use

The site is a progressive web app. It can be installed from the browser and then
runs from the home screen or the desktop in its own standalone window. Every
conversion, the calendar grid, the chronology, the lunar approximations, and the
planetary-hour calculator are computed in the browser, so the installed app keeps
working without a network connection.

- [`public/site.webmanifest`](./public/site.webmanifest) declares the app
  identity, `standalone` display, brand colours, the 192 px and 512 px icons, a
  512 px maskable icon, and shortcuts to the converter, the calendar grid, the
  planetary hours, and the chronology.
- [`public/sw.js`](./public/sw.js) is the service worker. It precaches the app
  shell and icons, serves hashed build output from the cache, revalidates other
  assets in the background, and answers navigations from the network first and
  from the cached shell when offline. Every cache name carries `CACHE_VERSION`;
  bump it whenever the caching rules or the precache list change, and the
  previous version's caches are deleted on activation.
- [`app/service-worker.tsx`](./app/service-worker.tsx) registers the worker in
  production builds only, so local development never serves cached output. On a
  first visit it also hands the new worker the assets the page already loaded,
  which makes the site usable offline immediately rather than one visit later.

To retire the worker on a deployed site, replace `public/sw.js` with one that
calls `self.registration.unregister()` and clears `caches`; browsers keep the
last worker they saw until a new script replaces it.

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
- `fixedFromChinese` / `chineseFromFixed`
- `fixedFromSaka` / `sakaFromFixed`
- `fixedFromBuddhist` / `buddhistFromFixed`
- `convertDate`
- `sacredRotation`
- `sacredRotationAnniversary`
- `sacredRotationHalfAnniversary`
- `moonAlignmentAtSacredMonth`
- `moonAlignmentsAround`
- `meanNewMoonsBetween`
- `meanFullMoonsBetween`
- `majorHolidaysBetween`
- `majorHolidaySymbol` (calendar-specific holiday marker used by the legend and grid)
- `internationalHolidaysBetween`
- `planetForPlanetaryHour`
- `calculatePlanetaryHour`
- `historicalEventRange`
- `historicalEventSacredAnniversary`
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
