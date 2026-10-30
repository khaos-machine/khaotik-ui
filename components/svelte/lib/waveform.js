// audiowaveform JSON v2 peaks, as khaosd serves them for a recording, projected onto
// pixel columns for drawing. Pure: the Waveform atom draws what this returns.

// Bin edges are computed in floating point; a window edge that lands on a bin edge
// (0.04 s × 100 bins/s) must not spill into the next bin.
const EDGE = 1e-9

/**
 * The peaks, checked whole. Throws on anything but mono 8- or 16-bit v2 with two values per bin.
 *
 * @param {any} peaks
 */
export function assertPeaks(peaks) {
  const ok =
    peaks &&
    peaks.version === 2 &&
    peaks.channels === 1 &&
    (peaks.bits === 8 || peaks.bits === 16) &&
    Number.isInteger(peaks.length) &&
    peaks.length >= 0 &&
    Array.isArray(peaks.data) &&
    peaks.data.length === 2 * peaks.length &&
    peaks.sample_rate > 0 &&
    peaks.samples_per_pixel > 0
  if (!ok) throw new Error('peaks are not mono audiowaveform v2 with two values per bin')
}

/**
 * One `[min, max]` per pixel column for the window `[fromSec, toSec)`. Zoomed out, a
 * column is the min and max over every bin it covers; zoomed in, it is the bin under it.
 * A column past the last bin is `null`: the last bin is never repeated.
 *
 * @param {{version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[]}} peaks
 * @param {number} fromSec
 * @param {number} toSec
 * @param {number} width Whole pixel columns.
 * @returns {(Array<number> | null)[]}
 */
export function peakColumns(peaks, fromSec, toSec, width) {
  assertPeaks(peaks)
  const binsPerSec = peaks.sample_rate / peaks.samples_per_pixel
  const span = (toSec - fromSec) / width
  const out = []
  for (let c = 0; c < width; c++) {
    const first = Math.floor((fromSec + c * span) * binsPerSec + EDGE)
    const end = Math.min(peaks.length, Math.max(first + 1, Math.ceil((fromSec + (c + 1) * span) * binsPerSec - EDGE)))
    if (first < 0 || first >= peaks.length) {
      out.push(null)
      continue
    }
    let lo = peaks.data[2 * first]
    let hi = peaks.data[2 * first + 1]
    for (let b = first + 1; b < end; b++) {
      lo = Math.min(lo, peaks.data[2 * b])
      hi = Math.max(hi, peaks.data[2 * b + 1])
    }
    out.push([lo, hi])
  }
  return out
}

/**
 * How long a clip's peaks cover, in seconds: the whole clip, for a Waveform drawn end to end.
 * @param {{ sample_rate: number, samples_per_pixel: number, length: number }} peaks
 */
export const peaksSeconds = (peaks) => (peaks.length * peaks.samples_per_pixel) / peaks.sample_rate
