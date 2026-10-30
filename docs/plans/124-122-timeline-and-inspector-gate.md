# Plan — `durationMs` in the timeline projection, and the inspector gate that never opened (#124, #122)

Branch `fix/124-timeline-durationms`. Library **`0.18.0` → `0.19.0`**.
Proposed decision row: **D75** (see §9 for the id collision with the unmerged
`feat/108-118-parsed-facts` branch).

**Order is the operator's and is not re-decided here: #124 first, #122 second,
one library release.** They share no file. #124 touches
`components/svelte/lib/timeline.js` and `StoryPlayer.svelte`; #122 touches
`CharacterInspector.svelte`. They are sequenced rather than merged because
#124 is a **breaking** change to a published function's input contract and #122
is additive, and a reviewer must be able to see which half a regression came
from.

Planned against the designer's ruling relayed 2026-09-07 (the section band, the
synopsis panel, the tokens) and against #108/#118's established gate rule.
**Both are settled and not re-decided here.** Where this plan adds a decision
neither made, it is marked **[planner]** and carries its grounds.

---

## 0. The trap this plan is built to avoid

This repository has shipped **six vacuous checks**, the most recent inside the
gate written to prevent the fifth (`scripts/check-citations.mjs:12-33`). Two
shapes are forbidden in every test below, stated here so the reviewer can grep
for them:

1. **No test may assert a typedef, a `.d.ts`, or that a prop is accepted.** A
   prop can exist, be typed, be documented, and render nothing — that is #122
   exactly, and it survived review twice.
2. **No test may consist of a bare `queryByText(...) === null` with no positive
   assertion in the same test.** A component that renders nothing at all passes
   every negative assertion ever written against it.

§5 names a **must-red mutation for every test**, and the claim is bounded rather
than universal — the first draft said *"there is none I could not name"*, which
was not literally true and the red-team was right to puncture it. **29 tests are
new and each carries a named mutation. Three entries in §5 are not new tests and
do not carry one:** T11 and T18 are existing tests listed because they become
load-bearing, and T25 names a regression *condition* rather than a mutation.
Those three are marked in place.

**Amended 2026-09-07 against a red-team audit.** Three Criticals, six Majors and
six Minors were raised; every one is resolved below and the resolution is
recorded at the site it changed, not in a changelog at the end. The three
Criticals were: a deletion that took the event accumulator with the dead
fallback (§3d, §3b); a false additivity premise in #122 (§4, §4e); and a fixture
authorised under a D62 widening that does not reach content (§7 S1).

---

## 1. Ground truth — measured, not inferred

Everything in this section was read off the files or quoted from a measurement
recorded on the issues. Nothing is re-derived.

### 1a. What is live today, on khaosd 0.10.0

