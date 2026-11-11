import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import fs from 'node:fs'
import path from 'node:path'
import Shell from '@khaos-machine/khaotik-ui/components/svelte/Shell.svelte'

// The data-layer window routes each docked pane to the host's view, and shows one layer at a
// time. A wrong route or a layer left live still renders a plausible window, so only the
// marks each host snippet leaves can tell.

const mark = (text) => createRawSnippet(() => ({ render: () => `<p data-mark="${text}">${text}</p>` }))
const paneMark = createRawSnippet((id) => ({ render: () => `<p data-mark="pane:${id()}">${id()}</p>` }))

const group = (id) => ({ kind: 'group', id: `g-${id}`, panels: [id], active: id })
const row = (...children) => ({ kind: 'split', id: children.map((c) => c.id).join('+'), direction: 'row', fixed: 'start', size: 200, children })
const layout = row(group('table'), row(group('detail'), row(group('inspector'), group('review.queue'))))
const panels = { table: { label: 'Table' }, detail: { label: 'Detail' }, inspector: { label: 'Inspector' }, 'review.queue': { label: 'Queue' } }

const shell = (props = {}) => render(Shell, {
  layout, panels, table: mark('table'), detail: mark('detail'), side: mark('side'), pane: paneMark,
  atlas: mark('atlas'), player: mark('player'), builders: mark('builders'), ...props,
})
const within = (container, selector, text) => container.querySelector(`${selector} [data-mark="${text}"]`)

describe('the data-layer window', () => {
  it('routes table, detail and inspector to their snippets, and any other pane by id', () => {
    const { container } = shell()
    for (const text of ['table', 'detail', 'side', 'pane:review.queue']) expect(within(container, '.ui-shell__data', text), text).not.toBeNull()
  })

  it('shows only the presentation chosen, and the others stay mounted but inert', () => {
    const { container } = shell({ presentation: 'atlas' })
    expect(container.querySelector('.ui-shell__atlas').inert).toBe(false)
    expect(container.querySelector('.ui-shell__data').inert).toBe(true)
    expect(container.querySelector('.ui-shell__player').inert).toBe(true)
  })

  it('lets an open builder cover the window, with the toolbar and every layer inert', () => {
    const { container } = shell({ builderOpen: true })
    expect(container.querySelector('.ui-shell__builders').hidden).toBe(false)
    for (const layer of ['.ui-shell__toolbar', '.ui-shell__data', '.ui-shell__atlas', '.ui-shell__player']) expect(container.querySelector(layer).inert, layer).toBe(true)
  })

  it('keeps the builders hidden while none is open', () => {
    const { container } = shell()
    expect(container.querySelector('.ui-shell__builders').hidden).toBe(true)
  })
})

// khaos-app#617: the Overview is a layer under the toolbar, with the status bar under it too.
describe('the overview layer', () => {
  it('shows the overview alone, with the one status bar under it', () => {
    const { container } = shell({ presentation: 'overview', overview: mark('overview'), budget: { kind: 'none' } })
    expect(within(container, '.ui-shell__overview', 'overview')).not.toBeNull()
    expect(container.querySelector('.ui-shell__overview').hidden).toBe(false)
    expect(container.querySelector('.ui-shell__data').inert).toBe(true)
    expect(container.querySelector('.ui-shell__status').hidden).toBe(false)
    expect(screen.getAllByRole('button', { name: /^Story budget/ })).toHaveLength(1)
  })

  it('hides the status bar over the canvases', () => {
    const { container } = shell({ presentation: 'atlas', overview: mark('overview') })
    expect(container.querySelector('.ui-shell__overview').hidden).toBe(true)
    expect(container.querySelector('.ui-shell__status').hidden).toBe(true)
  })
})

