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

## Catalog

Browse every component at [khaotik-catalog.loswf.com](https://khaotik-catalog.loswf.com).

## Develop

```bash
npm ci
npm run dev --workspace apps/catalog    # the catalog in a browser
npm test --workspace apps/catalog       # the test suite
npm run check-coverage                  # catalog, taxonomy, consumer, compile, export count
npm run check-types                     # shipped .d.ts are current
```

## Release

A `lib-*` tag publishes the library to npm. A `v*` tag ships the catalog.
Changes are in [`CHANGELOG.md`](CHANGELOG.md), and working conventions in
[`AGENTS.md`](AGENTS.md).
