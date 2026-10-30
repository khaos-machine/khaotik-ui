# Plan — ServiceStatusList: the error cause, and the daemon's full state vocabulary

Closes **khaotik-ui#43 gap 3** and **khaotik-ui#51**. One component
(`ServiceStatusList.svelte`), one shared type file (`lib/types.js`), their
generated declarations, one catalog fixture group, two test surfaces.

Ahead of **#60** (the startup window) deliberately: #60 composes these states,
and composing them before they render leaves the operator with a red dot and no
next step — the exact failure #60 exists to prevent.

> **Revision 2** (after red-team: 1 Critical, 5 Major, 4 Minor). C1 changed what
> `log_path` claims and how it renders; M2–M6 and m7–m10 are folded in; the
> three open decisions are closed and recorded in §7. Every citation below was
> re-verified by reading at this revision.

---

## 1. The failing tests (red first)

Two reds, one per issue. Both fail on `main` today.

### Red A — #43 gap 3, the rendered cause

`apps/catalog/src/components/ServiceStatusList.test.js`, new `describe` block:

```
describe('ServiceStatusList reports why an engine failed (#43 gap 3)', () => {
  it('renders the reason khaosd sends with an errored service')
  it('renders the log path, labelled as the conventional location')      // C1
  it('renders the log line alone when there is no reason')               // m9
  it('omits the log line when the reason already ends in that path')     // C1
  it('renders neither line for a service that is not in error')
  it('wraps the detail rather than truncating it')                       // M3, source-read
})
```

Fails today: `ServiceStatusList.svelte:81-147` renders the dot, identity, port,
pill and actions. There is no element carrying `reason` or `log_path` —
`ServiceStatusList.svelte:101` is where the error story currently ends.

**This is the red-first test. Write it, watch it fail, then build.**

