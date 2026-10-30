import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ScrubNumber from '@khaos-machine/khaotik-ui/components/svelte/ScrubNumber.svelte'
import { clampStep } from '@khaos-machine/khaotik-ui/components/svelte/lib/scrub.js'

// ScrubNumber (data-layer plan K10; audit §3.12, §3.15, §3.16). A number you drag to
// scrub or click to type, with ⇧ coarse and ⌥ fine, as a `spinbutton`. Dragging is never
// the only way to change it. SpeechControls' temperature (0 to 2, step 0.05) is the
// first consumer (A8).

const temperature = { label: 'Temperature', value: 0.9, min: 0, max: 2, step: 0.05 }

describe('the value', () => {
  it('a value outside min and max is never emitted', async () => {
    const onchange = vi.fn()
    render(ScrubNumber, { props: { ...temperature, value: 1.98, onchange } })
    const spin = screen.getByRole('spinbutton', { name: 'Temperature' })
    await fireEvent.keyDown(spin, { key: 'ArrowUp', shiftKey: true })
    expect(onchange).toHaveBeenLastCalledWith(2)
    onchange.mockClear()
    await fireEvent.keyDown(spin, { key: 'End' })
    for (const [v] of onchange.mock.calls) expect(v).toBeLessThanOrEqual(2)
  })

  it('typed text outside the range is clamped before it is emitted', async () => {
    const onchange = vi.fn()
    render(ScrubNumber, { props: { ...temperature, onchange } })
    await fireEvent.click(screen.getByRole('spinbutton'))
    const input = screen.getByRole('textbox', { name: 'Temperature' })
    await fireEvent.input(input, { target: { value: '7' } })
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(onchange).toHaveBeenCalledWith(2)
  })

  it('typed text that is not a number emits nothing', async () => {
    const onchange = vi.fn()
    render(ScrubNumber, { props: { ...temperature, onchange } })
    await fireEvent.click(screen.getByRole('spinbutton'))
    const input = screen.getByRole('textbox')
    await fireEvent.input(input, { target: { value: 'loud' } })
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(onchange).not.toHaveBeenCalled()
  })

  it('Esc reverts the typed text and emits nothing', async () => {
    const onchange = vi.fn()
    render(ScrubNumber, { props: { ...temperature, onchange } })
    await fireEvent.click(screen.getByRole('spinbutton'))
    const input = screen.getByRole('textbox')
    await fireEvent.input(input, { target: { value: '1.5' } })
    await fireEvent.keyDown(input, { key: 'Escape' })
    expect(onchange).not.toHaveBeenCalled()
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '0.9')
  })

  it('clampStep snaps to the step from min, inside the range', () => {
    expect(clampStep(0.93, 0, 2, 0.05)).toBe(0.95)
    expect(clampStep(-1, 0, 2, 0.05)).toBe(0)
    expect(clampStep(2.04, 0, 2, 0.05)).toBe(2)
    expect(clampStep(51, 1, 100, 1)).toBe(51)
  })
})

describe('the keyboard', () => {
  it('↑ steps, ⇧ is coarse and ⌥ is fine', async () => {
    const onchange = vi.fn()
    render(ScrubNumber, { props: { label: 'Top-K', value: 50, min: 1, max: 100, step: 1, onchange } })
    const spin = screen.getByRole('spinbutton')
    await fireEvent.keyDown(spin, { key: 'ArrowUp' })
    expect(onchange).toHaveBeenLastCalledWith(51)
    await fireEvent.keyDown(spin, { key: 'ArrowUp', shiftKey: true })
    expect(onchange).toHaveBeenLastCalledWith(60)
    await fireEvent.keyDown(spin, { key: 'ArrowDown' })
    expect(onchange).toHaveBeenLastCalledWith(49)
  })

  it('is a spinbutton with its bounds', () => {
    render(ScrubNumber, { props: temperature })
    const spin = screen.getByRole('spinbutton', { name: 'Temperature' })
    expect(spin).toHaveAttribute('aria-valuemin', '0')
    expect(spin).toHaveAttribute('aria-valuemax', '2')
    expect(spin).toHaveAttribute('aria-valuenow', '0.9')
    expect(spin).toHaveAttribute('tabindex', '0')
  })
})
