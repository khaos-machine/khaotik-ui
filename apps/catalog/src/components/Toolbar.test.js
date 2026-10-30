import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Toolbar from '@khaos-machine/khaotik-ui/components/svelte/Toolbar.svelte'

// Toolbar (data-layer plan K4; audit §1.4, §4.1). The window's one bar: a title, the
// workspace switcher, buttons bound to commands, the filter field, the pane toggles and
// a drag region. Commands are props, the same shape CommandPalette takes; the toolbar
// runs nothing itself, it asks the host with the command's id.

const modes = [
  { value: 'story', label: 'Story' },
  { value: 'review', label: 'Review' },
]
const commands = [
  { id: 'character.cast', label: 'Cast voice', icon: 'microphone' },
  { id: 'scene.read', label: 'Read scene', icon: 'play', disabledReason: 'DESMOND has no voice' },
]
const panes = [
  { id: 'source', label: 'Source list', icon: 'sidebar-simple', shown: true },
  { id: 'inspector', label: 'Inspector', icon: 'sidebar', shown: false },
]

const base = { title: 'BROKEN IN 4 PLACES', modes, mode: 'story', commands, panes, width: 1200 }

describe('command buttons', () => {
  it('a disabled button carries its reason as its accessible description and does not run', async () => {
    const onrun = vi.fn()
    render(Toolbar, { props: { ...base, onrun } })
    const read = screen.getByRole('button', { name: 'Read scene' })
    expect(read).toHaveAttribute('aria-disabled', 'true')
    expect(read).toHaveAccessibleDescription('DESMOND has no voice')
    await fireEvent.click(read)
    expect(onrun).not.toHaveBeenCalled()
  })

  it('an enabled button asks the host to run its command by id', async () => {
    const onrun = vi.fn()
    render(Toolbar, { props: { ...base, onrun } })
    const cast = screen.getByRole('button', { name: 'Cast voice' })
    expect(cast).not.toHaveAttribute('aria-disabled')
    expect(cast).toHaveAttribute('data-command', 'character.cast')
    await fireEvent.click(cast)
    expect(onrun).toHaveBeenCalledWith('character.cast')
  })
})

describe('the drag region', () => {
  it('holds the title and no interactive element', () => {
    const { container } = render(Toolbar, { props: base })
    const regions = container.querySelectorAll('[data-tauri-drag-region]')
    expect(regions.length).toBeGreaterThan(0)
    for (const region of regions) {
      expect(region.querySelector('button, input, select, a, [tabindex]')).toBeNull()
    }
    expect(screen.getByRole('heading', { name: 'BROKEN IN 4 PLACES' }).closest('[data-tauri-drag-region]')).not.toBeNull()
  })
})

describe('the rest of the bar', () => {
  it('pane toggles say whether their pane is shown and ask the host to toggle it', async () => {
    const ontogglepane = vi.fn()
    render(Toolbar, { props: { ...base, ontogglepane } })
    expect(screen.getByRole('button', { name: 'Source list' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Inspector' })).toHaveAttribute('aria-pressed', 'false')
    await fireEvent.click(screen.getByRole('button', { name: 'Inspector' }))
    expect(ontogglepane).toHaveBeenCalledWith('inspector')
  })

  it('carries the workspace switcher and the filter field', async () => {
    const onfilter = vi.fn()
    render(Toolbar, { props: { ...base, filterLabel: 'Filter characters', onfilter } })
    expect(screen.getByRole('radiogroup', { name: 'Workspace' })).toBeInTheDocument()
    await fireEvent.input(screen.getByRole('searchbox', { name: 'Filter characters' }), { target: { value: 'des' } })
    expect(onfilter).toHaveBeenCalledWith('des')
  })

  it('is a toolbar landmark with automation ids', () => {
    render(Toolbar, { props: base })
    expect(screen.getByRole('toolbar')).toHaveAttribute('data-ui-id', 'toolbar')
    expect(screen.getByRole('button', { name: 'Cast voice' })).toHaveAttribute('data-ui-id', 'toolbar.command.character.cast')
  })
})

it('shows the current context before pane toggles without replacing the project title',()=>{
  const {container}=render(Toolbar,{props:{...base,context:'INT. STUDIO — DAY'}})
  expect(screen.getByRole('heading',{name:base.title})).toBeInTheDocument()
  expect(container.querySelector('.toolbar__context')).toHaveTextContent('INT. STUDIO — DAY')
  expect(container.querySelector('.toolbar__context')?.compareDocumentPosition(screen.getByRole('button',{name:'Source list'})) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

// khaos-app#617: three groups, and the status group at the trailing edge never clips. jsdom
// lays nothing out, so the overflow is stubbed on the row and a change to the row re-measures.
describe('the status group and the compact row', () => {
  it('draws the settings gear last, behind the status, only when asked to', async () => {
    const onsettings = vi.fn()
    const { container, rerender } = render(Toolbar, { props: { ...base, onsettings, settingsLabel: 'Project Settings…' } })
    const gear = screen.getByRole('button', { name: 'Project Settings…' })
    expect(gear).toHaveAttribute('title', 'Project Settings…')
    expect(container.querySelector('.toolbar__status')?.lastElementChild).toBe(gear)
    // Outside the part that takes the overflow, so a short row never clips it.
    expect(container.querySelector('.toolbar__main')).not.toContainElement(gear)
    await fireEvent.click(gear)
    expect(onsettings).toHaveBeenCalledOnce()
    await rerender({ ...base, onsettings: undefined })
    expect(screen.queryByRole('button', { name: 'Project Settings…' })).toBeNull()
  })

  // A fake layout: the row needs 1000px plus 150px for each label still shown. Folding every
  // label at once freed 450px where 150 was needed (#617 live pass); labels fold one at a time,
  // from the last command, only as far as the row needs.
  it('folds labels one at a time from the last, only until the row fits, then turns compact', async () => {
    const { container, rerender } = render(Toolbar, { props: { ...base, filter: '' } })
    const toolbar = /** @type {HTMLElement} */ (container.querySelector('.toolbar'))
    // Groups one and two take any overflow, so it is measured there; the status sits outside.
    const row = /** @type {HTMLElement} */ (container.querySelector('.toolbar__main'))
    let room = 1200
    Object.defineProperty(row, 'scrollWidth', { get: () => 1000 + 150 * row.querySelectorAll('.toolbar__label:not(.toolbar__label--folded)').length })
    Object.defineProperty(row, 'clientWidth', { get: () => room })
    const shown = () => [...row.querySelectorAll('.toolbar__label:not(.toolbar__label--folded)')].map((l) => l.textContent)
    const remeasure = async (title) => {
      await rerender({ ...base, filter: '', title })
      await new Promise((r) => setTimeout(r))
    }

    await remeasure('B4P')
    expect(shown()).toEqual(['Cast voice'])
    expect(toolbar).not.toHaveClass('toolbar--compact')
    expect(screen.getByRole('button', { name: 'Read scene' })).toBeInTheDocument()

    room = 1000
    await remeasure('BROKEN IN 4 PLACES')
    expect(shown()).toEqual([])
    expect(toolbar).not.toHaveClass('toolbar--compact')

    room = 900
    await remeasure('B4P')
    expect(toolbar).toHaveClass('toolbar--compact')

    room = 1400
    await remeasure('BROKEN IN 4 PLACES')
    expect(shown()).toEqual(['Cast voice', 'Read scene'])
    expect(toolbar).not.toHaveClass('toolbar--compact')
  })
})
