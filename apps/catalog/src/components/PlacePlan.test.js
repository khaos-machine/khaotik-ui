import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/svelte'
import PlacePlan from '@khaos-machine/khaotik-ui/components/svelte/PlacePlan.svelte'
import { footprint, planOf } from '@khaos-machine/khaotik-ui/components/svelte/lib/place-plan.js'
import definition from '../data/place-conformance/definition.json'
import report from '../data/place-conformance/build-report.json'

// The drift guard of the place viewer frame (§3): the plan's placement maths is a second
// implementation of the kit's conventions, so its footprints are held to the kit's own build
// report, copied in at the kit version khaosd serves (data/place-conformance/README.md).

const CM = 0.01

/** The largest distance from a corner of one rectangle to the nearest corner of the other, both ways. */
function cornerGap(a, b) {
  const nearest = (p, set) => Math.min(...set.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])))
  return Math.max(...a.map((p) => nearest(p, b)), ...b.map((p) => nearest(p, a)))
}

describe('PlacePlan footprints, against the kit build report', () => {
  it('has a footprint in the report for every fixture in the definition', () => {
    expect(Object.keys(report.footprints).sort()).toEqual(definition.fixtures.map((f) => f.id).sort())
  })

  it.each(Object.entries(report.footprints))('%s is within 1 cm of the build', (id, built) => {
    const drawn = footprint(definition, id)
    expect(drawn).toHaveLength(4)
    expect(cornerGap(drawn, built)).toBeLessThanOrEqual(CM)
  })

  it('refuses a fixture the definition does not hold', () => {
    expect(() => footprint(definition, 'Nowhere')).toThrow(/Nowhere/)
  })
})

describe('the plan of the conformance place', () => {
  const plan = planOf(definition)

  it('draws each room from its outline', () => {
    expect(plan.rooms).toEqual([{ id: 'Room', points: definition.rooms[0].outline }])
  })

  it('draws each opening as its wall segment', () => {
    // Doorway: wall 0 from (0, 0) to (5, 0), 0.9 wide at 1.2.
    const doorway = plan.openings.find((o) => o.id === 'Doorway')
    expect(doorway.a[0]).toBeCloseTo(0.75)
    expect(doorway.b[0]).toBeCloseTo(1.65)
    expect(doorway.a[1]).toBeCloseTo(0)
  })

  it("draws the door leaf's swing about its hinge, into the room", () => {
    const swing = plan.swings.find((s) => s.id === 'Door')
    // Left hinge on wall 0 is the jamb toward the wall's end: (1.65, 0); the leaf is 0.9 long.
    expect(swing.hinge[0]).toBeCloseTo(1.65)
    expect(swing.hinge[1]).toBeCloseTo(0)
    expect(swing.radius).toBeCloseTo(0.9)
    // Closed, the free edge is at (0.75, 0); open 60 degrees it is inside the room (y > 0).
    expect(swing.closed[0]).toBeCloseTo(0.75)
    expect(swing.open[1]).toBeGreaterThan(0)
  })

  it('draws each camera at its position with a cone toward its target', () => {
    const corner = plan.cameras.find((c) => c.id === 'Corner')
    expect(corner.position).toEqual([4.6, 0.4])
    // A 24 mm lens on a 36 mm sensor sees 2 atan(18 / 24) across.
    const half = Math.atan(18 / 24)
    const aim = Math.atan2(3.0 - 0.4, 1.5 - 4.6)
    const angle = (p) => Math.atan2(p[1] - 0.4, p[0] - 4.6)
    expect(angle(corner.left)).toBeCloseTo(aim + half)
    expect(angle(corner.right)).toBeCloseTo(aim - half)
  })
})

