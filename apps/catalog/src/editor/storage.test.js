import { describe, it, expect } from 'vitest'
import { load, save, migrate, STORAGE_KEY, SCHEMA_VERSION } from './storage.js'

/**
 * A FAKE, not a mock.
 *
 * The thing under test is a contract with a key-value store, so the double is a
 * key-value store. A mock would let these tests assert that `setItem` was called
 * with a particular string, which is a restatement of the implementation; a fake
 * lets them assert what a reload actually gets back.
 */
const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    get size() { return map.size },
    peek: (k) => map.get(k),
  }
}

const doc = { schema: 1, kind: 'component', slug: 'scene-card', name: 'Scene card', inputs: [], root: { type: 'layout', id: 'n0', layout: 'stack', children: [] } }

describe('the compose workspace, between reloads', () => {
  it('round-trips a document', () => {
    const storage = fakeStorage()
    expect(save({ documents: [doc], app: '0.16.0' }, storage)).toEqual({ ok: true, problem: null })
    expect(load(storage)).toEqual({ documents: [doc], problem: null })
  })

  it('reads an empty store as empty, not as a problem', () => {
    expect(load(fakeStorage())).toEqual({ documents: [], problem: null })
  })

  it('records the app version but never branches on it', () => {
    const storage = fakeStorage()
    save({ documents: [], app: '0.16.0' }, storage)
    expect(JSON.parse(storage.peek(STORAGE_KEY)).app).toBe('0.16.0')
    // A payload with no app version still reads: the SCHEMA is the contract.
    const other = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ schema: 1, documents: [doc] }) })
    expect(load(other).problem).toBeNull()
  })

  it('reports unreadable saved work and KEEPS IT, rather than starting over', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{not json' })
    const { documents, problem } = load(storage)
    expect(documents).toEqual([])
    expect(problem.kind).toBe('unparseable')
    // The raw payload comes back with the problem, so it can be copied out.
    expect(problem.raw).toBe('{not json')
    // And nothing was written over it. Silently resetting to an empty workspace
    // is how someone loses an afternoon and is told nothing happened.
    expect(storage.peek(STORAGE_KEY)).toBe('{not json')
  })

  it('refuses a payload from a newer writer, and leaves it alone', () => {
    const newer = JSON.stringify({ schema: SCHEMA_VERSION + 1, documents: [doc] })
    const storage = fakeStorage({ [STORAGE_KEY]: newer })
    const { documents, problem } = load(storage)
    expect(documents).toEqual([])
    expect(problem.kind).toBe('wrong-schema')
    expect(problem.detail).toContain(String(SCHEMA_VERSION + 1))
    expect(problem.raw).toBe(newer)
    expect(storage.peek(STORAGE_KEY)).toBe(newer)
  })

  it('keeps reading a frozen v1 payload, forever', () => {
    // The first migration is the one written in a hurry against a payload nobody
    // kept. This is that payload, and it is not to be edited — if a future
    // schema cannot read it, that is a migration to write, not a fixture to
    // update.
    const v1 = '{"schema":1,"app":"0.16.0","savedAt":"2026-09-02T14:31:00.000Z","documents":[{"schema":1,"kind":"component","slug":"scene-card","name":"Scene card","inputs":[],"root":{"type":"layout","id":"n0","layout":"stack","direction":"column","gap":"md","children":[]}}]}'
    const { documents, problem } = load(fakeStorage({ [STORAGE_KEY]: v1 }))
    expect(problem).toBeNull()
    expect(documents).toHaveLength(1)
    expect(documents[0].slug).toBe('scene-card')
  })

  it('treats a payload with no schema as the current one', () => {
    expect(migrate({ documents: [doc] }).problem).toBeNull()
    expect(migrate({ documents: [doc] }).payload.schema).toBe(SCHEMA_VERSION)
  })

  it('reports a payload that is not an object at all', () => {
    expect(migrate('nonsense').problem.kind).toBe('unparseable')
    expect(load(fakeStorage({ [STORAGE_KEY]: '"a string"' })).problem.kind).toBe('unparseable')
  })

  it('works without storage, and says the mode will not remember', () => {
    // A hardened webview, a private window, a browser set to block site data.
    // Crashing on load there would be worse than not remembering.
    const { documents, problem } = load(null)
    expect(documents).toEqual([])
    expect(problem.kind).toBe('unavailable')
    expect(save({ documents: [doc] }, null).ok).toBe(false)
  })

  it('survives a storage that throws on read', () => {
    const hostile = { getItem() { throw new Error('SecurityError') }, setItem() {} }
    expect(load(hostile).problem.kind).toBe('unavailable')
  })

  it('reports a full store without losing what is in the editor', () => {
    const full = {
      getItem: () => null,
      setItem() { const e = new Error('exceeded the quota'); e.name = 'QuotaExceededError'; throw e },
    }
    const { ok, problem } = save({ documents: [doc] }, full)
    expect(ok).toBe(false)
    expect(problem.kind).toBe('quota')
    expect(problem.detail).toContain('Nothing in the editor has been lost')
  })

  it('names any other write failure rather than reporting success', () => {
    const broken = { getItem: () => null, setItem() { throw new Error('disk on fire') } }
    const { ok, problem } = save({ documents: [doc] }, broken)
    expect(ok).toBe(false)
    expect(problem.kind).toBe('write-failed')
    expect(problem.detail).toContain('disk on fire')
  })
})
