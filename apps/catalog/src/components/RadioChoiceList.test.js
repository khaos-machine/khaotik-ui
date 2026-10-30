import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import RadioChoiceList from '@khaos-machine/khaotik-ui/components/svelte/RadioChoiceList.svelte'

// RadioChoiceList (khaos-app design 2026-10-12, onboarding step 1): one choice among a few,
// each option a title and a caption the person is choosing between. Controlled: a click or
// an arrow key asks `onchange` for the new value and changes nothing itself.

const options = [
  { value: 'cloud', title: 'In the cloud', caption: 'Nothing to install. Quickest to start.' },
  { value: 'local', title: 'On this Mac', caption: 'Run models on your own computer.' },
  { value: 'hybrid', title: 'Both', caption: 'Use the cloud for some things and this Mac for others.' },
]

const settle = () => new Promise((r) => setTimeout(r, 0))

describe('RadioChoiceList', () => {
  it('is one radiogroup whose options carry their captions', async () => {
    const onchange = vi.fn()
    const view = render(RadioChoiceList, {
      props: { label: 'How do you want to run AI?', value: 'local', options, note: 'Suggested because Ollama is installed on this Mac.', onchange },
    })

    const group = screen.getByRole('radiogroup', { name: 'How do you want to run AI?' })
    expect(group).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    expect(screen.getByRole('radio', { name: 'On this Mac' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'In the cloud' })).not.toBeChecked()

    // Each caption is the option's description, and is not hidden from assistive tech
    // (SelectableRow's subtitle is; the captions here are what is being chosen between).
    for (const option of options) {
      const radio = screen.getByRole('radio', { name: option.title })
      expect(radio).toHaveAccessibleDescription(option.caption)
      const caption = screen.getByText(option.caption)
      expect(caption.closest('[aria-hidden="true"]')).toBeNull()
    }

    // Arrow keys move focus to the next option and ask for its value.
    const local = screen.getByRole('radio', { name: 'On this Mac' })
    local.focus()
    await fireEvent.keyDown(local, { key: 'ArrowDown' })
    expect(onchange).toHaveBeenLastCalledWith('hybrid')
    expect(screen.getByRole('radio', { name: 'Both' })).toHaveFocus()
    await view.rerender({ value: 'hybrid' })
    await fireEvent.keyDown(screen.getByRole('radio', { name: 'Both' }), { key: 'ArrowUp' })
    expect(onchange).toHaveBeenLastCalledWith('local')
    expect(local).toHaveFocus()

    // The note renders under the group when given.
    expect(screen.getByText('Suggested because Ollama is installed on this Mac.')).toBeInTheDocument()
  })

  it('wraps at the ends', async () => {
    const onchange = vi.fn()
    render(RadioChoiceList, { props: { label: 'Run', value: 'hybrid', options, onchange } })
    const both = screen.getByRole('radio', { name: 'Both' })
    both.focus()
    await fireEvent.keyDown(both, { key: 'ArrowDown' })
    expect(onchange).toHaveBeenLastCalledWith('cloud')
    expect(screen.getByRole('radio', { name: 'In the cloud' })).toHaveFocus()
  })

  it('changes nothing on a click until the host passes the new value', async () => {
    const onchange = vi.fn()
    const view = render(RadioChoiceList, { props: { label: 'Run', value: 'cloud', options, onchange } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Both' }))
    await settle()
    expect(onchange).toHaveBeenCalledWith('hybrid')
    expect(screen.getByRole('radio', { name: 'In the cloud' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Both' })).not.toBeChecked()

    await view.rerender({ value: 'hybrid' })
    await settle()
    expect(screen.getByRole('radio', { name: 'Both' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'In the cloud' })).not.toBeChecked()
  })

  it('renders no note when none is given, and asks nothing while disabled', async () => {
    const onchange = vi.fn()
    const { container } = render(RadioChoiceList, { props: { label: 'Run', value: 'cloud', options, disabled: true, onchange } })
    expect(container.querySelector('.radio-choice-list__note')).toBeNull()
    await fireEvent.click(screen.getByRole('radio', { name: 'Both' }))
    const cloud = screen.getByRole('radio', { name: 'In the cloud' })
    await fireEvent.keyDown(cloud, { key: 'ArrowDown' })
    expect(onchange).not.toHaveBeenCalled()
  })
})
