# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`docs/decisions.md`**: this repository's decision register (the D-register). It stands in for `docs/adr/`. It is a **table**, the rows are not in id order, and the file also has `### D<n>` standing-principle headings, so answer its highest id with the command in `AGENTS.md`, "The document set", never from prose. Read the rows that touch the area you're about to work in.
- **`../GLOSSARY.md`**: the workspace glossary, one level up in `khaos.machine`. This repository has no glossary of its own.
- **`../docs/adr/`**: the workspace ADRs. Read those that touch the area you're about to work in.

The workspace files are a different repository. Cite them by **section name**, not by line (`AGENTS.md`, "The document set").

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context:

```
khaos.machine/            ← workspace (another repository)
├── GLOSSARY.md
├── docs/adr/
└── khaotik-ui/           ← this repository
    └── docs/decisions.md
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `../GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts an existing D-register row or workspace ADR, surface it explicitly rather than silently overriding:

> _Contradicts D61 (Storybook retired), but worth reopening because…_
