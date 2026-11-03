---
name: publishing
description: >
  How a change in khaotik-ui reaches npm and the catalog site on GitHub Pages.
  Publishing runs in CI on GitHub-hosted runners, never by hand. Covers what to
  verify first, what a `lib-*` tag releases, and how to show someone an
  unreleased change.
---

# Publishing khaotik-ui

**Publishing is CI's job. Do not run the release steps by hand beyond
`scripts/release-lib.sh`.**

The repository is public (`khaos-machine/khaotik-ui`), so its Actions minutes
are free. One tag family, two workflows:

| Tag | Workflow | Where it lands |
| --- | --- | --- |
| `lib-*` | `lib-publish.yml` | npm, `@khaos-machine/khaotik-ui` |
| `lib-*` | `catalog-pages.yml` | the catalog, <https://khaos-machine.github.io/khaotik-ui/> |

There is no second release path. The signed desktop catalog, its updater and
its S3/CloudFront deploy were retired by D95, and no workflow fires on any other
tag.

## Verify before you tag

```bash
npm test --workspace apps/catalog   # vitest, the only test surface in this repo
npm run check-coverage              # fixture, taxonomy, consumer, compile, export count
npm run check-types                 # the shipped .d.ts have not drifted
npm run check-icons                 # the shipped icon stylesheet matches Phosphor
```

`TOOLS.md`, "Required validation", has the full set `gates.yml` runs. Every gate
exits **0** clean, **1** with named gaps, or **2** when it could not run. **A 2
is a red, not a pass.**

Two defect classes pass every gate and need source-read tests: a CSS rule the
kit references but does not ship (jsdom resolves no stylesheets), and a module
that throws at evaluation. See `apps/catalog/src/utilities.test.js` and
`story-tokens.test.js`.

## Releasing: `lib-*`

1. Bump `version` in `package.json`, run `npm install --package-lock-only` so
   the lockfile's root version follows, and add the `CHANGELOG.md` entry, all in
   the pull request.
2. After it merges, run `scripts/release-lib.sh` on `main`
   (`--dry-run` first runs every guard and publishes nothing). It pushes an
   annotated `lib-<version>` tag, creates the GitHub release with `--latest`,
   and fails unless `releases/latest` is the new tag afterwards.
3. `lib-publish.yml` checks the tag matches `package.json` and runs
   `npm publish` with npm trusted publishing: no token, provenance attached.
4. `catalog-pages.yml` runs `gates.yml`, builds the catalog with the Pages base
   path and deploys it. The `github-pages` environment admits `lib-*` tags. The
   catalog shows the library version, because `APP_VERSION` is read from the
   root `package.json`; nothing else needs a bump.

The package ships only `components/`, `tokens/` and `assets/` (the `files` list
in `package.json`). Check a change to that list with `npm pack --dry-run`.
Consumers pin an exact released npm version — the version a `lib-*` tag
publishes, never `main` or a bare SHA — so a breaking change reaches them only
when they upgrade.

## Showing someone an unreleased change

Landing on `main` publishes nothing. Run it locally:

```bash
npm run dev --workspace apps/catalog   # every component against real data, both themes
```

To see it the way Pages serves it, under the `/khaotik-ui/` base:

```bash
cd apps/catalog
npm run build -- --base=/khaotik-ui/ && npm run preview -- --base=/khaotik-ui/
```

## Reference

- `.github/workflows/lib-publish.yml` and `scripts/release-lib.sh`, the release
- `.github/workflows/catalog-pages.yml`, the catalog site
- `TOOLS.md`, "Release and publishing", and `AGENTS.md`, "Releases"
- `apps/catalog/AGENTS.md`, "Publishing — GitHub Pages, on each `lib-*` tag"
