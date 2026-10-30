# catalog

The **component catalog** — a Svelte + Tauri + Ark UI desktop app that previews
the library's atoms and compositions against real KSPD data. It is the
device-playtest surface for khaotik-ui, and the library it previews is the
monorepo root (`@khaos-machine/khaotik-ui`).

Currently at **0.20.0**.

## Get it

| | |
| --- | --- |
| **macOS app** | [Download the latest DMG](https://github.com/khaos-machine/khaotik-ui/releases/latest) — Developer-ID signed and notarized. Needs access to this **private** repo; the link 404s otherwise. |
| **In a browser** | [khaotik-catalog.loswf.com](https://khaotik-catalog.loswf.com) — the same catalog, nothing to install, no access needed |

The desktop app updates itself from `updates.loswf.com/khaotik-catalog`, so an
installed build offers the next release rather than needing a fresh download.
The Tauri-only Updates panel lives in Settings.

## Run

```bash
cd apps/catalog
npm install
npm run dev        # Vite (browser)
npm test           # vitest
npm run build      # static web build
npx tauri dev      # desktop app
npm run dev:mcp    # desktop app with the MCP bridge live (see below)
```

Anything touching Rust needs cargo on PATH first — it is not there by default on
these machines: `export PATH="$HOME/.cargo/bin:$PATH"`.

## The MCP bridge (dev only)

`npm run dev:mcp` is `tauri dev --features mcp-bridge`, which opens a WebSocket
on `127.0.0.1:9223` that the `@hypothesi/tauri-mcp-server` MCP server (registered
in the repo-root `.mcp.json`) drives — screenshots of the real window, the live
DOM, JS in the webview. It is the only way to catch a stylesheet that parsed fine
but cascaded wrong under WKWebView.

Off by default and gated on `debug_assertions`, so a release build can never
listen. Do not relax either gate or the explicit `127.0.0.1` bind — the socket
runs arbitrary JavaScript in the webview and the plugin's own default is
`0.0.0.0`.

## Data

The demo data in `src/data/` is fetched from the live khaosd daemon — real,
never fabricated:

```bash
scripts/fetch-all.sh   # requires khaosd on 127.0.0.1 + khaos-tools on PATH
```

The committed JSON is the build-time source, so neither the web nor the desktop
build needs the daemon; it is only required when regenerating.

## Notes

See `AGENTS.md` for the full operating notes — stack, the D52 encoding, the
Svelte 5 gotchas, the testing quirks, and the signing / notarization / updater
release procedure.
