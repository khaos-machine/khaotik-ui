import { describe, it, expect } from 'vitest'
import { peakColumns } from '@khaos-machine/khaotik-ui/components/svelte/lib/waveform.js'

// The audiowaveform v2 peaks khaosd serves (P1, audio browser plan) projected onto pixel
// columns. Pure maths, tested on its own: a column that repeats the last bin or reads one
// bin too far is invisible in a screenshot and obvious here.

/** Peaks at 100 Hz with one sample per bin, so bin b covers [b/100, (b+1)/100) seconds. */
function peaks(pairs, overrides = {}) {
  return { version: 2, channels: 1, sample_rate: 100, samples_per_pixel: 1, bits: 8, length: pairs.length, data: pairs.flat(), ...overrides }
}

describe('peakColumns', () => {
  const four = peaks([[-1, 2], [-8, 3], [-2, 9], [-4, 4]])

  it('zoomed out, a column is the min and max over every bin it covers', () => {
    // 0.04 s over 2 columns: each column covers two bins.
    expect(peakColumns(four, 0, 0.04, 2)).toEqual([[-8, 3], [-4, 9]])
  })

  it('zoomed in, a column is the bin under it', () => {
    // 0.02 s over 4 columns: two columns per bin.
    expect(peakColumns(four, 0, 0.02, 4)).toEqual([[-1, 2], [-1, 2], [-8, 3], [-8, 3]])
  })

  it('reads from the window start, not from zero', () => {
    expect(peakColumns(four, 0.02, 0.04, 2)).toEqual([[-2, 9], [-4, 4]])
  })

  it('leaves columns past the last bin empty and never repeats it', () => {
    expect(peakColumns(four, 0, 0.08, 4)).toEqual([[-8, 3], [-4, 9], null, null])
  })

  it('is empty for a window with no width', () => {
    expect(peakColumns(four, 0, 0.04, 0)).toEqual([])
  })

  it.each([
    ['a version other than 2', { version: 1 }],
    ['more than one channel', { channels: 2 }],
    ['bits other than 8 or 16', { bits: 12 }],
    ['data that is not two values per bin', { data: [1, 2, 3] }],
    ['a missing sample rate', { sample_rate: undefined }],
    ['a missing samples_per_pixel', { samples_per_pixel: 0 }],
  ])('throws on %s', (_, bad) => {
    expect(() => peakColumns(peaks([[-1, 2], [-3, 4]], bad), 0, 0.02, 2)).toThrow()
  })
})
