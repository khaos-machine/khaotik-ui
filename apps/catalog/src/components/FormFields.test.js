import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { createRawSnippet, tick } from 'svelte'
import TextField from '@khaos-machine/khaotik-ui/components/svelte/TextField.svelte'
import TextAreaField from '@khaos-machine/khaotik-ui/components/svelte/TextAreaField.svelte'
import PasswordField from '@khaos-machine/khaotik-ui/components/svelte/PasswordField.svelte'
import CodeField from '@khaos-machine/khaotik-ui/components/svelte/CodeField.svelte'
import FormStack from '@khaos-machine/khaotik-ui/components/svelte/FormStack.svelte'

// The sign-in fields Khaos Cloud asked for. What they must get right is the
// wiring a screen reader and a password manager depend on, so that is what
// these assert: the label names the input, the hint and the error are read out,
// an error sets aria-invalid, and the autocomplete tokens are the right ones.

const describedBy = (input) =>
  (input.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent?.trim())

describe('TextField', () => {
  it('names the input with its label and carries type, name and autocomplete', () => {
    render(TextField, { props: { label: 'Email', type: 'email', name: 'email', autocomplete: 'email', required: true } })
    const input = screen.getByLabelText(/Email/)
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toHaveAttribute('autocomplete', 'email')
    expect(input).toBeRequired()
  })

  it('reads the hint out through aria-describedby', () => {
    render(TextField, { props: { label: 'Display name', hint: 'Shown to collaborators.' } })
    expect(describedBy(screen.getByLabelText('Display name'))).toContain('Shown to collaborators.')
  })

  it('marks the input invalid and reads the error out', () => {
    render(TextField, { props: { label: 'Email', error: 'Enter a full email address.' } })
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(describedBy(input)).toContain('Enter a full email address.')
  })

  it('is valid, with no error text, when the error is empty', () => {
    render(TextField, { props: { label: 'Email', error: '' } })
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Enter a full email address.')).toBeNull()
  })

  it('reports every input', async () => {
    const oninput = vi.fn()
    render(TextField, { props: { label: 'Email', oninput } })
    await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'k@khaos' } })
    expect(oninput).toHaveBeenCalledWith('k@khaos')
  })
})

describe('TextAreaField', () => {
  it('is a labelled multiline input carrying name, rows and required', () => {
    render(TextAreaField, { props: { label: 'Notes', name: 'notes', rows: 4, required: true } })
    const area = screen.getByLabelText(/Notes/)
    expect(area.tagName).toBe('TEXTAREA')
    expect(area).toHaveAttribute('name', 'notes')
    expect(area).toHaveAttribute('rows', '4')
    expect(area).toBeRequired()
  })

  it('marks the textarea invalid and reads the hint and error out', () => {
    render(TextAreaField, { props: { label: 'Logline', hint: 'One or two sentences.', error: 'Add a logline.' } })
    const area = screen.getByLabelText('Logline')
    expect(area).toHaveAttribute('aria-invalid', 'true')
    expect(describedBy(area)).toEqual(['One or two sentences.', 'Add a logline.'])
  })

  it('reports every input, and Enter alone opens a line rather than submitting', async () => {
    const user = userEvent.setup()
    const oninput = vi.fn()
    const onsubmit = vi.fn()
    render(TextAreaField, { props: { label: 'Notes', oninput, onsubmit } })
    await user.type(screen.getByLabelText('Notes'), 'a{Enter}b')
    expect(oninput).toHaveBeenLastCalledWith('a\nb')
    expect(onsubmit).not.toHaveBeenCalled()
  })

  it('submits on Cmd+Enter and on Ctrl+Enter, but not with Alt held', async () => {
    const onsubmit = vi.fn()
    render(TextAreaField, { props: { label: 'Notes', value: 'draft', onsubmit } })
    const area = screen.getByLabelText('Notes')
    await fireEvent.keyDown(area, { key: 'Enter', metaKey: true })
    await fireEvent.keyDown(area, { key: 'Enter', ctrlKey: true })
    await fireEvent.keyDown(area, { key: 'Enter', ctrlKey: true, altKey: true })
    expect(onsubmit).toHaveBeenCalledTimes(2)
    expect(onsubmit).toHaveBeenCalledWith('draft')
  })
})

