import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import DataTable from '@khaos-machine/khaotik-ui/components/svelte/DataTable.svelte'
import { rowWindow, visibleRows, flattenGroups, itemOffsets, offsetWindow } from '@khaos-machine/khaotik-ui/components/svelte/lib/table.js'

// DataTable (data-layer plan K5, its named failing check; audit §2 item 2, §3.1
// principle 5, §3.16, §4.1). Review rendered 1,912 rows and 151,287px of DOM. A table
// renders the rows that fit its viewport plus an overscan on each side, and keeps
// `aria-rowcount` and `aria-rowindex` true to the whole set, so a screen reader still
// hears "row 412 of 1,912".
//
// jsdom does no layout (RULES.md, "Testing and delivery", class 1), so the viewport
// height and the row height are passed in as values, and the window is a pure function
// tested on its own. Frame time is a live measurement, not a jsdom one.

const ROW = 24
const VIEWPORT = 480
const OVERSCAN = 8

const occurrences = Array.from({ length: 1912 }, (_, i) => ({
  id: `occ-${i}`,
  mention: i % 3 === 0 ? 'Des' : i % 3 === 1 ? 'Madi' : 'the kitchen',
  kind: i % 3 === 2 ? 'Places' : 'Characters',
  scene: (i % 57) + 1,
}))

const columns = [
  { key: 'mention', label: 'Mention', width: 'minmax(120px, 1fr)', value: (r) => r.mention },
  { key: 'kind', label: 'Kind', width: '120px', value: (r) => r.kind },
  { key: 'scene', label: 'Scene', width: '56px', align: 'end', value: (r) => r.scene },
]

const base = { rows: occurrences, columns, rowKey: (r) => r.id, label: 'Review queue', viewportHeight: VIEWPORT, rowHeight: ROW, overscan: OVERSCAN }

const dataRows = (container) => [...container.querySelectorAll('[role="row"][aria-rowindex]')].filter((r) => r.closest('[role="rowgroup"]')?.dataset.body !== undefined)

describe('the row window (the failing check)', () => {
  it('aria-rowcount is the whole set, header included', () => {
    render(DataTable, { props: base })
    expect(screen.getByRole('grid', { name: 'Review queue' })).toHaveAttribute('aria-rowcount', String(1912 + 1))
  })

  it('renders at most the rows that fit plus the overscan on each side', () => {
    const { container } = render(DataTable, { props: base })
    expect(dataRows(container).length).toBeLessThanOrEqual(VIEWPORT / ROW + 2 * OVERSCAN)
    expect(dataRows(container).length).toBeGreaterThan(0)
  })

  it('the first rendered row’s aria-rowindex matches the scroll offset', async () => {
    const { container } = render(DataTable, { props: base })
    const body = container.querySelector('[data-scroller]')
    body.scrollTop = 1000 * ROW
    await fireEvent.scroll(body)
    const rows = dataRows(container)
    // Row indices are 1-based and the header is row 1, so data row n is aria-rowindex n + 2.
    expect(rows[0]).toHaveAttribute('aria-rowindex', String(1000 - OVERSCAN + 2))
    expect(rows.length).toBeLessThanOrEqual(VIEWPORT / ROW + 2 * OVERSCAN)
  })

  it('rowWindow clamps at both ends', () => {
    expect(rowWindow(0, VIEWPORT, ROW, 1912, OVERSCAN)).toEqual({ start: 0, end: 20 + OVERSCAN })
    expect(rowWindow(1912 * ROW, VIEWPORT, ROW, 1912, OVERSCAN)).toEqual({ start: 1912 - OVERSCAN, end: 1912 })
    expect(rowWindow(0, VIEWPORT, ROW, 5, OVERSCAN)).toEqual({ start: 0, end: 5 })
    expect(rowWindow(0, 0, ROW, 0, OVERSCAN)).toEqual({ start: 0, end: 0 })
  })
})

