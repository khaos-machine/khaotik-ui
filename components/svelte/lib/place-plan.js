// The top-down plan of a place definition, from the definition's own numbers (place viewer
// frame §3). The placement conventions are the kit's (khaos-previs-kit place/py/place_structure.py
// and place_fixtures.py): metres, +z up, +y north; an outline is counter-clockwise, edge i runs
// from vertex i to vertex i+1 with the room on its left; `offset` is to an element's centre;
// `size` is [width, depth, height] turned by `rotationZ` degrees counter-clockwise.
//
// This is a second implementation of those conventions, so PlacePlan.test.js holds every
// footprint to the kit's build report within 1 cm. A convention changed on one side turns it red.

/** @typedef {[number, number]} Point2 */

/**
 * @typedef {Object} PlaceDefinition
 * @property {string} [location]
 * @property {{ id: string, outline: Point2[], height: number, ceiling: boolean }[]} rooms
 * @property {{ id: string, room: string, wall: number, offset: number, width: number, height: number, sill: number, kind: string }[]} openings
 * @property {any[]} fixtures
 * @property {{ id: string, position: number[], target: number[], lensMm: number }[]} cameras
 */

// The kit's leaf thickness, every style's (place_fixtures.py LEAF_DEPTH).
const LEAF_DEPTH = 0.05
// The hinge knuckles are 0.04 boxes centred on the hinge edge, so the leaf reaches 0.02 past it.
const KNUCKLE = 0.02
// A window's parts across the wall, along its inward normal (place_fixtures.py _window): the
// glass 0.01 thick centred 0.06 behind the wall; mullions 0.04 thick and round bars r 0.012,
// both centred 0.03 into the room; the sill 0.25 deep centred 0.12 into the room and 0.2
// longer than the opening is wide.
const GLASS_BACK = -0.065
const GLASS_FRONT = -0.055
const MULLION_FRONT = 0.05
const BAR_FRONT = 0.042
const SILL_FRONT = 0.12 + 0.25 / 2
const SILL_OVERHANG = 0.2

const rad = (/** @type {number} */ deg) => (deg * Math.PI) / 180

/** @param {Point2} p @param {number} angle @returns {Point2} */
const turn = (p, angle) => [p[0] * Math.cos(angle) - p[1] * Math.sin(angle), p[0] * Math.sin(angle) + p[1] * Math.cos(angle)]

/**
 * Edge i of a room: start a and unit direction t. Its inward normal, t turned left, is the
 * local +y of every frame turned to t's angle (`rect`).
 * @param {PlaceDefinition} definition @param {string} roomId @param {number} i
 */
function wall(definition, roomId, i) {
  const room = definition.rooms.find((r) => r.id === roomId)
  if (!room) throw new Error(`This place has no room ${roomId}.`)
  const a = room.outline[i]
  const b = room.outline[(i + 1) % room.outline.length]
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])
  /** @type {Point2} */
  const t = [(b[0] - a[0]) / length, (b[1] - a[1]) / length]
  return { a, t, /** @param {number} u @returns {Point2} */ point: (u) => [a[0] + t[0] * u, a[1] + t[1] * u] }
}

/** @param {PlaceDefinition} definition @param {string} id */
function opening(definition, id) {
  const o = definition.openings.find((x) => x.id === id)
  if (!o) throw new Error(`This place has no opening ${id}.`)
  return { o, w: wall(definition, o.room, o.wall) }
}

/** @param {PlaceDefinition} definition @param {string} id */
function fixture(definition, id) {
  const f = definition.fixtures.find((x) => x.id === id)
  if (!f) throw new Error(`This place has no fixture ${id}.`)
  return f
}

/**
 * The rectangle [x0, x1] by [y0, y1] in a frame at origin turned by angle (radians).
 * @param {Point2} origin @param {number} angle @param {number} x0 @param {number} x1 @param {number} y0 @param {number} y1
 * @returns {Point2[]}
 */
function rect(origin, angle, x0, x1, y0, y1) {
  return /** @type {Point2[]} */ ([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]).map((p) => {
    const q = turn(p, angle)
    return [origin[0] + q[0], origin[1] + q[1]]
  })
}

/**
 * A door leaf's pivot (place_fixtures.py hinge_pose): on the hinge jamb at the opening's foot,
 * its closed yaw from hinge edge to free edge, and its swing. A left hinge is the jamb toward
 * the wall's end; a positive swing opens into the room on either hand.
 * @param {PlaceDefinition} definition @param {any} leaf
 */
function pivot(definition, leaf) {
  const { o, w } = opening(definition, leaf.opening)
  const sigma = leaf.hinge === 'left' ? -1 : 1
  const hinge = w.point(o.offset - (sigma * o.width) / 2)
  const closed = Math.atan2(w.t[1] * sigma, w.t[0] * sigma)
  return { sigma, hinge, closed, open: closed + rad(sigma * leaf.swingDegrees), width: o.width }
}

/**
 * A door leaf's yaw about +z at a given swing, in radians from +x: its pivot's closed yaw turned by
 * the swing on the leaf's hinge side. A shot blocking's `doors` set a leaf's swing for that shot;
 * the kit's .glb turns the pivot FIX_<id>_Hinge to this yaw.
 * @param {PlaceDefinition} definition @param {string} id @param {number} swingDegrees
 */
export function hingeYaw(definition, id, swingDegrees) {
  return pivot(definition, { ...fixture(definition, id), swingDegrees }).open
}

/**
 * A fixture's top-down footprint: the four corners of the smallest rectangle around it and all
 * its parts, as the kit's build report measures it.
 * @param {PlaceDefinition} definition
 * @param {string} id
 * @returns {Point2[]}
 */
