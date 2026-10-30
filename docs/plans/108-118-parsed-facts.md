# Plan — `parsed`, the second axis: parsed facts in `SceneInspector` and `LocationInspector` (#108, #118)

Branch `feat/108-118-parsed-facts`. Library **`0.18.0` → `0.19.0`** (additive).
Proposed decision row: **D75** (the register's tail is `D74`; verified —
`grep -oE '\bD[0-9]{1,3}\b' docs/decisions.md | sort -u -V | tail -1` returns
`D74`, landed with #43).

Planned against the architect's frame and the designer's `pageCount` ruling.
Both are **settled and not re-decided here**. Where this plan adds a decision
the frame did not make, it is marked **[planner]** and carries its grounds.

---

## 0. The trap this plan is built to avoid

`CharacterInspector.stats` — the precedent both issues cite — **renders on zero
characters.** `CharacterInspector.svelte:161` gates the whole panel on
`{#if analysis}` and the stat header sits inside it at `:169-190`; with
`analysis === null` the component falls through to the empty state. No project
on this corpus has analysis, so that header has never rendered.

Copying it verbatim would ship two props that render on **0 of 54 scenes and
0 of 26 locations** (measured on disk — see §1), close both issues, and change
nothing on screen. **The prop is necessary and not sufficient; the render gate
is the defect.** `CharacterInspector` is filed separately as **#122** and is
**not touched by this plan**.

Two consequences that run through everything below:

1. The gate moves (`SceneInspector.svelte:99`, `LocationInspector.svelte:154`).
2. **Every test asserts the render, never the typedef.** A test that reads a
   `.d.ts`, or that only asserts a prop is accepted, passes while the component
   shows an empty well — which is exactly the #122 defect wearing a green tick.
   No test in this plan may do that, and §5 names the must-red mutation for
   each one so the reviewer can check.

### A second finding, from the icon audit — not in scope, filed as an observation

`CharacterInspector.svelte:177-178` passes `icon="text-format"` and
`icon="text-bubble"` to its Words and Lines cards. **Neither name exists in
Phosphor**, verified against `node_modules/@phosphor-icons/web/src/regular/style.css`
and `.../fill/style.css` — both grep to 0 occurrences of `.ph-text-format:before`
and `.ph-text-bubble:before`, while `film-slate`, `clock`, `file-text`,
`text-aa`, `list-bullets` and `chat-text` each grep to 1 in both weights. Those
two cards render no glyph, and nothing caught it because the panel never
renders (§0). **Do not copy those two names.** §4 uses verified names only.
This is #122's neighbourhood; report it there rather than fixing it here.

---

## 1. The precondition — verified, and it is wider than "run the script"

**The committed fixtures cannot support this change and `fetch-all.sh` alone
will not fix them.** Measured on disk, this branch, today:

| File | Rows | Key union |
| --- | --- | --- |
| `apps/catalog/src/data/scenes.json` | **54** | `duration, id, number, slugline, timeOfDay, title, type, word_count` |
| `apps/catalog/src/data/locations.json` | **26** | `id, name, scene_count` |

No `line_count`, no `characters`, no `page_count`. Ids are `scn_01KJ…` /
`loc_01KJ…`; the daemon measured in #108/#118 serves `scene_…` / `location_…`.
Row counts differ from the issues (54 vs 59 scenes, 26 vs 27 locations) — an
older capture from a different `.kspd`. Under the real-data rule (`AGENTS.md`,
"Real data, never fabricated") a fixture for `pageCount: 0.364` cannot be
authored from what is on disk.

**The daemon is reachable and the scripts discover it themselves.** Verified:
`~/.khaos/runtime.json` reports `version 0.9.8`, `pid 82385`, `port 51824`,
and `socket /Users/k/.khaos/run/khaosd.sock`. `khaosd_curl`
(`apps/catalog/scripts/lib.sh:31-48`) prefers the Unix socket, falls back to
`127.0.0.1:$port` with the bearer token, and reads all three out of
`runtime.json` itself. **No port needs to be passed to anything.**
`khaosd_require` (`lib.sh:55-62`) fails loudly rather than committing an error
envelope as data.

**But running `fetch-all.sh` unchanged will not add a single new field.**
`fetch-kspd.sh` does not pass payloads through — it projects them explicitly:

- scenes come from `khaos-tools parser query --type scenes` through a fixed jq
  object literal (`fetch-kspd.sh:44-47`), then four khaosd fields are merged in
  by id (`:57-63`): `duration`, `timeOfDay`, `type`, `word_count`. Nothing else.
- locations come from `khaos-tools parser query --type locations` through
  `{ id, name, scene_count }` (`fetch-kspd.sh:40-42`) and **are never joined to
  khaosd at all** — so `page_count`, which #118 measured on
  `GET /api/dashboard/locations`, has no path into the file.

So the script must be taught the new fields (step **S0b**), and there are two
hazards in doing it:

- **The id join is load-bearing and may already be broken.** `:57-63` merges by
  `$f[0][.id]`, khaos-tools ids on the left and khaosd ids on the right. The
  committed file has populated `timeOfDay`/`type`/`word_count`, so they matched
  at capture time; the prefixes in §1 suggest they may not any more. If they no
  longer match, the merge silently blanks three fields that work today.
- **`// 0` fabricates.** The existing merge defaults `word_count` to `0`. For a
  new field that must never happen: an unjoined location defaulting to
  `page_count: 0` asserts *this location occupies zero pages*, which is the
  exact false-zero the designer's `<0.1` floor exists to refuse. **Omit the key
  instead.**

`fetch-all.sh` also runs `fetch-voices.sh` (voices + provider status), so the
diff will be wider than these two files. Review it; do not `git add -A`.

---

## 2. The failing test that proves the problem, red first

The single test the build starts from — **T1**, `apps/catalog/src/components/parsed-facts.test.js`:

```js
it('states that analysis has not run, even with a full parse on screen (#108)', () => {
  const { container } = render(SceneInspector, {
    props: { analysis: null, parsed: SCENE_PARSED, isSelected: true },
  })
  // The facts ARE on screen — this half must pass, or the assertion below is vacuous.
  expect(screen.getByRole('heading', { name: SCENE_PARSED.slugline })).toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'Words' }).textContent).toContain('95')
  // And the panel still says the other axis is missing.
  expect(container.textContent).toContain('There is no analysis for this scene yet.')
})
```

Red today for the plainest reason: there is no `parsed` prop, so the component
falls to its empty state and the first assertion throws.

**This is the hardest acceptance criterion and it is deliberately the first
test.** A panel showing six parsed facts and saying nothing about analysis
reads as *finished*, which collapses the distinction #108 asks be preserved —
and it looks correct in every screenshot. The two positive assertions are not
decoration: without them a builder could satisfy the third by never rendering
the panel at all, and the test would go green on the #122 defect.

---

## 3. Fix approach

One new optional prop per component, **`parsed`** — one object, not N flat
props — carrying the stage-1 facts. `analysis` is untouched and no field
migrates to `parsed`; the two prop names encode the two pipeline stages in the
prop surface itself, where a caller cannot collapse them (D66's vocabulary,
`docs/decisions.md:186`). The panel gate widens from `analysis` to
`analysis || hasParsed`, every existing `{#if}` inside stays exactly as it is —
with `analysis === null` each already omits itself, which is what makes this
additive — and the two absences render differently in the same panel: a parsed
field the parser did not report becomes an em-dash **on its own card**, while
analysis-not-run becomes a quiet in-panel sentence, not the centred
`EmptyState` well. The existing three-branch `EmptyState` block survives
unchanged for the case where **both** are absent. The workspaces map the
snake_case row to the camelCase object exactly as `CharacterWorkspace.svelte:47-54`
already does.

### Members

| `SceneInspector.parsed` | | `LocationInspector.parsed` | |
| --- | --- | --- | --- |
| `slugline` | `string` | `name` | `string` |
| `type` | `string` | `sceneCount` | `number` |
| `timeOfDay` | `string` | `pageCount` | `number` |
| `duration` | `string` | | |
| `wordCount` | `number` | | |
| `lineCount` | `number` | | |
| `characters` | `readonly string[]` | | |

**Excluded, with the architect's grounds carried forward:**
`dialogue_counts` / `dialogue_word_counts` (a cast has no correct intrinsic
order and `BarChart` puts ordering on its caller — `BarChart.svelte:34` states
it: *"already ordered by you… none is this component's to choose"*; shipping it
now would put an unattributed presentation decision in the library. It is an
additive member later, which is why the prop is one object rather than N
props). `scene.content` (the kit ships no long-form text surface; that is its
own component with its own decisions, and D73 refuses making an inspector own a
viewport).

### `hasParsed` — the gate, and why not bare truthiness **[planner]**

The architect ruled the gate becomes `analysis || parsed`. Taken literally that
reintroduces §0's defect one level down: a caller whose row yields no parsed
facts hands over `{}`, which is truthy, and the panel opens on nothing — an
empty well, again. So the gate tests whether `parsed` **holds a fact**:

```js
const hasParsed = $derived(
  !!parsed &&
    Object.values(parsed).some((v) =>
      Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== '',
    ),
)
```

`0` survives (`0 !== ''` is true under `!==`); `''` does not, because khaosd
sends `''` for a field it did not fill rather than omitting it — the same fact
that `LocationInspector.svelte:201-210` records for occupant ids, where `??`
stopped falling back the moment a host supplied `id: ''`. An empty array is
absence, not a measurement of zero characters. This is a **narrowing** of the
ruling in the ruling's own direction, not a substitution; if the architect
prefers bare `parsed`, T5 is the test that changes.

### The two absences

**A parsed field the parser did not report → em-dash on that one card.** One
guard selects the parsed stat block and each card carries its own fallback —
the shape `CharacterInspector.svelte:169-179` already uses, and the comment
there says why: *"A real KSPD record with a dialogue_count but no word_count
rendered the literal string 'undefined' in the Words card — and real data is
exactly what this catalog insists on, so the partial record is the expected
case."* Never a guard that removes the card: a missing card is indistinguishable
from a component that does not measure the thing.

**Analysis not run → a quiet in-panel sentence.** `EmptyState` is a hero — it
centres, pads `--spacing-xl`, and its `children` snippet
(`EmptyState.svelte:11`, rendered at `:26-28`) is an action slot, not a
container — so it cannot host a populated panel. The sentence is the existing
three-state language, verbatim: **`There is no analysis for this scene yet.`**
(`SceneInspector.svelte:184`) and **`There is no analysis for this location yet.`**
(`LocationInspector.svelte:311`).

**[planner] Why that sentence alone and not "No analysis" as well.** The
existing branch pairs a title (`No analysis`) with that description. In-panel,
rendering both reads as a stutter. The description is the half that carries the
statement, and it makes **no selection claim** — "this scene" refers to the
scene whose facts are on screen, which is a fact about the payload the caller
handed over, not about selection. So it renders whenever `!analysis`,
**independently of `isSelected`**, and D66's furthest-position-known-to-be-true
still holds. The title/description pair is untouched in the `EmptyState` branch.

### Placement

- **Counts → `MetricCard`** in the existing `.inspector__stats` row, after the
  analysis cards.
- **Identity → `MetaStrip`** (D63, `docs/decisions.md:183`), scene only.
  `LocationInspector` gets **no `MetaStrip`** — its only identity member is
  `name`, which is the header. Do not add one.
- **Parsed `characters` → its own `AnalysisCard`**, eyebrow `Parsed`, **not**
  merged into the analysis Cast card at `SceneInspector.svelte:163-169`. D66's
  ruling is two axes get two items, never a merge; truthful duplication beats
  erasing which stage produced the fact. Both cards are titled `Characters` and
  the eyebrow is the differentiator — **so tests must use `getAllByRole`**, and
  a `getByRole('heading', { name: 'Characters' })` anywhere in the suite will
  throw once both render.

### Display identity from `parsed` when analysis is absent

`SceneInspector.svelte:86` and `LocationInspector.svelte:53` derive the header
from `analysis?.title` / `analysis?.name`; without a fallback the panel renders
headless. Behavioural, not decoration.

```js
const title = $derived(analysis?.title || parsed?.slugline || '')   // SceneInspector
const name  = $derived(analysis?.name  || parsed?.name     || '')   // LocationInspector
```

**`||`, not `??`, and that is the whole point of T8.** khaosd sends `''`, and
`??` does not fall back on an empty string — the trap recorded at
`LocationInspector.svelte:201-210`, where `o.id ?? …` stopped firing the moment
a host supplied `id: ''` and the key collision came back. Both operands here
are strings, so there is no falsy-zero hazard.

**The distinction to hold in your head, because the plan applies both:**
`||` for **strings**, where `''` is an unfilled field and not a name; `!== undefined`
/ `??` for **numbers**, where `0` is a measurement and absent is not.
`{#if parsed.wordCount}` silently drops a real zero.

### `parsed` is not selection

`isSelected` and the tri-state (D71) are unchanged. `SceneInspector.svelte:78-80`
carries the standing instruction *"Do NOT infer this from `stats`, `images` or
any other payload"* — there is now a new payload to be inferred from, and the
instruction extends to it verbatim. The typedef edit in S2/S3 adds `parsed` to
that sentence's list. The workspaces keep deriving `isSelected` from the
selection key alone.

### The name collision the designer caught — `pageCount` **[planner, ruled]**

`pageCount` already exists at `SceneList.svelte:38` and `DialogueList.svelte:33`.
**Keep the name.** Grounds:

1. **Those two are not a contract.** Both are local `$derived` pagination
   values — `const pageCount = $derived(Math.max(1, Math.ceil(scenes.length / pageSize)))`
   — scoped inside one `<script>`, never a prop, never exported, never crossing
   a component boundary. `LocationInspector.parsed.pageCount` is a published
   prop member. They cannot be confused at any call site because they never
   appear in the same one.
2. **Consistency inside the object outranks distinctness across the library.**
   Every other member is the camelCase of the engine's own key —
   `sceneCount ← scene_count`, `wordCount ← word_count`, `lineCount ← line_count`.
   Renaming one member to dodge an unrelated local variable makes the mapping
   from `fetch-kspd.sh` irregular in exactly one place, which is the class of
   thing that produces a silent wrong-key mapping later.
3. The object namespaces it: `parsed.pageCount` reads as *pages of screenplay*
   in a location panel, and there is no pager on that surface to read it as.

The eighths-vs-decimals vocabulary question is filed for product as **#121** and
nothing here waits on it.

---

## 4. What renders — the exact shapes

### 4a. `formatPages` — the designer's ruling, encoded

`0.4 / Pages`: decimal to one place, `MetricCard`, unit in the label, with a
`<0.1` floor — a non-zero value that would round to `0.0` renders `<0.1`,
because a false zero for a location that demonstrably contains a scene is what
`CharacterInspector.svelte:180-186` already refuses for `goals`. Rounding is
presentation and not inference because it **discards** precision rather than
inventing it; `0.364` is itself a rounding, so "verbatim" is not neutral.
Rejected: `<1` (collapses 0.05 and 0.98, no answer for 12.5), eighths (changes
the *unit*, which is a claim), `0.0` for a non-zero value (asserts absence).

`MetricCard` **does not format** — `{value}` verbatim at
`MetricCard.svelte:22`, and the caller formats by convention
(`BarChart.svelte:36`, `PacingChart.svelte:32`, both
`format = (value) => String(value)`). So this is one expression in
`LocationInspector`, matching the `appearances` inline format already in that
file at `:221-233`. **Do not add a `format` prop to `MetricCard`** and **do not
extract a shared formatter** — the designer set the threshold at a third caller,
and there are two.

```js
// A page extent is a MEASUREMENT, so 0 is a fact and absent is not — hence
// Number.isFinite (the same test `appearances` uses at :221) rather than a
// truthiness check, which would render 0 pages as an em-dash.
const formatPages = (n) =>
  !Number.isFinite(n) ? '—' : n > 0 && n < 0.05 ? '<0.1' : n.toFixed(1)
```

| input | renders | why |
| --- | --- | --- |
| `0.364` | `0.4` | the designer's worked example |
| `0.04` | `<0.1` | the floor — it would round to `0.0` and assert absence |
| `0` | `0.0` | a real measurement of zero, not a rounding artefact |
| `1` | `1.0` | one decimal place, always |
| `12.5` | `12.5` | the case `<1` had no answer for |
| `undefined` / `null` / `NaN` | `—` | not measured |

### 4b. Tokens — every `var(--…)` proposed, verified present

Only one new rule is added (`.inspector__unanalysed`, in both components):

| token | file:line | value |
| --- | --- | --- |
| `--body-md-size` | `tokens/tokens.css:146` | `13px` |
| `--text-secondary` | `tokens/tokens.css:168` (dark) / `:231` (light) | `var(--warm-300)` / `var(--warm-500)` |
| `--spacing-2xs` | `tokens/tokens.css:122` | `4px` |

Everything else reuses rules already in the two files (`.inspector`,
`.inspector__stats`, `.inspector__name`). `--text-tertiary` is **not** used:
`MetaStrip.svelte:61-65` records that at caption size it clears the 4.5:1 bar
on only one of four real backgrounds. `--text-secondary` matches
`.inspector__change` (`LocationInspector.svelte:318-321`). **No `font-weight`
is hand-set**, and no token is invented.

```css
.inspector__unanalysed {
  margin: 0 0 var(--spacing-2xs);
  font-size: var(--body-md-size);
  color: var(--text-secondary);
}
```

### 4c. Icons — verified against the shipped stylesheets

The catalog imports `regular` and `fill` only (`apps/catalog/src/main.js`, per
`Icon.svelte:6-9`), and `MetricCard` renders `weight="fill"`
(`MetricCard.svelte:21`). Every name below greps to 1 in **both**
`node_modules/@phosphor-icons/web/src/regular/style.css` and `.../fill/style.css`:

| where | prop | name | verified |
| --- | --- | --- | --- |
| Scene · Words | `MetricCard icon` | `text-aa` | regular 1 / fill 1 |
| Scene · Lines | `MetricCard icon` | `list-bullets` | regular 1 / fill 1 |
| Location · Scenes | `MetricCard icon` | `film-slate` | regular 1 / fill 1 |
| Location · Pages | `MetricCard icon` | `file-text` | regular 1 / fill 1 |
| Scene · slugline | `MetaStrip icon` | `film-slate` | regular 1 / fill 1 |
| Scene · duration | `MetaStrip icon` | `clock` | regular 1 / fill 1 |

**`type` and `timeOfDay` carry `label` and no `icon`. [planner]** `MetaStrip`'s
glyph is decorative by contract and its `label` carries the meaning
(`MetaStrip.svelte:12-16`; `Icon` is `aria-hidden` at `Icon.svelte:29`), so
omitting a glyph loses nothing an assistive technology reads. Choosing a glyph
that means *INT/EXT* or *DAY/NIGHT* is a design claim the designer has not made,
and inventing one renders blank — §0's finding. A designer may add glyphs
later; **any substitute must be grepped against both stylesheets first.**

### 4d. `SceneInspector` — the render, in order

Inside `{:else if analysis || hasParsed}`, top to bottom:

1. `{#if showName}` hero + `<h2>{title}</h2>` — unchanged markup, `title` now
   falls back to the slugline.
2. **New:** `{#if !analysis}<p class="inspector__unanalysed">There is no analysis for this scene yet.</p>{/if}`
   — placed here, above the facts, so the absence frames what follows rather
   than trailing it.
3. **New:** `<MetaStrip items={metaItems} />` (renders nothing on an empty
   array — `MetaStrip.svelte:48`).
4. `.inspector__stats` — the three analysis cards unchanged, then
   `{#if hasParsed}` `Words` + `Lines`.
5. Summary / Narrative / Structure / Evaluation / Cast — **untouched**.
6. **New:** `{#if parsed?.characters?.length}` `<AnalysisCard title="Characters" eyebrow="Parsed">`.
7. Reference gallery — untouched.

```js
// The slugline is the HEADER when there is no analysed title, so it joins the
// strip only where it would not be a second copy of the heading — including
// when showName is false and there is no heading to duplicate.
const metaItems = $derived(
  [
    parsed?.slugline && (!showName || title !== parsed.slugline)
      ? { text: parsed.slugline, label: 'Slugline', icon: 'film-slate' }
      : null,
    parsed?.type ? { text: parsed.type, label: 'Type' } : null,
    parsed?.timeOfDay ? { text: parsed.timeOfDay, label: 'Time of day' } : null,
    parsed?.duration ? { text: parsed.duration, label: 'Duration', icon: 'clock', numeric: true } : null,
  ].filter(Boolean),
)
```

```svelte
{#if hasParsed}
  <MetricCard value={parsed.wordCount ?? '—'} label="Words" icon="text-aa" />
  <MetricCard value={parsed.lineCount ?? '—'} label="Lines" icon="list-bullets" />
{/if}
```

`??` and not `||`: `0 ?? '—'` is `0`, `0 || '—'` is `'—'`.

### 4e. `LocationInspector` — the render

Same three insertions minus the strip: the sentence at the same position, and
inside `.inspector__stats` after the three analysis cards:

```svelte
{#if hasParsed}
  <MetricCard value={parsed.sceneCount ?? '—'} label="Scenes" icon="film-slate" />
  <MetricCard value={formatPages(parsed.pageCount)} label="Pages" icon="file-text" />
{/if}
```

Unit in the label, per the designer. No `MetaStrip`, no parsed cast card.

### 4f. The workspaces

`SceneWorkspace.svelte:47-49` and `LocationWorkspace.svelte:22-24` already hold
`selectedEntity`. Map it exactly as `CharacterWorkspace.svelte:47-54` does, and
return **`null`** rather than `{}` when nothing is selected — `parsed` is a
gate here in a way `stats` is not there.

```js
// SceneWorkspace
const parsed = $derived.by(() => {
  if (!selectedEntity) return null
  const s = selectedEntity
  return {
    slugline: s.slugline, type: s.type, timeOfDay: s.timeOfDay, duration: s.duration,
    wordCount: s.word_count, lineCount: s.line_count, characters: s.characters,
  }
})
```

```js
// LocationWorkspace
const parsed = $derived.by(() => {
  if (!selectedEntity) return null
  const l = selectedEntity
  return { name: l.name, sceneCount: l.scene_count, pageCount: l.page_count }
})
```

**Do not widen `lib/types.js`.** `Scene` (`:253` region) and `Location`
(`:287` region) are snake_case **list-row** types shared with `SceneList` /
`LocationList`, and that file's own rule at `:38-41` says *"A shape used by ONE
component stays in that component."* Declare the parsed half as a local
`@typedef` in each workspace instead, documenting the fields it reads off the
row. This is documentation rather than enforcement — `tsconfig.types.json` sets
`"checkJs": false` and says why — so nothing fails if it is omitted, which is
precisely why the plan names it.

**`LocationWorkspace` needs the guard `SceneWorkspace` already has.**
`LocationWorkspace.svelte:22-24` is unguarded:

```js
let selectedName = $state('')
const selected = $derived(analyses[selectedName] ?? null)
const selectedEntity = $derived(locations.find((l) => l.name === selectedName) ?? null)
```

At rest `selectedName` is `''`. Today that is harmless because a null
`analysis` renders the empty state and `selectedEntity` is only read for
`images` — the exact invisibility `SceneWorkspace.svelte:40-46` documents:
*"On its own this one is invisible… It stops being invisible the moment the
guard above is missing too, which is how it shipped."* **`parsed` is what makes
it visible**: a location row whose `name` is `''` would match, `parsed` would be
non-null, and the panel would open while nothing is selected. Guard both
deriveds on `selectedName`, matching `SceneWorkspace.svelte:39` and `:47-49`
verbatim. **Two lines, made necessary by this change — not opportunistic.**

---

## 5. The tests, and the must-red mutation for every one

New file `apps/catalog/src/components/parsed-facts.test.js` (the cross-component
convention `inspector-empty-states.test.js` already uses). Fixture constants at
the top of the file, drawn from the refreshed capture where a real value exists.

**Forbidden shapes, stated so the reviewer can check for them:** no test may
read a `.d.ts` or assert a typedef; no test may consist of a bare
`queryByText(...) === null` without a positive assertion in the same test that
would fail if the component rendered nothing at all. `MetricCard` is
`role="group" aria-label={label}` (`MetricCard.svelte:20`), so
`getByRole('group', { name: 'Words' })` is the positive handle throughout — it
throws when the card is absent, which is what makes the negative halves safe.

| # | Test | Must-red mutation |
| --- | --- | --- |
| **T1** | §2 — parsed facts on screen **and** `There is no analysis for this scene yet.` | Delete the `{#if !analysis}<p>` block. The two positive assertions still pass; the third fails. **This is the criterion-4 test.** |
| **T1b** | Same, `LocationInspector`, `…for this location yet.` | Same, in the other file. |
| **T1c** | The sentence does **not** render when `analysis` IS present (`analysis` + `parsed` both) — paired with a positive assertion that the analysis summary is on screen | Change the guard to render unconditionally. |
| **T2** | `analysis: null, parsed: SCENE_PARSED` opens the panel: `getByRole('group', { name: 'Words' })` resolves **and** `queryByRole('heading', { name: 'No analysis' })` is null | Revert the gate to `{:else if analysis}`. The `getByRole` throws. |
| **T3** | `parsed: { wordCount: 0, lineCount: 0 }` → the `Words` group contains `0` and does **not** contain `—` | `{#if parsed.wordCount}` around the card, **or** `parsed.wordCount \|\| '—'`. Either renders the em-dash and the test fails on both halves. |
| **T4** | `parsed: { lineCount: 4 }` → the `Words` group exists and reads `—`; the `Lines` group reads `4` | Guard the card itself: `{#if parsed.wordCount !== undefined}<MetricCard …>{/if}`. `getByRole('group', { name: 'Words' })` throws — a removed card, which §3 forbids. |
| **T5** | `parsed: {}` and `parsed: { wordCount: undefined, characters: [] }`, `isSelected: true` → the tri-state `EmptyState` renders (`No analysis` heading + the description) and `queryByRole('group', { name: 'Words' })` is null | Gate on bare `analysis \|\| parsed`. The panel opens on nothing — §0's defect, reproduced. |
| **T6** | `analysis: null, parsed: { slugline }` → `getByRole('heading', { name: slugline })`. And the location twin with `parsed: { name }` | Revert `title` to `analysis?.title ?? ''`. The heading's accessible name is `''` and the query throws. |
| **T7** | Both present → the heading is the **analysis** title, **and** the slugline is on screen in the strip (`getByText`) | Swap the operands in the `\|\|` chain. The heading assertion fails. Note the second half is what stops T7 from passing on a component that dropped the strip entirely. |
| **T8** | `analysis: { title: '' }, parsed: { slugline }` → the heading is the slugline | Use `??` instead of `\|\|`. `'' ?? x` is `''`, and the heading query throws. This is the `LocationInspector.svelte:201-210` bug family. |
| **T9** | analysis cast `['Desmond']` + `parsed.characters: ['Desmond','Jetta']` → `getAllByRole('heading', { name: 'Characters' })` has length **2**; `Cast` and `Parsed` eyebrows both present; `Jetta` on screen | Merge the parsed names into the analysis Cast card, or drop the parsed card. Length becomes 1. |
| **T10** | `formatPages`, table-driven through `LocationInspector` renders — the six rows in §4a, each asserted on the `Pages` group's text | Three separate mutations, each caught by a different row: `Math.round` (`0.364` → `0`), drop the floor (`0.04` → `0.0`), `String(n)` instead of `toFixed(1)` (`0.364` → `0.364`), truthiness instead of `Number.isFinite` (`0` → `—`). |
| **T11** | `SceneWorkspace` with real `scenes` and nothing selected → `No scene selected` on screen **and** `queryByRole('group', { name: 'Words' })` is null | Drop the `selectedId ?` guard at `SceneWorkspace.svelte:47-49`. `find` resolves scene 0, `parsed` becomes non-null, the panel opens at rest. |
| **T12** | `LocationWorkspace`, same shape | Drop the new `selectedName ?` guard (§4f). |
| **T13** | `SceneWorkspace`: click the first row, then the `Words` group reads the row's real `word_count` | Map `wordCount: s.wordCount` (wrong case) — the group reads `—`. Proves the snake→camel mapping, which no typedef can. |
| **T14** | `showName: true` + `parsed.slugline`, no analysis → `getAllByText(slugline)` has length **1** (heading only). `showName: false` → length 1 (strip only) and no heading | Include the slugline in the strip unconditionally → length 2. Drop the `!showName` half of the condition → the `showName: false` case loses the slugline entirely and length is 0. |
| **T15** | A caller passing **no** `parsed` renders exactly as today: the existing `analysis` fixture's headings/values present, and `queryByRole('group', { name: 'Words' })` is null | Default `parsed = {}` and render the cards unconditionally. |

**Every test above has a named must-red mutation. There is none I could not
name.** The existing `inspector-empty-states.test.js` (82 lines, five
`it.each` blocks over all three inspectors) must stay green untouched — it
passes no `parsed`, so `hasParsed` is false and the `EmptyState` branch is
reached exactly as before. If any of it goes red, the gate moved further than
this plan intends.

---

## 6. Ordered steps, each with the gate that proves it

Run gates from the repository root unless noted. **Every gate exits 0 clean, 1
on gaps, and 2 when it could not run — a 2 is a red, not a pass.**
`check-taxonomy` is the one to watch: its regexes want an exact fixture shape
(`scripts/check-taxonomy.mjs:93-104` matches
`name: 'X'[^{}]*?section: 'Y',\s*group: 'Z'`), so reformatting a fixture header
drops the entry from the check and the gate reports **2** rather than quietly
passing a smaller set. **Do not reflow the `id:/name:` and `section:/group:`
lines of any fixture entry.**

### S0a — refresh the capture (blocking; nothing downstream is authorable first)

`bash apps/catalog/scripts/fetch-all.sh` from `apps/catalog`. Requires the
running daemon; it discovers the socket/port/token itself (§1).
**Gate:** the script exits 0, `khaosd_require` logs `khaosd 0.9.8`, and
`git diff --stat apps/catalog/src/data/` is reviewed by hand — expect voices
and provider-status churn as well as the two files of interest.

### S0b — teach `fetch-kspd.sh` the new fields

Add `line_count` and `characters` to the scene merge (`fetch-kspd.sh:57-63`);
add a location merge against `/api/dashboard/locations` for `page_count`,
joined by id, on the same pattern.

- **Inspect `characters` on the wire before mapping it.** #108 records the key
  but not whether it holds names or character ids. If ids, map through the
  existing `$name_by_id` (`fetch-kspd.sh:50`). **Report the shape; do not guess.**
- **No `// 0` default on `page_count`.** Omit the key for an unjoined row.
  A defaulted zero asserts a measurement the engine never made — the same
  false-zero the `<0.1` floor exists to refuse.

**Gate (hand-checks, this step has no automated one):**
```
jq '[.[] | select(.timeOfDay != "" and .type != "" and .word_count != null)] | length' apps/catalog/src/data/scenes.json   # must equal the row count — the id join still lands
jq '[.[] | select(.line_count != null)] | length'  apps/catalog/src/data/scenes.json      # > 0
jq '[.[] | select(.page_count != null)] | length'  apps/catalog/src/data/locations.json   # > 0
jq '[.[] | select(.page_count == 0)] | length'     apps/catalog/src/data/locations.json   # inspect: real zeros or fabricated ones?
```
The first is the regression check for the `scn_` / `scene_` id-prefix mismatch
(§1). **If it drops below the row count, stop and report — that is three
working fields lost, not a new field gained.**

### S1 — red

Write `parsed-facts.test.js` and the additions to `SceneInspector.test.js` /
`LocationInspector.test.js`.
**Gate:** `cd apps/catalog && npx vitest run src/components/parsed-facts.test.js`
— every test red, and red **for the stated reason** (a missing prop / an empty
state), not on an import error or a crash. A test that errors before rendering
proves nothing.

### S2 — `SceneInspector`

Typedef `SceneParsed`, the `parsed` prop and its `Props` entry, `hasParsed`,
the widened gate, the `title` fallback, the sentence, `metaItems` + the
`MetaStrip` import, the two `MetricCard`s, the parsed `Characters` card, and
the `.inspector__unanalysed` rule. Extend the "Do NOT infer this from…" list at
`:78-80` to name `parsed`.
**Gate:** `npx vitest run src/components/parsed-facts.test.js src/components/SceneInspector.test.js src/components/inspector-empty-states.test.js` green.

### S3 — `LocationInspector`

Typedef `LocationParsed`, the prop, `hasParsed`, the gate, the `name` fallback,
the sentence, `formatPages`, the two `MetricCard`s, the style rule. Same
typedef-comment extension. **No `MetaStrip`, no parsed cast card.**
**Gate:** `npx vitest run src/components/parsed-facts.test.js src/components/LocationInspector.test.js src/components/inspector-empty-states.test.js` green.

### S4 — the workspaces

Both `parsed` deriveds, the local `@typedef`s, the two `Props` entries, and the
two `LocationWorkspace` guards.
**Gate:** `cd apps/catalog && npm test` — the whole suite green, including
`list-paging`, `empty-id-selection` and `regressions`.

### S5 — fixtures

Add examples to the `scene-inspector` and `location-inspector` entries
(`apps/catalog/src/fixtures.js:718-755` and `:756-…`). Values come from the
refreshed capture — **real data, never fabricated**. Proposed labels:
`Parsed only — no analysis`, `Parsed + analysis`, `Parsed, partial — words not reported`.

**The `<0.1` floor is proven by T10, not by a catalog fixture.** If no location
in the corpus measures below 0.05 pages, do **not** invoke D62/D74's
illustrative-row exception for it: unit tests already use invented props
throughout (`SceneInspector.test.js:5-9`), so the floor has a home that costs
nothing, and the catalog keeps only captured values.

**Gate:** `npm run check-catalog`, then `npm run check-taxonomy` — **expect
exit 0; a 2 means the header lines were reflowed** — then
`npm run check-consumer`, then `npm run check-compile`. Or `npm run check-coverage`
for all four in order.

### S6 — declarations

`npm run build-types`. Four `.d.ts` change:
`SceneInspector.svelte.d.ts`, `LocationInspector.svelte.d.ts`,
`SceneWorkspace.svelte.d.ts`, `LocationWorkspace.svelte.d.ts`.
**Gate:** `npm run check-types` (its own gate, outside `check-coverage` — run
it yourself), exit 0. Commit the regenerated files; they are never hand-edited (D59).

### S7 — version, register, docs — **UNGUARDED**

**No gate reads the root `package.json` version.** `check-coverage`,
`check-types` and the test suite are all silent on it, and **#43 shipped
without its bump because no plan step carried it.** This step is the carrier.

1. `package.json` `"version": "0.18.0"` → `"0.19.0"`. **Do not touch**
   `apps/catalog/package.json` (`0.0.0`, a workspace stub) or
   `apps/catalog/src-tauri/tauri.conf.json` (`0.17.0`) — the catalog versions
   independently and moves on its own `v*` tag.
2. `docs/decisions.md` — add the **D75** row: two props for two pipeline
   stages, the gate move, the two absence renderings, `pageCount`'s format and
   its `<0.1` floor, the name-collision ruling, and `dialogue_counts` /
   `scene.content` excluded with grounds.
3. `docs/using-the-library.md` — `:373-375` says the inspectors take
   `{ analysis, isLoading, images, showName }`, which is **already stale**
   (no `isSelected`). Add `parsed` and, boyscout, `isSelected`. Update the two
   table rows at `:353-354`.

**Hand-checks, named because nothing automated will catch these:**
```
node -p "require('./package.json').version"                # 0.19.0
grep -n '^| D75' docs/decisions.md                         # one row
grep -n 'parsed' docs/using-the-library.md                 # the prop is documented
git diff --stat                                            # no unintended file
```

### S7b — optional boyscout, separable so a reviewer can drop it

`AGENTS.md` states *"Published now: catalog 0.16.0 … and library 0.12.0"* while
`main` is at `0.18.0`, `lib-0.18.0` is released, and `tauri.conf.json` reads
`0.17.0`. **Stale in both halves.** Correct the library line to the **released**
`0.18.0` — not `0.19.0`, which is unreleased at PR time. **Flagged rather than
assumed for the catalog half:** I have not verified which catalog release is
published, and `AGENTS.md` itself records that a draft is not a published
release. Ask before writing a number there.

### S8 — the full gate set, in the order CI runs it

`gates.yml` runs the catalog's test suite, then `check-coverage` (four gates),
then `check-types` — six checks, and `gates / gates` is a required status check
on `main` with `strict: true`.

```
cd apps/catalog && npm test
cd ../.. && npm run check-coverage
npm run check-types
```

---

## 7. Files to touch

| File | Change |
| --- | --- |
| `components/svelte/SceneInspector.svelte` | `SceneParsed` typedef, `parsed` prop, `hasParsed`, gate, `title` fallback, sentence, `MetaStrip`, 2 `MetricCard`s, parsed `Characters` card, 1 style rule |
| `components/svelte/LocationInspector.svelte` | `LocationParsed` typedef, `parsed` prop, `hasParsed`, gate, `name` fallback, sentence, `formatPages`, 2 `MetricCard`s, 1 style rule |
| `components/svelte/SceneWorkspace.svelte` | local `@typedef`, `parsed` derived, forward it |
| `components/svelte/LocationWorkspace.svelte` | local `@typedef`, `parsed` derived, forward it, **+ the two selection guards** |
| `components/svelte/*.svelte.d.ts` (×4) | **generated** by `npm run build-types` — never hand-edited (D59) |
| `apps/catalog/scripts/fetch-kspd.sh` | `line_count` + `characters` on scenes; a khaosd join for `page_count` on locations |
| `apps/catalog/src/data/scenes.json` | regenerated capture |
| `apps/catalog/src/data/locations.json` | regenerated capture |
| `apps/catalog/src/data/voices.json`, `provider-status.json` | incidental churn from `fetch-all.sh` — review, do not hand-edit |
| `apps/catalog/src/fixtures.js` | new examples on two entries; **headers not reflowed** |
| `apps/catalog/src/components/parsed-facts.test.js` | **new** |
| `apps/catalog/src/components/SceneInspector.test.js` | additions |
| `apps/catalog/src/components/LocationInspector.test.js` | additions |
| `package.json` | `0.18.0` → `0.19.0` |
| `docs/decisions.md` | D75 |
| `docs/using-the-library.md` | prop surface + two table rows |
| `AGENTS.md` | S7b only — optional, separable |

**Not touched, deliberately:** `components/svelte/CharacterInspector.svelte`
and `CharacterWorkspace.svelte` (#122 owns them); `components/svelte/lib/types.js`
(`Scene` and `Location` stay snake_case list-row types, per that file's rule at
`:38-41`); `MetricCard.svelte`, `MetaStrip.svelte`, `AnalysisCard.svelte`,
`EmptyState.svelte`, `BarChart.svelte` — **atoms are consumed, not modified**;
`components/svelte/index.js` (no new export, so `check-catalog` and
`check-taxonomy` see no new surface).

---

## 8. Known risks, stated rather than discovered later

1. **The id join (§1, S0b).** The highest-probability failure in the plan, and
   it degrades silently — three currently-working scene fields blank out and the
   catalog still builds. S0b's first hand-check is the only thing that catches it.
2. **`characters` shape is unknown** (names or ids). S0b inspects before mapping.
3. **Two headings named `Characters`** once T9's state renders. Any
   `getByRole('heading', { name: 'Characters' })` in the suite starts throwing.
   `getAllByRole` throughout.
4. **`checkJs` is off** (`tsconfig.types.json`), so the workspaces reading
   `word_count` / `page_count` off a `Scene` / `Location`-typed row is not
   enforced by anything. The local `@typedef` is documentation. This is the
   architect's boundary honoured, with its cost named.
5. **`hasParsed` narrows the architect's `analysis || parsed`** (§3). Flagged
   as a planner decision, in the ruling's direction, with T5 as the test that
   changes if the architect prefers the literal form.
