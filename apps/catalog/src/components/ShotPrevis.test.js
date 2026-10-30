import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { Color, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import ShotPrevis from '@khaos-machine/khaotik-ui/components/svelte/ShotPrevis.svelte'
import { createShotScene } from '@khaos-machine/khaotik-ui/components/svelte/lib/shot-scene.js'
import { toGltf } from '@khaos-machine/khaotik-ui/components/svelte/lib/place-scene.js'
import { dolly, orbit } from '@khaos-machine/khaotik-ui/components/svelte/lib/shot-camera.js'
import projection from '../data/shot-conformance/projection.json'
import { blocking, definition, previsShot, ROVER_KEY, twinShot } from '../data/shot-conformance/previs.js'

// jsdom has no WebGL, so only the renderer is stubbed; the loader, scene, parse and transforms are
// three.js's.
vi.mock('three', async (original) => ({
  ...(await original()),
  WebGLRenderer: class {
    render() {}
    setSize() {}
    setPixelRatio() {}
    dispose() {}
  },
}))

const here = dirname(fileURLToPath(import.meta.url))
const glb = (name) => new Uint8Array(readFileSync(resolve(here, '../data/shot-conformance', name)))
const place = glb('place.glb')
const figures = { [ROVER_KEY]: glb('rover.glb') }
const objects = { Crate: glb('crate.glb') }
const [W, H] = projection.resolution

/** Where a world point (kit frame) lands in the guides, through the scene's framed camera. */
function pixel(camera, gltfPoint) {
  const ndc = gltfPoint.clone().project(camera)
  return [((ndc.x + 1) / 2) * W, ((1 - ndc.y) / 2) * H]
}

const gap = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const deg = (r) => (r * 180) / Math.PI

async function shown(shot = blocking) {
  const s = await createShotScene(document.createElement('canvas'), { place, figures, objects })
  s.show(shot, previsShot.models.figures, definition)
  s.frame(shot.camera, W, H)
  return s
}

// The drift guard (shot-kit frame §7.1): the kit's conformance shot, copied in at khaos-previs-kit
// v0.8.0 (data/shot-conformance/README.md), placed from the kit's own models by the blocking's
// transforms alone, projects the head joint and the object corner within 1 px of Blender's.
describe("ShotPrevis's shot, against the kit's projection", () => {
  it("lands Rover's head joint within 1 px of where Blender put it", async () => {
    const s = await shown()
    const nose = s.scene.getObjectByName('Nose').getWorldPosition(new Vector3())
    expect(nose.distanceTo(new Vector3(...toGltf(projection.head.point)))).toBeLessThan(0.001)
    expect(gap(pixel(s.camera(), nose), projection.head.pixel)).toBeLessThanOrEqual(1)
  })

  it("lands the Crate's top front-left corner within 1 px of where Blender put it", async () => {
    const s = await shown()
    // The corner in the object's own frame: its body's [-width/2, -depth/2, height].
    const body = s.scene.getObjectByName('PART_Body')
    const corner = body.parent.parent.localToWorld(new Vector3(...toGltf([-0.3, -0.25, 0.5])))
    expect(corner.distanceTo(new Vector3(...toGltf(projection.corner.point)))).toBeLessThan(0.001)
    expect(gap(pixel(s.camera(), corner), projection.corner.pixel)).toBeLessThanOrEqual(1)
  })

  it("swings the door leaf to the shot's angle, and back to the definition's on a shot that names none", async () => {
    const s = await shown()
    const hinge = s.scene.getObjectByName('FIX_Leaf_Hinge')
    // Wall 1 of Front runs north, so a left hinge's closed leaf points south (-90); the shot
    // opens it 90 into the room: -180.
    expect(Math.abs(Math.cos(hinge.rotation.y - Math.PI))).toBeCloseTo(1, 6)
    s.show({ ...blocking, doors: [] }, previsShot.models.figures, definition)
    expect(deg(hinge.rotation.y)).toBeCloseTo(-90, 6)
  })
})

// The kit's figure is a skinned human (khaos-previs-kit v0.8.0): its meshes draw on its bones, and
// each part carries the tint that shows which way it faces (shot-kit frame §3b).
describe("a skinned figure's instances", () => {
  /** The world centre of a figure's skinned body, from its bones as they stand. */
  function bodyCentre(holder) {
    const body = holder.getObjectByName('FIG_Rover_BodyFront')
    body.computeBoundingBox()
    return body.boundingBox.clone().applyMatrix4(body.matrixWorld).getCenter(new Vector3())
  }

  /** Each figure mesh's material name and colour as the .glb itself gives them, parsed apart from the viewer. */
  async function asBuilt() {
    const own = new Map()
    const gltf = await new GLTFLoader().parseAsync(figures[ROVER_KEY].slice().buffer, '')
    gltf.scene.traverse((o) => o.isMesh && own.set(o.name, { name: o.material.name, color: o.material.color.clone() }))
    expect(own.size).toBeGreaterThan(1)
    return own
  }

  async function twins() {
    const s = await createShotScene(document.createElement('canvas'), { place, figures, objects })
    s.show(twinShot.blocking, twinShot.models.figures, definition)
    const holders = s.scene.children.filter((o) => o.getObjectByName('FIG_Rover_BodyFront'))
    expect(holders).toHaveLength(2)
    return { s, holders }
  }

  /** Relative luminance, in three's linear working space. */
  const luminance = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b

  it('stands two figures of one build key apart, each drawn on its own bones', async () => {
    const { holders } = await twins()
    const shot = twinShot.blocking
    holders.forEach((holder, i) => {
      holder.traverse((o) => {
        if (!o.isSkinnedMesh) return
        for (const bone of o.skeleton.bones) {
          let up = bone
          while (up && up !== holder) up = up.parent
          expect(up, `${o.name}'s bone ${bone.name} is outside its own figure`).toBe(holder)
        }
      })
      const [x, , z] = toGltf(shot.figures[i].position)
      const c = bodyCentre(holder)
      expect(Math.hypot(c.x - x, c.z - z)).toBeLessThan(0.3)
    })
  })

  it('keeps every figure mesh on the material its .glb gave it, while the place and objects stay matte', async () => {
    const s = await shown()
    // No particular colour is asserted, only that an untinted figure is left as loaded.
    for (const [name, built] of await asBuilt()) {
      const mesh = s.scene.getObjectByName(name)
      expect(mesh.material.name, name).toBe(built.name)
      expect(mesh.material.color.getHex(), name).toBe(built.color.getHex())
    }
    const matte = []
    s.scene.getObjectByName('FIX_Leaf_Hinge').traverse((o) => o.isMesh && matte.push(o))
    s.scene.getObjectByName('PART_Body').traverse((o) => o.isMesh && matte.push(o))
    expect(matte.length).toBeGreaterThan(1)
    for (const o of matte) expect(o.material.color.getHex()).toBe(0xd8d6d2)
  })

  // The identity tint is a multiply on each instance's own materials, so the lightness steps that
  // show which way a figure faces survive any tint (ruling of 2026-10-24).
  it("multiplies each instance's materials by its own tint, two of one build key apart, front still lighter than back", async () => {
    const built = await asBuilt()
    const { holders } = await twins()
    holders.forEach((holder, i) => {
      const tint = new Color(twinShot.models.figures[i].tint)
      holder.traverse((o) => {
        if (!o.isMesh) return
        expect(o.material.color.getHex(), `${o.name} in figure ${i}`).toBe(built.get(o.name).color.clone().multiply(tint).getHex())
      })
      const lum = (name) => luminance(holder.getObjectByName(name).material.color)
      expect(lum('FIG_Rover_BodyFront')).toBeGreaterThan(lum('FIG_Rover_BodyBack'))
      expect(lum('FIG_Rover_HeadFront')).toBeGreaterThan(lum('FIG_Rover_HeadBack'))
    })
  })

  it('returns an instance to its materials as built on a shot that tints nothing', async () => {
    const built = await asBuilt()
    const { s, holders } = await twins()
    s.show(blocking, previsShot.models.figures, definition)
    holders[0].traverse((o) => o.isMesh && expect(o.material.color.getHex(), o.name).toBe(built.get(o.name).color.getHex()))
  })
})

describe('a cut', () => {
  afterEach(() => vi.restoreAllMocks())

  it('changes only the camera and transforms, parsing and fetching nothing', async () => {
    const s = await shown()
    const fetch = vi.spyOn(globalThis, 'fetch')
    const parse = vi.spyOn(GLTFLoader.prototype, 'parse')
    const parseAsync = vi.spyOn(GLTFLoader.prototype, 'parseAsync')
    const before = s.camera().position.clone()
    const nose = () => s.scene.getObjectByName('Nose').getWorldPosition(new Vector3())
    const was = nose()
    const next = {
      ...blocking,
      camera: { position: [8.5, 1, 1.5], target: [7, 2, 1], lensMm: 50 },
      figures: blocking.figures.map((f) => ({ ...f, position: [6, 3, 0], facingDegrees: 90 })),
    }
    s.show(next, previsShot.models.figures, definition)
    s.frame(next.camera, W, H)
    expect(fetch).not.toHaveBeenCalled()
    expect(parse).not.toHaveBeenCalled()
    expect(parseAsync).not.toHaveBeenCalled()
    expect(s.camera().position.distanceTo(before)).toBeGreaterThan(1)
    expect(nose().distanceTo(was)).toBeGreaterThan(1)
  })

  it('in the component, reparses nothing when only the shot changes', async () => {
    const scene = { definition, place, figures, objects }
    const view = render(ShotPrevis, { props: { ...scene, shot: previsShot } })
    await waitFor(() => expect(screen.queryByText('Loading the previs…')).toBeNull())
    const fetch = vi.spyOn(globalThis, 'fetch')
    const parseAsync = vi.spyOn(GLTFLoader.prototype, 'parseAsync')
    await view.rerender({ ...scene, shot: { ...previsShot, shotId: 'shot_next', blocking: { ...blocking, id: 'shot_blocking_next', camera: { ...blocking.camera, lensMm: 50 } } } })
    await view.rerender({ ...scene, shot: { ...previsShot, state: 'none', blocking: null, models: null } })
    await view.rerender({ ...scene, shot: previsShot })
    // A reload would show its loading state and parse again; let it finish before looking.
    await waitFor(() => expect(screen.queryByText('Loading the previs…')).toBeNull())
    expect(fetch).not.toHaveBeenCalled()
    expect(parseAsync).not.toHaveBeenCalled()
  })
})

describe('ShotPrevis onload', () => {
  it("reports the scene's node names once, the place's fixtures and the figures' parts, and never again on a cut", async () => {
    const onload = vi.fn()
    const scene = { definition, place, figures, objects, onload }
    const view = render(ShotPrevis, { props: { ...scene, shot: previsShot } })
    await vi.waitFor(() => expect(onload).toHaveBeenCalledOnce())
    const [names] = onload.mock.calls[0]
    expect(names).toContain('FIX_Leaf_Hinge')
    expect(names).toContain('FIG_Rover_HeadFront')
    expect(names).toContain('PART_Body')
    await view.rerender({ ...scene, shot: { ...previsShot, shotId: 'shot_next', blocking: { ...blocking, id: 'shot_blocking_next', camera: { ...blocking.camera, lensMm: 50 } } } })
    await view.rerender({ ...scene, shot: { ...previsShot, state: 'none', blocking: null, models: null } })
    await view.rerender({ ...scene, shot: previsShot })
    await waitFor(() => expect(screen.queryByText('Loading the previs…')).toBeNull())
    expect(onload).toHaveBeenCalledOnce()
  })
})

describe('the shot camera', () => {
  const cam = { position: [0, 0, 1], target: [0, 4, 1], lensMm: 35 }

  it('orbits about the target, keeping its distance and the target', () => {
    const turned = orbit(cam, 90, 0)
    expect(turned.target).toEqual(cam.target)
    expect(turned.position[0]).toBeCloseTo(4, 6)
    expect(turned.position[1]).toBeCloseTo(4, 6)
    expect(turned.position[2]).toBeCloseTo(1, 6)
  })

  it('pitches without passing over the pole', () => {
    const up = orbit(cam, 0, 200)
    const d = up.position.map((v, i) => v - cam.target[i])
    expect(Math.atan2(d[2], Math.hypot(d[0], d[1]))).toBeLessThan(Math.PI / 2)
  })

  it('dollies along the line to the target, never through it', () => {
    expect(dolly(cam, 0.5).position).toEqual([0, 2, 1])
    expect(dolly(cam, 0).position[1]).toBeLessThan(4)
  })
})

describe('ShotPrevis edits', () => {
  async function ready(oncamera) {
    render(ShotPrevis, { props: { shot: previsShot, definition, place, figures, objects, oncamera } })
    await waitFor(() => expect(screen.queryByText('Loading the previs…')).toBeNull())
    return screen.getByRole('application', { name: /previs/i })
  }

  it('emits one camera edit when a drag is released, not one per frame', async () => {
    const oncamera = vi.fn()
    const canvas = await ready(oncamera)
    await fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1, button: 0 })
    for (let x = 110; x <= 160; x += 10) await fireEvent.pointerMove(canvas, { clientX: x, clientY: 100, pointerId: 1 })
    expect(oncamera).not.toHaveBeenCalled()
    await fireEvent.pointerUp(canvas, { clientX: 160, clientY: 100, pointerId: 1 })
    expect(oncamera).toHaveBeenCalledTimes(1)
    const [edit] = oncamera.mock.calls[0]
    expect(edit.target).toEqual(blocking.camera.target)
    expect(edit.lensMm).toBe(blocking.camera.lensMm)
    expect(edit.position).not.toEqual(blocking.camera.position)
  })

  it('dollies on a shift-drag, still once on release', async () => {
    const oncamera = vi.fn()
    const canvas = await ready(oncamera)
    await fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1, button: 0, shiftKey: true })
    for (let y = 90; y >= 40; y -= 10) await fireEvent.pointerMove(canvas, { clientX: 100, clientY: y, pointerId: 1, shiftKey: true })
    await fireEvent.pointerUp(canvas, { clientX: 100, clientY: 40, pointerId: 1 })
    expect(oncamera).toHaveBeenCalledTimes(1)
    const [edit] = oncamera.mock.calls[0]
    const reach = (c) => Math.hypot(...c.position.map((v, i) => v - c.target[i]))
    expect(reach(edit)).toBeLessThan(reach(blocking.camera))
  })

  it('emits nothing for a click that does not move', async () => {
    const oncamera = vi.fn()
    const canvas = await ready(oncamera)
    await fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1, button: 0 })
    await fireEvent.pointerUp(canvas, { clientX: 100, clientY: 100, pointerId: 1 })
    expect(oncamera).not.toHaveBeenCalled()
  })

  it('scrubs the lens live and emits it once, on release', async () => {
    const oncamera = vi.fn()
    await ready(oncamera)
    const lens = screen.getByRole('slider', { name: 'Lens' })
    for (const v of [36, 40, 50]) await fireEvent.input(lens, { target: { value: String(v) } })
    expect(oncamera).not.toHaveBeenCalled()
    expect(screen.getByText('50 mm')).toBeInTheDocument()
    await fireEvent.change(lens, { target: { value: '50' } })
    expect(oncamera).toHaveBeenCalledTimes(1)
    expect(oncamera.mock.calls[0][0]).toEqual({ ...blocking.camera, lensMm: 50 })
  })

  it('turns the camera from the keyboard, one edit per key', async () => {
    const oncamera = vi.fn()
    const canvas = await ready(oncamera)
    await fireEvent.keyDown(canvas, { key: 'ArrowLeft' })
    await fireEvent.keyDown(canvas, { key: 'ArrowLeft' })
    expect(oncamera).toHaveBeenCalledTimes(2)
  })
})

