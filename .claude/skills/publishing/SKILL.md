---
name: publishing
description: >
  How a change in khaotik-ui reaches npm, the catalog site and the signed
  desktop app. Publishing runs in CI on GitHub-hosted runners, never by hand.
  Covers what to verify first, what each tag releases, and how to show someone
  an unreleased change.
---

# Publishing khaotik-ui

**Publishing is CI's job. Do not run the release or deploy scripts yourself.**

The repository is public (`khaos-machine/khaotik-ui`), so its Actions minutes
are free. Two tag families, two workflows:

| Tag | Releases | Workflow | Where it lands |
| --- | --- | --- | --- |
| `lib-*` | the library | `lib-publish.yml` | npm, `@khaos-machine/khaotik-ui` |
| `v*` | the catalog app | `catalog-release.yml` | signed DMG on the GitHub release, `updates.loswf.com`, `khaotik-catalog.loswf.com` |

## Verify before you tag

```bash
npm test --workspace apps/catalog   # vitest, the only test surface in this repo
npm run check-coverage              # fixture, taxonomy, consumer, compile, export count
npm run check-types                 # the shipped .d.ts have not drifted
```

Every gate exits **0** clean, **1** with named gaps, or **2** when it could not
run. **A 2 is a red, not a pass.**

Two defect classes pass every gate and need source-read tests: a CSS rule the
kit references but does not ship (jsdom resolves no stylesheets), and a module
that throws at evaluation. See `apps/catalog/src/utilities.test.js` and
`story-tokens.test.js`.

## The library: `lib-*`

1. Bump `version` in `package.json` and add the `CHANGELOG.md` entry, in the
   pull request.
2. After it merges, run `scripts/release-lib.sh` on `main`. It pushes an
   annotated `lib-<version>` tag and a GitHub release with `--latest=false`, so
   the catalog keeps `latest`.
3. `lib-publish.yml` checks the tag matches `package.json` and runs
   `npm publish` with npm trusted publishing: no token, provenance attached.

The package ships only `components/`, `tokens/` and `assets/` (the `files` list
in `package.json`). Check a change to that list with `npm pack --dry-run`.
Consumers pin an exact version, so a breaking change reaches them only when they
upgrade.

## The catalog app: `v*`

`catalog-release.yml` runs the gates, then `apps/catalog/scripts/release.sh` on
`macos-latest`. That script signs, notarizes and staples the app, publishes the
updater artifacts and `latest.json` to `updates.loswf.com`, drafts the GitHub
release with the DMG, and last calls `apps/catalog/scripts/deploy-web.sh` to
publish the catalog site.

Its credentials are repository or org secrets: the Developer ID certificate,
the Apple notarization credentials, the Tauri updater key, and AWS keys for
account `997901679385`. Both scripts refuse any other AWS account.

Three version files move in lockstep, and `release.sh` reads `tauri.conf.json`
when `--version` is omitted, so that file wins on drift:

- `apps/catalog/src-tauri/tauri.conf.json`
- `apps/catalog/src-tauri/Cargo.toml`
- `apps/catalog/src/fixtures.js` (`APP_VERSION`)

The GitHub release is a **draft** until someone runs
`gh release edit vX.Y.Z --draft=false`. The updater feed is live before that, so
installed apps are offered the update regardless.

## Showing someone an unreleased change

Landing on `main` publishes nothing. Run it locally:

```bash
npm run dev --workspace apps/catalog   # every component against real data, both themes
```

## Reference

- `.github/workflows/lib-publish.yml` and `scripts/release-lib.sh`, the library path
- `.github/workflows/catalog-release.yml` and `apps/catalog/scripts/release.sh`, the app path
- `.claude/skills/tauri/SKILL.md`, signing and the updater in depth
- `apps/catalog/AGENTS.md`, the catalog's release checklist
