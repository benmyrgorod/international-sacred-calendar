import {
  fixedFromDate,
  maxDayForDate,
  type CalendarDate,
} from "./sacred-calendar.ts";

export type HistoryCategory =
  | "hebrew"
  | "civilization"
  | "freedom"
  | "science"
  | "modern";

export type HistoryPrecision = "day" | "month" | "year";
export type HistorySourceCalendar = "hebrew" | "gregorian" | "julian";

export interface HistoricalDateSpec extends CalendarDate {
  calendar: HistorySourceCalendar;
  precision: HistoryPrecision;
  approximate?: boolean;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  category: HistoryCategory;
  date: HistoricalDateSpec;
  source: keyof typeof HISTORY_SOURCES;
  note?: string;
  symbolism?: string;
}

export interface HistoricalEventRange {
  startFixed: number;
  endFixed: number;
}

export const HISTORY_SOURCES = {
  chabad: {
    label: "Traditional Hebrew chronology",
    url: "https://www.chabad.org/library/article_cdo/aid/3915966/jewish/Timeline-of-Jewish-History.htm",
  },
  met: {
    label: "Heilbrunn Timeline of Art History",
    url: "https://www.metmuseum.org/toah/",
  },
  reference: {
    label: "Encyclopaedia Britannica · On This Day",
    url: "https://www.britannica.com/on-this-day",
  },
  archives: {
    label: "U.S. National Archives",
    url: "https://www.archives.gov/founding-docs",
  },
  un: {
    label: "United Nations history",
    url: "https://www.un.org/en/about-us/history-of-the-un",
  },
  nasa: {
    label: "NASA history",
    url: "https://www.nasa.gov/history/",
  },
  cern: {
    label: "CERN history",
    url: "https://home.cern/science/computing/birth-web",
  },
  who: {
    label: "World Health Organization",
    url: "https://www.who.int/europe/health-topics/coronavirus",
  },
  isc: {
    label: "International Sacred Calendar record",
    url: "https://sacredcal.one/#important-dates",
  },
} as const;

const hebrew = (
  year: number,
  month = 7,
  day = 1,
  precision: HistoryPrecision = "year",
): HistoricalDateSpec => ({
  calendar: "hebrew",
  year,
  month,
  day,
  precision,
});

const gregorian = (
  year: number,
  month = 1,
  day = 1,
  precision: HistoryPrecision = "day",
  approximate = false,
): HistoricalDateSpec => ({
  calendar: "gregorian",
  year,
  month,
  day,
  precision,
  approximate,
});

