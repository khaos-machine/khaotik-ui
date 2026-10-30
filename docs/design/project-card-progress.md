# ProjectCard: job progress and timing

Design for how an import or an extraction shows on the launcher's project card.
It is a design artifact, not an implementation plan. The planner sequences the
build. Status: proposed on 2026-10-09.

## The problem

The operator, 2026-10-09, with a screenshot of the card during a Broken in 4
Places extraction: "the timing feedback is nice but placement/design sucks..
needs redesign".

The screenshot's footer read: `● Extract…` `2/57` `0:44 · / about 18 / min left`
(wrapped over three lines), then the stage rail, then the meta strip.

**Cause.** `ProjectCard.svelte` puts four things in one inline box: the dot, the
label, the count and the timing all sit inside `.project__status`. That box is
capped at `max-width: 22ch` (`ProjectCard.svelte:737`) for a reason that applies
only to the label: an unrecognised producer string must not spill out of the
card. The count and the timing took the room, the label ellipsised to
`Extract…`, and `.project__timing` has no `white-space: nowrap`, so it wrapped
inside whatever was left. The content is right and the layout is wrong: three
facts share one row that can hold one of them.

## Constraints measured

**Card width.** `.launcher__projects` is `repeat(auto-fill, minmax(240px, 1fr))`
(`Launcher.svelte:838`), so the narrowest card is 240px. The footer pads
`--spacing-sm` (12px) each side inside a 1px border, which leaves **214px of
content width**. Every layout below is designed to fit at 214px. Wider cards
only add slack.

**Text widths.** Measured in Chrome with canvas `measureText` at 11px
(`--caption-size`), for `"Inter"`, the first family in `--font-sans`, and for
`system-ui`, the fallback. The wider of the two is the one that counts:

| String | Inter | system-ui |
| --- | ---: | ---: |
| Extracting entities from scenes | 136 | 163 |
| Downloading from iCloud | 117 | 132 |
| Importing screenplay | 94 | 111 |
| Finalizing extraction… | ~95 | ~109 |
| about 1 h 20 min left (the longest remaining) | 92 | 108 |
| estimating time left | 86 | 101 |
| about 18 min left | 76 | 88 |
| 1:02:15 (the longest elapsed) | 34 | 38 |
| 107/107 | 36 | 40 |

The longest status line is 163 + 6 (dot) + 5 (gap) = **174px of 214px**. The
longest timing row is 12 (icon) + 4 + 38 + 108 = **162px plus the space between
the two cells**. Nothing needs to truncate or wrap at the real width.

These are text-metric measurements, not a render of the card. The build has to
confirm them in the catalog at a 240px card. See "Verification the build owes"
below.

## The decision

**Each fact gets its own row, and the rows keep the same order in every state.**

```text
status     ● <what is happening>                     the dot carries the tone
progress   <stage rail ..........................> <count>
timing     ◷ <elapsed>                          <remaining>
meta       <MetaStrip: characters, scenes, places, modified> <git>
```

Why this layout:

- **The status line holds only the label**, so the `22ch` cap goes back to the
  job it was written for: bounding a producer's string. Every label in this
  design is shorter than 214px. The cap stays on `.project__label` so an
  unknown package stage still ellipsises.
- **The count belongs to the bar.** `2/57` is the same number as the fill
  inside the active rail segment (`ProjectCard.svelte:149-159` already ties the
  two together), so the count sits at the end of the rail as the bar's value. It
  no longer competes with the label.
- **The timing gets its own row**, with elapsed on the left and remaining on the
  right, so the two times never meet in the middle. Elapsed is exact and ticks;
  remaining is approximate and changes rarely. Putting them at opposite ends
  keeps the ticking value from moving the approximate one.
- **The row order is fixed.** A row that has nothing to say is left out. Rows
  are never reordered, so the eye learns one scan path for every card in the
  grid.

Rejected: putting the timer in the meta strip in place of "just now". That saves
a row, but it puts a ticking job clock among static facts about the story, and
MetaStrip takes no tone (D63).

## States

Key used in the mockups: `●` is the 6px tone dot. `━` is a completed rail
segment (`--tone-info`). `█` is the measured fill and `░` the unfilled track of
the active segment. `≈` is the active segment's indeterminate shimmer. `┄` is
a static, dimmed active segment (waiting). `·` is a pending segment. `◷` is
`Icon name="timer"`, which is present in the regular Phosphor sheet. `[meta]`
is the existing MetaStrip (users, film-slate, map-pin and clock glyphs), with
the glyphs abbreviated as `ch`, `sc` and `pl`.

