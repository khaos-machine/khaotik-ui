// The place viewer's three.js half (place viewer frame §4). It imports three.js, so PlaceViewer
// loads it by dynamic import and three.js never enters a host's first chunk.
//
// The kit's frame is metres, +z up and +y north; the kit's .glb is glTF, +y up. A kit point
// (x, y, z) is glTF (x, z, -y). Cameras are not in the .glb: each is built from the definition,
// on a 36 mm sensor width (the kit pins Blender's sensor fit to horizontal), looking at its
// target with world up, which is the kit's to_track_quat('-Z', 'Y').
import { AmbientLight, DirectionalLight, DoubleSide, Mesh, MeshStandardMaterial, PerspectiveCamera, Raycaster, Scene, Vector2, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * A kit point in glTF axes.
 * @param {number[]} p
 * @returns {[number, number, number]}
 */
export const toGltf = (p) => [p[0], p[2], -p[1]]

/**
 * A place camera, framed for a guide of aspect width / height: horizontal field of view
 * 2 atan(18 / lensMm), so three.js's vertical one is 2 atan(18 / (lensMm * aspect)).
 * @param {{ position: number[], target: number[], lensMm: number }} cam
 * @param {number} aspect
 */
export function placeCamera(cam, aspect) {
  const fov = (2 * Math.atan(18 / (cam.lensMm * aspect)) * 180) / Math.PI
  const camera = new PerspectiveCamera(fov, aspect, 0.05, 500)
  camera.position.set(...toGltf(cam.position))
  camera.up.set(0, 1, 0)
  camera.lookAt(new Vector3(...toGltf(cam.target)))
  camera.updateMatrixWorld()
  return camera
}

/**
 * The largest frame of aspect width / height inside a panel, centred: the letterbox. The rest
 * of the panel is the passepartout; the frame is never stretched.
 * @param {number} width @param {number} height @param {number} aspect
 */
export function fitFrame(width, height, aspect) {
  const w = Math.min(width, height * aspect)
  const h = w / aspect
  return { width: w, height: h, left: (width - w) / 2, top: (height - h) / 2 }
}

/**
 * The definition element a glTF node belongs to: ENV_<id>, FIX_<id> and FIX_<id>_<part> (kit
 * IDs hold no underscore), or '' for anything else.
 * @param {string} name
 */
export function elementId(name) {
  const m = /^(?:ENV|FIX)_([^_]+)/.exec(name)
  return m ? m[1] : ''
}

/**
 * A viewer drawing the .glb in model into canvas. It renders on demand, not every frame: after
 * the model loads and whenever the camera or size changes. The bytes are parsed, never fetched:
 * the host reads them (Khaos App over its byte transport), so the kit makes no request and needs
 * no URL. No Draco or KTX2 loader is registered; the kit's .glb uses neither and holds no images.
 * @param {HTMLCanvasElement} canvas
 * @param {Uint8Array} model
 */
export async function createPlaceScene(canvas, model) {
  // Transparent, so the canvas's own background (a token) shows behind the model.
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  const scene = new Scene()
  scene.add(new AmbientLight(0xffffff, 1.2))
  const sun = new DirectionalLight(0xffffff, 1.6)
  sun.position.set(3, 8, 5)
  scene.add(sun)
  // Only the view's bytes: a Uint8Array may sit at an offset inside a larger buffer.
  const gltf = await new GLTFLoader().parseAsync(model.buffer.slice(model.byteOffset, model.byteOffset + model.byteLength), '')
  // The kit's .glb carries no materials, and glTF's default material is fully metallic, which
  // lights nothing but highlights. Each mesh gets a plain matte one. Blender draws both sides of
  // a face and the kit relies on it (a ceiling's winding faces out of the room), so it is
  // double-sided.
  const matte = new MeshStandardMaterial({ color: 0xd8d6d2, metalness: 0, roughness: 0.9, side: DoubleSide })
  gltf.scene.traverse((o) => {
    if (o instanceof Mesh) o.material = matte
  })
  scene.add(gltf.scene)
  /** @type {PerspectiveCamera | null} */
  let camera = null
  const draw = () => camera && renderer.render(scene, camera)
  return {
    /** The loaded scene's node names. */
    names: () => {
      /** @type {string[]} */
      const out = []
      gltf.scene.traverse((o) => o.name && out.push(o.name))
      return out
    },
    /**
     * Frames cam into a canvas of width by height CSS pixels.
     * @param {{ position: number[], target: number[], lensMm: number }} cam @param {number} width @param {number} height
     */
    frame(cam, width, height) {
      renderer.setPixelRatio(globalThis.devicePixelRatio ?? 1)
      renderer.setSize(width, height, false)
      camera = placeCamera(cam, width / height)
      draw()
    },
    /**
     * The element under a canvas point, in CSS pixels from its top left, or ''.
     * @param {number} x @param {number} y @param {number} width @param {number} height
     */
    pick(x, y, width, height) {
      if (!camera) return ''
      const ray = new Raycaster()
      ray.setFromCamera(new Vector2((x / width) * 2 - 1, 1 - (y / height) * 2), camera)
      for (const hit of ray.intersectObject(gltf.scene, true)) {
        for (let o = /** @type {import('three').Object3D | null} */ (hit.object); o; o = o.parent) {
          const id = elementId(o.name)
          if (id) return id
        }
      }
      return ''
    },
    dispose() {
      renderer.dispose()
    },
  }
}
