import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import SelectableRow from '@khaos-machine/khaotik-ui/components/svelte/SelectableRow.svelte'

// #193, reported by khaos-app. `SelectableRow` was unconditionally a
// `<button>`, so a read-only list of N rows announced N controls that did
// nothing and made a keyboard user tab through every one.
//
// WHAT MAKES IT A DEFECT RATHER THAN A PREFERENCE: the kit already takes the
// opposite position one component away. `MeasureTable`'s `onSelect` doc reads
// "Omit it and rows are not interactive, so a read-only table announces no
// controls it does not have." Same principle, opposite implementation — the
// same self-contradiction as #171, where the lists declared a selection
// contract the compositions built out of them did not.
//
// khaos-app rendered co-appearance ties as plain spans in their own shell
// rather than ship the phantom controls, which is why this arrived as a report.

describe('a row is a control only when it can act', () => {
  it('is a button when it has a handler', () => {
    const onclick = vi.fn()
    render(SelectableRow, { props: { title: 'Desmond', onclick } })
    expect(screen.getByRole('button', { name: 'Desmond' })).toBeInTheDocument()
  })

  it('announces no control at all without one', () => {
    render(SelectableRow, { props: { title: 'Desmond' } })
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('keeps the title readable once no button names the row', () => {
    // The row was named by `aria-label` on the button, which let the visible
    // title be `aria-hidden` (D52). With no button there is no such name — so
    // leaving the title hidden would make the row announce NOTHING, which is
    // worse than the phantom control it replaced.
    const { container } = render(SelectableRow, { props: { title: 'Desmond' } })
    const title = container.querySelector('.selectable__title')
    expect(title.getAttribute('aria-hidden')).toBeNull()
    expect(screen.getByText('Desmond')).toBeInTheDocument()
  })

  it('sets no aria-label on the non-button', () => {
    // `aria-label` is specified as ignored on a generic element. Writing one
    // would be a name that may never be announced — the trap #156 cost us.
    const { container } = render(SelectableRow, { props: { title: 'Desmond' } })
    expect(container.querySelector('.selectable').getAttribute('aria-label')).toBeNull()
  })

  it('still reports the current row when selection lives elsewhere', () => {
    // A read-only list can legitimately reflect a selection made by something
    // else, so `aria-current` survives the loss of the button.
    const { container } = render(SelectableRow, { props: { title: 'Desmond', selected: true } })
    expect(container.querySelector('.selectable').getAttribute('aria-current')).toBe('true')
  })

  it('offers no pointer affordance when it cannot be activated', () => {
    const { container } = render(SelectableRow, { props: { title: 'Desmond' } })
    expect(container.querySelector('.selectable').classList.contains('selectable--static')).toBe(true)
  })
})
