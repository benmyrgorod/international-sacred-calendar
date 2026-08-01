import assert from "node:assert/strict";
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
  assert.match(html, /Rotation anniversaries 1–20/);
  assert.match(html, /Five past and five future lunar alignments/);
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
  assert.equal((html.match(/class="milestone-button"/g) ?? []).length, 20);
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
  assert.match(html, /class="holiday-marker"/);
  assert.match(html, /Major holiday/);
  assert.match(html, /class="international-marker"/);
  assert.match(html, /International holiday/);
  assert.match(html, /Moon alignment/);
  assert.match(html, /293-year anniversary/);
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
