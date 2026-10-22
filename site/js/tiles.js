// @ts-check
// The showcase tiles: their elements, their two states (design D7), and who plays when
// (design 6.6): the hovered or focused tile on pointer devices, the tile most in view on
// touch screens, nobody with reduce motion.

import { Kit } from './anim/kit.js';
import { Player } from './anim/player.js';
import { Stage } from './anim/stage.js';
import { icon } from './icons.js';
import { lang, onLang, t } from './i18n.js';

/** @typedef {import('../showcases/index.js').Showcase} Showcase */
/** @typedef {import('./anim/kit.js').Composition} Composition */
/** @typedef {import('./i18n.js').Lang} Lang */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hoverDevice = matchMedia('(hover: hover) and (pointer: fine)');

export class Tile {
  /**
   * @param {Showcase} showcase
   * @param {number} index
   */
  constructor(showcase, index) {
    this.showcase = showcase;
    this.el = document.createElement('li');
    this.el.className = 'tile';
    this.el.dataset.id = showcase.id;
    this.el.style.setProperty('--accent', showcase.accent);

    this.view = div(this.el, 'tile-stage');
    this.view.setAttribute('aria-hidden', 'true');
    div(this.el, 'tile-tint');
    div(this.el, 'tile-scrim');

    const meta = div(this.el, 'tile-meta');
    span(meta, 'tile-index').textContent = String(index + 1).padStart(2, '0');
    span(meta, 'tile-tags').textContent = showcase.tags.join(' · ');

    const info = div(this.el, 'tile-info');
    this.title = /** @type {HTMLHeadingElement} */ (info.appendChild(document.createElement('h2')));
    this.title.className = 'tile-title';
    this.tagline = /** @type {HTMLParagraphElement} */ (info.appendChild(document.createElement('p')));
    this.tagline.className = 'tile-tagline';

    this.link = /** @type {HTMLAnchorElement} */ (this.el.appendChild(document.createElement('a')));
    this.link.className = 'tile-link';
    this.link.href = showcase.repo;
    this.link.target = '_blank';
    this.link.rel = 'noopener';

    const chips = div(this.el, 'tile-chips');
    /** @type {HTMLAnchorElement | null} */
    this.tryChip = null;
    if (showcase.demo) {
      this.tryChip = /** @type {HTMLAnchorElement} */ (chips.appendChild(document.createElement('a')));
      this.tryChip.className = 'chip chip-try';
      this.tryChip.target = '_blank';
      this.tryChip.rel = 'noopener';
    }
    // The GitHub sticker only shows where the tile's own link goes; clicks pass through it.
    this.ghChip = span(chips, 'chip chip-gh');
    this.ghChip.setAttribute('aria-hidden', 'true');

    this.progress = span(div(this.el, 'tile-progress'), '');

    /** @type {Composition | null} */
    this.comp = null;
    /** @type {Stage | null} */
    this.stage = null;
    /** @type {Player | null} */
    this.player = null;
    /** @type {Promise<void> | null} */
    this.building = null;
    this.builtLang = '';
    this.wanted = false;
    this.resumeAt = 0;
    this.texts();
    this.press();
  }

  /** Writes the tile's texts in the current language. */
  texts() {
    const l = lang();
    const s = this.showcase;
    this.title.textContent = s.title[l];
    this.tagline.textContent = s.tagline[l];
    this.link.innerHTML = '';
    const label = span(this.link, 'sr-only');
    label.textContent = t('tile.repoLabel', { title: s.title[l] });
    if (this.tryChip && s.demo) {
      this.tryChip.href = s.demo[l];
      this.tryChip.replaceChildren(icon('play_arrow', 18), document.createTextNode(t('tile.try')));
      this.tryChip.setAttribute('aria-label', t('tile.tryLabel', { title: s.title[l] }));
    }
    this.ghChip.replaceChildren(document.createTextNode(t('tile.github')), icon('arrow_outward', 18));
  }

  /** Metro's press tilt: the tile leans away from the pointer. */
  press() {
    const release = () => {
      this.el.classList.remove('pressed');
      this.el.style.setProperty('--rx', '0deg');
      this.el.style.setProperty('--ry', '0deg');
    };
    this.el.addEventListener('pointerdown', (e) => {
      if (reduceMotion.matches || (e.target instanceof Element && e.target.closest('.chip-try'))) return;
      const r = this.el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const k = 7 * Math.min(1, 420 / Math.max(r.width, r.height));
      this.el.style.setProperty('--rx', `${(py * k).toFixed(2)}deg`);
      this.el.style.setProperty('--ry', `${(-px * k).toFixed(2)}deg`);
      this.el.classList.add('pressed');
    });
    for (const type of ['pointerup', 'pointerleave', 'pointercancel']) this.el.addEventListener(type, release);
  }

