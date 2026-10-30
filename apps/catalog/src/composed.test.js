import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import * as kit from '@khaos-machine/khaotik-ui/components/svelte'
import Composed from '@khaos-machine/khaotik-ui/components/svelte/Composed.svelte'
import {
  resolveValue, resolveProps, withDefaults, layoutStyle, alignFor,
  isSlug, bareSlug, isLibrarySlug, slugsIn, resolveComponent,
} from '@khaos-machine/khaotik-ui/components/svelte/lib/compose.js'
import scenesDestination from './data/scenes-destination.json'

// OVER THE LIBRARY, from the catalog — the only test surface this repo has.
//
// `Composed` is what a consuming app mounts to render a published
// `components/composed/*.json`, so what is pinned here is the CONSUMER's
// contract, not the catalog's: the host supplies the components, the other
// documents and the data, and the document supplies everything else.
//
// The catalog's own editor renders the same tree through the same module
// (`ComposedView.test.js` covers that side). Two renderers, one implementation —
// which is the reason `lib/compose.js` exists at all.

const card = {
  schema: 1, kind: 'component', slug: 'scene-card', name: 'Scene card',
  inputs: [{ name: 'title', type: 'string' }, { name: 'tone', type: 'StatusTone', default: 'success' }],
  root: { type: 'layout', id: 'n0', layout: 'stack', direction: 'row', gap: 'sm', children: [
    { type: 'component', id: 'n1', component: '@MetricCard', props: { value: { $prop: 'title' }, label: 'Scene' } },
    { type: 'component', id: 'n2', component: '@StatusPill', props: { text: 'Done', tone: { $prop: 'tone' } } },
  ] },
}

const page = {
  schema: 1, kind: 'page', slug: 'triage', name: 'Triage', inputs: [],
  root: { type: 'layout', id: 'n0', layout: 'stack', gap: 'lg', children: [
    { type: 'component', id: 'n1', component: '@scene-card', props: { title: 'Opening' } },
    { type: 'component', id: 'n2', component: '@SceneTable', props: { scenes: { $data: 'scenes' } } },
  ] },
}

const host = { components: kit, documents: { 'scene-card': card }, data: { scenes: scenesDestination.scenes.slice(0, 3) } }
const show = (document, props = {}, extra = {}) =>
  render(Composed, { props: { document, props, ...host, ...extra } })

describe('the shared interpreter', () => {
  it('turns a token name into a custom property, never a length', () => {
    expect(layoutStyle({ layout: 'stack', gap: 'lg', padding: 'md' }))
      .toBe('--node-gap:var(--spacing-lg);--node-padding:var(--spacing-md)')
    expect(layoutStyle({ layout: 'grid', columns: 3 })).toBe('--node-columns:3')
    expect(layoutStyle({ layout: 'stack' })).toBe('')
  })

  it('aligns a stack and says nothing about a grid', () => {
    expect(alignFor({ layout: 'stack', align: 'center' })).toBe('center')
    expect(alignFor({ layout: 'stack' })).toBe('stretch')
    expect(alignFor({ layout: 'grid' })).toBeNull()
  })

  it('splits the namespace on the first character alone', () => {
    expect(isSlug('@MetricCard')).toBe(true)
    expect(isSlug('MetricCard')).toBe(false)
    expect(isLibrarySlug('@MetricCard')).toBe(true)
    expect(isLibrarySlug('@scene-card')).toBe(false)
    expect(bareSlug('@scene-card')).toBe('scene-card')
  })

  it('resolves a slug against what the HOST supplies, not against a baked-in registry', () => {
    expect(resolveComponent('@MetricCard', { components: kit }).kind).toBe('library')
    expect(resolveComponent('@scene-card', { documents: { 'scene-card': card } }).kind).toBe('composed')
    // A Map is accepted as well as a plain object — the catalog holds one.
    expect(resolveComponent('@scene-card', { documents: new Map([['scene-card', card]]) }).kind).toBe('composed')
    expect(resolveComponent('@MetricCard', {})).toEqual({ missing: '@MetricCard' })
  })

  it('resolves the three kinds a prop value may be, and reports a miss by name', () => {
    expect(resolveValue('Runtime')).toEqual({ value: 'Runtime' })
    expect(resolveValue({ $data: 'scenes' }, { data: { scenes: [1, 2] } })).toEqual({ value: [1, 2] })
    expect(resolveValue({ $data: 'scenes', at: 1 }, { data: { scenes: [1, 2] } })).toEqual({ value: 2 })
    expect(resolveValue({ $data: 'scenes', slice: [0, 1] }, { data: { scenes: [1, 2] } })).toEqual({ value: [1] })
    expect(resolveValue({ $prop: 'a.b' }, { inputs: { a: { b: 7 } } })).toEqual({ value: 7 })
    expect(resolveValue({ $data: 'nope' }, { data: {} })).toEqual({ missing: 'nope' })
    expect(resolveValue({ $data: 'scenes', at: 9 }, { data: { scenes: [1] } })).toEqual({ missing: 'scenes[9]' })
    expect(resolveValue({ $prop: 'nope' }, { inputs: {} })).toEqual({ missing: 'nope' })
  })

  it('omits a prop that missed, so the component falls back to its own default', () => {
    const { props, missing } = resolveProps({ a: 1, b: { $data: 'gone' } }, { data: {} })
    expect(props).toEqual({ a: 1 })
    expect(missing).toEqual(['b → gone'])
  })

  it('fills an input from the document own declaration', () => {
    expect(withDefaults([{ name: 'tone', default: 'success' }], {})).toEqual({ tone: 'success' })
    expect(withDefaults([{ name: 'tone', default: 'success' }], { tone: 'danger' })).toEqual({ tone: 'danger' })
  })

  it('collects the slugs a tree references', () => {
    expect(slugsIn(page.root).sort()).toEqual(['@SceneTable', '@scene-card'])
  })
})

