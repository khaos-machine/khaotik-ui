# Plan — khaotik-ui#56: `MetaStrip`, `.note`, `.visually-hidden`, and a discovery surface for utilities

Revision 3, the **second committed** revision — supersedes `da3ce58`. (An
intermediate draft was written but never committed, so "rev 2" is not resolvable
from git; the numbering is kept only because `b8690cf` already used it.)
Folds in red-team (4 Critical, 5 Major, 4 Minor), the designer's rulings on C4,
M2 and M4, and plan-review's G1–G4.
Scope: khaotik-ui only. khaos-app adopts afterwards (issue #56, "Meanwhile").
Design ruling: taken by the designer, not reopened. Citation audit in §9.

**Every red-team finding was re-verified against the tree before adoption.**
All four Criticals hold. §10 records what I found that changes their remedies.

**C4, M2 and M4 have been ruled on by the designer and are folded in.** Nothing
is blocked. The designer's citations were re-verified — including the WCAG
table, which reproduces to the hundredth on all eight cells (§9).

---

## 1. Scope call: SPLIT INTO TWO, not three

Red-team recommended three. I am splitting into **two plans, one PR each**, and
the third slice does not exist. Sequencing is mine; here is the reasoning.

**Plan A — the utilities (ships first, alone).**
`.note`, `.visually-hidden`, the `parse.js` roster export (with `kind`), the
Type screen Utilities section, the docs table, the guard fix. Steps A0–A8.

**Plan B — the atom (ships second).**
`MetaStrip` + fixture + barrel + generated `.d.ts` + the visual-contract
assertion + **D63** + the D57 harvest gap item + the drift-migration follow-up.
Steps B0–B8.

**Why the record is NOT a third plan.** Red-team's slice (3) was "D63, the
harvest gap, the follow-up issue". A decision row with no code is not a
buildable unit, and a PR whose entire content is a table row is how a decision
ends up never written.

**Why D63 goes with B, not A.** Revision 2 put it in A on the grounds that a
decision is writeable before its implementation. The C4/M2/M4 rulings changed
the row's centre of gravity: D63 now carries `MetaStrip`'s prop shape, its
two-strips adoption instruction and its decided visual contract — three things
that are Plan B's substance. Writing a row that specifies an API before the API
exists puts an unbuilt contract on the record, which is the failure D59's
generated `.d.ts` exists to prevent in the type layer. The roster `kind` and
`.note` are A's, but a decision row is not split.

**No contingency (G4).** Revision 3 paired this rationale with an escape hatch
— "if B slips, D63 lands with A" — which is doing the very thing the rationale
calls harmful, and so cancels it. The split rests on the rationale alone: D63
ships with the code it specifies. If B is abandoned, #56 is not closed and the
row is not yet owed.

**Why A ships first and alone.** A's only relationship to B is that B renders
`.visually-hidden`. A→B is a one-way dependency and A has no knowledge of B.

---

## 2. Plan A — the utilities

### A. The failing tests

#### RA1 — `.note` and `.visually-hidden` do not ship

Verified absent: `grep -rn "visually-hidden\|sr-only\|\.note\b" tokens/ components/svelte/` → nothing.

**Test:** `apps/catalog/src/utilities.test.js`, new case, a **literal** expectation:

```
expect(roster.map(u => u.name)).toEqual(
  expect.arrayContaining(['eyebrow', 'surface', 'note', 'visually-hidden']))
```

Literal on purpose. The roster is parsed from `utilities.css` (§3), so a
roster-derived assertion cannot prove the sheet *gained* a class — it would be
true by construction. This is the one place a hardcoded list is correct, and it
is the only one.

#### RA2 — the guard cannot fail

**This is red-team's C2 and it is worse than I first wrote.** Two defects in
`apps/catalog/src/utilities.test.js:66-77`, both verified:

1. `:70` filters out every hyphenated class, so `visually-hidden` is invisible.
2. **`:71` computes `undefinedByKit` and nothing asserts it is empty.** `:75-76`
   are only `not.toContain('eyebrow')` and `not.toContain('surface')`. Removing
   the hyphen filter changes nothing — `visually-hidden` lands in the array and
   no assertion looks at it.

My revision-1 remedy ("re-base the guard on the roster") was **tautological** —
every roster member has a rule by construction. Withdrawn.

**The measured remedy.** A component-local block name in this kit's BEM-ish
scheme has `__` descendants; a shared utility does not. Measured over
`components/svelte/*.svelte` with the same regex as `:20`:

| | count |
| --- | --- |
| literal classes emitted | 366 |
| with no `__` in the name | 41 |
| of those, having a `block__…` sibling somewhere in the kit (component-local) | 37 |
| **orphans — no `__` descendant anywhere** | **4** |

The four orphans are `eyebrow`, `surface`, `pill`, `labeled-pill`. Two are the
real utilities; two are component-local blocks that happen to have no
descendants. So:

**RA2.1** — the assertion becomes

```
expect(orphansUndefinedByKit.sort()).toEqual(['labeled-pill', 'pill'])
```

A **2-name** allowlist, not red-team's 39, and asserted with `toEqual` so it
cannot silently grow: adding `visually-hidden` to it would fail the equality.
It fails in both directions — a utility dropped from the sheet becomes a third
orphan; a new bare class rendered without a rule becomes a third orphan; and if
`pill` ever gains a `pill__x` descendant it stops being an orphan and the
stale allowlist entry goes red.

I also tested a **zero-allowlist** variant — "every emitted class must be
styled in `utilities.css` or in its own component's `<style>`" — and **it does
not work**: 25 false positives, because classes are legitimately styled through
`:global()`, nested selectors, or a parent component (`ConfirmDialog`'s
`ui-confirm__backdrop`, `Toggle`'s `ui-toggle__thumb`, and 23 more). Recorded
so nobody re-proposes it.

**RA2.2 — the red, writeable after step A4.** Red-team is right that "a
component emits `visually-hidden` while the sheet omits it" is unwriteable once
the sheet defines it. `emittedClasses()` (`:23-32`) hardcodes `COMPONENTS` and
takes no parameter. **Step A2 refactors it to `emittedClasses(dir)`** — a
budgeted change, not a free one — and RA2.2 points it at a temp fixture
directory containing one `.svelte` emitting `class="not-a-real-utility"`,
asserting it appears as an orphan. That red is permanent and does not depend
on the sheet's contents.

**Known limitation, stated not claimed closed (m2, verified).** The guard reads
literal `class="…"` only (`:20`). `class:selected`, `class:unavailable`,
`class:catalog` and six more directives already exist in the kit and are
invisible to it, as is any `class={expr}`. RA2 does not close that and does not
claim to. The plan's own consequence: **`MetaStrip`'s numeric modifier must be
`__`-namespaced and styled locally** (§4), which puts it outside the utility
guard's remit correctly rather than by accident.

#### RA3 — the Type screen has no Utilities section

**`apps/catalog/src/components/brand/Type.test.js` ALREADY EXISTS** — 109
lines, 7 cases (red-team M1, verified; revision 1 called it new twice and would
have destroyed it, with nothing red, because `check-coverage` does not run
vitest). **Step A5 EXTENDS it. It is never created.**

**The roster carries a `kind` (M4, ruled), and `utilities.css` is where it is
declared.** Not a flat list. Each entry declares `kind: 'sample' | 'demo'`, and
RA3.2 asserts every roster class appears under **one of the two** — not that
each renders a visible specimen, which was the unstated assumption red-team
caught.

**The convention (G1 — revision 3 required `kind` and gave it no source).** The
sheet's leading comment gains a `@kind` annotation on its own line. No new
syntax is invented: this is the JSDoc idiom the kit already uses on all 46
components (D61), in the file's existing comment shape (`utilities.css:22-23`,
`:28`).

```css
/* Eyebrow: the uppercase caption that labels a section or metric.
   @kind sample */
.eyebrow { … }
```

`doc` is the comment with the `@kind` line removed; `kind` is its value.
**There is no default.** A missing or unrecognised annotation yields
`kind: undefined` and RA3.4 goes red, which is the point — a new utility cannot
land without choosing a treatment. The roster stays **one list**: the sheet
carries the class, the declarations, the prose *and* the treatment, so the
Type screen never becomes a second declaration site. That second site is
exactly the two-lists drift `parse.js:3-13` exists to prevent ("there is
exactly one").

**Step A4 annotates all four classes**, not just the two new ones — `.eyebrow`
and `.surface` need the annotation too or they parse with no `kind`.

| kind | classes | treatment |
| --- | --- | --- |
| `sample` | `.eyebrow`, `.surface`, `.note` | a rendered specimen plus copyable declarations, as the type scale does |
| `demo` | `.visually-hidden` | the declarations, a one-line statement of effect, and a demonstration of the class *working*: the line `Scene INT. KITCHEN` with `Scene` carrying the class, so the reader watches the word vanish, beside a caption naming what a screen reader hears |

Absence is the observable, and showing absence beats faking a sample. The
distinction also future-proofs the roster: any non-visual utility
(focus-management, motion-preference) has a declared home rather than forcing
an exception later.

**RA3.1** — source-read on `Type.svelte`: it imports the roster and iterates it;
no hardcoded class list on the screen.
**RA3.2** — source-read, **not rendered** (M4, and the same blindness
`utilities.test.js:6-15` names): every roster entry appears on the screen under
its declared `kind`, with its declarations rendered. A rendered assertion here
passes whether or not the sample is styled, since jsdom resolves no stylesheets.
**RA3.3** — rendered: one copy `button` per roster entry.
**RA3.4** — every roster entry's `kind` is one of the two declared values, so a
new utility cannot be added without choosing a treatment.

**Constraint the existing file imposes (M1, verified).** The case is
`Type.test.js:104-108` and its two assertions are at **`:106-107`** —
`container.querySelectorAll('.swatch').length === 0` and `.radius__box`
likewise. (Plan-review cited `:105-106`; `:105` is the `render(Type)` line. The
constraint is unchanged.) It is **class-based, not "no colour anywhere"**, so a
Utilities section may show `.note`'s `color:` declaration — it must simply not
use the class names `.swatch` or `.radius__box`. Stated so a builder does not
guess. `:9`'s `getByRole('region', { name: /Khaotik Type/ })` and `:7`'s two
heading assertions must also survive; a third section is additive.

#### RA4 — the docs table is ungated

**RA4.1** — every roster class appears in a utilities table in
`docs/using-the-library.md` §2. Red today: no table exists. The doc names the
sheet's contents in a code comment (`:110`) and prose (`:113-119`) only.

This is what makes the roster **one list with three enforced consumers** — the
sheet, the Type screen, the docs — rather than three lists that drift.
`.eyebrow` was imported in khaos-app at `main.ts:10` *under a comment at `:8-9`
saying it is not optional polish*, and was still reinvented six times in that
same app. A utility without an enforced discovery surface repeats that.

#### RA5 — both-theme coverage

**Revision 1's automated assertion was vacuous and is DELETED.** Red-team's C3
is verified at `tokens/parse.js:110-113`:

```js
const themeMaps = {
  dark:  new Map([...baseDecls, ...darkDecls]),
  light: new Map([...baseDecls, ...darkDecls, ...lightDecls]),
}
```

`light` is constructed as a **superset** of `dark`, so "declared in both"
degenerates to "declared at all" and catches only a typo'd token name.

**RA5.1 — the predicate, stated (G2).** This gate has now failed review three
times, each time for an unstated predicate rather than a wrong idea. So the
predicate is written out, and it was **measured before being written**.

*What was wrong.* Revision 3 scoped the rule ("for tokens that are
theme-dependent") but named an unexecutable mechanism — `lightRegion` is
module-local at `parse.js:82`, `lightDecls` at `:105`, and neither is exported.
Revision 4 fixed the mechanism and **dropped the scoping clause with it**. The
result reds on correct input: `.eyebrow` has six declarations
(`utilities.css:29-36`) and four reference type tokens that are mode-invariant
**by design** — `parse.js:33-38` says the scale tiers "are declared once and
mean the same thing in both modes", and the light block (`tokens.css:227-250`)
declares no `--caption-*` or `--body-md-*` at all. Requiring them to flip is
requiring the kit to be something it deliberately is not.

*The predicate.* Scope by **property**, not by symmetric differ/identical:

> Build the **overridden set** — token names whose `resolved` value differs
> between `byTheme.dark.all` and `byTheme.light.all` (`parse.js:209-212`,
> exported; entries carry `{name, value, resolved}` via `entriesFrom` at
> `:146-149`). Then, for each roster declaration whose **property is
> colour-bearing** (`color`, `background`, `background-color`, `border*`,
> `outline*`, `fill`, `stroke`, `box-shadow`, `text-decoration-color`):
> its value must be a `var(--x)` reference **and** `--x` must be in the
> overridden set. Every non-colour-bearing property is out of scope and
> asserted on not at all.

*Measured, replicating `parse.js`'s region/declaration/resolve logic against the
real sheets.* The overridden set is **44 tokens**. (`--text-secondary` is
declared at `tokens.css:168` in the dark/`:root` block and `:231` under
`html[data-theme="light"]` — revision 4's prose said `:167`, which is
`--text-primary`. Corrected; it never reached the D63 row.)

| class | declaration | result |
| --- | --- | --- |
| `.surface` | `background: var(--surface-raised)` | pass — `#201f1e` / `#f5f4f2` |
| `.eyebrow` | `color: var(--text-secondary)` | pass — `#a9a7a4` / `#4a4845` |
| `.eyebrow` | the four type refs + `text-transform` | out of scope, **not asserted** |
| `.note` (planned) | `color: var(--text-secondary)` | pass |
| `.note` | `margin`, `font-size`, `line-height` | out of scope |
| `.visually-hidden` (planned) | all five declarations | out of scope — no colour, so the gate is silent, correctly |
| **synthetic** `color: var(--warm-500)` | | **RED** — resolves `#4a4845` in both |
| **synthetic** `color: #4a4845` | | **RED** — a colour that is not a token ref cannot flip |

*Why not plan-review's supplied shape.* It proposed a bidirectional rule — a
declaration referencing an overridden token must differ, one referencing a
mode-invariant token must resolve identically. The first clause is right. **The
second does not red the true positive it is offered for:** `--warm-500` *is*
mode-invariant and *does* resolve identically, so a `.note` pinned to it
**passes**. Scoping by property instead reds it, and additionally catches a raw
hex colour, which the bidirectional form does not consider. Same intent,
working predicate.

**No fallback.** Revision 3's "if it cannot be made to fail, delete it and
declare the coverage manual" is **removed** — the gate is buildable with the
exports on hand, and an escape hatch that invites deleting a gate is how the
vacuous version survived in the first place.

**RA5.2 — eyes, and it is a deliverable.** `cd apps/catalog && npm run dev`,
BrandKit → Type → Utilities, toggle the theme (`App.svelte:57-59` writes
`data-theme` on `<html>`, as `components/brand/Color.test.js:85` records).
Capture both.

### A. Ordered steps

| # | Step | Verified by |
| --- | --- | --- |
| A0 | **Read `scripts/check-consumer.mjs:73-98` and `:106-126` before writing anything.** Not a precondition to test — a mechanism to understand. See §3. | comprehension; no command |
| A1 | Write RA1, RA3, RA4, RA5.1 (red) | `cd apps/catalog && npm test` shows them failing |
| A2 | Refactor `emittedClasses()` → `emittedClasses(dir)` (`utilities.test.js:23-32`); write RA2.1 + RA2.2 (red) | the orphan assertion fails on `visually-hidden` |
| A3 | Add the `utilities` export to `tokens/parse.js` — parse `./utilities.css?raw` into `{ name, doc, kind, declarations }`, `kind` from the `@kind` annotation (§2), **no default**. Also update the `VITE_ONLY` reason string at `check-consumer.mjs:87-88` to name both raw imports — **required by honesty, not by the gate**: `:124-126` checks the entry's presence, never its text, so a stale reason would pass silently | `npm run check-consumer` |
| A4 | Add `.note` and `.visually-hidden` to `tokens/utilities.css`, each with a leading prose comment in the existing house shape (`:22-23`, `:28`). **Add the `@kind` line to all four classes** — `.eyebrow` and `.surface` included, or they parse with no `kind` | RA1, RA2.1, RA3.4 green |
| A5 | **Extend** `Type.svelte` with the Utilities section and **extend** `Type.test.js`. Obey `catalog-type.test.js` (§6) and avoid `.swatch`/`.radius__box` | RA3 green; the 7 existing cases still green |
| A6 | Add the utilities table to `docs/using-the-library.md` §2 | RA4 green |
| A7 | *(D63 moved to Plan B, step B6 — see §1)* | — |
| A8 | Both-theme pass (RA5.2) | screenshots, both themes |

---

## 3. How the roster works, and why `check-consumer` is safe

**Revision 1's step 0 was wrong and its conditional was destructive. Both are
deleted.** Red-team's C1 is verified in full:

- `check-consumer.mjs:77-80` globs **every** `.js` in `tokens/` into `shippedJs`
- `:93-98` `await import()`s each one under bare Node
- `:86-89` names `tokens/parse.js` in `VITE_ONLY` with its reason
- `:124-126` **fails the gate if that entry ever goes stale** ("is listed in
  VITE_ONLY but evaluates fine — the entry is stale, remove it")

So the gate does **not** skip `parse.js`; it asserts it is loaded **and**
unresolvable. Revision 1 asked a builder to confirm the opposite and, on
finding it false, to abandon the single-source design — a destructive
conditional built on a misread.

**Why a second `?raw` import is safe, stated as the mechanism rather than
assumed:** bare Node strips the `?raw` query, resolves the real `.css` file,
and throws `ERR_UNKNOWN_FILE_EXTENSION`, which is in the LOUD set at `:106-110`
→ classified `unresolvable` → allowed by the `VITE_ONLY` entry. The **first**
static import already fails at load, so a second changes nothing. The only
required edit is the reason string at `:87-88`, which currently names
`./tokens.css?raw` alone and would otherwise be stale prose.

**The design.** `tokens/utilities.css` is hand-authored and already writes a
prose comment above each rule (`:22-23`, `:28`). The sheet therefore carries
the class name, the declarations, **and** the one-line explanation. `parse.js`
— "THE parser… there is exactly one" (`parse.js:3-13`) — gains:

```
utilities → [{ name: 'eyebrow',
               doc:  'the uppercase caption that labels a section or metric',
               kind: 'sample',          // from the `@kind` annotation; no default
               declarations: [{ prop: 'font-size', value: 'var(--caption-size)' }, …] }, …]
```

Nothing declares the roster twice — the treatment (`kind`) is annotated in the
sheet beside the rule it applies to (§2), so the Type screen never becomes a
second declaration site.

---

## 4. Plan B — the atom

### The decided visual contract (M2)

The four observed drift sites disagree 3–2 (`--text-tertiary` at
`ProjectCard.svelte:351`, `RequirementList.svelte:213`,
`ServiceStatusList.svelte:269`; `--text-secondary` at `VoiceProfileCard.svelte:164`
and, in the consumer, `Player.svelte:480`). **The designer ruled a vote the
wrong instrument** and decided on contrast instead, computing WCAG 2.x ratios
from the shipped primitives (`tokens/tokens.css:108-119`, `:165-169`, `:228-233`)
across all four real backgrounds:

| | dark/raised | dark/base | light/raised | light/base |
| --- | --- | --- | --- | --- |
| `--text-secondary` | 6.86 | 7.53 | 8.29 | 7.44 |
| `--text-tertiary` | **3.29** | **3.61** | 4.56 | **4.09** |

At 11px the bar is 4.5:1, so **`--text-tertiary` fails three of four surfaces.**
I recomputed all eight cells from the hex primitives and they reproduce to the
hundredth (§9).

```
run    display:flex; flex-wrap:wrap; align-items:center; gap: var(--spacing-sm)
item   display:inline-flex; align-items:center; gap: var(--spacing-2xs); min-width:0
type   font-size: var(--caption-size); line-height: var(--caption-line);
       font-weight: var(--caption-weight)      /* 400 — the value is not bolded */
color  color: var(--text-secondary)
icon   inherits — 1em, no size prop, no colour of its own
```

`min-width: 0` is now **in the contract**, which closes one of m4's gaps
(revision 2 recorded Player's as "exactly as ruled" while neither §2 nor D63
required it of `MetaStrip`).

**`--spacing-2xs` is 4px — exactly what Player's invented `--spacing-3xs` falls
back to (`Player.svelte:486`) — so no spacing token is owed.** Revision 2 listed
it among the phantom-token findings as though something were missing; it is
removed from the gap list. The phantom is the consumer's bug alone.

### The two-strips composition (C4)

The designer verified red-team's mechanism and **conceded the original
reasoning was wrong**: `.strip` is the flex container
(`khaos-app/src/ui/Player.svelte:472-481`) and `margin-left:auto` at `:490-493`
resolves inside the run `MetaStrip` would own. **The answer does not change;
its status does** — it is now a required adoption instruction rather than an
aside.

Why it holds on the mechanism: `margin-left:auto` on the last child does not
mean "this item is aligned differently" — in flex it means *the free space
belongs before this item*, i.e. it is a second run pinned to the opposite edge.
Confirmed by what it is: scene label and character name are metadata about the
content under the playhead; `formatTimecode(…)` is a continuously-updating
transport readout. Two kinds of thing, two runs. The markup expressed that with
an alignment hack because it had no vocabulary for two runs.

```svelte
<footer class="strip">
  <MetaStrip items={context} />
  <MetaStrip items={[{ text: `${elapsed} / ${total}`, label: 'Time', numeric: true }]} />
</footer>
```

`.strip` survives as the footer container, keeps the chrome that is genuinely
the surface's (`border-top`, padding), gains
`display:flex; justify-content:space-between; align-items:center; gap: var(--spacing-sm)`,
and **deletes** `.strip__item` (`:483-488`), `.strip__item--time` (`:490-493`)
and the run-level font-size/colour (`:479-480`). Net: three rules out, one
declaration in.

**Two costs, recorded not hidden:** wrap behaviour changes at narrow widths
(today all three items share one wrapping run; with two strips the timecode
wraps as a unit), and **Player must be looked at narrow before adoption is
called done**. The second strip is a one-item strip with no icon — legitimate,
because what it buys is the caption/colour/tabular contract that must not be
re-decided per surface.

**Rejected:** an alignment flag on `items` (`align:'end'`, `trailing:true`) — a
flag meaning "this item is not like the others" is a confession that it belongs
to a different run, so it encodes the wrong model *and* hands every future
consumer the escape hatch this issue exists to close. Also rejected: a
`trailing` snippet.

**This is an instruction, not a migration.** khaos-app is a peer repo and an
unconsented change; the instruction is written into D63 and nothing in either
plan edits it.

### The one-prop justification, replaced

Revision 2's basis ("one proven consumer plus two plausible ones") **rested on a
claim that just failed** and is withdrawn. New basis: **five observed instances
of the item shape, none needing a per-item property beyond
`{icon, label, text, numeric}`** — `Player.svelte:167-185`,
`ProjectCard.svelte:346-353`, `RequirementList.svelte:204-214`,
`ServiceStatusList.svelte:260-270`, `VoiceProfileCard.svelte:162-168`. Player's
apparent exception was never an item property; it was an un-named second run.

Citing the four in-library runs as evidence while not migrating them is the
honest position, and D63 states it that way rather than leaving the asymmetry
unremarked.

### B. The failing tests — `apps/catalog/src/components/MetaStrip.test.js` (new)

| # | Assertion | Proves |
| --- | --- | --- |
| RB1.1 | two items render both texts, in order | the run exists |
| RB1.2 | `icon: 'film-slate'` renders `i.ph-film-slate`; an item without renders no `i.ph` | `Icon` is opt-in per item |
| RB1.3 | `label: 'Scene'` renders that text inside `.visually-hidden`, and that element is **not** `aria-hidden` | **the a11y defect.** `Icon.svelte:29` is `aria-hidden="true"`, decorative by contract (`Icon.svelte:2-4`), so today's `<Icon/>{value}` announces a bare value with the icon carrying the whole meaning |
| RB1.4 | no `label` → no `.visually-hidden` element | optional, not synthesised |
| RB1.5 | **source-read**, and it must assert `font-variant-numeric: tabular-nums` **inside the rule the numeric modifier selects** — not merely that the string occurs in the file (M4, second half; the file-contains form is vacuous) | jsdom resolves no stylesheets |
| RB1.6 | `items: []` renders no run element | empty is empty |
| RB1.7 | **default** — `render(MetaStrip, {})` does not throw and renders nothing | m1, verified: `props-optionality.test.js:21-23` requires every prop to carry an explicit default, and `check-consumer.mjs:165-179` type-instantiates every export with `{}`. So `items = []` is **mandatory**, and RB1.6 tests the value while RB1.7 tests the default |
| RB1.8 | `min-width: 0` on the item rule (now in the contract) | source-read |
| RB1.9 | **the visual-contract assertion (M2's real complaint: nothing catches drift).** In `apps/catalog/src/token-refs.test.js`, whose shape and reasoning are at `:6-22`: `MetaStrip.svelte`'s `<style>` references `--caption-size`, `--caption-line`, `--text-secondary`, `--spacing-sm`, `--spacing-2xs`, and carries **no raw px and no colour literal** | that file proves every `var()` names a shipped token but would pass `--text-tertiary` happily — rendered assertions cannot see this at all |

### B. Ordered steps

| # | Step | Verified by |
| --- | --- | --- |
| B1 | Write RB1 (red) | fails at import |
| B2 | Author `components/svelte/MetaStrip.svelte` — Svelte 5 runes, `items = []` default (m1), JSDoc `Props` + `MetaItem` typedefs (D59: **the JSDoc is the API reference**), the §4 visual contract verbatim, numeric modifier `__`-namespaced and styled locally (RA2's m2 limitation), header comment naming D57 at the `tabular-nums` call site and naming the four deferred drift sites | RB1 green |
| B3 | Barrel export in `components/svelte/index.js`, `labels` neighbourhood (`:37-41`, under the `// Labels` comment at `:36`) | `npm run check-catalog` |
| B4 | Catalog fixture in `apps/catalog/src/fixtures.js`: `section: 'components', group: 'labels'` — both already declared (`:1393`, `:1408`, `:1409`), no taxonomy change needed. **Use icon names already in the inventory** (m4, §7). Include a **two-strips example** so the C4 composition is playtestable, not only described | `npm run check-taxonomy` |
| B5 | `npm run build-types`. **Generated, never hand-edited (D59)** | `npm run check-types` |
| B6 | Append **D63** to `docs/decisions.md` — **inserted after D62 at `:182`, NOT at the end of the table** (§8), carrying all seven designer deltas (§5) | `npm run check-coverage` |
| B7 | Add gap item **7** to `docs/harvest-khaos-machine-tokens.md` §"Gaps" — a **numbered list at `:50-81`, not a table** | review |
| B8 | File the drift-migration follow-up issue | issue URL in the PR body |

### The in-library drift — FOLLOW-UP, not this plan

The ruling asked for this call explicitly. **Follow-up issue**, unchanged from
revision 1 and re-verified: the four sites share no shape (see M2 above);
`VoiceProfileCard`'s is a truncating line, not a run, and `MetaStrip` declines
truncation policy by ruling; `MetaStrip`'s declared gaps (`--spacing-sm` run,
`--spacing-2xs` item — 4px, `tokens.css:122`) match **none** of the four, so
every migration is a rendered-output change to a shipped component. The issue's
stated harm is *consumers* forking, and shipping the atom closes that. The
deferral is named in `MetaStrip`'s header, in D63, and filed by step B7.

---

## 5. D63 — the row, with all seven designer deltas

Inserted after D62 at `docs/decisions.md:182`. Same 5-column shape.

> | D63 | **Three typographic patterns get three different answers: the metadata chip is an atom (`MetaStrip`), the in-pane sub-heading is already solved (`<h3 class="eyebrow">`), and the quiet note is a utility (`.note`)** | K, designer | 2026-08-22 | Issue #56 asked for the three to be *decided and documented* rather than left to each consumer. **(1) `MetaStrip`** — `components/svelte/MetaStrip.svelte`, section `components`, group `labels`, one prop `items: Array<MetaItem>` where `MetaItem = { text, icon?, label?, numeric? }`. `LabeledPill` is the near miss (stacked eyebrow + toned `StatusPill`); this is an inline icon+text run with no tone. `label` is not decoration: `Icon` is `aria-hidden` by contract (`Icon.svelte:29`, declared decorative at `:2-4`), so every hand-rolled `<Icon/>{value}` announces a bare value with the icon carrying the whole meaning — the atom fixes a real defect, it does not merely dedupe markup. **One prop is justified by five observed instances of the item shape, none needing a per-item property beyond `{icon, label, text, numeric}`** — `khaos-app/src/ui/Player.svelte:167-185`, `ProjectCard.svelte:346-353`, `RequirementList.svelte:204-214`, `ServiceStatusList.svelte:260-270`, `VoiceProfileCard.svelte:162-168`. **Player's apparent exception was never an item property.** `.strip__item--time`'s `margin-left:auto` (`Player.svelte:490-493`) resolves inside the flex container `.strip` (`:472-481`), and in flex that declaration does not mean "this item is aligned differently" — it means *the free space belongs before this item*, i.e. a second run pinned to the opposite edge. It is also two kinds of thing: scene label and character name are metadata about the content under the playhead; `formatTimecode(…)` is a continuously-updating transport readout. **So adoption composes two strips inside the existing footer** — `<footer class="strip"><MetaStrip items={context}/><MetaStrip items={[{text:`${elapsed} / ${total}`, label:'Time', numeric:true}]}/></footer>` — with `.strip` keeping the chrome that is genuinely the surface's (`border-top`, padding), gaining `justify-content:space-between`, and **deleting** `.strip__item` (`:483-488`), `.strip__item--time` (`:490-493`) and the run-level font-size/colour (`:479-480`). Three rules out, one declaration in. **Two costs, recorded not hidden:** wrap behaviour changes at narrow widths (the timecode now wraps as a unit), so Player must be looked at narrow before adoption is called done; and the second strip is a one-item strip with no icon — legitimate, because what it buys is the caption/colour/tabular contract that must not be re-decided per surface. **Rejected:** an alignment flag on `items` (`align:'end'`, `trailing:true`) — a flag meaning "this item is not like the others" is a confession that it belongs to a different run, so it encodes the wrong model *and* hands every future consumer the escape hatch this issue exists to close; and a `trailing` snippet, for the same reason. Also deliberately excluded: tone (that is `StatusPill`), eyebrow/stacking (that is `LabeledPill`), callbacks, chrome, and truncation policy. **The visual contract is decided on contrast, not on a vote.** The four in-library runs disagree 3–2 — `--text-tertiary` at `ProjectCard.svelte:351`, `RequirementList.svelte:213`, `ServiceStatusList.svelte:269`; `--text-secondary` at `VoiceProfileCard.svelte:164` — and a majority is the wrong instrument. WCAG 2.x ratios from the shipped primitives (`tokens/tokens.css:108-119`, `:165-169`, `:228-233`) on all four real backgrounds: `--text-secondary` 6.86 / 7.53 / 8.29 / 7.44, `--text-tertiary` 3.29 / 3.61 / 4.56 / 4.09 (dark-raised / dark-base / light-raised / light-base). At 11px the bar is 4.5:1, so **`--text-tertiary` fails three of the four.** The contract: run `display:flex; flex-wrap:wrap; align-items:center; gap:var(--spacing-sm)`; item `display:inline-flex; align-items:center; gap:var(--spacing-2xs); min-width:0`; type `--caption-size` / `--caption-line` / `--caption-weight` (400 — the value is not bolded); colour `--text-secondary`; the icon inherits at 1em with no size prop and no colour of its own. It is enforced by a source-read case in `apps/catalog/src/token-refs.test.js` (that file proves every `var()` names a shipped token but would pass `--text-tertiary` happily, and rendered assertions cannot see any of this). **No spacing token is owed:** `--spacing-2xs` is 4px, exactly what Player's invented `--spacing-3xs` falls back to (`Player.svelte:486`), so the phantom is the consumer's bug and not a kit gap. **(2) The sub-heading ships nothing.** It is `<h3 class="eyebrow">`; `.eyebrow` already ships (`tokens/utilities.css:29-36`) and was already in khaos-app's bundle — imported at `main.ts:10` **under a comment at `:8-9` explaining it is not optional polish** — while the pattern was reinvented **six** times in that same app across three letter-spacings and four weights (`Player.svelte:383-393`, `:420-426`, `:455-461`, `:496-503`, `:534-541`; `Activity.svelte:330-341`). `Player.svelte:194` and `:212` are already `<h3>`, so only the class was ever hand-rolled. The element stays the consumer's because heading level is document structure — the same reason `SectionHeader` fixes `h2` and says so (`SectionHeader.svelte:7`). A `SubHeader` atom is **rejected**: a second implementation of the pane-top eyebrow is exactly what would let the two diverge. **(3) `.note`** is a utility in `tokens/utilities.css` at `--body-md`, not `--caption`, because the kit's existing answer for secondary supporting copy is `EmptyState`'s `.empty__desc` (`EmptyState.svelte:63-68`) and the note is its inline sibling. **This row decides what the kit's utility declares; whether khaos-app adopts it is a peer-repo change needing the operator's consent, and the ruling stands unchanged if it never does.** Recorded for whoever takes it: adoption would move `Player.svelte:505-509` **up** from 11px, and `Dashboard.svelte:437-440` and `Voices.svelte:132-138` **down** from a rendered 14px (they name `--body-sm-size` / `--font-size-sm`, neither of which the kit ships — the same phantom class `token-refs.test.js:16-18` already records as having shipped from the library itself). `.visually-hidden` ships alongside because `MetaStrip` requires it and the kit has no such class. **The discovery mechanism is part of the decision, not follow-up polish** — `.eyebrow` shipping app-wide *with a comment saying so* and being reinvented six times anyway is proof that a utility without a discovery surface repeats the failure it fixes. So: one roster parsed from `utilities.css` itself, each entry declaring `kind: 'sample' | 'demo'` via a `@kind` annotation in the rule's own leading comment — the JSDoc idiom the kit already uses on all 46 components (D61), with no default, so a utility cannot land without choosing a treatment and the sheet stays the single declaration site (`parse.js:3-13`); a Utilities section on the catalog's Type brand screen where `sample` classes (`.eyebrow`, `.surface`, `.note`) get a rendered specimen plus copyable declarations and `demo` classes (`.visually-hidden`) get their declarations, a one-line statement of effect, and a demonstration of the class working — the line `Scene INT. KITCHEN` with `Scene` carrying the class, so the reader watches the word vanish, beside a caption naming what a screen reader hears. **Absence is the observable, and showing absence beats faking a sample**; the `kind` split also gives any future non-visual utility a declared home rather than forcing an exception. The roster is asserted in both directions by `apps/catalog/src/utilities.test.js`, which previously hardcoded `['eyebrow','surface']` at `:36` and `:75-76`, **never asserted the offender list was empty**, and filtered out every hyphenated class at `:70` — so a new utility was unguarded from the day it landed and `.visually-hidden` would have been invisible to it by name. And a utilities table in `docs/using-the-library.md` §2. **No token is minted.** D57 decided two numeral tokens and they never landed — nothing in `tokens.json` matches `numer|figure|tabular` — so `MetaStrip`'s `numeric` item carries the honest `font-variant-numeric: tabular-nums` literal with D57 named at the call site, joining twenty existing call sites, and the gap is recorded in `docs/harvest-khaos-machine-tokens.md` rather than guessed at. **A second finding from the same contrast work is filed, not fixed here:** the three in-library runs at `--text-tertiary` + `--caption-size` are a live AA failure (3.29:1 on a dark raised pane) and have their own issue. **Deliberately not decided:** whether `.note` needs a tone variant (no call site asks for one), and whether `.eyebrow` should reference `--label-sm-*` (12px/600/0.06em) rather than `--caption-*` (11px/400/0) — the hand-rolled copies differ from `.eyebrow` precisely by weight and tracking, which is the shape of `--label-sm`, and that is Andrew's call. **Deliberately deferred:** migrating the four in-library runs (`ProjectCard.svelte:346-353`, `RequirementList.svelte:204-214`, `ServiceStatusList.svelte:260-270`, `VoiceProfileCard.svelte:162-168`) — they share no single shape, `MetaStrip`'s gaps match none of them, and `VoiceProfileCard`'s is a truncating line rather than a run, so migration is four visual changes to shipped components and belongs in its own issue. **Citing those four as the evidence for one prop while not migrating them is the honest position and is stated as such, not left unremarked.** **Reversal:** a consumer needs a per-item property genuinely about the item — its emphasis, its truncation, its interactivity — rather than about which run it belongs to. Container-level arrangement is never the trigger; that is what composing two strips is for |

---

## 6. Fixture data (real-data rule)

`MetaStrip`'s fixture is **content**, so **D62's illustrative exception does not
apply** — D62 scopes itself: *"A fixture that shows content — a screenplay, a
character, a voice — is still capture-or-report-the-gap"* (`decisions.md:182`).

Values come from the existing live captures under `apps/catalog/src/data/`.
Examples: **Populated** (scene label + character + elapsed time, `numeric: true`
on the time); **No icons** (text-only, proving `icon` optional); **Unlabelled**
(icon, no `label` — the shape the hand-rolled copies have, sitting next to the
labelled one so the a11y difference is visible). If the captures carry no
usable elapsed-time value, **report the gap** — do not fabricate one.

---

## 7. Gates a builder will trip that revision 1 did not name

**`apps/catalog/src/catalog-type.test.js` is a source-read gate over every
catalog `.svelte`, recursively (`:27-31`) — `components/brand/Type.svelte` is
in scope.** Revision 1 cited it only as jsdom precedent. It has **three**
`it.each(FILES)` cases, all of which step A5's new CSS must satisfy:

1. `:49-57` — no raw `font-size: <number>` outside a `.ph` rule
2. `:70-78` — **every `font-size: var(--…)` must be paired with a token
   `line-height`**; a numeric one or an omitted one both fail
3. `:85-92` — no `font-weight: <number>`; take it from a style

The kit's type tokens ship as quads, so a rule taking the size and inventing
the rest is half-converted and reads as converted.

---

## 8. Files touched

**Plan A**

| Path | Change |
| --- | --- |
| `tokens/utilities.css` | `.note`, `.visually-hidden` (hand-authored — correct home) |
| `tokens/parse.js` | `utilities` export — `{ name, doc, kind, declarations }` |
| `scripts/check-consumer.mjs` | `VITE_ONLY` reason string at `:87-88` |
| `apps/catalog/src/components/brand/Type.svelte` | Utilities section |
| `apps/catalog/src/components/brand/Type.test.js` | **EXTENDED — exists, 109 lines, 7 cases** |
| `apps/catalog/src/utilities.test.js` | roster, `emittedClasses(dir)` refactor, orphan guard, docs case, theme case |
| `docs/using-the-library.md` | utilities table in §2 |

**Plan B**

| Path | Change |
| --- | --- |
| `components/svelte/MetaStrip.svelte` | new |
| `components/svelte/MetaStrip.svelte.d.ts`, `index.d.ts` | **generated** by B5 |
| `components/svelte/index.js` | one barrel export |
| `apps/catalog/src/fixtures.js` | import + one registry entry, incl. the two-strips example |
| `apps/catalog/src/components/MetaStrip.test.js` | new |
| `apps/catalog/src/token-refs.test.js` | **EXTENDED** — the visual-contract case (RB1.9) |
| `docs/decisions.md` | D63 **inserted after `:182`** |
| `docs/harvest-khaos-machine-tokens.md` | gap item 7 |

**Explicitly NOT touched** — `tokens/tokens.css` and `tokens.json` (**no token
is minted**; D57's numerals are reported, not filled); the four drift
components; anything in the peer `khaos-app` checkout.

---

## 9. Citation audit, re-run against the tree

Revision 1 claimed things "hold exactly" that do not. Re-verified by reading,
not from notes.

**Corrected from revision 1**

- **`docs/decisions.md:182` is NOT the last row** (red-team M3, verified). `:183-189` are D41, D37, D38, D36, D34, D35, D32 — migrated legacy rows in descending order; the table ends at `:189` and `---` follows at `:191`. Revision 1 filed this under "Holds exactly", which it does not. **D63 is inserted immediately after D62 at `:182`**, where the sequential D58→D62 run ends, **not appended at the table's end**, which would file it among the legacy rows.
- **`apps/catalog/src/components/brand/Type.test.js` exists** (M1). Revision 1 called it new in two places.
- **`utilities.test.js`'s guard never asserts emptiness** — the hyphen filter at `:70` was only half the defect.
- **`scripts/check-consumer.mjs` does load `parse.js`** — revision 1's step 0 asserted the opposite.
- **`tokens/parse.js:110-113` builds `light` as a superset of `dark`** — revision 1's both-theme gate was vacuous.

**Holds exactly (re-verified)**

`Icon.svelte:29` (`aria-hidden="true"`; the decorative-by-contract note is at
`:2-4`, not `:3-4`) · `tokens/utilities.css:29-36` · `SectionHeader.svelte:7` ·
`EmptyState.svelte:63-68` · `utilities.test.js:36` and `:75-76` ·
`decisions.md:177` (D57) · `tokens/tokens.css:231` · `:146` (`--body-md-*`) ·
`:145` (`--label-sm-*`, 12px/16px/600/**0.06em**) vs `:147` (`--caption-*`,
11px/400/**0**) · `ProjectCard.svelte:346-353`, `RequirementList.svelte:204-208`,
`ServiceStatusList.svelte:260-264`, `VoiceProfileCard.svelte:162-168` ·
`fixtures.js:1393`, `:1408`, `:1409` · token gap confirmed
(`grep -niE "numer|figure|tabular" tokens/tokens.json` → nothing; **20**
`tabular-nums` call sites in the kit, not 2).

**Ruling citations that do not hold** (substance holds in every case)

1. `Type.svelte:26-46` is the **font-family** section; the type scale's copy affordance is `:50-76`, helper at `:20-24`.
2. `using-the-library.md`'s import block is `:107-111`, not `:110-119` (`:113-119` is the prose after it).
3. ~~"all `--text-tertiary`" is true only of `ProjectCard.svelte:346-353`~~ — **superseded by the designer's M2 ruling**, which widened the ranges to `RequirementList.svelte:204-214` and `ServiceStatusList.svelte:260-270`. At those ranges the colour is present on the child (`:213`, `:269`), both `--text-tertiary`, verified. My narrower ranges cut it off. The 3–2 split the ruling reports is correct.
4. `harvest-khaos-machine-tokens.md` has no table — `:50-81` is a numbered list, so the D57 note is item **7**.

**Designer citations, re-verified for this revision**

- `tokens/tokens.css:108-119` (the `--warm-*` ladder), `:165-169` (dark semantics), `:228-233` (light semantics) — all hold.
- **The WCAG table reproduces exactly.** Recomputed from the hex primitives with the sRGB relative-luminance formula: secondary 6.86 / 7.53 / 8.29 / 7.44, tertiary 3.29 / 3.61 / 4.56 / 4.09. All eight cells match to the hundredth.
- `ProjectCard.svelte:351`, `RequirementList.svelte:213`, `ServiceStatusList.svelte:269` are `color: var(--text-tertiary)`; `VoiceProfileCard.svelte:164` and `Player.svelte:480` are `--text-secondary`. The 3–2 split holds.
- `apps/catalog/src/token-refs.test.js` exists, and its reasoning at `:6-22` is the right shape to extend. It independently corroborates the phantom-token finding: `:16-18` records `--body-sm-size` as a tier that does not exist, shipped from **the library itself** in Settings, Toggle and StoryPlayer — one of them signed and notarized in 0.11.0.
- `--spacing-2xs:4px` (`tokens.css:122`) — so the ruling is right that no spacing token is owed, and the earlier listing of `--spacing-3xs` among the gaps is **withdrawn**.

**Consumer citations (peer checkout, read-only, nothing touched)**

`main.ts:10` imports `utilities.css` under a comment at `:8-9` saying it is not
optional polish — and the pattern was still reinvented **six** times in that app
(`Player.svelte:383-393`, `:420-426`, `:455-461`, `:496-503`, `:534-541`;
`Activity.svelte:330-341`), across three letter-spacings and four weights. Not
three, as the ruling says. `Player.svelte:194` and `:212` are already `<h3>`,
so the ruling's `<h3 class="eyebrow">` is the element the consumer already
chose. `.strip` `:472-481` and `.strip__item` `:483-488` (with `min-width: 0`)
hold; `border-top` at `:478` and `margin-left:auto` at `:491` are correctly
excluded as the surface's own layout.

**Two consumer findings that change what adoption should expect**

- **Phantom tokens — the consumer's bug, not a kit gap.** `Player.svelte:486` uses `var(--spacing-3xs, 0.25rem)`; the kit ships `--spacing-2xs:4px` and **no `--spacing-3xs`**. The fallback *is* 4px, so the contract's `--spacing-2xs` reproduces the render exactly and **no spacing token is owed** (M2, ruled). Same class: `--space-*` vs the kit's `--spacing-*`.
- **`.note` at `--body-md` is a real visual change.** `Player.svelte:505-509` is `--caption-size` (11px); five others (`Activity.svelte:268-275`, `Dashboard.svelte:437-440`, `Resources.svelte:112-118`, `Settings.svelte:348-354`, `Voices.svelte:132-138`) name `--body-sm-size` or `--font-size-sm`, **neither shipped**, rendering a 14px fallback. Six copies, three sizes, none a kit token. D63 records this so khaos-app does not discover it.

---

## 10. Red-team findings: disposition

| # | Verdict | Disposition |
| --- | --- | --- |
| C1 | **Holds.** `check-consumer.mjs:77-80`, `:86-89`, `:93-98`, `:124-126` all confirmed | step 0 and its conditional **deleted**; §3 states the real mechanism; A3 updates the stale reason string |
| C2 | **Holds, and my remedy was wrong twice** | roster-based guard **withdrawn** (tautological). Measured discriminator: **4 orphans, 2-name allowlist** asserted with `toEqual`, not 39. `emittedClasses(dir)` refactor budgeted as A2. RA2.2 red rewritten against a temp fixture dir |
| C3 | **Holds.** `parse.js:110-113` verified | vacuous assertion **deleted**; RA5.1 compares against the light override block directly, with an explicit fallback to manual-only if it cannot be made to fail |
| C4 | **Ruled.** The designer verified red-team's mechanism and conceded the original reasoning was wrong, while the answer stands on the corrected mechanism | two-strips composition written into §4 and D63 as a **required adoption instruction**, with the flex-`auto` mechanism, the two costs, and the rejected alternatives. The one-prop justification is **replaced** (five observed item instances, not "one proven consumer") and the reversal clause is **replaced** (a per-item property, never container arrangement) |
| M2 | **Ruled on contrast, not on the 3–2 vote.** I recomputed all eight WCAG cells and they reproduce to the hundredth | contract stated verbatim in §4 and D63; `min-width:0` now in it (closes an m4 gap); enforced by RB1.9 in `token-refs.test.js`; `--spacing-3xs` withdrawn from the gap list |
| M4 | **Ruled.** The roster carries `kind: 'sample' \| 'demo'` | §2's RA3.2/RA3.4; `.visually-hidden` gets a demo showing the word vanish, because absence is the observable |
| M1 | **Holds** | `Type.test.js` **extended, never created**; its `.swatch`/`.radius__box` constraint stated as class-based |
| M3 | **Holds** | corrected above; D63 inserted after `:182` |
| M5 | **Holds, and understated** — three gates, not one | §7, new section |
| m1 | **Holds** | `items = []` mandatory; RB1.7 added for the default |
| m2 | **Holds** — 9 `class:` directives exist in the kit | stated as a limitation; `MetaStrip`'s numeric modifier is `__`-namespaced in consequence |
| m3 | **Holds** | RA3.3 drops the "mirrors the existing affordance" justification; `Copy .eyebrow` is a new convention, chosen deliberately because a utility has no `--token` name |
| m4 | **Holds; the unresolved flag resolves** | `icon-inventory.test.js:6` reads `components/svelte` only — **fixture icon names are ungated**, so a bad Phosphor name renders an empty icon with nothing red. B4 uses names already in the inventory. `min-width: 0` on the item: **pending C4/M2**, not assumed |

---

## 11. Plan-review findings: disposition

| # | Verdict | Disposition |
| --- | --- | --- |
| G1 | **Holds — a defect revision 3 introduced.** `kind` was required by RA3.4 and D63 but produced by neither §3's shape nor step A3, and the sheet carries no marker | `@kind` annotation declared in `utilities.css`'s existing leading comment — the JSDoc idiom the kit already uses (D61), no new syntax. Added to §3's shape, step A3, step A4 (all four classes, not two) and the D63 row. **No default**, so a missing annotation reds RA3.4 rather than silently defaulting. The sheet stays the single declaration site |
| G2 | **Holds.** `lightRegion` is module-local at `parse.js:82`, `lightDecls` at `:105`; the export list is `THEMES, resolveRef, colors, radius, spacing, sizes, byTheme, fonts, type, default`. RA5.1 was not executable | restated against `byTheme.dark.all` / `byTheme.light.all` **resolved** values (`parse.js:209-212`, exported). `--text-secondary` → `warm-300` / `warm-500`; a utility pinned to a raw `--warm-500` resolves identically and fails. **The "delete it and go manual" fallback is removed** |
| G3 | **Holds.** `Player.svelte:486` is the `--spacing-3xs` gap; `:487` is `min-width: 0`. `.strip` is `472-481`; `.strip__item` is `483-488` | all three corrected everywhere, including the D63 row that goes onto the permanent record. §4 and §9 no longer contradict each other |
| G4 | **Holds.** The contingency did the thing the rationale called harmful | **contingency dropped**, rationale kept. D63 ships with the code it specifies; if B is abandoned, #56 is not closed and the row is not yet owed |
| m·1 | Holds | A3 now says the `VITE_ONLY` reason-string edit is required **by honesty, not by the gate** — `:124-126` checks presence, never text |
| m·2 | **Partly.** The case is `Type.test.js:104-108`; its two assertions are at **`:106-107`**, not `:105-106` — `:105` is the `render(Type)` line | cited precisely, with the discrepancy noted. The constraint is unchanged |
| m·3 | Holds | `index.js` labels neighbourhood corrected to `:37-41` (my `:38-41` dropped `LabeledField`), under the `// Labels` comment at `:36` |
| m·4 | Holds | the intermediate draft was never committed; the header now says so and names the two commits that exist rather than citing an unresolvable "rev 2" |
| G2·b | **Holds — and the supplied shape needed one change.** Verified: the four `--caption-*` refs in `.eyebrow` are mode-invariant by design (`parse.js:33-38`; the light block declares no type tokens), so the unscoped rule reds on correct input | predicate **stated and measured** in §2: scope by colour-bearing property, require the referenced token to be in the 44-member overridden set. Plan-review's bidirectional form was not adopted because its second clause passes `color: var(--warm-500)` — the very true positive it was offered for — and does not consider a raw hex; the property-scoped form reds both |
| m·5 | Holds | `tokens.css:167` is `--text-primary`; dark `--text-secondary` is `:168`. Corrected in §2; it never reached the D63 row |

**Untouched, as instructed** — C2's discriminator and its 2-name `toEqual`, the
zero-allowlist counter-measurement, the WCAG table, C1's mechanism, and the
two-way split. All independently reproduced by plan-review.

---

## 12. Verification commands

```sh
npm run check-coverage    # check-catalog · check-taxonomy · check-consumer · check-compile
npm run check-types       # its own gate, outside check-coverage — run it explicitly (D59)
cd apps/catalog && npm test

# narrowing
cd apps/catalog && npx vitest run src/utilities.test.js
cd apps/catalog && npx vitest run src/components/brand/Type.test.js
cd apps/catalog && npx vitest run src/catalog-type.test.js     # §6, trips on A5
cd apps/catalog && npx vitest run src/components/MetaStrip.test.js
cd apps/catalog && npx vitest run src/props-optionality.test.js  # m1

# both themes, with eyes (A8)
cd apps/catalog && npm run dev     # BrandKit → Type → Utilities; toggle the theme
```

**Every gate exits 0 clean, 1 on gaps, 2 when it could not run. A 2 is a RED.**

## 13. Acceptance

**Plan A** — `.note` and `.visually-hidden` ship; one parsed roster, each entry
declaring a `kind`, with three enforced consumers; the guard fails in both
directions with a 2-name `toEqual` allowlist; `Type.test.js` **extended** with
all 7 original cases still green; `catalog-type.test.js`'s three gates green;
both themes seen.

**Plan B** — `MetaStrip` exported, fixtured (including the two-strips example),
typed by generated `.d.ts`; the visually-hidden label closes the a11y defect;
the decided visual contract is enforced by RB1.9 in `token-refs.test.js`, not
merely written down; D63 recorded after `:182` with all seven deltas; the D57
numeral gap recorded; the drift migration filed as its own issue.

**Neither plan** mints a token, edits `tokens/tokens.css` or `tokens.json`,
touches the four drift components, or changes anything in the peer `khaos-app`
checkout — the two-strips composition ships as an instruction in D63, and the
`--text-tertiary` AA failure is cited from D63 and filed separately.