  /** Builds the stage in the current language, once its images are ready. */
  prepare() {
    if (this.building && this.builtLang === lang()) return this.building;
    const l = lang();
    this.builtLang = l;
    const build = (async () => {
      this.comp ??= (await this.showcase.composition()).default;
      const comp = this.comp;
      // Built off-page, then swapped in, so the old one shows until the new one is ready.
      const holder = document.createElement('div');
      holder.className = 'tile-stage-inner';
      Object.assign(holder.style, { position: 'absolute', inset: '0' });
      this.view.append(holder);
      const stage = new Stage(holder);
      const kit = new Kit(stage.el, comp, l);
      comp.build(kit);
      await kit.ready();
      if (this.builtLang !== l) {
        stage.destroy();
        holder.remove();
        return;
      }
      const was = this.player;
      const time = was ? was.time : this.resumeAt;
      was?.pause();
      this.stage?.destroy();
      this.view.querySelectorAll('.tile-stage-inner').forEach((h) => h !== holder && h.remove());
      this.stage = stage;
      this.player = new Player(kit.tl, comp.duration, (_t, p) => this.progress.style.setProperty('--progress', p.toFixed(4)));
      this.player.seek(this.wanted ? time : comp.poster);
      this.view.classList.add('ready');
      if (this.wanted) this.player.play();
    })();
    this.building = build;
    return build;
  }

  /** Plays, from where it last stopped. */
  async play() {
    if (reduceMotion.matches) return;
    this.wanted = true;
    this.el.classList.add('is-playing');
    await this.prepare();
    if (!this.wanted || !this.player || this.player.playing) return;
    this.player.seek(this.resumeAt);
    this.player.play();
  }

  /** Stops, remembers where, and shows the poster once the tile has faded back. */
  stop() {
    this.wanted = false;
    this.el.classList.remove('is-playing');
    if (!this.player) return;
    this.player.pause();
    this.resumeAt = this.player.time;
    const player = this.player;
    const poster = this.comp?.poster ?? 0;
    setTimeout(() => {
      if (!this.wanted && player === this.player) player.seek(poster);
    }, 450);
  }
}

/**
 * Creates the tiles and decides which one plays.
 * @param {HTMLElement} list the grid
 * @param {Showcase[]} showcases
 */
export function createTiles(list, showcases) {
  const tiles = showcases.map((s, i) => new Tile(s, i));
  for (const tile of tiles) list.append(tile.el);
  const byEl = new Map(tiles.map((t) => [t.el, t]));

  // Stages are built as tiles come near the viewport.
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) byEl.get(/** @type {HTMLLIElement} */ (e.target))?.prepare();
    },
    { rootMargin: '400px 0px' },
  );
  for (const tile of tiles) near.observe(tile.el);

  /** @type {Tile | null} */
  let active = null;
  /** @param {Tile | null} tile */
  const activate = (tile) => {
    if (tile === active) return;
    active?.stop();
    active = tile;
    tile?.play();
  };

  // Pointer devices: hover or keyboard focus.
  for (const tile of tiles) {
    tile.el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') activate(tile);
    });
    tile.el.addEventListener('pointerleave', (e) => {
      if ((e.pointerType === 'mouse' || e.pointerType === 'pen') && active === tile) activate(null);
    });
    tile.el.addEventListener('focusin', () => activate(tile));
    tile.el.addEventListener('focusout', (e) => {
      if (active === tile && !tile.el.contains(/** @type {Node | null} */ (e.relatedTarget)) && !tile.el.matches(':hover')) activate(null);
    });
  }

  // Touch screens: the tile most in view plays.
  /** @type {Map<Tile, number>} */
  const ratios = new Map();
  const inView = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const tile = byEl.get(/** @type {HTMLLIElement} */ (e.target));
        if (tile) ratios.set(tile, e.intersectionRatio);
      }
      if (hoverDevice.matches) return;
      let best = null;
      let bestRatio = 0.6;
      for (const [tile, r] of ratios) {
        if (r > bestRatio) {
          best = tile;
          bestRatio = r;
        }
      }
      activate(best);
    },
    { threshold: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1] },
  );
  for (const tile of tiles) inView.observe(tile.el);

  const touchClass = () => document.documentElement.classList.toggle('touch', !hoverDevice.matches);
  touchClass();
  hoverDevice.addEventListener('change', touchClass);
  reduceMotion.addEventListener('change', () => reduceMotion.matches && activate(null));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) active?.player?.pause();
    else if (active?.wanted) active.player?.play();
  });

  onLang(() => {
    for (const tile of tiles) {
      tile.texts();
      if (tile.building) tile.prepare();
    }
  });
  return tiles;
}

/** @param {Element} parent @param {string} cls */
function div(parent, cls) {
  const e = document.createElement('div');
  e.className = cls;
  parent.append(e);
  return e;
}

/** @param {Element} parent @param {string} cls */
function span(parent, cls) {
  const e = document.createElement('span');
  if (cls) e.className = cls;
  parent.append(e);
  return e;
}
