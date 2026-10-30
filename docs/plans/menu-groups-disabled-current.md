# Plan: khaotik-ui #223, revision 5

Menu gains four things: item groups, unavailable items with an announced reason, a current value that sits outside the items, and a whole-control disabled state.

- **Base:** `origin/main` `541c2ef`
- **Worktree:** `/Users/k/.treehouse/khaotik-ui-35a0af/1/khaotik-ui`
- **Branch:** `feat/menu-groups-disabled-current`
- **Role:** planner
- **Status:** revision 5, amended to meet the plan-reviewer's conditions on `dcc2e23`: one owner per stop, the step-19 correction, the step-14 citation, the step-32 split and the frontmost self-test. Further amended after the step-17d stop on `dcd4f49`: step 14b (border-box), `rect.bottom ≤ innerHeight` and a visibility precondition in 17–21, and step 21b (ViewportPicker min-width). Amended again after the step-20d stop on `8021635`: steps 20a and 21r (window resize and restore) replace scrolling, and steps 18, 19 and 21 name the last item correctly. Amended after the step-20a instrument fault on `9419226`: bridge upgrade steps U1–U7 (D8) and the Activate procedure (D9). Then amended again for red-team findings on `01b359b`: C1 (the binary is `app`), M1–M5, m1–m3, and the architect's Q11 ruling in U3. Amended under D10–D12 on `fc9b07d`: VoiceOver steps 24–35 removed (D4 superseded), and the dev PID resolved by cwd rather than by argv path.
  - Steps 0–11 are revision 3's. They are built in `dcd4c9b` and `47d3e7c` and are left as written.
  - Revision 5 **replaces** revision 4's steps 12–20 with steps 12–38. They are added after the reviewer's FAIL on the build, and they resolve red-team's C1, C2, M1, M3, M4, m1 and m3 on revision 4. They also carry D4–D7, Q7 and G1/G2.
  - Revision 3 folded in the architect's amendments to M1, the designer's rulings, operator decisions D2 and D3, and red-team findings M-B, m-A, m-C, m-D and m-E.

**Persistence.** This plan lives at `docs/plans/menu-groups-disabled-current.md`, committed at step 0 (`9cb1b1b`). That gives the gate verdict an artifact path and a SHA.

**Not a builder step:** D1. The operator has authorised the release after a reviewer PASS and a green merge. That is outside this plan.

## Changes since revision 2

| Change | Source | What it does |
|---|---|---|
| Internal key | M-C | The key is `v_${encodeURIComponent(value)}`, not `k${index}`. `{#each}` is keyed on it too. The setter maps a key to a value through a `Map`, never by decoding. |
| Typeahead | M-A | Items pass `valueText={item.label}`, so typeahead matches labels. |
| Setter while disabled | m-B | The setter also discards every selection while `disabled` is true. |
| Label colour | Designer Q2 | `--text-secondary`; tertiary is withdrawn; no allow entry. The question is closed. |
| Wording | Designer Q4 | "unavailable", not "not ready". A9 is updated to match. The question is closed. |
| Gate drift | Operator D2 | TOOLS.md's gate drift (F1) is fixed in this PR as step 10. |
| Fixture reason | Operator D3 | The catalog uses `"stopped"`, labelled as captured. Q5 is closed. |
| Invented example | M-B | The "Unlisted current value" example is replaced with a captured stored value that matches no item. |
| Test controls | m-A | A6 has positive controls for Enter and Space and sends real key strings. A2's click half has its own control and asserts the highlight before Enter. |
| Label reference | m-C | An unlabelled group no longer carries a dangling `aria-labelledby`. A8 asserts this. |
| Stale comment | m-D | The comment at `duplicate-string-keys.test.js:38` is updated. |
| Fixture coverage | m-E | The fixture now shows an unavailable item with no reason, from captured data. The literal `''` value has no captured backing, so that gap is recorded and the state is left to the tests. |

## Binding rulings (as written; not re-derived here)

**Architect**

- **Primitive.** Keep Ark Menu. Select and Listbox skip disabled items too (`@zag-js/collection` `list-collection.mjs:205,215,466,474`).
- **C1. Unavailable items get no zag `disabled`.**
  - Menu passes `aria-disabled="true"` and `data-unavailable=""`, spread after the zag props. It never sets `data-disabled`.
  - The items therefore stay navigable (`menu.dom.mjs:43`, `menu.connect.mjs:316`), and their `aria-describedby` reason is heard.
  - These items get `closeOnSelect={false}`.
  - The selection setter discards them.
  - Hover highlight stays, because active-descendant needs it. It is styled distinctly.
- **C2. The binding is controlled.** Each `MenuRadioItemGroup` uses `bind:value={() => keyOf(value), (k) => choose(k)}`, and `onValueChange` is dropped. The checkmark moves only when the consumer updates `value`.
- **M1, as amended by M-C.**
  - The key is `v_${encodeURIComponent(item.value)}`, and `{#each}` is keyed on it.
  - `choose(k)` looks `k` up in a `Map<key, item>` built from `items`. It never decodes the key. It discards the selection in each of these cases:
    - `k` is missing from the map;
    - the item is `unavailable`;
    - `disabled` is true (m-B).

    Otherwise it calls `onselect(item.value)`.
  - `keyOf(value)` returns the item's key, or `''` if no item matches. Every real key starts with `v_`, so `''` never checks anything.
- **M-A.** Items pass `valueText={item.label}` (`searchable.mjs:13`, `menu.connect.mjs:46`), so typeahead matches labels rather than keys.
- **M2. Values are unique across the whole list.** Menu throws, naming the value, when `new Set(values).size !== items.length`. The consumer composes `provider/id`.
- **M3. Whole-control disabled.**
  - The trigger gets `aria-disabled="true"` and `data-disabled=""`. zag ignores pointerdown and click on it (`menu.dom.mjs:67-68`, `menu.connect.mjs:228,233`).
  - An `onkeydown` handler calls `preventDefault()` for every key except `Tab`. It runs first (`merge-props.mjs:33`), and zag stops on `defaultPrevented` (`menu.connect.mjs:249`).
  - The trigger stays focusable.
- **ViewportPicker** keeps `inert`. Only its now-false comment at `:65-70` is fixed.
- **m1 is out of scope.** Provider-level readiness and providers with zero models are handled by khaos-app's adapter.

**Designer**

- **Q2.** The unavailable label is `--text-secondary`, with no allow entry.
- **Q4.** The word is "unavailable".
- **Q3 stands.** On an unavailable current item, the warning icon replaces the checkmark. Checked state is still carried three ways: `aria-checked`, weight 600 through `[data-state='checked']`, and the trigger.

**Operator**

- **D2.** Fix `TOOLS.md:24`, deriving the text from `gates.yml` and `package.json:14`.
- **D3.** The reason `"stopped"` from `services.json` is labelled as captured. The comment names the gap and khaos-manager#364.

## Prop API (JSDoc, replacing `Menu.svelte:22-42`)

```js
/**
 * @typedef {Object} MenuItem
 * @property {string} value Matched against `value`. **Unique across the whole list, groups included** — Menu throws naming the duplicate; compose `provider/id` when groups share an id. `""` is legitimate and never truth-tested.
 * @property {string} label Visible text; also what typeahead matches.
 * @property {string} [group] Heading the item sits under; groups render in first-appearance order. Absent: the unlabelled group.
 * @property {string} [groupMark] Provider id for a `ProviderMark` beside the heading, read from the group's first item. The heading text carries the name; the mark is `aria-hidden` (ProviderMark.svelte:23-24).
 * @property {boolean} [unavailable] Shown, reachable by arrow keys and typeahead, announced — never selected: choosing it keeps the menu open and calls nothing.
 * @property {string} [reason] Why it is unavailable; rendered under the label and announced via `aria-describedby`. Ignored unless `unavailable`.
 */

/**
 * @typedef {Object} Props
 * @property {string} [label] (unchanged)
 * @property {string} [value] Selected item `value`; may match no item (see `currentLabel`). Controlled: choosing calls `onselect` and moves nothing until the caller updates `value`.
 * @property {readonly MenuItem[]} [items] See MenuItem.
 * @property {string} [currentLabel] What the trigger shows when `value` matches no item (a stored value nothing serves). A matching item's `label` wins.
 * @property {boolean} [disabled] The whole control, e.g. while a save is in flight: the trigger stays focusable and is announced disabled, cannot open, and no selection is accepted.
 * @property {(value: string) => void} [onselect] (unchanged)
 */
let { label = '', value = '', items = [], currentLabel = '', disabled = false, onselect = undefined } = $props()
```

