import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
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

  it('puts the workspace switch with the modes, before the commands, and the status and gear last', async () => {
    const onProjectSettings = vi.fn()
    const { container } = shell({ modes, workspaces, commands, presentation: 'data', snapshotError: 'khaosd is not running.', onProjectSettings })
    const order = [screen.getByRole('radiogroup', { name: 'Data workspace' }), screen.getByRole('button', { name: 'New Character' }), screen.getByText('Story update failed'), screen.getByRole('button', { name: 'Project Settings…' })]
    for (let i = 1; i < order.length; i += 1) expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING, i).toBeTruthy()
    expect(container.querySelector('.toolbar__status')).toContainElement(screen.getByRole('button', { name: 'Retry' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Project Settings…' }))
    expect(onProjectSettings).toHaveBeenCalledOnce()
  })

  it('draws no gear without onProjectSettings', () => {
    shell({ modes, commands })
    expect(screen.queryByRole('button', { name: 'Project Settings…' })).toBeNull()
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
