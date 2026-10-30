import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import MeasureTable from '@khaos-machine/khaotik-ui/components/svelte/MeasureTable.svelte'

// The defect this component exists to avoid, and the one it can regress into.
//
// `BarChart` takes one measure per item, so three measures across 27 characters
// meant three charts and scrolling. The table puts them side by side — but only
// works if EACH COLUMN IS SCALED AGAINST ITSELF. Measured on the live capture:
// word counts run to 4024, scene counts to 29. On one shared scale every scene
// bar is under a pixel and the column reads as empty — a chart reporting "no
// data" about data it was handed.
//
// That is the never-share-an-axis rule applied inside a table, and it is
// invisible to every other kind of check: the numbers are all correct, the
// markup is all present, and the page looks fine until you notice a whole
// column is flat.

const MEASURES = [
  { key: 'lines', label: 'Lines' },
  { key: 'words', label: 'Words' },
]

// Deliberately two orders of magnitude apart, as the real data is.
const ROWS = [
  { label: 'Desmond', lines: 297, words: 4024 },
  { label: 'Jetta', lines: 241, words: 3610 },
  { label: 'Nacho', lines: 10, words: 112 },
]

/** Fill width as a number, for a given row and column index. */
function fillPct(rowName, col) {
  const row = screen.getByRole('row', { name: new RegExp(rowName) })
  const fills = row.querySelectorAll('.mtable__fill')
  return parseFloat(fills[col].getAttribute('style').match(/width:\s*([\d.]+)%/)[1])
}

describe('MeasureTable scales every column against itself', () => {
  it('gives the column maximum a full bar in each column, not just the largest number', () => {
    render(MeasureTable, { props: { rows: ROWS, measures: MEASURES } })

    // Desmond tops both columns, so both of his bars are full.
    expect(fillPct('Desmond', 0)).toBeCloseTo(100)
    expect(fillPct('Desmond', 1)).toBeCloseTo(100)
  })

  it('does not flatten a small-range column against a large-range one', () => {
    // THE REGRESSION GUARD. Nacho's 10 lines is 3.4% of 297 — small but drawn.
    // Under one shared scale (max 4024) it would be 0.25%, which is under a
    // pixel at any realistic track width and reads as nothing measured.
    render(MeasureTable, { props: { rows: ROWS, measures: MEASURES } })

    const linesPct = fillPct('Nacho', 0)
    expect(linesPct).toBeCloseTo((10 / 297) * 100, 1)
    expect(linesPct, 'a shared scale would put this under a pixel').toBeGreaterThan(1)
  })

  it('rescales to the rows it was given, not to a total off screen', () => {
    // A filtered set must rescale. Showing a bar relative to a maximum the
    // reader cannot see is a claim they have no way to check.
    render(MeasureTable, { props: { rows: ROWS.slice(1), measures: MEASURES } })
    expect(fillPct('Jetta', 0)).toBeCloseTo(100)
  })

  it('renders an absent measure as absent, never as zero', () => {
    render(MeasureTable, {
      props: { rows: [{ label: 'Ghost', lines: 5 }], measures: MEASURES },
    })
    const row = screen.getByRole('row', { name: /Ghost/ })
    // One bar, not two: the missing column draws no track at all.
    expect(row.querySelectorAll('.mtable__fill')).toHaveLength(1)
    expect(within(row).getByTitle('Not measured')).toBeInTheDocument()
  })

  it('sorts absent last in both directions', () => {
    // Absent is not small. Sorting it among the real zeroes would claim a
    // measurement nobody took.
    const rows = [{ label: 'Ghost', words: 1 }, { label: 'Desmond', lines: 297, words: 4024 }]
    const { rerender } = render(MeasureTable, {
      props: { rows, measures: MEASURES, sortKey: 'lines', sortDir: 'desc' },
    })
    let names = screen.getAllByRole('rowheader').map((h) => h.textContent.trim())
    expect(names[names.length - 1]).toBe('Ghost')

    rerender({ rows, measures: MEASURES, sortKey: 'lines', sortDir: 'asc' })
    names = screen.getAllByRole('rowheader').map((h) => h.textContent.trim())
    expect(names[names.length - 1], 'still last when ascending').toBe('Ghost')
  })

  it('reports sort through onSort and announces it with aria-sort', async () => {
    const onSort = vi.fn()
    render(MeasureTable, { props: { rows: ROWS, measures: MEASURES, onSort } })

    await fireEvent.click(screen.getByRole('button', { name: /Words/ }))

    expect(onSort).toHaveBeenCalledWith({ key: 'words', dir: 'desc' })
    expect(screen.getByRole('columnheader', { name: /Words/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
  })

  it('does not sort itself while the host owns the order', async () => {
    const onSort = vi.fn()
    const { rerender } = render(MeasureTable, {
      props: { rows: ROWS, measures: MEASURES, sortKey: 'lines', sortDir: 'asc', onSort },
    })

    await fireEvent.click(screen.getByRole('button', { name: /Words/ }))
    expect(onSort).toHaveBeenCalledTimes(1)

    // Handing control back must reveal nothing written behind the prop — the
    // #171 lesson, which my first tests there failed to catch.
    rerender({ rows: ROWS, measures: MEASURES, sortKey: undefined, sortDir: undefined })
    const names = screen.getAllByRole('rowheader').map((h) => h.textContent.trim())
    expect(names, 'the rows own order, not the click the host never accepted').toEqual([
      'Desmond',
      'Jetta',
      'Nacho',
    ])
  })

  it('offers no row controls when the host cannot receive a selection', () => {
    render(MeasureTable, { props: { rows: ROWS, measures: MEASURES } })
    // Only the two sort headings are buttons. A table that announced row
    // controls doing nothing would be worse than a plain table.
    expect(screen.getAllByRole('button')).toHaveLength(MEASURES.length)
  })

  it('says nothing rather than drawing a zeroed table', () => {
    render(MeasureTable, { props: { rows: [], measures: MEASURES, emptyLabel: 'No cast yet.' } })
    expect(screen.getByText('No cast yet.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })
})

describe('a small value is visible; a zero is not', () => {
  it('floors a non-zero bar so it reads as small rather than as nothing', () => {
    render(MeasureTable, {
      props: {
        rows: [{ label: 'Desmond', lines: 297 }, { label: 'Blaine', lines: 13 }],
        measures: [{ key: 'lines', label: 'Lines' }],
      },
    })
    const row = screen.getByRole('row', { name: /Blaine/ })
    expect(row.querySelector('.mtable__fill').classList.contains('mtable__fill--present')).toBe(true)
  })

  it('does not floor a real zero', () => {
    // A measured zero must stay visibly empty. Flooring it would draw a quantity
    // where the engine reported none — the mirror of the defect above, and worse,
    // because it invents rather than hides.
    render(MeasureTable, {
      props: {
        rows: [{ label: 'Desmond', lines: 297 }, { label: 'Extra', lines: 0 }],
        measures: [{ key: 'lines', label: 'Lines' }],
      },
    })
    const row = screen.getByRole('row', { name: /Extra/ })
    expect(row.querySelector('.mtable__fill').classList.contains('mtable__fill--present')).toBe(false)
  })
})
