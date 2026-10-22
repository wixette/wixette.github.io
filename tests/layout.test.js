// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALLOWED, DEFAULTS, SHAPES, asText, chooseLayout, pack } from '../site/js/layout.js';
import { gridWidth } from '../site/js/grid-width.js';
import { SHOWCASES } from '../site/showcases/index.js';

/** @typedef {import('../site/js/layout.js').TileSpec} TileSpec */

/**
 * Asserts that a layout covers its columns × rows rectangle exactly once.
 * @param {{ columns: number; rows: number; placements: import('../site/js/layout.js').Placement[] }} layout
 */
function assertPerfect(layout) {
  const seen = Array.from({ length: layout.rows }, () => Array(layout.columns).fill(0));
  for (const p of layout.placements) {
    assert.ok(p.col >= 0 && p.col + p.w <= layout.columns, `${p.id} is inside the columns`);
    for (let y = p.row; y < p.row + p.h; y++) for (let x = p.col; x < p.col + p.w; x++) seen[y][x]++;
  }
  assert.ok(seen.every((r) => r.every((n) => n === 1)), `every cell is covered once:\n${asText(layout)}`);
}

/** @param {string} spec e.g. "H n n" @returns {TileSpec[]} */
const tiles = (spec) => spec.split(' ').map((s, i) => ({ id: String.fromCharCode(97 + i), emphasis: s === 'H' ? 'hero' : 'normal' }));

test('pack keeps the order and the preferred shapes when they fit', () => {
  const p = pack(tiles('H n n n n'), 4);
  assert.ok(p);
  assertPerfect(p);
  assert.equal(p.cost, 0);
  assert.equal(asText(p), 'a a b c\na a d e');
});

test('pack returns null when no perfect packing exists', () => {
  // One normal tile can never fill three columns.
  assert.equal(pack(tiles('n'), 3), null);
});

test('pack never makes a hero the same size as a normal tile', () => {
  for (let columns = 2; columns <= 8; columns++) {
    const p = pack(tiles('H H n n n n n'), columns);
    if (!p) continue;
    assertPerfect(p);
    const hero = Math.min(...p.placements.filter((x) => 'ab'.includes(x.id)).map((x) => x.w * x.h));
    const normal = Math.max(...p.placements.filter((x) => !'ab'.includes(x.id)).map((x) => x.w * x.h));
    assert.ok(hero > normal, `columns ${columns}:\n${asText(p)}`);
  }
});

test('pack finds the cheapest of several packings', () => {
  // Five columns: the hero at L and five normals at S make 9 cells; one must grow to W.
  const p = pack(tiles('H n n n n n'), 5);
  assert.ok(p);
  assertPerfect(p);
  assert.equal(p.cost, 1);
});

test('chooseLayout falls back to a flowing layout rather than failing', () => {
  const layout = chooseLayout(tiles('n'), 700, { minColumns: 3, maxColumns: 3 });
  assert.equal(layout.perfect, false);
  assert.equal(layout.placements.length, 1);
});

test('chooseLayout keeps every tile at least minTile wide', () => {
  const layout = chooseLayout(tiles('H n n n n'), 343);
  for (const p of layout.placements) assert.ok(p.w * layout.cell + (p.w - 1) * DEFAULTS.gap >= DEFAULTS.minTile, asText(layout));
});

test('the showcases fill every row at every width from 320 to 2560 px', () => {
  const list = SHOWCASES.map((s) => ({ id: s.id, emphasis: s.emphasis }));
  for (let viewport = 320; viewport <= 2560; viewport += 10) {
    const layout = chooseLayout(list, gridWidth(viewport));
    assert.ok(layout.perfect, `no perfect layout at ${viewport}px`);
    assertPerfect(layout);
    for (const p of layout.placements) {
      const tile = /** @type {TileSpec} */ (list.find((t) => t.id === p.id));
      assert.ok(ALLOWED[tile.emphasis].includes(p.shape), `${p.id} at an allowed shape`);
      assert.equal(p.w, SHAPES[p.shape].w);
    }
  }
});

test('the solver is fast enough to run on every resize', () => {
  const list = tiles('H H n n n n n n n n n n');
  const t0 = performance.now();
  for (const width of [400, 800, 1200, 1600]) chooseLayout(list, width);
  assert.ok(performance.now() - t0 < 500);
});
