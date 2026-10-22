// @ts-check
// A contact sheet: one frame every `step` seconds (default 1.5), each a separately built
// stage seeked to its time. ?id=<showcase>&lang=en|zh&shape=S|W&step=1.5&w=300

import { buildOn, navBar, params, shape, showcase } from './common.js';

const bar = /** @type {HTMLElement} */ (document.getElementById('bar'));
const sheet = /** @type {HTMLElement} */ (document.getElementById('sheet'));
navBar(bar);
const step = Number(params.get('step') ?? 1.5);
sheet.style.setProperty('--w', `${Number(params.get('w') ?? (shape === 'W' ? 420 : 240))}px`);

const comp = (await showcase.composition()).default;
const info = document.createElement('span');
info.textContent = `${showcase.id} · ${comp.duration}s · poster ${comp.poster}s`;
bar.prepend(info);
const times = [];
for (let t = 0; t < comp.duration; t += step) times.push(Math.round(t * 100) / 100);
times.push(comp.duration - 0.05);
await Promise.all(
  times.map(async (t) => {
    const frame = document.createElement('div');
    frame.className = 'frame';
    sheet.append(frame);
    const { kit } = await buildOn(frame, comp);
    kit.tl.seek(t);
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `${t.toFixed(2)}s${Math.abs(t - comp.poster) < step / 2 ? ' ★' : ''}`;
    frame.append(label);
  }),
);
document.body.dataset.ready = 'true';
