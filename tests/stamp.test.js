// @ts-check
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stampAll, stampCss, stampPage } from '../tools/stamp.mjs';

test('every stamp in site/ is up to date (run pnpm stamp)', () => {
  assert.deepEqual(stampAll({ write: false }), []);
});

test('stylesheets get their files hashes, and stamping again changes nothing', () => {
  const hashes = { 'vendor/a.woff2': 'abc' };
  const once = stampCss('src: url(../vendor/a.woff2) format("woff2");', 'css/x.css', hashes);
  assert.equal(once, 'src: url(../vendor/a.woff2?v=abc) format("woff2");');
  assert.equal(stampCss(once, 'css/x.css', hashes), once);
  assert.throws(() => stampCss('url(../missing.png)', 'css/x.css', hashes));
});

test('the page gets stamped URLs and an import map of every module', () => {
  const html = '<link href="css/a.css"><a href="https://x.org/">x</a>\n    <script type="importmap">\n    {}\n    </script>';
  const out = stampPage(html, { 'css/a.css': '111', 'js/m.js': '222' });
  assert.match(out, /href="css\/a\.css\?v=111"/);
  assert.match(out, /href="https:\/\/x\.org\/"/);
  assert.match(out, /"\.\/js\/m\.js": "\.\/js\/m\.js\?v=222"/);
});
