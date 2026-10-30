import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Popover from '@khaos-machine/khaotik-ui/components/svelte/Popover.svelte'
import { pickerOrder } from '@khaos-machine/khaotik-ui/components/svelte/lib/picker.js'

// Popover picker (data-layer plan K13; audit §3.1 principle 8, §3.7, §3.15, §4.1). The
// Voice pop-up: a trigger that opens an anchored, searchable list with a suggested item
// first. Esc closes it and the focus returns to the trigger. It floats: nothing in the
// document flow moves when it opens.

const voices = [
  { id: 'bella', label: 'Bella' },
  { id: 'desmond', label: 'Desmond', detail: 'Designed, locked' },
  { id: 'ryan', label: 'Ryan (Qwen3-TTS-1.7B)' },
]

const base = { label: 'Voice', value: 'Not cast', items: voices, suggested: 'desmond' }

describe('pickerOrder', () => {
  it('puts the suggested item first and filters by label', () => {
    expect(pickerOrder(voices, 'desmond', '').map((v) => v.id)).toEqual(['desmond', 'bella', 'ryan'])
    expect(pickerOrder(voices, 'desmond', 'ry').map((v) => v.id)).toEqual(['ryan'])
    expect(pickerOrder(voices, 'gone', '').map((v) => v.id)).toEqual(['bella', 'desmond', 'ryan'])
  })
})

describe('Popover', () => {
  it('opens a searchable list with the suggested item first, marked as suggested', async () => {
    render(Popover, { props: base })
    const trigger = screen.getByRole('button', { name: /Voice/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveTextContent('Desmond')
    expect(options[0]).toHaveTextContent('Suggested')
    expect(screen.getByRole('searchbox', { name: 'Search voice' })).toHaveFocus()
  })

  it('Esc closes it and the focus returns to the trigger', async () => {
    render(Popover, { props: base })
    const trigger = screen.getByRole('button', { name: /Voice/ })
    await fireEvent.click(trigger)
    await fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('floats: the panel is fixed-position, so nothing in the flow moves', async () => {
    render(Popover, { props: base })
    await fireEvent.click(screen.getByRole('button', { name: /Voice/ }))
    expect(screen.getByRole('dialog', { name: 'Voice' }).style.position).toBe('fixed')
  })

  it('Return picks the active item, asks the host, closes and returns focus', async () => {
    const onpick = vi.fn()
    render(Popover, { props: { ...base, onpick } })
    const trigger = screen.getByRole('button', { name: /Voice/ })
    await fireEvent.click(trigger)
    const search = screen.getByRole('searchbox')
    await fireEvent.keyDown(search, { key: 'ArrowDown' })
    await fireEvent.keyDown(search, { key: 'Enter' })
    expect(onpick).toHaveBeenCalledWith('bella')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('a click on an item picks it', async () => {
    const onpick = vi.fn()
    render(Popover, { props: { ...base, onpick } })
    await fireEvent.click(screen.getByRole('button', { name: /Voice/ }))
    await fireEvent.click(screen.getByRole('option', { name: /Ryan/ }))
    expect(onpick).toHaveBeenCalledWith('ryan')
  })
})

describe('fitting the window', () => {
  it('keeps the panel inside the window when its trigger sits at the right edge (inspector)', async () => {
    render(Popover, { props: base })
    const trigger = screen.getByRole('button', { name: /Voice/ })
    trigger.getBoundingClientRect = () => ({ left: 980, right: 1060, top: 100, bottom: 120, width: 80, height: 20, x: 980, y: 100, toJSON() {} })
    Object.defineProperty(window, 'innerWidth', { value: 1100, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    await fireEvent.click(trigger)
    const panel = screen.getByRole('dialog', { name: 'Voice' })
    const left = Number.parseFloat(panel.style.left)
    expect(left + 280).toBeLessThanOrEqual(1100 - 8)
    expect(Number.parseFloat(panel.style.maxHeight)).toBeLessThanOrEqual(800 - 124 - 8)
  })
})