describe('PasswordField', () => {
  it('is a labelled password input with the autocomplete token it was given', () => {
    render(PasswordField, { props: { label: 'New password', autocomplete: 'new-password', name: 'password' } })
    const input = screen.getByLabelText(/New password/)
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('autocomplete', 'new-password')
    expect(input).toHaveAttribute('name', 'password')
  })

  it('defaults to current-password, for signing in', () => {
    render(PasswordField, { props: { label: 'Password' } })
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute('autocomplete', 'current-password')
  })

  // The toggle is a toggle button: one name, its state in aria-pressed.
  it('shows and hides the password from a pointer, once per press', async () => {
    render(PasswordField, { props: { label: 'Password' } })
    const input = screen.getByLabelText(/^Password/)
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).not.toHaveAttribute('aria-expanded')

    // a real click is pointerdown then a click with detail 1; only one toggles
    await fireEvent.pointerDown(toggle, { button: 0 })
    await fireEvent.click(toggle, { detail: 1 })
    expect(input).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(toggle).toHaveAccessibleName('Show password')
  })

  // zag leaves the trigger out of the tab order and deaf to keys, which fails
  // WCAG 2.1.1: a keyboard user could not reveal what they typed.
  it('is reached with Tab and toggled with Enter and Space', async () => {
    const user = userEvent.setup()
    render(PasswordField, { props: { label: 'Password' } })
    const input = screen.getByLabelText(/^Password/)
    const toggle = screen.getByRole('button', { name: 'Show password' })

    await user.click(input)
    await user.tab()
    expect(toggle).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(input).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.keyboard(' ')
    expect(input).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks the input invalid and reads the error out', () => {
    render(PasswordField, { props: { label: 'Password', error: 'Use at least 12 characters.' } })
    const input = screen.getByLabelText(/^Password/)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(describedBy(input)).toContain('Use at least 12 characters.')
  })

  it('reports every input', async () => {
    const oninput = vi.fn()
    render(PasswordField, { props: { label: 'Password', oninput } })
    await fireEvent.input(screen.getByLabelText(/^Password/), { target: { value: 'hunter2' } })
    expect(oninput).toHaveBeenCalledWith('hunter2')
  })
})

describe('CodeField', () => {
  const boxes = (container) => [...container.querySelectorAll('.kcode__digit')]

  it('draws one numeric one-time-code box per digit', () => {
    const { container } = render(CodeField, { props: { label: 'Confirmation code' } })
    const inputs = boxes(container)
    expect(inputs).toHaveLength(6)
    for (const input of inputs) {
      expect(input).toHaveAttribute('inputmode', 'numeric')
      expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    }
  })

  it('takes its length from the consumer', () => {
    const { container } = render(CodeField, { props: { label: 'Code', length: 4 } })
    expect(boxes(container)).toHaveLength(4)
  })

  it('shows the digits it is given', () => {
    const { container } = render(CodeField, { props: { label: 'Code', value: '418' } })
    expect(boxes(container).map((i) => i.value)).toEqual(['4', '1', '8', '', '', ''])
  })

  // The value is controlled: a paste reports the whole code through oninput,
  // and completion fires once the consumer passes that code back.
  it('takes a whole pasted code at once and reports it complete', async () => {
    const oninput = vi.fn()
    const oncomplete = vi.fn()
    const { container, rerender } = render(CodeField, { props: { label: 'Code', oninput, oncomplete } })
    const [first] = boxes(container)
    first.focus()
    await fireEvent.focus(first)
    await fireEvent.paste(first, { clipboardData: { getData: () => '418302' } })
    // zag applies a paste on the next animation frame
    await vi.waitFor(() => expect(oninput).toHaveBeenLastCalledWith('418302'))

    await rerender({ label: 'Code', oninput, oncomplete, value: '418302' })
    await tick()
    expect(boxes(container).map((i) => i.value)).toEqual(['4', '1', '8', '3', '0', '2'])
    expect(oncomplete).toHaveBeenCalledWith('418302')
  })

  it('reads the hint and the error out from every box', () => {
    const { container } = render(CodeField, { props: { label: 'Code', hint: 'Sent to your email.', error: 'That code has expired.' } })
    expect(describedBy(boxes(container)[0])).toEqual(['Sent to your email.', 'That code has expired.'])
  })

  it('marks the boxes invalid and shows the error', () => {
    const { container } = render(CodeField, { props: { label: 'Code', error: 'That code has expired.' } })
    expect(boxes(container)[0]).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('That code has expired.')).toBeInTheDocument()
  })
})

describe('FormStack', () => {
  const html = (markup) => createRawSnippet(() => ({ render: () => markup }))

  it('renders the message, the fields and the actions in that order', () => {
    const { container } = render(FormStack, {
      props: {
        label: 'Sign in',
        message: html('<p>Could not sign in</p>'),
        children: html('<input aria-label="Email" />'),
        actions: html('<button type="submit">Sign in</button>'),
      },
    })
    const form = screen.getByRole('form', { name: 'Sign in' })
    expect([...form.children].map((el) => el.className.split(' ')[0])).toEqual([
      'kform__message',
      'kform__fields',
      'kform__actions',
    ])
    expect(container.textContent).toContain('Could not sign in')
  })

  it('omits the message region when there is none', () => {
    const { container } = render(FormStack, { props: { children: html('<input aria-label="Email" />') } })
    expect(container.querySelector('.kform__message')).toBeNull()
  })

  it('calls onsubmit and does not let the browser navigate', async () => {
    const onsubmit = vi.fn()
    render(FormStack, {
      props: { label: 'Sign in', onsubmit, actions: html('<button type="submit">Sign in</button>') },
    })
    const form = screen.getByRole('form', { name: 'Sign in' })
    const event = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(event)
    expect(onsubmit).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })
})