describe('ShotPrevis states', () => {
  it.each([
    ['none', [], "This shot isn't blocked yet."],
    ['waiting', [{ kind: 'placeBuilding', message: 'The place is being built.' }], 'This shot is waiting.'],
    ['stale', [{ kind: 'staleBlocking', message: 'The direction changed.' }], "This shot's blocking is out of date."],
    ['refused', [{ kind: 'visibility', message: 'Rover is visible in the shot but the camera sees none of it.' }], "This shot's blocking didn't pass its check."],
  ])('draws a plain state for a %s shot, with its reasons', (state, reasons, title) => {
    render(ShotPrevis, { props: { shot: { ...previsShot, state, reasons }, definition, place, figures, objects } })
    expect(screen.getByText(title)).toBeInTheDocument()
    for (const r of reasons) expect(screen.getByText(r.message)).toBeInTheDocument()
    expect(screen.queryByRole('slider', { name: 'Lens' })).toBeNull()
  })

  it('says there is no shot without one', () => {
    render(ShotPrevis, { props: { shot: null } })
    expect(screen.getByText('No shot to show.')).toBeInTheDocument()
  })

  it("says the scene's models are missing when the place has none", () => {
    render(ShotPrevis, { props: { shot: previsShot, definition, place: null } })
    expect(screen.getByText("This scene's models aren't loaded.")).toBeInTheDocument()
  })
})
