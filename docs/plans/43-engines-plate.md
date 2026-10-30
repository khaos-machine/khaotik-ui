# Plan — #43 gaps 1 and 2: the engines plate renders the facts and counts from a structured field

Branch: `feat/43-engines-plate` · Issue: khaotik-ui#43 (gap 3 shipped in #64, `41900a0`)
Architecture frame: settled by the architect on the issue. This plan builds against it and
does not re-decide it.

**Revision 2** — amended against the red-team audit of `8215aef` and the two rulings that
landed after it (the designer on displacement, the operator on D62's scope). The amendment
log is the last section; it names every claim revision 1 made about itself that was false,
so a reviewer can check the repair rather than the assertion.

## The frame, restated as the standard this plan is held to

- **Gap 1** — the plate renders the facts. **No snippet prop.** The plate is a summary with
  a fixed budget (`Launcher.svelte:211` `services.slice(0, 3)`, `:221` `+N more`), not a
  container. It gains **one** derived fact per row: `provisioned === false` renders
  **`not installed`**, the exact word already at `ServiceStatusList.svelte:103`.
  `description`, `port`, `reason`, `log_path` stay in Readiness.
- **Gap 2** — the count reads `ready_to_use` (`lib/types.js:223`, present today) where the
  caller supplies it, and falls back to `state === 'running'` where it does not. Structured
  either way; never the rendered word.
- **Summary → detail.** `Readiness.svelte:157-173` already composes `ServiceStatusList` as
  the full-fidelity engines surface. The plate must not become a second detail surface.

### Boundaries that do not move

| Boundary | Why |
| --- | --- |
| No snippet prop on the plate | Kills the truncation contract; every host re-implements it |
| `Launcher` does not import `ServiceStatusList` | Rail is the summary, not the detail |
| `reason` / `log_path` / `description` / `port` do not enter the plate | Readiness owns them |
| `setup_steps` is **NOT** added to the `Service` typedef | A typedef field with no renderer is a promise the kit does not keep — belongs with #63 |
| `health_ok` is not added | Same reason |
| `lib/services.js` is **NOT** added to `components/svelte/index.js` | Both coverage gates key off the barrel — `check-catalog-coverage.sh:23-24`, `check-taxonomy.mjs:35-36`. A barrel entry with no catalog fixture is a gate failure, and a helper module has no fixture to give |

**The `#62` boundary that stood here in revision 1 is deleted, not relaxed.** It said the
extraction must not fix the single-state action branch in passing. That branch **already
exists** at `ServiceStatusList.svelte:177` (`{:else if service.state === 'starting' || service.state === 'stopping'}`),
landed in `c09c380` (#112), an ancestor of this branch's head. Revision 1 reasoned from the
open issue instead of from the file, and the operator has since closed #62. The extraction
in step 2 lifts `TONES` (`:61-66`) and `needsSetup` (`:75`) out of the `$derived` at
`:68-77`; it does not go near the action branches at `:150-205` at all.

### The designer's ruling — `not installed` **displaces** `svc.state`

**Ruled, not open.** In the plate row, `provisioned === false` replaces the state word;
the state survives in the dot.

Grounds, as the designer gave them:

- `ServiceStatusList.svelte:103` already makes exactly this call —
  `text={service.needsSetup ? 'not installed' : service.state}` — on a **full-width** surface
  with room for both, and still chooses one word.
- `RequirementList.svelte:75-79` does the same: `'not installed'` is returned *instead of*
  `r.verdict`, not beside it.
- Two status words side by side is a pattern this kit has nowhere.

**Cost, accepted explicitly:** an engine that is both `provisioned: false` and
`state: 'error'` shows a **danger dot** beside the words `not installed`, and the word
`error` never appears in the plate. The dot is the only carrier of the state for that row,
which is why the dot is now under test (T6) rather than assumed.

**What this makes load-bearing in the implementation:** the dot's
`data-state={svc.state}` at `Launcher.svelte:213` **must not change**. The CSS at
`:498-500` keys on the literal state strings `running` / `starting` / `error`; any value
outside that set falls to the `--tone-neutral` default at `:495`. Writing
`data-state={svc.needsSetup ? 'not-installed' : svc.state}` — the obvious reach for a
warning tone — silently drops the row's state to neutral and **removes the state from the
row entirely**, which is the exact opposite of the ruling. T6 asserts the attribute value
for that reason.

---

## 1. The failing tests

All in `apps/catalog/src/components/LauncherPlate.test.js`, appended to the existing
`describe('the on-device engines plate')` block (`:135-177`). The existing
`SERVICES` const at `:136-140` is reused where it fits (`SERVICES[0]` is
`{ name: 'mlx-audio', state: 'stopped' }`).

> **Anti-vacuous rule for this file, corrected.** Four of the tests below assert an
> *absence* (`queryByText(...)` is null, or a count that must not appear). A bare absence
> assertion passes when the component fails to render at all — one of the five vacuous
> checks this repo has already shipped. **Every negative assertion below is paired with a
> positive assertion in the same test** that proves the row rendered. The builder must not
> drop the pairing.
>
> **A test that is green before implementation is not thereby vacuous.** Revision 1 said it
> was, and that rule — obeyed literally — deletes T3, T7, T8 and T9, which this plan relies
> on. A guard for a predicate that does not exist yet is *correctly* green: it pins
> behaviour the implementation must not break, and its proof of worth is a **named must-red
> mutation against the implemented code** (section 2), not a failure at red-stage. The rule
> that replaces it: **a new test with no must-red mutation against the finished
> implementation is vacuous and must be rewritten.** Green-at-HEAD is expected for the
> guards and is listed per test below.

### Expected red count at step 1 — measured, not assumed

Written verbatim into a throwaway file at `8215aef` with no implementation, the set below
gives **4 failed, 5 passed**:

| Test | At HEAD | Why |
| --- | --- | --- |
| T1 | **RED** | `Launcher.svelte:104` counts `state === 'running'`, so `1 running` renders where `Idle` is demanded |
| T2 | **RED** | neither payload state is the literal `'running'`, so `Idle` renders where `2 running` is demanded |
| T3 | green (guard) | `:104` already counts one `state: 'running'` — this is the existing-caller regression guard |
| T4 | green (guard) | `:104` never reads `ready_to_use`, so a `null` / non-boolean cannot mislead it yet |
| T5 | **RED** | nothing in `Launcher.svelte` renders `not installed` |
| T6 | **RED** | same; the displacement and dot assertions cannot pass without the word |
| T7 | green (guard) | nothing renders `not installed`, so the absence holds trivially today |
| T8 | green (guard) | same |
| T9 | green (guard) | `:211` / `:221` already slice to three and render `+N more` |

The builder pastes the **4 failures** into the PR body and states the 5 green guards by
name. Any deviation from 4/5 means the tests were transcribed wrong, not that a guard is
worthless.

### Gap 2 — the count

**T1 — `does not count a process that is up and not usable`** (RED)

```js
it('does not count a process that is up and not usable', () => {
  // khaos-app's exact case (#43 gap 2): the daemon reports state 'running' with
  // health_ok false, so ready_to_use is false. A count read off the state string
  // says "1 running" about an engine nothing can use.
  render(Launcher, {
    props: { services: [{ name: 'mlx-audio', state: 'running', ready_to_use: false }] },
  })
  expect(screen.getByText('mlx-audio')).toBeInTheDocument()   // the row rendered
  expect(screen.getByText('Idle')).toBeInTheDocument()
  expect(screen.queryByText('1 running')).toBeNull()
})
```

**T2 — `counts an engine the daemon vouched for whatever the state string says`** (RED)

```js
it('counts an engine the daemon vouched for whatever the state string says', () => {
  // The other direction, and the one a bare `state === 'running'` filter loses.
  // Both states are in the shipped union (lib/types.js:220, khaosd manager.go:20-24):
  // `stopping` is an engine still serving while it winds down, `stopped` with
  // ready_to_use true is one the daemon vouches for on demand.
  render(Launcher, {
    props: { services: [
      { name: 'mlx-audio', state: 'stopping', ready_to_use: true },
      { name: 'kittentts', state: 'stopped', ready_to_use: true },
    ] },
  })
  expect(screen.getByText('2 running')).toBeInTheDocument()
})
```

> Revision 1 used `state: 'running (unhealthy)'` here and justified it as khaos-app's wire
> value. **No evidence was produced for that payload.** `lib/types.js:220` documents the
> tail as "a state string newer than this client", not a parenthesised annotation, and
> `data/services.json` pairs plain `stopped` with `ready_to_use: false` on all three
> engines. The mutation was real, so the test was not vacuous — but the *rationale* rested
> on an invented payload, which is the same defect as an invented fixture. Both states used
> now are in the documented union.

**T3 — `falls back to the state when the caller does not decode ready_to_use`** (guard)

```js
it('falls back to the state when the caller does not decode ready_to_use', () => {
  // Required for every existing caller — khaos-app passes { name, state, label }
  // (Launcher.svelte:51). The fallback understates rather than over-claims, which
  // is the safe direction the issue names.
  render(Launcher, {
    props: { services: [{ name: 'mlx-audio', state: 'running' }, { name: 'kittentts', state: 'stopped' }] },
  })
  expect(screen.getByText('1 running')).toBeInTheDocument()
})
```

**T4 — `falls back rather than trusting a value that is not a boolean`** (guard, NEW)

```js
it('falls back rather than trusting a value that is not a boolean', () => {
  // Pins the declared deviation from the architect's `??` form (see step 2).
  // `null` from a lax decoder must fall back, not read as unusable; the STRING
  // 'false' must fall back, not count as usable because it is truthy.
  render(Launcher, {
    props: { services: [
      { name: 'mlx-audio', state: 'running', ready_to_use: null },
      { name: 'kittentts', state: 'stopped', ready_to_use: 'false' },
      { name: 'orpheus', state: 'stopped', ready_to_use: undefined },
    ] },
  })
  expect(screen.getByText('mlx-audio')).toBeInTheDocument()   // the rows rendered
  expect(screen.getByText('1 running')).toBeInTheDocument()   // only the state-running one
})
```

### Gap 1 — the fact

**T5 — `says why an unusable engine is unusable`** (RED)

```js
it('says why an unusable engine is unusable', () => {
  // provisioned: false is a different thing from stopped — the engine is not
  // installed, so starting it is not one click away.
  render(Launcher, {
    props: { services: [{ name: 'whisper', label: 'Whisper', state: 'stopped', provisioned: false }] },
  })
  expect(screen.getByText('Whisper')).toBeInTheDocument()
  expect(screen.getByText('not installed')).toBeInTheDocument()
})
```

**T6 — `replaces the state word and keeps the state in the dot`** (RED, NEW — enforces the ruling)

```js
it('replaces the state word and keeps the state in the dot', () => {
  // The designer's ruling, in three assertions. A side-by-side implementation
  // passes T5 identically; only the second assertion here fails it. The third
  // is the trap named in the ruling: reaching for a warning tone by writing
  // data-state={needsSetup ? 'not-installed' : state} matches none of the CSS
  // at Launcher.svelte:498-500, drops the dot to neutral, and erases the state
  // from the row — while every other test in this file stays green.
  const { container } = render(Launcher, {
    props: { services: [{ name: 'whisper', label: 'Whisper', state: 'error', provisioned: false }] },
  })
  expect(screen.getByText('not installed')).toBeInTheDocument()   // displaced in
  expect(screen.queryByText('error')).toBeNull()                  // displaced out
  expect(container.querySelector('.launcher__dot').dataset.state).toBe('error')
})
```

**T7 — `stays quiet about setup for an engine that is merely stopped`** (guard)

```js
it('stays quiet about setup for an engine that is merely stopped', () => {
  render(Launcher, {
    props: { services: [{ name: 'kittentts', state: 'stopped', provisioned: true }] },
  })
  expect(screen.getByText('kittentts')).toBeInTheDocument()   // pairs the absence
  expect(screen.queryByText('not installed')).toBeNull()
})
```

**T8 — `does not claim not-installed when the caller never decoded provisioned`** (guard)

```js
it('does not claim not-installed when the caller never decoded provisioned', () => {
  // The field is absent, not false. khaos-app passes { name, state, label } today.
  // Absent must read as "unknown", never as "not installed".
  render(Launcher, { props: { services: [SERVICES[0]] } })
  expect(screen.getByText('mlx-audio')).toBeInTheDocument()   // pairs the absence
  expect(screen.queryByText('not installed')).toBeNull()
})
```

**T9 — `keeps the three-row budget when every engine needs setup`** (guard)

```js
it('keeps the three-row budget when every engine needs setup', () => {
  // The plate is a summary, not a container. Adding a fact must not add rows.
  const many = ['a', 'b', 'c', 'd', 'e'].map((n) => ({ name: n, state: 'stopped', provisioned: false }))
  const { container } = render(Launcher, { props: { services: many } })
  expect(container.querySelectorAll('.launcher__services li')).toHaveLength(4)  // 3 rows + the more line
  expect(screen.getByText('+2 more')).toBeInTheDocument()
})
```

### The wording-drift test is deleted, and the drift is closed by construction instead

Revision 1's T8 read both component sources and asserted each contained `'not installed'`.
**It caught nothing uniquely** — the `Launcher` half is caught by T5, and the
`ServiceStatusList` half by `ServiceStatusList.test.js:70`, which already asserts
`getByText('not installed')`. Worse, it asserted each file independently and never compared
them, so it could not detect a second wording living *beside* the first, which is the thing
it claimed to check.

Replaced by a mechanism rather than an assertion: **`lib/services.js` exports the literal**
(step 2), and both components render it. Two wordings then cannot exist, so no test is
needed to notice that they do.

## 2. Must-red mutation for every test

Every mutation below is against the **finished implementation**, which is what makes a test
worth keeping — not whether it failed at step 1.

| Test | Mutation that reds it | Reds because |
| --- | --- | --- |
| T1 | revert the count to `services.filter((s) => s.state === 'running').length` | renders `1 running`; T1 demands `Idle` |
| T2 | same reversion | neither state is `'running'`, so `Idle` renders; T2 demands `2 running` |
| T3 | drop the fallback — `usable: service.ready_to_use === true` only | with the field absent every row is unusable, so `Idle` renders |
| T4 | write the architect's literal `service.ready_to_use ?? (service.state === 'running')` | the string `'false'` is non-nullish and truthy, so `kittentts` counts and `2 running` renders |
| T5 | delete the word from the row, **or** change `NOT_INSTALLED`'s value | the exact string is not in the document |
| T6 | render the word in a **sibling** span beside `{svc.state}` | `queryByText('error')` is non-null |
| T6 | write `data-state={svc.needsSetup ? 'not-installed' : svc.state}` | `dataset.state` is `'not-installed'`, not `'error'` |
| T7 | `needsSetup: service.state !== 'running'` (collapsing setup into the state) | fires on a stopped-and-provisioned row |
| T8 | `needsSetup: !service.provisioned` | absent → `!undefined` → `true`, so the word renders on a row that never said so |
| T9 | change `services.slice(0, 3)` to `services` (or any budget widening) | five rows, no `+2 more` |

**T7's status, stated honestly.** Revision 1 certified T7 and T8 as a pair, claiming neither
alone pins `provisioned === false`. **That was wrong.** T8's payload is `SERVICES[0]` =
`{ name: 'mlx-audio', state: 'stopped' }`, and `'stopped' !== 'running'` is true, so the
`state !== 'running'` predicate renders the word in T8 too — **T8 alone kills both wrong
predicates.** T7 is kept as documentation of the intended distinction, not as coverage, and
the reviewer is free to question or drop it. Revision 1 forbade exactly that.

## 3. The row markup and every `var(--…)`, verified present

**No new token is introduced, no `font-weight` is hand-set, and the baseline implementation
adds zero CSS rules.** This section is written for **displacement**, per the ruling. The
sibling-span branch revision 1 described no longer exists.

The change at `Launcher.svelte:213-218` is confined to one line:

```svelte
<span class="launcher__svc-state">{svc.needsSetup ? NOT_INSTALLED : svc.state}</span>
```

The dot at `:213` is **unchanged** — `data-state={svc.state}`. No new element, no new class,
no new rule. The word inherits `.launcher__services li`'s font-size and colour.

| Token | Verified at | Already used at | Used here for |
| --- | --- | --- | --- |
| `--text-secondary` | `tokens/tokens.css` (theme surface set) | `Launcher.svelte:488`, `:510`, `:514` | colour of the row text — **inherited from `.launcher__services li` at `:488`; no new rule** |
| `--caption-size` | `tokens/tokens.css:147` | `Launcher.svelte:487` | inherited by the row; not re-declared |
| `--spacing-xs` | `tokens/tokens.css` | `Launcher.svelte:486` | the row gap, unchanged |
| `--tone-warning` | `tokens/tokens-extra.css:27` | `Launcher.svelte:499` (`.launcher__dot[data-state='starting']`) | **not applied.** Listed only to record that the tone was available and deliberately not used: on a 236px rail the word already carries the meaning, and tinting it would compete with the dot, which is the row's only remaining state carrier |

## 4. Ordered steps, each with the gate that proves it

Run every gate from the repository root unless the command says otherwise. **Every gate
exits 0 clean, 1 on gaps, 2 when it could not run — a 2 is a red, not a pass.** The
builder records the exit code, not the impression.

### Step 1 — Red. Write T1–T9; run them; record the outcome.

Touch: `apps/catalog/src/components/LauncherPlate.test.js`.

Gate:
```sh
cd apps/catalog && npx vitest run src/components/LauncherPlate.test.js
```
**Expected: 4 failed, 5 passed** — exactly the split in the table in section 1, plus every
pre-existing test in the file still green. The builder pastes the four failure messages into
the PR body and names the five guards. A count other than 4/5 is a transcription error.

### Step 2 — Extract `components/svelte/lib/services.js`. One reading, one word.

`lib/` is the established seam — `voice-availability.js`, `identity.js`, `graph.js`,
`tail-follow.js` all live there. The module exports one reading and one literal:

```js
/** @typedef {import('./types.js').Service} Service */
/** @typedef {import('./types.js').StatusTone} StatusTone */

// khaosd's states, mapped onto the seven-way StatusTone. `starting` is `info`
// rather than `success` — lifted verbatim from ServiceStatusList.svelte:61-66.
const TONES = { running: 'success', starting: 'info', stopped: 'neutral', error: 'danger' }

/**
 * The kit's ONE wording for `provisioned === false`. Exported so the two surfaces
 * that render it cannot drift into two voices about one state — a drift no build
 * step and no rendered test can see, because both wordings render and both look fine.
 */
export const NOT_INSTALLED = 'not installed'

/**
 * The three facts two components derive from one service.
 * @param {Service} service
 * @returns {{ tone: StatusTone, needsSetup: boolean, usable: boolean }}
 */
export function readService(service) { /* … */ }
```

- `tone`: `TONES[service.state] ?? 'neutral'` — verbatim from `ServiceStatusList.svelte:71`.
- `needsSetup`: `service.provisioned === false` — verbatim from `:75`.
- `usable`: **new**, and the only new logic in the module —
  `typeof service.ready_to_use === 'boolean' ? service.ready_to_use : service.state === 'running'`.

**Declared deviation from the architect's ruling.** The architect ruled
`ready_to_use ?? (state === 'running')`. This is not that form. The two agree on `null`,
`undefined` and absent — the only cases either was reasoning about — and diverge only on a
non-nullish non-boolean, where `??` passes the value straight into
`rows.filter((r) => r.usable)`; the **string** `'false'` from a lax decoder is truthy and
counts as running. The `typeof` form is strictly safer and never over-claims. Recording it
as a deviation rather than silently improving on the ruling, and **T4 pins it** — revision 1
made this change with neither the declaration nor a test.

**`ServiceStatusList.svelte` changes, and its public shape changes with it.**

```js
{ ...s, ...readService(s), pending: !!pendingId && s.id === pendingId }
```

`pending` **stays in `ServiceStatusList`** (`:76`) because it is derived from a **prop and**
the service together — `!!pendingId && s.id === pendingId` — so it cannot move into a
function that receives only the service. (Revision 1 said "derived from a prop, not from the
service", which is half of it.)

`usable` is **new on this component's rows**, and those row objects are the callback payload
(`:167` `onSetup?.(service)`, `:175`, `:201`). So it must be declared:
`ServiceRow` (`:25`) gains `usable: boolean`.

**Revision 1's proof for this step was blind to its own change.** It said
`ServiceStatusList.svelte.d.ts` would be byte-identical and that any change meant the move
was wrong. It *would* have been byte-identical — the callbacks type off the hand-written
`ServiceRow` JSDoc, which `usable` did not touch — so the detector could not see a new
public field reaching every consumer's callbacks. The corrected gate is below.

`ServiceStatusList` also renders `NOT_INSTALLED` at `:103` in place of its literal. Tone at
`:103` is unchanged (`warning`), and `StatusPill`'s rendered text is identical, so
`ServiceStatusList.test.js:70` stays green with no edit.

Touch: `components/svelte/lib/services.js` (new), `components/svelte/ServiceStatusList.svelte`.

Gate:
```sh
cd apps/catalog && npx vitest run src/components/ServiceStatusList.test.js src/components/service-action-states.test.js
```
Both green, **unchanged** — not one assertion edited. Then:
```sh
npm run build-types && npm run check-types
```
`build-types.mjs` walks `components/svelte` recursively (`declarations()`,
`scripts/build-types.mjs:48-59`), so `lib/services.d.ts` is generated and **committed** (D59).
`check-types` must exit 0.

`ServiceStatusList.svelte.d.ts` is expected to change in **exactly one way**: `ServiceRow`
gains `usable: boolean`. The builder diffs it and states that. **Any other change means the
move changed the public shape and step 2 is wrong** — and a byte-identical `.d.ts` now means
`ServiceRow` was not updated, which is also wrong.

### Step 3 — `lib/types.js`: add `label?` to `Service`.

`label` is shipped contract today — documented only in a prop comment at
`Launcher.svelte:51` and rendered at `:217` as `{svc.label || svc.name}`. A contract that
lives only in prose is the same drift that produced this issue.

Insert after `@property {string} [description]` (`lib/types.js:219`):

```
 * @property {string} [label] The product name where the caller has one. khaosd's
 *   /api/services does not send it; a host that has resolved one passes it and the
 *   plate renders it in place of the identifier (Launcher.svelte:217). Never
 *   invented by the library — absent means the identifier shows.
```

**`setup_steps` and `health_ok` are NOT added.** Neither has a renderer in this kit;
`setup_steps` belongs with #63.

Touch: `components/svelte/lib/types.js`.

Gate:
```sh
npm run build-types && npm run check-types    # types.d.ts regenerated and committed
npm run check-consumer                         # the package still loads and type-checks as a consumer loads it
```

### Step 4 — `Launcher.svelte`: the count and the word. Green.

1. `import { readService, NOT_INSTALLED } from './lib/services.js'`.
2. Replace `Launcher.svelte:104`:
   ```js
   const rows = $derived(services.map((s) => ({ ...s, ...readService(s) })))
   const running = $derived(rows.filter((r) => r.usable).length)
   ```
   The plate head (`:202-206`, `:208`) keeps reading `services.length`; the `{#each}` at
   `:211` iterates `rows` instead, keyed by index exactly as today (`(i)` — the comment at
   `:210` explaining why still applies and stays).
3. The row at `:213-218`: the **one line** in section 3, and nothing else. The dot's
   `data-state={svc.state}` is untouched; the `.slice(0, 3)` budget and the `+N more`
   branch at `:221` are untouched.
4. Update the `services` Props doc at `:51`: name `provisioned` and `ready_to_use`, say
   that the count reads `ready_to_use` and falls back to `state === 'running'`, say that
   `provisioned: false` **displaces** the state word with `not installed` while the dot
   keeps the state, and say that the plate is the summary while `ServiceStatusList` is the
   detail.

Touch: `components/svelte/Launcher.svelte`.

Gate:
```sh
cd apps/catalog && npx vitest run src/components/LauncherPlate.test.js src/components/Launcher.test.js
npm run build-types && npm run check-types      # (root) Launcher.svelte.d.ts
```
T1–T9 green. **The pre-existing plate tests at `LauncherPlate.test.js:142-176` must be
green with no edit** — in particular `:149 counts the running ones`, which passes
`state: 'running'` with no `ready_to_use` and is the fallback's regression guard.

### Step 5 — The precondition: `fixtures.js`. The plate has never met a real service payload, and what it meets today is worse than a gap.

`apps/catalog/src/fixtures.js:128-130` builds `engineServices` from `providerStatus`:

```js
const engineServices = providerStatus
  .filter((p) => (p.capabilities ?? []).length)
  .map((p) => ({ name: p.id, state: p.isReady ? 'running' : 'stopped' }))
```

**Measured against `data/provider-status.json`: 32 entries, and all 32 pass that filter.
Five are `isReady: true`.** So the catalog's Launcher renders **"5 running"** and
**"+29 more"** under the heading `On-device engines`, and the list it truncates includes
`openai`, `anthropic`, `gemini`, `polly`, `elevenlabs`, `deepgram`, `suno`, `mistral`,
`groq`, `openrouter`, `cartesia`, `lmnt` — **cloud APIs, presented as on-device engines**.
The five it counts as running are `ollama`, `lmstudio`, `openai`, a hosted voice gateway and `edge-tts`;
`ollama` and `lmstudio` are local, and the other **three are not on the machine at all**.

This is not merely "the wrong list": it is **a false claim about where inference runs, on
the catalog's own demo surface**, and it brushes the repo's real-data rule (`AGENTS.md`).
Revision 1 named six of the 32 ids and never said the list was mostly cloud providers.
**D74 and the PR body must state this plainly.**

Meanwhile `servicesData` (`fixtures.js:80`, `data/services.json`) is the live
`GET /api/services` capture that `ServiceStatusList` is played against (`:1388`). Until the
plate's fixture uses it, gap 1 renders nothing and gap 2's count is unmoved — in the catalog
and in `check-compile` alike.

1. Replace `fixtures.js:128-130` with `const engineServices = servicesData` and a comment
   naming what it replaced and why: the provider list is the **LLM/TTS provider registry**,
   most of it cloud, and it was never the engine list.
2. Both Launcher examples at `:926` and `:940` already read `services: engineServices` and
   need no edit. The capture is three engines, all `provisioned: true`, all `state: 'stopped'`,
   all `ready_to_use: false` — so the plate correctly renders `Idle` and no `not installed`.
3. **Two states then have no catalog rendering: `provisioned: false`, and the `+N more`
   truncation** (which 32 rows was accidentally providing and 3 rows is not). Add **one**
   example that restores both, after `'Empty'` at `:948`:
   ```js
   // ILLUSTRATIVE, NOT CAPTURED — a declared, scoped exception to the real-data
   // rule under D62 as widened by D74. This machine has every engine installed,
   // so `provisioned: false` cannot be captured from it; and the capture is three
   // engines, so the `+N more` truncation cannot be captured either. Both are
   // restored here with NO invented engine: the three captured rows verbatim,
   // plus the `whisper` row already carried at fixtures.js:1408 for the
   // ServiceStatusList matrix — same id, same values, so the two surfaces
   // demonstrate one state with one payload. Four rows -> three shown, `+1 more`.
   // #43 gap 1.
   { label: 'An engine not installed', props: {
     engine: { components: engineComponents },
     services: [
       servicesData[0],
       { id: 'whisper', name: 'Whisper', description: 'Not installed on this machine', state: 'stopped', port: 8400, provisioned: false },
       servicesData[1],
       servicesData[2],
     ],
     projects: [],
   } },
   ```

**Why this is one standard and not two.** Revision 1 removed the plate's only catalog
rendering of `+N more` in the same step where it added an illustrative example *because* a
state had no catalog rendering — opposite standards on one screen. The standard, stated
once: **a state that no capture from this machine can reach gets one declared illustrative
rendering, built only from payloads that already exist in the repo.** `provisioned: false`
and `+N more` both qualify; both are restored; neither invents an engine identity, a
description, or a state string. Nothing is fabricated — the four rows are three captured
payloads and one payload already declared under D62 for the sibling surface.

**`check-taxonomy` and this edit — the reasoning, corrected.** Revision 1 said the
`examples` array "is not parsed". **It is.** `check-taxonomy.mjs:91` builds `withoutFlows`
from the *entire* source, and `:94-104` runs both placement regexes over all of it,
`examples` included. Examples do not match today only because both regexes match over
brace-free runs (`[^{}]*?`), and every example is itself a braced object.

The real hazard is therefore narrower and sharper than "do not reformat the header":
an example containing `name: '…'` and `section:`/`group:` **on one brace-free run** registers
a bogus placement, and `:102` is **first-wins**, so it would silently shadow a real
component's header. The example above contains no `section:` or `group:` key, so it cannot.

Two rules for this edit, both load-bearing:
- The Launcher entry's placement header at `fixtures.js:921-922` **must not be reflowed,
  rewrapped, or reordered** — the regexes want that exact shape, and a miss makes the gate
  cover a smaller set, or return 2.
- **No added example may put a `name:` key and a `section:`/`group:` key on the same
  brace-free run.** "It is inside `examples`" is not a safety argument.

The audit simulated these exact edits: the gate stays at **52/52, exit 0**.

Touch: `apps/catalog/src/fixtures.js`.

Gate:
```sh
npm run check-taxonomy ; echo "taxonomy exit=$?"    # MUST be 0. A 2 is a red.
npm run check-catalog  ; echo "catalog exit=$?"
npm run check-compile  ; echo "compile exit=$?"     # the catalog build; it imports all 52 exports
```
The builder pastes the three exit codes. `check-taxonomy` returning 2 means the fixture
edit broke a regex and the check silently stopped covering the registry — back it out and
re-edit more narrowly.

### Step 6 — Record the decision: **D74**.

`docs/decisions.md` currently runs to **D73** (max of `grep -o "D[0-9]\{1,3\}"`). The next
number is **D74**. The register is not in ascending file order; add the entry following
the file's existing placement convention.

**D74 — The engines plate is a summary; it counts from the payload, and it says one word.**
Records:

1. The plate renders derived facts and takes no snippet, because a fixed row budget is a
   contract a container cannot keep; the summary (rail) → detail
   (`Readiness`/`ServiceStatusList`) relationship.
2. Readiness counted from `ready_to_use` with a `state === 'running'` fallback, never from a
   rendered word — **and the fallback tests `typeof … === 'boolean'` rather than `??`**, so
   a non-boolean from a lax decoder cannot count as running.
3. `not installed` as the kit's single wording for `provisioned === false`, **exported as
   one constant** from `lib/services.js` so two surfaces cannot drift into two voices.
4. **The designer's displacement ruling and its cost**: `not installed` replaces the state
   word; the state survives in the dot; an engine that is both not-installed and errored
   shows a danger dot and never shows the word `error`.
5. `lib/services.js` as one reading shared by both surfaces, deliberately outside the barrel
   because the coverage gates key off it.
6. **The provider/engine confusion the catalog was shipping**: `engineServices` was built
   from `provider-status.json` — 32 entries, all passing the capability filter, most of them
   cloud APIs (`openai`, `anthropic`, `gemini`, `elevenlabs`, `deepgram`, …) — and rendered
   under `On-device engines` as "5 running, +29 more". A false claim about where inference
   runs, on the demo surface. Replaced with the `GET /api/services` capture.
7. **An explicit amendment to D62's Scope line** (`docs/decisions.md:182`, which today reads
   "**Scope:** state matrices only"). The operator has ruled the exception widens to
   **screen examples**. D74 must state the new boundary in its own words rather than cite
   D62 as it stands:

   > **D62's scope is widened from state matrices to any catalog example, including screen
   > examples, under D62's same three unchanged conditions** — the fabrication is declared
   > in a comment at the fixture; every value is instantiated from the engine's own format
   > string or payload shape rather than invented prose; and the live capture
   > (`apps/catalog/src/data/*.json`) is never edited to carry it. **What does not widen is
   > the content boundary**: a fixture that shows *content* — a screenplay, a character, a
   > voice — remains capture-or-report-the-gap with no exception. The widening covers
   > *states a machine cannot be in*, wherever they are rendered, not *things a product does
   > not have*.

Touch: `docs/decisions.md`.

Gate: no mechanical gate. The reviewer checks that the entry states all seven points, that
point 7 is written as an amendment rather than a citation, and that the D-number is unused.

### Step 7 — The full gate set, in the order `gates.yml` runs it.

```sh
cd apps/catalog && npm test        # the whole suite, not the narrowed files
cd - && npm run check-coverage     # check-catalog, check-taxonomy, check-consumer, check-compile
npm run check-types                # its own gate, outside check-coverage
```
Six checks. Every one exits 0. Any 2 is a red.

## 5. Files this plan expects to touch

| File | Change |
| --- | --- |
| `components/svelte/lib/services.js` | **New.** `readService(service) → { tone, needsSetup, usable }`, plus `NOT_INSTALLED` |
| `components/svelte/lib/services.d.ts` | **New, generated** by `npm run build-types`, committed (D59) |
| `components/svelte/lib/types.js` | `label?` added to `Service` (`:216-226`). Nothing else |
| `components/svelte/lib/types.d.ts` | Regenerated |
| `components/svelte/ServiceStatusList.svelte` | Imports `readService` + `NOT_INSTALLED`; `pending` stays; `ServiceRow` (`:25`) gains `usable: boolean` |
| `components/svelte/ServiceStatusList.svelte.d.ts` | Regenerated. **Expected to change in exactly one way**: `ServiceRow` gains `usable: boolean` |
| `components/svelte/Launcher.svelte` | `rows`/`usable` count at `:104`; displacement on the one span at `:218`; dot at `:213` unchanged; Props doc at `:51` |
| `components/svelte/Launcher.svelte.d.ts` | Regenerated |
| `apps/catalog/src/components/LauncherPlate.test.js` | T1–T9 appended |
| `apps/catalog/src/fixtures.js` | `engineServices` → `servicesData` (`:128-130`); one four-row example added inside the Launcher entry's `examples` (after `:947`) |
| `docs/decisions.md` | D74, including the D62 scope amendment |
| `docs/plans/43-engines-plate.md` | This plan |

**Explicitly not touched:** `components/svelte/index.js`, `components/svelte/Readiness.svelte`,
`apps/catalog/src/data/*.json`, `tokens/*`, and `ServiceStatusList.svelte:150-205` (the
action branches — #62 is closed and out of scope either way).

## Acceptance

- Gap 1: a `provisioned: false` engine says `not installed` in the plate, **in place of** the
  state word, in the kit's one wording, with the state still readable in the dot, and without
  the plate growing a row or a snippet prop.
- Gap 2: the readiness count reads `ready_to_use` where it is a boolean and
  `state === 'running'` where it is not — never a rendered string, never a truthy non-boolean.
  Existing callers are unbroken.
- The plate is exercised against the real `GET /api/services` capture in the catalog and in
  `check-compile`, for the first time, and the catalog stops calling twelve cloud APIs
  on-device engines.
- Six gates exit 0. Nine new tests: four red at step 1, five guards, **each with a named
  must-red mutation against the finished implementation**.

## Commit trailer

Per the lesson recorded on the issue after `41900a0`: **a closing keyword takes an issue
number and nothing else**, and partial delivery cannot be expressed in a trailer. This work
closes gaps 1 and 2 and #43 has nothing else open, so `Closes #43` is correct here — but
only because gap 3 already shipped. Do not write `Closes #43 gaps 1 and 2`.

## Amendment log — what revision 1 claimed about itself that was false

Kept in the plan rather than in a PR comment, because the failure class is *a plan asserting
it verified something it had not*, and a reviewer needs to see the repair beside the claim.

| # | Revision 1 claimed | Measured | Repair |
| --- | --- | --- | --- |
| C1 | "8 new failures, one per new test", and "a new test that passes before implementation is vacuous and must be rewritten" | 3 failed / 4 passed for T1–T7; the rule, obeyed literally, deletes three tests the plan certifies as load-bearing | Rule replaced with *no must-red mutation against the finished implementation* as the vacuity test; per-test red/green split now stated and measured |
| C2 | the designer's ruling "drops in with no restructuring" from either branch | **nothing** in T1–T8 distinguished displacement from adjacency, and `launcher__dot` had **zero** assertions in the whole catalog suite (`grep` returns only `Launcher.svelte:213,491,498-500`) | T6 added: displacement + `queryByText('error')` null + `dataset.state`. Section 3 and step 4 rewritten for displacement |
| M1 | T5/T6 are a pair; neither alone pins `provisioned === false` | T8's payload is `state: 'stopped'`, so `state !== 'running'` fires there too — T8 alone kills both wrong predicates | T7 demoted to documentation; the reviewer is explicitly free to drop it |
| M2 | T8's source-read catches a wording drift | caught nothing uniquely (T5 and `ServiceStatusList.test.js:70` already do), and asserted each file independently so it could not see a second wording *beside* the first | Test deleted; `NOT_INSTALLED` exported from `lib/services.js` so the drift is impossible by construction |
| M3 | step 2 is behaviour-preserving, proven by a byte-identical `ServiceStatusList.svelte.d.ts` | `usable` is new on the callback payload (`:167`, `:175`, `:201`); the `.d.ts` types off the hand-written `ServiceRow` JSDoc, so the detector was blind to the change it was meant to detect | `ServiceRow` gains `usable: boolean`; the gate now expects exactly that one `.d.ts` change and treats byte-identical as a failure |
| M4 | `provider-status.json` is "`ollama`, `lmstudio`, `openai`, `anthropic`, `mistral`, `groq`" | **32 entries, all 32 pass the filter, 5 `isReady`** → the catalog renders "5 running" and "+29 more" under `On-device engines`, listing a dozen cloud APIs | Step 5 restated with the measured numbers and the false-claim framing; D74 point 6 records it |
| M6 | "#62 is not fixed in passing" — a boundary | the `starting`/`stopping` branch already exists at `ServiceStatusList.svelte:177`, landed in `c09c380` (#112), an ancestor of this head; the plan reasoned from the open issue, not the file. The operator has since closed #62 | Boundary deleted and replaced with a statement of what the extraction actually lifts (`:61-66`, `:75`) |
| M7 | the `typeof` fallback, presented as the architect's ruling | the architect ruled `??`; the forms diverge on non-nullish non-booleans, where `??` counts the string `'false'` as running. No test passed `null`, `undefined` or a non-boolean | Deviation declared in step 2 with its reason; T4 added to pin it; the `??` form is T4's must-red |
| M8 | T2's `'running (unhealthy)'` is khaos-app's payload | no evidence; `lib/types.js:220` documents the tail as a newer state string, and `services.json` never annotates a state | Payload changed to `{ state: 'stopping', ready_to_use: true }` — in the documented union |
| m1 | "the `examples` array is **not** parsed" by `check-taxonomy` | it **is** — `:91` builds `withoutFlows` from the whole source and `:94-104` matches over all of it; examples miss only because the regexes run brace-free | Reasoning corrected; the real hazard (a `name:` + `section:` pair on one brace-free run, first-wins at `:102` shadowing a real header) stated as a rule |
| m2 | one step removed the plate's only `+N more` catalog rendering *and* added an illustrative example because a state had no catalog rendering | two opposite standards on one screen | One standard stated; the illustrative example is four rows, restoring both states, inventing nothing |
| m3 | `check-compile` imports 49 exports | **52** (`components/svelte/index.js`) | Corrected in step 5 |
| m4 | `pending` stays because it is "derived from a prop, not from the service" | it is derived from **both** — `!!pendingId && s.id === pendingId` | Corrected in step 2 |
