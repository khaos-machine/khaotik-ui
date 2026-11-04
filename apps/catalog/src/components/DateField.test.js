import { readFileSync } from 'node:fs'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import DateField from '@khaos-machine/khaotik-ui/components/svelte/DateField.svelte'

// K1 for Khaos Cloud's admin usage range (khaos-cloud docs/plans/admin-stats.md,
// "Kit dependency (K1-K3)"). A calendar day with no time zone: what the day
// means is the host's. What the field must get right is the wiring — the label
// names the input, every valid change reports `YYYY-MM-DD` or `''`, a refused
// day is told to the host when the entry is committed (blur or Enter) and never
// on a keystroke, and only the host's error is read out.

const describedBy = (input) =>
  (input.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent?.trim())

// Chromium fires input after every year digit, so typing 10152026 into a field
// reports 0002-10-15, 0020-10-15, 0202-10-15, then 2026-10-15. jsdom does not
// produce that sequence, so the tests replay it.
const typeYear = async (input, monthDay, year) => {
  for (const partial of ['0002', '0020', '0202', year]) {
    await fireEvent.input(input, { target: { value: `${partial}-${monthDay}` } })
  }
}

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

  it('never writes the box back when the host echoes what was just reported, so a transient empty keeps the edit', async () => {
    // Retyping 11/03/2026 over 2026-11-04: the moment the day segment is
    // emptied, Chromium reports '' while the box still holds the month and year
    // in its segments. The host echoes '' back as `value`. Writing '' into the
    // input then wipes those segments, and every later key lands in an empty
    // box. jsdom has no segments, so the guard is that the field writes the
    // input's value only for a host value it did not just report.
    const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
    const { rerender } = render(DateField, {
      props: { label: 'To', value: '2026-11-04', oninput: (v) => queueMicrotask(() => rerender({ value: v })) },
    })
    const input = screen.getByLabelText('To')
    let writes = 0
    Object.defineProperty(input, 'value', {
      configurable: true,
      get() { return native.get.call(this) },
      set(v) { writes++; native.set.call(this, v) },
    })
    for (const step of ['', '2026-11-03']) {
      native.set.call(input, step)
      writes = 0
      await fireEvent.input(input)
      await new Promise((r) => setTimeout(r))
      expect(writes, `the echo of '${step}' was written back into the box`).toBe(0)
      expect(input).toHaveValue(step)
    }
    // A value the host sets on its own is still shown.
    await rerender({ value: '2026-12-01' })
    expect(input).toHaveValue('2026-12-01')
  })

  it('types a year digit by digit with no invalid state and no oninvalid, then reports the day at once', async () => {
    const oninput = vi.fn()
    const oninvalid = vi.fn()
    render(DateField, { props: { label: 'From', value: '', min: '2026-10-01', max: '2026-11-04', oninput, oninvalid } })
    const input = screen.getByLabelText('From')
    for (const partial of ['0002-10-15', '0020-10-15', '0202-10-15']) {
      await fireEvent.input(input, { target: { value: partial } })
      expect(input).toHaveValue(partial)
      expect(input).not.toHaveAttribute('aria-invalid', 'true')
    }
    expect(oninvalid).not.toHaveBeenCalled()
    await fireEvent.input(input, { target: { value: '2026-10-15' } })
    // A valid complete day is reported as soon as it is typed, before any commit.
    expect(oninput.mock.calls).toEqual([['2026-10-15']])
    await fireEvent.blur(input)
    expect(oninvalid).not.toHaveBeenCalled()
  })

  it('tells the host of a day past max only on blur: after_max, aria-invalid, text kept, no text of its own', async () => {
    const oninput = vi.fn()
    const oninvalid = vi.fn()
    render(DateField, { props: { label: 'To', value: '2026-11-01', min: '2026-10-01', max: '2026-11-04', oninput, oninvalid } })
    const input = screen.getByLabelText('To')
    expect(input).toHaveAttribute('min', '2026-10-01')
    expect(input).toHaveAttribute('max', '2026-11-04')
    await typeYear(input, '11-05', '2026')
    // Typed, not committed: nothing yet.
    expect(oninvalid).not.toHaveBeenCalled()
    expect(input).not.toHaveAttribute('aria-invalid', 'true')
    await fireEvent.blur(input)
    expect(oninvalid.mock.calls).toEqual([[{ typed: '2026-11-05', reason: 'after_max' }]])
    expect(input).toHaveAttribute('aria-invalid', 'true')
    // The wording is the host's: with no host error the field says nothing.
    expect(input).not.toHaveAttribute('aria-describedby')
    // No reset: the writer's day stays where they can see and fix it.
    expect(input).toHaveValue('2026-11-05')
    expect(oninput).not.toHaveBeenCalled()
  })

  it('treats Enter as a commit: before_min on a day before min', async () => {
    const oninput = vi.fn()
    const oninvalid = vi.fn()
    render(DateField, { props: { label: 'From', value: '', min: '2026-10-01', oninput, oninvalid } })
    const input = screen.getByLabelText('From')
    await fireEvent.input(input, { target: { value: '2026-09-30' } })
    expect(oninvalid).not.toHaveBeenCalled()
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(oninvalid.mock.calls).toEqual([[{ typed: '2026-09-30', reason: 'before_min' }]])
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveValue('2026-09-30')
    expect(oninput).not.toHaveBeenCalled()
  })

  it('ignores keys other than Enter as a commit', async () => {
    const oninvalid = vi.fn()
    render(DateField, { props: { label: 'From', value: '', min: '2026-10-01', oninvalid } })
    const input = screen.getByLabelText('From')
    await fireEvent.input(input, { target: { value: '2026-09-30' } })
    await fireEvent.keyDown(input, { key: 'ArrowLeft' })
    await fireEvent.keyDown(input, { key: 'Tab' })
    expect(oninvalid).not.toHaveBeenCalled()
  })

  it('commits a value that is not a real YYYY-MM-DD day as unreadable', async () => {
    // A browser that draws the date input as a text box (Safari before 14.1)
    // reports whatever was typed. jsdom sanitises a date input's value to '' or
    // a valid day, so the raw report is stubbed on the element here.
    const oninput = vi.fn()
    const oninvalid = vi.fn()
    render(DateField, { props: { label: 'From', value: '', min: '2026-10-01', oninput, oninvalid } })
    const input = screen.getByLabelText('From')
    for (const raw of ['15/10/2026', '2026-02-30', '2026-10']) {
      Object.defineProperty(input, 'value', { configurable: true, get: () => raw, set: () => {} })
      await fireEvent.input(input)
      await fireEvent.blur(input)
      expect(oninvalid).toHaveBeenLastCalledWith({ typed: raw, reason: 'unreadable' })
    }
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(oninput).not.toHaveBeenCalled()
  })

  it("shows only the host's error, and a valid day reports and clears the field's own invalid state", async () => {
    const oninput = vi.fn()
    const { rerender } = render(DateField, { props: { label: 'To', value: '', max: '2026-11-04', oninput } })
    const input = screen.getByLabelText('To')
    await fireEvent.input(input, { target: { value: '2026-11-05' } })
    await fireEvent.blur(input)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).not.toHaveAttribute('aria-describedby')
    // The host words it, from the reason it was sent.
    await rerender({ error: 'Pick a day on or before Nov 4.' })
    expect(describedBy(input)).toEqual(['Pick a day on or before Nov 4.'])
    // Back in range: reported through oninput at once, and the host clears its error.
    await fireEvent.input(input, { target: { value: '2026-11-03' } })
    expect(oninput.mock.calls).toEqual([['2026-11-03']])
    await rerender({ error: '' })
    expect(input).not.toHaveAttribute('aria-invalid', 'true')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it("clears the field's own invalid state when a valid day replaces a refused one, before the host acts", async () => {
    render(DateField, { props: { label: 'To', value: '', max: '2026-11-04' } })
    const input = screen.getByLabelText('To')
    await fireEvent.input(input, { target: { value: '2026-11-05' } })
    await fireEvent.blur(input)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    await fireEvent.input(input, { target: { value: '2026-11-03' } })
    expect(input).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('writes no text of its own: the source carries no message copy', () => {
    const source = readFileSync(`${import.meta.dirname}/../../../../components/svelte/DateField.svelte`, 'utf8')
    expect(source).not.toMatch(/Choose a day/)
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

  it("keeps the rule that holds TextField's density", () => {
    // jsdom lays nothing out, so the height itself cannot be measured here. In
    // Chromium the date input's fields wrapper carries 1px of padding above and
    // below, which made this box 35.5px against TextField's 33.5px; zeroing it
    // makes both 33.5px (measured in the catalog at 1440px). This reads the rule
    // from source, so deleting it reds; it does not prove the rendered height.
    const source = readFileSync(`${import.meta.dirname}/../../../../components/svelte/DateField.svelte`, 'utf8')
    expect(source).toMatch(/:global\(\.kfield__date::-webkit-datetime-edit-fields-wrapper\)\s*\{\s*padding:\s*0;\s*\}/)
    expect(source).toMatch(/class="kfield__text kfield__date"/)
  })

  it('sets data-ui-id from uiId', () => {
    const { container } = render(DateField, { props: { label: 'From', value: '', uiId: 'stats-from' } })
    expect(container.querySelector('[data-ui-id="stats-from"]')).not.toBeNull()
  })
})
