# Tools

Supported development and delivery procedures for `khaotik-ui`. Policy is in
`RULES.md`; catalog-specific details are in `apps/catalog/AGENTS.md`.

## Toolchain

- `git` and `gh` for branches, pull requests, checks, tags, and releases.
- Node.js 24 and npm for CI-equivalent installs, gates, builds, and tests.
- Python 3 only for the existing token builder.
- A browser for the catalog. It is a web app; there is no native build.

Publishing needs no local credentials: npm uses trusted publishing and the Pages
deploy uses the workflow's `id-token`. Do not move secrets into files.

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
npm run check-icons                 # the shipped icon stylesheet matches the installed Phosphor
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
`check-coverage`, `check-types`, `check-icons`, `check-citations`, then the
`check-issue-refs` self-check and the gate itself. `ci.yml` calls it on every
pull request, and `catalog-pages.yml` calls it before every Pages deploy.

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
npm run build     # static web build, base path /
npm run preview   # serve the build
```

`npm run dev` serves on port 5173 and fails rather than moving when the port is
taken (`vite.config.js`). The Pages build passes `--base` from
`actions/configure-pages`, because a project site is served under
`/khaotik-ui/`; dev, tests and `check-compile` stay at `/`. To check a change
under the Pages base before it ships:

```sh
npm run build -- --base=/khaotik-ui/ && npm run preview -- --base=/khaotik-ui/
```

Agents drive the catalog in a browser, on `npm run dev` or the Pages URL; see
`.claude/skills/mcp-steering`.

## Catalog data

From `apps/catalog`:

```sh
scripts/fetch-kspd.sh    # KSPD captures from the khaosd API
scripts/fetch-voices.sh  # voices and provider status
scripts/fetch-all.sh     # both, in order
```

The daemon port comes from `~/.khaos/runtime.json`. These scripts require the
live daemon only while capturing; committed JSON is used at build and runtime.
They do not write `contrast-allow.json` or `contrast-audit.json`.

Route every write to a committed capture through `write_json`. A bare
`> file` under `set -euo pipefail` truncates the committed capture before the
producer runs, and a failing producer leaves it at 0 bytes (#139).

## Release and publishing

GitHub Actions owns publishing, and one tag family releases everything. A
`lib-X.Y.Z` tag fires two workflows:

- `.github/workflows/lib-publish.yml` publishes `@khaos-machine/khaotik-ui` to
  npm through trusted publishing.
- `.github/workflows/catalog-pages.yml` runs the reusable gates, builds the
  catalog with the Pages base path on `ubuntu-latest`, and deploys it to
  <https://khaos-machine.github.io/khaotik-ui/>. The `github-pages` environment
  admits `lib-*` tags.

The gates run before the Pages build because `gates / gates` is required on
`main` but not strict, and a tag can point at any commit, so a tagged commit is
not known to be green.

There is no second release path. The signed desktop catalog, its updater and
its S3/CloudFront deploy were removed by D95 (#12, landed in #22), and no
workflow fires on any other tag.

**The newest `lib-*` release holds `latest`.** Cut it with
`scripts/release-lib.sh` rather than `gh release create` by hand:

```sh
scripts/release-lib.sh --dry-run   # every pre-publish guard, publishes nothing
scripts/release-lib.sh
```

It creates an annotated tag, publishes the Release with `--latest`, then
**reads `releases/latest` back and fails unless it is the new tag**, printing
the command that restores it. Passing the flag and the pointer holding are two
different claims and only the second one matters.

That inverts the rule this section carried while the desktop catalog existed.
GitHub's `latest` is repo-wide and last-publish-wins, so a library release then
had to pass `--latest=false` or take the pointer off the catalog's DMG. It did
so **six** times — `lib-0.11.0` through `lib-0.15.0` each held `latest` until
the next `v*` tag took it back, and `lib-0.20.0` held it from 2026-09-21 until
it was found and restored to `v0.17.0` on 2026-09-22. The five-times count is
inherited from the earlier record and is **not independently verifiable** — the
API reports only the current `isLatest`, never its history. The `lib-0.20.0`
occurrence was measured directly. Until 2026-09-22 that path had no script and
the rule lived only in prose here, and a rule that lives only in prose is
followed only by whoever reads it.

A release created by hand with `--target` needs the **full** SHA; an
abbreviated one is rejected as `Release.target_commitish is invalid`, which
reads like a tag problem and is not.

**No gate reads the root `package.json` version.** `check-consumer.mjs` reads
`pkg.exports` and never `pkg.version`, and the catalog only displays it
(`APP_VERSION` is read from the root `package.json`). A library version bump is
therefore a hand-check in both directions — a missing bump ships new API under
an old version, a wrong bump ships old API under a new one, and neither reds.
#43 shipped without its bump for exactly this reason. `lib-publish.yml` does
check that the tag matches `package.json`, but only after the tag exists.

Bump `version` in `package.json` and add the `CHANGELOG.md` entry in the pull
request, then run `npm install --package-lock-only` so `package-lock.json`'s
root version follows.
