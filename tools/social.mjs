// @ts-check
// `pnpm social`: makes the page's two raster images, which link previews and home screens
// need instead of SVG: site/images/apple-touch-icon.png (the logo on black, 180 px, with
// ImageMagick) and site/images/og.png (the page itself at rest, 1200 × 630, with headless
// Chrome over the DevTools protocol). Run it after changing the logo or the look of the
// page, then `pnpm stamp`.

import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMAGES = join(ROOT, 'site/images');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SITE_PORT = 8890;
const DEBUG_PORT = 9290;

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Polls until fn returns a value, or gives up.
 * @template T
 * @param {() => Promise<T | undefined>} fn
 * @param {string} what
 * @returns {Promise<T>}
 */
async function until(fn, what) {
  for (let i = 0; i < 150; i++) {
    const v = await fn().catch(() => undefined);
    if (v) return v;
    await sleep(100);
  }
  throw new Error(`timed out waiting for ${what}`);
}

// The touch icon: the logo at 128 px, centred on black.
execFileSync('magick', ['-background', 'none', '-density', '1200', join(IMAGES, 'logo.svg'), '-resize', '128x128', '-background', '#000', '-gravity', 'center', '-extent', '180x180', '-depth', '8', '-strip', join(IMAGES, 'apple-touch-icon.png')]);
process.stdout.write('Wrote site/images/apple-touch-icon.png\n');

// The preview: the English page laid out at 2000 × 1050 (so the whole grid shows under the
// headline), captured at 60% once every tile's poster is in.
const profile = mkdtempSync(join(tmpdir(), 'social-'));
const server = spawn(process.execPath, [join(ROOT, 'tools/serve.mjs'), String(SITE_PORT)], { stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', '--hide-scrollbars', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
try {
  const target = await until(async () => {
    const list = /** @type {{ type: string; webSocketDebuggerUrl: string }[]} */ (await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json());
    return list.find((t) => t.type === 'page');
  }, 'Chrome');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  /** @type {Map<number, (msg: any) => void>} */
  const pending = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(String(e.data));
    pending.get(msg.id)?.(msg);
    pending.delete(msg.id);
  };
  /** @param {string} method @param {object} [params] @returns {Promise<any>} */
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      pending.set(++id, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });
  /** @param {string} expression */
  const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value;

  const width = 2000;
  const height = 1050;
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await until(() => fetch(`http://127.0.0.1:${SITE_PORT}/site/`).then((r) => r.ok), 'the site server');
  await send('Page.navigate', { url: `http://127.0.0.1:${SITE_PORT}/site/?lang=en` });
  await until(() => evaluate(`document.querySelectorAll('.tile').length > 0 && document.querySelectorAll('.tile').length === document.querySelectorAll('.tile-stage.ready').length`), 'the tiles');
  // the stages fade in over 600 ms
  await sleep(1200);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 0.6 } });
  writeFileSync(join(IMAGES, 'og.png'), Buffer.from(shot.data, 'base64'));
  ws.close();
  process.stdout.write('Wrote site/images/og.png\n');
} finally {
  chrome.kill();
  server.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
