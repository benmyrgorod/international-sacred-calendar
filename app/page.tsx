"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  GREGORIAN_MONTH_NAMES,
  HEBREW_MONTH_NAMES,
  ISLAMIC_MONTH_NAMES,
  SAKA_MONTH_NAMES,
  THAI_BUDDHIST_MONTH_NAMES,
  SACRED_LUNAR_BEAT_DAYS,
  SACRED_DAYS_PER_MONTH,
  SACRED_DAYS_PER_YEAR,
  SACRED_EPOCH_FIXED,
  SACRED_MONTHS_PER_YEAR,
  SACRED_ROTATION_YEARS,
  SACRED_WEEKS_PER_YEAR,
  convertDate,
  chineseMonthsInYear,
  dateFromFixed,
  fixedFromDate,
  fixedFromGregorian,
  fixedFromSacred,
  gregorianFromFixed,
  hebrewYearMonths,
  isHebrewLeapYear,
  maxDayForDate,
  meanNewMoonsBetween,
  moonAlignmentAtSacredMonth,
  moonAlignmentsAround,
  sacredFromFixed,
  sacredRotation,
  sacredRotationAnniversary,
  type CalendarDate,
  type CalendarKind,
} from "@/lib/sacred-calendar";
import {
  internationalHolidaysBetween,
  majorHolidaysBetween,
} from "@/lib/holidays";
import {
  EXTENDED_CALENDAR_NAMES,
  IMPORTANT_DATE_TRANSLATIONS,
  LANGUAGES,
  MOON_TRANSLATIONS,
  TRANSLATIONS,
  type LanguageCode,
  type TranslationPack,
} from "@/lib/translations";

const CALENDARS: CalendarKind[] = [
  "sacred",
  "hebrew",
  "gregorian",
  "julian",
  "islamic",
  "chinese",
  "saka",
  "buddhist",
];
type WeekStart = "sunday" | "monday";

interface ImportantDateDefinition {
  id: "discovery" | "birthday";
  fixed: number;
  baseBirthday?: number;
}

const DEFAULT_FIXED = fixedFromGregorian({ year: 2026, month: 7, day: 29 });
const DEFAULT_LANGUAGE_CONFIG =
  LANGUAGES.find((candidate) => candidate.code === "en") ?? LANGUAGES[0];
const IMPORTANT_DATES: ImportantDateDefinition[] = [
  {
    id: "discovery",
    fixed: fixedFromGregorian({ year: 2026, month: 7, day: 27 }),
  },
  {
    id: "birthday",
    fixed: fixedFromGregorian({ year: 2026, month: 7, day: 28 }),
    baseBirthday: 40,
  },
];

function currentLocalFixed(): number {
  const today = new Date();
  return fixedFromGregorian({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  });
}

function calendarLabel(
  kind: CalendarKind,
  translations: TranslationPack,
  language: LanguageCode,
): string {
  if (kind === "sacred") return "International Sacred Calendar";
  if (kind === "hebrew") return translations.hebrew;
  if (kind === "gregorian") return translations.gregorian;
  if (kind === "julian") return translations.julian;
  if (kind === "islamic") return translations.muslim;
  if (kind === "chinese") return EXTENDED_CALENDAR_NAMES[language].chinese;
  if (kind === "saka") return EXTENDED_CALENDAR_NAMES[language].saka;
  return EXTENDED_CALENDAR_NAMES[language].buddhist;
}

