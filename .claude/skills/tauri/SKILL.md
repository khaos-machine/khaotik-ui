---
name: tauri
description: >
  Work on the component catalog's Tauri v2 desktop app in apps/catalog — running
  and building it, editing tauri.conf.json, the updates.loswf.com auto-updater,
  Developer ID signing + notarization, and cutting a release.
---

# Tauri — the catalog desktop app

`apps/catalog` is a Svelte 5 + Vite + Tauri v2 desktop app: the surface for
playtesting this library's atoms and compositions on real devices
(`apps/catalog/AGENTS.md:3`). Deliberately not SvelteKit — a catalog needs no
SSR or router (`apps/catalog/AGENTS.md:11`).

Read `apps/catalog/AGENTS.md` before changing anything here. This skill is the
Tauri-shaped distillation of it; that file is the operator's own voice and wins
on any disagreement.

## Current version

`0.9.0` in all three places, as of this writing:

- `apps/catalog/src-tauri/tauri.conf.json:4`
- `apps/catalog/src-tauri/Cargo.toml:3`
- `apps/catalog/src/fixtures.js:90` — `export const APP_VERSION = '0.9.0'`

Read them before quoting a version. They are hand-maintained and can drift.

**Note:** `AGENTS.md:90` and `AGENTS.md:210` say the `APP_VERSION` constant lives
in `src/App.svelte`. It does not — it is defined in `src/fixtures.js:90` and
imported by `App.svelte:2`. The instruction ("keep the three in sync") is right;
the path is stale.

## Run / build / test

```bash
cd apps/catalog
npm install
npm run dev        # vite — browser only, no desktop shell
npm test           # vitest run
npm run build      # vite production build → dist/
npx tauri dev      # the actual desktop app
npm run dev:mcp    # the desktop app with the MCP bridge live (see below)
```

Scripts are `apps/catalog/package.json:7-12`. `npm run dev` is plain Vite: no
Tauri APIs, so the `Updater.svelte` panel is inert in the browser — it imports
`check` from `@tauri-apps/plugin-updater`
(`apps/catalog/src/components/shell/Updater.svelte:2`).

**cargo is not on the default shell PATH on these machines.** Before anything
that touches Rust: `export PATH="$HOME/.cargo/bin:$PATH"`. The scripts do it for
you (`apps/catalog/scripts/release.sh:23`,
`apps/catalog/scripts/deploy-web.sh:16`, `apps/catalog/scripts/fetch-all.sh:11`)
and CI does it explicitly (`.github/workflows/catalog-release.yml:43`) — but an
interactive `npx tauri dev` will fail without it.

Tauri drives Vite itself: `beforeDevCommand: npm run dev`,
`beforeBuildCommand: npm run build`, `devUrl: http://localhost:5173`,
`frontendDist: ../dist` (`apps/catalog/src-tauri/tauri.conf.json:6-11`).

Vitest lives inside `vite.config.js` (`apps/catalog/vite.config.js:10-17`), and
two settings there are load-bearing: `resolve.conditions: ['browser']` or Svelte
5 resolves its server build and `mount()` throws
`lifecycle_function_unavailable` (`apps/catalog/AGENTS.md:132`), and `css: true`
so `tokens.css?raw` returns real text under test rather than vitest's empty-module
stub (`apps/catalog/vite.config.js:12-15`).

## The MCP bridge — dev only, and both gates matter

`.mcp.json` at the repo root registers `@hypothesi/tauri-mcp-server`
project-scoped. It drives a **running** app over a local driver session, so it
screenshots the window, reads the real DOM and runs JS in the webview — the
only way to catch a stylesheet that parsed fine but cascaded wrong under
WKWebView.

The app half is a feature-gated plugin:

- `src-tauri/Cargo.toml:25-29` — `mcp-bridge = ["dep:tauri-plugin-mcp-bridge"]`,
  over the optional dependency at `Cargo.toml:38`, **off by default**.
- `src-tauri/src/lib.rs:13-20` — initialised under
  `#[cfg(all(debug_assertions, feature = "mcp-bridge"))]`.

