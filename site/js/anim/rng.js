// @ts-check
// Seeded random numbers (mulberry32), so the same composition always draws the same frames.

/**
 * A generator of numbers in [0, 1) from a seed.
 * @param {number} seed
 * @returns {() => number}
 */
export function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A number in [0, 1) that depends only on its inputs: for stepped jitter that must look
 * random yet be the same every time a frame is drawn.
 * @param {number} seed
 * @param {number} step
 */
export const hash01 = (seed, step) => rng(seed * 7919 + step * 104729 + 1)();
