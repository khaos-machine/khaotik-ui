# catalog — operating notes

What this directory is: the **component catalog** — a Svelte + Tauri + Ark UI
app that renders the library's atoms and compositions with the BrandKit tokens.
It is the "preview on devices" surface: the desktop playtest app for components
and compositions against real KSPD data. Lives in the khaotik-ui monorepo as
`apps/catalog`; the library it previews is the repo root (`@khaos-machine/khaotik-ui`).

## What this is for

Read this before planning anything in this directory. It states the premise the
code is built on. `docs/decisions.md` records *why each choice was made*; this
records *what the thing is*, which no decision row ever states because nobody
files a row for the premise nobody questioned. When compose landed it went in
with no row at all, and "the Catalog is read-only" had to be said three times in
one session because nothing here said it once.

### Two surfaces, and they are not symmetric

| Mode | What it does |
| --- | --- |
| **Catalog** | **Reads.** Renders the library's atoms and compositions against real KSPD data, on device frames. It never authors |
| **Composer** | **Authors.** Assembles the published kit into components, components into pages, and pages into flows — as JSON documents rather than hand-authored Svelte |

Mode is the **parent**: it sets the *function* of the chrome beneath it, it does
not change what the chrome *is* (D67). A published Svelte component is a leaf
with no body to edit, so read-only is a property of the **surface**, never a
per-item state to toggle.

### The invariants

Violating one of these is a design error, not a style preference. Most are
enforced by a gate or a test; where they are not, that is noted.

- **Chrome is invariant across modes** (D68). The rail and sidebar render
  identically in both — same items, same taxonomy, same structure. Only the
  canvas and a row's *available function* vary. No `mode` prop below the app
  shell.
- **The model is recursive, not tiered.** A composed component IS a component. A
  page is a composed component that happens to be screen-shaped; a flow is an
  ordered list of them. One node type, one reference syntax, one renderer, all
  the way up. A `Page` type above a `Component` type puts every operation in the
  codebase twice, and the second copy is where the two drift.
- **One flat namespace.** `@MetricCard` is a published export, `@scene-card` an
  authored document, and the **first character decides** — the repo already uses
  PascalCase for exports and kebab-case for ids. So the halves cannot collide
  with no lookup and no precedence rule, and publishing never rewrites a
  reference.
- **Every dimension is a token name.** A document holds `gap: 'lg'`, never
  `24px`. `validate()` rejects a length and no inspector control can produce
  one. That is what lets a later change to the scale reach every existing
  document with no migration.
- **Real data, never fabricated.** Demo data is fetched from the live khaosd
  daemon. A collection or entity prop gets a binding picker and no text field;
  `validate()` refuses a literal array that arrives another way. **Gaps are
  reported, not papered over** — see "Real data" below for what is deliberately
  not captured.
- **Derived, never hand-listed.** Every published component's descriptor and
  props panel is parsed from the JSDoc `Props` typedef that already generates
  the shipped `.d.ts`. A hand-maintained copy of a fact the source states goes
  stale silently. Enforced by `props-typedef-parity`.
- **Layout is document metadata, not a component.** The kit ships no `Stack`,
  `Grid` or `Spacer`. Compose adds exactly one export — `Composed.svelte`, an
  *interpreter* a consuming app mounts to render a published
  `components/composed/*.json`.
- **Two renderers share one rulebook.** `Composed.svelte` and the catalog's
  editor both exist, so what they share lives in `lib/compose.js` and
  `lib/compose.css` — never in scoped styles, which would give each its own copy
  of what `gap` means.

### Deliberately not built

Treat these as closed unless the operator reopens them. Filling one as though it
were an oversight is the failure mode this list exists to prevent.

- **No generator.** Atoms and compositions are hand-authored. The UCS
  `.ucs.json` spec and its generator loop are retired (G78) — this repo *is* the
  design→dev artifact.
- **No Storybook** (D61), **no React** (Ark UI is framework-agnostic; Svelte
  bindings only), **no SvelteKit** (a catalog needs no SSR or router).
- **No third tier of surface.** Read-only and authoring are the whole set.
- **`components/composed/` ships empty**, with a README saying so. Nothing has
  been published yet, and that is a gap to fill rather than a shape to guess at.

### Decided, NOT yet built

Do not plan against these as though they exist, and do not describe the app as
though they shipped.

- **D69** — the Composer opens on a **blank canvas** that carries the create
  action, and selection does not carry across from the Catalog. Today it
  inherits the Catalog's selection and, from the default `brandkit` section with
  no saved documents, offers no create control and no enabled insert at all.
