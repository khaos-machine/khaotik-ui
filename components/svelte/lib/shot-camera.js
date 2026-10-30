// The shot camera's controls (shot-kit frame §7.3): orbit about the target, dolly along the line
// to it, and the lens. Plain numbers in the place frame (metres, +z up), so they need no three.js
// and every result is a whole camera a blocking can carry.

/** @typedef {{ position: number[], target: number[], lensMm: number }} ShotCamera */

const rad = (/** @type {number} */ deg) => (deg * Math.PI) / 180
// The camera never passes over the pole: straight up or down has no defined turn.
const PITCH_LIMIT = rad(89)
// Nor reaches its target: a camera on its target looks nowhere (RFC 0115 refuses it).
const MIN_REACH = 0.1

/** @param {number} v */
const round = (v) => Math.round(v * 1e6) / 1e6

/**
 * The camera turned about its target: yawDegrees counter-clockwise seen from above, then
 * pitchDegrees up, its distance unchanged.
 * @param {ShotCamera} cam @param {number} yawDegrees @param {number} pitchDegrees
 * @returns {ShotCamera}
 */
export function orbit(cam, yawDegrees, pitchDegrees) {
  const [dx, dy, dz] = cam.position.map((v, i) => v - cam.target[i])
  const reach = Math.hypot(dx, dy, dz)
  const yaw = Math.atan2(dy, dx) + rad(yawDegrees)
  const pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, Math.atan2(dz, Math.hypot(dx, dy)) + rad(pitchDegrees)))
  const flat = reach * Math.cos(pitch)
  const t = cam.target
  return { ...cam, position: [t[0] + flat * Math.cos(yaw), t[1] + flat * Math.sin(yaw), t[2] + reach * Math.sin(pitch)].map(round) }
}

/**
 * The camera moved along the line to its target, its distance times factor (below 1 is closer).
 * @param {ShotCamera} cam @param {number} factor
 * @returns {ShotCamera}
 */
export function dolly(cam, factor) {
  const d = cam.position.map((v, i) => v - cam.target[i])
  const reach = Math.hypot(...d)
  const scale = Math.max(MIN_REACH, reach * factor) / reach
  return { ...cam, position: d.map((v, i) => round(cam.target[i] + v * scale)) }
}
