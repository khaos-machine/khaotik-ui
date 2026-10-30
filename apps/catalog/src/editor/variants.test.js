import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import App from '../App.svelte'
import { STORAGE_KEY } from './storage.js'
import { createDocument } from './document.js'

const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, v), removeItem: (k) => map.delete(k) }
}
const stored = (documents) => fakeStorage({ [STORAGE_KEY]: JSON.stringify({ schema: 1, documents }) })

const card = createDocument({ kind: 'component', slug: 'scene-card', name: 'Scene card' })
const variant = (slug, of, name) => ({ ...createDocument({ kind: 'component', slug, name: name ?? slug }), variantOf: of })

const goSection = (name) => fireEvent.click(screen.getByRole('button', { name: `${name} section` }))
const setMode = (name) => fireEvent.click(screen.getByRole('radio', { name }))
// Scoped to `.nav__open` — the name-bearing button. A row is two buttons now
// (open + insert); a bare `button` selector risks matching the wrong one.
const pick = (name) => fireEvent.click(
  [...document.querySelectorAll('.sidebar__content button.nav__open')].find((b) => b.textContent.trim().startsWith(name)),
)
const tabs = () => [...document.querySelectorAll('[role="tablist"][aria-label="Variants"] button')].map((b) => b.textContent.trim())

describe('variants of a published component', () => {
  it('does not list a variant beside what it competes with, and counts it instead', async () => {
    // Four candidate MetricCards are four variants OF MetricCard, not four
    // entries in the Cards group.
    render(App, { props: { storage: stored([variant('metric-dense', 'MetricCard'), variant('metric-loose', 'MetricCard')]) } })
    await goSection('Components')

    const names = [...document.querySelectorAll('.sidebar__content button.nav__open')].map((b) =>
      [...b.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim())
    expect(names).toContain('MetricCard')
    expect(names).not.toContain('metric-dense')

    // The count is on the parent row, so the candidates are discoverable.
    const row = [...document.querySelectorAll('.sidebar__content button.nav__open')].find((b) => b.textContent.startsWith('MetricCard'))
    expect(within(row).getByText('2')).toBeInTheDocument()
  })

  it('switches between the published thing and its candidates', async () => {
    render(App, { props: { storage: stored([variant('metric-dense', 'MetricCard', 'Dense')]) } })
    await goSection('Components')
    await pick('MetricCard')

    // The first tab is named by what BACKS the thing, not by its name — that is
    // already in the heading beside it.
    expect(tabs()).toEqual(['Svelte', 'Dense'])

    await fireEvent.click(screen.getByRole('tab', { name: 'Dense' }))
    expect(screen.getByRole('tab', { name: 'Dense' })).toHaveAttribute('aria-selected', 'true')
  })

  it('names the first tab Draft when the parent is itself unshipped', async () => {
    render(App, { props: { storage: stored([card, variant('scene-card-b', 'scene-card', 'B')]) } })
    await goSection('Components')
    await pick('Scene card')
    expect(tabs()).toEqual(['Draft', 'B'])
  })

  it('offers a new variant only in Compose', async () => {
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    await pick('MetricCard')
    expect(screen.queryByRole('button', { name: 'New variant' })).toBeNull()

    // Picked AGAIN after the switch, not carried across it: entering the
    // Composer clears the selection by design (D69), so the same component has
    // to be chosen on the surface that can act on it. Asserting the control
    // appears without re-picking would be asserting the old behaviour.
    await setMode('Composer')
    expect(screen.queryByRole('button', { name: 'New variant' })).toBeNull()

    await pick('MetricCard')
    expect(screen.getByRole('button', { name: 'New variant' })).toBeInTheDocument()
  })

  it('never offers one for a flow', async () => {
    // A flow is a sequence rather than a tree; there is no arrangement to vary.
    render(App, { props: { storage: stored([{ schema: 1, kind: 'flow', slug: 'first-run', name: 'First run', steps: [] }]) } })
    await goSection('Flows')
    await setMode('Composer')
    await pick('First run')
    expect(screen.queryByRole('button', { name: 'New variant' })).toBeNull()
  })

  it('is never offered for a BrandKit specimen, though BrandKit itself is reachable', async () => {
    // BrandKit stays railed in every mode (D1) — this is not a guard on the
    // destination. It is `canCreateVariant`'s own, unrelated exclusion: a
    // colour ramp has nothing to vary, whether or not you can navigate to it.
    render(App, { props: { storage: fakeStorage() } })
    await setMode('Composer')
    expect(screen.getByRole('button', { name: 'BrandKit section' })).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: 'BrandKit section' }))
    expect(screen.queryByRole('button', { name: 'New variant' })).toBeNull()
  })

  it('starts a variant of a published component and opens it', async () => {
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    await setMode('Composer')
    await pick('MetricCard')
    await fireEvent.click(screen.getByRole('button', { name: 'New variant' }))

    // The new candidate is selected, and it is editable — a published Svelte
    // component is a leaf, but a variant of one is a document.
    expect(tabs()).toEqual(['Svelte', 'metric-card-variant'])
    expect(screen.getByRole('tab', { name: 'metric-card-variant' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Inspector')).toBeInTheDocument()
  })

  it('starts a variant of a DOCUMENT as a copy of it', async () => {
    // You are varying something. An empty canvas makes the first act rebuilding
    // the thing you were about to change.
    const withBody = {
      ...createDocument({ kind: 'component', slug: 'scene-card', name: 'Scene card' }),
      root: { type: 'layout', id: 'n0', layout: 'stack', gap: 'sm', children: [
        { type: 'component', id: 'n1', component: '@MetricCard', props: { label: 'Scenes', value: '54' } },
      ] },
    }
    render(App, { props: { storage: stored([withBody]) } })
    await goSection('Components')
    await setMode('Composer')
    await pick('Scene card')
    await fireEvent.click(screen.getByRole('button', { name: 'New variant' }))

    // The copied node is on the stage, not an empty frame.
    expect(screen.getByLabelText('Scenes')).toBeInTheDocument()
    expect(within(screen.getByLabelText('Inspector')).queryByText(/no inputs/i)).toBeNull()
  })

  it('starts a variant of a SVELTE component empty, because a leaf has no body', async () => {
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    await setMode('Composer')
    await pick('MetricCard')
    await fireEvent.click(screen.getByRole('button', { name: 'New variant' }))
    expect(screen.getByLabelText('Inspector')).toBeInTheDocument()
    expect(document.querySelectorAll('.node--stack > .shell')).toHaveLength(0)
  })

  it('resets to the parent when the selection changes', async () => {
    // Otherwise the second component you look at opens on a tab index that
    // belonged to the first.
    render(App, { props: { storage: stored([variant('metric-dense', 'MetricCard', 'Dense')]) } })
    await goSection('Components')
    await pick('MetricCard')
    await fireEvent.click(screen.getByRole('tab', { name: 'Dense' }))
    await pick('StatusPill')
    await pick('MetricCard')
    expect(screen.getByRole('tab', { name: 'Svelte' })).toHaveAttribute('aria-selected', 'true')
  })
})
