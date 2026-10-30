import { describe, it, expect } from 'vitest'
import { byTheme } from '@khaos-machine/khaotik-ui/tokens/parse.js'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { contrastRatio, composite, largeText, requiredRatio, passesContrast } from './lib/contrast.js'

// The calculator behind #66 (D64).
//
// This block is NOT re-deriving #66's ratios — it reproduces D63's published
// eight, from the shipped `tokens/tokens.css` through the same parser the brand
// screens use. A wrong calculator mass-passes or mass-fails and BOTH look
// plausible, which is why the numbers are pinned rather than computed-and-trusted.
//
// Two things are proved here, and the second is not implied by the first:
//
//   1. the ratio function — eight assertions, 2 tokens x 4 grounds
//   2. the DECISION RULE — a correct ratio function with a wrong threshold
//      mass-passes and the suite still reads green, so the predicate is
//      asserted at its boundaries too.
//
// This is the same function the runtime audit calls; it is not a second
// implementation of it.

// The four real grounds, per theme. `--surface-raised` and `--surface-base` are
// the only two grounds any of the 73 rules paint against.
const GROUNDS = ['surface-raised', 'surface-base']

const resolved = (theme, name) => {
  const entry = byTheme[theme].all.find((t) => t.name === name)
  // A read that quietly returns nothing makes every case below vacuously true
  // (token-refs.test.js:94-98). Fail loudly instead.
  if (entry === undefined) throw new Error(`token --${name} not found in ${theme}`)
  if (!/^#[0-9a-f]{6}$/i.test(entry.resolved)) {
    throw new Error(`--${name} resolved to "${entry.resolved}" in ${theme}, not a hex colour`)
  }
  return entry.resolved
}

// D63's published table. Failing three of four at 4.5:1 is the defect.
const PUBLISHED = {
  'text-secondary': {
    'dark/surface-raised': 6.86,
    'dark/surface-base': 7.53,
    'light/surface-raised': 8.29,
    'light/surface-base': 7.44,
  },
  // REPOINTED BY #75, ruled by Andrew 2026-09-24. `--text-tertiary` was one
  // primitive (`--warm-400`) against both themes and failed 4.5:1 on three of
  // these four grounds; it now reads `--warm-350` in dark and `--warm-450` in
  // light. Two of these four numbers are the ruling's own — 4.78 dark and 5.12
  // light — and they reproduce here from the shipped CSS, which is the point of
  // pinning them rather than computing and trusting.
  'text-tertiary': {
    'dark/surface-raised': 4.78,
    'dark/surface-base': 5.25,
    'light/surface-raised': 5.70,
    'light/surface-base': 5.12,
  },
}

