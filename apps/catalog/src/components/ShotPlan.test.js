import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/svelte'
import ShotPlan from '@khaos-machine/khaotik-ui/components/svelte/ShotPlan.svelte'
import { clientToPlan, facingOf, facingVector, objectFootprint } from '@khaos-machine/khaotik-ui/components/svelte/lib/shot-plan.js'
import projection from '../data/shot-conformance/projection.json'
import { blocking, crateDefinition, definition } from '../data/shot-conformance/previs.js'

// The plan's drift guard (shot-kit frame §7.3, plan B-U1b): against the kit's conformance shot
// (khaos-previs-kit v0.8.0, data/shot-conformance/README.md), a figure's puck sits on its blocking
// position within 1 cm, and its facing handle points where the kit's own build put the figure's
// face within 1 degree: from the feet toward the head joint, which a standing figure carries
// ahead of its feet. A facing convention flipped on the plan's side turns this red.

const CM = 0.01
const objectDefinitions = { Crate: crateDefinition }
const names = { Rover: 'Rover' }
const props = { blocking, definition, objectDefinitions, names }
const rover = blocking.figures[0]
const angle = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI
const angleGap = (a, b) => Math.abs(((a - b + 540) % 360) - 180)

function puck() {
  return screen.getByRole('button', { name: 'Rover, figure' })
}
function handle() {
  return screen.getByRole('slider', { name: "Rover's facing" })
}
// The drawn handle, as a vector from the puck's centre in the plan's frame.
function handleVector() {
  const line = document.querySelector('.shot-plan__handle line')
  const n = (a) => Number(line.getAttribute(a))
  return [n('x2') - n('x1'), n('y2') - n('y1')]
}

describe('ShotPlan against the kit conformance shot', () => {
  it("draws Rover's puck at his blocking position within 1 cm", () => {
    render(ShotPlan, { props })
    const circle = puck().querySelector('circle')
    expect(Math.hypot(Number(circle.getAttribute('cx')) - rover.position[0], Number(circle.getAttribute('cy')) - rover.position[1])).toBeLessThanOrEqual(CM)
  })

  it("points Rover's facing handle where the kit put his face, within 1 degree", () => {
    render(ShotPlan, { props })
    const face = [projection.head.point[0] - rover.position[0], projection.head.point[1] - rover.position[1]]
    expect(angleGap(angle(handleVector()), angle(face))).toBeLessThanOrEqual(1)
    expect(handle()).toHaveAttribute('aria-valuenow', String(rover.facingDegrees))
  })

  it("draws the Crate's footprint with a corner on the kit's corner, within 1 cm", () => {
    const corners = objectFootprint(crateDefinition, blocking.objects[0].placement.floor)
    const kit = projection.corner.point
    expect(Math.min(...corners.map((c) => Math.hypot(c[0] - kit[0], c[1] - kit[1])))).toBeLessThanOrEqual(CM)
    render(ShotPlan, { props })
    expect(screen.getByRole('button', { name: 'Crate, object' })).toBeInTheDocument()
  })

  it('reads facing and its vector as inverses, front -y at 0, counter-clockwise', () => {
    expect(facingVector(0).map((v) => +v.toFixed(9) + 0)).toEqual([0, -1])
    expect(facingVector(-90).map((v) => +v.toFixed(9) + 0)).toEqual([-1, 0])
    for (const deg of [-179, -90, -30, 0, 45, 90, 180]) expect(angleGap(facingOf(...facingVector(deg)), deg)).toBeLessThan(1e-9)
  })

  it('draws the shot camera as a lens cone', () => {
    render(ShotPlan, { props })
    expect(document.querySelector('.shot-plan__camera polygon')).not.toBeNull()
  })
})

describe('mapping a pointer into the plan', () => {
  it('undoes the letterbox and the y flip', () => {
    // A 9 by 4 m view in a 900 by 600 px box: 100 px a metre, 100 px of letterbox above and below.
    const rect = { left: 10, top: 20, width: 900, height: 600 }
    expect(clientToPlan(rect, [0, -4, 9, 4], 10, 120)).toEqual([0, 4])
    expect(clientToPlan(rect, [0, -4, 9, 4], 910, 520)).toEqual([9, 0])
  })
})

