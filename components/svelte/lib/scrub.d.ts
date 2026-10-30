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
export function clampStep(value: number, min: number, max: number, step: number): number;
/**
 * How many decimals a step carries: 0.05 → 2, 1 → 0.
 *
 * @param {number} step
 * @returns {number}
 */
export function decimals(step: number): number;