Every prop has an explicit default, which `props-optionality.test.js` requires.

**Trigger values.** These use `??` and ternaries only, because `value` and `currentLabel` may be `""`.

| Name | Derivation |
|---|---|
| `current` | `items.find((i) => i.value === value)` |
| `shown` | `current ? current.label : currentLabel` |
| `reason` | `current?.unavailable ? (current.reason ?? '') : ''` |
| `aria-label` | `reason ? \`${label}: ${shown}, unavailable: ${reason}\` : \`${label}: ${shown}\`` |

The `aria-label` extends the existing one at `Menu.svelte:51`.

**Compatibility.** The change is additive. With no `group`, Menu renders one `MenuRadioItemGroup`, and matched-value trigger text is unchanged. The one observable change is the controlled checkmark (C2). The only in-repo consumer, `ViewportPicker.svelte:73`, always feeds `value` back, so it is unaffected. See Q1.

## Markup and style mechanism (for the builder)

- **Groups.**
  - A `$derived` list groups `items` by `group ?? ''` in first-appearance order. Each entry is `{ item, key }`.
  - `{#each}` is keyed on `key`.
  - A named group renders `MenuItemGroupLabel class="ui-menu__group-label eyebrow"`, plus `ProviderMark providerId={groupMark}` when a mark is set.
  - Groups are separated by `:global(.ui-menu__group + .ui-menu__group) { border-top: 1px solid var(--border-hairline) }`.
  - Heading padding is `6px 10px`, as at `Menu.svelte:123`. The `.eyebrow` class comes from `tokens/utilities.css:39-46`.
- **Unlabelled group (m-C).** zag always sets `aria-labelledby` on a group (`menu.connect.mjs:454`). Ark merges local props with `@zag-js/core` `mergeProps`, where a local `undefined` does not override (`props[key] !== void 0 ? props[key] : result[key]`) but `null` does. So the unlabelled group passes `aria-labelledby={null}`, and Svelte omits an attribute set to `null`. A named group passes nothing, and its label supplies the id.
- **Unavailable item (C1).**
  - Props: `value={key} valueText={item.label} closeOnSelect={false} aria-disabled="true" data-unavailable="" aria-describedby={reasonId}`, with no `disabled`.
  - The check column (`Menu.svelte:142-147`) shows `<Icon name="warning-circle" weight="fill" />` in `--tone-warning`, following the precedent at `CharacterBuilder.svelte:252`.
  - The reason is `<span id={reasonId} class="ui-menu__reason" aria-hidden="true">`, at caption size in `--text-secondary`, laid out like `SelectableRow.svelte:190-198`. It is rendered only when `reason` is non-empty, and `aria-describedby` is set only then.
- **Reason id.** `${$props.id()}-${key}`. The key's `encodeURIComponent` output has no spaces, so it is safe as an IDREF. Ark 5.23 already uses `$props.id()`.
- **Colour.**
  - An unavailable label is `--text-secondary` (Q2), so it needs no contrast-allow entry.
  - When highlighted, an unavailable item keeps `--text-secondary`, while an enabled item goes to `--text-primary` (`:132-135`).
  - The unavailable item uses `cursor: default`.
  - The state is carried by the icon, the reason and `aria-disabled`, never by colour alone.
- **Trigger when the current item is unavailable.** The trigger shows the value, then the warning icon in `--tone-warning`, then the caret, on a single line.
- **Trigger when the whole control is disabled (M3).**
  - Attributes: `aria-disabled="true"`, `data-disabled=""`, plus the `onkeydown` handler that lets only `Tab` through.
  - Style: `:global(.ui-menu__trigger[data-disabled]) { opacity: .4; cursor: default }`.
  - Hover is scoped to `:not([data-disabled])`, so a disabled trigger shows no hover border (`Menu.svelte:90-92`).

## Tests (red first; each one drives zag by keyboard or pointer)

The tests go in a new file, `apps/catalog/src/components/Menu.test.js`.

- Import Menu the way `ViewportPicker.svelte:25` does.
- Use `fireEvent`; user-event is not installed.
- Use zag's key strings: `'Enter'`, `' '` (which `event.mjs:69` maps to Space), `'ArrowDown'`, `'Tab'`.
- Await `tick()`, or use `waitFor`, after each event.
- Re-render with the `rerender` from `render`.
- Every "cannot" assertion has a positive control in the same setup.
- If zag cannot be observed in jsdom for a test, the builder stops and reports it. It does not downgrade the test to a markup assertion.

| # | Behaviour | Red today because |
|---|---|---|
| A1 | Focus the trigger and press ArrowDown to open, then ArrowDown until the unavailable item is highlighted. Content `aria-activedescendant` equals that item's `id`, and the item `toHaveAccessibleDescription(reason)`. | no `unavailable` or reason |
| A2 | **Enter half.** Arrow to the unavailable item and assert it is the active descendant *before* pressing Enter. Enter does not call `onselect`, and `aria-expanded` stays `"true"`. Control: arrow to an enabled sibling, press Enter; `onselect(value)` is called and the menu closes. **Click half**, in its own render: clicking the unavailable item does not call `onselect` and the menu stays open. Control: clicking an enabled sibling calls `onselect(value)`. | not implemented |
| A3 | Rejected save across two groups. `value` = A in group 1. Select B in group 2. `onselect('B')` fires, but `value` is not updated. Exactly one `aria-checked="true"` exists in the document, and it is A. | Ark moves the check internally |
| A4 | Defaults in two groups, using composed values `fal/` and `khaos-synth/`, with `value: 'khaos-synth/'`. Arrow keys move on and off each default, and only `khaos-synth/` is checked. | no groups |
| A4b | A literal item value `''` with `value: ''`: the trigger shows that item's label, and choosing another item calls `onselect` with that item's value. Separately, `value: ''` matching no item shows `currentLabel`. | no `currentLabel` |
| A5 | Duplicate values: `render` throws an error whose message names the value. Control: distinct values render. | today the error is Svelte's `each_key_duplicate`, not M2's |
| A6 | Whole control disabled. The trigger has `aria-disabled="true"`. Click, `keyDown` `'Enter'`, `' '` and `'ArrowDown'` each leave `aria-expanded="false"`. The `'Tab'` keydown's `defaultPrevented` is false. Controls, on the same render without `disabled`: click, `'Enter'`, `' '` and `'ArrowDown'` each open the menu, each from a fresh closed state. | no prop |
| A7 | After an enabled item is chosen, `document.activeElement` is the trigger. | a pin; zag's `focusTrigger` does this (`menu.machine.mjs:159`) |
| A8 | A named group is a `role="group"` whose `aria-labelledby` resolves to a label whose text is the group name. With no `group` on any item there is exactly one group, and it has **no** `aria-labelledby` attribute. Across both renders, every `aria-labelledby` in the document resolves to an existing element. | no groups; the zag default dangles (m-C) |
| A9 | Current value unavailable. The trigger's accessible name is `Voice: <label>, unavailable: <reason>`. Opening shows that item as `aria-checked="true"`. | no reason on the trigger |
| A10 (M-C) | Key stability. Open the menu and arrow to item X. Re-render with a new item inserted before X. Press Enter. `onselect` receives X's value. | the index key would shift |
| A11 (M-A) | Typeahead. Open the menu and keyDown a letter that is the first letter of exactly one item's label. The active descendant is that item. | `valueText` would be the key (`v_…`) |
| A12 (m-B) | Disabled while open. Open the menu, re-render with `disabled: true`, then click an enabled item. `onselect` is not called. The control is A2's click control. | no prop |

