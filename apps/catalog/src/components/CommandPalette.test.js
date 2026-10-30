import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import CommandPalette from '@khaos-machine/khaotik-ui/components/svelte/CommandPalette.svelte'
import { matchCommands } from '@khaos-machine/khaotik-ui/components/svelte/lib/commands.js'

// CommandPalette (data-layer plan K11; audit §3.11, §3.16). ⌘K's palette. It takes the
// host's commands as props (the registry is the host's, khaos-app A-Q1), searches label
// and group, and lists a disabled command with its reason rather than hiding it.

const commands = [
  { id: 'character.cast', label: 'Cast voice', group: 'Character', shortcut: '⌘⏎' },
  { id: 'scene.read', label: 'Read scene', group: 'Scene', disabledReason: 'DESMOND has no voice' },
  { id: 'window.reset', label: 'Reset Workspace', group: 'Window' },
]

describe('matchCommands', () => {
  it('matches label and group, case-insensitively, and keeps disabled commands', () => {
    expect(matchCommands(commands, 'scene').map((c) => c.id)).toEqual(['scene.read'])
    expect(matchCommands(commands, 'WINDOW').map((c) => c.id)).toEqual(['window.reset'])
    expect(matchCommands(commands, '  ')).toHaveLength(3)
  })
})

describe('CommandPalette', () => {
  it('is a combobox that controls a listbox of every command', () => {
    render(CommandPalette, { props: { commands } })
    const input = screen.getByRole('combobox', { name: 'Run a command' })
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(input).toHaveFocus()
  })

  it('a disabled command is listed with its reason and does not run', async () => {
    const onrun = vi.fn()
    render(CommandPalette, { props: { commands, onrun } })
    const read = screen.getByRole('option', { name: /Read scene/ })
    expect(read).toHaveAttribute('aria-disabled', 'true')
    expect(read).toHaveAccessibleDescription('DESMOND has no voice')
    expect(read).toHaveTextContent('DESMOND has no voice')
    await fireEvent.click(read)
    expect(onrun).not.toHaveBeenCalled()
    const input = screen.getByRole('combobox')
    await fireEvent.input(input, { target: { value: 'read' } })
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(onrun).not.toHaveBeenCalled()
  })

  it('typing filters, ↓ moves the active option, and Return runs it', async () => {
    const onrun = vi.fn()
    render(CommandPalette, { props: { commands, onrun } })
    const input = screen.getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /Reset Workspace/ }).id)
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(onrun).toHaveBeenCalledWith('window.reset')
  })

  it('shows a command’s shortcut', () => {
    render(CommandPalette, { props: { commands } })
    expect(screen.getByRole('option', { name: /Cast voice/ })).toHaveTextContent('⌘⏎')
  })

  it('Esc asks to close', async () => {
    const onclose = vi.fn()
    render(CommandPalette, { props: { commands, onclose } })
    await fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(onclose).toHaveBeenCalled()
  })

  it('says when nothing matches', async () => {
    render(CommandPalette, { props: { commands } })
    await fireEvent.input(screen.getByRole('combobox'), { target: { value: 'zzz' } })
    expect(screen.getByText('No command matches “zzz”.')).toBeInTheDocument()
  })
})
