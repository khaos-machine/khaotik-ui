---
name: publishing
description: >
  How a change in khaotik-ui reaches the catalog site and the signed desktop
  app. Publishing runs in CI on the self-hosted runner —
  never by hand. Covers what to verify first, what a tag actually releases, and
  what to do when you just need to show someone a change.
---

# Publishing khaotik-ui

**Publishing is CI's job. Do not run the deploy or release scripts yourself.**

One workflow publishes, on the self-hosted macOS runner (`loswf-mini`):

| What | Where | Published by | Trigger |
| --- | --- | --- | --- |
| The catalog, browsable | `khaotik-catalog.loswf.com` | `catalog-release.yml` | tag `v*` |
| The signed desktop app + updater feed | GitHub release + `updates.loswf.com` | `catalog-release.yml` | tag `v*` |

**Everything now ships on a tag.** There used to be a second workflow,
`storybook-deploy.yml`, republishing a Storybook catalog to
`khaotik-ui.loswf.com` on any push to `main` — deliberately decoupled, so a token
change was visible without cutting a version. D61 retired Storybook and that
workflow with it, which means **there is no longer any way to publish a change
without a release.** If someone needs to see work in progress, run it locally
(below) rather than looking for a push-to-`main` deploy that no longer exists.

`khaotik-ui.loswf.com` no longer resolves — issue #40 deleted the bucket, the
CloudFront distribution and the DNS record on 2026-08-18. There is no redirect;
`khaotik-catalog.loswf.com` is the surviving site.

The credentials live on the runner and in org-level secrets, not on a
workstation: the Developer ID signing certificate, the Apple notarization
credentials, the Tauri updater signing key, and the AWS profile that owns the S3
buckets. **Andrew does not have that account access**, and neither should an
agent. A local `deploy-web.sh` run either fails on the account guard or, worse,
publishes from a machine whose state nobody can reproduce.

So the deploy scripts are documented here as *what CI runs*, not as what you run.

## Verify before you tag

In this order. These are the checks that are yours.

```bash
cd apps/catalog && npm test    # vitest — the ONLY test surface in this repo
cd -
npm run check-coverage         # fixture + taxonomy + consumer + compile
npm run check-types            # the shipped .d.ts have not drifted
```

`npm test` exists only at `apps/catalog`.

`check-coverage` runs four gates in order. Read the exit code — every one of them
uses the same convention:

- **0** — clean.
- **1** — named gaps; it prints what is missing.
- **2** — the check **could not run** (missing barrel, a fixture whose shape no
  longer parses, zero exports found). **A 2 is a red, not a pass.** Fix the input
  and re-run.

`check-compile` is the last of the four and is a real gate, not a preview: it is
the catalog's own vite build, and because `fixtures.js` imports all 46 exports,
building the catalog compiles every component. It took over that job from
`build-storybook` when Storybook was retired.

Two defect classes are invisible to all four gates and need source-read tests
instead: a CSS rule the kit references but does not ship (jsdom resolves no
stylesheets, so a rendered assertion passes either way), and a module that throws
at evaluation. Both have shipped green before — see
`apps/catalog/src/utilities.test.js` and `story-tokens.test.js`.

## What a tag releases

One `v*` tag publishes **all three** surfaces. The chain is worth knowing because
it is not obvious from the workflow file alone:

1. The workflow runs `apps/catalog/scripts/release.sh`, which signs, notarizes
   and staples the app, publishes the updater artifacts and `latest.json` to
   `updates.loswf.com`, tags, and drafts the GitHub release with the DMG.
2. **`release.sh` then calls `apps/catalog/scripts/deploy-web.sh` itself** as its
   last step — so the catalog site is published *transitively*, not as a
   workflow step of its own. It is the last thing a tag does; the workflow had a
   `Deploy Storybook (web)` step after it until D61.

The deploy script refuses to publish unless the resolved AWS account is
`997901679385`, so a wrong profile fails loudly rather than pushing the design
system into someone else's bucket.

Before tagging, three version files must move in lockstep — `release.sh` reads
`tauri.conf.json` when `--version` is omitted, so that file silently wins on
drift:

- `apps/catalog/src-tauri/tauri.conf.json`
- `apps/catalog/src-tauri/Cargo.toml`
- `apps/catalog/src/fixtures.js` (`APP_VERSION` — **not** `App.svelte`, which
  only imports it)

The GitHub release is created as a **draft**. Publishing it is a deliberate human
step (`gh release edit vX.Y.Z --draft=false`). Note the updater feed is already
live at that point, so installed apps are offered the update regardless.

## The library versions separately

The tag releases the **catalog app**. The library — `@khaos-machine/khaotik-ui` — releases
under its own `lib-*` tags (`scripts/release-lib.sh`), and `lib-publish.yml`
publishes each one to npm.

Consumers pin an exact npm version, so a breaking change reaches them only when
they upgrade.

## Just showing someone the change

The honest answer for a work-in-progress change is **local, not published**:

```bash
cd apps/catalog && npm run dev      # every component against real data, both themes
```

**Local is now the only unreleased option.** Landing on `main` no longer publishes
anything — `storybook-deploy.yml` was the push-to-`main` deploy and D61 removed it
along with Storybook. The next published thing a reviewer can see is whatever the
next `v*` tag ships, so either show them a local run or cut a release.

Publishing the catalog site is still not something to run by hand: it needs the
runner's AWS profile, and the account guard refuses anything but `997901679385`.

## Reference

- `.github/workflows/catalog-release.yml` — the trigger, the runner, the steps
- `apps/catalog/scripts/release.sh` — signing, notarization, updater, draft
- `.claude/skills/tauri/SKILL.md` — the release reasoning in depth
- `apps/catalog/AGENTS.md` — credentials, the runner, the release checklist
- `docs/decisions.md` — O7, the npm publishing question
