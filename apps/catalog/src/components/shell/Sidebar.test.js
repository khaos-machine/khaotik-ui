import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte'
import Sidebar from './Sidebar.svelte'
import { fixtures } from '../../fixtures.js'

// Sidebar owns only layout — every callback is forwarded to a child. A missed
// forward throws nothing: `onX?.()` on an undefined prop silently no-ops and
// the control just stops working. These pin the wiring itself.
//
// The workspace dropdown moved to the banner (App.svelte), so its forwarding
// and its menu semantics are now asserted in App.test.js — relocated, not
// dropped. What remains here is what the sidebar still owns: section and search.
describe('Sidebar prop forwarding', () => {
  const base = {
    matches: [],
    selected: null,
    section: 'brandkit',
  }

  // Search is back in this column, on the title row rather than below the list.
  // It still filters the whole registry — the column does not own the query, it
  // only hosts the control and forwards changes up, which is why `onquery` is
  // asserted rather than any filtering behaviour.
  //
  // The forward is the load-bearing half: `onquery?.()` against an undefined
  // prop silently no-ops, so a missed wire types into a field that filters
  // nothing and throws nothing.
  it('holds the search on its title row and forwards the query up', async () => {
    const onquery = vi.fn()
    render(Sidebar, { ...base, matches: fixtures, onquery })

    await fireEvent.click(screen.getByRole('button', { name: 'Search components' }))
    const input = screen.getByRole('searchbox')
    await fireEvent.input(input, { target: { value: 'Voice' } })

    expect(onquery).toHaveBeenCalledWith('Voice')
    // and it is chrome: the list scrolls under it, so it cannot inherit the
    // list's length as its reach cost
    expect(document.querySelector('.sidebar__content')).not.toContainElement(input)
  })

  // Group collapse is what this column still owns; the section axis is the
  // rail's. Components is used because it holds the most groups, so headings
  // render at all. (This was Foundation, back when Foundation was the section
  // with more than one group. It now holds two shelves of adopted work and
  // Components is where the subdivision lives.)
  it('forwards a namespaced group toggle up', async () => {
    const ontoggle = vi.fn()
    render(Sidebar, { ...base, matches: fixtures, section: 'components', ontoggle })

    await fireEvent.click(screen.getByRole('button', { name: 'Labels' }))
    expect(ontoggle).toHaveBeenCalledWith('group:labels')
  })

  // The column carries no app-level identity any more. Asserted rather than
  // assumed: leaving a second product title or a second workspace control in
  // the sidebar would look like a duplicate, not like a failure.
  // Queried by the role the control actually has now. The first version of this
  // looked for a button named /^Workspace:/ — the old dropdown trigger's label
  // format — which stopped existing when the axis became a segmented control,
  // so it would have passed against a sidebar that still rendered one.
  it('holds no product identity and no workspace control', () => {
    render(Sidebar, base)

    expect(screen.queryByText('Khaotik')).not.toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Workspace' })).not.toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  // The namespacing guard. `labels` is what the un-prefixed scheme would have
  // written; under namespacing it addresses nothing, so the group stays
  // expanded and its items stay listed.
  //
  // Needs real `matches` — the shared `base` passes an empty array, and with no
  // fixtures the items assertion below fails whether the key is namespaced or
  // not, which would make the probe unable to tell the two apart.
  it('ignores an un-namespaced collapse key', () => {
    render(Sidebar, { ...base, matches: fixtures, section: 'components', collapsed: { labels: true } })

    expect(screen.getByRole('button', { name: 'Labels' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'StatusPill' })).toBeInTheDocument()
  })

  // The column carries no section control. Asserted rather than assumed: a
  // second one here would read as a duplicate of the rail rather than as a
  // failure, and would reintroduce the scroll-length reach cost the rail exists
  // to remove.
  it('holds no section control of its own', () => {
    render(Sidebar, { ...base, matches: fixtures })

    expect(screen.queryByRole('navigation', { name: 'Sections' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Foundation section' })).not.toBeInTheDocument()
  })

  // `createElsewhere` is the one input here that SUPPRESSES rather than
  // forwards, so it gets its own case: the section is creatable and `oncreate`
  // is wired, and the control is still absent. Asserted in both directions,
  // because a prop that only ever hides things passes a one-sided test even
  // when it is stuck on.
  it('stands its create control down when the canvas is already offering one', () => {
    const base2 = { ...base, matches: fixtures, section: 'components', oncreate: vi.fn() }

    render(Sidebar, { ...base2, createElsewhere: true })
    expect(screen.queryByRole('button', { name: 'New component' })).not.toBeInTheDocument()

    cleanup()
    render(Sidebar, { ...base2, createElsewhere: false })
    expect(screen.getByRole('button', { name: 'New component' })).toBeInTheDocument()
  })

  // Insertion, like everything else here, is a plain passthrough — Sidebar owns
  // layout, not the function decision. A thin wiring test, matching the shape of
  // every other forward in this file, over what SidebarNav.test.js covers in
  // full.
  it('forwards insertion straight through to SidebarNav, unconditionally', async () => {
    // `insertable` is App's decoration, not Sidebar's concern — set by hand
    // here so this stays a pure wiring test, not a re-test of that computation
    // (which is registry.test.js's job).
    const matches = fixtures.map((f) => (f.name === 'StatusPill' ? { ...f, insertable: true } : f))
    const oninsert = vi.fn()
    render(Sidebar, { ...base, matches, section: 'components', oninsert, canInsert: true })

    await fireEvent.click(screen.getByRole('button', { name: 'Insert StatusPill' }))
    expect(oninsert).toHaveBeenCalledWith(matches.find((f) => f.name === 'StatusPill'))
  })
})
