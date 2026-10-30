import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// The catalog's type must come from the kit, not from raw lengths.
//
// This covered `components/shell` only. The BrandKit was outside it, and the
// BrandKit is the surface that DOCUMENTS the kit: Color sized three rules at a
// raw 11px, and sixteen rules across the six brand screens took a token size
// and left the leading to the browser. The screens explaining the type scale
// were the least compliant thing in the app, and nothing said so.
//
// This is read from source rather than from the DOM because the defect is
// invisible at runtime: jsdom resolves no custom properties, so a rule using
// `font-size: 0.68rem` renders and asserts identically to one using
// `var(--label-xs-size)`. Every runtime assertion in this suite is blind to it,
// which is why five of these survived unremarked until they were grepped for.
//
// ICONS ARE EXEMPT, and the exemption is the finding. The kit names no icon
// size — `--size-*` is `touch-target` and two strokes — so `.ph` rules have no
// token to reach for and are sized in `rem` at three different values. A scale
// is not invented here: G78's rule is that a name earns its place from an
// observed need, and inventing `--icon-sm/md/lg` would be choosing three
// numbers with nothing behind them. The exemption is narrow (`.ph` only) so the
// gap stays visible instead of becoming a licence.
// The whole catalog tree, not one directory of it.
const SRC = path.join(import.meta.dirname)
const FILES = fs
  .readdirSync(SRC, { recursive: true })
  .filter((f) => f.endsWith('.svelte'))
  .sort()

// a rule block, its selector, and the declarations inside it
const rules = (src) => {
  const out = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m
  while ((m = re.exec(src))) out.push({ selector: m[1].trim().replace(/\s+/g, ' '), body: m[2] })
  return out
}

describe('catalog type comes from the kit', () => {
  it('finds the shell components to check', () => {
    // a directory read that quietly returned nothing would make every
    // assertion below vacuously true
    expect(FILES.length).toBeGreaterThan(12)
  })

  it.each(FILES)('%s declares no raw font-size outside an icon rule', (file) => {
    const src = fs.readFileSync(path.join(SRC, file), 'utf8')
    const offenders = rules(src)
      .filter((r) => /font-size:\s*[0-9]/.test(r.body))
      .filter((r) => !r.selector.includes('.ph'))
      .map((r) => `${r.selector} { ${/font-size:[^;]+/.exec(r.body)[0]} }`)

    expect(offenders, `${file} sizes text outside the type scale`).toEqual([])
  })

  // The kit's type tokens ship as quads, so a rule that takes the size and
  // invents the rest is only half converted — and reads as converted.
  //
  // Two ways to be half converted, and this only caught one of them. A raw
  // NUMERIC line-height is an invented value. Omitting line-height entirely is
  // the same defect wearing nothing at all: `normal` is whatever the engine
  // picks. SidebarNav's rows took `--body-md-size` and no leading, so 13px text
  // rendered at 19.5px against the kit's published 18px, and this assertion
  // passed them because there was no number to find. The kit declares no
  // baseline grid (BrandKit → Layout, "No shared baseline"), which is precisely
  // why the per-style line-height is the only leading standard there is.
  it.each(FILES)('%s pairs every token size with a token line-height', (file) => {
    const src = fs.readFileSync(path.join(SRC, file), 'utf8')
    const half = rules(src)
      .filter((r) => /font-size:\s*var\(--/.test(r.body))
      .filter((r) => /line-height:\s*[0-9]/.test(r.body) || !/line-height:/.test(r.body))
      .map((r) => r.selector)

    expect(half, `${file} takes a token size and invents or omits the leading`).toEqual([])
  })

  // Weight is the third field of the quad, and a bare number is the same defect
  // in its last remaining costume. `font-weight: 600` beside `--label-sm-size`
  // is not wrong by value — label-sm IS 600 — it is wrong because the rule now
  // has to be re-checked by hand every time the style moves. Four brand screens
  // and two shell components carried one.
  it.each(FILES)('%s takes its weight from a style, not a number', (file) => {
    const src = fs.readFileSync(path.join(SRC, file), 'utf8')
    const offenders = rules(src)
      .filter((r) => /font-weight:\s*[0-9]/.test(r.body))
      .map((r) => `${r.selector} { ${/font-weight:[^;]+/.exec(r.body)[0]} }`)

    expect(offenders, `${file} hand-sets a font-weight`).toEqual([])
  })
})
