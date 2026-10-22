// @ts-check
// Meowlang, 20 seconds.
//
// 0.0   "Meow?" A cat strolls onto a keyboard and sits down to type.
// 3.8   It types a program: Meow Meow Meow; Meow; Meow Meow; Each line is a number, counted
//       in meows: 3, 1, 2. A programming language for cats.
// 9.6   The program runs: Fibonacci, in kittens. 1, 1, 2, 3, 5, 8.
// 14.6  Meow in any language (Meow, 喵, ニャー, Мяу, Miau). Code is data, and data is meow.

import { C, FONT } from '../../js/anim/kit.js';
import assets from './assets.js';

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 20,
  poster: 6.6,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      meow: 'Meow?',
      data: 'Data\nis meow.',
      program: 'Meow Meow Meow;\nMeow;\nMeow Meow;',
      forCats: 'a language for cats',
      fib: 'fibonacci.meow',
    },
    zh: {
      meow: '喵？',
      data: '数据就是喵。',
      program: '喵喵喵;\n喵;\n喵喵;',
      forCats: '写给猫的编程语言',
      fib: 'fibonacci.meow',
    },
  },

  build(k) {
    const tl = k.tl;

    // ---- 1. Meow? ----
    const s1 = k.scene('bg_paper');
    k.pushIn(s1, 0, 9.6, 1.04);
    const keyboard = k.sprite(s1, 'keyboard', { x: 1000, y: 985, w: 640, z: 6 });
    k.slideIn(keyboard, 0.1, { dx: 0, dy: 400, dur: 0.5 });
    const meow = k.textArt(s1, 'meow', { x: 1000, y: 250, w: 640, h: 340 });
    k.pop(meow, 0.35, { dur: 0.5 });
    k.sway(meow, 1.0, 2.8, { deg: 2.5, period: 1.6 });
    const walker = k.sprite(s1, 'cat_walk', { x: 1000, y: 780, h: 330, z: 4 });
    k.slideIn(walker, 1.0, { dx: -900, dur: 1.3, ease: 'power2.out' });
    k.boil(walker, 1.0, 1.3, { amp: 4, rot: 2, fps: 8 });
    const lines1 = k.doodle(s1, 'speed', { x: 610, y: 690, size: 30, n: 3, dir: 180 });
    k.pop(lines1, 1.2);
    k.fadeOut(lines1, 2.3, 0.2);
    // It sits down to type: the typing pose comes with its own keyboard.
    const cat = k.sprite(s1, 'cat_type', { x: 1000, y: 990, h: 470, z: 5 });
    k.hide(walker, 2.5);
    k.hide(keyboard, 2.5);
    k.pop(cat, 2.5, { dur: 0.35, tilt: 4 });
    k.fadeOut(meow, 3.6, 0.25);

    // ---- 2. a program, in meows ----
    const program = k.t('program');
    const lines = program.split('\n');
    const typer = k.typer(s1, program, { x: 600, y: 100, size: 64, color: C.ink });
    k.show(typer, 3.8);
    /** @param {number} n */
    const upTo = (n) => lines.slice(0, n).join('\n').length + (n < lines.length ? 1 : 0);
    const values = [3, 1, 2];
    let t = 4.0;
    lines.forEach((line, i) => {
      const dur = 0.25 + line.length * 0.07;
      tl.to(typer, { chars: upTo(i + 1) }, t, { dur, ease: 'linear' });
      k.boil(cat, t, dur, { amp: 3, rot: 1.5, fps: 10 });
      const eq = k.tag(s1, `= ${values[i]}`, { x: 1330, y: 142 + i * 83, rot: 3 - i * 3, tape: null, size: 52, bg: C.mustard, font: FONT.mono });
      k.pop(eq, t + dur + 0.05);
      t += dur + 0.45;
    });
    const forCats = k.tag(s1, k.t('forCats'), { x: 1000, y: 405, rot: -3, tape: C.pink, size: 54 });
    k.pop(forCats, t + 0.2);
    k.hop(cat, t + 0.5, { h: 40 });

    // ---- 3. Fibonacci, in kittens ----
    const s2 = k.sheetIn(k.scene('bg_kraft'), 9.6, { from: 'right' });
    k.pushIn(s2, 9.6, 5, 1.03);
    const fib = [1, 1, 2, 3, 5, 8];
    fib.forEach((n, row) => {
      const y = 175 + row * 112;
      const at = 10.0 + row * 0.62;
      const num = k.number(s2, { x: 585, y: y - 48, size: 76, color: C.paper, font: FONT.display, value: n, align: 'center' });
      k.pop(num, at);
      for (let i = 0; i < n; i++) {
        const kit = k.sprite(s2, 'kitten', { x: 720 + i * 96, y, h: 92, anchor: 'center' });
        k.pop(kit, at + 0.08 + i * 0.05, { dur: 0.3 });
        k.bob(kit, at + 0.5, 14.6 - at - 0.5, { px: 4, period: 0.9 + ((i + row) % 3) * 0.15 });
      }
    });
    const fibTag = k.tag(s2, k.t('fib'), { x: 1000, y: 905, rot: -2, tape: C.teal, size: 48, font: FONT.mono });
    k.pop(fibTag, 13.3);

    // ---- 4. data is meow ----
    const s3 = k.sheetIn(k.scene('bg_paper'), 14.6, { from: 'left' });
    k.pushIn(s3, 14.6, 5.4, 1.03);
    const proud = k.sprite(s3, 'cat_proud', { x: 1000, y: 975, h: 470, z: 4 });
    k.pop(proud, 14.9, { dur: 0.5 });
    k.sway(proud, 15.4, 4.6, { deg: 1.8, period: 1.9 });
    const data = k.textArt(s3, 'data', { x: 1000, y: 225, w: 860, h: 330 });
    k.pop(data, 15.5, { dur: 0.5 });
    k.sway(data, 16.0, 4, { deg: 1.2, period: 2.4 });
    const tokens = [
      ['Meow', 650, 560, C.teal],
      ['喵', 1350, 545, C.red],
      ['ニャー', 665, 780, C.mustard],
      ['Мяу', 1345, 770, C.ultra],
    ];
    tokens.forEach(([word, x, y, tape], i) => {
      const tag = k.tag(s3, String(word), { x: Number(x), y: Number(y), rot: i % 2 ? 5 : -5, tape: String(tape), size: 62 });
      k.pop(tag, 16.2 + i * 0.25);
      k.sway(tag, 16.6 + i * 0.25, 3.2, { deg: 2.5, period: 1.2 });
    });
    k.confetti(s3, 16.0, { x: 1000, y: 500, n: 20, spread: 300 });
  },
};
