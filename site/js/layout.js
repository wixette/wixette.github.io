// @ts-check
// The live-tile solver (design D8, D9): packs a fixed list of tiles, some of them heroes,
// into a grid of square cells with no hole and no ragged last row. Pure: no DOM.

/** @typedef {'S' | 'W' | 'L'} Shape */
/** @typedef {'hero' | 'normal'} Emphasis */
/** @typedef {{ id: string; emphasis: Emphasis }} TileSpec */
/** @typedef {{ id: string; shape: Shape; row: number; col: number; w: number; h: number }} Placement */
/** @typedef {{ columns: number; rows: number; placements: Placement[]; cost: number; perfect: boolean }} Packing */
/**
 * @typedef {object} Layout
 * @property {number} columns
 * @property {number} rows
 * @property {number} cell the cell size, px
 * @property {Placement[]} placements in the tiles' given order
 * @property {number} cost
 * @property {boolean} perfect every row full, no hole
 */

/** Width and height of each shape, in cells. @type {Record<Shape, { w: number; h: number }>} */
export const SHAPES = { S: { w: 1, h: 1 }, W: { w: 2, h: 1 }, L: { w: 2, h: 2 } };

/** The shapes each emphasis may take, the preferred first. @type {Record<Emphasis, Shape[]>} */
export const ALLOWED = { hero: ['L', 'W'], normal: ['S', 'W'] };

/** The costs that rank packings against each other. */
export const COST = {
  /** per place a tile moves up the order, ahead of tiles that were before it */
  order: 3,
  /** a hero that is not at its preferred shape */
  heroShape: 6,
  /** a normal tile that is not at its preferred shape */
  normalShape: 1,
  /** per unit of |log(cell / target)|, when choosing the column count */
  size: 8,
  /** per viewport height the grid overflows fitHeight by */
  fold: 8,
};

/** @param {Shape} s */
const area = (s) => SHAPES[s].w * SHAPES[s].h;

/**
 * The best perfect packing of the tiles into a grid of the given number of columns, or
 * null when there is none.
 * @param {TileSpec[]} tiles in their given order
 * @param {number} columns
 * @param {(tile: TileSpec) => Shape[]} [shapesOf] the shapes each tile may take here, preferred first
 * @returns {Packing | null}
 */
export function pack(tiles, columns, shapesOf = (t) => ALLOWED[t.emphasis]) {
  const options = tiles.map((t) => shapesOf(t).filter((s) => SHAPES[s].w <= columns));
  if (options.some((o) => o.length === 0)) return null;

  // Tiles of the same kind (emphasis and shapes) are interchangeable, so at each cell only
  // the first remaining tile of each kind is tried: taking a later one gives the same
  // geometry at a higher order cost. This keeps the search small for any number of tiles.
  const kinds = tiles.map((t, i) => `${t.emphasis}:${options[i].join('')}`);
  const minArea = options.map((o) => Math.min(...o.map(area)));
  const maxArea = options.map((o) => Math.max(...o.map(area)));

  /** @type {(string | null)[][]} */
  const grid = [];
  /** @param {number} r @param {number} c */
  const free = (r, c) => !grid[r] || grid[r][c] == null;
  /** @type {Placement[]} */
  const placed = [];
  let used = 0;
  /** @type {Packing | null} */
  let best = null;

  /**
   * @param {number[]} remaining indices of tiles not yet placed, in order
   * @param {number} cost
   */
  const search = (remaining, cost) => {
    if (best && cost >= best.cost) return;
    // The final area must be a whole number of rows, at least as many as are begun.
    let lo = used;
    let hi = used;
    for (const i of remaining) {
      lo += minArea[i];
      hi += maxArea[i];
    }
    const target = Math.max(lo, grid.length * columns);
    if (Math.ceil(target / columns) * columns > hi) return;
    let r = 0;
    let c = 0;
    for (; ; r++) {
      c = 0;
      while (c < columns && !free(r, c)) c++;
      if (c < columns) break;
    }
    if (remaining.length === 0) {
      if (c === 0 && r === grid.length && ranked(placed, tiles)) {
        best = { columns, rows: grid.length, placements: placed.map((p) => ({ ...p })), cost, perfect: true };
      }
      return;
    }
    const tried = new Set();
    remaining.forEach((index, k) => {
      if (tried.has(kinds[index])) return;
      tried.add(kinds[index]);
      const tile = tiles[index];
      options[index].forEach((shape, choice) => {
        const { w, h } = SHAPES[shape];
        if (c + w > columns) return;
        for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (!free(y, x)) return;
        const penalty = k * COST.order + (choice === 0 ? 0 : tile.emphasis === 'hero' ? COST.heroShape : COST.normalShape);
        for (let y = r; y < r + h; y++) {
          grid[y] ??= Array(columns).fill(null);
          for (let x = c; x < c + w; x++) grid[y][x] = tile.id;
        }
        placed.push({ id: tile.id, shape, row: r, col: c, w, h });
        used += w * h;
        search(remaining.filter((_, i) => i !== k), cost + penalty);
        used -= w * h;
        placed.pop();
        for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) grid[y][x] = null;
        while (grid.length && grid[grid.length - 1].every((v) => v == null)) grid.pop();
      });
    });
  };
  search(tiles.map((_, i) => i), 0);
  return best;
}

/**
 * Whether every hero is strictly larger than every normal tile.
 * @param {Placement[]} placed
 * @param {TileSpec[]} tiles
 */
