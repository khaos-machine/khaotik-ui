import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Layout from './Layout.svelte'
import { spacing, type } from '@khaos-machine/khaotik-ui/tokens/parse.js'

describe('Layout', () => {
  it('renders the header and every section heading', () => {
    render(Layout)
    expect(screen.getByRole('region', { name: /Khaotik Layout/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Spacing scale' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Not in the kit' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'No shared baseline' })).toBeInTheDocument()
  })

  // Relocated from Shape.test.js with the section itself. The scale is drawn at
  // its declared width rather than tabulated, so the bars ARE the assertion —
  // a scale rendered at uniform width would pass a text check and show nothing.
  it('draws every spacing step at its declared width', () => {
    const { container } = render(Layout)
    const bars = [...container.querySelectorAll('.spec-step__bar')]
    expect(bars.map((el) => el.style.width)).toEqual(spacing.map((s) => s.value))
  })

  it('names every spacing token it draws', () => {
    render(Layout)
    for (const token of spacing) {
      expect(screen.getByRole('button', { name: `Copy --${token.name}: ${token.value}` })).toBeInTheDocument()
    }
  })

  // The rhythm section states an arithmetic fact about the live kit, and prose
  // goes stale silently. This recomputes it from tokens.js rather than trusting
  // the sentence: if a common step is ever introduced, the copy becomes wrong
  // and this fails instead of the screen quietly lying.
  it('re-derives the no-baseline claim from the kit, not from the copy', () => {
    const lines = [...new Set(type.map((t) => parseInt(t.line, 10)))].filter(Number.isFinite).sort((a, b) => a - b)
    const steps = spacing.map((s) => parseInt(s.value, 10))
    const gcd = (a, b) => (b ? gcd(b, a % b) : a)
    const spacingStep = steps.reduce(gcd)

    // the claim: the type scale does not sit on the spacing step
    const offGrid = lines.filter((h) => h % spacingStep !== 0)
    expect(offGrid.length, 'type scale now sits on the spacing step — the screen says it does not').toBeGreaterThan(0)

    // and the screen prints the numbers it actually measured
    render(Layout)
    const rhythm = screen.getByRole('heading', { name: 'No shared baseline' }).closest('section')
    expect(rhythm).toHaveTextContent(lines.join(' / '))
    expect(rhythm).toHaveTextContent(`steps by ${spacingStep}px`)
    for (const n of offGrid) expect(rhythm.textContent).toContain(String(n))
  })

  // The grid section is a declared absence. The failure it guards is a later
  // pass "filling it in" with a plausible 12-column: the catalog would then
  // publish a system the kit does not declare, and nothing else here would
  // notice, because a fabricated grid renders exactly like a real one.
  it('declares the grid gap without publishing any grid token', () => {
    const { container } = render(Layout)
    const published = [...container.querySelectorAll('[aria-label^="Copy --"]')]
      .map((el) => /^Copy --([a-z0-9-]+)/.exec(el.getAttribute('aria-label'))[1])

    expect(published).toEqual(spacing.map((s) => s.name))
    for (const word of ['grid', 'column', 'gutter', 'container']) {
      expect(published.some((n) => n.includes(word)), `published a --${word} token the kit does not declare`).toBe(false)
    }
  })
})
