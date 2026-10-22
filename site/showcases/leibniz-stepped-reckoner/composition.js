// @ts-check
// Leibniz's Stepped Reckoner, 22 seconds.
//
// 0.0   + − × ÷ slap on, one tile at a time. Leibniz, wig and all, wonders: one machine for
//       all four?
// 4.6   The stepped reckoner slides in. Each turn of the crank adds the number on the knobs:
//       the register counts 0 → 2 → 5. Leibniz is delighted.
// 10.8  Its secret, the stepped drum: nine teeth of nine lengths. Then the carry: 0999 + 1
//       ripples across the register to 1000.
// 16.6  The machine and Leibniz together, in 3D, in your browser: turn the crank!

import { C, El, FONT } from '../../js/anim/kit.js';
import assets from './assets.js';

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 22,
  poster: 8.6,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      crank: 'Turn the\ncrank!',
      year: 'c. 1694',
      ops: '+ − × ÷',
      drum: 'the stepped drum',
      teeth: '9 teeth, 9 lengths',
      carry: 'carry!',
      web: '3D · in your browser',
    },
    zh: {
      crank: '摇动曲柄！',
      year: '约 1694 年',
      ops: '+ − × ÷',
      drum: '步进轮',
      teeth: '9 个齿，长短各不同',
      carry: '进位！',
      web: '3D 模型 · 浏览器里就能转',
    },
  },

  build(k) {
    const tl = k.tl;

    // ---- 1. all four operations? ----
    const s1 = k.scene('bg_study');
    k.pushIn(s1, 0, 10.8, 1.04);
    const ops = k.tiles(s1, k.t('ops'), { x: 1000, y: 200, size: 150, seed: 7 });
    k.slap(ops, 0.1, 0.24);
    const think = k.sprite(s1, ['leibniz_think', 'leibniz_cheer'], { x: 720, y: 985, h: 560, z: 6 });
    k.pop(think, 0.6);
    k.sway(think, 1.4, 9.4, { deg: 1.8, period: 2 });
    const q = k.doodle(s1, 'text', { x: 830, y: 470, size: 40, text: '?', color: C.red });
    k.pop(q, 1.8);
    k.boil(q, 2.2, 2.4, { amp: 4, rot: 4 });
    const year = k.tag(s1, k.t('year'), { x: 1290, y: 420, rot: 4, tape: C.mustard, size: 54 });
    k.pop(year, 2.4);
    k.sway(year, 2.9, 1.7, { deg: 2 });
    k.fadeOut(q, 4.4, 0.2);
    k.fadeOut(year, 4.5, 0.2);

    // ---- 2. turn the crank: the register adds ----
    const machine = k.sprite(s1, 'machine', { x: 1110, y: 930, w: 700, z: 4 });
    k.slideIn(machine, 4.6, { dx: 900, dur: 0.6 });

    // The result register: four brass windows, one digit each, above the machine.
    const reg = k.el(s1.cam.el, 'div', '', {
      position: 'absolute', left: '830px', top: '330px', width: '580px', height: '170px', background: '#6b4423',
      borderRadius: '18px', border: '8px solid #d9a441', boxShadow: '0 12px 10px rgb(74 48 22 / 0.3)', transformOrigin: '50% 50%',
    });
    const regActor = k.actor(new El(reg, { opacity: 0 }));
    /** @type {El[]} */
    const digits = [];
    for (let i = 0; i < 4; i++) {
      const win = k.el(reg, 'div', '', {
        position: 'absolute', left: `${22 + i * 136}px`, top: '16px', width: '112px', height: '122px', background: C.paper,
        borderRadius: '10px', boxShadow: 'inset 0 5px 8px rgb(0 0 0 / 0.35)', overflow: 'hidden',
      });
      const d = k.number(s1, { x: 56, y: 6, size: 104, color: C.ink, font: FONT.display });
      win.append(d.el);
      tl.set(d, { opacity: 1 }, 0);
      digits.push(d);
    }
    k.pop(regActor, 5.2, { tilt: 5 });
    /**
     * Shows a value on the register at a time, each changed digit flicking in.
     * @param {number} value @param {number} at @param {number} [gap] seconds between digits, right to left
     */
    const show = (value, at, gap = 0) => {
      const s = String(value).padStart(4, '0');
      for (let i = 3; i >= 0; i--) {
        const t = at + (3 - i) * gap;
        const prev = Math.round(tl.valueAt(digits[i], 'value', t));
        const next = Number(s[i]);
        if (prev === next) continue;
        tl.set(digits[i], { value: next }, t);
        tl.fromTo(digits[i], { y: -60, sy: 0.6 }, { y: 0, sy: 1 }, t, { dur: 0.22, ease: 'back.out(2.5)' });
      }
    };
    // Two turns of the crank: +2, then +3. Each turn shakes the machine and draws an arc.
    const turn = (/** @type {number} */ at, /** @type {string} */ label) => {
      k.boil(machine, at, 0.7, { amp: 3, rot: 0.8, fps: 12 });
      const arc = k.stroke(s1, 'M1380 690 A 62 62 0 1 1 1442 752', { color: C.red, width: 8 });
      k.draw(arc, at, 0.5);
      k.undraw(arc, at + 0.9, 0.2);
      const tag = k.tag(s1, label, { x: 1370, y: 575, rot: 6, tape: null, size: 56, bg: C.mustard });
      k.pop(tag, at + 0.15);
      k.fadeOut(tag, at + 1.3, 0.2);
    };
    turn(6.0, '+2');
    show(2, 6.55);
    turn(7.7, '+3');
    show(5, 8.25);
    k.flipTo(think, 'leibniz_cheer', 8.5);
    k.hop(think, 8.9, { h: 50 });
    k.confetti(s1, 8.4, { x: 1120, y: 320, n: 14, spread: 220 });

    // ---- 3. the stepped drum, and the carry ----
    const s2 = k.sheetIn(k.scene('bg_paper'), 10.8, { from: 'bottom' });
    k.pushIn(s2, 10.8, 5.8, 1.03);
    const drum = k.sprite(s2, 'drum', { x: 1000, y: 470, w: 760, anchor: 'center' });
    k.pop(drum, 11.2, { dur: 0.55 });
    k.bob(drum, 11.8, 4.8, { px: 6, period: 1.6 });
    const drumTag = k.tag(s2, k.t('drum'), { x: 1000, y: 175, rot: -2, tape: C.teal, size: 58 });
    k.pop(drumTag, 11.6);
    const teeth = k.caption(s2, k.t('teeth'), { x: 1000, y: 690, size: 76, align: 'center', color: C.ink });
    k.write(teeth, 12.3, 0.9);
    const under = k.underline(s2, { x: 700, y: 790, w: 600 });
    k.draw(under, 13.2, 0.3);
    // The register again, small, for the carry: 0999 + 1.
    k.fadeOut(drum, 14.1, 0.25);
    k.fadeOut(drumTag, 14.1, 0.25);
    k.fadeOut(teeth, 14.1, 0.25);
    k.undraw(under, 14.1, 0.2);
    const reg2 = /** @type {HTMLElement} */ (reg.cloneNode(false));
    s2.cam.el.append(reg2);
    Object.assign(reg2.style, { left: '710px', top: '380px' });
    const reg2Actor = k.actor(new El(reg2, { opacity: 0, scale: 1 }));
    /** @type {El[]} */
    const carryDigits = [];
    for (let i = 0; i < 4; i++) {
      const win = k.el(reg2, 'div', '', {
        position: 'absolute', left: `${22 + i * 136}px`, top: '16px', width: '112px', height: '122px', background: C.paper,
        borderRadius: '10px', boxShadow: 'inset 0 5px 8px rgb(0 0 0 / 0.35)', overflow: 'hidden',
      });
      const d = k.number(s2, { x: 56, y: 6, size: 104, color: C.ink, font: FONT.display, value: i === 0 ? 0 : 9 });
      win.append(d.el);
      tl.set(d, { opacity: 1 }, 0);
      carryDigits.push(d);
    }
    k.pop(reg2Actor, 14.3, { tilt: 4 });
    const plus = k.tag(s2, '+1', { x: 1330, y: 330, rot: 8, tape: null, size: 64, bg: C.mustard });
    k.pop(plus, 14.7);
    // The carry runs right to left: 9 → 0 at each place, then 0 → 1.
    for (let i = 3; i >= 0; i--) {
      const t = 15.1 + (3 - i) * 0.22;
      tl.set(carryDigits[i], { value: i === 0 ? 1 : 0 }, t);
      tl.fromTo(carryDigits[i], { y: -60, sy: 0.6 }, { y: 0, sy: 1 }, t, { dur: 0.22, ease: 'back.out(2.5)' });
      const tick = k.doodle(s2, 'ticks', { x: 776 + i * 136, y: 380, size: 26, n: 5, color: C.red });
      k.pop(tick, t, { dur: 0.25 });
      k.fadeOut(tick, t + 0.5, 0.15);
    }
    const carry = k.tag(s2, k.t('carry'), { x: 1000, y: 680, rot: -4, tape: C.red, size: 70 });
    k.pop(carry, 16.0);
    k.shake(s2, 15.1, 0.9, 8);

    // ---- 4. in your browser: turn the crank! ----
    const s3 = k.sheetIn(k.scene('bg_study'), 16.6, { from: 'right' });
    k.pushIn(s3, 16.6, 5.4, 1.03);
    const m2 = k.sprite(s3, 'machine', { x: 1090, y: 930, w: 700, z: 4 });
    k.slideIn(m2, 16.9, { dx: 0, dy: 500, dur: 0.6 });
    const cheer = k.sprite(s3, 'leibniz_cheer', { x: 700, y: 985, h: 520, z: 6 });
    k.pop(cheer, 17.3);
    k.hop(cheer, 18.6, { h: 60, n: 2 });
    k.sway(cheer, 19.8, 2.2, { deg: 2 });
    const crank = k.textArt(s3, 'crank', { x: 1000, y: 230, w: 860, h: 330 });
    k.pop(crank, 17.7, { dur: 0.5 });
    k.sway(crank, 18.2, 3.8, { deg: 1.3, period: 2.4 });
    const web = k.tag(s3, k.t('web'), { x: 1180, y: 470, rot: 3, tape: C.teal, size: 44 });
    k.pop(web, 18.5);
    k.confetti(s3, 18.0, { x: 1000, y: 460, n: 22, spread: 320 });
    k.boil(m2, 19.0, 1.0, { amp: 2, rot: 0.6, fps: 12 });
  },
};
