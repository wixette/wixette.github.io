// @ts-check
// Loads a stage image for real. A stage starts only once every image has loaded (kit.ready),
// so a request that fails (a dropped connection on a phone) is tried again, and one that
// keeps failing fails the build: the tile then stays at rest rather than playing with broken
// images, and is built again the next time it is needed (tiles.js).

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Sets img's source and resolves once it has loaded and decoded, trying again after a
 * failure; rejects once every try has failed.
 * @param {HTMLImageElement} img
 * @param {string} src
 * @param {{ tries?: number; wait?: (attempt: number) => Promise<unknown> }} [o] wait: the pause
 *   before each retry (attempt 1, 2, …)
 */
export async function loadImage(img, src, { tries = 4, wait = (n) => sleep(400 * 2 ** n) } = {}) {
  for (let attempt = 0; ; attempt++) {
    // A retry asks for a new URL, so the browser fetches again rather than reusing the failure.
    img.src = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src;
    try {
      await loaded(img);
      break;
    } catch {
      if (attempt + 1 >= tries) throw new Error(`could not load ${src}`);
      await wait(attempt + 1);
    }
  }
  // Decoding now keeps the first frames smooth. Some browsers reject decode() for an image
  // that loaded fine, so that is no failure.
  await img.decode().catch(() => undefined);
}

/**
 * Resolves when img loads with pixels, rejects when it fails.
 * @param {HTMLImageElement} img
 */
function loaded(img) {
  return new Promise((resolve, reject) => {
    const off = () => {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };
    const onLoad = () => {
      off();
      if (img.naturalWidth > 0) resolve(undefined);
      else reject(new Error('empty image'));
    };
    const onError = () => {
      off();
      reject(new Error('load error'));
    };
    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
    // From the memory cache an image can be complete at once, before any event.
    if (img.complete && img.naturalWidth > 0) onLoad();
  });
}
