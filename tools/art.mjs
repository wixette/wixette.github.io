// @ts-check
// `pnpm art <id>`: the images of one showcase (design D15), from art/<id>/art.json and the
// style prefixes in art/style.json.
//
//   pnpm art <id>                      generates the images not yet in .cache/art/<id>/
//   pnpm art <id> --only a,b --force   generates those again
//   pnpm art <id> --export             trims, shadows and resizes them into WebP in
//                                      site/showcases/<id>/assets/, and writes assets.js
//
// Images of kind "ref" (a model sheet) are made first and attached to every later image of
// the showcase, which keeps its characters consistent. Needs OPENAI_API_KEY in .env, and
// ImageMagick (`magick`) for --export. The full-size PNGs are never committed.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** @typedef {'ref' | 'sprite' | 'bg' | 'text'} Kind */
/** @typedef {{ name: string; kind: Kind; prompt: string; size?: string; max?: number }} Item */

/** Generation size and export size for each kind. */
const KINDS = {
  ref: { size: '1536x1024', max: 0 },
  sprite: { size: '1024x1024', max: 800 },
  text: { size: '1536x1024', max: 1000 },
  bg: { size: '1536x1024', max: 1600 },
};

/** Reads KEY=value lines from .env, without printing them. */
function env() {
  /** @type {Record<string, string>} */
  const out = {};
  const file = join(ROOT, '.env');
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

/**
 * One image from the OpenAI image API, as PNG bytes.
 * @param {{ prompt: string; size: string; transparent: boolean; refs: string[] }} o refs: PNG paths attached as references
 */
async function generate({ prompt, size, transparent, refs }) {
  const e = { ...env(), ...process.env };
  const key = e.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set (copy .env.example to .env)');
  const common = {
    model: e.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-sunburst',
    prompt,
    size,
    quality: e.OPENAI_IMAGE_QUALITY || 'high',
    output_format: 'png',
    background: transparent ? 'transparent' : 'opaque',
  };
  const headers = { Authorization: `Bearer ${key}` };
  let res;
  if (refs.length) {
    const form = new FormData();
    for (const [k, v] of Object.entries(common)) form.append(k, v);
    for (const r of refs) form.append('image[]', new Blob([readFileSync(r)], { type: 'image/png' }), basename(r));
    res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers, body: form });
  } else {
    res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(common),
    });
  }
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = /** @type {{ data: { b64_json: string }[] }} */ (await res.json());
  return Buffer.from(json.data[0].b64_json, 'base64');
}

/**
 * Runs tasks, a few at a time.
 * @template T
 * @param {T[]} items
 * @param {number} n
 * @param {(item: T) => Promise<void>} fn
 */
async function pool(items, n, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: n }, async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) await fn(item);
  }));
}

/**
 * @param {string} id
 * @param {{ only: string[] | null; force: boolean; concurrency: number }} o
 */
async function generateAll(id, { only, force, concurrency }) {
  const style = JSON.parse(readFileSync(join(ROOT, 'art/style.json'), 'utf8'));
  /** @type {{ items: Item[] }} */
  const plan = JSON.parse(readFileSync(join(ROOT, `art/${id}/art.json`), 'utf8'));
  const cache = join(ROOT, '.cache/art', id);
  mkdirSync(cache, { recursive: true });
  const wanted = plan.items.filter((i) => (only ? only.includes(i.name) : true) && (force || !existsSync(join(cache, `${i.name}.png`))));
  const refs = plan.items.filter((i) => i.kind === 'ref');
  /** @param {Item} item */
  const make = async (item) => {
    const t0 = Date.now();
    const refFiles = item.kind === 'sprite' ? refs.map((r) => join(cache, `${r.name}.png`)).filter(existsSync) : [];
    for (let attempt = 1; ; attempt++) {
      try {
        const png = await generate({
          prompt: style[item.kind] + item.prompt,
          size: item.size ?? KINDS[item.kind].size,
          transparent: item.kind === 'sprite' || item.kind === 'text',
          refs: refFiles,
        });
        writeFileSync(join(cache, `${item.name}.png`), png);
        process.stdout.write(`${id}/${item.name} ok (${Math.round((Date.now() - t0) / 1000)} s)\n`);
        return;
      } catch (err) {
        if (attempt >= 3) {
          process.stdout.write(`${id}/${item.name} FAILED: ${/** @type {Error} */ (err).message}\n`);
          return;
        }
        await new Promise((r) => setTimeout(r, 4000 * attempt));
      }
    }
  };
  // Model sheets first: everything else is drawn to match them.
  await pool(wanted.filter((i) => i.kind === 'ref'), concurrency, make);
  await pool(wanted.filter((i) => i.kind !== 'ref'), concurrency, make);
  process.stdout.write(`${id}: ${wanted.length} image(s) generated.\n`);
}

