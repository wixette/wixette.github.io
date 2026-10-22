// @ts-check
// Easing functions, named as in the style guide ("power3.out", "back.out(2.4)").

/** @typedef {(p: number) => number} Ease */

/** @param {number} n @returns {Ease} */
const powerIn = (n) => (p) => p ** n;
/** @param {Ease} f @returns {Ease} */
const out = (f) => (p) => 1 - f(1 - p);
/** @param {Ease} f @returns {Ease} */
const inOut = (f) => (p) => (p < 0.5 ? f(p * 2) / 2 : 1 - f((1 - p) * 2) / 2);

/** @type {Ease} */
const bounceOut = (p) => {
  const n = 7.5625;
  const d = 2.75;
  if (p < 1 / d) return n * p * p;
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
  return n * (p -= 2.625 / d) * p + 0.984375;
};

/** @param {number} s @returns {Ease} */
const backIn = (s) => (p) => p * p * ((s + 1) * p - s);
/** @type {Ease} */
const sineIn = (p) => 1 - Math.cos((p * Math.PI) / 2);
/** @type {Ease} */
const expoIn = (p) => (p === 0 ? 0 : 2 ** (10 * (p - 1)));

/** @type {Record<string, Ease>} */
const NAMED = {
  linear: (p) => p,
  none: (p) => p,
  'sine.in': sineIn,
  'sine.out': out(sineIn),
  'sine.inOut': inOut(sineIn),
  'expo.in': expoIn,
  'expo.out': out(expoIn),
  'expo.inOut': inOut(expoIn),
  'bounce.out': bounceOut,
  'bounce.in': out(bounceOut),
};
for (let n = 1; n <= 4; n++) {
  NAMED[`power${n}.in`] = powerIn(n + 1);
  NAMED[`power${n}.out`] = out(powerIn(n + 1));
  NAMED[`power${n}.inOut`] = inOut(powerIn(n + 1));
}

/**
 * The easing function for a name, or the function itself.
 * @param {string | Ease} name
 * @returns {Ease}
 */
export function ease(name) {
  if (typeof name === 'function') return name;
  const back = name.match(/^back\.(in|out|inOut)(?:\(([\d.]+)\))?$/);
  if (back) {
    const f = backIn(back[2] ? Number(back[2]) : 1.70158);
    return back[1] === 'in' ? f : back[1] === 'out' ? out(f) : inOut(f);
  }
  const f = NAMED[name];
  if (!f) throw new Error(`unknown ease: ${name}`);
  return f;
}
