# International Sacred Calendar agent guide

## Project purpose

This repository builds the International Sacred Calendar website and its
reusable calendar-conversion libraries. Preserve the exact product name
“International Sacred Calendar” and the abbreviation `ISC`. “Gregorian” is the
correct calendar name; never change it to “Georgian.”

## Calendar model

- All conversions pass through an integer fixed-day count. Fixed day 1 is
  Gregorian 1 January 1 CE, a Monday.
- The core implementation is `lib/sacred-calendar.ts`.
- Supported calendars are ISC, Hebrew, Gregorian, Julian, tabular Islamic,
  Chinese Traditional, Indian National (Saka), and Thai Buddhist.
- ISC has 13 months of 28 days: 364 days, 52 complete weeks, and no leap or
  intercalary day.
- ISC day 1 is anchored to Hebrew 25 Elul AM 1, the traditional first day of
  Creation. The calculated Hebrew calendar makes that fixed date a Monday.
  Preserve the uninterrupted weekday sequence; do not force the epoch to
  Sunday.
- The long rotation uses 293 ISC years versus 292 mean Hebrew years. It is a
  near-alignment of year boundaries, not a weekday reset.
- Chronology rows compare events with both full 293-year boundaries and their
  146.5-year half-cycle marks. Both use the documented 33-ISC-year proximity
  window; full-cycle matches are gold and half-cycle matches are sapphire. The
  grid marks every `n + 0.5` half-cycle anniversary at ISC Month 7, Day 15 of
  Sacred Years 147, 440, 733, and so on.
- Cosmic time treats one 293-ISC-year interval as one Cosmic Day and divides it
  into 24 hours, 60 minutes per hour, and 60 seconds per minute. Each 293-year
  alignment is one symbolic Cosmic Day: alignments 1 through 7 are Monday
  through Sunday of Cosmic Week 1, alignments 8 through 14 are Cosmic Week 2,
  and so on. Cosmic Date edits round to the nearest fixed civil day.
- Lunar alignments plus new- and full-moon dates use mean-lunation
  approximations. Keep approximation labels visible and do not describe them
  as observations.
- Planetary hours divide daylight and night into twelve equal parts each. They
  are generally not 60 minutes. Pre-sunrise hours belong to the preceding
  night. The sequence and calculator live in `lib/planetary-hours.ts`.

## Historical chronology

- `lib/historical-events.ts` must contain exactly 80 events; tests enforce this.
- Biblical events use traditional Hebrew chronology and Hebrew dates.
- Do not invent day precision. A year-only or month-only event is converted as
  a fixed-day range. Its calendar-grid marker uses the first day of the range
  and must remain visibly labeled as a range or approximation.
- Preserve the distinction between traditional chronology and academic or
  civil chronologies, especially for the First and Second Temples.
- Exact civil dates retain the calendar actually stated by the source. Events
  dated in the historical Julian calendar should enter the converter as Julian,
  not as a same-numbered Gregorian date.
- Symbolic-date explanations are interpretive annotations and must not replace
  the actual event date.
- Every chronology event must remain reachable from the chronology section and
  represented on the ISC calendar grid. Its first fixed day supplies an ISC
  month/day that repeats every 364 days in all later ISC years; the grid labels
  the original occurrence separately and later occurrences with a running
  anniversary number. This recurrence remains visible for every alternative
  grid calendar.
- Rotation proximity is calculated from an event's fixed-day midpoint. Events
  within 33 ISC years of their nearest 293-year boundary are highlighted.
  Contextual intervals such as the Egypt midpoint and mainstream Babylonian
  exile span remain annotations rather than extra entries in the fixed list of 80.

## UI and localization

- The main page is `app/page.tsx`; shared styling is in `app/globals.css`.
- Keep the separate sections, their anchors, and the two-level menu. Every
  section and the lunar-alignment subsection must remain reachable from it.
- The grid calendar selection stays synchronized with the source-calendar
  selection at the top of the page. Monday is the default week start.
- The selected date and current date require distinct grid highlighting.
- Supported interface languages are English, Hebrew, Arabic, Italian, Greek,
  Russian, Simplified Chinese, Hindi, Spanish, French, Japanese, and Korean.
  Keep the user-facing language list alphabetized as currently defined.
- Preserve right-to-left layout for Hebrew and Arabic.
- Prefer compact tables, visual symbols, and short explanatory notes. Do not
  shrink normal-screen text to solve layout problems; make containers wider or
  allow purposeful horizontal table scrolling.
- The document must never scroll sideways. Wide tables scroll inside their own
  wrapper, which needs a zero min-width floor on the enclosing grid item, and
  their first column stays pinned with `position: sticky` and an opaque
  background.
- The converter date and the planetary sunrise and sunset times are device-local
  preferences in `lib/local-preferences.ts`. Read them once on mount and only
  persist after that first read, so a fresh render cannot overwrite a saved
  value.

## Progressive web app

- `public/site.webmanifest`, `public/sw.js`, and `app/service-worker.tsx` make
  the site installable and usable offline. Keep the manifest's `standalone`
  display, the 192 px and 512 px icons, and the 512 px maskable icon.
- Bump `CACHE_VERSION` in `public/sw.js` whenever the caching rules or the
  precache list change. Navigations stay network-first so a deploy is never
  masked by the cache; hashed build output under `/_next/static/` is cache-first.
- The worker registers in production builds only. Never register it in
  development, and never commit a worker that caches HTML cache-first.

## Build and validation

Use Node.js 22.13 or later and preserve the checked-in package manager and
lockfile.

Common commands:

```bash
make dev          # vinext development server
make build        # Cloudflare/Sites production build
make build-pages  # Next.js static GitHub Pages build
make test         # production build plus all Node tests
make lint         # ESLint
make check        # lint and tests
npx tsc --noEmit  # strict type check
```

Before publication, run the full tests, GitHub Pages build, lint, TypeScript,
and `git diff --check`. The vinext prerender build binds a local loopback port;
in restricted environments it may require the approved elevated test command.

Tests live in:

- `tests/calendar.test.ts` for conversion, chronology, holiday, lunar, and
  planetary calculations.
- `tests/rendered-html.test.mjs` for the complete server-rendered page and
  required UI markers.

The repository uses ES modules (`"type": "module"`). Keep CommonJS-only Next
configuration in `next.config.cjs`, not `next.config.js`.

## Publishing

- GitHub Pages deploys from `main` through `.github/workflows/nextjs.yml` and
  serves the public custom domain `https://sacredcal.one`.
- This is also a Sites project. Preserve `.openai/hosting.json`, run the vinext
  build, push the exact committed source to the configured Sites repository,
  package that same commit, save one version, and deploy it.
- Never commit credentials, generated authentication headers, build archives,
  `.next`, or `dist`.
- Stage only files belonging to the requested change and leave unrelated user
  work untouched.

## Documentation

Update `README.md` when calendar rules, supported calendars, chronology policy,
public helpers, or run commands change. `CLAUDE.md` is intentionally a symlink
to this file so all coding agents receive the same guidance; keep it that way.
