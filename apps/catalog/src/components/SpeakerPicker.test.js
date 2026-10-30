import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import SpeakerPicker from '@khaos-machine/khaotik-ui/components/svelte/SpeakerPicker.svelte'

// #264 — a host writing a choice (khaos-app casting a voice, setting the
// narrator) must be able to hold the picker for the length of the write without
// hiding it. Disabled follows the kit's Button: aria-disabled, never the native
// attribute, so the chips stay in the Tab order and the selection stays visible.

const speakers = [
  { id: 'aiden', name: 'Aiden' },
  { id: 'ava', name: 'Ava' },
  { id: 'liam', name: 'Liam' },
]

const SOURCE = readFileSync(join(process.cwd(), '../../components/svelte/SpeakerPicker.svelte'), 'utf8')

const chips = () => screen.getAllByRole('button')

describe('a disabled SpeakerPicker holds its choice (#264)', () => {
  it('marks every chip aria-disabled and keeps each focusable', () => {
    render(SpeakerPicker, { props: { speakers, selected: 'ava', disabled: true } })

    for (const chip of chips()) {
      expect(chip).toHaveAttribute('aria-disabled', 'true')
      expect(chip).not.toHaveAttribute('disabled')
    }
    const liam = screen.getByRole('button', { name: 'Liam' })
    liam.focus()
    expect(liam).toHaveFocus()
  })

  it('still shows the current selection', () => {
    render(SpeakerPicker, { props: { speakers, selected: 'ava', disabled: true } })
    expect(screen.getByRole('button', { name: 'Ava' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Liam' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not call onselect on click', async () => {
    const onselect = vi.fn()
    render(SpeakerPicker, { props: { speakers, selected: 'ava', disabled: true, onselect } })

    await fireEvent.click(screen.getByRole('button', { name: 'Liam' }))
    expect(onselect).not.toHaveBeenCalled()
  })

  it('does not call onselect on Enter or Space', async () => {
    // jsdom does not perform a button's keyboard activation; a browser delivers
    // both as a click, which is what this replays (as Button.test.js does).
    const onselect = vi.fn()
    render(SpeakerPicker, { props: { speakers, selected: 'ava', disabled: true, onselect } })
    const liam = screen.getByRole('button', { name: 'Liam' })
    liam.focus()

    await fireEvent.keyDown(liam, { key: 'Enter' })
    await fireEvent.click(liam, { detail: 0 })
    await fireEvent.keyUp(liam, { key: ' ' })
    await fireEvent.click(liam, { detail: 0 })

    expect(onselect).not.toHaveBeenCalled()
  })

  it('draws disabled chips in the disabled action tokens', () => {
    // jsdom resolves no stylesheets (RULES.md, "Testing and delivery", class 1).
    const at = SOURCE.indexOf(".ui-speaker-picker__chip[aria-disabled='true']")
    expect(at).toBeGreaterThan(-1)
    const body = SOURCE.slice(SOURCE.indexOf('{', at) + 1, SOURCE.indexOf('}', at))
    expect(body).toMatch(/color:\s*var\(--action-on-disabled\)/)
    expect(body).toMatch(/cursor:\s*default/)
  })
})

describe('a SpeakerPicker with a choice in flight (#264)', () => {
  it('marks the pending chip aria-busy and no other', () => {
    render(SpeakerPicker, { props: { speakers, selected: 'ava', pendingId: 'liam' } })

    expect(screen.getByRole('button', { name: 'Liam' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: 'Ava' })).not.toHaveAttribute('aria-busy')
    expect(screen.getByRole('button', { name: 'Aiden' })).not.toHaveAttribute('aria-busy')
  })

  it('draws a spinner on the pending chip, hidden from its name', () => {
    render(SpeakerPicker, { props: { speakers, selected: 'ava', pendingId: 'liam' } })

    const spinner = screen.getByRole('button', { name: 'Liam' }).querySelector('.ui-speaker-picker__spinner')
    expect(spinner).not.toBeNull()
    expect(spinner).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelectorAll('.ui-speaker-picker__spinner')).toHaveLength(1)
  })

  it('takes no second choice while one is in flight', async () => {
    const onselect = vi.fn()
    render(SpeakerPicker, { props: { speakers, selected: 'ava', pendingId: 'liam', onselect } })

    for (const chip of chips()) expect(chip).toHaveAttribute('aria-disabled', 'true')
    await fireEvent.click(screen.getByRole('button', { name: 'Aiden' }))
    expect(onselect).not.toHaveBeenCalled()
  })
})

describe('an enabled SpeakerPicker', () => {
  it('calls onselect with the chosen id', async () => {
    const onselect = vi.fn()
    render(SpeakerPicker, { props: { speakers, selected: 'ava', onselect } })

    await fireEvent.click(screen.getByRole('button', { name: 'Liam' }))
    expect(onselect).toHaveBeenCalledExactlyOnceWith('liam')
  })

  it('reports neither aria-disabled nor aria-busy', () => {
    render(SpeakerPicker, { props: { speakers, selected: 'ava' } })
    for (const chip of chips()) {
      expect(chip).not.toHaveAttribute('aria-disabled')
      expect(chip).not.toHaveAttribute('aria-busy')
    }
  })
})
