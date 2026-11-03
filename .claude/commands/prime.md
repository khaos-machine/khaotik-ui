---
description: Load foundational context for the khaotik-ui component library
---

# Purpose

Orient yourself in khaotik-ui — the Khaos design system, built and maintained
here and shared with every Khaos app as `@khaos-machine/khaotik-ui`: tokens,
hand-authored Svelte 5 + Ark UI atoms and compositions, and the catalog
(`apps/catalog`), a Svelte + Tauri desktop app for playtesting them against
real KSPD data.

## How to read this repo

This file deliberately does **not** restate layout, versions, gates or release
rules. `AGENTS.md` governs and routes to the document that owns each topic;
read the owners, then confirm against the live tree.

| Question | Canonical source |
|----------|------------------|
| Routing, layout, conventions, releases | `AGENTS.md` |
| What is in flight, blockers, upstream facts | `CURRENT.md` — verify it, it rots |
| Change discipline, design-system invariants, gates | `RULES.md` |
| Toolchain, validation commands, tokens, catalog, publishing | `TOOLS.md` |
| What each path is and what may be edited | `WORKSPACE.md` |
| Why it was decided | `docs/decisions.md` (the D-register) |
| The catalog app — Svelte 5, Tauri, tests, signing | `apps/catalog/AGENTS.md` |

## Orient against the live tree, not a snapshot

```sh
git ls-files --others --cached --exclude-standard     # the file tree
node -p "require('./package.json').version"            # library version
git tag -l 'lib-*' | sort -V | tail -1                 # last library release
git tag -l 'v*' | sort -V | tail -1                    # last catalog release
grep -oE '^\| D[0-9]+' docs/decisions.md | grep -oE '[0-9]+' | sort -n | tail -1   # highest D-id
ls .claude/agents .claude/skills                       # this repo's roster
```

## Steps

1. Read `AGENTS.md`, `CURRENT.md` and `MEMORY.md`.
2. Read `RULES.md` and `TOOLS.md` before changing or running anything.
3. Run the commands above.
4. Skim `tokens/tokens.json`, `components/svelte/index.js` (the export list)
   and `package.json` (`scripts`, `exports`).
5. If the task touches the catalog, read `apps/catalog/AGENTS.md`.

## Report

Summarise: purpose, stack, structure, key files and entry points, current
versions and what is in flight — each with the command or `file:line` it came
from.
