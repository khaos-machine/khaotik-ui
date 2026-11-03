# catalog

The **component catalog** — a Svelte + Vite + Ark UI web app that previews the
library's atoms and compositions against real KSPD data. It is the
device-playtest surface for khaotik-ui, and the library it previews is the
monorepo root (`@khaos-machine/khaotik-ui`).

It reports the library version it was built from: `APP_VERSION` is read from
the root `package.json`.

## Get it

Open <https://khaos-machine.github.io/khaotik-ui/> — nothing to install. It is
published to GitHub Pages on each `lib-*` tag, after the gates pass.

## Run

```bash
cd apps/catalog
npm install
npm run dev        # Vite (browser), http://localhost:5173
npm test           # vitest
npm run build      # static web build
npm run preview    # serve the build
```

Pages serves the site under `/khaotik-ui/`. To check a change under that base:

```bash
npm run build -- --base=/khaotik-ui/ && npm run preview -- --base=/khaotik-ui/
```

## Data

The demo data in `src/data/` is fetched from the live khaosd daemon — real,
never fabricated:

```bash
scripts/fetch-all.sh   # requires khaosd on 127.0.0.1
```

The committed JSON is the build-time source, so the build never needs the
daemon; it is only required when regenerating.

## Notes

See `AGENTS.md` for the full operating notes — stack, the D52 encoding, the
Svelte 5 gotchas, the testing quirks, and how the site is published.
