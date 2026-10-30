# Tools

Supported development and delivery procedures for `khaotik-ui`. Policy is in
`RULES.md`; catalog-specific details are in `apps/catalog/AGENTS.md`.

## Toolchain

- `git` and `gh` for branches, pull requests, checks, tags, and releases.
- Node.js 24 and npm for CI-equivalent installs, gates, builds, and tests.
- Rust/Cargo and Tauri CLI for the native catalog.
- Python 3 only for the existing token builder.
- Xcode, Apple credentials, signing certificate, updater key, AWS credentials,
  and `gh` are release-runner requirements. Do not move secrets into files.

Use `npm ci` from the root for a reproducible workspace install. The catalog is
an npm workspace and consumes this repository's root package through its local
workspace dependency.

## Required validation

Run from the repository root unless shown otherwise. This is the gate set
`.github/workflows/gates.yml` runs, in its order; the `check-coverage` chain is
the one `package.json` defines for that script.

```sh
npm ci                              # reproducible workspace install
npm test --workspace apps/catalog   # complete Vitest suite

npm run check-coverage      # all five checks below, in order
npm run check-catalog       # every export has a catalog fixture
npm run check-taxonomy      # every export is filed in a declared, labelled group
npm run check-consumer      # package loads and type-checks like a consumer
npm run check-compile       # catalog production build; imports every fixture export
npm run check-export-count  # every document stating an export count states the real one

npm run check-types                 # generated declarations match components
npm run check-citations             # path:line citations in live reference docs resolve

# both need GH_TOKEN; locally: export GH_TOKEN=$(gh auth token)
scripts/check-issue-refs.test.sh    # self-check: the blocked-list gate still catches its founding case
npm run check-issue-refs            # every issue CURRENT.md calls blocking is open
```

`check-citations` exists because nothing else here opens a markdown file.

**Scope is the live reference documents** — root-level `*.md` plus `docs/*.md`.
Within that scope, a citation naming a file this repository does not have is a
**gap**, not a skip; a bare filename resolves against the tracked file list and
is a gap if two tracked files share it. Only paths matching a declared
cross-repository pattern are declined, and that count is printed so a rising
number is visible.

**`docs/decisions.md` and `docs/plans/` are excluded on purpose**, measured
rather than assumed. The register carries 32 citations to files that no longer
exist — `spec/ucs-0.6.md`, `lowering/ios.md`, `android/RichText.kt` — because
D1–D38 describe the retired UCS programme, and the plans carry 39 more of the
same kind. Every one was true when written. Gating them would demand rewriting
the historical record, which the register's own scope note refuses. A gate that
can only be satisfied by falsifying history is worse than no gate.

It checks a cited line **exists**, never that it says what the citing prose
claims, and it cannot see a claim carrying no citation at all — the docblock
asserting *"element durations summed exactly to segment duration"*, false for
months, names no line and would pass every version of this gate. Cite a
cross-repository document by section name, not by line.

The custom coverage scripts report 0 clean, 1 named gaps, and 2 could not run.
Treat 2 as failure. CI runs every command in the block above through
`.github/workflows/gates.yml`, in that order: `npm ci`, the catalog tests,
`check-coverage`, `check-types`, `check-citations`, then the `check-issue-refs`
self-check and the gate itself.

For a single catalog test:

```sh
cd apps/catalog
npx vitest run src/components/StatusPill.test.js
npx vitest run -t "renders the warning tone"
npx vitest
```

Vitest requires the browser resolve condition in `vite.config.js` and explicit
cleanup in `src/vitest-setup.js`. Preserve both.

## Tokens and declarations

```sh
python3 tokens/build-tokens.py  # tokens.json -> tokens.css
npm run build-types             # component source -> committed .d.ts files
npm run check-types             # fail if declarations drift
```

Always inspect the generated diff. The declarations are committed because the
library is consumed directly from git; they are not a hand-maintained API.

## Catalog

```sh
cd apps/catalog
npm run dev       # browser/Vite
npm test          # Vitest suite
npm run build     # static web build
npm run dev:mcp   # Tauri debug app with the MCP bridge
npx tauri dev     # Tauri desktop app
```

For Rust/Tauri work on machines where Cargo is installed but absent from the
default shell path:

```sh
export PATH="$HOME/.cargo/bin:$PATH"
```

The MCP bridge is debug-only, feature-gated, and bound to `127.0.0.1:9223`.
Do not relax the debug assertion, feature gate, or loopback bind; the bridge can
execute JavaScript in the webview.

## Catalog data