The rail has three segments, as it does today (`PACKAGE_STAGE_TRANSITIONS`):
segment 1 is import (empty to imported), segment 2 is parse (imported to
parsed), and segment 3 is extraction (parsed to indexed).

Every mockup is 214px of content width:

```text
|<------------- 214 px ------------->|
```

### 1. Importing: downloading from iCloud

This state can show from the moment the operator confirms the file (see
"Importing from the first moment").

```text
|<------------- 214 px ------------->|
● Downloading from iCloud
≈≈≈≈≈≈≈≈ ········ ········
◷ 0:03
```

- Copy: `Downloading from iCloud`
- Rail: segment 1 shimmers. No count, because no count is known.
- Timing: elapsed only. No remaining time is shown, because nothing estimates
  it.
- Meta row: **omitted** for every import phase. The package has no counts yet,
  and today's card renders `scene_count ?? 0` as "0 scenes", which is a claim
  about the story that nothing has made.
- Actions: none. Deleting or extracting a package mid-import is not offered.

### 2. Importing: starting, before the engine acknowledges the job

```text
|<------------- 214 px ------------->|
● Starting import…
≈≈≈≈≈≈≈≈ ········ ········
◷ 0:01
```

- Copy: `Starting import…`
- The rail, timing, meta and actions are the same as state 1.

### 3. Importing: queued

```text
|<------------- 214 px ------------->|
● Import queued
┄┄┄┄┄┄┄┄ ········ ········
◷ 0:06
```

- Copy: `Import queued`
- Rail: segment 1 is static and dimmed. Nothing is working yet, and a shimmer
  would say otherwise.
- Timing: elapsed is shown if the host sends it. It is the same clock that has
  been running since the operator acted, so it does not reset.

### 4. Importing: the engine is running the job

```text
|<------------- 214 px ------------->|
● Importing screenplay
━━━━━━━━ ≈≈≈≈≈≈≈≈ ········
◷ 0:12
```

With a count, if the engine ever reports one for import:

```text
|<------------- 214 px ------------->|
● Importing screenplay
━━━━━━━━ ███░░░░░ ········      12/57
◷ 0:12                about 1 min left
```

- Copy: `Importing screenplay`
- Rail: segment 1 is complete and segment 2 is active, shimmering when there is
  no count and filled when there is.

When the import succeeds, the card becomes the real project row (stage
`parsed`). The app starts extraction straight away, so the next state is
`Starting extraction…`.

### 5. Import failed

```text
|<------------- 214 px ------------->|
● Import failed                  (danger)
┄┄┄┄┄┄┄┄ ········ ········       (segment 1 in danger, static)
```