function monthLabel(
  kind: CalendarKind,
  year: number,
  month: number,
  translations: TranslationPack,
  locale: string,
  leapMonth = false,
): string {
  if (kind === "sacred") return `${translations.month} ${month}`;
  if (kind === "hebrew") {
    if (month === 12 && isHebrewLeapYear(year)) return "Adar I";
    return HEBREW_MONTH_NAMES[month];
  }
  if (kind === "chinese") {
    return `${leapMonth ? "Leap " : ""}${translations.month} ${month}`;
  }
  if (kind === "saka") return SAKA_MONTH_NAMES[month];
  if (kind === "buddhist") return THAI_BUDDHIST_MONTH_NAMES[month];
  if (kind === "gregorian" || kind === "julian") {
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
  if (kind === "julian") {
    const monthName = monthLabel(kind, date.year, date.month, translations, locale);
    return locale === "en-US"
      ? `${monthName} ${date.day}, ${formatYear(date.year)}`
      : `${date.day} ${monthName} ${formatYear(date.year)}`;
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
    return `${date.day} ${monthLabel(kind, date.year, date.month, translations, locale, date.leapMonth)} ${date.year} AM`;
  }
  if (kind === "chinese") {
    return `${date.day} ${monthLabel(kind, date.year, date.month, translations, locale, date.leapMonth)} · Chinese year ${date.year}`;
  }
  if (kind === "saka") {
    return `${date.day} ${SAKA_MONTH_NAMES[date.month]} ${date.year} Saka`;
  }
  if (kind === "buddhist") {
    const monthName = monthLabel(kind, date.year, date.month, translations, locale);
    return locale === "en-US"
      ? `${monthName} ${date.day}, ${date.year} BE`
      : `${date.day} ${monthName} ${date.year} BE`;
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
        : kind === "julian"
          ? date.year > 0
            ? "Julian CE"
            : "Julian BCE"
          : kind === "islamic"
          ? date.year > 0
            ? "AH"
            : "BH"
          : kind === "chinese"
            ? "Chinese"
            : kind === "saka"
              ? "Saka"
              : kind === "buddhist"
                ? "BE"
          : date.year > 0
            ? "CE"
            : "BCE";
  const displayYear =
    (kind === "gregorian" || kind === "julian" || kind === "islamic") &&
    date.year <= 0
      ? 1 - date.year
      : date.year;
  const monthCode = `${String(date.month).padStart(2, "0")}${
    kind === "chinese" && date.leapMonth ? "L" : ""
  }`;
  return `${prefix} ${displayYear} · ${monthCode} · ${String(date.day).padStart(2, "0")}`;
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

function formatGridCalendarDate(
  kind: CalendarKind,
  fixed: number,
  locale: string,
): string {
  const date = dateFromFixed(kind, fixed);

  if (kind === "sacred") {
    return `ISC ${date.year} · ${date.month} · ${date.day}`;
  }
  if (kind === "hebrew") {
    return `${date.day} ${HEBREW_MONTH_NAMES[date.month]} ${date.year} AM`;
  }
  if (kind === "islamic") {
    const year = date.year > 0 ? date.year : 1 - date.year;
    const era = date.year > 0 ? "AH" : "BH";
    return `${date.day} ${ISLAMIC_MONTH_NAMES[date.month]} ${year} ${era}`;
  }
  if (kind === "chinese") {
    return `${date.day} ${date.leapMonth ? "Leap " : ""}M${date.month} · ${date.year}`;
  }
  if (kind === "saka") {
    return `${date.day} ${SAKA_MONTH_NAMES[date.month]} ${date.year}`;
  }
  if (kind === "buddhist") {
    return `${date.day} ${THAI_BUDDHIST_MONTH_NAMES[date.month]} ${date.year} BE`;
  }

  const month = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, date.month - 1, 1)));
  const year = date.year > 0 ? `${date.year}` : `${1 - date.year} BCE`;

  return locale === "en-US"
    ? `${month} ${date.day}, ${year}`
    : `${date.day} ${month} ${year}`;
}

function equivalentFor(kind: CalendarKind, fixed: number): CalendarDate {
  return dateFromFixed(kind, fixed);
}

