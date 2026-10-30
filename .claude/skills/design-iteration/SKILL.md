---
name: design-iteration
description: >
  Where a design change belongs in khaotik-ui — token, atom, composition or
  screen — how to decide, the non-negotiables it has to satisfy, and how to see
  it rendered.
---

# Where does my change go?

Four rungs, and the repo really is built this way. Put a change on the wrong
rung and it either does not propagate (a value hard-coded in one component) or
it propagates too far (a screen's layout decision baked into an atom).

## The ladder

**1. A token** — a value. `tokens/tokens.json` is the source of truth,
`tokens/tokens.css` is generated from it and must never be hand-edited. That
rung has its own skill: **read `.claude/skills/tokens/SKILL.md`** before
touching anything under `tokens/`.

**2. An atom** — one reusable element, no knowledge of what surrounds it.
`components/svelte/Icon.svelte` is the floor: 13 lines, two props, renders one
Phosphor glyph and nothing else. `StatusPill.svelte` is a `<span>` plus a
`data-tone` attribute mapping seven tones onto `--tone-*`. `SelectableRow.svelte`
is the largest atom and still qualifies — it is *one row button*, and everything
variable (title, subtitle, icon, thumbnail, trailing slot) arrives as a prop.
Atoms import at most other atoms: `SelectableRow` imports `Icon` and `Portrait`
(`SelectableRow.svelte:2-3`) and nothing else.

**3. A composition** — arranges atoms into a named surface, still fully
props-driven. `TakeList.svelte` imports four atoms — `AudioPlayback`, `Icon`,
`RenderMark`, `StatusPill` (`TakeList.svelte:15-18`) — and lays out one line's
voice takes, but it holds **no selection state** and decides nothing: `onDelete`
"confirms nothing — confirming is the app's" (`:43`). A composition renders what
it is given.

**4. A screen** — a whole surface, and the rung where **state** appears.
`VoiceStudio.svelte` is the clearest specimen: it composes ten kit components,
including `TakeList` and three voice panels (`VoiceStudio.svelte:22-30`), and it
owns its working state — the active tab, the draft name and traits
(`:156-160`). What it does not own it reports: a provider choice goes out through
`onHostedChoice` because the "host owns selection" (`:89`). `WelcomeWindow.svelte`
and `Settings.svelte` are the other shapes: a front door and a rail-plus-pane,
both forwarding every interaction outward as a callback.

## Deciding

- Does the change alter a **value that appears in more than one place** — a
  colour, a spacing, a radius, a type size? → **token.** If you are typing a hex
  or a pixel number into a component, stop.
- Is it **one element a caller would reach for by name**? → **atom.**
- Does it **arrange existing atoms** into a recognisable surface, with no state
  of its own? → **composition.**
- Does it hold **selection or view state**, or wire callbacks between two
  compositions? → **screen.**

The reliable tell between 3 and 4 is `$state`. Compositions do not have it;
screens do. If you find yourself adding `$state` to an inspector, the change
belongs one rung up — pass the value in as a prop and let the screen own it.

The second tell is imports: an atom imports atoms, a composition imports atoms,
a screen imports compositions. An import that runs *down* the ladder is fine; one
that runs sideways into app data never is.

## The non-negotiables

**Semantic tokens only, never raw values.** Read `SelectableRow.svelte:47-134`:
every colour is `var(--text-primary)` / `var(--text-secondary)` /
`var(--border-default)`, every gap is `var(--spacing-*)`, the corner is
`var(--radius-sm)`. There is not one hex in the file. Semantic tokens flip with
the theme; primitives (`--gold-400`) do not, so a component that reaches for a
primitive looks correct in dark and wrong in light
(`apps/catalog/AGENTS.md:52-55`).

**The D52 accessibility encoding.** A plain `div` container, sibling buttons, and
`aria-hidden="true"` on the visual text — never a `<title>` element
(`AGENTS.md`, "Conventions"; the full form is `apps/catalog/AGENTS.md:63-71`).
`SelectableRow` is the canonical implementation: the `<button>` carries
`aria-label={title}` and every inner span is `aria-hidden`
(`SelectableRow.svelte:18-42`). Note what D52 does **not** excuse — the same file
adds `aria-current` for the selected state, with a comment explaining that D52
"covers naming the row and hiding its inner text; it does not excuse dropping
state" (`:12-17`).

**Ark UI is adopted, not authored.** `Menu.svelte:2-9` and
`SegmentedControl.svelte:2-5` both open with the same declaration — "adopted, not
authored (D39, D50, P3)" — and both enumerate what comes from the primitive:
focus trap, Escape, roving arrow keys, typeahead, radio semantics, the moving
indicator. Our job is the dressing. Do not re-implement behaviour a primitive
already has, and do not add a hand-rolled version of a component Ark ships.
(`SegmentedControl.svelte:7-10` even records *why* Segment Group and not Tabs — a
segmented control selects a value, it does not reveal a panel.)

**Every export needs a catalog fixture and a documented prop table.**
`npm run check-catalog` fails if anything in `components/svelte/index.js` has no
entry in `apps/catalog/src/fixtures.js`, and `npm run check-taxonomy` fails if
that entry is filed in a group the registry never declared. This is not
bureaucracy: the catalog is the library's only component surface (D61), so an
export missing from it cannot be playtested at all.

The prop documentation is the JSDoc `Props` typedef on the component, which
`npm run build-types` compiles into the shipped `.d.ts` — see
`components/svelte/StatusPill.svelte` for the house form. Adding an atom is the
component, its fixture, and its prop table.

## Seeing the change

```bash
cd apps/catalog && npm run dev     # every component against real data
```

The catalog is the loop. It is where you check a composition against **real**
data — real names, real counts, real empty states — which is where layout
assumptions usually break, and it toggles the theme from its own app shell.

## The real-data rule

The catalog's demo data is fetched from the live khaosd daemon and committed;
regenerate it with `apps/catalog/scripts/fetch-all.sh`. The rule from `AGENTS.md`
is absolute: **real data, never fabricated** — "gaps are reported, not papered
over." `apps/catalog/AGENTS.md:110-112` states it as a data-integrity rule with
a live example: `coverage.json`'s `logline` is currently empty, and that is
recorded as "a real gap, not a fabricated value."

When a design needs something the tokens or the data do not provide, route it
rather than invent it. `docs/harvest-khaos-machine-tokens.md` is the established
form: dated, addressed ("**For:** Andrew (BrandKit direction)"), sourced, split
into what maps cleanly and what needs a definition before the catalog can render
faithfully. `StatusPill.svelte:30-34` shows the other half of the loop — the
`info`, `accent` and `skipped` tones are marked in the code as BrandKit gaps,
pointing at that document, falling back to raw palette *until Andrew defines
them*. A gap with a name and a pointer is honest; a gap filled with a guess is
not.

## Worked example — `.eyebrow` and `.surface` climbing a rung

A real change, and it moved **down** the ladder rather than up.

`SectionHeader`, `LabeledPill`, `MetaStrip` and `ResourceCatalog` all render
`class="eyebrow"` themselves — see `SectionHeader.svelte:17`. But the rule defining `.eyebrow` lived only in
`apps/catalog/src/app.css`, which the package does not export. So the catalog was
the one surface where the design system looked right, while the then-published
Storybook and every external consumer rendered every eyebrow as plain body text.

The fix was to move both classes into `tokens/utilities.css`, which ships with
the kit — the file's own header records the whole reasoning, including the
closing line worth remembering: "Shipping a component that references a rule you
do not ship is a bug report waiting to happen."

The lesson generalises. Ask not just *which rung is this change on* but *does
everything it depends on ship from the same place*. A component is only as
portable as the rules it references. Consumers now import three stylesheets, all
required (`README.md:36-48`).
