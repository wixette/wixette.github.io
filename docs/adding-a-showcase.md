# Adding a showcase

A playbook for an AI agent (Claude Code) that adds a project to the site. The owner says
which project, where it goes in the order and whether it is a hero; the agent does the rest
and asks the owner to review the result. Read [requirements.md](requirements.md) and
[design.md](design.md) first.

## What the owner gives

- The repository (GitHub URL, and a local clone if there is one).
- Its place in the order, and whether it is a hero.
- Anything to stress or avoid in the animation (optional).

## 0. Before starting

- Work on a new branch, `showcase/<id>`. `<id>` is the repository name in lower case.
- `pnpm install`, then `pnpm check` must pass before you change anything.
- `.env` must hold `OPENAI_API_KEY` (copy `.env.example`).

## 1. Understand the project

Read the README(s) in every language they come in, the docs, the screenshots and, if it
has one, try the live demo. Write down, for yourself:

- **What it is**, in one sentence a newcomer understands.
- **The two or three things that make it special**: what it does that others do not, or what
  it is the first, only, smallest or most faithful at.
- **Its visual world**: the objects, era, places and creatures that can carry the story.
- **Facts for the tile**: a title and a tagline in both languages (the tagline at most about
  50 characters in English and 20 in Chinese), up to three short tags, the live demo URL if
  any (with a Chinese version if the demo has one).

## 2. Write the script

About 20 seconds (15–30), four beats, silent. Rules:

- **Hook in the first two seconds**: a big question, a date, a surprising object.
- **One idea per beat**, each beat a visual gag, not a sentence to read.
- **Little text**: one signature title, one punchline or closing line, a few small labels.
  Text art (drawn by the image model) for the 1–3 signature lines; code text for program text,
  numbers and labels (design D14).
- **Both languages**: write the Chinese lines for Chinese readers. Short, punchy, idiomatic.
- **Square-safe**: everything that matters fits the middle 1000 × 1000 of the 2000 × 1000
  stage; the side bands are scenery.
- **No recurring mascot** (D16). Characters belong to this project only.
- End on the project's name or a closing line that sends people to it, and hold it for a
  second before the loop.

Write the script as the top comment of `site/showcases/<id>/composition.js`: one paragraph
per beat with its start time.

## 3. Plan and generate the images

Create `art/<id>/art.json` (copy one from another showcase). Typically:

| Kind | How many | Notes |
|---|---|---|
| `ref` | 1 | A model sheet: every character and main prop in this style, side by side. Generated first; passed to all the others. |
| `bg` | 1–3 | Plain textured paper or a simple landscape, no characters, quiet in the middle so cutouts and text read on it. |
| `sprite` | 5–10 | One character, pose or prop per image, on a transparent background. Poses of the same character are separate sprites. |
| `text` | 1–3 per language | The signature lines. Give the exact text, say "spell it exactly" in the prompt's language, and describe how a drawing joins the letters. |

```
pnpm art <id>            # generates what is missing, into .cache/art/<id>/
pnpm art <id> --only bg_lab,cat_walk --force   # redo some
```

**Check every image yourself** at full size before exporting:

- Text art: every letter and every Chinese stroke, against the intended text. One wrong
  stroke means regenerate. After three failures in a language, drop that image; the kit draws
  the line from the composition's strings instead.
- Sprites: a clean transparent background, the white die-cut border all round, nothing cut off,
  the same character design as the reference sheet.
- Backgrounds: no text, no characters, calm in the middle.

Then export:

```
pnpm art <id> --export   # WebP into site/showcases/<id>/assets/, and assets.js
```

## 4. Write the composition

`site/showcases/<id>/composition.js`. Copy the structure of an existing one. Use the kit
(design 6.3) rather than raw DOM. Rules:

- Times are absolute seconds. Add tweens in time order.
- Randomness only from `k.rng(seed)`; no `Math.random`, `Date` or timers.
- Coordinates are stage pixels, 2000 × 1000; keep what matters inside x = 500…1500.
- Pick a `poster` time with the main subject on screen and no text art.
- Strings for both languages in `strings`; every `textArt` name needs a fallback string.

## 5. Review it yourself

```
pnpm serve
```

- `dev/sheet.html?id=<id>&lang=en&shape=S` and `&shape=W`, then the same with `lang=zh`: the
  contact sheets. Look for empty stretches, things cut off at the square's edges, text that
  overlaps, a character floating above the ground, a beat that reads backwards.
- `dev/player.html?id=<id>&lang=en`: watch it at full speed. Snappy, never floaty; nothing on
  screen frozen.

Fix and repeat until it is right. Two rounds are typical.

## 6. Register the tile

Add the showcase to `site/showcases/index.js` at its place in the order: `id`, `repo`,
`demo` (if any), `emphasis` (`hero` or `normal`), `accent` (a colour that suits the project
and differs from its neighbours'), `title`, `tagline` and `tags` in both languages, and the
composition's import.

Then:

```
pnpm layout              # the grids at every breakpoint, as text
pnpm stamp               # stamps the new files
pnpm check               # types and tests: the layout test fails if any width has a hole
```

If the layout test fails, the set of tiles has no perfect packing at some width: change the
order, or the hero choice, and tell the owner why.

## 7. Licensing

The generated images and the composition's text are CC BY-SA 4.0, covered by the defaults in
`REUSE.toml`; nothing to add unless the showcase uses third-party material (then annotate it).

## 8. Hand over

Look at the whole page at 375, 768, 1280 and 1920 px wide, in both languages. Commit in
logical steps, push the branch, and ask the owner to review, with:

- the script (both languages) and why it shows what makes the project special;
- the contact sheets (screenshots) at both shapes and both languages;
- the layouts from `pnpm layout`;
- the number of images generated, and any text art that fell back to code text.