describe('filter, sort and grouping', () => {
  it('filters on any column and sorts by one, numbers as numbers', () => {
    const rows = [{ n: 10, s: 'b' }, { n: 9, s: 'a' }, { n: 100, s: 'c' }]
    const cols = [{ key: 'n', label: 'N', width: '1fr', value: (r) => r.n }, { key: 's', label: 'S', width: '1fr', value: (r) => r.s }]
    expect(visibleRows(rows, cols, '', 'n', 1).map((r) => r.n)).toEqual([9, 10, 100])
    expect(visibleRows(rows, cols, '', 'n', -1).map((r) => r.n)).toEqual([100, 10, 9])
    expect(visibleRows(rows, cols, 'B', null, 1)).toEqual([{ n: 10, s: 'b' }])
  })

  it('groups keep their first-seen order and carry their count', () => {
    const flat = flattenGroups(occurrences.slice(0, 6), (r) => r.kind)
    expect(flat.filter((x) => x.kind === 'group').map((g) => [g.label, g.count])).toEqual([['Characters', 4], ['Places', 2]])
    expect(flat).toHaveLength(8)
  })

  it('a sortable header reports its sort and asks for the other direction', async () => {
    const onsort = vi.fn()
    render(DataTable, { props: { ...base, sort: { key: 'scene', dir: 1 }, onsort } })
    const header = screen.getByRole('columnheader', { name: /Scene/ })
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('columnheader', { name: /Mention/ })).toHaveAttribute('aria-sort', 'none')
    await fireEvent.click(header.querySelector('button'))
    expect(onsort).toHaveBeenCalledWith({ key: 'scene', dir: -1 })
  })

  it('a group header row names its group and count', () => {
    render(DataTable, { props: { ...base, rows: occurrences.slice(0, 6), groupBy: (r) => r.kind } })
    expect(screen.getByRole('row', { name: /^Characters 4$/ })).toBeInTheDocument()
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', String(6 + 2 + 1))
  })
})

describe('selection and the keyboard', () => {
  it('the selected row is aria-selected and the grid’s one tab stop', () => {
    const { container } = render(DataTable, { props: { ...base, selected: 'occ-2' } })
    const row = container.querySelector('[data-ui-id="table.row.occ-2"]')
    expect(row).toHaveAttribute('aria-selected', 'true')
    expect(row).toHaveAttribute('tabindex', '0')
    expect(container.querySelectorAll('[role="row"][tabindex="0"]')).toHaveLength(1)
  })

  it('↓ and ↑ ask for the next and previous row, Home and End for the ends', async () => {
    const onselect = vi.fn()
    const { container } = render(DataTable, { props: { ...base, selected: 'occ-2', onselect } })
    const grid = screen.getByRole('grid')
    await fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(onselect).toHaveBeenLastCalledWith('occ-3')
    await fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(onselect).toHaveBeenLastCalledWith('occ-1')
    await fireEvent.keyDown(grid, { key: 'End' })
    expect(onselect).toHaveBeenLastCalledWith('occ-1911')
    await fireEvent.keyDown(grid, { key: 'Home' })
    expect(onselect).toHaveBeenLastCalledWith('occ-0')
    expect(container).toBeTruthy()
  })

  it('type-ahead asks for the next row whose first column starts with the typed text', async () => {
    const onselect = vi.fn()
    render(DataTable, { props: { ...base, selected: 'occ-0', onselect } })
    const grid = screen.getByRole('grid')
    await fireEvent.keyDown(grid, { key: 't' })
    await fireEvent.keyDown(grid, { key: 'h' })
    expect(onselect).toHaveBeenLastCalledWith('occ-2')
  })

  it('Return asks the host to open the selected row', async () => {
    const onopen = vi.fn()
    render(DataTable, { props: { ...base, selected: 'occ-5', onopen } })
    await fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })
    expect(onopen).toHaveBeenCalledWith('occ-5')
  })

  it('a click asks for its row', async () => {
    const onselect = vi.fn()
    const { container } = render(DataTable, { props: { ...base, onselect } })
    await fireEvent.click(container.querySelector('[data-ui-id="table.row.occ-3"]'))
    expect(onselect).toHaveBeenCalledWith('occ-3')
  })
})

describe('empty', () => {
  it('says so instead of rendering nothing', () => {
    render(DataTable, { props: { ...base, rows: [], empty: 'No objects in this story.' } })
    expect(screen.getByText('No objects in this story.')).toBeInTheDocument()
  })
})

