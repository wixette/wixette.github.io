// @ts-check
// Start-up: language, top bar, intro, grid, tiles, About dialog and footer.

import { initAbout } from './about.js';
import { liveGrid } from './grid.js';
import { icon } from './icons.js';
import { initLang, lang, onLang, setLang, t } from './i18n.js';
import { createTiles } from './tiles.js';
import { SHOWCASES } from '../showcases/index.js';

/** @typedef {import('./i18n.js').Lang} Lang */
/** @typedef {keyof typeof import('./strings.js').STRINGS.en} Key */

/** @param {string} sel */
const $ = (sel) => /** @type {HTMLElement} */ (document.querySelector(sel));

// Static texts: data-i18n="key" sets the text, data-i18n-aria="key" the accessible name.
const applyTexts = () => {
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(/** @type {Key} */ (/** @type {HTMLElement} */ (el).dataset.i18n));
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(/** @type {Key} */ (/** @type {HTMLElement} */ (el).dataset.i18nAria)));
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  for (const b of document.querySelectorAll('.lang button')) b.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (b).dataset.lang === lang()));
};

initLang();
applyTexts();
document.documentElement.classList.remove('i18n-pending');
onLang(applyTexts);

for (const b of document.querySelectorAll('.lang button')) {
  b.addEventListener('click', () => {
    const l = /** @type {Lang} */ (/** @type {HTMLElement} */ (b).dataset.lang);
    if (l !== lang()) setLang(l);
  });
}

// The GitHub mark fills its box, Material's info glyph only 20 of its 24 px: 20 px matches them.
$('#github-link').append(icon('github', 20));

const aboutButton = /** @type {HTMLButtonElement} */ ($('#about-open'));
aboutButton.append(icon('info'));
initAbout(/** @type {HTMLDialogElement} */ ($('#about')), aboutButton);

const grid = $('#grid');
const tiles = createTiles(grid, SHOWCASES);
liveGrid(
  grid,
  SHOWCASES.map((s) => ({ id: s.id, emphasis: s.emphasis })),
  (id) => /** @type {HTMLElement} */ (tiles.find((tile) => tile.showcase.id === id)?.el),
);

// The top bar gets its hairline once the page scrolls under it.
const topbar = $('.topbar');
const onScroll = () => topbar.classList.toggle('scrolled', scrollY > 4);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
