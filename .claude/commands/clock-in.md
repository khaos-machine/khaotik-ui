---
description: Start a khaotik-ui session where the last one stopped — read the handoff, re-measure it, then pick up the work
argument-hint: [role or topic to pick up]
---

# Purpose

Run this after `/prime` to pick up where `/clock-out` left off. A handoff is a
claim about the moment it was written, so re-measure it before acting on it.
`CURRENT.md` is this repository's; the handoff is the workspace's, one level
up.

## Steps

1. **Read** `CURRENT.md`, then the newest khaotik-ui section of
   `../HANDOFF.md`, or the newest one for `$ARGUMENTS`.
2. **Live agents.** Run the check in `../AGENTS.md`, "Concurrent agents". Work
   a live session owns is not yours.
3. **Re-measure each claim** with:
   - `gh pr view <n> -R khaos-machine/khaotik-ui`;
   - `gh issue view <n> -R khaos-machine/khaotik-ui`;
   - `treehouse status`;
   - `git -C .. ls-tree HEAD khaotik-ui`.

   Sort each claim into **done since**, **still open** or **changed**.
4. **Note what was left behind**: leases, unmerged branches, and **Not
   landed** items. Report them; do not delete them.
5. **Ask with `AskUserQuestion`** if any of these hold:
   - the handoff has open questions;
   - two sources disagree;
   - more than one next step is possible and nothing ranks them;
   - the step needs scope K has not cleared.

   Ask about scope, product and priority only (`../AGENTS.md`, non-negotiable
   11), and record each answer in `CURRENT.md` in K's own words.
6. **Pick up the work.** Say what you are starting and why. A plan's order in
   `docs/plans/` stands.

## Report

**Picked up**, **Done since**, **Changed**, **Left behind**, **Asked**.
