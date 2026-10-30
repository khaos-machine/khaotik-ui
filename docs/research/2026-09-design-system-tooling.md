# Research — design-system tooling, multi-system, and the spec question

**Status: research. This proposes nothing and directs nothing.**
Recorded 2026-09-06 · explored 2026-09-05 with K

`khaotik-ui` serves the Khaos Machine design system, and its primary consumer is
`khaos-app`. **That focus is unchanged by anything in this document.** What
follows is what was measured while exploring whether the repository should also
become a tool for managing multiple design systems, and it is stored so the next
person exploring the same ground starts from measurements rather than from
scratch.

Three of the questions explored **dissolved on measurement** rather than being
answered. Those are the useful part.

---

## 1. The spec question, and why it dissolves

**Explored:** reviving a framework-agnostic JSON/YAML spec for tokens,
components and compositions, edited through a designer interface, with changes
expressed as deltas that drive an agent to move the artifact, followed by a
review agent given the spec diff and the solution.

**The idea is D18 verbatim** — *"Agents are the generators; the spec's job is to
be sufficient input for reliable agent output"* — and `AGENTS.md` records that
programme as retired (G78): *"this repo **is** the design→dev artifact, not an
intermediate description of it."*

Two things were genuinely new in the revived form and are worth keeping:

- **Deltas need only the change to be describable; a generator needs the spec to
  be complete.** That is strictly weaker and it is a different bet. (The
  register's corroborating 20–30% extractability figure cites
  `research/figma-extraction.md`, which **does not exist here** — the rows were
  migrated from `loswf/ucs` and the artifacts did not come with them. The
  argument does not depend on it.)
- **A description beside an implementation must be generative or gated**, or it
  is the defect class removed from four places on 2026-09-04: a docblock citing
  durations its payload never carried, a test comment naming the mutation it was
  green against, a plan asserting eight reds where four were green, and
  `check-catalog` reporting a clean `52/52` over an entry that could not
  evaluate.

**Why it dissolves: the portable format already exists and ships in the
library.** `components/svelte/lib/compose.js`:

> A composed document is JSON — a tree of layout nodes and component references
> with **token names for its dimensions** and **symbolic references for its
> data**.

> **WHAT IS DELIBERATELY NOT HERE: anything that resolves a slug to a COMPONENT,
> or a dataset id to ROWS.** Both are host questions… Baking either in would make
> a document mean "the catalog's scenes" rather than "the scenes", which is the
> difference between a portable format and a catalog file format.

It is pure — no bundler construct, no filesystem, no framework — because it is
evaluated in every consumer that imports it.

**And the layout vocabulary a spec would have had to invent is already there**,
with its rationale:

```js
layout: 'stack' | 'grid'   ·   gap   ·   padding   ·   align   ·   columns
spaceVar = (name) => `var(--spacing-${name})`
```

> a web target substitutes `var(--spacing-lg)`, and a target with no CSS at all
> substitutes its own scale from the same name. **A length in the document would
> have decided that for every platform at once.**

The prop model carries the same discipline: a scalar, `{ $data }` from the host,
`{ $prop }` from the enclosing document, and *"deliberately no fourth — a literal
array or object in a prop slot is invented data with no provenance."*

**Layer by layer, nothing is left for a spec to describe.** Tokens are already
generative (`tokens.json` → `tokens.css`). Compositions are already generative —
D67 and D72 decided the file **is** the component. Atoms are adopted rather than
specified (D41, D50), which is Andrew's own two-layer claim: differentiation
lives in tokens and composition, atoms are commoditisable.

**Follow D41 and no layer needs a spec.** What survives is one observation worth
carrying forward on its own: *a description that must be kept in agreement with
an implementation should be regenerated and gated, the way `.d.ts` already are
under D59, or it will rot.*

## 2. What Compose already is, and the one thing it is not

**It is WYSIWYG in the strict sense.** `compose.js`: *"Two surfaces render one:
`Composed.svelte`, which is what a consuming app mounts, and the catalog's
editor, which draws **the same tree** with selection chrome around every node."*
Not a preview — the same renderer, the same components, real captured data, a
real device frame. That is the expensive half and it is done.

**It has no direct manipulation.** 1,980 lines of editor, zero drag-and-drop —
and that was a decision with a recorded reason (`NodeView.svelte:165-173`):