- Copy: `Import failed`
- Timing: omitted. A frozen clock reads as a stalled one.
- The reason is the app's existing `role="alert"` banner (`Import failed:
  <engine message>`). The card does not repeat it.
- The card stays until the operator dismisses the banner or retries. That
  lifecycle is the app's. The card only renders what it is given.

### 6. Extraction: starting

```text
|<------------- 214 px ------------->|
● Starting extraction…
━━━━━━━━ ━━━━━━━━ ≈≈≈≈≈≈≈≈
◷ 0:00
[meta] 27 ch · 57 sc · 26 pl · just now
```

- Copy: `Starting extraction…` (unchanged from today)
- Meta row: shown. The story is parsed, so its counts are real.

### 7. Extraction: queued

```text
|<------------- 214 px ------------->|
● Extraction queued
━━━━━━━━ ━━━━━━━━ ┄┄┄┄┄┄┄┄
[meta] 27 ch · 57 sc · 26 pl · 2m ago
```

- Copy: `Extraction queued` (unchanged)
- Rail: segment 3 is static and dimmed.
- Timing: shown only if the host sends an elapsed time. Today the app does not
  measure queue wait, so this row is normally absent.

### 8. Extracting: no count, elapsed only

```text
|<------------- 214 px ------------->|
● Extracting entities from scenes
━━━━━━━━ ━━━━━━━━ ≈≈≈≈≈≈≈≈
◷ 0:44
[meta] 27 ch · 57 sc · 26 pl · just now
```

- Copy: `Extracting entities from scenes`, the label approved in khaotik-ui
  #285, now on `main`.
- Rail: segment 3 shimmers. The extent is unknown, and filling it to 0% would
  claim no progress.
- Timing: elapsed only. The right-hand cell is empty, because without a count
  there is nothing to estimate from.

### 9. Extracting: count and elapsed, no estimate yet

```text
|<------------- 214 px ------------->|
● Extracting entities from scenes
━━━━━━━━ ━━━━━━━━ █░░░░░░░       2/57
◷ 0:44            estimating time left
[meta] 27 ch · 57 sc · 26 pl · just now
```

- Rail: segment 3 holds the measured fill, `completed / total`. There is no
  shimmer, because a measured bar states its extent.
- Count: `2/57`, tabular figures, at the end of the rail.
- Timing: `estimating time left` in `--text-tertiary`. This shows **only** while
  extracting with a count and no `remainingMs`. It tells the operator that a
  figure is coming, which is true whenever the count is moving.

### 10. Extracting: count, elapsed and remaining (the screenshot's state)

```text
|<------------- 214 px ------------->|
● Extracting entities from scenes
━━━━━━━━ ━━━━━━━━ █░░░░░░░       2/57
◷ 0:44               about 18 min left
[meta] 27 ch · 57 sc · 26 pl · just now
```

At the longest strings:

```text
|<------------- 214 px ------------->|
● Extracting entities from scenes
━━━━━━━━ ━━━━━━━━ ███████░    107/107
◷ 1:02:15        about 1 h 20 min left
```

- Remaining uses `formatRemaining` plus ` left`. No change to the formatter.

### 11. Finalizing

```text
|<------------- 214 px ------------->|
● Finalizing extraction…
━━━━━━━━ ━━━━━━━━ ≈≈≈≈≈≈≈≈      57/57
◷ 17:52
[meta] 27 ch · 57 sc · 26 pl · just now
```

- Copy: `Finalizing extraction…` (unchanged)
- Rail: segment 3 shimmers. Every scene is done, but the final step has no
  measurable extent, so the bar shows "working" rather than a full bar that
  would read as finished. The count stays, frozen at its last value.
- Timing: elapsed keeps ticking. It is the same job and the same clock. No
  remaining time is shown, and no "almost done" either.

### 12. Extraction failed

```text
|<------------- 214 px ------------->|
● Extraction failed              (danger)
━━━━━━━━ ━━━━━━━━ ██░░░░░░      31/57   (fill and dot in --tone-danger)
[meta] 27 ch · 57 sc · 26 pl · 5m ago
```

- Copy: `Extraction failed` (unchanged)
- Rail: segment 3 is static. The fill stays at the last known fraction in
  `--tone-danger`, which shows how far the job got. With no count, the whole
  segment is `--tone-danger` at 35%.
- Timing: omitted.
- Action: the existing retry button (`arrow-clockwise`, "Retry extraction for
  <title>"). Unchanged.

### 13. Done

The host stops sending a job. The card falls back to the stage chip, as it does
today.

```text
|<------------- 214 px ------------->|
● Indexed                        (info)
━━━━━━━━ ━━━━━━━━ ━━━━━━━━
[meta] 31 ch · 57 sc · 28 pl · just now
```

- No count, no timing row. The card becomes openable (`canActivate`).

## Copy

| Job | Phase | Status line | Count | Elapsed | Remaining |
| --- | --- | --- | --- | --- | --- |
| import | downloading | Downloading from iCloud | no | yes | no |
| import | starting | Starting import… | no | yes | no |
| import | queued | Import queued | no | if sent | no |
| import | running | Importing screenplay | if sent | yes | if sent |
| import | failed | Import failed | no | no | no |
| extract | starting | Starting extraction… | no | yes | no |
| extract | queued | Extraction queued | no | if sent | no |
| extract | running | Extracting entities from scenes | if sent | yes | if sent, else "estimating time left" when there is a count |
| extract | finalizing | Finalizing extraction… | if sent | yes | no |
| extract | failed | Extraction failed | last value | no | no |
| none | (done or idle) | stage chip, unchanged | no | no | no |

Format rules, none of them new:

- Elapsed: `formatElapsed`, giving `m:ss` and then `h:mm:ss`.
- Remaining: `` `${formatRemaining(ms)} left` ``. It renders only when
  `formatRemaining` returns a non-empty string.
- Count: `` `${completed}/${total}` `` with the existing validation (integers,
  `0 <= completed <= total`, `total > 0`). An invalid count renders nothing.
- An ellipsis marks only the phases that have no measurable extent and are
  about to change on their own: starting and finalizing. This keeps today's
  convention.

## Tokens

All of these already exist. No new token is needed.

| Use | Token |
| --- | --- |
| All four rows' text | `--caption-size`, `--caption-line` |
| Label, count, elapsed, remaining | `--text-secondary` |
| "estimating time left" | `--text-tertiary` |
| Count, elapsed and remaining figures | `font-variant-numeric: tabular-nums` |
| Space between rows | `--spacing-2xs` (4px). Replaces the literal `3px` footer gap. |
| Space between the rail and the count, and between the timer icon and elapsed | `--spacing-2xs` |
| Footer padding | `--spacing-xs` top, `--spacing-sm` sides and bottom (unchanged) |
| Dot: in flight (starting, queued, running, finalizing, for both jobs) | `--tone-warning` |
| Dot: failed | `--tone-danger` |
| Completed rail segment | `--tone-info` (unchanged) |
| Active segment, fill and shimmer | `--tone-warning` (unchanged) |
| Active segment, queued (static and dimmed) | `color-mix(in oklab, var(--tone-warning) 35%, transparent)`, the shimmer's own end stop |
| Active segment, failed | `--tone-danger`. Its track is `--border-default`. With no count: `--tone-danger` at 35%. |
| Rail track | `--border-default` (unchanged) |
| Timer glyph | `Icon name="timer"`, `--text-secondary`, decorative |

The literals the card already carries stay as they are: the 6px dot, the 3px
rail height and the 5px dot gap.

## Interface contract

### ProjectCard: one `job` prop replaces three

Today the card takes `extractionState`, `extractionProgress` and
`extractionTiming`. Import needs the same three facts, and adding
`importState`, `importProgress` and `importTiming` beside them would mean two
parallel sets of props describing one concept. Replace all three with one prop:

```js
/**
 * A background job running on this project, as the host knows it. Omit when
 * there is none. The card then shows the package stage.
 * @typedef {Object} ProjectJob
 * @property {'import'|'extract'} kind
 * @property {'downloading'|'starting'|'queued'|'running'|'finalizing'|'failed'} phase
 *   `downloading` is import-only. `finalizing` is extract-only.
 * @property {{ readonly completed: number, readonly total: number }} [progress]
 *   Real counts only. Omit when the process has not emitted them.
 * @property {number} [elapsedMs]  Measured from when the operator started the job.
 * @property {number} [remainingMs] A projection. Omit until there is one.
 */

