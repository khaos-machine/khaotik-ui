---
name: tokens
description: Change the Khaos design tokens — colour, space, radius, size, font, type — in khaotik-ui. Covers what is editable versus generated, the primitive/semantic split, how a change reaches the components, and the rule that a missing token is reported rather than invented.
---

The tokens are the design. Components state no raw colour and no raw size — they
reference semantic variables, so a palette or density change is **one edit here**
and everything follows: the desktop catalog and every Khaos app that imports the
library.

## The one rule that matters most

**`tokens/tokens.css` is generated. Never edit it.**

Its own header says so, and the next build silently reverses anything you write
there. The source is `tokens/tokens.json`:

```
tokens/tokens.json          ← edit this. Hand-maintained, the source of truth.
   │  python3 tokens/build-tokens.py
tokens/tokens.css           ← generated. Never edit. 
```

Two files beside it are hand-authored and *are* yours to edit:

- `tokens/tokens-extra.css` — the seven-way `--tone-*` StatusTone bridge.
- `tokens/utilities.css` — `.eyebrow` and `.surface`, the two classes the atoms
  render themselves. These ship with the kit; when they lived in the catalog app
  instead, every eyebrow rendered as plain body text in the then-published
  Storybook and in every consumer.

And one reads the output back: `tokens/parse.js` parses `tokens.css` so the
palette screens can document the tokens. That is deliberate — the screen and the
documentation of the screen cannot disagree if both come from the same file.

## The shape of tokens.json

Four blocks. `primitive` and `semantic` are the ones you will work in.

```
primitive    color · space · radius · size · font · type
semantic     dark · light
compat       legacy names kept alive
derived      values computed from the others
```

**Primitive** is named for what a value *is* — `color.warm.950`, `space.md`. A
value appears exactly once. **Semantic** is named for what a value *does*, and
points at a primitive by reference:

```json
"dark": {
  "surface-base":   "{color.warm.950}",
  "surface-raised": "{color.warm.800}",
  "text-primary":   "{color.warm.50}"
}
```

Two tiers, not three — and the split is **mode-dependent vs mode-invariant**,
not colour vs non-colour. A semantic layer exists because colour changes with
theme. Spacing and radius do not, so they need no semantic indirection and live
only as primitives. That distinction is D46/D49 in `docs/decisions.md`, and
getting it backwards is a mistake this project has already made once.

## Making a change

```bash
python3 tokens/build-tokens.py      # tokens.json -> tokens.css
cd apps/catalog && npm run dev      # see it — the BrandKit screens and the real compositions
```

`build-tokens.py` fails loudly rather than emitting something wrong: a missing
file, invalid JSON (with line and column), a missing top-level block, or a
dangling `{...}` reference all raise before anything is written. **If it throws,
nothing was generated — fix the input rather than the output.**

To change a colour everywhere it is used, edit the *primitive*. To change what a
role means — make raised surfaces lighter, say — repoint the *semantic* entry at
a different primitive. Editing a semantic value to a literal colour is the wrong
move; it breaks the one-value-one-place property the file is built on.

## Verifying

```bash
cd apps/catalog && npm test    # includes token parsing + a per-theme check
npm run check-compile          # the catalog's build — it imports all 46 exports
npm run check-coverage         # every export still playable and correctly filed
```

The token tests are not decorative. They assert the light block actually
overrides the dark one, that no category parses empty, and that the families the
parser finds match what `tokens.css` declares. That last one exists because a
hardcoded family list once drifted from the palette and crashed the published
BrandKit — see `apps/catalog/src/story-tokens.test.js`.

## When a token you need does not exist

**Report it. Do not invent it.** `AGENTS.md` is explicit: gaps are reported, not
papered over, and no token is fabricated.

The established form is `docs/harvest-khaos-machine-tokens.md` — a numbered list
of what the design needs and the BrandKit does not yet define, with the reason.
A real entry from it: the relationship graph's edge label needs a step below
`--caption-size` (11px) to read as subordinate to the node name. There is no such
step, so the graph held a literal `10px` with a comment saying
why, and the gap is recorded rather than smoothed over by inventing a
`--label-xs`.

That is the pattern: use the honest literal, comment it at the call site, and add
the row. A fabricated token is worse than a documented gap, because nobody can
tell it was invented.

## Whose decision is which

`docs/decisions.md` records this. Brand and token decisions are **Andrew's**
(CPO, Product Design and Experience) — the warm-gray Quiet-Pro palette, the
weight ramp, the numeral treatment. His own register uses the hyphenated
`D-00N` form and lives in the khaotik-3 BrandKit; this repo's register uses
`D1`…`D58` unhyphenated. They are different documents; do not conflate them.

Architecture and format decisions are K's. If a change would alter what a token
*means* rather than what it *is*, it wants a decision row, not just an edit.

## Reference

- `tokens/tokens.json` — the source, with its reasoning in `$description` blocks
- `tokens/build-tokens.py` — the generator and its guards
- `docs/tokens-to-ui.md` — the chain from a value to a rendered component
- `docs/harvest-khaos-machine-tokens.md` — the open gaps
- `docs/decisions.md` — D44 (BrandKit adopted), D49 (migrate it whole), D53–D57