// Wrapped rows (data-layer Story fixes): a long line reads in full instead of ending in
// "…", so rows differ in height. Each rendered row is measured once it lays out; a row
// not yet measured counts as `rowHeight`, and the window is found over the running offsets.
describe('wrapped rows', () => {
  it('offsets run over measured heights, estimating the rows not yet measured', () => {
    const measured = new Map([[1, 72], [3, 48]])
    expect([...itemOffsets(5, (i) => measured.get(i), ROW)]).toEqual([0, 24, 96, 120, 168, 192])
  })

  it('the window covers the rows the viewport crosses, plus the overscan', () => {
    const offsets = itemOffsets(100, (i) => (i % 2 ? 72 : 24), ROW)
    // 0,24 | 24,96 | 96,120 | 120,192 | 192,216 ... scrolled to 100 with a 100px viewport.
    expect(offsetWindow(offsets, 100, 100, 0)).toEqual({ start: 2, end: 5 })
    expect(offsetWindow(offsets, 100, 100, 2)).toEqual({ start: 0, end: 7 })
    expect(offsetWindow(offsets, 0, 0, 0)).toEqual({ start: 0, end: 0 })
    expect(offsetWindow(itemOffsets(0, () => undefined, ROW), 0, 480, 8)).toEqual({ start: 0, end: 0 })
  })

  it('a wrapping table lets its cells wrap and still renders only a window', () => {
    const lines = Array.from({ length: 500 }, (_, i) => ({ id: `l${i}`, text: 'A line long enough to wrap. '.repeat(i % 4 + 1) }))
    const { container } = render(DataTable, {
      props: { rows: lines, columns: [{ key: 'text', label: 'Line', width: '1fr', value: (r) => r.text }], label: 'Lines', wrap: true, viewportHeight: VIEWPORT, rowHeight: ROW, overscan: OVERSCAN },
    })
    expect(container.querySelector('[role="grid"]')).toHaveClass('table--wrap')
    expect(dataRows(container).length).toBe(VIEWPORT / ROW + OVERSCAN)
    expect(screen.getAllByText(lines[3].text.trim())[0]).toBeInTheDocument()
  })
})

// A column's subtitle: a second, quieter line under the cell's value, for the rows that
// have one (khaos-app: an analysed scene's title above its heading). A row without one
// draws exactly as before, so rows differ in height and are measured as wrapped rows are.
describe('subtitles', () => {
  const scenes = [
    { id: 's1', title: 'Locked Out', heading: 'INT. APARTMENT - NIGHT' },
    { id: 's2', title: '', heading: 'EXT. STREET - DAY' },
  ]
  const sceneColumns = [
    {
      key: 'scene',
      label: 'Scene',
      width: '1fr',
      value: (r) => r.title || r.heading,
      subtitle: (r) => (r.title ? r.heading : null),
    },
  ]
  const props = { rows: scenes, columns: sceneColumns, label: 'Scenes', viewportHeight: VIEWPORT, rowHeight: ROW, overscan: OVERSCAN }

  it('draws the subtitle below the value, and the cell names both', () => {
    render(DataTable, { props })
    const cell = screen.getByText('Locked Out').closest('[role="gridcell"]')
    expect(cell.querySelector('[data-subtitle]')).toHaveTextContent('INT. APARTMENT - NIGHT')
    expect(cell).toHaveTextContent(/Locked Out\s*INT\. APARTMENT - NIGHT/)
    expect(screen.getByRole('row', { name: /Locked Out.*INT\. APARTMENT - NIGHT/ })).toBeInTheDocument()
  })

  it('a row without a subtitle draws its value alone, as before', () => {
    render(DataTable, { props })
    const cell = screen.getByText('EXT. STREET - DAY').closest('[role="gridcell"]')
    expect(cell.querySelector('[data-subtitle]')).toBeNull()
    expect(cell).toHaveTextContent(/^EXT\. STREET - DAY$/)
  })

  it('a table with subtitles measures its rows but does not wrap them', () => {
    const { container } = render(DataTable, { props })
    const grid = container.querySelector('[role="grid"]')
    expect(grid).toHaveClass('table--measured')
    expect(grid).not.toHaveClass('table--wrap')
  })

  it('the filter finds a row by its subtitle', () => {
    expect(visibleRows(scenes, sceneColumns, 'apartment', null, 1).map((r) => r.id)).toEqual(['s1'])
  })
})