- **D70** — create controls are placed by the **scope they act on**:
  document-scope on the empty canvas, variant-scope in canvas chrome beside what
  it acts on. The specific visual treatment is still the operator's call.

### What would make this wrong

The premise fails if any of these turn out to be true. Say so rather than
working around it.

- A composed document needs a hand-authored Svelte escape hatch to be useful —
  then the format does not describe what people actually build.
- A document has to name a pixel value to look right — then the token scale is
  incomplete, and the fix is the scale, not the document.
- The Catalog and the Composer genuinely need different navigation — then mode
  is not the right parent, and the invariance rule is wrong rather than merely
  inconvenient.
- Rendering a composed page requires knowing whether its children were published
  or authored — then the flat namespace is leaking and the recursion is fake.

## Stack

- **Svelte 5** (runes) + **Vite** — deliberately *not* SvelteKit (a catalog
  needs no SSR or router).
- **Tauri v2** desktop (macOS first).
- **Ark UI** `@ark-ui/svelte` — primitives for the *components* only, never the
  catalog shell. It is the framework-agnostic equivalent of shadcn's Radix base
  (same Zag.js state machines), chosen because shadcn/ui is React-only and the
  catalog is Svelte (D50).
- **Vitest** + `@testing-library/svelte`.

## Run / build / test

```bash
cd apps/catalog
npm install
npm run dev        # Vite only (browser)
npm test           # vitest
npm run build      # Vite production build
npx tauri dev      # desktop app (needs cargo on PATH: export PATH="$HOME/.cargo/bin:$PATH")
```

## Tokens — Andrew's BrandKit, from the library

The catalog carries **no token copy of its own**. It consumes the repo-root
library through the `@khaos-machine/khaotik-ui` workspace dependency
(`"file:../.."` in `package.json`) and imports the generated stylesheet as
`@khaos-machine/khaotik-ui/tokens/tokens.css` — `src/main.js` pulls it in for the running
app, and the library's own `@khaos-machine/khaotik-ui/tokens/parse.js` pulls the same file
in `?raw` for the palette view, so the screen and the documentation of the screen
can never disagree. The parser is the library's, not the catalog's — it used to be
copied here and the copy drifted. There is no
`src/tokens.css`; if you find yourself reaching for one, you are about to fork the
BrandKit.

