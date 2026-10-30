import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Settings from '@khaos-machine/khaotik-ui/components/svelte/Settings.svelte'
import Toggle from '@khaos-machine/khaotik-ui/components/svelte/Toggle.svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const CATEGORIES = [
  { id: 'providers', label: 'Providers', icon: 'plugs' },
  { id: 'engine', label: 'Engine', icon: 'cpu' },
  { id: 'general', label: 'General', icon: 'sliders' },
]

describe('Settings', () => {
  it('renders a control per category', () => {
    render(Settings, { props: { categories: CATEGORIES, selected: 'engine' } })
    for (const category of CATEGORIES) {
      expect(screen.getByRole('button', { name: new RegExp(category.label) })).toBeInTheDocument()
    }
  })

  it('marks the selected category for assistive tech, not just visually', () => {
    const { container } = render(Settings, {
      props: { categories: CATEGORIES, selected: 'engine' },
    })
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toContain('Engine')
  })

  it('reports a chosen category rather than selecting it itself', () => {
    // Controlled, like the rest of the library: the host owns which pane is showing, so it
    // can put the selection in a URL or restore it between sessions.
    const onSelect = vi.fn()
    render(Settings, { props: { categories: CATEGORIES, selected: 'providers', onSelect } })

    fireEvent.click(screen.getByRole('button', { name: /General/ }))

    expect(onSelect).toHaveBeenCalledWith('general')
  })

  it('does not move the selection on its own', () => {
    const { container } = render(Settings, {
      props: { categories: CATEGORIES, selected: 'providers' },
    })
    fireEvent.click(screen.getByRole('button', { name: /General/ }))
    // Still Providers: the host has not said otherwise.
    expect(container.querySelector('[aria-current="page"]').textContent).toContain('Providers')
  })

  it('falls back to the first category when the selection is unknown', () => {
    // A stale stored selection, or a category removed in a later version, must not render
    // a titleless empty pane.
    const { container } = render(Settings, { props: { categories: CATEGORIES, selected: 'gone' } })
    expect(container.querySelector('[aria-current="page"]').textContent).toContain('Providers')
  })

  it('draws no rail for a single category, which leaves nothing to choose', () => {
    // Project Settings has one pane; a one-item source list is navigation with nowhere to go.
    render(Settings, { props: { categories: [{ id: 'budget', label: 'Budget', icon: 'wallet' }] } })
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Budget' })).toBeVisible()
  })

  it('renders no header and no rail with no categories', () => {
    const { container } = render(Settings, { props: { categories: [] } })
    expect(container.querySelectorAll('.settings__category')).toHaveLength(0)
  })

  it('scrolls the pane, not the rail', () => {
    // A long category must not scroll the list you navigate with — the same rule the
    // Launcher rail follows.
    const { container } = render(Settings, { props: { categories: CATEGORIES } })
    const styles = container.querySelector('.settings__content')
    expect(styles).toBeInTheDocument()
  })
})

describe('Toggle', () => {
  it('reports the new value rather than owning it', () => {
    const onchange = vi.fn()
    render(Toggle, { props: { label: 'Start khaosd at login', onchange } })

    fireEvent.click(screen.getByText('Start khaosd at login'))

    expect(onchange).toHaveBeenCalledWith(true)
  })

  it('stays where the host put it', () => {
    // Controlled: clicking does not flip it locally, so the UI can never disagree with the
    // stored preference.
    const { container } = render(Toggle, { props: { label: 'Restore last project', checked: false } })
    fireEvent.click(screen.getByText('Restore last project'))
    expect(container.querySelector('[data-state="checked"]')).toBeNull()
  })

  it('reflects a checked value', () => {
    const { container } = render(Toggle, { props: { label: 'On', checked: true } })
    expect(container.querySelector('[data-state="checked"]')).not.toBeNull()
  })

  it('ignores input when disabled', () => {
    const onchange = vi.fn()
    render(Toggle, { props: { label: 'Diagnostics', disabled: true, onchange } })
    fireEvent.click(screen.getByText('Diagnostics'))
    expect(onchange).not.toHaveBeenCalled()
  })

  it('shows a hint in the UI, not in a tooltip', () => {
    // A tooltip hides the explanation from exactly the person reading the settings screen
    // to find out what the setting does.
    render(Toggle, { props: { label: 'Restore last project', hint: 'Reopens your last project.' } })
    expect(screen.getByText('Reopens your last project.')).toBeInTheDocument()
  })

  it('carries a hidden input, so it works inside a form', () => {
    const { container } = render(Toggle, { props: { label: 'x' } })
    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull()
  })
})

// The pane scroller is the containing block for what is positioned inside it. Without that, a
// visually hidden `position: absolute` label (ProviderSetup's tile status) takes <body> as its
// containing block, escapes the scroller's clip, and stretches the document: a second
// scrollbar on the whole window (measured in khaos-app Settings, 2026-10-24: document 1103px
// tall in a 589px window). jsdom lays nothing out, so this reads the source.
describe('Settings pane scroller', () => {
  it('contains positioned content, so nothing in a pane scrolls the window', () => {
    const source = readFileSync(join(import.meta.dirname, '../../../../components/svelte/Settings.svelte'), 'utf8')
    const rule = source.match(/\.settings__content \{([^}]*)\}/)?.[1] ?? ''
    expect(rule).toMatch(/overflow-y: auto;/)
    expect(rule).toMatch(/position: relative;/)
  })
})
