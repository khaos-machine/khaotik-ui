import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FixtureView from './FixtureView.svelte'
import PaneStub from './PaneStub.test.svelte'
import StatusPill from '@khaos-machine/khaotik-ui/components/svelte/StatusPill.svelte'
import { fixtures } from '../../fixtures.js'

// An app window is a set of named panes. A fixture names what goes in each, and
// FixtureView hands every key to the component as that snippet prop.
describe('FixtureView named snippets', () => {
  const fixture = { name: 'Window', component: PaneStub }
  const pill = (text) => ({ component: StatusPill, props: { text } })
  const region = (container, name) => container.querySelector(`[data-region="${name}"]`).textContent

  it('renders each named snippet into its own region', () => {
    const example = { props: {}, snippets: { table: [pill('rows')], detail: [pill('one row')], side: [pill('inspector')] } }
    const { container } = render(FixtureView, { props: { fixture, example } })

    expect(region(container, 'table')).toContain('rows')
    expect(region(container, 'detail')).toContain('one row')
    expect(region(container, 'side')).toContain('inspector')
  })

  it('leaves a region the example does not name empty', () => {
    const example = { props: {}, snippets: { table: [pill('rows')] } }
    const { container } = render(FixtureView, { props: { fixture, example } })

    expect(region(container, 'table')).toContain('rows')
    expect(region(container, 'side').trim()).toBe('')
  })

  it('refuses a snippet name it has no wrapper for, rather than drawing it blank', () => {
    const example = { props: {}, snippets: { footer: [pill('lost')] } }
    expect(() => render(FixtureView, { props: { fixture, example } })).toThrow(/no snippet wrapper for footer/)
  })
})

// Every catalog example that passes snippets renders: a name FixtureView has no wrapper for
// throws at render, and before this ran on the real fixtures that throw reached the catalog
// window instead (T3's `read`, `reads` and `line`).
describe('the catalog examples with snippets', () => {
  const withSnippets = fixtures.flatMap((f) =>
    (f.examples ?? []).filter((ex) => ex.snippets).map((ex) => [`${f.name} · ${ex.label}`, f, ex]),
  )

  it('there are some, so this cannot pass on nothing', () => {
    expect(withSnippets.length).toBeGreaterThan(0)
  })

  it.each(withSnippets)('%s renders', (_label, fixture, example) => {
    expect(() => render(FixtureView, { props: { fixture, example } })).not.toThrow()
  })
})
