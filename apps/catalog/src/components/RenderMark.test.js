import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import RenderMark from '@khaos-machine/khaotik-ui/components/svelte/RenderMark.svelte'

// RenderMark (data-layer plan K7; audit §3.13, §4.1). Whether a thing is rendered:
// ready, stale or missing, as a glyph AND a label, never colour alone (audit §3.16).
// With no state the mark is absent. Absent is not "missing": the engine not saying is
// not the engine saying there is nothing (audit §3.13).

describe('RenderMark', () => {
  it('with no state given renders nothing, never "missing"', () => {
    const { container } = render(RenderMark, { props: {} })
    expect(container.textContent?.trim()).toBe('')
    expect(container.querySelector('.mark')).toBeNull()
  })

  it('an unknown state also renders nothing', () => {
    const { container } = render(RenderMark, { props: { state: 'rendering' } })
    expect(container.querySelector('.mark')).toBeNull()
  })

  for (const [state, label] of [['ready', 'Ready'], ['stale', 'Stale'], ['missing', 'Missing']]) {
    it(`${state} renders a glyph and its label`, () => {
      const { container } = render(RenderMark, { props: { state } })
      const mark = container.querySelector('.mark')
      expect(mark).toHaveAttribute('data-state', state)
      expect(mark?.querySelector('[aria-hidden="true"]')).not.toBeNull()
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  }

  it('takes the host’s own wording for a state', () => {
    render(RenderMark, { props: { state: 'stale', label: 'Script changed since this read' } })
    expect(screen.getByText('Script changed since this read')).toBeInTheDocument()
  })

  it('a compact mark keeps its label for assistive technology', () => {
    const { container } = render(RenderMark, { props: { state: 'ready', compact: true } })
    const label = screen.getByText('Ready')
    expect(label).toHaveClass('mark__label--hidden')
    expect(container.querySelector('.mark')).toHaveAttribute('title', 'Ready')
  })
})