const julian = (
  year: number,
  month: number,
  day: number,
): HistoricalDateSpec => ({
  calendar: "julian",
  year,
  month,
  day,
  precision: "day",
});

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: "creation-begins",
    title: "First day of Creation",
    category: "hebrew",
    date: hebrew(1, 6, 25, "day"),
    source: "chabad",
    note: "The ISC epoch: 25 Elul AM 1, six days before the creation of humanity.",
    symbolism: "The beginning of International Sacred time.",
  },
  {
    id: "humanity-created",
    title: "Creation of Adam and Eve",
    category: "hebrew",
    date: hebrew(2, 7, 1, "day"),
    source: "chabad",
    note: "Rosh Hashanah commemorates the sixth day of Creation, when humanity was created.",
  },
  {
    id: "writing-emerges",
    title: "Earliest writing systems emerge",
    category: "civilization",
    date: gregorian(-3399, 1, 1, "year", true),
    source: "met",
  },
  {
    id: "great-pyramid",
    title: "Great Pyramid of Giza completed",
    category: "civilization",
    date: gregorian(-2559, 1, 1, "year", true),
    source: "met",
  },
  {
    id: "flood-begins",
    title: "The Great Flood begins",
    category: "hebrew",
    date: hebrew(1656, 8, 17, "day"),
    source: "chabad",
    note: "Traditional date according to Rabbi Eliezer's chronology.",
  },
  {
    id: "hammurabi-code",
    title: "Code of Hammurabi compiled",
    category: "civilization",
    date: gregorian(-1753, 1, 1, "year", true),
    source: "met",
  },
  {
    id: "abraham-born",
    title: "Birth of Abraham",
    category: "hebrew",
    date: hebrew(1948),
    source: "chabad",
  },
  {
    id: "covenant-circumcision",
    title: "Covenant of circumcision with Abraham",
    category: "hebrew",
    date: hebrew(2048, 1, 13, "day"),
    source: "chabad",
    note: "Traditional date: 13 Nisan AM 2048, two days before Isaac's birth.",
  },
  {
    id: "isaac-born",
    title: "Birth of Isaac",
    category: "hebrew",
    date: hebrew(2048, 1, 15, "day"),
    source: "chabad",
  },
  {
    id: "jacob-esau-born",
    title: "Birth of Jacob and Esau",
    category: "hebrew",
    date: hebrew(2108, 1, 15, "day"),
    source: "chabad",
  },
  {
    id: "israel-descends-egypt",
    title: "Jacob's family descends to Egypt",
    category: "hebrew",
    date: hebrew(2238),
    source: "chabad",
  },
  {
    id: "exodus-egypt",
    title: "Exodus from Egypt",
    category: "hebrew",
    date: hebrew(2448, 1, 15, "day"),
    source: "chabad",
  },
  {
    id: "torah-sinai",
    title: "Giving of the Torah at Sinai",
    category: "hebrew",
    date: hebrew(2448, 3, 6, "day"),
    source: "chabad",
  },
  {
    id: "spies-decree",
    title: "Decree after the report of the spies",
    category: "hebrew",
    date: hebrew(2449, 5, 9, "day"),
    source: "chabad",
  },
  {
    id: "enter-canaan",
    title: "Israelites enter the Land of Israel",
    category: "hebrew",
    date: hebrew(2488, 1, 10, "day"),
    source: "chabad",
  },
  {
    id: "buddha-enlightenment",
    title: "Traditional era of the Buddha's enlightenment",
    category: "civilization",
    date: gregorian(-527, 1, 1, "year", true),
    source: "reference",
    note: "The historical year is debated across Buddhist traditions.",
  },
  {
    id: "rome-founded",
    title: "Traditional founding of Rome",
    category: "civilization",
    date: julian(-752, 4, 21),
    source: "reference",
    symbolism: "Rome's traditional birthday, still commemorated on 21 April.",
  },
  {
    id: "qin-unification",
    title: "Qin unifies China",
    category: "civilization",
    date: gregorian(-220, 1, 1, "year", true),
    source: "reference",
  },
  {
    id: "caesar-assassinated",
    title: "Assassination of Julius Caesar",
    category: "civilization",
    date: julian(-43, 3, 15),
    source: "reference",
    symbolism: "The Ides of March became a lasting symbol of political betrayal.",
  },
  {
    id: "david-king",
    title: "David becomes king",
    category: "hebrew",
    date: hebrew(2884),
    source: "chabad",
  },
  {
    id: "first-temple-work",
    title: "Construction of the First Temple begins",
    category: "hebrew",
    date: hebrew(2928, 2, 2, "day"),
    source: "chabad",
  },
  {
    id: "first-temple-completed",
    title: "First Temple completed",
    category: "hebrew",
    date: hebrew(2935, 8, 1, "month"),
    source: "chabad",
    note: "Scripture records completion in the month of Bul (Cheshvan); no day is specified.",
  },
  {
    id: "first-temple-dedicated",
    title: "First Temple dedicated",
    category: "hebrew",
    date: hebrew(2936),
    source: "chabad",
  },
  {
    id: "kingdom-divided",
    title: "Kingdom divides into Israel and Judah",
    category: "hebrew",
    date: hebrew(2964),
    source: "chabad",
  },
  {
    id: "first-temple-destroyed",
    title: "First Temple destroyed",
    category: "hebrew",
    date: hebrew(3338, 5, 9, "day"),
    source: "chabad",
    note: "Traditional Hebrew chronology; the destruction begins the Babylonian exile. Academic chronologies commonly place the destruction in 587/586 BCE.",
  },
  {
    id: "purim",
    title: "Deliverance commemorated by Purim",
    category: "hebrew",
    date: hebrew(3405, 12, 14, "day"),
    source: "chabad",
  },
  {
    id: "second-temple-completed",
    title: "Second Temple completed",
    category: "hebrew",
    date: hebrew(3412, 13, 3, "day"),
    source: "chabad",
  },
  {
    id: "chanukah-dedication",
    title: "Temple rededication commemorated by Chanukah",
    category: "hebrew",
    date: hebrew(3622, 9, 25, "day"),
    source: "chabad",
  },
  {
    id: "second-temple-destroyed",
    title: "Second Temple destroyed",
    category: "hebrew",
    date: hebrew(3829, 5, 9, "day"),
    source: "chabad",
    note: "Traditional Hebrew date; civil-year conventions vary between 68 and 70 CE.",
  },
  {
    id: "mishnah-compiled",
    title: "Mishnah compiled",
    category: "hebrew",
    date: hebrew(3949),
    source: "chabad",
  },
  {
    id: "talmud-completed",
    title: "Babylonian Talmud redacted",
    category: "hebrew",
    date: hebrew(4260),
    source: "chabad",
  },
  {
    id: "western-rome-falls",
    title: "Western Roman Empire falls",
    category: "civilization",
    date: julian(476, 9, 4),
    source: "reference",
  },
  {
    id: "hijra",
    title: "Hijra and the Islamic calendar epoch",
    category: "civilization",
    date: julian(622, 7, 16),
    source: "reference",
    symbolism: "The migration from Mecca to Medina marks the epoch of Islamic years.",
  },
  {
    id: "hastings",
    title: "Battle of Hastings",
    category: "civilization",
    date: julian(1066, 10, 14),
    source: "reference",
  },
  {
    id: "magna-carta",
    title: "Magna Carta sealed",
    category: "freedom",
    date: julian(1215, 6, 15),
    source: "reference",
  },
  {
    id: "black-death",
    title: "Black Death reaches Europe",
    category: "modern",
    date: gregorian(1347, 1, 1, "year", true),
    source: "reference",
  },
  {
    id: "gutenberg-bible",
    title: "Gutenberg Bible completed",
    category: "science",
    date: gregorian(1455, 1, 1, "year", true),
    source: "reference",
  },
  {
    id: "columbus-americas",
    title: "Columbus reaches the Americas",
    category: "civilization",
    date: julian(1492, 10, 12),
    source: "reference",
  },
  {
    id: "reformation",
    title: "Protestant Reformation begins",
    category: "civilization",
    date: julian(1517, 10, 31),
    source: "reference",
  },
  {
    id: "copernicus",
    title: "Copernicus publishes the heliocentric model",
    category: "science",
    date: julian(1543, 5, 24),
    source: "reference",
  },
  {
    id: "gregorian-calendar",
    title: "Gregorian calendar begins",
    category: "science",
    date: gregorian(1582, 10, 15),
    source: "reference",
    symbolism: "A civil calendar reform made ten dates disappear where it was adopted.",
  },
  {
    id: "galileo-telescope",
    title: "Galileo demonstrates his telescope",
    category: "science",
    date: gregorian(1609, 8, 25),
    source: "reference",
  },
  {
    id: "westphalia",
    title: "Peace of Westphalia signed",
    category: "freedom",
    date: gregorian(1648, 10, 24),
    source: "reference",
  },
  {
    id: "principia",
    title: "Newton publishes Principia",
    category: "science",
    date: julian(1687, 7, 5),
    source: "reference",
  },
  {
    id: "us-declaration",
    title: "United States Declaration of Independence adopted",
    category: "freedom",
    date: gregorian(1776, 7, 4),
    source: "archives",
    symbolism: "A national independence date that became a recurring civic anniversary.",
  },
  {
    id: "french-revolution",
    title: "Storming of the Bastille · French Revolution",
    category: "freedom",
    date: gregorian(1789, 7, 14),
    source: "reference",
    symbolism: "Now commemorated as France's national day.",
  },
  {
    id: "haitian-independence",
    title: "Haiti declares independence",
    category: "freedom",
    date: gregorian(1804, 1, 1),
    source: "reference",
  },
  {
    id: "origin-species",
    title: "Darwin publishes On the Origin of Species",
    category: "science",
    date: gregorian(1859, 11, 24),
    source: "reference",
  },
  {
    id: "emancipation",
    title: "Emancipation Proclamation takes effect",
    category: "freedom",
    date: gregorian(1863, 1, 1),
    source: "archives",
  },
  {
    id: "powered-flight",
    title: "First sustained powered airplane flight",
    category: "science",
    date: gregorian(1903, 12, 17),
    source: "reference",
  },
  {
    id: "world-war-one",
    title: "First World War begins",
    category: "modern",
    date: gregorian(1914, 7, 28),
    source: "reference",
  },
  {
    id: "russian-revolution",
    title: "October Revolution in Russia",
    category: "modern",
    date: julian(1917, 10, 25),
    source: "reference",
    note: "25 October in the Julian calendar was 7 November Gregorian.",
  },
  {
    id: "armistice",
    title: "Armistice ends fighting in the First World War",
    category: "modern",
    date: gregorian(1918, 11, 11),
    source: "reference",
    symbolism: "The eleventh hour of the eleventh day of the eleventh month.",
  },
  {
    id: "penicillin",
    title: "Penicillin discovered",
    category: "science",
    date: gregorian(1928, 9, 28),
    source: "reference",
  },
  {
    id: "world-war-two",
    title: "Second World War begins in Europe",
    category: "modern",
    date: gregorian(1939, 9, 1),
    source: "reference",
  },
  {
    id: "d-day",
    title: "D-Day landings in Normandy",
    category: "modern",
    date: gregorian(1944, 6, 6),
    source: "reference",
    symbolism: "The date 6/6 became inseparable from the name D-Day.",
  },
  {
    id: "auschwitz-liberated",
    title: "Auschwitz-Birkenau liberated",
    category: "modern",
    date: gregorian(1945, 1, 27),
    source: "reference",
    symbolism: "Observed internationally as Holocaust Remembrance Day.",
  },
  {
    id: "hiroshima",
    title: "Atomic bomb dropped on Hiroshima",
    category: "modern",
    date: gregorian(1945, 8, 6),
    source: "reference",
  },
  {
    id: "un-founded",
    title: "United Nations comes into existence",
    category: "freedom",
    date: gregorian(1945, 10, 24),
    source: "un",
    symbolism: "Observed annually as United Nations Day.",
  },
  {
    id: "india-independence",
    title: "India becomes independent",
    category: "freedom",
    date: gregorian(1947, 8, 15),
    source: "reference",
  },
  {
    id: "israel-independence",
    title: "Declaration of the State of Israel",
    category: "freedom",
    date: gregorian(1948, 5, 14),
    source: "reference",
  },
  {
    id: "udhr",
    title: "Universal Declaration of Human Rights adopted",
    category: "freedom",
    date: gregorian(1948, 12, 10),
    source: "un",
    symbolism: "Observed annually as Human Rights Day.",
  },
  {
    id: "prc-founded",
    title: "People's Republic of China proclaimed",
    category: "modern",
    date: gregorian(1949, 10, 1),
    source: "reference",
  },
  {
    id: "dna-structure",
    title: "DNA double-helix structure published",
    category: "science",
    date: gregorian(1953, 4, 25),
    source: "reference",
  },
  {
    id: "sputnik",
    title: "Sputnik 1 launched",
    category: "science",
    date: gregorian(1957, 10, 4),
    source: "nasa",
  },
  {
    id: "human-spaceflight",
    title: "First human spaceflight",
    category: "science",
    date: gregorian(1961, 4, 12),
    source: "nasa",
  },
  {
    id: "moon-landing",
    title: "Apollo 11 lands humans on the Moon",
    category: "science",
    date: gregorian(1969, 7, 20),
    source: "nasa",
    symbolism: "The first human footsteps on another world.",
  },
  {
    id: "arpanet",
    title: "First ARPANET message sent",
    category: "science",
    date: gregorian(1969, 10, 29),
    source: "reference",
  },
  {
    id: "earth-day",
    title: "First Earth Day",
    category: "modern",
    date: gregorian(1970, 4, 22),
    source: "reference",
    symbolism: "A recurring date symbolizing global environmental responsibility.",
  },
  {
    id: "pi-day",
    title: "First organized Pi Day celebration",
    category: "science",
    date: gregorian(1988, 3, 14),
    source: "reference",
    symbolism: "3/14 mirrors the opening digits of π: 3.14.",
  },
  {
    id: "berlin-wall",
    title: "Berlin Wall opens",
    category: "freedom",
    date: gregorian(1989, 11, 9),
    source: "reference",
  },
  {
    id: "mandela-release",
    title: "Nelson Mandela released from prison",
    category: "freedom",
    date: gregorian(1990, 2, 11),
    source: "reference",
  },
  {
    id: "first-website",
    title: "World Wide Web becomes publicly available",
    category: "science",
    date: gregorian(1991, 8, 6),
    source: "cern",
  },
  {
    id: "soviet-dissolution",
    title: "Soviet Union dissolves",
    category: "modern",
    date: gregorian(1991, 12, 26),
    source: "reference",
  },
  {
    id: "september-eleven",
    title: "September 11 attacks",
    category: "modern",
    date: gregorian(2001, 9, 11),
    source: "reference",
    symbolism: "The date itself became a global name for the attacks and their aftermath.",
  },
  {
    id: "human-genome",
    title: "Human Genome Project completed",
    category: "science",
    date: gregorian(2003, 4, 14),
    source: "reference",
  },
  {
    id: "beijing-olympics",
    title: "Beijing Olympic Games open",
    category: "modern",
    date: gregorian(2008, 8, 8),
    source: "reference",
    symbolism: "The ceremony began at 8:08 p.m. on 8/8/08, emphasizing eight as an auspicious number.",
  },
  {
    id: "lhc-first-beam",
    title: "Large Hadron Collider circulates its first beam",
    category: "science",
    date: gregorian(2008, 9, 10),
    source: "cern",
  },
  {
    id: "covid-pandemic",
    title: "WHO characterizes COVID-19 as a pandemic",
    category: "modern",
    date: gregorian(2020, 3, 11),
    source: "who",
  },
  {
    id: "isc-discovery",
    title: "Discovery of the International Sacred Calendar",
    category: "modern",
    date: gregorian(2026, 7, 27),
    source: "isc",
    symbolism: "The founding date carried forward annually in Sacred time.",
  },
];

