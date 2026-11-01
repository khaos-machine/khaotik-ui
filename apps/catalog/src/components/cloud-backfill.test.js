import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Avatar, { initials } from '@khaos-machine/khaotik-ui/components/svelte/Avatar.svelte'
import AccountMenu from '@khaos-machine/khaotik-ui/components/svelte/AccountMenu.svelte'
import Drawer from '@khaos-machine/khaotik-ui/components/svelte/Drawer.svelte'
import FilePicker from '@khaos-machine/khaotik-ui/components/svelte/FilePicker.svelte'
import FormSheet from '@khaos-machine/khaotik-ui/components/svelte/FormSheet.svelte'

// The pieces Khaos Cloud built for itself and handed back to the kit.

describe('Avatar', () => {
  it('takes initials from the name, then the email', () => {
    expect(initials('Ada Lovelace', 'ada@example.com')).toBe(initials('Ada Lovelace', ''))
    expect(initials('', 'writer@example.com')).not.toBe('')
  })

  it('is decoration: hidden from assistive tech', () => {
    const { container } = render(Avatar, { props: { name: 'Ada Lovelace' } })
    expect(container.querySelector('.ui-avatar').getAttribute('aria-hidden')).toBe('true')
  })
})

describe('FilePicker', () => {
  it('hands back the file chosen, and clears the input so the same file fires again', async () => {
    const onfile = vi.fn()
    render(FilePicker, { props: { label: 'Upload a screenplay', onfile } })
    const input = screen.getByLabelText('Upload a screenplay')
    const file = new File(['INT. ROOM - DAY'], 'draft.fountain')
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    await fireEvent.change(input)
    expect(onfile).toHaveBeenCalledExactlyOnceWith(file)
    expect(input.value).toBe('')
  })
})

describe('FilePicker quiet', () => {
  it('is still a bordered button, only without the upload icon', () => {
    render(FilePicker, { props: { label: 'Change', quiet: true } })
    const button = screen.getByRole('button', { name: 'Change' })
    expect(button).toHaveAttribute('data-variant', 'secondary')
    expect(button.querySelector('.ph')).toBeNull()
  })
})

describe('Drawer', () => {
  it('is a region named by its title, closed by its close button', async () => {
    const onclose = vi.fn()
    render(Drawer, { props: { title: 'Activity', onclose } })
    expect(screen.getByRole('region', { name: 'Activity' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onclose).toHaveBeenCalledOnce()
  })
})

describe('FormSheet', () => {
  it('opens in place when not modal, named by its title', () => {
    render(FormSheet, { props: { title: 'Rename project', modal: false } })
    const sheet = screen.getByRole('dialog', { name: 'Rename project' })
    expect(sheet.open).toBe(true)
  })
})

describe('AccountMenu', () => {
  const places = [{ label: 'Settings', href: '#settings' }, { label: 'Account', href: '#account' }]

  it('lists who is signed in, the host places in order, then Sign out', async () => {
    // jsdom has no Popover API; Sign out closes the panel first.
    HTMLElement.prototype.hidePopover ??= () => {}
    const onsignout = vi.fn()
    render(AccountMenu, { props: { name: 'Ada Lovelace', email: 'ada@example.com', places, onsignout } })
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { hidden: true }).map((a) => a.textContent)).toEqual(['Settings', 'Account'])
    await fireEvent.click(screen.getByRole('button', { name: 'Sign out', hidden: true }))
    expect(onsignout).toHaveBeenCalledOnce()
  })

  it('shows the email alone when there is no name', () => {
    render(AccountMenu, { props: { name: '', email: 'writer@example.com', places } })
    expect(screen.getByText('writer@example.com').tagName).toBe('STRONG')
  })
})
