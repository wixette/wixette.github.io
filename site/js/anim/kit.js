// @ts-check
// The paper-cutout kit (design D13): the style guide's motion language as functions, ported
// from the mootion-animator prototype onto our own timeline. Compositions call these rather
// than placing DOM by hand.
//
// Rules for compositions: times are absolute seconds; add tweens in time order; randomness
// only from k.rng(); coordinates are stage pixels (2000 × 1000), and everything that matters
// stays inside x = 500…1500.

import { stampUrl } from '../asset-url.js';
import { hash01, rng } from './rng.js';
import { STAGE_H, STAGE_W } from './stage.js';
import { Timeline } from './timeline.js';

/** @typedef {import('./timeline.js').Props} Props */
/** @typedef {import('./timeline.js').TweenOptions} TweenOptions */
/** @typedef {import('./ease.js').Ease} Ease */
/** @typedef {'en' | 'zh'} Lang */
/** @typedef {{ file: string; w: number; h: number }} AssetInfo */

/**
 * @typedef {object} Composition
 * @property {number} duration seconds; playback loops
 * @property {number} poster the time of the still shown on the static tile
 * @property {string} base the composition's import.meta.url, to find its assets
 * @property {Record<string, AssetInfo>} assets from its generated assets.js
 * @property {Record<Lang, Record<string, string>>} strings code text, and fallbacks for text art
 * @property {(k: Kit) => void} build
 */

/** The style guide's palette. */
export const C = {
  red: '#d9483b', mustard: '#e0a73a', teal: '#2f7f7a', ultra: '#2f4fa8', olive: '#7c8a3c', sage: '#9dbb8e',
  pink: '#f1a9a0', cream: '#f3ecdf', paper: '#fbf7ee', kraft: '#b98f5e', ink: '#2b2622', pencil: '#3a332c', navy: '#1b2a4a',
};

/** Font stacks for code text; Chinese falls back to the system's fonts. */
export const FONT = {
  brush: '"Caveat Brush", "Kaiti SC", "STKaiti", "KaiTi", cursive',
  hand: '"Patrick Hand", "Hannotate SC", "Kaiti SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"JetBrains Mono Variable", ui-monospace, "PingFang SC", "Microsoft YaHei", monospace',
  display: '"Bricolage Grotesque Variable", "PingFang SC", "Microsoft YaHei", sans-serif',
};

const SVG_NS = 'http://www.w3.org/2000/svg';
/** Mask ids are unique across every kit on the page, old stages and new alike. */
let maskCount = 0;

/**
 * An actor on the stage: one element and the properties the timeline moves.
 * x, y: offset from where it was placed; scale, sx, sy; rot (degrees); opacity (0 hides it);
 * clip (0..1, reveals it from the left); draw (0..1, draws an SVG path); chars (characters shown).
 */
export class El {
  /**
   * @param {HTMLElement | SVGElement} el
   * @param {Props} [state] starting values beyond the defaults
   */
  constructor(el, state = {}) {
    this.el = el;
    /** @type {Props} */
    this.state = { x: 0, y: 0, scale: 1, sx: 1, sy: 1, rot: 0, opacity: 1, ...state };
    /** @type {((s: Props) => void) | null} */
    this.extra = null;
    /** @type {El | null} the inner wrapper idle motions act on (cutouts) */
    this.idle = null;
    /** @type {Record<string, El> | null} a cutout's poses, by image name */
    this.poses = null;
    /** @type {number} characters, for write() */
    this.length = 0;
    /** @type {SVGPathElement | null} a stroke's path, for follow() */
    this.path = null;
    this.last = { transform: '', opacity: '', visibility: '', clip: '' };
  }

  render() {
    const s = this.state;
    const sc = s.scale;
    const transform = `translate(${round(s.x)}px, ${round(s.y)}px) rotate(${round(s.rot)}deg) scale(${round(sc * s.sx, 4)}, ${round(sc * s.sy, 4)})`;
    const style = this.el.style;
    if (transform !== this.last.transform) style.transform = this.last.transform = transform;
    const visible = s.opacity > 0.001;
    const opacity = visible ? String(round(Math.min(1, s.opacity), 3)) : '0';
    if (opacity !== this.last.opacity) style.opacity = this.last.opacity = opacity;
    const visibility = visible ? '' : 'hidden';
    if (visibility !== this.last.visibility) style.visibility = this.last.visibility = visibility;
    if ('clip' in s) {
      const clip = `inset(-20% ${round((1 - Math.max(0, Math.min(1, s.clip))) * 100, 2)}% -20% -20%)`;
      if (clip !== this.last.clip) style.clipPath = this.last.clip = clip;
    }
    this.extra?.(s);
  }
}

/** @param {number} v @param {number} [d] */
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** A scene: a full-stage sheet of paper with its own camera. */
export class Scene {
  /** @param {El} sheet @param {El} cam @param {SVGSVGElement} svg */
  constructor(sheet, cam, svg) {
    this.sheet = sheet;
    this.cam = cam;
    /** the layer pencil strokes and doodles are drawn on */
    this.svg = svg;
  }
}

