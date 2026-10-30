import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import StoryAtlas from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlas.svelte'
import atlas from '../data/story-atlas.json'

// The Story Atlas (catalog app-coverage plan, T7). jsdom has no WebGL, so the canvas reports that
// Pixi could not start; what is pinned here is everything around it.
const character = atlas.lenses.all.nodes.find((n) => n.kind === 'character')

describe('the Story Atlas', () => {
  it('inspects the record the host selected, and reports opening it', async () => {
    const onReveal = vi.fn()
    render(StoryAtlas, { props: { atlas, selectedRecordId: character.id, onReveal } })
    expect(screen.getByRole('complementary', { name: 'Atlas selection' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Open character' }))
    expect(onReveal).toHaveBeenCalledWith({ destination: 'characters', select: character.id })
  })

  it('reports a lens by its key and closes the activity on Escape', async () => {
    const onLensChange = vi.fn(), onActivityChange = vi.fn()
    render(StoryAtlas, { props: { atlas, onLensChange, onActivityChange, activityOpen: true } })
    await fireEvent.keyDown(window, { key: '2' })
    expect(onLensChange).toHaveBeenCalledWith('character')
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(onActivityChange).toHaveBeenCalledWith(false)
  })

  it('ignores the keyboard while hidden', async () => {
    const onLensChange = vi.fn()
    render(StoryAtlas, { props: { atlas, active: false, onLensChange } })
    await fireEvent.keyDown(window, { key: '3' })
    expect(onLensChange).not.toHaveBeenCalled()
  })

  it('says why there is no graph, and offers Try again on a failed read', async () => {
    const onRetry = vi.fn()
    const { unmount } = render(StoryAtlas, { props: { atlas: null } })
    expect(screen.getByText('Your story has no Atlas nodes yet')).toBeInTheDocument()
    unmount()
    render(StoryAtlas, { props: { atlas: null, error: 'khaosd is not running.', onRetry } })
    await fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
