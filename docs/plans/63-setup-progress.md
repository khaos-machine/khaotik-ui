# Plan — `SetupProgress`, the surface for a long-running verb (#63)

Branch `feat/63-setup-progress`. Library `0.16.0` → `0.17.0` (additive).
Proposed decision row: **D73** (the register's tail is `D72`,
`docs/decisions.md:192`).

Amended against a red-team audit. Findings C1, M1–M4, M6, m1–m5 and the
citation error are folded in below. **C2 and M5 were routed to the operator and
are now ruled** — §0 records both questions, the costing each was decided on,
and the answer.

---

## 0. Ruled by the operator, 2026-09-04

Two red-team findings were scope questions about #63's own intent. They
belonged to the issue author, not to this plan, and were put to the operator
with both answers costed. **Both are now ruled, and the rulings are recorded
below beside the question that produced them.** They are required content in
the D73 row.

| | Question | Ruling |
| --- | --- | --- |
| **C2** | Does "expanding must not change the outer surface's height" bind this component? | **Superseded by comment 2.** It binds neither; the bound log plus the no-centred-scroll rule is sufficient. §4c keeps its two bullets. |
| **M5** | Is `variant: 'surface'` a sufficient answer to "a mode, not a panel"? | **Yes — the panel-plus-variant ruling stands.** The host owns the takeover. |

### C2 — does "must not change the outer surface's height" bind the outer surface?

Issue #63's first comment states: *"expanding the disclosure must not change the
outer surface's height."* That is **three** rules, not two:

1. the log region is bounded and scrolls inside its bound;
2. no scroll container in this component centres its content;
3. **the outer surface's height does not change when the disclosure expands.**

This plan bounds the **log** (rule 1) and forbids centred scroll containers
(rule 2). It does **not** bound the outer surface, and §4c asserts rules 1 and
2 only. An earlier draft said "both are asserted", where "both" was this plan's
two rules and not the issue's three — that sentence is corrected in §2.

Rule 3 is a genuinely different requirement and it is not free. Holding the
outer height constant across a disclosure toggle means the component reserves
the log's `max-height` **whether or not the disclosure is open** — the
collapsed state pays for space it does not use, which contradicts "collapsed
the operator gets a calm screen". The alternatives are a fixed outer height set
by the host, or reading the sentence as scoped to the surrounding page rather
than to this component.

**The question put to the operator:** does rule 3 bind `SetupProgress`, or does
it bind the host that mounts it?

**RULED — superseded by comment 2.** Comment 2 identified the real cause of the
reference's clipping as `flex-1 items-center justify-center`, not layout growth.
Bounding the log and refusing centred scroll containers is therefore sufficient,
and **the outer surface may grow when the disclosure opens.**

`reserveLog` is **not** added. §4c keeps its two bullets. Rule 3 is recorded in
the D73 row as withdrawn on the operator's reading of comment 2, so a later
reader finds the reasoning rather than an unexplained absence.

### M5 — "a mode, not a panel": is the full-surface takeover in scope?

Issue #63's first comment, under *"The component this becomes:
SetupProgress"*, states: **"A mode, not a panel. Full-surface, chrome
suppressed, for the duration."**

**This plan narrows that, and the narrowing is a decision rather than a
derivation.** §2 previously attributed the full-window mode to the Unsloth
*reference* and ruled it orchestration on the strength of
`Readiness.svelte:17-22`. That misstates the source: the mode is stated by the
**author, about this component**, in the same paragraph that names it. The
ruling may well be correct — a component that seizes the viewport is
orchestration by this kit's own rule, and `Readiness` holds exactly that line —
but it is a narrowing of author-stated scope and is surfaced here as a
deviation, not buried in a rationale.

**What this plan ships instead:** `variant: 'card' | 'surface'`, the affordance
`Readiness` already ships (`Readiness.svelte:43`), where `surface` drops the
card chrome so a host can mount it full-window. The chrome suppression is in
scope; the *seizing of the viewport* is not.

**The question put to the operator:** is `variant: 'surface'` a sufficient
answer to "a mode, not a panel", or does #63 require this component to own the
takeover?

**RULED — `variant: 'surface'` suffices; the host owns the takeover.** The
narrowing stands, and the D73 row must record it as a deviation from
author-stated scope with the reasoning above — not as a derivation. The
component does not grow a fixed-position branch, a focus trap, `aria-modal`,
escape semantics or scroll locking; if a takeover is later wanted it belongs to
the shell that mounts this, and is its own issue.

Neither ruling changes steps 1 through 5 below.

---

## 1. The gap, and the failing test that proves it

`POST /api/services/{id}/setup` blocks for up to five minutes
(`khaos-manager/internal/api/services.go:131`, cited in issue #63's first
comment) while `Manager.Setup` writes a streamed provision log and emits
`service.setup-step` events carrying `{name, state, detail}`. The kit renders
none of it. `ServiceStatusList`'s `pendingId` (`ServiceStatusList.svelte:34`)
disables one row, names a verb, and that is the entire surface.

There is no export that can render a step feed or a streamed transcript. The
red is therefore an unresolvable import plus a behavioural assertion — written
in full, this is the first test to land:

```js
// apps/catalog/src/components/SetupProgress.test.js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import SetupProgress from '@khaos-machine/khaotik-ui/components/svelte/SetupProgress.svelte'

describe('SetupProgress', () => {
  // The verbatim rule at InstallScript.svelte:19 holds for its script, applied
  // to streamed output: the text on screen is the text khaosd emitted. The
  // panel is COLLAPSED by default, so the transcript must not be in the
  // document at all until the disclosure is open — hidden-but-present would
  // still be read by a screen reader and would still be found by this query.
  it('keeps the transcript out of the document until the disclosure is open', async () => {
    const lines = [
      'Creating virtual environment at /Users/k/.khaos/mlx-audio/venv',
      'Resolved 41 packages in 812ms',
    ]

    const { rerender } = render(SetupProgress, {
      props: { title: 'Provisioning MLX Audio', lines, open: false },
    })
    expect(screen.queryByText(/Resolved 41 packages/)).toBeNull()

    await rerender({ title: 'Provisioning MLX Audio', lines, open: true })

    // ONE TEXT NODE, joined — not two elements — so the transcript can be
    // selected and copied as khaosd wrote it. Asserted as the structural
    // property rather than as string equality: `.textContent === lines.join()`
    // reds against any template formatting that puts a newline between the
    // `<pre>` tag and the expression, which is what a formatter naturally
    // does. The child-node assertion is what the rule actually is.
    const log = screen.getByTestId('setup-progress-log')
    expect(log.childNodes.length).toBe(1)
    expect(log.childNodes[0].nodeType).toBe(Node.TEXT_NODE)
    expect(log.textContent.trim()).toBe(lines.join('\n'))
  })
})
```