/** @param {string[]} args */
const magick = (args) => execFileSync('magick', args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString();

/** @param {string} id */
function exportAll(id) {
  /** @type {{ items: Item[] }} */
  const plan = JSON.parse(readFileSync(join(ROOT, `art/${id}/art.json`), 'utf8'));
  const cache = join(ROOT, '.cache/art', id);
  const out = join(ROOT, 'site/showcases', id, 'assets');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  /** @type {Record<string, { file: string; w: number; h: number }>} */
  const assets = {};
  for (const item of plan.items) {
    if (item.kind === 'ref') continue;
    const src = join(cache, `${item.name}.png`);
    if (!existsSync(src)) {
      process.stdout.write(`${id}/${item.name}: not generated, skipped\n`);
      continue;
    }
    const file = `${item.name}.webp`;
    const dst = join(out, file);
    const max = item.max ?? KINDS[item.kind].max;
    if (item.kind === 'bg') {
      // Cover-crop to 2:1, the stage's shape.
      magick([src, '-resize', `${max}x${max / 2}^`, '-gravity', 'center', '-extent', `${max}x${max / 2}`, '-quality', '80', dst]);
    } else {
      // Trim the empty margin, then bake in the paper's soft drop shadow (no CSS filters at
      // run time), as the style guide's 0 9px 7px rgba(74,48,22,.3). The model leaves faint
      // specks (alpha under 1%) far from the art: the box comes from a thresholded mask, and
      // the specks are cleared.
      const box = magick([src, '-alpha', 'extract', '-threshold', '3%', '-format', '%@', 'info:']).trim();
      magick([
        src, '-crop', box, '+repage', '-channel', 'A', '-level', '3%,100%', '+channel', '-resize', `${max}x${max}>`,
        '(', '+clone', '-background', 'rgb(74,48,22)', '-shadow', '38x5+0+7', ')',
        '+swap', '-background', 'none', '-layers', 'merge', '+repage',
        '-quality', '84', '-define', 'webp:alpha-quality=90', dst,
      ]);
    }
    const [w, h] = magick(['identify', '-format', '%w %h', dst]).trim().split(' ').map(Number);
    assets[item.name] = { file, w, h };
  }
  const lines = Object.entries(assets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  '${k}': { file: '${v.file}', w: ${v.w}, h: ${v.h} },`);
  writeFileSync(
    join(ROOT, 'site/showcases', id, 'assets.js'),
    `// Generated by \`pnpm art ${id} --export\` (tools/art.mjs): the showcase's images and their
// sizes. Do not edit.
/** @type {Record<string, import('../../js/anim/kit.js').AssetInfo>} */
export default {
${lines.join('\n')}
};
`,
  );
  process.stdout.write(`${id}: exported ${Object.keys(assets).length} image(s) to ${out}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const id = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--only'));
  const ids = readdirSync(join(ROOT, 'art'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  if (!id || !ids.includes(id)) {
    process.stderr.write(`usage: pnpm art <id> [--only a,b] [--force] [--export]\nids: ${ids.join(', ')}\n`);
    process.exit(1);
  }
  const onlyAt = args.indexOf('--only');
  const only = onlyAt >= 0 ? args[onlyAt + 1].split(',') : null;
  if (args.includes('--export')) exportAll(id);
  else await generateAll(id, { only, force: args.includes('--force'), concurrency: 4 });
}