describe('ShotPlan edits', () => {
  afterEach(() => vi.restoreAllMocks())

  // jsdom lays nothing out, so the plan's box is given: the viewBox maps 100 px to a metre.
  function laidOut() {
    vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1000, height: 500, right: 1000, bottom: 500, x: 0, y: 0, toJSON() {} })
  }

  it('emits one whole-figure edit when a puck is released, not one per frame', async () => {
    laidOut()
    const onfigure = vi.fn()
    render(ShotPlan, { props: { ...props, onfigure } })
    const p = puck()
    await fireEvent.pointerDown(p, { clientX: 500, clientY: 250, pointerId: 1, button: 0 })
    for (let x = 510; x <= 550; x += 10) await fireEvent.pointerMove(p, { clientX: x, clientY: 250, pointerId: 1 })
    expect(onfigure).not.toHaveBeenCalled()
    await fireEvent.pointerUp(p, { clientX: 550, clientY: 250, pointerId: 1 })
    expect(onfigure).toHaveBeenCalledTimes(1)
    const [edit] = onfigure.mock.calls[0]
    expect(edit).toEqual({ ...rover, position: [expect.any(Number), rover.position[1], rover.position[2]] })
    expect(edit.position[0]).toBeCloseTo(rover.position[0] + 0.5, 6)
  })

  it('turns the figure with its handle and emits once, on release', async () => {
    laidOut()
    const onfigure = vi.fn()
    render(ShotPlan, { props: { ...props, onfigure } })
    const h = handle()
    // The view is 10 by 5 m (rooms 9 by 4, a 0.5 m margin) from x -0.5 and y 4.5 down, so Rover
    // at (7, 2) is at (750, 250) px. A pointer due north of him faces him north: 180.
    await fireEvent.pointerDown(h, { clientX: 750, clientY: 200, pointerId: 1, button: 0 })
    await fireEvent.pointerMove(h, { clientX: 760, clientY: 150, pointerId: 1 })
    await fireEvent.pointerMove(h, { clientX: 750, clientY: 150, pointerId: 1 })
    expect(onfigure).not.toHaveBeenCalled()
    await fireEvent.pointerUp(h, { clientX: 750, clientY: 150, pointerId: 1 })
    expect(onfigure).toHaveBeenCalledTimes(1)
    expect(onfigure.mock.calls[0][0]).toEqual({ ...rover, facingDegrees: 180 })
  })

  it('moves and turns from the keyboard, one edit per key', async () => {
    const onfigure = vi.fn()
    render(ShotPlan, { props: { ...props, onfigure } })
    await fireEvent.keyDown(puck(), { key: 'ArrowUp' })
    expect(onfigure.mock.calls[0][0].position).toEqual([7, 2.1, 0])
    await fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(onfigure.mock.calls[1][0].facingDegrees).toBe(-95)
    expect(onfigure).toHaveBeenCalledTimes(2)
  })

  it('reports a figure chosen by click', async () => {
    const onselect = vi.fn()
    render(ShotPlan, { props: { ...props, onselect } })
    await fireEvent.click(puck())
    expect(onselect).toHaveBeenCalledWith('Rover')
  })
})

describe("ShotPlan's inspector part", () => {
  it('picks a pose for the selected figure, as a whole-figure edit', async () => {
    const onfigure = vi.fn()
    render(ShotPlan, { props: { ...props, part: 'inspector', selected: 'Rover', onfigure } })
    const pose = screen.getByRole('combobox', { name: 'Pose' })
    expect(pose).toHaveValue('stand')
    await fireEvent.change(pose, { target: { value: 'sit' } })
    expect(onfigure).toHaveBeenCalledTimes(1)
    expect(onfigure.mock.calls[0][0]).toEqual({ ...rover, pose: 'sit' })
  })

  it('offers every pose KSPD defines', () => {
    render(ShotPlan, { props: { ...props, part: 'inspector', selected: 'Rover' } })
    const values = [...screen.getByRole('combobox', { name: 'Pose' }).querySelectorAll('option')].map((o) => o.value)
    expect(values).toEqual(['stand', 'walk', 'sit', 'crouch', 'kneel', 'lie', 'lean'])
  })

  it('asks for a figure when none is selected', () => {
    render(ShotPlan, { props: { ...props, part: 'inspector' } })
    expect(screen.getByText('Select a figure on the plan.')).toBeInTheDocument()
  })
})

describe('ShotPlan', () => {
  it('says there is nothing to plan without a blocking', () => {
    render(ShotPlan, { props: { definition, blocking: null } })
    expect(screen.getByText('No shot to plan.')).toBeInTheDocument()
  })

  it('passes PlacePlan its props by name, never spread', () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../components/svelte/ShotPlan.svelte'), 'utf8')
    const tags = source.match(/<PlacePlan\b[^>]*>/g) ?? []
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) expect(tag).not.toMatch(/\{\s*\.\.\./)
  })
})
