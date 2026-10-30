import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import ComposeCanvas from './ComposeCanvas.svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createDocument, layoutNode, componentNode, findNode, walk } from './document.js'

const frame = { device: 'web', size: 'fill', orientation: 'portrait', enabled: true }

const doc = (children = [], extra = {}) => ({
  ...createDocument({ kind: 'page', slug: 'triage', name: 'Triage' }),
  ...extra,
  root: layoutNode({ id: 'n0', gap: 'md', children }),
})

/**
 * Render the editor holding its own document, the way App does.
 *
 * Every edit is a pure function returning a NEW document, so the test drives the
 * same loop the app does — and `latest()` is the real artifact each assertion is
 * made against, rather than the DOM standing in for it.
 *
 * `insert(slug)` mimics what App.svelte's own request/ack cycle does: set
 * `insertRequest`, let the effect consume it, then clear it — insertion no
 * longer originates inside this component, it arrives as a prop from a sibling
 * (a Sidebar row), so a test drives it the same way.
 */
function editor(initial, documents = []) {
  let current = initial
  let insertRequest = null

  // `onChange` only updates the closure — it does NOT rerender itself. Calling
  // `rerender` from inside a callback invoked BY an `$effect` (as `add()` is,
  // via `insertRequest`) retriggers Svelte's scheduler recursively and hangs
  // the suite, even with `untrack` in ComposeCanvas.svelte guarding the
  // effect's own dependency tracking — `untrack` stops it from RE-RUNNING,
  // it does not make a nested synchronous `rerender` mid-flush safe. So syncing
  // is always the TEST's job, done explicitly and only from a point that is not
  // itself inside a render: after `insert()` (below) and after any `fireEvent`
  // whose result the DOM needs to reflect before the next assertion (`sync()`
  // is exposed on the returned object for exactly that).
  const onChange = (next) => { current = next }
  const onInsertHandled = () => { insertRequest = null }
  const props = () => ({ document: current, frame, documents, onChange, insertRequest, onInsertHandled })

  const utils = render(ComposeCanvas, { props: props() })
  const sync = () => utils.rerender(props())

  /** Set a request, let the effect consume it, then push the result back in —
   *  the same cycle App.svelte runs for real, as two plain renders. */
  function insert(slug) {
    insertRequest = { slug }
    sync() // effect fires: add() runs (sets `current` via onChange), onInsertHandled clears insertRequest
    sync() // pushes the updated document and the cleared request in one render
  }

  return { ...utils, latest: () => current, insert, sync }
}

const inspector = () => within(screen.getByLabelText('Inspector'))
const ids = (d) => (d.root.children ?? []).map((c) => c.component ?? c.layout)

