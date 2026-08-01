import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("major headings stay on one line at desktop widths and wrap on small screens", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(
    css,
    /@media \(min-width: 1101px\)\s*\{[^}]*\.history-heading h2\s*\{[^}]*white-space:\s*nowrap;/s,
  );
  assert.match(
    css,
    /\.history-event\.near-rotation-alignment\s*>\s*summary\s*\{[^}]*background:\s*rgba\(182, 144, 78, 0\.2\);/s,
  );
  assert.match(
    css,
    /\.history-event\.near-half-rotation-alignment\s*>\s*summary\s*\{[^}]*background:\s*rgba\(15, 82, 186, 0\.16\);/s,
  );
  assert.match(css, /\.history-event-pill\.near-alignment-pill/);
});

test("server-renders the International Sacred Calendar converter", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>International Sacred Calendar<\/title>/i);
  assert.match(html, /isc-logo-web\.png/);
  assert.match(html, /favicon-32x32\.png/);
  assert.match(html, /site\.webmanifest/);
  assert.match(html, /International Sacred Calendar/);
  assert.match(html, /all eight supported calendars/);
  assert.match(html, /Chinese Traditional Calendar/);
  assert.match(html, /Indian National Calendar \(Saka\)/);
  assert.match(html, /Thai Buddhist Calendar \(B\.E\.\)/);
  assert.match(html, /class="alignment-extended-dates"/);
  assert.match(html, /class="future-twentieth-row"/);
  assert.match(html, /Every date,/);
  assert.match(html, /Translate a date/);
  assert.match(html, /Rotating cycle/);
  assert.match(html, /Rotation anniversaries/);
  assert.match(html, /To the 20th anniversary/);
  assert.match(html, /Rotation anniversaries 1–22/);
  assert.match(html, /Cosmic week/);
  assert.match(html, /data-cosmic-week="1">Monday, Week 1</);
  assert.match(html, /data-cosmic-week="2">Tuesday, Week 1</);
  assert.match(html, /data-cosmic-week="7">Sunday, Week 1</);
  assert.match(html, /data-cosmic-week="8">Monday, Week 2</);
  assert.match(html, /data-cosmic-week="22">Monday, Week 4</);
  assert.equal((html.match(/data-cosmic-week=/g) ?? []).length, 22);
  for (const number of [7, 14, 21]) {
    assert.match(
      html,
      new RegExp(
        `class="featured-anniversary-row"[^>]*><th><button[^>]*>#<!-- -->${number}</button>`,
      ),
    );
  }
  assert.match(
    html,
    /class="sapphire-anniversary-row"[^>]*><th><button[^>]*>#<!-- -->22<\/button>/,
  );
  assert.match(html, /History near the 293-year marks/);
  assert.doesNotMatch(html, /rotation-history-panorama\.webp/);
  for (const image of [
    "great-pyramid.webp",
    "abraham-covenant.webp",
    "isaac.webp",
    "egypt-midpoint.webp",
    "first-temple.webp",
    "babylonian-exile.webp",
    "second-temple.webp",
    "hijra.webp",
    "magna-carta.webp",
    "columbus.webp",
    "us-independence.webp",
    "bastille.webp",
  ]) {
    assert.match(html, new RegExp(image.replace(".", "\\.")));
  }
  assert.equal(
    (html.match(/class="rotation-history-card(?:\s|\")/g) ?? []).length,
    12,
  );
  assert.match(html, /href="#rotation-history"/);
  assert.match(html, /href="#cosmic-time">Cosmic time<\/a>/);
  assert.match(html, /United States Declaration of Independence adopted/);
  assert.match(html, /class="history-event history-civilization near-rotation-alignment"/);
  assert.match(html, /class="history-event history-civilization near-half-rotation-alignment"/);
  assert.match(html, /Near a 293-year half-cycle/);
  assert.match(html, /Current \/ selected Cosmic Date/);
  assert.match(html, /A 293-year day, divided like a clock/);
  assert.match(html, /292 y · 72 d/);
  assert.match(html, /12 y · 63 d · 20 h/);
  assert.match(html, /74 d · 1 h · 32 min/);
  assert.match(html, /1 d · 5 h · 37 min · 32 s/);
  assert.match(html, /365-day common year/);
  assert.match(html, /aria-label="Cosmic Week"/);
  assert.match(html, /aria-label="Cosmic Day"/);
  assert.match(html, /aria-label="Cosmic Second"/);
  assert.match(html, /Apply Cosmic Date/);
  assert.match(html, /Five past and five future lunar alignments/);
  assert.match(html, /Eighty dates from Creation to today/);
  assert.match(html, /80 major events/);
  assert.match(html, /First Temple completed/);
  assert.match(html, /First Temple destroyed/);
  assert.match(html, /Storming of the Bastille · French Revolution/);
  assert.match(html, /The eleventh hour of the eleventh day/);
  assert.match(html, /8\/8\/08/);
  assert.match(html, /Date policy &amp; sources/);
  assert.equal((html.match(/class="history-event history-/g) ?? []).length, 80);
  assert.equal((html.match(/class="history-calendar-conversions"/g) ?? []).length, 80);
  assert.match(html, /class="event-pill history-event-pill"/);
  assert.match(html, /80 events in Sacred rhythm/);
  assert.match(html, /history-anniversary-pill/);
  assert.match(html, /Anniversary #/);
  assert.match(html, /href="#history-/);
  assert.match(html, /Discovery of the International Sacred Calendar/);
  assert.match(html, /href="#major-events"/);
  assert.match(html, /href="#lunar-alignments"/);
  assert.match(html, /class="site-menu"/);
  assert.match(html, /class="site-menu-panel"/);
  assert.match(html, /class="menu-label">Menu/);
  assert.match(html, /href="#converter">Date conversion/);
  assert.match(html, /href="#cycle">Calendar cycle/);
  assert.match(html, /href="#lunar-alignments">Moon alignment cycle/);
  for (const anchor of [
    "converter",
    "calendar",
    "planetary-hours",
    "cycle",
    "cosmic-time",
    "lunar-alignments",
    "important-dates",
    "major-events",
    "definition",
  ]) {
    assert.match(html, new RegExp(`href="#${anchor}"`));
  }
  assert.match(html, /Hours and days under seven planets/);
  assert.match(html, /Planetary hour calculator/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /Current time/);
  assert.match(html, /Days and their planets/);
  assert.match(html, /24-hour correspondence/);
  assert.match(html, /a planetary hour is not usually 60 minutes/);
  assert.match(html, /not a scientific prediction/);
  assert.match(html, /class="planetary-result-symbol planet-venus"/);
  assert.equal((html.match(/class="planet-card planet-/g) ?? []).length, 7);
  assert.equal((html.match(/class="(?:day|night)-hour-row"/g) ?? []).length, 24);
  assert.match(html, /Quick find/);
  assert.match(html, /Current date/);
  assert.match(html, /calendar-day selected today/);
  assert.match(html, /today-pill/);
  assert.match(html, /ISC 5805/);
  assert.match(html, /Español/);
  assert.match(html, /Français/);
  assert.match(html, /日本語/);
  assert.match(html, /简体中文/);
  assert.match(html, /한국어/);
  assert.equal((html.match(/class="milestone-button"/g) ?? []).length, 22);
  assert.equal(
    (html.match(/class="anniversary-tick[^"]*"/g) ?? []).length,
    20,
  );
  assert.match(html, /Creation-week anchor/);
  assert.match(html, /Sunday ↔ Monday/);
  assert.match(html, /Sunday is the traditional weekday/);
  assert.match(html, /Gregorian/);
  assert.match(html, /Julian/);
  assert.match(html, /<option value="monday" selected="">Monday<\/option>/);
  assert.match(html, /Discovery of the International Sacred Calendar/);
  assert.match(html, /40th birthday of Ovadia Binyamin/);
  assert.match(html, /Discovery anniversary/);
  assert.match(html, /class="new-moon-marker"/);
  assert.match(html, /New moon/);
  assert.match(html, /class="full-moon-marker"/);
  assert.match(html, /Full moon/);
  assert.match(
    html,
    /class="holiday-marker holiday-marker-gregorian"[^>]*>\s*✝\s*<\/i>/,
  );
  assert.match(html, /Major holiday/);
  assert.match(html, /class="international-marker"/);
  assert.match(html, /International holiday/);
  assert.match(html, /Moon alignment/);
  assert.match(html, /293-year anniversary/);
  assert.match(html, /293-year half-cycle anniversary/);
  assert.match(html, /class="half-rotation-marker"/);
  assert.match(html, /80 events in Sacred rhythm/);
  assert.match(html, /<span class="grid-calendar-date">Jul 27, 2026<\/span>/);
  assert.match(html, /class="future-alignment"/);
  assert.match(
    html,
    /<select aria-label="Grid dates">[\s\S]*?<option value="gregorian" selected="">Gregorian<\/option>/,
  );
  assert.match(
    html,
    /<select aria-label="Language">[\s\S]*?<option value="en" selected="">[\s\S]*?<option value="es">[\s\S]*?<option value="fr">[\s\S]*?<option value="it">[\s\S]*?<option value="el">[\s\S]*?<option value="ru">[\s\S]*?<option value="he">[\s\S]*?<option value="ar">[\s\S]*?<option value="hi">[\s\S]*?<option value="zh">[\s\S]*?<option value="ja">[\s\S]*?<option value="ko">/,
  );
  assert.doesNotMatch(html, /繁體|繁体|zh-TW/);
  assert.doesNotMatch(html, /Georgian/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Building your site/i);
});
