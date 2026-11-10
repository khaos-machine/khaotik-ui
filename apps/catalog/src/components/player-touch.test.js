import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import fs from 'node:fs'
import path from 'node:path'
import Player from '@khaos-machine/khaotik-ui/components/svelte/Player.svelte'
import { buildTimeline } from '@khaos-machine/khaotik-ui/components/svelte/lib/timeline.js'

// The Player on a phone and a tablet (operator, 2026-11-10: "these mobile layouts are pretty
// useless.. stacking in a list makes no sense"). Phone: "Now Playing + sheets" — the stage fills
// the screen, the transport sits at the bottom, Scenes and the scene open as bottom sheets, and a
// scene tapped "Opens its detail". Tablet: "Two columns" — the stage and one side pane.
//
// The mode follows the panes' width (the player's content width), which jsdom does not lay out,
// so each test sets it.
const segments = [
  { kind: 'scene', sceneId: 's1', label: 'INT. KITCHEN - DAY', startMs: 0, durationMs: 4000, events: [
    { elementId: 'e1', elementType: 'action', text: 'She opens the door.', durationMs: 2000 },
    { elementId: 'e2', elementType: 'dialogue', characterName: 'MADISON', text: 'Hello?', durationMs: 2000 },
  ] },
  { kind: 'scene', sceneId: 's2', label: 'EXT. STREET - NIGHT', startMs: 4000, durationMs: 2000, events: [
    { elementId: 'e3', elementType: 'transition', text: 'cut to:', durationMs: 2000 },
  ] },
]
const timeline = buildTimeline(segments)
const [kitchen, street] = timeline.segments
const base = { state: { kind: 'loaded' }, segments, timeline, playingScene: kitchen, currentSceneIndex: 0, total: 6, inspected: null, selectedSceneIndex: -1 }

let width = 0
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.classList?.contains('ui-player__panes') ? width : 0 } })
})
afterEach(() => {
  delete HTMLElement.prototype.clientWidth
  width = 0
})
const at = (w, props = {}) => { width = w; return render(Player, { props: { ...base, ...props } }) }
const transport = () => screen.getByRole('group', { name: 'Playback controls' })
const toggle = (name) => within(transport()).getByRole('button', { name })