The last case is **not** a rendered assertion. jsdom resolves no stylesheets, so
`toHaveStyle` on a class-based rule passes whatever the CSS says, and asserting
the *absence* of a class name the builder chooses is weaker still — a builder who
writes `text-overflow: ellipsis` straight into `.services__detail` sails through
it. `CLAUDE.md` names this exact defect class ("a CSS rule the kit references but
does not ship… jsdom resolves no stylesheets, so a rendered assertion passes
either way") and prescribes a **source-read** test. So: read
`components/svelte/ServiceStatusList.svelte` as text and assert the detail rule
declares `overflow-wrap: anywhere` and `white-space: pre-wrap` and declares
neither `text-overflow` nor `-webkit-line-clamp`. Precedent for source-read tests
in this repo is `apps/catalog/src/components/regressions.test.js`.

### Red B — #51, the type

New **committed** file `scripts/consumer/service-state.ts`. This directory's
`tsconfig.json:4` is `"include": ["*.ts"]` and `.gitignore:11` excludes only
`scripts/consumer/probe.*.ts`, so a committed `.ts` here is compiled by
`check-consumer`'s tsc pass (`scripts/check-consumer.mjs:190-196`) with no new
machinery. It is the only place in the repo that type-checks as a consumer.

```ts
import type { Service } from '@khaos-machine/khaotik-ui/components/svelte/lib/types.js'

// khaosd's five states — internal/localservices/manager.go:20-24
const stopping: Service = { id: 'a', name: 'A', state: 'stopping' }

// A state string newer than this client, carried verbatim rather than
// guessed at (khaotik-ui#51).
const newer: Service = { id: 'a', name: 'A', state: 'future-state-we-have-not-shipped' }

// The tail widens `state`; it must not widen the shape. This proves the type
// still does work.
// @ts-expect-error `state` is required
const noState: Service = { id: 'a', name: 'A' }
```

Fails today: `components/svelte/lib/types.d.ts:63` is
`state: "running" | "starting" | "stopped" | "error"`.

**Red-team verified this chain end to end** — built an isolated consumer outside
the repo, ran the repo's own tsc: TS2322 on both `'stopping'` and the unknown
string, positive control (`'running'`) clean, `@ts-expect-error` fires, baseline
`check-consumer` on `main` exits 0, and `.gitignore:11` does not catch a
committed `service-state.ts`. **Do not re-verify it.** Run it once to see the
red, then proceed.

---

## 2. The approach

### #51 — widen the type, do not touch the runtime

Take the issue's option A: the five states khaosd emits, plus a documented tail.

```
@property {'running'|'starting'|'stopping'|'stopped'|'error'|(string & {})} state
```

The five are named because naming them is the point — `stopping` folded to
`running` claims an engine is up while it is shutting down, and folded to
`stopped` claims it is already down (#51). The tail exists because khaos-app's
domain layer already refuses to guess at a state string newer than the client
(`domain/engine.ts`, `LocalServiceStatus.unknown`), and the component boundary
cannot start making that trade. The runtime already tolerates both:
`ServiceStatusList.svelte:71` is `TONES[s.state] ?? 'neutral'` and `:101`
renders `service.state` verbatim.

**The spike this plan used to open with is answered.** Red-team ran it:
`(string & {})` survives `build-types` **verbatim**, with the per-property prose
carried into the `.d.ts`. The `string & Record<never, never>` fallback is never
needed and is struck from this plan. It also confirmed the stated cost by
running it — `state: 'stoppign'` compiles, `state: 3` is still rejected.

### #43 gap 3 — render the cause beneath the identity

khaosd populates `reason` and `log_path` **only** inside
`if info.State == StateError` (`khaos-manager/internal/localservices/lifecycle.go:273-283`),
both `omitempty` (`manager.go:80`, `:83`). A field-keyed guard therefore cannot
fire on a healthy row.

`reason` is the engine's own failure sentence and gets `OutcomeBanner`'s
treatment, because that component already settled this question for the same
class of text: verbatim, monospace, **never truncated** — "an ellipsis in the
middle of `projectPath query param required` leaves the reader with nothing"
(`OutcomeBanner.svelte:124-135`).

**`log_path` is the conventional location, not evidence that a log exists.**
This is C1, and it reverses what revision 1 claimed. Reading the daemon:

- `lifecycle.go:280` constructs it unconditionally within the error branch —
  `info.LogPath = filepath.Join(m.khaosDir, "logs", id+".log")`. No `stat`, no
  existence check, no reference to any file actually written.
- On the Apple-Silicon precheck path the service enters `StateError` **before
  anything launches** (`lifecycle.go:42-45` builds `managedService{state:
  StateError, lastErr: …}` with no process), so the row renders an absolute path
  to a file that was never created.

So the label reads **"Log (expected at)"** or equivalent, and the JSDoc says
khaosd constructs this path without checking that it exists. That is the same
honesty this kit already extends to `Requirement.verdict: 'unknown'`
(`lib/types.js:162` — "*it is NOT a pass, and no surface may render it as one*")
and to `Project.git_ahead_count` (`:65` — renders nothing rather than claiming
`synced`). A path presented as "the crash output" that opens nothing is exactly
the over-claim those two entries exist to prevent.

**The duplication, ruled as a consequence.** `lifecycle.go:152` builds `lastErr`
— which becomes `info.Reason` at `:276` — as:

```
"%s did not become healthy on port %d within %s — the process likely crashed on launch; see %s"
```

The final `%s` is `logPath`. **On the commonest error path the reason string
already ends in the log path.** Ruling: the labelled log line renders only when
`reason` does not already contain `log_path` — an exact substring test, no
parsing. Rationale: the daemon's own sentence reads better than a second
labelled copy, and two renderings of one path invite a reader to wonder whether
they are two different paths. If the daemon's wording changes, the check simply
stops matching and the line renders — the safe direction.

### Out of scope, and why

- **`remediation`.** khaosd's `ServiceInfo.Remediation` (`manager.go:86`) is
  populated from `settings.ServiceRemediation` (`cmd/khaosd/main.go:172`), which
  returns `false` whenever the engine catalog is nil —
  `internal/settings/provider_canonical.go:93-95` reads
  `if c == nil { return "", "", false }` and never consults the
  `fallbackCatalog()` defined at `:64-75`. Filed as
  **khaos-studio/khaos-manager#209**. A component built to render it would render
  nothing in precisely the degraded states this work is about. **Waits on #209.**
- **#43 gaps 1 and 2** (the `Launcher` plate). Different component.
- **Opening the log.** No `onOpenLog` callback. The library cannot open a file,
  and after C1 there may be no file to open. Named so the omission is a decision.
- **`setup_steps`.** Sent by the daemon and present in
  `apps/catalog/src/data/services.json`, but #43 gap 3 names three fields and
  this plan ships two. Not silently absorbed.

---

## 3. Ordered steps

Steps 1-2 are #51; 3-6 are #43 gap 3; 7-8 are the gates. (Revision 1's Step 0
spike is struck — see §2.)

**Step 1 — widen `Service.state` in `components/svelte/lib/types.js:76`,** and
add the two new optional fields to the same typedef. The per-prop prose goes on
the `@property` lines; `types.d.ts` is generated and must never be hand-edited
(D59).

```
@property {string} [reason] The engine's own failure sentence. Sent only when
  `state` is `error` (lifecycle.go:273). Rendered verbatim and never truncated.
@property {string} [log_path] Where khaosd expects this service's log to be —
  `~/.khaos/logs/<id>.log`, CONSTRUCTED, not probed (lifecycle.go:280). The
  daemon does not check that the file exists, and on a pre-launch failure it
  does not. Render it as the conventional location, never as "the crash output".
```

Both snake_case, matching the daemon's JSON tags exactly (`manager.go:80`,
`:83`) and the convention `Service` already uses (`port`, `ready_to_use`).

