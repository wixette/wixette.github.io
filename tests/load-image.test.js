// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadImage } from '../site/js/anim/load-image.js';

/**
 * A stand-in <img>: each src it is given loads or fails, in turn, as the script says.
 * @param {('ok' | 'error' | 'empty')[]} script
 * @param {{ decode?: 'ok' | 'reject' }} [o]
 */
function fakeImg(script, { decode = 'ok' } = {}) {
  const img = Object.assign(new EventTarget(), {
    complete: false,
    naturalWidth: 0,
    /** @type {string[]} */
    srcs: [],
    decoded: 0,
    decode() {
      img.decoded++;
      return decode === 'ok' ? Promise.resolve() : Promise.reject(new Error('EncodingError'));
    },
  });
  Object.defineProperty(img, 'src', {
    set(/** @type {string} */ v) {
      const outcome = script[img.srcs.length] ?? 'error';
      img.srcs.push(v);
      img.complete = false;
      img.naturalWidth = 0;
      setTimeout(() => {
        img.complete = true;
        img.naturalWidth = outcome === 'ok' ? 640 : 0;
        img.dispatchEvent(new Event(outcome === 'error' ? 'error' : 'load'));
      });
    },
  });
  return img;
}

const noWait = { wait: async () => {} };

test('an image that loads resolves after one request, decoded', async () => {
  const img = fakeImg(['ok']);
  await loadImage(/** @type {any} */ (img), 'a.webp?v=1', noWait);
  assert.deepEqual(img.srcs, ['a.webp?v=1']);
  assert.equal(img.decoded, 1);
});

test('a failed request is tried again at a new URL', async () => {
  const img = fakeImg(['error', 'empty', 'ok']);
  /** @type {number[]} */
  const waits = [];
  await loadImage(/** @type {any} */ (img), 'a.webp?v=1', { wait: async (n) => void waits.push(n) });
  assert.deepEqual(img.srcs, ['a.webp?v=1', 'a.webp?v=1&retry=1', 'a.webp?v=1&retry=2']);
  assert.deepEqual(waits, [1, 2]);
});

test('an image that never loads rejects after the last try, never resolving as ready', async () => {
  const img = fakeImg(['error', 'error', 'error', 'error', 'ok']);
  await assert.rejects(loadImage(/** @type {any} */ (img), 'a.webp', noWait), /could not load a\.webp/);
  assert.deepEqual(img.srcs, ['a.webp', 'a.webp?retry=1', 'a.webp?retry=2', 'a.webp?retry=3']);
  assert.equal(img.decoded, 0);
});

test('a decode() rejection after a good load is not a failure', async () => {
  const img = fakeImg(['ok'], { decode: 'reject' });
  await loadImage(/** @type {any} */ (img), 'a.webp', noWait);
  assert.equal(img.naturalWidth, 640);
});
