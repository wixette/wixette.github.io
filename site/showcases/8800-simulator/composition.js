// @ts-check
// Altair 8800 Simulator, 25.5 seconds: the 1975 hacker story, ending with an invitation.
//
// 0.0   Build it yourself! A hobby-electronics magazine lands with the Altair on its cover:
//       January 1975, a $439 kit.
// 4.6   The Homebrew Computer Club: a garage at night, two hobbyist hackers round the Altair.
//       A light runs across its lamps, then a transistor radio beside it starts to play: one
//       of the club's members made the Altair play music through a radio's interference.
// 10.2  A dorm room. Two young programmers write BASIC for a machine they have never seen,
//       on an emulator: the weeks count 1 to 8 while the coffee mugs double, 1, 2, 4, 8.
//       All of it in 4 KB.
// 16.0  The paper tape reaches Albuquerque. First run: the Teletype prints MEMORY SIZE?
//       It worked!
// 20.6  Today: a young hacker and a laptop running the simulator. Your turn.

import { C, El, FONT } from '../../js/anim/kit.js';
import assets from './assets.js';

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 25.5,
  poster: 8.6,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      build: 'Build it\nyourself!',
      worked: 'It worked!',
      turn: 'Your turn.',
      date: 'January 1975',
      price: '$439 kit',
      club: 'Homebrew Computer Club',
      radio: '…and it played music on a radio!',
      week: 'WEEK {n}',
      noAltair: 'no Altair, just an emulator',
      kb: 'all in 4 KB',
      tape: 'paper tape → Albuquerque',
      web: 'in your browser',
    },
    zh: {
      build: '自己动手造电脑！',
      worked: '一次就跑通了！',
      turn: '轮到你了！',
      date: '1975 年 1 月',
      price: '套件 439 美元',
      club: '家酿计算机俱乐部',
      radio: '……它还让收音机唱起了歌！',
      week: '第 {n} 周',
      noAltair: '手里没有 Altair，只有模拟器',
      kb: '一共只有 4 KB',
      tape: '纸带 → 阿尔伯克基',
      web: '浏览器里就能玩',
    },
  },

  build(k) {
    const tl = k.tl;

    // ---- 1. build it yourself ----
    const s1 = k.scene('bg_retro');
    k.pushIn(s1, 0, 4.6, 1.04);
    const build = k.textArt(s1, 'build', { x: 1000, y: 190, w: 860, h: 290 });
    k.pop(build, 0.1, { dur: 0.5 });
    k.sway(build, 0.6, 4, { deg: 1.4, period: 2.2 });
    const magazine = k.sprite(s1, 'magazine', { x: 870, y: 965, h: 540, rot: -5, z: 4 });
    k.dropIn(magazine, 0.35, { from: -900 });
    k.sway(magazine, 1.1, 3.5, { deg: 1.2, period: 2.4 });
    const date = k.tag(s1, k.t('date'), { x: 1270, y: 560, rot: 5, tape: C.mustard, size: 52 });
    const price = k.tag(s1, k.t('price'), { x: 1270, y: 720, rot: -4, tape: C.teal, size: 60, bg: C.mustard });
    k.pop(date, 1.3);
    k.pop(price, 1.7);
    k.sway(price, 2.2, 2.4, { deg: 2.5, period: 1.2 });
    [k.doodle(s1, 'sparkle', { x: 560, y: 520, size: 34 }), k.doodle(s1, 'sparkle', { x: 1070, y: 470, size: 28 })].forEach((d, i) => k.pop(d, 1.0 + i * 0.3));

    // ---- 2. the Homebrew Computer Club ----
    const s2 = k.sheetIn(k.scene('bg_garage'), 4.6, { from: 'right' });
    k.pushIn(s2, 4.6, 5.6, 1.03);
    const altair = k.sprite(s2, 'altair', { x: 1000, y: 905, w: 560, z: 3 });
    k.slideIn(altair, 4.9, { dx: 0, dy: 420, dur: 0.6 });
    const flannel = k.sprite(s2, 'hacker_flannel', { x: 640, y: 995, h: 500, z: 5 });
    const afro = k.sprite(s2, 'hacker_afro', { x: 1360, y: 995, h: 480, z: 5 });
    k.slideIn(flannel, 5.1, { dx: -520 });
    k.slideIn(afro, 5.3, { dx: 520 });
    k.sway(flannel, 5.8, 4.4, { deg: 1.8, period: 1.5 });
    k.sway(afro, 6.0, 4.2, { deg: 1.8, period: 1.7 });
    const club = k.tag(s2, k.t('club'), { x: 1000, y: 165, rot: -2, tape: C.pink, size: 54 });
    k.pop(club, 5.5);

    // The lamp strip, D7..D0, a light running across it.
    const panel = k.el(s2.cam.el, 'div', '', {
      position: 'absolute', left: '620px', top: '228px', width: '760px', height: '150px',
      background: '#203a73', borderRadius: '22px', border: '8px solid #c8ccd3',
      boxShadow: '0 12px 10px rgb(0 0 0 / 0.35)', transformOrigin: '50% 50%',
    });
    const panelActor = k.actor(new El(panel, { opacity: 0 }));
    /** @type {El[]} */
    const lamps = [];
    for (let i = 0; i < 8; i++) {
      const x = 48 + i * 88;
      k.el(panel, 'div', '', { position: 'absolute', left: `${x - 26}px`, top: '28px', width: '52px', height: '52px', borderRadius: '50%', background: '#5a1712', boxShadow: 'inset 0 4px 6px rgb(0 0 0 / 0.4)' });
      const on = k.el(panel, 'div', '', { position: 'absolute', left: `${x - 26}px`, top: '28px', width: '52px', height: '52px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #fff2c8, #ff5a3c 45%, #d01f12)', boxShadow: '0 0 26px 8px rgb(255 80 50 / 0.75)' });
      lamps.push(k.actor(new El(on, { opacity: 0 })));
      const label = k.el(panel, 'div', '', { position: 'absolute', left: `${x - 30}px`, top: '90px', width: '60px', textAlign: 'center', font: `700 26px ${FONT.mono}`, color: '#e8ecf3' });
      label.textContent = `D${7 - i}`;
    }
    k.pop(panelActor, 5.9, { tilt: 4 });
    lamps.forEach((lamp, i) => tl.proc(lamp, 6.4, 3.8, (t) => ({ opacity: Math.floor(t * 7) % 8 === i ? 1 : 0 })));

    // ...and then it played music through a radio, standing on the Altair's lid.
    const radio = k.sprite(s2, 'radio', { x: 1170, y: 645, h: 170, z: 4 });
    k.pop(radio, 7.3);
    k.boil(radio, 7.6, 2.6, { amp: 2, rot: 1.5, fps: 8 });
    [[1215, 458], [1290, 440], [1360, 462]].forEach(([x, y], i) => {
      const note = k.doodle(s2, 'text', { x, y, size: 24, text: i % 2 ? '♫' : '♪', color: C.mustard });
      k.pop(note, 7.6 + i * 0.25);
      k.bob(note, 8.0 + i * 0.25, 2.2, { px: 14, period: 0.8 });
    });
    const radioTag = k.tag(s2, k.t('radio'), { x: 840, y: 470, rot: -3, tape: C.red, size: 42 });
    k.pop(radioTag, 7.8);
    k.hop(flannel, 8.2, { h: 45 });
    k.hop(afro, 8.4, { h: 50, n: 2 });

    // ---- 3. eight weeks, no Altair ----
    const s3 = k.sheetIn(k.scene('bg_dorm'), 10.2, { from: 'left' });
    k.pushIn(s3, 10.2, 5.8, 1.03);
    const term = k.sprite(s3, 'teletype', { x: 1000, y: 990, h: 430, z: 3 });
    k.slideIn(term, 10.5, { dx: 0, dy: 450, dur: 0.6 });
    const typing = k.sprite(s3, 'coder_typing', { x: 650, y: 995, h: 510, z: 5 });
    const tape = k.sprite(s3, 'coder_tape', { x: 1355, y: 995, h: 540, z: 5 });
    k.slideIn(typing, 10.7, { dx: -520 });
    k.slideIn(tape, 10.9, { dx: 520 });
    k.boil(typing, 11.3, 3.2, { amp: 3, rot: 1.5, fps: 10 });
    k.boil(term, 11.3, 3.2, { amp: 2, rot: 0.6, fps: 12 });
    k.sway(tape, 11.5, 4.5, { deg: 1.6 });
    const week = k.number(s3, { x: 1000, y: 70, size: 100, color: C.paper, font: FONT.display, value: 1, format: (n) => k.t('week').replace('{n}', n) });
    k.pop(week, 11.0);
    k.count(week, 11.4, 8, 2.4);
    const ticks = k.doodle(s3, 'ticks', { x: 1000, y: 70, size: 40, n: 7, color: C.mustard });
    k.pop(ticks, 13.8, { dur: 0.3 });
    // The coffee doubles while the weeks go by: 1, 2, 4, 8.
    for (let i = 0; i < 8; i++) {
      const mug = k.sprite(s3, 'mug', { x: 580 + i * 120, y: 998, h: 110, z: 8 });
      k.pop(mug, i === 0 ? 11.6 : i === 1 ? 12.2 : i < 4 ? 12.8 + (i - 2) * 0.06 : 13.4 + (i - 4) * 0.06, { dur: 0.3 });
    }
    const noAltair = k.tag(s3, k.t('noAltair'), { x: 1000, y: 260, rot: -2, tape: C.red, size: 46 });
    k.pop(noAltair, 13.9);
    const kb = k.tag(s3, k.t('kb'), { x: 1000, y: 365, rot: 3, tape: C.mustard, size: 52, bg: C.mustard });
    k.pop(kb, 14.5);
    k.sway(kb, 14.9, 1.1, { deg: 2.5, period: 0.9 });

    // ---- 4. the first run ----
    const s4 = k.sheetIn(k.scene('bg_retro'), 16.0, { from: 'bottom' });
    k.pushIn(s4, 16.0, 4.6, 1.03);
    const a2 = k.sprite(s4, 'altair', { x: 840, y: 935, w: 480, z: 3 });
    k.slideIn(a2, 16.3, { dx: 0, dy: 420, dur: 0.55 });
    const tty = k.sprite(s4, 'teletype', { x: 1260, y: 995, h: 420, z: 4 });
    k.slideIn(tty, 16.4, { dx: 500, dur: 0.55 });
    const carrier = k.sprite(s4, 'coder_tape', { x: 620, y: 995, h: 470, z: 5 });
    k.slideIn(carrier, 16.5, { dx: -500 });
    const tapeTag = k.tag(s4, k.t('tape'), { x: 840, y: 450, rot: -3, tape: C.teal, size: 44 });
    k.pop(tapeTag, 16.8);
    k.fadeOut(tapeTag, 18.2, 0.2);
    const paper = k.el(s4.cam.el, 'div', '', {
      position: 'absolute', left: '1085px', top: '340px', width: '350px', height: '150px', background: C.paper,
      boxShadow: '0 10px 9px rgb(74 48 22 / 0.28)', borderRadius: '4px',
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 46px, rgb(47 127 122 / 0.12) 46px 48px)',
    });
    const paperActor = k.actor(new El(paper, { opacity: 0 }));
    const typer = k.typer(s4, 'MEMORY SIZE?', { x: 1110, y: 385, size: 40, color: C.ink });
    k.fadeIn(paperActor, 17.0, 0.25);
    k.show(typer, 17.1);
    k.write(typer, 17.3, 0.9);
    k.boil(tty, 17.3, 0.9, { amp: 2, rot: 0.6, fps: 12 });
    const worked = k.textArt(s4, 'worked', { x: 1000, y: 165, w: 880, h: 230 });
    k.pop(worked, 18.4, { dur: 0.5 });
    k.sway(worked, 18.9, 1.7, { deg: 1.5, period: 1.4 });
    k.confetti(s4, 18.5, { x: 1000, y: 330, n: 24, spread: 340 });
    k.hop(carrier, 18.7, { h: 55, n: 2 });
    k.shake(s4, 18.4, 0.35, 8);

    // ---- 5. your turn ----
    const s5 = k.sheetIn(k.scene('bg_now'), 20.6, { from: 'right' });
    k.pushIn(s5, 20.6, 4.9, 1.03);
    const genz = k.sprite(s5, 'genz', { x: 690, y: 995, h: 520, z: 5 });
    k.pop(genz, 20.9);
    k.sway(genz, 21.4, 4, { deg: 1.6 });
    const laptop = k.sprite(s5, 'laptop', { x: 1190, y: 930, w: 520, z: 4 });
    k.dropIn(laptop, 21.1, { from: -700 });
    k.bob(laptop, 21.8, 3.7, { px: 4, period: 2 });
    const turn = k.textArt(s5, 'turn', { x: 1000, y: 200, w: 820, h: 250 });
    k.pop(turn, 21.7, { dur: 0.5 });
    k.sway(turn, 22.2, 3.3, { deg: 1.3, period: 2.4 });
    const web = k.tag(s5, k.t('web'), { x: 1190, y: 500, rot: 3, tape: C.teal, size: 46 });
    k.pop(web, 22.4);
    k.confetti(s5, 21.9, { x: 1000, y: 420, n: 20, spread: 320 });
    [k.doodle(s5, 'sparkle', { x: 900, y: 560, size: 32, color: C.mustard }), k.doodle(s5, 'sparkle', { x: 1450, y: 600, size: 28, color: C.pink })].forEach((d, i) => k.pop(d, 22.6 + i * 0.3));
    k.hop(genz, 23.2, { h: 45 });
  },
};
