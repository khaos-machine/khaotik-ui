# Current

Perishable repository state. Verify it against `git`, manifests, GitHub, and
the release page before relying on it. **Everything here rots.** The 2026-09-01
version of this file survived four days and three minor releases, and described
a library three versions behind. The 2026-09-05 version then survived
seventeen days and repeated the same failure — library `0.18.0` against a
shipped `0.20.1`, and a closed issue listed as blocking.

**Last verified:** 2026-09-23

**Two shapes are banned here**, because both produced a wrong document above:

- **No counts and no run tallies.** A number written here is wrong the next
  time anything runs. Record the command that answers it.
- **Every claim that can go stale names the event that kills it.** A claim a
  reader can falsify is one a reader will notice; a bare assertion is not.

## Shipped surfaces

- Library package: `@khaos-machine/khaotik-ui`, marker tag and Release `lib-*`.
- Catalog app: version in `apps/catalog/src-tauri/tauri.conf.json`; release
  tag `v*`.
- Catalog web: `https://khaotik-catalog.loswf.com`.
- Desktop updater feed: `https://updates.loswf.com/khaotik-catalog/latest.json`.
- Library: `@khaos-machine/khaotik-ui` on npm, published by `lib-publish.yml` on each `lib-*` tag.

Do not read versions from prose — these answer from the repository:

```sh
git tag -l 'lib-*' | sort -V | tail -1
node -p "require('./package.json').version"
node -p "require('./apps/catalog/src-tauri/tauri.conf.json').version"
grep -c '^export' components/svelte/index.js                    # export count
```

`releases/latest` does **not** answer either version question; see `TOOLS.md`.

The library and catalog version independently. A `v*` tag triggers the catalog
release workflow; `lib-*` is a library marker and triggers no release.
Consumers pin a readable `lib-*` tag rather than `main` or a bare SHA.

## Known consumers

- **khaos-app** owns integration; this repository owns UI, and a component it
  needs is a contribution here rather than a local component there. Its pin is
  in `khaos-app/package.json` — read it there, not here. **Killed by:** any
  `lib-*` release this repository cuts, which makes any recorded pin stale
  until khaos-app bumps.

  **It reports defects against its pin, and those are the highest-signal
  reports this repository gets** — measured against a running khaosd rather
  than against the catalog's captures. #149, #156 and #157 all arrived that
  way, and #157 found a defect that had shipped an hour earlier through green
  gates. Read an issue from them as a measurement, and re-measure the parts
  that touch this repository rather than relaying the count: #157's "three
  marks unreachable" was three unreachable *by engine id*, which narrowed the
  blast radius and changed the fix.

