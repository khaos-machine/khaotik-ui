import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryPlayback from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayback.svelte'
import playback from '../data/story-playback.json'

// The story player window (catalog app-coverage plan, T7). The host binds its playback, composer
// and reads models into the inspector, timeline and stage snippets; these pin what the window
// itself draws and reports.
const segments = playback.segments
const opening = segments[0]
const line = opening.events.find((e) => e.elementType === 'dialogue')
const unread = segments.find((s) => s.kind === 'scene' && !s.audio && !s.reads.length)
const loaded = { state: { kind: 'loaded' }, segments, current: opening }

describe('the story player window', () => {
  it('lists every scene with whether it has a reading, and reports one chosen', async () => {
    const onNavigate = vi.fn()
    render(StoryPlayback, { props: { ...loaded, onNavigate } })
    const nav = screen.getByRole('navigation', { name: 'Story scenes' })
    expect(within(nav).getAllByRole('button')).toHaveLength(segments.length)
    expect(within(nav).getAllByText('Read ready').length).toBe(segments.filter((s) => s.audio).length)
    await fireEvent.click(within(nav).getAllByRole('button')[1])
    expect(onNavigate).toHaveBeenCalledWith(segments[1].sceneId)
  })

  it('puts the line under the playhead on the stage, with its speaker', () => {
    render(StoryPlayback, { props: { ...loaded, focus: line } })
    const stage = screen.getByRole('region', { name: 'Story preview' })
    expect(within(stage).getByText(line.text)).toBeTruthy()
    expect(within(stage).getAllByText(line.characterName).length).toBeGreaterThan(0)
  })

  it('asks for the readings of a scene with none chosen', async () => {
    const onOpenReadings = vi.fn()
    render(StoryPlayback, { props: { ...loaded, current: unread, onOpenReadings } })
    await fireEvent.click(screen.getByRole('button', { name: 'Open readings' }))
    expect(onOpenReadings).toHaveBeenCalledWith(unread.sceneId)
  })

  it('reports focus mode toggled, and plays from its transport', async () => {
    const onFocusModeChange = vi.fn(), onTogglePlay = vi.fn()
    render(StoryPlayback, { props: { ...loaded, focusMode: true, onFocusModeChange, onTogglePlay } })
    await fireEvent.click(screen.getByRole('button', { name: 'Leave focus' }))
    expect(onFocusModeChange).toHaveBeenCalledWith(false)
    await fireEvent.click(screen.getByRole('button', { name: /Play/ }))
    expect(onTogglePlay).toHaveBeenCalledOnce()
  })

  it('offers the text preview when read playback cannot open', async () => {
    const onPreviewText = vi.fn()
    render(StoryPlayback, { props: { state: { kind: 'failed', message: 'No resolved time yet.' }, onPreviewText } })
    await fireEvent.click(screen.getByRole('button', { name: 'Open text preview' }))
    expect(onPreviewText).toHaveBeenCalledOnce()
  })

  it('draws the inspector only when there is something to inspect', () => {
    const { unmount } = render(StoryPlayback, { props: { ...loaded, inspectorOpen: false } })
    expect(screen.queryByRole('complementary', { name: 'Playback inspector' })).toBeNull()
    unmount()
    render(StoryPlayback, { props: { ...loaded, inspectorOpen: true } })
    expect(screen.getByRole('complementary', { name: 'Playback inspector' })).toBeTruthy()
  })
})
