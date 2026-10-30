import { describe, it, expect } from 'vitest'
import { formatElapsed, formatRemaining } from '@khaos-machine/khaotik-ui/components/svelte/lib/duration.js'

// Elapsed is exact; remaining carries no false precision. Neither ever renders a
// placeholder for a value it was not given: NaN, Infinity and negatives are ''.

describe('formatElapsed', () => {
  it.each([
    [0, '0:00'],
    [999, '0:00'],
    [150_300, '2:30'],
    [3_599_000, '59:59'],
    [3_849_000, '1:04:09'],
  ])('%d ms is %s', (ms, text) => expect(formatElapsed(ms)).toBe(text))

  it.each([NaN, -1, Infinity, undefined, null])('%s is empty', (ms) => expect(formatElapsed(ms)).toBe(''))
})

describe('formatRemaining', () => {
  it.each([
    [1, 'under 1 min'],
    [59_999, 'under 1 min'],
    [60_000, 'about 1 min'],
    [670_500, 'about 12 min'],
    [3_540_000, 'about 59 min'],
    [3_600_000, 'about 1 h'],
    [4_800_000, 'about 1 h 20 min'],
    [4_920_000, 'about 1 h 20 min'],
    [7_050_000, 'about 2 h'],
  ])('%d ms is %s', (ms, text) => expect(formatRemaining(ms)).toBe(text))

  it.each([0, NaN, -1, Infinity, undefined, null])('%s is empty, never "almost done"', (ms) =>
    expect(formatRemaining(ms)).toBe(''))
})
