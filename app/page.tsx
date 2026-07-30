"use client";

import { useMemo, useState } from "react";
import {
  GREGORIAN_MONTH_NAMES,
  HEBREW_MONTH_NAMES,
  ISLAMIC_MONTH_NAMES,
  SACRED_DAYS_PER_MONTH,
  SACRED_DAYS_PER_YEAR,
  SACRED_EPOCH_FIXED,
  SACRED_MONTHS_PER_YEAR,
  SACRED_ROTATION_YEARS,
  SACRED_WEEKS_PER_YEAR,
  convertDate,
  dateFromFixed,
  fixedFromDate,
  fixedFromGregorian,
  hebrewYearMonths,
  isHebrewLeapYear,
  maxDayForDate,
  sacredFromFixed,
  sacredRotation,
  weekdayFromFixed,
  type CalendarDate,
  type CalendarKind,
} from "@/lib/sacred-calendar";

const CALENDARS: Array<{
  id: CalendarKind;
  label: string;
  short: string;
}> = [
  { id: "sacred", label: "Sacred Calendar", short: "Sacred" },
  { id: "hebrew", label: "Hebrew Calendar", short: "Hebrew" },
  {
    id: "gregorian",
    label: "Gregorian Calendar",
    short: "Gregorian",
  },
  { id: "islamic", label: "Muslim Calendar", short: "Islamic" },
];

const DEFAULT_FIXED = fixedFromGregorian({ year: 2026, month: 7, day: 29 });

function monthLabel(kind: CalendarKind, year: number, month: number): string {
  if (kind === "sacred") return `Month ${month}`;
  if (kind === "hebrew") {
    if (month === 12 && isHebrewLeapYear(year)) return "Adar I";
    return HEBREW_MONTH_NAMES[month];
  }
  if (kind === "gregorian") return GREGORIAN_MONTH_NAMES[month];
  return ISLAMIC_MONTH_NAMES[month];
}

function formatYear(year: number): string {
  return year > 0 ? `${year} CE` : `${1 - year} BCE`;
}

function formatDate(kind: CalendarKind, date: CalendarDate): string {
  if (kind === "sacred") {
    return `Month ${date.month} · Day ${date.day} · Year ${date.year}`;
  }
  if (kind === "gregorian") {
    return `${GREGORIAN_MONTH_NAMES[date.month]} ${date.day}, ${formatYear(date.year)}`;
  }
  if (kind === "hebrew") {
    return `${date.day} ${monthLabel(kind, date.year, date.month)} ${date.year} AM`;
  }
  return `${date.day} ${ISLAMIC_MONTH_NAMES[date.month]} ${date.year} AH`;
}

function dateCode(kind: CalendarKind, date: CalendarDate): string {
  const prefix =
    kind === "sacred"
      ? "SC"
      : kind === "hebrew"
        ? "AM"
        : kind === "islamic"
          ? "AH"
          : date.year > 0
            ? "CE"
            : "BCE";
  const displayYear = kind === "gregorian" && date.year <= 0 ? 1 - date.year : date.year;
  return `${prefix} ${displayYear} · ${String(date.month).padStart(2, "0")} · ${String(date.day).padStart(2, "0")}`;
}

function equivalentFor(kind: CalendarKind, fixed: number): CalendarDate {
  return dateFromFixed(kind, fixed);
}

function safeDate(kind: CalendarKind, candidate: CalendarDate): CalendarDate {
  const maxMonth =
    kind === "sacred"
      ? 13
      : kind === "hebrew"
        ? hebrewYearMonths(Math.max(1, candidate.year))
        : 12;
  const month = Math.min(Math.max(1, candidate.month), maxMonth);
  const maxDay = maxDayForDate(kind, candidate.year, month);
  return { ...candidate, month, day: Math.min(Math.max(1, candidate.day), maxDay) };
}

