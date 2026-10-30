---
name: svelte
description: >
  Write and review Svelte 5 in khaotik-ui — runes ($props/$state/$derived/$effect),
  .svelte.js rune modules, Ark UI wrapping and :global class forwarding, semantic
  token discipline, the D52 accessibility encoding, and the catalog's vitest setup.
  Use for any .svelte or .svelte.js file in this repo.
---

# Svelte 5 in khaotik-ui

This repo is a hand-authored component library: `components/svelte/` holds the
atoms and compositions, `tokens/` holds the design tokens, and `apps/catalog/`
is the Tauri playtest app and the library's only component surface (D61). There
is no generator (`AGENTS.md:8-12`) — what you write is the artifact.

Svelte 5 runes only. No SvelteKit (`apps/catalog/AGENTS.md:11-12`). Ark UI for
primitives; **no React** (`AGENTS.md:35`).

## The four gotchas, each of which cost a rebuild

These are recorded at `apps/catalog/AGENTS.md:118-128`. They are not style
preferences; every one of them shipped a broken build first.

**1. Dynamic components go through `{@const}`.** `<svelte:component>` is
deprecated and a bare lowercase `<selected.component />` parses as an HTML
element, silently rendering nothing. Bind the capitalised local first:

```svelte
{#if selected?.component}
  {@const Component = selected.component}
  {#if active}<Component {...active.props} />{/if}
{/if}
```

That is `apps/catalog/src/components/shell/Canvas.svelte:32-34` verbatim — the
only dynamic-component site in the repo, so copy it rather than reinventing it.

**2. `class:` directives are not valid on components.** They work on elements
only. `components/svelte/SelectableRow.svelte:12` uses `class:selected` legally
because the target is a real `<button>`. On a component — including every Ark UI
component — write `class={cond ? 'name' : ''}` instead. The compiler's complaint
here is terse and easy to misread as something else.

**3. Classes handed to an Ark UI component are forwarded to the rendered
element, so Svelte's scoper sees them as unused and drops the styles.** Style
them `:global(.class)`. Both wrappers carry the warning in the markup so the
next reader does not rediscover it: `components/svelte/Menu.svelte:35-37` and
`components/svelte/SegmentedControl.svelte:30-32`. Every rule in those two
`<style>` blocks is `:global` for exactly this reason — e.g.
`components/svelte/Menu.svelte:59` and
`components/svelte/SegmentedControl.svelte:51`.

**4. Props-derived values are `$derived`, never plain `const`.** A plain `const`
captures the value once at component init and never updates.
`components/svelte/Menu.svelte:31` is the pattern:

```js
const current = $derived(items.find((i) => i.value === value))
```

`components/svelte/Icon.svelte:10` does the same for a computed class string.
Neither would track its prop as a plain `const`.

## The worked example of gotcha #4

`components/svelte/EditableField.svelte` used to carry this, and the compiler
said so on every build — `state_referenced_locally`: *"This reference only
captures the initial value of `value`."*

```js
let { value = '', label = '', ... } = $props()

let isEditing = $state(false)
let editValue = $state(value)                    // ← warned

// keep the staged value in sync with the prop while not editing
$effect(() => {
  if (!isEditing) editValue = value
})
```

`value` is a prop, so it is reactive; reading it in a `$state` initialiser reads
it exactly once, at init. If the parent later passed a new `value`, `editValue`
still held the old one — so the author papered over it with the `$effect`. That
masked the symptom and left two mechanisms owning one value, plus a warning on
every build.

**The fix was to delete both, not to reach for `$derived`.** Look at who reads
the buffer: `editValue` is bound only by the textarea, the textarea renders only
under `{#if isEditing}`, and `startEdit()` is the only way in and already
re-seeds from the current prop. So the initialiser and the effect were both dead
weight around a buffer that just needed to start empty:

```js
let isEditing = $state(false)
let editValue = $state('')       // seeded in startEdit(), nowhere else
```

The lesson generalises past the rune rules: when a `$effect` exists to keep two
variables agreeing, ask what actually reads the second one. Often the answer is
"one place, which already sets it," and the effect is guarding nothing.

`$derived` is still the usual answer when the value is a *projection* of props
(`Menu.svelte:31`, `Icon.svelte:10`). It is the wrong answer for a staged edit
buffer, which must be independently mutable while editing.

Behaviour is locked by `apps/catalog/src/components/EditableField.test.js` — in
particular a test that changes the prop after mount and asserts the textarea
seeds from the new value, which is the job the removed `$effect` appeared to be
doing.

When you see `state_referenced_locally`, the answer is `$derived` or a narrower
buffer — never an `$effect` that copies one variable into another.

## `.svelte.js` — when the extension is the point

Runes are compiler magic. A plain `.js` file cannot use them; a `.svelte.js`
file is put through the Svelte compiler and can. Reach for it when reactive
state must be **shared across components** rather than owned by one.

`apps/catalog/src/lib/brand-view.svelte.js` declares its state at module scope
so the four brand views share one copy-to-clipboard state rather than each
keeping its own.

If the state belongs to one component, keep it in that component. Module-level
`$state` is a singleton for the whole page; that is a design decision, not a
convenience.

## Wrapping Ark UI: adopt, dress, never re-implement

The house rule is in the header comment of every wrapper: *"adopted, not
authored"* (`components/svelte/Menu.svelte:2-9`,
`components/svelte/SegmentedControl.svelte:2-10`). The primitive owns behaviour
and ARIA — open/close, focus trap and restore, Escape, outside-click, arrow-key
roving, typeahead, radio semantics, the hidden inputs, the moving indicator. We
own tokens and transitions and nothing else.

Consequences to hold to:

- **Style from the primitive's state attributes, not your own flags.**
  `components/svelte/Menu.svelte:92` rotates the caret off
  `[data-state='open']`; `:119` highlights off `[data-highlighted]` so the
  highlight follows keyboard roving as well as the pointer; `:124` and
  `components/svelte/SegmentedControl.svelte:87` read `[data-state='checked']`.
  A local `selected` boolean would drift from the machine.
- **Do not reach for the wrong primitive.**
  `components/svelte/SegmentedControl.svelte:7-10` explains why Segment Group
  and not Tabs: `TabTrigger` emits `aria-controls` at a `TabContent`, and with
  no panel that reference dangles.
- **Focus may land somewhere invisible.**
  `components/svelte/SegmentedControl.svelte:92-93` styles
  `:has(:focus-visible)` because focus lands on the item's hidden input.
- **Label the control, not just its members.** Both wrappers take a `label`
  prop naming the axis being chosen (`Menu.svelte:23-25`,
  `SegmentedControl.svelte:21-23`); `Menu.svelte:38` composes it with the
  current value into the trigger's `aria-label`.

Hand-authored components follow the **D52 encoding** instead (`AGENTS.md:33-34`,
`apps/catalog/AGENTS.md:59-68`): a plain `div` (never `article`), a stretched
`<button aria-label="<name>">` carrying the name, visual text marked
`aria-hidden="true"`, no `<title>`. `components/svelte/SelectableRow.svelte:12`
is the button; `:20`, `:24` and `:29` are the `aria-hidden` inner text.
`components/svelte/Icon.svelte:13` renders `aria-hidden="true"` because the
surrounding control carries the name. Where the a11y linter objects to the
hidden text, mark it `<!-- svelte-ignore a11y_hidden -->` — that is the
deliberate tradeoff, not a lint accident.

## Semantic tokens, always

Components reference **semantic** tokens so they flip with the theme; primitive
tokens are mode-invariant and belong to the token layer only
(`apps/catalog/AGENTS.md:48-52`). Dark is the default: `tokens/tokens.css:166-167`
defines `--surface-raised: var(--warm-800)` / `--text-primary: var(--warm-50)`
on `:root`, and `:229-230` redefines the same names under
`html[data-theme="light"]`. Write `var(--surface-raised)`; never `var(--warm-800)`,
and never a literal hex.

The same discipline covers spacing, radii and type: `var(--spacing-md)`,
`var(--radius-sm)`, `var(--body-md-size)`, `var(--caption-size)` — see
`components/svelte/SelectableRow.svelte:34-47` for a rule block that reaches for
nothing raw. StatusTone is seven-way (`AGENTS.md:30-31`) via `--tone-*`, defined
at `tokens/tokens-extra.css:25-31`.

Two things are permitted and appear throughout: `color-mix(in oklab,
var(--text-primary) 8%, transparent)` for hover/selected washes
(`components/svelte/SelectableRow.svelte:51`, `Menu.svelte:120`), and small
pixel geometry that no token names — `2px` indicator insets, `22px` icon
buttons. `apps/catalog/src/components/shell/shell-type.test.js:5-19` documents
the one standing exemption: the kit names **no** icon size, so `.ph` rules are
sized in `rem`, and the exemption is narrow on purpose so the gap stays visible.

Never hand-edit `tokens/tokens.css` — it is generated from `tokens.json` by
`tokens/build-tokens.py` (`AGENTS.md:17`).

## Testing

`apps/catalog` is the only test surface — the repo root has no `test` script.
Vitest + `@testing-library/svelte`, jsdom.

```bash
cd apps/catalog
npm test                              # whole suite
npx vitest run src/components/StatusPill.test.js
npx vitest run -t "renders the tone"
```

Three quirks, from `apps/catalog/AGENTS.md:130-137`:

- `apps/catalog/vite.config.js:7-9` sets `resolve: { conditions: ['browser'] }`.
  Without it Svelte 5 resolves its **server** build and `mount()` throws
  `lifecycle_function_unavailable`.
- `apps/catalog/src/vitest-setup.js:21` calls `afterEach(cleanup)` —
  testing-library does not auto-cleanup under vitest, and without it components
  pile up across tests and queries match the wrong one.
- Read files with `import.meta.dirname`
  (`apps/catalog/src/components/shell/shell-type.test.js:20`), not
  `new URL(..., import.meta.url)`, which throws *"URL must be of scheme file"*
  under vitest's jsdom transform.

Two more the config and setup file explain in place:

- `apps/catalog/vite.config.js:13-16` sets `css: true` so a `?raw` CSS import
  returns real text instead of vitest's empty-module stub — that is what makes
  the token tests read the actual `tokens.css`.
- `apps/catalog/src/vitest-setup.js:5-19` shims `ResizeObserver` as a no-op.
  Ark's Segment Group measures the checked item to place its indicator, and
  jsdom has no `ResizeObserver`; a no-op is correct rather than lazy, since
  jsdom lays nothing out and a "real" polyfill would report zeroes.

Note the class of bug those file-reading tests exist to catch: jsdom resolves no
custom properties, so `font-size: 0.68rem` and `font-size: var(--label-xs-size)`
render and assert identically. Token discipline cannot be tested through the
DOM — assert against the source.

## Reviewing a `.svelte` file here

Read the compiler warnings first; `state_referenced_locally` is the one that
keeps recurring. Then: is every colour, space, radius and size a semantic token?
Does a class on an Ark component have a matching `:global` rule? Is styling
driven by `data-*` from the primitive rather than a local mirror flag? Is
behaviour the primitive already implements being re-implemented? Does a
hand-authored component follow D52? Is a `const` computed from props that should
be `$derived`? Is an `$effect` copying one reactive value into another where a
`$derived` would do?