describe('the tokens the calculator reads', () => {
  it('resolves both text tokens and both grounds to hex in both themes', () => {
    for (const theme of ['dark', 'light']) {
      for (const name of ['text-secondary', 'text-tertiary', ...GROUNDS]) {
        expect(resolved(theme, name), `${theme} --${name}`).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  // THE DEFECT D64 NAMED, NOW CLOSED. `--text-tertiary` was a primitive wearing
  // a semantic name — one value against two grounds — which is WHY it measured
  // 3.29 rather than an accident of which grey got picked. This assertion used
  // to pin that sameness as the defect; it now pins the repair, because a
  // regression here would put the whole ladder back where #66 found it.
  it('every text rung is mode-aware, tertiary included', () => {
    expect(resolved('dark', 'text-tertiary')).not.toBe(resolved('light', 'text-tertiary'))
    expect(resolved('dark', 'text-secondary')).not.toBe(resolved('light', 'text-secondary'))
    expect(resolved('dark', 'text-primary')).not.toBe(resolved('light', 'text-primary'))
  })
})

describe('contrastRatio — D63\'s eight published ratios', () => {
  // Eight, not six. Revisions 1-5 of the plan said "six published ratios"
  // throughout; D63 publishes 2 tokens x 4 grounds. Six assertions leave two
  // grounds unproven while the gate still reads green.
  it('reproduces all eight to 2dp', () => {
    const seen = []
    for (const token of ['text-secondary', 'text-tertiary']) {
      for (const theme of ['dark', 'light']) {
        for (const ground of GROUNDS) {
          const key = `${theme}/${ground}`
          const ratio = contrastRatio(resolved(theme, token), resolved(theme, ground))
          expect(Number(ratio.toFixed(2)), `--${token} on --${ground} (${theme})`).toBe(
            PUBLISHED[token][key],
          )
          seen.push(`${token}/${key}`)
        }
      }
    }
    // A loop that iterated nothing would pass every assertion above.
    expect(seen).toHaveLength(8)
  })

  it('--text-tertiary now clears 4.5:1 on all four grounds', () => {
    // It failed three of four until #75. That is the whole reason #66 withdrew
    // it from text below 24px, and the reason this assertion is worth keeping
    // pointed the other way rather than deleting.
    const failing = Object.values(PUBLISHED['text-tertiary']).filter((r) => r < 4.5)
    expect(failing).toHaveLength(0)
  })

  it('--text-secondary clears 4.5:1 on all four grounds', () => {
    const clearing = Object.values(PUBLISHED['text-secondary']).filter((r) => r >= 4.5)
    expect(clearing).toHaveLength(4)
  })

  it('is symmetric and self-referentially 1', () => {
    const a = resolved('dark', 'text-tertiary')
    const b = resolved('dark', 'surface-base')
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10)
    expect(contrastRatio(a, a)).toBeCloseTo(1, 10)
    expect(Number(contrastRatio('#000000', '#ffffff').toFixed(2))).toBe(21)
  })
})

describe('the decision rule — asserted at its boundaries', () => {
  // WCAG large text is 18pt (24px), or 14pt (18.66px) bold. `--body-md-size` is
  // 13px and `--caption-size` is 11px, so both tiers are normal text at 4.5:1
  // (plan 2.3). "Above 11px" is not a valid exemption.
  it('largeText is 24px normal, 18.66px bold', () => {
    expect(largeText(23.9, false)).toBe(false)
    expect(largeText(24, false)).toBe(true)
    expect(largeText(18.6, true)).toBe(false)
    expect(largeText(18.7, true)).toBe(true)
    // bold below the bold threshold is still normal text
    expect(largeText(18.6, false)).toBe(false)
    expect(largeText(11, true)).toBe(false)
  })

  it('requiredRatio is 4.5 for normal text and 3.0 for large', () => {
    expect(requiredRatio(11, false)).toBe(4.5)
    expect(requiredRatio(13, false)).toBe(4.5)
    expect(requiredRatio(23.9, false)).toBe(4.5)
    expect(requiredRatio(24, false)).toBe(3)
    expect(requiredRatio(18.6, true)).toBe(4.5)
    expect(requiredRatio(18.7, true)).toBe(3)
  })

  it('passesContrast turns on the ratio either side of the bar', () => {
    expect(passesContrast(4.49, 11, false)).toBe(false)
    expect(passesContrast(4.5, 11, false)).toBe(true)
    expect(passesContrast(4.51, 11, false)).toBe(true)
    // the same ratio, one pixel either side of the large-text threshold
    expect(passesContrast(3.29, 23.9, false)).toBe(false)
    expect(passesContrast(3.29, 24, false)).toBe(true)
    expect(passesContrast(2.99, 24, false)).toBe(false)
  })

  // THE PREDICATE, POINTED AT THE REPAIR. This asserted that the substitution
  // was what turned the caption tier green — true while `--text-tertiary` was
  // `--warm-400`, and false the moment #75 repointed it. The useful claim now is
  // that BOTH rungs clear the bar at every caption and body-md size, which is
  // what makes restoring the ladder safe rather than a regression.
  it('both text rungs clear the bar at every caption and body-md size', () => {
    let checked = 0
    for (const theme of ['dark', 'light']) {
      for (const ground of GROUNDS) {
        for (const size of [10, 11, 13]) {
          for (const token of ['text-tertiary', 'text-secondary']) {
            const ratio = contrastRatio(resolved(theme, token), resolved(theme, ground))
            expect(passesContrast(ratio, size, false), `${token} ${theme}/${ground} ${size}px`).toBe(
              true,
            )
            checked += 1
          }
        }
      }
    }
    // A loop that iterated nothing would pass every assertion above.
    expect(checked).toBe(24)
  })
})

// ---------------------------------------------------------------------------
// TONE ON ITS OWN TINT (#218)
// ---------------------------------------------------------------------------
//
// A status tone is drawn as text on a wash of itself: StatusPill paints
// `color-mix(in oklab, currentColor 10%, transparent)` under its label, TakeList
// and Launcher 12%. The token pairs above never see that ground, so light
// success (3.76) and light warning (4.13) shipped below 4.5:1 with this file
// green. This block closes that for every tone, both themes, both grounds, and
// every tint a component actually paints.
//
//   tones   <- tokens/tokens-extra.css, each --tone-* followed into tokens.css
//              through the same parser as everything above
//   tints   <- a scan of components/svelte, NOT a constant: a new 15% wash reds
//              this suite instead of slipping past a hardcoded 12
//   bar     <- passesContrast(ratio, 11, false) — caption, the smallest size a
//              tone is drawn at
//
// `color-mix(in oklab, C p%, transparent)` is C at alpha p, so the wash is an
// sRGB alpha-over of the tone onto the ground (lib/contrast.js `composite`).
//
// WHAT THIS DOES NOT CATCH (an admission, not a gap to fill here): a tone on a
// ground other than the two surfaces — a pill inside a builder's
// gold-tinted `casting__reason`, say. A token-pair calculator cannot know what a
// component nests inside what; that stays with the runtime sweep.

const LIB_ROOT = join(import.meta.dirname, '../../..')
const TONE_ALIAS = /--tone-([a-z]+)\s*:\s*var\(\s*--([a-z0-9-]+)\s*\)\s*;/g
const TONES = [
  ...readFileSync(join(LIB_ROOT, 'tokens/tokens-extra.css'), 'utf8').matchAll(TONE_ALIAS),
].map(([, tone, target]) => ({ tone, target }))

// theme -> tone -> hex, resolved from the shipped CSS
const toneValues = () =>
  Object.fromEntries(
    ['dark', 'light'].map((theme) => [
      theme,
      Object.fromEntries(TONES.map(({ tone, target }) => [tone, resolved(theme, target)])),
    ]),
  )

// A background wash made from the tone itself: `currentColor` or a `--tone-*`.
// Borders, fills and gradients are not text grounds and are not matched.
const TINT = /background(?:-color)?\s*:\s*color-mix\(\s*in oklab\s*,\s*(?:currentColor|var\(\s*--tone-[a-z]+\s*\))\s+(\d+(?:\.\d+)?)%\s*,\s*transparent\s*\)/g

const tintSites = () => {
  const dir = join(LIB_ROOT, 'components/svelte')
  return readdirSync(dir)
    .filter((file) => file.endsWith('.svelte'))
    .flatMap((file) =>
      [...readFileSync(join(dir, file), 'utf8').matchAll(TINT)].map((m) => ({
        file,
        percent: Number(m[1]),
      })),
    )
}

// Every (theme, tone) whose worst case over both grounds and every tint in use
// falls below the caption bar, with that worst ratio.
const toneFailures = (values, tints) => {
  const failures = {}
  for (const theme of Object.keys(values)) {
    for (const [tone, fg] of Object.entries(values[theme])) {
      let worst = Infinity
      for (const ground of GROUNDS) {
        for (const percent of [0, ...tints]) {
          const bg = composite(fg, resolved(theme, ground), percent / 100)
          worst = Math.min(worst, contrastRatio(fg, bg))
        }
      }
      if (!passesContrast(worst, 11, false)) failures[`${theme}/${tone}`] = Number(worst.toFixed(2))
    }
  }
  return failures
}

// KNOWN FAILURES, HAND-AUTHORED. Each needs a new primitive rung, which is
// Andrew's call under the tokens skill, and is tracked in khaotik-ui#219. They
// are listed rather than left out so the suite is honest about them, and this
// set is asserted EXACTLY: fixing one reds the suite until its row is deleted
// here, and a new failure reds it until someone decides what it is.
const EXPECTED_FAILURES_219 = ['light/danger', 'light/accent', 'light/skipped', 'dark/skipped']

describe('composite — alpha-over in sRGB', () => {
  it('is the ground at 0, the ink at 1 and the midpoint at 0.5', () => {
    expect(composite('#000000', '#ffffff', 0)).toBe('#ffffff')
    expect(composite('#000000', '#ffffff', 1)).toBe('#000000')
    expect(composite('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(composite('#0f7a4d', '#e9e8e6', 0.12)).toBe('#cfdbd4')
  })

  it('refuses an alpha outside 0..1 rather than extrapolating', () => {
    expect(() => composite('#000000', '#ffffff', 1.2)).toThrow()
    expect(() => composite('#000000', '#ffffff', -0.1)).toThrow()
  })
})

describe('every tone on its own tint clears 4.5:1 at 11px (#218)', () => {
  it('resolves all seven tones in both themes', () => {
    expect(TONES.map((t) => t.tone).sort()).toEqual(
      ['accent', 'danger', 'info', 'neutral', 'skipped', 'success', 'warning'],
    )
  })

  it('finds the tints the components actually paint', () => {
    const sites = tintSites()
    // positive control: an empty or broken scan would test only the 0% ground
    expect(sites).toContainEqual({ file: 'StatusPill.svelte', percent: 10 })
    expect(sites).toContainEqual({ file: 'TakeList.svelte', percent: 12 })
  })

  it('fails exactly the #219 set and nothing else', () => {
    const tints = [...new Set(tintSites().map((s) => s.percent))]
    const failures = toneFailures(toneValues(), tints)
    expect(Object.keys(failures).sort(), JSON.stringify(failures)).toEqual(
      [...EXPECTED_FAILURES_219].sort(),
    )
  })

  // MUTATIONS. The guard is only worth something if it can red on the values
  // #218 replaced.
  //
  // #086b40 (green.850 before #218 re-valued it, the designer's first proposal)
  // is NOT a case here: its worst case is 4.54, so it CLEARS this 4.5 bar. The
  // operator rejected it for margin, not for failing AA, and a caption-bar guard
  // cannot tell those apart.
  it.each([
    ['success', '#0f7a4d'], // shipped before #218: 3.76
    ['warning', '#9c4f0d'], // shipped before #218: 4.13
  ])('reds when light %s is %s', (tone, planted) => {
    const tints = [...new Set(tintSites().map((s) => s.percent))]
    const values = toneValues()
    values.light[tone] = planted
    expect(toneFailures(values, tints)).toHaveProperty(`light/${tone}`)
  })
})

// T1 (#223). Menu draws `--tone-warning` as a warning-circle ICON on an
// unavailable item and on the trigger, both on `--surface-raised`. An icon is a
// graphical object, so the bar is SC 1.4.11's 3:1, not text's 4.5:1.
describe('--tone-warning as an icon on --surface-raised clears 3:1 (#223)', () => {
  it.each(['dark', 'light'])('%s', (theme) => {
    const ratio = contrastRatio(toneValues()[theme].warning, resolved(theme, 'surface-raised'))
    expect(ratio, `${theme} ratio ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3)
  })
})