describe('the toolbar\'s three groups', () => {
  const modes = [{ value: 'overview', label: 'Overview' }, { value: 'data', label: 'Data' }]
  const workspaces = [{ value: 'story', label: 'Story' }, { value: 'review', label: 'Review' }]
  const commands = [{ id: 'character.new', label: 'New Character', icon: 'user-plus' }]

  it('puts the workspace switch with the modes, before the commands, and the status last', () => {
    const { container } = shell({ modes, workspaces, commands, presentation: 'data', snapshotError: 'khaosd is not running.' })
    const order = [screen.getByRole('radiogroup', { name: 'Data workspace' }), screen.getByRole('button', { name: 'New Character' }), screen.getByText('Story update failed')]
    for (let i = 1; i < order.length; i += 1) expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING, i).toBeTruthy()
    expect(container.querySelector('.toolbar__status')).toContainElement(screen.getByRole('button', { name: 'Retry' }))
  })

  // Project Settings moved to the foot of the source list (operator, 2026-11-10: "Sidebar foot, both").
  it('draws no settings gear in the toolbar', () => {
    const { container } = shell({ modes, commands, onProjectSettings: vi.fn() })
    expect(container.querySelector('.ui-shell__toolbar [data-ui-id$=".settings"]')).toBeNull()
  })
})

