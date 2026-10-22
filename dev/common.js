// @ts-check
// Shared by the review pages: build a composition on a stage of a given shape.

import { Kit } from '../site/js/anim/kit.js';
import { Stage } from '../site/js/anim/stage.js';
import { SHOWCASES } from '../site/showcases/index.js';

/** @typedef {import('../site/js/anim/kit.js').Composition} Composition */
/** @typedef {import('../site/js/anim/kit.js').Lang} Lang */

export const params = new URLSearchParams(location.search);
export const lang = /** @type {Lang} */ (params.get('lang') === 'zh' ? 'zh' : 'en');
/** S (1:1) or W (2:1) */
export const shape = params.get('shape') === 'W' ? 'W' : 'S';
export const showcase = SHOWCASES.find((s) => s.id === params.get('id')) ?? SHOWCASES[0];

/** Links to the same page with one parameter changed. @param {HTMLElement} bar */
export function navBar(bar) {
  /** @param {string} k @param {string} v */
  const link = (k, v) => {
    const p = new URLSearchParams(location.search);
    p.set(k, v);
    const a = document.createElement('a');
    a.href = `?${p}`;
    a.textContent = `${k}=${v}`;
    return a;
  };
  for (const s of SHOWCASES) bar.append(link('id', s.id));
  bar.append(link('lang', 'en'), link('lang', 'zh'), link('shape', 'S'), link('shape', 'W'));
}

/**
 * A stage in a box of the current shape, with the composition built on it.
 * @param {HTMLElement} parent
 * @param {Composition} comp
 */
export async function buildOn(parent, comp) {
  const view = document.createElement('div');
  view.className = 'view';
  view.style.aspectRatio = shape === 'W' ? '2 / 1' : '1 / 1';
  parent.append(view);
  const stage = new Stage(view);
  const kit = new Kit(stage.el, comp, lang);
  comp.build(kit);
  await kit.ready();
  return { view, kit };
}
