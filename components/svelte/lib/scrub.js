// ScrubNumber's arithmetic (data-layer plan K10).

/**
 * `value` snapped to the nearest multiple of `step` counted from `min`, then held inside
 * `[min, max]`. Rounded to the step's decimals so 0.1 + 0.2 never reads 0.30000000000000004.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {number} step
 * @returns {number}
 */
export function clampStep(value, min, max, step) {
  const snapped = step > 0 ? min + Math.round((value - min) / step) * step : value
  const held = Math.min(max, Math.max(min, snapped))
  return Number(held.toFixed(decimals(step)))
}

/**
 * How many decimals a step carries: 0.05 → 2, 1 → 0.
 *
 * @param {number} step
 * @returns {number}
 */
export function decimals(step) {
  const text = String(step)
  const dot = text.indexOf('.')
  return dot < 0 ? 0 : text.length - dot - 1
}
