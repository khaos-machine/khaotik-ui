import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import EventLog from '@khaos-machine/khaotik-ui/components/svelte/EventLog.svelte'

// EventLog (data-layer plan K16; audit §1.10, §4.1). The Activity window's table: one
// row per committed change, newest first, grouped by the reader's day, virtualised on
// DataTable's row window. B4P's Activity holds 695 changes (audit §1.10), which the
// shipped window rendered all at once.

const events = Array.from({ length: 695 }, (_, i) => ({
  id: String(695 - i),
  day: i < 400 ? 'Today' : 'Yesterday',
  time: `12:${String(i % 60).padStart(2, '0')}:00`,
  kind: i % 5 === 0 ? 'import' : 'adjudication',
  actor: i % 5 === 0 ? 'khaos-tools' : 'jev-1.13',
  change: i % 5 === 0 ? 'scenes · characters' : `accept · character · chr_${i}`,
}))

describe('EventLog', () => {
  it('695 events render a bounded row count while the grid counts them all', () => {
    const { container } = render(EventLog, { props: { events, viewportHeight: 480 } })
    const grid = screen.getByRole('grid', { name: 'Activity' })
    // 695 changes, two day headers, one column header row.
    expect(grid).toHaveAttribute('aria-rowcount', String(695 + 2 + 1))
    const rendered = container.querySelectorAll('[data-body] [role="row"]')
    expect(rendered.length).toBeLessThanOrEqual(480 / 24 + 2 * 8)
    expect(rendered.length).toBeGreaterThan(0)
  })

  it('groups by day with a count, and shows each change’s time, kind, actor and change', () => {
    render(EventLog, { props: { events: events.slice(0, 3), viewportHeight: 480 } })
    expect(screen.getByRole('row', { name: /^Today 3$/ })).toBeInTheDocument()
    const first = screen.getByRole('row', { name: /12:00:00/ })
    expect(first).toHaveTextContent('import')
    expect(first).toHaveTextContent('khaos-tools')
    expect(first).toHaveTextContent('scenes · characters')
  })

  it('filters on any column', () => {
    render(EventLog, { props: { events: events.slice(0, 10), filter: 'khaos-tools', viewportHeight: 480 } })
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', String(2 + 1 + 1))
  })

  it('an empty log says so', () => {
    render(EventLog, { props: { events: [], viewportHeight: 120, empty: 'No committed changes' } })
    expect(screen.getByText('No committed changes')).toBeInTheDocument()
  })
})
