import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import { Vector3 } from 'three'
import PlaceViewer from '@khaos-machine/khaotik-ui/components/svelte/PlaceViewer.svelte'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createPlaceScene, elementId, fitFrame, placeCamera, toGltf } from '@khaos-machine/khaotik-ui/components/svelte/lib/place-scene.js'
import definition from '../data/place-conformance/definition.json'
import projection from '../data/place-conformance/projection.json'

// jsdom has no WebGL, so only the renderer is stubbed; the loader, scene and parse are three.js's.
vi.mock('three', async (original) => ({
  ...(await original()),
  WebGLRenderer: class {
    render() {}
    setSize() {}
    setPixelRatio() {}
    dispose() {}
  },
}))

// The conformance .glb, as the bytes the app passes after reading it over its byte transport.
const model = new Uint8Array(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../data/place-conformance/model.glb')))

// The viewer frame's §4 acceptance: a fixture corner's pixel in the kit's guides, by Blender's
// own projection (data/place-conformance/projection.json), and in the viewer's projection of the
// same camera differ by at most 1 px at the guides' resolution.

describe("PlaceViewer's camera, against the kit's projection", () => {
  const [W, H] = projection.resolution
  const cam = definition.cameras.find((c) => c.id === projection.camera)

  it('lands the fixture corner within 1 px of where Blender put it', () => {
    const camera = placeCamera(cam, W / H)
    const ndc = new Vector3(...toGltf(projection.point)).project(camera)
    const pixel = [((ndc.x + 1) / 2) * W, ((1 - ndc.y) / 2) * H]
    expect(Math.hypot(pixel[0] - projection.pixel[0], pixel[1] - projection.pixel[1])).toBeLessThanOrEqual(1)
  })

  it('maps the kit frame (z up, y north) to glTF y up', () => {
    expect(toGltf([1, 2, 3])).toEqual([1, 3, -2])
  })

  it('takes the vertical field of view from a 36 mm sensor width and the aspect', () => {
    const camera = placeCamera({ id: 'C', position: [0, 0, 1], target: [0, 1, 1], lensMm: 24 }, 1.5)
    expect(camera.fov).toBeCloseTo((2 * Math.atan(18 / (24 * 1.5)) * 180) / Math.PI, 10)
    expect(camera.aspect).toBe(1.5)
  })
})

describe('the letterbox', () => {
  it('fits the guide aspect inside a wide panel, centred', () => {
    expect(fitFrame(1000, 400, 1.5)).toEqual({ width: 600, height: 400, left: 200, top: 0 })
  })

  it('fits the guide aspect inside a tall panel, centred', () => {
    expect(fitFrame(300, 600, 1.5)).toEqual({ width: 300, height: 200, left: 0, top: 200 })
  })
})

describe('picking maps a glTF node back to a definition element', () => {
  it.each([
    ['ENV_Room', 'Room'],
    ['FIX_Door', 'Door'],
    ['FIX_Door_Hinge', 'Door'],
    ['FIX_Window_Sill', 'Window'],
    ['Scene', ''],
  ])('%s is %s', (name, id) => {
    expect(elementId(name)).toBe(id)
  })
})

// Gap 5 of the viewer's rulings: the kit parses the bytes it is given and fetches nothing. A
// fetch, or a GLTFLoader load of a URL (even a blob: one), on the model path fails here.
describe('the model is parsed from bytes, never fetched', () => {
  afterEach(() => vi.restoreAllMocks())

  /** @param {Uint8Array} bytes */
  async function loadWithoutFetching(bytes) {
    const fetch = vi.spyOn(globalThis, 'fetch')
    const load = vi.spyOn(GLTFLoader.prototype, 'load')
    const loadAsync = vi.spyOn(GLTFLoader.prototype, 'loadAsync')
    const scene = await createPlaceScene(document.createElement('canvas'), bytes)
    expect(fetch).not.toHaveBeenCalled()
    expect(load).not.toHaveBeenCalled()
    expect(loadAsync).not.toHaveBeenCalled()
    return scene.names()
  }

  it('loads the conformance .glb from its bytes', async () => {
    const names = await loadWithoutFetching(model)
    expect(names.filter((n) => n.startsWith('FIX_')).length).toBeGreaterThan(0)
  })

  it('reads only the view, not the whole buffer under it', async () => {
    const padded = new Uint8Array(model.byteLength + 16)
    padded.set(model, 8)
    expect(await loadWithoutFetching(padded.subarray(8, 8 + model.byteLength))).toEqual(await loadWithoutFetching(model))
  })
})

describe('PlaceViewer', () => {
  it('says there is no model without one', () => {
    render(PlaceViewer, { props: { definition, model: null } })
    expect(screen.getByText('No model to show.')).toBeInTheDocument()
  })

  it('says a camera the definition does not hold is unknown', () => {
    render(PlaceViewer, { props: { definition, model, camera: 'Nowhere' } })
    expect(screen.getByText('This place has no camera Nowhere.')).toBeInTheDocument()
  })
})
