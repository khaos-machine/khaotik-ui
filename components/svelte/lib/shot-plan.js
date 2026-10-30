// The shot plan's maths (shot-kit frame §7.3): a figure's facing, a floor object's footprint, and
// a pointer mapped into the plan. The conventions are RFC 0115's and the kit's: metres, +z up,
// +y north; at facing 0 a figure's front faces -y, and facing turns it counter-clockwise seen from
// above, as a place fixture's rotationZ does. ShotPlan.test.js holds them to the kit's
// conformance shot.

/** @typedef {[number, number]} Point2 */

const rad = (/** @type {number} */ deg) => (deg * Math.PI) / 180
/** @param {number} v */
const round = (v) => Math.round(v * 1e6) / 1e6 + 0

/** RFC 0115's pose enum, in its order, with the labels a storyteller reads. */
export const POSES = [
  { value: 'stand', label: 'Standing' },
  { value: 'walk', label: 'Walking' },
  { value: 'sit', label: 'Sitting' },
  { value: 'crouch', label: 'Crouching' },
  { value: 'kneel', label: 'Kneeling' },
  { value: 'lie', label: 'Lying down' },
  { value: 'lean', label: 'Leaning' },
]

/**
 * The unit vector a figure faces at facingDegrees: -y at 0, turned counter-clockwise.
 * @param {number} facingDegrees
 * @returns {Point2}
 */
export function facingVector(facingDegrees) {
  const a = rad(facingDegrees)
  return [Math.sin(a), -Math.cos(a)]
}

/**
 * The facing, in degrees in (-180, 180], of a figure looking along (dx, dy).
 * @param {number} dx @param {number} dy
 */
export function facingOf(dx, dy) {
  return round((Math.atan2(dx, -dy) * 180) / Math.PI)
}

/**
 * A floor object's top-down footprint: the four corners of the rectangle around its parts in the
 * object's own frame, turned by rotationZ and stood at position.
 * ponytail: a part's X and Y tilt are ignored, as the plan draws only its turn about z; a tilted
 * part's true extent needs the kit's built footprint.
 * @param {{ parts: { size: number[], position: number[], rotationDegrees: number[] }[] }} object
 * @param {{ position: number[], rotationZ: number }} floor
 * @returns {Point2[]}
 */
export function objectFootprint(object, floor) {
  const corners = object.parts.flatMap((p) => {
    const turn = rad(p.rotationDegrees[2])
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
      const x = (sx * p.size[0]) / 2
      const y = (sy * p.size[1]) / 2
      return [p.position[0] + x * Math.cos(turn) - y * Math.sin(turn), p.position[1] + x * Math.sin(turn) + y * Math.cos(turn)]
    })
  })
  const xs = corners.map((c) => c[0])
  const ys = corners.map((c) => c[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const turn = rad(floor.rotationZ)
  return /** @type {Point2[]} */ ([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]).map(([x, y]) => [
    floor.position[0] + x * Math.cos(turn) - y * Math.sin(turn),
    floor.position[1] + x * Math.sin(turn) + y * Math.cos(turn),
  ])
}

/**
 * A pointer's client position as a plan point. The plan's SVG fits its viewBox inside its box,
 * centred (the default xMidYMid meet), and draws +y north, so SVG y is the plan's -y.
 * @param {{ left: number, top: number, width: number, height: number }} rect The SVG's box.
 * @param {number[]} viewBox [x, y, width, height].
 * @param {number} clientX @param {number} clientY
 * @returns {Point2}
 */
export function clientToPlan(rect, viewBox, clientX, clientY) {
  const [vx, vy, vw, vh] = viewBox
  const scale = Math.min(rect.width / vw, rect.height / vh)
  const left = rect.left + (rect.width - vw * scale) / 2
  const top = rect.top + (rect.height - vh * scale) / 2
  return [round(vx + (clientX - left) / scale), round(-(vy + (clientY - top) / scale))]
}
