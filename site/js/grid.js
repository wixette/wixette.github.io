// @ts-check
// Puts the live-tile solver's answer on the page (design D10) and solves again whenever
// the grid's width changes.

import { chooseLayout } from './layout.js';

/** @typedef {import('./layout.js').TileSpec} TileSpec */
/** @typedef {import('./layout.js').Layout} Layout */

/**
 * @param {HTMLElement} grid the grid element; its parent is the size container
 * @param {TileSpec[]} specs in order
 * @param {(id: string) => HTMLElement} tileOf
 * @param {(layout: Layout, ms: number) => void} [onLayout]
 */
export function liveGrid(grid, specs, tileOf, onLayout) {
  let key = '';
  const solve = () => {
    const width = grid.clientWidth;
    if (!width) return;
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 10;
    const t0 = performance.now();
    // The whole grid should fit the viewport under the top bar, when there is a choice.
    const bar = document.querySelector('.topbar')?.getBoundingClientRect().height ?? 0;
    const fitHeight = innerHeight - bar - 2 * gap;
    const layout = chooseLayout(specs, width, { gap, fitHeight });
    const ms = performance.now() - t0;
    const next = `${layout.columns}|${layout.placements.map((p) => `${p.id}:${p.shape}@${p.row},${p.col}`).join(';')}`;
    if (next !== key) {
      key = next;
      // tests/layout.test.js keeps this from shipping; a new tile set may still hit it.
      if (!layout.perfect) console.warn(`no perfect packing at ${width}px: the last row is ragged`);
      grid.style.setProperty('--cols', String(layout.columns));
      for (const p of layout.placements) {
        const el = tileOf(p.id);
        el.style.gridArea = `${p.row + 1} / ${p.col + 1} / span ${p.h} / span ${p.w}`;
        el.dataset.shape = p.shape;
      }
    }
    onLayout?.(layout, ms);
  };
  new ResizeObserver(solve).observe(grid);
  addEventListener('resize', solve);
  solve();
}
