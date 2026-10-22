// @ts-check
// Stamped URLs for files the scripts load themselves (design D4).

import { HASHES } from './hashes.js';

/** The site's root URL (site/). */
export const SITE_ROOT = new URL('../', import.meta.url).href;

/**
 * The URL of a file under site/, with its content hash.
 * @param {string} path from site/, e.g. "images/avatar.svg"
 */
export function assetUrl(path) {
  const hash = HASHES[path];
  return new URL(path, SITE_ROOT).href + (hash ? `?v=${hash}` : '');
}

/**
 * The same for a file named by a full URL inside the site.
 * @param {URL} url
 */
export function stampUrl(url) {
  return url.href.startsWith(SITE_ROOT) ? assetUrl(url.href.slice(SITE_ROOT.length)) : url.href;
}
