// @ts-check
// The showcase registry and each composition: files exist, both languages, sizes known.
// Compositions are imported in Node: their modules must not touch the DOM until build().
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { SHOWCASES } from '../site/showcases/index.js';

const SITE = fileURLToPath(new URL('../site/', import.meta.url));

test('showcase ids are unique and match their folders', () => {
  const ids = SHOWCASES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(existsSync(`${SITE}showcases/${id}/composition.js`), id);
});

test('each showcase has both languages, a GitHub link and a colour', () => {
  for (const s of SHOWCASES) {
    assert.match(s.repo, /^https:\/\/github\.com\/wixette\//, s.id);
    if (s.demo) for (const l of /** @type {const} */ (['en', 'zh'])) assert.match(s.demo[l], /^https:\/\//, s.id);
    for (const l of /** @type {const} */ (['en', 'zh'])) {
      assert.ok(s.title[l], `${s.id} title ${l}`);
      assert.ok(s.tagline[l], `${s.id} tagline ${l}`);
    }
    assert.match(s.accent, /^#[0-9a-f]{6}$/, s.id);
    assert.ok(s.tags.length >= 1 && s.tags.length <= 3, s.id);
  }
  assert.ok(SHOWCASES.some((s) => s.emphasis === 'hero'));
});

test('each composition has its images, a sane timing and strings in both languages', async () => {
  for (const s of SHOWCASES) {
    const comp = (await s.composition()).default;
    assert.ok(comp.duration >= 15 && comp.duration <= 30, `${s.id}: duration ${comp.duration}`);
    assert.ok(comp.poster >= 0 && comp.poster < comp.duration, `${s.id}: poster`);
    assert.deepEqual(Object.keys(comp.strings.zh).sort(), Object.keys(comp.strings.en).sort(), `${s.id}: string keys`);
    for (const [name, a] of Object.entries(comp.assets)) {
      assert.ok(existsSync(`${SITE}showcases/${s.id}/assets/${a.file}`), `${s.id}: ${a.file}`);
      assert.ok(a.w > 0 && a.h > 0, `${s.id}: ${name} size`);
      // Text art comes in both languages or falls back to a string.
      const m = name.match(/^(.+)\.(en|zh)$/);
      if (m) assert.ok(m[1] in comp.strings.en, `${s.id}: text art ${m[1]} needs a fallback string`);
    }
  }
});

test('compositions use no clocks or unseeded randomness', () => {
  for (const s of SHOWCASES) {
    const src = readFileSync(`${SITE}showcases/${s.id}/composition.js`, 'utf8');
    assert.doesNotMatch(src, /Math\.random|Date\.now|new Date|setTimeout|setInterval|performance\.now/, s.id);
  }
});
