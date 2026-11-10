import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
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

// The Player's panes (operator, 2026-11-10: "Inspector on demand", "Timeline hides", "While a
// scene is selected", "In the transport row").
describe('the Player\'s panes', () => {
  const nav = () => screen.getByRole('navigation', { name: 'Scenes' })

  // operator, 2026-11-10: "instead of a collapsable sidebar-like ui in player, let's may it
  // togglable from the transport like we do with timeline.. we can use icons for these instead of
  // the chevron".
  const toggle = (name) => within(screen.getByRole('group', { name: 'Playback controls' })).getByRole('button', { name })

  // operator, 2026-11-10: "scenes should be clapper icon and moved to left end of the toolbar
  // where the view is toggled"; asked which toolbar: "Transport row, left end".
  it('toggles Scenes from the transport row, leaving no rail', async () => {
    const { container } = render(Player, { props: loaded })
    expect(toggle('Scenes')).toHaveAttribute('aria-pressed', 'true')
    expect(toggle('Scenes').querySelector('.ph-film-slate')).not.toBeNull()
    expect(within(screen.getByRole('group', { name: 'Playback controls' })).getAllByRole('button')[0]).toBe(toggle('Scenes'))
    await fireEvent.click(toggle('Scenes'))
    expect(screen.queryByRole('navigation', { name: 'Scenes' })).toBeNull()
    expect(container.querySelector('.ui-player__panes--no-scenes')).not.toBeNull()
    expect(toggle('Scenes')).toHaveAttribute('aria-pressed', 'false')
    await fireEvent.click(toggle('Scenes'))
    expect(screen.getByRole('navigation', { name: 'Scenes' })).toBeTruthy()
  })

  it('draws no inspector while no scene is selected, and the stage takes the width', () => {
    const { container } = render(Player, { props: { ...loaded, inspected: null, selectedSceneIndex: -1 } })
    expect(screen.queryByRole('complementary', { name: 'Scene inspector' })).toBeNull()
    expect(container.querySelector('.ui-player__panes--inspector')).toBeNull()
  })

  it('closes the inspector by clearing the selection, from Close or Esc', async () => {
    const onSelectScene = vi.fn()
    const { container } = render(Player, { props: { ...loaded, onSelectScene } })
    expect(container.querySelector('.ui-player__panes--inspector')).not.toBeNull()
    await fireEvent.click(within(screen.getByRole('complementary', { name: 'Scene inspector' })).getByRole('button', { name: 'Close' }))
    expect(onSelectScene).toHaveBeenLastCalledWith(-1)
    onSelectScene.mockClear()
    await fireEvent.keyDown(within(nav()).getAllByRole('button')[0], { key: 'Escape' })
    expect(onSelectScene).toHaveBeenCalledWith(-1)
  })

  // operator, 2026-11-10: "inspector opens on even selection in timeline".
  it('opens the inspector on a beat chosen on the timeline, with that beat\'s scene', async () => {
    const onSelectScene = vi.fn(), onSelect = vi.fn()
    render(Player, { props: { ...loaded, inspected: null, selectedSceneIndex: -1, selectedElementId: 'e3', onSelectScene, onSelect } })
    const inspector = screen.getByRole('complementary', { name: 'Scene inspector' })
    expect(within(inspector).getByText('EXT. STREET - NIGHT')).toBeTruthy()
    await fireEvent.click(within(inspector).getByRole('button', { name: 'Close' }))
    expect(onSelect).toHaveBeenCalledWith('')
    expect(onSelectScene).toHaveBeenCalledWith(-1)
  })

  it('ignores Esc from outside the player', async () => {
    const onSelectScene = vi.fn()
    render(Player, { props: { ...loaded, onSelectScene } })
    await fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onSelectScene).not.toHaveBeenCalled()
  })

  it('toggles the timeline from the transport row, keeping the transport', async () => {
    const { container } = render(Player, { props: { ...loaded, total: 6 } })
    expect(container.querySelector('.player__stage')).not.toBeNull()
    expect(toggle('Timeline').querySelector('.ph-film-strip')).not.toBeNull()
    await fireEvent.click(toggle('Timeline'))
    expect(container.querySelector('.player__stage')).toBeNull()
    expect(toggle('Timeline')).toHaveAttribute('aria-pressed', 'false')
    await fireEvent.click(toggle('Timeline'))
    expect(container.querySelector('.player__stage')).not.toBeNull()
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

// The rails stack by the player's own width, not the window's (operator, 2026-11-10: "Fix the
// rule first"). A window media query stacked them in a 1280 catalog frame inside a 685px browser,
// and would in any host pane narrower than its window. Read as source: jsdom lays nothing out.
describe('the narrow layout', () => {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, '../../../../components/svelte/Player.svelte'), 'utf8')
  it('stacks the rails by the player\'s own width', () => {
    expect(source.match(/\.ui-player\s*\{([^}]*)\}/)?.[1]).toMatch(/container:\s*ui-player\s*\/\s*inline-size/)
    expect(source).toMatch(/@container ui-player \(max-width: 900px\)/)
  })
  it('reads no window width', () => {
    expect(source).not.toMatch(/@media \(max-width/)
    expect(source).not.toMatch(/@container viewport/)
  })
})
