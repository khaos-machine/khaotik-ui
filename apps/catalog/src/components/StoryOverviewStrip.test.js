import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import StoryOverviewStrip from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewStrip.svelte'

// The Overview's strip (khaos-app#617): four figures, each a way in. No sentences.
const loaded = { kind: 'loaded', usd: '10.00', spentUsd: '3.20', remainingUsd: '6.80' }

describe('StoryOverviewStrip', () => {
  it('reads the verdict, the spend, the review count and the next step, and opens each', async () => {
    const oncoverage = vi.fn(), onbudget = vi.fn(), onreview = vi.fn(), onnext = vi.fn()
    render(StoryOverviewStrip, { props: { coverage: { verdict: 'consider' }, budget: loaded, review: 7, next: { label: 'Find relationships', icon: 'sparkle' }, oncoverage, onbudget, onreview, onnext } })
    await fireEvent.click(screen.getByRole('button', { name: 'Coverage: Consider' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Budget: $3.20 of $10.00' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Needs review: 7' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Find relationships' }))
    expect([oncoverage, onbudget, onreview, onnext].map((f) => f.mock.calls.length)).toEqual([1, 1, 1, 1])
  })

  it('offers Set budget… when the story has none', () => {
    const { container } = render(StoryOverviewStrip, { props: { budget: { kind: 'none' } } })
    expect(screen.getByRole('button', { name: 'Budget: No budget set' })).toBeTruthy()
    expect(container.textContent).toContain('No budget set')
    expect(container.textContent).toContain('Set budget…')
  })

  it('takes the verdict’s tone, and the warning tone when the budget is spent', () => {
    const { container } = render(StoryOverviewStrip, { props: { coverage: { verdict: 'pass' }, budget: { ...loaded, spentUsd: '10.00', remainingUsd: '0' } } })
    const tones = [...container.querySelectorAll('.metric')].map((m) => m.getAttribute('data-tone'))
    expect(tones.slice(0, 2)).toEqual(['danger', 'warning'])
  })

  it('says coverage is not made yet, and draws no budget or next step without them', () => {
    render(StoryOverviewStrip, { props: {} })
    expect(screen.getByRole('button', { name: 'Coverage: Not made' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Budget/ })).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })
})
