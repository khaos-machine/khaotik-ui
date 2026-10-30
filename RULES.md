# Rules

Binding policy for changing `khaotik-ui`. Commands and release procedures are
in `TOOLS.md`; path ownership is in `WORKSPACE.md`. `AGENTS.md` governs when
this file conflicts with another root document.

## Change discipline

1. Read the source, relevant tests, manifests, and `docs/decisions.md` before
   changing a contract.
2. Prefer the smallest complete change. Reuse existing components, tokens,
   fixtures, and scripts before creating a parallel abstraction.
3. Preserve backward compatibility unless a break is deliberate, versioned,
   documented, and reflected in consumer guidance.
4. Keep errors and gaps explicit. Do not hide a missing field, inaccessible
   service, or failed command behind fallback fiction.
5. Add behavior tests for behavior changes and run every applicable gate before
   opening a PR.

## Design-system invariants

- This repository is the single home of the Khaos design system. The library
  ships tokens, components, compositions, and assets; consumers own their app
  shells.
- The BrandKit token lineage is the design source. `tokens/tokens.json` is the
  editable token source in this repository and `tokens/tokens.css` is its
  generated output. Figma and consumers mirror the source; they do not replace
  it.
- Use semantic color tokens (`--surface-*`, `--text-*`, `--action-*`,
  `--border-*`) in components. Primitive colors are stable ingredients, not app
  semantics. Dark is the default; light mode is
  `html[data-theme="light"]`.
- Use the warm-gray Quiet-Pro direction. Indigo/grey are deprecated brand-mark
  primitives; gold is reserved for brand and primary actions.
- StatusTone is seven-way: `success`, `warning`, `danger`, `info`, `neutral`,
  `accent`, `skipped`.
- Preserve dense native type, tight radii, 1px hairlines, and 2px focus rings.
  Do not mint design values without a decision in `docs/decisions.md`.
- Atoms and compositions are hand-authored in Svelte 5 and use Ark UI where a
  primitive is required. No React and no component generator.
- The library ships contracts and DOM/SVG. A rendering engine (canvas, WebGL,
  3D) may ship only behind its own entry or a lazy import, never on the
  barrel's eager path (D94: Pixi for the Story Atlas, three.js for
  PlaceViewer). Charts stay DOM/SVG.

## Component and accessibility rules

- Follow the D52 merged-unit encoding: plain `div` container, sibling action
  buttons, visual title/subtitle marked `aria-hidden`, and no `<title>` element.
  The deliberate hidden-text warnings use the documented Svelte ignore.
- Use Svelte 5 runes (`$props`, `$state`, `$derived`) and current dynamic
  component syntax. Do not introduce deprecated Svelte 4 patterns.
- Use Phosphor icons rather than emoji or a second icon system.
- Maintain public prop descriptions in component source. Generated
  declarations are the per-prop API reference.
- Treat contrast, keyboard/focus behavior, accessible names, and cross-engine
  behavior as release requirements.

## Generated and captured files

- Never hand-edit `tokens/tokens.css`; edit `tokens/tokens.json` and run the
  token builder.
- Never hand-edit `components/svelte/**/*.svelte.d.ts` or `index.d.ts`; edit
  component source and run `npm run build-types`.
- The catalog's committed JSON is its build-time data. Regenerate captured data
  from the live daemon and `khaos-tools`; never fabricate values to fill a gap.
- D62 allows illustrative fixture rows using real engine format/payload shapes
  and never by altering captured data. **D74 widened its scope** from state
  matrices to *states the capture cannot reach, including layout thresholds it
  cannot produce* — the widening's own first use was `+N more`, which is a
  layout threshold and not a machine state, so a boundary written as "states a
  machine cannot be in" would not have covered the case it was written for.
  D62's second condition — only payloads already in the repo — is the limit.
- `contrast-allow.json` is a hand-reviewed source, not generated.
  `contrast-audit.json` is manual MCP measurement and is not read by the guard.
- Catalog release versions must agree in `tauri.conf.json`, `Cargo.toml`,
  `src/fixtures.js`, and `Cargo.lock`; update the lock with Cargo.

## Testing and delivery

- The catalog Vitest suite is the repository's test surface, including tests
  for root library files.
- `check-coverage` runs catalog coverage, taxonomy, consumer load, and catalog
  compile in order. `check-types` is a separate required drift gate.
- Custom coverage checks use exit 0 for clean, 1 for named gaps, and 2 for
  could-not-run. Exit 2 is red.
- **Two defect classes are invisible to every gate and need source-read tests
  rather than rendered ones.** Both have shipped green.
  1. **A CSS fact jsdom cannot see.** jsdom resolves no stylesheets, so a
     rendered assertion about styling passes whether the rule exists or not —
     and `token-refs` checks that a `var()` *resolves*, never what it resolves
     *to*. A colour token in a `<line-width>` slot is invalid at
     computed-value time, so the whole declaration is discarded, and six gates
     saw nothing (#116).
  2. **A module that throws at evaluation.** A bundler builds it; it does not
     run it. `check-compile` catches this class because the catalog's build
     imports every export through `fixtures.js` — but a fixture entry whose
     identifier is never imported passes `check-catalog`, `check-taxonomy` and
     `check-compile` at a clean 52/52 while being unrenderable (#113).
- **The gates do not read prose.** Every defect found on 2026-09-04 was in a
  comment, a docblock or a plan rather than in the code it described: a
  docblock citing durations measured across nine projects above code whose
  payload has never carried the field; a test comment naming the exact
  mutation it existed to catch above a test that went 39/39 green against that
  mutation. **A paragraph arguing a rule is not evidence the rule was
  followed** — check the code under such a paragraph against its own stated
  principle specifically, because the argument's presence is what stops
  anyone looking.
- A `v*` tag means catalog release and invokes signing/publishing automation.
  A `lib-*` tag is a library marker and releases nothing. Keep them separate.
- Consumers pin a `lib-*` tag. Do not recommend `main` or a bare SHA.
- Use semantic commit prefixes and a `docs/`, `feature/`, `feat/`, or `fix/` branch.
  Changes reach protected `main` through a pull request.