export function historicalEventRange(
  event: HistoricalEvent,
): HistoricalEventRange {
  const { calendar, precision } = event.date;
  const date: CalendarDate = {
    year: event.date.year,
    month: event.date.month,
    day: event.date.day,
    leapMonth: event.date.leapMonth,
  };
  let startFixed: number;
  try {
    startFixed = fixedFromDate(calendar, date);
  } catch (error) {
    throw new RangeError(
      `${event.id}: ${error instanceof Error ? error.message : "Invalid historical date."}`,
    );
  }

  if (precision === "day") {
    return { startFixed, endFixed: startFixed };
  }
  if (precision === "month") {
    return {
      startFixed,
      endFixed: fixedFromDate(calendar, {
        ...date,
        day: maxDayForDate(calendar, date.year, date.month),
      }),
    };
  }
  if (calendar === "hebrew") {
    return {
      startFixed,
      endFixed:
        fixedFromDate("hebrew", {
          year: date.year + 1,
          month: 7,
          day: 1,
        }) - 1,
    };
  }
  return {
    startFixed,
    endFixed: fixedFromDate(calendar, {
      year: date.year,
      month: 12,
      day: 31,
    }),
  };
}

export const SORTED_HISTORICAL_EVENTS = [...HISTORICAL_EVENTS].sort(
  (left, right) =>
    historicalEventRange(left).startFixed - historicalEventRange(right).startFixed,
);

if (HISTORICAL_EVENTS.length !== 80) {
  throw new Error(
    `The major-events chronology must contain exactly 80 dates; found ${HISTORICAL_EVENTS.length}.`,
  );
}
