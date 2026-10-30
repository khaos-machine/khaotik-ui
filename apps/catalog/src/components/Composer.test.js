import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Composer from '@khaos-machine/khaotik-ui/components/svelte/Composer.svelte'
import { definition, previsShot, ROVER_KEY } from '../data/shot-conformance/previs.js'

// jsdom has no WebGL, so only the renderer is stubbed for ShotPrevis's lazy scene.
vi.mock('three', async (original) => ({
  ...(await original()),
  WebGLRenderer: class {
    render() {}
    setSize() {}
    setPixelRatio() {}
    dispose() {}
  },
}))

// The Composer stage's view (shot-kit plan B-U1c, frame §7.4): `previs`, the default, draws
// ShotPrevis; `rendered` is today's stage. The rendered and planning snapshots were written by
// the Composer before `view` existed, so a match is the proof they are unchanged.

const here = dirname(fileURLToPath(import.meta.url))
const glb = (name) => new Uint8Array(readFileSync(resolve(here, '../data/shot-conformance', name)))
const previs = { shot: previsShot, definition, place: glb('place.glb'), figures: { [ROVER_KEY]: glb('rover.glb') }, objects: { Crate: glb('crate.glb') }, oncamera: () => {} }
// Svelte's scoped class hashes differ between machines, so they are taken out of the snapshot.
const markup = (container) => container.innerHTML.replace(/\s?svelte-[a-z0-9]+/g, '')
const stage = {
  key: 'shot-1:frame-1',
  shot: { id: 'shot-1', label: 'Shot 1', frames: [], status: 'ready' },
  imageUrl: 'blob:frame-1',
  review: 'Chosen frame',
  event: { label: 'Action', text: 'Rover steps through the door.' },
}

describe("the Composer stage's view", () => {
  it('draws the previs by default', () => {
    render(Composer, { props: { part: 'stage', stage, previs } })
    expect(screen.getByRole('application', { name: /previs/i })).toBeInTheDocument()
    expect(screen.queryByText('Chosen frame')).toBeNull()
  })

  it('draws nothing for the previs without a scene', () => {
    const { container } = render(Composer, { props: { part: 'stage', stage, previs: null } })
    expect(container.querySelector('.ui-composer__stage')).toBeNull()
  })

  it("draws today's rendered stage, unchanged", () => {
    const { container } = render(Composer, { props: { part: 'stage', view: 'rendered', stage, previs } })
    expect(screen.queryByRole('application', { name: /previs/i })).toBeNull()
    expect(markup(container)).toMatchSnapshot()
  })

  it('leaves the planning part untouched', () => {
    const planner = { beatCount: 0, plan: null, sceneLabel: 'INT. FLAT - NIGHT' }
    const { container } = render(Composer, { props: { part: 'planning', view: 'previs', planner, previs } })
    expect(screen.queryByRole('application', { name: /previs/i })).toBeNull()
    expect(markup(container)).toMatchSnapshot()
  })

  it("reaches previs.onload with the scene's node names", async () => {
    const onload = vi.fn()
    render(Composer, { props: { part: 'stage', view: 'previs', previs: { ...previs, onload } } })
    await vi.waitFor(() => expect(onload).toHaveBeenCalledOnce())
    expect(onload.mock.calls[0][0]).toContain('FIX_Leaf_Hinge')
  })

  it('passes ShotPrevis its props by name, never spread', () => {
    const source = readFileSync(resolve(here, '../../../../components/svelte/Composer.svelte'), 'utf8')
    const tags = source.match(/<ShotPrevis\b[^>]*>/g) ?? []
    expect(tags.length).toBe(1)
    expect(tags[0]).not.toMatch(/\{\s*\.\.\./)
  })
})