// The Data window follows the Overview screen (operator, 2026-11-10: "Match the Overview"): the
// source list hides to a rail and has Project Settings at its foot, and the inspector is there
// only while something is selected.
describe('the Data window\'s panes', () => {
  const source = { kind: 'split', id: 'root', direction: 'row', fixed: 'start', size: 220, children: [group('source'), {
    kind: 'split', id: 'right', direction: 'row', fixed: 'end', size: 300,
    children: [group('table'), { kind: 'group', id: 'g-inspector', panels: ['inspector', 'activity'], active: 'inspector' }],
  }] }
  const sourcePanels = { source: { label: 'Story' }, table: { label: 'Table' }, inspector: { label: 'Inspector' }, activity: { label: 'Activity' } }
  const collapsed = (tree, id) => (tree.id === id ? { ...tree, collapsed: true } : tree.kind === 'split' ? { ...tree, children: tree.children.map((c) => collapsed(c, id)) } : tree)
  const sourcePanes = [{ id: 'source', label: 'Source list', icon: 'sidebar-simple', shown: true }, { id: 'inspector', label: 'Inspector', icon: 'sidebar', shown: true }]
  const data = (props = {}) => shell({ layout: source, panels: sourcePanels, presentation: 'data', ...props })
  const sourcePane = (container) => container.querySelector('[data-ui-id="story.dock.pane.source"]')

  it('puts Project Settings at the foot of the source list', async () => {
    const onProjectSettings = vi.fn()
    const { container } = data({ onProjectSettings })
    const button = screen.getByRole('button', { name: 'Project Settings' })
    expect(sourcePane(container)).toContainElement(button)
    await fireEvent.click(button)
    expect(onProjectSettings).toHaveBeenCalledOnce()
  })

  it('draws no Project Settings without onProjectSettings', () => {
    data()
    expect(screen.queryByRole('button', { name: 'Project Settings' })).toBeNull()
  })

  it('hides the source list from a button at its top', async () => {
    const onTogglePane = vi.fn()
    const { container } = data({ onTogglePane })
    const hide = screen.getByRole('button', { name: 'Hide source list' })
    expect(sourcePane(container)).toContainElement(hide)
    await fireEvent.click(hide)
    expect(onTogglePane).toHaveBeenCalledWith('source')
  })

  it('leaves a rail with Show and Project Settings while the source list is hidden', async () => {
    const onTogglePane = vi.fn()
    const { container } = data({ layout: collapsed(source, 'root'), onTogglePane, onProjectSettings: vi.fn() })
    const rail = container.querySelector('.ui-shell__rail')
    expect(rail).not.toBeNull()
    expect(rail).toContainElement(screen.getByRole('button', { name: 'Project Settings' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Show source list' }))
    expect(onTogglePane).toHaveBeenCalledWith('source')
  })

  it('shows each destination\'s icon on the rail, and goes there on click', async () => {
    const onDestination = vi.fn()
    const sections = [{ id: 'story', label: 'Story', items: [{ id: 'characters', label: 'Characters', icon: 'user' }, { id: 'scenes', label: 'Scenes', icon: 'film-slate' }] }]
    const { container } = data({ layout: collapsed(source, 'root'), sections, destination: 'characters', onDestination })
    const rail = container.querySelector('.ui-shell__rail')
    const scenes = screen.getByRole('button', { name: 'Scenes' })
    expect(rail).toContainElement(scenes)
    await fireEvent.click(scenes)
    expect(onDestination).toHaveBeenCalledWith('scenes')
  })

  it('draws no rail while the source list shows', () => {
    const { container } = data()
    expect(container.querySelector('.ui-shell__rail')).toBeNull()
  })

  // The toggle is in the pane now; the player's composer sidebar still toggles from the toolbar.
  it('drops the toolbar\'s source list toggle in the Data window only', () => {
    const { unmount } = data({ panes: sourcePanes })
    expect(screen.queryByRole('button', { name: 'Source list' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Inspector' })).not.toBeNull()
    unmount()
    shell({ panes: sourcePanes, presentation: 'player' })
    expect(screen.getByRole('button', { name: 'Source list' })).not.toBeNull()
  })

  // khaotik-ui#56: the source column is whatever the split the toolbar's `source` toggle collapses
  // holds, not only a panel named `source` — a Review workspace's column is its own panel.
  describe('when the source column is another panel, in the split `source`', () => {
    const review = { ...source, id: 'source', children: [group('review.kinds'), source.children[1]] }
    const reviewPanels = { ...sourcePanels, 'review.kinds': { label: 'Kinds' } }
    const reviewData = (props = {}) => data({ layout: review, panels: reviewPanels, workspace: 'review', pane: paneMark, ...props })
    const kindsPane = (container) => container.querySelector('[data-ui-id="review.dock.pane.review.kinds"]')

    it('hides the column from a button at its top, around the host\'s own pane', async () => {
      const onTogglePane = vi.fn()
      const { container } = reviewData({ onTogglePane })
      const hide = screen.getByRole('button', { name: 'Hide source list' })
      expect(kindsPane(container)).toContainElement(hide)
      expect(within(container, '[data-ui-id="review.dock.pane.review.kinds"]', 'pane:review.kinds')).not.toBeNull()
      await fireEvent.click(hide)
      expect(onTogglePane).toHaveBeenCalledWith('source')
    })

    it('puts Project Settings at the column\'s foot', () => {
      const { container } = reviewData({ onProjectSettings: vi.fn() })
      expect(kindsPane(container)).toContainElement(screen.getByRole('button', { name: 'Project Settings' }))
    })

    it('leaves a rail with Show and Project Settings while the column is hidden', async () => {
      const onTogglePane = vi.fn()
      const { container } = reviewData({ layout: collapsed(review, 'source'), onTogglePane, onProjectSettings: vi.fn() })
      const rail = container.querySelector('.ui-shell__rail')
      expect(rail).not.toBeNull()
      expect(rail).toContainElement(screen.getByRole('button', { name: 'Project Settings' }))
      await fireEvent.click(screen.getByRole('button', { name: 'Show source list' }))
      expect(onTogglePane).toHaveBeenCalledWith('source')
    })

    it('puts no Hide button on the other panes', () => {
      reviewData()
      expect(screen.getAllByRole('button', { name: 'Hide source list' })).toHaveLength(1)
    })
  })

  it('closes the inspector while nothing is selected', () => {
    const { container } = data({ hasSelection: false })
    expect(within(container, '.ui-shell__data', 'side')).toBeNull()
    expect(within(container, '.ui-shell__data', 'table')).not.toBeNull()
  })

  it('opens the inspector while something is selected, and by default', () => {
    const { container } = data()
    expect(within(container, '.ui-shell__data', 'side')).not.toBeNull()
  })

  it('keeps Activity open while nothing is selected', () => {
    const activity = { ...source, children: [source.children[0], { ...source.children[1], children: [group('table'), { kind: 'group', id: 'g-inspector', panels: ['inspector', 'activity'], active: 'activity' }] }] }
    const { container } = data({ layout: activity, hasSelection: false, pane: paneMark })
    expect(within(container, '.ui-shell__data', 'pane:activity')).not.toBeNull()
  })

  // khaotik-ui#58: the inspector column is the fixed side of the split `inspector`, whichever panel
  // the host docks there — khaos-app's Review docks `review.answer`.
  describe('when the inspector column is another panel, in the split `inspector`', () => {
    const review = { kind: 'split', id: 'source', direction: 'row', fixed: 'start', size: 180, children: [group('review.kinds'), {
      kind: 'split', id: 'inspector', direction: 'row', fixed: 'end', size: 300,
      children: [row(group('review.queue'), group('review.excerpts')), group('review.answer')],
    }] }
    const reviewPanels = { 'review.kinds': { label: 'Kinds' }, 'review.queue': { label: 'Queue' }, 'review.excerpts': { label: 'Occurrences' }, 'review.answer': { label: 'Answer' } }
    const reviewData = (props = {}) => data({ layout: review, panels: reviewPanels, workspace: 'review', pane: paneMark, ...props })

    it('closes the column while nothing is selected', () => {
      const { container } = reviewData({ hasSelection: false })
      expect(within(container, '.ui-shell__data', 'pane:review.answer')).toBeNull()
      expect(within(container, '.ui-shell__data', 'pane:review.queue')).not.toBeNull()
    })

    it('opens it while something is selected', () => {
      const { container } = reviewData()
      expect(within(container, '.ui-shell__data', 'pane:review.answer')).not.toBeNull()
    })

    it('hands the host its own column state back when the panes change', async () => {
      const onLayoutChange = vi.fn()
      reviewData({ hasSelection: false, onLayoutChange })
      await fireEvent.keyDown(screen.getAllByRole('separator')[0], { key: 'ArrowRight' })
      expect(onLayoutChange.mock.calls.at(-1)[0].children[1].collapsed ?? false).toBe(false)
    })
  })

  // The closing is the window's, not the host's layout: a resize while it is closed hands the
  // host its own inspector state back, so the inspector returns with the next selection.
  it('hands the host its own inspector state back when the panes change', async () => {
    const onLayoutChange = vi.fn()
    data({ hasSelection: false, onLayoutChange })
    const gutter = screen.getAllByRole('separator')[0]
    await fireEvent.keyDown(gutter, { key: 'ArrowRight' })
    const next = onLayoutChange.mock.calls.at(-1)[0]
    expect(next.children[1].collapsed ?? false).toBe(false)
  })
})

describe('the status bar\'s story budget', () => {
  it('reaches the status bar, and asks the host to change it', async () => {
    const onchangebudget = vi.fn()
    shell({ budget: { kind: 'none' }, onchangebudget })
    const item = screen.getByRole('button', { name: /^Story budget/ })
    expect(item).toHaveTextContent('No budget set')
    await fireEvent.click(item)
    expect(onchangebudget).toHaveBeenCalledOnce()
  })
})

describe('the refusal notice', () => {
  it('sits on its own layer, outside the builders and every presentation, so an open builder cannot hide it', () => {
    const { container } = shell({ builderOpen: true, notice: mark('notice') })
    expect(within(container, '.ui-shell__notice', 'notice')).not.toBeNull()
    for (const layer of ['.ui-shell__data', '.ui-shell__builders', '.ui-shell__player']) expect(container.querySelector(`${layer} [data-mark="notice"]`), layer).toBeNull()
    expect(container.querySelector('.ui-shell__notice').classList.contains('ui-shell__notice--raised')).toBe(false)
  })

  it('clears the status bar in the data presentation', () => {
    const { container } = shell({ notice: mark('notice') })
    expect(container.querySelector('.ui-shell__notice').classList.contains('ui-shell__notice--raised')).toBe(true)
  })

  it('takes no layer when there is nothing to offer', () => {
    const { container } = shell()
    expect(container.querySelector('.ui-shell__notice')).toBeNull()
  })
})

// 100vh is the window: in a shorter host or a catalog frame the window overflowed it, as the
// Player's did (operator, 2026-11-10: "Height reads the window"; for the Shell, "Fix Shell's
// 100vh"). Read as source: jsdom lays nothing out.
describe('the window\'s height', () => {
  it('fills its container, not the window', () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, '../../../components/svelte/Shell.svelte'), 'utf8')
    const root = source.match(/\.ui-shell\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(root).toMatch(/height:\s*100%/)
    expect(root).not.toMatch(/100vh/)
  })
})
