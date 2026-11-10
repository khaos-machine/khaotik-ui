import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import Shell from '@khaos-machine/khaotik-ui/components/svelte/Shell.svelte'
import { shownPanels } from '@khaos-machine/khaotik-ui/components/svelte/lib/dock.js'

// The Data window on a phone and a tablet (operator, 2026-11-10, after the window measured
// unusable below 900: phone "Drill-down stack", tablet "Rail + two columns"). The mode follows
// the window's own width, which jsdom does not lay out, so each test sets it.
const mark = (text) => createRawSnippet(() => ({ render: () => `<p data-mark="${text}">${text}</p>` }))
const group = (id, panels = [id]) => ({ kind: 'group', id: `g-${id}`, panels, active: panels[0] })
const layout = { kind: 'split', id: 'root', direction: 'row', fixed: 'start', size: 220, children: [group('source'), {
  kind: 'split', id: 'right', direction: 'row', fixed: 'end', size: 300,
  children: [{ kind: 'split', id: 'middle', direction: 'row', fixed: 'start', size: 420, children: [group('table'), group('detail')] }, group('inspector', ['inspector', 'activity'])],
}] }
const panels = { source: { label: 'Story' }, table: { label: 'Table' }, detail: { label: 'Detail' }, inspector: { label: 'Inspector' }, activity: { label: 'Activity' } }
const sections = [{ id: 'story', label: 'Story', items: [{ id: 'characters', label: 'Characters', icon: 'user' }, { id: 'scenes', label: 'Scenes', icon: 'film-slate' }] }]
const workspaces = [{ value: 'story', label: 'Story' }, { value: 'review', label: 'Review' }]

let width = 0
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.classList?.contains('ui-shell') ? width : 0 } })
})
afterEach(() => {
  delete HTMLElement.prototype.clientWidth
  width = 0
})
const at = (w, props = {}) => {
  width = w
  return render(Shell, { props: { presentation: 'data', layout, panels, sections, workspaces, destination: 'characters', table: mark('table'), detail: mark('detail'), side: mark('side'), ...props } })
}
const shown = (container, text) => container.querySelector(`.ui-shell__data [data-mark="${text}"]`)

describe('the shown panels of a layout', () => {
  it('lists each group\'s shown panel in reading order', () => {
    expect(shownPanels(layout)).toEqual(['source', 'table', 'detail', 'inspector'])
    expect(shownPanels(null)).toEqual([])
  })
})