function safeDate(kind: CalendarKind, candidate: CalendarDate): CalendarDate {
  if (kind === "chinese") {
    const year = Math.max(1, candidate.year);
    const months = chineseMonthsInYear(year);
    const selectedMonth =
      months.find(
        (month) =>
          month.month === candidate.month &&
          month.leapMonth === Boolean(candidate.leapMonth),
      ) ??
      months.find(
        (month) => month.month === candidate.month && !month.leapMonth,
      ) ??
      months[0];
    return {
      year,
      month: selectedMonth.month,
      day: Math.min(Math.max(1, candidate.day), selectedMonth.days),
      leapMonth: selectedMonth.leapMonth,
    };
  }

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
  const monthOptions =
    kind === "chinese"
      ? chineseMonthsInYear(date.year).map((month) => ({
          value: `${month.month}${month.leapMonth ? "L" : ""}`,
          month: month.month,
          leapMonth: month.leapMonth,
        }))
      : Array.from({ length: monthCount }, (_, index) => ({
          value: `${index + 1}`,
          month: index + 1,
          leapMonth: false,
        }));
  const usesEra =
    kind === "gregorian" || kind === "julian" || kind === "islamic";
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
          value={`${date.month}${date.leapMonth ? "L" : ""}`}
          onChange={(event) => {
            const leapMonth = event.target.value.endsWith("L");
            update({
              month: Number.parseInt(event.target.value, 10),
              leapMonth,
            });
          }}
        >
          {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {monthLabel(
                  kind,
                  date.year,
                  month.month,
                  translations,
                  locale,
                  month.leapMonth,
                )}
              </option>
            ))}
        </select>
      </label>
      <label>
        <span>{translations.day}</span>
        <input
          aria-label={translations.day}
          type="number"
          min={1}
          max={maxDayForDate(
            kind,
            date.year,
            date.month,
            Boolean(date.leapMonth),
          )}
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
            <option value="after">{kind === "islamic" ? "AH" : "CE"}</option>
            <option value="before">{kind === "islamic" ? "BH" : "BCE"}</option>
          </select>
        </label>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [gridOffset, setGridOffset] = useState(0);
  const [weekStart, setWeekStart] = useState<WeekStart>("monday");
  const [todayFixed, setTodayFixed] = useState(DEFAULT_FIXED);
  const [from, setFrom] = useState<CalendarKind>("gregorian");
  const [to, setTo] = useState<CalendarKind>("sacred");
  const [sourceDate, setSourceDate] = useState<CalendarDate>(() =>
    equivalentFor("gregorian", DEFAULT_FIXED),
  );
  const languageConfig =
    LANGUAGES.find((candidate) => candidate.code === language) ??
    DEFAULT_LANGUAGE_CONFIG;
  const translations = TRANSLATIONS[language];
  const moonTranslations = MOON_TRANSLATIONS[language];
  const importantDateCopy = IMPORTANT_DATE_TRANSLATIONS[language];

  useEffect(() => {
    const stored = window.localStorage.getItem("isc-language") as LanguageCode | null;
    const next = LANGUAGES.some((candidate) => candidate.code === stored)
      ? (stored as LanguageCode)
      : "en";
    const config =
      LANGUAGES.find((candidate) => candidate.code === next) ??
      DEFAULT_LANGUAGE_CONFIG;
    document.documentElement.lang = config.locale;
    document.documentElement.dir = config.direction;
    const frame = window.requestAnimationFrame(() => {
      setLanguage(next);
      setTodayFixed(currentLocalFixed());
    });
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
    const fixed = currentLocalFixed();
    setTodayFixed(fixed);
    setSourceDate(equivalentFor(from, fixed));
    setGridOffset(0);
  }

  function changeLanguage(next: LanguageCode) {
    setLanguage(next);
    window.localStorage.setItem("isc-language", next);
    const config =
      LANGUAGES.find((candidate) => candidate.code === next) ??
      DEFAULT_LANGUAGE_CONFIG;
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
      julian: dateFromFixed("julian", fixed),
      islamic: dateFromFixed("islamic", fixed),
      chinese: dateFromFixed("chinese", fixed),
      saka: dateFromFixed("saka", fixed),
      buddhist: dateFromFixed("buddhist", fixed),
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
  const todaySacred = sacredFromFixed(todayFixed);
  const todayGridMonth =
    (todaySacred.year - 1) * SACRED_MONTHS_PER_YEAR + todaySacred.month - 1;
  const visibleGridMonth = Math.max(0, baseGridMonth + gridOffset);
  const gridSacred: CalendarDate = {
    year: Math.floor(visibleGridMonth / SACRED_MONTHS_PER_YEAR) + 1,
    month: (visibleGridMonth % SACRED_MONTHS_PER_YEAR) + 1,
    day: 1,
  };
  const gridStartFixed = fixedFromSacred(gridSacred);
  const gridNewMoons = meanNewMoonsBetween(
    gridStartFixed,
    gridStartFixed + SACRED_DAYS_PER_MONTH - 1,
  );
  const gridHolidays = majorHolidaysBetween(
    from,
    gridStartFixed,
    gridStartFixed + SACRED_DAYS_PER_MONTH - 1,
  );
  const gridInternationalHolidays = internationalHolidaysBetween(
    gridStartFixed,
    gridStartFixed + SACRED_DAYS_PER_MONTH - 1,
  );
  const gridMoonAlignment = moonAlignmentAtSacredMonth(gridSacred);
  const gridRotationAnniversary =
    gridSacred.month === 1 &&
    gridSacred.year > 1 &&
    (gridSacred.year - 1) % SACRED_ROTATION_YEARS === 0
      ? (gridSacred.year - 1) / SACRED_ROTATION_YEARS
      : null;
  const moonAlignments = moonAlignmentsAround(calculation.fixed, 5, 5);
  const importantDates = IMPORTANT_DATES.map((event) => ({
    ...event,
    sacred: dateFromFixed("sacred", event.fixed),
    gregorian: dateFromFixed("gregorian", event.fixed),
  }));
  const weekStartFixed = weekStart === "sunday" ? 0 : 1;
  const leadingGridDays =
    ((gridStartFixed - weekStartFixed) % 7 + 7) % 7;
  const trailingGridDays =
    (7 - ((leadingGridDays + SACRED_DAYS_PER_MONTH) % 7)) % 7;
  const gridWeekdays = Array.from({ length: 7 }, (_, index) =>
    localizedWeekday(weekStartFixed + index, languageConfig.locale),
  );

  return (
    <main dir={languageConfig.direction}>
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#top" aria-label="International Sacred Calendar home">
          <Image
            className="brand-logo"
            src="/isc-logo-web.png"
            alt=""
            width={60}
            height={60}
            priority
          />
          <span>
            <strong>International Sacred Calendar</strong>
            <small>{translations.brandSubtitle}</small>
          </span>
        </a>
        <div className="nav-links">
          <a href="#converter">{translations.navConvert}</a>
          <a href="#cycle">{translations.navCycle}</a>
          <a href="#important-dates">{importantDateCopy.navLabel}</a>
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
                    {calendarLabel(calendar, translations, language)}
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
                    {calendarLabel(calendar, translations, language)}
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
                  } ${
                    anniversary.number === 20 &&
                    anniversary.fixed > calculation.fixed
                      ? "future-twentieth"
                      : ""
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
                  <th>{translations.julian}</th>
                  <th>{translations.muslim}</th>
                  <th>Chinese</th>
                  <th>Saka</th>
                  <th>Buddhist</th>
                  <th>{translations.weekday}</th>
                </tr>
              </thead>
              <tbody>
                {anniversaries.map((anniversary) => (
                  <tr
                    className={
                      anniversary.number === 20 &&
                      anniversary.fixed > calculation.fixed
                        ? "future-twentieth-row"
                        : undefined
                    }
                    key={anniversary.number}
                  >
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
                    <td>{formatDate("julian", anniversary.julian, translations, languageConfig.locale)}</td>
                    <td>{formatDate("islamic", anniversary.islamic, translations, languageConfig.locale)}</td>
                    <td>{formatDate("chinese", anniversary.chinese, translations, languageConfig.locale)}</td>
                    <td>{formatDate("saka", anniversary.saka, translations, languageConfig.locale)}</td>
                    <td>{formatDate("buddhist", anniversary.buddhist, translations, languageConfig.locale)}</td>
                    <td>{localizedWeekday(anniversary.fixed, languageConfig.locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="important-dates-section" id="important-dates">
        <div className="section-heading important-dates-heading">
          <span>03 — {importantDateCopy.kicker}</span>
          <h2>{importantDateCopy.title}</h2>
          <p>{importantDateCopy.body}</p>
        </div>

        <div className="important-dates-grid">
          {importantDates.map((event) => {
            const title =
              event.id === "discovery"
                ? importantDateCopy.discovery
                : importantDateCopy.birthday;
            const firstRepeatLabel =
              event.id === "discovery"
                ? `${importantDateCopy.anniversary} #1`
                : `${(event.baseBirthday ?? 0) + 1} ${importantDateCopy.birthdayLabel}`;

            return (
              <article className={`important-date-card ${event.id}`} key={event.id}>
                <div className="important-date-card-heading">
                  <time dateTime={
                    event.id === "discovery" ? "2026-07-27" : "2026-07-28"
                  }>
                    <strong>{event.gregorian.day}</strong>
                    <span>
                      {monthLabel(
                        "gregorian",
                        event.gregorian.year,
                        event.gregorian.month,
                        translations,
                        languageConfig.locale,
                      )} {event.gregorian.year}
                    </span>
                  </time>
                  <span>{importantDateCopy.originalDate}</span>
                </div>
                <h3>{title}</h3>
                <div className="important-date-recurrence">
                  <span>{importantDateCopy.annualRecurrence}</span>
                  <strong>
                    ISC {event.sacred.month} · {event.sacred.day}
                  </strong>
                  <small>
                    {importantDateCopy.firstRepeat}: ISC {event.sacred.year + 1} · {event.sacred.month} · {event.sacred.day} · {firstRepeatLabel}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const targetMonth =
                      (event.sacred.year - 1) * SACRED_MONTHS_PER_YEAR +
                      event.sacred.month -
                      1;
                    setGridOffset(targetMonth - baseGridMonth);
                    document
                      .getElementById("calendar")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {importantDateCopy.viewInCalendar} →
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="calendar-section" id="calendar">
        <div className="section-heading calendar-heading">
          <span>04 — {moonTranslations.calendarKicker}</span>
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

        <div className="calendar-jumps" aria-label={moonTranslations.quickFind}>
          <span>{moonTranslations.quickFind}</span>
          <div>
            <button
              type="button"
              className={visibleGridMonth === baseGridMonth ? "active" : ""}
              onClick={() => setGridOffset(0)}
            >
              <span className="jump-symbol selected-symbol" aria-hidden="true">◎</span>
              {moonTranslations.findSelectedDate}
            </button>
            <button
              type="button"
              className={visibleGridMonth === todayGridMonth ? "active" : ""}
              onClick={() => setGridOffset(todayGridMonth - baseGridMonth)}
            >
              <span className="jump-symbol today-symbol" aria-hidden="true">●</span>
              {moonTranslations.findToday}
            </button>
          </div>
          <label className="week-start-picker">
            <span>{moonTranslations.weekStartsOn}</span>
            <select
              aria-label={moonTranslations.weekStartsOn}
              value={weekStart}
              onChange={(event) => setWeekStart(event.target.value as WeekStart)}
            >
              <option value="sunday">{moonTranslations.sunday}</option>
              <option value="monday">{moonTranslations.monday}</option>
            </select>
          </label>
          <label className="grid-calendar-picker">
            <span>{moonTranslations.gridCalendar}</span>
            <select
              aria-label={moonTranslations.gridCalendar}
              value={from}
              onChange={(event) => changeFrom(event.target.value as CalendarKind)}
            >
              {CALENDARS.map((calendar) => (
                <option value={calendar} key={calendar}>
                  {calendarLabel(calendar, translations, language)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="calendar-legend" aria-label="Calendar event legend">
          <span>
            <i className="international-marker" aria-hidden="true">◎</i>
            {moonTranslations.internationalHoliday}
          </span>
          {from !== "sacred" ? (
            <span>
              <i className="holiday-marker" aria-hidden="true">✣</i>
              {moonTranslations.majorHoliday}
            </span>
          ) : null}
          <span>
            <i className="new-moon-marker" aria-hidden="true">●</i>
            {moonTranslations.newMoon}
          </span>
          <span>
            <i className="moon-marker" aria-hidden="true">◐</i>
            {moonTranslations.lunarAlignment}
          </span>
          <span>
            <i className="rotation-marker" aria-hidden="true">✦</i>
            {moonTranslations.rotationAnniversary}
          </span>
          <span>
            <i className="important-marker" aria-hidden="true">◆</i>
            {importantDateCopy.kicker}
          </span>
        </div>

        <div className="calendar-grid" role="grid">
          {gridWeekdays.map((weekday) => (
            <div className="calendar-weekday" role="columnheader" key={weekday}>
              {weekday}
            </div>
          ))}
          {Array.from({ length: leadingGridDays }, (_, index) => (
            <div
              className="calendar-day calendar-day-empty"
              role="gridcell"
              aria-hidden="true"
              key={`leading-${index}`}
            />
          ))}
          {Array.from({ length: SACRED_DAYS_PER_MONTH }, (_, index) => index + 1).map(
            (day) => {
              const cellFixed = gridStartFixed + day - 1;
              const selected = cellFixed === calculation.fixed;
              const isToday = cellFixed === todayFixed;
              const hasNewMoon = gridNewMoons.some(
                (event) => event.fixed === cellFixed,
              );
              const holidays = gridHolidays.filter(
                (event) => event.fixed === cellFixed,
              );
              const internationalHolidays = gridInternationalHolidays.filter(
                (event) => event.fixed === cellFixed,
              );
              const hasMoonAlignment = day === 1 && Boolean(gridMoonAlignment);
              const hasRotationAnniversary =
                day === 1 && gridRotationAnniversary !== null;
              const importantEvents = importantDates
                .filter(
                  (event) =>
                    gridSacred.year >= event.sacred.year &&
                    gridSacred.month === event.sacred.month &&
                    day === event.sacred.day,
                )
                .map((event) => ({
                  ...event,
                  anniversaryNumber: gridSacred.year - event.sacred.year,
                }));

              return (
                <div
                  className={[
                    "calendar-day",
                    selected ? "selected" : "",
                    isToday ? "today" : "",
                    internationalHolidays.length > 0 ||
                    holidays.length > 0 ||
                    hasNewMoon ||
                    hasMoonAlignment ||
                    hasRotationAnniversary ||
                    importantEvents.length > 0
                      ? "has-event"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="gridcell"
                  aria-selected={selected}
                  aria-current={isToday ? "date" : undefined}
                  key={day}
                >
                  <div className="calendar-day-heading">
                    <span className="day-number">{day}</span>
                    <span className="grid-calendar-date">
                      {formatGridCalendarDate(
                        from,
                        cellFixed,
                        languageConfig.locale,
                      )}
                    </span>
                  </div>
                  <div className="day-events">
                    {selected ? (
                      <span className="event-pill selected-pill">
                        {moonTranslations.selectedDate}
                      </span>
                    ) : null}
                    {isToday ? (
                      <span className="event-pill today-pill">
                        {moonTranslations.today}
                      </span>
                    ) : null}
                    {hasNewMoon ? (
                      <span className="event-pill new-moon-pill">
                        ● {moonTranslations.newMoon}
                      </span>
                    ) : null}
                    {holidays.map((holiday) => (
                      <span className="event-pill holiday-pill" key={holiday.id}>
                        ✣ {holiday.name}
                      </span>
                    ))}
                    {internationalHolidays.map((holiday) => (
                      <span
                        className="event-pill international-pill"
                        key={holiday.id}
                      >
                        ◎ {holiday.name}
                      </span>
                    ))}
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
                    {importantEvents.map((event) => (
                      <span
                        className={`event-pill important-pill ${event.id}-pill`}
                        key={event.id}
                      >
                        {event.id === "discovery"
                          ? event.anniversaryNumber === 0
                            ? importantDateCopy.discovery
                            : `${importantDateCopy.anniversary} #${event.anniversaryNumber}`
                          : `Ovadia Binyamin · ${(event.baseBirthday ?? 0) + event.anniversaryNumber} ${importantDateCopy.birthdayLabel}`}
                      </span>
                    ))}
                  </div>
                </div>
              );
            },
          )}
          {Array.from({ length: trailingGridDays }, (_, index) => (
            <div
              className="calendar-day calendar-day-empty"
              role="gridcell"
              aria-hidden="true"
              key={`trailing-${index}`}
            />
          ))}
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
              const julian = dateFromFixed("julian", alignment.fixed);
              const hebrew = dateFromFixed("hebrew", alignment.fixed);
              const islamic = dateFromFixed("islamic", alignment.fixed);
              const chinese = dateFromFixed("chinese", alignment.fixed);
              const saka = dateFromFixed("saka", alignment.fixed);
              const buddhist = dateFromFixed("buddhist", alignment.fixed);

              return (
                <article
                  className={isPast ? "past-alignment" : "future-alignment"}
                  key={`${alignment.sacred.year}-${alignment.sacred.month}`}
                >
                  <div className="alignment-index">
                    <span>{isPast ? moonTranslations.past : moonTranslations.future}</span>
                    <strong>
                      ISC {alignment.sacred.year} · {alignment.sacred.month} · 1
                    </strong>
                  </div>
                  <div>
                    <span>{translations.gregorian} / {translations.julian}</span>
                    <strong>
                      {formatDate("gregorian", gregorian, translations, languageConfig.locale)}
                      {" · "}
                      {formatDate("julian", julian, translations, languageConfig.locale)}
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
                  <div className="alignment-extended-dates">
                    <span>Chinese / Saka / Buddhist</span>
                    <strong>
                      {formatDate("chinese", chinese, translations, languageConfig.locale)}
                      {" · "}
                      {formatDate("saka", saka, translations, languageConfig.locale)}
                      {" · "}
                      {formatDate("buddhist", buddhist, translations, languageConfig.locale)}
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
          <span>05 — {translations.definitionKicker}</span>
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
            <div className="creation-weekday-note">
              <strong>Sunday ↔ Monday</strong>
              <span>{translations.creationAnchorNote}</span>
            </div>
          </article>
          <article className="principle-card quote-card">
            <blockquote>{translations.quote}</blockquote>
            <p>{translations.quoteBody}</p>
          </article>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <Image
            className="brand-logo"
            src="/isc-logo-web.png"
            alt=""
            width={48}
            height={48}
          />
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