**Do not relax either gate, and do not change the bind address.** The two
`cfg` conditions are what make it impossible for a release build to listen, and
`lib.rs:17` pins `bind_address("127.0.0.1")` because the plugin's own default is
`0.0.0.0` — this socket executes arbitrary JavaScript in the webview, so a
wildcard bind would expose that to the network. The reasoning is recorded in the
comment at `lib.rs:6-12`; it was a deliberate call, not a default anyone
inherited.

Run it with `npm run dev:mcp` (`tauri dev --features mcp-bridge`). A plain
`npx tauri dev` builds without the plugin at all, which is the right default —
reach for the bridge only when the question is genuinely desktop-specific.
Anything reproducible in a browser is a faster loop through `npm run dev` than
through a Rust rebuild.

## The build-time data boundary

This is the architectural line worth holding: **the committed
`apps/catalog/src/data/*.json` is the catalog's data source.** `fixtures.js`
imports the files directly (`apps/catalog/src/fixtures.js:37-46`), so both the
web build and the desktop build need no daemon at build time or at runtime
(`apps/catalog/AGENTS.md:113-116`).

khaosd and khaos-tools are needed at exactly one step: regeneration, via
`apps/catalog/scripts/fetch-all.sh`, which runs `fetch-kspd.sh` then
`fetch-voices.sh` and tells you to commit the result
(`apps/catalog/scripts/fetch-all.sh:14-19`). Regenerate, commit, done — never
reach for a live daemon from app code.

**Note:** `AGENTS.md:94-103` names these scripts `fetch-kspd.py` /
`fetch-voices.py` and invokes them with `python3`. The real files are
`apps/catalog/scripts/fetch-kspd.sh` and `fetch-voices.sh`, invoked with `bash`.
Use `scripts/fetch-all.sh`.

Data integrity rule carries over unchanged: no canned data. Real data or the
honest empty state; a missing field is a gap to report, never a fabricated value
(`apps/catalog/AGENTS.md:110-112`).

## Release — signing + notarization

**CI runs this. Do not run it yourself.** Pushing a `v*` tag triggers
`.github/workflows/catalog-release.yml` on the self-hosted macOS runner
(`loswf-mini`), which holds the signing certificate, the Apple notarization
credentials, the Tauri updater key and the AWS profile that owns the buckets.
Andrew does not have that account access, and an agent should not either — a
local run either fails the account guard or publishes from a machine whose state
nobody can reproduce. See `.claude/skills/publishing/SKILL.md` for the trigger
and the verify-before-you-tag loop.

The section below documents **what CI executes and why**, because the reasoning
is worth knowing when a run fails. The equivalent local invocation, for the
operator on a machine that has the credentials, is:

```bash
cd apps/catalog
set -a && source ~/KhaosFoundation/.env && set +a
./scripts/release.sh --version X.Y.Z
gh release edit vX.Y.Z --draft=false     # publish after reviewing the draft
```

`apps/catalog/scripts/release.sh` is the authority on the sequence. What it does
and, more usefully, why:

1. **Resolve the signing identity to a hash**
   (`apps/catalog/scripts/release.sh:41-45`). Two
   `Developer ID Application: Khalid Mills (G98TZJ75HL)` certs coexist in the
   keychain, so `codesign --sign "<name>"` fails as ambiguous. `security
   find-identity` + awk picks the first hash and exports it as
   `APPLE_SIGNING_IDENTITY`.
2. **`npx tauri build --bundles app`** (`release.sh:68`) — Tauri signs,
   notarizes, and staples the `.app` on its own once `APPLE_ID` /
   `APPLE_PASSWORD` / `APPLE_TEAM_ID` are in the environment. The script maps
   `APPLE_APP_SPECIFIC_PASSWORD` → `APPLE_PASSWORD` because that is the name
   Tauri reads (`release.sh:48-51`).
3. **Package the DMG with `hdiutil`** (`release.sh:74-82`), *not* Tauri's `dmg`
   bundle target — its `create-dmg` script fails on these machines
   (`release.sh:5-8`, `AGENTS.md:141-142`). That is why the build is
   `--bundles app` and the DMG is assembled by hand: staging dir, `.app` copy,
   `/Applications` symlink, `hdiutil create -format UDZO`.
