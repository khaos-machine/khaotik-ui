# Who links to the retired hostnames?

Research for [#15](https://github.com/khaos-machine/khaotik-ui/issues/15) (map #11). Read only: nothing found here was changed.

Measured 2026-11-03.

**Targets:** `khaotik-catalog.loswf.com`, `updates.loswf.com` (the `/khaotik-catalog` path and the host in general), and the archived `khaos-studio/khaotik-ui` repository, including its releases, issues and download links. `gh repo view khaos-studio/khaotik-ui` gives `isArchived: true`.

## Method

- **Local.** I ran `git grep -nIE 'khaotik-catalog\.loswf\.com|updates\.loswf\.com|khaos-studio/khaotik-ui'` in the root of `/Users/k/Projects/khaos.machine`, in each of its submodules, and in every git repository under `/Users/k/Projects`. That excludes `node_modules`, lockfiles, `dist`, `build` and `target`. I ran `rg` with the same pattern and exclusions over the peer directories that are not git repositories.
  - A second, broader pass looked for `khaotik-catalog|loswf\.com/khaotik|khaotik-ui/releases`. It found only one more file, `khaos-app/.env.example:23-24`. That is a false positive: it names the `khaotik-catalog.key` signing key file, not a host.
  - The heads I searched were root `9f1187fd`, khaos-app `9a75e00`, khaos-publisher `f5c77d77` and khaotik-ui `origin/main` `ad0d969`.
- **GitHub.** I ran `gh search code` (unquoted) with `--owner` set to `khaos-studio`, `khaos-machine` and `iksnae`.
- **Positive controls.**
  - The same `git grep` pattern finds `README.md:32` in this repository. `rg` finds it too, with a count of 1.
  - On GitHub, `khaos-studio` returns known hits in `khaos-studio/khaos.machine` `reports/`. `iksnae` is indexed: a generic query returns `iksnae/rise-and-code`.
  - **Quoted** queries returned zero even where hits were known to exist, so every count below comes from unquoted queries.
- **Coverage gap.** The `khaos-machine` org returns **nothing**, even for the bare word `khaotik`. GitHub has not indexed it since the repositories were re-created. Code search therefore cannot see khaos-machine's repositories, and the local `git grep` stands in for them.

## Findings

Classes:
- **runtime**: code or config that fetches or links at runtime
- **live doc**: a current document that still tells a reader to use the target
- **historical**: a record, which is not to be changed

"Breaks?" asks what happens when the hostnames go dark, or when the archived repository is deleted. Archived repositories stay readable, so a link into one keeps working until someone deletes it.

### khaos.machine (workspace root). Owner: root lead

| file:line | target | class | breaks? |
| --- | --- | --- | --- |
| `docs/site/reference/index.md:10` | catalog link `https://khaotik-catalog.loswf.com` | live doc, published (VitePress, `docs/.vitepress/config.mts:12` sets sitemap host `docs.khaosmachine.com`) | **Yes.** The link on the public docs site goes dead. |
| `GLOSSARY.md:45` | `_Repo: github.com/khaos-studio/khaotik-ui_` | live doc | Stale now, because it names the archived repo rather than `khaos-machine/khaotik-ui`. Breaks if the archive is deleted. |
| `docs/lessons.md:851` | `repos/khaos-studio/khaotik-ui/releases/latest` | historical (incident record) | No |
| `docs/plans/2026-09-01-pre-llm-project-state.md:22,357,461` | repo, PR list | historical | No (dead link only if the archive is deleted) |
| `docs/plans/2026-09-28-dialogue-takes.md:1247,1264,1472,1476` | PR #217 review links | historical | Only if the archive is deleted |
| `docs/plans/2026-10-21-headless-engine.md:493` | `gh release view … -R khaos-studio/khaotik-ui` | historical (plan) | No |
| `docs/plans/2026-10-24-stage3-analysis-display-plan.md` (5 lines, incl. :122) | issues on the archived repo | historical | Only if the archive is deleted |
| `docs/research/2026-10-07-github-alternatives.md:279` | old `git+ssh` pin | historical | No |
| `reports/**` (60 files: CI logs, PR receipts, shipment notes) | mixed | historical | No |

### khaos-app (submodule). Owner: khaos-app lead

| file:line | target | class | breaks? |
| --- | --- | --- | --- |
| `docs/design/2026-10-12-onboarding-inference-preference.md:667` | "filed on `khaos-studio/khaotik-ui`" | live doc | Stale now: it points gap-filing at the archived repo, where issues cannot be filed. |
| `docs/design/k1-speech-routing-row.md:583` | `khaos-studio/khaotik-ui/issues/223` | live doc (issue link) | Only if the archive is deleted. Issue numbers did not carry over to the re-created repo. |
| `docs/design/scene-read-retirement.md:24` | `…/issues/387` | live doc (issue link) | Same as above |
| `docs/design/voice-profiles.md:34,65,76,648,651` | `…/issues/235`, `…/issues/236` | live doc (issue links) | Same as above |
| `.claude/skills/publishing/SKILL.md:54` | "`updates.loswf.com` is closed" | live doc | No. It already records the host as closed. |
| `scripts/release.sh:339` | comment: publishes "NOT from updates.loswf.com" | runtime file, comment only | No. The host is set by `UPDATES_HOST` with default `preview.khaosmachine.com` (`:343`). |
| `docs/adr/ADR-0001-tauri-successor.md:36,114` | `updates.loswf.com` | historical (ADR) | No |
| `docs/adr/ADR-0008-releases-and-updates.md:10,13,29,109,112` | `updates.loswf.com/khaos-app/latest.json` | historical (ADR, superseded by ADR-0009) | No |
| `docs/adr/ADR-0009-distribution-on-khaosmachine.md:6,12` | `updates.loswf.com` | historical (ADR) | No |
| `docs/planning/ROADMAP.md:243` | struck-through "updates.loswf.com pattern" | historical | No |

Negative evidence: `khaos-app/package.json:28` pins `"@khaos-machine/khaotik-ui": "0.178.2"` from npm. The app has no git dependency on the archived repo.

### khaos-publisher (peer project). Owner: khaos-publisher lead

| file:line | target | class | breaks? |
| --- | --- | --- | --- |
| `docs/WEB-FOOTPRINT.md:220` | `updates.loswf.com` in a list of hosts that need defined root behaviour | live doc (inventory/TODO) | No. The entry becomes stale once the host is retired. |

### khaos-studio/khaotik-ui-shadow (GitHub only, private, not cloned). Owner: **unverified**, route to the operator

The repo's description reads "AgencyX engagement shadow (out-of-tree brain) for khaos-studio/khaotik-ui". It was last pushed on 2026-08-18. `khaos-studio/khaotik-ui` appears in `MEMORY.md`, `README.md`, `DECISIONS.md`, `CLIENT-PROFILE.md` and `ENGAGEMENT-HISTORY.md`. All of these are historical engagement records, and none breaks. I did not read the line numbers, because I did not clone the repo.

### khaotik-ui (this repo). Covered by #12 and #13, so listed only

These are the live runtime references:
- `apps/catalog/src-tauri/tauri.conf.json:31`, the updater endpoint. **Installed copies of the desktop catalog poll it. Once it goes dark they stop receiving updates, and nothing in the repo can reach them.**
- `apps/catalog/index.html:17,18,27`, the og/twitter URLs.
- `apps/catalog/scripts/release.sh:109,120,139,145,204,272,277`
- `apps/catalog/scripts/deploy-web.sh:2,5,46`
- `apps/catalog/scripts/make-og-image.sh:12`

Comments only: `apps/catalog/src/editor/storage.js:8`, `apps/catalog/src/editor/published.test.js:50`, `apps/catalog/vite.config.js:15`.

These are the live docs:
- `README.md:32`
- `AGENTS.md:145,158,159,209,293,294`
- `CURRENT.md:25,26`
- `TOOLS.md:210`
- `apps/catalog/AGENTS.md:307,315,318`
- `apps/catalog/README.md:15,17`
- `docs/using-the-library.md:25`, which tells consumers to pin `github:khaos-studio/khaotik-ui#<sha>`
- `.claude/skills/claude-design/SKILL.md:44`
- `.claude/skills/publishing/SKILL.md:20,57`
- `.claude/skills/tauri/SKILL.md:5,178,184,226,243`

These are historical: `CHANGELOG.md` (54 lines) and `docs/decisions.md:181` (D61).

`scripts/check-issue-refs.mjs:15` and `scripts/check-issue-refs.test.sh:62` are fixture or explanatory text in the issue-reference gate. They are not links.

## Clean (zero hits, controls above)

Workspace submodules: khaos-custody, khaos-foundation, khaos-manager, khaos-synth, khaos-tools, khaos-tui, khaosstorage, KSPD.

Peer git repositories: every other git repository under `/Users/k/Projects`. That covers every scanned repository except the four that had hits, including `loswf.com`, `khaosmachine.com` and `khaos-cloud`.

Peer directories that are not git repositories: AirTrafficControl, ambisphere, CloutChasers*.kspd, godseye-interstitial, hustlr-references, khalidmills.com, Khaos-Developer-Repo-Backup, khaos-publisher-worktrees, loswfx-modelcmp, screnplay-curator, story-*, "untitled folder".

GitHub: `iksnae` has no hits. `khaos-studio` has no hits beyond the four repos above. `khaos-machine` could not be searched (see the coverage gap under Method).

## Summary

Outside khaotik-ui there are two real breakages:
- The root docs site link: `docs/site/reference/index.md:10`, root lead.
- The installed desktop catalogs' updater feed: `tauri.conf.json:31`, khaotik-ui, already under #12/#13.

Three live docs are stale but not broken:
- root `GLOSSARY.md:45`
- khaos-app `docs/design/2026-10-12-onboarding-inference-preference.md:667`
- khaos-publisher `docs/WEB-FOOTPRINT.md:220`

The issue links in khaos-app's design docs break only if the archived repo is deleted. Everything else is historical.
