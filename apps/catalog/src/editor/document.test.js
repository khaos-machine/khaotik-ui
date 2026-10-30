import { describe, it, expect } from 'vitest'
import {
  SCHEMA_VERSION, createDocument, layoutNode, componentNode, mintId, walk,
  findNode, parentOf, insertNode, removeNode, moveNode, setProp, setLayout,
} from './document.js'

/** A two-child stack, built the way the editor builds one. */
const build = () => {
  let doc = createDocument({ slug: 'scene-card', name: 'Scene card' })
  let root = doc.root
  root = insertNode(root, componentNode('@MetricCard', { id: mintId(root) }))
  root = insertNode(root, componentNode('@StatusPill', { id: mintId(root) }))
  return { ...doc, root }
}

describe('the document model', () => {
  it('mints ids that are unique and predictable', () => {
    const doc = build()
    const ids = [...walk(doc.root)].map((n) => n.id)
    expect(ids).toEqual(['n0', 'n1', 'n2'])
    expect(new Set(ids).size).toBe(ids.length)
    // Counted from the tree rather than drawn from a random source, so the same
    // edits produce the same document and a test can name the id it expects.
    expect(mintId(doc.root)).toBe('n3')
  })

  it('stamps the schema version, so a payload can say which reader wrote it', () => {
    expect(createDocument({ slug: 'x' }).schema).toBe(SCHEMA_VERSION)
  })

  it('leaves the input tree untouched — every operation returns a new root', () => {
    const doc = build()
    const before = structuredClone(doc.root)

    insertNode(doc.root, componentNode('@Icon', { id: 'n9' }))
    removeNode(doc.root, 'n1')
    moveNode(doc.root, 'n2', -1)
    setProp(doc.root, 'n1', 'label', 'Runtime')
    setLayout(doc.root, 'n0', { gap: 'xl' })

    // The whole reactivity story rests on this: `$state` tracks reassignment, so
    // a mutating operation would update the tree and never repaint.
    expect(doc.root).toEqual(before)
  })

  it('inserts at an index, and appends when none is given', () => {
    const doc = build()
    const first = insertNode(doc.root, componentNode('@Icon', { id: 'n3' }), { parentId: 'n0', index: 0 })
    expect(first.children.map((c) => c.id)).toEqual(['n3', 'n1', 'n2'])

    const last = insertNode(doc.root, componentNode('@Icon', { id: 'n3' }))
    expect(last.children.map((c) => c.id)).toEqual(['n1', 'n2', 'n3'])
  })

  it('refuses to insert into a parent that does not exist, rather than guessing', () => {
    // Falling back to the root would put the node somewhere the caller did not
    // ask for — and looking correct is the failure mode this repo keeps paying
    // for.
    const doc = build()
    expect(insertNode(doc.root, componentNode('@Icon', { id: 'n3' }), { parentId: 'nope' })).toBe(doc.root)
  })

  it('refuses to insert into a component node — only layout nodes hold children', () => {
    const doc = build()
    expect(insertNode(doc.root, componentNode('@Icon', { id: 'n3' }), { parentId: 'n1' })).toBe(doc.root)
  })

  it('moves within a parent and clamps at both ends', () => {
    const doc = build()
    expect(moveNode(doc.root, 'n2', -1).children.map((c) => c.id)).toEqual(['n2', 'n1'])
    // Clamped, not wrapped: "move up" on the first child does nothing rather
    // than sending it to the bottom.
    expect(moveNode(doc.root, 'n1', -1)).toBe(doc.root)
    expect(moveNode(doc.root, 'n2', 1)).toBe(doc.root)
  })

  it('removes a node, and never the root — a document always has one', () => {
    const doc = build()
    expect(removeNode(doc.root, 'n1').children.map((c) => c.id)).toEqual(['n2'])
    expect(removeNode(doc.root, 'n0')).toBe(doc.root)
  })

  it('finds a node and its parent', () => {
    const doc = build()
    expect(findNode(doc.root, 'n2').component).toBe('@StatusPill')
    expect(findNode(doc.root, 'nope')).toBeNull()
    expect(parentOf(doc.root, 'n2').id).toBe('n0')
    expect(parentOf(doc.root, 'n0')).toBeNull()
  })

  it('clears a prop rather than writing null, so the component default takes over', () => {
    const doc = build()
    const set = setProp(doc.root, 'n1', 'label', 'Runtime')
    expect(findNode(set, 'n1').props).toEqual({ label: 'Runtime' })

    // "Cleared" and "explicitly null" have to stay distinguishable: an absent
    // prop falls back to the component's own default, which is what clearing a
    // field should do.
    const cleared = setProp(set, 'n1', 'label', '')
    expect(findNode(cleared, 'n1').props).toEqual({})
  })

  it('patches only layout keys it knows, and drops one set to null', () => {
    const doc = build()
    const patched = setLayout(doc.root, 'n0', { gap: 'xl', align: 'center', nonsense: 'x' })
    expect(patched.gap).toBe('xl')
    expect(patched.align).toBe('center')
    expect(patched.nonsense).toBeUndefined()
    expect(setLayout(patched, 'n0', { align: null }).align).toBeUndefined()
  })

  it('gives a grid columns and a stack a direction, never both', () => {
    expect(layoutNode({ layout: 'grid' })).toMatchObject({ columns: 2 })
    expect(layoutNode({ layout: 'grid' }).direction).toBeUndefined()
    expect(layoutNode({ layout: 'stack' })).toMatchObject({ direction: 'column' })
    expect(layoutNode({ layout: 'stack' }).columns).toBeUndefined()
  })

  it('starts a component node with NO props, not with copied defaults', () => {
    // Every prop in the kit carries an explicit default already, so an absent
    // prop and one set to its default render identically — and only one of the
    // two says "nobody chose this". Copying defaults in would also freeze them
    // against a later change to the component.
    expect(componentNode('@MetricCard').props).toEqual({})
  })
})
