// @ts-check
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { detect, fill, normalise } from '../site/js/i18n.js';
import { STRINGS } from '../site/js/strings.js';
import { PROFILE } from '../site/js/profile.js';

test('language tags normalise to en, zh or nothing', () => {
  assert.equal(normalise('en-NZ'), 'en');
  assert.equal(normalise('zh-Hans-CN'), 'zh');
  assert.equal(normalise('zh_TW'), 'zh');
  assert.equal(normalise('ZH'), 'zh');
  assert.equal(normalise('fr'), null);
  assert.equal(normalise(''), null);
});

test('the URL wins, then the saved choice, then the browser, then English', () => {
  assert.equal(detect({ query: 'zh', saved: 'en', browser: ['en'] }), 'zh');
  assert.equal(detect({ query: 'xx', saved: 'zh', browser: ['en'] }), 'zh');
  assert.equal(detect({ saved: null, browser: ['fr-FR', 'zh-CN', 'en'] }), 'zh');
  assert.equal(detect({ browser: ['de', 'fr'] }), 'en');
  assert.equal(detect({}), 'en');
});

test("index.html's pre-paint script expects Chinese exactly when detect() picks it", () => {
  const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'the inline script');
  const cases = [
    { query: 'zh', saved: 'en', browser: ['en'] },
    { query: 'en', saved: 'zh', browser: ['zh-CN'] },
    { query: 'xx', saved: 'zh', browser: ['en'] },
    { saved: 'zh_TW', browser: ['en'] },
    { saved: null, browser: ['fr-FR', 'zh-CN', 'en'] },
    { saved: null, browser: ['fr-FR', 'en-GB', 'zh-CN'] },
    { browser: ['ZH-hans'] },
    { browser: ['zhx', 'de'] },
    { browser: [] },
  ];
  for (const c of cases) {
    const classes = new Set();
    runInNewContext(script, {
      location: { search: c.query ? `?lang=${c.query}` : '' },
      localStorage: { getItem: (/** @type {string} */ k) => (k === 'wixette.lang' ? (c.saved ?? null) : null) },
      navigator: { languages: c.browser, language: c.browser[0] },
      document: { documentElement: { classList: { add: (/** @type {string} */ n) => classes.add(n) } } },
      URLSearchParams,
    });
    assert.equal(classes.has('i18n-pending'), detect(c) === 'zh', JSON.stringify(c));
  }
});

test('fill replaces placeholders and leaves unknown ones', () => {
  assert.equal(fill('grid {cols}×{rows}', { cols: 4, rows: 3 }), 'grid 4×3');
  assert.equal(fill('{x} and {y}', { x: 1 }), '1 and {y}');
});

test('both languages have every page string, none empty, with the same placeholders', () => {
  const en = Object.keys(STRINGS.en).sort();
  assert.deepEqual(Object.keys(STRINGS.zh).sort(), en);
  for (const key of en) {
    const k = /** @type {keyof typeof STRINGS.en} */ (key);
    assert.ok(STRINGS.en[k] && STRINGS.zh[k], key);
    const vars = (/** @type {string} */ s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    assert.deepEqual(vars(STRINGS.zh[k]), vars(STRINGS.en[k]), key);
  }
});

test('the profile has both languages, real links and known icons', async () => {
  assert.ok(PROFILE.name.en.length > 0 && PROFILE.name.zh.length > 0);
  assert.ok(PROFILE.bio.en && PROFILE.bio.zh);
  // icons.js only touches the DOM inside icon(), so its table can be read here.
  const { ICONS } = await import('../site/js/icons.js');
  for (const link of PROFILE.links) {
    assert.ok(link.label.en && link.label.zh);
    assert.match(link.href, /^https:\/\//);
    assert.ok(link.icon in ICONS, link.icon);
  }
});
