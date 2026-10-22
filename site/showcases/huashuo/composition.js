// @ts-check
// 话说 Huashuo, 21 seconds: a mystery novel becomes a multi-voice audiobook.
//
// 0.0   A mystery paperback lands on a rainy street. Lines float out of it with no one to
//       say them: "I was home all night!", "I heard a scream…", "Coffee first." Who said that?
// 4.6   The detective's board: the cast gets pinned up and joined with red string, and each
//       line finds its speaker (an LLM works out who says what). Then each character gets a
//       voice of their own: calm and sharp, nervous and fast, old and warm, deep and gruff.
// 10.6  At night, the whole cast hops into a laptop: the voices are made on your own Mac,
//       free with a local LLM, and every line is checked by ear.
// 15.6  Case closed: an audiobook with chapters, for your headphones.

import { C, El, FONT } from '../../js/anim/kit.js';
import assets from './assets.js';

/** The cast, left to right: sprite, tape colour, and the string keys of its line and its voice. */
const CAST = [
  { name: 'detective', tape: C.mustard, line: 'lineDetective', voice: 'voiceDetective', h: 350 },
  { name: 'suspect', tape: C.teal, line: 'lineSuspect', voice: 'voiceSuspect', h: 335 },
  { name: 'witness', tape: C.pink, line: 'lineWitness', voice: 'voiceWitness', h: 315 },
  { name: 'inspector', tape: C.red, line: 'lineInspector', voice: 'voiceInspector', h: 350 },
];