> **CLICK TO INSERT, not drag and drop.** jsdom lays nothing out, so every drag
> affordance would be asserted against a fake of the thing being tested, while a
> caret click asserts against the document tree — the real artifact… every
> insertion being a `<button>` makes the editor keyboard-operable by construction.
>
> **Drag stays possible later as an accelerator over `insertNode`/`moveNode`.**

The operations already exist as pure functions — `insertNode`, `removeNode`,
`moveNode`, `setProp`, `setLayout`. Drag would be an input method over tested
semantics, not new behaviour.

**The design risk, if it is ever taken:** a composed document has **no
coordinates**. Direct manipulation can only mean *reorder* and *reparent* — never
drag-to-position, because there is nowhere to put a position. Figma is absolute
placement; this is a box model, and conflating them is how a builder ends up
emitting `left: 237px`.

**The constraint is a feature.** A resize handle here cannot produce `237px` — it
can only snap to the token scale. Direct manipulation would make the token
discipline tactile rather than a rule someone has to remember.

## 3. Multi-system — what a second consumer actually needs

`khaos-publisher` (KPublish) is already a second consumer. Measured 2026-09-05:

- pins `@khaos-machine/khaotik-ui` at a **bare SHA** (`99529f1`, `lib-0.15.0`-era), which
  is the anti-pattern `AGENTS.md` warns about;
- imports **all three token sheets** whole and **four components** of 52 — `Icon`,
  `StatusPill`, `KhaosLogo`, `EmptyState`;
- has **zero token overrides**, then hand-writes ~40 CSS rules in one `app.css`,
  including `.outcome[data-tone="error"|"success"]`, a hand-rolled
  `OutcomeBanner`, and a local `.eyebrow` while importing the `utilities.css`
  that ships one.

**So it is not a second design system.** It is this one's tokens, four atoms, and
a private component layer that has already begun to drift. Its own design QA
names *"warm-black surfaces, hairlines, off-white text, reserved yellow
actions"* — this kit's warm-gray and gold. **What differs is density**, not
palette: 44px buttons, 48px inputs, `clamp(3rem, 7vw, 7rem)` display type against
this kit's stated dense native type.

**Three measured blockers, none of which is a spec problem:**

| | Blocker | Measure |
| --- | --- | --- |
| **M1** | Tokens are read-only in the editor | `apps/catalog/src/editor/tokens.js` reads the scale out of the generated stylesheet so the picker cannot drift. Changing a token means hand-editing `tokens.json` and running a Python script. |
| **M2** | Components hard-code their own dimensions | **271 hard-coded px across 42 of 52 components** — `padding` 36, `gap` 28, `width` 28, `height` 27, `max-width` 14. Density is meant to be a token-set property and is not, so a changed token would not move it. |
| **M3** | One `:root` | No scoping, so two token sets cannot coexist in one document. |

**The interface between a system and a component is the semantic token
contract** — `--surface-*`, `--text-*`, `--border-*`, `--tone-*`, `--spacing-*`.
A component that only speaks that vocabulary is already system-agnostic. **M2 is
the measure of how far from that the kit is**, and closing it stands on its own
merit independent of whether a second system is ever built.

## 4. Canvas as a live, service-driven surface — experiment run

`loswf/loswf-discover` (Excalidraw, self-hosted, `discover.loswf.com`) was
examined as a designer surface. Read firsthand 2026-09-05; **this section could
not be verified by the workspace reviewer, because that repository is private and
outside the workspace boundary.**

Already in production there: `customData` as an element-level namespace opaque to
the backend, with `grounding` as a working precedent; **semantic-to-geometry
rendering, one way** (`renderSticky` produces elements from `{id, text,
grounding}` — shapes are produced from meaning, never the reverse); an MCP server
so an agent addresses a semantic id rather than a rectangle; live WebSocket
fan-out on a write *by an operator or an agent*; per-engagement scoped service
tokens with `provisionedBy` audit; and a tiered library adapter designed but not
built (personal → engagement → **brand**) behind a one-module seam.

**Experiment: render the workspace's ten submodules, move one by hand, re-render.**
Run offline against the real element shape (no credentials for the deployed
service). Rule under test: **the service owns existence and meaning; the operator
owns position.**

```
PASS  operator position survives      PASS  untouched node keeps place
PASS  service content updates         PASS  arrow bindings intact
PASS  operator sticky survives        PASS  element count stable
```

Three mutations, each redding exactly one assertion and nothing else: drop `x`/`y`
preservation, drop operator-authored elements, skip the content refresh. The rule
holds and the check is not vacuous.

