import { describe, it, expect } from 'vitest'
import { validate } from './validate.js'
import { createDocument, layoutNode, componentNode } from './document.js'
import { SPACE_TOKENS } from './tokens.js'

/** A document whose root holds the given children. */
const doc = (children, extra = {}) => ({
  ...createDocument({ slug: 'scene-card', name: 'Scene card' }),
  ...extra,
  root: layoutNode({ id: 'n0', gap: 'md', children }),
})

const codes = (d, composed) => validate(d, composed).map((p) => p.code)

describe('validating a document', () => {
  it('finds nothing wrong with a good one', () => {
    // Guards the guard: without this every assertion below could be passing
    // because validate returns problems for everything.
    expect(validate(doc([componentNode('@MetricCard', { id: 'n1', props: { label: 'Runtime' } })]))).toEqual([])
  })

  it('names an unresolvable slug', () => {
    const found = validate(doc([componentNode('@MetricCrad', { id: 'n1' })]))
    expect(found.map((p) => p.code)).toEqual(['unresolved-slug'])
    // Named, not counted — the whole point of reporting over throwing is that
    // the author gets the id in hand.
    expect(found[0].message).toContain('@MetricCrad')
    expect(found[0].path).toBe('n1')
  })

  it('names a duplicate node id', () => {
    expect(codes(doc([componentNode('@Icon', { id: 'n1' }), componentNode('@Icon', { id: 'n1' })])))
      .toEqual(['duplicate-id'])
  })

  it('rejects a length where a space token belongs', () => {
    // The mistake this catches is almost always `24px` written where `lg`
    // belongs, which is exactly the ambiguity token names exist to remove.
    const found = validate({ ...createDocument({ slug: 'x' }), root: layoutNode({ id: 'n0', gap: '24px' }) })
    expect(found.map((p) => p.code)).toEqual(['not-a-space-token'])
    expect(found[0].message).toContain(SPACE_TOKENS.join(', '))
  })

  it('accepts every token the generated stylesheet actually declares', () => {
    // Cross-checked against tokens.css through parse.js rather than a list
    // restated here, so the validator cannot drift from the scale.
    for (const token of SPACE_TOKENS) {
      expect(validate({ ...createDocument({ slug: 'x' }), root: layoutNode({ id: 'n0', gap: token }) }), token).toEqual([])
    }
  })

  it('names an unknown layout and an unknown node type', () => {
    expect(codes({ ...createDocument({ slug: 'x' }), root: layoutNode({ id: 'n0', layout: 'masonry' }) }))
      .toEqual(['unknown-layout'])
    expect(codes(doc([{ type: 'widget', id: 'n1' }]))).toEqual(['unknown-node'])
  })

  it('names a dataset that no capture provides', () => {
    expect(codes(doc([componentNode('@SceneTable', { id: 'n1', props: { scenes: { $data: 'scenez' } } })])))
      .toEqual(['unknown-dataset'])
    expect(validate(doc([componentNode('@SceneTable', { id: 'n1', props: { scenes: { $data: 'scenes' } } })])))
      .toEqual([])
  })

  it('names a $prop binding with no declared input, and resolves a dotted path to its root', () => {
    const withInput = { inputs: [{ name: 'scene', type: 'SceneRecord' }] }
    expect(validate(doc([componentNode('@SceneDetail', { id: 'n1', props: { scene: { $prop: 'scene' } } })], withInput))).toEqual([])
    // `scene.slugline` binds to the input `scene` — the path is property access
    // into it, not a second input.
    expect(validate(doc([componentNode('@MetricCard', { id: 'n1', props: { value: { $prop: 'scene.slugline' } } })], withInput))).toEqual([])
    expect(codes(doc([componentNode('@SceneDetail', { id: 'n1', props: { scene: { $prop: 'nope' } } })], withInput)))
      .toEqual(['unknown-input'])
  })

  it('refuses literal array or object data in a prop slot', () => {
    // The no-fabrication rule enforced in the MODEL, not only in the inspector:
    // a document that arrived some other way — a stale payload, a hand-edited
    // file — cannot smuggle invented rows past the UI that would have stopped a
    // person typing them.
    expect(codes(doc([componentNode('@SceneTable', { id: 'n1', props: { scenes: [{ id: 'fake' }] } })])))
      .toEqual(['raw-value'])
    expect(codes(doc([componentNode('@SceneDetail', { id: 'n1', props: { scene: { id: 'fake' } } })])))
      .toEqual(['raw-value'])
  })

  it('allows the scalars a prop may legitimately hold', () => {
    expect(validate(doc([componentNode('@MetricCard', {
      id: 'n1', props: { label: 'Runtime', sub: 42, tone: 'success' },
    })]))).toEqual([])
  })

  it('catches a reference cycle instead of rendering forever', () => {
    // Easy to author by accident the moment composed components can hold
    // composed components, which is exactly what the recursive model buys. Left
    // to the renderer this is not a wrong picture, it is an infinite one.
    const a = { ...createDocument({ slug: 'a' }), root: layoutNode({ id: 'n0', children: [componentNode('@b', { id: 'n1' })] }) }
    const b = { ...createDocument({ slug: 'b' }), root: layoutNode({ id: 'n0', children: [componentNode('@a', { id: 'n1' })] }) }
    const composed = new Map([['a', a], ['b', b]])
    expect(codes(a, composed)).toContain('cycle')
    expect(validate(a, composed).find((p) => p.code === 'cycle').message).toContain('@a')
  })

  it('catches a component that references itself', () => {
    const self = { ...createDocument({ slug: 'self' }), root: layoutNode({ id: 'n0', children: [componentNode('@self', { id: 'n1' })] }) }
    expect(codes(self, new Map([['self', self]]))).toContain('cycle')
  })

  it('reports a missing root rather than throwing', () => {
    expect(codes({ slug: 'x' })).toEqual(['no-root'])
    expect(codes(undefined)).toEqual(['no-root'])
  })
})
