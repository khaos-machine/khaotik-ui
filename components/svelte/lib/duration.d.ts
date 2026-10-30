/**
 * Elapsed time, exact: `m:ss`, or `h:mm:ss` once there is an hour (the kit's
 * `formatTimecode`). Tabular-friendly, so a ticking value does not jitter.
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatElapsed(ms: number): string;
/**
 * Remaining time, with no false precision: "under 1 min", "about 12 min"
 * (minutes rounded up, so the figure errs long), and from an hour "about 1 h
 * 20 min", to the nearest 5 minutes. Zero or less is '' rather than a claim
 * that the work is nearly done.
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatRemaining(ms: number): string;
