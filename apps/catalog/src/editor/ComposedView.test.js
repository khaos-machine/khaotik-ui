import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ComposedView from './ComposedView.svelte'
import { createDocument, layoutNode, componentNode } from './document.js'
import scenesDestination from '../data/scenes-destination.json'

/** A document whose root holds the given children. */
const doc = (children, extra = {}) => ({
  ...createDocument({ slug: 'scene-card', name: 'Scene card' }),
  ...extra,
  root: layoutNode({ id: 'n0', gap: 'lg', children }),
})

const show = (document, props = {}, composed = new Map()) =>
  render(ComposedView, { props: { document, props, composed } })

describe('rendering a composed document', () => {
  it('emits layout from a TOKEN, never a length', () => {
    // The document stores `lg`. What reaches CSS is `var(--spacing-lg)`, so the
    // same document renders against whatever the scale says today — and would
    // become `VStack(spacing: .lg)` on a target that has no CSS at all.
    const { container } = show(doc([]))
    const node = container.querySelector('.node')
    expect(node.getAttribute('style').replace(/\s+/g, '')).toContain('--node-gap:var(--spacing-lg)')
    expect(node.getAttribute('style')).not.toMatch(/\d+px/)
  })

  it('lays a grid out on a column count, the one thing the BrandKit can honestly give it', () => {
    const grid = { ...createDocument({ slug: 'x' }), root: layoutNode({ id: 'n0', layout: 'grid', columns: 3, gap: 'md' }) }
    const { container } = show(grid)
    expect(container.querySelector('.node--grid').getAttribute('style').replace(/\s+/g, '')).toContain('--node-columns:3')
  })

  it('renders a library component by slug, with its props', () => {
    const { getByLabelText, getByText } = show(doc([
      componentNode('@MetricCard', { id: 'n1', props: { value: '4.2 min', label: 'Runtime' } }),
    ]))
    expect(getByLabelText('Runtime')).toBeInTheDocument()
    expect(getByText('4.2 min')).toBeInTheDocument()
  })

  it('renders children in the order the document states', () => {
    const { container } = show(doc([
      componentNode('@MetricCard', { id: 'n1', props: { label: 'First', value: '1' } }),
      componentNode('@MetricCard', { id: 'n2', props: { label: 'Second', value: '2' } }),
    ]))
    const labels = [...container.querySelectorAll('[role="group"]')].map((e) => e.getAttribute('aria-label'))
    expect(labels).toEqual(['First', 'Second'])
  })

  it('binds a collection prop to a real capture, not to typed-in rows', () => {
    const { container } = show(doc([
      componentNode('@SceneTable', { id: 'n1', props: { scenes: { $data: 'scenes' } } }),
    ]))
    // Every captured row reaches the table: its grid counts them with its header, whether or
    // not the rows are drawn (DataTable draws only the visible window).
    expect(container.querySelector('[role="grid"]')).toHaveAttribute('aria-rowcount', String(scenesDestination.scenes.length + 1))
  })

  it('takes a slice of a capture, which is a real subset rather than an invention', () => {
    const { container } = show(doc([
      componentNode('@SceneTable', { id: 'n1', props: { scenes: { $data: 'scenes', slice: [0, 3] } } }),
    ]))
    // Three rows and the header: the slice, not the whole capture.
    expect(container.querySelector('[role="grid"]')).toHaveAttribute('aria-rowcount', '4')
  })

  it('resolves a $prop binding from the document inputs', () => {
    const withInput = { inputs: [{ name: 'title', type: 'string' }] }
    const { getByText } = show(
      doc([componentNode('@MetricCard', { id: 'n1', props: { value: { $prop: 'title' }, label: 'Name' } })], withInput),
      { title: 'Desmond' },
    )
    expect(getByText('Desmond')).toBeInTheDocument()
  })

  it('walks a dotted path into an input', () => {
    const withInput = { inputs: [{ name: 'scene', type: 'SceneRecord' }] }
    const { getByText } = show(
      doc([componentNode('@MetricCard', { id: 'n1', props: { value: { $prop: 'scene.slugline' }, label: 'Scene' } })], withInput),
      { scene: { slugline: 'INT. APARTMENT - NIGHT' } },
    )
    expect(getByText('INT. APARTMENT - NIGHT')).toBeInTheDocument()
  })

  it('fills an unsupplied input from the document own declared default', () => {
    // A composed document has no component to fall back to, so its `inputs`
    // declaration is the only place a default can live.
    const withInput = { inputs: [{ name: 'label', type: 'string', default: 'Runtime' }] }
    const { getByLabelText } = show(
      doc([componentNode('@MetricCard', { id: 'n1', props: { label: { $prop: 'label' } } })], withInput),
    )
    expect(getByLabelText('Runtime')).toBeInTheDocument()
  })

  it('renders a composed component nested inside another — the recursion', () => {
    // This is the model paying off: a composed component IS a component, so it
    // goes wherever a published one goes, with no second code path.
    const card = {
      ...createDocument({ slug: 'scene-card', name: 'Scene card' }),
      inputs: [{ name: 'title', type: 'string' }],
      root: layoutNode({ id: 'n0', children: [
        componentNode('@MetricCard', { id: 'n1', props: { value: { $prop: 'title' }, label: 'Scene' } }),
      ] }),
    }
    const page = doc([
      componentNode('@scene-card', { id: 'n1', props: { title: 'Opening' } }),
      componentNode('@scene-card', { id: 'n2', props: { title: 'Closing' } }),
    ])
    const { getByText } = show(page, {}, new Map([['scene-card', card]]))
    expect(getByText('Opening')).toBeInTheDocument()
    expect(getByText('Closing')).toBeInTheDocument()
  })

  it('names an unresolvable slug instead of rendering nothing', () => {
    // A renamed component that rendered blank would read as a layout bug and
    // send someone looking in the wrong place.
    const { getByText } = show(doc([componentNode('@MetricCrad', { id: 'n1' })]))
    expect(getByText('@MetricCrad names no component.')).toBeInTheDocument()
  })

  it('reports a binding that resolved to nothing', () => {
    const { container } = show(doc([
      componentNode('@SceneTable', { id: 'n1', props: { scenes: { $data: 'scenez' } } }),
    ]))
    expect(container.textContent).toContain('scenes → scenez')
  })

  it('stops a self-referencing document rather than hanging the tab', () => {
    // validate.js is where an author is told about a cycle. This is the second
    // line: a document that arrived some other way must not be able to lock the
    // page, and a render that stops has to SAY it stopped.
    const self = {
      ...createDocument({ slug: 'loop' }),
      root: layoutNode({ id: 'n0', children: [componentNode('@loop', { id: 'n1' })] }),
    }
    const { container } = show(self, {}, new Map([['loop', self]]))
    expect(container.textContent).toContain('references itself')
  })

  it('says so when a document has no content, rather than rendering an empty box', () => {
    expect(show({ slug: 'x', name: 'Empty thing' }).getByText(/has no content yet/)).toBeInTheDocument()
  })
})
