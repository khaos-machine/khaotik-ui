# Claude Code configuration

@AGENTS.md

`AGENTS.md` is the governing entrypoint and routes to the rest of the modular
document set. Nothing from those files is repeated here. This file holds only
Claude Code harness information.

## Directory-scoped instructions

Claude Code discovers nested `AGENTS.md` files by path. Before touching
`apps/catalog/`, read `apps/catalog/AGENTS.md`; it is authoritative for that
subtree's Svelte 5, Tauri, test, data-capture, signing, notarization, and updater
procedures.

## Project toolkit

`.claude/` contains project-local agents, commands, skills, settings, and
launch configuration. Discover the live roster from the directory instead of
copying counts into prose; counts drift as the toolkit changes.

Relevant project skills include:

- `svelte` for Svelte 5 component work.
- `tauri` for the desktop shell.
- `tokens` for BrandKit token work.
- `writing-tests` for Vitest coverage.
- `mcp-steering` for the debug-only catalog bridge.
- `publishing` for authorized release work.

Load the skill that matches the task before changing its surface. A named skill
must exist in this repository; do not assume a parent workspace skill is
available.

## Where the gate contract went

The gate list, the 0/1/2 exit contract, and the two defect classes that are
invisible to every gate now live in `RULES.md` (Testing and delivery) and
`TOOLS.md` (Required validation). They are not repeated here.

**One of them was nearly lost in this split and is called out so it is not lost
in the next one.** The paragraph naming jsdom — *jsdom resolves no stylesheets,
so a rendered assertion about styling passes whether the rule exists or not* —
had no owner among the seven new files when they were written, and deleting it
from here would have deleted it from the repository. It is now in `RULES.md`
with the two issues that prove it (#116, #113). A decomposition is only safe if
every paragraph lands somewhere; check that before removing one.

## Diagnostics

Editor diagnostic streams can be stale while files or language servers are
updating. Treat them as a lead, not a verdict. Trust the submitted diff and the
configured npm, Vitest, Vite, declaration, and Tauri validation commands. Do
not stop or overwrite another in-flight change because an editor reports a
transient diagnostic.
