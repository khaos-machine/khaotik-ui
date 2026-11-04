import { readFileSync } from 'node:fs'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/svelte'
import TimeChart from '@khaos-machine/khaotik-ui/components/svelte/TimeChart.svelte'

// K2 for Khaos Cloud's admin usage view (khaos-cloud docs/plans/admin-stats.md,
// "Kit dependency (K1-K3)"). One measure per chart, per day, in the host's
// order — spend and calls are two charts over the same days, because two
// measures of different scale never share an axis (MeasureTable's rule). The
// rest are BarChart's rules: a missing value is absent, never zero, and every
// figure is reachable without a pointer through a table.
//
// Illustrative values under D62: the shape is the admin's `days` series.

const DAYS = [
  { day: '2026-11-01', value: 4 },
  { day: '2026-11-02', value: 10 },
  { day: '2026-11-03', value: 7 },
]

const bars = (c) => [...c.querySelectorAll('.timechart__bar')]
const rowFor = (day) => screen.getByRole('rowheader', { name: day }).closest('tr')

describe('TimeChart', () => {
  it('draws one bar per point, in the given order, scaled to the largest', () => {
    const { container } = render(TimeChart, { props: { points: DAYS, label: 'Calls per day' } })
    const drawn = bars(container)
    expect(drawn).toHaveLength(3)
    expect(drawn.map((b) => b.dataset.day)).toEqual(['2026-11-01', '2026-11-02', '2026-11-03'])
    expect(Number.parseFloat(drawn[1].style.height)).toBe(100)
    expect(Number.parseFloat(drawn[0].style.height)).toBeCloseTo(40, 1)
  })

  it('draws no bar for a null point, and its row reads absent rather than zero', () => {
    const points = [DAYS[0], { day: '2026-11-02', value: null }, DAYS[2]]
    const { container } = render(TimeChart, { props: { points, label: 'Calls per day' } })
    expect(bars(container).map((b) => b.dataset.day)).toEqual(['2026-11-01', '2026-11-03'])
    const value = within(rowFor('2026-11-02')).getByRole('cell')
    expect(value).toHaveTextContent('Not measured')
    expect(value).not.toHaveTextContent('0')
  })

  it('announces a floor point with ≥ before its formatted value, and draws it distinctly', () => {
    const points = [DAYS[0], { day: '2026-11-02', value: 1.5, floor: true }]
    const format = (v) => `$${v.toFixed(2)}`
    const { container } = render(TimeChart, { props: { points, label: 'Spend per day', format } })
    expect(within(rowFor('2026-11-02')).getByRole('cell').textContent.trim()).toBe('≥ $1.50')
    expect(within(rowFor('2026-11-01')).getByRole('cell').textContent.trim()).toBe('$4.00')
    const floor = bars(container).find((b) => b.dataset.day === '2026-11-02')
    expect(floor).toHaveAttribute('data-floor', 'true')
  })

  it('lists every day in its table equivalent, named by label and described by caption', () => {
    const points = [...DAYS, { day: '2026-11-04', value: null }]
    render(TimeChart, { props: { points, label: 'Calls per day', caption: 'All model calls, UTC days' } })
    const table = screen.getByRole('table', { name: 'Calls per day' })
    expect(table).toHaveAccessibleDescription('All model calls, UTC days')
    const days = within(table).getAllByRole('rowheader').map((h) => h.textContent)
    expect(days).toEqual(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'])
  })

  it('hides the drawn bars from assistive tech, since the visible table carries the figures', () => {
    const { container } = render(TimeChart, { props: { points: DAYS, label: 'Calls per day' } })
    expect(container.querySelector('.timechart__plot')).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows its table on screen, so every day and value is reachable without a pointer', () => {
    // BarChart's rule: the table is visible, not only announced. The bars carry
    // no figures, so hiding the table again leaves a sighted keyboard user with
    // none. jsdom applies no CSS, so this checks every way the kit hides a node.
    const { container } = render(TimeChart, { props: { points: DAYS, label: 'Calls per day', caption: 'Model calls' } })
    const table = screen.getByRole('table', { name: 'Calls per day' })
    for (let el = table; el && el !== container; el = el.parentElement) {
      expect(el.classList.contains('visually-hidden'), `${el.tagName}.${el.className} is visually hidden`).toBe(false)
      expect(el).not.toHaveAttribute('hidden')
      expect(el).not.toHaveAttribute('aria-hidden')
    }
    const source = readFileSync(`${import.meta.dirname}/../../../../components/svelte/TimeChart.svelte`, 'utf8')
    expect(source).not.toMatch(/visually-hidden/)
    // The caption is part of the visible table, not a hidden copy beside it.
    expect(within(table).getByText('Model calls').tagName).toBe('CAPTION')
  })

  it('shows emptyLabel instead of an empty chart', () => {
    const { container } = render(TimeChart, { props: { points: [], label: 'Calls per day', emptyLabel: 'No calls in this range.' } })
    expect(screen.getByText('No calls in this range.')).toBeInTheDocument()
    expect(container.querySelector('table')).toBeNull()
    expect(bars(container)).toHaveLength(0)
  })

  it('always labels the first and last day on the axis', () => {
    const { container } = render(TimeChart, { props: { points: DAYS, label: 'Calls per day' } })
    const ticks = [...container.querySelectorAll('.timechart__tick')]
    expect(ticks[0].dataset.day).toBe('2026-11-01')
    expect(ticks.at(-1).dataset.day).toBe('2026-11-03')
  })

  describe('day labels thin to the width', () => {
    // jsdom lays nothing out, so the plot's clientWidth is stubbed: Svelte's
    // bind:clientWidth reads it when the binding starts. A label slot is 48px.
    const FOURTEEN = Array.from({ length: 14 }, (_, i) => ({ day: `2026-11-${String(i + 1).padStart(2, '0')}`, value: i }))
    const ticks = (c) => [...c.querySelectorAll('.timechart__tick')].map((t) => t.dataset.day.slice(-2))
    afterEach(() => vi.restoreAllMocks())

    it('shows every third day across 240px, keeping the first and last', () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(240)
      const { container } = render(TimeChart, { props: { points: FOURTEEN, label: 'Calls per day' } })
      // 5 slots for 14 days is a step of 3. Day 13 is one short of a full step
      // before the last, so it gives way to it.
      expect(ticks(container)).toEqual(['01', '04', '07', '10', '14'])
    })

    it('keeps only the first and last when one slot fits', () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(48)
      const { container } = render(TimeChart, { props: { points: FOURTEEN, label: 'Calls per day' } })
      expect(ticks(container)).toEqual(['01', '14'])
    })

    it('shows every day when there is room for all of them', () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(14 * 48)
      const { container } = render(TimeChart, { props: { points: FOURTEEN, label: 'Calls per day' } })
      expect(ticks(container)).toHaveLength(14)
    })
  })

  it('takes a StatusTone for its bars', () => {
    const { container } = render(TimeChart, { props: { points: DAYS, label: 'Spend per day', tone: 'warning' } })
    expect(bars(container)[0].dataset.tone).toBe('warning')
  })
})