/** @type {import('../../js/anim/kit.js').Composition} */
export default {
  duration: 21,
  poster: 9.6,
  base: import.meta.url,
  assets,
  strings: {
    en: {
      who: 'Who said that?',
      audiobooks: 'Multi-voice\naudiobooks',
      lineDetective: 'Nobody leaves.',
      lineSuspect: 'I was home all night!',
      lineWitness: 'I heard a scream…',
      lineInspector: 'Coffee first.',
      voiceDetective: 'calm · sharp',
      voiceSuspect: 'nervous · fast',
      voiceWitness: 'old · warm',
      voiceInspector: 'deep · gruff',
      cast: 'The cast',
      llm: 'an LLM finds who said each line',
      voices: '16 voices to cast from',
      mac: 'made on your Mac',
      free: 'free with a local LLM',
      check: 'every line checked by ear',
      closed: 'CASE CLOSED',
      m4b: 'M4B · chapters · cover',
    },
    zh: {
      who: '这句话是谁说的？',
      audiobooks: '多角色有声书',
      lineDetective: '谁也别走。',
      lineSuspect: '我整晚都在家！',
      lineWitness: '我听见一声尖叫……',
      lineInspector: '先来杯咖啡。',
      voiceDetective: '冷静 · 犀利',
      voiceSuspect: '紧张 · 语速快',
      voiceWitness: '年迈 · 温和',
      voiceInspector: '低沉 · 粗声',
      cast: '登场人物',
      llm: '大模型找出每句话是谁说的',
      voices: '16 种音色任你挑选',
      mac: '在你的 Mac 上本地合成',
      free: '配本地大模型，零成本',
      check: '每一句都会回听校对',
      closed: '结案',
      m4b: 'M4B · 章节 · 封面',
    },
  },

  build(k) {
    // ---- 1. who said that? ----
    const s1 = k.scene('bg_rain');
    k.pushIn(s1, 0, 4.6, 1.04);
    const novel = k.sprite(s1, 'novel', { x: 1000, y: 975, h: 470, rot: -4, z: 4 });
    k.dropIn(novel, 0.1, { from: -900 });
    k.sway(novel, 0.9, 3.7, { deg: 1, period: 2.4 });
    // Three lines float up out of the book, nobody attached to them yet.
    [
      { key: 'lineSuspect', x: 750, y: 470, rot: -5 },
      { key: 'lineWitness', x: 1250, y: 430, rot: 4 },
      { key: 'lineInspector', x: 1010, y: 350, rot: -2 },
    ].forEach(({ key, x, y, rot }, i) => {
      const line = k.tag(s1, k.t(key), { x, y, rot, tape: null, size: 44 });
      k.slideIn(line, 0.8 + i * 0.4, { dx: 1000 - x, dy: 620 - y, dur: 0.5, ease: 'back.out(1.6)' });
      k.bob(line, 1.4 + i * 0.4, 3, { px: 6, period: 1.3 + i * 0.2 });
    });
    [k.doodle(s1, 'text', { x: 560, y: 380, size: 34, text: '?', color: C.mustard }), k.doodle(s1, 'text', { x: 1450, y: 340, size: 30, text: '?', color: C.mustard })].forEach((q, i) => {
      k.pop(q, 2.1 + i * 0.2);
      k.boil(q, 2.4, 2.2, { amp: 4, rot: 5 });
    });
    const who = k.textArt(s1, 'who', { x: 1000, y: 165, w: 880, h: 220 });
    k.pop(who, 2.5, { dur: 0.5 });
    k.sway(who, 3.0, 1.6, { deg: 1.4, period: 1.6 });

    // ---- 2. the cast, and a voice for each ----
    const s2 = k.sheetIn(k.scene('bg_board'), 4.6, { from: 'right' });
    k.pushIn(s2, 4.6, 6, 1.03);
    const castTag = k.tag(s2, k.t('cast'), { x: 1000, y: 110, rot: -2, tape: C.red, size: 58, font: FONT.display });
    k.pop(castTag, 4.9);
    const xs = [628, 876, 1124, 1372];
    const people = CAST.map((c, i) => {
      const p = k.sprite(s2, c.name, { x: xs[i], y: 985, h: c.h, z: 4 });
      k.pop(p, 5.0 + i * 0.18);
      k.sway(p, 5.5 + i * 0.18, 5, { deg: 1.6, period: 1.4 + i * 0.15 });
      return p;
    });
    // Pins above their heads, and the red string between them.
    const pinY = CAST.map((c) => 985 - c.h - 28);
    xs.forEach((x, i) => {
      const pin = k.el(s2.cam.el, 'div', '', {
        position: 'absolute', left: `${x - 14}px`, top: `${pinY[i] - 14}px`, width: '28px', height: '28px', borderRadius: '50%', zIndex: '6',
        background: 'radial-gradient(circle at 35% 35%, #ff9a8a, #d9483b 55%, #8a1f17)', boxShadow: '0 4px 4px rgb(0 0 0 / 0.35)',
      });
      k.pop(k.actor(new El(pin, { opacity: 0 })), 5.3 + i * 0.12, { dur: 0.25, tilt: 0 });
    });
    const string = [0, 1, 2].map((i) =>
      k.stroke(s2, `M${xs[i]} ${pinY[i]} Q${(xs[i] + xs[i + 1]) / 2} ${Math.max(pinY[i], pinY[i + 1]) + 46} ${xs[i + 1]} ${pinY[i + 1]}`, { color: C.red, width: 6 }),
    );
    k.draw(string, 5.8, 0.35, { stagger: 0.18 });

    // Each line finds its speaker; then each speaker gets a voice.
    const llm = k.tag(s2, k.t('llm'), { x: 1000, y: 220, rot: 1, tape: C.teal, size: 44 });
    k.pop(llm, 6.4);
    k.fadeOut(llm, 8.25, 0.2);
    CAST.forEach((c, i) => {
      const y = i % 2 ? 330 : 420;
      const line = k.tag(s2, k.t(c.line), { x: xs[i], y, rot: i % 2 ? 4 : -4, tape: null, size: 32 });
      k.pop(line, 6.7 + i * 0.3);
      k.hop(people[i], 6.7 + i * 0.3, { h: 30 });
      k.fadeOut(line, 8.2, 0.2);
      const voice = k.tag(s2, k.t(c.voice), { x: xs[i], y, rot: i % 2 ? -3 : 3, tape: c.tape, size: 34, bg: C.paper });
      k.pop(voice, 8.4 + i * 0.22);
    });
    const voices = k.tag(s2, k.t('voices'), { x: 1000, y: 220, rot: -2, tape: C.mustard, size: 50, bg: C.mustard });
    k.pop(voices, 9.4);
    k.sway(voices, 9.8, 0.8, { deg: 2.5, period: 0.8 });

    // ---- 3. made on your Mac ----
    const s3 = k.sheetIn(k.scene('bg_desk'), 10.6, { from: 'left' });
    k.pushIn(s3, 10.6, 5, 1.03);
    const laptop = k.sprite(s3, 'laptop', { x: 1000, y: 935, w: 640, z: 4 });
    k.slideIn(laptop, 10.9, { dx: 0, dy: 520, dur: 0.6 });
    CAST.forEach((c, i) => {
      const x = 635 + i * 243;
      const p = k.sprite(s3, c.name, { x, y: 600, h: 220, z: 6 });
      k.pop(p, 11.3 + i * 0.12);
      k.hop(p, 11.9 + i * 0.25, { h: 50 });
      k.moveTo(p, 12.3 + i * 0.25, { x: 1000 - x, y: 140, dur: 0.42, ease: 'power2.in' });
      k.zoom(p, 12.3 + i * 0.25, { scale: 0.1, dur: 0.42, ease: 'power2.in' });
      k.hide(p, 12.72 + i * 0.25);
    });
    k.boil(laptop, 13.2, 2, { amp: 2, rot: 0.6, fps: 10 });
    const mac = k.tag(s3, k.t('mac'), { x: 1000, y: 140, rot: -2, tape: C.teal, size: 52 });
    const free = k.tag(s3, k.t('free'), { x: 1000, y: 245, rot: 2, tape: C.mustard, size: 44 });
    const check = k.tag(s3, k.t('check'), { x: 1000, y: 345, rot: -1, tape: C.pink, size: 44 });
    k.pop(mac, 13.1);
    k.pop(free, 13.7);
    k.pop(check, 14.3);
    k.draw(k.check(s3, { x: 690, y: 262, size: 44, color: C.mustard }), 13.9, 0.25);
    k.draw(k.check(s3, { x: 690, y: 362, size: 44, color: C.mustard }), 14.5, 0.25);

    // ---- 4. case closed ----
    const s4 = k.sheetIn(k.scene('bg_rain'), 15.6, { from: 'bottom' });
    k.pushIn(s4, 15.6, 5.4, 1.03);
    const phone = k.sprite(s4, 'phone', { x: 900, y: 965, h: 470, z: 4 });
    k.pop(phone, 15.9, { dur: 0.5 });
    k.sway(phone, 16.4, 4.6, { deg: 1.4 });
    const phones = k.sprite(s4, 'headphones', { x: 1250, y: 930, h: 300, z: 5 });
    k.dropIn(phones, 16.3, { from: -700 });
    k.bob(phones, 17.0, 4, { px: 6, period: 1.3 });
    const title = k.textArt(s4, 'audiobooks', { x: 1000, y: 200, w: 900, h: 290 });
    k.pop(title, 16.8, { dur: 0.5 });
    k.sway(title, 17.3, 3.7, { deg: 1.2, period: 2.4 });
    const m4b = k.tag(s4, k.t('m4b'), { x: 1250, y: 520, rot: 4, tape: C.teal, size: 40 });
    k.pop(m4b, 17.5);
    const stamp = k.tag(s4, k.t('closed'), { x: 780, y: 540, rot: -12, tape: null, size: 64, bg: C.red, color: C.paper, font: FONT.display });
    stamp.el.style.zIndex = '10';
    k.tl.fromTo(stamp, { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1 }, 18.3, { dur: 0.22, ease: 'power3.in' });
    k.shake(s4, 18.52, 0.35, 10);
    k.confetti(s4, 17.0, { x: 1000, y: 480, n: 20, spread: 320 });
  },
};