function ranked(placed, tiles) {
  const emphasis = new Map(tiles.map((t) => [t.id, t.emphasis]));
  let smallestHero = Infinity;
  let largestNormal = 0;
  for (const p of placed) {
    if (emphasis.get(p.id) === 'hero') smallestHero = Math.min(smallestHero, p.w * p.h);
    else largestNormal = Math.max(largestNormal, p.w * p.h);
  }
  return smallestHero > largestNormal;
}

/**
 * A packing that always exists: the tiles in order at their smallest allowed shapes, flowing
 * row by row. Used only when no perfect packing exists at some width.
 * @param {TileSpec[]} tiles
 * @param {number} columns
 * @param {(tile: TileSpec) => Shape[]} shapesOf
 * @returns {Packing}
 */
function flow(tiles, columns, shapesOf) {
  /** @type {Placement[]} */
  const placements = [];
  /** @type {boolean[][]} */
  const used = [];
  for (const tile of tiles) {
    const fits = shapesOf(tile).filter((s) => SHAPES[s].w <= columns);
    const shape = fits.length ? fits.reduce((a, b) => (area(a) <= area(b) ? a : b)) : 'S';
    const { w, h } = SHAPES[shape];
    for (let r = 0; ; r++) {
      let done = false;
      for (let c = 0; c + w <= columns && !done; c++) {
        let ok = true;
        for (let y = r; y < r + h && ok; y++) for (let x = c; x < c + w; x++) if (used[y]?.[x]) ok = false;
        if (!ok) continue;
        for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) (used[y] ??= [])[x] = true;
        placements.push({ id: tile.id, shape, row: r, col: c, w, h });
        done = true;
      }
      if (done) break;
    }
  }
  return { columns, rows: used.length, placements, cost: Infinity, perfect: false };
}

/**
 * @typedef {object} LayoutOptions
 * @property {number} [gap] between cells, px
 * @property {number} [minTile] the narrowest a tile may be, px
 * @property {number} [minCell] the smallest a cell may be, px
 * @property {number} [maxCell] the largest a cell may be, px, unless no column count keeps under it
 * @property {number} [targetCell] the preferred cell size, px
 * @property {number} [minColumns]
 * @property {number} [maxColumns]
 * @property {number} [fitHeight] the height the whole grid should fit in, px (the viewport under the top bar)
 */

/** @type {Required<LayoutOptions>} */
export const DEFAULTS = { gap: 10, minTile: 200, minCell: 140, maxCell: 420, targetCell: 280, minColumns: 2, maxColumns: 8, fitHeight: Infinity };

/**
 * The layout for a grid of the given width: the cheapest perfect packing over the column
 * counts the width allows, counting how far the cell size is from the target and how far
 * the grid overflows the height it should fit in.
 * @param {TileSpec[]} tiles in their given order
 * @param {number} width of the grid, px
 * @param {LayoutOptions} [options]
 * @returns {Layout}
 */
export function chooseLayout(tiles, width, options = {}) {
  const o = { ...DEFAULTS, ...options };
  /** @param {number} columns */
  const cellOf = (columns) => (width - (columns - 1) * o.gap) / columns;
  /** @param {number} columns @returns {(t: TileSpec) => Shape[]} */
  const shapesAt = (columns) => (t) =>
    ALLOWED[t.emphasis].filter((s) => SHAPES[s].w * cellOf(columns) + (SHAPES[s].w - 1) * o.gap >= o.minTile);

  const candidates = [];
  for (let columns = o.minColumns; columns <= o.maxColumns; columns++) {
    const cell = cellOf(columns);
    if (cell < o.minCell && columns > o.minColumns) continue;
    candidates.push(columns);
  }
  // Too-large cells are allowed only when every count would give them.
  const underMax = candidates.filter((c) => cellOf(c) <= o.maxCell);
  const counts = underMax.length ? underMax : candidates.slice(-1);

  /** @type {Layout | null} */
  let best = null;
  for (const columns of counts) {
    const packing = pack(tiles, columns, shapesAt(columns));
    if (!packing) continue;
    const cell = cellOf(columns);
    const height = packing.rows * cell + (packing.rows - 1) * o.gap;
    const overflow = Number.isFinite(o.fitHeight) ? Math.max(0, height - o.fitHeight) / o.fitHeight : 0;
    const cost = packing.cost + COST.size * Math.abs(Math.log(cell / o.targetCell)) + COST.fold * overflow;
    if (!best || cost < best.cost) best = { ...packing, cell, cost, placements: inOrder(packing.placements, tiles) };
  }
  if (best) return best;
  const columns = counts[0] ?? o.minColumns;
  const fallback = flow(tiles, columns, shapesAt(columns));
  return { ...fallback, cell: cellOf(columns), placements: inOrder(fallback.placements, tiles) };
}

/**
 * @param {Placement[]} placements
 * @param {TileSpec[]} tiles
 */
const inOrder = (placements, tiles) => tiles.map((t) => /** @type {Placement} */ (placements.find((p) => p.id === t.id)));

/**
 * The layout as text, one character per cell, for reviews and tests.
 * @param {{ columns: number; rows: number; placements: Placement[] }} layout
 * @param {(id: string) => string} [label] a one-character label for each tile
 */
export function asText(layout, label = (id) => id[0]) {
  const rows = Array.from({ length: layout.rows }, () => Array(layout.columns).fill('.'));
  for (const p of layout.placements) {
    for (let y = p.row; y < p.row + p.h; y++) for (let x = p.col; x < p.col + p.w; x++) rows[y][x] = label(p.id);
  }
  return rows.map((r) => r.join(' ')).join('\n');
}