**Where `emptyLabel` renders, relative to the testid element.**
`data-testid="setup-progress-log"` sits on the `<pre>`, and **the `<pre>` is
rendered only when `lines.length > 0`**. `emptyLabel` renders in a sibling
`<p class="note">` inside the open disclosure, never inside the `<pre>`. So the
testid element's text content is the transcript and nothing else, and
`queryByTestId('setup-progress-log')` is `null` in the nothing-emitted case —
which is itself an assertion in step 4.

It fails today at the import: `components/svelte/SetupProgress.svelte` does not
exist, so `check-catalog`, `check-taxonomy` and the suite have nothing to
report on.

**Deliberately not the red:** a rendered assertion about tail-following. jsdom
does no layout, so such a test passes identically against a component with the
scroll effect deleted. §4 states what replaces it.

---

## 2. Fix approach

One new export, `SetupProgress`, in `components/svelte/` — a props-driven atom
in the `feedback` group beside `InstallScript` and `OutcomeBanner`. It renders
four things and forms no verdict of its own:

1. **A headline and honest copy.** Indeterminate by construction. khaosd emits
   discrete steps, not a byte count, so there is no percentage to show and one
   would be invented — the same reasoning `RequirementList` applies to its
   `unknown` verdict (`RequirementList.svelte:49-56`).
2. **An indeterminate spinner**, shown only when the caller sets `busy`, with
   an accessible equivalent that does not depend on `note` (§3, M2).
3. **Step rows** from `service.setup-step`, tones mapped from `StepState` onto
   the kit's seven-way `StatusTone`, keyed by index — announced through a
   polite live region (§3, M3).
4. **A disclosure over the raw transcript**, collapsed by default, bounded with
   `max-height` + `overflow-y: auto`, wrapping rather than scrolling
   horizontally (§3, M6), following the tail unless the operator has scrolled
   up.

**The takeover is the host's, not the component's — and that is a narrowing of
#63, recorded in §0/M5, not a derivation.** The affordance shipped here is the
one `Readiness` already offers: `variant: 'card' | 'surface'`
(`Readiness.svelte:43`), where `surface` drops the card chrome so a host can
mount it full-window without reaching into component internals.
`Readiness.svelte:17-22` is the rule this kit holds against a component owning
orchestration, and it is the reasoning behind the narrowing — it is not
evidence that #63 asked for something smaller than it did.

**The clipping trap is a spec line.** Issue #63's second comment corrects its
own first: the reference's `max-h-28 overflow-auto` is right, and the clipping
comes from `flex-1 items-center justify-center` inside an `overflow-y-auto`
parent — a flex container that centres content it cannot fit clips the
overflowing end instead of letting it scroll. So: the log region owns a
`max-height` and scrolls inside it, and **no scroll container in this component
centres its content**.

**These two rules are asserted by the source-read test in §4c, because jsdom
resolves no stylesheets and cannot see either. They are two of the issue's
three; the third — "expanding the disclosure must not change the outer
surface's height" — is unresolved and is §0/C2.**

---

## 3. The prop contract

```js
/** @typedef {import('./lib/types.js').StatusTone} StatusTone */

/**
 * One provisioning step, as `service.setup-step` reports it
 * (khaos-manager `internal/localservices/manager.go:267-273`; the state
 * vocabulary is `StepState` at `manager.go:30-35`).
 *
 * DEFINED HERE, NOT IN `lib/types.js`. That file is for shapes MORE THAN ONE
 * component reads, and says so — `ServiceStatusList` does not read this one.
 * (`Service` in `lib/types.js` has no `setup_steps` property today even though
 * `GET /api/services` sends one; that is a real gap, filed separately, and
 * closing it here would be adding a shared type for a single reader.)
 *
 * @typedef {Object} SetupStep
 * @property {string} name The step khaosd names — `python`, `venv`, `apple_silicon`, `packages`, `weights`. Rendered verbatim; there is no display-name table, because inventing one means guessing at a vocabulary the daemon owns.
 * @property {string} [state] Typed `string`, with the four `StepState` members named in this docblock and NOWHERE ELSE IN THE TYPE — `pending`, `passed`, `failed`, `skipped`. Absent, or unrecognised, renders NEUTRAL: neither a pass nor a failure has been reported. See the note below on why this is not `(string & {})`.
 * @property {string} [detail] The step's own sentence — a resolved interpreter path, a venv location, a failure reason. Rendered verbatim and never truncated, as `OutcomeBanner`'s detail is (`OutcomeBanner.svelte:126-135`).
 */
```

### Why `state` is `string` and not `'pending'|…|(string & {})` (M4)

The first draft typed this `(string & {})` and cited `Service.state`
(`lib/types.js:220`) as the precedent. That citation names the side its own
source rejects.

`components/svelte/lib/types.js:127-143` records a **measurement**, not an
opinion: through this package, `Extract<Project['package_stage'], 'empty'>`
resolves to `never` from a consumer's side, so the named members **do not
survive to the people the trick exists to help** — *"the intersection would
have bought a false sentence in this docblock and nothing else."* The same
measurement is pinned in the gate itself: `scripts/check-consumer.mjs` states
that closing the union reddens its probe while *"the `(string & {})`
intersection does NOT, because it measures as `string` anyway."*

So a `SetupStep.state` docblock promising editor completions would be asserting
something this repository has already measured not to arrive. `Service.state`
predates that measurement; it is the case that has not been revisited, not the
case that refutes it.

**This case does not differ from `package_stage` in the way that would matter.**
`StepState` is open at the producer — khaos-manager can add a member and this
client receives it unfiltered, exactly as `package_stage` does — so a closed
union would be false about the wire. And the four members are named in prose
either way. `string` says exactly what is true.

**This is pinned, not merely chosen.** Step 8a adds a `_Exact` assertion to
`check-consumer.mjs`'s generated probe, following the W-11 precedent already in
that file, so the next person to "tighten" it meets the reason and a red gate
rather than only a comment.

### Props

