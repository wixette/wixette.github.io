// @ts-check
// The grid's width at a viewport width, as site.css lays it out (--page-pad, --grid-max).
// The page measures the real width; this is for `pnpm layout` and the layout tests.

export const GRID_MAX = 1600;

/** @param {number} viewport px */
export const pagePad = (viewport) => Math.min(48, Math.max(16, viewport * 0.04));

/** @param {number} viewport px */
export const gridWidth = (viewport) => Math.round(Math.min(GRID_MAX, viewport - 2 * pagePad(viewport)));