/**
 * A text's width in ems, roughly: CJK characters are one em, others half.
 * @param {string} text
 */
export const ems = (text) => [...text].reduce((n, ch) => n + (/[⺀-鿿＀-￯]/.test(ch) ? 1 : 0.55), 0);

export class Kit {
  /**
   * @param {HTMLElement} root the stage element (2000 × 1000)
   * @param {Composition} comp
   * @param {Lang} lang
   */
  constructor(root, comp, lang) {
    this.root = root;
    this.comp = comp;
    this.lang = lang;
    this.tl = new Timeline();
    this.W = STAGE_W;
    this.H = STAGE_H;
    this.C = C;
    this.FONT = FONT;
    /** @type {Promise<unknown>[]} */
    this.loading = [];
    this.z = 0;
    this.seed = 1;
    /** @type {El | null} */
    this.flashEl = null;
  }

  // ---------- basics ----------

  /** A seeded random generator; with no seed, the next in a fixed sequence. @param {number} [seed] */
  rng(seed) {
    return rng(seed ?? (this.seed += 101));
  }

  /** The composition's string for the current language. @param {string} key */
  t(key) {
    const s = this.comp.strings[this.lang][key];
    if (s == null) throw new Error(`no ${this.lang} string "${key}"`);
    return s;
  }

  /** Whether the composition has an image of that name. @param {string} name */
  has(name) {
    return name in this.comp.assets;
  }

  /** The stamped URL of one of the composition's images. @param {string} name */
  url(name) {
    const a = this.comp.assets[name];
    if (!a) throw new Error(`unknown asset: ${name}`);
    return stampUrl(new URL(`assets/${a.file}`, this.comp.base));
  }

