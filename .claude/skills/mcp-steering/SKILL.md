---
name: mcp-steering
description: Which MCP servers to use in khaotik-ui and which to ignore. Use before reaching for any mcp__* tool here — especially browser automation for the catalog, and open-pencil for design input. Covers the token-direction rule that keeps design tooling from overwriting the BrandKit.
---

Many MCP servers are connected to this session. Most have nothing to do with a
Svelte component library, and reaching for the wrong one wastes a round-trip at
best. This is the routing table for **this** repo.

## First rule — the repo's own commands beat a browser

A component library's gates are already scripted and they are faster, cheaper
and more reproducible than driving a browser:

```bash
npm run check-coverage               # fixture + taxonomy + consumer + compile
cd apps/catalog && npm test          # vitest, the only test surface
```

Reach for a browser only when the question is genuinely **visual or
interactive** — does the segmented indicator actually slide, does the menu trap
focus, does the light theme read correctly. Those cannot be answered from a
build log. "Did it compile" can, and should be.

## Browser — the catalog

Two servers can drive Chrome. Pick one and stay in it for the task; mixing them
mid-flow just confuses which tab is which.

- **`claude-in-chrome`** — the default. Operates the user's existing Chrome
  session. Load the tools in ONE `ToolSearch` call (the `select:` query takes a
  comma-separated list), never one call per tool. Call
  `tabs_context_mcp` first; create a new tab with `tabs_create_mcp` rather than
  reusing a tab id from earlier in the session.
- **`chrome-devtools`** — reach for this when the question is performance, a
  network waterfall, or a Lighthouse/accessibility audit rather than
  interaction.

What to point them at:

```bash
cd apps/catalog && npm run dev       # the catalog shell (Vite prints the port)
```

Two traps specific to this repo:

- **The theme lives on the root element.** The catalog stamps
  `document.documentElement.dataset.theme` from its app shell
  (`apps/catalog/src/App.svelte:39`), seeded before first paint. Dark is the
  default; light is `html[data-theme="light"]`. If you are verifying a colour,
  verify **both** — a token that reads fine on the dark default can fail in
  light.
- **Never trigger a JS dialog.** `alert`/`confirm`/`prompt` block every
  subsequent extension command and the session goes unresponsive until the user
  dismisses it by hand. Use `read_console_messages` (with the `pattern` filter)
  instead of dialog-based debugging.

## Tauri — the catalog desktop app

`.mcp.json` at the repo root registers **`@hypothesi/tauri-mcp-server`**
project-scoped, so it travels with the repo rather than living in one machine's
user config. It drives a **running** app over a local driver session — it does
not read the project directory, so nothing needs to point it at `apps/catalog`.

The app half was already built: `src-tauri/Cargo.toml:25-29` declares an
optional `mcp-bridge` feature over `tauri-plugin-mcp-bridge` (the dependency
is `Cargo.toml:38`), and `src-tauri/src/lib.rs:13-20` initialises it behind
`#[cfg(all(debug_assertions, feature = "mcp-bridge"))]`. **Both gates are
deliberate** — the feature is off by default and `debug_assertions` means even
enabling it cannot produce a release build that listens. The bridge is a
WebSocket that executes arbitrary JavaScript in the webview, which is why
`lib.rs:17` pins `bind_address("127.0.0.1")` rather than taking the plugin's
`0.0.0.0` default. Do not relax either gate or that bind address.

The bridge's `mcp-bridge:default` permission is granted **at runtime**, in
`setup`, with `add_capability` to the `main` window only, inside the same
`cfg` gate (`lib.rs:28-36`). **Do not** add it to
`capabilities/default.json` as the plugin's README says: a release build
compiles that file, and nothing a release build compiles names the bridge.

```bash
cd apps/catalog
npm run dev:mcp    # tauri dev --features mcp-bridge — the bridge is live
npx tauri dev      # normal desktop run, no bridge
npm run dev        # Vite only, browser — faster for anything not desktop-specific
```

All three need cargo on PATH: `export PATH="$HOME/.cargo/bin:$PATH"`.

**Reach for it when the question is desktop-specific** — does the window
render correctly, does a stylesheet cascade wrong in WKWebView, what does the
real app's DOM look like. For anything that reproduces in a browser, `npm run
dev` plus `claude-in-chrome` is a much shorter loop than a Rust rebuild. The
server also exposes `get_setup_instructions`; call it if the driver session
will not connect.

## Playwright — a CLI skill, not an MCP server

`playwright-cli` is a **skill** that drives the Playwright CLI. It is not an
MCP server and does not appear as `mcp__*` tools. Use it for scripted,
repeatable browser runs — a flow you want to re-run — where the ad-hoc
`claude-in-chrome` session is the wrong shape. Both ultimately drive a browser;
the difference is whether the run is a script you keep or a session you steer.

## open-pencil — design input, one direction only

`open-pencil` is configured at user scope and is a design/vector editor with a
large tool surface — documents, pages, shapes, components, variables, plus
analysis (`analyze_colors`, `analyze_typography`, `analyze_spacing`) and
export/codegen (`design_to_tokens`, `design_to_component_map`,
`get_codegen_prompt`).

**It is not currently part of this repo's workflow.** Nobody has adopted it
here, so treat it as available rather than expected: do not route design work
through it unless the operator asks. This section exists because its
`design_to_tokens`-shaped tools look like they belong in a design-system repo,
and that is precisely the trap.

**It is an input to a conversation, never a writer of this repo's tokens.**

The token chain in this library runs one way, and it is a recorded decision:

```
tokens/tokens.json   →  tokens/build-tokens.py  →  tokens/tokens.css
(source of truth)                                  (generated, never hand-edited)
```

`docs/decisions.md` D44 adopts Andrew's BrandKit as the token source of truth
and D49 takes it whole. So:

- **Do** use open-pencil's analysis tools to read a design, compare it against
  the shipped palette, and describe a gap in words.
- **Do** route a genuine gap the way the repo already routes them — into
  `docs/harvest-khaos-machine-tokens.md`, which exists precisely to carry token
  requirements to Andrew. Its "Gaps — need Andrew's definition" section is the
  established form.
- **Do not** write `tokens.css` from a design tool. It is generated.
- **Do not** write `tokens.json` from a design tool either. That is Andrew's
  register, and a value invented here is exactly the fabrication
  `harvest-khaos-machine-tokens.md:75-78` says must never happen: *"the gaps
  above are reported (routed to Andrew) and never guessed. No token is
  fabricated."*

## Not for this repo

These are connected but have no business in a Svelte component library. If a
task seems to want one, the task has drifted:

`blender` · `Roblox_Studio` · `stripe` · `Gmail` · `Google Drive` · `Notion`

The exception is a direct, explicit instruction from the operator naming the
server. Absent that, do not reach for them.

## The data rule still applies

`AGENTS.md` holds the catalog to real data from the live khaosd daemon, with
gaps reported rather than papered over. Nothing an MCP server returns changes
that: a value fetched from a design tool, a browser, or any other server is
**not** a substitute for the daemon's data, and must not be written into
`apps/catalog/src/data/*.json`. That file set has exactly one producer —
`apps/catalog/scripts/fetch-all.sh`.
