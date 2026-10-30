import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ScreenplayText from '@khaos-machine/khaotik-ui/components/svelte/ScreenplayText.svelte'

// ScreenplayText (data-layer plan K9; audit §1.6, §4.1). A scene's text, formatted as a
// screenplay, with each element a selectable line. Selection is the host's: a click or
// an arrow key asks with the element's id. The text is the script's own: nothing is
// added inside a line, so copying it copies what was written.

// S48 of B4P, as served (the scene the P2 baseline read).
const elements = [
  { id: 'slug_1', kind: 'slugline', text: "INT. DESMOND'S APARTMENT - NIGHT" },
  { id: 'act_1', kind: 'action', text: 'Des is watching a late movie. Jetta is asleep in his arms on the sofa. The phone rings.' },
  { id: 'chr_1', kind: 'character', text: 'DESMOND' },
  { id: 'dia_1', kind: 'dialogue', text: 'Hello' },
  { id: 'tr_1', kind: 'transition', text: 'JUMP CUT TO:' },
]

describe('ScreenplayText', () => {
  it('renders every element as a line holding exactly its text, in order', () => {
    render(ScreenplayText, { props: { elements, label: 'Scene 48' } })
    const lines = screen.getAllByRole('option')
    expect(lines.map((l) => l.textContent)).toEqual(elements.map((e) => e.text))
    expect(lines.map((l) => l.dataset.kind)).toEqual(elements.map((e) => e.kind))
  })

  it('each line is selectable by keyboard and emits its element id', async () => {
    const onselect = vi.fn()
    render(ScreenplayText, { props: { elements, label: 'Scene 48', selected: 'act_1', onselect } })
    const list = screen.getByRole('listbox', { name: 'Scene 48' })
    const act = screen.getByRole('option', { name: /Des is watching/ })
    expect(act).toHaveAttribute('aria-selected', 'true')
    expect(act).toHaveAttribute('tabindex', '0')
    await fireEvent.keyDown(list, { key: 'ArrowDown' })
    expect(onselect).toHaveBeenLastCalledWith('chr_1')
    await fireEvent.keyDown(list, { key: 'ArrowUp' })
    expect(onselect).toHaveBeenLastCalledWith('slug_1')
    await fireEvent.keyDown(list, { key: 'End' })
    expect(onselect).toHaveBeenLastCalledWith('tr_1')
  })

  it('a click emits the element id', async () => {
    const onselect = vi.fn()
    render(ScreenplayText, { props: { elements, onselect } })
    await fireEvent.click(screen.getByRole('option', { name: 'Hello' }))
    expect(onselect).toHaveBeenCalledWith('dia_1')
  })

  it('copying the selected line puts its text, as written, on the clipboard', async () => {
    render(ScreenplayText, { props: { elements, selected: 'dia_1' } })
    const data = { value: '', setData(type, v) { if (type === 'text/plain') this.value = v } }
    const event = new Event('copy', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: data })
    screen.getByRole('listbox').dispatchEvent(event)
    expect(data.value).toBe('Hello')
  })

  it('an empty scene says so', () => {
    render(ScreenplayText, { props: { elements: [], empty: 'This scene has no text.' } })
    expect(screen.getByText('This scene has no text.')).toBeInTheDocument()
  })
})
