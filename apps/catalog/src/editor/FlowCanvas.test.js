import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import FlowCanvas from './FlowCanvas.svelte'
import { fixtures } from '../fixtures.js'
import { composedRegistry } from './registry.js'
import { createDocument, layoutNode, componentNode } from './document.js'

const frame = { device: 'mobile', size: 'base', orientation: 'portrait', enabled: true }

const page = {
  ...createDocument({ kind: 'screen', slug: 'scene-triage', name: 'Scene triage' }),
  root: layoutNode({ id: 'n0', children: [componentNode('@MetricCard', { id: 'n1', props: { label: 'Scenes', value: '54' } })] }),
}

/** The live registry plus one composed page — what a flow may actually step through. */
const registry = [...fixtures, ...composedRegistry([page])]

function editor(flow) {
  let current = flow
  const utils = render(FlowCanvas, { props: { flow: current, frame, registry, onChange: () => {} } })
  const onChange = (next) => { current = next; utils.rerender({ flow: next, frame, registry, onChange }) }
  utils.rerender({ flow: current, frame, registry, onChange })
  return { ...utils, latest: () => current }
}

const flow = (steps = []) => ({ schema: 1, kind: 'flow', slug: 'first-run', name: 'First run', steps })
const side = () => within(screen.getByLabelText('Steps'))
/** The add list specifically — a name can be both a step and an option to add. */
const add = () => within(screen.getByRole('group', { name: 'Add a step' }))

describe('composing a flow', () => {
  it('says what an empty flow is, rather than showing a blank stage', () => {
    editor(flow())
    expect(screen.getByText(/A flow is a sequence of screens and composed pages/)).toBeInTheDocument()
  })

  it('offers hand-authored and composed screens alike as steps', () => {
    editor(flow())
    expect(add().getByRole('button', { name: /Scene triage/ })).toBeInTheDocument()
    expect(add().getByRole('button', { name: /^Splash/ })).toBeInTheDocument()
    // A BrandKit specimen carries kind 'screen' with section 'brandkit'. A flow
    // through the colour palette is not a journey, so it is not offered.
    expect(add().queryByRole('button', { name: /^Color/ })).toBeNull()
  })

  it('appends a step and draws a frame for it', async () => {
    const e = editor(flow(['splash']))
    expect(e.container.querySelectorAll('.frame')).toHaveLength(1)
    await fireEvent.click(add().getByRole('button', { name: /Scene triage/ }))
    expect(e.latest().steps).toEqual(['splash', 'scene-triage'])
    expect(e.container.querySelectorAll('.frame')).toHaveLength(2)
  })

  it('renders a composed screen in the strip beside a hand-authored one', async () => {
    // FlowStrip was built and tested and imported by nothing. This is the caller
    // it was waiting for — and it needed no change beyond being told which
    // registry to resolve against.
    const e = editor(flow(['splash', 'scene-triage']))
    expect(e.container.querySelectorAll('.frame')).toHaveLength(2)
    // Scoped to the MetricCard. A bare `getByText('54')` went ambiguous once
    // ProjectCard's meta row became a MetaStrip and the launcher screen in this
    // flow rendered a scene count of 54 too. The assertion was about THIS
    // card's value, so it says so.
    const metric = screen.getByLabelText('Scenes')
    expect(metric).toBeInTheDocument()
    expect(metric.textContent).toContain('54')
  })

  it('reorders and removes steps', async () => {
    const e = editor(flow(['splash', 'scene-triage']))
    await fireEvent.click(side().getByRole('button', { name: 'Move Scene triage earlier' }))
    expect(e.latest().steps).toEqual(['scene-triage', 'splash'])

    await fireEvent.click(side().getByRole('button', { name: 'Remove Splash' }))
    expect(e.latest().steps).toEqual(['scene-triage'])
  })

  it('clamps a move at both ends rather than wrapping', async () => {
    const e = editor(flow(['splash', 'scene-triage']))
    await fireEvent.click(side().getByRole('button', { name: 'Move Splash earlier' }))
    expect(e.latest().steps).toEqual(['splash', 'scene-triage'])
  })

  it('keeps a step that names nothing, and says which id it is', () => {
    // Dropping it silently would render a shorter strip that looks correct,
    // which is how a renamed screen leaves a flow quietly wrong.
    const e = editor(flow(['splash', 'ghost']))
    expect(side().getByText(/no longer exist: ghost/)).toBeInTheDocument()
    expect(e.container.querySelectorAll('.frame')).toHaveLength(1)
    // Still removable — the row is there, named by its id.
    expect(side().getByRole('button', { name: 'Remove ghost' })).toBeInTheDocument()
  })

  it('sizes every frame from the one picker choice', () => {
    const e = editor(flow(['splash', 'scene-triage']))
    for (const f of e.container.querySelectorAll('.frame')) {
      expect(f.getAttribute('data-viewport')).toBe('mobile:base')
    }
  })

  it('lets the same step appear twice, because a journey can revisit a screen', async () => {
    const e = editor(flow(['splash']))
    await fireEvent.click(add().getByRole('button', { name: /^Splash/ }))
    expect(e.latest().steps).toEqual(['splash', 'splash'])
    expect(e.container.querySelectorAll('.frame')).toHaveLength(2)
  })
})
