"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GREGORIAN_MONTH_NAMES,
  HEBREW_MONTH_NAMES,
  ISLAMIC_MONTH_NAMES,
  SACRED_LUNAR_BEAT_DAYS,
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
  fixedFromSacred,
  gregorianFromFixed,
  hebrewYearMonths,
  isHebrewLeapYear,
  maxDayForDate,
  moonAlignmentAtSacredMonth,
  moonAlignmentsAround,
  sacredFromFixed,
  sacredRotation,
  sacredRotationAnniversary,
  type CalendarDate,
  type CalendarKind,
} from "@/lib/sacred-calendar";
import {
  LANGUAGES,
  MOON_TRANSLATIONS,
  TRANSLATIONS,
  type LanguageCode,
  type TranslationPack,
} from "@/lib/translations";

const CALENDARS: CalendarKind[] = ["sacred", "hebrew", "gregorian", "islamic"];

const DEFAULT_FIXED = fixedFromGregorian({ year: 2026, month: 7, day: 29 });

function calendarLabel(kind: CalendarKind, translations: TranslationPack): string {
  if (kind === "sacred") return "International Sacred Calendar";
  if (kind === "hebrew") return translations.hebrew;
  if (kind === "gregorian") return translations.gregorian;
  return translations.muslim;
}

function monthLabel(
  kind: CalendarKind,
  year: number,
  month: number,
  translations: TranslationPack,
  locale: string,
): string {
  if (kind === "sacred") return `${translations.month} ${month}`;
  if (kind === "hebrew") {
    if (month === 12 && isHebrewLeapYear(year)) return "Adar I";
    return HEBREW_MONTH_NAMES[month];
  }
  if (kind === "gregorian") {
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, month - 1, 1)));
  }
  return ISLAMIC_MONTH_NAMES[month];
}

function formatYear(year: number): string {
  return year > 0 ? `${year} CE` : `${1 - year} BCE`;
}

function formatDate(
  kind: CalendarKind,
  date: CalendarDate,
  translations: TranslationPack,
  locale: string,
): string {
  if (kind === "sacred") {
    return `${translations.year} ${date.year} · ${translations.month} ${date.month} · ${translations.day} ${date.day}`;
  }
  if (kind === "gregorian") {
    if (locale === "en-US") {
      return `${GREGORIAN_MONTH_NAMES[date.month]} ${date.day}, ${formatYear(date.year)}`;
    }
    const formatted = new Date(0);
    formatted.setUTCFullYear(date.year, date.month - 1, date.day);
    formatted.setUTCHours(0, 0, 0, 0);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      era: date.year <= 0 ? "short" : undefined,
      timeZone: "UTC",
    }).format(formatted);
  }
  if (kind === "hebrew") {
    return `${date.day} ${monthLabel(kind, date.year, date.month, translations, locale)} ${date.year} AM`;
  }
  const islamicYear = date.year > 0 ? date.year : 1 - date.year;
  const islamicEra = date.year > 0 ? "AH" : "BH";
  return `${date.day} ${ISLAMIC_MONTH_NAMES[date.month]} ${islamicYear} ${islamicEra}`;
}

function dateCode(kind: CalendarKind, date: CalendarDate): string {
  const prefix =
    kind === "sacred"
      ? "ISC"
      : kind === "hebrew"
        ? "AM"
        : kind === "islamic"
          ? date.year > 0
            ? "AH"
            : "BH"
          : date.year > 0
            ? "CE"
            : "BCE";
  const displayYear =
    (kind === "gregorian" || kind === "islamic") && date.year <= 0
      ? 1 - date.year
      : date.year;
  return `${prefix} ${displayYear} · ${String(date.month).padStart(2, "0")} · ${String(date.day).padStart(2, "0")}`;
}