A13 (T1) goes in `contrast.test.js`. It checks that `--tone-warning` on `--surface-raised` is at least 3:1 (SC 1.4.11) in both themes, using the file's `resolved()`, `toneValues()` and `contrastRatio`. It may already pass, since #220 deepened the light warning tone. If it does, it is a pin and is reported as one.

**Out of reach for jsdom, so moved to step 7 with a pass bar:** styling, opacity, highlight colours, the separator, positioning, and rendered contrast. What VoiceOver says and real Tab focus movement were also listed here; D10 removed them. Per RULES.md, "A CSS fact jsdom cannot see".

## Ordered steps (one verification each)

0. **Commit this plan** to `docs/plans/menu-groups-disabled-current.md`.
   Verify: `git log -1 --name-only`.
1. **Write A1–A12.**
   Verify: `cd apps/catalog && npx vitest run src/components/Menu.test.js`. Each red test fails for the reason in its row. A7 and the control halves are green. Record the output.
2. **Add T1.**
   Verify: `npx vitest run src/contrast.test.js`, and record both ratios. If T1 fails, stop and route to the designer (token change, D-register). Do not change tokens in this plan.
3. **Implement the logic in `Menu.svelte`.** This covers:
   - M-C keys and the `Map`, the M2 throw, and the C2 binding;
   - `choose`, which discards unknown keys, unavailable items and any selection while disabled;
   - C1 attributes and M-A `valueText`;
   - reason ids, the m-C `aria-labelledby={null}`, and `currentLabel`;
   - the trigger `reason` and M3;
   - the JSDoc, and the header comment at `:8-9` (it now reads "one or more radio groups, controlled").

   Verify: `npx vitest run src/components/Menu.test.js src/components/shell/ViewportPicker.test.js src/components/duplicate-string-keys.test.js` is all green.
4. **Styles.** No `--text-tertiary` is added.
   Verify: `npx vitest run src/contrast-guard.test.js src/token-refs.test.js` is green, with `contrast-allow.json` untouched.
5. **Comments now false.** Neither change touches code.
   - `ViewportPicker.svelte:65-70`: Menu's `disabled` keeps the trigger focusable, and this bar needs it out of the tab order, which only `inert` does.
   - `duplicate-string-keys.test.js:38` (m-D): Menu `item.value` stays a caller contract, but Menu now enforces it with an explicit throw naming the duplicate (M2). It no longer relies on Svelte's `each_key_duplicate`, because the `{#each}` key is now the encoded key.

   Verify: `npx vitest run src/components/shell/ViewportPicker.test.js src/components/duplicate-string-keys.test.js` is green.
6. **Catalog fixture, captured data only** (M4, M-B, m-E, D3). Append to the `menu` entry at `apps/catalog/src/fixtures.js:1458-1473`, keeping the existing two examples. All values below were measured in this worktree's `apps/catalog/src/data/`.
   - **Grouped by provider.**
     - Items come from `voices.json` voices whose `providerId` is `openai`, `kittentts` or `elevenlabs`: `value = id`, `label = name`, `group = provider`, `groupMark = providerId`.
     - `unavailable` means `provider-status.json` shows the provider at `isReady: false`. That covers `kittentts` and `elevenlabs`; `openai` is ready.
     - KittenTTS items take `reason` from `services.json` `kittentts.state`, verbatim: `"stopped"`, labelled as captured (D3).
     - ElevenLabs items carry **no reason**, because nothing captured supplies one. That is the honest "unavailable without reason" state (m-E).
     - `value` is the first OpenAI voice id.
   - **Current value unavailable.** The same items, with `value` set to the first KittenTTS voice id.
   - **Stored value outside items (M-B).**
     - `casting.json` holds the captured entry `{ characterId: "chr_01KJXTKAMJT0EET74WP7GN649N", voiceProfileId: "vp_01KJZE842K22S0F7GX2Y3HDQF9", voiceProfileName: "Echo", manualOverride: true }`. That `voiceProfileId` is absent from `voices.json`.
     - This is a real stored voice that the live catalog does not serve, which is the issue's need 3 in captured form.
     - Use `value` = that `voiceProfileId` and `currentLabel` = its `voiceProfileName`, looked up from `casting.json` in the fixture rather than typed in. The items are the grouped voices.
     - This follows the existing `castFor` join at `fixtures.js:125-135`, which already treats a missing voice as honestly unresolved.
     - The retired hosted voice gateway is removed.
   - **Disabled.** The grouped items with `disabled: true`.
   - **Declaration comment at the fixture.** It names every file and field used, and states the gaps:
     - Nothing captured carries khaos-manager#364's `route_options`, per-model readiness, or engine reason strings.
     - `"stopped"` is a service state, not an engine reason.
     - No captured value is `''`, so the provider-default `''` state and the unlabelled-`''` trigger are covered by tests A4 and A4b only.
     - The examples demonstrate Menu's shape with voice lists, not routing data.

   Verify: `npm run check-catalog` exits 0.
7. **Check the running catalog visually.** (Its VoiceOver half is superseded by D10.) Run `cd apps/catalog && npm run dev:mcp` and drive it through the `mcp-steering` skill, once in dark and once with `html[data-theme="light"]`.

   **Visual pass bar, both themes, with screenshots in the PR:**
   - group headings with eyebrow and mark;
   - the hairline separator;
   - the warning icon visible on `--surface-raised`;
   - the reason on a second line at caption size;
   - an unavailable item's highlight distinct from an enabled item's;
   - a disabled trigger at 0.4 opacity with no hover border.

   **The VoiceOver pass bar that stood here is superseded by D10** (operator): the voice brief no longer carries accessibility criteria, so step 7 keeps only its visual pass bar above.
8. **Generated declarations.** Run `npm run build-types`. `Menu.svelte.d.ts` and `index.d.ts` are generated, never hand-edited.
   Verify: `npm run check-types` exits 0.
9. **Doc row.** Update the Menu row at `docs/using-the-library.md:303` to cover groups, unavailable items with a reason, `currentLabel`, `disabled`, and controlled `value`.
   Verify: `npm run check-citations` exits 0.
10. **TOOLS.md gate drift (D2).**
    - Rewrite the "Required validation" block at `TOOLS.md:19-33` so it states the `check-coverage` chain as `package.json:14` defines it: five checks, adding `check-export-count`.
    - Add `scripts/check-issue-refs.test.sh` and `npm run check-issue-refs` (they need `GH_TOKEN`), as `gates.yml:106,111` runs them.
    - Also correct the CI sentence at `TOOLS.md:59-60`, which names only three gates, against the `gates.yml` step list.
    - Cite section names, not lines, for any cross-file reference.

    Verify: `npm run check-citations` exits 0, and a line-by-line comparison of the new block against `gates.yml`'s `run:` lines (`:51,58,65,73,95,106,111`) is recorded in the PR.
11. **Full gate set,** enumerated from `.github/workflows/gates.yml` and run from the root in CI order:
    1. `npm ci`
    2. `npm test --workspace apps/catalog`
    3. `npm run check-coverage` (five checks per `package.json:14`)
    4. `npm run check-types`
    5. `npm run check-citations`
    6. `GH_TOKEN=$(gh auth token) scripts/check-issue-refs.test.sh`
    7. `GH_TOKEN=$(gh auth token) npm run check-issue-refs`

    Verify: every one exits 0 (an exit of 2 counts as red), with the output recorded in the PR.

## Revision 5: added steps (after the reviewer's FAIL on `47d3e7c`)

Revision 4 added steps 12–20 here. Red-team then found 2 Criticals and 4 Majors in them, so revision 5 replaces them with steps 12–38. Steps 0–11 are unchanged and already built.

