import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Sheet from '@khaos-machine/khaotik-ui/components/svelte/Sheet.svelte'

// Sheet (data-layer plan K14; audit §1.14, §3.15 "Confirmations", §4.1). A window-attached
// modal that names what it acts on (ADR-0007 rule 2), including a text-input sheet
// (khaotik-ui#46, the Clone repository URL). Focus is trapped inside while it is open and
// returned to where it was when it closes.

const del = { title: 'Delete Read 2?', target: "INT. DESMOND'S APARTMENT - NIGHT", message: 'Its joined audio is removed from the project.', confirmLabel: 'Delete', tone: 'danger' }

describe('Sheet', () => {
  it('names its target in its accessible name', () => {
    render(Sheet, { props: del })
    const sheet = screen.getByRole('alertdialog', { name: /Delete Read 2\?.*INT\. DESMOND'S APARTMENT - NIGHT/ })
    expect(sheet).toHaveAttribute('aria-modal', 'true')
    expect(sheet).toHaveAccessibleDescription('Its joined audio is removed from the project.')
  })

  it('takes focus, traps Tab inside, and returns the focus when it closes', async () => {
    const outside = document.createElement('button')
    outside.textContent = 'Delete Read 2'
    document.body.append(outside)
    outside.focus()
    const { unmount } = render(Sheet, { props: del })
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const confirm = screen.getByRole('button', { name: 'Delete' })
    expect(cancel).toHaveFocus()
    confirm.focus()
    await fireEvent.keyDown(confirm, { key: 'Tab' })
    expect(cancel).toHaveFocus()
    await fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true })
    expect(confirm).toHaveFocus()
    unmount()
    expect(outside).toHaveFocus()
    outside.remove()
  })

  it('Esc and Cancel ask to cancel; the confirm button asks to confirm', async () => {
    const oncancel = vi.fn()
    const onconfirm = vi.fn()
    render(Sheet, { props: { ...del, oncancel, onconfirm } })
    await fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(oncancel).toHaveBeenCalledTimes(2)
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onconfirm).toHaveBeenCalledWith('')
  })

  it('a text-input sheet focuses its field and confirms with the typed text, never empty', async () => {
    const onconfirm = vi.fn()
    render(Sheet, { props: { title: 'Clone a KSPD repository', target: 'into ~/khaos/projects', confirmLabel: 'Clone', input: { label: 'Repository URL', placeholder: 'git@github.com:…' }, onconfirm } })
    const field = screen.getByRole('textbox', { name: 'Repository URL' })
    expect(field).toHaveFocus()
    const clone = screen.getByRole('button', { name: 'Clone' })
    expect(clone).toBeDisabled()
    await fireEvent.input(field, { target: { value: 'git@github.com:khaos-studio/b4p.kspd.git' } })
    await fireEvent.keyDown(field, { key: 'Enter' })
    expect(onconfirm).toHaveBeenCalledWith('git@github.com:khaos-studio/b4p.kspd.git')
  })

  it('a second action sits beside confirm and answers on its own', async () => {
    const onconfirm = vi.fn()
    const oncancel = vi.fn()
    const onsecondary = vi.fn()
    render(Sheet, { props: { title: 'The scenes need analysing first.', message: '2 scenes changed.', confirmLabel: 'Resolve…', secondaryLabel: 'View stale scenes', onconfirm, oncancel, onsecondary } })
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.textContent)).toEqual(['Cancel', 'View stale scenes', 'Resolve…'])
    const [cancel, second, confirm] = buttons
    expect(cancel).toHaveFocus()
    await fireEvent.keyDown(cancel, { key: 'Tab' })
    expect(second).toHaveFocus()
    await fireEvent.keyDown(second, { key: 'Tab' })
    expect(confirm).toHaveFocus()
    await fireEvent.keyDown(confirm, { key: 'Tab' })
    expect(cancel).toHaveFocus()
    await fireEvent.click(second)
    expect(onsecondary).toHaveBeenCalledTimes(1)
    expect(onconfirm).not.toHaveBeenCalled()
    expect(oncancel).not.toHaveBeenCalled()
  })

  it('without a second action it renders only Cancel and confirm', () => {
    render(Sheet, { props: del })
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Cancel', 'Delete'])
  })
})