/** @property {ProjectJob} [job] */
```

- `extractionState`, `extractionProgress` and `extractionTiming` are
  **removed**, with no aliases. This is a deliberate break and goes in the
  library's next minor version. There is one consumer, khaos-app, and it
  changes in step with this one.
- `onExtract` stays. `idle` is "no `job`". The extract action is offered when
  the stage is `parsed` and there is either no job or a failed extract job, as
  it is today.
- `job.kind === 'import'` hides the meta row and all of the card's action
  buttons.
- `job` outranks the stage chip whatever the stage is. The current rule only
  lets extraction state speak when the stage is `parsed`
  (`ProjectCard.svelte:295`). An import job happens on a row whose stage is
  `empty` or absent, so the job has to be read first.
- Validation stays at the card's edge, as it is now: a non-finite or negative
  duration renders nothing, and an unknown `phase` renders no job, so the card
  falls back to the stage chip.

### The rail: six segments, and `analyses`

Operator, 2026-10-10: the card's bar gets segments for the analyses. The rail is
import, parse, index, analyze scenes, analyze characters, analyze places, in
that order. The first three are the stage/job rail above, unchanged. The last
three come from `analyses?: ProjectAnalysis[]` — `{ kind: 'scenes' |
'characters' | 'places', state: 'not-started' | 'in-progress' | 'done' |
'failed', progress? }` — placed by `kind`. An analysis the host does not
report, or reports with a kind or state this build does not know, is drawn
empty and titled "not reported": absence is not "not started". A job of kind
`analyze-scenes`, `analyze-characters` or `analyze-places` fills its own
segment live and outranks the report for it. Each segment's `title` names it
and its count ("Analyze scenes: in progress, 30 of 54"); the rail sits above
the activate button so those titles can be hovered.

### Launcher

- `jobFor?: (project) => ProjectJob | undefined` replaces
  `extractionStateFor`, `extractionProgressFor` and `extractionTimingFor`.
- **Key the card loop by identity, not position.** Today it is
  `{#each projects as project, i (i)}` (`Launcher.svelte:449`). With an import
  card prepended, every index shifts, and the pending card cannot become the
  real project in place. Key by `project.path`, falling back to `project.id`,
  so that the pending card and the parsed project are one instance and do not
  flash. **Risk:** a keyed `each` throws on a duplicate key. The host must
  guarantee the key is unique, and the planner owns how.

### Importing from the first moment

The card appears 15 s or more late because the launcher only shows what
khaosd's project listing returns, and a separate investigation is looking at
that delay. This design does not depend on its outcome. **The app renders a
pending row the moment the operator confirms the file**, without waiting for the
listing:

```js
{ id: 'import:<job or local id>', path: '<destination path, once acknowledged>',
  title: '<file name without its extension>' }
// with jobFor(row) -> { kind: 'import', phase: 'downloading' | 'starting' | ..., elapsedMs }
```

- Title: the file's base name without its extension, as the operator chose it.
  It is replaced by the parsed title when the real row arrives. No logline, no
  counts and no stage are set, so nothing is claimed that is not known.
- Cover: the monogram from that title, greyed out as for any card that cannot be
  opened.
- **The clock starts at the operator's action.** Today `importState.startedAt`
  is `null` until the engine reports it (`import.svelte.ts:17`). The app already
  knows the moment the operator confirmed the file, which is a real measured
  start, so the clock runs from `0:00` through downloading, starting, queued
  and running without a gap. Extraction starts its own clock, and the label
  change marks the boundary between the two.
- The app's existing `role="status"` hint stays as the screen-reader
  announcement. Its separate `"<elapsed> elapsed"` line (`App.svelte:831`)
  becomes redundant and should go.

### khaos-app (the consumer)

- One `jobFor(project)` built from `ImportModel` and the extraction model.
- The one-second tick runs while **any** job is in a phase that shows elapsed
  time: import, extraction running, or finalizing. Today it ticks only for
  import and `extracting` (`App.svelte:349-358`), so elapsed time would freeze
  in finalizing.
- Extraction timing has to be sent through `finalizing`, not only while
  `extracting`.

## Accessibility and motion

- The footer stays `aria-hidden`. A value that changes every second must never
  be announced.
- **Gap to close:** today the job state reaches assistive technology only
  through the extract button's `aria-label`, and an import card has no buttons.
  Give the activate button `aria-describedby` pointing at a visually hidden
  span that holds the status line and the count, for example "Extracting
  entities from scenes, 2 of 57". It holds no times. It is not a live region,
  so it is read when the button is reached and not on every change.
- `prefers-reduced-motion` keeps today's rule: the shimmer becomes a solid
  `--tone-warning` segment, and a measured segment keeps its track. Queued and
  failed are static already.
- State is never colour alone. Every state has its own status-line text.

## Risks the build must respect

1. **Card height changes during a job.** The timing row appears and disappears,
   and import cards have no meta row. Grid rows stretch to their tallest card,
   so a neighbouring card does not jump, but the card itself grows by one
   caption line (about 19px) when a job starts. This is accepted. Reserving the
   row on idle cards would leave dead space on every card in the launcher.
2. **Duplicate keys** from the keyed `each`. See "Launcher" above.
3. **Font fallback.** The widths in this document assume the 11px caption. If
   `--caption-size` grows, re-measure the longest label (163px with the
   `system-ui` fallback) against 214px.
4. **Unknown package stage.** The `22ch` cap and its ellipsis stay on
   `.project__label`. The redesign must not remove the guard that
   `ProjectCard.svelte:731-736` exists for.

## Verification the build owes

- A catalog fixture for every state in "States", rendered on a 240px card. That
  keeps `check-catalog` honest about the new `job` prop.
- A rendered measurement in the catalog app (Tauri MCP), not jsdom: every row's
  `scrollWidth <= clientWidth` at 240px, and the label's text equals the full
  copy. jsdom resolves no stylesheets, so a jsdom test cannot see a wrap or an
  ellipsis (`RULES.md`, Testing and delivery).
- A live pass in khaos-app against a running khaosd: import Broken in 4 Places,
  confirm the card appears within one frame of confirming the file, and watch it
  go through import, extraction and done without a gap or a flash.
