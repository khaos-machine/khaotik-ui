# khaotik-ui

Svelte 5 components and design tokens for Khaos apps.

## Install

```bash
npm install @khaos-machine/khaotik-ui
```

Pin an exact version. Requires Svelte 5. Apache-2.0.

## Use

```js
import '@khaos-machine/khaotik-ui/tokens/tokens.css'
import '@khaos-machine/khaotik-ui/tokens/tokens-extra.css'
import '@khaos-machine/khaotik-ui/tokens/utilities.css'

import { Button, StatusPill } from '@khaos-machine/khaotik-ui/components/svelte'
```

All three stylesheets are required. Icons also need Phosphor's CSS. Each
component's props are documented in its shipped `.d.ts`, so your editor shows
them on hover.

[`docs/using-the-library.md`](docs/using-the-library.md) is the full guide:
theming, icons, assets and the component inventory.

Designers, and the agents working for them, start at
[`docs/design/README.md`](docs/design/README.md).

## Catalog

Browse every component at
[khaos-machine.github.io/khaotik-ui](https://khaos-machine.github.io/khaotik-ui/),
published with each library release.

## Develop

```bash
npm ci
npm run dev --workspace apps/catalog    # the catalog in a browser
npm test --workspace apps/catalog       # the test suite
npm run check-coverage                  # catalog, taxonomy, consumer, compile, export count
npm run check-types                     # shipped .d.ts are current
```

## Release

A `lib-*` tag publishes the library to npm and the catalog to GitHub Pages.
Changes are in [`CHANGELOG.md`](CHANGELOG.md), and working conventions in
[`AGENTS.md`](AGENTS.md).
