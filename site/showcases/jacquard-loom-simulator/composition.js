// @ts-check
// Jacquard Loom Simulator, 26.5 seconds: the loom whose punched cards became programs.
//
// 0.0   1804, Lyon. A figured-silk loom, and the draw boy beside it hauling its cords by
//       hand, hundreds of them, a different choice for every row.
// 5.6   Jacquard arrives with a chain of punched cards; his head drops onto the loom and the
//       draw boy is free. Holes, not hands!
// 11.2  How it works: one card weaves one row, and a hole lifts its thread. Eight cards weave
//       an arrow, row by row, each card's holes shown as its bits. New cards, new cloth: the
//       same loom weaves a heart. Written out, the deck is lines of 0s and 1s: a program.
// 17.0  The idea travels: the loom's card, Ada Lovelace and Babbage's Analytical Engine in
//       1843 (it "weaves algebraical patterns"), the punched cards of 1960s computers, code
//       today.
// 21.8  The loom, its head and its cards, in your browser. Programming began on a loom.

import { C, El, FONT } from '../../js/anim/kit.js';
import assets from './assets.js';

/** The cards' rows of holes, first card first; the cloth is woven from its bottom row up. */
const ARROW = [0x18, 0x18, 0x18, 0x18, 0x99, 0x5a, 0x3c, 0x18];
const HEART = [0x18, 0x3c, 0x7e, 0xff, 0xff, 0xff, 0x66, 0x00];
const HOOKS = 8;
/** @param {number} row @param {number} i hook, left to right */
const bit = (row, i) => (row >> (HOOKS - 1 - i)) & 1;

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 26.5,
  poster: 7.7,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      holes: 'Holes,\nnot hands!',
      began: 'Programming began\non a loom.',
      year: '1804',
      city: 'Lyon',
      byHand: 'hundreds of cords, every row, by hand',
      oneCard: '1 card = 1 row',
      hole: 'a hole lifts a thread',
      newCards: 'new cards, new cloth',
      program: 'that’s a program!',
      quote: '“weaves algebraical patterns”',
      y1804: '1804 · the loom',
      y1843: '1843 · Ada Lovelace',
      y1960: '1960s · computers',
      today: 'today · code',
      web: 'punch cards in your browser',
    },
    zh: {
      holes: '让孔来拉线！',
      began: '编程，\n从一台织机开始。',
      year: '1804',
      city: '里昂',
      byHand: '每织一行，几百根线全靠手拉',
      oneCard: '一张卡片 = 一行布',
      hole: '有孔，就提起一根线',
      newCards: '换一套卡片，换一种花样',
      program: '这就是程序！',
      quote: '“编织代数的图案”',
      y1804: '1804 · 提花织机',
      y1843: '1843 · 阿达·洛夫莱斯',
      y1960: '1960 年代 · 计算机',
      today: '今天 · 代码',
      web: '在浏览器里打孔、织布',
    },
  },

  build(k) {
    const tl = k.tl;

    // ---- 1. 1804: the draw boy ----
    const s1 = k.scene('bg_workshop');
    k.pushIn(s1, 0, 11.2, 1.04);
    const loom = k.sprite(s1, 'loom', { x: 1010, y: 965, h: 620 });
    k.pop(loom, 0.1, { tilt: 4 });
    const year = k.tiles(s1, k.t('year'), { x: 1000, y: 130, size: 120, seed: 4 });
    k.slap(year, 0.2, 0.08);
    const city = k.tag(s1, k.t('city'), { x: 1290, y: 150, rot: 6, tape: C.mustard, size: 50 });
    k.pop(city, 0.7);
    const boy = k.sprite(s1, ['drawboy_pull', 'drawboy_cheer'], { x: 700, y: 990, h: 500, z: 5 });
    k.slideIn(boy, 0.4, { dx: -600 });
    // The cords he hauls run up to the loom's top beam.
    const cords = [930, 980, 1030, 1080].map((x, i) => k.stroke(s1, `M${x} 360 Q${800 + i * 10} 420 ${745 + i * 6} 500`, { color: C.red, width: 4 }));
    k.draw(cords, 0.8, 0.35, { stagger: 0.06 });
    k.boil(boy, 1.0, 4.4, { amp: 4, rot: 2, fps: 10 });
    k.boil(loom, 1.0, 4.4, { amp: 1.5, rot: 0.4, fps: 6 });
    const byHand = k.tag(s1, k.t('byHand'), { x: 1000, y: 300, rot: -2, tape: C.red, size: 44 });
    k.pop(byHand, 1.6);
    [[585, 600], [800, 545]].forEach(([x, y], i) => {
      const sweat = k.doodle(s1, 'text', { x, y, size: 26, text: '!', color: C.ultra });
      k.pop(sweat, 2.0 + i * 0.4);
      k.boil(sweat, 2.4 + i * 0.4, 2.6, { amp: 4, rot: 6 });
      k.fadeOut(sweat, 5.4, 0.2);
    });
    k.fadeOut(byHand, 5.3, 0.2);
    k.fadeOut(city, 5.3, 0.2);
    year.forEach((t) => k.fadeOut(t, 5.3, 0.2));

    // ---- 2. Jacquard's cards: holes, not hands ----
    const jacquard = k.sprite(s1, 'jacquard', { x: 1360, y: 990, h: 540, z: 6 });
    k.slideIn(jacquard, 5.6, { dx: 700 });
    k.sway(jacquard, 6.2, 5, { deg: 1.6 });
    // The head's box sits on the loom's top beam; its loop of cards hangs down beside it.
    const head = k.sprite(s1, 'head', { x: 1010, y: 455, h: 340, z: 2 });
    k.dropIn(head, 6.2, { from: -500 });
    k.shake(s1, 6.65, 0.4, 10);
    k.undraw(cords, 6.6, 0.2);
    k.flipTo(boy, 'drawboy_cheer', 6.8);
    k.hop(boy, 7.0, { h: 60 });
    [k.doodle(s1, 'sparkle', { x: 840, y: 160, size: 34, color: C.mustard }), k.doodle(s1, 'sparkle', { x: 1190, y: 120, size: 28, color: C.teal })].forEach((d, i) => k.pop(d, 6.8 + i * 0.2));
    const holes = k.textArt(s1, 'holes', { x: 1000, y: 560, w: 860, h: 330, rot: -2, z: 10 });
    k.pop(holes, 7.9, { dur: 0.5 });
    k.sway(holes, 8.4, 2.6, { deg: 1.4, period: 2.2 });
    k.boil(head, 8.0, 3.0, { amp: 2, rot: 0.6, fps: 6 });
    k.confetti(s1, 8.0, { x: 1000, y: 420, n: 18, spread: 300 });
    k.hop(boy, 8.6, { h: 45, n: 2 });

    // ---- 3. one card, one row: the cards are a program ----
    const s2 = k.sheetIn(k.scene('bg_paper'), 11.2, { from: 'bottom' });
    k.pushIn(s2, 11.2, 5.8, 1.03);
    const cell = 46;
    const cloth = { left: 1070, top: 250 };
    // The warp: one thread for each hook, running up from the cloth.
    const warp = Array.from({ length: HOOKS }, (_, i) => {
      const x = cloth.left + i * cell + cell / 2;
      return k.stroke(s2, `M${x} ${cloth.top - 90} L${x} ${cloth.top + 2}`, { color: C.red, width: 4 });
    });
    k.draw(warp, 11.6, 0.3, { stagger: 0.03 });
    const frame = k.el(s2.cam.el, 'div', '', {
      position: 'absolute', left: `${cloth.left - 14}px`, top: `${cloth.top - 14}px`, width: `${HOOKS * cell + 28}px`, height: `${HOOKS * cell + 28}px`,
      border: `6px solid ${C.kraft}`, borderRadius: '10px', background: 'rgb(251 247 238 / 0.6)', boxSizing: 'border-box',
    });
    const frameActor = k.actor(new El(frame, { opacity: 0 }));
    k.fadeIn(frameActor, 11.5, 0.25);

    /**
     * A cloth of woven rows over the frame, each hidden until woven. A lifted warp end shows
     * red silk; a blank lets the cream weft show.
     * @param {number[]} rows
     */
    const makeCloth = (rows) =>
      rows.map((row, r) => {
        const line = k.el(s2.cam.el, 'div', '', {
          position: 'absolute', left: `${cloth.left}px`, top: `${cloth.top + (HOOKS - 1 - r) * cell}px`, width: `${HOOKS * cell}px`, height: `${cell}px`,
          display: 'flex', transformOrigin: '50% 100%',
        });
        for (let i = 0; i < HOOKS; i++) {
          k.el(line, 'div', '', {
            width: `${cell}px`, height: `${cell}px`, boxSizing: 'border-box', border: '2px solid rgb(43 38 34 / 0.12)',
            background: bit(row, i) ? `repeating-linear-gradient(90deg, ${C.red} 0 9px, #b8372c 9px 11px)` : `repeating-linear-gradient(0deg, ${C.cream} 0 9px, #e3d8c4 9px 11px)`,
          });
        }
        return k.actor(new El(line, { opacity: 0 }));
      });

    /**
     * A card, a buff strip with a hole for each hook it lifts, at the reader on the left.
     * @param {number} row
     */
    const makeCard = (row) => {
      const card = k.el(s2.cam.el, 'div', '', {
        position: 'absolute', left: '560px', top: '420px', width: '440px', height: '78px', background: '#e8c98f', borderRadius: '8px',
        boxShadow: '0 9px 7px rgb(74 48 22 / 0.3)', border: '3px solid #c9a265', boxSizing: 'border-box',
      });
      for (let i = 0; i < HOOKS; i++) {
        k.el(card, 'div', '', {
          position: 'absolute', left: `${30 + i * 50}px`, top: '18px', width: '36px', height: '36px', borderRadius: '50%',
          background: bit(row, i) ? C.ink : 'transparent', border: bit(row, i) ? 'none' : '3px dashed rgb(43 38 34 / 0.18)', boxSizing: 'border-box',
        });
      }
      return k.actor(new El(card, { opacity: 0 }));
    };

    const bitsLabel = (/** @type {number[]} */ rows) =>
      k.number(s2, { x: 780, y: 520, size: 52, color: C.ink, font: FONT.mono, value: 0, format: (n) => rows[Number(n)].toString(2).padStart(HOOKS, '0') });

    /**
     * Weaves a deck: each card slides into the reader, its row appears in the cloth, and the
     * card moves on up the chain.
     * @param {number[]} rows @param {El[]} woven @param {El} bits @param {number} at @param {number} step
     */
    const weave = (rows, woven, bits, at, step) => {
      k.show(bits, at);
      rows.forEach((row, r) => {
        const t = at + r * step;
        const card = makeCard(row);
        tl.set(card, { opacity: 1 }, t);
        tl.fromTo(card, { x: -120 }, { x: 0 }, t, { dur: step * 0.4, ease: 'power2.out' });
        tl.to(card, { y: -90, opacity: 0 }, t + step * 0.7, { dur: step * 0.3, ease: 'power1.in' });
        tl.set(bits, { value: r }, t);
        tl.set(woven[r], { opacity: 1 }, t + step * 0.35);
        tl.fromTo(woven[r], { sy: 0.15 }, { sy: 1 }, t + step * 0.35, { dur: step * 0.45, ease: 'back.out(2)' });
      });
      return at + rows.length * step;
    };

    const oneCard = k.tag(s2, k.t('oneCard'), { x: 1000, y: 110, rot: -2, tape: C.teal, size: 56 });
    k.pop(oneCard, 11.7);
    const arrow = makeCloth(ARROW);
    const arrowBits = bitsLabel(ARROW);
    const done = weave(ARROW, arrow, arrowBits, 11.9, 0.36);
    const hole = k.tag(s2, k.t('hole'), { x: 780, y: 700, rot: 3, tape: C.mustard, size: 44 });
    k.pop(hole, 12.8);
    k.fadeOut(hole, 14.7, 0.2);
    const check = k.check(s2, { x: 1400, y: 700, size: 60 });
    k.draw(check, done + 0.05, 0.25);
    k.undraw(check, 14.75, 0.15);

    // New cards, new cloth.
    k.fadeOut(oneCard, 14.7, 0.15);
    const newCards = k.tag(s2, k.t('newCards'), { x: 1000, y: 110, rot: 2, tape: C.pink, size: 56 });
    k.pop(newCards, 14.8);
    arrow.forEach((row) => k.fadeOut(row, 14.8, 0.2));
    k.hide(arrowBits, 14.8);
    const heart = makeCloth(HEART);
    const heartBits = bitsLabel(HEART);
    const woven = weave(HEART, heart, heartBits, 14.95, 0.12);
    // The whole deck, written out as bits, top row first like the cloth: a program.
    k.hide(heartBits, woven);
    const listing = k.typer(s2, [...HEART].reverse().map((row) => row.toString(2).padStart(HOOKS, '0')).join('\n'), { x: 695, y: 250, size: 34, cursor: false });
    k.show(listing, woven);
    k.write(listing, woven, 0.35);
    const ring = k.ring(s2, { x: 780, y: 430, rx: 165, ry: 215 });
    k.draw(ring, woven + 0.35, 0.3);
    const program = k.tag(s2, k.t('program'), { x: 780, y: 740, rot: -4, tape: C.red, size: 66, bg: C.mustard });
    k.pop(program, woven + 0.4);
    k.shake(s2, woven + 0.4, 0.3, 6);

    // ---- 4. the idea travels: Babbage, Lovelace, computers, code ----
    const s3 = k.sheetIn(k.scene('bg_paper'), 17.0, { from: 'right' });
    k.pushIn(s3, 17.0, 4.8, 1.03);
    const trail = k.stroke(s3, 'M650 330 C 720 240 880 220 1000 250 S 1280 270 1360 370', { color: C.pencil, width: 5, dash: '14 14' });
    k.draw(trail, 17.4, 2.4, { ease: 'linear' });
    const card = k.sprite(s3, 'card', { x: 660, y: 470, h: 290, anchor: 'center', rot: -74 });
    k.pop(card, 17.3);
    const t1804 = k.tag(s3, k.t('y1804'), { x: 670, y: 640, rot: -3, tape: C.teal, size: 38 });
    k.pop(t1804, 17.5);
    const engine = k.sprite(s3, 'engine', { x: 960, y: 720, h: 300, z: 2 });
    k.pop(engine, 18.0, { tilt: 4 });
    const ada = k.sprite(s3, 'ada', { x: 850, y: 730, h: 400, z: 4 });
    k.pop(ada, 18.1);
    k.sway(ada, 18.6, 3.2, { deg: 1.6 });
    const t1843 = k.tag(s3, k.t('y1843'), { x: 900, y: 800, rot: 2, tape: C.mustard, size: 38 });
    k.pop(t1843, 18.4);
    const quote = k.tag(s3, k.t('quote'), { x: 1000, y: 130, rot: -2, tape: C.red, size: 50 });
    k.pop(quote, 18.7);
    const ibm = k.sprite(s3, 'ibmcard', { x: 1150, y: 470, w: 220, anchor: 'center', rot: 6 });
    k.pop(ibm, 19.4);
    const t1960 = k.tag(s3, k.t('y1960'), { x: 1150, y: 690, rot: 3, tape: C.ultra, size: 38 });
    k.pop(t1960, 19.6);
    const laptop = k.sprite(s3, 'laptop', { x: 1360, y: 560, w: 200 });
    k.dropIn(laptop, 20.0, { from: -500 });
    const today = k.tag(s3, k.t('today'), { x: 1350, y: 610, rot: -2, tape: C.pink, size: 38 });
    k.pop(today, 20.4);
    [card, ibm].forEach((c, i) => k.bob(c, 17.9 + i * 1.6, 3.4 - i * 1.6, { px: 6, period: 1.4 }));
    k.boil(engine, 18.8, 2.6, { amp: 1.5, rot: 0.5, fps: 8 });

    // ---- 5. programming began on a loom ----
    const s4 = k.sheetIn(k.scene('bg_workshop'), 21.8, { from: 'bottom' });
    k.pushIn(s4, 21.8, 4.7, 1.03);
    const loom2 = k.sprite(s4, 'loom', { x: 830, y: 985, h: 470 });
    k.slideIn(loom2, 22.0, { dx: 0, dy: 500, dur: 0.55 });
    const head2 = k.sprite(s4, 'head', { x: 830, y: 603, h: 260, z: 2 });
    k.dropIn(head2, 22.3, { from: -500 });
    const boy2 = k.sprite(s4, 'drawboy_cheer', { x: 600, y: 995, h: 360, z: 5 });
    k.pop(boy2, 22.4);
    const jq2 = k.sprite(s4, 'jacquard', { x: 1340, y: 995, h: 440, z: 5 });
    k.slideIn(jq2, 22.5, { dx: 600 });
    const began = k.textArt(s4, 'began', { x: 1000, y: 160, w: 900, h: 270, z: 10 });
    k.pop(began, 23.0, { dur: 0.5 });
    k.sway(began, 23.5, 3.0, { deg: 1.2, period: 2.4 });
    const web = k.tag(s4, k.t('web'), { x: 1220, y: 430, rot: 3, tape: C.teal, size: 40 });
    k.pop(web, 23.7);
    k.confetti(s4, 23.1, { x: 1000, y: 360, n: 22, spread: 320 });
    k.hop(boy2, 23.4, { h: 50, n: 2 });
    k.sway(jq2, 23.2, 3.3, { deg: 1.6 });
    k.boil(head2, 23.2, 2.4, { amp: 1.5, rot: 0.5, fps: 6 });
  },
};
