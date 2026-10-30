/** A controlled picture clip, in composition seconds. */
/**
 * @typedef {Object} PictureClip
 * @property {string} id Clip identity.
 * @property {string} label Human-readable shot name.
 * @property {number} start Composition start, in seconds.
 * @property {number} duration Hold duration, in seconds; at least 0.1.
 * @property {string} [imageUrl] Chosen or explicitly previewed image URL.
 * @property {number} [minStart] Earliest allowed start, in seconds.
 * @property {number} [maxEnd] Latest allowed end, in seconds.
 * @property {string} [warning] Engine-provided timing or media warning.
 * @property {boolean} [readOnly] Retained timing preview; selection is allowed, timing edits are disabled.
 * @property {boolean} [chosen] Whether the host has chosen artwork for playback.
 */
/** @typedef {'move'|'start'|'end'} PictureEdit */

/** Compute a bounded edit without mutating a caller's clip.
 * @param {PictureClip} clip
 * @param {number} delta
 * @param {PictureEdit} edit
 * @param {number} total
 * @param {boolean} [snap]
 */
export function pictureRange(clip, delta, edit, total, snap = true) {
  const lower = Math.max(0, clip.minStart ?? 0)
  const upper = Math.min(total, clip.maxEnd ?? total)
  const minimum = Math.min(0.1, upper - lower)
  const step = snap ? Math.round(delta * 10) / 10 : delta
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
  if (edit === 'start') {
    const end = clip.start + clip.duration
    const start = clamp(clip.start + step, lower, end - minimum)
    return { start, duration: end - start }
  }
  if (edit === 'end') {
    const end = clamp(clip.start + clip.duration + step, clip.start + minimum, upper)
    return { start: clip.start, duration: end - clip.start }
  }
  return { start: clamp(clip.start + step, lower, upper - clip.duration), duration: clip.duration }
}
