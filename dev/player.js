// @ts-check
// One composition, large, with play/pause and a scrubber. ?id=<showcase>&lang=en|zh&shape=S|W&t=0
// window.seekTo(t) seeks from the console (or a test driver).

import { Player } from '../site/js/anim/player.js';
import { buildOn, navBar, params, showcase } from './common.js';

const $ = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.getElementById(id));
navBar($('bar'));
const comp = (await showcase.composition()).default;
const { kit } = await buildOn($('stage'), comp);
const scrub = /** @type {HTMLInputElement} */ ($('scrub'));
const player = new Player(kit.tl, comp.duration, (t, p) => {
  $('time').textContent = `${t.toFixed(2)} / ${comp.duration}s`;
  scrub.value = String(Math.round(p * 1000));
});
player.seek(Number(params.get('t') ?? comp.poster));
$('play').addEventListener('click', () => {
  if (player.playing) player.pause();
  else player.play();
  $('play').textContent = player.playing ? 'pause' : 'play';
});
scrub.addEventListener('input', () => player.seek((Number(scrub.value) / 1000) * comp.duration));
/** @type {any} */ (window).seekTo = (/** @type {number} */ t) => player.seek(t);
document.body.dataset.ready = 'true';
