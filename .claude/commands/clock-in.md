---
description: Start a khaotik-ui session where the last one stopped — read the handoff, re-measure it, then pick up the work
argument-hint: [role or topic to pick up]
---

# Purpose

Run this after `/prime` to pick up where `/clock-out` left off. A handoff is a
claim about the moment it was written, so re-measure it before acting on it.
`CURRENT.md` is this repository's; handoffs are pages in the khaos-home wiki.

## Locate khaos-home

This repository is cloned at `<khaos-home>/repos/khaotik-ui`; a treehouse
lease's parent is not khaos-home, so start from the primary checkout, which git
lists first. Stop if discovery fails.

```sh
repo=$(git rev-parse --show-toplevel) || exit 1
primary=$(git -C "$repo" worktree list --porcelain | sed -n '1s/^worktree //p')
home=$(cd "$primary/../.." 2>/dev/null && pwd)
if [ -z "$home" ] || [ ! -f "$home/repos.tsv" ] || [ ! -f "$home/wiki/index.md" ]; then
  printf '%s\n' 'khaos-home not found; ask for its path.' >&2; exit 1
fi
printf 'Repository: %s\nkhaos-home: %s\n' "$repo" "$home"
```

## Steps

1. **Read** `CURRENT.md`, then `$home/wiki/index.md`, the newest khaotik-ui
   page under `$home/wiki/handoffs/` (or the newest for `$ARGUMENTS`), and
   `$home/wiki/in-flight.md`.
2. **Live agents.** Run the check in `$home/AGENTS.md`, "Concurrent agents:
   inspect before you touch a child repo". Work a live session owns is not
   yours.
3. **Re-measure each claim** with:
   - `gh pr view <n> -R khaos-machine/khaotik-ui`;
   - `gh issue view <n> -R khaos-machine/khaotik-ui`;
   - `treehouse status`;
   - `git -C "$repo" log --oneline -10 origin/main`.

   Sort each claim into **done since**, **still open** or **changed**.
4. **Note what was left behind**: leases, unmerged branches, and **Not
   landed** items. Report them; do not delete them.
5. **Ask with `AskUserQuestion`** if any of these hold:
   - the handoff has open questions;
   - two sources disagree;
   - more than one next step is possible and nothing ranks them;
   - the step needs scope the operator has not cleared.

   Ask about scope, product and priority only (`$home/AGENTS.md`, non-negotiable
   11), and record each answer in `CURRENT.md` in the operator's own words.
6. **Pick up the work.** Say what you are starting and why. A plan's order in
   `docs/plans/` stands.

## Report

**Picked up**, **Done since**, **Changed**, **Left behind**, **Asked**.
