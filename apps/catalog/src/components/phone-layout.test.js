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

  it('its sheets close with their own Close', async () => {
    const { component, props } = example('story-playback')
    const { container } = render(component, { props })
    await fireEvent.click(screen.getByRole('button', { name: 'Scenes', hidden: true }))
    await fireEvent.click(screen.getByRole('button', { name: 'Close scenes', hidden: true }))
    expect(container.querySelector('.ui-story-playback').dataset.sheet).toBeUndefined()
  })
})