**Step 2 — regenerate and verify red B goes green.** `npm run build-types`,
then `npm run check-consumer`. Red B compiles; the `@ts-expect-error` still
fires.

**Step 3 — write red A** (§1) and watch it fail.

**Step 4 — render the detail in `ServiceStatusList.svelte`.** One element after
the actions in the `<li>`, spanning via `grid-column: 1 / -1` (the row is
`grid-template-columns: auto minmax(0, 1fr) auto auto`, `:171`).

**Each labelled line is individually guarded** (m9). `reason` and `log_path` are
not jointly present: `info.Reason` is set only when the service-map lookup
succeeds (`lifecycle.go:275-277`), while `info.LogPath` is set unconditionally
at `:280`, so a `StateError` row with a log path and no reason is reachable. A
single `{#if reason || log_path}` wrapper around two unguarded lines ships a bare
`Reason:` label with nothing after it. So: outer `{#if}` on either, inner `{#if}`
on each — and the log line additionally carries the substring test from §2.

`reason: ''` is unreachable (`json:"reason,omitempty"`), so no empty-string
special case is needed.

**Step 5 — style it.** Only tokens the kit ships. Verified present:
`--font-mono` (`tokens/tokens.css:138`), `--caption-size` and `--caption-line`
(`:147`), `--tone-danger` (`tokens/tokens-extra.css:28`), `--text-secondary`
(`tokens.css:168`, `:231`), `--surface-raised` (`:166`, `:229`), plus
`--text-tertiary`, `--spacing-*`, `--radius-sm`, `--border-default` already used
in this file. Red-team grepped all 15 with positive controls; no invented token.

**Verified ABSENT — do not use, do not invent:** `--border-subtle`,
`--surface-sunken`, `--border-strong`. `ServiceStatusList.svelte:150-155` and
`ProjectCard.svelte:190` both already record that mistake — an unknown custom
property resolves to nothing rather than erroring, so this class ships green.
If the detail block wants a token not listed above, **report it.**

**The two declarations that are load-bearing rather than decorative** (M4) —
`OutcomeBanner.svelte:133-134`:

```css
overflow-wrap: anywhere;
white-space: pre-wrap;
```

Revision 1 cited `OutcomeBanner` for "never truncated" but pointed at its prose
and enumerated tokens instead of these. Without them a 60-character unbreakable
path in a `grid-column: 1 / -1` child blows out the grid track, and the
`minmax(0, 1fr)` guard at `ServiceStatusList.svelte:171` **does not cover the
spanning row** — it constrains column 2 only. This is the long-reason case, and
these two lines are the fix. The detail element also needs its own `min-width: 0`.

**Step 6 — catalog fixture.** `apps/catalog/src/fixtures.js`, the
`service-status-list` entry (`:1090-1123`). Add an `Errored` example; give the
existing `Every state` example's `orpheus` row (`:1100`) its `reason` and
`log_path` — it is already `state: 'error'` and rendering it without a cause is
now the defect; and add a `stopping` row, the state that had no name.

**Ruling on the real-data rule** (M5). Revision 1 was not executable: it demanded
a live-or-dated capture for a new `Errored` example while hand-writing fields
onto `orpheus`, which is itself fabricated with no capture note. Ruled one way:

> **State-matrix examples in `fixtures.js` are a standing, declared exception to
> the real-data rule.** They exist to render a state the machine is not in.
> `orpheus` and `whisper` (`:1099-1100`) are already such rows, added for #49,
> and this plan extends that precedent rather than creating it.

Two conditions on the exception, both required:

1. **Step 6 writes the exception down** in a comment at the fixture, the way
   `fixtures.js:78-82` documents its hand-capture. An undeclared exception is
   what made this ambiguous.
2. **The illustrative `reason` is the daemon's own sentence**, instantiated from
   the format string at `lifecycle.go:152` rather than invented prose. Real
   wording, real shape, no capture claimed.