export function footprint(definition, id) {
  const f = fixture(definition, id)
  if (f.kind === 'doorLeaf') {
    // In the pivot's axes the leaf runs along +x from its hinge edge, its inner face on y = 0
    // and its body behind that face, away from the room.
    const p = pivot(definition, f)
    return rect(p.hinge, p.open, -KNUCKLE, p.width, 0, -p.sigma * LEAF_DEPTH)
  }
  if (f.kind === 'window') {
    const { o, w } = opening(definition, f.opening)
    const grid = f.gridColumns > 1 || f.gridRows > 1
    const front = f.sill ? SILL_FRONT : grid ? MULLION_FRONT : f.bars > 0 ? BAR_FRONT : GLASS_FRONT
    const half = (o.width + (f.sill ? SILL_OVERHANG : 0)) / 2
    return rect(w.point(o.offset), Math.atan2(w.t[1], w.t[0]), -half, half, GLASS_BACK, front)
  }
  const [width, depth] = f.size
  const m = f.mount
  if (m.floor) {
    return rect([m.floor.position[0], m.floor.position[1]], rad(m.floor.rotationZ), -width / 2, width / 2, -depth / 2, depth / 2)
  }
  if (m.wall) {
    // The back sits `standoff` into the room from the wall, the width along it.
    const w = wall(definition, m.wall.room, m.wall.wall)
    const c = w.point(m.wall.offset)
    const angle = Math.atan2(w.t[1], w.t[0])
    return rect(c, angle, -width / 2, width / 2, m.wall.standoff, m.wall.standoff + depth)
  }
  if (m.leaf) {
    // The back is centred on the named face at (u, v); the front points away from it
    // (place_structure.py leaf_hardware_pose). The inner face is y = 0, the outer
    // y = -sigma * leaf depth.
    const p = pivot(definition, fixture(definition, m.leaf.fixture))
    const inner = m.leaf.face === 'inner'
    const plane = inner ? 0 : -p.sigma * LEAF_DEPTH
    const front = inner ? p.sigma : -p.sigma
    const y = [plane, plane + front * depth].sort((a, b) => a - b)
    return rect(p.hinge, p.open, m.leaf.u - width / 2, m.leaf.u + width / 2, y[0], y[1])
  }
  throw new Error(`Fixture ${id} has no mount the plan knows.`)
}

/**
 * A camera's top-down lens cone: its position, and the two edges of the horizontal field of view
 * of a 36 mm sensor width toward its target. The edges are a fixed 1 m long: the cone shows where
 * the camera looks, not how far it sees.
 * @param {{ position: number[], target: number[], lensMm: number }} c
 */
export function lensCone(c) {
  const half = Math.atan(18 / c.lensMm)
  const aim = Math.atan2(c.target[1] - c.position[1], c.target[0] - c.position[0])
  const reach = 1
  /** @param {number} angle @returns {Point2} */
  const ray = (angle) => [c.position[0] + reach * Math.cos(angle), c.position[1] + reach * Math.sin(angle)]
  /** @type {Point2} */
  const position = [c.position[0], c.position[1]]
  return { position, left: ray(aim + half), right: ray(aim - half) }
}

/**
 * A copy of the definition with one camera moved on the plan: x and y of its position and its
 * target as given, to the centimetre, each z kept. The definition itself is not changed.
 * @template {PlaceDefinition} D
 * @param {D} definition
 * @param {string} id
 * @param {{ position: number[], target: number[] }} pose The plan pose, x and y in metres.
 * @returns {D}
 */
export function moveCamera(definition, id, pose) {
  const next = structuredClone(definition)
  const camera = next.cameras.find((c) => c.id === id)
  if (!camera) throw new Error(`This place has no camera ${id}.`)
  /** @param {number} n */
  const cm = (n) => Math.round(n * 100) / 100
  camera.position = [cm(pose.position[0]), cm(pose.position[1]), camera.position[2]]
  camera.target = [cm(pose.target[0]), cm(pose.target[1]), camera.target[2]]
  return next
}

/**
 * Everything PlacePlan draws, in the definition's frame.
 * @param {PlaceDefinition} definition
 */
export function planOf(definition) {
  const rooms = definition.rooms.map((r) => ({ id: r.id, points: r.outline }))
  const openings = definition.openings.map((o) => {
    const w = wall(definition, o.room, o.wall)
    return { id: o.id, kind: o.kind, a: w.point(o.offset - o.width / 2), b: w.point(o.offset + o.width / 2) }
  })
  const fixtures = definition.fixtures.map((f) => ({ id: f.id, kind: f.kind, points: footprint(definition, f.id) }))
  const swings = definition.fixtures
    .filter((f) => f.kind === 'doorLeaf')
    .map((f) => {
      const p = pivot(definition, f)
      /** @param {number} angle @returns {Point2} */
      const edge = (angle) => [p.hinge[0] + p.width * Math.cos(angle), p.hinge[1] + p.width * Math.sin(angle)]
      return { id: f.id, hinge: p.hinge, radius: p.width, closed: edge(p.closed), open: edge(p.open), clockwise: p.sigma * f.swingDegrees < 0 }
    })
  const cameras = definition.cameras.map((c) => ({ id: c.id, ...lensCone(c), target: /** @type {Point2} */ ([c.target[0], c.target[1]]) }))
  const xs = [...rooms.flatMap((r) => r.points.map((p) => p[0])), ...cameras.map((c) => c.position[0])]
  const ys = [...rooms.flatMap((r) => r.points.map((p) => p[1])), ...cameras.map((c) => c.position[1])]
  const bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
  return { rooms, openings, fixtures, swings, cameras, bounds }
}