function CalendarFields({
  kind,
  date,
  onChange,
}: {
  kind: CalendarKind;
  date: CalendarDate;
  onChange: (date: CalendarDate) => void;
}) {
  const monthCount =
    kind === "sacred" ? 13 : kind === "hebrew" ? hebrewYearMonths(date.year) : 12;
  const isBce = kind === "gregorian" && date.year <= 0;
  const displayedYear = isBce ? 1 - date.year : date.year;

  function update(patch: Partial<CalendarDate>) {
    onChange(safeDate(kind, { ...date, ...patch }));
  }

  return (
    <div className="date-fields">
      <label>
        <span>Month</span>
        <select
          aria-label="Source month"
          value={date.month}
          onChange={(event) => update({ month: Number(event.target.value) })}
        >
          {Array.from({ length: monthCount }, (_, index) => index + 1).map(
            (month) => (
              <option key={month} value={month}>
                {monthLabel(kind, date.year, month)}
              </option>
            ),
          )}
        </select>
      </label>
      <label>
        <span>Day</span>
        <input
          aria-label="Source day"
          type="number"
          min={1}
          max={maxDayForDate(kind, date.year, date.month)}
          value={date.day}
          onChange={(event) => update({ day: Number(event.target.value) || 1 })}
        />
      </label>
      <label>
        <span>Year</span>
        <input
          aria-label="Source year"
          type="number"
          min={1}
          value={displayedYear}
          onChange={(event) => {
            const entered = Math.max(1, Number(event.target.value) || 1);
            update({ year: isBce ? 1 - entered : entered });
          }}
        />
      </label>
      {kind === "gregorian" ? (
        <label className="era-field">
          <span>Era</span>
          <select
            aria-label="Source era"
            value={isBce ? "bce" : "ce"}
            onChange={(event) => {
              const entered = Math.max(1, displayedYear);
              update({ year: event.target.value === "bce" ? 1 - entered : entered });
            }}
          >
            <option value="ce">CE</option>
            <option value="bce">BCE</option>
          </select>
        </label>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [from, setFrom] = useState<CalendarKind>("gregorian");
  const [to, setTo] = useState<CalendarKind>("sacred");
  const [sourceDate, setSourceDate] = useState<CalendarDate>(() =>
    equivalentFor("gregorian", DEFAULT_FIXED),
  );

  const calculation = useMemo(() => {
    try {
      const fixed = fixedFromDate(from, sourceDate);
      const result = convertDate(sourceDate, from, to);
      const sacred = sacredFromFixed(fixed);
      return {
        fixed,
        result,
        sacred,
        rotation: sacredRotation(sacred),
        error: "",
      };
    } catch (error) {
      return {
        fixed: DEFAULT_FIXED,
        result: equivalentFor(to, DEFAULT_FIXED),
        sacred: sacredFromFixed(DEFAULT_FIXED),
        rotation: sacredRotation(sacredFromFixed(DEFAULT_FIXED)),
        error: error instanceof Error ? error.message : "Please check the date.",
      };
    }
  }, [from, sourceDate, to]);

  function changeFrom(next: CalendarKind) {
    let fixed = DEFAULT_FIXED;
    try {
      fixed = fixedFromDate(from, sourceDate);
    } catch {
      // Fall back to the current date if the unfinished input is invalid.
    }
    setFrom(next);
    setSourceDate(equivalentFor(next, fixed));
  }

  function swapCalendars() {
    setFrom(to);
    setTo(from);
    setSourceDate(calculation.result);
  }

  function useToday() {
    const today = new Date();
    const fixed = fixedFromGregorian({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
    setSourceDate(equivalentFor(from, fixed));
  }

  const sourceWeekday = weekdayFromFixed(calculation.fixed);
  const sacredDayOfYear =
    (calculation.sacred.month - 1) * SACRED_DAYS_PER_MONTH +
    calculation.sacred.day;
  const remainingYears = SACRED_ROTATION_YEARS - calculation.rotation.yearInCycle;

  return (
    <main>
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#top" aria-label="Sacred Calendar home">
          <span className="brand-mark" aria-hidden="true">13</span>
          <span>
            <strong>Sacred Calendar</strong>
            <small>Converter &amp; cycle atlas</small>
          </span>
        </a>
        <div className="nav-links">
          <a href="#converter">Convert</a>
          <a href="#cycle">Cycle</a>
          <a href="#definition">Definition</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow">
          <span aria-hidden="true">✦</span>
          A week-based measure of sacred time
        </div>
        <h1>
          Every date,
          <br />
          <em>held in one rhythm.</em>
        </h1>
        <p className="hero-copy">
          Move freely between Sacred, Hebrew, Gregorian, and Muslim
          calendars—while preserving the uninterrupted seven-day week.
        </p>
        <div className="hero-facts" aria-label="Sacred Calendar facts">
          <div><strong>13</strong><span>equal months</span></div>
          <i aria-hidden="true">×</i>
          <div><strong>28</strong><span>days each</span></div>
          <i aria-hidden="true">=</i>
          <div><strong>364</strong><span>days per year</span></div>
        </div>
      </section>

      <section className="converter-section" id="converter">
        <div className="section-heading">
          <span>01 — CONVERTER</span>
          <h2>Translate a date</h2>
          <p>Choose any calendar as your starting point and any other as the destination.</p>
        </div>

        <div className="converter-shell">
          <div className="converter-card source-card">
            <div className="card-kicker">
              <span>FROM</span>
              <button type="button" className="text-button" onClick={useToday}>
                Use today
              </button>
            </div>
            <label className="calendar-select-label">
              <span className="sr-only">Source calendar</span>
              <select
                className="calendar-select"
                aria-label="Source calendar"
                value={from}
                onChange={(event) => changeFrom(event.target.value as CalendarKind)}
              >
                {CALENDARS.map((calendar) => (
                  <option value={calendar.id} key={calendar.id}>
                    {calendar.label}
                  </option>
                ))}
              </select>
            </label>
            <CalendarFields kind={from} date={sourceDate} onChange={setSourceDate} />
            <div className="weekday-line">
              <span className="status-dot" aria-hidden="true" />
              {sourceWeekday} · fixed day {calculation.fixed.toLocaleString("en-US")}
            </div>
          </div>

          <button
            className="swap-button"
            type="button"
            onClick={swapCalendars}
            aria-label="Swap source and destination calendars"
            title="Swap calendars"
          >
            ⇄
          </button>

          <div className="converter-card result-card" aria-live="polite">
            <div className="card-kicker"><span>TO</span><span>CONVERTED DATE</span></div>
            <label className="calendar-select-label">
              <span className="sr-only">Destination calendar</span>
              <select
                className="calendar-select"
                aria-label="Destination calendar"
                value={to}
                onChange={(event) => setTo(event.target.value as CalendarKind)}
              >
                {CALENDARS.map((calendar) => (
                  <option value={calendar.id} key={calendar.id}>
                    {calendar.label}
                  </option>
                ))}
              </select>
            </label>
            {calculation.error ? (
              <p className="error-message">{calculation.error}</p>
            ) : (
              <>
                <div className="result-date">{formatDate(to, calculation.result)}</div>
                <div className="result-meta">
                  <span>{sourceWeekday}</span>
                  <span>{dateCode(to, calculation.result)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="converter-note">
          Gregorian dates use the proleptic civil calendar. Muslim dates use the
          arithmetic tabular calendar; local observation may vary by a day.
        </p>
      </section>

      <section className="cycle-section" id="cycle">
        <div className="cycle-intro">
          <span className="section-number">02 — ROTATING CYCLE</span>
          <h2>A long arc back toward alignment.</h2>
          <p>
            A Sacred year is exactly 364 days. Over a long interval,
            <strong> 293 Sacred years</strong> nearly equal
            <strong> 292 mean Hebrew years</strong>—a difference of about
            1 hour 44 minutes. This realigns year boundaries, not weekdays:
            the Sacred week remains continuous because 364 is exactly 52 weeks.
          </p>
        </div>

        <div className="cycle-display">
          <div className="orbit" aria-hidden="true">
            <div className="orbit-inner">
              <span>Cycle</span>
              <strong>{calculation.rotation.cycle}</strong>
              <small>of Sacred time</small>
            </div>
            <span
              className="orbit-marker"
              style={{
                transform: `rotate(${calculation.rotation.progress * 360}deg) translateY(-126px)`,
              }}
            />
          </div>
          <div className="cycle-details">
            <div>
              <span>Current Sacred date</span>
              <strong>
                Y{calculation.sacred.year} · M{calculation.sacred.month} · D{calculation.sacred.day}
              </strong>
            </div>
            <div className="cycle-grid">
              <article>
                <span>Year in rotation</span>
                <strong>{calculation.rotation.yearInCycle}</strong>
                <small>of {SACRED_ROTATION_YEARS}</small>
              </article>
              <article>
                <span>Day of year</span>
                <strong>{sacredDayOfYear}</strong>
                <small>of {SACRED_DAYS_PER_YEAR}</small>
              </article>
              <article>
                <span>Until next cycle</span>
                <strong>{remainingYears}</strong>
                <small>Sacred years</small>
              </article>
            </div>
            <div className="progress-track" aria-label={`${Math.round(calculation.rotation.progress * 100)}% through the rotation`}>
              <span style={{ width: `${calculation.rotation.progress * 100}%` }} />
            </div>
            <p>{Math.round(calculation.rotation.progress * 100)}% through this 293-year rotation</p>
          </div>
        </div>
      </section>

      <section className="definition-section" id="definition">
        <div className="section-heading">
          <span>03 — THE DEFINITION</span>
          <h2>Simple structure.<br />Continuous week.</h2>
        </div>

        <div className="definition-grid">
          <article className="principle-card large">
            <span className="principle-index">I</span>
            <div>
              <h3>Thirteen equal months</h3>
              <p>Each month is four complete weeks. The same date always lands on the same weekday.</p>
            </div>
            <div className="month-mini">
              {Array.from({ length: 28 }, (_, index) => (
                <span key={index} className={(index + 1) % 7 === 0 ? "sabbath" : ""}>
                  {index + 1}
                </span>
              ))}
            </div>
          </article>
          <article className="principle-card">
            <span className="principle-index">II</span>
            <h3>Fifty-two full weeks</h3>
            <p>No leap day or extra day sits outside the seven-day cycle.</p>
            <div className="equation">
              {SACRED_MONTHS_PER_YEAR} × 4 = <strong>{SACRED_WEEKS_PER_YEAR}</strong>
            </div>
          </article>
          <article className="principle-card accent">
            <span className="principle-index">III</span>
            <h3>Creation-week anchor</h3>
            <p>
              Sacred 1 · 1 · 1 is fixed to Hebrew 25 Elul AM 1. In the calculated Hebrew calendar,
              that day is <strong>{weekdayFromFixed(SACRED_EPOCH_FIXED)}</strong>, so the converter
              preserves it rather than forcing a Sunday reset.
            </p>
          </article>
          <article className="principle-card quote-card">
            <blockquote>“Time can follow meaning as well as the heavens.”</blockquote>
            <p>A fourth calendar: not solar, lunar, or lunisolar, but week-based.</p>
          </article>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">13</span>
          <span><strong>Sacred Calendar</strong><small>Thirteen months · One rhythm</small></span>
        </div>
        <p>
          Built from a 13 × 28 definition. Hebrew conversion follows the arithmetic Hebrew calendar;
          Muslim conversion follows the tabular Islamic calendar.
        </p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
