# wixette.github.io

The showcase page of [wixette](https://github.com/wixette)'s open source projects: one page of
live tiles, each playing a short paper-cutout animation of what the project does, in English
and Simplified Chinese.

The site is the [`site/`](site/) folder, served as it is: HTML, CSS and JavaScript modules,
with nothing to build. Everything else (tools, tests, docs, art prompts) stays out of it.

## Run it

```
pnpm install
pnpm serve        # http://127.0.0.1:8800/site/
```

The review pages for animations are at `/dev/sheet.html` (a contact sheet) and
`/dev/player.html` (one animation with a scrubber); both take `?id=<showcase>&lang=en|zh&shape=S|W`.

## Check it

```
pnpm typecheck    # the JSDoc types, strictly (tsc --checkJs); nothing is compiled
pnpm test         # solver, timeline, languages, showcases, stamps
pnpm layout       # the live-tile grid at each screen width, as text
pnpm stamp        # after changing any file under site/: the content-hash URLs
pnpm social       # after changing the logo or the page's look: touch icon and link preview
```

## Publish it

Every push to `main` runs the checks and publishes `site/` to GitHub Pages
(`.github/workflows/deploy.yml`). The repository's Pages source must be **GitHub Actions**
(Settings → Pages), not a branch.

## Documents

| Document | What it is |
|---|---|
| [docs/requirements.md](docs/requirements.md) | What the page must do |
| [docs/design.md](docs/design.md) | How it does it: layout solver, animation system, visual design, caching |
| [docs/adding-a-showcase.md](docs/adding-a-showcase.md) | The playbook an AI agent follows to add a project |

## Licence

- **Code:** [Apache-2.0](LICENSE)
- **Content** (docs, art prompts, the generated images and the animations' texts): [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt)
- **Fonts** keep their own licence (SIL OFL 1.1), and the Material Symbols icons theirs (Apache-2.0); every path is declared in [REUSE.toml](REUSE.toml).