The reviewer's FAIL was for evidence that was never produced, not for the code:
- the step-7 VoiceOver checks were never observed (that requirement is now superseded by D10);
- the step-10 comparison was never recorded;
- two light-theme screenshots were missing.

Mutation tests confirmed the tests drive zag.

**Binding rulings, adopted as written:**
- **D4 (operator): superseded by D10.** D4 had the builder script VoiceOver through AppleScript.
- **D10 (operator).**
  - The voice brief no longer carries accessibility criteria: AC 1.7.2 and 1.8.8 are gone.
  - Built, green code stays as it is.
  - No more accessibility work is added.
  - The VoiceOver steps 24–35, and everything that existed only to serve them, are removed.
- **D11 (operator).** The bridge upgrade (D8) and the upward-opening check (steps 20a–21r) stay.
- **D12 (operator, standing rule).** Nothing new enters this plan without the operator's clearance: no requirement, check, criterion or surface. Any fix that would need something new stops and is flagged to the coordinator. It is not added.
- **D5 (operator).** The designer's G1 and G2 are in #223's scope.
  - **G1.** `.ui-menu__content` gets a `max-height` plus `overflow-y: auto`, sized from Ark's `--available-height` (`@zag-js/popper` `get-placement.mjs:109,140`). It is never a hard-coded height.
  - **G2.** When the current item is unavailable, the trigger's name is `${label}: ${shown}, unavailable`. If a reason exists, it is `${label}: ${shown}, unavailable: ${reason}`. The rule keys on `current?.unavailable`, not on whether the reason is empty.
- **Q7 (designer).** The fallback is `max-height: var(--available-height, 50vh)`.
  - `none` is rejected because it reintroduces unreachable items.
  - The 50vh literal gets a call-site comment citing `SetupProgress.svelte:428-430` for why `none` is no bound.
  - No harvest row.
- **D6 (operator).** Fix the stale comment at `gates.yml:60-63`.
- **D7 (operator).** Also fix the step `name:`, which omits `check-export-count` too. It is at `gates.yml:64` as measured on `47d3e7c`; the ruling cited `:62`. The required check is the job `gates / gates`, so the step name is not load-bearing.
- **Q1 is closed.** The plan-reviewer ruled "not a break" at the revision 3 gate.
- **Out of scope, already filed:** #225, #226, #227.

**Evidence.** Everything the steps produce goes under `pr-223-evidence/` in the session scratchpad and is attached to the PR. None of it is committed (Q6).

**Atomicity (red-team M3; workspace AGENTS.md non-negotiable 10).** Each step below has one action, one output and one verification.
- Steps 17–21 run once per theme, as separate steps with separate evidence: **dark first (17d, 18d, 19d, 20ad, 20d, 21d, 21rd), then light (the same sequence with `l`)**. The one-off bridge upgrade, U1–U7, runs before the first 20a.
**Stop rule.** Any step whose verification fails stops the build and goes to the named role. Nothing after it runs.

### Code

12. **A9b test (G2), red first.** Add a render to `Menu.test.js` where `value` is on an `unavailable` item with **no** `reason`. The trigger's accessible name must be `Voice: <label>, unavailable`, and opening the menu must show that item as `aria-checked="true"`.
    Verify: `cd apps/catalog && npx vitest run src/components/Menu.test.js -t A9b` is red. The trigger name comes out as `Voice: <label>`, because `Menu.svelte:113-114` gates on a non-empty reason. Record the output.
13. **G2 implementation.** Derive `triggerName` from `current?.unavailable`:
    - with a reason: `…, unavailable: ${reason}`;
    - without a reason: `…, unavailable`;
    - otherwise: `${label}: ${shown}`.

    `shown` may be `""`, so do not truth-test it.
    Verify: `npx vitest run src/components/Menu.test.js` is all green, including A9 and A9b.
14. **G1 in source (Q7).** Add `max-height: var(--available-height, 50vh); overflow-y: auto;` to `:global(.ui-menu__content)` (`Menu.svelte:240-248`). The comment at the declaration says three things:
    - zag sets `--available-height` at runtime;
    - `50vh` is the bound when zag has not set it;
    - `none` is not used, because it bounds nothing (`SetupProgress.svelte:428-430`).

    The fallback also satisfies `token-refs.test.js:22` ("the fallback is the contract").
    Verify: `npx vitest run src/token-refs.test.js src/contrast-guard.test.js` is green.
15. **Catalog example: current value unavailable with no reason (red-team C1).** Append an example to the `menu` entry in `apps/catalog/src/fixtures.js`:
    - the grouped items, with `value` set to the **first ElevenLabs voice id** from `voices.json`;
    - it is unavailable because `provider-status.json` has `elevenlabs` at `isReady: false`;
    - it has no reason because `services.json` has no `elevenlabs` entry. This is the same basis as step 6's m-E work.

    The fixture's declaration comment gains this example and its basis.
    Verify: `npm run check-catalog` exits 0.
16. **Generated declarations.** Run `npm run build-types`. G2 and G1 change no prop.
    Verify: `npm run check-types` exits 0.
14b. **Border-box the capped content (designer ruling, after step 17d stopped).** Steps 12–16 are built (`dcd4f49`). Run this step next, before 17d.
    - **Why.** Step 17d measured the content at 409px tall against a 399px `--available-height`, with its bottom at 570 in a 568px window. `.ui-menu__content` is content-box, so its 4+4px padding and 1+1px border sit outside `max-height`.
    - **Action.** Add `box-sizing: border-box` to `:global(.ui-menu__content)` (`Menu.svelte:248`).
    - Do not subtract padding and border in a `calc()`: that duplicates token values, which would then drift.
    - **Known side effect** (acceptable per the designer, but unmeasured until step 21b): `min-width: 200px` becomes 200px on the outside, where it was 210px.

    Verify: `cd apps/catalog && npx vitest run src/token-refs.test.js src/contrast-guard.test.js` is green.

### G1 in the running catalog (steps 17–21, run for dark then light)

Setup for every step:
- Run `cd apps/catalog && npm run dev:mcp`.
- The window is the designer's 568px catalog window. `tauri.conf.json:18` sets the outer height to 600; record the measured `innerHeight` in the evidence.
- Drive the app with the `mcp-steering` skill.
- Use the "Grouped by provider" example.
- Theme: dark is the default, light is `html[data-theme="light"]`.
- jsdom cannot prove layout, so these checks only count here.
- **Instrument precondition, checked first in every step 17–21.** The catalog window must be frontmost and visible.
  - Read `document.visibilityState` through the MCP bridge and record it in that step's evidence.
  - If it is not `'visible'`, run **Activate (D9)** below, then re-read. If it is still not `'visible'`, **abort the step as an instrument fault**: take no reading and do not route it as a product failure.
