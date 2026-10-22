# Design

How the page meets [requirements.md](requirements.md). Decisions are numbered (D1, D2, …) so
later changes can point at them.

## 1. Repository layout

```
site/                         the published site, served as it is (D1)
  index.html                  the page; its import map and every URL in it are stamped
  css/fonts.css               @font-face rules for the vendored fonts
  css/site.css                design tokens, layout and components
  js/main.js                  start-up: language, top bar, grid, tiles, dialog, footer
  js/i18n.js                  language choice and the t() lookup
  js/strings.js               the page's own strings, en and zh
  js/profile.js               the About dialog's content (placeholders until provided)
  js/layout.js                the live-tile solver (pure, tested)
  js/grid.js                  puts the solver's answer on the page; re-solves on resize
  js/tiles.js                 tile elements, their states and who plays when
  js/about.js                 the About dialog
  js/grid-width.js            the grid's width at a viewport width (for tools and tests)
  js/asset-url.js             stamped URLs for files the scripts load themselves
  js/icons.js                 generated: the Material Symbols the page uses
  js/hashes.js                generated: content hashes of files loaded at run time
  js/anim/                    the animation system (section 6)
  showcases/index.js          the ordered list of showcases
  showcases/<id>/composition.js   one project's animation
  showcases/<id>/assets.js    generated: its images, with their sizes
  showcases/<id>/assets/      generated: its images, WebP
  images/                     logo, avatar and favicon (placeholders until provided)
  vendor/fonts/               fonts copied from npm (pnpm vendor), with their licences
art/<id>/art.json             the prompts for a showcase's images (not published)
art/style.json                the prompt prefixes shared by every showcase
dev/                          review pages for animations (not published)
tools/                        serve, stamp, vendor, layout preview, art pipeline
tests/                        node --test
docs/                         this, the requirements, and the showcase playbook
```

**D1. Publish `site/` only.** When deployment is added it will be a GitHub Actions workflow
that runs the checks and uploads `site/` unchanged. Nothing is built; the folder is the site.

## 2. Engineering

**D2. JavaScript modules with JSDoc types, checked by `tsc --checkJs --strict`.** The browser
runs the files as written; TypeScript only reads them. Same setup as the Leibniz simulator.

**D3. Tests with `node --test`.** The layout solver, the timeline, easing, the seeded random
numbers, the language rules, string completeness, the showcase registry (files exist, both
languages, sizes known) and the stamps are all plain functions or files, tested without a
browser. The page itself is checked in a browser before each release (section 9).

**D4. Content-hash stamps instead of a version number.** `pnpm stamp` (`tools/stamp.mjs`):