describe('composing a document', () => {
  it('inserts a component via a request relayed from outside the component', () => {
    const e = editor(doc())
    e.insert('@MetricCard')
    expect(ids(e.latest())).toEqual(['@MetricCard'])
    expect([...walk(e.latest().root)].map((n) => n.id)).toEqual(['n0', 'n1'])
  })

  it('acknowledges the request, so a second click is needed for a second insert', () => {
    // `onInsertHandled` clears the request. Without it, the SAME prop value
    // sitting there would look identical to a fresh request and could insert
    // twice for one click — or, being unchanged, insert zero times on the second
    // real click.
    const e = editor(doc())
    e.insert('@MetricCard')
    expect(ids(e.latest())).toEqual(['@MetricCard'])
    e.insert('@MetricCard')
    expect(ids(e.latest())).toEqual(['@MetricCard', '@MetricCard'])
  })

  it('inserts a layout node from its own chrome, not from a sidebar row', async () => {
    // Stack/Grid are document metadata, not registry members — no barrel
    // export, no row to originate a request from. They stay local to this
    // component's own chrome.
    const e = editor(doc())
    await fireEvent.click(screen.getByRole('button', { name: 'Grid' }))
    expect(e.latest().root.children[0]).toMatchObject({ type: 'layout', layout: 'grid', columns: 2 })
  })

  it('selects what was just inserted, because configuring it is the next thing', () => {
    const e = editor(doc())
    e.insert('@MetricCard')
    expect(inspector().getByText('@MetricCard')).toBeInTheDocument()
  })

  it('selects a node by clicking it on the stage', async () => {
    editor(doc([componentNode('@MetricCard', { id: 'n1' }), componentNode('@StatusPill', { id: 'n2' })]))
    await fireEvent.click(screen.getByRole('button', { name: '@StatusPill', pressed: false }))
    expect(inspector().getByText('@StatusPill')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '@StatusPill' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('inserts at a caret rather than always appending', async () => {
    const e = editor(doc([componentNode('@MetricCard', { id: 'n1' }), componentNode('@StatusPill', { id: 'n2' })]))
    await fireEvent.click(screen.getByRole('button', { name: 'Insert at position 1' }))
    e.insert('@Icon')
    expect(ids(e.latest())).toEqual(['@Icon', '@MetricCard', '@StatusPill'])
  })

  it('reorders and deletes the selection', async () => {
    const e = editor(doc([componentNode('@MetricCard', { id: 'n1' }), componentNode('@StatusPill', { id: 'n2' })]))
    await fireEvent.click(screen.getByRole('button', { name: '@StatusPill', pressed: false }))

    await fireEvent.click(inspector().getByRole('button', { name: 'Move up' }))
    expect(ids(e.latest())).toEqual(['@StatusPill', '@MetricCard'])

    await fireEvent.click(inspector().getByRole('button', { name: 'Delete' }))
    expect(ids(e.latest())).toEqual(['@MetricCard'])
  })

  it('generates the props panel from the component own typedef', async () => {
    editor(doc([componentNode('@MetricCard', { id: 'n1' })]))
    await fireEvent.click(screen.getByRole('button', { name: '@MetricCard' }))
    for (const name of ['value', 'label', 'icon', 'tone', 'sub']) {
      expect(inspector().getByText(name)).toBeInTheDocument()
    }
    // The enum came from lib/types.js, not from a list written here.
    const tone = inspector().getByRole('combobox', { name: 'tone' })
    expect([...tone.options].map((o) => o.value)).toContain('skipped')
  })

  it('edits a scalar prop', async () => {
    const e = editor(doc([componentNode('@MetricCard', { id: 'n1' })]))
    await fireEvent.click(screen.getByRole('button', { name: '@MetricCard' }))
    await fireEvent.input(inspector().getByRole('textbox', { name: 'label' }), { target: { value: 'Runtime' } })
    expect(findNode(e.latest().root, 'n1').props).toEqual({ label: 'Runtime' })
  })

  it('offers a collection prop a BINDING and no text field at all', async () => {
    // The no-fabrication rule as behaviour rather than as a comment: there is no
    // control in this UI that can produce a typed-in scene.
    editor(doc([componentNode('@SceneTable', { id: 'n1' })]))
    await fireEvent.click(screen.getByRole('button', { name: '@SceneTable' }))
    expect(inspector().queryByRole('textbox', { name: 'scenes' })).toBeNull()
    const bind = inspector().getByRole('combobox', { name: 'Bind scenes' })
    expect([...bind.options].map((o) => o.value)).toContain('data:scenes')
  })

  it('binds a collection prop to a real capture', async () => {
    const e = editor(doc([componentNode('@SceneTable', { id: 'n1' })]))
    await fireEvent.click(screen.getByRole('button', { name: '@SceneTable' }))
    await fireEvent.change(inspector().getByRole('combobox', { name: 'Bind scenes' }), { target: { value: 'data:scenes' } })
    expect(findNode(e.latest().root, 'n1').props.scenes).toEqual({ $data: 'scenes' })
  })

  it('binds a single-entity prop with an index, since SceneDetail takes a scene', async () => {
    const e = editor(doc([componentNode('@SceneDetail', { id: 'n1' })]))
    await fireEvent.click(screen.getByRole('button', { name: '@SceneDetail' }))
    await fireEvent.change(inspector().getByRole('combobox', { name: 'Bind scene' }), { target: { value: 'data:scenes' } })
    expect(findNode(e.latest().root, 'n1').props.scene).toEqual({ $data: 'scenes', at: 0 })
  })

  it('declares an input, then binds a child to it', async () => {
    // What makes a composition a COMPONENT rather than a saved arrangement.
    const e = editor(doc([componentNode('@MetricCard', { id: 'n1' })]))
    await fireEvent.input(screen.getByLabelText('New input name'), { target: { value: 'title' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(e.latest().inputs).toEqual([{ name: 'title', type: 'string' }])
    // The Inspector only offers a bind option once ITS OWN `document` prop
    // carries the new input — pushed back in explicitly, the same as the app
    // itself does on every real edit (App.svelte's `updateDocument` always
    // hands ComposeCanvas a fresh `document` prop).
    e.sync()

    await fireEvent.click(screen.getByRole('button', { name: '@MetricCard' }))
    await fireEvent.change(inspector().getByRole('combobox', { name: 'Or bind value' }), { target: { value: 'prop:title' } })
    expect(findNode(e.latest().root, 'n1').props.value).toEqual({ $prop: 'title' })
  })

  it('offers layout in token names, with no length field anywhere', async () => {
    // A ROW inside the root column, so the two stacks are distinguishable by
    // name — the root is a column stack too.
    const e = editor(doc([layoutNode({ id: 'n1', direction: 'row', gap: 'sm' })]))
    await fireEvent.click(screen.getByRole('button', { name: 'Row stack' }))
    const gap = inspector().getByRole('combobox', { name: /gap/i })
    expect([...gap.options].map((o) => o.value)).toEqual(['', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'])
    await fireEvent.change(gap, { target: { value: 'xl' } })
    expect(findNode(e.latest().root, 'n1').gap).toBe('xl')
  })

  it('states the grid the BrandKit does not declare', async () => {
    editor(doc([layoutNode({ id: 'n1', layout: 'grid' })]))
    await fireEvent.click(screen.getByRole('button', { name: 'Grid 2' }))
    expect(inspector().getByText(/no column, gutter or container/)).toBeInTheDocument()
  })

  it('puts no caret inside a grid, so its tracks stay the tracks the document describes', () => {
    // FOUND IN A BROWSER. A caret between cells is a grid ITEM, so a two-column
    // grid spent a track on it and rendered one cell per row — the stage showing
    // a layout the document does not describe.
    const e = editor(doc([layoutNode({ id: 'n1', layout: 'grid', columns: 2, children: [
      componentNode('@MetricCard', { id: 'n2' }),
      componentNode('@StatusPill', { id: 'n3' }),
    ] })]))
    const grid = e.container.querySelector('.node--grid')
    expect([...grid.children].filter((c) => c.classList.contains('caret'))).toEqual([])
    expect(grid.children).toHaveLength(2)
  })

  it('gives a caret no width, so the stage is not wider than the page', () => {
    // The other half of the same fidelity rule: a 16px button between every pair
    // of children pushes the siblings apart, and an arrangement that renders
    // differently once the carets go is not the arrangement being composed.
    const e = editor(doc([componentNode('@MetricCard', { id: 'n1' })]))
    const caret = e.container.querySelector('.caret')
    expect(caret).toBeInTheDocument()
    const styles = readFileSync(join(import.meta.dirname, 'NodeView.svelte'), 'utf8')
    const rule = styles.slice(styles.indexOf('  .caret {'))
    expect(rule.slice(0, rule.indexOf('}'))).toContain('width: 0')
  })

  it('reports a problem in the chrome without hiding the work behind it', () => {
    const e = editor(doc([componentNode('@Ghost', { id: 'n1' })]))
    // Named in BOTH places, deliberately: the chrome says how many problems the
    // document has, and the stage says which node has one. Neither alone tells
    // you where to click.
    expect(screen.getAllByText(/names no component/)).toHaveLength(2)
    expect(e.container.querySelector('.compose__problems')).toHaveTextContent('1 problem')
    // Still editable.
    e.insert('@MetricCard')
    expect(ids(e.latest())).toEqual(['@Ghost', '@MetricCard'])
  })
})
