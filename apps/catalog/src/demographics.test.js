import { describe, it, expect } from 'vitest'
import { ageBucket, genderBucket } from '@khaos-machine/khaotik-ui/components/svelte/lib/demographics.js'
import characterAnalyses from './data/character-analyses.json'

// #29 — two character views both compared
// `ageRange === 'child'`. khaosd never sends that string; khaos-tools'
// character-schema.json declares decade bands. So the comparison could not match
// at any point and EVERY character resolved to 'adult', teenagers included.
//
// It was invisible until the kit started shipping figures: before that, a wrong
// bucket and a right one rendered the same glyph.

describe('ageBucket maps the bands the engine actually sends', () => {
  it.each([
    ['teens', 'young'],
    ['20s', 'adult'],
    ['30s', 'adult'],
    ['40s', 'adult'],
    ['50s', 'adult'],
    ['60s', 'senior'],
    ['60s+', 'senior'],
    ['70s', 'senior'],
  ])('%s → %s', (band, bucket) => {
    expect(ageBucket(band)).toBe(bucket)
  })

  it('reads the decade rather than listing every spelling', () => {
    // A band the engine adds later should land somewhere sensible instead of
    // silently becoming `adult`.
    expect(ageBucket('80s')).toBe('senior')
    expect(ageBucket('10s')).toBe('young')
  })

  it("still honours 'child', which is what the old code assumed", () => {
    // Nothing sends it, but a consumer might, and mapping it to `adult` would
    // reproduce the original bug from the other direction.
    expect(ageBucket('child')).toBe('young')
    expect(ageBucket('teen')).toBe('young')
  })

  it('falls to adult for empty and unrecognised values', () => {
    // 21 of 27 characters carry nothing. That is the common case, not an edge —
    // and it is paired with the `unknown` gender figure so the result reads as
    // "no demographics" rather than as a specific person.
    for (const v of ['', null, undefined, 'unknown', 'ancient']) {
      expect(ageBucket(v)).toBe('adult')
    }
  })

  it('never returns a bucket the kit has no artwork for', () => {
    const shipped = new Set(['young', 'adult', 'senior'])
    const seen = Object.values(characterAnalyses).map((c) => ageBucket(c.demographics?.ageRange))
    expect(seen.length).toBeGreaterThan(0)
    for (const b of seen) expect(shipped.has(b)).toBe(true)
  })
})

describe('genderBucket accepts the engine spelling', () => {
  it.each([
    ['male', 'male'],
    ['female', 'female'],
    // The schema declares it hyphenated; the asset filenames have no hyphen.
    ['non-binary', 'nonbinary'],
    ['Non-Binary', 'nonbinary'],
    ['non binary', 'nonbinary'],
    ['nonbinary', 'nonbinary'],
  ])('%s → %s', (value, bucket) => {
    expect(genderBucket(value)).toBe(bucket)
  })

  it('falls to unknown for everything else', () => {
    for (const v of ['', null, undefined, 'unknown', 'other', 'martian']) {
      expect(genderBucket(v)).toBe('unknown')
    }
  })
})

describe('the real data lands where it should', () => {
  it('maps a stated age by its number', () => {
    // The engine now sends what the script states (`36`, `not stated`), not
    // decade bands. A bare number must land by its value, not by the default.
    const stated = Object.values(characterAnalyses).find((c) => /^\d+$/.test(c.demographics?.ageRange ?? ''))
    expect(stated, 'the corpus should contain a character with a stated numeric age').toBeTruthy()
    const n = Number(stated.demographics.ageRange)
    expect(ageBucket(stated.demographics.ageRange)).toBe(n < 20 ? 'young' : n >= 60 ? 'senior' : 'adult')
  })

  it.each([['15', 'young'], ['36', 'adult'], ['60', 'senior'], ['not stated', 'adult']])('maps stated age %s to %s', (age, bucket) => {
    expect(ageBucket(age)).toBe(bucket)
  })
})