describe('the Data window on a phone', () => {
  it('shows the destination\'s table alone, under its name, with no docked panes', () => {
    const { container } = at(390, { hasSelection: false })
    expect(container.querySelector('.dock')).toBeNull()
    expect(shown(container, 'table')).not.toBeNull()
    expect(shown(container, 'detail')).toBeNull()
    expect(shown(container, 'side')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Characters' })).toBeTruthy()
  })

  it('goes back to the source list, and a destination chosen there comes forward again', async () => {
    const onDestination = vi.fn()
    const { container } = at(390, { hasSelection: false, onDestination, onProjectSettings: vi.fn() })
    await fireEvent.click(screen.getByRole('button', { name: 'Story' }))
    expect(shown(container, 'table')).toBeNull()
    expect(screen.getByRole('button', { name: 'Project Settings' })).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes' }))
    expect(onDestination).toHaveBeenCalledWith('scenes')
    expect(shown(container, 'table')).not.toBeNull()
  })

  // operator, 2026-11-10: asked whether the selection reads detail then inspector, "Inspector first".
  it('shows the selection on its own, the inspector above the detail, and Back clears it', async () => {
    const onDeselect = vi.fn()
    const { container } = at(390, { onDeselect })
    expect(shown(container, 'table')).toBeNull()
    const detail = shown(container, 'detail'), side = shown(container, 'side')
    expect(side.compareDocumentPosition(detail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Characters' }))
    expect(onDeselect).toHaveBeenCalledOnce()
  })
})

// operator, 2026-11-10: "the top navbar on mobile odd + i don't know what mic + play buttons
// are"; chose "Title + pop-up + More": one row that never scrolls, the presentations as a pop-up,
// the commands named in a More menu, the filter under the stack's Back row, no pane toggles.
describe('the Data window\'s toolbar on a phone', () => {
  const commands = [{ id: 'cast', label: 'Cast voice', icon: 'microphone' }, { id: 'read', label: 'Read scene', icon: 'play', disabledReason: 'DESMOND has no voice' }]
  const modes = [{ value: 'data', label: 'Data' }, { value: 'atlas', label: 'Atlas' }, { value: 'player', label: 'Player' }]
  const toolbarPanes = [{ id: 'inspector', label: 'Inspector', icon: 'sidebar', shown: true }]
  const bar = (container) => container.querySelector('.ui-shell__toolbar')

  it('names its commands in a More menu, and runs one chosen there', async () => {
    const onRun = vi.fn()
    const { container } = at(390, { commands, onRun, hasSelection: false })
    const more = screen.getByRole('button', { name: 'More' })
    const menu = container.querySelector(`#${more.getAttribute('popovertarget')}`)
    expect(menu).not.toBeNull()
    expect(bar(container).querySelector('[data-command]:not(.ui-command-menu__item)')).toBeNull()
    await fireEvent.click(within(menu).getByRole('button', { name: 'Cast voice', hidden: true }))
    expect(onRun).toHaveBeenCalledWith('cast')
  })

  it('says why a command cannot run, and does not run it', async () => {
    const onRun = vi.fn()
    const { container } = at(390, { commands, onRun, hasSelection: false })
    const menu = container.querySelector(`#${screen.getByRole('button', { name: 'More' }).getAttribute('popovertarget')}`)
    const read = within(menu).getByRole('button', { name: 'Read scene', hidden: true })
    expect(read).toHaveAttribute('aria-disabled', 'true')
    expect(read).toHaveAccessibleDescription('DESMOND has no voice')
    await fireEvent.click(read)
    expect(onRun).not.toHaveBeenCalled()
  })

  it('shows the presentations as a pop-up and draws no pane toggles', () => {
    const { container } = at(390, { modes, panes: toolbarPanes, hasSelection: false })
    expect(within(bar(container)).queryByRole('radio', { name: 'Atlas' })).toBeNull()
    expect(within(bar(container)).queryByRole('button', { name: 'Inspector' })).toBeNull()
  })

  // operator, 2026-11-10: "mobile=cloud", with no voice or media yet; the host passes no such
  // commands ("Host decides"), so a bar with none draws no More.
  it('draws no More without commands', () => {
    at(390, { commands: [], hasSelection: false })
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull()
  })

  // operator, 2026-11-10, on the Story/Review switch in the phone's bar: "Drop it on phone".
  it('leaves the Story/Review switch out of the bar; Review is in the source list', () => {
    const { container } = at(390, { hasSelection: false })
    expect(within(bar(container)).queryByRole('radio', { name: 'Review' })).toBeNull()
    expect(within(bar(container)).queryByRole('button', { name: 'Review' })).toBeNull()
  })

  it('moves the filter under the stack\'s Back row', async () => {
    const onFilter = vi.fn()
    const { container } = at(390, { filter: '', filterLabel: 'Filter characters', onFilter, hasSelection: false })
    expect(within(bar(container)).queryByRole('searchbox')).toBeNull()
    const field = within(container.querySelector('.ui-shell__stack')).getByRole('searchbox', { name: 'Filter characters' })
    await fireEvent.input(field, { target: { value: 'mad' } })
    expect(onFilter).toHaveBeenCalledWith('mad')
  })

  it('keeps the commands, the switch and the toggles in the toolbar on a tablet', () => {
    const { container } = at(768, { commands, modes, panes: toolbarPanes })
    expect(bar(container).querySelector('[data-command="cast"]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull()
    expect(within(bar(container)).getByRole('button', { name: 'Inspector' })).toBeTruthy()
  })
})

describe('the Data window on a tablet', () => {
  it('keeps the source list to its rail, leaving the table and the inspector', () => {
    const onLayoutChange = vi.fn()
    const { container } = at(768, { onLayoutChange })
    expect(container.querySelector('.ui-shell__rail')).not.toBeNull()
    expect(container.querySelector('[data-ui-id="story.dock.pane.source"]')).toBeNull()
    expect(shown(container, 'table')).not.toBeNull()
    expect(shown(container, 'side')).not.toBeNull()
    expect(onLayoutChange).not.toHaveBeenCalled()
  })

  it('opens and closes the source list from the rail without changing the host\'s layout', async () => {
    const onTogglePane = vi.fn()
    const { container } = at(768, { onTogglePane })
    await fireEvent.click(screen.getByRole('button', { name: 'Show source list' }))
    expect(container.querySelector('[data-ui-id="story.dock.pane.source"]')).not.toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Hide source list' }))
    expect(container.querySelector('.ui-shell__rail')).not.toBeNull()
    expect(onTogglePane).not.toHaveBeenCalled()
  })

  it('asks the host to show a source list its own layout hides', async () => {
    const onTogglePane = vi.fn()
    at(768, { layout: { ...layout, collapsed: true }, onTogglePane })
    await fireEvent.click(screen.getByRole('button', { name: 'Show source list' }))
    expect(onTogglePane).toHaveBeenCalledWith('source')
  })
})

describe('the Data window when wide', () => {
  it('is unchanged, and an unmeasured window counts as wide', () => {
    for (const w of [1280, 0]) {
      const { container, unmount } = at(w)
      expect(container.querySelector('[data-ui-id="story.dock.pane.source"]')).not.toBeNull()
      expect(container.querySelector('.ui-shell__rail')).toBeNull()
      unmount()
    }
  })
})
