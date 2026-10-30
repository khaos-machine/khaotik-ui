import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DATASETS, datasetIds, datasetsFor, resolveDataRef } from './datasets.js'
import scenesDestination from '../data/scenes-destination.json'

const SOURCE = readFileSync(join(import.meta.dirname, 'datasets.js'), 'utf8')
/** Just the DATASETS literal — the only region where a fabricated row could hide. */
const TABLE = SOURCE.slice(SOURCE.indexOf('export const DATASETS'), SOURCE.indexOf('\nconst BY_ID'))

describe('the vendored datasets', () => {
  it('has datasets to check', () => {
    expect(DATASETS.length).toBeGreaterThan(10)
  })

  it('resolves every dataset to real, non-empty captured data', () => {
    for (const d of DATASETS) {
      const size = Array.isArray(d.value) ? d.value.length : Object.keys(d.value).length
      expect(size, d.id).toBeGreaterThan(0)
    }
  })

  it('names a capture file that exists for every dataset', () => {
    for (const d of DATASETS) {
      expect(existsSync(join(import.meta.dirname, '../data', d.file)), d.file).toBe(true)
    }
  })

  it('holds no data of its own — every value is an import', () => {
    // SOURCE-READ, and it is the rule made mechanical. The no-fabrication rule
    // says the catalog's data is captured from the daemon; this module is the
    // one place data is named, so it is the one place a hand-typed row could be
    // slipped in beside the real ones and look identical. Every `value:` must be
    // an identifier or a member of one — never a literal array or object.
    const values = [...TABLE.matchAll(/value:\s*(.)/g)].map((m) => m[1])
    expect(values.length).toBe(DATASETS.length)
    expect(values.filter((c) => c === '[' || c === '{')).toEqual([])
  })

  it('gives every dataset a unique id', () => {
    expect(new Set(datasetIds).size).toBe(datasetIds.length)
  })

  it('offers only datasets whose entity matches the prop', () => {
    const ids = (control) => datasetsFor(control).map((d) => d.id)
    expect(ids({ kind: 'collection', entity: 'SceneRecord' })).toEqual(['scenes'])
    expect(ids({ kind: 'entity', entity: 'Voice' })).toEqual(['voices'])
    expect(ids({ kind: 'unknown' })).toContain('character-analyses')
  })

  it('offers NOTHING for an entity no capture holds, rather than something plausible', () => {
    // `readonly Fact[]` and `readonly MenuItem[]` name types nobody captured.
    // Offering `Scenes` there would render something that looks right and is
    // wrong, so the empty list is the panel's cue to say what is missing.
    expect(datasetsFor({ kind: 'collection', entity: 'Fact' })).toEqual([])
    expect(datasetsFor({ kind: 'collection', entity: 'MenuItem' })).toEqual([])
    expect(datasetsFor({ kind: 'collection', entity: 'number' })).toEqual([])
    expect(datasetsFor({ kind: 'string' })).toEqual([])
    expect(datasetsFor(null)).toEqual([])
  })

  it('offers every collection when the prop declares an anonymous shape', () => {
    // There is no name to match on, so there is no basis to exclude anything;
    // the choice is the author's.
    expect(datasetsFor({ kind: 'collection', entity: null }).length).toBeGreaterThan(5)
  })

  it('resolves a data ref to the captured rows', () => {
    expect(resolveDataRef({ $data: 'scenes' }).value.length).toBe(scenesDestination.scenes.length)
    expect(resolveDataRef({ $data: 'scenes', slice: [0, 6] }).value.length).toBe(6)
  })

  it('addresses one element with `at`, which the single-entity props need', () => {
    // SceneDetail takes a `scene`, not scenes. Without this ten props across the
    // rows and cards could not be bound at all.
    const one = resolveDataRef({ $data: 'scenes', at: 0 })
    expect(Array.isArray(one.value)).toBe(false)
    expect(one.value.id).toBeTruthy()
  })

  it('reports a miss by name instead of resolving to an empty array', () => {
    // A list that renders zero rows looks like an empty state somebody designed.
    expect(resolveDataRef({ $data: 'scenez' })).toEqual({ missing: 'scenez' })
    expect(resolveDataRef({ $data: 'scenes', at: 9999 })).toEqual({ missing: 'scenes[9999]' })
    expect(resolveDataRef(undefined)).toEqual({ missing: null })
  })
})
