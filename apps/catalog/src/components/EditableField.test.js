import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import EditableField from '@khaos-machine/khaotik-ui/components/svelte/EditableField.svelte'

// EditableField is read-only prose with an explicit edit mode, not a bare form
// input. These lock the mode transitions down: the component used to keep the
// staged buffer in sync with the prop through a `$effect` alongside a
// `$state(value)` initialiser — two mechanisms owning one value, and the
// initialiser raised `state_referenced_locally`. The buffer is seeded in one
// place, now on the machine's edit-enter rather than in a hand-written
// startEdit(). Behaviour must be identical, which is what these assert.
//
// The component was rebuilt on Ark UI's Editable (it had been hand-rolled
// against a primitive the kit already depended on). Every case above the
// divider passed before and after the rewrite, unchanged — that was the point
// of them. The cases below the divider are what the primitive added.

describe('EditableField', () => {
  it('renders the value read-only with the edit affordance', () => {
    render(EditableField, { props: { label: 'Summary', value: 'A first draft.' } })

    expect(screen.getByText('A first draft.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Edit/ })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('renders an em dash when there is no value', () => {
    render(EditableField, { props: { label: 'Summary', value: '' } })

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('seeds the textarea from the current value and saves the edit', async () => {
    const onsave = vi.fn()
    render(EditableField, { props: { label: 'Summary', value: 'A first draft.', onsave } })

    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('A first draft.')

    await fireEvent.input(textarea, { target: { value: 'A second draft.' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onsave).toHaveBeenCalledWith('A second draft.')
    // back to read-only
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('discards the staged text on cancel', async () => {
    const onsave = vi.fn()
    const oncancel = vi.fn()
    render(EditableField, { props: { label: 'Summary', value: 'A first draft.', onsave, oncancel } })

    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'Discard me.' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(oncancel).toHaveBeenCalledOnce()
    expect(onsave).not.toHaveBeenCalled()
    expect(screen.getByText('A first draft.')).toBeInTheDocument()

    // re-entering edit shows the prop again, not the discarded text
    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    expect(screen.getByRole('textbox')).toHaveValue('A first draft.')
  })

  // The regression guard for the refactor: the removed $effect was what kept the
  // buffer current when the prop changed after mount. startEdit() must do that
  // job now, or a stale value would reappear in the textarea.
  it('seeds from the latest value when the prop changes after mount', async () => {
    const { rerender } = render(EditableField, {
      props: { label: 'Summary', value: 'A first draft.' },
    })

    await rerender({ label: 'Summary', value: 'Replaced upstream.' })
    expect(screen.getByText('Replaced upstream.')).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    expect(screen.getByRole('textbox')).toHaveValue('Replaced upstream.')
  })

  // ── what adopting the primitive added ────────────────────────────────────

  // The hand-rolled version had no key handling at all, so the only way out of
  // edit mode was to hit Cancel with a pointer. Escape is the convention for
  // abandoning an editor and it now comes from the machine.
  it('cancels on Escape, which the hand-rolled version could not do', async () => {
    const onsave = vi.fn()
    const oncancel = vi.fn()
    render(EditableField, { props: { label: 'Summary', value: 'A first draft.', onsave, oncancel } })

    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'Abandon me.' } })
    await fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' })

    expect(oncancel).toHaveBeenCalledOnce()
    expect(onsave).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('A first draft.')).toBeInTheDocument()
  })

  // The field is a textarea, so Enter must open a new line rather than commit.
  // This is why the root sets submitMode="none": Ark's default is "both", which
  // would submit the note the moment someone started a second paragraph.
  it('does not submit on Enter, because the field is multi-line', async () => {
    const onsave = vi.fn()
    render(EditableField, { props: { label: 'Summary', value: 'A first draft.', onsave } })

    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    await fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })

    expect(onsave).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  // Save and Cancel read one thing and used to announce another: Ark's default
  // translations put aria-label="submit"/"cancel" on them, and an aria-label
  // beats the visible text. WCAG 2.5.3 (Label in Name).
  it('announces Save and Cancel by their visible text', async () => {
    render(EditableField, { props: { label: 'Summary', value: 'A first draft.' } })

    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    expect(screen.getByRole('button', { name: 'Save' })).toHaveTextContent('Save')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveTextContent('Cancel')
  })

  // The machine hides its own triggers while editing; Copy is ours, so removing
  // it is ours too. Asserted as absent from the DOM rather than as invisible —
  // a CSS-hidden button is still tabbable, and the first attempt at this keyed
  // off `data-focus` on the root, where that attribute is not set. It is on the
  // area.
  it('takes the Copy button out of the editor entirely', async () => {
    render(EditableField, { props: { label: 'Summary', value: 'A first draft.' } })

    expect(screen.getByRole('button', { name: 'Copy Summary' })).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    expect(screen.queryByRole('button', { name: 'Copy Summary', hidden: true }))
      .not.toBeInTheDocument()
  })
})

// The gap that let `submitMode="none"` ship: nine tests covered the mode
// transitions and none covered leaving the field. That is the one path where
// the rebuild changed behaviour, and it changed it destructively — with
// submitOnBlur false, Ark's trackInteractOutside sends CANCEL, so the machine
// reverted the value and the user's draft was gone with no confirmation.
//
// The hand-rolled version this replaced had NO blur handling at all: the editor
// stayed open with the text intact. So the regression was invisible precisely
// because the old behaviour was "nothing happens", which no test thinks to
// assert.
describe('leaving the field mid-edit', () => {
  const openEditor = async (props) => {
    render(EditableField, { props })
    await fireEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    return screen.getByRole('textbox')
  }

  // Ark tracks interaction OUTSIDE via document-level pointer/focus listeners,
  // so a synthetic blur on the textarea never reaches it. This is what a click
  // into the next field actually looks like to the machine.
  const interactOutside = async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    await fireEvent.pointerDown(outside)
    await fireEvent.mouseDown(outside)
    await fireEvent.focusIn(outside)
    await tick()
  }

  it('commits the draft rather than destroying it', async () => {
    const onsave = vi.fn()
    const oncancel = vi.fn()
    const input = await openEditor({ value: 'Original', label: 'Summary', onsave, oncancel })

    await fireEvent.input(input, { target: { value: 'Half-written thought' } })
    await interactOutside()

    // The whole point: a click into the next field is not an instruction to
    // discard what was typed.
    expect(onsave).toHaveBeenCalledWith('Half-written thought')
    expect(oncancel).not.toHaveBeenCalled()
  })

  it('still discards on an explicit cancel', async () => {
    const onsave = vi.fn()
    const oncancel = vi.fn()
    const input = await openEditor({ value: 'Original', label: 'Summary', onsave, oncancel })

    await fireEvent.input(input, { target: { value: 'Half-written thought' } })
    await fireEvent.click(screen.getByRole('button', { name: /Cancel/ }))

    // Discarding stays available — it just has to be asked for.
    expect(oncancel).toHaveBeenCalled()
    expect(onsave).not.toHaveBeenCalled()
  })
})
