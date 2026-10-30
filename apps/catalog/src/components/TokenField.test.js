import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import TokenField from '@khaos-machine/khaotik-ui/components/svelte/TokenField.svelte'

// TokenField (data-layer plan K8; audit §1.5, §4.1). A character's aliases as tokens with
// an inline add. The engine is the source of truth: adding asks the host and renders
// nothing new until the host passes the token back (khaos-app AGENTS.md directive 4).

describe('adding', () => {
  it('emits the new token to the host and does not render it until the host passes it back', async () => {
    const onadd = vi.fn()
    const { rerender } = render(TokenField, { props: { tokens: ['Des'], label: 'Aliases', onadd } })
    const input = screen.getByRole('textbox', { name: 'Add to aliases' })
    await fireEvent.input(input, { target: { value: 'Desi' } })
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(onadd).toHaveBeenCalledWith('Desi')
    expect(screen.queryByRole('button', { name: /Desi,/ })).toBeNull()
    expect(input).toHaveValue('')
    await rerender({ tokens: ['Des', 'Desi'], label: 'Aliases', onadd })
    expect(screen.getByRole('button', { name: 'Desi, remove' })).toBeInTheDocument()
  })

  it('does not emit an empty or blank token, or one already present', async () => {
    const onadd = vi.fn()
    render(TokenField, { props: { tokens: ['Des'], label: 'Aliases', onadd } })
    const input = screen.getByRole('textbox')
    await fireEvent.keyDown(input, { key: 'Enter' })
    await fireEvent.input(input, { target: { value: '   ' } })
    await fireEvent.keyDown(input, { key: 'Enter' })
    await fireEvent.input(input, { target: { value: ' Des ' } })
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(onadd).not.toHaveBeenCalled()
  })
})

describe('the keyboard', () => {
  it('Backspace on an empty input focuses the last token', async () => {
    render(TokenField, { props: { tokens: ['Des', 'Desi'], label: 'Aliases' } })
    const input = screen.getByRole('textbox')
    input.focus()
    await fireEvent.keyDown(input, { key: 'Backspace' })
    expect(screen.getByRole('button', { name: 'Desi, remove' })).toHaveFocus()
  })

  it('Backspace with text in the input stays in the input', async () => {
    render(TokenField, { props: { tokens: ['Des'], label: 'Aliases' } })
    const input = screen.getByRole('textbox')
    input.focus()
    await fireEvent.input(input, { target: { value: 'D' } })
    await fireEvent.keyDown(input, { key: 'Backspace' })
    expect(input).toHaveFocus()
  })

  it('Backspace or a click on a token asks the host to remove it', async () => {
    const onremove = vi.fn()
    render(TokenField, { props: { tokens: ['Des', 'Desi'], label: 'Aliases', onremove } })
    await fireEvent.keyDown(screen.getByRole('button', { name: 'Des, remove' }), { key: 'Backspace' })
    expect(onremove).toHaveBeenLastCalledWith('Des')
    await fireEvent.click(screen.getByRole('button', { name: 'Desi, remove' }))
    expect(onremove).toHaveBeenLastCalledWith('Desi')
  })
})

describe('read-only', () => {
  it('renders the tokens with no add field and no remove', () => {
    render(TokenField, { props: { tokens: ['Des'], label: 'Aliases', readonly: true } })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Des')).toBeInTheDocument()
  })
})
