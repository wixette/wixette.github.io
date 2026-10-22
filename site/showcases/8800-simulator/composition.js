// @ts-check
// Altair 8800 Simulator, 22 seconds.
//
// 0.0   1975. The Altair slides up onto the desk and the year slaps on above it. Two tags,
//       "no screen" and "no keyboard", get crossed out: this computer had neither.
// 5.0   A kid flips the switches. A strip of lamps pops up and a light walks across it: a
//       program, put in by hand, running.
// 10.5  A Teletype. Microsoft 4K BASIC boots, asks its questions, and answers PRINT 2+2
//       with 4. The kid cheers.
// 16.5  The same machine on a laptop: now in your browser.

import { C, El, FONT } from '../../js/anim/kit.js';
import assets from './assets.js';

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 22,
  poster: 8.4,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      year: '1975',
      browser: 'Now in your\nbrowser!',
      noScreen: 'no screen',
      noKeys: 'no keyboard',
      byHand: 'a program, by hand',
      basic: 'Microsoft 4K BASIC',
      real: 'a real 8080, 2 MHz',
    },
    zh: {
      year: '1975年',
      browser: '浏览器里就能玩！',
      noScreen: '没有屏幕',
      noKeys: '没有键盘',
      byHand: '用开关输入程序',
      basic: '微软 4K BASIC',
      real: '真实的 8080 · 2 MHz',
    },
  },

  build(k) {
    const tl = k.tl;

    // ---- 1. 1975: no screen, no keyboard ----
    const s1 = k.scene('bg_room');
    k.pushIn(s1, 0, 10.5, 1.04);
    const year = k.textArt(s1, 'year', { x: 1000, y: 230, w: 720, h: 290 });
    k.pop(year, 0.1, { dur: 0.5 });
    k.sway(year, 0.8, 4.2, { deg: 1.5, period: 2.2 });
    const altair = k.sprite(s1, 'altair', { x: 1000, y: 930, w: 860 });
    k.slideIn(altair, 0.45, { dx: 0, dy: 520, dur: 0.7, ease: 'back.out(1.6)' });
    k.bob(altair, 1.5, 9, { px: 3, period: 2.4 });

    const noScreen = k.tag(s1, k.t('noScreen'), { x: 700, y: 470, rot: -6, tape: C.mustard, size: 50 });
    const noKeys = k.tag(s1, k.t('noKeys'), { x: 1300, y: 470, rot: 5, tape: C.teal, size: 50 });
    k.pop(noScreen, 1.7);
    k.pop(noKeys, 2.1);
    const cross = (/** @type {number} */ x, /** @type {number} */ y) => [
      k.stroke(s1, `M${x - 130} ${y - 30} L${x + 130} ${y + 34}`, { color: C.red, width: 9 }),
      k.stroke(s1, `M${x - 125} ${y + 36} L${x + 128} ${y - 28}`, { color: C.red, width: 9 }),
    ];
    const crossScreen = cross(700, 470);
    const crossKeys = cross(1300, 470);
    k.draw(crossScreen, 2.9, 0.22, { stagger: 0.18 });
    k.draw(crossKeys, 3.4, 0.22, { stagger: 0.18 });
    for (const e of [noScreen, noKeys]) k.sway(e, 2.5, 2.6, { deg: 2, period: 1.3 });

    // The year and the tags clear the way for the lamps.
    k.fadeOut(year, 4.7, 0.25);
    k.fadeOut(noScreen, 4.8, 0.2);
    k.fadeOut(noKeys, 4.85, 0.2);
    k.undraw([...crossScreen, ...crossKeys], 4.8, 0.2);

    // ---- 2. a program, by hand ----
    const kid = k.sprite(s1, ['kid_flip'], { x: 660, y: 990, h: 470, z: 5 });
    k.slideIn(kid, 5.0, { dx: -520, dur: 0.55 });
    k.boil(kid, 5.6, 0.8, { amp: 3, rot: 1.2 });
    k.sway(kid, 6.5, 4, { deg: 2, period: 1.4 });

    // The lamp strip: D7..D0, a light walking across them (the "pattern shift" example).
    const panel = k.el(s1.cam.el, 'div', '', {
      position: 'absolute', left: '620px', top: '255px', width: '760px', height: '150px',
      background: '#203a73', borderRadius: '22px', border: '8px solid #c8ccd3',
      boxShadow: '0 12px 10px rgb(74 48 22 / 0.3)', transformOrigin: '50% 50%',
    });
    const panelActor = k.actor(new El(panel, { opacity: 0 }));
    /** @type {El[]} */
    const lamps = [];
    for (let i = 0; i < 8; i++) {
      const x = 48 + i * 88;
      const off = k.el(panel, 'div', '', { position: 'absolute', left: `${x - 26}px`, top: '28px', width: '52px', height: '52px', borderRadius: '50%', background: '#5a1712', boxShadow: 'inset 0 4px 6px rgb(0 0 0 / 0.4)' });
      off.setAttribute('aria-hidden', 'true');
      const on = k.el(panel, 'div', '', { position: 'absolute', left: `${x - 26}px`, top: '28px', width: '52px', height: '52px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #fff2c8, #ff5a3c 45%, #d01f12)', boxShadow: '0 0 26px 8px rgb(255 80 50 / 0.75)' });
      lamps.push(k.actor(new El(on, { opacity: 0 })));
      const label = k.el(panel, 'div', '', { position: 'absolute', left: `${x - 30}px`, top: '90px', width: '60px', textAlign: 'center', font: `700 26px ${FONT.mono}`, color: '#e8ecf3' });
      label.textContent = `D${7 - i}`;
    }
    k.pop(panelActor, 5.6, { tilt: 4 });
    const step = 1 / 7;
    lamps.forEach((lamp, i) => {
      tl.proc(lamp, 6.3, 4.2, (t) => ({ opacity: Math.floor(t / step) % 8 === i ? 1 : 0 }));
    });
    const byHand = k.tag(s1, k.t('byHand'), { x: 1000, y: 175, rot: -2, tape: C.pink, size: 48 });
    k.pop(byHand, 6.6);
    k.sway(byHand, 7, 3.4, { deg: 1.5 });
    const sparks = [k.doodle(s1, 'sparkle', { x: 590, y: 250, size: 34 }), k.doodle(s1, 'sparkle', { x: 1415, y: 400, size: 30 })];
    sparks.forEach((d, i) => k.pop(d, 6.4 + i * 0.25));
    k.hop(kid, 7.6, { h: 50 });

    // ---- 3. Microsoft 4K BASIC on the Teletype ----
    const s2 = k.sheetIn(k.scene('bg_paper'), 10.5, { from: 'right' });
    k.pushIn(s2, 10.5, 6, 1.03);
    const paper = k.el(s2.cam.el, 'div', '', {
      position: 'absolute', left: '745px', top: '60px', width: '510px', height: '470px', background: C.paper,
      boxShadow: '0 10px 9px rgb(74 48 22 / 0.28)', borderRadius: '4px',
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 40px, rgb(47 127 122 / 0.12) 40px 42px)',
    });
    const paperActor = k.actor(new El(paper, { opacity: 0 }));
    const lines = ['MEMORY SIZE?', 'TERMINAL WIDTH?', 'WANT SIN? Y', '', 'OK', 'PRINT 2+2', ' 4', 'OK'];
    const typer = k.typer(s2, lines.join('\n'), { x: 780, y: 82, size: 38, color: C.ink });
    const tty = k.sprite(s2, 'teletype', { x: 1000, y: 995, h: 520, z: 4 });
    k.slideIn(tty, 10.9, { dx: 0, dy: 500, dur: 0.6 });
    k.fadeIn(paperActor, 11.3, 0.3);
    k.show(typer, 11.3);
    // Typed at a Teletype's pace, sped up: the questions, a pause, then the sum.
    const upTo = (/** @type {number} */ n) => lines.slice(0, n).join('\n').length + (n > 0 ? 1 : 0);
    tl.fromTo(typer, { chars: 0 }, { chars: upTo(5) }, 11.5, { dur: 1.6, ease: 'linear' });
    tl.to(typer, { chars: upTo(6) }, 13.6, { dur: 0.8, ease: 'linear' });
    tl.to(typer, { chars: upTo(8) }, 14.9, { dur: 0.35, ease: 'linear' });
    k.boil(tty, 11.5, 3.8, { amp: 2, rot: 0.6, fps: 12 });
    const basic = k.tag(s2, k.t('basic'), { x: 700, y: 700, rot: -8, tape: C.mustard, size: 44 });
    k.pop(basic, 12.6);
    const ring = k.ring(s2, { x: 832, y: 401, rx: 72, ry: 40 });
    k.draw(ring, 15.0, 0.4);
    const cheer = k.sprite(s2, 'kid_cheer', { x: 1330, y: 995, h: 430, z: 5 });
    k.pop(cheer, 15.0);
    k.hop(cheer, 15.4, { h: 60, n: 2 });
    k.confetti(s2, 15.05, { x: 1000, y: 470, n: 22, spread: 300 });

    // ---- 4. now in your browser ----
    const s3 = k.sheetIn(k.scene('bg_room'), 16.5, { from: 'left' });
    k.pushIn(s3, 16.5, 5.5, 1.03);
    const laptop = k.sprite(s3, 'laptop', { x: 1000, y: 930, w: 640 });
    k.dropIn(laptop, 16.9, { from: -700 });
    k.bob(laptop, 17.6, 4.4, { px: 4, period: 2 });
    const browser = k.textArt(s3, 'browser', { x: 1000, y: 230, w: 900, h: 300 });
    k.pop(browser, 17.6, { dur: 0.5 });
    k.sway(browser, 18.1, 3.9, { deg: 1.3, period: 2.4 });
    const real = k.tag(s3, k.t('real'), { x: 1000, y: 440, rot: 2, tape: C.red, size: 42 });
    k.pop(real, 18.6);
    k.confetti(s3, 17.8, { x: 1000, y: 560, n: 20, spread: 320 });
    [k.doodle(s3, 'sparkle', { x: 600, y: 600, size: 38 }), k.doodle(s3, 'sparkle', { x: 1400, y: 560, size: 32 })].forEach((d, i) => k.pop(d, 18.2 + i * 0.3));
  },
};
