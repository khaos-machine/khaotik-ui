# Workspace

This file maps the repository and each path's ownership. Procedures live in
`TOOLS.md`; binding policy lives in `RULES.md`; product orientation lives in
`README.md`.

## Repository map

| Path | Owns | Notes |
| --- | --- | --- |
| `tokens/` | Design tokens and shared token utilities | `tokens.json` is source; `tokens.css` is generated; `tokens-extra.css` carries seven StatusTone aliases; `utilities.css` carries shared classes; `parse.js` is the single parser |
| `components/svelte/` | Shipped Svelte atoms and compositions | Components are hand-authored; adjacent declarations and `index.d.ts` are generated |
| `assets/placeholders/` | Shipped pre-production artwork | Keep assets small; real consumer artwork wins; read its `README.md` |
| `apps/catalog/` | Svelte 5 + Vite + Tauri 2 catalog | Has its own `AGENTS.md`, which governs the subtree |
| `docs/` | Decision register, consumer guidance, token history, plans | `decisions.md` owns design/architecture decisions; historical plans are not current instructions |
| `scripts/` | Coverage, taxonomy, consumer, compile, and declaration tooling | Root npm scripts are the supported interface |
| `.github/workflows/` | Pull-request gates and catalog release automation | `gates.yml` is reusable by CI and release |
| `.claude/` | Claude Code agents, commands, skills, settings, and launch config | Runtime configuration, not shipped library content |
| `.mcp.json` | Project-scoped MCP servers | The Tauri bridge drives a debug catalog build only |

## Ownership boundaries

- This repository is the source of truth for the Khaos design system. Consumer
  repositories import it; they do not copy its tokens, components, parser, or
  utility CSS.
- The root package is the library. `apps/catalog` consumes it through its local
  workspace dependency and must not maintain a token copy.
- `docs/decisions.md` records decided design and architecture. Do not infer a
  new token, component convention, or release contract from an old plan.
- Nested instructions narrow root guidance. Read `apps/catalog/AGENTS.md`
  before working anywhere below that path.

## Editable and generated paths

Source files are editable within task scope. The following have special
ownership:

- Edit `tokens/tokens.json`, then regenerate `tokens/tokens.css`.
- Edit `.svelte` sources and their JSDoc, then regenerate declarations. Never
  hand-edit `*.svelte.d.ts` or `components/svelte/index.d.ts`.
- Regenerate captured `apps/catalog/src/data/*.json` with the catalog scripts,
  except `contrast-allow.json` (human-reviewed source) and
  `contrast-audit.json` (manual MCP measurement). The fetch scripts do not own
  those two files.
- Update catalog version sources together as described in
  `apps/catalog/AGENTS.md`; `Cargo.lock` changes through Cargo, not by hand.
- Build output, dependency directories, and Tauri targets are generated and
  must not be treated as source.