1. hashes every file loaded at run time (images, fonts, SVG) and writes `js/hashes.js`;
2. writes `?v=<hash>` into every `url()` in the stylesheets;
3. hashes every JavaScript and CSS file (after step 2, so a stylesheet's hash covers its
   fonts' hashes);
4. writes `?v=<hash>` into every local `src`/`href` of `index.html`, and an import map that
   maps each module's plain URL to its stamped URL.

Only files that changed get new URLs. Modules import each other by plain relative paths and
the import map turns each into its stamped URL; images loaded by scripts take their hash
from `js/hashes.js`. `index.html` itself is never stamped and must not be cached for long
(GitHub Pages caches for 10 minutes). `pnpm stamp --check` and `tests/stamp.test.js` fail
while any stamp is stale.

**D5. No runtime dependencies.** No framework, no animation library (D12), no CDN. Fonts and
icons come from npm and are copied into `site/vendor/` by `pnpm vendor`, or inlined into
`js/icons.js`.

## 3. The page

```
┌──────────────────────────────────────────────────────────┐
│ [logo]                                  [EN|中文]  (i)   │  top app bar, sticky
├──────────────────────────────────────────────────────────┤
│ $ ls ~/open-source                                        │  prompt line, mono
│ Things I build in the open.                               │  headline
│ ┌──────────┬──────────┬─────┬─────┐                      │
│ │          │          │     │     │                      │  live-tile grid
│ │  hero    │  hero    ├─────┴─────┤                      │
│ │          │          │           │                      │
│ ├─────┬────┴──────────┴───────────┤                      │
│ └─────┴───────────────────────────┘                      │
├──────────────────────────────────────────────────────────┤
│ © 2026 … / Code Apache-2.0 · Art CC BY-SA 4.0 / Source    │  footer, mono
└──────────────────────────────────────────────────────────┘
```

## 4. Visual design

**D6. Deep dark, loud colour, chunky type.** The page is a deep vertical gradient,
interpolated in OKLab: black at the top, a deep indigo (`#120e33`, the complement of the
lime accent) through the middle, a deep moss (`#142409`, the lime's own hue, darkened) at the
bottom. It stays dark enough that the paper animations glow like lit windows. The top bar and
the footer are half-transparent black with a backdrop blur, so the gradient shows through;
the dialog uses a Material 3 dark tonal surface. On top of that:

- **One acid-lime site accent** (`#d4ff3a`) for focus rings, the prompt cursor, the active
  language and links in the dialog.
- **One accent per project**, chosen from its subject: 8800 electric blue (the Altair's front
  panel), Leibniz brass, Huashuo jade, Meowlang violet, p5.animS p5's pink. The static tile is
  tinted with it; the playing tile shows the animation in its own colours with an accent frame
  and progress bar.
- **Type:** Bricolage Grotesque (variable: weight, width, optical size) for titles and
  headline, set heavy and slightly condensed; JetBrains Mono for meta text (indices, tags,
  prompt line, footer). Chinese uses the system's sans (PingFang SC, Noto Sans SC, Microsoft
  YaHei), so no Chinese web font is downloaded.
- **Stickers:** the Try it and GitHub chips are paper stickers with a black border and a hard
  offset shadow, a nod to the paper-cutout animations: Try it in the project's accent, GitHub
  in paper white. With a mouse they sit at the bottom right and show only on the playing (or
  focused) tile; on narrow tiles Try it shows alone (the tile itself is the GitHub link), or,
  without a demo, GitHub shrinks to its arrow. On touch screens they show on every tile, all
  the time, in a row under the tagline: GitHub always (it is the way to the repository there),
  with Try it before it; on narrow tiles Try it shrinks to its ▶ icon.
- **Corners:** 14 px on tiles, 28 px on the dialog (Material 3 extra-large), full pills on
  chips and the language switch. Gaps between tiles: 10 px.

**D7. Tile states.**

| State | Look |
|---|---|
| Static | The animation's poster frame in greyscale, tinted with the accent; a dark scrim at the bottom; the title large, the tagline under it; index (`01`) and tags (`8080 · BASIC`) in mono at the top. |
| Hover / focus / focused or tapped (touch) | The tint fades out and the animation plays in colour. With a mouse, the title shrinks to a small label at the bottom left (as on a Metro live tile), the tagline and tags fade and the chips appear. On touch screens the title and tagline stay as they are, above the always-shown chips. A 4 px progress bar in the accent runs along the bottom edge. |
| Press | Metro's tilt: the tile leans away from the pointer by up to 6° and scales to 0.98, then springs back. |
| Focus | A 3 px acid-lime ring outside the tile. |

Motion follows Material 3's emphasized easing (`cubic-bezier(0.2, 0, 0, 1)`) for state
changes, 300–500 ms. With *reduce motion*, state changes are instant and nothing plays.

## 5. The live-tile layout

The problem: a fixed list of tiles, some of them heroes, must fill a grid with no hole and no
half-empty last row, at any width.

**D8. Tile shapes.** Grid cells are square. A tile is one of three shapes:

| Shape | Cells | Aspect | Used for |
|---|---|---|---|
| S | 1 × 1 | 1:1 | normal tiles |
| W | 2 × 1 | 2:1 | normal tiles, or a hero when there is no room for L |
| L | 2 × 2 | 1:1 | heroes |

Each tile lists the shapes it may take in order of preference: heroes `L, W`; normal tiles
`S, W`. A shape is only allowed when the tile it makes is at least `minTile` pixels wide
(200 px), so a phone never shows a tiny square.

**D9. The solver (`js/layout.js`).** For each candidate column count it runs an exact
search:

1. Find the first empty cell, scanning rows top to bottom and cells left to right.
2. Try each remaining tile in each of its allowed shapes at that cell, if it fits.
3. Recurse. A solution is accepted only when every tile is placed and the occupied cells form
   a complete `columns × rows` rectangle: no hole, last row full.
4. Keep the cheapest solution, pruning any branch already more expensive than the best.

Placing at the first empty cell means no hole can be left behind the cursor; the rectangle
check at the end catches a ragged last row. The cost of a solution is:

- **order**: taking the `k`-th remaining tile instead of the first costs `3k`, so the given
  order is kept unless it cannot be;
- **shape**: a hero not at its first-choice shape costs 6; a normal tile not at its first
  choice costs 1;
- **rank**: a hero must end up strictly larger than every normal tile, or the solution is
  rejected.

Then `chooseLayout` compares the column counts the width allows (2 to 8, cells between
`minCell` and `maxCell`) and adds two terms:

- **size**: how far the cell size is from the target (280 px), on a log scale, times 8;
- **fold**: how far the whole grid overflows the viewport under the top bar, in viewport
  heights, times 8, so a wide screen shows every tile at once when it can.

The cheapest overall wins. For 5 to 20 tiles this takes well under
a millisecond, so it runs in the browser on every resize.

If a set of tiles ever has no perfect packing at some width, the solver reports it and the
grid falls back to the best packing with a ragged last row. `tests/layout.test.js` checks the
current showcases at every width from 320 to 2560 px in 10 px steps, so that never ships;
`pnpm layout` prints the grids as text for review.

**D10. The grid on the page.** CSS grid with `grid-template-columns: repeat(var(--cols), 1fr)`
and square rows from container query units:
`grid-auto-rows: calc((100cqw - (var(--cols) - 1) * var(--gap)) / var(--cols))`. JavaScript
only sets `--cols` and each tile's `grid-row` / `grid-column`, and only when the solution
changes. The grid is at most 1600 px wide and centred.

## 6. Animations

### 6.1 The stage

**D11. A 2000 × 1000 stage with a square safe area.** Every composition is laid out on a
logical stage of 2000 × 1000. The stage is scaled to *cover* its tile:

- a 2:1 tile shows all of it;
- a square tile shows the middle 1000 × 1000.

So everything important — text, the main characters, the action — stays within
x = 500…1500 (the safe square). The bands either side hold the background and props that are
nice to have. Contact sheets (section 6.5) check both shapes.

### 6.2 The timeline

**D12. Our own seekable timeline (`js/anim/timeline.js`), not GSAP.** GSAP is free but not
open source, so it does not belong in an Apache-2.0 repository, and the prototype used only a
small part of it. Ours:

- An **actor** is anything with numeric properties (`x`, `y`, `scale`, `sx`, `sy`, `rot`,
  `opacity`, `draw`, `clip`, `chars`, …) and a `render()` that writes them to the DOM.
- `tl.set`, `tl.to` and `tl.fromTo` add **segments** to an actor's property: start, duration,
  from, to and an easing function. A `to` with no `from` starts from the value the property
  has at that time, given the segments already added (so a composition adds tweens in time
  order, as it naturally does).
- `tl.proc(start, duration, fn)` adds a **procedure**: a pure function of time, for stepped
  stop-motion jitter (boil), camera shake and other motion that is not a tween.
- `tl.seek(t)` computes every property at time `t` from scratch and renders. Nothing depends
  on the previous frame, so any frame can be shown at any time: the poster frame, a contact
  sheet, a scrub.
- All randomness comes from a seeded generator (`js/anim/rng.js`): the same composition
  always draws the same frames.

`js/anim/ease.js` has the easings the style needs: `linear`, `power1–4` in/out/inOut,
`sine`, `expo`, `back.out(s)`, `bounce.out`.

### 6.3 The kit

**D13. A paper-cutout kit (`js/anim/kit.js`)**, ported from the prototype's `kit.js` onto our
timeline. Compositions call it rather than placing DOM by hand:

| Group | Calls |
|---|---|
| Scenes | `scene(bg)`, `sheetIn` (a paper sheet with a torn edge slides over), `flash`, `pushIn` (slow camera zoom), `shake` |
| Cutouts | `sprite` (anchored at its feet or centre), `pop`, `dropIn`, `slideIn`, `hop`, `moveTo`, `spin`, `hide` |
| Idle life | `sway`, `bob`, `boil` (on an inner wrapper, so they never fight the entrances) |
| Text art | `textArt` (a drawn text image for the current language, fitted into a box), `wipe` (reveals it left to right) |
| Code text | `caption` (brush letters, written one by one), `tag` (a paper tag with washi tape), `type` (monospace typewriter with a cursor), `tiles` (ransom-note letters) |
| Pencil | `stroke` + `draw` (SVG paths that draw themselves), `underline`, `circle`, `check`, `doodle` (sparkle, ticks, `?`, `!`) |
| Particles | `confetti` |

### 6.4 Compositions

A composition is a module (`showcases/<id>/composition.js`) that exports:

```js
export default {
  duration: 22,          // seconds; the player loops
  poster: 6.5,           // the time of the still used for the static tile
  strings: { en: {...}, zh: {...} },   // code text, and fallbacks for text art
  build(k) { ... },      // adds scenes, actors and tweens through the kit
};
```

`k.lang` is the current language. Changing language rebuilds the stage and seeks to the same
time.

**D14. Text in animations: drawn text for signature lines, code text for the rest.** A test
on 2026-10-22 had the image model letter "Turn the crank!", 「摇动曲柄！」, "Data is meow." and
「数据就是喵。」 as paper cutouts: all four spelled right first time, with drawing mixed into
the letters (a crank for the T, a cat's tail as the underline), which code text cannot do.
The first full run (2026-10-22) confirmed it: all 16 text images (8 lines × 2 languages)
were spelled right first time. One is stylised beyond the prompt: in 「数据就是喵。」 the 喵 has
cat ears for its 艹 and a paw print inside its 田, still clearly 喵; it is flagged for the
owner's review. So:

- **Text art** (`textArt`) for each animation's 1–3 signature lines: one image per language,
  `<name>.en.webp` and `<name>.zh.webp`. Every character is checked at full size before it is
  accepted; a wrong one is regenerated. If no good image exists for a language, the kit draws
  the line from `strings` instead, so the animation never shows wrong text.
- **Code text** wherever exactness or change over time matters: program text being typed,
  numbers that count, small labels.

Code text uses Caveat Brush (captions), Patrick Hand (tags) and JetBrains Mono (code), with
the system's Chinese fonts for Chinese.

### 6.5 Images and the art pipeline

**D15. `pnpm art <id>` (`tools/art.mjs`).** `art/<id>/art.json` lists every image of a
showcase with its kind and prompt; `art/style.json` holds the style prefixes from the
prototype's style guide. The tool:

1. generates the missing images with the OpenAI image API (key in `.env`), into
   `.cache/art/<id>/` (git-ignored). Reference images (a model sheet of the project's
   characters and props) are generated first and passed to every later image of that
   showcase, which keeps it consistent within one animation (D16);
2. with `--export`, trims transparent margins, resizes (sprites to at most 800 px, text art to
   1000 px, backgrounds to 1600 × 800 after cropping to 2:1), bakes in the paper's drop shadow
   (so no CSS filter runs during playback) and writes WebP to `site/showcases/<id>/assets/`,
   plus `assets.js` with every image's file name and size. The model leaves near-invisible
   specks (alpha under 1%) far from the art; the trim box comes from a thresholded alpha
   mask, and the specks are cleared. A whole animation comes to 120–180 KB.

The full-size PNGs are never committed; the WebP files are the published art.

**D16. No recurring mascot.** Each showcase has its own characters, kept consistent within
that showcase by its own reference sheet, so adding a project never depends on matching an
old character.

### 6.6 Playback

`js/anim/player.js` runs a `requestAnimationFrame` loop on one stage at a time, loops at the
end, and reports progress for the progress bar. `js/tiles.js` decides who plays:

- **Pointer devices** (`(hover: hover)`): the hovered or focused tile.
- **Touch devices** (D17): the tile under a focus line that sweeps the screen as the page
  scrolls (`js/focus.js`): just under the top bar at the top of the page, at the bottom edge
  at its end. The point of the page under the line therefore travels from the first tile to
  the last, so scrolling gives every tile its turn, in order, the last row included, even
  when several tiles are on screen at once (the end of the page). Where tiles sit side by
  side, the one nearest the middle of the grid wins; the others are a tap away. A tap on a
  tile plays it, and a tap on the playing tile pauses it; a tap holds until the focus line
  moves on to another tile. The tile is not a link there: its GitHub and Try it buttons are.
  (The first version played the tile most in view, but at the end of the page several tiles
  are fully in view and scrolling can no longer change which one wins.)
- **Reduce motion**: nobody.

A tile's stage is built when the tile comes within 400 px of the viewport, its images are
decoded, then it seeks to the poster time. Stopped stages cost nothing.

## 7. Languages

`js/i18n.js` decides the language (D2.2 of the requirements: URL, then saved choice, then
the browser), sets `<html lang>`, the title and the description, and notifies the page.
Strings live in `js/strings.js` (the page), `showcases/index.js` (titles, taglines, links)
and each composition (its text). Tests check that every key has both languages.

Project names in Chinese: Altair 8800 模拟器, 莱布尼茨步进计算器, 话说, 喵语言, p5.animS.

## 8. Accessibility

- Each tile is an `<article>` with one link stretched over it (the GitHub repository), named
  "<title> on GitHub"; the Try it chip is a separate link above it. No nested links.
- The animation stage is `aria-hidden`; the tile's title and tagline carry the meaning.
- The About dialog is a native `<dialog>` (focus trap, Escape closes, focus returns).
- The language switch is a pair of `aria-pressed` buttons; the top bar's icon button has a
  translated label.

## 9. Checking it

| Check | How |
|---|---|
| Types | `pnpm typecheck` |
| Logic, strings, registry, stamps | `pnpm test` |
| Layout at every width | `pnpm test`; `pnpm layout` prints them |
| Animations | `dev/sheet.html?id=<id>&lang=en&shape=S` shows a contact sheet (one frame every 1.5 s) at each shape and language; `dev/player.html?id=<id>` plays one large with a scrubber. Both set `data-ready` on `<body>` when done (a hidden browser window is throttled and takes several seconds) |
| The page | `pnpm serve`, then the page at 375, 768, 1280 and 1920 px, in both languages, with and without reduce motion |

## 10. Licensing

[`REUSE.toml`](../REUSE.toml) declares every path: code Apache-2.0; docs, generated art and
compositions' text CC BY-SA 4.0; vendored fonts OFL-1.1; Material Symbols Apache-2.0. The
licence texts are in `LICENSES/`.