Measured by the lead against the running daemon,
`FIX__The-Last-Birthday-Card` (#124, comment 3):

```
total seconds: 733
zero-width segments: 29 of 76   (28 sections, 1 scene)
segments with no sceneId entering the timeline: 28
lanes: scenes:76 · action:126 · dialogue:138 · transition:24 · synopsis:7
```

Two defects are **live now**, not pending:

- **28 sections are in the timeline as zero-width scenes with
  `sceneId === undefined`.** `buildTimeline` never reads `kind`
  (`components/svelte/lib/timeline.js:33-53`).
- **A `synopsis` lane of 7 items is rendering.** `buildLanes` appends any
  `elementType` the declared order does not mention
  (`lib/timeline.js:141-146`).

**And a third the lane count hid — the designer's find, and it is worse.**
`contentFor('scenes')` returns `timeline.segments` wholesale
(`lib/timeline.js:134`), so the scenes lane carries all 76 rows *including the
28 sections*, each rendered as a `.player__segment` div at `width: 0`. Each one
still paints `border-left: 1px solid var(--border-default)`
(`StoryPlayer.svelte:454`) and its label sits in an `overflow: hidden`
zero-width box (`:455-457`). **There are 28 unlabelled hairlines on the scene
lane right now, reading as scene cuts that are not scene cuts.**

The 7 synopsis buttons survive at `min-width: 1px` (`StoryPlayer.svelte:488`),
and clicking one **does** put the prose in the panel. Accidental,
undiscoverable, and the only thing on that surface that works today.

**`total` reads correctly at 733s only because sections contribute zero and
zero happens to be the right contribution for a section.** That is luck: the
same path gives a scene the index cannot measure the same zero.

### 1b. What khaosd 0.11.0 does — released 2026-09-07T16:05Z

`duration` → **`durationMs`**, `start` → **`startMs`**, integer milliseconds.
The old keys are **gone**, and khaosd asserts their absence in its own tests.
The workspace pointer already follows 0.11.0; the locally running daemon is
still 0.10.0.

The trace through this file, measured on #124:

```
lib/timeline.js:47   seconds(segment?.duration, offset)   → segment.duration is undefined
lib/timeline.js:17   typeof value === 'number'            → false → returns fallback
                     fallback is `offset`, permanently 0
lib/timeline.js:49   cursor += 0
```

**Every segment zero-width, `total` zero, no error.** khaos-app takes its
Player total from `buildTimeline(...).total`, so it reaches their Player as an
empty project.

### 1c. RFC 0069 §3.1.1 is normative and names this file's guard

> A consumer that decodes this model from JSON **MUST assert that `durationMs`
> is present, and MUST NOT infer a duration from the plausibility of a value.**

`lib/timeline.js:17-18` is that guard, exactly:

```js
function seconds(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}
```

`typeof value === 'number'` **cannot express presence.** It gives the same
answer for `undefined` (the key renamed away) and for `null` (a section, or a
scene the index cannot name). Presence is the only thing that separates them,
and only `'durationMs' in segment` can read it.

### 1d. The element-sum fallback has never worked

Union of every event key across all 76 segments of the release payload (#124,
comment 1):

```
characterId · characterName · elementId · elementType · parenthetical · text
'duration' present on any event: False
```

So `offset` (`lib/timeline.js:38,44`) is permanently `0`, and `:47`'s fallback
resolves to `0` on every segment whose own duration is unusable. The docblock
at `:26` justifies the fallback with *"element durations summed exactly to
segment duration across 9 projects"* — true of the payload **retired at
khaos-manager#287**, which the file header at `:8-9` still describes
(*"joins composition.json + story.json + media.json"*). Both comments outlived
the shape they describe.

**Consequence for element bars, and it is the same defect one level down:**
every event's `duration` is `0` today on live data, so every element bar in
every lane is zero-width and `elementAt` (`:75-82`) already returns `null` for
every time on live data — `time >= start && time < start + 0` is never true.
**That is not a regression this plan introduces; it is a fact this plan makes
visible.** Cited because §3d changes `elementAt`'s inputs and a reviewer will
otherwise read it as new breakage.

### 1e. Two things that make the fix smaller

Both reported by khaos-manager and **retracted from their own earlier
report** rather than left standing:

- `60000 / 250` is **240 exactly**, so `durationMs = wordCount × 240` has no
  remainder for any word count. The 0.0–25.0% drift previously reported against
  `start` is arithmetically impossible in 0.11.0. Our `cursor` accumulator and
  their `startMs` now compute the **identical exact number**, so adopting
  `startMs` and deleting `cursor` is a pure simplification with **no accuracy
  trade** — and it removes one of the two implementations this file's own
  header warns about at `:5-6`.
- The three facts are separable on the wire: a section carries
  `durationMs: null`, a scene the index cannot name carries `null`, and a scene
  **measured below the model's resolution** carries `0`. `THE FINGER`, which was
  `duration: 0` on 0.10.0, is `durationMs: 960` on 0.11.0.

  **Corrected — the first draft called the third *"a scene genuinely measuring
  zero"*, which reverses a correction the issue records.** khaos-manager
  corrected themselves on #124 (comment 2): they had written that the model
  *"genuinely measures zero"* and corrected it to **"below my resolution"**.
  `wordCount × 60 / 250`, integer, no floor — *a four-word beat is not a beat
  that takes no time, it is a beat shorter than the unit can express.* The issue
  then concludes, in the same paragraph, that **the honest rendering of
  `durationMs: 0` may not be a zero-width block at all**, and names the language
  this kit already has for the class: `RequirementList`'s `unknown` verdict and
  #118's `<0.1` floor.

  **The first draft then dropped the fact and justified the drop with
  *"on the current corpus the third no longer occurs"* — which is the exact
  reasoning §3d rejects eleven lines later for `null`: *the unobserved case is
  the one that ships*. Same evidence, opposite conclusion, one section apart.**
  §3d now handles `0` as its own render state rather than routing it. What is
  routed is only the *wording*: #118's `<0.1` floor lives on the unmerged
  `feat/108-118-parsed-facts` branch and is not on `main` (verified —
  `grep` over `components/svelte/` finds no such floor; `RequirementList`'s
  `unknown` is a *verdict* vocabulary, not a duration one), so this plan states
  the fact in its own words and §10 carries reconciling the two phrasings at
  merge.

### 1f. `SceneRow` consumes a third shape

`apps/catalog/src/data/scenes.json` holds **54 rows with `duration` as a
timecode STRING** (`"00:00:23"`). `components/svelte/lib/types.js:258` types
`Scene.duration` as `string`. `SceneRow.svelte:21` is `scene.duration ?? ''`.

**Corrected — the first draft asserted here that `/api/dashboard/scenes`
"serves an integer", under a heading that says *measured, not inferred*, while
§3f said in the same document that the endpoint has not been measured by
anyone.** It has not. What *is* measured is the only real consumer:
`khaos-app/src/domain/dashboard.ts:18` types `SceneSummary.duration` as
`readonly duration?: string`, and `toSceneRow` (`:183-185`) passes it through
unchanged. So the shapes actually on the table are two — the capture's timecode
string and khaos-app's declared string — and the endpoint's 0.11.0 shape is
**unknown**, routed to §10 rather than asserted. §3f decides `SceneRow` on the
contract, which is what makes it decidable without the measurement.

### 1g. #122 — the shipped feature that has never rendered

`CharacterInspector.svelte:161` is `{#if analysis}` and the `stats` MetricCards
are inside it at `:176-179`; with `analysis === null` the component falls to
the three-branch `EmptyState` at `:270-282`. **No project on the corpus has
analysis**, so `stats` has rendered on **zero** characters since it shipped,
while its doc at `:110` describes it as an independent prop. khaos-app's lead
told their operator **twice in writing** that character stats were working,
quoting 153 lines / 1530 words / 21 scenes.

And `:177-178` passes two Phosphor names that do not exist. **Re-verified on
this branch**, `grep -c` against the shipped stylesheets:

| name | `regular/style.css` | `fill/style.css` |
| --- | --- | --- |
| `text-bubble` | **0** | **0** |
| `text-format` | **0** | **0** |
| `text-aa` | 1 | 1 |
| `chat-text` | 1 | 1 |
| `film-slate` | 1 | 1 |
| `list-bullets` | 1 | 1 |
| `file-text` | 1 | 1 |
| `clock` | 1 | 1 |

Two of the three cards render **no glyph**. Nothing caught it because the panel
never renders.

**`CharacterWorkspace.svelte:47-54` returns `{}` when nothing is selected**, and
the prop itself defaults to `{}` (`CharacterInspector.svelte:131`). So a gate
written as the literal `analysis || stats` is **always truthy** and opens the
panel on nothing. §4 does not write it that way.

### 1h. The four facts that render identically — the table this plan cites

Recorded on **#124, comment 2**, and reproduced here because the first draft
cited *"the four §1c facts"* while §1c carried no such list. A plan citing its
own section for content it does not hold is the shape the newest gate
(`check-citations`, #125) exists for — and `docs/plans/` is outside that gate's
scope, so nothing but this correction would have caught it.

| fact | today | honest |
| --- | --- | --- |
| measured below the model's resolution (`durationMs: 0`) | zero-width | *shorter than the unit can express* |
| unmeasured (`durationMs: null`) | zero-width | *unknown* |
| not applicable — a section, not a scene | zero-width | not a timeline block at all |
| **key absent because the wire renamed** | zero-width | **must fail loudly** |

Three of the four are lies; the fourth is the one RFC 0069 §3.1.1 makes
normative. §3d renders all four differently, and §5's T2/T3/T12/T27 are the
tests that hold them apart.

---

## 2. The failing tests that prove the problem, red first

Two, one per issue. Both live in `apps/catalog/src/components/`.

### T1 — #124. Extends the existing surface, `apps/catalog/src/components/timeline.test.js`

There **is** an existing timeline test surface — 144 lines, three `describe`
blocks over `buildTimeline`, `segmentAt`/`elementAt` and `formatTimecode`. It
is extended, not duplicated. **Every one of its `duration:`/`start:` fixtures
is on the retired wire shape and must be migrated in the same step** (§7 S2),
which is itself part of the proof: a suite that still passes unmigrated is a
suite proving the old contract still works.

```js
it('reports a segment whose durationMs key is ABSENT rather than sizing it zero (#124)', () => {
  // RFC 0069 §3.1.1: presence is the only thing that separates "measured at zero"
  // from "I am reading a version that does not carry this key".
  const t = buildTimeline([{ kind: 'scene', sceneId: 'scn_1', label: 'A', duration: 32, start: 0, events: [] }])
  // The positive half — this is a real segment and it is NOT silently dropped.
  expect(t.unreadable).toHaveLength(1)
  expect(t.unreadable[0]).toMatchObject({ index: 0, key: 'durationMs', label: 'A' })
  // And it did not become a zero-width block on the track.
  expect(t.segments).toHaveLength(0)
  expect(t.total).toBe(0)
})
```

**Red today for the plainest reason:** `buildTimeline` returns
`{ total, segments }` and has no `unreadable`, so the first assertion throws on
`undefined`. Today the same input returns one segment of `duration: 32` and
`total: 32` — the old wire read as if nothing had changed, which is the defect.

**This is the hardest acceptance criterion and it is deliberately the first
test.** The failure #124 exists to remove is *silent*, and a silent failure is
proved only by an assertion on the loud channel.

### T2 — #122. New file, `apps/catalog/src/components/character-stats-gate.test.js`

```js
it('renders the stat cards with no analysis, and still says analysis has not run (#122)', () => {
  const { container } = render(CharacterInspector, {
    props: { analysis: null, stats: { lines: 153, words: 1530, scenes: 21 }, isSelected: true },
  })
  // The cards ARE on screen — this half must pass, or the assertion below is vacuous.
  expect(screen.getByRole('group', { name: 'Lines' }).textContent).toContain('153')
  expect(screen.getByRole('group', { name: 'Words' }).textContent).toContain('1530')
  // And the panel still says the other axis is missing.
  expect(container.textContent).toContain('There is no analysis for this character yet.')
})
```

**Red today** because `analysis === null` falls to the `EmptyState` branch and
`getByRole('group', { name: 'Lines' })` throws. `MetricCard` is
`role="group" aria-label={label}` (`MetricCard.svelte:20`), which is what makes
`getByRole('group', …)` the positive handle throughout §5 — it *throws* when the
card is absent, and that is what makes every negative half in the same test
safe.

---

## 3. Fix approach — #124

### 3a. The shape

`buildTimeline` becomes a **decoder with a report**, and the report is the loud
channel RFC 0069 asks for:

```js
export function buildTimeline(segments = []) → { total, segments, sections, unreadable }
```

- **`segments`** — `kind !== 'section'` only, each with `start` and `duration`
  in **seconds**, `null` preserved where the wire said `null`.
- **`sections`** — the `kind === 'section'` rows, with `start` (seconds),
  `level`, `label`, `sectionId`, `events`, and a computed `span` (§3c).
- **`unreadable`** — one entry per segment missing a required key:
  `{ index, key, kind, label, sceneId?, sectionId? }`.
- **`total`** — the greatest `start + duration` over `segments`, in seconds.
  Sections do not contribute; they own a *range of scenes*, not a duration.

**The presence assertion is `'durationMs' in segment`, not a typeof.** That is
the whole point of §1c: `typeof` cannot tell a renamed-away key from a `null`,
and `null` is the correct, expected value on 28 of 76 rows.

`startMs` is asserted the same way. **[planner]** The RFC names only
`durationMs`; asserting `startMs` too is this plan's addition, and the grounds
are structural: §3b deletes `cursor`, so `startMs` stops being a
cross-check and becomes the *only* source of position. A value you have made
load-bearing and do not assert is the guard you just deleted, wearing a
different key. If the architect prefers the RFC's literal scope, T4 is the test
that changes.

### 3b. `seconds()`, `cursor` and the element sum are all deleted

- **`seconds()` (`:17-19`) is deleted.** It is the plausibility guard the RFC
  forbids, and it is the only one in the repository on a duration —
  `grep -rn "typeof.*=== 'number'" components/svelte/` returns two hits and the
  other is `lib/compose.js:129` on a layout `at`, unrelated.
- **`cursor` (`:34,49`) is deleted.** Position comes from `startMs`. §1e is why
  this is free: the two now compute the identical exact number.
- **The element-sum FALLBACK is deleted — `:47`'s second argument only. The
  accumulator at `:38,44` SURVIVES.** §1d is why the fallback goes: no
  composition event has ever carried a duration, so `offset` has never once
  produced a non-zero fallback value.

  **Corrected, and this was the audit's first Critical.** The first draft wrote
  *"the element-sum fallback (`:38,42,44,47`) is deleted"*, which bundles two
  different things under one name. `:44` is `offset += duration` — the
  **cumulative offset accumulator that positions events WITHIN a segment**. It
  is not the fallback. The fallback is `:47`'s `seconds(segment?.duration,
  offset)` *using* `offset` as its fallback value. Deleting the fallback does
  not require deleting the accumulator, and deleting the accumulator would
  remove the behaviour that `timeline.js:24-25` and
  `StoryPlayer.svelte:237-240` both exist to protect — *"segment-relative left
  would stack every scene's beats on top of each other at the start."*

  **After the change:** `:47` stops falling back at all and asserts `durationMs`
  presence instead (§3a). `:38` (`let offset = 0`) and `:44` (`offset +=
  duration`) stay, with `duration` now read from the event's `durationMs` when
  the key is present and contributing `0` to the accumulator when it is not.
  §3d states the event rule in full and §5's T31/T18 pin it.
- **`formatTimecode` (`:91-98`) keeps a `Number.isFinite` clamp, and that is
  not a plausibility guard.** **The grounds are corrected — the first draft
  called its argument *"a scalar from the host's own clock
  (`StoryPlayer.svelte:177,216,278`)"* and `:278` is
  `formatTimecode(shown.start + shown.duration)`, both halves projected from
  JSON, as are `:253` and `:259`.** The conclusion survives on a different and
  better ground: `formatTimecode` takes a **computed scalar, never a JSON field
  read by key**. Presence is a property of a key in an object; an argument has
  no key, so there is no presence for it to assert and `Number.isFinite` is a
  range clamp rather than a plausibility inference. The existing behaviours —
  `formatTimecode(undefined) === '0:00'`, `formatTimecode(-5) === '0:00'`
  (`timeline.test.js:141-142`) — are unchanged and their tests stay green
  untouched. **Stated explicitly because deleting `seconds()` and leaving a
  `Number.isFinite` two functions down looks inconsistent, and a reviewer is
  right to ask.**

  Note the consequence for §3d: because `:278` reads projected values, it is a
  `null`-arithmetic site and appears in §3d's table. It is not a clock site.

### 3c. Sections leave the lane system at the SEGMENT level — the designer's ruling

**Relayed verbatim and not re-decided.** A synopsis is not a lane and a section
is not a lane item. Sections are partitioned out in `buildTimeline`, **before
`buildLanes` ever sees them**.

**`buildLanes` is therefore untouched.** Its extras rule (`:117-119,141`) keeps
the guarantee it was written for — a genuinely new *element* kind (`sound`,
`shot`) still gets its own lane rather than being dropped. It reasons about
`event.elementType`; a section arrives on a different axis, `segment.kind`.
**The synopsis lane is a segment-axis fact leaking into an element-axis
function**, so the fix is upstream of the leak. D66: two axes get two items,
never a merge.

The three defects in §1a fall out of one change:
`contentFor('scenes')` returns `timeline.segments`, which no longer holds
sections, so the 28 zero-width hairlines go with them and the synopsis lane
goes with them.

**Sections render as a band above the ruler, one row per `level`** (1 = act,
outermost; deeper = sequence). Span is computed, because `durationMs: null` is
honest: a section owns a range of scenes, not a duration. **`span` is computed
in `buildTimeline`, not in the component**, so the component does no time
arithmetic, which is what the file header at `:5-6` exists to prevent.

**The span rule, corrected. The first draft said
*"`nextSectionStartAtSameLevel − thisStart`, and the last one at a level runs to
`total`"*, and that is wrong below level 1** — it has no notion of a parent, so
the last level-2 sequence inside ACT I spans through Acts II and III. A child
must be clamped by its parent's end.

> **`span` = the start of the next section at the same level **or shallower**,
> minus this section's start. If there is no such section, `span` runs to
> `total`.**

*"Or shallower"* is the whole correction and it is what supplies the missing
parent notion: a level-2 sequence is terminated by the next level-2 sequence
**or** by the next level-1 act, whichever comes first, and the next level-1 act
*is* its parent's end. The rule needs no parent pointer because the flat
level-ordered list already encodes containment.

This lands in the published projection, not in the render, so an overhang is a
wrong number a consumer reads rather than a visual glitch a playtest catches.
**T8 exercised only level 1 and would have passed the overhang untouched**;
T26 is added for the nested case.

**The synopsis prose never renders on the track.** It is `.player__panel`'s
text when a band is selected, through a **new** `selectedSectionId` /
`onSelectSection` pair — not `selectedElementId`, because reusing that id
merges the two axes D66 separates.

**21 of 28 sections carry no synopsis** on this project (7 synopsis elements,
28 sections). The band is still drawn and still selectable; the panel states
there is no synopsis. **One new string, not a new component:**
`There is no synopsis for this section.`

**Cost, accepted here rather than discovered in review:** two band rows cost
~52px at the existing `--lane-h` (`StoryPlayer.svelte:363`, `26px`, a
component-local custom property and not a design token); sections with no
synopsis are still drawn, because a visible act boundary is worth more than the
prose; and `shown` in the panel gains a second source — a real complication,
chosen over the simpler merge because the merge is what D66 rules against.

**The plan is written so the designer's ruling could still change without
restructuring.** Whichever of *band*, *lane*, or *filtered out* is finally
wanted, the projection is identical: `timeline.sections` exists and carries
`start`, `span`, `level` and its events. Only the consumption in
`StoryPlayer.svelte` moves.

### 3d. `null` durations are preserved, never coerced

`duration: null` on a scene means *the index cannot measure this*. Today it
renders as a zero-width block, which asserts *this scene takes no time* — a
lie, and one of the four facts in §1h's table that currently render
identically. **The first draft cited these as "the four §1c facts"; §1c carries
no such list — it is on #124, comment 2, and §1h now reproduces it here so the
plan holds what it cites.**

- **The projection preserves `null`.** `duration` on a built segment is
  `number | null`. **This is part of the break** (§9): a consumer that did
  `segment.duration * scale` gets `0` from `null * scale` — silently.
- **`StoryPlayer` must therefore branch, not multiply.** A `null`-duration
  segment renders as a **fixed-width unmeasured marker**, not a proportional
  block, because a proportional width cannot be drawn from a value that does
  not exist. Its accessible text says so.
- **`segmentAt` / `elementAt` skip `null`-duration rows.** `time < start + null`
  is `time < start`, which is false for every `time >= start` — the current code
  gets the right answer for the wrong reason. Make the guard explicit so a
  later refactor cannot lose it.
- **On the release corpus this state does not occur** — 28 nulls, all sections;
  zero null scenes (§1e). It is planned for anyway because the wire permits it
  and because the whole point of #124 is that the unobserved case is the one
  that ships.
- **`durationMs: 0` is a THIRD render state, not a fourth name for zero-width.**
  §1e: `0` means *below the model's resolution*, not *takes no time*. It is a
  real measurement, so it enters `segments` with `duration: 0` and it is **not**
  the unmeasured marker — T3 already forbids the projection from collapsing `0`
  and `null`, and the render must not re-collapse what the projection separated.
  A `0`-duration scene renders as a **minimum-width below-resolution marker**,
  its own CSS class, whose accessible text says the scene is shorter than the
  projection's unit can express. **Distinct from the `null` marker in class and
  in wording**, because *unknown* and *smaller than I can measure* are different
  claims and #124's whole table (§1h) is about not merging them. T27 pins it.
  The wording is reconciled with #118's `<0.1` floor at merge (§10), not here.

**Event durations — corrected, and this is the second half of the audit's first
Critical.** The first draft said *"each event gets `start` = its segment's
`start`"*, flatly. That is the accumulator deletion arriving as a behaviour, and
it is a **new wrong answer rather than the preserved `null` this section
promises**: a consumer that supplies `durationMs` on events — the exact forward
case this paragraph prepares for — would get every event in a segment starting
at the same time, so `elementAt` would return the **first** event of the segment
for every time inside it. That is the wrong beat, silently, which
`timeline.js:69-74` exists to forbid, and `khaos-app/src/app/player.svelte.ts:1`
imports `elementAt` and `segmentAt` to drive its Player panes.

**The rule, stated properly:**

- **An event whose `durationMs` key is PRESENT** gets `duration = durationMs /
  1000` and `start = segmentStart + offset`, where `offset` is the running sum
  of the preceding events' durations in that segment — the accumulator at
  `timeline.js:38,44`, kept (§3b).
- **An event whose `durationMs` key is ABSENT** gets `duration: null`, keeps its
  place in the order at the offset reached so far, and contributes `0` to the
  accumulator. It renders as the same unmeasured marker as a `null`-duration
  scene: one treatment, one CSS class, one statement.
- **An absent event `durationMs` is NOT an `unreadable` entry.** The presence
  assertion of §3a is on **segments** — the composition model's timed rows,
  which is what RFC 0069 §3.1.1 is normative about. Events carrying no duration
  is this wire's shape *today*, on every one of the 264 events in the release
  payload (§1d); asserting presence on them would put every composition into
  `unreadable` and fire T13's loud statement on healthy data. **Stated because a
  builder applying the assertion uniformly is the obvious mistake here, and it
  would turn the loud channel into noise on the first real project.**
- `elementAt` returns `null` for a `null`-duration event rather than the
  neighbouring one — **which is what it already does on live data today**
  (§1d), and exactly what its docblock at `:72-73` promises: *"a gap is reported
  rather than papered over."*

**This correction is what makes T18 true.** Under the first draft's rule the
existing layout blocks could not pass on the migrated fixture — eight assertions
would have gone red (`timeline.test.js:48,49,101`;
`StoryPlayer.test.js:56-57,104,120-125,182,200`) and the plan named none of
them. With the accumulator kept and events reading `durationMs` when present,
those assertions hold on the migrated fixtures unchanged, and T18's step gate in
S3 means what it says.

**Three sites in `StoryPlayer` currently do arithmetic that `null` breaks
silently** and each must branch:

| line | today | with `null` |
| --- | --- | --- |
| `:231` | `style:width={`${segment.duration * scale}px`}` | `null * scale === 0` — a zero-width block, the exact lie |
| `:252` | `style:width={`${event.duration * scale}px`}` | same |
| `:253` | `title={`… · ${event.duration}s`}` | renders the string `nulls` |
| `:278` | `formatTimecode(shown.start + shown.duration)` | `start + null === start` — renders `1:20 – 1:20` |

**`durationMs: 0` breaks none of these four arithmetically** — `0 * scale` is a
valid `0`, `start + 0` is a valid timecode — which is precisely why it needs its
own render branch rather than a `null` guard. **A state that survives every
arithmetic check and still renders a lie is the state this issue is about**, and
it is the one an implementation gets to green while never having looked at.

### 3e. The unit boundary — and why the hop clause is satisfied

**`durationMs` / `startMs` in, seconds out.** One conversion, at the decode
site. The published surface keeps `start` and `duration` in **seconds**,
because `scale` is px/second (`StoryPlayer.svelte:52`), `currentTime` is
seconds (`:50`), `formatTimecode` takes seconds, and khaos-app's Player reads
`total` in seconds.

RFC 0069's hop clause says an intermediary *"keeping the old key and converting
the unit reintroduces exactly the invisible defect the rename exists to
remove."* **That does not apply here, and the distinction is worth stating
because a red-team will raise it:** our key's unit has **not changed**. It was
seconds before and is seconds now. There is no silent unit change on our wire
for a consumer to be caught by. What *has* changed on our wire is that
`duration` may now be `null` — which is not a unit change, and is called out as
breaking in §9.

**The first draft called that change *"compile-visible in the shipped `.d.ts`"*.
It is not, and the audit is right that this is the one mitigation the plan
offered for the silent half of the break. Measured on this branch and on the
consumer:**

- **The shipped declaration cannot express it.**
  `components/svelte/lib/timeline.d.ts:13-16` is
  `buildTimeline(segments?: any[]): { total: number; segments: any[] }`. A
  `null` inside `any[]` is invisible to `tsc` by construction. `segmentAt`,
  `elementAt` (`:23`, `:30`) return `any`.
- **And khaos-app does not read it anyway.**
  `khaos-app/src/vite-env.d.ts:71-109` **shadows the entire module** with a
  hand-written `declare module '@khaos-machine/khaotik-ui/components/svelte/lib/timeline.js'`
  block — written, by its own comment, *because* the shipped types are `any`. In
  it, `duration: number` is **required** on both `TimelineEvent` (`:75`) and
  `TimelineSegment` (`:98`).

**So the break is invisible to the only consumer's compiler twice over.**
khaos-app can pull `lib-0.19.0`, keep a green `tsc`, and get `null * scale === 0`
at runtime — an empty Player timeline, which is the exact failure #124 exists to
make loud, arriving in the release that fixes it.

**Consequence, stated rather than mitigated:** the `lib-0.19.0` Release notes are
the **only** channel that reaches khaos-app. Regenerating our `.d.ts` (S7) does
not help while their declaration shadows it, and this plan does not edit a peer
repository. **§10 files an issue against khaos-app** to delete the shadowing
block or update it — that issue is the mitigation, and it is a separate piece of
work with its own owner.

The raw `durationMs` / `startMs` survive on the passed-through object (the
existing `{ ...segment }` spread keeps them), so a consumer that wants
milliseconds has them under the name that says so.

### 3f. `SceneRow` — decided **[planner]**

**`SceneRow` accepts a display string, and only a display string.**
`lib/types.js:258` already types it `string` and the committed capture already
holds 54 timecode strings. **The rule also ratifies the only real consumer:**
`khaos-app/src/domain/dashboard.ts:18` types `SceneSummary.duration` as
`readonly duration?: string` and `toSceneRow` (`:183-185`) passes it through
unchanged. So this is not a new constraint imposed on anyone — it is the
contract three of three parties already keep, written down.

**Grounds.** `SceneRow` is a presentational atom. It does not decode JSON, so
RFC 0069 §3.1.1 places no obligation on it — the obligation is on the decoder,
and the decoder is the consumer that called `/api/dashboard/scenes` and knows
what unit it asked for. Converting seconds to a display string is one call to
the already-exported `formatTimecode`.

**Rejected: accept a number and treat it as seconds.** It renders a plausible
timecode for a millisecond value after the endpoint renames — inferring a unit
from the plausibility of a value, which is the precise thing #124 exists to
delete. It would be the same defect, in a new component, in the same release.

**What the build does:** widen the JSDoc at `SceneRow.svelte:8` and
`lib/types.js:258` to say *a preformatted display string; a numeric duration is
the caller's to format, e.g. through `formatTimecode`*, and add **T28** pinning
the behaviour. **`/api/dashboard/scenes` on 0.11.0 has not been measured by
anyone**, here or on #124 — so a follow-up issue is filed to measure it rather
than guessed at in this plan (§10).

**Three corrections here, all the audit's, and the third punctures §0's original
claim outright:**

1. **The test number collided.** T13 was already the StoryPlayer
   unreadable-statement test in §5. This one is **T28**, in its own table.
2. **The test the first draft named was false against the code.** It said *"a
   non-string renders nothing"*, but `SceneRow.svelte:21` is
   `scene.duration ?? ''` and `:35` is `{#if duration}<span>{duration}</span>`,
   so `duration: 23` is truthy and **renders `23`**. A non-string does not
   render nothing; it renders its own `toString`. The honest test is therefore
   not a null-check but a **non-formatting** assertion: `'00:00:23'` renders
   `00:00:23`, and `23` renders `23` and **not** `0:23`. That pins the actual
   contract — *the component displays, it does not convert* — which is the thing
   the doc is being widened to say, and the thing a later "helpful" tidy-up
   would break.
3. **There is no `SceneRow.test.js`, and §8 added none.** It is created in this
   plan (`apps/catalog/src/components/SceneRow.test.js`) and added to §8 and to
   S6's gate. **§3f's original *"nothing changes in the code except the doc"*
   was therefore true of the source and false of the change** — the change
   includes a new test file, which is where the contract actually becomes
   enforceable. A doc-only edit to a component nothing tests is not a decision
   being landed; it is a decision being written down and left unguarded.

### 3g. The comments that are false

- **`lib/timeline.js:8-9`** — *"joins composition.json + story.json +
  media.json"*. Retired at khaos-manager#287. Replace with the 0.11.0 shape,
  naming `kind`, `durationMs`, `startMs`, `sectionId`, `level`.
- **`lib/timeline.js:26`** — *"element durations summed exactly to segment
  duration across 9 projects"*. **False, and the field has never existed**
  (§1d). Delete with the fallback it justifies.
- **`StoryPlayer.svelte:43` (`Lane` typedef), `:53` (the `lanes` `@property`)
  and `:70-80` (the in-body comment)** all describe extras as covering anything
  the engine adds. They must say **sections are not lanes**, and why (§3c).
  `check-types` fails until the `.d.ts` is regenerated (S7).
- **`check-citations` cannot catch any of these** — it reads root `*.md` plus
  `docs/*.md` only, and its own header says so: *"the `timeline.js` docblock
  that was false for months stays out of scope"*
  (`scripts/check-citations.mjs:36-40,54-56`). These are fixed by hand and
  reviewed by hand.

---

## 4. Fix approach — #122

**It inherits the rule #108/#118 established** (`docs/plans/108-118-parsed-facts.md`
on branch `feat/108-118-parsed-facts`, §3): the panel gates on
`analysis || <facts>`, **the existing `{#if}` branches inside are untouched**,
and **the analysis-absence statement must survive when the facts are present**.

**Issue #122 states only that the branches are untouched. The first draft
appended a parenthetical of its own — *"each already omits itself when `analysis`
is null, which is what makes this additive"* — and that premise is FALSE for two
of the blocks.** It is the audit's second Critical, it is this plan's error and
not the issue's, and it would have shipped the widened gate as a visible
regression on **every character on the corpus**. §4e decides the two blocks; the
rest of §4 stands.

### 4a. `hasStats`, not bare truthiness

The gate at `:161` becomes `{#if analysis || hasStats}`. **Not
`analysis || stats`:** `stats` defaults to `{}` (`:131`) and
`CharacterWorkspace.svelte:47-49` returns `{}` at rest, both truthy, and the
panel would open on nothing — §1g. This mirrors `hasParsed` in the #108/#118
plan and uses the same expression:

```js
const hasStats = $derived(
  Object.values(stats ?? {}).some((v) => v !== undefined && v !== null && v !== ''),
)
```

`0` survives (`0 !== ''` under `!==`) — a character with zero lines is a
measurement, and the whole family of defects this file records
(`:180-186`, the `goals` comment) is about not erasing a real count.

### 4b. The absence statement

`{#if !analysis}<p class="inspector__unanalysed">There is no analysis for this
character yet.</p>{/if}`, placed directly above the stat row so the absence
frames what follows.

**The sentence is the existing three-state language, verbatim**
(`CharacterInspector.svelte:279`). Not the `EmptyState` component: it is a hero
that centres and pads `--spacing-xl`, so it cannot host a populated panel. The
existing three-branch `EmptyState` block (`:270-282`) survives **unchanged**
for the case where both are absent.

**It renders independently of `isSelected`.** "This character" refers to the
character whose counts are on screen — a fact about the payload the caller
handed over, not a claim about selection. D66's furthest-position-known-to-be-true
still holds.

### 4c. `isSelected` and the tri-state are not touched (D71)

`CharacterInspector.svelte:113-127` carries the standing instruction *"Do NOT
infer this from `stats`, `images` or any other payload."* `stats` is now a
render gate as well as a payload; the instruction is unchanged and the typedef
edit does not weaken it. `CharacterWorkspace.svelte:75` keeps
`isSelected={Boolean(selectedName)}`.

**`stats` is NOT renamed to `parsed`.** #122's body floats it; it is a breaking
rename of a consumed prop, it needs its own decision, and `feat/108-118-parsed-facts`
has not merged so there is nothing to be consistent *with* yet. Routed to §10.

### 4d. The two icons

`icon="text-bubble"` → **`chat-text`** (Lines) and `icon="text-format"` →
**`text-aa`** (Words), both verified 1/1 against `regular/style.css` and
`fill/style.css` on this branch (§1g). `film-slate` (Scenes) is already correct
and is left alone. **`chat-text` for Lines** because a line of dialogue is
speech, and `text-aa` for Words because it is the kit's typographic glyph —
both are the names the #108/#118 plan settled on for the same two quantities
(its §4c), so the two inspectors will not drift into different glyphs for the
same fact.

**What T24 does and does not prove — stated because the first draft implied a
mechanism that does not exist.** It said *"nothing caught it because the panel
never renders."* That is true but it is not the reason the harvester missed it.
`apps/catalog/src/icon-inventory.js:11-12` promises a glyph *"cannot be rendered
without appearing here"*, and it misses these for an unrelated and much wider
reason: `ICON_PROP` at `:66` is `/\bicon:\s*([^,\n}]+)/g`, which **requires a
colon**. `CharacterInspector.svelte:177` is `icon="text-bubble"` — an
**attribute**, not an object key. Measured on this branch:

```
grep -rhoE 'icon="[a-z0-9-]+"' components/svelte/   →  31 attributes, 21 distinct names
```

**None of the 21 reaches the sheet**, so the module's own lede is false about the
library's own components. T24 pins two strings and cannot tell a real Phosphor
name from an invented one; it catches this regression and no other.

**Widening the harvester is OUT OF SCOPE for this plan, deliberately.** It is a
change to a catalog gate's matching rules, it would add ~21 names to the sheet at
once, and it belongs with whoever owns that gate rather than riding a library
release. **§10 files it.** Stating the mechanism here rather than leaving *"the
panel never renders"* standing, because the first version reads as *this was a
one-off and the sheet works now*, and the sheet does not.

### 4e. The two blocks that do NOT omit themselves — decided **[planner]**

Measured, not assumed. With `analysis: null` and `stats` populated, the widened
gate at `:161` opens the panel, and two blocks inside it render regardless:

- **`CharacterInspector.svelte:163-168`, the `{#if showName}` head.** `showName`
  defaults to **`true`** (`:131`) and `name` is `analysis?.name ?? ''` (`:135`),
  so with no analysis it renders `<Portrait name="" gender=undefined
  age=undefined>` and an empty `<h2 class="inspector__name">`. **A portrait of
  nobody above the stat cards.**
- **`CharacterInspector.svelte:266-268`, the `Reference` / `Visual development`
  `AnalysisCard` wrapping `<Gallery {images} …>`.** **Wholly unconditional**,
  with `images` defaulting to `[]` (`:131`). An empty titled card wrapped around
  nothing, below three stat cards.

**As planned, #122 would have shipped every character on the corpus with an
empty portrait, a blank name, and an empty Reference card. T19–T25 catch none of
it** — T25 explicitly reasons that the existing tests pass no `stats` and so
never reach the widened branch, which is exactly why it cannot see this.

**This is D72's ruling arriving one level up: a composer inherits its children's
claims, and some of those claims become false when the composer's own condition
changes.** The gate at `:161` was the children's guarantee that `analysis`
existed. Widening it withdraws that guarantee, and every child that relied on it
must now carry its own.

**The decision, and it is the strictly-additive form in both cases:**

| block | becomes | with `analysis` truthy |
| --- | --- | --- |
| `:163` head | `{#if showName && (analysis \|\| name)}` | identical to today — the second operand is truthy |
| `:266` Reference card | `{#if analysis \|\| images.length > 0}` | identical to today — the first operand is truthy |

**Why this shape rather than gating on `analysis` alone.** Both conditions are
written so that the *stats-only* path can still light them up if the caller has
something real to show: a caller who passes a `name` gets a header, a caller who
passes `images` gets the gallery. Gating on bare `analysis` would hard-wire
"analysis is the only thing worth rendering", which is the assumption #122
exists to remove — it would fix the regression by re-introducing the defect one
block over.

**Verified additive, not asserted additive:** with `analysis` truthy each
expression reduces to today's condition exactly, and **no existing test asserts
either block** — `grep -n "showName\|inspector__name\|Reference\|Gallery\|Portrait"`
over `CharacterInspector.test.js` and `inspector-empty-states.test.js` returns
nothing on this branch. T29 and T30 are the new tests, and each pairs its
negative half with a positive one so it cannot pass on a component that renders
nothing.

**`stats` carries no name and no images**, so on the stats-only path both
conditions are false by construction rather than by luck — which is the property
that makes them safe to state as a contract rather than as a patch.

---

## 5. Every test, with its must-red mutation

`#124`'s tests extend `apps/catalog/src/components/timeline.test.js` and
`StoryPlayer.test.js`. `#122`'s go in a new
`apps/catalog/src/components/character-stats-gate.test.js`, the cross-component
convention `inspector-empty-states.test.js` already uses.

### #124 — the projection

| # | Test | Must-red mutation |
| --- | --- | --- |
| **T1** | §2 — an absent `durationMs` is reported in `unreadable`, the segment does not enter `segments`, `total` is 0 | Restore `typeof value === 'number'`. `unreadable` is empty and the segment is sized from `duration: 32`. **This is the criterion test.** |
| **T2** | `durationMs: null` on a **scene** → the segment IS in `segments`, `unreadable` is empty, and its `duration` is `null` — not `0` | Coerce with `?? 0`. The `toBeNull()` half fails. Paired positively: the segment is present, so this cannot pass on a component that dropped it. |
| **T3** | `durationMs: 0` and `durationMs: null` produce **different** `duration` values on two otherwise identical scenes | Any coercion collapses them and the two read equal. This is the distinction RFC 0069 §3.1.1 exists to protect, and no single-value assertion can catch it. |
| **T4** | An absent `startMs` is reported in `unreadable` with `key: 'startMs'` | Assert only `durationMs` (the RFC's literal scope). `unreadable` is empty and the segment lands at `start: undefined`. **This is the [planner] decision in §3a; if the architect narrows to the RFC's literal scope, this is the test that is deleted.** |
| **T5** | `startMs` is USED: three scenes whose `startMs` values are **not** the cumulative sum of their `durationMs` land at the wire's starts, not at the accumulated ones | Reintroduce `cursor`. Both readings agree on well-formed data (§1e), so a fixture where they agree proves nothing — the fixture must disagree deliberately. |
| **T6** | `kind: 'section'` rows are in `sections` and **absent** from `segments`; a 3-section/2-scene fixture gives `segments.length === 2` and `sections.length === 3` | Drop the `kind` partition. `segments.length` is 5. |
| **T7** | `buildLanes` over that fixture yields **no `synopsis` lane**, and the `scenes` lane has 2 items not 5 — paired with a positive assertion that the `action` lane IS present | Restore sections to `segments`. Both halves fail. The positive half is what stops this passing on a `buildLanes` that returns nothing at all. |
| **T7b** | `buildLanes` **still** gives an unknown *element* kind its own lane — an event with `elementType: 'sound'` appears as a `sound` lane | Filter extras in `buildLanes`. The designer's ruling is explicit that the extras rule is not weakened; without this test, "fix the synopsis lane" invites exactly that. |
| **T8** | `sections` carry a computed `span`: level-1 sections span to the next level-1 section, and the last spans to `total` | Set `span` to the section's own `durationMs`. Every span is `null`. Assert both the middle and the last section — the last-section case is a separate branch. |
| **T9** | `total` is the greatest `start + duration` over scenes, and a trailing `kind: 'section'` row does **not** extend it | Include sections in `total`. On a fixture whose last row is a section with `startMs` past the last scene's end, `total` grows. |
| **T10** | Empty/malformed: `buildTimeline([])`, `buildTimeline()`, `buildTimeline([{}])` → `{ total: 0, segments: [], sections: [], unreadable: [...] }`, and `[{}]` produces an `unreadable` entry rather than a silent drop | Return early on a falsy segment. `unreadable` is empty and a malformed row vanishes — a silent drop, the family this issue is about. |
| **T11** | `formatTimecode` — the existing block (`timeline.test.js:126-143`) is **unchanged and stays green** | *(EXISTING TEST, no new mutation.)* Replace the `Number.isFinite` clamp with nothing and `formatTimecode(undefined)` throws or renders `NaN:aN`. Listed so a reviewer knows it is load-bearing after `seconds()` is deleted. |
| **T26** | **NEW (M1).** `span` is clamped by the parent: a fixture of ACT I (level 1) containing two level-2 sequences, then ACT II (level 1). The **last level-2 sequence inside ACT I spans to ACT II's start, not to `total`** | Use `nextSectionStartAtSameLevel` without the "or shallower" clause — the first draft's rule. The last sequence's span runs through Acts II and III and the assertion fails. **T8 exercises only level 1 and passes the overhang untouched, which is why this is a separate test and not another assertion in T8.** |
| **T31** | **NEW (C1).** Events keep their **cumulative offset within a segment**: one segment whose three events carry `durationMs` lands them at distinct, increasing `start`s — and `elementAt` at a time inside the **second** event returns the second, not the first | Delete the accumulator at `timeline.js:38,44` and give every event its segment's `start` — the first draft's rule. All three events share a `start`, `elementAt` returns the first for every time in the segment, and both halves fail. **The `elementAt` half is the point: a shared start is not a visual defect, it is the wrong beat returned silently to `khaos-app/src/app/player.svelte.ts`.** |

### #124 — the render

| # | Test | Must-red mutation |
| --- | --- | --- |
| **T12** | A `null`-duration scene renders **one** `.player__segment` carrying the unmeasured class, and its `style.width` is **not** `'0px'` — paired with a positive assertion that a well-formed neighbouring scene renders at `duration × scale` px | Keep `style:width={`${segment.duration * scale}px`}`. `null * scale` is `0`, width is `0px`, and the first half fails while the neighbour still passes — which is why the neighbour is in the same test. |
| **T13** | A composition with any `unreadable` entry renders the **unreadable statement** and **not** `This project has no composition yet.` — both asserted | Order the branches with `{#if total === 0}` first (`StoryPlayer.svelte:194`). `total` is 0 in this state, so the empty-project copy wins and the operator is told the project is empty when it is not. **The highest-value render test in the plan; this is the failure mode the whole issue is about, reproduced one layer up.** |
| **T14** | The section band renders one row per `level`, with the act label on it, and the band rows are **above** the ruler in DOM order | Render bands inside the lane loop. The DOM-order assertion fails while the label assertion still passes. |
| **T15** | Clicking a band calls `onSelectSection` with the `sectionId` and **not** `onSelect` | Wire the band to `onSelect`/`selectedElementId`. Both halves fail — the merge D66 rules against. |
| **T16** | With `selectedSectionId` set to a section that HAS a synopsis, the panel shows the synopsis text; with one that does not, it shows `There is no synopsis for this section.` — two renders, both asserted | Render the synopsis unconditionally. The second render shows an empty panel and the string assertion fails. **21 of 28 sections are the second case** (§3c), so this is the common path, not the edge. |
| **T17** | The scene lane contains exactly as many `.player__segment` nodes as there are scenes — paired with a positive count assertion, not a `queryBy…` null | Restore sections to the scenes lane. The count is scenes + sections, which is §1a's 28 phantom hairlines. |
| **T18** | The existing `StoryPlayer.test.js` layout block passes on the migrated fixture: bars at `scale × seconds`, absolute starts, lane-major order | *(EXISTING TESTS, no new mutation.)* Its `SEGMENTS` constant is migrated to `durationMs`/`startMs` in S3. If it still passes **unmigrated**, the old contract still works and T1 is a lie. Named as a step gate in S3, not only as a test. **This entry was false as first written and is true only because of C1's correction** — under the first draft's event rule, `:56-57`, `:104`, `:120-125`, `:182` and `:200` would all have been red on the migrated fixture, with `timeline.test.js:48,49,101`. See §3d. |
| **T27** | **NEW (M2).** `durationMs: 0` on a scene renders the **below-resolution** marker — its own class and its own accessible wording — and **not** the `null` unmeasured marker, asserted in the same test against a `null`-duration neighbour that renders the unmeasured one | Render `0` through the `null` branch, or through the ordinary `duration × scale` branch. The first collapses the two markers the projection separated (T3's distinction, thrown away one layer up); the second gives a `0px` block, the original lie. **Both halves are positive assertions on distinct classes, so this cannot pass on a track that renders nothing.** |

### #122

| # | Test | Must-red mutation |
| --- | --- | --- |
| **T19** | §2 — cards on screen with `analysis: null` **and** `There is no analysis for this character yet.` present | Delete the `{#if !analysis}<p>` block: the two positive halves pass, the third fails. Revert the gate to `{#if analysis}`: `getByRole('group', { name: 'Lines' })` throws. **Two distinct mutations, each caught.** |
| **T20** | The statement does **not** render when `analysis` IS present — paired with a positive assertion that the analysis summary is on screen | Render the `<p>` unconditionally. |
| **T21** | `stats: {}` and `isSelected: true` → the `EmptyState` renders (`No analysis` heading **and** its description) and `queryByRole('group', { name: 'Lines' })` is null | Gate on bare `analysis \|\| stats`. `{}` is truthy, the panel opens on nothing, the heading query fails. **§1g's trap, pinned.** |
| **T22** | `stats: { lines: 0, words: 0, scenes: 0 }`, no analysis → the panel opens and the Lines group contains `0`, not `—` | `Object.values(...).some(Boolean)` in `hasStats`, or `stats.lines \|\| '—'` on the card. Either renders the em-dash or closes the panel; both halves fail. |
| **T23** | `stats: { lines: 153 }` alone → the Lines group reads `153`, the Words group **exists** and reads `—` | Guard the individual card with `{#if stats.words !== undefined}`. `getByRole('group', { name: 'Words' })` throws — a removed card is indistinguishable from a component that does not measure the thing. |
| **T24** | The three cards carry **existing** Phosphor names: assert `container.querySelector('.ph-chat-text')` and `.ph-text-aa` and `.ph-film-slate` each resolve | Restore `text-bubble` / `text-format`. Two selectors return null. **This is the one test in the plan that asserts a class name rather than a role, and the grounds are that a missing glyph has no accessible name to query — `Icon` is `aria-hidden` (`Icon.svelte:29`). Named as a deliberate exception so a reviewer does not read it as a slip.** |
| **T25** | The existing `inspector-empty-states.test.js` and `CharacterInspector.test.js` stay **green untouched** | *(REGRESSION CONDITION, not a mutation — marked, because the first draft's blanket claim counted it as one.)* They pass no `stats`, so `hasStats` is false and the `EmptyState` branch is reached exactly as before. If any of it reddens, the gate moved further than this plan intends. **T25 cannot see §4e's regression** — it never reaches the widened branch — which is why T29 and T30 exist. |
| **T29** | **NEW (C2).** `analysis: null` + populated `stats` → the Lines group is on screen (positive) **and** `container.querySelector('.inspector__name')` is null **and** no `Portrait` renders | Leave `{#if showName}` as it is. The header renders with an empty `<h2>` and a `name=""` portrait, and the two negative halves fail while the positive half still passes — which is what makes the pairing load-bearing here rather than decorative. |
| **T30** | **NEW (C2).** Same props → the Lines group is on screen (positive) **and** no `Reference` / `Visual development` card renders. Second render in the same test: `images: [{…}]` with `analysis: null` → the card **does** render | Leave the `AnalysisCard` unconditional. The first negative half fails. The second render is what stops the fix being "gate it on `analysis`" — that would pass the negative half and break the images path, and no other test would notice. |

### #124 — `SceneRow` (§3f)

New file, `apps/catalog/src/components/SceneRow.test.js` — **there is none today.**

| # | Test | Must-red mutation |
| --- | --- | --- |
| **T28** | **NEW (M3).** `scene: { duration: '00:00:23' }` renders `00:00:23`; `scene: { duration: 23 }` renders `23` and **not** `0:23` — the component displays, it does not convert | Call `formatTimecode` inside `SceneRow`. The first assertion still passes and the second fails, which is the whole point: a "helpful" conversion is invisible to the string case and only the numeric case can see it. **Replaces the first draft's T13, which collided with the StoryPlayer unreadable test and asserted *"a non-string renders nothing"* — false, because `:21` is `scene.duration ?? ''` and `:35` is `{#if duration}`, so `23` is truthy and renders.** |

**Count.** **29 tests are new and each carries a named must-red mutation.** Three
entries above are not new tests and are marked in place: **T11** and **T18** are
existing tests listed because they become load-bearing, and **T25** names a
regression condition. **32 rows across the four tables, 29 of them new.** The
first draft had 26 rows (T1–T25 plus T7b), claimed a mutation for every one, and
added *"there is none I could not name"* — it was 23 new, not 26, and §3f's T13
was both a number collision and a false assertion. §0 now states the bound
instead of the absolute.

---

## 6. Tokens — every `var(--…)` proposed, verified present on this branch

Nothing is invented and **no `font-weight` is hand-set.**

| token | file:line | value |
| --- | --- | --- |
| `--text-primary` | `tokens/tokens.css:167` (dark) / `:230` (light) | `var(--warm-50)` / `var(--warm-900)` |
| `--text-secondary` | `tokens/tokens.css:168` / `:231` | `var(--warm-300)` / `var(--warm-500)` |
| `--border-default` | `tokens/tokens.css:177` / `:240` | `var(--warm-600)` / `var(--warm-200)` |
| `--caption-size` | `tokens/tokens.css:147` | `11px` |
| `--body-md-size` | `tokens/tokens.css:146` | `13px` |
| `--spacing-2xs` | `tokens/tokens.css:122` | `4px` |
| `--spacing-xs` | `tokens/tokens.css:123` | `8px` |
| `--radius-sm` | `tokens/tokens.css:129` | `4px` |
| `--tone-danger` | `tokens/tokens-extra.css:28` | `var(--status-alarm-fg)` |

**Two the designer named as traps: `--surface-sunken` and `--border-subtle` do
not exist. Anyone reaching for them is inventing one.** Verified — neither
appears in `tokens/tokens.css` or `tokens/tokens-extra.css`.

**`--tone-accent` is deliberately avoided** for the section band: a passive
structural band is not an accent, and gold is reserved for the brand and
primary actions (`AGENTS.md`, Conventions).

**Theme handling.** The band uses
`color-mix(in oklab, var(--text-primary) N%, transparent)`, which is what
`.player__segment` already does at `StoryPlayer.svelte:455` — theme-correct by
construction, which is why the existing blocks need no `[data-theme]` rule and
the new ones will not either.

**Citation correction, recorded rather than silently fixed:** the designer's
ruling cited `StoryPlayer.svelte:446` for the `color-mix` background, `:445`
for the segment `border-left` and `:481` for `min-width: 1px`. On this branch
they are **`:455`, `:454` and `:488`**. Same declarations, offset by nine lines.
The build uses the verified numbers.

**Four new rules, all in `StoryPlayer.svelte`'s existing `<style>` block:**
`.player__band` (the band row), `.player__band-item` (one section),
`.player__segment--unmeasured` / `.player__event--unmeasured` (§3d's `null`
marker), and **`.player__segment--below-resolution`** (§3d's `durationMs: 0`
marker — a *separate* rule with a minimum width, because collapsing it into the
unmeasured class re-merges in CSS the two facts T3 separates in the
projection).
**One new rule in `CharacterInspector.svelte`:** `.inspector__unanalysed`,
identical to the one the #108/#118 plan defines for the other two inspectors,
so the three panels say it in one voice.

```css
.inspector__unanalysed {
  margin: 0 0 var(--spacing-2xs);
  font-size: var(--body-md-size);
  color: var(--text-secondary);
}
```

**None of this is visible to a rendered test** — jsdom resolves no stylesheets,
and `token-refs.test.js` matches only `var(--…)`. D73's precedent applies: the
declarations are proved by a **source read over the stripped `<style>` block**,
with a must-red mutation per declaration and a negative control proving the
test matches the pairing rather than the file.

---

## 7. Ordered steps, each with the gate that proves it

Run from the repository root unless noted. **There are seven gates now**
(`check-citations` was added by #125), and `gates.yml` runs them in this order:
the catalog's test suite, then `check-coverage` (which chains `check-catalog`,
`check-taxonomy`, `check-consumer`, `check-compile`), then `check-types`, then
`check-citations`. `gates / gates` is a required status check on `main` with
`strict: true`.

**Every gate exits 0 clean, 1 on gaps, and 2 when it could not run — a 2 is a
red, not a pass.** `check-taxonomy` is the one to watch: its regexes want an
exact fixture shape, so reformatting a fixture header drops the entry from the
check and the gate reports **2** rather than quietly passing a smaller set.
**Do not reflow the `id:` / `name:` / `section:` / `group:` lines of any
fixture entry.**

### S1 — NO hand-authored 0.11.0 catalog fixture. Unit tests carry the shape.

**Reversed against the audit's third Critical, and the error was in the brief
this plan was given: D62's content boundary does NOT widen.** The first draft
authorised a hand-authored composition fixture *"under D62 as widened by D74"*.
D74 widens the *scope* of the exception and nothing else. `docs/decisions.md:182`,
verbatim:

> **Scope:** state matrices only — **Amended by D74**, which widens the
> exception to any catalog example including screen examples, under these same
> three unchanged conditions. **The content boundary in the next sentence does
> not widen. A fixture that shows *content* — a screenplay, a character, a
> voice — is still capture-or-report-the-gap, with no exception.**

**A composition of acts, scenes, sluglines and synopsis prose is a screenplay
fixture.** It is the content case in its purest form, and the first draft's
defence — *"no content is fabricated, the prose is quoted"* — does not reach it:
the boundary is on **what the fixture shows**, not on where each field came
from. Quoting real prose into a hand-assembled composition produces a screenplay
no daemon ever emitted, made of real sentences.

**And this repository has already ruled on this exact case, at the exact site
the first draft proposed to edit.** `apps/catalog/src/fixtures.js:329-334`:

> Nothing here is typed in by hand — the real-data rule, and **D62's
> illustrative exception does not reach it (that is scoped to state matrices;
> this is content).**

**So §11.4's fallback is promoted to the plan.** The D62 justification is
deleted rather than argued down, because there was never a widening to lean on.

**What the build does instead:**

- **No catalog example for the 0.11.0 shape at all.** Every 0.11.0 assertion
  lives in the unit tests (T1–T18, T26, T27, T31), where a hand-built payload is
  a **test input** — an argument to a function under test — rather than a fixture
  claiming to be a capture. That distinction is the whole reason the real-data
  rule has a catalog scope and not a repository scope, and invented props are
  already the norm there (`SceneInspector.test.js:5-9`).
- **The `story-player` entry keeps two examples, both honest:**
  - **`Unreadable — pre-0.11.0 capture`** — `compositionData.segments`, the
    **real committed capture**, rendering the loud statement. Zero fabrication,
    and it puts the §1b failure on the catalog's own surface where it can be
    looked at.
  - `No composition` — `segments: []`, unchanged.
- **`At rest` and `Playing` are removed**, because the committed capture is
  pre-0.11.0 and the new decoder correctly refuses it. **This is a real loss —
  the playtest surface for a populated player goes away until a 0.11.0 capture
  exists — and it is accepted rather than engineered around.** Reporting the gap
  is what the rule asks for; the catalog now shows the gap instead of a
  reconstruction of what the gap hides.

**What unblocks it, named precisely so the next reader does not re-derive it.**
A real capture is blocked on **the local daemon being 0.11.0**, and on nothing
else. It is **not** blocked on #123: `fetch-kspd.sh:148-163`, the composition
block, is khaosd-only (no `khaos-tools parser query`), writes through a temp
file, and overwrites only when `segments | length > 0` — a guard added after the
2026-08-16 incident where every project returned `{"segments":[]}`. **That block
is safe to run today; it would simply capture 0.10.0.** §10 carries restoring
the two examples once the daemon moves.

**Why a fresh 0.10.0 capture is not taken now:** it would give real `kind` and
real sections with the **wrong duration keys**, so the decoder would report it
unreadable — which the *existing* committed capture already demonstrates, at no
churn. The committed `apps/catalog/src/data/composition.json` predates sections
entirely — measured on this branch: **54 segments, key union
`duration · events · label · sceneId`, rows carrying `kind`: 0.**

**`apps/catalog/src/data/` is not touched by this plan**, which was D62's third
condition and remains true for a stronger reason: there is now no fabrication
anywhere to keep out of it.

<details>
<summary>Superseded — the first draft's D62 argument, kept so the reversal is auditable</summary>

**A capture was considered and cannot produce this fixture. The reason is
version, not safety.**

- **`fetch-kspd.sh:148-163`, the composition block, is safe to run and is NOT
  affected by #123.** It is khaosd-only (no `khaos-tools parser query`), writes
  through a temp file, and overwrites only when `segments | length > 0` — a
  guard added after the 2026-08-16 incident where every project returned
  `{"segments":[]}`.
- **But the running daemon is 0.10.0 and the fix targets 0.11.0.** A fresh
  capture would give real `kind` and real sections with the **wrong duration
  keys**, and rewriting those keys into a file called a capture would be
  fabricating a payload no daemon ever sent. The committed
  `apps/catalog/src/data/composition.json` predates sections entirely —
  measured on this branch: **54 segments, key union
  `duration · events · label · sceneId`, rows carrying `kind`: 0.**

**So the fixture is hand-authored from the payloads recorded verbatim on #124,
under D62 as widened by D74, and it lives in `apps/catalog/src/fixtures.js` —
never under `apps/catalog/src/data/`.** That directory is the capture
directory, and D62's third condition forbids editing it to carry fabrication.

**Which condition each value satisfies, stated per D62's three:**

| D62 condition | How this fixture meets it |
| --- | --- |
| **1. The fabrication is declared in a comment at the fixture itself** | A comment at the constant naming khaosd 0.11.0, the #124 comment thread as the source, the date, and the fact that the local daemon is 0.10.0 so no capture of this shape exists on this machine. |
| **2. Every value is instantiated from the engine's own format string or payload shape, never invented prose** | The section row (`kind`, `position`, `sectionId`, `level`, `label: "ACT I"`, `durationMs: null`, its `synopsis` event and that event's text), the scene row, and the `THE FINGER` row with `durationMs: 960` are **quoted from the payloads recorded on #124**. `startMs` values are the engine's own exact arithmetic — `durationMs = wordCount × 240`, integer, no remainder, and `startMs` the exact cumulative sum (§1e) — so a *computed* `startMs` is the only internally consistent one; a quoted-but-inconsistent value would be a payload no daemon could emit. **The comment must label each value `quoted` or `computed by the engine's stated rule`.** No prose is invented: every label and every synopsis sentence is quoted. |
| **3. The live capture is never edited to carry it** | `apps/catalog/src/data/composition.json` is **not touched by this plan.** |

**D74's widening is what authorises it:** the exception covers *states the
capture cannot reach*, and a 0.11.0 payload is unreachable from a 0.10.0
daemon. **D62's content boundary is not crossed**, because no content is
fabricated — the labels and the synopsis prose are the project's own, quoted.

**Why this was wrong:** the content boundary is on what the fixture *shows*, not
on the provenance of each field, and D74 never touched it. See the top of S1.

</details>

`openingSegment`, `openingSpeaker` and `storyDuration`
(`apps/catalog/src/fixtures.js:335-346`, feeding the `MetaStrip` examples at
`:1106-1123`) read the capture **directly**, not through `buildTimeline`, and
are unaffected. **Do not "fix" them to the new keys** — they describe the file
they read.

**Gate:** `cd apps/catalog && npx vitest run src/fixtures.test.js` green, and
by hand: `grep -c '"kind"' apps/catalog/src/data/composition.json` still `0`
(the capture was not edited).

### S2 — red, the projection

Migrate every fixture in `apps/catalog/src/components/timeline.test.js` to
`durationMs`/`startMs`/`kind`, and add T1–T11, T26 and T31.

**Two existing tests are DELETED, not migrated. Named here because the first
draft said only "migrate every fixture", which left S4's gate unreachable
without deletions the plan never authorised — and that puts the builder in the
position of deciding what to delete.** Both assert behaviour this plan
deliberately removes:

| test | asserts | why it goes |
| --- | --- | --- |
| `timeline.test.js:75-78` — *"falls back to the element sum when the engine omits a duration"* | `buildTimeline([{ events: [{duration:7},{duration:3}] }]).segments[0].duration === 10` | The element-sum **fallback** is deleted (§3b). A segment with no `durationMs` is now an `unreadable` entry and does not enter `segments` at all — T1 is the replacement and asserts the opposite outcome. **Migrating it is impossible: there is no key rename that preserves an assertion about a fallback that no longer exists.** |
| `timeline.test.js:80-85` — *"treats a missing or negative duration as zero rather than inventing one"* | `events.map(e => e.duration)` is `[0, 0]` | §3d makes a missing event duration **`null`**, not `0`. The test's own stated intent — *do not invent a value* — is what the change serves; `0` was itself the invented value, and T2/T3 carry the intent forward correctly. |

**A third survives migration and is KEPT — flagged because the audit was right
to raise it and the resolution depends on C1.** `timeline.test.js:117-123`,
*"reports a gap rather than snapping to a neighbour"*, builds a 100s segment
holding one 10s event and asserts `elementAt(gappy, 50)` is null while
`segmentAt` is not. Under the first draft's event rule this would have survived
as a **green test proving nothing** — every event would have shared its
segment's start with `duration: null`, so `elementAt` returns null for reasons
that have nothing to do with a gap. **With C1's correction it proves exactly
what its name says**, because the event's `durationMs` is present and bounded.
It is therefore a second, independent guard on the accumulator, and it must be
migrated rather than deleted.

**Gate:** `cd apps/catalog && npx vitest run src/components/timeline.test.js` —
red, and red **for the stated reason** (a missing `unreadable`, a section in
`segments`), not on an import error. A suite that errors before executing
proves nothing.

### S3 — red, the render

Migrate `StoryPlayer.test.js`'s `SEGMENTS` constant and add T12–T18 and T27.

**No deletions here — the existing layout and panel blocks are all kept**, and
that is a claim C1's correction makes true. Under the first draft's event rule
eight of their assertions would have been permanently red on the migrated
fixture and the plan named none of them: `:56-57` (lane lefts), `:104` (the 1s
beat), `:120-125` (the panel following the playhead), `:182` (`onSeek(20)`) and
`:200` (*"at 0:20"*). With events keeping their cumulative offsets (§3d), a pure
key migration preserves every one.

**Gate:** `npx vitest run src/components/StoryPlayer.test.js` — red. **And the
step's real gate: the existing layout block must be red on the migrated
fixture and green again only after S4/S5.** If it passes while unmigrated, the
old contract still works. **If any of the eight assertions above is still red
after S4/S5, the accumulator was deleted with the fallback** — that is C1
reproduced, and the fix is §3b, not the test.

### S4 — `lib/timeline.js`

Delete `seconds()`, `cursor` and the element-sum **fallback** (`:47`'s second
argument). **KEEP the event accumulator at `:38,44`** — §3b, and it is the one
edit in this step a reviewer must check by eye, because deleting it compiles,
passes T1, and silently returns the wrong beat. Add the presence assertions **on
segments only, never on events** (§3d), the `kind` partition, `sections` with
`span` clamped by the parent (§3c), `unreadable`, and the ms→s conversion.
Rewrite the file header (`:8-9`) and the `buildTimeline` docblock (`:26`).
**`buildLanes` is not edited.**
**Gate:** `npx vitest run src/components/timeline.test.js` green, T1–T11, T26
and T31 all passing. `buildLanes`'s own tests (T7, T7b) green **without a change
to that function** — if it needed one, the partition is in the wrong place.
**And by hand: `grep -n 'offset' components/svelte/lib/timeline.js` still finds
the accumulator.**

### S5 — `StoryPlayer.svelte`

The band above the ruler with its gutter row, `selectedSectionId` /
`onSelectSection`, the panel's synopsis branch and its no-synopsis string, the
unreadable statement **ordered before the `total === 0` branch at `:194`**, the
four `null`-safe sites in §3d's table, the **below-resolution branch for
`duration: 0`** (§3d), the **four** new style rules — `.player__band`,
`.player__band-item`, the `--unmeasured` pair, and `--below-resolution` — and
the comment corrections at `:43`, `:53`, `:70-80`.
**Gate:** `npx vitest run src/components/StoryPlayer.test.js` green; then
`cd apps/catalog && npm test` — the whole suite, including `a11y-state`,
`list-row-keys`, `duplicate-string-keys` and `regressions`.

### S6 — #122, `CharacterInspector.svelte`

`hasStats`, the widened gate at `:161`, the absence statement, the two icon
names at `:177-178`, the `.inspector__unanalysed` rule, and the `stats`
`@property` at `:110` restated to say it renders independently of `analysis`.
**And §4e's two conditions — `:163`'s head and `:266`'s Reference card — which
are the difference between #122 shipping and #122 shipping a regression on every
character on the corpus.**
**`isSelected` and its typedef paragraph at `:113-127` are not touched.**

**Also in this step, §3f's doc-only edits and their new test:**
`SceneRow.svelte:8`, `lib/types.js:258`, and the new
`apps/catalog/src/components/SceneRow.test.js` carrying T28.

**Gate:** `npx vitest run src/components/character-stats-gate.test.js
src/components/SceneRow.test.js
src/components/CharacterInspector.test.js
src/components/inspector-empty-states.test.js` — the first two green, the other
two green **and unmodified**.

### S7 — declarations

`npm run build-types`. Two `.d.ts` change: `StoryPlayer.svelte.d.ts` (two new
props, the `Lane` doc) and `CharacterInspector.svelte.d.ts` (the `stats` doc).
**Gate:** `npm run check-types` — its own gate, outside `check-coverage`, run
it yourself. Exit 0. Commit the regenerated files; they are never hand-edited
(D59).

### S8 — catalog fixtures and taxonomy

The `story-player` entry's examples (S1). No new export, so
`components/svelte/index.js` is untouched and neither gate sees a new surface.
**Gate:** `npm run check-catalog`, then `npm run check-taxonomy` — **expect
exit 0; a 2 means a header line was reflowed** — then `npm run check-consumer`,
then `npm run check-compile`. Or `npm run check-coverage` for all four in
order.

### S9 — version, register, docs — **UNGUARDED**

**No gate reads the root `package.json` version.** `check-coverage`,
`check-types`, `check-citations` and the test suite are all silent on it, and
**#43 shipped without its bump because no plan step carried it.** This step is
the carrier.

1. `package.json` `"version": "0.18.0"` → `"0.19.0"`. **Do not touch**
   `apps/catalog/package.json` (`0.0.0`, a workspace stub) or
   `apps/catalog/src-tauri/tauri.conf.json` — the catalog versions
   independently on its own `v*` tag.
2. `docs/decisions.md` — the **D75** row (§9).
3. `docs/using-the-library.md:367` — the `StoryPlayer` row says *"one lane per
   element kind (scenes, action, dialogue, transition, audio), sized by
   duration"*. It must say sections are a band and not a lane, and name
   `selectedSectionId` / `onSelectSection`.
4. `components/svelte/SceneRow.svelte:8` and `lib/types.js:258` — §3f's doc.

**Hand-checks, named because nothing automated will catch these:**

```
node -p "require('./package.json').version"                 # 0.19.0
grep -c '^| D75' docs/decisions.md                          # 1
grep -n 'selectedSectionId' docs/using-the-library.md       # documented
git diff --stat                                             # no unintended file
grep -rn "duration\b" components/svelte/lib/timeline.js     # no bare `duration` read off a wire segment
```

### S10 — the full gate set, in the order CI runs it

```
cd apps/catalog && npm test
cd ../.. && npm run check-coverage
npm run check-types
npm run check-citations
```

---

## 8. Files to touch

| File | Change |
| --- | --- |
| `components/svelte/lib/timeline.js` | delete `seconds`/`cursor`/the element-sum **fallback at `:47`**; **KEEP the accumulator at `:38,44`** (§3b); presence assertions **on segments only**; `kind` partition; `sections` + parent-clamped `span`; `unreadable`; ms→s; header `:8-9` and docblock `:26` rewritten. **`buildLanes` NOT edited.** |
| `components/svelte/StoryPlayer.svelte` | section band + gutter row; `selectedSectionId` / `onSelectSection`; panel synopsis branch + no-synopsis string; unreadable statement ordered before `:194`; four `null`-safe sites; **the `duration: 0` below-resolution branch**; **four** style rules; comment corrections `:43`, `:53`, `:70-80` |
| `components/svelte/CharacterInspector.svelte` | `hasStats`; gate `:161`; absence statement; **`:163` head condition and `:266` Reference-card condition (§4e)**; icons `:177-178`; one style rule; `stats` doc `:110` |
| `components/svelte/SceneRow.svelte` | JSDoc only (§3f) |
| `components/svelte/lib/types.js` | `Scene.duration` doc only (§3f) |
| `components/svelte/StoryPlayer.svelte.d.ts`, `CharacterInspector.svelte.d.ts` | **generated** by `npm run build-types`; never hand-edited (D59) |
| `apps/catalog/src/components/timeline.test.js` | fixtures migrated + T1–T11, T26, T31; **`:75-78` and `:80-85` DELETED** (S2) |
| `apps/catalog/src/components/StoryPlayer.test.js` | fixture migrated + T12–T18, T27. **No deletions** (S3) |
| `apps/catalog/src/components/character-stats-gate.test.js` | **new** — T19–T24, T29, T30 |
| `apps/catalog/src/components/SceneRow.test.js` | **new** — T28. There is no such file today (§3f) |
| `apps/catalog/src/fixtures.js` | the `story-player` examples reduced to `Unreadable` + `No composition`. **No hand-authored 0.11.0 constant** (S1, C3). **Headers not reflowed.** |
| `package.json` | `0.18.0` → `0.19.0` |
| `docs/decisions.md` | D75 |
| `docs/using-the-library.md` | `:367` |

**Not touched, deliberately:** `apps/catalog/src/data/composition.json` and
every other capture (D62 condition 3); `components/svelte/lib/timeline.js`'s
`buildLanes` (§3c); `CharacterWorkspace.svelte` (`stats` already flows and
`isSelected` is correct); `SceneInspector.svelte` / `LocationInspector.svelte`
(`feat/108-118-parsed-facts` owns them); `MetricCard.svelte`, `Icon.svelte`,
`EmptyState.svelte` — **atoms are consumed, not modified**;
`components/svelte/index.js` — no new export.

---

## 9. The version bump, and the decision row

### 0.19.0, not 1.0.0

**#124 is unambiguously breaking.** `buildTimeline`'s input contract changes
(`durationMs`/`startMs` required, `duration`/`start` no longer read), its
return shape grows two members, and `segment.duration` becomes
`number | null` where it was always `number` — a change a consumer feels
silently, since `null * scale === 0`.

**It still ships as 0.19.0.** Grounds:

1. **Semver 0.y.z means the public API is not declared stable.** A break in
   `0.x` bumps the minor. This library has done exactly that before: D58 is
   recorded as *"the first deliberate break"* and shipped as `0.2.0`.
2. **1.0.0 is a promise this library cannot make today.** npm publishing is
   still pending (O7). **Corrected: the first draft said khaos-app *"pins a bare
   SHA"*. It does not — `khaos-app/package.json:26` pins
   `git+ssh://…/khaotik-ui.git#lib-0.18.0`, a readable version tag, which is
   exactly what `AGENTS.md` asks for.** So this ground loses the half that
   argued consumers cannot read a version; they can. What survives, and is
   enough on its own, is §3e: **the consumer's compiler cannot see the break at
   all**, because our shipped `.d.ts` is `any` and khaos-app shadows the module
   with a declaration requiring `duration: number`. A stability declaration on a
   surface whose only consumer type-checks against a hand-written copy of it is
   a claim about a contract nobody is actually reading.
3. **The wire underneath has renamed its screen-time keys twice in three
   weeks.** Declaring 1.0.0 on a projection of a payload still in motion
   asserts a stability the upstream does not have.

**The break is communicated by a `lib-0.19.0` Release with the break named in
its notes, not by the number.** `AGENTS.md` already says a bare tag is not a
release and a draft is not published.

### D75, and an id collision to route rather than resolve

`docs/decisions.md` on `main` ends at **D74** (`grep -oE '\bD[0-9]{1,3}\b'
docs/decisions.md | sort -u -V | tail -1`), landed with #43. **D75 is the next
free id and this change wants a row** — it changes what a lane *means* (lanes
are element kinds; spans are not lanes) and it adds a selection axis.

**The unmerged `feat/108-118-parsed-facts` branch also proposes D75 and also
proposes 0.19.0.** The operator ruled #124 first, so on this branch D75 and
0.19.0 are ours. **Whether that branch rebases to D76/0.20.0 is its planner's
call and the operator's, not this plan's** — flagged here so it is not
discovered at merge.

**The D75 row must carry:** the presence assertion and why `typeof` cannot
express it (RFC 0069 §3.1.1); the deletion of the plausibility guard, the
element sum and `cursor`, each with the measurement that killed it; the
segment-axis partition and why `buildLanes` was left alone (D66, two axes);
the band-not-lane ruling with its accepted ~52px cost; the second selection
axis; **`null`, `0` and absent each preserved as a distinct render state**
(§1h's four facts); **that D62's content boundary does NOT widen under D74, so
the 0.11.0 shape lives in unit tests and the catalog loses its populated
story-player example until a 0.11.0 capture exists** (S1); and #122's gate
widening — with the false-icon fix **and §4e's two conditions**, without which
the widening is a regression rather than a fix.

---

## 10. Open with the operator — routed, not decided

1. **Band always-on, or toggleable?** The designer recommends **always-on** in
   this change. Product call, Andrew's. The plan works either way: a toggle is
   a prop over a band that already renders.
2. **Does selecting an act scope the lanes below it to that act's range?** The
   designer recommends **no scoping in this change**, as a separate capability.
   Product call, Andrew's. `timeline.sections` already carries `start` and
   `span`, which is everything a scoping filter needs, so adding it later
   touches the component and not the projection.
3. **`stats` → `parsed` on `CharacterInspector`?** #122's body floats it. A
   breaking rename of a consumed prop, and `feat/108-118-parsed-facts` has not
   merged so there is nothing to be consistent with yet. **Not in this plan.**
4. **`/api/dashboard/scenes` on 0.11.0 has not been measured by anyone.**
   §3f decides `SceneRow` on the contract, not on the endpoint. File an issue
   to measure it; do not guess it here.
5. **`AGENTS.md` says "library 0.12.0" while `lib-0.18.0` is released.** Stale.
   Boyscout, but **separable and flagged rather than assumed** — and the
   catalog half of that sentence is not verified here.

**Issues this plan FILES rather than routes as questions — added against the
audit, because each was a gap the first draft either mitigated falsely or left
unnamed.**

6. **Against `khaos-app`: delete or update the shadowing timeline declaration.**
   `khaos-app/src/vite-env.d.ts:71-109` hand-declares
   `@khaos-machine/khaotik-ui/components/svelte/lib/timeline.js` with `duration: number`
   **required** on both `TimelineEvent` (`:75`) and `TimelineSegment` (`:98`).
   After `lib-0.19.0` that is false and `tsc` cannot know it — `null * scale`
   renders their Player empty with a green build. **This is the only mitigation
   for §3e's silent break and it is not ours to make**; it is a peer repository,
   read-only from here (`AGENTS.md`, workspace boundary). File it, and name it
   in the `lib-0.19.0` Release notes so the two arrive together.
7. **Against this repo: `icon-inventory.js` cannot see `icon="…"` attributes.**
   `ICON_PROP` (`:66`) requires a colon, so **31 literal attributes across 21
   distinct names never reach the sheet**, while `:11-12` promises a glyph
   *"cannot be rendered without appearing here"*. **Out of scope here** — it is a
   catalog gate's matching rules, not a library release — but the module's lede
   is false until it is fixed, and #122's two dead glyphs are what it should
   have caught. §4d has the measurement.
8. **Against this repo: restore the story-player's populated examples once the
   local daemon is 0.11.0.** S1 removes `At rest` and `Playing` because the
   committed capture is pre-0.11.0 and no hand-authored composition may replace
   it (D62's content boundary). `fetch-kspd.sh:148-163` is safe to run and is
   **not** blocked by #123 — the blocker is the daemon version and nothing else.
9. **Wording: reconcile the below-resolution string with #118's `<0.1` floor.**
   §3d gives `durationMs: 0` its own marker and its own words. #118's floor is
   the kit's existing language for the same class but lives on the unmerged
   `feat/108-118-parsed-facts` branch. **Whichever merges second reconciles the
   two**; neither plan should guess the other's string.

---

## 11. Risks, stated rather than discovered in review

1. **The branch-order trap at `StoryPlayer.svelte:194`.** In the unreadable
   state `total` is `0`, so an unreadable composition reads as *"This project
   has no composition yet"* — the original defect, moved up one layer and
   wearing new copy. **T13 is the only thing that catches it.** Highest
   probability of any risk here, because the correct-looking edit produces it.
2. **`null * scale === 0`.** Every arithmetic site that meets a `null` duration
   fails *silently and plausibly*. §3d's table names four; a fifth found during
   the build must be added to that table, not fixed quietly.
3. **`elementAt` will return `null` for every time on live data** (§1d). That
   is true today and a reviewer may read it as new breakage. Cited in the
   docblock so the next reader does not re-litigate it.
4. **RESOLVED, not a risk — the hand-authored fixture is gone.** This risk read
   *"the plan's largest judgement call… authorised by D62-as-widened-by-D74"*,
   and the widening does not reach a composition: `docs/decisions.md:182` says
   the content boundary does not widen, and
   `apps/catalog/src/fixtures.js:329-334` had already ruled the same way at the
   same site. **The fallback this entry described is now the plan** (S1). What
   remains is the accepted cost, not a risk: the catalog has no populated
   story-player example until a 0.11.0 capture exists (§10.8).
5. **NEW — deleting the accumulator with the fallback.** `timeline.js:44` is
   `offset += duration` and sits two lines from `:47`'s fallback, which uses
   `offset` as its fallback value. **They read as one thing and are not.**
   Removing both compiles, passes T1, and returns the wrong beat from
   `elementAt` — silently, to khaos-app's Player. **The first draft of this plan
   made exactly this mistake in prose**, which is the strongest available
   evidence that a builder will make it in code. T31 and the kept
   `timeline.test.js:117-123` are the two independent guards; S4's gate adds a
   `grep`.
6. **NEW — applying the presence assertion to events.** RFC 0069's *"MUST assert
   that `durationMs` is present"* reads as universal, and every one of the 264
   events on the live payload lacks the key (§1d). A uniform application puts
   every healthy composition into `unreadable` and fires T13's loud statement on
   good data — **turning the loud channel this issue exists to build into noise
   on the first real project.** §3d bounds the assertion to segments and says
   why.
7. **`check-taxonomy` reports 2, not 1, on a reflowed fixture header.** A 2 is
   a red. S8's gate says so; the failure mode is reading a 2 as a pass.
8. **Nothing gates the version, the register, or the prose.** S9 is marked
   UNGUARDED with its hand-checks named because #43 shipped without its bump
   for exactly this reason.