```js
/**
 * @typedef {Object} Props
 * @property {string} [title] What is being provisioned — "Provisioning MLX Audio". The subject, supplied by the host; this component does not know which service it is looking at.
 * @property {string} [note] The honest copy that carries what a percentage would have claimed falsely — "This may take a few minutes. Do not close the app." Absent renders nothing rather than a default sentence, because how long a host's work takes is not a fact this component holds. It is NOT the accessible carrier of `busy` — see `busyLabel`.
 * @property {boolean} [busy] Work is in flight. CONSUMER-SET AND NEVER INFERRED, the same contract as `Readiness.probing` and `ServiceStatusList.pendingId`: output arriving is not proof work is still running, and a component that spun because lines appeared would be asserting something it never observed. Defaults `false`, so a caller that says nothing produces no claim.
 * @property {string} [busyLabel] The accessible equivalent of the spinner, rendered in a `.visually-hidden` span whenever `busy` is set. Defaults to `'Working…'` — a DEFAULT AND NOT AN EMPTY STRING, because the spinner is `aria-hidden` and without this a screen-reader user is told nothing at all while five minutes of provisioning runs.
 * @property {readonly SetupStep[]} [steps] The step feed. Empty means NOBODY HAS REPORTED A STEP, which is not the same as no steps existing — the empty copy says so.
 * @property {readonly string[]} [lines] The provisioning transcript, rendered VERBATIM — never rewritten, reformatted or "fixed", the rule `InstallScript.svelte:19` already holds. Joined with newlines into one text node so the operator can select and copy exactly what khaosd wrote.
 * @property {boolean} [open] Whether the transcript disclosure is expanded. Collapsed by default: collapsed the operator gets a calm screen, expanded they get proof.
 * @property {(open: boolean) => void} [onToggle] Called with the state being requested. **Omit it and the disclosure control renders DISABLED rather than absent** — the house contract `InstallScript.onCopy` and `ServiceStatusList`'s row actions both use. A host that renders a transcript it will not let anyone open should have that visible.
 * @property {string} [label] The disclosure's word while COLLAPSED.
 * @property {string} [openLabel] The disclosure's word while EXPANDED. Two props, not one: a control that still reads "Show setup details" over an open panel is a false statement, which is the defect class D71 and D72 both turn on.
 * @property {string} [emptyLabel] Shown inside the open disclosure when nothing has been emitted yet — which is NOT the same as finished, and the copy must not let the two be read as one. Renders as a sibling of the `<pre>`, never inside it (§1).
 * @property {'card'|'surface'} [variant] `card` (default) keeps the border and radius that separate this from its siblings in a gallery. `surface` drops them for a full-window mount, so a host does not reach into component internals for a layout the component should offer. The full-window TAKEOVER is the host's — this component owns no viewport and starts no mode. That is a narrowing of #63; see §0/M5.
 */

/** @type {Props} */
let {
  title = '',
  note = '',
  busy = false,
  busyLabel = 'Working…',
  steps = [],
  lines = [],
  open = false,
  onToggle = undefined,
  label = 'Show setup details',
  openLabel = 'Hide setup details',
  emptyLabel = 'No output yet.',
  variant = 'card',
} = $props()
```