- **Activate (D9), the one procedure every frontmost or visibility precondition uses** (steps 17–21, 20a, 21r, 21b, and U4a's PID resolution).
  - Why visibility matters, from the builder's 17d run: a hidden window runs no `requestAnimationFrame`, so zag never positions the menu and `--available-height` stays empty.
  - **Identify the dev process (red-team C1, M1).**
    - The Cargo binary is named `app` (`apps/catalog/src-tauri/Cargo.toml:2`), and `tauri.conf.json` sets no `mainBinaryName`, so the dev binary is `target/debug/app`.
    - A second khaotik-ui worktree exists at `/Users/k/.treehouse/khaotik-ui-35a0af/2`, so the match must be anchored to **this** worktree.
    - **Why the earlier path anchor never matched (U4a's stop).** `tauri dev` starts the app with the bare argv `target/debug/app`, not an absolute path, from the cwd `/Users/k/.treehouse/khaotik-ui-35a0af/1/khaotik-ui/apps/catalog/src-tauri`. Its parent is `node …/khaotik-ui-35a0af/1/khaotik-ui/node_modules/.bin/tauri dev --features mcp-bridge`. The builder observed all of this.
    - **Resolution: anchor on the process's working directory.**
      ```sh
      WT_SRC=/Users/k/.treehouse/khaotik-ui-35a0af/1/khaotik-ui/apps/catalog/src-tauri
      DEV_PID=$(for p in $(pgrep -x app); do
        [ "$(lsof -a -d cwd -p "$p" -Fn 2>/dev/null | sed -n 's/^n//p')" = "$WT_SRC" ] && echo "$p"
      done)
      ```
      - `pgrep -x app` matches the process name exactly.
      - `lsof -a -d cwd -p <pid> -Fn` prints that process's cwd as an `n`-prefixed line.
      - Only a process whose cwd is exactly this worktree's `src-tauri` is kept, so a sibling worktree's `app` is excluded.
    - **Result.** `DEV_PID` must hold exactly one PID. Zero or several is an **instrument fault**.
    - **Evidence (a record only; D12 adds no new pass condition):**
      - `ps -o pid=,ppid=,args= -p "$DEV_PID"`;
      - the parent's argv, from `ps -o args= -p <ppid>`.
  - **A-1, only once U4 has passed.** Call Tauri MCP `manage_window` `focus`. The tool documents that `focus` requires `tauri-plugin-mcp-bridge` 0.13.0+.
  - **Installed-app probe, before A-2 (red-team M5).** List any installed signed catalog in a way that is safe when nothing matches:
    `find /Applications ~/Applications -maxdepth 2 -name '*.app' -exec sh -c 'defaults read "$1/Contents/Info" CFBundleIdentifier 2>/dev/null | grep -qx dev.loswf.khaotik-catalog && echo "$1"' _ {} \; 2>/dev/null`
    - **Spotlight probe, anywhere on disk:** `mdfind "kMDItemCFBundleIdentifier == 'dev.loswf.khaotik-catalog'"`.
      - Positive control, run first: `mdfind "kMDItemCFBundleIdentifier == 'com.apple.Safari'"` must print at least one path.
      - If the control prints nothing, Spotlight is not answering. Treat the probe as inconclusive and **skip A-2**.
    - If either probe prints anything, or the Spotlight probe is inconclusive, **skip A-2** and go straight to the fallback, so an installed app is never launched.
    - Record every probe's output, including an empty one.
  - **A-2, only if the probe printed nothing.** `osascript -e 'tell application id "dev.loswf.khaotik-catalog" to activate'`, where the bundle id is `tauri.conf.json:5`.
    - `tauri dev` runs a bare binary, not a `.app`, so LaunchServices may resolve the id elsewhere.
    - After A-2, if a process with this bundle id now exists whose PID is not `DEV_PID`, quit it with `osascript -e 'tell application id "dev.loswf.khaotik-catalog" to quit'` **only if** the probe was empty, meaning nothing installed was running before. Record the quit in the evidence.
  - **`open -a` is not used.** With no dev `.app`, it can only resolve to an installed `.app`, which is the wrong process.
  - **Check.** Activation succeeded only if both hold:
    - `osascript -e 'tell application "System Events" to unix id of first process whose frontmost is true'` equals `DEV_PID`;
    - the bridge reads `document.visibilityState === 'visible'`.
  - **Fallback (D9).** If A-1 and A-2 both fail the check, or A-2 was skipped, **stop and ask the operator to click the catalog window**. Then run the check again. Do not proceed on a failed check.
- **Every pass bar in 17–21 includes `rect.bottom ≤ innerHeight`** for the content element, in both themes, alongside `getBoundingClientRect().height ≤ --available-height`.

17. **Downward readout.** Open the menu with the trigger in its default position, then read these values from the content element:
    - `--available-height`, via `getComputedStyle`;
    - `getBoundingClientRect().height`;
    - `scrollHeight`, `clientHeight`;
    - `data-placement`.

    Output: `pr-223-evidence/g1/<theme>-down.json`.
    Verify:
    - `visibilityState` is `'visible'`;
    - `--available-height` is non-empty;
    - the height is at most its value;
    - the content's `rect.bottom` is at most `innerHeight`;
    - `scrollHeight > clientHeight`.

    If `--available-height` is empty, stop and route to the designer. `fitViewport: true` (`get-placement.mjs:19,80`) is the positioning option to propose. Never a hard-coded height.
18. **Downward pointer reach.** Scroll the content to the end, hover the last item, and click it. The last item is the **final KittenTTS voice**. Groups render in first-appearance order (ElevenLabs, OpenAI, KittenTTS, as the builder observed), so KittenTTS comes last. It is unavailable (`kittentts` is `isReady: false`).
    Output: `pr-223-evidence/g1/<theme>-down-pointer.png` plus a readout.
    Verify:
    - `visibilityState` is `'visible'`;
    - the item is inside the content's visible rect;
    - the content's `rect.bottom` is at most `innerHeight`;
    - it carries `data-highlighted`;
    - the menu is still open (the item is unavailable).
19. **Keyboard reach to the last item (red-team m1).**
    - **Correction to revision 5.** The earlier citation, `menu.machine.mjs:646-652`, is `scrollToHighlightedItem`, not a wrap. zag's in-menu ArrowUp does **not** wrap by default:
      - the content keydown sends `ARROW_UP` with no `loop` (`menu.connect.mjs:342`);
      - `highlightPrevItem` falls back to the `loopFocus` prop (`menu.machine.mjs:787-793`, `menu.dom.mjs:57-60`);
      - `loopFocus` defaults to `false` (`menu.machine.mjs:37`), and Menu does not pass it.
    - The path that does reach the last item by keyboard is **ArrowUp on the closed trigger**. It opens the menu and runs `highlightLastItem` (`menu.connect.mjs:255`, `menu.machine.mjs:388-391`). Scrolling it into view is `scrollToHighlightedItem` (`menu.machine.mjs:646-652`), which is unverified until observed here.
    - Whether Menu should enable `loopFocus` is outside this plan. That is the architect's call, and this step does not assume it.

    Action: focus the closed trigger and press ArrowUp.
    Output: `pr-223-evidence/g1/<theme>-last-by-key.json`, holding the active descendant id and the item and content rects.
    Verify:
    - `visibilityState` is `'visible'`;
    - `aria-activedescendant` is the last item's id, the final KittenTTS voice (see step 18);
    - the last item's rect is inside the content's visible rect;
    - the content's `rect.bottom` is at most `innerHeight`.

    If either fails, stop and route to the **architect** (keyboard behaviour, C1/C2).
### Bridge upgrade (D8): steps U1–U7, run before 20a

**Why this block exists.** Step 20a stopped on an instrument fault. The catalog pins `tauri-plugin-mcp-bridge = { version = "0.2" }` (`apps/catalog/src-tauri/Cargo.toml:38`), which resolved to 0.2.2 (`Cargo.lock:3834-3835`). That version has neither `resize_window` nor `get_window_info`, and `driver_session` asks for 0.13. D8 puts the upgrade in this PR.

**What exists today. All of it must survive the upgrade.**
- **Feature gate.** The dependency is `optional = true` behind the `mcp-bridge` feature. The feature is at `Cargo.toml:29`, with its comment at `:25-28`, and the dependency is at `:38`. `[features]` (`:24`) has no `default` entry. Only `npm run dev:mcp` enables the feature (`apps/catalog/package.json:8`, `tauri dev --features mcp-bridge`).
- **Compile gate.** The plugin is registered behind `#[cfg(all(debug_assertions, feature = "mcp-bridge"))]` (`src-tauri/src/lib.rs:13`).
- **Bind address.** `.bind_address("127.0.0.1")` (`lib.rs:17`). The plugin defaults to `0.0.0.0`, and the socket executes arbitrary JavaScript.
- **Capabilities.** `capabilities/default.json` grants only `core:default`.
- **Binary name.** The binary is `app` (`Cargo.toml:2`), and `tauri.conf.json` has no `mainBinaryName` (red-team C1).
- **Tauri version.** Tauri resolves to **2.11.5** (`Cargo.lock:3684-3685`); the manifest asks for `2.11.3` (`Cargo.toml:35`). MSRV is not a concern: the crate's `rust-version` is 1.70, per red-team m3.
- **mcp-steering skill.** It says "Do not relax either gate or that bind address" (`.claude/skills/mcp-steering/SKILL.md:66-70`).

**Architect ruling Q11 (binding, adopted as written).**
- **How the permission is granted.** Grant `mcp-bridge:default` **at runtime** with `app.add_capability(...)`, to the **main window only**. Do this in `setup`, inside a block that carries the same `#[cfg(all(debug_assertions, feature = "mcp-bridge"))]` as the plugin registration (`lib.rs:13`).
- **No manifest change is needed.** `add_capability` is behind Tauri's `dynamic-acl` feature (`tauri-2.11.5/src/lib.rs:813`). That feature is in Tauri's defaults (`tauri-2.11.5/Cargo.toml:84-88`), and the catalog does not disable defaults (`apps/catalog/src-tauri/Cargo.toml:35`).
- **No capability file changes.** `capabilities/default.json` keeps `core:default` only. Do **not** follow the README's instruction to add the permission there (README.md:243-248). Do **not** create a new capability file.
- **Release builds reference nothing from the bridge.** No `mcp-bridge:*` identifier may appear in any file or code that a release build compiles.
- **Keep the bind address.** Keep `.bind_address("127.0.0.1")` (`lib.rs:17`).
- **Verification.** Three checks, carried below as U4, U5(e) and U3's grep:
  - a debug build with the feature on can resize the window through the bridge;
  - a release `tauri build` succeeds;
  - `grep -rn "mcp-bridge:"` over `capabilities/` and the release-compiled sources finds nothing outside the cfg-gated block.

**Pattern (red-team m1).** Every probe for the bridge in this block uses the regex `mcp[-_]bridge`.

U1. **Read the upgrade path.** Read only; nothing changes in this step.
    - Sources: the plugin's changelog or release notes from 0.2 through 0.13, from its crate page or repository, and its README at 0.13.
    - Answer each question below with a citation:
      - (a) Are there breaking changes to `Builder`? Red-team confirmed that `bind_address` still exists; record its exact signature.
      - (b) What permission identifier is granted, and is it `mcp-bridge:default` (the name Q11 uses)?
      - (c) Is there a companion npm guest package? Red-team confirmed it is optional, and this plan does not add it.
      - (d) Does 0.13 require a newer Tauri than 2.11.5 or a newer Rust than the toolchain in use?
      - (e) Does 0.13 require any other registration code?
    - Output: `pr-223-evidence/bridge/upgrade-notes.md`.
    - Verify: all five questions are answered with a source.
      - If (a) shows the explicit `127.0.0.1` bind cannot be kept, stop and route to the **architect**.
      - Likewise if (d) needs a Tauri upgrade, or (e) needs anything that would reach a release build.
      - A required permission is **not** a stop: Q11 answers it. If (b) names a permission other than `mcp-bridge:default`, stop and route to the **architect**, because the ruling names that identifier.
U2 is split into five atomic steps, U2a–U2e (plan-reviewer condition 2; non-negotiable 10).

U2a. **Supply-chain check, before anything changes (red-team M4).**
    - Action: record the crates.io owners of `tauri-plugin-mcp-bridge` and the `published_by` of versions 0.2.2 and 0.13.`<x>` (the version U1 recorded). Use `cargo owner --list tauri-plugin-mcp-bridge` or `https://crates.io/api/v1/crates/tauri-plugin-mcp-bridge/owners` together with `…/versions`.
    - Output: `pr-223-evidence/bridge/owners.txt`.
    - Verify: the owner and publisher are the same for both versions. Stop for the **operator** if they differ, or if the network is unavailable (record it as unverified).
U2b. **Snapshot the baseline.**
    - Action: copy `Cargo.lock` to `pr-223-evidence/bridge/Cargo.lock.before`. Capture `cargo tree --manifest-path apps/catalog/src-tauri/Cargo.toml -e normal --prefix none` (default features, the release graph) to `pr-223-evidence/bridge/release-graph.before.txt`.
    - Output: those two files.
    - Verify: both files are non-empty, and the graph contains `tauri v2.11.5`. That match is the positive control that the capture read the real graph.
U2c. **Bump the manifest and the lock.**
    - Action: set `tauri-plugin-mcp-bridge = { version = "0.13", optional = true }` in `Cargo.toml`, then run `cargo update --manifest-path apps/catalog/src-tauri/Cargo.toml -p tauri-plugin-mcp-bridge --precise 0.13.<x>` (red-team M3). The lock changes only through Cargo.
    - Output: `pr-223-evidence/bridge/lock-diff.txt`, the diff of `Cargo.lock.before` against the new `Cargo.lock`.
    - Verify: `cargo tree --manifest-path apps/catalog/src-tauri/Cargo.toml -e normal --features mcp-bridge -i tauri-plugin-mcp-bridge` prints `tauri-plugin-mcp-bridge v0.13.<x>` as its first line.
U2d. **The lock's provenance.**
    - Action: extract the `tauri-plugin-mcp-bridge` entry from the lock diff.
    - Output: `pr-223-evidence/bridge/lock-entry.txt`.
    - Verify: the entry's `source` is `registry+https://github.com/rust-lang/crates.io-index`, and its `checksum` differs from the one in `Cargo.lock.before`.
U2e. **The release graph is unchanged.**
    - Action: capture the same `cargo tree … -e normal --prefix none` (default features) to `pr-223-evidence/bridge/release-graph.after.txt`.
    - Output: `diff release-graph.before.txt release-graph.after.txt`.
    - Verify: the diff is empty. Any line that changes is a crate on the release path. **Stop and route to the architect** (red-team M3).
U3. **Registration and runtime grant, per architect Q11 ruling.**
    - Action. Edit `apps/catalog/src-tauri/src/lib.rs` only:
      - Keep the plugin registration and its `#[cfg(all(debug_assertions, feature = "mcp-bridge"))]` block (`:13`), including `.bind_address("127.0.0.1")` (`:17`). Adjust the `Builder` call only as far as U1(a) requires.
      - In `setup`, inside a block carrying the **same** `#[cfg(...)]`, call `app.add_capability(...)` granting `mcp-bridge:default` to the `main` window only.
      - Make **no** edit to `capabilities/default.json`, create **no** new capability file, and make **no** `Cargo.toml` feature change for `dynamic-acl`.
    - Output: the diff.
    - Verify, three commands:
      - `cargo check --manifest-path apps/catalog/src-tauri/Cargo.toml --features mcp-bridge` passes.
      - `cargo check --manifest-path apps/catalog/src-tauri/Cargo.toml` (default features, the release set) passes.
      - **The release-reference grep (plan-reviewer condition 1).**
        - It matches the **quoted permission identifier** only, so `tauri_plugin_mcp_bridge::Builder` at `lib.rs:16` does not match: `grep -rn '"mcp-bridge:' apps/catalog/src-tauri/capabilities apps/catalog/src-tauri/tauri.conf.json apps/catalog/src-tauri/src`.
        - **The bar:** there is at least one hit, and **every** hit is in `src/lib.rs` inside a cfg-gated block. How many lines there are does not matter, because rustfmt may put the string on a line of its own.
        - **How the builder shows a hit is inside a gated block:**
          1. List the gates with `grep -n 'cfg(all(debug_assertions, feature = "mcp-bridge"))' apps/catalog/src-tauri/src/lib.rs`. Expect two after U3: the registration and the `setup` grant.
          2. For each gate at line `G`, find the line `E` of the closing brace of the block that immediately follows it. The first `{` after `G` opens that block; count braces until they balance. A small `awk` can do this and print `G-E`.
          3. Record each `G-E` range in the evidence.
          4. Each grep hit's line number `H` must satisfy `G < H < E` for some range.
        - Any hit in `capabilities/` or `tauri.conf.json`, or outside every range, is a FAIL. Zero hits is also a FAIL: the grant is missing.
U4 is split into six atomic steps, U4a–U4f (plan-reviewer condition 2). All six run against one `npm run dev:mcp` session started in U4a. Evidence goes to `pr-223-evidence/bridge/`.

U4a. **Start the app and resolve its PID.**
    - Action: run `cd apps/catalog && npm run dev:mcp`, then resolve `DEV_PID` as described in Activate (D9).
    - Output: `pid.txt`, holding `DEV_PID` and its `ps -o pid=,args=` line.
    - Verify: `test -n "$DEV_PID"` succeeds, and exactly one PID matched this worktree's `target/debug/app`. An empty or multiple match is an instrument fault.
U4b. **The session connects to the new bridge.**
    - Action: `driver_session`.
    - Output: `session.txt`.
    - Verify: the session connects and shows no "Update tauri-plugin-mcp-bridge" warning.
U4c. **Window info.**
    - Action: `manage_window` `info`.
    - Output: `info.json`.
    - Verify: it returns a width and a height. Record both as the original size.
U4d. **Resize round trip (Q11's first verification).**
    - Action: `manage_window` `resize` to the original width and a height of 500, then read `innerHeight` through the bridge. Then `resize` back to the original size and read `innerHeight` again.
    - Output: `resize.json`, holding both `innerHeight` readings.
    - Verify: the first reading is smaller than the original `innerHeight`, and the second equals it within ±1px.
U4e. **Focus is available (A-1's precondition).**
    - Action: `manage_window` `focus`.
    - Output: `focus.txt`.
    - Verify: the call returns without a version error.
U4f. **The socket binds to loopback only (red-team M2).**
    - Action: capture `lsof -nP -a -p "$DEV_PID" -iTCP -sTCP:LISTEN`. As a positive control, capture the same command against the Vite dev server's PID, which `dev:mcp` also starts.
    - Output: `lsof.txt`, holding both captures.
    - Verify:
      - `DEV_PID` is non-empty. An empty PID is an instrument fault, never a pass.
      - `DEV_PID`'s capture has at least one `127.0.0.1:<port>` LISTEN row, and no `*:` or `0.0.0.0:` row.
      - The control capture shows at least one LISTEN row. That proves the probe reports listeners at all.
U5. **Pass bar: a release build does not include the bridge (red-team C1, m2).**
    - Action: run `cd apps/catalog && npx tauri build --no-bundle`. This is an unsigned local release build with the default features, the same set the release uses.
    - Output: `pr-223-evidence/bridge/release-exclusion.txt`.
    - Verify, all of the following:
      - **(a) The binary exists.** The release binary's name is **unverified**. Observe it after the build: list `apps/catalog/src-tauri/target/release/` and record the executable, expected to be `app` per `Cargo.toml:2`. Call it `$REL`. `test -f "$REL"` must succeed, and `file "$REL"` must report `Mach-O`. **A missing file or a non-Mach-O file is a FAIL**; a missing file is never read as a zero.
      - **(b) Not in the release graph.** `cargo tree --manifest-path apps/catalog/src-tauri/Cargo.toml -e normal -i tauri-plugin-mcp-bridge`, with default features, run after U2.
        - **Expected when absent** (the planner measured this on `cb3ce69` with `--offline`): it prints ``error: package ID specification `tauri-plugin-mcp-bridge` did not match any packages`` to stderr and **exits 101**.
        - **The bar:** that exact message, plus exit code 101.
        - An exit of 0, or any tree output, means the package is in the release graph, which is a FAIL.
        - **Positive control:** the same command with `--features mcp-bridge` prints `tauri-plugin-mcp-bridge v0.13.<x>` as its first line. The planner observed the same on 0.2.2, where it printed `v0.2.2`.
      - **(c) No release config enables the feature.** Each of these prints nothing:
        - `grep -nE 'mcp[-_]bridge' .github/workflows/catalog-release.yml apps/catalog/scripts/release.sh`;
        - `node -p "JSON.stringify(require('./apps/catalog/src-tauri/tauri.conf.json').build?.features ?? null)"` must print `null` or an array without `mcp-bridge`;
        - the Cargo `[features]` table has no `default` entry that lists `mcp-bridge`: `awk '/^\[features\]/{f=1;next}/^\[/{f=0}f&&/^default/' apps/catalog/src-tauri/Cargo.toml | grep -E 'mcp[-_]bridge'`.
      - **(d) No symbols in the binary.** `strings "$REL" | grep -ciE 'mcp[-_]bridge'` prints `0`.
        - **Positive control:** the same grep on the debug binary from U4, built from **this tree** with the feature on (`/Users/k/.treehouse/khaotik-ui-35a0af/1/khaotik-ui/apps/catalog/src-tauri/target/debug/app`), prints ≥ 1. First check that it exists and is Mach-O, as in (a).
      - **(e) The release build succeeded.** `tauri build` exited 0. This is Q11's second verification.
    - This is an unsigned local build. The signed CI build is tied to it by (c). See Q10.
U6. **Catalog test suite.**
    - Verify: `npm test --workspace apps/catalog` is green.
U7. **Docs that state the plugin's version or cite moved lines.**
    - Action:
      - Grep `apps/catalog/AGENTS.md` and `.claude/skills/mcp-steering/SKILL.md` for `mcp[-_]bridge` version statements, and for the citations `Cargo.toml:20-25`, `lib.rs:13-20` and `lib.rs:17`.
      - Update any version statement.
      - Re-point every citation to the post-U3 lines. `SKILL.md:66-70` cites `Cargo.toml:20-25`, but the feature block is at `:25-29` and the dependency at `:38`, so that citation is already stale.
      - Where `SKILL.md` describes the gates, add the runtime `add_capability` grant, so the next reader does not follow the README into `default.json`.
    - Output: the diff, or "no mention" for each file.
    - Verify: every `Cargo.toml` and `lib.rs` citation in those two files resolves to the line it describes. This is a manual read recorded in the evidence, because `check-citations` does not scan `.claude/` or `apps/`.

**How the trigger gets low (amended after the step-20d stop on `8021635`).**
- Scrolling cannot do it. The builder measured `div.canvas__content`, the only scroll container above the trigger, at scrollHeight = clientHeight = 469. The trigger's bottom was at 157, and the step needs it at 448 or more.
- The canvas also cannot scroll the trigger downward:
  - `.canvas__content` is a top-anchored flex column (`Canvas.svelte:156-164`);
  - `FixtureView` renders an example from `props` alone (`Canvas.svelte:108-110`), so no fixture can add layout above the Menu.
- A "Menu placed low" example would need a catalog-shell change. That is out of scope and not proposed.
- **Method: shrink the window from below.** Use Tauri MCP `manage_window` `resize`, which sets the window size in logical pixels. The document is top-anchored, so the trigger keeps its position and only the space below it shrinks.
- That position claim is **measured, not assumed**, in step 20a.
- No fixture or catalog file changes; nothing is added to files-to-touch.
20a. **Shrink the window (once per theme).**
    - **Action.** Record `manage_window` `info` (the original size) and the trigger's rect. Resize to the original width and a height reduced by `innerHeight − (trigger.bottom + 100)`, so that about 100px remains below the trigger.
    - **Output.** `pr-223-evidence/g1/<theme>-resize.json`, holding the original size, the new size, the trigger rect before and after, and `innerHeight` before and after.
    - **Verify:**
      - `visibilityState` is `'visible'`;
      - the trigger's `top` and `bottom` are unchanged within ±1px;
      - `trigger.bottom ≥ innerHeight − 120`;
      - `trigger.bottom < innerHeight`, so the trigger is still on screen.

      If the trigger moved, **abort as an instrument fault** (the method's premise failed) and report to the coordinator; it is not a product failure.
20. **Upward readout and oscillation (red-team M1).** In the step-20a window, open the menu. Sample `data-placement` and the rect 10 times over 1s.
    Output: `pr-223-evidence/g1/<theme>-up.json`.
    Verify:
    - `visibilityState` is `'visible'`;
    - `data-placement` starts with `top`;
    - all 10 samples are identical, so there is no flip oscillation;
    - `--available-height` is non-empty;
    - the height is at most its value;
    - the content's `rect.top ≥ 0` and `rect.bottom ≤ innerHeight`.

    On oscillation, or on a failure of any check above, stop and route to the **designer** (G1 is the designer's ruling, and so is the positioning-option fallback in step 17).
21. **Upward pointer reach.** In the step-20 state, scroll the content to the end, then hover and click the last item (the final KittenTTS voice).
    Output: `pr-223-evidence/g1/<theme>-up-pointer.png` plus a readout.
    Verify: the same as step 18, including `visibilityState` and `rect.bottom ≤ innerHeight`.
21r. **Restore the window (once per theme, after 21).**
    - **Action.** Close the menu, then `manage_window` `resize` back to the original size recorded in 20a.
    - **Output.** `pr-223-evidence/g1/<theme>-restore.json`.
    - **Verify:** `innerHeight` and the trigger rect equal their 20a "before" values, within ±1px.

    Without this step, the light run (17l onward) and step 21b would measure in the shrunken window.
21b. **ViewportPicker min-width after border-box (step 14b side effect).** Run once, in the dark default theme, with the same visibility precondition as 17–21.
    - **Action.** Open the app bar's Size menu (ViewportPicker) on a framing section.
    - **Output.** `pr-223-evidence/g1/viewportpicker-min-width.png`, plus a readout of the content's `getBoundingClientRect().width`, `scrollWidth` and `clientWidth`.
    - **Verify:**
      - the width is at least 200;
      - `scrollWidth ≤ clientWidth`, so no size label is clipped;
      - the screenshot shows the labels fully legible.

    On failure, stop and route to the **designer** (the ruling behind step 14b).

### Light-theme screenshots the reviewer asked for

22. **Disabled trigger on hover, light.** Open the "Disabled" example and move the pointer over the trigger.
    Output: `pr-223-evidence/screens/light-disabled-hover.png`.
    Verify: the image shows 0.4 opacity and no hover border. The readout's computed `border-color` equals the non-hover value.
23. **Grouped menu open, light.** Open "Grouped by provider".
    Output: `pr-223-evidence/screens/light-grouped-open.png`.
    Verify: the image shows headings, marks, the separator, the unavailable items, and the "stopped" reason line.

### VoiceOver: removed by D10

Steps 24–35 are **removed** (D10, operator).

- The voice brief no longer carries accessibility criteria: AC 1.7.2 and 1.8.8 are gone.
- D10 therefore supersedes D4, which scripted VoiceOver.
- Also removed, because they existed only to serve those steps:
  - the AppleScript preconditions;
  - the keystroke precondition;
  - the hint probe;
  - the harness and its self-test;
  - checks 1–7;
  - the transcript gate, with its owner table.
- The step numbers 24–35 are not reused.
- Built code and tests stay as they are, under D10: C1, G2, A1–A12, A9b, and the step-15 example.

### Gate drift (D6, D7) and the step-10 record

36. **Edit `gates.yml`.**
    - Rewrite the comment at `:60-63` so it names the five checks `package.json:14` chains: catalog, taxonomy, consumer, compile, export-count.
    - Rewrite the step name at `:64` so it adds export-count.

    Output: the diff. Record the post-edit line numbers of both in the PR.
    Verify (red-team m3), two commands:
    - `git diff -U0 -- .github/workflows/gates.yml | grep '^[+-][^+-]' | grep -v '^[+-]\s*#' | grep -v '^[+-]\s*- name: Gate — catalog coverage'` prints nothing. The only non-comment change allowed is the D7 step-name line, excluded by name.
    - `git diff -U0 -- .github/workflows/gates.yml | grep -c '^[+-]\s*- name:'` prints `2`: one line removed and one added.
37. **Write the step-10 comparison**, after step 36 so it reflects the final files. The table has:
    - one row per `gates.yml` `run:` line (`:51, 58, 65, 73, 95, 106, 111` as of `47d3e7c`; re-read after step 36 and cite the post-edit numbers);
    - for each, the matching line in TOOLS.md's "Required validation" block, and match or mismatch;
    - one row comparing the `check-coverage` chain with `package.json:14`;
    - one row comparing the `gates.yml` comment and step name with the same chain.

    Output: `pr-223-evidence/gates-vs-tools.md`.
    Verify: zero mismatch rows.

### Close

38. **Full gate set.** Run step 11's seven commands in the same order.
    Verify: all seven exit 0. Record the output in the PR. Evidence from steps 17–37 is attached to the PR.

## Files to touch

| File | Change |
|---|---|
| `components/svelte/Menu.svelte` | props, markup, styles; in revision 5, the G1 content cap and the G2 trigger name |
| `components/svelte/Menu.svelte.d.ts`, `components/svelte/index.d.ts` | generated only |
| `apps/catalog/src/components/Menu.test.js` | new; A9b in revision 5 |
| `apps/catalog/src/contrast.test.js` | adds T1 |
| `apps/catalog/src/fixtures.js` | Menu examples; the no-reason current-value example in revision 5 (step 15) |
| `apps/catalog/src/components/shell/ViewportPicker.svelte` | comment only |
| `apps/catalog/src/components/duplicate-string-keys.test.js` | comment only |
| `docs/using-the-library.md` | Menu row |
| `TOOLS.md` | D2 |
| `.github/workflows/gates.yml` | revision 5: the comment at `:60-63` (D6) and the step name at `:64` (D7) |
| `docs/plans/menu-groups-disabled-current.md` | this plan |
| `apps/catalog/src-tauri/Cargo.toml` | D8: `tauri-plugin-mcp-bridge` 0.2 → 0.13, still optional (U2) |
| `apps/catalog/src-tauri/Cargo.lock` | D8: updated by `cargo update -p`, never by hand (U2) |
| `apps/catalog/src-tauri/src/lib.rs` | D8, Q11: a cfg-gated `add_capability` grant of `mcp-bridge:default` to `main` in `setup`, plus any `Builder` change U1(a) requires. The gates and the 127.0.0.1 bind stay (U3). |
| `apps/catalog/src-tauri/capabilities/*` | **not touched** (Q11: `default.json` keeps `core:default` only; no new file) |
| `apps/catalog/AGENTS.md`, `.claude/skills/mcp-steering/SKILL.md` | D8: only if they state the version or cite moved lines (U7) |

**Not touched:**
- `contrast-allow.json`
- tokens
- `index.js`
- ViewportPicker's behaviour
- release and version files (D1 is outside the builder's steps)
- #225, #226, #227

## Findings

- **F1** (TOOLS.md gate drift) is fixed at step 10 (D2). `gates.yml` is fixed at step 36 (D6, D7).
- **F2.** No captured `route_options` payload exists. The fixture comment records this. An honest routing example needs a khaos-manager#364 capture in `scripts/fetch-*.sh`, which is outside this plan.

## Open questions

- **Q6 (reviewer's call).** Evidence is attached to the PR, not committed. The reviewer decides whether committing it is required for a resolvable verdict.
- **Q10 (reviewer's call).** U5 proves release exclusion on an **unsigned** local `tauri build --no-bundle` with default features, and it ties that build to the signed CI build through the release scripts' feature flags (U5 b). The reviewer decides whether that is sufficient, or whether a CI-side check is required in the signed build itself.
- **Q11: closed by the architect.** The grant happens at runtime through `add_capability` in a cfg-gated `setup` block; see U3.

**Closed:**
- **Q1:** the plan-reviewer ruled "not a break" at revision 3.
- **Q7:** the designer chose the `50vh` fallback.
- **Q8:** D7 applies.
- **Q2, Q4:** closed by the designer. Q3 stands as the designer's spec.
- **Q5:** closed by D3.
- **R1:** closed by C1.
- **Q9:** removed with steps 24–35 (D10).
