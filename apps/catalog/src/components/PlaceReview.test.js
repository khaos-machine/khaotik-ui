import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/svelte'
import PlaceReview from '@khaos-machine/khaotik-ui/components/svelte/PlaceReview.svelte'
import conformance from '../data/place-conformance/definition.json'

// jsdom has no WebGL, so only the renderer is stubbed; PlaceViewer's lazy scene still parses the
// real .glb through three.js.
vi.mock('three', async (original) => ({
  ...(await original()),
  WebGLRenderer: class {
    render() {}
    setSize() {}
    setPixelRatio() {}
    dispose() {}
  },
}))

// The kit half of Khaos App's place review screen (place-build plan V-A, viewer frame §6). A
// constructed review-ready revision of the conformance place: its two cameras as sheet panels.
const sheetIds = ['design_revision_interior', 'design_revision_corridor']
const definition = {
  ...conformance,
  id: 'place_definition_01',
  designRevisionIds: sheetIds,
  cameras: conformance.cameras.map((c, i) => ({ ...c, purpose: 'sheetPanel', sheet: { designRevisionId: sheetIds[i], panel: 1 } })),
  panelChecks: [
    { cameraId: 'Corner', verdict: 'matches' },
    { cameraId: 'Back', verdict: 'differs', mismatches: ['The desk is on the wrong wall.'] },
  ],
  review: { state: 'unreviewed', notes: '' },
}

const ready = { advanced: true, definition }

describe('PlaceReview on Basic', () => {
  it('says place building needs Advanced and offers no viewer, plan or review', () => {
    render(PlaceReview, { props: { ...ready, advanced: false, blenderAvailable: true } })
    expect(screen.getByText('Building places needs Advanced.')).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Place plan' })).toBeNull()
    expect(screen.queryByText('No model to show.')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mark as reviewed' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Open in Blender' })).toBeNull()
  })
})

