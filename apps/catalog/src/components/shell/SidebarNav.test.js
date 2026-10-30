import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import SidebarNav from './SidebarNav.svelte'

// The row-level insert control (D3 of the compose-mode chrome fix): present in
// every row, in every render, identically — only `disabled` varies, and it
// varies for two INDEPENDENT reasons that must not be conflated into one flag.
//
// This is the mechanism that replaced Palette.svelte: instead of a second
// column repeating the same taxonomy for "insert" that Sidebar already shows
// for "open", the row itself carries both actions. See registry.test.js for
// where `f.insertable` is actually computed; this file takes it as given and
// tests only what SidebarNav does with it.

const card = { id: 'statuspill', name: 'StatusPill', section: 'components', group: 'labels', insertable: true }
const specimen = { id: 'color', name: 'Color', section: 'brandkit', group: 'brand', insertable: false }

const base = { section: 'components', selected: null, collapsed: {}, sortMode: 'group', query: '' }

describe('the row insert control', () => {
  it('is present on every row, whether or not it can do anything', () => {
    render(SidebarNav, { ...base, matches: [card] })
    // Present and disabled by default (no canInsert passed) — never absent.
    expect(screen.getByRole('button', { name: 'Insert StatusPill' })).toBeDisabled()
  })

  it('stays disabled when the mode gate is closed, even for an insertable row', () => {
    render(SidebarNav, { ...base, matches: [card], canInsert: false })
    expect(screen.getByRole('button', { name: 'Insert StatusPill' })).toBeDisabled()
  })

  it('stays disabled when the row has nothing real to insert, even when the mode gate is open', () => {
    // The independent half of the gate (D5): `canInsert` alone is not enough.
    render(SidebarNav, { ...base, section: 'brandkit', matches: [specimen], canInsert: true })
    expect(screen.getByRole('button', { name: 'Insert Color' })).toBeDisabled()
  })

  it('is enabled only when both gates are open', () => {
    render(SidebarNav, { ...base, matches: [card], canInsert: true })
    expect(screen.getByRole('button', { name: 'Insert StatusPill' })).not.toBeDisabled()
  })

  it('stays disabled for the document currently open, even though it is otherwise insertable', () => {
    // A document cannot be inserted into itself. This is the cheaper, earlier
    // refusal than the alternative — `validate()` would also catch a self-
    // reference, one step later, as a cycle.
    render(SidebarNav, { ...base, matches: [card], canInsert: true, editingSlug: 'statuspill' })
    expect(screen.getByRole('button', { name: 'Insert StatusPill' })).toBeDisabled()
  })

  it('calls oninsert with the row when clicked while enabled', async () => {
    const oninsert = vi.fn()
    render(SidebarNav, { ...base, matches: [card], canInsert: true, oninsert })
    await fireEvent.click(screen.getByRole('button', { name: 'Insert StatusPill' }))
    expect(oninsert).toHaveBeenCalledWith(card)
  })

  it('does nothing when clicked while disabled', async () => {
    const oninsert = vi.fn()
    render(SidebarNav, { ...base, matches: [card], canInsert: false, oninsert })
    await fireEvent.click(screen.getByRole('button', { name: 'Insert StatusPill' }))
    expect(oninsert).not.toHaveBeenCalled()
  })

  it('leaves the row own open-click untouched, in every gate state', async () => {
    const onselect = vi.fn()
    render(SidebarNav, { ...base, matches: [card], canInsert: true, onselect })
    await fireEvent.click(screen.getByRole('button', { name: 'StatusPill' }))
    expect(onselect).toHaveBeenCalledWith(card)
  })

  it('renders in flat (searched) mode as well as grouped mode', () => {
    // The two branches in the template — one per sort mode — both got the
    // control; this is the one that is easy to add to only one of them by
    // accident.
    render(SidebarNav, { ...base, matches: [card], sortMode: 'name', canInsert: true })
    expect(screen.getByRole('button', { name: 'Insert StatusPill' })).not.toBeDisabled()
  })

  it('is the same control across an entire section, not a one-off', () => {
    const projectCard = { ...card, id: 'projectcard', name: 'ProjectCard' }
    render(SidebarNav, { ...base, matches: [card, projectCard], canInsert: true })
    expect(screen.getAllByRole('button', { name: /^Insert /i })).toHaveLength(2)

    for (const name of ['StatusPill', 'ProjectCard']) {
      expect(screen.getByRole('button', { name: `Insert ${name}` })).not.toBeDisabled()
    }
  })
})
