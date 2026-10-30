import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import Player from '@khaos-machine/khaotik-ui/components/svelte/Player.svelte'
import Composer from '@khaos-machine/khaotik-ui/components/svelte/Composer.svelte'
import { buildTimeline } from '@khaos-machine/khaotik-ui/components/svelte/lib/timeline.js'

// The player panes (catalog app-coverage plan, T7). Khaos App's model holds the playhead, the
// selection and the scene text; these pin what the panes draw from them and what they report.
const segments = [
  { kind: 'scene', sceneId: 's1', label: 'INT. KITCHEN - DAY', startMs: 0, durationMs: 4000, events: [
    { elementId: 'e1', elementType: 'action', text: 'She opens the door.', durationMs: 2000 },
    { elementId: 'e2', elementType: 'dialogue', characterName: 'MADISON', text: '(quietly) Hello?', durationMs: 2000 },
  ] },
  { kind: 'scene', sceneId: 's2', label: 'EXT. STREET - NIGHT', startMs: 4000, durationMs: 2000, events: [
    { elementId: 'e3', elementType: 'transition', text: 'cut to:', durationMs: 2000 },
  ] },
]
const timeline = buildTimeline(segments)
const [kitchen, street] = timeline.segments
const loaded = { state: { kind: 'loaded' }, segments, timeline, playingScene: kitchen, inspected: kitchen, currentSceneIndex: 0, selectedSceneIndex: 0 }

describe('the Player', () => {
  it('splits a line into its speaker, parenthetical and words', () => {
    render(Player, { props: { ...loaded, focus: kitchen.events[1] } })
    expect(screen.getByText('(quietly)')).toBeTruthy()
    expect(screen.getByText('“Hello?”')).toBeTruthy()
  })

  it('reports a scene chosen for the inspector, and a double-click as going there', async () => {
    const onSelectScene = vi.fn(), onGoToScene = vi.fn()
    render(Player, { props: { ...loaded, onSelectScene, onGoToScene } })
    const street = within(screen.getByRole('navigation', { name: 'Scenes' })).getByText('EXT. STREET - NIGHT').closest('button')
    await fireEvent.click(street)
    await fireEvent.dblClick(street)
    expect(onSelectScene).toHaveBeenCalledWith(1)
    expect(onGoToScene).toHaveBeenCalledWith(1)
  })

  it('inspects the selected scene, not the playing one', async () => {
    const onSelect = vi.fn()
    render(Player, { props: { ...loaded, inspected: street, selectedSceneIndex: 1, onSelect } })
    await fireEvent.click(within(screen.getByRole('complementary', { name: 'Scene inspector' })).getByRole('button', { name: /transition/ }))
    expect(onSelect).toHaveBeenCalledWith('e3')
  })

  it('moves by beat and scene from the keyboard, and not while hidden', async () => {
    const onNextBeat = vi.fn(), onPreviousScene = vi.fn()
    const { unmount } = render(Player, { props: { ...loaded, onNextBeat, onPreviousScene } })
    await fireEvent.keyDown(window, { key: 'ArrowRight' })
    await fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(onNextBeat).toHaveBeenCalledOnce()
    expect(onPreviousScene).toHaveBeenCalledOnce()
    unmount()
    const hidden = vi.fn()
    render(Player, { props: { ...loaded, active: false, onNextBeat: hidden } })
    await fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(hidden).not.toHaveBeenCalled()
  })

  it('says when nothing has composed the project', () => {
    render(Player, { props: { state: { kind: 'uncomposed' } } })
    expect(screen.getByText('No composition yet')).toBeTruthy()
  })
})

describe('the Composer', () => {
  it('reports the image filtering chosen, and shows progress, in tools', async () => {
    const onchange = vi.fn()
    render(Composer, { props: { part: 'tools', moderation: { value: 'auto', onchange }, phase: 'Generating frame 1 of 2…', inspector: { shot: null } } })
    await fireEvent.change(screen.getByRole('combobox', { name: 'OpenAI image filtering' }), { target: { value: 'low' } })
    expect(onchange).toHaveBeenCalledWith('low')
    expect(screen.getByRole('status').textContent).toBe('Generating frame 1 of 2…')
  })

  it('draws nothing on the stage without a shot under the playhead', () => {
    const { container } = render(Composer, { props: { part: 'stage', stage: null } })
    expect(container.textContent?.trim()).toBe('')
  })
})