`apps/catalog/src/data/services.json` — the *live* capture — is **not** touched.
It stays what `fetch-all.sh` produced: three engines, all `stopped`, none
errored. The exception covers `fixtures.js` only.

**A note on what this commits to the repo** (m10): `log_path` and the illustrative
`reason` both carry `/Users/<username>/…`. Precedent exists —
`services.json` already commits `"detail":"/Users/k/.khaos/kittentts/venv"` — so
this is disclosure, not a blocker. Use the same username already in the tree
rather than introducing a second.

**Step 7 — regenerate declarations.** `npm run build-types`.

**Correction to revision 1** (M2): this step claimed `check-consumer`'s check 5
gates the new fields' JSDoc. **It cannot see them.** That check reads
`components/svelte/${name}.svelte.d.ts` and matches component props at
`^\s{4}(\w+)\??:` (`scripts/check-consumer.mjs:248-265`); it never opens
`lib/types.d.ts`. `ServiceStatusList.svelte.d.ts:10` carries
`services?: readonly import("./lib/types.js").Service[]` — the type by
**reference**, so the fields inside it are never examined.

**No gate in this repo checks that shared-type fields are documented.** No gate
is invented here to fix that. The JSDoc in Step 1 is required by house rule and
is unenforced; it is on review to check it.

**Step 8 — run every gate** (§5).

---

## 4. Files touched

| Path | Change |
| --- | --- |
| `components/svelte/lib/types.js` | `Service.state` widened; `reason`, `log_path` added (step 1) |
| `components/svelte/lib/types.d.ts` | **generated** — `npm run build-types` only |
| `components/svelte/ServiceStatusList.svelte` | detail element + its CSS (steps 4-5) |
| `components/svelte/ServiceStatusList.svelte.d.ts` | **generated** |
| `apps/catalog/src/components/ServiceStatusList.test.js` | red A (step 3) |
| `scripts/consumer/service-state.ts` | red B — new, committed |
| `apps/catalog/src/fixtures.js` | fixture examples + the declared exception (step 6) |

`apps/catalog/src/data/services.json` is **not** touched (§3 step 6).

No barrel change, no new export — `check-catalog` and `check-taxonomy` see no new
surface; the entry stays in group `lists`.

---

## 5. Verification

```sh
# red first
cd apps/catalog && npx vitest run src/components/ServiceStatusList.test.js   # A: red
cd ../.. && npm run check-consumer                                            # B: exit 1

# after each step, and all of it at the end
npm run build-types
npm run check-types        # generated .d.ts have not drifted (D59)
npm run check-coverage     # catalog · taxonomy · consumer · compile
cd apps/catalog && npm test
```

**0 clean · 1 gaps · 2 CANNOT RUN. A 2 is a red, not a pass.**

Revision 1 warned that reformatting the fixture entry could drop it from
`check-taxonomy`. Red-team measured it: the whole `service-status-list`
placement is on one line (`fixtures.js:1090`) and Step 6 only touches the
`examples` array below it. **The warning is conservative, not load-bearing** —
kept as a habit, not as a risk to plan around.

### Accessibility — what is owed, and what is not asserted (m8)

Revision 1 cited D52 for "no `role`, no `aria-live`". **That is a miscitation.**
D52 (`docs/decisions.md:172`) is the merged-unit encoding decision — plain `div`
container, sibling activate + overflow buttons, `aria-hidden` visual text, no
`<title>` — and its `<title>` clause is about a leaked stop on the merged unit,
not about text blocks. It says nothing about `role` or `aria-live`.

The substantive call stands on its own authority: **no `role="alert"`**, because
an alert interrupts a screen reader, which is right for a mutation that just
failed and wrong for a state merely being rendered — polling would interrupt on
every refresh (`OutcomeBanner.svelte:45-49`).

What D52 *is* relevant to, and what this plan does **not** assert: its clause
counts stops as `1 + count(excluded)` on the merged unit. Step 4 adds a text
block to an `<li>` that already has sibling buttons. **No conformance claim is
made without measuring**, and this plan does not measure. It is on review to
decide whether a stop-count measurement is owed before this ships.

---

## 6. Corrected citations (m7)

Revision 1 drifted on three, all corrected in place above. Recorded so review can
see the substance survived:

- `remediation`'s nil-check is `provider_canonical.go:93-95`, not `:91-93`. The
  substance stands — `fallbackCatalog()` at `:64-75` is never consulted, #209
  holds.
- `manager.go:78`/`:82` are **doc-comment** lines. The fields are `Reason` at
  `:80` and `LogPath` at `:83`; the range `:76-85` also stopped one line short of
  `Remediation` at `:86`.
