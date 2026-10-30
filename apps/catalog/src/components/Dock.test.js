import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import Dock from '@khaos-machine/khaotik-ui/components/svelte/Dock.svelte'
import {
  resizeSplit,
  toggleSplit,
  selectTab,
  serializeLayout,
  parseLayout,
  minExtent,
} from '@khaos-machine/khaotik-ui/components/svelte/lib/dock.js'

// Dock (audit §3.2, §4.1). The layout is plain data: a split or a tab group, nested.
// The host saves what `onlayoutchange` hands it and passes it back; the Dock never
// reads storage. jsdom does no layout (RULES.md, "Testing and delivery", class 1),
// so the geometry rules are pure functions tested on their own, and the component
// test covers the ARIA and keyboard contract.

const panels = {
  source: { label: 'Source', min: 180, size: 220 },
  table: { label: 'Characters', min: 320, size: 420 },
  detail: { label: 'Detail', min: 280 },
  inspector: { label: 'Inspector', min: 260, size: 300 },
  activity: { label: 'Activity', min: 260, size: 300 },
}

/** The Story preset (audit §3.3): source · table · detail · inspector, Activity tabbed with the inspector. */
const story = () => ({
  kind: 'split', id: 'root', direction: 'row', fixed: 'start', size: 220,
  children: [
    { kind: 'group', id: 'g-source', panels: ['source'], active: 'source' },
    {
      kind: 'split', id: 'right', direction: 'row', fixed: 'end', size: 300, overlay: true,
      children: [
        {
          kind: 'split', id: 'middle', direction: 'row', fixed: 'start', size: 420,
          children: [
            { kind: 'group', id: 'g-table', panels: ['table'], active: 'table' },
            { kind: 'group', id: 'g-detail', panels: ['detail'], active: 'detail' },
          ],
        },
        { kind: 'group', id: 'g-inspector', panels: ['inspector', 'activity'], active: 'inspector' },
      ],
    },
  ],
})

const panel = createRawSnippet((id) => ({ render: () => `<p>panel ${id()}</p>` }))

describe('the layout is data', () => {
  it('serialises and restores to the same tree', () => {
    const tree = story()
    expect(parseLayout(serializeLayout(tree), panels)).toEqual(tree)
  })

  it('restores nothing from text that is not a layout', () => {
    expect(parseLayout('not json', panels)).toBeNull()
    expect(parseLayout('{"kind":"split"}', panels)).toBeNull()
  })

  it('restores nothing when a panel id is one this build does not have', () => {
    const tree = story()
    tree.children[0].panels = ['gone']
    tree.children[0].active = 'gone'
    expect(parseLayout(serializeLayout(tree), panels)).toBeNull()
  })

  it('restores nothing when a group names an active panel it does not hold', () => {
    const tree = story()
    tree.children[0].active = 'table'
    expect(parseLayout(serializeLayout(tree), panels)).toBeNull()
  })
})

describe('resizing', () => {
  it('a pane dragged below its minimum collapses instead of shrinking', () => {
    const next = resizeSplit(story(), 'root', 120, panels)
    expect(next.collapsed).toBe(true)
    expect(next.size).toBe(220)
  })

  it('a size at or above the minimum is kept, and nothing collapses', () => {
    const next = resizeSplit(story(), 'root', 200, panels)
    expect(next.collapsed).toBeFalsy()
    expect(next.size).toBe(200)
  })

  it('a size just under the minimum clamps to it; collapse needs a real pull past it', () => {
    const next = resizeSplit(story(), 'root', 170, panels)
    expect(next.collapsed).toBeFalsy()
    expect(next.size).toBe(180)
  })

  it('reaches a nested split by its id and leaves the input untouched', () => {
    const before = story()
    const next = resizeSplit(before, 'middle', 500, panels)
    expect(next.children[1].children[0].size).toBe(500)
    expect(before.children[1].children[0].size).toBe(420)
  })

  it('toggling a collapsed split restores the size it had', () => {
    const collapsed = resizeSplit(story(), 'root', 100, panels)
    const restored = toggleSplit(collapsed, 'root')
    expect(restored.collapsed).toBe(false)
    expect(restored.size).toBe(220)
  })

  it('the minimum extent of a row is the sum of its sides, of a group its largest panel', () => {
    expect(minExtent(story(), panels, 'row')).toBe(180 + 320 + 280 + 260)
    const collapsed = toggleSplit(story(), 'right')
    expect(minExtent(collapsed, panels, 'row')).toBe(180 + 320 + 280)
  })

  it('selecting a tab changes only that group', () => {
    const next = selectTab(story(), 'g-inspector', 'activity')
    expect(next.children[1].children[1].active).toBe('activity')
    expect(selectTab(story(), 'g-inspector', 'table')).toEqual(story())
  })
})

describe('the component', () => {
  it('draws a tab strip only for a group of two or more panels', () => {
    render(Dock, { props: { layout: story(), panels, panel } })
    const tablists = screen.getAllByRole('tablist')
    expect(tablists).toHaveLength(1)
    expect(screen.getByRole('tab', { name: 'Inspector' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('region', { name: 'Characters' })).toHaveTextContent('panel table')
  })

  it('a gutter is a separator that resizes from the keyboard and reports the new layout', async () => {
    const onlayoutchange = vi.fn()
    render(Dock, { props: { layout: story(), panels, panel, onlayoutchange } })
    const gutter = screen.getByRole('separator', { name: 'Resize Source' })
    expect(gutter).toHaveAttribute('aria-valuenow', '220')
    expect(gutter).toHaveAttribute('aria-valuemin', '180')
    expect(gutter).toHaveAttribute('data-ui-id', 'dock.gutter.root')
    await fireEvent.keyDown(gutter, { key: 'ArrowRight' })
    expect(onlayoutchange).toHaveBeenCalledTimes(1)
    expect(onlayoutchange.mock.calls[0][0].size).toBe(228)
  })

  it('the arrow keys grow a pane fixed at the end from its own side', async () => {
    const onlayoutchange = vi.fn()
    render(Dock, { props: { layout: story(), panels, panel, onlayoutchange } })
    await fireEvent.keyDown(screen.getByRole('separator', { name: 'Resize Inspector' }), { key: 'ArrowLeft' })
    expect(onlayoutchange.mock.calls[0][0].children[1].size).toBe(308)
  })

  it('Enter on a gutter collapses its pane, and the pane leaves the document', async () => {
    const onlayoutchange = vi.fn()
    render(Dock, { props: { layout: story(), panels, panel, onlayoutchange } })
    await fireEvent.keyDown(screen.getByRole('separator', { name: 'Resize Source' }), { key: 'Enter' })
    expect(onlayoutchange.mock.calls[0][0].collapsed).toBe(true)
    expect(screen.queryByRole('region', { name: 'Source' })).toBeNull()
  })

  it('clicking a tab selects it and reports the layout', async () => {
    const onlayoutchange = vi.fn()
    render(Dock, { props: { layout: story(), panels, panel, onlayoutchange } })
    await fireEvent.click(screen.getByRole('tab', { name: 'Activity' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('panel activity')
    expect(onlayoutchange.mock.calls[0][0].children[1].children[1].active).toBe('activity')
  })
})
