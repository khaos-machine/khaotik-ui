import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import WorkspaceSwitcher from '@khaos-machine/khaotik-ui/components/svelte/WorkspaceSwitcher.svelte'

// WorkspaceSwitcher (data-layer plan K3; audit §3.2, §3.15, §4.1). The toolbar's mode
// control: a segmented control at full width, a pop-up button at the minimum width. The
// modes are props, so the short-term four and a later Assemble are the host's choice.
// jsdom does no layout, so the width is passed in as a value, as a toolbar that measures
// itself would pass it.

const modes = [
  { value: 'story', label: 'Story' },
  { value: 'review', label: 'Review' },
  { value: 'cast', label: 'Cast' },
  { value: 'perform', label: 'Perform' },
]

describe('at full width', () => {
  it('is a segmented control with every mode', () => {
    render(WorkspaceSwitcher, { props: { modes, value: 'cast', width: 900 } })
    expect(screen.getByRole('radiogroup', { name: 'Workspace' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
    expect(screen.getByRole('radio', { name: 'Cast' })).toBeChecked()
    expect(screen.queryByRole('combobox')).toBeNull()
  })
})

describe('below the width threshold', () => {
  it('the same modes render as a pop-up button and the selected mode is kept', () => {
    render(WorkspaceSwitcher, { props: { modes, value: 'cast', width: 300, compactBelow: 360 } })
    const popup = screen.getByRole('combobox', { name: 'Workspace' })
    expect(popup).toHaveValue('cast')
    expect([...popup.querySelectorAll('option')].map((o) => o.textContent)).toEqual(['Story', 'Review', 'Cast', 'Perform'])
    expect(screen.queryByRole('radiogroup')).toBeNull()
  })

  it('choosing from the pop-up asks for that mode', async () => {
    const onselect = vi.fn()
    render(WorkspaceSwitcher, { props: { modes, value: 'cast', width: 300, compactBelow: 360, onselect } })
    await fireEvent.change(screen.getByRole('combobox'), { target: { value: 'perform' } })
    expect(onselect).toHaveBeenCalledWith('perform')
  })

  it('an unmeasured width is treated as full, never as compact', () => {
    render(WorkspaceSwitcher, { props: { modes, value: 'story', width: 0 } })
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })
})

describe('⌃⌘1 to ⌃⌘n', () => {
  it('select a mode by its position', async () => {
    const onselect = vi.fn()
    render(WorkspaceSwitcher, { props: { modes, value: 'story', width: 900, onselect } })
    await fireEvent.keyDown(window, { key: '3', code: 'Digit3', ctrlKey: true, metaKey: true })
    expect(onselect).toHaveBeenCalledWith('cast')
  })

  it('ignore a position past the last mode, the current mode and a key without both modifiers', async () => {
    const onselect = vi.fn()
    render(WorkspaceSwitcher, { props: { modes, value: 'story', width: 900, onselect } })
    await fireEvent.keyDown(window, { key: '5', code: 'Digit5', ctrlKey: true, metaKey: true })
    await fireEvent.keyDown(window, { key: '1', code: 'Digit1', ctrlKey: true, metaKey: true })
    await fireEvent.keyDown(window, { key: '2', code: 'Digit2', metaKey: true })
    expect(onselect).not.toHaveBeenCalled()
  })

  it('are not bound when the host turns shortcuts off', async () => {
    const onselect = vi.fn()
    render(WorkspaceSwitcher, { props: { modes, value: 'story', width: 900, onselect, shortcuts: false } })
    await fireEvent.keyDown(window, { key: '2', code: 'Digit2', ctrlKey: true, metaKey: true })
    expect(onselect).not.toHaveBeenCalled()
  })
})
