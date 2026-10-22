// @ts-check
// 话说 Huashuo, 21 seconds.
//
// 0.0   A Chinese novel drops open. "Who's speaking?" Three characters climb out of its pages:
//       an old storyteller, a young woman, a cheeky boy.
// 4.8   Each one speaks in turn, in a voice of their own: a coloured sound wave and a tag for
//       each (old and warm, young and bright, cheeky). 16 voices to choose from.
// 10.4  At night, on a Mac: they hop into the laptop. Synthesised on your own machine; free.
// 15.4  Out comes the audiobook, with chapters, for your headphones: multi-voice audiobooks.

import { C } from '../../js/anim/kit.js';
import assets from './assets.js';

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 21,
  poster: 7.4,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      who: "Who's\nspeaking?",
      audiobooks: 'Multi-voice\naudiobooks',
      old: 'old · warm',
      young: 'young · bright',
      cheeky: 'cheeky',
      voices: '16 voices',
      mac: 'on your Mac',
      free: 'free, if you like',
      m4b: 'M4B · chapters',
    },
    zh: {
      who: '谁在说话？',
      audiobooks: '多角色有声书',
      old: '沧桑 · 温和',
      young: '年轻 · 清亮',
      cheeky: '调皮',
      voices: '16 种音色',
      mac: '在 Mac 上本地合成',
      free: '可以零成本',
      m4b: 'M4B · 带章节',
    },
  },

  build(k) {
    // ---- 1. who's speaking? ----
    const s1 = k.scene('bg_paper');
    k.pushIn(s1, 0, 10.4, 1.04);
    const book = k.sprite(s1, 'book', { x: 1000, y: 985, w: 620, z: 10 });
    k.dropIn(book, 0.05, { from: -800 });
    const who = k.textArt(s1, 'who', { x: 1000, y: 150, w: 820, h: 220 });
    k.pop(who, 0.6, { dur: 0.5 });
    k.sway(who, 1.4, 3, { deg: 1.4, period: 2 });
    k.fadeOut(who, 4.6, 0.25);

    // The characters climb out from behind the book.
    const grandpa = k.sprite(s1, 'grandpa', { x: 730, y: 680, h: 390, z: 5 });
    const girl = k.sprite(s1, 'girl', { x: 1000, y: 660, h: 390, z: 4 });
    const boy = k.sprite(s1, 'boy', { x: 1265, y: 690, h: 330, z: 5 });
    const people = [grandpa, girl, boy];
    people.forEach((p, i) => {
      k.slideIn(p, 1.4 + i * 0.4, { dx: 0, dy: 380, dur: 0.5, ease: 'back.out(2)' });
      k.sway(p, 2.2 + i * 0.45, 8, { deg: 2, period: 1.5 + i * 0.2 });
    });
    k.confetti(s1, 1.5, { x: 1000, y: 600, n: 14, spread: 260 });

    // ---- 2. a voice for each ----
    /**
     * A voice: a wavy stroke from the speaker's mouth, and a tag.
     * @param {number} x @param {number} y @param {number} dir 1 right, -1 left
     * @param {string} color @param {string} label @param {number} at @param {number} tx @param {number} ty where the tag goes
     */
    const voice = (x, y, dir, color, label, at, tx, ty) => {
      let d = `M${x} ${y}`;
      for (let i = 1; i <= 4; i++) d += ` Q${x + dir * (i * 34 - 17)} ${y + (i % 2 ? -38 : 38)} ${x + dir * i * 34} ${y}`;
      const wave = k.stroke(s1, d, { color, width: 9 });
      k.draw(wave, at, 0.45, { ease: 'power2.out' });
      const tag = k.tag(s1, label, { x: tx, y: ty, rot: dir * 4, tape: color, size: 44 });
      k.pop(tag, at + 0.2);
    };
    voice(650, 360, -1, C.teal, k.t('old'), 4.9, 665, 230);
    k.hop(grandpa, 4.9, { h: 40 });
    voice(1050, 300, 1, C.mustard, k.t('young'), 6.2, 1000, 200);
    k.hop(girl, 6.2, { h: 40 });
    voice(1330, 420, 1, C.red, k.t('cheeky'), 7.5, 1350, 300);
    k.hop(boy, 7.5, { h: 55, n: 2 });
    const voices = k.tag(s1, k.t('voices'), { x: 1000, y: 860, rot: -3, tape: C.pink, size: 60 });
    voices.el.style.zIndex = '20';
    k.pop(voices, 8.7);
    k.sway(voices, 9.1, 1.3, { deg: 2 });

    // ---- 3. on your Mac ----
    const s2 = k.sheetIn(k.scene('bg_night'), 10.4, { from: 'right' });
    k.pushIn(s2, 10.4, 5, 1.03);
    const laptop = k.sprite(s2, 'laptop', { x: 1000, y: 920, w: 720, z: 4 });
    k.slideIn(laptop, 10.7, { dx: 0, dy: 520, dur: 0.6 });
    // The three, small, hop in through the screen one after another.
    ['grandpa', 'girl', 'boy'].forEach((name, i) => {
      const p = k.sprite(s2, name, { x: 620 + i * 380, y: 560, h: 260, z: 6 });
      k.pop(p, 11.3 + i * 0.15);
      k.hop(p, 12.0 + i * 0.3, { h: 60 });
      k.moveTo(p, 12.4 + i * 0.3, { x: 1000 - (620 + i * 380), y: 120, dur: 0.45, ease: 'power2.in' });
      k.zoom(p, 12.4 + i * 0.3, { scale: 0.1, dur: 0.45, ease: 'power2.in' });
      k.hide(p, 12.85 + i * 0.3);
    });
    k.boil(laptop, 13.3, 1.2, { amp: 2, rot: 0.6, fps: 10 });
    const mac = k.tag(s2, k.t('mac'), { x: 1000, y: 180, rot: -2, tape: C.teal, size: 56 });
    k.pop(mac, 13.4);
    const free = k.tag(s2, k.t('free'), { x: 1180, y: 300, rot: 4, tape: C.mustard, size: 46 });
    k.pop(free, 14.0);
    const check = k.check(s2, { x: 780, y: 290, size: 60, color: C.mustard });
    k.draw(check, 14.3, 0.3);

    // ---- 4. the audiobook ----
    const s3 = k.sheetIn(k.scene('bg_paper'), 15.4, { from: 'left' });
    k.pushIn(s3, 15.4, 5.6, 1.03);
    const audiobook = k.sprite(s3, 'audiobook', { x: 880, y: 940, h: 480, z: 4 });
    k.pop(audiobook, 15.8, { dur: 0.5 });
    k.sway(audiobook, 16.3, 4.7, { deg: 1.6 });
    const phones = k.sprite(s3, 'headphones', { x: 1230, y: 900, h: 330, z: 5 });
    k.dropIn(phones, 16.3, { from: -700 });
    k.bob(phones, 17.0, 4, { px: 6, period: 1.3 });
    const title = k.textArt(s3, 'audiobooks', { x: 1000, y: 210, w: 900, h: 300 });
    k.pop(title, 16.8, { dur: 0.5 });
    k.sway(title, 17.3, 3.7, { deg: 1.2, period: 2.4 });
    const m4b = k.tag(s3, k.t('m4b'), { x: 1220, y: 490, rot: 5, tape: C.red, size: 44 });
    k.pop(m4b, 17.6);
    k.confetti(s3, 17.0, { x: 1000, y: 520, n: 22, spread: 320 });
  },
};
