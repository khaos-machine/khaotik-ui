// The Composer previs's three.js half (shot-kit frame §7.1, §7.2). It imports three.js, so
// ShotPrevis loads it by dynamic import and three.js never enters a host's first chunk.
//
// One scene's models are parsed once: the place, every figure by its build key and every floor
// object by its definition. A cut is then only a camera and transforms (show), with no parse and
// no fetch. Each placed part is a rigid transform of a loaded model, never a build: a figure is
// built at the origin facing 0 and an object with its base centre at the origin, so a blocking
// position is a translation (kit (x, y, z) is glTF (x, z, -y)) and a turn about kit +z is a turn
// about glTF +y by the same angle, counter-clockwise seen from above.
import { AmbientLight, Color, DirectionalLight, DoubleSide, Group, Mesh, MeshStandardMaterial, Scene, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { placeCamera, toGltf } from './place-scene.js'
import { hingeYaw } from './place-plan.js'

export { fitFrame } from './place-scene.js'

const rad = (/** @type {number} */ deg) => (deg * Math.PI) / 180

/**
 * @typedef {{ kind: string, id: string }} VisualSubject
 * @typedef {{ position: number[], target: number[], lensMm: number }} ShotCamera
 * @typedef {{ subject: VisualSubject, position: number[], facingDegrees: number, pose: string, heightM: number, hands?: { left?: number[], right?: number[] }, lookAt?: number[] }} ShotFigure
 * @typedef {{ position: number[], rotationZ: number }} FloorPlacement
 * @typedef {{ subject: VisualSubject, objectDefinitionId: string, placement: { floor?: FloorPlacement, held?: { figure: VisualSubject, hand: string } } }} ShotObject
 * @typedef {Object} ShotBlocking A shot's head blocking, as KSPD stores it (RFC 0115 §2).
 * @property {string} id
 * @property {{ width: number, height: number }} frame
 * @property {ShotCamera} camera
 * @property {ShotFigure[]} figures
 * @property {ShotObject[]} objects
 * @property {{ fixture: string, swingDegrees: number }[]} doors
 * @typedef {{ subject: VisualSubject, buildKey: string, tint?: string }} ShotFigureModel A figure's model in the previs read; tint is
 *   its identity colour (sRGB hex), multiplied into the figure's own materials.
 * @typedef {Object} PrevisShot One shot of khaosd's `GET /api/v1/composer/previs` read.
 * @property {string} shotId
 * @property {'blocked' | 'refused' | 'stale' | 'none' | 'waiting'} state
 * @property {{ kind: string, message: string }[]} [reasons]
 * @property {ShotBlocking | null} blocking
 * @property {{ figures: ShotFigureModel[] } | null} models
 */

/**
 * Stands a figure's model where the blocking puts it: its feet at position, turned facingDegrees.
 * @param {import('three').Object3D} node @param {{ position: number[], facingDegrees: number }} figure
 */
export function placeFigure(node, figure) {
  node.position.set(...toGltf(figure.position))
  node.rotation.set(0, rad(figure.facingDegrees), 0)
  node.updateMatrixWorld(true)
}

/**
 * Stands a floor object's model where the blocking puts it: its base centre at position, turned
 * rotationZ.
 * @param {import('three').Object3D} node @param {FloorPlacement} floor
 */
export function placeFloorObject(node, floor) {
  node.position.set(...toGltf(floor.position))
  node.rotation.set(0, rad(floor.rotationZ), 0)
  node.updateMatrixWorld(true)
}

/** @param {Uint8Array} bytes */
const parse = (bytes) => new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')

const sameSubject = (/** @type {VisualSubject} */ a, /** @type {VisualSubject} */ b) => a.kind === b.kind && a.id === b.id

/**
 * A viewer for one scene's previs, drawing into canvas. Every model is parsed here, from the
 * bytes the host read; nothing is fetched. It renders on demand: after a show or a frame.
 * @param {HTMLCanvasElement} canvas
 * @param {{ place: Uint8Array, figures: Record<string, Uint8Array>, objects: Record<string, Uint8Array> }} models
 *   The place's .glb, each figure's by build key, and each floor object's by object definition id.
 */
export async function createShotScene(canvas, models) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  const scene = new Scene()
  scene.add(new AmbientLight(0xffffff, 1.2))
  const sun = new DirectionalLight(0xffffff, 1.6)
  sun.position.set(3, 8, 5)
  scene.add(sun)
  // The kit's place and object .glbs carry no materials; as in the place viewer, each of their
  // meshes gets one plain matte, double-sided material. A figure keeps its own: its parts' tones
  // show which way it and its head face (shot-kit frame §3b).
  const matte = new MeshStandardMaterial({ color: 0xd8d6d2, metalness: 0, roughness: 0.9, side: DoubleSide })
  /** @param {import('three').Object3D} root */
  const matteAll = (root) => root.traverse((o) => o instanceof Mesh && (o.material = matte))

  const [place, figures, objects] = await Promise.all([
    parse(models.place),
    Promise.all(Object.entries(models.figures).map(async ([key, bytes]) => /** @type {const} */ ([key, (await parse(bytes)).scene]))),
    Promise.all(Object.entries(models.objects).map(async ([key, bytes]) => /** @type {const} */ ([key, (await parse(bytes)).scene]))),
  ])
  matteAll(place.scene)
  objects.forEach(([, model]) => matteAll(model))
  scene.add(place.scene)

  // Each figure instance owns its materials, so it can carry its own identity tint: a multiply of
  // each part's colour as built, never a replace, so the parts' lightness steps survive any tint
  // (ruling of 2026-10-24). The kit gives each part one material. A later instance is cloned from
  // the first, which may already be tinted, so the colour as built travels with the clone.
  /** @param {import('three').Object3D} model */
  const ownMaterials = (model) =>
    model.traverse((o) => {
      if (!(o instanceof Mesh)) return
      const built = new Color().copy(o.material.userData.built ?? o.material.color)
      o.material = o.material.clone()
      o.material.userData.built = built
    })
  const white = new Color(1, 1, 1)
  /** @param {import('three').Object3D} node @param {string | undefined} tint */
  const tintFigure = (node, tint) => {
    const by = tint ? new Color(tint) : white
    node.traverse((o) => o instanceof Mesh && o.material.color.copy(o.material.userData.built).multiply(by))
  }

  // A model may stand in a shot more than once (two figures of one build key, two crates of one
  // definition), so each use takes its own instance: a clone sharing the parsed geometry and
  // materials. SkeletonUtils' clone binds a skinned figure's meshes to the clone's own bones, where
  // a plain clone would draw them on the source's.
  /** @param {Map<string, import('three').Object3D>} sources @param {(model: import('three').Object3D) => void} [prepare] */
  const pool = (sources, prepare) => {
    /** @type {Map<string, Group[]>} */
    const made = new Map()
    return {
      /** @param {string} key @param {number} n */
      take(key, n) {
        const source = sources.get(key)
        if (!source) return null
        const list = made.get(key) ?? []
        made.set(key, list)
        while (list.length <= n) {
          const holder = new Group()
          const model = list.length === 0 ? source : clone(source)
          prepare?.(model)
          holder.add(model)
          scene.add(holder)
          list.push(holder)
        }
        return list[n]
      },
      hideAll: () => made.forEach((list) => list.forEach((g) => (g.visible = false))),
    }
  }
  const figurePool = pool(new Map(figures), ownMaterials)
  const objectPool = pool(new Map(objects))

  /** @type {import('three').PerspectiveCamera | null} */
  let camera = null
  const draw = () => camera && renderer.render(scene, camera)

  return {
    /** The three.js scene, for inspection. */
    scene,
    /** The camera last framed, or null. */
    camera: () => camera,
    /** Every node name in the loaded place, figure and object scenes, as the place viewer's names(). */
    names: () => {
      /** @type {string[]} */
      const out = []
      for (const root of [place.scene, ...figures.map(([, s]) => s), ...objects.map(([, s]) => s)]) root.traverse((o) => o.name && out.push(o.name))
      return out
    },
    /**
     * Shows one shot: each figure and floor object at its transform, and every door leaf at the
     * shot's swing, or the definition's where the shot names none. Nothing is parsed or fetched.
     * @param {ShotBlocking} blocking
     * @param {ShotFigureModel[]} figureModels Each figure's build key and tint, from the previs read.
     * @param {import('./place-plan.js').PlaceDefinition} definition The place the blocking names.
     */
    show(blocking, figureModels, definition) {
      figurePool.hideAll()
      objectPool.hideAll()
      /** @type {Map<string, number>} */
      const used = new Map()
      /** @param {string} key */
      const nth = (key) => {
        const n = used.get(key) ?? 0
        used.set(key, n + 1)
        return n
      }
      for (const figure of blocking.figures) {
        const model = figureModels.find((m) => sameSubject(m.subject, figure.subject))
        const key = model?.buildKey ?? ''
        const node = figurePool.take(key, nth(`f:${key}`))
        if (!node) continue
        placeFigure(node, figure)
        tintFigure(node, model?.tint)
        node.visible = true
      }
      for (const object of blocking.objects) {
        if (!object.placement.floor) continue // a held object is inside its figure's model
        const node = objectPool.take(object.objectDefinitionId, nth(`o:${object.objectDefinitionId}`))
        if (!node) continue
        placeFloorObject(node, object.placement.floor)
        node.visible = true
      }
      for (const leaf of definition.fixtures.filter((f) => f.kind === 'doorLeaf')) {
        const hinge = place.scene.getObjectByName(`FIX_${leaf.id}_Hinge`)
        if (!hinge) continue
        const swing = blocking.doors.find((d) => d.fixture === leaf.id)?.swingDegrees ?? leaf.swingDegrees
        hinge.rotation.set(0, hingeYaw(definition, leaf.id, swing), 0)
      }
      scene.updateMatrixWorld(true)
      draw()
    },
    /**
     * Frames the shot camera into a canvas of width by height CSS pixels.
     * @param {ShotCamera} cam @param {number} width @param {number} height
     */
    frame(cam, width, height) {
      renderer.setPixelRatio(globalThis.devicePixelRatio ?? 1)
      renderer.setSize(width, height, false)
      camera = placeCamera(cam, width / height)
      draw()
    },
    dispose() {
      renderer.dispose()
    },
  }
}
