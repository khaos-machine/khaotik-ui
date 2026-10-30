import { describe, it, expect } from 'vitest'
import {
  colors,
  byTheme,
  radius,
  spacing,
  sizes,
  fonts,
  type,
  resolveRef,
} from '@khaos-machine/khaotik-ui/tokens/parse.js'

// The parser under test lives in the LIBRARY (`tokens/parse.js`), not in the
// catalog — the same arrangement as utilities.test.js and story-tokens.test.js.
// The library has no test surface of its own; `apps/catalog` is it (CLAUDE.md),
// so a library module that needs covering is covered from here.
//
// It matters more than usual for this one. The parser throws at MODULE LOAD,
// and `build-storybook` still succeeds because module evaluation happens at
// runtime — so a defect here ships green and only appears when someone opens
// the published catalog. That is exactly what happened once already; see
// story-tokens.test.js, which holds the specific line.

describe('BrandKit token parser', () => {
  // the semantic layer is only meaningful against a theme; dark is the default
  const { semantic, status, statusCompat } = byTheme.dark

  it('parses every colour family in declaration order, each rung a hex', () => {
    expect(colors.map((c) => c.family)).toEqual([
      'blue', 'gold', 'green', 'orange', 'red', 'violet', 'warm',
    ])
    for (const { family, rungs } of colors) {
      expect(rungs.length).toBeGreaterThan(0)
      for (const rung of rungs) {
        expect(rung.name).toMatch(new RegExp(`^${family}-\\d+$`))
        expect(rung.value).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('parses semantic tokens by role prefix, all var() references', () => {
    const prefixes = ['surface-', 'text-', 'action-', 'border-']
    expect(semantic.length).toBe(15)
    for (const token of semantic) {
      expect(prefixes.some((p) => token.name.startsWith(p))).toBe(true)
      expect(token.value).toMatch(/^var\(--[a-z0-9-]+\)$/)
    }
    // surface/then text/then action/then border, in source order
    expect(semantic[0].name).toBe('surface-base')
    expect(semantic[2].name).toBe('text-primary')
    expect(semantic[6].name).toBe('action-primary')
    expect(semantic[12].name).toBe('border-default')
  })

  it('parses the dark values, not the light block (reach probe)', () => {
    // dark: --text-brand:var(--gold-400); light: --text-brand:var(--gold-750).
    // If the light block ever leaks into the parse surface, this goes red.
    const brand = semantic.find((t) => t.name === 'text-brand')
    expect(brand.value).toBe('var(--gold-400)')
  })

  it('parses the six status tones x fg/bg/mark', () => {
    expect(status.length).toBe(18)
    for (const token of status) {
      expect(token.name).toMatch(/^status-(normal|warning|alarm|offline|accent|skipped)-(fg|bg|mark)$/)
      expect(token.value).toMatch(/^(var\(--[a-z0-9-]+\)|#[0-9a-f]{6})$/)
    }
  })

  it('parses the st-* compat tokens and excludes st-provis', () => {
    expect(statusCompat.length).toBe(16)
    for (const token of statusCompat) {
      expect(token.name).toMatch(/^st-/)
      expect(token.name).not.toMatch(/^st-provis/)
    }
  })

  it('parses radius and spacing in declaration order', () => {
    expect(radius.map((t) => t.name)).toEqual([
      'radius-sm', 'radius-md', 'radius-lg', 'radius-full',
    ])
    expect(radius.map((t) => t.value)).toEqual(['4px', '6px', '8px', '999px'])
    expect(spacing.map((t) => t.name)).toEqual([
      'spacing-2xs', 'spacing-xs', 'spacing-sm', 'spacing-md',
      'spacing-lg', 'spacing-xl', 'spacing-2xl',
    ])
  })

  it('parses the size and font tokens the shape and type views need', () => {
    expect(sizes.map((t) => t.name)).toEqual([
      'size-touch-target', 'size-stroke-hairline', 'size-stroke-focus',
    ])
    expect(sizes.map((t) => t.value)).toEqual(['48px', '1px', '2px'])
    expect(fonts.map((t) => t.name)).toEqual(['font-display', 'font-sans', 'font-mono'])
    // a stack, whole — the fallbacks are the load-bearing half
    expect(fonts[0].value).toContain('"Sora"')
    expect(fonts[0].value).toContain('sans-serif')
  })

  // ---- the unfiltered surface ------------------------------------------------
  //
  // Every other export here is a predicate, and a predicate's silence has two
  // causes that look identical from outside: the token is absent, or the
  // predicate never matched it. `all` is what makes the difference visible.

  it('carries every declaration, including the ones no category matches', () => {
    const all = byTheme.dark.all
    const names = all.map((t) => t.name)
    expect(names.length).toBe(new Set(names).size)

    // the four that match no category in this module, measured against it
    for (const name of ['hairline', 'quiet-fill', 'scrim', 'illustration-ink']) {
      expect(names, name).toContain(name)
    }
    // and the two statusCompat excludes by contract
    expect(names).toContain('st-provis-fg')
    expect(statusCompat.map((t) => t.name)).not.toContain('st-provis-fg')

    // control: `all` is a superset of the views, not a different parse
    for (const view of [semantic, status, statusCompat]) {
      for (const token of view) {
        expect(all.find((t) => t.name === token.name)?.value, token.name).toBe(token.value)
      }
    }
  })

  it('flips the whole surface with the theme, not just the categorised part', () => {
    const of = (theme, name) => byTheme[theme].all.find((t) => t.name === name)
    expect(byTheme.light.all.length).toBe(byTheme.dark.all.length)
    // --quiet-fill points at --surface-base, which the light block overrides
    expect(of('dark', 'quiet-fill').resolved).toBe('#171615')
    expect(of('light', 'quiet-fill').resolved).toBe('#e9e8e6')
    // control: a primitive is one ladder in both modes
    expect(of('light', 'warm-950').value).toBe(of('dark', 'warm-950').value)
  })

  // ---- reference resolution --------------------------------------------------
  //
  // A semantic token never carries a colour of its own: every one is a
  // `var(--primitive)` reference. Resolving the chain against the same dark map
  // is what lets the view paint a swatch beside the name instead of a neutral
  // placeholder.

  it('resolves a one-hop semantic reference to the primitive hex', () => {
    const base = semantic.find((t) => t.name === 'surface-base')
    expect(base.value).toBe('var(--warm-950)') // still the reference, unchanged
    expect(base.resolved).toBe('#171615')
    expect(semantic.find((t) => t.name === 'text-brand').resolved).toBe('#ffcc00')
  })

  it('resolves a two-hop compat chain', () => {
    // st-normal-fg -> status-normal-fg -> green-450 -> #3ecf8e. One hop would
    // stop at `var(--status-normal-fg)`, which is not a colour.
    const compat = statusCompat.find((t) => t.name === 'st-normal-fg')
    expect(compat.value).toBe('var(--status-normal-fg)')
    expect(compat.resolved).toBe('#3ecf8e')
    expect(status.find((t) => t.name === 'status-normal-mark').resolved).toBe('#3ecf8e')
  })

  it('resolves every semantic, status and compat token to a hex', () => {
    const HEX = /^#[0-9a-f]{6}$/i
    for (const token of [...semantic, ...status, ...statusCompat]) {
      expect(token.resolved, token.name).toMatch(HEX)
    }
  })

  it('leaves a literal untouched (control)', () => {
    // the resolver must not be a function that rewrites everything it is handed
    expect(radius.find((t) => t.name === 'radius-sm').resolved).toBe('4px')
    const rung = colors[0].rungs[0]
    expect(rung.resolved).toBe(rung.value)
    expect(resolveRef('#abcdef')).toBe('#abcdef')
  })

  it('returns an unresolvable reference unchanged', () => {
    // silence case for the swatch guard: nothing in the map to reach, so the
    // value comes back as-is and the view paints its neutral chip
    expect(resolveRef('var(--not-a-declared-token)')).toBe('var(--not-a-declared-token)')
    expect(resolveRef('color-mix(in oklab, var(--gold-400) 10%, transparent)')).toBe(
      'color-mix(in oklab, var(--gold-400) 10%, transparent)',
    )
  })

  // ---- the two themes --------------------------------------------------------
  //
  // The kit emits its semantic layer twice: `:root, .dark, [data-theme="dark"]`
  // carries the defaults, and `html[data-theme="light"]` overrides a subset at
  // higher specificity. The light surface is therefore the dark one with an
  // overlay on top, NOT a standalone block — measured, it redeclares 37 of the
  // 47 names.

  it('parses the light surface as an overlay, keeping every row', () => {
    expect(byTheme.light.semantic.length).toBe(15)
    expect(byTheme.light.status.length).toBe(18)
    // the light block never redeclares --st-normal-fg and its seven siblings;
    // they alias --status-normal-fg, which light does override. A light map
    // built from the light block alone loses exactly these eight rows.
    expect(byTheme.light.statusCompat.length).toBe(16)
  })

  it('flips a semantic token between the two themes', () => {
    const of = (theme, name) => byTheme[theme].semantic.find((t) => t.name === name)
    expect(of('dark', 'surface-base').value).toBe('var(--warm-950)')
    expect(of('dark', 'surface-base').resolved).toBe('#171615')
    expect(of('light', 'surface-base').value).toBe('var(--warm-100)')
    expect(of('light', 'surface-base').resolved).toBe('#e9e8e6')
    expect(of('light', 'text-brand').resolved).toBe('#8a6600') // gold-750, not gold-400
  })

  it('resolves an inherited alias through the light overlay', () => {
    // st-normal-fg -> status-normal-fg (unchanged, from the defaults)
    // -> green-850 (the light override), not the dark green-450
    const compat = byTheme.light.statusCompat.find((t) => t.name === 'st-normal-fg')
    expect(compat.value).toBe('var(--status-normal-fg)')
    expect(compat.resolved).toBe('#03623c')
    expect(byTheme.dark.statusCompat.find((t) => t.name === 'st-normal-fg').resolved).toBe('#3ecf8e')
  })

  it('leaves a token the light block does not change (control)', () => {
    // action/* is gold in both modes by the kit's own decision (tokens.css:162)
    // — so "the light map differs everywhere" would be the wrong assertion, and
    // this is the row that says so.
    const of = (theme) => byTheme[theme].semantic.find((t) => t.name === 'action-primary')
    expect(of('light').value).toBe(of('dark').value)
    expect(of('light').resolved).toBe('#ffcc00')
  })

  it('keeps the primitives, radius, spacing and type off the theme axis', () => {
    // they are declared once, outside both theme blocks — a per-theme copy
    // would be a claim the kit does not make
    expect(byTheme.light.colors).toBeUndefined()
    expect(colors.find((c) => c.family === 'warm').rungs.find((r) => r.name === 'warm-100').value)
      .toBe('#e9e8e6')
  })

  it('assembles every type scale with size/line/weight/track', () => {
    expect(type.map((t) => t.name)).toEqual([
      'heading-md', 'label-lg', 'label-md', 'label-sm',
      'body-md', 'caption', 'data-md', 'data-input',
    ])
    for (const scale of type) {
      expect(scale.size).toMatch(/px$/)
      expect(scale.line).toMatch(/px$/)
      expect(scale.weight).toMatch(/^\d+$/)
      expect(scale.track).not.toBe('')
    }
    expect(type[0]).toEqual({
      name: 'heading-md', size: '16px', line: '20px', weight: '600', track: '-0.5px',
    })
  })
})
