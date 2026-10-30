import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Checkbox from '@khaos-machine/khaotik-ui/components/svelte/Checkbox.svelte'

// Checkbox (data-layer A6): one include/exclude mark per row, for a Review group's
// occurrences. Controlled: a click asks for the new value and changes nothing itself.

describe('Checkbox', () => {
  it('is a checkbox named by its label, and asks for the other value on click', async () => {
    const onchange = vi.fn()
    render(Checkbox, { props: { label: 'Include line 12', checked: true, onchange } })
    const box = screen.getByRole('checkbox', { name: 'Include line 12' })
    expect(box).toBeChecked()
    await fireEvent.click(box)
    expect(onchange).toHaveBeenCalledWith(false)
  })

  it('shows the value its host gives it after a click', async () => {
    // A cancelled click on a checkbox is undone by the browser AFTER the click's handlers
    // run, so a host that accepts the new value during the click saw it drawn unticked.
    let checked = false
    const view = render(Checkbox, {
      props: {
        label: 'Allow the charge',
        checked,
        onchange: (next) => {
          checked = next
          void view.rerender({ checked })
        },
      },
    })
    const box = screen.getByRole('checkbox', { name: 'Allow the charge' })
    await fireEvent.click(box)
    await new Promise((r) => setTimeout(r, 0))
    expect(checked).toBe(true)
    expect(box).toBeChecked()
  })

  it('stays as it was when the host does not accept the new value', async () => {
    render(Checkbox, { props: { label: 'Locked', checked: false, onchange: () => {} } })
    const box = screen.getByRole('checkbox', { name: 'Locked' })
    await fireEvent.click(box)
    await new Promise((r) => setTimeout(r, 0))
    expect(box).not.toBeChecked()
  })

  it('keeps its accessible name when the label is hidden', () => {
    render(Checkbox, { props: { label: 'Include line 12', hideLabel: true } })
    expect(screen.getByRole('checkbox', { name: 'Include line 12' })).toBeInTheDocument()
    expect(screen.getByText('Include line 12')).toHaveClass('checkbox__label--hidden')
  })

  it('asks nothing while disabled', async () => {
    const onchange = vi.fn()
    render(Checkbox, { props: { label: 'Include', disabled: true, onchange } })
    await fireEvent.click(screen.getByRole('checkbox', { name: 'Include' }))
    expect(onchange).not.toHaveBeenCalled()
  })
})
