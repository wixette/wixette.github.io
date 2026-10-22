// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { focusLine, pickFocused } from '../site/js/focus.js';

const TOP = 64;
const VH = 667;

test('the focus line runs from the top bar to the bottom edge as the page scrolls', () => {
  assert.equal(focusLine(0, 1000, VH, TOP), TOP);
  assert.equal(focusLine(1000, 1000, VH, TOP), VH);
  assert.equal(focusLine(500, 1000, VH, TOP), TOP + (VH - TOP) / 2);
  // Overscroll (rubber-banding) stays in range; a page that fits uses the middle.
  assert.equal(focusLine(-40, 1000, VH, TOP), TOP);
  assert.equal(focusLine(1040, 1000, VH, TOP), VH);
  assert.equal(focusLine(0, 0, VH, TOP), TOP + (VH - TOP) / 2);
});

/**
 * A one-column phone page: an intro, then tiles of the given heights, then a footer.
 * @param {number[]} heights
 */
function phonePage(heights) {
  const gap = 10;
  let y = 330;
  const tiles = heights.map((h) => {
    const box = { top: y, bottom: y + h, left: 16, right: 359 };
    y += h + gap;
    return box;
  });
  return { tiles, height: y + 180 };
}

test('scrolling a phone page from top to bottom plays every tile, in order', () => {
  const { tiles, height } = phonePage([343, 343, 172, 172, 172]);
  const maxScroll = height - VH;
  /** @type {number[]} */
  const seen = [];
  for (let s = 0; s <= maxScroll; s += 5) {
    const y = focusLine(s, maxScroll, VH, TOP);
    const boxes = tiles.map((b) => ({ ...b, top: b.top - s, bottom: b.bottom - s }));
    const i = pickFocused(boxes, y, 187, VH, TOP);
    if (i >= 0 && seen[seen.length - 1] !== i) seen.push(i);
  }
  assert.deepEqual(seen, [0, 1, 2, 3, 4]);
});

test('at the end of the page the last tile plays, though three are on screen', () => {
  const { tiles, height } = phonePage([343, 343, 172, 172, 172]);
  const maxScroll = height - VH;
  const boxes = tiles.map((b) => ({ ...b, top: b.top - maxScroll, bottom: b.bottom - maxScroll }));
  const onScreen = boxes.filter((b) => b.bottom > TOP && b.top < VH).length;
  assert.ok(onScreen >= 3);
  assert.equal(pickFocused(boxes, focusLine(maxScroll, maxScroll, VH, TOP), 187, VH, TOP), 4);
});

test('side by side, the tile nearest the horizontal focus wins; off-screen tiles never do', () => {
  const boxes = [
    { top: 100, bottom: 300, left: 0, right: 200 },
    { top: 100, bottom: 300, left: 210, right: 410 },
    { top: -500, bottom: 50, left: 0, right: 410 },
  ];
  assert.equal(pickFocused(boxes, 200, 300, VH, TOP), 1);
  assert.equal(pickFocused(boxes, 200, 90, VH, TOP), 0);
  assert.equal(pickFocused(boxes, 70, 205, VH, TOP), 0);
  assert.equal(pickFocused([], 200, 0, VH, TOP), -1);
});