- `manager.go:20-24` (the five states) was correct.

---

## 7. Decisions, closed

The three items revision 1 carried as open are ruled and are **no longer open**.

1. **Type shape — option A stands.** A tail with no members is identically
   `string` and leaves #51's own title unaddressed. The typo hole
   (`state: 'stoppign'` compiles) exists under both arms, so it is not
   attributable to this choice.

2. **`stopping` tone — correctly out of scope, and here is why.** `TONES`
   (`ServiceStatusList.svelte:61-66`) maps four states; `stopping` falls through
   to `neutral` at `:71`. That fallthrough **already applies to every `stopping`
   row khaos-app renders today** — this plan changes nothing about it. `:101`
   renders the state verbatim, so the row is not ambiguous: it reads `stopping`
   beside a neutral dot. `neutral` **under-specifies; it does not over-claim**,
   which is precisely what the `TONES` rationale at `:58-60` guards against. The
   "`info`, for consistency with `starting`" argument is real, and it is the
   designer's call, not this plan's.

3. **The action branch may ship unfixed — filed as #62.** Revision 1 framed this
   wrongly twice, and both are corrected. It is **not** made reachable by this
   plan: `ServiceStatusList.svelte:123` branches on `service.state === 'running'`
   and has never rejected any other value, and khaos-app already passes
   `stopping` through a call-site cast, so an enabled Start on a shutting-down
   engine is **live today**. And it is not a `stopping` special case: `starting`
   is already in the shipped union, needs no cast, and falls to the same
   enabled-Start branch at `:130-137` for the identical reason. #62 frames it
   correctly — the action branch discriminates on one state where the daemon
   reports five.

---

## References

Verified by reading at this revision.

**khaotik-ui**

- `components/svelte/lib/types.js:70-80` — the `Service` typedef; `:76` is `state`
- `components/svelte/lib/types.js:65`, `:162` — the `git_ahead_count` and `verdict: 'unknown'` honesty precedents C1 invokes
- `components/svelte/lib/types.d.ts:63` — the generated narrow union (#51)
- `components/svelte/ServiceStatusList.svelte:58-60`, `:61-66`, `:71` — the `TONES` rationale, the table, the fallthrough
- `components/svelte/ServiceStatusList.svelte:101` — where the error story ends
- `components/svelte/ServiceStatusList.svelte:123`, `:130-137` — the action branch (#62)
- `components/svelte/ServiceStatusList.svelte:150-155`, `:171` — the missing-token precedent; the grid columns
- `components/svelte/ServiceStatusList.svelte.d.ts:10` — `Service` carried by reference (M2)
- `components/svelte/OutcomeBanner.svelte:45-49` — why `alert` is reserved for mutations
- `components/svelte/OutcomeBanner.svelte:124-135` — verbatim/monospace/not-truncated, and `overflow-wrap: anywhere; white-space: pre-wrap` at `:133-134`
- `scripts/check-consumer.mjs:190-196` — the consumer tsc pass (red B's carrier)
- `scripts/check-consumer.mjs:248-265` — check 5, and why it cannot see these fields
- `scripts/consumer/tsconfig.json:4` — `"include": ["*.ts"]`
- `.gitignore:11` — only `probe.*.ts` is ignored
- `docs/decisions.md:172` — D52, the merged-unit encoding (m8)
- `apps/catalog/src/fixtures.js:78-82` — the dated hand-capture precedent (#59)
- `apps/catalog/src/fixtures.js:1090`, `:1099-1100`, `:1090-1123` — the entry's one-line placement; the existing illustrative rows; the examples
- `apps/catalog/src/data/services.json` — the live capture: three engines, all `stopped`, none errored
- `tokens/tokens.css:138`, `:147`, `:166`, `:168`, `:229`, `:231`; `tokens/tokens-extra.css:25-28`

**khaos-manager**

- `internal/localservices/manager.go:20-24` — the five states
- `internal/localservices/manager.go:80`, `:83`, `:86` — `Reason`, `LogPath`, `Remediation`
- `internal/localservices/lifecycle.go:42-45` — `StateError` before launch, no process, no log
- `internal/localservices/lifecycle.go:152` — the `lastErr` format string ending in the log path
- `internal/localservices/lifecycle.go:273-283` — the error-only branch; `Reason` at `:276` guarded by the map lookup at `:275`, `LogPath` unconditional at `:280`
- `internal/settings/provider_canonical.go:64-75`, `:93-95` — `fallbackCatalog`, never consulted (#209)
- `cmd/khaosd/main.go:172` — the only caller
