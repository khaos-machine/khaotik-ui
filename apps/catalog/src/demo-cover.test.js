import { describe, it, expect } from 'vitest'
import { DEMO_COVER, DEMO_COVER_SRCSET, demoFigureFor } from './demo-cover.js'

// The cover is now the kit's own shipped asset rather than an inline SVG this
// file used to carry. What is worth checking changed with it: a data URI could
// be malformed, an imported asset can instead fail to RESOLVE — and a bundler
// that cannot handle image imports from the library is the exact trap consumers
// will hit, since the package ships uncompiled source.

describe('the shipped cover placeholder', () => {
  it('resolves to a real bundled asset, not undefined', () => {
    // A failed asset import is `undefined` here and an empty `src=""` in the
    // browser, which renders as a broken image rather than an error.
    expect(DEMO_COVER).toBeTruthy()
    expect(typeof DEMO_COVER).toBe('string')
    expect(DEMO_COVER).toMatch(/project-cover.*\.webp$/)
  })

  it('offers both densities as a resolvable candidate list', () => {
    // An empty or malformed srcset is a candidate list a browser can fail to
    // resolve — the same contract ProjectCard's cover keeps.
    expect(DEMO_COVER_SRCSET).toMatch(/project-cover[^,]*\.webp 1x, .*project-cover@2x[^,]*\.webp 2x/)
  })

  it('resolves the 2x candidate to a different file than the 1x', () => {
    const [one, two] = DEMO_COVER_SRCSET.split(', ').map((c) => c.split(' ')[0])
    expect(one).not.toBe(two)
  })
})

describe('the demo figure set, which stands in for an app supplying its own', () => {
  it('varies by gender and age', () => {
    const a = demoFigureFor({ gender: 'male', age: 'adult' })
    const b = demoFigureFor({ gender: 'female', age: 'adult' })
    const c = demoFigureFor({ gender: 'male', age: 'child' })
    expect(new Set([a, b, c]).size).toBe(3)
  })

  it('decodes to well-formed XML', () => {
    // jsdom does not rasterise SVG, so a malformed one renders identically to a
    // good one here and fails only on a device.
    const svg = decodeURIComponent(demoFigureFor({}).slice('data:image/svg+xml,'.length))
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
    expect(doc.documentElement.getAttribute('viewBox')).toBe('0 0 120 160')
  })
})