**What it measured beyond the rule:**

- **Bindings are free.** `startBinding`/`endBinding` track elements by id and
  survive a move with no work.
- **Layout is not.** ~20 lines of layering had to be invented; Excalidraw has no
  placement engine. Same gap as M2 from the other end.
- **Only 4 of 7 real dependency edges are derivable.** `go.mod` and
  `package.json` give `khaos-app → khaotik-ui`, `khaos-manager → {khaos-custody,
  KSPD}`, `khaos-tui → KSPD`. The three that decide how the system behaves —
  khaotik-ui and khaos-app calling khaosd over HTTP, khaos-tools reading `.kspd`
  packages — are in no manifest. **The manifest graph is not the architecture.**
- **Size is a non-issue at this scale** — 17KB against DynamoDB's 400KB item
  ceiling.

**Constraint if this is ever pursued:** `@excalidraw/excalidraw` is React 18, and
**D50 is "no React"**. Not a conflict while the canvas is a separate app
exchanging documents; a conflict the moment anyone proposes embedding it in the
catalog.

## 5. Library survey — measured, not recalled

npm metadata pulled 2026-09-05.

| package | version | last publish | weekly | Svelte 5 |
| --- | --- | --- | ---: | --- |
| `colorjs.io` | 0.7.1 | 2026-07-24 | 8,546,302 | n/a |
| `culori` | 4.0.2 | 2026-04-03 | 1,947,513 | n/a |
| `svelte-dnd-action` | 0.9.79 | 2026-08-21 | 312,698 | peer `>=3.23 \| ^5` |
| `@xyflow/svelte` | 1.6.6 | 2026-09-01 | 292,314 | peer `^5.25` |
| `@thisux/sveltednd` | 0.8.0 | 2026-09-01 | 26,468 | peer `^5` |
| `svedit` | 0.14.0 | 2026-08-24 | 325 | peer `^5` — **alpha** |
| `svaro` | 0.0.0 | **2024-07-27** | 3 | WIP, 23 stars |

**No Svelte page builder is viable, and the reason is a model difference rather
than maturity.** Svaro (*"like Craft.js, Builder.io or Elementor, but a Svelte
library"*) is 23 stars and 3 downloads a week. Svelte Visual Builder is 30 stars,
embeds host components — and **stores px**, shipping its own `Container`/`Grid
Container` element set. Svedit is the closest conceptually (*"model your content
in JSON, render it with Svelte components, edit it directly in the layout"*, with
bidirectional DOM-selection sync) but is self-declared **alpha** and Chrome-first
— *"best in Chrome, Safari 26+"* — which is the wrong bet for a Tauri app running
in **WKWebView** on macOS.

**Every one of them stores lengths**, which is exactly the property `compose.js`
exists to refuse. There is nothing to adopt that would not cost the portability.

**Where the ecosystem does deliver:** colour. The kit uses `color-mix(in oklab,
…)` in 57 places across 27 components, and #79/#80 exist because contrast was
judged by eye. Any token editor must compute OKLCH and WCAG contrast at pick
time, and hand-rolling that is how a second generation of those issues arrives.

**Guardrail:** an editor dependency belongs in `apps/catalog`, never in the
library. The library has two runtime dependencies and every consumer pays for
both.

## 6. What is not verified

- **§4's discover claims** were read firsthand but could not be checked by any
  second party — private repository, outside the workspace boundary.
- **§1's 20–30% figure** cites a document that does not exist here.
- **Library figures in §5** are npm metadata, not an assessment of code quality
  or of how any of them behaves inside a Tauri WKWebView.
- Whether **khaos-tools 0.19.0 or 0.20.0** restores `parser query` — relevant to
  #123, and unmeasured.

## 7. What this changes in the repository

**Nothing.** `khaotik-ui` serves the Khaos Machine design system for `khaos-app`.
No decision row, no version, no export, no gate is affected by this document.

Three findings here are ordinary defect work that stands on its own merit and
would be worth doing whether or not any of the above is ever pursued:

- **M2** — 271 hard-coded px across 42 of 52 components, which is why density is
  not currently a token-set property.
- **M1** — tokens cannot be edited in the catalog.
- The **D8 mis-citation** in `apps/catalog/src/editor/published.js` (the
  composed-artifact rule is D67 and D72), fixed in #125 while writing this.
