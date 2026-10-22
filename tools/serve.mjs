// @ts-check
// `pnpm serve [port]`: serves the repository for local review, with no caching. The site is at
// /site/ (the address / goes there) and the review pages at /dev/.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8800);

/** @type {Record<string, string>} */
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain' }).end('bad request');
    return;
  }
  if (path === '/') {
    res.writeHead(302, { location: '/site/' }).end();
    return;
  }
  let file = normalize(join(ROOT, path));
  try {
    if (!file.startsWith(ROOT) || file.includes(`${ROOT}.`) || file.includes('node_modules')) throw new Error();
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    statSync(file);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
  createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => process.stdout.write(`Serving on http://127.0.0.1:${PORT}/site/\n`));
