// @ts-check
// `pnpm layout [width ...]`: the live-tile grid the page would show at each width, as text,
// for the current showcases (site/showcases/index.js). Each tile is labelled by the first
// character of its id.

import { asText, chooseLayout } from '../site/js/layout.js';
import { SHOWCASES } from '../site/showcases/index.js';
import { gridWidth } from '../site/js/grid-width.js';

const tiles = SHOWCASES.map((s) => ({ id: s.id, emphasis: s.emphasis }));
const args = process.argv.slice(2).map(Number).filter((n) => n > 0);
// Each width with a typical height for it: phones 2:1 portrait, tablets 4:3, desktops 16:10.
const widths = args.length ? args : [320, 375, 390, 430, 600, 768, 820, 1024, 1280, 1440, 1680, 1920, 2560];
/** @param {number} w */
const heightOf = (w) => (w < 600 ? w * 2.1 : w < 1024 ? w * 1.33 : w * 0.625);

for (const tile of tiles) process.stdout.write(`${tile.id[0]} = ${tile.id}${tile.emphasis === 'hero' ? ' (hero)' : ''}\n`);
for (const viewport of widths) {
  const width = gridWidth(viewport);
  const t0 = performance.now();
  const layout = chooseLayout(tiles, width, { fitHeight: heightOf(viewport) - 64 - 20 }); // the top bar (site.css) and two gaps
  const ms = performance.now() - t0;
  process.stdout.write(
    `\nviewport ${viewport}×${Math.round(heightOf(viewport))}px  grid ${width}px  ${layout.columns}×${layout.rows}  cell ${Math.round(layout.cell)}px` +
      `  cost ${layout.cost.toFixed(2)}  ${ms.toFixed(2)} ms${layout.perfect ? '' : '  NOT PERFECT'}\n`,
  );
  process.stdout.write(asText(layout).replace(/^/gm, '  ') + '\n');
}