The lineage is unchanged, it just lives one level up now: the BrandKit is the
token source of truth (D44; UCS's own `tokens/` is retired), and
`tokens/tokens.css` at the repo root is generated from `tokens/tokens.json` by
`tokens/build-tokens.py`. Do not edit it by hand — edit `tokens.json` and
regenerate.

- **Dark is the default**: semantic tokens are defined on `:root`; light mode is
  `html[data-theme="light"]`.
- Components must use **semantic** tokens (`--surface-*`, `--text-*`,
  `--action-*`, `--border-*`) so they flip with mode. Primitive tokens
  (`--indigo-950`, `--gold-400`) are mode-invariant.
- The shell (`app.css`) must set `color`/`background` from semantic tokens — a
  shell that inherits browser black is invisible on the dark default (this
  happened once; see the `body { color: var(--text-primary) }` fix).
- Theme toggle: `App.svelte` flips `document.documentElement.dataset.theme`.

## Components — the D52 encoding

Every merged component follows the D52 encoding (a plain `div`, sibling buttons,
`aria-hidden` visual text, no `<title>`):

- `div` container, never `article` (G53 D1).
- A stretched activate `<button aria-label="<name>">` carries the unit name.
- Visual title/subtitle are `aria-hidden="true"` — mark them
  `<!-- svelte-ignore a11y_hidden -->` (this is the deliberate G52 tradeoff, not
  a lint accident).
- No `<title>` element (G53 D2).

The screens (`WelcomeWindow`, `Settings`, `VoiceStudio`, `SoundStudio`,
`ResourceCatalog`, `StoryPlayer` and the appearance workbenches) **compose** the
atomic components, and the Screens section files them by the Khaos App window or
pane they stand for.
Each fixture component carries sample default props so the catalog renders it
standalone.

### 2026-08-14 shell pass (audit + story/project merge)

- **Placeholders audited out** (not khaos/khaotik — hardware + "article"
  fiction): `DeviceTile`, `ContentCard`, `ArticleMeta`, `RichText`,
  `ArticleDetail`, `ArticleFeed`, and `StoryCard`. The D52 encoding (div +
  sibling buttons + `aria-hidden`, no `<title>`) is what the atoms use.
- **StoryCard merged into ProjectCard**: one cover card (title-derived monogram
  + gradient cover + title/logline overlay) carrying the project state (status
  dot, scene/char/loc counts, git, recency). Projects **are** stories in Khaos
  (one `.kspd` = one story), so the launcher shows a **Stories** grid of these
  cards. The launcher + `ProjectCard` fixtures use the **real** projects
  (`BROKEN IN 4 PLACES` = 54/27/26, `Heart of an Indie` = 5/4/3).
- **Shell**: search + sort (Grouped / Name), version in the sidebar brand, and
  a **Settings** sheet (About + Updates — check/apply via `Updater.svelte`,
  Tauri-only). `src/fixtures.js` carries the `APP_VERSION` constant (`App.svelte`
  imports it) — keep it in sync with `tauri.conf.json`/`Cargo.toml` on release.

### Real data — khaosd API + khaos-tools

`scripts/fetch-kspd.sh` is the single source of truth for the **captured**
`src/data/*.json` — every file there except the two named under "Not captured"
below. It
reads the **live khaosd API** (the running daemon on `~/.khaos/runtime.json`'s
port) + `khaos-tools parser query` — **not** the KSPD files, which were stale
(old layout, old counts). `fetch-voices.sh` does the same for `voices.json` +
`provider-status.json`. Run both after the daemon changes — or `fetch-all.sh`,
which runs them in order:

```bash
bash scripts/fetch-kspd.sh    # scenes/characters/locations/dialogues/analyses/casting/coverage/engine/setup
bash scripts/fetch-voices.sh  # voice catalog + provider status
bash scripts/fetch-all.sh     # both, in order
```

- `characters.json` carries the real `dialogue_count`/`word_count`/`scene_count`
  (Desmond = 297 lines / 4024 words / 29 scenes); `casting.json` the real cast
  assignments; `coverage.json` the coverage report (the `logline` is currently
  **empty** — a real gap, not a fabricated value).
- Data integrity rule: **no canned data**. Real data or the honest empty state;
  a missing field is a gap to report (the catalog/KSPD/khaos-tools), never fabricated.
- **Build-time export**: the committed `src/data/*.json` is the catalog's data
  source — the web + desktop builds import it directly (no daemon at
  build/deploy time). Regenerate + commit the **captured** files with
  `scripts/fetch-all.sh`; the daemon/khaos-tools are only needed at that export
  step, never at runtime.

#### Not captured — two files in `src/data/` that no script writes

`contrast-allow.json` and `contrast-audit.json` (#66, D64) are **not** fetched
and `fetch-all.sh` will not touch them.

- **`contrast-allow.json` is hand-authored and has no generator, deliberately.**
  Every entry is a reviewed human decision that a rule may keep
  `--text-tertiary`. That absence *is* the guarantee: `contrast-guard.test.js`
  compares a source scan against this list, and a list anyone could regenerate
  from the thing being checked would make the guard a tautology — which this
  repo has shipped three times. **There is no command to run. If the guard reds,
  the answer is a justified entry or a fixed rule, never a regeneration.**
- **`contrast-audit.json` is measurement**, produced by a manual MCP-driven
  sweep of the running catalog (its own `regenerateWith` field says how). No
  code reads it; the guard is forbidden to.

## Svelte 5 gotchas (each cost a rebuild)

- Dynamic component rendering: `{@const Component = selected.component}` inside
  an `{#if}` then `<Component />`. `<svelte:component>` is deprecated, and a
  bare `<selected.component />` (lowercase) is parsed as an element.
- `class:name={}` directives are **not valid on components** — use
  `class={cond ? 'name' : ''}`.
- Classes passed to Ark UI components are forwarded to the rendered element, so
  Svelte scopes them as "unused" — style them with `:global(.class)`.
- `$derived` for props-derived values (`const x = $derived(prop.field ?? [])`),
  not a plain `const` (which only captures the initial value).

## Testing quirks

- `vite.config.js` needs `resolve: { conditions: ['browser'] }` or Svelte 5
  resolves its server build and `mount()` throws `lifecycle_function_unavailable`.
- `src/vitest-setup.js` must `afterEach(cleanup)` (testing-library does not
  auto-cleanup under vitest).
- Token test reads `tokens.css` via `import.meta.dirname` — `new URL(..., import.meta.url)`
  throws "URL must be of scheme file" under vitest's jsdom transform.

## Release — signing + notarization

`scripts/release.sh` does the whole signed release in one command. It packages
the DMG with `hdiutil` (Tauri's `create-dmg` fails on these machines), puts
`~/.cargo/bin` on PATH (cargo is not on the default shell PATH), and **tags
`vX.Y.Z` before drafting** so the release is never left "untagged".

```bash
cd apps/catalog
set -a && source ~/KhaosFoundation/.env && set +a   # APPLE_ID / TEAM_ID / APP_SPECIFIC_PASSWORD
./scripts/release.sh --version X.Y.Z
gh release edit vX.Y.Z --draft=false                # publish after review
```

Steps the script performs, in order:

1. Resolve the signing identity to a **hash** (`security find-identity`) — two
   `Developer ID Application: Khalid Mills (G98TZJ75HL)` certs coexist, and
   `codesign --sign "<name>"` is ambiguous.
2. `npx tauri build --bundles app` — signs + notarizes + staples the `.app`
   (Tauri notarizes automatically when `APPLE_ID`/`APPLE_PASSWORD`/
   `APPLE_TEAM_ID` are set).
3. Package the DMG with `hdiutil` — **not** Tauri's default `dmg` bundle.
4. `codesign` the DMG, then `xcrun notarytool submit --wait` + `stapler staple`.
5. Tag `vX.Y.Z` (create + push) so the draft carries the tag.
6. `gh release create vX.Y.Z --draft` with the DMG + `.sha256`.

A draft is **"untagged" until published** (normal GitHub behaviour); the script
tags first so the draft already has the tag, and `gh release edit vX.Y.Z
--draft=false` publishes it.

**Credentials** (never in the shell env):
- `~/KhaosFoundation/.env` on `vader` — `APPLE_ID`, `APPLE_TEAM_ID`,
  `APPLE_APP_SPECIFIC_PASSWORD`.
- For CI: **org-level** secrets on `loswf`; the workflow maps
  `APPLE_APP_SPECIFIC_PASSWORD` → `APPLE_PASSWORD` inside `release.sh`.

**Runner**: `[self-hosted, macOS, ARM64]` on `mini.local` (Rust 1.97, Xcode 27,
the signing cert, Node under `/opt/homebrew/bin`). A `loswf`-org runner was
registered as `loswf-mini`.

## Auto-update — Tauri updater on updates.loswf.com

The catalog ships the **Tauri updater** (`tauri-plugin-updater` + Ark-less
`Updater.svelte` in the sidebar footer). The repo is **private**, so GitHub
release assets are not publicly fetchable — the updater endpoint + artifacts
live on the shared **LOSWF** update host instead (K: one subdomain for all LOSWF
products):

- **Endpoint**: `https://updates.loswf.com/khaotik-catalog/latest.json`
  (baked into `tauri.conf.json` under `plugins.updater.endpoints`).
- **Hosting**: S3 bucket `loswf-updates-web` (private, Block Public Access ON) +
  CloudFront distribution `E1WTYEQ9SZ5JYP` (alias `updates.loswf.com`) via an
  **OAC** (`ENKY554EWCU6G`) — least privilege, not a public bucket.
- **Layout** (product-scoped so other LOSWF products share the subdomain):
  `khaotik-catalog/latest.json`, `khaotik-catalog/vX.Y.Z/khaotik-catalog.app.tar.gz[.sig]`,
  `khaotik-catalog/vX.Y.Z/khaotik-catalog-X.Y.Z.dmg[.sha256]`.
- **Signing**: `tauri signer generate` produced `~/.tauri/khaotik-catalog.key[.pub]`.
  `release.sh` exports `TAURI_SIGNING_PRIVATE_KEY` (key *content*, not a path) +
  `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (from `KHAOTIK_UPDATER_KEY_PASSWORD` in the
  `.env`). `bundle.createUpdaterArtifacts: true` makes `tauri build` emit the
  signed `.app.tar.gz` + `.sig`.

`release.sh` publishes the updater artifacts + `latest.json` to S3
(`AWS_PROFILE`, default `personal`) and the DMG + `.sha256` to the (private)
GitHub draft. Losing the private key/password means existing installs can never
update again — back both up.

## Release checklist

1. Bump the version in **all four** places `src/version.test.js` gates:
   `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, the `APP_VERSION`
   constant in `src/fixtures.js`, and `src-tauri/Cargo.lock` — the last via
   `cargo update -p app --offline`, never by hand. Miss `Cargo.lock` and the
   release is blocked, not merely untidy: `catalog-release.yml` runs `npm test`
   before it signs, and nothing in CI repairs the lockfile (`release.sh` only
   reads `tauri.conf.json`). It had drifted five releases before the gate
   existed, because `cargo build` silently rewrites the entry locally.
2. Commit + push.
3. `./scripts/release.sh --version X.Y.Z` with the `.env` sourced (above).
4. Review the draft, then `gh release edit vX.Y.Z --draft=false`.
