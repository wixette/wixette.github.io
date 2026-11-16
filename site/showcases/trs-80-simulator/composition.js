// @ts-check
// TRS-80 Simulator, 25.5 seconds: the 1977 computer that came ready out of the box.
//
// 0.0   1977. Two years before, a computer was a kit to solder: the pile of parts is crossed
//       out, and a box drops onto the shop counter instead, $599.95. Ready out of the box!
// 5.4   At home, a kid switches it on. MEMORY SIZE? ENTER, READY. 10 PRINT "HELLO", RUN:
//       HELLO. Type BASIC, and it answers.
// 11.4  Programs come on cassette tape: CLOAD, the tape sings its bits into the machine, and
//       Moon lander runs, a lander of white blocks settling onto the pad.
// 16.8  Open it up while it runs: the main board, its chips lighting up, the Z80 at 1.77 MHz,
//       16 KB of RAM and BASIC in 12 KB of ROM.
// 20.8  Today: the same machine, in 3D, in your browser. Switch it on!

import { C, El, FONT } from '../../js/anim/kit.js';
import assets from './assets.js';

/** The computer sprite's screen, as fractions of the sprite's width and height. */
const SCREEN = { left: 0.259, top: 0.139, width: 0.43, height: 0.373 };
/** The Model I's text: white phosphor on a dark tube. */
const PHOSPHOR = '#e6fff2';

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 25.5,
  poster: 9.6,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      box: 'Ready out\nof the box!',
      on: 'Switch it on!',
      year: '1977',
      kit: 'before: a kit to solder',
      price: '$599.95',
      enter: 'ENTER',
      answers: 'type BASIC, and it answers',
      tape: 'programs on cassette tape',
      inside: 'look inside while it runs',
      z80: 'Z80 · 1.77 MHz',
      ram: '16 KB RAM',
      rom: 'BASIC in 12 KB ROM',
      web: 'in 3D · in your browser',
    },
    zh: {
      box: '开箱就能用！',
      on: '开机试试！',
      year: '1977',
      kit: '以前：零件要自己焊',
      price: '599.95 美元',
      enter: 'ENTER',
      answers: '敲进 BASIC，它就回答你',
      tape: '程序存在磁带上',
      inside: '运行时打开机箱看看',
      z80: 'Z80 · 1.77 MHz',
      ram: '16 KB 内存',
      rom: 'BASIC 在 12 KB ROM 里',
      web: '3D 复原 · 浏览器里就能玩',
    },
  },

  build(k) {
    const tl = k.tl;

    /**
     * The computer, with its screen's box in stage px, for the text drawn on it.
     * @param {import('../../js/anim/kit.js').Scene} scene @param {number} x @param {number} y feet @param {number} w
     */
    const computer = (scene, x, y, w) => {
      const a = assets.computer;
      const h = (w * a.h) / a.w;
      const sprite = k.sprite(scene, 'computer', { x, y, w, z: 3 });
      const screen = { x: x - w / 2 + SCREEN.left * w, y: y - h + SCREEN.top * h, w: SCREEN.width * w, h: SCREEN.height * h };
      return { sprite, screen };
    };
    /**
     * A line of the Model I's text on a screen, typed or shown later.
     * @param {import('../../js/anim/kit.js').Scene} scene @param {{ x: number; y: number; w: number; h: number }} screen
     * @param {string} text @param {number} row
     */
    const line = (scene, screen, text, row) => {
      const size = screen.h / 9;
      const t = k.typer(scene, text, { x: screen.x + size * 0.6, y: screen.y + size * 0.5 + row * size * 1.3, size, color: PHOSPHOR });
      t.el.style.zIndex = '4';
      t.el.style.textShadow = `0 0 ${Math.round(size / 3)}px rgb(160 255 210 / 0.75)`;
      return t;
    };
    /** Types a line, its cursor blinking only while it is the last. @param {El} t @param {number} at @param {number} dur @param {number} [until] */
    const type = (t, at, dur, until) => {
      k.show(t, at);
      k.write(t, at, dur);
      if (until != null) tl.set(t, { cursor: 0 }, until);
    };

    // ---- 1. 1977: ready out of the box ----
    const s1 = k.scene('bg_shop');
    k.pushIn(s1, 0, 5.4, 1.04);
    const year = k.tiles(s1, k.t('year'), { x: 1000, y: 120, size: 120, seed: 9 });
    k.slap(year, 0.15, 0.08);
    const kit = k.sprite(s1, 'kit', { x: 700, y: 900, h: 240, z: 2 });
    k.pop(kit, 0.2);
    const kitTag = k.tag(s1, k.t('kit'), { x: 740, y: 590, rot: -3, tape: C.teal, size: 40 });
    kitTag.el.style.zIndex = '6';
    k.pop(kitTag, 0.6);
    const cross = [k.stroke(s1, 'M590 670 L820 890', { color: C.red, width: 12 }), k.stroke(s1, 'M820 670 L590 890', { color: C.red, width: 12 })];
    k.draw(cross, 1.6, 0.2, { stagger: 0.15 });
    const box = k.sprite(s1, 'box', { x: 1060, y: 905, h: 400, z: 3 });
    k.dropIn(box, 1.9, { from: -700 });
    k.shake(s1, 2.35, 0.35, 10);
    const price = k.tag(s1, k.t('price'), { x: 1160, y: 560, rot: 6, tape: null, size: 58, bg: C.mustard });
    k.pop(price, 2.5);
    const wow = k.sprite(s1, 'kid_wow', { x: 1380, y: 990, h: 460, z: 5 });
    k.slideIn(wow, 2.2, { dx: 600 });
    year.forEach((t) => k.fadeOut(t, 2.8, 0.2));
    const boxText = k.textArt(s1, 'box', { x: 1000, y: 290, w: 820, h: 270, z: 10 });
    k.pop(boxText, 3.0, { dur: 0.5 });
    k.sway(boxText, 3.5, 1.9, { deg: 1.4, period: 2.2 });
    k.hop(wow, 3.4, { h: 50, n: 2 });
    k.confetti(s1, 3.1, { x: 1060, y: 520, n: 16, spread: 260 });

    // ---- 2. switch it on: MEMORY SIZE?, READY, HELLO ----
    const s2 = k.sheetIn(k.scene('bg_den'), 5.4, { from: 'right' });
    k.pushIn(s2, 5.4, 6.0, 1.03);
    const pc = computer(s2, 1110, 990, 700);
    k.slideIn(pc.sprite, 5.6, { dx: 0, dy: 500, dur: 0.55 });
    const typing = k.sprite(s2, 'kid_type', { x: 640, y: 995, h: 430, z: 5 });
    k.slideIn(typing, 5.8, { dx: -500 });
    const memory = line(s2, pc.screen, 'MEMORY SIZE?', 0);
    type(memory, 6.3, 0.45, 7.0);
    const enter = k.tag(s2, k.t('enter'), { x: 1360, y: 820, rot: 4, tape: null, size: 40, bg: '#f2e6a0', font: FONT.mono });
    k.pop(enter, 6.8);
    k.fadeOut(enter, 7.6, 0.2);
    const ready = line(s2, pc.screen, 'READY', 1);
    type(ready, 7.1, 0.01, 7.7);
    const hello = line(s2, pc.screen, '>10 PRINT "HELLO"', 2);
    type(hello, 7.8, 0.9, 8.9);
    k.boil(typing, 7.8, 1.5, { amp: 3, rot: 1.5, fps: 10 });
    const run = line(s2, pc.screen, '>RUN', 3);
    type(run, 9.0, 0.25, 9.45);
    const out = line(s2, pc.screen, 'HELLO', 4);
    type(out, 9.5, 0.01);
    const answers = k.tag(s2, k.t('answers'), { x: 1000, y: 110, rot: -2, tape: C.mustard, size: 50 });
    k.pop(answers, 9.7);
    k.sway(typing, 9.4, 2.0, { deg: 1.6 });

    // ---- 3. programs on tape: CLOAD, then Moon lander ----
    const s3 = k.sheetIn(k.scene('bg_den'), 11.4, { from: 'bottom' });
    k.pushIn(s3, 11.4, 5.4, 1.03);
    const pc3 = computer(s3, 1130, 990, 700);
    k.slideIn(pc3.sprite, 11.6, { dx: 600 });
    const deck = k.sprite(s3, 'cassette', { x: 640, y: 980, h: 310, z: 4 });
    k.slideIn(deck, 11.7, { dx: -600 });
    const tapeTag = k.tag(s3, k.t('tape'), { x: 1000, y: 110, rot: 2, tape: C.teal, size: 50 });
    k.pop(tapeTag, 12.0);
    const cload = line(s3, pc3.screen, '>CLOAD', 0);
    type(cload, 12.1, 0.4, 13.8);
    // The tape sings: a wave runs from the recorder to the computer, its bits riding on it.
    const wave = k.stroke(s3, 'M660 640 Q 700 560 740 640 T 820 640 T 900 640 T 980 640', { color: C.mustard, width: 7 });
    k.draw(wave, 12.6, 0.7, { ease: 'linear' });
    k.boil(deck, 12.6, 1.5, { amp: 2, rot: 1, fps: 10 });
    const bits = k.tag(s3, '0 1 1 0 1 0 0 1', { x: 760, y: 500, rot: -3, tape: null, size: 34, font: FONT.mono });
    k.pop(bits, 12.9);
    k.fadeOut(bits, 14.0, 0.2);
    k.undraw(wave, 14.0, 0.2);
    tl.set(cload, { opacity: 0 }, 13.9);
    // Moon lander: a lander of white blocks settles onto the pad.
    const sc = pc3.screen;
    const block = sc.w / 22;
    const glow = 'rgb(160 255 210 / 0.75)';
    const lander = k.el(s3.cam.el, 'div', '', { position: 'absolute', left: `${sc.x + sc.w / 2 - block * 1.5}px`, top: `${sc.y + block}px`, width: `${block * 3}px`, height: `${block * 2.5}px`, zIndex: '4' });
    for (const [x, y, w, h] of [[0.75, 0, 1.5, 1], [0, 1, 3, 0.8], [0, 1.8, 0.6, 0.7], [2.4, 1.8, 0.6, 0.7]]) {
      k.el(lander, 'div', '', { position: 'absolute', left: `${x * block}px`, top: `${y * block}px`, width: `${w * block}px`, height: `${h * block}px`, background: PHOSPHOR, boxShadow: `0 0 8px ${glow}` });
    }
    const landerActor = k.actor(new El(lander, { opacity: 0 }));
    const ground = k.el(s3.cam.el, 'div', '', { position: 'absolute', left: `${sc.x + block}px`, top: `${sc.y + sc.h - block * 1.4}px`, width: `${sc.w - block * 2}px`, height: `${block * 0.6}px`, background: PHOSPHOR, boxShadow: `0 0 8px ${glow}`, zIndex: '4' });
    const groundActor = k.actor(new El(ground, { opacity: 0 }));
    k.show(landerActor, 14.0);
    k.show(groundActor, 14.0);
    const fall = sc.h - block * 4.9;
    tl.proc(landerActor, 14.0, 1.6, (t) => ({ y: Math.round(Math.min(1, (t / 1.6) ** 1.6) * fall / block) * block }));
    tl.set(landerActor, { y: Math.round(fall / block) * block }, 15.6);
    const landed = line(s3, pc3.screen, 'LANDED!', 0);
    type(landed, 15.7, 0.3);
    k.confetti(s3, 15.7, { x: 1130, y: 420, n: 16, spread: 260 });
    k.hop(deck, 15.8, { h: 40 });

    // ---- 4. look inside while it runs ----
    const s4 = k.sheetIn(k.scene('bg_den'), 16.8, { from: 'right' });
    k.pushIn(s4, 16.8, 4.0, 1.03);
    const board = k.sprite(s4, 'board', { x: 1000, y: 560, w: 860, anchor: 'center' });
    k.pop(board, 17.0, { tilt: 4 });
    const inside = k.tag(s4, k.t('inside'), { x: 1000, y: 110, rot: -2, tape: C.red, size: 50 });
    k.pop(inside, 17.2);
    // Chips light up as they work, here and there across the board.
    const r = k.rng(80);
    for (let i = 0; i < 9; i++) {
      const spark = k.doodle(s4, 'sparkle', { x: 640 + r() * 720, y: 380 + r() * 360, size: 26, color: i % 2 ? C.mustard : '#7dffb8' });
      const at = 17.5 + i * 0.22;
      k.pop(spark, at, { dur: 0.25 });
      k.fadeOut(spark, at + 0.5, 0.15);
    }
    // The Z80, the board's big chip.
    const ring = k.ring(s4, { x: 940, y: 500, rx: 140, ry: 80 });
    k.draw(ring, 18.3, 0.35);
    const z80 = k.tag(s4, k.t('z80'), { x: 1020, y: 370, rot: 3, tape: null, size: 46, bg: C.mustard, font: FONT.mono });
    k.pop(z80, 18.5);
    const ram = k.tag(s4, k.t('ram'), { x: 780, y: 870, rot: -4, tape: C.teal, size: 40 });
    k.pop(ram, 19.0);
    const rom = k.tag(s4, k.t('rom'), { x: 1210, y: 880, rot: 3, tape: C.ultra, size: 40 });
    k.pop(rom, 19.3);
    k.boil(board, 18.0, 2.6, { amp: 1.2, rot: 0.3, fps: 8 });

    // ---- 5. today: switch it on ----
    const s5 = k.sheetIn(k.scene('bg_now'), 20.8, { from: 'bottom' });
    k.pushIn(s5, 20.8, 4.7, 1.03);
    const pc5 = computer(s5, 740, 990, 460);
    k.slideIn(pc5.sprite, 21.0, { dx: -600 });
    const ready5 = line(s5, pc5.screen, 'READY', 0);
    type(ready5, 21.4, 0.01);
    const laptop = k.sprite(s5, 'laptop', { x: 1230, y: 930, w: 480, z: 4 });
    k.dropIn(laptop, 21.2, { from: -700 });
    k.bob(laptop, 21.9, 3.6, { px: 4, period: 2 });
    const on = k.textArt(s5, 'on', { x: 1000, y: 200, w: 820, h: 240, z: 10 });
    k.pop(on, 21.8, { dur: 0.5 });
    k.sway(on, 22.3, 3.2, { deg: 1.3, period: 2.4 });
    const web = k.tag(s5, k.t('web'), { x: 1230, y: 470, rot: 3, tape: C.teal, size: 40 });
    k.pop(web, 22.5);
    k.confetti(s5, 22.0, { x: 1000, y: 400, n: 20, spread: 320 });
  },
};