function localizedWeekday(fixed: number, locale: string): string {
  const gregorian = gregorianFromFixed(fixed);
  const date = new Date(0);
  date.setUTCFullYear(gregorian.year, gregorian.month - 1, gregorian.day);
  date.setUTCHours(0, 0, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
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
  translations,
  locale,
  onChange,
}: {
  kind: CalendarKind;
  date: CalendarDate;
  translations: TranslationPack;
  locale: string;
  onChange: (date: CalendarDate) => void;
}) {
  const monthCount =
    kind === "sacred" ? 13 : kind === "hebrew" ? hebrewYearMonths(date.year) : 12;
  const usesEra = kind === "gregorian" || kind === "islamic";
  const isBeforeEra = usesEra && date.year <= 0;
  const displayedYear = isBeforeEra ? 1 - date.year : date.year;

  function update(patch: Partial<CalendarDate>) {
    onChange(safeDate(kind, { ...date, ...patch }));
  }

  return (
    <div className="date-fields">
      <label>
        <span>{translations.month}</span>
        <select
          aria-label={translations.month}
          value={date.month}
          onChange={(event) => update({ month: Number(event.target.value) })}
        >
          {Array.from({ length: monthCount }, (_, index) => index + 1).map(
            (month) => (
              <option key={month} value={month}>
                {monthLabel(kind, date.year, month, translations, locale)}
              </option>
            ),
          )}
        </select>
      </label>
      <label>
        <span>{translations.day}</span>
        <input
          aria-label={translations.day}
          type="number"
          min={1}
          max={maxDayForDate(kind, date.year, date.month)}
          value={date.day}
          onChange={(event) => update({ day: Number(event.target.value) || 1 })}
        />
      </label>
      <label>
        <span>{translations.year}</span>
        <input
          aria-label={translations.year}
          type="number"
          min={1}
          value={displayedYear}
          onChange={(event) => {
            const entered = Math.max(1, Number(event.target.value) || 1);
            update({ year: isBeforeEra ? 1 - entered : entered });
          }}
        />
      </label>
      {usesEra ? (
        <label className="era-field">
          <span>{translations.era}</span>
          <select
            aria-label={translations.era}
            value={isBeforeEra ? "before" : "after"}
            onChange={(event) => {
              const entered = Math.max(1, displayedYear);
              update({ year: event.target.value === "before" ? 1 - entered : entered });
            }}
          >
            <option value="after">{kind === "gregorian" ? "CE" : "AH"}</option>
            <option value="before">{kind === "gregorian" ? "BCE" : "BH"}</option>
          </select>
        </label>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [gridOffset, setGridOffset] = useState(0);
  const [from, setFrom] = useState<CalendarKind>("gregorian");
  const [to, setTo] = useState<CalendarKind>("sacred");
  const [sourceDate, setSourceDate] = useState<CalendarDate>(() =>
    equivalentFor("gregorian", DEFAULT_FIXED),
  );
  const languageConfig =
    LANGUAGES.find((candidate) => candidate.code === language) ?? LANGUAGES[0];
  const translations = TRANSLATIONS[language];
  const moonTranslations = MOON_TRANSLATIONS[language];

  useEffect(() => {
    const stored = window.localStorage.getItem("isc-language") as LanguageCode | null;
    const next = LANGUAGES.some((candidate) => candidate.code === stored)
      ? (stored as LanguageCode)
      : "en";
    const config = LANGUAGES.find((candidate) => candidate.code === next) ?? LANGUAGES[0];
    document.documentElement.lang = config.locale;
    document.documentElement.dir = config.direction;
    const frame = window.requestAnimationFrame(() => setLanguage(next));
    return () => window.cancelAnimationFrame(frame);
  }, []);

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
    setGridOffset(0);
  }

  function swapCalendars() {
    setFrom(to);
    setTo(from);
    setSourceDate(calculation.result);
    setGridOffset(0);
  }

  function useToday() {
    const today = new Date();
    const fixed = fixedFromGregorian({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
    setSourceDate(equivalentFor(from, fixed));
    setGridOffset(0);
  }

  function changeLanguage(next: LanguageCode) {
    setLanguage(next);
    window.localStorage.setItem("isc-language", next);
    const config = LANGUAGES.find((candidate) => candidate.code === next) ?? LANGUAGES[0];
    document.documentElement.lang = config.locale;
    document.documentElement.dir = config.direction;
  }

  const sourceWeekday = localizedWeekday(calculation.fixed, languageConfig.locale);
  const sacredDayOfYear =
    (calculation.sacred.month - 1) * SACRED_DAYS_PER_MONTH +
    calculation.sacred.day;
  const remainingYears = SACRED_ROTATION_YEARS - calculation.rotation.yearInCycle;
  const anniversaries = Array.from({ length: 20 }, (_, index) => index + 1).map((number) => {
    const sacred = sacredRotationAnniversary(number);
    const fixed = fixedFromSacred(sacred);
    return {
      number,
      fixed,
      sacred,
      hebrew: dateFromFixed("hebrew", fixed),
      gregorian: dateFromFixed("gregorian", fixed),
      islamic: dateFromFixed("islamic", fixed),
    };
  });
  const twentieth = anniversaries[19];
  const daysToTwentieth = twentieth.fixed - calculation.fixed;
  const countdownYears = Math.floor(Math.abs(daysToTwentieth) / SACRED_DAYS_PER_YEAR);
  const countdownDays = Math.abs(daysToTwentieth) % SACRED_DAYS_PER_YEAR;
  const anniversaryTimelineProgress = Math.min(
    1,
    Math.max(
      0,
      (calculation.fixed - SACRED_EPOCH_FIXED) /
        (twentieth.fixed - SACRED_EPOCH_FIXED),
    ),
  );
  const baseGridMonth =
    (calculation.sacred.year - 1) * SACRED_MONTHS_PER_YEAR +
    calculation.sacred.month -
    1;
  const visibleGridMonth = Math.max(0, baseGridMonth + gridOffset);
  const gridSacred: CalendarDate = {
    year: Math.floor(visibleGridMonth / SACRED_MONTHS_PER_YEAR) + 1,
    month: (visibleGridMonth % SACRED_MONTHS_PER_YEAR) + 1,
    day: 1,
  };
  const gridStartFixed = fixedFromSacred(gridSacred);
  const gridMoonAlignment = moonAlignmentAtSacredMonth(gridSacred);
  const gridRotationAnniversary =
    gridSacred.month === 1 &&
    gridSacred.year > 1 &&
    (gridSacred.year - 1) % SACRED_ROTATION_YEARS === 0
      ? (gridSacred.year - 1) / SACRED_ROTATION_YEARS
      : null;
  const moonAlignments = moonAlignmentsAround(calculation.fixed, 5, 5);
  const gridWeekdays = Array.from({ length: 7 }, (_, index) =>
    localizedWeekday(gridStartFixed + index, languageConfig.locale),
  );

  return (
    <main dir={languageConfig.direction}>
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#top" aria-label="International Sacred Calendar home">
          <span className="brand-mark" aria-hidden="true">13</span>
          <span>
            <strong>International Sacred Calendar</strong>
            <small>{translations.brandSubtitle}</small>
          </span>
        </a>
        <div className="nav-links">
          <a href="#converter">{translations.navConvert}</a>
          <a href="#cycle">{translations.navCycle}</a>
          <a href="#calendar">{moonTranslations.calendarKicker}</a>
          <a href="#definition">{translations.navDefinition}</a>
        </div>
        <label className="language-picker">
          <span className="sr-only">Language</span>
          <select
            aria-label="Language"
            value={language}
            onChange={(event) => changeLanguage(event.target.value as LanguageCode)}
          >
            {LANGUAGES.map((candidate) => (
              <option value={candidate.code} key={candidate.code}>
                {candidate.label}
              </option>
            ))}
          </select>
        </label>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow">
          <span aria-hidden="true">✦</span>
          {translations.eyebrow}
        </div>
        <h1>
          {translations.heroLead}
          <br />
          <em>{translations.heroEmphasis}</em>
        </h1>
        <p className="hero-copy">{translations.heroCopy}</p>
        <div className="hero-facts" aria-label="Sacred Calendar facts">
          <div><strong>13</strong><span>{translations.equalMonths}</span></div>
          <i aria-hidden="true">×</i>
          <div><strong>28</strong><span>{translations.daysEach}</span></div>
          <i aria-hidden="true">=</i>
          <div><strong>364</strong><span>{translations.daysPerYear}</span></div>
        </div>
      </section>

      <section className="converter-section" id="converter">
        <div className="section-heading">
          <span>01 — {translations.converterKicker}</span>
          <h2>{translations.converterTitle}</h2>
          <p>{translations.converterBody}</p>
        </div>

        <div className="converter-shell">
          <div className="converter-card source-card">
            <div className="card-kicker">
              <span>{translations.from}</span>
              <button type="button" className="text-button" onClick={useToday}>
                {translations.useToday}
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
                  <option value={calendar} key={calendar}>
                    {calendarLabel(calendar, translations)}
                  </option>
                ))}
              </select>
            </label>
            <CalendarFields
              kind={from}
              date={sourceDate}
              translations={translations}
              locale={languageConfig.locale}
              onChange={(date) => {
                setSourceDate(date);
                setGridOffset(0);
              }}
            />
            <div className="weekday-line">
              <span className="status-dot" aria-hidden="true" />
              {sourceWeekday} · {translations.fixedDay}{" "}
              {calculation.fixed.toLocaleString(languageConfig.locale)}
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
            <div className="card-kicker">
              <span>{translations.to}</span>
              <span>{translations.convertedDate}</span>
            </div>
            <label className="calendar-select-label">
              <span className="sr-only">Destination calendar</span>
              <select
                className="calendar-select"
                aria-label="Destination calendar"
                value={to}
                onChange={(event) => setTo(event.target.value as CalendarKind)}
              >
                {CALENDARS.map((calendar) => (
                  <option value={calendar} key={calendar}>
                    {calendarLabel(calendar, translations)}
                  </option>
                ))}
              </select>
            </label>
            {calculation.error ? (
              <p className="error-message">{calculation.error}</p>
            ) : (
              <>
                <div className="result-date">
                  {formatDate(
                    to,
                    calculation.result,
                    translations,
                    languageConfig.locale,
                  )}
                </div>
                <div className="result-meta">
                  <span>{sourceWeekday}</span>
                  <span>{dateCode(to, calculation.result)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="converter-note">{translations.gregorianNote}</p>
      </section>

      <section className="cycle-section" id="cycle">
        <div className="cycle-intro">
          <span className="section-number">02 — {translations.cycleKicker}</span>
          <h2>{translations.cycleTitle}</h2>
          <p>{translations.cycleBody}</p>
        </div>

        <div className="cycle-display">
          <div className="orbit" aria-hidden="true">
            <div className="orbit-inner">
              <span>{translations.cycle}</span>
              <strong>{calculation.rotation.cycle}</strong>
              <small>{translations.ofSacredTime}</small>
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
              <span>{translations.currentSacredDate}</span>
              <strong>
                Y{calculation.sacred.year} · M{calculation.sacred.month} · D{calculation.sacred.day}
              </strong>
            </div>
            <div className="cycle-grid">
              <article>
                <span>{translations.yearInRotation}</span>
                <strong>{calculation.rotation.yearInCycle}</strong>
                <small>{translations.of} {SACRED_ROTATION_YEARS}</small>
              </article>
              <article>
                <span>{translations.dayOfYear}</span>
                <strong>{sacredDayOfYear}</strong>
                <small>{translations.of} {SACRED_DAYS_PER_YEAR}</small>
              </article>
              <article>
                <span>{translations.untilNextCycle}</span>
                <strong>{remainingYears}</strong>
                <small>{translations.sacredYears}</small>
              </article>
            </div>
            <div className="progress-track" aria-label={`${Math.round(calculation.rotation.progress * 100)}% through the rotation`}>
              <span style={{ width: `${calculation.rotation.progress * 100}%` }} />
            </div>
            <p>
              {Math.round(calculation.rotation.progress * 100)}%{" "}
              {translations.throughRotation}
            </p>
          </div>
        </div>

        <div className="anniversary-panel">
          <div className="anniversary-heading">
            <div>
              <span className="section-number">{translations.anniversariesKicker}</span>
              <h3>{translations.anniversariesTitle}</h3>
              <p>{translations.anniversariesBody}</p>
            </div>
            <div className="countdown-card">
              <span>{translations.toTwentieth}</span>
              <strong>
                {countdownYears.toLocaleString(languageConfig.locale)}
                <small> {translations.sacredYears}</small>
              </strong>
              <p>
                {daysToTwentieth >= 0
                  ? `${countdownDays.toLocaleString(languageConfig.locale)} ${translations.daysRemain}`
                  : `${countdownDays.toLocaleString(languageConfig.locale)} ${translations.daysAgo}`}
              </p>
            </div>
          </div>

          <div className="anniversary-visual">
            <div className="anniversary-rail" aria-label={translations.toTwentieth}>
              <span
                className="anniversary-rail-fill"
                style={{ width: `${anniversaryTimelineProgress * 100}%` }}
              />
              {anniversaries.map((anniversary) => (
                <span
                  className={`anniversary-tick ${
                    anniversary.fixed <= calculation.fixed ? "completed" : ""
                  }`}
                  style={{ insetInlineStart: `${(anniversary.number / 20) * 100}%` }}
                  title={`#${anniversary.number} · ISC ${anniversary.sacred.year}`}
                  key={anniversary.number}
                >
                  <i />
                </span>
              ))}
              <span
                className="current-position"
                style={{ insetInlineStart: `${anniversaryTimelineProgress * 100}%` }}
              >
                <i />
                <em>{translations.currentSacredDate}</em>
              </span>
            </div>
            <div className="anniversary-visual-labels">
              <span>ISC 1 · 1 · 1</span>
              <span>ISC {calculation.sacred.year} · {calculation.sacred.month} · {calculation.sacred.day}</span>
              <span>#20 · ISC {twentieth.sacred.year} · 1 · 1</span>
            </div>
          </div>

          <div className="anniversary-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{translations.milestone}</th>
                  <th>{translations.sacred}</th>
                  <th>{translations.hebrew}</th>
                  <th>{translations.gregorian}</th>
                  <th>{translations.muslim}</th>
                  <th>{translations.weekday}</th>
                </tr>
              </thead>
              <tbody>
                {anniversaries.map((anniversary) => (
                  <tr key={anniversary.number}>
                    <th>
                      <button
                        type="button"
                        className="milestone-button"
                        onClick={() => {
                          const targetMonth =
                            (anniversary.sacred.year - 1) * SACRED_MONTHS_PER_YEAR;
                          setGridOffset(targetMonth - baseGridMonth);
                          document
                            .getElementById("calendar")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        title={moonTranslations.rotationAnniversary}
                      >
                        #{anniversary.number.toLocaleString(languageConfig.locale)}
                      </button>
                    </th>
                    <td>{formatDate("sacred", anniversary.sacred, translations, languageConfig.locale)}</td>
                    <td>{formatDate("hebrew", anniversary.hebrew, translations, languageConfig.locale)}</td>
                    <td>{formatDate("gregorian", anniversary.gregorian, translations, languageConfig.locale)}</td>
                    <td>{formatDate("islamic", anniversary.islamic, translations, languageConfig.locale)}</td>
                    <td>{localizedWeekday(anniversary.fixed, languageConfig.locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="calendar-section" id="calendar">
        <div className="section-heading calendar-heading">
          <span>03 — {moonTranslations.calendarKicker}</span>
          <h2>{moonTranslations.calendarTitle}</h2>
          <p>{moonTranslations.calendarBody}</p>
        </div>

        <div className="calendar-toolbar">
          <button
            type="button"
            onClick={() => setGridOffset((current) => Math.max(-baseGridMonth, current - 1))}
            aria-label={moonTranslations.previousMonth}
          >
            ← <span>{moonTranslations.previousMonth}</span>
          </button>
          <div>
            <span>International Sacred Calendar</span>
            <strong>
              ISC {gridSacred.year} · {translations.month} {gridSacred.month}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => setGridOffset((current) => current + 1)}
            aria-label={moonTranslations.nextMonth}
          >
            <span>{moonTranslations.nextMonth}</span> →
          </button>
        </div>

        <div className="calendar-grid" role="grid">
          {gridWeekdays.map((weekday) => (
            <div className="calendar-weekday" role="columnheader" key={weekday}>
              {weekday}
            </div>
          ))}
          {Array.from({ length: SACRED_DAYS_PER_MONTH }, (_, index) => index + 1).map(
            (day) => {
              const selected =
                gridSacred.year === calculation.sacred.year &&
                gridSacred.month === calculation.sacred.month &&
                day === calculation.sacred.day;
              const hasMoonAlignment = day === 1 && Boolean(gridMoonAlignment);
              const hasRotationAnniversary =
                day === 1 && gridRotationAnniversary !== null;

              return (
                <div
                  className={[
                    "calendar-day",
                    selected ? "selected" : "",
                    hasMoonAlignment || hasRotationAnniversary ? "has-event" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="gridcell"
                  aria-selected={selected}
                  key={day}
                >
                  <span className="day-number">{day}</span>
                  <div className="day-events">
                    {selected ? (
                      <span className="event-pill selected-pill">
                        {moonTranslations.selectedDate}
                      </span>
                    ) : null}
                    {hasMoonAlignment ? (
                      <span className="event-pill moon-pill">
                        ◐ {moonTranslations.lunarAlignment}
                      </span>
                    ) : null}
                    {hasRotationAnniversary ? (
                      <span className="event-pill rotation-pill">
                        ✦ {moonTranslations.rotationAnniversary} #{gridRotationAnniversary}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            },
          )}
        </div>

        <div className="lunar-alignment-section">
          <div className="lunar-copy">
            <span className="section-number">28 ↔ 29.530588853</span>
            <h3>{moonTranslations.alignmentsTitle}</h3>
            <p>{moonTranslations.alignmentsBody}</p>
            <div className="beat-stat">
              <strong>{SACRED_LUNAR_BEAT_DAYS.toFixed(1)}</strong>
              <span>{translations.day} · ≈ 1.48 {translations.year}</span>
            </div>
            <small>{moonTranslations.approximation}</small>
          </div>

          <div className="alignment-list">
            {moonAlignments.map((alignment) => {
              const isPast = alignment.fixed <= calculation.fixed;
              const gregorian = dateFromFixed("gregorian", alignment.fixed);
              const hebrew = dateFromFixed("hebrew", alignment.fixed);
              const islamic = dateFromFixed("islamic", alignment.fixed);

              return (
                <article key={`${alignment.sacred.year}-${alignment.sacred.month}`}>
                  <div className="alignment-index">
                    <span>{isPast ? moonTranslations.past : moonTranslations.future}</span>
                    <strong>
                      ISC {alignment.sacred.year} · {alignment.sacred.month} · 1
                    </strong>
                  </div>
                  <div>
                    <span>{translations.gregorian}</span>
                    <strong>
                      {formatDate("gregorian", gregorian, translations, languageConfig.locale)}
                    </strong>
                  </div>
                  <div>
                    <span>{translations.hebrew} / {translations.muslim}</span>
                    <strong>
                      {formatDate("hebrew", hebrew, translations, languageConfig.locale)}
                      {" · "}
                      {formatDate("islamic", islamic, translations, languageConfig.locale)}
                    </strong>
                  </div>
                  <div>
                    <span>{moonTranslations.meanOffset}</span>
                    <strong>
                      {alignment.offsetHours >= 0 ? "+" : ""}
                      {alignment.offsetHours.toFixed(1)} h
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="definition-section" id="definition">
        <div className="section-heading">
          <span>04 — {translations.definitionKicker}</span>
          <h2>{translations.definitionTitle}</h2>
        </div>

        <div className="definition-grid">
          <article className="principle-card large">
            <span className="principle-index">I</span>
            <div>
              <h3>{translations.equalMonthsTitle}</h3>
              <p>{translations.equalMonthsBody}</p>
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
            <h3>{translations.fullWeeksTitle}</h3>
            <p>{translations.fullWeeksBody}</p>
            <div className="equation">
              {SACRED_MONTHS_PER_YEAR} × 4 = <strong>{SACRED_WEEKS_PER_YEAR}</strong>
            </div>
          </article>
          <article className="principle-card accent">
            <span className="principle-index">III</span>
            <h3>{translations.creationAnchorTitle}</h3>
            <p>
              {translations.creationAnchorBody}{" "}
              <strong>{localizedWeekday(SACRED_EPOCH_FIXED, languageConfig.locale)}</strong>
            </p>
          </article>
          <article className="principle-card quote-card">
            <blockquote>{translations.quote}</blockquote>
            <p>{translations.quoteBody}</p>
          </article>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">13</span>
          <span>
            <strong>International Sacred Calendar</strong>
            <small>{translations.footerTagline}</small>
          </span>
        </div>
        <p>{translations.footerBody}</p>
        <a href="#top">{translations.backToTop} ↑</a>
      </footer>
    </main>
  );
}
