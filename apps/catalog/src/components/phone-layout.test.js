import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { fixtures } from '../fixtures.js'

// Phone width (below 600px) shows one pane at a time. jsdom does no layout, so the
// widths are measured live; these hold the state the CSS reads. The phone-only buttons are
// display:none at jsdom's width, hence `hidden: true`.

const example = (id) => {
  const fixture = fixtures.find((f) => f.id === id)
  return { component: fixture.component, props: fixture.examples[0].props }
}

describe('ScreenplayEditor at phone width', () => {
  it('Scenes shows the outline, and choosing one goes back to the script', async () => {
    const { component, props } = example('screenplay-editor')
    const { container } = render(component, { props })
    const writer = container.querySelector('.screenplay-editor__writer')
    expect(writer.dataset.pane).toBe('script')
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes', hidden: true }))
    expect(writer.dataset.pane).toBe('outline')
    await fireEvent.click(screen.getByRole('button', { name: 'Title page' }))
    expect(writer.dataset.pane).toBe('script')
  })
})

describe('StoryPlayback at phone width', () => {
  it('opens the scene list as a sheet, and choosing a scene closes it', async () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props })
    const main = container.querySelector('.ui-story-playback')
    expect(main.dataset.sheet).toBeUndefined()
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes', hidden: true }))
    expect(main.dataset.sheet).toBe('scenes')
    await fireEvent.click(container.querySelector('.ui-story-playback__scene'))
    expect(main.dataset.sheet).toBeUndefined()
  })

  it('says nothing under a scene with no readings to choose from', () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props: { ...props, segments: [{ kind: 'scene', sceneId: 's1', label: 'INT. ROOM - DAY', reads: [] }, { kind: 'scene', sceneId: 's2', label: 'EXT. ROOF - NIGHT', audio: {} }] } })
    const rows = [...container.querySelectorAll('.ui-story-playback__scene-label')]
    expect(rows.map((r) => r.querySelector('small')?.textContent ?? '')).toEqual(['', 'Read ready'])
  })

  it('its sheets close with their own Close', async () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props })
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes', hidden: true }))
    await fireEvent.click(screen.getByRole('button', { name: 'Close scenes', hidden: true }))
    expect(container.querySelector('.ui-story-playback').dataset.sheet).toBeUndefined()
  })
})

describe('StoryPlayer at phone width', () => {
  it('its fitted timeline seeks by share of the width, and reports the gesture once', async () => {
    const seeks = []
    let starts = 0
    let ends = 0
    const { component, props } = example('story-player')
    render(component, { props: { ...props, currentTime: 0, onSeek: (s) => seeks.push(s), onScrubStart: () => starts++, onScrubEnd: () => ends++ } })
    const bar = screen.getByRole('slider', { name: 'Position', hidden: true })
    const total = Number(bar.getAttribute('aria-valuemax'))
    bar.getBoundingClientRect = () => ({ left: 0, width: 200, top: 0, height: 20, right: 200, bottom: 20, x: 0, y: 0, toJSON() {} })
    await fireEvent.pointerDown(bar, { button: 0, pointerId: 1, clientX: 50 })
    await fireEvent.pointerMove(bar, { pointerId: 1, clientX: 100 })
    await fireEvent.pointerUp(bar, { pointerId: 1 })
    expect(seeks).toEqual([total / 4, total / 2])
    expect([starts, ends]).toEqual([1, 1])
  })

  it('opens upward into named scenes from one toggle', async () => {
    const { component, props } = example('story-player')
    const { container } = render(component, { props: { segments: props.segments.slice(0, 3) } })
    const toggle = screen.getByRole('button', { name: 'Show timeline', hidden: true })
    expect(container.querySelector('.player__mini-scene').textContent).toBe('')
    await fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.player__mini-scene').textContent).not.toBe('')
  })
})

describe('ScreenplayEditor footnote', () => {
  it('keeps its default line, and an empty footnote leaves it out', () => {
    const { component, props } = example('screenplay-editor')
    const { unmount } = render(component, { props })
    expect(screen.getByText('Existing recordings and artwork are kept')).toBeInTheDocument()
    unmount()
    render(component, { props: { ...props, footnote: '' } })
    expect(screen.queryByText('Existing recordings and artwork are kept')).toBeNull()
  })
})
