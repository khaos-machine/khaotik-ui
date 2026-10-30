import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FlowStrip from './FlowStrip.svelte'

// The strip is exercised against flows STATED HERE, not the published ones, so
// these hold whatever flows ship and cannot pass by having nothing to render.
//
// `resolveFlowSteps` reads the live registry, so the ids named here are real
// screens. That is the point: a step naming a screen that gets renamed should
// break a test, and these break with it.
const frame = { device: 'mobile', size: 'base', orientation: 'portrait', enabled: true }

describe('FlowStrip', () => {
  it('draws one frame per step, in the order the flow states', () => {
    const { container } = render(FlowStrip, {
      props: { flow: { name: 'First run', steps: ['shell', 'launcher-window'] }, frame },
    })
    const frames = container.querySelectorAll('.frame')
    expect(frames).toHaveLength(2)
    expect([...container.querySelectorAll('.flow__position')].map((e) => e.textContent)).toEqual(['1', '2'])
  })

  it('sizes every frame from the one picker choice', () => {
    const { container } = render(FlowStrip, {
      props: { flow: { name: 'First run', steps: ['shell', 'launcher-window'] }, frame },
    })
    for (const f of container.querySelectorAll('.frame')) {
      expect(f).toHaveStyle({ width: '390px' })
      expect(f).toHaveAttribute('data-viewport', 'mobile:base')
    }
  })

  it('captions the flow, not the frames', () => {
    const { container, getByText } = render(FlowStrip, {
      props: { flow: { name: 'First run', steps: ['shell', 'launcher-window'] }, frame },
    })
    expect(getByText('First run')).toBeInTheDocument()
    expect(getByText('2 screens')).toBeInTheDocument()
    // a position is a number, not a description of the screen
    expect(container.querySelectorAll('.flow__position')).toHaveLength(2)
  })

  // Live, but not something you can click into or tab through.
  it('renders the screens inert', () => {
    const { container } = render(FlowStrip, {
      props: { flow: { name: 'First run', steps: ['launcher-window'] }, frame },
    })
    expect(container.querySelector('.flow__screen')).toHaveAttribute('inert')
  })

  // A shorter strip that looks correct is how a renamed screen leaves a flow
  // quietly wrong.
  it('reports a step that resolves to nothing instead of dropping it', () => {
    const { container, getByText } = render(FlowStrip, {
      props: { flow: { name: 'Broken', steps: ['launcher-window', 'retired-screen'] }, frame },
    })
    expect(container.querySelectorAll('.frame')).toHaveLength(1)
    expect(getByText(/retired-screen/)).toBeInTheDocument()
  })

  it('says nothing about missing steps when none are missing', () => {
    const { container } = render(FlowStrip, {
      props: { flow: { name: 'Fine', steps: ['launcher-window'] }, frame },
    })
    expect(container.querySelector('.flow__missing')).not.toBeInTheDocument()
  })

  // Many screens need snippet content — Shell takes its panes as snippets — so a
  // strip that spread props alone would draw them blank and look like a layout
  // bug. This is the case that would have caught it.
  it('renders a screen that needs snippet content, not an empty frame', () => {
    const { container } = render(FlowStrip, {
      props: { flow: { name: 'With panes', steps: ['shell'] }, frame },
    })
    const frameEl = container.querySelector('.frame')
    expect(frameEl.textContent.trim().length).toBeGreaterThan(0)
  })

  it('takes the chassis off for every frame at once', () => {
    const { container } = render(FlowStrip, {
      props: { flow: { name: 'Bare', steps: ['shell', 'launcher-window'] }, frame, chassis: false },
    })
    for (const f of container.querySelectorAll('.frame')) {
      expect(f.className).not.toContain('frame--chassis')
    }
  })

  it('renders an empty strip rather than erroring on a flow with no steps', () => {
    const { container, getByText } = render(FlowStrip, { props: { flow: { name: 'Empty' }, frame } })
    expect(container.querySelectorAll('.frame')).toHaveLength(0)
    expect(getByText('0 screens')).toBeInTheDocument()
  })
})
