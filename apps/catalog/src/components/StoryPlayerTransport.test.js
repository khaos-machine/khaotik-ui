import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/svelte'
import fs from 'node:fs'
import path from 'node:path'
import StoryPlayer from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayer.svelte'

const segments = [{ kind: 'scene', sceneId: 'first', label: 'First scene', startMs: 0, durationMs: 100000, events: [] }]
function pointer(target, type, clientX, pointerId = 7) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { clientX, pointerId, button: 0, isPrimary: true })
  return fireEvent(target, event)
}
function geometry() {
  const track = document.querySelector('.player__track')
  const ruler = document.querySelector('.player__ruler')
  const viewport = document.querySelector('.player__viewport')
  viewport.scrollLeft = 300
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ left: -200, width: 1000 })
  vi.spyOn(ruler, 'getBoundingClientRect').mockReturnValue({ left: -200, width: 1000 })
  return { track, ruler }
}

describe('Story Player transport and seeking', () => {
  it('counts horizontal pan once when clicking a point on the ruler', async () => {
    const onSeek = vi.fn()
    render(StoryPlayer, { segments, scale: 10, onSeek })
    const { ruler } = geometry()
    await fireEvent.click(ruler, { clientX: 150, detail: 1 })
    expect(onSeek).toHaveBeenLastCalledWith(35)
  })
  it('drags the playhead beyond its handle and ignores other pointers and released gestures', async () => {
    const onSeek = vi.fn(), onScrubStart = vi.fn(), onScrubEnd = vi.fn()
    render(StoryPlayer, { segments, scale: 10, onSeek, onScrubStart, onScrubEnd })
    geometry()
    const playhead = screen.getByRole('slider', { name: 'Timeline playhead' })
    await pointer(playhead, 'pointerdown', 100)
    expect(onScrubStart).toHaveBeenCalledTimes(1)
    await pointer(window, 'pointermove', 500, 99)
    expect(onSeek).toHaveBeenLastCalledWith(30)
    await pointer(window, 'pointermove', 300)
    expect(onSeek).toHaveBeenLastCalledWith(50)
    await pointer(window, 'pointerup', 300)
    expect(onScrubEnd).toHaveBeenCalledTimes(1)
    await pointer(window, 'pointermove', 500)
    expect(onSeek).toHaveBeenLastCalledWith(50)
  })
  it('scrubs from the ruler, clamps both ends and ends a cancelled gesture', async () => {
    const onSeek = vi.fn(), onScrubEnd = vi.fn()
    render(StoryPlayer, { segments, scale: 10, onSeek, onScrubEnd })
    const { ruler } = geometry()
    await pointer(ruler, 'pointerdown', -300)
    expect(onSeek).toHaveBeenLastCalledWith(0)
    await pointer(window, 'pointermove', 2000)
    expect(onSeek).toHaveBeenLastCalledWith(100)
    await pointer(window, 'pointercancel', 2000)
    expect(onScrubEnd).toHaveBeenCalledTimes(1)
  })
  it('makes the playhead focusable and gives it precise keyboard seeking', async () => {
    const onSeek = vi.fn()
    render(StoryPlayer, { segments, currentTime: 40, onSeek })
    const playhead = screen.getByRole('slider', { name: 'Timeline playhead' })
    expect(playhead).toHaveAttribute('tabindex', '0')
    expect(playhead).toHaveAttribute('aria-valuenow', '40')
    await fireEvent.keyDown(playhead, { key: 'ArrowRight' })
    expect(onSeek).toHaveBeenLastCalledWith(41)
    await fireEvent.keyDown(playhead, { key: 'Home' })
    expect(onSeek).toHaveBeenLastCalledWith(0)
    await fireEvent.keyDown(playhead, { key: 'End' })
    expect(onSeek).toHaveBeenLastCalledWith(100)
  })
  it('reports beat, scene, stop and boundary intents through explicit transport controls', async () => {
    const onSeek = vi.fn()
    const actions = { onPreviousScene: vi.fn(), onPreviousBeat: vi.fn(), onNextBeat: vi.fn(), onNextScene: vi.fn(), onStop: vi.fn() }
    render(StoryPlayer, { segments, onSeek, ...actions })
    for (const [name, action] of [['Previous scene', actions.onPreviousScene], ['Previous beat', actions.onPreviousBeat], ['Next beat', actions.onNextBeat], ['Next scene', actions.onNextScene], ['Stop', actions.onStop]]) {
      await fireEvent.click(screen.getByRole('button', { name }))
      expect(action).toHaveBeenCalledOnce()
    }
    await fireEvent.click(screen.getByRole('button', { name: 'Go to beginning' }))
    expect(onSeek).toHaveBeenLastCalledWith(0)
    await fireEvent.click(screen.getByRole('button', { name: 'Go to end' }))
    expect(onSeek).toHaveBeenLastCalledWith(100)
  })
})

