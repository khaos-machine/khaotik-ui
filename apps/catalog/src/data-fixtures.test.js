import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import casting from './data/casting.json'

// The committed fixtures under src/data are captures from the live khaosd
// daemon (`scripts/fetch-all.sh`), and they are the catalog's whole demo
// surface. Nothing rendered checks them, so two ways of going wrong are
// invisible to every other test in this suite:
//
//   1. CHURN. /api/casting returns its assignments in Go map order, which is
//      randomised per call — three consecutive fetches of byte-identical data
//      produced three different files. The file was also minified onto one
//      line, so the diff was the whole file every time. A fixture that changes
//      without meaning anything teaches us to skim its diff, which is exactly
//      when a real change gets waved through.
//
//   2. MACHINE LEAKAGE. A provenance line naming
//      `/Users/k/khaos/projects/...` turns a shared fixture into a record of
//      one laptop — the same reason engine.json deliberately drops pid, port,
//      disk and uptime.
//
// Both had already happened when khaosd 0.6.6 landed and the data was refetched.
//
// The leakage check used to run only over fixtures carrying a `_provenance`,
// which meant the one committed fixture with a real machine path in it —
// coverage.json's `sourcePath` — was exempted by the shape of the filter rather
// than by any decision, and the suite reported green on "does not pin the
// machine it was captured on" while the path sat in the tree unexamined. It now
// walks every scalar in every fixture, and the exemptions are named below.

const DATA_DIR = join(import.meta.dirname, 'data')

const MACHINE_PATH = /\/Users\/|\/home\//

// Fields whose absolute path is the API's OWN data. The engine puts the project
// path in these; rewriting it would be fabricating the capture rather than
// recording it, which is the line the real-data rule draws. Exempt by field
// name, not by file, and asserted still-reachable below so the list cannot rot
// into a blanket pass.
const API_OWNED_PATH_FIELDS = ['sourcePath', 'detail', 'location']

const fixtures = readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ name: f, json: JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8')) }))

/** Every scalar in the tree, as `{ field, value }` — `field` is the last key. */
function scalars(node, field = '') {
  if (node === null || typeof node !== 'object') return [{ field, value: node }]
  if (Array.isArray(node)) return node.flatMap((v) => scalars(v, field))
  return Object.entries(node).flatMap(([k, v]) => scalars(v, k))
}

const leaks = fixtures.flatMap(({ name, json }) =>
  scalars(json)
    .filter(({ value }) => typeof value === 'string' && MACHINE_PATH.test(value))
    .map(({ field }) => ({ name, field })),
)

describe('the committed khaosd captures', () => {
  it('has fixtures to check at all', () => {
    // Guards the guard: a bad DATA_DIR would make every test below vacuous.
    expect(fixtures.length).toBeGreaterThan(10)
  })

  it('records casting in a stable order', () => {
    const ids = casting.map((c) => c.characterId)
    // Asserted to be strings first: an array of `undefined` sorts equal to
    // itself, so a renamed field (story-graph.json already spells this
    // `character_id`) would leave the order assertion vacuously green — while
    // fixtures.js's `castingData.find(c => c.characterId === …)` silently
    // matched nothing and the catalog rendered no voice assignments at all.
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((id) => typeof id === 'string')).toBe(true)
    expect(ids).toEqual([...ids].sort())
  })

  it('pins the machine only in fields the API itself populates', () => {
    const unexpected = leaks.filter((l) => !API_OWNED_PATH_FIELDS.includes(l.field))
    expect(unexpected).toEqual([])
  })

  it.each(API_OWNED_PATH_FIELDS)('still needs the exemption for %s', (field) => {
    // Keeps the allowlist honest. A field that stops carrying a path should
    // leave the list rather than sit there quietly widening the check above.
    expect(leaks.some((l) => l.field === field)).toBe(true)
  })

  describe.each(fixtures.filter((f) => !Array.isArray(f.json) && f.json?._provenance))(
    '$name',
    ({ json }) => {
      it('names its source endpoint', () => {
        expect(json._provenance).toMatch(/khaosd GET \/api\//)
      })

      it('does not pin the machine it was captured on', () => {
        expect(json._provenance).not.toMatch(MACHINE_PATH)
      })
    },
  )
})
