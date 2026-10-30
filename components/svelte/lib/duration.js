import { formatTimecode } from './timeline.js'

// Durations for progress: how long something has run, and how long it is
// projected to take. One module so the card, the import hint, voice lines and
// scene reads say time the same way (khaos.machine
// docs/plans/2026-10-09-ui-quality-of-life.md §13 step 2d).
//
// Neither ever invents a value. A duration that is not a finite, non-negative
// number of milliseconds is '' — never "0:00", never "almost done" — so a host
// that renders the result unconditionally shows nothing it was not told.

const isDuration = (ms) => typeof ms === 'number' && Number.isFinite(ms) && ms >= 0

/**
 * Elapsed time, exact: `m:ss`, or `h:mm:ss` once there is an hour (the kit's
 * `formatTimecode`). Tabular-friendly, so a ticking value does not jitter.
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatElapsed(ms) {
  return isDuration(ms) ? formatTimecode(ms / 1000) : ''
}

/**
 * Remaining time, with no false precision: "under 1 min", "about 12 min"
 * (minutes rounded up, so the figure errs long), and from an hour "about 1 h
 * 20 min", to the nearest 5 minutes. Zero or less is '' rather than a claim
 * that the work is nearly done.
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatRemaining(ms) {
  if (!isDuration(ms) || ms === 0) return ''
  if (ms < 60_000) return 'under 1 min'
  const minutes = Math.ceil(ms / 60_000)
  if (minutes < 60) return `about ${minutes} min`
  const rounded = Math.round(minutes / 5) * 5
  const h = Math.floor(rounded / 60)
  const m = rounded % 60
  return m ? `about ${h} h ${m} min` : `about ${h} h`
}