Every prop carries an explicit default, `= undefined` where there is nothing
better to say — required by `props-optionality.test.js`, which fails a bare
`$props()` member because `svelte2tsx` emits it as REQUIRED and the shipped
`.d.ts` then lies to consumers (#31).

### Step tone mapping

```js
const TONES = { passed: 'success', failed: 'danger', skipped: 'skipped' }
// `pending` and anything unrecognised are NEUTRAL. Rendering `pending` as
// success is the failure this surface exists to prevent, and it is not danger
// either — nothing is known to be wrong. Same rule RequirementList applies to
// `unknown` (RequirementList.svelte:49-56).
const toneFor = (s) => TONES[s?.state] ?? 'neutral'
```

`skipped` is why the kit's `StatusTone` is seven-way rather than five
(`lib/types.js`); mapping it to neutral is the defect that put it there.

Step rows reuse `StatusPill` and mirror `RequirementList`'s dot + name + detail
+ pill layout. Keyed by index — `{#each steps as step, i (i)}` — per #95/#96:
khaosd sends empty-string ids and a bare `.id` key aborts the render.

### Tokens — every one verified present, with its file

| Token | File |
| --- | --- |
| `--font-mono` | `tokens/tokens.css` |
| `--caption-size`, `--caption-line`, `--caption-track`, `--caption-weight` | `tokens/tokens.css` |
| `--body-md-size`, `--body-md-line`, `--body-md-weight` | `tokens/tokens.css` |
| `--label-md-size`, `--label-md-line`, `--label-md-weight` | `tokens/tokens.css` |
| `--heading-md-size`, `--heading-md-line`, `--heading-md-weight`, `--heading-md-track` | `tokens/tokens.css` |
| `--text-primary`, `--text-secondary` | `tokens/tokens.css` |
| `--surface-base`, `--surface-raised` | `tokens/tokens.css` |
| `--border-default`, `--border-hairline`, `--border-focus` | `tokens/tokens.css` |
| `--radius-sm`, `--radius-md` | `tokens/tokens.css` |
| `--spacing-2xs`, `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl` | `tokens/tokens.css` |
| `--size-stroke-focus` | `tokens/tokens.css` |
| `--tone-success`, `--tone-danger`, `--tone-neutral`, `--tone-skipped`, `--tone-info` | `tokens/tokens-extra.css` |
| `.eyebrow`, `.note` (classes, not properties) | `tokens/utilities.css` |
| `.visually-hidden` (class) | `tokens/utilities.css:66` — **used**, by `busyLabel`; see M2 below |

**`font-weight` is never hand-set** — `--caption-weight`, `--body-md-weight`,
`--label-md-weight`, `--heading-md-weight` are the only sources.

**`--text-tertiary` is not used.** `contrast-guard.test.js` (D64, #66) fails any
new rule declaring it that is not on the hand-authored allow list, and there is
no case for it here.

**Do not reach for these — they do not exist**, and each has already shipped as
an invalid-at-computed-value-time declaration in this repo:
`--surface-sunken`, `--border-subtle`, `--border-strong`, `--body-sm-size`,
`--title-lg-size`, `--label-xs-*`. `token-refs.test.js` is the gate.

**There is no motion token.** The kit ships no `--duration-*` or `--motion-*`,
so the spinner's timing is a CSS literal (`0.9s linear infinite`). That is
legitimate — `token-refs` gates `var(--…)` references, not literals — and it is
stated here so nobody invents `--duration-slow` to make it look tidier.

### The transcript's wrapping rules (M6)

Issue #63 requires the transcript to carry `overflow-wrap: anywhere` and
`white-space: pre-wrap`, citing `OutcomeBanner.svelte:132-134` — which is
`.outcome__detail`, verified to declare exactly those two properties.

**The first draft cited that range for `detail` and omitted it for `lines`, and
that is a real defect, not a documentation slip.** A bare `<pre>` defaults to
`white-space: pre`, so a 200-character `uv` resolution line scrolls the log
region horizontally instead of wrapping. Nothing in this repository can see it:
jsdom resolves no stylesheets, and `token-refs.test.js` matches only
`var(--…)`, so neither a rendered assertion nor the token gate has any opinion
about a missing `white-space`.

So the log rule declares, non-negotiably:

```css
.setup__log {
  max-height: 11rem;           /* bounded — the reference's max-h-28 */
  overflow-y: auto;
  overflow-wrap: anywhere;     /* a path with no spaces still breaks */
  white-space: pre-wrap;       /* NOT the <pre> default; wraps instead of
                                  scrolling sideways */
  font-family: var(--font-mono);
  /* no justify-content, no align-items: center — see §2 */
}
```

`pre-wrap` rather than `pre-line` deliberately: `pre-line` collapses runs of
spaces, and a provisioning log's column alignment is part of what khaosd wrote.

Both properties are asserted by the source-read test in §4c, with their own
mutation checks.

### The spinner, its accessible equivalent, and the first `@keyframes`

`grep` over `components/svelte/*.svelte` returns zero `@keyframes` and zero
`prefers-reduced-motion`. The only precedent in the repo is
`apps/catalog/src/components/shell/Updater.svelte:114`, a `pulse` on a status
dot — catalog-side, and it carries no reduced-motion guard.

So this component introduces both. A rotating ring, track `var(--border-default)`
and head `var(--tone-info)`, paired with:

```css
@media (prefers-reduced-motion: reduce) {
  .setup__spinner { animation: none; }
}
```

**The ring is `aria-hidden`, and the claim is carried by `busyLabel`, not by
`note` (M2).** An earlier draft said `note` carried it. `note` defaults to
`''`, so `busy: true` with no `note` — the default path, and the one a first
integration takes — rendered an `aria-hidden` ring and nothing else: a screen
reader was told nothing at all for the five minutes the work ran.

```svelte
{#if busy}
  <span class="setup__spinner" aria-hidden="true"></span>
  <span class="visually-hidden">{busyLabel}</span>
{/if}
```

`.visually-hidden` is `tokens/utilities.css:66` and this is the first rule in
the kit that names it — it was in the token table and in no rule at all.
`busyLabel` defaults to `'Working…'` rather than to `''` for exactly the reason
above: a default of nothing reproduces the defect.

This follows the D52 shape the kit already uses — the visual is decorative, the
text is the accessible content.

### Live regions — what is announced, and what is not (M3)

**This component introduces the library's first live region.** `grep -rn
'role="status"\|aria-live\|role="log"' components/svelte/*.svelte` returns one
hit and it is `role="alert"` (`InstallScript.svelte:103`, the Trojan-Source
alarm) — an assertive, one-shot announcement, not a feed. There is no polite
live region anywhere in `components/svelte/`. Flagged here the way the first
`@keyframes` is flagged, because a first has no house precedent to copy and the
next component will copy this one.

**The step feed IS announced.** `aria-live="polite"` on the step list
container. The step rows are discrete, few (khaosd emits five: `python`,
`venv`, `apple_silicon`, `packages`, `weights`) and change infrequently — this
is the textbook case for a polite live region, and the first draft did not
consider it at all. With the M2 defect that meant a screen-reader user heard
nothing when a step flipped to `failed`.

**CORRECTED AFTER REVIEW, 2026-09-04.** This sentence read "…and nothing when
the work completed", and completion is **still** announced to nobody. The
failed-step half is real and verified. The completion half was an overclaim:
`busyLabel` is rendered only *while* `busy`, so when `busy` goes false the
`.visually-hidden` span is **removed**, and `aria-relevant` on a `role="status"`
region defaults to `additions text` — a removal is not announced. Nothing else
fires either; the step list announces step *changes*, and the work finishing is
not one.

**Not closed here, deliberately.** `busy: false` means no work is in flight,
which this component cannot tell from *succeeded*, *failed* or *cancelled* — it
is handed `busy` and never infers it (§3, the consumer-set contract). An
announcement on that edge would assert an outcome the component never observed,
which is the `pending`-rendered-as-success failure this whole surface exists to
prevent, wearing a different hat. **The outcome is a fact only the terminal-state
surface holds, and §7.4a already routes that to #60.** So the claim is corrected
rather than the code widened; D73 carries the same correction.

```svelte
<ul class="setup__steps" aria-live="polite" aria-relevant="additions text">
```

`aria-relevant="additions text"` and not `all`: a removal is not news, and
`removals` on a list that re-keys is a source of spurious announcements.

**The transcript is NOT announced.** The `<pre>` is a plain `<pre>` and is not
`role="log"`, `role="alert"` or `aria-live`. `role="log"` carries an implicit
`aria-live="polite"`, and a five-minute `uv pip` transcript announced line by
line is not an accessibility win — it is a denial of service. This refusal was
attacked by the red-team and survived.

**The headline block carries `role="status"`.** It changes rarely and it is
where the state actually is.

So: three regions, three different answers, each for a stated reason — the step
feed polite, the headline `role="status"`, the transcript silent.

---

## 4. Follow-the-tail — implementation, and what can honestly be tested

### 4a. Implementation

The decision is extracted to a pure module so it is testable without a layout
engine:

```js
// components/svelte/lib/tail-follow.js
//
// Does a scrollable region sit close enough to its bottom that new content
// should keep it there? Extracted rather than inlined for one reason: this is
// the only part of tail-following that can be tested honestly. The DOM half
// needs a layout engine, and the test environment has none.

/** How close to the bottom still counts as "at the bottom", in CSS pixels. */
export const STICK_THRESHOLD_PX = 24

/**
 * @param {{ scrollTop?: number, clientHeight?: number, scrollHeight?: number } | null} metrics
 * @param {number} [threshold]
 * @returns {boolean}
 */
export const shouldFollow = (metrics, threshold = STICK_THRESHOLD_PX) => {
  if (!metrics) return false
  const { scrollTop = 0, clientHeight = 0, scrollHeight = 0 } = metrics
  return scrollHeight - clientHeight - scrollTop <= threshold
}
```

An unlaid-out or not-yet-overflowing region reports `0/0/0`, distance `0`, and
therefore **follows** — which is right: a panel with nothing to scroll is at its
bottom.

In the component:

```js
let logEl = $state(null)
let follow = $state(true)

/** Recomputed from the element on every scroll — the operator's position is the
    only input, and it is read, never remembered from a wheel event. Note this
    can set `follow` back to TRUE: scrolling back down within the threshold
    RESUMES following, and that is the behaviour §4b-b exists to pin. */
const onLogScroll = () => { follow = shouldFollow(logEl) }

// Reopening the disclosure resumes following.
//
// AMENDED AFTER MEASUREMENT, 2026-09-04. This read "Reads `open` and nothing
// else, so it runs on that transition and on mount, and never on a new line",
// and that is FALSE. An effect body of `if (open) follow = true` re-runs
// whenever the `open` PROP SIGNAL is invalidated, which is not the same as
// `open` changing value: a props-spreading host and
// @testing-library/svelte's `rerender` both replace the props object
// wholesale, so every arriving line re-ran it and reset `follow` to true.
// Following could then never be stopped — the operator scrolls up to read an
// error and the next line yanks them back.
//
// Measured: restoring the form below fails three of the four §4b-b wiring
// assertions. What ships is guarded on the TRANSITION with a non-reactive
// `wasOpen`, so the described behaviour is what the component actually has:
//
//   let wasOpen = false
//   $effect(() => {
//     if (open && !wasOpen) follow = true
//     wasOpen = open
//   })
//
// Absorbed by the builder without a re-plan: no step and no scope moved, only
// this expression. Recorded here and in the D73 row rather than left as a
// silent divergence between the plan and the code.
$effect(() => { if (open) follow = true })

// Follow the tail. `lines.length` is the dependency; the guard is the operator's
// position. A panel that yanks itself to the bottom while someone is reading an
// error is worse than one that never scrolls.
$effect(() => {
  void lines.length
  const el = logEl
  if (!el || !open || !follow) return
  el.scrollTop = el.scrollHeight
})
```

`scrollTop = scrollHeight` rather than `scrollTo({ behavior: 'smooth' })`
deliberately. `StoryPlayer.svelte:129-133` records the lesson — jsdom does not
implement `scrollTo`, and a component that throws from an effect on a missing
convenience API takes the whole surface down. A property assignment cannot
throw, so the feature detection StoryPlayer needs is not needed here.

`bind:this` + a DOM `$effect` is not the orchestration `Readiness.svelte:17-22`
forbids: it fetches nothing, subscribes to nothing, and advances nothing. It
reads one element this component owns and one prop it was handed.
`StoryPlayer.svelte:133` is the precedent.

### 4b. What jsdom can and cannot prove — stated plainly

**It cannot prove the behaviour.** jsdom performs no layout: `scrollHeight` and
`clientHeight` are hard-coded `0`, and its `scrollTop` setter is a documented
no-op for an element with no layout box. A test that renders the component, adds
lines and asserts "it scrolled" would pass identically against a build with both
`$effect`s deleted. That is a vacuous gate, and this repo has shipped three of
them (`CLAUDE.md`). It will not ship a fourth.

Three tests replace it, each stating its own reach.

**(a) The predicate — a real test.** `apps/catalog/src/components/tail-follow.test.js`
over `shouldFollow` with synthetic metrics: exactly at the bottom; one pixel
inside the threshold; one pixel past it; scrolled far up; the degenerate
`0/0/0`; `null`. This genuinely tests the decision rule, because the rule is
arithmetic and needs no layout.

**(b) The wiring — honest, scoped, and able to distinguish `shouldFollow` from
a boolean latch (M1).**

The first draft's two assertions could not tell `shouldFollow` apart from
"any scroll disables following forever". `follow` starts `true`, so assertion 1
never consulted the predicate at all; and assertion 2 passed identically
against `onscroll={() => follow = false}`. Both are still worth having, but the
test only earns its name with a third case.

In `SetupProgress.test.js`, install a fake layout on the rendered log element:

```js
const el = screen.getByTestId('setup-progress-log')
let top = 0
Object.defineProperty(el, 'scrollHeight', { get: () => 400, configurable: true })
Object.defineProperty(el, 'clientHeight', { get: () => 100, configurable: true })
Object.defineProperty(el, 'scrollTop', {
  get: () => top, set: (v) => { top = v }, configurable: true,
})
```

The scrollable range is `400 - 100 = 300`, and `STICK_THRESHOLD_PX` is `24`, so
`top >= 276` follows and `top < 276` does not.

1. **Follows by default.** Rerender with another line; assert `top === 400`.
   (Does not consult the predicate — stated as such.)
2. **Scrolling away stops it.** Set `top = 0`, dispatch `scroll`, rerender with
   another line; assert `top` is still `0` — the operator scrolled up and was
   not yanked back.
3. **Scrolling back within the threshold RESUMES it — the distinguishing
   case.** From the state left by (2), set `top = 290` (inside the 24px band,
   `400 - 100 - 290 = 10`), dispatch `scroll`, rerender with another line;
   assert `top === 400`. **A boolean latch reds here**, because nothing would
   ever set `follow` back to `true`. This is the assertion that proves the
   handler calls `shouldFollow` rather than merely clearing a flag.
4. **Just outside the band does NOT resume.** Set `top = 200`
   (`400 - 100 - 200 = 100 > 24`), dispatch `scroll`, rerender; assert `top`
   is still `200`. Paired with (3) this pins the threshold at the component
   level, not only in the pure module.

**What this proves:** the effect is wired to the right element, the scroll
handler consults `shouldFollow` in both directions, and the threshold the
component uses is the one `tail-follow.js` exports.

**What it does not prove:** that a real engine scrolls, because the layout it
runs against is one the test wrote. The test carries that sentence in a
comment.

**What it does NOT claim, and the first draft wrongly did:** that the effect
does not run while collapsed. §1 requires the transcript to be **absent from
the DOM** when collapsed, so there is no element to instrument and no assertion
was ever specified. The collapsed case is covered by §1's
`queryByText(...)` being `null` — an absence assertion, not an effect
assertion — and the claim is dropped here rather than restated.

**(c) The bounding and wrapping rules — a source read.** jsdom resolves no
stylesheets, so `max-height`, the `justify-content: center` trap, and the M6
wrapping properties are all invisible to a rendered assertion. A text scan over
`SetupProgress.svelte`'s `<style>` block, comments stripped (the pattern
`token-refs.test.js:41-45` already uses, and the trap `regressions.test.js:22`
learned the hard way).

Each bullet names the mutation that must red it — a structural test whose
mutation is not stated is a structural test nobody has checked (m1):

1. **The log rule declares a real `max-height`.** Not a string-presence check:
   the first draft's version was satisfied by `max-height: none`, which bounds
   nothing. Match the declaration and reject `none`, `unset`, `initial`,
   `revert` and `auto` by value, within the rule that also declares
   `overflow-y: auto`.
   **Mutation:** change it to `max-height: none` — must red. (Deleting the
   declaration entirely must also red; that is the weaker of the two and is
   checked second.)
2. **No rule declares `justify-content: center` together with an `overflow-y`
   other than `visible`.** Scoped to the rule block, not the file — a centred
   flex row elsewhere in the component is fine and must not red this.
   **Mutation:** add `justify-content: center` to `.setup__log` — must red.
   **Negative control:** add `justify-content: center` to a rule with no
   `overflow-y` — must stay green, or the check is matching the file rather
   than the pairing.
3. **The log rule declares `white-space: pre-wrap`** (M6).
   **Mutation:** delete it — must red. **Mutation:** change it to
   `white-space: pre` — must red, because that is the `<pre>` default this rule
   exists to override and a presence-only check would pass it.
4. **The log rule declares `overflow-wrap: anywhere`** (M6).
   **Mutation:** delete it — must red.

**Not covered, and named as such:** actual scroll behaviour in WebKit. The
honest confirmation is the catalog running on device. The `tauri` MCP bridge can
measure it once by hand (`webview_execute_js` reading `scrollTop`/`scrollHeight`
off the panel while lines stream), and that is a manual check, not a gate —
there is no runner for it. `StoryPlayer`'s identical effect is untested today
for exactly this reason, and this plan does not pretend to close that.

---

## 5. Ordered steps, each with the gate that proves it

Each step is independently verifiable and leaves the tree green or explicitly
red-by-design.

| # | Step | Gate that proves it |
| --- | --- | --- |
| 1 | Write `apps/catalog/src/components/SetupProgress.test.js` with the test in §1 only. | `cd apps/catalog && npx vitest run src/components/SetupProgress.test.js` — **RED**, unresolved import. This is the red-first checkpoint; do not proceed until it fails for that reason and no other. |
| 2 | Add `components/svelte/lib/tail-follow.js` and `apps/catalog/src/components/tail-follow.test.js` (§4b-a). | `npx vitest run src/components/tail-follow.test.js` green. Independent of the component — it can land and pass alone. |
| 3 | Write `components/svelte/SetupProgress.svelte`: the `Props` typedef of §3, the markup, the tone map, the tokens table, the spinner with its reduced-motion guard **and its `.visually-hidden` `busyLabel`**, the three live-region decisions of §3, the log rule's four CSS declarations of §3/M6, and the two `$effect`s of §4a. | Step 1's test goes green. `npx vitest run src/token-refs.test.js` green — every `var(--…)` resolves. `npx vitest run src/contrast-guard.test.js` green. |
| 4 | Extend `SetupProgress.test.js` with: the four wiring assertions (§4b-b) **including the resume case**; the collapsed/expanded disclosure; `onToggle` omitted → control disabled; `busy` with **no `note`** → the `busyLabel` text is queryable by an accessible-name query (this is the M2 red — assert it against `busy: true, note: ''`); the step list carries `aria-live="polite"`; the empty-vs-nothing-emitted copy, asserting `queryByTestId('setup-progress-log')` is `null` and `emptyLabel` is present; the four step tones plus the unrecognised-state neutral case; and `variant: 'surface'` dropping the chrome. | `npx vitest run src/components/SetupProgress.test.js` green. **Mutation-check the two that a naive implementation would pass anyway:** delete the `busyLabel` span and confirm the `busy`-with-no-`note` assertion reds; replace `onLogScroll` with `() => { follow = false }` and confirm §4b-b assertion 3 reds. |
| 5 | Add the source-read bounding + wrapping test (§4c) to `SetupProgress.test.js`. | Same file green, then run **every mutation and the negative control listed in §4c** — four must-red mutations and one must-stay-green control. A structural test that cannot fail is worth nothing, and this repo has shipped three that could not. |
| 6 | Export from `components/svelte/index.js` under the `feedback` comment group, beside `InstallScript` and `OutcomeBanner`. | `npm run check-catalog` — **RED (exit 1)**, no fixture yet. That red is the gate doing its job and is the proof step 7 is required. |
| 7 | Add the fixture to `apps/catalog/src/fixtures.js` — see the real-data ruling below the table (m3). | `npm run check-catalog` green (`52/52`), `npm run check-taxonomy` green. **The import is not optional and not implied by the entry**: issue #113 measured all five gates returning 0 against `fixtures.js` using `Readiness` with no import statement, because a bundler builds and does not evaluate. The suite catches it only because `App.test.js` imports `fixtures.js`. Verify by hand: delete the import line, run `npx vitest run src/App.test.js`, confirm it reds, restore. |
| 8 | `npm run build-types`. | `npm run check-types` green (own gate, outside `check-coverage`). `npm run check-consumer` green — it fails a prop reaching the shipped `.d.ts` with no description. Never hand-edit `SetupProgress.svelte.d.ts`, `lib/tail-follow.d.ts` or `index.d.ts` (D59). |
| 8a | **Pin `SetupStep.state` as exactly `string`** (M4). Extend `scripts/check-consumer.mjs`'s generated probe, immediately after the W-11 `_Stage` block it copies, with:<br>`type _Step = NonNullable<ComponentProps<typeof kit.SetupProgress>['steps']>[number]`<br>`export const _stepStateExact: _Exact<NonNullable<_Step['state']>, string> = true`<br>plus the comment explaining the `package_stage` measurement this follows. | `npm run check-consumer` green. **Mutation, both directions, and both are required:** close the union to `'pending'\|'passed'\|'failed'\|'skipped'` — must **red** (exit 1); change it to `'pending'\|…\|(string & {})` — must stay **green**, because it measures as `string`, which is the whole point of M4 and the reason no docblock may claim otherwise. |
| 9 | Bump root `package.json` `0.16.0` → `0.17.0` (additive), and add the **D73** row to `docs/decisions.md`. Content: the component; the indeterminate-by-construction rule and why a percentage would be invented; the host-owns-the-takeover boundary **recorded as a deviation from #63's "a mode, not a panel", with §0/M5's reasoning**; the bounded-log + wrapping + no-centred-scroll-container rules with their field origin; the first polite live region in the library and why the transcript is excluded from it; `state` typed `string` and the measurement behind it; and the stated limit of what jsdom proves about tail-following. | **THIS STEP IS UNGUARDED. No gate in this repository reads the root `package.json` version.** See the note below the table. |
| 10 | Boy Scout — see the two items below the table. | `npm run check-coverage` (all four, in order), `npm run check-types`, and `cd apps/catalog && npm test` — the six checks `gates.yml` runs. All green, and remember a **2 is a red, not a pass**. |

### Step 7 — which side of the real-data rule the fixture is on (m3)

`apps/catalog/AGENTS.md:221-222` states the rule: *"no canned data. Real data or
the honest empty state; a missing field is a gap to report … never
fabricated."*

**`steps` is real data and comes from the daemon.**
`apps/catalog/src/data/services.json` carries genuine `setup_steps` on every
entry — `kittentts` has `python`/`venv`, `magenta-rt` and `mlx-audio` add
`apple_silicon`, all `state: "passed"`, with real interpreter paths
(`3.12 (/opt/homebrew/bin/python3.12)`) and real venv locations
(`/Users/k/.khaos/mlx-audio/venv`). The fixture reads them from that file.

**`lines` has no real source, and this plan says so rather than pretending
otherwise.** There is no provisioning log anywhere in `apps/catalog/src/data/`,
and `apps/catalog/scripts/fetch-all.sh` does not fetch one — it runs
`fetch-kspd.sh` and `fetch-voices.sh` and nothing else. There is no capture
step to add without a daemon mid-provision, which is not a state that can be
requested.

**The ruling: `lines` is hand-authored, on the `InstallScript` precedent, and
labelled as such in the fixture.** `fixtures.js:1541-1546` is the standing
precedent — `InstallScript`'s `script` examples (`brew install wget jq`,
`sudo apt-get update`) are written by hand, because a generated acquisition
script likewise has no captured source. That entry has shipped through every
gate. The distinction the rule is actually drawing is between **fabricating a
fact about the system** (a `dialogue_count` nobody measured, a `logline` that
is really empty) and **supplying representative input to a renderer**. A
transcript passed in as a prop is the second.

The fixture entry therefore carries, verbatim in a comment: *"`lines` is
hand-authored. No provisioning log is captured — `fetch-all.sh` fetches none
and none exists in `src/data/`. Same standing as `InstallScript`'s `script`
(fixtures.js:1541-1546). `steps` IS real, from `services.json`."*

The entry:

```js
import SetupProgress from '@khaos-machine/khaotik-ui/components/svelte/SetupProgress.svelte'
// …
{ id: 'setup-progress', name: 'SetupProgress', kind: 'component',
  section: 'components', group: 'feedback', component: SetupProgress,
  examples: [ /* … */ ] }
```

**A `failed` example needs a real failure, and there is none.** `services.json`
records only `passed`. Ship the states that were observed, plus one example
constructed from a `state` value the client does not recognise (to exercise the
neutral branch, which is a *rendering* case and not a claim about the daemon),
and report the missing `failed` capture in the fixture comment rather than
inventing a failure reason khaosd never emitted.

### Step 9 — the gate that does not exist (C1)

The first draft named `npx vitest run src/version.test.js` as this step's gate.
**That test cannot fail on this step.** `apps/catalog/src/version.test.js` reads
`apps/catalog/src-tauri/tauri.conf.json`, `Cargo.toml`, `Cargo.lock` and
`APP_VERSION` from `fixtures.js` — the catalog's four version sources. It never
opens the root `package.json`.

Nor does anything else. Only `scripts/check-consumer.mjs:50-53` reads the root
`package.json` at all, and it reads `pkg.exports`, never `pkg.version`.
**Skipping the bump and the D73 row entirely leaves every gate green.** That is
a fourth vacuous check, offered in the step table of a plan whose §4b argues it
avoided one, and it is retracted rather than replaced with a different green
tick.

**Verified against the current tree:** root `package.json:3` is `"0.16.0"`, and
`git show origin/main:package.json` is also `0.16.0` — main has not moved the
library version. `0.16.0 → 0.17.0` is the correct bump.

**This step is unguarded, and here is what a reviewer must check by hand:**

1. `grep -n '"version"' package.json` reads `0.17.0`.
2. `docs/decisions.md` ends with a `D73` row (the tail before this change is
   `D72`, `docs/decisions.md:192`), and that row states every item listed in
   the step's Content column — in particular the two deviations from #63
   (§0/M5's host-owned takeover, and whichever way §0/C2 is answered).
3. The bump is **additive only** — no export was removed or renamed, which the
   `check-catalog` count (`51 → 52`) corroborates but does not prove.

**Building a gate for this is out of scope for #63 and is filed separately.**
The shape would be a source read pairing the root version against a `lib-*`
tag or against the D-register's tail, and it is a workspace-wide question
(`AGENTS.md`'s "Published now" block is stale by four minor versions, §7 item
3) rather than a #63 question. Folding it in here would put an unrelated gate
inside the diff a reviewer is judging against this issue.

### Step 10 — the two Boy Scout items

**(i) The stale export count.** `AGENTS.md:49` and `CLAUDE.md:35,59` say
`check-compile` "imports all 49 exports". The barrel already holds 51 before
this change and 52 after. Correct all three to 52.
**Gate:** `npm run check-catalog` prints the count; the number in the docs must
equal the number the gate prints. Checked by hand against the gate's output —
there is no test that reads prose.

**(ii) The duplicate `Requirement` typedef.** `components/svelte/lib/types.js`
declares `@typedef {Object} Requirement` **twice** — at `:304` and at `:328` —
two byte-identical blocks back to back, immediately before `export {}` at
`:339`. A duplicate typedef is precisely the drift that file's own opening
paragraph exists to prevent, and its own docblock says it exists *"precisely so
the second copy never gets written."*

Delete the second block (`:320-338`, the docblock and typedef beginning with
the second *"One external dependency, as a readiness probe reports it."*).

**This carries a gate, because nothing today can see it.** `check-consumer`'s
probe reaches types through `ComponentProps`, not by deep-importing
`lib/types.js`, so `tsc` never reports the duplicate identifier — which is why
it has shipped. Add `apps/catalog/src/lib-types.test.js`, a source read over
`components/svelte/lib/types.js`:

- every `@typedef {Object} <Name>` name appears **at most once** in the file.

**Gate:** `npx vitest run src/lib-types.test.js` — **RED before the deletion**
(that is the red-first order for this item: write the test, watch it fail on
`Requirement`, then delete the block), green after.
**Mutation:** re-add the deleted block and confirm it reds again.

This is the one Boy Scout item that changes shipped source rather than prose,
and it is bounded to a deletion plus a test. It was listed as out-of-scope in
the first draft; it is folded in because a defect with a cheap, mutation-proven
gate is exactly what the Boy Scout rule is for, and leaving it filed means the
gate never gets written either.

### Step 10 — what is NOT done: `docs/using-the-library.md` (m4)

The first draft added a `SetupProgress` row to the component table in
`docs/using-the-library.md`. **Dropped.**

That table already omits `InstallScript`, `RequirementList` and `Readiness` —
verified: `grep` finds `OutcomeBanner` at `:307` and `ServiceStatusList` at
`:308` and no row for any of the other three. Adding a row for the newest
`feedback` component while its two nearest siblings are still missing makes the
document **more** misleading, not less: a reader who sees `OutcomeBanner`,
`ServiceStatusList` and `SetupProgress` listed will read the absence of
`InstallScript` as "it does not exist" rather than as "this table is
incomplete".

The two honest options were: add all four rows, or add none. **None**, because
adding `InstallScript`, `RequirementList` and `Readiness` means writing three
component descriptions against components this change does not touch, inside a
diff a reviewer is judging against #63.

**Filed as a follow-up**, with the four names, so the gap is recorded rather
than silently widened. If the operator prefers it folded in, it is four table
rows and no logic — the plan absorbs it at step 10 without moving anything
else.

### Full gate run before the PR

```bash
npm run check-coverage    # check-catalog → check-taxonomy → check-consumer → check-compile
npm run check-types
cd apps/catalog && npm test
```

---

## 6. Files to touch

**New**

- `components/svelte/SetupProgress.svelte`
- `components/svelte/lib/tail-follow.js`
- `apps/catalog/src/components/SetupProgress.test.js`
- `apps/catalog/src/components/tail-follow.test.js`
- `apps/catalog/src/lib-types.test.js` — the duplicate-typedef gate (step 10ii)

**Modified**

- `components/svelte/index.js` — one export line, `feedback` group
- `components/svelte/lib/types.js` — delete the duplicate `Requirement` block (`:320-338`)
- `apps/catalog/src/fixtures.js` — one import, one registry entry
- `scripts/check-consumer.mjs` — the `_stepStateExact` pin (step 8a)
- `docs/decisions.md` — the D73 row
- `package.json` — `0.16.0` → `0.17.0` (**unguarded**; see step 9)
- `AGENTS.md:49`, `CLAUDE.md:35,59` — the stale export count, 49 → 52

**Generated, never hand-edited (D59)**

- `components/svelte/SetupProgress.svelte.d.ts`
- `components/svelte/lib/tail-follow.d.ts`
- `components/svelte/index.d.ts`

**Explicitly not touched**

- `docs/using-the-library.md` — see step 10's note (m4). Adding one row to a
  table already missing three siblings makes it more misleading.
- `components/svelte/ServiceStatusList.svelte` — #63 is explicit that this is a
  standalone atom and the rows stay compact, for the reason `InstallScript`
  stayed out of `RequirementList`.
- `components/svelte/Readiness.svelte` — see §7 item 4 for the two composition
  seams this leaves open.
- `components/svelte/InstallScript.svelte` — its premise is untouched; #63's
  first comment argues this at length. Two acquisition classes, two answers.

---

## 7. Out of scope, reported not fixed

These were found while reading and are **not** in this plan. Each is a separate
decision.

1. **`lib/types.js`'s `Service` typedef has no `setup_steps` property** while
   `GET /api/services` sends one — visible in `apps/catalog/src/data/services.json`,
   every entry. The type is silent about a field the wire carries.
2. **`AGENTS.md` says "library 0.12.0"** under "Published now" while
   `package.json:3` is at `0.16.0`. Whether a `lib-0.16.0` Release exists is not
   verified here, so the correct fix is unknown and no edit is proposed —
   flagged for the operator. Related: step 9 above records that no gate reads
   the root version at all, which is why this can drift by four minor versions
   unnoticed.
3. **`docs/using-the-library.md` omits `InstallScript`, `RequirementList` and
   `Readiness`**, and will omit `SetupProgress` after this change. Four rows,
   filed together — see step 10's note (m4).
4. **The two #60 composition seams**, recorded here so the follow-up starts
   from measurements rather than from a fresh read (m5):

   **(a) There is no terminal state.** `SetupProgress` renders `busy: true` and
   `busy: false` and carries **no outcome** — nothing in its contract says
   *succeeded* or *failed as a whole*. The obvious composition is
   `OutcomeBanner` swapped in when the work ends, and **`Readiness` has no slot
   to swap it into**: its only `Snippet` is `footer`
   (`Readiness.svelte:44`, rendered at `:176`), which sits *after* every
   section. A host cannot substitute `SetupProgress` for the services block, or
   `OutcomeBanner` for `SetupProgress`, without forking the screen. Closing
   this is either an outcome prop on `SetupProgress` or a second snippet on
   `Readiness` — a real design decision, not a wiring detail.

   **(b) The handoff has no mapping.** `ServiceStatusList.pendingId`
   (`ServiceStatusList.svelte:34`) is *"the `id` of the service whose action
   the consumer has sent"*, forwarded through `Readiness.pendingId`
   (`Readiness.svelte:39`). `SetupProgress.title` is **prose** — "Provisioning
   MLX Audio". Nothing in the kit turns the one into the other: the id→name
   lookup lives in `services.json`, which the library does not read, and
   `ServiceStatusList` renders the daemon's `name` with **no label table** by
   explicit rule (`ServiceStatusList.svelte:30`). So a host wiring
   `onSetup` → `SetupProgress` composes the headline itself, and every host
   will compose it slightly differently. That is the seam #60 has to name.