  /**
   * @template {keyof HTMLElementTagNameMap} T
   * @param {Element} parent
   * @param {T} tag
   * @param {string} [cls]
   * @param {Partial<CSSStyleDeclaration>} [css]
   * @returns {HTMLElementTagNameMap[T]}
   */
  el(parent, tag, cls, css) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) Object.assign(e.style, css);
    parent.append(e);
    return e;
  }

  /**
   * An <img> of a composition's image, counted until decoded.
   * @param {Element} parent
   * @param {string} name
   */
  img(parent, name) {
    const img = this.el(parent, 'img');
    img.alt = '';
    img.draggable = false;
    img.src = this.url(name);
    this.loading.push(img.decode().catch(() => undefined));
    return img;
  }

  /** Resolves once every image is decoded and the fonts are loaded. */
  ready() {
    const fonts = ['40px "Caveat Brush"', '40px "Patrick Hand"', '40px "JetBrains Mono Variable"', '800 40px "Bricolage Grotesque Variable"'];
    return Promise.all([...this.loading, ...fonts.map((f) => document.fonts.load(f).catch(() => undefined))]);
  }

  /**
   * Registers an actor with the timeline and renders it once.
   * @param {El} actor
   */
  actor(actor) {
    this.tl.add(actor, {});
    actor.render();
    return actor;
  }

  // ---------- scenes and transitions ----------

  /**
   * A new scene on top of the others. The first is shown from the start; later ones are
   * hidden until a sheetIn.
   * @param {string} bg an image name, or a plain colour
   */
  scene(bg) {
    const first = this.z === 0;
    const el = this.el(this.root, 'div', 'k-scene', { zIndex: String(++this.z) });
    const clip = this.el(el, 'div', 'k-clip');
    const camEl = this.el(clip, 'div', 'k-cam');
    const back = this.el(camEl, 'div', 'k-bg');
    if (this.has(bg)) this.img(back, bg);
    else back.style.background = bg;
    const svg = /** @type {SVGSVGElement} */ (document.createElementNS(SVG_NS, 'svg'));
    svg.setAttribute('class', 'k-doodles');
    svg.setAttribute('viewBox', `0 0 ${STAGE_W} ${STAGE_H}`);
    camEl.append(svg);
    const sheet = this.actor(new El(el, { opacity: first ? 1 : 0 }));
    const cam = this.actor(new El(camEl));
    return new Scene(sheet, cam, svg);
  }

  /**
   * The new sheet slides over everything before it, a torn paper edge leading.
   * @param {Scene} scene
   * @param {number} at
   * @param {{ from?: 'right' | 'left' | 'top' | 'bottom'; dur?: number; ease?: string; rot?: number }} [o]
   */
  sheetIn(scene, at, { from = 'right', dur = 0.6, ease = 'power3.out', rot = 1.2 } = {}) {
    const r = this.rng();
    const horiz = from === 'right' || from === 'left';
    const len = horiz ? STAGE_H : STAGE_W;
    const depth = 34;
    /** @type {[number, number][]} */
    const pts = [];
    for (let p = -20; p <= len + 20; p += 10 + r() * 14) pts.push([r() * depth * 0.7, p]);
    const poly = [[depth + 4, -20], ...pts, [depth + 4, len + 20]];
    const d = poly.map(([a, b], i) => (i ? 'L' : 'M') + (horiz ? `${round(a)} ${round(b)}` : `${round(b)} ${round(a)}`)).join(' ') + 'Z';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'k-torn');
    const w = horiz ? depth + 4 : STAGE_W;
    const h = horiz ? STAGE_H : depth + 4;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', C.paper);
    svg.append(path);
    scene.sheet.el.append(svg);
    /** @type {Record<string, Partial<CSSStyleDeclaration>>} */
    const place = {
      right: { left: `${-depth}px`, top: '0' },
      left: { right: `${-depth}px`, top: '0', transform: 'scaleX(-1)' },
      bottom: { top: `${-depth}px`, left: '0' },
      top: { bottom: `${-depth}px`, left: '0', transform: 'scaleY(-1)' },
    };
    Object.assign(svg.style, place[from]);
    const off = { right: { x: STAGE_W * 1.04 }, left: { x: -STAGE_W * 1.04 }, top: { y: -STAGE_H * 1.06 }, bottom: { y: STAGE_H * 1.06 } }[from];
    this.tl.set(scene.sheet, { opacity: 1 }, at);
    this.tl.fromTo(scene.sheet, { x: 0, y: 0, ...off, rot: horiz ? rot : rot * 0.5 }, { x: 0, y: 0, rot: 0 }, at, { dur, ease });
    return scene;
  }

  /** A white flash over everything. @param {number} at @param {number} [dur] */
  flash(at, dur = 0.5) {
    if (!this.flashEl) {
      const f = this.el(this.root, 'div', 'k-flash', { zIndex: '999' });
      this.flashEl = this.actor(new El(f, { opacity: 0 }));
    }
    this.tl.set(this.flashEl, { opacity: 1 }, at);
    this.tl.to(this.flashEl, { opacity: 0 }, at + 0.06, { dur, ease: 'power2.out' });
  }

  /** A slow camera push-in. @param {Scene} scene @param {number} at @param {number} dur @param {number} [to] */
  pushIn(scene, at, dur, to = 1.035) {
    this.tl.fromTo(scene.cam, { scale: 1 }, { scale: to }, at, { dur, ease: 'linear' });
  }

  /** A stepped, decaying camera shake. @param {Scene} scene @param {number} at @param {number} [dur] @param {number} [amp] */
  shake(scene, at, dur = 0.5, amp = 14) {
    const seed = (this.seed += 101);
    this.tl.proc(scene.cam, at, dur, (t, p) => {
      const step = Math.floor(t * 12);
      const k = amp * (1 - p);
      return { x: (hash01(seed, step) - 0.5) * 2 * k, y: (hash01(seed + 1, step) - 0.5) * 2 * k };
    });
  }

  // ---------- cutouts ----------

  /**
   * A cutout (or several poses of one, for flipTo), placed by its anchor: the feet
   * (bottom centre) by default, the centre, or the bottom-left corner (a pencil's tip).
   * Give its height or its width in stage px.
   * Hidden until an entrance unless visible.
   * @param {Scene} scene
   * @param {string | string[]} names
   * @param {{ x: number; y: number; h?: number; w?: number; anchor?: 'bottom' | 'center' | 'bottomLeft'; z?: number; flip?: boolean; rot?: number; visible?: boolean }} o
   */
  sprite(scene, names, { x, y, h, w, anchor = 'bottom', z, flip = false, rot = 0, visible = false }) {
    const list = [names].flat();
    const outer = this.el(scene.cam.el, 'div', 'k-cut', { left: `${x}px`, top: `${y}px` });
    if (z != null) outer.style.zIndex = String(z);
    const inner = this.el(outer, 'div', 'k-idle');
    const actor = new El(outer, { rot, opacity: visible ? 1 : 0 });
    actor.idle = this.actor(new El(inner));
    /** @type {Record<string, El>} */
    const poses = {};
    list.forEach((name, i) => {
      const a = this.comp.assets[name];
      if (!a) throw new Error(`unknown asset: ${name}`);
      const height = h ?? ((w ?? a.w) * a.h) / a.w;
      const width = w ?? (height * a.w) / a.h;
      const img = this.img(inner, name);
      Object.assign(img.style, {
        width: `${round(width)}px`,
        height: `${round(height)}px`,
        left: `${round(anchor === 'bottomLeft' ? 0 : -width / 2)}px`,
        top: `${round(anchor === 'center' ? -height / 2 : -height)}px`,
        transform: flip ? 'scaleX(-1)' : '',
      });
      poses[name] = this.actor(new El(img, { opacity: i === 0 ? 1 : 0 }));
    });
    actor.poses = poses;
    return this.actor(actor);
  }

  /**
   * Paper-flip to another pose of the same cutout.
   * @param {El} e
   * @param {string} name
   * @param {number} at
   */
  flipTo(e, name, at) {
    const poses = e.poses ?? {};
    this.tl.to(e, { sx: 0 }, at, { dur: 0.11, ease: 'power2.in' });
    for (const [n, p] of Object.entries(poses)) this.tl.set(p, { opacity: n === name ? 1 : 0 }, at + 0.11);
    this.tl.to(e, { sx: 1 }, at + 0.11, { dur: 0.22, ease: 'back.out(3)' });
  }

  // ---------- entrances and moves ----------

  /** Pops in from nothing with an overshoot, pivoting at the anchor. @param {El} e @param {number} at @param {{ dur?: number; back?: number; tilt?: number }} [o] */
  pop(e, at, { dur = 0.45, back = 2.4, tilt = 12 } = {}) {
    const r = this.tl.bases.get(e)?.rot ?? 0;
    const sign = this.rng()() > 0.5 ? 1 : -1;
    this.tl.fromTo(e, { scale: 0, rot: r + sign * tilt, opacity: 0 }, { scale: 1, rot: r, opacity: 1 }, at, { dur, ease: `back.out(${back})` });
  }

  /** Drops in from above and bounces. @param {El} e @param {number} at @param {{ from?: number; dur?: number }} [o] */
  dropIn(e, at, { from = -600, dur = 0.6 } = {}) {
    this.tl.set(e, { opacity: 1 }, at);
    this.tl.fromTo(e, { y: from }, { y: 0 }, at, { dur, ease: 'bounce.out' });
  }

  /** Slides in from off its place. @param {El} e @param {number} at @param {{ dx?: number; dy?: number; dur?: number; ease?: string }} [o] */
  slideIn(e, at, { dx = -700, dy = 0, dur = 0.55, ease = 'back.out(1.4)' } = {}) {
    this.tl.set(e, { opacity: 1 }, at);
    this.tl.fromTo(e, { x: dx, y: dy }, { x: 0, y: 0 }, at, { dur, ease });
  }

  /** Hops with squash and stretch. @param {El} e @param {number} at @param {{ h?: number; n?: number }} [o] */
  hop(e, at, { h = 70, n = 1 } = {}) {
    const y0 = this.tl.valueAt(e, 'y', at);
    for (let i = 0; i < n; i++) {
      const t = at + i * 0.52;
      this.tl.to(e, { sy: 0.8, sx: 1.15 }, t, { dur: 0.08, ease: 'power1.out' });
      this.tl.to(e, { y: y0 - h, sy: 1.1, sx: 0.92 }, t + 0.08, { dur: 0.17, ease: 'power2.out' });
      this.tl.to(e, { y: y0, sy: 1, sx: 1 }, t + 0.25, { dur: 0.15, ease: 'power2.in' });
      this.tl.to(e, { sy: 0.85, sx: 1.12 }, t + 0.4, { dur: 0.05, ease: 'linear' });
      this.tl.to(e, { sy: 1, sx: 1 }, t + 0.45, { dur: 0.14, ease: 'back.out(3)' });
    }
  }

  /** Moves to an offset from where it was placed. @param {El} e @param {number} at @param {{ x?: number; y?: number; dur?: number; ease?: string }} o */
  moveTo(e, at, { x, y, dur = 0.6, ease = 'power2.inOut' }) {
    /** @type {Props} */
    const to = {};
    if (x != null) to.x = x;
    if (y != null) to.y = y;
    this.tl.to(e, to, at, { dur, ease });
  }

  /** Turns to an angle. @param {El} e @param {number} at @param {{ rot: number; dur?: number; ease?: string }} o */
  turn(e, at, { rot, dur = 0.5, ease = 'power2.inOut' }) {
    this.tl.to(e, { rot }, at, { dur, ease });
  }

  /** Scales to a size. @param {El} e @param {number} at @param {{ scale: number; dur?: number; ease?: string }} o */
  zoom(e, at, { scale, dur = 0.4, ease = 'back.out(2)' }) {
    this.tl.to(e, { scale }, at, { dur, ease });
  }

  /** @param {El} e @param {number} at */
  show(e, at) {
    this.tl.set(e, { opacity: 1 }, at);
  }

  /** @param {El} e @param {number} at */
  hide(e, at) {
    this.tl.set(e, { opacity: 0 }, at);
  }

  /** @param {El} e @param {number} at @param {number} [dur] */
  fadeIn(e, at, dur = 0.3) {
    this.tl.fromTo(e, { opacity: 0 }, { opacity: 1 }, at, { dur, ease: 'power1.out' });
  }

  /** @param {El} e @param {number} at @param {number} [dur] */
  fadeOut(e, at, dur = 0.3) {
    this.tl.to(e, { opacity: 0 }, at, { dur, ease: 'power1.in' });
  }

  /**
   * Moves along an SVG path (a pencil following its stroke): the anchor visits the path's
   * points in stage coordinates.
   * @param {El} e placed at (x0, y0)
   * @param {{ x: number; y: number }} placedAt where e was placed
   * @param {SVGPathElement} path
   * @param {number} at
   * @param {number} dur
   * @param {{ ease?: Ease; dx?: number; dy?: number }} [o] dx, dy: an offset from the path (the pencil's tip)
   */
  follow(e, placedAt, path, at, dur, { ease = (p) => p, dx = 0, dy = 0 } = {}) {
    const len = path.getTotalLength();
    const steps = Math.max(2, Math.round(dur * 30));
    for (let i = 0; i <= steps; i++) {
      const pt = path.getPointAtLength(len * ease(i / steps));
      const to = { x: pt.x + dx - placedAt.x, y: pt.y + dy - placedAt.y };
      if (i === 0) this.tl.set(e, to, at);
      else this.tl.to(e, to, at + ((i - 1) * dur) / steps, { dur: dur / steps, ease: 'linear' });
    }
  }

  // ---------- idle life (on the inner wrapper, so they never fight the entrances) ----------

  /** @param {El} e @param {number} at @param {number} dur @param {{ deg?: number; period?: number }} [o] */
  sway(e, at, dur, { deg = 2.5, period = 1.7 } = {}) {
    const phase = this.rng()() * Math.PI * 2;
    this.tl.proc(e.idle ?? e, at, dur, (t) => ({ rot: deg * Math.sin((2 * Math.PI * t) / period + phase) * Math.min(1, t / 0.3) }));
  }

  /** @param {El} e @param {number} at @param {number} dur @param {{ px?: number; period?: number }} [o] */
  bob(e, at, dur, { px = 8, period = 1.1 } = {}) {
    this.tl.proc(e.idle ?? e, at, dur, (t) => ({ y: -px * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / period)) }));
  }

  /** Stop-motion boil: stepped seeded jitter. @param {El} e @param {number} at @param {number} dur @param {{ amp?: number; rot?: number; fps?: number }} [o] */
  boil(e, at, dur, { amp = 3, rot = 1.5, fps = 9 } = {}) {
    const seed = (this.seed += 101);
    this.tl.proc(e.idle ?? e, at, dur, (t) => {
      const s = Math.floor(t * fps);
      return { x: (hash01(seed, s) - 0.5) * 2 * amp, y: (hash01(seed + 1, s) - 0.5) * 2 * amp, rot: (hash01(seed + 2, s) - 0.5) * 2 * rot };
    });
  }

  // ---------- text art ----------

  /**
   * A signature line of text: the drawn image for the current language (<name>.<lang>),
   * fitted into a box centred on (x, y); or, if there is none, the string <name> lettered in
   * code. Hidden until an entrance (pop, wipe).
   * @param {Scene} scene
   * @param {string} name
   * @param {{ x: number; y: number; w: number; h: number; rot?: number; z?: number; color?: string }} o
   */
  textArt(scene, name, { x, y, w, h, rot = 0, z, color = C.ink }) {
    const outer = this.el(scene.cam.el, 'div', 'k-cut', { left: `${x}px`, top: `${y}px` });
    if (z != null) outer.style.zIndex = String(z);
    const inner = this.el(outer, 'div', 'k-idle');
    const key = `${name}.${this.lang}`;
    if (this.has(key)) {
      const a = this.comp.assets[key];
      const s = Math.min(w / a.w, h / a.h);
      const img = this.img(inner, key);
      Object.assign(img.style, { width: `${round(a.w * s)}px`, height: `${round(a.h * s)}px`, left: `${round((-a.w * s) / 2)}px`, top: `${round((-a.h * s) / 2)}px` });
    } else {
      const text = this.t(name);
      const lines = text.split('\n');
      const size = Math.min(h / (lines.length * 1.1), w / Math.max(...lines.map(ems)));
      const div = this.el(inner, 'div', 'k-fallback', { fontSize: `${round(size)}px`, color, width: `${w}px`, left: `${-w / 2}px` });
      div.textContent = text;
      div.style.top = `${round((-lines.length * size * 1.1) / 2)}px`;
    }
    const actor = new El(outer, { rot, opacity: 0 });
    actor.idle = this.actor(new El(inner));
    return this.actor(actor);
  }

  /** Reveals an actor from left to right, like ink drawn on. @param {El} e @param {number} at @param {number} [dur] */
  wipe(e, at, dur = 0.5) {
    this.tl.set(e, { opacity: 1, clip: 0 }, at);
    this.tl.to(e, { clip: 1 }, at, { dur, ease: 'power2.out' });
  }

  // ---------- code text ----------

  /**
   * A hand-lettered brush caption, written one letter at a time by write(). (x, y) is the
   * top left, or the top centre with align "center".
   * @param {Scene} scene
   * @param {string} text
   * @param {{ x: number; y: number; size?: number; align?: 'left' | 'center'; color?: string; font?: string; rot?: number }} o
   */
  caption(scene, text, { x, y, size = 80, align = 'left', color = C.ink, font = FONT.brush, rot = 0 }) {
    const box = this.el(scene.cam.el, 'div', 'k-caption', { left: `${x}px`, top: `${y}px`, fontSize: `${size}px`, color, fontFamily: font });
    if (align === 'center') box.classList.add('center');
    const spans = [...text].map((ch) => {
      const s = this.el(box, 'span');
      s.textContent = ch;
      return s;
    });
    const actor = new El(box, { rot, chars: 0 });
    let shown = -1;
    actor.extra = (st) => {
      const n = Math.round(st.chars);
      if (n === shown) return;
      shown = n;
      spans.forEach((s, i) => (s.style.visibility = i < n ? '' : 'hidden'));
    };
    actor.length = spans.length;
    return this.actor(actor);
  }

  /** Writes a caption or types a typewriter text, letter by letter. @param {El} e @param {number} at @param {number} dur */
  write(e, at, dur) {
    this.tl.fromTo(e, { chars: 0 }, { chars: e.length ?? 0 }, at, { dur, ease: 'linear' });
    return at + dur;
  }

  /**
   * Monospace text typed one character at a time, with a block cursor; left-aligned at (x, y).
   * Hidden until shown (show, fadeIn), so the cursor does not blink early.
   * @param {Scene} scene
   * @param {string} text
   * @param {{ x: number; y: number; size?: number; color?: string; cursor?: boolean; width?: number }} o
   */
  typer(scene, text, { x, y, size = 48, color = C.ink, cursor = true, width }) {
    const box = this.el(scene.cam.el, 'div', 'k-typer', { left: `${x}px`, top: `${y}px`, fontSize: `${size}px`, color, fontFamily: FONT.mono });
    if (width) box.style.width = `${width}px`;
    const chars = [...text];
    const actor = new El(box, { chars: 0, cursor: cursor ? 1 : 0, opacity: 0 });
    let last = '';
    actor.extra = (st) => {
      const blink = st.cursor > 0.5 && Math.floor((st.blink ?? 0) * 2.5) % 2 === 0;
      const out = chars.slice(0, Math.round(st.chars)).join('') + (blink ? '▋' : '');
      if (out !== last) box.textContent = last = out;
    };
    actor.length = chars.length;
    this.tl.add(actor, {});
    // The cursor blinks from a clock that runs for the whole animation.
    this.tl.proc(actor, 0, 600, (t) => ({ blink: t }));
    actor.render();
    return actor;
  }

  /**
   * A number that counts: shows Math.round(value), padded, or as format() writes it
   * ("WEEK 3", "第 3 周").
   * @param {Scene} scene
   * @param {{ x: number; y: number; size?: number; color?: string; pad?: number; font?: string; value?: number; align?: 'left' | 'center'; format?: (n: string) => string }} o
   */
  number(scene, { x, y, size = 80, color = C.ink, pad = 0, font = FONT.mono, value = 0, align = 'center', format = (n) => n }) {
    const box = this.el(scene.cam.el, 'div', 'k-number', { left: `${x}px`, top: `${y}px`, fontSize: `${size}px`, color, fontFamily: font });
    if (align === 'center') box.classList.add('center');
    const actor = new El(box, { value, opacity: 0 });
    let last = '';
    actor.extra = (st) => {
      const out = format(String(Math.round(st.value)).padStart(pad, '0'));
      if (out !== last) box.textContent = last = out;
    };
    return this.actor(actor);
  }

  /** Counts a number to a value. @param {El} e @param {number} at @param {number} value @param {number} [dur] */
  count(e, at, value, dur = 0.6) {
    this.tl.to(e, { value }, at, { dur, ease: 'power1.out' });
  }

  /**
   * A small label on a cream paper tag held by a strip of washi tape. (x, y) is its centre.
   * @param {Scene} scene
   * @param {string} text
   * @param {{ x: number; y: number; size?: number; tape?: string | null; rot?: number; font?: string; bg?: string; color?: string }} o
   */
  tag(scene, text, { x, y, size = 44, tape = C.teal, rot = -3, font = FONT.hand, bg = C.cream, color = C.ink }) {
    const outer = this.el(scene.cam.el, 'div', 'k-cut', { left: `${x}px`, top: `${y}px` });
    const t = this.el(outer, 'div', 'k-tag', { fontSize: `${size}px`, fontFamily: font, background: bg, color });
    t.textContent = text;
    if (tape) this.el(t, 'div', 'k-tape', { background: tape });
    return this.actor(new El(outer, { rot, opacity: 0 }));
  }

  /**
   * Ransom-note letters, each on its own paper tile of a different colour and font. (x, y)
   * is the centre. Returns the tiles, to slap() on one by one.
   * @param {Scene} scene
   * @param {string} text
   * @param {{ x: number; y: number; size?: number; seed?: number }} o
   */
  tiles(scene, text, { x, y, size = 110, seed }) {
    const r = this.rng(seed);
    const styles = [['ink', 'cream'], ['ink', 'mustard'], ['cream', 'red'], ['cream', 'ink'], ['red', 'cream'], ['ultra', 'mustard'], ['mustard', 'ink'], ['pink', 'red'], ['teal', 'cream']];
    const fonts = [FONT.display, FONT.mono, FONT.brush, FONT.hand, '"Songti SC", Georgia, serif'];
    const box = this.el(scene.cam.el, 'div', 'k-ransom', { left: `${x}px`, top: `${y}px`, fontSize: `${size}px` });
    /** @type {El[]} */
    const tiles = [];
    let last = -1;
    for (const lineText of text.split('\n')) {
      const line = this.el(box, 'div', 'k-line');
      for (const ch of lineText) {
        if (ch === ' ') {
          this.el(line, 'span', 'k-gap');
          continue;
        }
        let s;
        do s = Math.floor(r() * styles.length);
        while (s === last);
        last = s;
        const [bg, fg] = styles[s];
        const t = this.el(line, 'span', 'k-tile', {
          background: C[/** @type {keyof typeof C} */ (bg)],
          color: C[/** @type {keyof typeof C} */ (fg)],
          fontFamily: fonts[Math.floor(r() * fonts.length)],
          fontSize: `${round(0.82 + r() * 0.3, 2)}em`,
        });
        t.textContent = /[a-z]/i.test(ch) && r() < 0.25 ? ch.toLowerCase() : ch.toUpperCase();
        tiles.push(this.actor(new El(t, { rot: (r() - 0.5) * 12, y: (r() - 0.5) * size * 0.12, opacity: 0 })));
      }
    }
    return tiles;
  }

  /** Slaps tiles on one at a time. @param {El[]} tiles @param {number} at @param {number} [stagger] */
  slap(tiles, at, stagger = 0.05) {
    tiles.forEach((t, i) => this.tl.fromTo(t, { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1 }, at + i * stagger, { dur: 0.16, ease: 'back.out(2.5)' }));
    return at + tiles.length * stagger;
  }

  // ---------- pencil ----------

  /**
   * A stroke that draws itself with draw(). dash makes a dashed travel trail.
   * @param {Scene} scene
   * @param {string} d SVG path data, stage coordinates
   * @param {{ color?: string; width?: number; dash?: string; fill?: string }} [o]
   */
  stroke(scene, d, { color = C.pencil, width = 5, dash, fill = 'none' } = {}) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', String(width));
    path.setAttribute('fill', fill);
    scene.svg.append(path);
    const len = path.getTotalLength();
    /** @type {SVGPathElement} */
    let reveal = path;
    if (dash) {
      const id = `k-mask-${++maskCount}`;
      const defs = document.createElementNS(SVG_NS, 'defs');
      const mask = document.createElementNS(SVG_NS, 'mask');
      mask.id = id;
      mask.setAttribute('maskUnits', 'userSpaceOnUse');
      reveal = document.createElementNS(SVG_NS, 'path');
      reveal.setAttribute('d', d);
      reveal.setAttribute('stroke', '#fff');
      reveal.setAttribute('stroke-width', String(width + 6));
      reveal.setAttribute('fill', 'none');
      mask.append(reveal);
      defs.append(mask);
      scene.svg.append(defs);
      path.setAttribute('stroke-dasharray', dash);
      path.setAttribute('mask', `url(#${id})`);
    }
    reveal.setAttribute('stroke-dasharray', `${len + 1} ${len + 1}`);
    const actor = new El(path, { draw: 0 });
    let last = -1;
    actor.extra = (st) => {
      const off = round((len + 1) * (1 - Math.max(0, Math.min(1, st.draw))), 1);
      if (off !== last) reveal.setAttribute('stroke-dashoffset', String((last = off)));
    };
    actor.path = path;
    return this.actor(actor);
  }

  /** Draws strokes on, one after another. @param {El | El[]} strokes @param {number} at @param {number} [dur] @param {{ stagger?: number; ease?: string }} [o] */
  draw(strokes, at, dur = 0.35, { stagger = 0.08, ease = 'power1.inOut' } = {}) {
    [strokes].flat().forEach((s, i) => this.tl.fromTo(s, { draw: 0 }, { draw: 1 }, at + i * stagger, { dur, ease }));
  }

  /** Undraws strokes. @param {El | El[]} strokes @param {number} at @param {number} [dur] */
  undraw(strokes, at, dur = 0.3) {
    [strokes].flat().forEach((s) => this.tl.to(s, { draw: 0 }, at, { dur, ease: 'power1.in' }));
  }

  /** A red pencil double underline. @param {Scene} scene @param {{ x: number; y: number; w: number; color?: string }} o */
  underline(scene, { x, y, w, color = C.red }) {
    const r = this.rng();
    const wob = (/** @type {number} */ a) => (r() - 0.5) * a;
    return [0, 1].map((i) =>
      this.stroke(scene, `M${x + (i ? w * 0.15 : 0)} ${y + i * 14 + wob(4)} Q${x + w / 2} ${y + i * 14 + wob(14)} ${x + (i ? w * 0.8 : w)} ${y + i * 14 + wob(6)}`, { color, width: i ? 5 : 6 }),
    );
  }

  /** A red pencil ring. @param {Scene} scene @param {{ x: number; y: number; rx?: number; ry?: number; color?: string }} o */
  ring(scene, { x, y, rx = 60, ry = 40, color = C.red }) {
    return this.stroke(scene, `M${x - rx} ${y} C${x - rx} ${y - ry * 1.3} ${x + rx} ${y - ry * 1.3} ${x + rx} ${y} C${x + rx} ${y + ry * 1.3} ${x - rx} ${y + ry * 1.35} ${x - rx - 6} ${y - 8}`, { color, width: 6 });
  }

  /** A pencil check mark. @param {Scene} scene @param {{ x: number; y: number; size?: number; color?: string }} o */
  check(scene, { x, y, size = 50, color = C.red }) {
    return this.stroke(scene, `M${x} ${y} l${size * 0.3} ${size * 0.35} l${size * 0.75} ${-size}`, { color, width: 7 });
  }

  /**
   * Doodles that pop in: sparkle, ticks (an impact burst), speed (lines), or text ("?", "!", "z z z").
   * @param {Scene} scene
   * @param {'sparkle' | 'ticks' | 'speed' | 'text'} kind
   * @param {{ x: number; y: number; size?: number; text?: string; n?: number; color?: string; width?: number; dir?: number }} o
   */
  doodle(scene, kind, { x, y, size = 40, text = '!', n = 6, color = C.pencil, width = 5, dir = 180 }) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.style.transformOrigin = `${x}px ${y}px`;
    scene.svg.append(g);
    /** @param {number} x1 @param {number} y1 @param {number} x2 @param {number} y2 */
    const line = (x1, y1, x2, y2) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', `M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}`);
      p.setAttribute('stroke', color);
      p.setAttribute('stroke-width', String(width));
      g.append(p);
    };
    if (kind === 'sparkle') {
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        line(x + Math.cos(a) * size * 0.35, y + Math.sin(a) * size * 0.35, x + Math.cos(a) * size, y + Math.sin(a) * size);
      }
    } else if (kind === 'ticks') {
      for (let i = 0; i < n; i++) {
        const a = Math.PI + (i * Math.PI) / (n - 1);
        line(x + Math.cos(a) * size, y + Math.sin(a) * size, x + Math.cos(a) * size * 1.7, y + Math.sin(a) * size * 1.7);
      }
    } else if (kind === 'speed') {
      const a = (dir * Math.PI) / 180;
      for (let i = 0; i < n; i++) {
        const o = (i - (n - 1) / 2) * 22;
        const l = size * (2 + ((i * 7) % 3));
        line(x - Math.sin(a) * o, y + Math.cos(a) * o, x - Math.sin(a) * o + Math.cos(a) * l, y + Math.cos(a) * o + Math.sin(a) * l);
      }
    } else {
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', String(x));
      t.setAttribute('y', String(y));
      t.setAttribute('font-size', String(size * 2.4));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'middle');
      t.setAttribute('fill', color);
      t.textContent = text;
      g.append(t);
    }
    return this.actor(new El(g, { opacity: 0 }));
  }

  // ---------- particles ----------

  /** A burst of paper confetti. @param {Scene} scene @param {number} at @param {{ x: number; y: number; n?: number; spread?: number }} o */
  confetti(scene, at, { x, y, n = 18, spread = 260 }) {
    const r = this.rng();
    const cols = [C.red, C.mustard, C.teal, C.ultra, C.pink, C.sage];
    for (let i = 0; i < n; i++) {
      const c = this.el(scene.cam.el, 'div', 'k-confetti', { left: `${x}px`, top: `${y}px`, background: cols[i % cols.length] });
      const a = -Math.PI * (0.15 + r() * 0.7);
      const d = spread * (0.4 + r() * 0.6);
      const dx = Math.cos(a) * d;
      const dy = Math.sin(a) * d;
      const e = this.actor(new El(c, { opacity: 0 }));
      this.tl.set(e, { opacity: 1 }, at);
      this.tl.fromTo(e, { x: 0, y: 0, rot: 0, scale: 0.6 + r() * 0.7 }, { x: dx, y: dy, rot: (r() - 0.5) * 540 }, at, { dur: 0.45, ease: 'power2.out' });
      this.tl.to(e, { y: dy + 260 + r() * 200, x: dx * 1.15, rot: (r() - 0.5) * 900, opacity: 0 }, at + 0.45, { dur: 0.9 + r() * 0.5, ease: 'power1.in' });
    }
  }
}
