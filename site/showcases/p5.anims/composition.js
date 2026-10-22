// @ts-check
// p5.animS, 18 seconds.
//
// 0.0   A sketchbook and a pencil. One line of code at a time (animS.circle, animS.rect,
//       animS.triangle, animS.line), and the pencil draws each shape as it is called, stroke
//       by stroke: a sun, a house, its roof, the ground.
// 10.2  animS.reset(): the drawing rewinds, then replays, every shape at once.
// 13.4  Watch it draw: a library for p5.js.

import { C } from '../../js/anim/kit.js';
import assets from './assets.js';

/** @param {number} cx @param {number} cy @param {number} r */
const circle = (cx, cy, r) => `M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy}`;

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 18,
  poster: 9.9,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      draw: 'Watch it\ndraw!',
      lib: 'a library for p5.js',
      replay: 'replay!',
    },
    zh: {
      draw: '一笔一笔画出来！',
      lib: 'p5.js 扩展库',
      replay: '重播！',
    },
  },

  build(k) {
    const s1 = k.scene('bg_sketch');
    k.pushIn(s1, 0, 13.4, 1.03);

    // The shapes, in the order the code calls them.
    const shapes = [
      { code: "animS.circle('sun', 30, x, y, d);", d: circle(1300, 330, 95), color: C.red, width: 12 },
      { code: "animS.rect('house', 30, x, y, w, h);", d: 'M720 560 H1080 V820 H720 Z', color: C.ultra, width: 12 },
      { code: "animS.triangle('roof', 30, ...);", d: 'M690 565 L900 385 L1110 565 Z', color: C.mustard, width: 12 },
      { code: "animS.line('ground', 30, ...);", d: 'M520 824 Q1000 806 1480 828', color: C.olive, width: 10 },
    ];
    const pencilAt = { x: 1205, y: 330 };
    const pencil = k.sprite(s1, 'pencil', { x: pencilAt.x, y: pencilAt.y, h: 300, anchor: 'bottomLeft', z: 20 });
    k.pop(pencil, 0.1);

    let t = 0.2;
    /** @type {import('../../js/anim/kit.js').El[]} */
    const strokes = [];
    /** @type {import('../../js/anim/kit.js').El | null} */
    let prev = null;
    for (const shape of shapes) {
      const line = k.typer(s1, shape.code, { x: 560, y: 70, size: 42, color: C.ink });
      if (prev) k.hide(prev, t);
      k.show(line, t);
      k.write(line, t, 0.8);
      const stroke = k.stroke(s1, shape.d, { color: shape.color, width: shape.width });
      strokes.push(stroke);
      const path = /** @type {SVGPathElement} */ (stroke.path);
      const start = path.getPointAtLength(0);
      const drawAt = t + 0.95;
      // The pencil travels to the shape's start, then draws it.
      k.moveTo(pencil, t + 0.45, { x: start.x - pencilAt.x, y: start.y - pencilAt.y, dur: 0.45, ease: 'power2.inOut' });
      k.draw(stroke, drawAt, 1.3, { ease: 'linear' });
      k.follow(pencil, pencilAt, path, drawAt, 1.3);
      prev = line;
      t = drawAt + 1.45;
    }
    // A door and a window, quick, while the sun gets its rays.
    const door = k.stroke(s1, 'M865 820 V710 H935 V820', { color: C.red, width: 9 });
    const win = k.stroke(s1, 'M985 630 H1045 V690 H985 Z', { color: C.teal, width: 8 });
    k.draw([door, win], t - 0.1, 0.35, { stagger: 0.2 });
    strokes.push(door, win);
    const rays = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const a = (i * Math.PI) / 4;
      const x1 = 1300 + Math.cos(a) * 120;
      const y1 = 330 + Math.sin(a) * 120;
      return k.stroke(s1, `M${x1.toFixed(1)} ${y1.toFixed(1)} L${(1300 + Math.cos(a) * 165).toFixed(1)} ${(330 + Math.sin(a) * 165).toFixed(1)}`, { color: C.red, width: 9 });
    });
    k.draw(rays, t + 0.2, 0.2, { stagger: 0.05 });
    strokes.push(...rays);
    const sparkle = k.doodle(s1, 'sparkle', { x: 620, y: 470, size: 36 });
    k.pop(sparkle, t + 0.6);

    // ---- animS.reset(): rewind, and replay ----
    const reset = k.typer(s1, 'animS.reset();', { x: 560, y: 70, size: 42, color: C.red });
    const resetAt = 10.2;
    if (prev) k.hide(prev, resetAt);
    k.hide(sparkle, resetAt);
    k.show(reset, resetAt);
    k.write(reset, resetAt, 0.5);
    k.undraw(strokes, resetAt + 0.7, 0.45);
    k.shake(s1, resetAt + 0.7, 0.45, 10);
    const speed = k.doodle(s1, 'speed', { x: 1480, y: 560, size: 40, n: 4, dir: 0 });
    k.pop(speed, resetAt + 0.7);
    k.fadeOut(speed, resetAt + 1.3, 0.2);
    k.draw(strokes, resetAt + 1.45, 1.1, { stagger: 0, ease: 'power1.inOut' });
    k.boil(pencil, resetAt + 1.45, 1.1, { amp: 6, rot: 3, fps: 12 });
    const replay = k.tag(s1, k.t('replay'), { x: 1330, y: 640, rot: 6, tape: C.pink, size: 54 });
    k.pop(replay, resetAt + 1.5);

    // ---- watch it draw ----
    const s2 = k.sheetIn(k.scene('bg_kraft'), 13.4, { from: 'bottom' });
    k.pushIn(s2, 13.4, 4.6, 1.03);
    const title = k.textArt(s2, 'draw', { x: 1000, y: 330, w: 900, h: 400 });
    k.pop(title, 13.9, { dur: 0.5 });
    k.sway(title, 14.4, 3.6, { deg: 1.4, period: 2.2 });
    const palette = k.sprite(s2, 'palette', { x: 700, y: 840, h: 230, anchor: 'center' });
    k.pop(palette, 14.3);
    k.sway(palette, 14.8, 3.2, { deg: 3 });
    const p2 = k.sprite(s2, 'pencil', { x: 1260, y: 880, h: 300, anchor: 'center' });
    k.dropIn(p2, 14.5, { from: -700 });
    k.hop(p2, 15.6, { h: 50, n: 2 });
    const lib = k.tag(s2, k.t('lib'), { x: 1000, y: 650, rot: -3, tape: C.teal, size: 52 });
    k.pop(lib, 15.0);
    k.confetti(s2, 14.2, { x: 1000, y: 420, n: 20, spread: 320 });
  },
};