describe('Composed, as a consuming app mounts it', () => {
  it('renders a published component by slug, from the components the host passed', () => {
    const { getByLabelText, getByText } = show(card, { title: 'Opening' })
    expect(getByLabelText('Scene')).toBeInTheDocument()
    expect(getByText('Opening')).toBeInTheDocument()
  })

  it('binds $data to the HOST data, not to anything the library knows', () => {
    // The portability claim, asserted: the document says "the scenes
    // collection"; these rows are the ones this caller passed in.
    // The table counts the rows it holds with its header, drawn or not: three, not the capture.
    const { container } = show(page)
    expect(container.querySelector('[role="grid"]')).toHaveAttribute('aria-rowcount', '4')
  })

  it('renders a composed component nested inside a page — the recursion', () => {
    const { getByText } = show(page)
    expect(getByText('Opening')).toBeInTheDocument()
  })

  it('emits layout from tokens', () => {
    const { container } = show(page)
    expect(container.querySelector('.node').getAttribute('style').replace(/\s+/g, ''))
      .toContain('--node-gap:var(--spacing-lg)')
  })

  it('names an unresolvable slug rather than rendering nothing', () => {
    const broken = { ...page, root: { type: 'layout', id: 'n0', layout: 'stack', children: [
      { type: 'component', id: 'n1', component: '@Nope', props: {} },
    ] } }
    expect(show(broken).getByText('@Nope names no component.')).toBeInTheDocument()
  })

  it('reports a binding that resolved to nothing', () => {
    const broken = { ...page, root: { type: 'layout', id: 'n0', layout: 'stack', children: [
      { type: 'component', id: 'n1', component: '@SceneTable', props: { scenes: { $data: 'ghost' } } },
    ] } }
    expect(show(broken).container.textContent).toContain('scenes → ghost')
  })

  it('stops a self-referencing document rather than hanging the tab', () => {
    const loop = { schema: 1, kind: 'page', slug: 'loop', name: 'Loop', inputs: [],
      root: { type: 'layout', id: 'n0', layout: 'stack', children: [
        { type: 'component', id: 'n1', component: '@loop', props: {} },
      ] } }
    const { container } = render(Composed, {
      props: { document: loop, components: kit, documents: { loop }, data: {} },
    })
    expect(container.textContent).toContain('references itself')
  })

  it('says so when a document has no content', () => {
    expect(show({ slug: 'x', name: 'Nothing yet' }).getByText(/has no content yet/)).toBeInTheDocument()
  })

  it('needs no data at all when the document binds none', () => {
    // A consumer composing only scalars should not have to pass a data map.
    const { getByText } = render(Composed, {
      props: { document: card, props: { title: 'Solo' }, components: kit },
    })
    expect(getByText('Solo')).toBeInTheDocument()
  })
})