- **Three provider vocabularies reach these components, and the third is a
  different DOMAIN rather than a third spelling.** Settled 2026-09-23 across
  khaotik-ui#157, khaos-manager#369 and khaos-tools#763, all measured.

  `provider-status.json` holds engine ids and `voices.json` display names —
  both khaosd's, both captured here. The third is `data.provider` on a prompt
  trace, which reaches `ProviderBadge` through khaos-app's Activity surface.

  **khaosd does not write it.** It is a verbatim passthrough, reading the field
  off the event and re-serving it without choosing a vocabulary or normalising
  anything — the khaos-manager lead cites `khaos-manager/internal/api/trace.go`
  at lines 300 and 172. The writer is **khaos-tools**, which stamps the
  lowercase catalog id it was asked to run; their lead cites
  `khaos-tools/providers/provider.go` at 106-115.

  **Both line citations are THEIRS, not measurements taken here** — neither
  file is in this repository and neither can be checked from it. They are
  recorded so the chain is followable, not as facts this repository verified.
  What was verified here is the consequence, below.

  Same convention as the engine ids, a different SET — these are analysis/LLM
  providers. **`polly` is `media.voice` only and cannot appear on a prompt
  trace. `gemini` CAN**, and an earlier version of this entry said otherwise.

  The capture in this repository contradicted the claim while it stood:
  `apps/catalog/src/data/provider-status.json` lists `gemini` as
  `analysis.text`, `media.image`, `media.voice`, `chat.project`,
  `chat.character`. Refuted by khaos-app against a live khaosd 0.20.0, then
  confirmed here from that file. **The disproof was already in this repository
  and the person asserting it did not read it.**

  **Two sources disagree on the analysis set and neither is discredited.**
  khaos-tools' is what the writer can be INVOKED with; khaosd's
  `/api/v1/settings` is what is SELECTABLE per capability. They can legitimately
  differ, and `openai-codex`, `claude-ai` and `mock` appear in the writer's set
  while this repository's capture carries none of them. Where they differ the
  writer's list governs what can land in a ledger. Adjudicating that is
  khaos-tools' and khaos-manager's, not this repository's — nothing here
  depends on it, because every id in either set either resolves or correctly
  renders the placeholder.

  **Measuring this table against that set found the #157 defect again, two ids
  over.** `openai-codex` and `claude-ai` are distinct ids from `openai` and
  `anthropic`; both drew the placeholder while the kit shipped their exact
  artwork. Fixed by alias. Six others — ollama, mistral, groq, lmstudio,
  deepseek, mock — genuinely have no artwork and correctly render the
  placeholder; `mock` is reachable via `--provider mock` and is a legitimate
  placeholder, not a gap.

  **A DECOY sits beside this.** Ledger events carry a top-level `producer` of
  `{"tool": "khaos-tools", "version": "v0.21.0"}` — the writing TOOL, not the
  model provider, and a different field from `data.provider`. Grep a ledger
  dump for `provider` and it surfaces first, reads as the answer, and is wrong
  with no error to say so. Flagged unprompted by the khaos-manager lead.

  **No prompt trace exists on any machine here**, which is why two probes came
  back empty and why neither was evidence about the spelling: khaos-app found
  none, and khaos-manager found 21 events across seven packages with none
  carrying `promptId`, which khaosd requires before an event is a prompt trace
  at all. **Killed by:** a capture containing a real prompt trace — at which
  point the transcribed id list in `apps/catalog/src/provider-marks.test.js`
  should be deleted and read from the capture like the other two.

## Active operating state

- The catalog is the only component catalog; Storybook and its deployment are
  retired by D61.
- CI calls `.github/workflows/gates.yml` on pull requests and pushes to `main`.
  The catalog release workflow calls the same reusable gates before signing.
  `gates / gates` is a required check with `strict: true`, so a branch cannot
  merge stale — expect to re-run it after `main` moves.
- The generated TypeScript declaration drift check is separate from
  `check-coverage` and is also enforced by the reusable workflow.
- The decision register's highest id is answered by the command below, not by
  prose. **The register is a TABLE, and the file also contains unrelated `###
  D<n>` headings in its standing-principles section** — a command matching
  headings answers `D21` and looks plausible. The rows are also not in id
  order, so the numeric sort is doing the work, not `tail`.

  ```sh
  grep -oE '^\| D[0-9]+' docs/decisions.md | grep -oE '[0-9]+' | sort -n | tail -1
  ```


## Blocked or blocking, as of 2026-10-21

**Verify this section before relying on it — `npm run check-issue-refs` does it
for you.** The 2026-09-22 rewrite of this file removed one closed issue and kept another
that had closed the same week, and it was then offered as available work.
A hand-maintained list of open issues goes stale silently, which is why there is
now a gate rather than a reminder.

None open.

## Recently unblocked

- **#83 / #123 — the capture script (2026-10-21, #420).** `fetch-kspd.sh`
  reads only the live khaosd API now: `/api/v1/dashboard/*` for characters,
  locations and scenes, each scene's `/api/dashboard/detail` for dialogue. It
  no longer touches khaos-tools at all, so #83's Ruling 3 (no khaos-tools
  surface) is met, and khaosd is the engine's own read surface over the
  package. The default path is `~/khaos/projects/broken-in-4-places.kspd`. A
  fresh capture is committed. Broken in 4 Places has no coverage report, so
  `coverage.json` keeps the earlier capture.