From `apps/catalog`:

```sh
scripts/fetch-kspd.sh    # KSPD captures from khaosd + khaos-tools
scripts/fetch-voices.sh  # voices and provider status
scripts/fetch-all.sh     # both, in order
```

The daemon port comes from `~/.khaos/runtime.json`. These scripts require the
live daemon and `khaos-tools` only while capturing; committed JSON is used at
build and runtime. They do not write `contrast-allow.json` or
`contrast-audit.json`.

**Do not run these until #123 is fixed. `fetch-kspd.sh` is broken and
destructive.** It calls `khaos-tools parser query`, a subcommand removed by
khaos-tools 0.18.0 (`parse | version | help` is the whole surface), and its
default project path no longer exists on disk. Three of its five writes use a
bare `> file` redirect under `set -euo pipefail`, so the shell truncates the
**committed** capture before the failing pipeline runs and leaves it at 0
bytes. The script's own comment documents that exact hazard and fixes it with a
temp-file helper — for the other two writers. Route every write through
`write_json`, not just the three that are broken.

## Release and publishing

GitHub Actions owns normal publishing. `.github/workflows/catalog-release.yml`
runs the reusable gates, then uses the self-hosted macOS ARM64 runner to import
the signing certificate and invoke `apps/catalog/scripts/release.sh`.

- `vX.Y.Z`: catalog tag; builds, signs, notarizes, creates updater artifacts,
  drafts the GitHub release, publishes the updater feed, and deploys the web
  catalog.
- `lib-X.Y.Z`: library marker; triggers no workflow.

**Cut a `lib-*` Release with `--latest=false`.** GitHub's `latest` is
repo-wide and last-publish-wins, so a library release published without the
flag takes the pointer off the catalog. It has fired **six** times —
`lib-0.11.0` through `lib-0.15.0` each held `latest` until the next `v*` tag
took it back, and `lib-0.20.0` held it from 2026-09-21 until it was found and
restored to `v0.17.0` on 2026-09-22. `releases/latest` is what `AGENTS.md`
offers as the link to the signed DMG, so for those windows it resolved to
something with no installable build.

The five-times count is inherited from the earlier record and is **not
independently verifiable** — the API reports only the current `isLatest`, never
its history. The `lib-0.20.0` occurrence was measured directly.

```sh
gh release create lib-X.Y.Z --target <full-sha> --latest=false --title ... --notes ...
```

`--target` needs the **full** SHA; an abbreviated one is rejected as
`Release.target_commitish is invalid`, which reads like a tag problem and is
not.

**`releases/latest` does not answer "what is the newest library release."** In
a repository with two release families it answers *the newest thing published
here*, which is a different question. Ask the tags instead:

```sh
git tag -l 'lib-*' | sort -V | tail -1
git tag -l 'v*'    | sort -V | tail -1
```

`apps/catalog/scripts/release.sh` asserts `--latest` for the catalog path
(#103), and **`scripts/release-lib.sh` is its counterpart for the library
path** — use it rather than `gh release create` by hand:

```sh
scripts/release-lib.sh --dry-run   # every pre-publish guard, publishes nothing
scripts/release-lib.sh
```

It passes `--latest=false`, then **re-reads the pointer and fails if it moved**,
printing the command that restores it. Passing the flag and the pointer holding
are two different claims and only the second one matters.

Until 2026-09-22 this path had no script and the rule lived only in prose here.
A rule that lives only in prose is followed only by whoever reads it, which is
never the person cutting a release from memory — and that is how it fired a
sixth time.

**No gate reads the root `package.json` version.** `version.test.js` reads
`tauri.conf.json`, `Cargo.toml`, `Cargo.lock` and `APP_VERSION`;
`check-consumer.mjs` reads `pkg.exports` and never `pkg.version`. A library
version bump is therefore a hand-check in both directions — a missing bump
ships new API under an old version, a wrong bump ships old API under a new one,
and neither reds. #43 shipped without its bump for exactly this reason.

Before a catalog release, update all four version sources named in
`apps/catalog/AGENTS.md`, using `cargo update -p app --offline` for the lockfile,
then run the full validation set. Never create a `v*` tag for a library-only
change.

The release script resolves a certificate hash, runs Tauri for the signed app,
packages the DMG with `hdiutil`, notarizes and staples it, signs updater
artifacts, uploads to `updates.loswf.com`, and deploys the static catalog.
Credentials and signing keys stay in CI secrets or the documented local secret
stores. Run the script locally only when K explicitly authorizes a release and
a release-capable machine is configured.
