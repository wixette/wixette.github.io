// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
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

test('the profile has both languages', () => {
  assert.ok(PROFILE.name.en && PROFILE.name.zh);
  assert.equal(PROFILE.bio.en.length > 0, PROFILE.bio.zh.length > 0);
  for (const link of PROFILE.links) {
    assert.ok(link.label.en && link.label.zh);
    if (!link.placeholder) assert.match(link.href, /^(https:|mailto:)/);
  }
});