describe('the Player on a phone', () => {
  it('fills the screen with the stage: no scene list and no inspector until asked', () => {
    const { container } = at(390)
    expect(container.querySelector('.ui-player')).toHaveClass('ui-player--phone')
    expect(screen.getByRole('region', { name: 'Stage' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Scenes' })).toBeNull()
    expect(screen.queryByRole('complementary', { name: 'Scene inspector' })).toBeNull()
  })

  it('puts Scenes first and the scene last in the transport, with scene skips, and no timeline toggle', () => {
    at(390, { onPreviousScene: vi.fn(), onNextScene: vi.fn() })
    const buttons = within(transport()).getAllByRole('button')
    expect(buttons[0]).toHaveAccessibleName('Scenes')
    expect(buttons.at(-1)).toHaveAccessibleName('Scene')
    expect(toggle('Previous scene')).toBeTruthy()
    expect(toggle('Next scene')).toBeTruthy()
    expect(within(transport()).queryByRole('button', { name: 'Timeline' })).toBeNull()
  })

  it('opens Scenes as a sheet, and a scene tapped asks for its detail and closes it', async () => {
    const onSelectScene = vi.fn()
    at(390, { onSelectScene })
    await fireEvent.click(toggle('Scenes'))
    const sheet = screen.getByRole('dialog', { name: 'Scenes' })
    expect(toggle('Scenes')).toHaveAttribute('aria-pressed', 'true')
    await fireEvent.click(within(sheet).getByText('EXT. STREET - NIGHT').closest('button'))
    expect(onSelectScene).toHaveBeenCalledWith(1)
    expect(screen.queryByRole('dialog', { name: 'Scenes' })).toBeNull()
  })

  it('shows the selected scene as a sheet, and plays from it', async () => {
    const onGoToScene = vi.fn(), onSelectScene = vi.fn()
    at(390, { inspected: street, selectedSceneIndex: 1, onGoToScene, onSelectScene })
    const sheet = screen.getByRole('dialog', { name: 'Scene' })
    expect(within(sheet).getByText('EXT. STREET - NIGHT')).toBeTruthy()
    await fireEvent.click(within(sheet).getByRole('button', { name: 'Play from here' }))
    expect(onGoToScene).toHaveBeenCalledWith(1)
    expect(onSelectScene).toHaveBeenCalledWith(-1)
  })

  it('opens the playing scene from the transport', async () => {
    const onSelectScene = vi.fn()
    at(390, { onSelectScene })
    await fireEvent.click(toggle('Scene'))
    expect(onSelectScene).toHaveBeenCalledWith(0)
  })

  it('closes a sheet from its backdrop, from Esc, and by dragging its handle down', async () => {
    const { container } = at(390)
    await fireEvent.click(toggle('Scenes'))
    await fireEvent.click(container.querySelector('.ui-player__backdrop'))
    expect(screen.queryByRole('dialog', { name: 'Scenes' })).toBeNull()

    await fireEvent.click(toggle('Scenes'))
    await fireEvent.keyDown(screen.getByRole('dialog', { name: 'Scenes' }), { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Scenes' })).toBeNull()

    await fireEvent.click(toggle('Scenes'))
    const handle = container.querySelector('.ui-player__handle')
    await fireEvent.pointerDown(handle, { clientY: 0, pointerId: 1 })
    await fireEvent.pointerMove(handle, { clientY: 120, pointerId: 1 })
    await fireEvent.pointerUp(handle, { clientY: 120, pointerId: 1 })
    expect(screen.queryByRole('dialog', { name: 'Scenes' })).toBeNull()
  })

  it('leaves the stage and the transport inert while a sheet is open', async () => {
    const { container } = at(390)
    await fireEvent.click(toggle('Scenes'))
    expect(container.querySelector('.ui-player__pane--stage').inert).toBe(true)
    expect(container.querySelector('.ui-player__dock').inert).toBe(true)
  })

  // operator, 2026-11-10: asked whether the phone keeps 44px touch sizing, "Dense everywhere";
  // asked whether StoryPlayer's older 44px transport rules go too, "Yes, dense too".
  it('keeps desktop density: no 44px touch sizing on the phone', () => {
    for (const file of ['Player.svelte', 'StoryPlayer.svelte']) {
      const source = fs.readFileSync(path.resolve(import.meta.dirname, '../../../../components/svelte', file), 'utf8')
      expect(source).not.toMatch(/min-(width|height):\s*44px/)
    }
  })
})

describe('the Player on a tablet', () => {
  it('draws the stage and Scenes side by side while nothing is selected', () => {
    const { container } = at(768)
    expect(container.querySelector('.ui-player')).toHaveClass('ui-player--tablet')
    expect(screen.getByRole('navigation', { name: 'Scenes' })).toBeTruthy()
    expect(screen.queryByRole('complementary', { name: 'Scene inspector' })).toBeNull()
  })

  it('swaps Scenes for the inspector while a scene is selected, with Play from here', () => {
    at(768, { inspected: street, selectedSceneIndex: 1 })
    expect(screen.queryByRole('navigation', { name: 'Scenes' })).toBeNull()
    const inspector = screen.getByRole('complementary', { name: 'Scene inspector' })
    expect(within(inspector).getByRole('button', { name: 'Play from here' })).toBeTruthy()
  })

  // operator, 2026-11-10: "big webby CTA buttons! this is desktop pro app and we're leaning way
  // more NLE than whatever that is." Play from here is a tool button, like Close beside it.
  it('draws Play from here as a tool button, not an amber call to action', () => {
    at(768, { inspected: street, selectedSceneIndex: 1 })
    expect(screen.getByRole('button', { name: 'Play from here' })).toHaveAttribute('data-variant', 'tool')
  })

  it('swaps back to Scenes from the transport, clearing the selection', async () => {
    const onSelectScene = vi.fn()
    at(768, { inspected: street, selectedSceneIndex: 1, onSelectScene })
    expect(toggle('Scenes')).toHaveAttribute('aria-pressed', 'false')
    await fireEvent.click(toggle('Scenes'))
    expect(onSelectScene).toHaveBeenCalledWith(-1)
  })

  it('keeps the timeline toggle', () => {
    at(768)
    expect(toggle('Timeline')).toBeTruthy()
  })
})

describe('the Player when wide', () => {
  it('is unchanged: no Play from here, no scene skips, no Scene button', () => {
    at(1280, { inspected: street, selectedSceneIndex: 1, onPreviousScene: vi.fn() })
    expect(screen.queryByRole('button', { name: 'Play from here' })).toBeNull()
    expect(within(transport()).queryByRole('button', { name: 'Previous scene' })).toBeNull()
    expect(within(transport()).queryByRole('button', { name: 'Scene' })).toBeNull()
  })

  it('counts an unmeasured player as wide, so a host that never lays it out sees no change', () => {
    const { container } = at(0)
    expect(container.querySelector('.ui-player')).not.toHaveClass('ui-player--phone')
    expect(screen.getByRole('navigation', { name: 'Scenes' })).toBeTruthy()
  })
})
