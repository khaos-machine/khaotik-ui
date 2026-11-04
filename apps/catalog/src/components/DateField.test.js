import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import DateField from '@khaos-machine/khaotik-ui/components/svelte/DateField.svelte'

// K1 for Khaos Cloud's admin usage range (khaos-cloud docs/plans/admin-stats.md,
// "Kit dependency (K1-K3)"). A calendar day with no time zone: what the day
// means is the host's. What the field must get right is the wiring — the label
// names the input, every change reports `YYYY-MM-DD` or `''`, a day outside the
// bounds is refused, and an error is read out and marks the input invalid.

const describedBy = (input) =>
  (input.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent?.trim())

describe('DateField', () => {
  it('names a date input with its label', () => {
    render(DateField, { props: { label: 'From', value: '' } })
    const input = screen.getByLabelText('From')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('reports a typed day as YYYY-MM-DD', async () => {
    const user = userEvent.setup()
    const oninput = vi.fn()
    render(DateField, { props: { label: 'From', value: '', oninput } })
    await user.type(screen.getByLabelText('From'), '2026-11-04')
    expect(oninput).toHaveBeenLastCalledWith('2026-11-04')
  })

  it('reports a picked day as YYYY-MM-DD', async () => {
    const oninput = vi.fn()
    render(DateField, { props: { label: 'From', value: '', oninput } })
    // The native picker commits its day as one input event.
    await fireEvent.input(screen.getByLabelText('From'), { target: { value: '2026-10-01' } })
    expect(oninput).toHaveBeenCalledWith('2026-10-01')
  })

  it('reports a cleared field as an empty string', async () => {
    const user = userEvent.setup()
    const oninput = vi.fn()
    render(DateField, { props: { label: 'From', value: '2026-11-04', oninput } })
    await user.clear(screen.getByLabelText('From'))
    expect(oninput).toHaveBeenLastCalledWith('')
  })

  it('lets a day inside the bounds be typed digit by digit', async () => {
    // Chromium fires input after every year digit, so typing 10152026 into a
    // bounded field reports 0002-10-15, 0020-10-15, 0202-10-15, then
    // 2026-10-15. jsdom does not produce that sequence, so it is replayed here.
    // Each partial year is below `min`; refusing it by resetting the box threw
    // the keystrokes away and the day could never be typed.
    const oninput = vi.fn()
    render(DateField, { props: { label: 'From', value: '', min: '2026-10-01', max: '2026-11-04', oninput } })
    const input = screen.getByLabelText('From')
    for (const partial of ['0002-10-15', '0020-10-15', '0202-10-15']) {
      await fireEvent.input(input, { target: { value: partial } })
      expect(input).toHaveValue(partial)
    }
    await fireEvent.input(input, { target: { value: '2026-10-15' } })
    expect(oninput.mock.calls).toEqual([['2026-10-15']])
  })

  it('carries min and max, and never reports a finished day past max', async () => {
    const oninput = vi.fn()
    render(DateField, { props: { label: 'To', value: '2026-11-01', min: '2026-10-01', max: '2026-11-04', oninput } })
    const input = screen.getByLabelText('To')
    expect(input).toHaveAttribute('min', '2026-10-01')
    expect(input).toHaveAttribute('max', '2026-11-04')
    await fireEvent.input(input, { target: { value: '2026-11-05' } })
    expect(oninput).not.toHaveBeenCalled()
    // Controlled: leaving the field puts the refused day back to `value`.
    await fireEvent.blur(input)
    expect(input).toHaveValue('2026-11-01')
    expect(oninput).not.toHaveBeenCalled()
  })

  it('refuses a day before min', async () => {
    const oninput = vi.fn()
    render(DateField, { props: { label: 'From', value: '', min: '2026-10-01', oninput } })
    await fireEvent.input(screen.getByLabelText('From'), { target: { value: '2026-09-30' } })
    expect(oninput).not.toHaveBeenCalled()
  })

  it('marks the input invalid and makes the error its description', () => {
    render(DateField, { props: { label: 'To', value: '2026-10-01', error: 'Pick a day after From.' } })
    const input = screen.getByLabelText('To')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(describedBy(input)).toEqual(['Pick a day after From.'])
  })

  it('is valid, with no description, when the error is empty', () => {
    render(DateField, { props: { label: 'To', value: '', error: '' } })
    const input = screen.getByLabelText('To')
    expect(input).not.toHaveAttribute('aria-invalid', 'true')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('sets data-ui-id from uiId', () => {
    const { container } = render(DateField, { props: { label: 'From', value: '', uiId: 'stats-from' } })
    expect(container.querySelector('[data-ui-id="stats-from"]')).not.toBeNull()
  })
})
