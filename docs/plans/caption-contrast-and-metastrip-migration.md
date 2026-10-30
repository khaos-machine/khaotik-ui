# Plan — #66 (caption contrast) and #68 (MetaStrip migration)

Baseline: `main` at `b62c70b` — 68 files / 872 tests, `check-coverage` 0, `check-types` 0, 58 declarations.
`MetaStrip` merged as `ab9aaf5` (#56 / PR #70). Contract at D63, `docs/decisions.md:183`.

**Revision 11** — plan-review returned **APPROVED-WITH-FIXES** on `69abb06`; F1–F4, m15
and the KEPT-count contradiction are folded in. **Every open finding across three audit
rounds has been in the guard, none in the fix** — the substitution #66 is actually about
has not moved since revision 4.

**Population: 73 rules / 30 components; 65 CHANGED / 6 KEPT / 2 NON_TEXT.** Independently
re-derived at 73/30 and 65/29 by six instruments plus plan-review. **The guard keys
selectors, not rules — 75 keys, 67 CHANGED** (F4).

---

## 0. Status

| | |
| --- | --- |
| **#66** | Buildable now. Substitution: `--text-secondary`. Scope: every site below the 24px large-text threshold. |
| **#68** | **Closed, not-actionable.** No tone affordance. PR 2 (docs-only) still ships. |
| **Blocked on** | Nothing. Red-team's Criticals are answered in 2.6, 4.2 and 5. |
| **Owed** | A third text rung — reported, not minted (3.3). Tracked as **#75**. |
| **Carrying** | D64 + two D63 amendments, verbatim (9, 11). |

---

## 1. #68 — closed, and the record corrected in both directions

The designer verified my reads, **upheld the finding, and corrected D63's own record**.

**D63's "five observed instances" was wrong; the honest base is three.** Two of the five
were miscounted from their CSS — `display:flex` plus a `__meta` class name —
and their markup is a value followed by a rendered `<StatusPill>`
(`RequirementList.svelte:108-118`, `ServiceStatusList.svelte:94-101`). A different
pattern, not a metadata run. `MetaStrip`'s only prop is `items: MetaItem[]` rendering
text nodes (`MetaStrip.svelte:45`, `:54`).

**Tone is refused, on stronger ground than mine.** I argued D63 had rejected it. The
designer's reason is that tone *would not unblock what it appears to*: those sites draw
a `StatusPill` (tinted ground, `--radius-sm`, weight 600 — `StatusPill.svelte:26-38`),
not toned caption text. Only a snippet could host them, and **a snippet makes the atom
accept anything, which is the absence of a contract.**

**`ProjectCard` is blocked harder than I found, and my read was incomplete.** I stopped
at `.project__footer`'s `aria-hidden` (`:137`) and called the label inert. It is part of
a **D52 merged unit** — plain `div`, sibling `<button aria-label={title}>` at `:119`,
visual text hidden. The button carries the accessible name, so the label is not merely
inert, it is **correctly** inert. Right conclusion, half-read mechanism; recorded rather
than quietly upgraded.

### 1.1 The fact that decided it

**No site in this library ships the bare-value defect `MetaStrip` was built to fix.**
The two `aria-hidden` sites announce nothing; the two `StatusPill` rows are not runs and
their pills carry their own text (`RequirementList.svelte:116`,
`ServiceStatusList.svelte:100`). The defect D63 cites is real — its live instance is the
**consumer**, `khaos-app/src/ui/Player.svelte:167-185`.

### 1.2 Routed, not absorbed — issue #74

`VoiceProfileCard.svelte:36` pre-joins four independent facts into one string —
`[accent, gender, language, tone].filter(Boolean).join(' · ')` — so a screen reader
hears one run-on with no per-item structure. **Same defect class `MetaStrip` exists
for**, and not fixable by dropping the atom in: `.voice__meta` is `nowrap` +
`text-overflow: ellipsis` in a constrained card (`:162-168`) and `MetaStrip` has no
truncation policy by ruling. **Filed as #74, with truncation as its open question.
Cited in PR 2; not folded into either PR.**

---

## 2. #66 — the inventory

### 2.1 The population

**73 rules across 30 components** declare `--text-tertiary`:

| Class | Rules | Components | In scope? |
| --- | --- | --- | --- |
| explicit `--caption-size` (11px) | 40 | 24 | yes |
| **`<<INHERITS>>`** — no `font-size` in the rule | 23 | 15 | audit resolves each |
| explicit `--body-md-size` (13px) | 8 | 8 | **yes — operator's ruling, 2.3** |
| literal `10px` — `RelationshipGraph.svelte:147` | 1 | 1 | **yes — smallest text in the set** (2.6) |
| literal `1.2rem` — `CharacterBuilder.svelte:380` | 1 | 1 | decorative glyph → KEPT |

**Scope arithmetic.** 73 = **65 CHANGED** + **6 KEPT** (4.2) + **2 non-text** under a
different success criterion (2.6b, #76). §6 lists all 65. `RelationshipGraph.svelte:147`
is CHANGED, not "named separately" — Ruling B puts it in scope explicitly (2.6).

**Rules are not keys (F4).** Two rules use grouped selectors —
`StoryPlayer.svelte:334` and `EditableField.svelte:247`, both CHANGED — so the guard's key
space is **75, not 73**, and CHANGED is **67 keys** across 65 rules. §7 step 2 and §12
reconcile in *both* units and say which is which.

**Two independent routes reached 65, and that is worth recording rather than passing
over.** Red-team's m5 derived CHANGED = 65 from revision 5's composition (7 KEPT including
`SectionHeader:45`, 1 named separately, 2 non-text still counted as changed). Ruling B's
reclassification reached 65 from a different one (6 KEPT — `SectionHeader:45` moved to
CHANGED by C2 — `RelationshipGraph:147` moved to CHANGED, 2 non-text withdrawn). Different
buckets, same total. **In a plan whose §2.2 exists because three source-read passes gave
three answers, two derivations converging is evidence, not coincidence.**

### 2.2 Why revisions 1–2 had wrong line numbers, and why that argues the designer's case

My revision-1 scan and my revision-2 scan **produced different answers from the same
files, and both looked plausible.**

Revision 1's crude `awk` under-counted the population. Revision 2's parser stripped
comments before splitting lines, which shifted every line number in any component whose
`<style>` block carries prose — and these components carry a lot of it. `ProjectCard`'s
`.project__meta` was reported at `:320`; it is at `:346`. A third attempt blanked
comments to preserve newlines but computed byte offsets against the unblanked source,
and silently **lost 42 of the 73 rules** — including `LabeledField:46` and
`ServiceStatusList:252`, both of which I had already read directly.

Only the fourth attempt — blanking comments to spaces, preserving both length and line
count — reproduced the counts *and* matched every line I had verified by hand.

**This is the argument for designer requirement 1, made against my own work.** Three
source-read passes, three answers, no error message from any of them. A regex can be
fooled by inheritance *and* by the file's own prose. `getComputedStyle` on a rendered
node cannot be fooled by either.

**The stated rule: the audit wins on disagreement.** Every `file:line` in this plan is
from the verified pass and spot-checked against direct reads, but it is the plan's
evidence, never the build's input.

### 2.3 The `--body-md-size` tier is in — the criterion governs

Operator's ruling. WCAG large text is 18pt (24px), or 14pt (18.66px) bold;
`tokens/tokens.css:146-147` gives `--body-md-size: 13px` and `--caption-size: 11px`.
Both are normal text at 4.5:1, so the 8 body-md rules **fail the same bar for the same
reason**. Excluding them would repeat #66's under-report one step up the type scale.

**"Above 11px" is therefore not a valid KEEP reason and is struck from requirement 2.**
The valid ones are **above 24px**, **genuinely decorative**, and the WCAG SC 1.4.3
inactive-control exemption (4.2).

### 2.4 Correction: the population is 73, not 81

The instruction to revise says "81 rules across 30 components, not 73". That
double-counts. The 8 `--body-md-size` rules were **already inside** the 73 — 2.1 has
listed them as a class since revision 2, deferred pending exactly this ruling
(40 + 23 + 8 + 2 = 73). The ruling moves them from *deferred* to *in scope*; it does not
add them to the population.

- population declaring `--text-tertiary`: **73 rules / 30 components** — unchanged
- in scope **before** the ruling: ~58 (73 − 8 body-md − ~7 exempt)
- in scope **after** the ruling: **~66** (73 − ~7 exempt), audit authoritative

I have written 73 into D64 rather than 81. Inserting a number I know to be wrong into a
permanent decision row is the exact failure D63's miscount represents, and it is worth
one round-trip to avoid. **Flagged for the row's author to confirm.**

### 2.5 The inherited class is 23 rules and cannot be read statically

`ProjectCard.svelte:341` `.project__progress` sets the colour at `:342` with **no**
`font-size`; it inherits `--caption-size` from `.project__status`, whose `font-size` is
at `:324`. That is the general shape, not a one-off — 23 rules, a third of the
population, across 15 components. This is how #66 under-reported originally and how each
of my scans did.

### 2.6 Four rules the instrument cannot see — and two of them are not text (C1)

Red-team found four rules §4.1's walker structurally cannot read. Verified, and the
finding **splits further than filed**: they are two different problems.

**(a) Text painted by a property the walker does not read — 2 rules.**

| Rule | Painted by | Why `color`/`fontSize` misses it |
| --- | --- | --- |
| `RelationshipGraph.svelte:147` | `fill` on `<text>` (`:70`) | `getComputedStyle(node).color` on SVG `<text>` returns the inherited `color`, not the `fill` that paints it |
| `VoiceCatalog.svelte:306` | `::placeholder` | `getComputedStyle(el)` without a second argument never returns pseudo-element style |

These **are** text at 4.5:1. The audit must read `fill` where it paints text, and must call
`getComputedStyle(el, '::placeholder')`.

**(b) Not text at all — 2 rules, and the plan had them wrong.**

`StoryGraph.svelte:206` `.storygraph__edge` is a **`<path>`** (`:111-116`, `d={chordPath(…)}`)
— `fill: none`, `stroke: var(--text-tertiary)`, `opacity: 0.35` — **inside an
`aria-hidden="true"` `<svg>` (`:109`)**. `PacingChart.svelte:216` `.pacing__average` is
genuinely a `<line>` (`:139`) — a 1px dashed average rule.

**Corrected from revision 6, which called both `<line>` and omitted the `aria-hidden`.**
The category conclusion is unchanged; the element name was wrong, and the `aria-hidden` is
load-bearing — **a decorative graphic may be exempt from SC 1.4.11 entirely**, so the
finding may be narrower still than 3:1.

**Neither is text, so neither takes the 4.5:1 bar.** `.storygraph__edge`'s
`opacity: 0.35` means its effective contrast is a **compositing result against its
ground**, not a token-pair ratio.

**And 3:1 is probably the wrong bar too — my own qualifier, left hanging (M8).** SC 1.4.11
governs graphical objects **required to understand the content**. Revisions 6–8 wrote that
qualifier and then never applied it. Applying it: all three drawings are
`aria-hidden="true"`, and `StoryGraph` ships an **explicit text alternative** —
`.storygraph__alt` `<ul>` at `:103-107`, under a comment at `:100-102` stating *"the real
content is in the accessible layer and the drawing is aria-hidden, because a screen reader
cannot read a ring"*, and naming `RelationshipGraph` and D52 as the same shape. A drawing
with a full text equivalent is **decorative, and exempt from SC 1.4.11 outright.**

So the honest position is **not "3:1 instead of 4.5:1" but "probably no contrast bar at
all"** — and #76 would otherwise inherit a bar wrong in the *other* direction. #76 remains
correct as filed on its real subject: a **semantic text token naming a vector colour** is
a naming violation whether or not any contrast rule applies. The coordinator is relaying
the bar correction to the issue.

Revision 5 listed both in §6 as things that move. **That was wrong in a second way beyond
red-team's finding**: substituting `--text-secondary` applies a text rule to non-text and
would not even be evaluated against the right bar. Both are **removed from CHANGED** and
filed as **#76** — *"Two chart components paint SVG strokes with `--text-tertiary`: a
semantic text token naming a vector colour."*

**#76 carries a prohibition this plan must respect: do not resolve it by moving both to
`--text-secondary`.** That would leave the media violation in place while removing the
evidence of it — a text token would still be naming a vector colour, merely a different
one. The kit may owe a **non-text tier, reported not minted**, on the same discipline as
#75. Cross-linked to it: **D64 found one value serving two grounds; #76 is one value
serving two media.** Same disease, different axis.

**`RelationshipGraph.svelte:147` is text, is 10px, and is IN the changed set.** Revisions
1–6 carried it as "named separately", which under-weighted it: at **10px (`:146`) it is the
smallest text in the changed set**, taking the same 4.5:1 bar with *less* margin than
everything else — the most urgent site, not an afterthought. It already carries a comment
(`:142-146`) routing a missing `--label-xs` to the harvest file rather than inventing one,
so **the size gap and the colour fix are separate**: this plan changes the colour, and the
10px literal stays until #75's neighbour lands. Its answer depended on an instrument that
could not measure it; 2.6(a) fixes that.

---

## 3. The ruling: `--text-secondary`, with a third step owed

### 3.1 The mechanism is a tier violation, not low contrast

`tokens/tokens.css:169` and `:232` both set `--text-tertiary: var(--warm-400)` — **one
value against four grounds** — while every other member of the semantic text tier flips
with the theme (`--text-secondary`: `--warm-300` dark → `--warm-500` light).

The defect is a **primitive wearing a semantic name**. That is *why* it measures
3.29 / 3.61 / 4.56 / 4.09 rather than an accident of which grey got picked.

**Consequence, and it constrains any future fix: a third step must be two values, not a
better single one.**

### 3.2 Why it ships now rather than waiting

The contrast failure is live in both themes at 11px. A ladder rung is a palette decision
carrying Andrew's name (D-005, the weight ramp). **Blocking an accessibility fix on a
brand decision inverts the priority.**

The compression to two steps is accepted **because it is recorded as debt, not because
it is fine.** 26 components independently reached for a third rung — the same evidence
standard that justified `MetaStrip`.

### 3.3 The third step is REPORTED, not minted — and now tracked

Recorded in `docs/harvest-khaos-machine-tokens.md`, stated in D64, **and filed as its own
issue** so it has somewhere to be closed rather than living only in a decision row and a
harvest list — **#75**, *"The type ladder owes a third step: mode-aware, clearing AA at
11px, quieter than `--text-secondary`"*. Cited in D64, the harvest row and the CHANGELOG.

Envelope — **the value is Andrew's; the build does not invent it**:

- mode-aware — **two values**, per 3.1
- clears 4.5:1 at 11px on **both** `--surface-base` and `--surface-raised` in its theme
- visibly quieter than `--text-secondary`
- measured windows: **dark `L ∈ [0.2371, 0.3875)`** (wide); **light `L ∈ (0.0652, 0.1406]`** (thin)
- `--warm-400` misses the light bar by **≈0.019 of luminance** — which is how it survived review

**Fourth requirement, added by the designer and posted to #75 (verbatim, cited here):**

> **4. It must be decided against the derivations that read from it.** A mode-aware step composes twice inside a `color-mix` against a mode-aware ground, so every derived token taking the old mono-value as input moves in both themes. Today that is `--illustration-ink` alone (`tokens.css:282`), and it is consumed by no component, so nothing renders differently on the day the step lands — but the question of whether it should read from the new step, from `--text-secondary`, or from a primitive is part of this decision rather than a consequence of it. **Note the live possibility that it was built on `--text-tertiary` *because* that token was mode-invariant** — a deliberately stable ink. The record does not say, and it is not to be inferred; it is Andrew's, with the step.

### 3.4 The sharpest casualty, named

`LabeledField` renders its label at `--text-tertiary` (`:46-50`) and its value at
`--text-secondary` (`:61`). **That pair is the property inspector's entire
term/description distinction, and after this both are one colour.**

The `dl` / `dt` / `dd` structure still carries it for AT (`:28-33`), so nothing breaks —
but the visual distinction goes, a dozen rows deep in a column. This is the concrete
shape of the debt in 3.2 and the first entry in the 4.4 list.

---

## 4. The four things the designer requires

### 4.1 Enumerate by computed size, not by rule

**Instrument: `getComputedStyle` on real rendered nodes in the running catalog, through
the Tauri bridge** (`apps/catalog && npm run dev:mcp`; `.mcp.json` `tauri` server, see
`.claude/skills/mcp-steering`). Inheritance cannot fool it; a regex can be fooled by it
(2.2, 2.5). Run once per theme per ground — four passes.

**It must be specified exactly where it is load-bearing (M6, m4). Six rules:**

1. **Paint properties.** Read `color` **and `fill`** (2.6a). Read
   `getComputedStyle(el, '::placeholder')` for input placeholders.
2. **Background resolution.** `getComputedStyle(el).backgroundColor` returns
   `rgba(0,0,0,0)` for most of these nodes. The walker **climbs to the nearest painted
   ancestor**, and **where it stops decides base-vs-raised — 3.61 vs 3.29**. The stopping
   rule is part of the artifact, not an implementation detail.
3. **Scoping (m4).** The walk runs inside `FixtureView` / `Canvas`, so it will collect
   catalog-shell nodes belonging to no bucket. The audit records only nodes whose owning
   component is under `components/svelte/`. The 32 tertiary sites in `apps/catalog/src`
   are **out of #66's scope** — though the catalog is itself a signed shipped app, which
   is 13.6.
4. **State coverage (M6).** A state no fixture renders is invisible to a node walk, so
   `Launcher.svelte:346` and `Toggle.svelte:74` leave the enumeration silently if no
   fixture renders disabled. The audit **asserts it reached every rule in §2.1**, and
   names any it did not. **An unreached rule cannot be classified** — it is a red on the
   audit, never a `KEPT` entry with a missing size (m10). This closes the gap between
   this rule and §12's requirement that every `KEPT` entry carry a computed size: there is
   no third state. Red-team could not ground an instance — `fixtures.js:226` and `:1089`
   render `disabled: true`, and empty states are broadly fixtured — so this is a stated
   invariant, not a known failure.
5. **Fixture list.** Enumerated in the artifact, not discovered ad hoc.
6. **Artifact paths and schema** — **two files** (C6): `contrast-allow.json`, the
   hand-authored allow-set the guard reads (`component`, `selector`, `occurrence`,
   `reason`, `verdict` ∈ `KEPT` | `NON_TEXT`), and the measurement record
   `apps/catalog/src/data/contrast-audit.json`:
   `{ "generatedBy", "regenerateWith", "records": [...] }`. The two scalar fields carry
   the sole-writer declaration, **because JSON has no comment syntax** and condition (b)
   originally asked for a header comment (m8). One record per rule: `component`, `line`,
   `selector`, `computedSize`, `computedColor`, `resolvedGround`, `ratio`, `verdict`
   (`CHANGED` | `KEPT` | `NON_TEXT`), `reason`. `line` is informational only. **The runtime
   audit is this file's sole writer, and the guard never reads it** (5c).

### 4.2 Produce a KEPT list, not only a changed list

#66 does not deprecate `--text-tertiary`. Every site left on it is recorded **with its
computed size** and its reason. **Without this, "we fixed 26" is unfalsifiable.**

`SectionHeader.svelte:45` is the shape that legitimately stays — `.section-header__trailing`
sets colour at `:48` with no `font-size`; a flex container for slotted content that
brings its own type.

Valid KEEP reasons — **"above 11px" is struck (2.3), and so is "container with no own
type" (C2, below)**:

- **computed size ≥ 24px** (or ≥ 18.66px bold)
- **genuinely decorative** — `Menu.svelte:100`, `CharacterBuilder.svelte:380`
  (`:global(.ph)`; `Icon` is `aria-hidden` by contract, `Icon.svelte:29`)
- **inactive controls**, WCAG SC 1.4.3 — `Launcher.svelte:346` and its icon `:351`,
  `VoiceProfileCard.svelte:119`, `Toggle.svelte:74`

Six entries. Red-team verified all three SC 1.4.3 claims independently, including the one
worth doubting: `Toggle.svelte:35` passes `{disabled}` into Ark's `SwitchRoot` (`:34` is `{checked}` — m12), which
renders a genuinely disabled input.

**C2 — `SectionHeader.svelte:45` is not an exemption and is moved to CHANGED.** It sets
`--text-tertiary` with no `font-size` on a `<div>` whose entire content is
`{@render trailing()}` (`:20`). That is not a WCAG exemption; it is an **unbounded
delegation of the exact defect #66 is about** — the inheritance shape §2.5 says a
rule-local scan misses, handed to whatever a consumer slots in.

It was also a **latent contradiction the builder would have hit**: `getComputedStyle`
always returns a concrete `fontSize`, so the audit reports this rule at whatever the
fixture renders; below 24px the audit says FAIL while §4.2 said KEEP, and §7 step 2 says
the audit wins. One of the two had to go before a builder was handed both.

**Resolved against the plan, not the audit:** substituting `--text-secondary` into a
delegating container is strictly safer than leaving `--text-tertiary` there — it cannot
make any slotted content fail, and it removes the conflict at its source.

Both lists are checked in as the audit artifact. They are the deliverable, not a
by-product.

### 4.3 Both themes, both grounds, every changed component

Not a spot-check. **In light, `--text-secondary` is `--warm-500`, which is *darker* than
the tertiary it replaces** — some surfaces will read **heavier rather than quieter**.
That is the expected direction and someone has to confirm it looks intentional.

**4 passes × 29 components** (m1 — §6 covers 29, not the ~24 revisions 3–5 claimed).
This is the acceptance gate, not the suite.

### 4.4 Name where secondary now serves two adjacent rungs

`LabeledField` is one (3.4). Candidates the audit confirms: `RequirementList` (name
primary / description + path + version all secondary), `ServiceStatusList` (name primary
/ description + port secondary).

**That list is the input to the third-step decision, captured while the build is already
looking.** #75 names it as such, so this requirement has a **named consumer** rather than
being a list produced on spec — and `LabeledField` (3.4) is the case #75 argues over.
Same artifact; cite #75.

---

## 5. PR 1 — the failing test and the enumeration

Two instruments, because they answer different questions.

**(a) The calculator — Vitest, `apps/catalog/src/contrast.test.js`.** Resolve
`--text-secondary` and `--text-tertiary` through the `--warm-*` primitives against the
four real backgrounds; assert **all eight** of D63's published ratios to 2dp:

| | dark/raised | dark/base | light/raised | light/base |
| --- | --- | --- | --- | --- |
| `--text-secondary` | 6.86 | 7.53 | 8.29 | 7.44 |
| `--text-tertiary` | 3.29 | 3.61 | 4.56 | 4.09 |

**Eight, not six (M2).** Revisions 1–5 said "six published ratios" throughout; D63
publishes **2 tokens × 4 grounds = 8**. A builder writing six assertions leaves two
grounds unproven and §12 still reads green — a miscount inside the gate whose stated
purpose is that a wrong calculator mass-passes plausibly, in a plan whose §9 exists
because D63 miscounted. Corrected here, in the table below and in §12.

**And the proof must cover the decision rule, not only the arithmetic (M5).** Eight
ratio assertions prove the ratio function and say nothing about
`fail ⟺ ratio < 4.5 unless computedSize ≥ 24px (or ≥ 18.66px bold)`. A correct ratio
function with a wrong threshold mass-passes and §12 reads green. So the block also
asserts the **predicate** at its boundaries: 23.9px fails, 24px passes, 18.6px bold
fails, 18.7px bold passes, and a 4.49/4.51 pair either side of the bar.

**Non-negotiable, green from the first commit, and it is the same function the runtime
audit calls.** A wrong calculator mass-passes or mass-fails and **both look plausible** —
2.2 is the proof of that, three times over. Not re-deriving #66's ratios; reproducing them.

Precedent for the source-read class: `token-refs.test.js:6-22`, and its two hard-won
lessons — "token appears somewhere in the block" is too weak (`:157-160`), and a read
that quietly returns nothing makes every case vacuously true (`:94-98`, `:137-141`).

**(b) The enumeration — runtime, per 4.1.** Produces `CHANGED` and `KEPT`. This is where
the population comes from; 2.1 is evidence, not input (2.2).

**(c) The regression guard — Vitest, against the checked-in audit artifact. Red-team
ruled it worth having; it ships only under four conditions (C3).**

**My revision-5 framing was wrong and the correction matters.** I wrote that a
reference-scan "can only fire on a hand-written addition and never on the
inheritance-shaped defect". That does not hold: *the inheritance-shaped defect **is** a
hand-written addition of a `--text-tertiary` reference.* Inheritance decides whether you
can resolve the **size**, not whether the **reference** exists. `ProjectCard.svelte:341`
is my own canonical inherited case and it declares `--text-tertiary` in as many words, so
a reference-scan reds on it. This guard is **not** vacuous the way this repo's two recent
vacuous gates were — those had an empty red set by construction.

**But revision 5 did contain a vacuity, one level up.** "No component declares
`--text-tertiary` outside the artifact" is a **set-membership tautology** if the
artifact's reference list is itself generated by scanning components: "components
declaring it" becomes *defined* as "what the artifact lists". It can red only if artifact
and guard come from genuinely independent instruments. Revision 5 never said so, gave the
artifact no path and no schema, and named nothing as its writer — so the first maintainer
who saw the guard red and regenerated the artifact would have converted it into the third
vacuous gate, with a green test and a checked-in artifact as proof.

**That was one route to tautology. There is a second, and (a)–(d) do not touch it (C4).**

Conditions (a)–(d) constrain the reference **set** and the **writer**. **None constrains
the allow-set** — what the scan is compared *against*. My only prose form of the assertion
was *"no component declares `--text-tertiary` outside the artifact"*, and the artifact
holds **every** record under a verdict. Both readings of "outside the artifact" are broken:

- **Allow-set = the whole artifact.** The 65 CHANGED entries are in it. After step 6 those
  rules no longer declare the token, so a regression re-adding `--text-tertiary` at
  `LabeledField:46` is *in the artifact as CHANGED* and **the guard passes**. It cannot red
  on the single regression it exists for. **The fourth vacuous gate.**
- **Allow-set = KEPT only.** It reds on day one against `StoryGraph:206` and
  `PacingChart:216`, which legitimately keep the token (#76). §12 asserts KEPT has six
  entries and §4.2's three reasons cover neither. The maintainer's only moves are widen
  KEPT — contradicting §12 and §4.2 — or regenerate, **the exact disarming (b) forbids.**

**The predicate, stated. This is the fix.**

Let `declaring(sources)` be the set of rules under `components/svelte/` declaring
`--text-tertiary`, and let

```text
allow = { r | r.verdict ∈ { KEPT, NON_TEXT } }        // 6 + 2 = 8 rules
offenders = declaring \ allow                         // must be empty
missing   = allow \ declaring                         // must be empty
```

Both directions are asserted. **CHANGED is not in the allow-set** — that is the whole
point, and it is what makes the `LabeledField:46` regression red. `missing` catches the
drift the other way: a KEPT or NON_TEXT rule quietly losing the token.

#### The key — where revision 9 was broken twice (C6, M9)

Revision 9 said "keyed by `component` + `selector`, never by line". Lines do drift, so the
second half stands. **The first half was wrong in two independent ways.**

**C6 — the two sides spell selectors in disjoint languages.** (b) made the *runtime audit*
the artifact's sole writer and (c) made the guard's set an *independent source scan*, so
`allow` would carry whatever a runtime instrument emits and `declaring` would carry
authoring selectors. **Svelte 5 rewrites selectors at compile time.** Verified against the
committed build (`apps/catalog/dist/assets/index-CGzgeXj5.css`) — **zero of the eight
allow-set rules match across the two spaces**: hashes appended
(`.labeled-field__label` → `.labeled-field__label.svelte-1kiqeju`), `:global()` stripped
(`:global(.ui-toggle[data-disabled] .ui-toggle__label)` →
`.ui-toggle[data-disabled] .ui-toggle__label`), descendant combinators gaining `:where()`
(`.launcher__actions button:disabled` →
`.launcher__actions.svelte-3xrhpd button:where(.svelte-3xrhpd):disabled`).

So `offenders` = all 8 and `missing` = all 8. **PR 1 could not have shipped a green guard.**
That failure is loud — but the second consequence is not: **mutations A and B assert only
that the mutated rule is *named*, so a guard that names everything passes both.** The
positive control C5 added is satisfied by a guard that is 100% broken. Only case 1
separates them, and revision 9 never said so. **That is stated now as case 1's job.**

**The repair that suggests itself re-opens the tautology.** Having the artifact carry the
*authoring* selector puts both halves back on one instrument — (b) constrains the
artifact's writer and (c) its reference list, and **neither constrains the key's
provenance**.

**The fix is to stop asking the runtime audit for the key at all.** The allow-set is a
**decision** — "these eight rules legitimately keep the token" — not a measurement. So the
artifact splits in two:

| File | Written by | Read by the guard? |
| --- | --- | --- |
| `contrast-audit.json` | the runtime audit (4.1) — measurements: computed size, ratio, ground | **No** |
| `contrast-allow.json` | **a human, by hand, in a PR — no generator exists** | Yes, this is `allow` |

Both `declaring` and `allow` are then in **authoring** spelling, so C6's mismatch
dissolves, and the runtime audit is out of the key path entirely. The audit's role is
unchanged: it produces the evidence that *justifies* each allow entry, cross-checked
against it once by a human at PR 1 review.

**Why this is not the collapse red-team warned of.** The tautology is not caused by two
sides sharing an *instrument*; it is caused by the comparison set being **mechanically
regenerable from the thing being checked**. A hand-authored decision list has **no
generator** — there is no command anyone can run to make it agree with the scan. That is a
stronger guarantee than "the audit is sole writer", which still named a program that could
be re-run. **Remove the generator and the guard can red.**

**M9 — `component` + `selector` is not unique, and this is the third mutation case.** Nine
collisions in the tree, red-team's parse reproducing 73/30 and §6's 65 exactly. The live
one is in the changed set: **`StoryPlayer` `.player__context` is a CHANGED entry at `:335`
with an identical-selector sibling at `:341`.** Worse than filed — `:334-335` is a
*grouped* selector (`.player__zoom-label, .player__context`), so the rule does not solely
own the name my own inventory filed it under. Eight `@media`/`@container` blocks in four
components duplicate selectors by construction, and `CharacterBuilder` — an allow-set
component — already triples them.

**No live mask today**: none of the eight allow-set selectors is currently duplicated, so
**the guard would have been sound by luck, not design**. The latent failure is silent — a
responsive override declaring the token under an allow-set selector collides with the allow
entry, `offenders = ∅`, **green while a real regression ships**.

So the key is `component` + `selector` + **occurrence ordinal**, and grouped selectors are
**split into one entry per comma-separated part** before keying.

**Traversal order is pinned, and it is a precondition of Mutation C rather than a
tidiness point (F2).** Order is **source order, per file, grouped parts left-to-right**.
If order is undefined the injected rule can take occurrence 0 and displace the original to
1, so `missing` goes non-empty and the case fails *for the wrong reason* — a red that
proves nothing.

**The uniqueness assertion goes on `contrast-allow.json`, not on `declaring` (m15).**
Revision 10 asserted it on `declaring`, where **it has an empty red set by construction** —
a traversal ordinal cannot collide with itself. That is this plan's own definition of
vacuity, shipped inside the anti-vacuity apparatus, and §12 claimed it as protection. The
side that genuinely collides is the **hand-authored** allow list, where a human pastes an
entry twice. Unlike (d)'s class this is fully inside the guard's instrument, so it gets a
case (Mutation C, below).

**The `NAMED` verdict is removed from the schema — and revision 9's stated reason was
backwards (m13).** I wrote that an empty bucket lets a future rule "hide from both halves
of the predicate". It cannot: a `NAMED` rule still declares the token, so it lands in
`declaring`, is absent from `allow`, and **reds loudly in `offenders`**. The honest reason
is duller: Ruling B emptied it, and a zero-member enum value with no semantics is dead
schema.

**The five conditions:**

- **(a)** the artifact's path and schema are fixed — 4.1 rule 6.
- **(b)** **`contrast-allow.json` has no generator.** It is hand-authored and changed only
  by a human editing it in a reviewed PR; no command regenerates it. This replaces
  revision 9's "the runtime audit is sole writer", which still named a program that could
  be re-run (C6). `contrast-audit.json` — measurements only, never read by the guard —
  carries `"generatedBy"` / `"regenerateWith"` fields, **not a header comment, because
  JSON has none** (m8).
- **(c)** the guard's reference set is an **independent source scan**, not a read of the
  artifact — that independence is the whole reason it can red.
- **(c′)** its scan is scoped to `components/svelte/`. **It must not reach
  `tokens/tokens.css`**, where `--illustration-ink` (`:282`) legitimately takes
  `--text-tertiary` as a `color-mix` input — D64's Ruling A exemption. A guard that read
  the token sheet would red on a reference that must not be removed, and the fix someone
  reached for would be deleting a token or inventing a value.
- **(d)** the test file **states what it does not catch**: a `KEPT` entry whose inherited
  size later drops below 24px, and a new element inheriting `color` from a `KEPT` rule
  without referencing the token — the `SectionHeader:45` shape, which is why C2 removed
  that exemption rather than documenting around it. **This class gets no mutation case, by
  ruling:** a source-text scan structurally cannot observe an element that never names the
  token, and *"a mutation case cannot exist for a defect the instrument cannot see;
  pressing for a case here would manufacture a test that only pretends to cover it."*
  (d) stays an admission.

#### F1 — how far the guard adjudicates an allow entry, ruled

`contrast-allow.json` is hand-authored, so a maintainer under pressure can add an entry to
silence a red. Two hardenings, and the second needed a ruling.

**Part 1 — `reason` is an enum, not free text.** It takes exactly one of §4.2's three
values: `size>=24px`, `decorative`, `inactive-control`. Today `decorative` has two members
(`Menu:100`, `CharacterBuilder:380`) and `inactive-control` four (`Launcher:346`/`:351`,
`VoiceProfileCard:119`, `Toggle:74`). **`size>=24px` has zero members, which is correct
rather than suspicious** — §6's † class is where it would gain one if the audit promotes an
inherited rule.

**Part 2 — ruled WEAK: the guard checks the field is present and well-formed, and does
not verify the measurements support it.** The strong reading — the guard confirms the
audit record exists and its numbers justify the stated reason — closes the hole more
tightly, and it is **refused** because it requires the guard to read
`contrast-audit.json`, which this plan forbids in four places (4.1 rule 6, 5c(b), the 5(c)
table, §12). That file carries a `regenerateWith` field naming a command that rewrites it,
so the strong reading would **relocate the disarming path onto a file that advertises its
own generator** — trading a small hole for the exact failure (b) exists to close.

**So the lock is not the guard, and the plan says so rather than implying otherwise.** The
lock is that `contrast-allow.json` has **no generator** and every entry is a reviewed human
decision in a PR diff; the guard is a speed bump on this axis and a lock only on the
reference set. Adjudicating whether an exemption is *justified* is review's job, against
the audit, once.

**Part 3 — `offenders` emits a human sentence, never allow-schema-shaped objects.** Output
is `LabeledField.svelte .labeled-field__label (occurrence 0) declares --text-tertiary and
is not in the allow list` — not a JSON object a maintainer can paste into
`contrast-allow.json` to make the red go away. **Removing the copy-paste affordance costs
nothing architecturally** and is the cheapest part of this fix.

### 5(c)(e) — the positive control, which is the condition that matters (C5)

**Nothing above requires the guard to be *demonstrated* able to red.** Conditions (a)–(d)
are arguments that it can. **All three of this repo's prior vacuous gates would have
satisfied every one of them.** A remedy whose entire subject is vacuous gates cannot ship
on argument.

So the predicate is written as a **pure function over source text**, and three cases are
**required, executed, and asserted** — not documented:

1. **Green.** Real sources → `offenders == []` and `missing == []`. **This case is not a
   formality — it is the only one that fails a guard which names everything** (C6). A
   100%-false-positive guard passes mutations A and B, because both assert only that the
   mutated rule *appears*. Case 1 is what separates a working guard from a broken one.
2. **Mutation A — the regression.** In an **in-memory** copy, re-insert `--text-tertiary`
   into `LabeledField.svelte`'s `.labeled-field__label` (a CHANGED entry). **Assert
   `offenders` names it.** If this passes, the guard is vacuous and PR 1 does not ship.
3. **Mutation B — the drift.** In an in-memory copy, remove the token from
   `Toggle.svelte`'s `:global(.ui-toggle[data-disabled] .ui-toggle__label)` (a KEPT entry).
   **Assert `missing` names it.**
4. **Mutation C — occurrence-keying, in discrimination form (M9, F3).** In an in-memory
   copy, add a **second** rule under an allow-set selector — the `@media` shape four
   components already use — declaring `--text-tertiary`. Under correct keying its key is
   `(component, selector, 1)`, which is **not** in `allow` (the entry is occurrence 0), so
   **assert `offenders` names it**.

   **This does not collapse into Mutation A.** A guard keyed `(component, selector)` with
   no ordinal **passes A and fails C**: the injected rule's key matches the allow entry, so
   `offenders` comes back empty and the case reds. C is what separates an occurrence-keyed
   guard from a selector-keyed one — M9's silent failure exactly, and the only case that
   detects it. Requires F2's pinned order to red for the right reason.

Deterministic, no Tauri, no file writes, runs in CI. **This is the discipline that has
already worked twice in this repo today** — it is how the `gap` swap in `MetaStrip`'s
contract was proven to bite (`token-refs.test.js:157-160`), and how the `check-catalog`
SIGPIPE flake was measured at 4/60 against 0/60.

Red-team's framing, kept because it is the reason this section exists: **C5 is why C4 got
through; fixing C4 by hand without C5 leaves no guarantee against its successor.**

**"CI cannot run Tauri" was a conflation and is withdrawn.** It is true of *regenerating
the artifact* and false of *the guard*, which is a Vitest source read and runs in CI
today. Stating them together made the hole look bigger and less fixable than it is.

---

## 6. PR 1 — what moves on screen

No DOM, size, gap or reading-order changes. **Colour only**, `--text-tertiary` →
`--text-secondary` — with **one qualification (M4)**: at `VoiceCatalog`, colour is also
carrying a *state* signal, and that signal collapses. See below the table. Line numbers
from the verified pass (2.2); the audit is authoritative.

**65 rules across 29 components.** Revision 5's table listed 63 and omitted two
unambiguously in-scope rules (M1); 2.6 removes two non-text rules and C2 adds one.

| Kind | Rules | What a reviewer sees |
| --- | --- | --- |
| **Counts / ranges** | `CharacterList:38`, `LocationList:38`, `SceneList:104`,`:117`, `DialogueList:116`,`:130`, `VoiceCatalog:259`,`:267`, `ResourceCatalog:205`† | "N of M" and range readouts above every entity list |
| **Labels / eyebrows / heads** | `LabeledField:46`, `MetricCard:58`, `EditableField:191`, `InstallScript:141`, `Launcher:401`,`:448`, `DialogueList:172`, `ResourceCatalog:286` | Field labels and small-caps headings; **weight and tracking unchanged** |
| **Descriptions / subtitles** | `SelectableRow:133`, `RequirementList:189`, `ServiceStatusList:252`, `Launcher:316` | Secondary line under every row name |
| **Metadata / values** | `ProjectCard:346`,`:341`†, `RequirementList:197`,`:210`, `ServiceStatusList:266`, `MetricCard:63`, `VoiceCatalog:416`, `VoiceProfileCard:170`, `ResourceCatalog:257`, **`SelectableRow:149`** | Paths, versions, ports, ids, tags — mono faces unchanged |
| **Chart / player readouts** | `BarChart:97`,`:139`†, `StoryGraph:281`, `StoryPlayer:334`‡,`:375`,`:415`, `PacingChart:251`†, `Dashboard:124`, **`RelationshipGraph:147`** | Axis captions, lane labels, ticks, timeline readouts, **graph edge labels (10px — smallest text in the set)** |
| **Controls / misc** | `SegmentedControl:86`, `Toggle:78`, `Gallery:63`, `CharacterBuilder:350`, **`InstallScript:227`**, `FilterField:79`†,`:116`†, `OutcomeBanner:137`†, `EditableField:247`†‡, `VoiceCatalog:279`†,`:306`†, `ServiceStatusList:310`†, **`SectionHeader:45`†**, `Launcher:421`†,`:497`†,`:501`†,`:517`† | Hints, notes, captions, placeholders, dismiss affordances |
| **Empty states** *(in scope — 2.3)* | `BarChart:146`, `CharacterBuilder:310`, `PacingChart:267`, `RelationshipGraph:107`, `RequirementList:226`, `ResourceCatalog:323`, `ServiceStatusList:342`, `StoryGraph:287` | Empty-state copy at 13px |

† inherits its size — the audit resolves it; entries resolving ≥ 24px drop to KEPT.
‡ **a grouped selector — one rule, two keys** (F4). `StoryPlayer:334` is
`.player__zoom-label, .player__context`; `EditableField:247` is
`.editable__action, :global(.editable__action)`. **Both partner selectors change too** —
`.player__zoom-label` and `.editable__action` are changed selectors and were named nowhere
in revisions 1–10, which also cited both rules at the *second* selector's line (`:335`,
`:248`) rather than rule-open, breaking §9's own m2 promise **in exactly the two cases
where the distinction bites**. Corrected here.

**Counts are of RULES; the guard keys SELECTORS (F4).** These two rules are the only place
they diverge: **73 rules → 75 keys**, and **65 CHANGED rules → 67 CHANGED keys**
(67 + 6 + 2 = 75). Every count elsewhere in this plan is a rule count and stays one.
**Six independent instruments missed this because they all counted rules.**

**M4 — the one state signal that collapses.** `.vcatalog__search` is `--text-tertiary`
idle (rule at `:279`, declaration `:287`) and `--text-secondary` on `:focus-within` (rule
at **`:290-293`**, declaration **`:292`**) — corrected from revision 8, which cited
`:293-295` (M7). After the substitution **both are `--text-secondary`, so the colour
half of the focus signal is gone.** `border-color` still moves to `--border-focus`, so the affordance is **degraded,
not lost** — but §6's "colour only" claim does not cover it, which is why the header now
says so. Red-team checked every `:hover`/`:focus` sibling of a tertiary rule; this is the
only such pair in the library.

**Not in this table (2.6):** `StoryGraph:206` (a `<path>`, inside an `aria-hidden` `<svg>`)
and `PacingChart:216` (a `<line>`) are not text — SC 1.4.11 at 3:1, or exempt outright.
Filed as **#76**; **not** to be resolved by moving them to `--text-secondary`.

**Two sites the audit's selectors nearly missed, both in scope (2.6a):**
`RelationshipGraph:147` paints via `fill` on a `<text>` (`:70`), and `VoiceCatalog:306` is
a `::placeholder`. Both are text; both take 4.5:1. `RelationshipGraph:147`'s `10px`
literal is a **reported gap, not a lapse** (`:142-146` — the kit's smallest step is 11px
and inventing a `--label-xs` would fabricate a token); the literal **stays**, only the
colour moves.

---

## 7. PR 1 — ordered steps

1. **Red (a).** Calculator, proven against the eight ratios and the threshold predicate. Green before anything else.
2. **Enumerate (b).** Catalog audit, 4 passes. Emit `CHANGED` + `KEPT`. Reconcile against
   2.1 **in both units — 73 rules / 75 keys, 65 CHANGED rules / 67 CHANGED keys** (F4) —
   and state which unit each number is. **The audit wins; record differences.**
3. Confirm `ProjectCard.svelte:341` resolves to 11px. **If the audit cannot see it, the
   audit is wrong and step 2 is not done** (2.5).
4. Build `KEPT` per 4.2 — computed size, reason, `file:line`. **"Above 11px" is not a
   reason** (2.3); neither is **"container with no own type"** (C2). Six entries.
5. Build the two-adjacent-rungs list per 4.4, starting from `LabeledField` (3.4).
6. **Green.** Apply `--text-tertiary` → `--text-secondary` across all **65** `CHANGED`
   rules, including the 8 `--body-md-size` rules (2.3) and `SectionHeader:45` (C2).
   **Not** `StoryGraph:206` or `PacingChart:216` (2.6b).
7. **Verify 4.3** — both themes, both grounds, **all 29** changed components. Confirm the
   light-theme *darker* direction reads intentional, and look at `VoiceCatalog`'s search
   field focused and unfocused (M4).
8. Report the third-step envelope (3.3) into `docs/harvest-khaos-machine-tokens.md`,
   citing **#75**. **Do not mint the value.**
9. **Fix the misleading derived-token comment.** `tokens.css:276-280` asserts
   *"illustration-ink points at SEMANTIC tokens, so it flips with the mode."* It flips
   through `--surface-base` **only** — `--text-tertiary` is identical in both theme blocks
   (`:169`, `:232`), so 45% of the mix is a fixed grey. This is **D64's tier violation
   propagating one level down into a hand-written explanation that will mislead the next
   reader**. The text lives in `tokens/tokens.json:355`, so this is a **`tokens.json` edit
   plus `python3 tokens/build-tokens.py`, never a `tokens.css` edit** — that file is
   generated (AGENTS.md). No rendered output changes: **no component consumes
   `--illustration-ink`** (only `tokens/parse.js:210`, the brand Tokens screen and its two
   tests).
10. `docs/decisions.md` — **D64 verbatim, per 9**.
11. `CHANGELOG.md` + `lib-*` tag — section 8.

**Files touched (PR 1)**

- `apps/catalog/src/contrast.test.js` — new (the calculator, 5a)
- `apps/catalog/src/contrast-guard.test.js` — new (the regression guard and its two
  mutation cases, 5c/5c(e)) — **omitted from revision 8's list while §12 asserted against
  it** (m9)
- `apps/catalog/src/data/contrast-audit.json` — new, checked in, **audit-written,
  never read by the guard** (4.1 rule 6)
- `apps/catalog/src/data/contrast-allow.json` — new, checked in, **hand-authored, no
  generator** (5c condition b)
- **29** files under `components/svelte/` — `<style>` blocks only
- `tokens/tokens.json` (the `$description` at `:355`) + regenerated `tokens/tokens.css`
- `docs/decisions.md` (D64), `docs/harvest-khaos-machine-tokens.md`, `CHANGELOG.md`

**No `.svelte.d.ts` regenerate** — `<style>`-only, no prop changes (D59); `check-types`
must still report **58** declarations. **No token minted.** No fixture changes, so D62 is
not engaged.

---

## 8. Adopters — CHANGELOG and a `lib-*` tag

khaos-app pins a **bare SHA** and is already stale (`AGENTS.md`: "24 commits and two
minor versions stale before anyone noticed"). A rendered-colour change across ~24
components would otherwise reach it silently the next time that pin moves.

**`CHANGELOG.md`, `### Changed`** — the substitution and direction; 65 rules across 29 components,
colour-only (no DOM, size, spacing or reading-order change); the WCAG basis with #66's
four ratios; the tier-violation mechanism (3.1); that `--text-tertiary` remains supported
above 24px, on decorative content and on inactive controls; the owed third step (**#75**); and
`RelationshipGraph:147` called out.

**Tag `lib-<next minor>`** — a minor, not a patch: rendered output changes across most of
the library. `lib-*` fires nothing (`AGENTS.md`); it is the marker consumers pin to, and
**a version in a dependency string is something a human can read**, which a bare SHA is
not. Keep the prefixes apart — a `v*` tag ships a signed catalog release whether or not
one was intended.

---

## 9. D64 — verbatim, with the three corrections applied

Inserted at PR 1 step 9. The designer's text, altered **only** by the corrections the
coordinator authorised (1, 2) and the arithmetic correction in 2.4 (3), each marked.

> | D64 | **`--text-tertiary` is withdrawn from text below the 24px large-text threshold across the library — the in-scope rules of 73 in 30 components move to `--text-secondary` — and the resulting two-step type ladder is accepted as an interim, with a third step recorded as owed but not minted** | K | 2026-08-22 | **Scope: text only.** Every measurement here is SC 1.4.3 at 4.5:1 against text rendered at 11px. Non-text uses of `--text-tertiary` — SVG strokes and fills that paint no glyph — fall under SC 1.4.11 at 3:1, are not measured by this row, and are neither changed nor blessed by it. Two such sites were listed as CHANGED during planning and withdrawn: `StoryGraph.svelte:206` (`.storygraph__edge`, a `<path>` at `:111-116`, inside an `aria-hidden` `<svg>` at `:109`, compositing at `opacity: 0.35`) and `PacingChart.svelte:216` (`.pacing__average`, a `<line>` at `:139`, a 1px dashed rule). Their contrast is a compositing result rather than a token-pair ratio, and applying a text bar to them is a category error. They carry as their own finding, **#76**. **In scope and staying in scope** are two sites the audit's selectors nearly missed because the property is not `color`: `RelationshipGraph.svelte:147` — `fill` on a `<text>` element (`:70`) at **10px** (`:146`), the smallest text in the changed set — and `VoiceCatalog.svelte:306`, a `::placeholder`. Both are text; both take 4.5:1. The defect is not dimness but tier violation: `tokens.css:169` and `:232` both set `--text-tertiary: var(--warm-400)`, **one value against four grounds**, while every other member of the semantic text tier flips with the theme. At 11px, where the bar is 4.5:1, it measures 3.29 (dark raised) / 3.61 (dark base) / 4.56 (light raised) / 4.09 (light base) — failing three of four. `--text-secondary` measures 6.86 / 7.53 / 8.29 / 7.44 and clears everywhere. **Hierarchy compresses from three steps to two across most of the library at once**, and the sharpest casualty is `LabeledField`, whose tertiary label (`:46-50`) and secondary value (`:61`) become one colour — the `dl`/`dt`/`dd` structure still carries the relationship for AT, but the visual distinction goes. That is accepted rather than welcomed: it ships now because the contrast failure is live in both themes and a ladder rung is a palette decision carrying Andrew's name, and blocking an accessibility fix on a brand decision inverts the priority. **The third step is owed and its envelope is reported, not minted:** it must be mode-aware (two values — a single one reproduces this bug), must clear 4.5:1 at 11px on both `--surface-base` and `--surface-raised` in its own theme, and must be visibly quieter than `--text-secondary`. Measured windows: dark L ∈ [0.2371, 0.3875), wide; light L ∈ (0.0652, 0.1406], thin — `--warm-400` misses the light bar by ≈0.019 of luminance, which is how it survived review. Filed in `docs/harvest-khaos-machine-tokens.md` and tracked as #75; the value is Andrew's. **`--text-tertiary` is not deprecated.** It stays legitimate above 24px, on genuinely decorative content, under the SC 1.4.3 exemption for inactive controls, and **as a `color-mix` input to a derived token** — a derived value's contrast is a property of the derivation and its ground, not of the token feeding it, so a text audit cannot rule on it and must not delete it. Today that is one token: `--illustration-ink` (`tokens.css:282`, from `tokens.json:360`), **consumed by no component** — its only references are the parser and the brand Tokens screen. The exemption is granted to that derivation by name rather than to the category, because a derived token inherits tertiary's mode-invariance in proportion to its mix: `--illustration-ink` is 45% of a value that is `--warm-400` in both themes (`:169`, `:232`), so it flips only through its `--surface-base` half. **The comment at `tokens.css:276-280` is therefore wrong** where it says *"illustration-ink points at SEMANTIC tokens, so it flips with the mode"* — true of the ground, false of the ink — and is corrected in `tokens.json` and rebuilt, never edited in the generated file. Whether the derivation is *right* is deferred to #75 and not asserted here. And the build must produce a **kept list with each site's computed size**, or the claim is unfalsifiable. **Verification note:** enumeration must be by computed size via `getComputedStyle` in the running catalog, not by reading rules — `ProjectCard.svelte:342-345` sets the colour with no `font-size` and inherits 11px from `:324`, and a rule-local scan misses every site of that shape |

**Corrections applied, for the row's author to confirm:**

1. *(authorised)* `withdrawn from 11px text` → **`withdrawn from text below the 24px
   large-text threshold`**, per the operator's ruling (2.3). Consequentially,
   "stays legitimate above 11px" → **"above the 24px threshold"**. The third-step
   envelope's "clear 4.5:1 at 11px" is **unchanged** — that constraint is about the
   caption tier the step is for.
2. *(authorised)* `~38 rules in 26 components` → **the in-scope rules of 73 in 30
   components**. Exact moved count comes from the audit and is filled at step 2.
3. *(mine — 2.4)* **not 81.** The 8 body-md rules were already inside the 73. The
   coordinator has since confirmed 81 was an arithmetic error, not a scope instruction.
4. *(authorised)* the owed third step is cited as **#75**.

**Both routed corrections came back ruled, and both are now applied verbatim:**

- **5 — Ruling A (was m3): D64 names derived tokens, with a condition.** Applied to the
  *"stays legitimate"* tail. Without it §5(c) reads as "every reference must go", and the
  first person to run it against `tokens.css` either deletes a token or invents a value —
  both worse than the gap.
- **6 — Ruling B: D64 does NOT govern non-text.** A scope line is placed early in the row
  instead. **Refused** on the ground that every number in D64 is a text number at 4.5:1,
  and extending it would assert a bar the designer has not measured over cases whose
  contrast is not even a token-pair ratio — *"Widening a decision's scope to cover cases
  it never measured is precisely the failure I owned two rows ago when D63 counted five
  instances and had three."* Silence was not acceptable either, since silence is what let
  those two get listed as CHANGED; hence the scope line rather than a clause.

**One thing I did not alter:** the row cites `ProjectCard.svelte:342-345`. The rule opens
at `:341` and closes at `:344`; the colour is at `:342`. The inherited `font-size` cite
`:324` is exact. Off by one at each end, immaterial to the argument, left as the designer
wrote it and flagged here rather than edited.

**m2 — two line-number conventions coexist in this plan, and both are correct.** §6 and
§2.1 cite the **rule-open** line (`.project__progress` → `:341`); D63, D64 and §9 cite the
**declaration** line (`:342`). Red-team verified both. A builder cross-referencing them
will read them as contradicting, so: **§6 and §2.1 are rule-open; the decision rows are
declaration.** Neither is changed — the rows are verbatim.

**M3 — #75 published the 81 I refused.** The coordinator corrected the issue body and
recorded the correction as a comment. Noted here because D64 cites #75 and the wrong
figure was public for a period.

---

## 10. Orphaned CSS

PR 1 **removes no rules**. Every rule keeps its selector, usage and other declarations;
only a colour value changes.

**But "no orphan risk" is true of rules and false of declarations (m6).** Two become
provably inert: `ProjectCard.svelte:342` (`.project__progress` would declare the same
colour its `.project__status` parent already sets at `:325`) and `VoiceCatalog.svelte:292`
(`:292`, where the `:focus-within` colour would equal the idle colour — M4). Both are **left in place
and recorded**, not deleted: removing them is a separate judgement about whether the
declaration documents intent, and `VoiceCatalog:292` in particular becomes live again the
moment #75 lands a third rung.

That follows from no migration happening. Had `ProjectCard` migrated, `.project__meta`
(`:346`) would have been deletable and `.project__git` (`:355-357`) would **not** — it
would have had to survive as a wrapper the atom cannot express, itself evidence the
migration was wrong. Recorded, though #68 is now closed.

---

## 11. PR 2 — #68, docs-only

No test. **This gap is not test-shaped** — it is inaccurate descriptions of code. Proved
by the reads in section 1, each cited to `file:line`.

1. Rewrite `MetaStrip.svelte:23-28`. The DEFERRED note describes four migratable runs
   that do not exist. Replace with what is true and why each is out.
2. **D63 amendment 1 — replace the evidence-base sentence** (old: *"five observed
   instances of the item shape…"*), verbatim:

   > Three observed instances of the run shape — `Player.svelte:167-185` (the live consumer), `ProjectCard.svelte:142-148` (five items), `VoiceProfileCard.svelte:36` (four facts hand-joined with `·`, a run with no primitive to be). **Corrected 2026-08-22 (#68):** this originally read five, counting `RequirementList.svelte:108-118` and `ServiceStatusList.svelte:94-101`. Those were miscounted from their CSS — `display:flex` plus a `__meta` class name — and their markup is a value followed by a rendered `<StatusPill>`, which is a different pattern, not this one.

3. **D63 amendment 2 — append to the tone rejection**, verbatim:

   > Re-examined under #68 and upheld. The two sites that appear to need tone render a `StatusPill` (tinted ground, `--radius-sm`, weight 600 — `StatusPill.svelte:26-38`), not toned caption text, so a `tone` field would not host them; only a snippet would, and a snippet makes the atom accept anything, which is the absence of a contract. `ProjectCard.svelte:142-148` is the sole site tone would unlock and it must not migrate regardless: its `.project__footer` is `aria-hidden` at `:137` as part of the **D52 merged unit** — plain `div`, sibling `<button aria-label={title}>` at `:119`, visual text hidden — so the visually-hidden `label` that is this atom's whole accessibility justification is correctly inert there. #68 therefore closes as not-actionable rather than as an API deficiency: the four sites are three different patterns, and the value-plus-trailing-pill shape is its own atom if a third instance ever appears. **Falsification:** if two further surfaces ship without adopting `MetaStrip`, it is a one-consumer component and is reconsidered on that.

4. Close #68 as **not-actionable**, citing 1.1 and amendment 2.
5. Comment on #66: population 73 rules / 30 components (2.4); the body-md tier is in.
6. Cite **#74** (1.2) as separately filed. **Do not fold it in.**

**Files touched**: `components/svelte/MetaStrip.svelte` (comment block only),
`docs/decisions.md`. Plus issue comments.

---

## 12. Verification

Exit codes **un-piped** — piping into `tail` masks them with `tail`'s status.
**0 clean, 1 gaps, 2 could-not-run; a 2 is a RED.**

```sh
cd /Users/k/Projects/khaos.machine/khaotik-ui
npm run check-coverage ; echo "check-coverage: $?"
npm run check-types    ; echo "check-types: $?"
cd apps/catalog && npm test ; echo "test: $?"
```

Acceptance:

- `check-coverage` 0, `check-types` 0, **declarations still 58**.
- Suite green; 69 files; > 872 tests.
- Calculator block green — reproduces **all eight** of D63's ratios (M2) **and** the
  threshold predicate at its boundaries (M5).
- `ProjectCard.svelte:341` present in the audit at 11px (2.5).
- `KEPT` complete: computed size + reason + `file:line` for every entry, **no entry
  reasoned "above 11px"** (2.3).
- All 8 `--body-md-size` rules in `CHANGED` (2.3); **65 rules / 29 components total**.
- **`KEPT` is audit-determined, with six as the expectation — not a hard count.** §6's †
  class (16 inherited rules) can promote into it if the audit resolves one at ≥ 24px, and
  §7 step 2 says the audit wins; asserting a literal six would fail a correct build. The
  criterion is: **every `KEPT` entry carries one of the three `reason` values (F1 part 1)
  and matches the audit's verdict**, and any promotion beyond the expected six is recorded
  in the PR with its computed size. *(This is the C2 contradiction — a hard count fighting
  an audit-wins rule — which C2 fixed for `SectionHeader:45` and left live for the † class.)*
- The audit reports `fill` and `::placeholder` rules rather than dropping them (2.6a), and
  **names any rule from §2.1 it did not reach** (4.1 rule 4).
- The audit artifact declares its schema and its sole writer (4.1 rule 6, 5c).
- The guard does **not** scan `tokens/` (5c condition c′) — `--illustration-ink` survives.
- **The guard's allow-set is `KEPT ∪ NON_TEXT` (8 rules)** read from the hand-authored
  `contrast-allow.json`, and both `offenders` and `missing` are asserted empty (C4).
  CHANGED is **not** in it.
- **Both sides key in AUTHORING selector spelling** (C6). The guard never reads
  `contrast-audit.json`, and no compiled selector appears in either side. Spot-check:
  `.labeled-field__label` matches, not `.labeled-field__label.svelte-1kiqeju`.
- **Key is `component` + `selector` + `occurrence`; grouped selectors split per part;
  traversal is source order, per file, grouped parts left-to-right** (M9, F2).
  `StoryPlayer` `.player__context` (`:334` grouped, `:341` solo) resolves to distinct keys.
- **Key uniqueness is asserted on `contrast-allow.json`, not on `declaring`** (m15) — the
  hand-authored side is the one that can collide.
- **Reconciles in both units: 73 rules / 75 keys, 65 CHANGED rules / 67 CHANGED keys**
  (F4), the divergence being `StoryPlayer:334` and `EditableField:247`, whose partner
  selectors `.player__zoom-label` and `.editable__action` change with them.
- **`reason` is one of three enum values; `offenders` emits human sentences, not
  allow-shaped objects** (F1).
- **All four cases pass (C5, C6, M9).** Case 1 green on real sources — **this is the case
  that fails a guard which names everything**; mutation A reds `offenders`; mutation B reds
  `missing`; **mutation C reds `offenders` on the injected second occurrence — and a
  selector-keyed guard fails it while passing A** (F3). **A guard that stays green under A, or
  that fails case 1, is vacuous and PR 1 does not ship.**
- `contrast-allow.json` has **no generator** — no script writes it (b).
- `contrast-audit.json` carries `generatedBy` / `regenerateWith` (m8); no `NAMED` verdict.
- `tokens/tokens.json:355` corrected and `tokens.css` **regenerated, not hand-edited**;
  `git diff` shows the generated file changing only in that comment block.
- The guard's test file states what it does **not** catch (5c condition d).
- Two-adjacent-rungs list produced (4.4).
- Third-step envelope reported and issue cited, **value not minted** (3.3).
- **Manual, required before merge (4.3):** `cd apps/catalog && npm run dev`, **all 29**
  changed components, **both themes and both grounds**, light-theme darker direction
  confirmed intentional, plus `VoiceCatalog` search focused/unfocused (M4). A green suite proves the ratio; only the walkthrough proves the
  design.

## 13. Open items for red-team

1. **The 73-vs-81 correction (2.4).** I did not propagate 81 into D64. Confirm.
2. ~~Issue number for the owed third step~~ — **resolved: #75**, cited in D64, the harvest
   row and the CHANGELOG (3.3), with 4.4 as its declared input.
3. ~~`RelationshipGraph.svelte:147`~~ — **resolved: in CHANGED** (Ruling B). Its colour
   moves with the rest; its 10px literal stays as a declared gap until #75's neighbour
   lands (2.6).
4. ~~The regression-guard hole~~ — **ruled (C3): the tripwire is worth having and ships
   under the four conditions in §5(c).** My framing of the question was wrong; the
   correction is recorded there rather than quietly dropped.
5. ~~The two non-text rules~~ — **resolved: filed as #76**, cited in D64's scope line and
   in 2.6b. `StoryGraph:206` (a `<path>` in an `aria-hidden` `<svg>`, so possibly exempt
   from SC 1.4.11 outright) and `PacingChart:216`. Out of PR 1; D64 refuses to govern them
   (Ruling B) and carries a scope line instead. **#76 forbids resolving it by moving both
   to `--text-secondary`** — that removes the evidence without fixing the violation.
6. **The catalog's own 32 tertiary sites (m4)** — out of #66's scope, but the catalog is a
   signed shipped app with the same defect. Needs its own issue or an explicit decision
   that it does not get one.
7. **§8's CHANGELOG** does not name *which* components changed and does not say the
   `lib-*` tag is inert, so nothing prompts anyone to move khaos-app's pin. Red-team
   called this a product judgement and declined it; the coordinator is routing it. Left
   as is deliberately.
8. My inventory (2.1) is a source-read and has been wrong three times (2.2) — and has now
   survived a fifth independent method with zero divergence (red-team). It is the plan's
   evidence; the runtime audit is the build's input.
