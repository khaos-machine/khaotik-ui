---
description: End a khaotik-ui session — clean up what it made, update CURRENT.md, and commit the handoff to the khaos-home wiki
argument-hint: [what the next session should pick up]
---

# Purpose

Leave khaotik-ui and the machine as you found them, and leave the next session a
handoff. Clean up **only what this session made**; list anything else for the
operator's approval (`$home/TOOLS.md`, "Worktrees, scratch and disk — leave the
machine clean"; `$home/USER.md`, "Two things are never yours").

`CURRENT.md` is this repository's. The handoff is a khaos-home wiki page, never a
file in this repository (`$home/RULES.md`, "Commits and pull requests"). Run the
discovery block in `clock-in.md` first.

## Steps

1. **Live agents.** Run the check in `$home/AGENTS.md`, "Concurrent agents".
2. **Land or name unfinished work.** `main` is protected, so work lands by PR.
   Uncommitted or unpushed work is never discarded: push it, or list it under
   **Not landed**.
3. **Return your treehouse leases.** Use the path and id that
   `treehouse get --lease --json` printed. `treehouse status` lists every
   leased slot without saying whose it is. Delete the job's build output inside
   each lease (`dist/`, and any `node_modules` it installed), then run:

   ```sh
   treehouse return <path> --if-lease-id <id>
   ```

   `return` cleans and resets the slot. If it asks to discard changes, decline;
   the lease stays held under **Not landed**. Never `--force`, never `--all`.
4. **Delete your scratch**: your `mktemp -d` folders.
5. **Delete your merged branches.** Delete only branches this session created
   whose PR is `MERGED`: `git branch -d <b>` locally, and
   `gh api -X DELETE repos/khaos-machine/khaotik-ui/git/refs/heads/<b>` remotely.
6. **Update `CURRENT.md`.** Replace sections, never append; set **Last verified**.
   Change only what this session measured. `main` is protected, so commit it
   on a branch in a lease and open a PR.
7. **Write the handoff.** Update `$home/wiki/in-flight.md` and write the
   handoff as a new page `$home/wiki/handoffs/<YYYY-MM-DD>-<role>-<topic>.md`,
   titled `# Handoff: <role>, <topic> (<date>)`, linked at the top of the
   Handoffs table in `$home/wiki/index.md`. Cover the goal, what is done, what
   is in flight, what is next (`$ARGUMENTS`), open questions for the operator,
   and key files. Cite only paths a new session can open, never the scratchpad.
8. **Lint and commit the handoff in khaos-home, by name.** Run
   `(cd "$home" && just wiki-lint)`. khaos-home's `main` takes direct commits
   (`$home/RULES.md`, "Commits and pull requests"). Check
   `git -C "$home" diff --cached --name-only` first; if unrelated changes are
   staged, stop and coordinate. Never `-a`, which would sweep in another
   session's work:

   ```sh
   git -C "$home" add wiki/in-flight.md wiki/index.md wiki/handoffs/<page>
   git -C "$home" commit -m "docs(wiki): handoff <role>, <topic>"
   ```

## Report

- **Cleaned**
- **Not landed**
- **Leftovers**, each with its `du -sh` size, or "none"
- **Committed**: the `CURRENT.md` PR, the khaos-home handoff SHA, and whether it is
  pushed
