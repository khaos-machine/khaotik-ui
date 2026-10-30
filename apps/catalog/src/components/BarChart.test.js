import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import BarChart from '@khaos-machine/khaotik-ui/components/svelte/BarChart.svelte'

// #28 — a ranked categorical bar chart, hand-rolled after a measured comparison
// against LayerCake (70 lines / 15,133 B vs 79 lines / 32,599 B + 9 transitive
// packages, for the same chart). The reasoning is on the issue.
//
// The cases here are the real measured distributions from BROKEN IN 4 PLACES,
// because those are what the component was sized for.

const TIME_OF_DAY = [
  { label: 'DAY', value: 34 },
  { label: 'NIGHT', value: 20 },
]

const SCENE_TYPE = [
  { label: 'INT', value: 41 },
  { label: 'EXT', value: 12 },
  { label: 'INT/EXT', value: 1 },
]

const bars = (c) => [...c.querySelectorAll('.barchart__bar')]
const pct = (el) => Number.parseFloat(el.style.width)

describe('BarChart draws proportionally to the largest value', () => {
  it('gives the largest bar the full width and the rest their share', () => {
    const { container } = render(BarChart, { props: { data: TIME_OF_DAY } })
    // 34 is the max, 20/34 ≈ 58.8%.
    expect(pct(bars(container)[0])).toBe(100)
    expect(pct(bars(container)[1])).toBeCloseTo((20 / 34) * 100, 1)
  })

  it('scales to the maximum, not to a total', () => {
    // These are counts of different things and do not sum to anything meaningful
    // — a character appears in many scenes, so occupant counts overlap. A
    // percentage-of-total would imply they partition something.
    const { container } = render(BarChart, { props: { data: SCENE_TYPE } })
    expect(pct(bars(container)[0])).toBe(100)
    expect(pct(bars(container)[1])).toBeCloseTo((12 / 41) * 100, 1)
  })

  it('keeps a real but tiny value visible', () => {
    // INT/EXT is 1 of 54 in the real data. It must not vanish into the axis —
    // min-width changes how narrow it LOOKS, never what it represents.
    const { container } = render(BarChart, { props: { data: SCENE_TYPE } })
    const smallest = bars(container)[2]
    expect(pct(smallest)).toBeCloseTo((1 / 41) * 100, 1)
    expect(getComputedStyle(smallest).minWidth || '2px').not.toBe('0px')
  })

  it('renders the value beside every bar', () => {
    render(BarChart, { props: { data: TIME_OF_DAY } })
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('formats values when asked', () => {
    render(BarChart, { props: { data: TIME_OF_DAY, format: (v) => `${Math.round((v / 54) * 100)}%` } })
    expect(screen.getByText('63%')).toBeInTheDocument()
  })
})

describe('BarChart refuses to draw what it was not given', () => {
  it('renders no axis at all when there is no data', () => {
    // Not a zeroed chart: bars of length zero read as a measurement of nothing
    // rather than an absence of measurement — the same distinction that made
    // "0 Goals" wrong in a character inspector.
    const { container } = render(BarChart, { props: { data: [] } })
    expect(container.querySelector('table')).toBeNull()
    expect(screen.getByText('No data yet.')).toBeInTheDocument()
  })

  it('takes a caller-supplied empty label', () => {
    render(BarChart, { props: { data: [], emptyLabel: 'This project has not been analysed.' } })
    expect(screen.getByText('This project has not been analysed.')).toBeInTheDocument()
  })

  it('drops an unmeasured entry rather than drawing it as zero', () => {
    // An entity the engine did not measure is not an entity measured at zero,
    // and a bar is a claim.
    const { container } = render(BarChart, {
      props: { data: [{ label: 'DAY', value: 34 }, { label: 'DUSK', value: null }, { label: 'DAWN' }] },
    })
    expect(bars(container)).toHaveLength(1)
    expect(screen.queryByText('DUSK')).toBeNull()
    expect(screen.queryByText('DAWN')).toBeNull()
  })

  it('says so when every entry is unmeasured', () => {
    render(BarChart, { props: { data: [{ label: 'DAY', value: null }] } })
    expect(screen.getByText('No data yet.')).toBeInTheDocument()
  })
})

describe('BarChart is a table, not a picture', () => {
  it('exposes the values to a screen reader without extra work', () => {
    // The data IS tabular. A row header plus its number means the figures are
    // readable without the bar being described at all.
    render(BarChart, { props: { data: TIME_OF_DAY } })
    expect(screen.getByRole('rowheader', { name: 'DAY' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })

  it('hides the bar itself, since the value beside it is the real content', () => {
    const { container } = render(BarChart, { props: { data: TIME_OF_DAY } })
    for (const bar of bars(container)) {
      expect(bar.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('carries a caption when given one', () => {
    render(BarChart, { props: { data: TIME_OF_DAY, caption: 'Scenes by time of day' } })
    expect(screen.getByText('Scenes by time of day')).toBeInTheDocument()
  })

  it('keeps the caller\'s order rather than sorting', () => {
    // Ranking is editorial — most-first, alphabetical, and the screenplay's own
    // order are each correct somewhere, and none is this component's to pick.
    render(BarChart, { props: { data: [{ label: 'B', value: 1 }, { label: 'A', value: 99 }] } })
    const headers = screen.getAllByRole('rowheader').map((h) => h.textContent)
    expect(headers).toEqual(['B', 'A'])
  })
})

describe('BarChart tones', () => {
  it('defaults to accent and takes any StatusTone', () => {
    const { container } = render(BarChart, { props: { data: TIME_OF_DAY } })
    expect(bars(container)[0].dataset.tone).toBe('accent')

    const { container: c2 } = render(BarChart, { props: { data: TIME_OF_DAY, tone: 'success' } })
    expect(bars(c2)[0].dataset.tone).toBe('success')
  })
})