- **#61 — `UpdateNotice`.** It waited on khaos-manager#166 to decide between
  two flows that are not the same component: **(A)** the per-component manifest
  is repaired and `UpdateNotice` renders rows with a download/apply/restart
  lifecycle, or **(B)** the manifest stays dead and updating is one action about
  the whole install.

  **B was ruled.** khaos-manager#166 closed COMPLETED 2026-09-22T21:49:01Z, and
  khaos-manager PR #345 — *"retire the per-component self-update path (#166
  decision B)"* — deletes `internal/updater`, `internal/manifest`,
  `cmd/gen-manifest` and `release-cdn.sh`, reducing `/api/update/apply` to an
  installer-URL resolver.

  **It shipped.** khaos-manager `v0.18.0`, published 2026-09-23T16:06, and
  `v0.18.0...main` is identical. Measured with a positive control, because
  three absences and a probe that cannot see the tag look the same:

  ```sh
  gh api "repos/khaos-studio/khaos-manager/contents/internal/updater?ref=v0.18.0"   # ABSENT
  gh api "repos/khaos-studio/khaos-manager/contents/internal/manifest?ref=v0.18.0"  # ABSENT
  gh api "repos/khaos-studio/khaos-manager/contents/cmd/gen-manifest?ref=v0.18.0"   # ABSENT
  gh api "repos/khaos-studio/khaos-manager/contents/go.mod?ref=v0.18.0"             # PRESENT — control
  ```

  **This line said the opposite for a day, and the reason is worth keeping.**
  Measured 2026-09-22 against `v0.16.1`, the retirement was genuinely on `main`
  and in no release — the tag predated the merge by 25 minutes. That reading
  was correct when taken and false by the next morning, because `v0.17.0` and
  `v0.18.0` shipped in between. **A measurement has an age.** Neither of this
  file's usual failure modes covers it: nothing was misjudged and nothing was
  miscounted — it was an accurate reading of a world that then moved. Re-measure
  an upstream claim before acting on it, however carefully it was taken.

  **#61's condition is met regardless**, because its text asks that
  khaos-manager#166 *resolve which path ships*, not that it ship. It is
  resolved. `UpdateNotice` is flow B — a version line and one action about the
  whole install, not per-component rows. It needs a shape and a plan; it no
  longer needs an upstream decision.

## Upstream facts that decide work here

- **khaosd 0.11.0** renames the composition payload's screen-time keys —
  `duration` -> `durationMs`, `start` -> `startMs`, integer milliseconds, with
  the old keys GONE. The library decodes 0.11.0 as of `lib-0.19.0`. Whether the
  locally deployed daemon has moved is a measurement, not a fact recorded here;
  it is the only thing blocking a fresh composition capture for the catalog.
  **Killed by:** the local daemon upgrading.
- **KSPD RFC 0069** renames the wire key `duration` to `durationMs` and makes
  presence-assertion normative for JSON consumers. Its §3.1.1 hop clause —
  *"The property is not inherited across a hop"* — means what this repository
  must build depends on whether khaosd renames its own key or converts the unit
  under the old one.
- **khaos-tools installed and khaos-tools released are two different facts**,
  and #123 (closed 2026-10-21) turned on the installed one. `khaos-tools version` answers it;
  `gh release view -R khaos-studio/khaos-tools` answers the other. khaos-tools
  v0.20.0 also *changed what a word is*, so any recorded word count from an
  earlier version is not stale — it is counting a different thing.

Do not record an issue or branch as current from this snapshot alone. Use
`gh issue list`, `gh pr list`, `git status`, and `git log` for live work, then
update this file if the durable operating snapshot has changed.
