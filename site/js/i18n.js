// @ts-check
// The page's language (requirements R2): ?lang= in the URL, then the choice saved with the
// switch, then the browser's languages. English or Simplified Chinese only.

import { STRINGS } from './strings.js';

/** @typedef {'en' | 'zh'} Lang */

/** @type {Lang[]} */
export const LANGS = ['en', 'zh'];
const STORAGE_KEY = 'wixette.lang';

/**
 * Normalises a language tag to one of ours, or null.
 * @param {string | null | undefined} tag
 * @returns {Lang | null}
 */
export function normalise(tag) {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t === 'en' || t.startsWith('en-')) return 'en';
  if (t === 'zh' || t.startsWith('zh-') || t.startsWith('zh_')) return 'zh';
  return null;
}

/**
 * The language to start in.
 * @param {{ query?: string | null; saved?: string | null; browser?: readonly string[] }} sources
 * @returns {Lang}
 */
export function detect({ query, saved, browser = [] }) {
  const fromQuery = normalise(query);
  if (fromQuery) return fromQuery;
  const fromSaved = normalise(saved);
  if (fromSaved) return fromSaved;
  // The first of the browser's languages that is one of ours; a Chinese browser that lists
  // English second still gets Chinese.
  for (const tag of browser) {
    const l = normalise(tag);
    if (l) return l;
  }
  return 'en';
}

/**
 * Fills {name} placeholders.
 * @param {string} s
 * @param {Record<string, string | number>} [vars]
 */
export const fill = (s, vars = {}) => s.replace(/\{(\w+)\}/g, (w, k) => (k in vars ? String(vars[k]) : w));

/** @type {Lang} */
let current = 'en';
/** @type {Set<(lang: Lang) => void>} */
const listeners = new Set();

/** The current language. */
export const lang = () => current;

/**
 * The page's string for a key in the current language.
 * @param {keyof typeof STRINGS.en} key
 * @param {Record<string, string | number>} [vars]
 */
export const t = (key, vars) => fill(STRINGS[current][key], vars);

/** @param {(lang: Lang) => void} fn */
export function onLang(fn) {
  listeners.add(fn);
}

/** Decides the starting language from the page's surroundings. */
export function initLang() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // storage blocked: the choice is simply not remembered
  }
  const query = new URLSearchParams(location.search).get('lang');
  setLang(detect({ query, saved, browser: navigator.languages ?? [navigator.language] }), { save: false });
}

/**
 * Switches language and tells the page.
 * @param {Lang} l
 * @param {{ save?: boolean }} [o] remember the choice (when the switch made it)
 */
export function setLang(l, { save = true } = {}) {
  current = l;
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
  if (save) {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // storage blocked
    }
    // A ?lang= in the address would otherwise win on reload.
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', l);
      history.replaceState(null, '', url);
    }
  }
  for (const fn of listeners) fn(l);
}
