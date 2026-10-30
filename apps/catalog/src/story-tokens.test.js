import { describe, it, expect } from 'vitest'
import * as brandkit from '@khaos-machine/khaotik-ui/tokens/parse.js'
import css from '@khaos-machine/khaotik-ui/tokens/tokens.css?raw'

// The regression guard for the crash that collapsed the two token parsers into
// one. It lives here because the library has no test surface of its own —
// `apps/catalog` is it (CLAUDE.md) — and because the parser is exercised only
// in a browser otherwise: it throws at MODULE LOAD, and `build-storybook` still
// succeeds because module evaluation happens at runtime. So a defect here ships
// green and only appears when someone opens the published catalog.
//
// That is exactly what happened. There were TWO parsers over the same
// `tokens/tokens.css`, each with a hardcoded family list, and the warm-gray
// migration updated one and not the other. The story copy threw
// `colour family "grey" parsed with no rungs`, taking every BrandKit story
// down, and `warm` — the family the whole theme is built on — never rendered at
// all. There is now one parser (`tokens/parse.js`) and its families are derived
// from the generated file; these tests hold that line.
//
// The full parser suite is token-parse.test.js. This file is deliberately
// narrow: it asserts only what the crash was about.

describe('tokens/parse.js — the derived family list', () => {
  it('parses the families the generated tokens.css actually declares', () => {
    const declared = [
      ...new Set(
        [...css.matchAll(/--([a-z]+)-\d+\s*:/g)].map((m) => m[1]),
      ),
    ].sort()
    const parsed = brandkit.colors.map((c) => c.family).sort()

    expect(parsed).toEqual(declared)
  })

  it('carries the warm family the theme is built on', () => {
    const warm = brandkit.colors.find((c) => c.family === 'warm')
    expect(warm).toBeDefined()
    expect(warm.rungs.length).toBeGreaterThan(0)
  })

  it('carries no ladder the palette has retired', () => {
    const families = brandkit.colors.map((c) => c.family)
    expect(families).not.toContain('grey')
    expect(families).not.toContain('indigo')
  })

  it('gives every parsed family at least one rung', () => {
    for (const { family, rungs } of brandkit.colors) {
      expect(rungs.length, `family "${family}" parsed with no rungs`).toBeGreaterThan(0)
    }
  })

  it('still parses the other categories the BrandKit story contracts to show', () => {
    // the story reads the DARK surface for the theme-dependent categories;
    // radius and type are declared once and are theme-blind
    for (const key of ['semantic', 'status', 'statusCompat']) {
      expect(brandkit.byTheme.dark[key].length, `${key} parsed empty`).toBeGreaterThan(0)
    }
    for (const key of ['radius', 'spacing', 'type']) {
      expect(brandkit[key].length, `${key} parsed empty`).toBeGreaterThan(0)
    }
  })
})