4. **Sign, notarize, staple the DMG** (`release.sh:86-91`): `codesign --force
   --timestamp`, then `xcrun notarytool submit --wait`, then `xcrun stapler
   staple`. Checksum written alongside (`release.sh:95`).
5. **Tag `vX.Y.Z` before drafting** (`release.sh:154-158`). A `gh release create
   --draft` against a brand-new tag otherwise lands "untagged", which reads as a
   failure and forces a delete/recreate dance. Tag first, push, then draft.
6. **`gh release create vX.Y.Z --draft`** with the DMG + `.sha256`
   (`release.sh:177-179`).

Between 4 and 5 it also generates `latest.json` and pushes the updater artifacts
to S3 — see below. The script refuses to publish unless
`aws sts get-caller-identity` returns account `997901679385`
(`release.sh:135-139`); the same guard is in both deploy scripts.

`--skip-release` stops after the DMG: no tag, no GitHub draft, no web deploy
(`release.sh:11`, `release.sh:148-149`, `release.sh:187`).

## Auto-update — updates.loswf.com

The repo is **private**, so GitHub release assets are not publicly fetchable. The
updater endpoint and artifacts therefore live on the shared LOSWF update host
(`AGENTS.md:182-186`, `release.sh:121-124`).

- **Endpoint**: `https://updates.loswf.com/khaotik-catalog/latest.json`, baked
  into `apps/catalog/src-tauri/tauri.conf.json:30-32` under
  `plugins.updater.endpoints`, alongside the minisign `pubkey`
  (`tauri.conf.json:29`).
- **Hosting**: S3 bucket `loswf-updates-web` (private, Block Public Access on)
  behind CloudFront via an OAC — least privilege, not a public bucket
  (`AGENTS.md:190-192`). The bucket + prefix are in `release.sh:132-133`.
- **Layout**, product-scoped so other LOSWF products share the subdomain:
  `khaotik-catalog/latest.json` and
  `khaotik-catalog/vX.Y.Z/khaotik-catalog.app.tar.gz[.sig]` plus the DMG and its
  `.sha256` (`release.sh:141-145`). `latest.json` gets `max-age=300`; the
  versioned artifacts get a year.
- **Artifact signing**: `bundle.createUpdaterArtifacts: true`
  (`tauri.conf.json:38`) makes `tauri build` emit the signed `.app.tar.gz` +
  `.sig`. The keypair came from `tauri signer generate` →
  `~/.tauri/khaotik-catalog.key[.pub]` (`AGENTS.md:196`).
- **`TAURI_SIGNING_PRIVATE_KEY` is the key CONTENT, not a path.** `release.sh`
  prefers `KHAOTIK_UPDATER_PRIVATE_KEY` (CI secret) and otherwise `cat`s the key
  file into the variable (`release.sh:56-63`). Its password comes from
  `KHAOTIK_UPDATER_KEY_PASSWORD` (`release.sh:64`).
- **Losing the private key or its password means existing installs can never
  update again** (`AGENTS.md:204-205`). Back up both. There is no recovery path —
  the public key is compiled into every shipped binary.

The runtime side is `apps/catalog/src/components/shell/Updater.svelte` (sidebar
footer / Settings sheet), which calls `check()` from
`@tauri-apps/plugin-updater` (`Updater.svelte:2,18`); the Rust side is
`tauri-plugin-updater` (`apps/catalog/src-tauri/Cargo.toml:33`).

## CI — and the two deploy-web.sh scripts

`.github/workflows/catalog-release.yml` runs on `push` of a `v*` tag or
`workflow_dispatch` (`:18-21`), on `runs-on: [self-hosted, macOS, ARM64]`
(`:28`) — the mini. Credentials are org-level `loswf` secrets (`:29-34`,
`:50-54`). It does not use `actions/setup-node`: that downloads its own Node and
hangs on this runner (`:39-40`).

Because the LaunchAgent runner cannot unlock the login keychain, CI imports the
Developer ID cert into an ephemeral keychain under `$RUNNER_TEMP` and
`set-key-partition-list`s it (`:56-78`). Then it runs
`bash apps/catalog/scripts/release.sh` (`:81`).

**There is one `deploy-web.sh` now, and it belongs to the catalog:**