// The Player's pane toggles sit at the transport row's end, as icons (operator, 2026-11-10: "let's
// may it togglable from the transport like we do with timeline.. we can use icons for these
// instead of the chevron"). They are the host's to offer, as the Toolbar's are.
describe('the pane toggles', () => {
  const transport = () => screen.getByRole('group', { name: 'Playback controls' })
  const panes = [{ id: 'scenes', label: 'Scenes', icon: 'list-numbers', shown: true }, { id: 'timeline', label: 'Timeline', icon: 'film-strip', shown: false }]
  it('draws no toggle without panes', () => {
    render(StoryPlayer, { props: { segments } })
    expect(transport().querySelector('[aria-pressed]')).toBeNull()
  })
  it('draws each pane as a pressed-state icon, and asks the host with its id', async () => {
    const onTogglePane = vi.fn()
    render(StoryPlayer, { props: { segments, panes, onTogglePane } })
    const scenes = within(transport()).getByRole('button', { name: 'Scenes' })
    expect(scenes).toHaveAttribute('aria-pressed', 'true')
    expect(scenes.querySelector('.ph-list-numbers')).not.toBeNull()
    expect(within(transport()).getByRole('button', { name: 'Timeline' })).toHaveAttribute('aria-pressed', 'false')
    await fireEvent.click(scenes)
    expect(onTogglePane).toHaveBeenCalledWith('scenes')
  })
  // operator, 2026-11-10: "no gray background on buttons". Read as source: jsdom resolves no
  // stylesheets, and the gray was the browser's own button face.
  it('draws the toggles with no background, the pressed one in the primary text colour', () => {
    const source = fs.readFileSync(path.resolve(import.meta.dirname, '../../../../components/svelte/StoryPlayer.svelte'), 'utf8')
    const rule = source.match(/\.player__panes > button\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/background:\s*transparent/)
    expect(rule).toMatch(/border:\s*0/)
    expect(source).toMatch(/\.player__panes > button\[aria-pressed='true'\]\s*\{[^}]*color:\s*var\(--text-primary\)/)
  })
  // operator, 2026-11-10: "scenes should be clapper icon and moved to left end of the toolbar";
  // asked which: "Transport row, left end".
  it('draws a pane marked at start at the row\'s left end, before Go to beginning', () => {
    render(StoryPlayer, { props: { segments, panes: [{ ...panes[0], at: 'start' }, panes[1]] } })
    const buttons = within(transport()).getAllByRole('button')
    expect(buttons[0]).toHaveAccessibleName('Scenes')
    expect(buttons.at(-1)).toHaveAccessibleName('Timeline')
  })
  it('draws only the transport while the timeline is hidden', () => {
    const { container } = render(StoryPlayer, { props: { segments, timelineHidden: true } })
    expect(container.querySelector('.player__stage')).toBeNull()
    expect(container.querySelector('.player__panel')).toBeNull()
    // The phone's mini timeline too: measured at 390, the toggle otherwise changed nothing visible.
    expect(container.querySelector('.player__mini')).toBeNull()
    expect(transport()).toBeTruthy()
  })
})
