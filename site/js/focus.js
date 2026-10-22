// @ts-check
// Which tile plays on a touch screen (design 6.6): the one under a focus line that sweeps
// the screen as the page scrolls. At the top of the page the line sits just under the top
// bar; at the end of the page it reaches the bottom edge. The point of the page under the
// line therefore travels from the first tile to the last as the page scrolls, so every tile
// gets its turn, the last row included, and only one plays at a time. Pure: no DOM.

/** @typedef {{ top: number; bottom: number; left: number; right: number }} Box */

/**
 * The focus line's y, in viewport coordinates.
 * @param {number} scrollY
 * @param {number} maxScroll how far the page can scroll; 0 when it fits
 * @param {number} viewportH
 * @param {number} top the height of the top bar
 */
export function focusLine(scrollY, maxScroll, viewportH, top) {
  if (maxScroll <= 0) return top + (viewportH - top) / 2;
  const p = Math.min(1, Math.max(0, scrollY / maxScroll));
  return top + p * (viewportH - top);
}

/**
 * The index of the tile to play: of the tiles on screen, the one the focus line crosses
 * (the nearest to x when several sit side by side), or else the nearest to the line.
 * -1 when no tile is on screen.
 * @param {Box[]} boxes the tiles, in viewport coordinates
 * @param {number} y the focus line
 * @param {number} x the horizontal focus, usually the middle of the grid
 * @param {number} viewportH
 * @param {number} top the height of the top bar
 */
export function pickFocused(boxes, y, x, viewportH, top) {
  let best = -1;
  let bestKey = Infinity;
  boxes.forEach((b, i) => {
    if (b.bottom <= top || b.top >= viewportH) return;
    const dy = y < b.top ? b.top - y : y >= b.bottom ? y - b.bottom + 1e-6 : 0;
    const dx = Math.abs((b.left + b.right) / 2 - x);
    // Crossing the line comes first; then the horizontal distance breaks ties.
    const key = dy * 1e6 + dx;
    if (key < bestKey) {
      bestKey = key;
      best = i;
    }
  });
  return best;
}
