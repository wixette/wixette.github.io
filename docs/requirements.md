# Requirements

The root GitHub Pages site of [wixette](https://github.com/wixette): one page that shows a
handful of open source projects as live tiles, each with a short cartoon animation that
says what the project is and why it is worth a look.

Status: agreed for v1 (2026-10-22). Changes are made here first, then in
[design.md](design.md).

## R1. The page

| # | Requirement |
|---|---|
| R1.1 | One static page: HTML, CSS and JavaScript modules, served as they are. Nothing is compiled or bundled before deployment. |
| R1.2 | Only the `site/` folder is published. Tools, tests, docs and art prompts stay in the repository but are never served. |
| R1.3 | Every file the page loads has a versioned URL (a content hash), so a cache can never serve an old file to a new page. A test fails while any stamp is out of date. |
| R1.4 | The JavaScript is type-checked strictly (JSDoc + TypeScript's checker, `pnpm typecheck`) and unit-tested (`pnpm test`). Both must pass before a commit is pushed. |
| R1.5 | Current browsers only: Chrome, Edge and Firefox of the last two years, Safari 16.4 or later (import maps, container query units, `<dialog>`). |

## R2. Languages

| # | Requirement |
|---|---|
| R2.1 | English and Simplified Chinese, nothing else. |
| R2.2 | The first visit follows the browser's language (any `zh*` gives Chinese, anything else English). A choice made with the switch is remembered. `?lang=en` or `?lang=zh` in the URL wins over both. |
| R2.3 | Switching language changes every text on the page at once, including the text inside the animations, without reloading. |
| R2.4 | Both languages have every string; a test fails otherwise. Chinese is written for Chinese readers, not translated word for word. |

## R3. Top bar

| # | Requirement |
|---|---|
| R3.1 | The logo (an SVG the owner provides; a placeholder until then). |
| R3.2 | The language switch, English / 中文. |
| R3.3 | A button that opens the About dialog: the owner's name, a short bio, an avatar and social links (placeholders until the owner provides them, kept in one file). |

## R4. Showcase tiles

| # | Requirement |
|---|---|
| R4.1 | One tile per project, in a fixed order. v1: 8800 Simulator, Leibniz's Stepped Reckoner, 话说 Huashuo, Meowlang, p5.animS. |
| R4.2 | Some tiles are **heroes** and are shown larger than the others on every screen. v1: Leibniz and 8800. |
| R4.3 | The tiles form a live-tile grid (Metro style) with **every row completely filled**, on wide desktops, normal desktops, tablets and phones. |
| R4.4 | Static state: a still picture from the project's animation, styled to the page, with the project's title and a one-line tagline. |
| R4.5 | Playing state: on hover or keyboard focus (desktop), the tile plays its animation, looping; leaving it pauses and returns to the static look. On touch screens, scrolling gives every tile its turn, one at a time, the last row included; a tap on a tile plays it, and a tap on the playing tile pauses it. |
| R4.6 | Every tile links to the project's GitHub repository, and projects with a live demo also get a **Try it** link. With a mouse, the whole tile is the GitHub link and the buttons show on hover. On touch screens, where a tap plays the tile, a **GitHub** button (and **Try it**) is always shown on every tile. |
| R4.7 | With *reduce motion* set in the system, nothing plays by itself; tiles stay static. |

## R5. Animations

| # | Requirement |
|---|---|
| R5.1 | One animation per project, 15–30 seconds, silent, in the paper-cutout storybook style of the mootion-animator prototype (watercolor cutouts with die-cut borders, snappy stop-motion moves). |
| R5.2 | It shows what the project does and what makes it special, in about four beats, with a hook in the first two seconds. |
| R5.3 | Driven by JavaScript: background images, transparent sprites and SVG doodles in a 2D stage, on a seekable, deterministic timeline. |
| R5.4 | Text in the animation exists in both languages. Signature lines (titles, punchlines) may be drawn by the image model, one image per language, each checked character by character; everything else is text drawn in code. Every drawn line has a code fallback. |
| R5.5 | Each project is designed on its own: no recurring mascot, so a future project never has to match an old character. |
| R5.6 | Works at the two tile shapes, square and 2:1, without cutting off anything important. |

## R6. Footer

A footer with the copyright line and the licences.

## R7. Visual design

| # | Requirement |
|---|---|
| R7.1 | Dark only: a deep dark vertical gradient behind the page (black and one or two deep shades that suit the accent); a half-transparent top bar and footer over it; Material 3 dark tonal surfaces for the dialog. |
| R7.2 | Follows Material Design for components, states, focus and accessibility; the tile grid follows Metro's live tiles. |
| R7.3 | Bold and geeky, aimed at young engineers: strong per-project colours, chunky type, monospace details. |

## R8. Quality and accessibility

| # | Requirement |
|---|---|
| R8.1 | Every control works with the keyboard, has a visible focus ring and a name for screen readers, in the current language. |
| R8.2 | Text contrast meets WCAG AA. |
| R8.3 | The page is usable at 320 px wide with no horizontal scrolling. |
| R8.4 | Animation assets load lazily; the first view does not wait for them. |

## R9. Licensing

Code is Apache-2.0. Original content (docs, generated images, animations, text) is CC BY-SA 4.0.
Fonts keep their own licence (SIL OFL 1.1), and so do the Material Symbols icons (Apache-2.0).
Declared per path in `REUSE.toml`. The two third-party design drafts used as visual references
are never committed.

## R10. Maintenance

New showcases are added by an AI agent following [adding-a-showcase.md](adding-a-showcase.md),
with the owner reviewing quality and visuals.

## Not in v1

- Deployment. The GitHub Actions workflow is added once the owner approves the page.
- Sound of any kind.
- Analytics, cookies or any request to another site.