describe('PlacePlan', () => {
  it('draws one selectable shape per room, opening, fixture and camera', () => {
    render(PlacePlan, { props: { definition } })
    for (const id of ['Room', 'Doorway', 'WindowHole', 'Desk', 'Door', 'Corner', 'Back']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${id}\\b`) })).toBeInTheDocument()
    }
  })

  it('marks the selected element and reports a choice', async () => {
    const onselect = vi.fn()
    render(PlacePlan, { props: { definition, selected: 'Desk', onselect } })
    expect(screen.getByRole('button', { name: /^Desk\b/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^Sofa\b/ })).toHaveAttribute('aria-pressed', 'false')
    await fireEvent.click(screen.getByRole('button', { name: /^Sofa\b/ }))
    expect(onselect).toHaveBeenCalledWith('Sofa')
    await fireEvent.keyDown(screen.getByRole('button', { name: /^Corner\b/ }), { key: 'Enter' })
    expect(onselect).toHaveBeenCalledWith('Corner')
  })

  it('says there is nothing to draw without a definition', () => {
    render(PlacePlan, { props: { definition: null } })
    expect(screen.getByText('No place to draw.')).toBeInTheDocument()
  })
})

// jsdom lays nothing out, so the plan's screen-to-plan transform is stubbed: 100 px to the metre,
// screen y down and plan y north, the origin at the screen origin.
function stubScreen() {
  vi.stubGlobal('DOMPoint', class {
    constructor(x, y) { this.x = x; this.y = y }
    matrixTransform(m) { return m.apply(this) }
  })
  SVGElement.prototype.getScreenCTM = () => ({ inverse: () => ({ apply: (p) => ({ x: p.x / 100, y: -p.y / 100 }) }) })
}
const at = (x, y) => ({ clientX: x * 100, clientY: -y * 100, button: 0, pointerId: 1 })

describe('PlacePlan camera moves (khaos-app#588)', () => {
  const corner = definition.cameras.find((c) => c.id === 'Corner')

  it('drags a camera body: the position follows, the target stays, and the release reports once', async () => {
    stubScreen()
    const onmovecamera = vi.fn()
    render(PlacePlan, { props: { definition, onmovecamera } })
    const cam = screen.getByRole('button', { name: 'Corner, camera' })
    await fireEvent.pointerDown(cam, at(4.6, 0.4))
    await fireEvent.pointerMove(cam, at(4.0, 1.0))
    expect(onmovecamera).toHaveBeenLastCalledWith('Corner', { position: [expect.closeTo(4.0), expect.closeTo(1.0)], target: [1.5, 3] }, false)
    await fireEvent.pointerUp(cam, at(4.0, 1.0))
    expect(onmovecamera).toHaveBeenLastCalledWith('Corner', { position: [expect.closeTo(4.0), expect.closeTo(1.0)], target: [1.5, 3] }, true)
    expect(onmovecamera.mock.calls.filter((c) => c[2])).toHaveLength(1)
  })

  it('a click without a move reports no move', async () => {
    stubScreen()
    const onmovecamera = vi.fn()
    render(PlacePlan, { props: { definition, onmovecamera } })
    const cam = screen.getByRole('button', { name: 'Corner, camera' })
    await fireEvent.pointerDown(cam, at(4.6, 0.4))
    await fireEvent.pointerUp(cam, at(4.6, 0.4))
    expect(onmovecamera).not.toHaveBeenCalled()
  })

  // App Lead's live pass (khaos-app#634): a click on the plan wrote a 3D-edit draft nobody
  // dragged, which blocks Build. A press that moves less than a drag threshold is a click.
  it('a click whose pointer moves in place, or jitters a pixel, reports no move', async () => {
    stubScreen()
    const onmovecamera = vi.fn()
    render(PlacePlan, { props: { definition, onmovecamera } })
    const cam = screen.getByRole('button', { name: 'Corner, camera' })
    await fireEvent.pointerDown(cam, { clientX: 460, clientY: -40, button: 0, pointerId: 1 })
    await fireEvent.pointerMove(cam, { clientX: 460, clientY: -40, pointerId: 1 })
    await fireEvent.pointerMove(cam, { clientX: 461, clientY: -41, pointerId: 1 })
    await fireEvent.pointerUp(cam, { clientX: 461, clientY: -41, pointerId: 1 })
    expect(onmovecamera).not.toHaveBeenCalled()
  })

  it('offers the selected camera a target handle that re-aims it', async () => {
    stubScreen()
    const onmovecamera = vi.fn()
    const { container } = render(PlacePlan, { props: { definition, selected: 'Corner', onmovecamera } })
    const handles = container.querySelectorAll('.place-plan__target')
    expect(handles).toHaveLength(1)
    await fireEvent.pointerDown(handles[0], at(corner.target[0], corner.target[1]))
    await fireEvent.pointerMove(handles[0], at(2, 2))
    await fireEvent.pointerUp(handles[0], at(2, 2))
    expect(onmovecamera).toHaveBeenLastCalledWith('Corner', { position: [4.6, 0.4], target: [expect.closeTo(2), expect.closeTo(2)] }, true)
  })

  it('nudges by 0.1 m with the arrow keys: the position, or with Shift the target', async () => {
    const onmovecamera = vi.fn()
    render(PlacePlan, { props: { definition, selected: 'Corner', onmovecamera } })
    const cam = screen.getByRole('button', { name: 'Corner, camera' })
    await fireEvent.keyDown(cam, { key: 'ArrowUp' })
    expect(onmovecamera).toHaveBeenLastCalledWith('Corner', { position: [4.6, expect.closeTo(0.5)], target: [1.5, 3] }, true)
    await fireEvent.keyDown(cam, { key: 'ArrowLeft', shiftKey: true })
    expect(onmovecamera).toHaveBeenLastCalledWith('Corner', { position: [4.6, 0.4], target: [expect.closeTo(1.4), 3] }, true)
  })

  it('without onmovecamera, cameras only select: no handle, no nudge', async () => {
    const onselect = vi.fn()
    const { container } = render(PlacePlan, { props: { definition, selected: 'Corner', onselect } })
    expect(container.querySelector('.place-plan__target')).toBeNull()
    const cam = screen.getByRole('button', { name: 'Corner, camera' })
    await fireEvent.keyDown(cam, { key: 'ArrowUp' })
    await fireEvent.keyDown(cam, { key: 'Enter' })
    expect(onselect).toHaveBeenCalledWith('Corner')
  })
})