describe('PlaceReview states', () => {
  it('shows loading', () => {
    render(PlaceReview, { props: { advanced: true, loading: true } })
    expect(screen.getByText('Loading the place…')).toBeInTheDocument()
  })

  it('shows an error with its cause', () => {
    render(PlaceReview, { props: { advanced: true, error: 'The place file is missing.' } })
    expect(screen.getByText("This place can't be shown.")).toBeInTheDocument()
    expect(screen.getByText('The place file is missing.')).toBeInTheDocument()
  })

  it('is empty without a definition', () => {
    render(PlaceReview, { props: { advanced: true, definition: null } })
    expect(screen.getByText('This place has no build yet.')).toBeInTheDocument()
  })

  it('groups each whole sheet with its own panel cameras, including repeated panel numbers', () => {
    render(PlaceReview, { props: { ...ready, lineArt: { Corner: 'corner.png' }, sheets: { [sheetIds[0]]: 'interior.png', [sheetIds[1]]: 'corridor.png' }, sheetLabels: { [sheetIds[0]]: 'Sheet 1', [sheetIds[1]]: 'Sheet 2' } } })
    expect(screen.getByRole('group', { name: 'Place plan' })).toBeInTheDocument()
    expect(screen.getByText('No model to show.')).toBeInTheDocument()
    const interior = screen.getByRole('group', { name: `Sheet ${sheetIds[0]}` })
    const corridor = screen.getByRole('group', { name: `Sheet ${sheetIds[1]}` })
    expect(within(interior).getByRole('heading', { name: 'Sheet 1' })).toBeInTheDocument()
    expect(within(corridor).getByRole('heading', { name: 'Sheet 2' })).toBeInTheDocument()
    expect(within(interior).getByRole('img', { name: 'The design sheet' })).toHaveAttribute('src', 'interior.png')
    expect(within(corridor).getByRole('img', { name: 'The design sheet' })).toHaveAttribute('src', 'corridor.png')
    const corner = within(interior).getByRole('group', { name: 'Panel 1, camera Corner' })
    expect(within(corner).getByRole('img', { name: 'Line art from camera Corner' })).toHaveAttribute('src', 'corner.png')
    expect(within(corner).getByText('Matches the sheet')).toBeInTheDocument()
    expect(within(interior).queryByRole('group', { name: 'Panel 1, camera Back' })).toBeNull()
    const back = within(corridor).getByRole('group', { name: 'Panel 1, camera Back' })
    expect(within(back).getByText('No line art yet.')).toBeInTheDocument()
    expect(within(back).getByText('Differs from the sheet')).toBeInTheDocument()
    expect(within(back).getByText('The desk is on the wrong wall.')).toBeInTheDocument()
  })

  it('shows a shared sheet once rather than once per camera', () => {
    const shared = { ...definition, designRevisionIds: [sheetIds[0]], cameras: definition.cameras.map((c, i) => ({ ...c, sheet: { designRevisionId: sheetIds[0], panel: i + 1 } })) }
    render(PlaceReview, { props: { ...ready, definition: shared, sheets: { [sheetIds[0]]: 'interior.png' } } })
    expect(screen.getAllByRole('img', { name: 'The design sheet' })).toHaveLength(1)
    expect(screen.getByRole('group', { name: 'Panel 1, camera Corner' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Panel 2, camera Back' })).toBeInTheDocument()
  })

  it('keeps referenced sheets visible before panel cameras exist', () => {
    render(PlaceReview, { props: { ...ready, definition: { ...definition, cameras: [] }, sheets: { [sheetIds[0]]: 'interior.png', [sheetIds[1]]: 'corridor.png' } } })
    expect(screen.getAllByRole('img', { name: 'The design sheet' })).toHaveLength(2)
  })

  it('reports missing sheets separately and ignores retired per-panel crops', () => {
    render(PlaceReview, { props: { ...ready, sheetPanels: { 1: 'panel1.png', 2: 'panel2.png' } } })
    expect(screen.getAllByText('No sheet image.')).toHaveLength(2)
    expect(screen.queryAllByRole('img').filter((i) => /panel\d\.png$/.test(i.getAttribute('src') ?? ''))).toEqual([])
  })
})

describe("the model's load", () => {
  it('reaches onload with the model the viewer parsed', async () => {
    const model = new Uint8Array(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../data/place-conformance/model.glb')))
    const onload = vi.fn()
    render(PlaceReview, { props: { ...ready, model, onload } })
    await vi.waitFor(() => expect(onload).toHaveBeenCalledOnce())
    expect(onload.mock.calls[0][0].some((/** @type {string} */ n) => n.startsWith('FIX_'))).toBe(true)
  })
})

describe('the conflict notice', () => {
  it('names a stale edit and reloads', async () => {
    const onreload = vi.fn()
    render(PlaceReview, { props: { ...ready, conflict: 'stale', onreload } })
    expect(screen.getByText('This place changed since you opened it. Reload to see the latest version.')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(onreload).toHaveBeenCalledOnce()
  })

  it('names a running build', () => {
    render(PlaceReview, { props: { ...ready, conflict: 'building' } })
    expect(screen.getByText("This place is being built, so it can't change now. Reload when the build finishes.")).toBeInTheDocument()
  })

  it('is absent without a conflict', () => {
    render(PlaceReview, { props: ready })
    expect(screen.queryByRole('button', { name: 'Reload' })).toBeNull()
  })
})

describe('open in Blender', () => {
  it('is hidden when Blender is not available', () => {
    render(PlaceReview, { props: { ...ready, blenderAvailable: false } })
    expect(screen.queryByRole('button', { name: 'Open in Blender' })).toBeNull()
  })

  it('is offered when it is, and reports the intent', async () => {
    const onopenblender = vi.fn()
    render(PlaceReview, { props: { ...ready, blenderAvailable: true, onopenblender } })
    await fireEvent.click(screen.getByRole('button', { name: 'Open in Blender' }))
    expect(onopenblender).toHaveBeenCalledOnce()
  })
})

describe('the review', () => {
  it('records a review with its notes', async () => {
    const onreview = vi.fn()
    render(PlaceReview, { props: { ...ready, onreview } })
    expect(screen.getByText('Not reviewed')).toBeInTheDocument()
    await fireEvent.input(screen.getByLabelText('Notes'), { target: { value: 'The doorway reads well.' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Mark as reviewed' }))
    expect(onreview).toHaveBeenCalledWith('reviewed', 'The doorway reads well.')
    await fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    expect(onreview).toHaveBeenLastCalledWith('rejected', 'The doorway reads well.')
  })

  it('holds the review while edits are unsaved', () => {
    render(PlaceReview, { props: { ...ready, draft: definition } })
    expect(screen.getByRole('button', { name: 'Mark as reviewed' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Save or discard your edits before reviewing.')).toBeInTheDocument()
  })
})

describe('the edit draft', () => {
  it('edits the selected element and reports the whole definition', async () => {
    const onedit = vi.fn()
    render(PlaceReview, { props: { ...ready, selected: 'Doorway', onedit } })
    await fireEvent.input(screen.getByLabelText('width'), { target: { value: '1.1' } })
    const next = onedit.mock.calls[0][0]
    expect(next.openings.find((o) => o.id === 'Doorway').width).toBe(1.1)
    expect({ ...next, openings: definition.openings }).toEqual(definition)
  })

  it('edits one coordinate of a position', async () => {
    const onedit = vi.fn()
    render(PlaceReview, { props: { ...ready, selected: 'Corner', onedit } })
    await fireEvent.input(screen.getByLabelText('position z'), { target: { value: '1.8' } })
    expect(onedit.mock.calls[0][0].cameras[0].position).toEqual([4.6, 0.4, 1.8])
  })

  it('saves or discards a draft', async () => {
    const onsave = vi.fn()
    const onedit = vi.fn()
    render(PlaceReview, { props: { ...ready, draft: definition, onsave, onedit } })
    await fireEvent.click(screen.getByRole('button', { name: 'Save edits' }))
    expect(onsave).toHaveBeenCalledOnce()
    await fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onedit).toHaveBeenCalledWith(null)
  })

  it('offers no save without a draft', () => {
    render(PlaceReview, { props: ready })
    expect(screen.queryByRole('button', { name: 'Save edits' })).toBeNull()
  })
})

// Kit conventions: props are passed to children by name, never spread from an object, and
// three.js reaches PlaceReview only through PlaceViewer's lazy import (D94).
const kit = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../components/svelte')
const source = readFileSync(resolve(kit, 'PlaceReview.svelte'), 'utf8')

describe("PlaceReview's composition", () => {
  it.each(['PlacePlan', 'PlaceViewer'])('passes %s its props by name, never spread', (child) => {
    const tags = source.match(new RegExp(`<${child}\\b[^>]*>`, 'g')) ?? []
    expect(tags.length).toBeGreaterThan(0)
    for (const tag of tags) expect(tag).not.toMatch(/\{\s*\.\.\./)
  })
})

describe('PlaceReview camera moves (khaos-app#588)', () => {
  function stubScreen() {
    vi.stubGlobal('DOMPoint', class {
      constructor(x, y) { this.x = x; this.y = y }
      matrixTransform(m) { return m.apply(this) }
    })
    SVGElement.prototype.getScreenCTM = () => ({ inverse: () => ({ apply: (p) => ({ x: p.x / 100, y: -p.y / 100 }) }) })
  }
  const at = (x, y) => ({ clientX: x * 100, clientY: -y * 100, button: 0, pointerId: 1 })
  const plan = () => within(screen.getByRole('region', { name: 'Plan' }))

  it('draws a drag live and reports it as one edit on release, each z kept', async () => {
    stubScreen()
    const onedit = vi.fn()
    render(PlaceReview, { props: { ...ready, selected: 'Corner', onedit } })
    const cam = plan().getByRole('button', { name: 'Corner, camera' })
    await fireEvent.pointerDown(cam, at(4.6, 0.4))
    await fireEvent.pointerMove(cam, at(4.0, 1.0))
    expect(Number(cam.querySelector('circle').getAttribute('cx'))).toBeCloseTo(4.0)
    expect(onedit).not.toHaveBeenCalled()
    await fireEvent.pointerUp(cam, at(4.0, 1.0))
    expect(onedit).toHaveBeenCalledOnce()
    const moved = onedit.mock.calls[0][0].cameras.find((c) => c.id === 'Corner')
    expect(moved.position).toEqual([4, 1, 1.6])
    expect(moved.target).toEqual([1.5, 3, 0.9])
    expect(definition.cameras.find((c) => c.id === 'Corner').position).toEqual([4.6, 0.4, 1.6])
  })

  it.each([
    ['saving', { saving: true }],
    ['a stale conflict', { conflict: 'stale' }],
    ['a running Build', { conflict: 'building' }],
  ])('holds fields and drags while %s', async (_, lock) => {
    const onedit = vi.fn()
    const { container } = render(PlaceReview, { props: { ...ready, ...lock, selected: 'Corner', onedit } })
    expect(screen.getByLabelText('position x')).toBeDisabled()
    expect(container.querySelector('.place-plan__target')).toBeNull()
    await fireEvent.keyDown(plan().getByRole('button', { name: 'Corner, camera' }), { key: 'ArrowUp' })
    expect(onedit).not.toHaveBeenCalled()
  })

  it('leaves nothing behind when a lock cuts a drag off', async () => {
    stubScreen()
    const onedit = vi.fn()
    const { rerender } = render(PlaceReview, { props: { ...ready, selected: 'Corner', onedit } })
    const cam = plan().getByRole('button', { name: 'Corner, camera' })
    await fireEvent.pointerDown(cam, at(4.6, 0.4))
    await fireEvent.pointerMove(cam, at(4.0, 1.0))
    await rerender({ ...ready, selected: 'Corner', onedit, conflict: 'building' })
    expect(Number(plan().getByRole('button', { name: 'Corner, camera' }).querySelector('circle').getAttribute('cx'))).toBeCloseTo(4.6)
    expect(onedit).not.toHaveBeenCalled()
  })
})
