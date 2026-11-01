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

describe('One toolbar row at phone width', () => {
  it('Toolbar with no title draws no title cell', () => {
    const { component } = example('toolbar')
    const { container } = render(component, { props: { modes: [{ value: 'a', label: 'A' }], mode: 'a', filter: null } })
    expect(container.querySelector('.toolbar__title')).toBeNull()
  })

  it('StoryPlayback opens a sheet from the host, and draws no stage icons when told', () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props: { ...props, sheet: 'scenes', sheetButtons: false } })
    expect(container.querySelector('.ui-story-playback').dataset.sheet).toBe('scenes')
    expect(container.querySelector('.ui-story-playback__phone-bar')).toBeNull()
  })

  it('ScreenplayEditor shows the pane it is given, and leaves its actions to the host', () => {
    const { component, props } = example('screenplay-editor')
    const { container } = render(component, { props: { ...props, pane: 'outline', actions: false } })
    expect(container.querySelector('.screenplay-editor__writer').dataset.pane).toBe('outline')
    expect(screen.queryByRole('button', { name: 'Undo', hidden: true })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Scenes', hidden: true })).toBeNull()
  })

  it('ScreenplayActions, icons only, keeps every name and confirms Discard', async () => {
    let discarded = 0
    let scenes = 0
    const { component } = example('screenplay-actions')
    render(component, { props: { dirty: 1, canUndo: true, iconOnly: true, onscenes: () => scenes++, ondiscard: () => discarded++ } })
    for (const name of ['Scenes', 'Undo', 'Redo', 'Discard…', 'Save']) expect(screen.getByRole('button', { name })).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Discard…' }))
    expect(discarded).toBe(0)
    await fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }))
    expect([scenes, discarded]).toEqual([1, 1])
  })
})

describe('WorkspaceSwitcher pop-up', () => {
  it('is sized by the chosen label, not the longest option', () => {
    const { component } = example('toolbar')
    const modes = [{ value: 'data', label: 'Data' }, { value: 'screenplay', label: 'Screenplay' }]
    const { container } = render(component, { props: { modes, mode: 'data', width: 390, compactBelow: 560, filter: null } })
    expect(container.querySelector('.switcher__sizer').textContent).toBe('Data')
  })
})