| script | builds | bucket | distribution | host |
|---|---|---|---|---|
| `apps/catalog/scripts/deploy-web.sh` | `npm run build` → `dist/` | `loswf-khaotik-catalog-web` | `E3URVGW9EHJQI7` | `khaotik-catalog.loswf.com` |

Grounding: `apps/catalog/scripts/deploy-web.sh:19-20,32,45`.

There were two, and confusing them published the wrong site. The repo-root
`scripts/deploy-web.sh` built Storybook to `khaotik-ui.loswf.com`
(bucket `loswf-khaotik-ui-web`, distribution `E2S4N1HSBG21IR`); D61 retired
Storybook, so that script and the release workflow's `Deploy Storybook (web)`
step are both gone. The AWS resources went with them on 2026-08-18 (issue #40):
the bucket, the distribution and the DNS record are deleted, so only the catalog
row above is live.

The catalog's web copy is deployed by
`apps/catalog/scripts/deploy-web.sh`, which `release.sh` calls as its last step
unless `--skip-release` was passed (`apps/catalog/scripts/release.sh:187-190`).
So a CI run reaches it *transitively*, through `release.sh` — not as a workflow
step of its own. Running it directly by hand is also fine and is the usual way to
refresh `khaotik-catalog.loswf.com` without cutting a release.

Two gotchas in the catalog script: its header comment names distribution
`E26L3BVGACFNP7` while the code uses `E3URVGW9EHJQI7`
(`apps/catalog/scripts/deploy-web.sh:5` vs `:20`) — trust the code. And it
re-runs `npm run build` (`:32`), which is cheap because the release build already
produced the same `dist/` (`release.sh:185-186`).

## Credentials

Never put these in the shell env permanently. Source them for the command:

```bash
set -a && source ~/KhaosFoundation/.env && set +a
```

That file (on `vader`) carries `APPLE_ID`, `APPLE_TEAM_ID`,
`APPLE_APP_SPECIFIC_PASSWORD` (`AGENTS.md:170-172`, `release.sh:13-15`) and
`KHAOTIK_UPDATER_KEY_PASSWORD` (`AGENTS.md:198-199`). AWS comes from
`AWS_PROFILE`, default `personal` (`release.sh:125`), except in CI where
`AWS_ACCESS_KEY_ID` being set switches the scripts to ambient creds because the
runner has no `~/.aws` profile (`release.sh:126-131`).

CI uses org-level `loswf` secrets for the same names
(`.github/workflows/catalog-release.yml:29-34`); the
`APPLE_APP_SPECIFIC_PASSWORD` → `APPLE_PASSWORD` mapping happens inside
`release.sh:51`, not in the workflow.

## Release checklist

1. Bump the version in **all three** places — `src-tauri/tauri.conf.json:4`,
   `src-tauri/Cargo.toml:3`, `src/fixtures.js:90`. If they drift, the app's
   sidebar shows one version, the bundle another, and the updater compares
   against a third.
2. Commit + push.
3. `./scripts/release.sh --version X.Y.Z` with the `.env` sourced.
4. Review the draft, then `gh release edit vX.Y.Z --draft=false`.

Grounded in `apps/catalog/AGENTS.md:207-213`, with the `APP_VERSION` path
corrected to where the constant actually lives.

## Editing tauri.conf.json

Small file, high blast radius (`apps/catalog/src-tauri/tauri.conf.json`):

- `productName: khaotik-catalog` (`:3`) — every artifact path in `release.sh`
  hardcodes this name (`release.sh:70,99-100`). Renaming it breaks the release
  script.
- `identifier: dev.loswf.khaotik-catalog` (`:5`) — changing it makes macOS treat
  an update as a different app.
- `plugins.updater.pubkey` (`:29`) — must match the private key that signs the
  artifacts. Changing one without the other bricks updates for installed copies.
- `bundle.createUpdaterArtifacts: true` (`:38`) — turn this off and `release.sh`
  aborts at its artifact check (`release.sh:101`).
- `bundle.macOS.hardenedRuntime: true` (`:40`) — required for notarization.
- `app.security.csp: null` (`:24`) — no CSP is enforced today. Worth knowing
  before you assume one is protecting you.
