import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Canvas from './Canvas.svelte'
import LabeledField from '@khaos-machine/khaotik-ui/components/svelte/LabeledField.svelte'
import StatusPill from '@khaos-machine/khaotik-ui/components/svelte/StatusPill.svelte'
import Settings from '@khaos-machine/khaotik-ui/components/svelte/Settings.svelte'

// The canvas could only spread plain props, so a component whose job is to WRAP
// content had nothing to wrap and rendered as an empty frame. LabeledField is a
// label over its content; Settings is a rail plus a pane the host fills. Both
// were unplayable here while Storybook could show them, because a story can
// write a snippet and a fixture registry cannot.
//
// A fixture example may now carry `snippets: { children: [{ component, props }] }`.

describe('Canvas slotted content', () => {
  const fixture = (examples) => ({ name: 'Settings', kind: 'screen', component: Settings, examples })

  it('renders a fixture example that supplies no slot, unchanged', () => {
    const active = { label: 'No categories', props: { categories: [], selected: '' } }
    render(Canvas, { props: { selected: fixture([active]), active } })
    // the shell chrome still names it; there is simply nothing in the pane
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('renders the slotted rows inside the component, not beside it', () => {
    const active = {
      label: 'Providers',
      props: { categories: [{ id: 'providers', label: 'Providers' }], selected: 'providers' },
      snippets: { children: [
        { component: StatusPill, props: { text: 'ollama', tone: 'success' } },
        { component: StatusPill, props: { text: 'anthropic', tone: 'neutral' } },
      ] },
    }
    const { container } = render(Canvas, { props: { selected: fixture([active]), active } })

    expect(screen.getByText('ollama')).toBeInTheDocument()
    expect(screen.getByText('anthropic')).toBeInTheDocument()

    // Inside the pane the component owns — a row rendered as a sibling of
    // Settings would satisfy getByText above while looking nothing like the
    // screen it is meant to be playtesting.
    const pane = container.querySelector('.settings__content')
    expect(pane).not.toBeNull()
    expect(pane.textContent).toContain('ollama')
  })

  it('passes each slotted item its own props', () => {
    const active = {
      label: 'Rows',
      props: { categories: [{ id: 'general', label: 'General' }], selected: 'general' },
      snippets: { children: [
        { component: LabeledField, props: { label: 'Theme' } },
        { component: LabeledField, props: { label: 'Window' } },
      ] },
    }
    render(Canvas, { props: { selected: fixture([active]), active } })

    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Window')).toBeInTheDocument()
  })
})

// The viewport frame. `viewports.test.js` pins what a preset MEANS; these pin
// that the canvas applies it — the two fail for different reasons, and a right
// table applied to nothing looks identical to no table at all.
describe('Canvas viewport frame', () => {
  // No `component`, so this renders the placeholder branch. The frame wraps
  // both branches, so it is the cheapest way to pin the framing, and the
  // placeholder doubles as the "is anything rendering" check.
  const selected = { name: 'Unwired', kind: 'screen' }

  const request = (over) => ({
    device: 'web',
    size: 'fill',
    orientation: 'portrait',
    enabled: true,
    ...over,
  })

  it('sizes the frame from the device and size', () => {
    const { container } = render(Canvas, {
      props: { selected, frame: request({ device: 'mobile', size: 'base' }) },
    })
    const frame = container.querySelector('.frame')

    expect(frame).toHaveStyle({ width: '390px', height: '844px' })
    expect(frame).toHaveAttribute('data-viewport', 'mobile:base')
  })

  it('swaps the axes in landscape, and says so in the data attribute', () => {
    const { container } = render(Canvas, {
      props: {
        selected,
        frame: request({ device: 'mobile', size: 'base', orientation: 'landscape' }),
      },
    })
    const frame = container.querySelector('.frame')

    expect(frame).toHaveStyle({ width: '844px', height: '390px' })
    expect(frame).toHaveAttribute('data-viewport', 'mobile:base:landscape')
  })

  // A web breakpoint constrains width only. Writing a height here would be the
  // canvas inventing a constraint the breakpoint does not carry.
  it('constrains a web breakpoint on width alone', () => {
    const { container } = render(Canvas, {
      props: { selected, frame: request({ size: 'lg' }) },
    })
    const frame = container.querySelector('.frame')

    expect(frame.style.width).toBe('1024px')
    expect(frame.style.height).toBe('')
  })

  // The default has to leave the canvas exactly as it was before the picker
  // existed, or adding the control silently reframes every fixture.
  it('writes no size at all for fill, and does not draw a frame', () => {
    const { container } = render(Canvas, { props: { selected, frame: request() } })
    const frame = container.querySelector('.frame')

    expect(frame.getAttribute('style')).toBe('')
    expect(frame.className).not.toContain('frame--sized')
  })

  // The section decides whether framing applies at all, upstream of here.
  it('frames nothing when the section cannot be framed', () => {
    const { container } = render(Canvas, {
      props: { selected, frame: request({ device: 'mobile', size: 'base', enabled: false }) },
    })

    expect(container.querySelector('.frame').getAttribute('style')).toBe('')
  })

  it('still renders the preview inside the frame when framed', () => {
    const { container } = render(Canvas, {
      props: { selected, frame: request({ device: 'tablet', size: 'base' }) },
    })

    expect(screen.getByText(/Unwired — not yet wired/)).toBeInTheDocument()
    expect(container.querySelector('.frame .placeholder')).toBeInTheDocument()
  })
})
