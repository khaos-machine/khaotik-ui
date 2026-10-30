import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import App from '../App.svelte'
import SidebarNav from '../components/shell/SidebarNav.svelte'
import { SECTION_EMPTY, SECTION_ORDER } from '../fixtures.js'
import { STORAGE_KEY } from './storage.js'
import { createDocument, layoutNode, componentNode } from './document.js'

/** A fake key-value store. See storage.test.js for why a fake and not a mock. */
const fakeStorage = (initial = {}) => {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    peek: (k) => map.get(k),
  }
}

const stored = (documents) => fakeStorage({ [STORAGE_KEY]: JSON.stringify({ schema: 1, documents }) })

const card = {
  ...createDocument({ kind: 'component', slug: 'scene-card', name: 'Scene card' }),
  root: layoutNode({ id: 'n0', gap: 'sm', children: [
    componentNode('@MetricCard', { id: 'n1', props: { value: '54', label: 'Scenes' } }),
  ] }),
}

const composedScreen = { ...createDocument({ kind: 'screen', slug: 'scene-triage', name: 'Scene triage' }) }

const goSection = (name) => fireEvent.click(screen.getByRole('button', { name: `${name} section` }))
const setMode = (name) => fireEvent.click(screen.getByRole('radio', { name }))

/** Pick an entry's OPEN button — a row is two buttons now (open + insert). */
const pick = (name) => {
  const button = [...document.querySelectorAll('.sidebar__content button.nav__open')]
    .find((b) => b.textContent.trim().startsWith(name))
  return fireEvent.click(button)
}

/** A row's insert control, by the row's name. */
const insertBtn = (name) => screen.getByRole('button', { name: `Insert ${name}` })

/**
 * The SIDEBAR's create control, scoped to its title row.
 *
 * Scoped because there are now legitimately two routes to the same action: this
 * one, always available while a creatable section is railed, and the empty
 * Composer canvas's call to action (D69/D70). An unscoped `getByRole` matches
 * both the moment the canvas is empty and the section is creatable, which is
 * exactly the state most of these tests set up.
 */
const newBtn = (label) =>
  within(document.querySelector('.sidebar__head')).getByRole('button', { name: label })

/**
 * The EMPTY CANVAS's create control. While that canvas is up the sidebar's own
 * create stands down (`createElsewhere`), so this is the only route in exactly
 * the state most of these tests start from: Composer, nothing open yet.
 */
const startNew = (label) =>
  fireEvent.click(within(document.querySelector('.compose-empty')).getByRole('button', { name: label }))

/**
 * Entry names as listed. Scoped to `.nav__open` — the name-bearing button — the
 * same fix App.test.js needed: a row is two buttons now, and a bare `button`
 * selector would read the insert button's own "+" as a phantom extra row.
 */
const listed = () =>
  [...document.querySelectorAll('.sidebar__content button.nav__open')].map((b) =>
    [...b.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim(),
  )

describe('Compose as a mode', () => {
  it('is not a rail destination', () => {
    // It was one for exactly one release. As a section it put authored
    // components in a different room from the published ones they are made of,
    // which is the split the recursive model exists to remove.
    render(App, { props: { storage: fakeStorage() } })
    expect(SECTION_ORDER).not.toContain('compose')
    expect(screen.queryByRole('button', { name: 'Compose section' })).toBeNull()
  })

  it('is a mode in the app bar, beside the viewport', () => {
    // It belongs there because it OUTLIVES THE SELECTION the way the device size
    // does: you stay in Compose while you walk from one component to the next.
    render(App, { props: { storage: fakeStorage() } })
    expect(screen.getByRole('radio', { name: 'Catalog' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Composer' })).toBeInTheDocument()
  })

  it('opens the editor only in Compose, and the read-only canvas otherwise', async () => {
    render(App, { props: { storage: stored([card]) } })
    await goSection('Components')
    await pick('Scene card')

    // Browse renders it; it does not offer to rearrange it.
    expect(screen.queryByLabelText('Inspector')).toBeNull()
    expect(screen.getByLabelText('Scenes')).toBeInTheDocument()

    // Re-picked, not carried across: entering the Composer clears the
    // selection (D69), so the document has to be opened on the surface that
    // can actually edit it.
    await setMode('Composer')
    await pick('Scene card')
    expect(screen.getByLabelText('Inspector')).toBeInTheDocument()
  })

  it('renders the sidebar identically in both modes — the chrome does not change', async () => {
    // The fix, stated as behaviour: `.sidebar__content` exists, with the SAME
    // rows, whether mode is Browse or Compose. What varies is a row's insert
    // control, never the row itself or the list around it.
    render(App, { props: { storage: stored([card]) } })
    await goSection('Components')
    const browseRows = listed()
    expect(document.querySelector('.sidebar__content')).toBeInTheDocument()

    await setMode('Composer')
    expect(document.querySelector('.sidebar__content')).toBeInTheDocument()
    expect(listed()).toEqual(browseRows)
  })

  it('re-scopes the sidebar list when you click a rail section, in either mode', async () => {
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    await setMode('Composer')
    await startNew('New component')

    expect(listed()).toContain('StatusPill')
    expect(listed()).not.toContain('ProjectWindow')

    await goSection('Screens')
    expect(screen.getByRole('radio', { name: 'Composer' }).checked).toBe(true)
    expect(listed()).toContain('ProjectWindow')
    expect(listed()).not.toContain('StatusPill')
  })

  it('enables a row insert control only once composing with something open', async () => {
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')

    // Browse: present, inert.
    expect(insertBtn('StatusPill')).toBeDisabled()

    // Compose, nothing open yet: still inert.
    await setMode('Composer')
    expect(insertBtn('StatusPill')).toBeDisabled()

    // Compose, something open: functional.
    await startNew('New component')
    await goSection('Components')
    expect(insertBtn('StatusPill')).not.toBeDisabled()
  })

  it('offers the sidebar create control in both modes, standing down only while the canvas offers it', async () => {
    // STILL NOT MODE-GATED — only section-gated (CREATABLE_IN). It was ONLY ever
    // unreachable in Compose because the whole sidebar was, which was the bug.
    //
    // What suppresses it is not the mode but the empty CANVAS, which carries
    // create itself (D69/D70): two controls with the same accessible name on
    // screen at once is the defect that retired Palette.svelte. So it stands
    // down while that canvas is up and returns the moment something is open —
    // which is the distinction this test exists to hold, because "hidden in
    // Compose" and "hidden while nothing is open" look identical at the first
    // assertion and are different rules.
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    expect(newBtn('New component')).toBeInTheDocument()

    await setMode('Composer')
    expect(within(document.querySelector('.sidebar__head')).queryByRole('button', { name: 'New component' })).toBeNull()

    await startNew('New component')
    expect(newBtn('New component')).toBeInTheDocument()
  })

  it('opens on a blank canvas rather than inheriting what the Catalog had open', async () => {
    // D69, and this REPLACES a test asserting the opposite. The old behaviour —
    // landing on whatever the Catalog was showing, which from the default
    // section is a read-only BrandKit specimen — was defended at the time as
    // "no corrective jump", and that half still holds: the rail does not move
    // and the sidebar is still right there. What was wrong is that the
    // AUTHORING surface opened onto something it could not author, in a section
    // with no create control and with every row insert disabled. Measured
    // before the change: 0 of 7 enabled.
    render(App, { props: { storage: fakeStorage() } })

    // The Catalog does land on a BrandKit specimen, and that is correct for it.
    expect(screen.getByRole('heading', { name: 'Color' })).toBeInTheDocument()

    await setMode('Composer')

    // The Composer does not.
    expect(screen.queryByRole('heading', { name: 'Color' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Nothing open' })).toBeInTheDocument()

    // Chrome is untouched by any of it (D68) — the section did not move and the
    // list is still there to leave from.
    expect(document.querySelector('.sidebar__content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'BrandKit section' })).toBeInTheDocument()
  })

  it('carries the create action on the blank canvas, in a section that has no create control', async () => {
    // The dead end this closes: `brandkit` is not in CREATABLE_IN, so the
    // sidebar offers nothing there. All three kinds are offered rather than the
    // current section's, because mirroring CREATABLE_IN would rebuild the same
    // dead end one layer up — `createNew` sets the section itself.
    render(App, { props: { storage: fakeStorage() } })
    await setMode('Composer')
    expect(document.querySelector('.sidebar__head button[aria-label^="New "]')).toBeNull()

    const canvas = within(document.querySelector('.compose-empty'))
    for (const label of ['New component', 'New screen', 'New flow']) {
      expect(canvas.getByRole('button', { name: label })).toBeInTheDocument()
    }

    await fireEvent.click(canvas.getByRole('button', { name: 'New component' }))
    expect(screen.getByLabelText('Inspector')).toBeInTheDocument()
  })

  it('falls through to the read-only canvas for a published Svelte component', async () => {
    // A leaf has no body to arrange. Compose does not hide it — there is simply
    // nothing to edit, and the badge and its source are still there. The sidebar
    // stays visible throughout; it was never Compose's job to remove it.
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    await setMode('Composer')
    await pick('MetricCard')

    expect(screen.queryByLabelText('Inspector')).toBeNull()
    expect(screen.getByRole('button', { name: 'Svelte' })).toBeInTheDocument()
    expect(document.querySelector('.sidebar__content')).toBeInTheDocument()
  })
})

describe('BrandKit is a normal section, in every mode', () => {
  it('stays railed in Compose — nothing is excluded at the section level', async () => {
    // D1: no COMPOSE_HIDES, no narrowing. The rail renders identically whether
    // mode is Browse or Compose.
    render(App, { props: { storage: fakeStorage() } })
    expect(screen.getByRole('button', { name: 'BrandKit section' })).toBeInTheDocument()

    await setMode('Composer')
    expect(screen.getByRole('button', { name: 'BrandKit section' })).toBeInTheDocument()
  })

  it('permanently disables insert for a specimen with no matching export', async () => {
    // Color/Type/Shape/Layout/Tokens document the system; they are not
    // published exports. This is a fact about the ROW (`f.insertable`), true
    // in every mode — not a section-level exclusion.
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    await setMode('Composer')
    await startNew('New component')
    await goSection('BrandKit')

    expect(insertBtn('Color')).toBeDisabled()
  })

  it('enables insert for the one BrandKit row that is a real export, once composing', async () => {
    render(App, { props: { storage: fakeStorage() } })
    await goSection('Components')
    await setMode('Composer')
    await startNew('New component')
    await goSection('BrandKit')

    expect(insertBtn('KhaosLogo')).not.toBeDisabled()
  })
})

describe('where composed documents file', () => {
  it('puts a composed component in Components, not in a room of its own', async () => {
    render(App, { props: { storage: stored([card]) } })
    await goSection('Components')
    expect(listed()).toContain('Scene card')
    // Beside the published ones, in the same list.
    expect(listed()).toContain('MetricCard')
  })

  it('puts a composed screen in Screens, beside the hand-authored ones', async () => {
    // Whether a screen was typed in Svelte or composed in JSON is provenance,
    // not category — the same call the Svelte badge already makes.
    render(App, { props: { storage: stored([composedScreen]) } })
    await goSection('Screens')
    expect(listed()).toContain('Scene triage')
    expect(listed()).toContain('ProjectWindow')
  })

  it('says what an empty section is, rather than showing a blank pane', () => {
    // Against the NAV rather than through App, because App's sections are only
    // empty while the repo is — publishing one document would otherwise turn
    // this red for a reason that is the feature working.
    render(SidebarNav, {
      props: { matches: [], selected: null, collapsed: {}, sortMode: 'group', query: '', section: 'flows' },
    })
    expect(screen.getByText(SECTION_EMPTY.flows)).toBeInTheDocument()
  })
})

describe('the shell around a composed document', () => {
  it('frames it like anything else, so the viewport picker reaches it', async () => {
    const { container } = render(App, { props: { storage: stored([card]) } })
    await goSection('Components')
    await pick('Scene card')
    expect(container.querySelector('.frame')).toBeInTheDocument()
  })

  it('gives the editor a publish control, and the other documents stay in the sidebar', async () => {
    // Both arrived through App, and both were silently missing once before: the
    // prop was written as `documents={documents}` against a source using the
    // shorthand `{documents}`, so the replacement no-opped.
    const other = { ...createDocument({ kind: 'component', slug: 'other-card', name: 'Other card' }) }
    render(App, { props: { storage: stored([card, other]) } })
    await goSection('Components')
    await setMode('Composer')
    await pick('Scene card')

    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    // The other document is a row like any other — reachable, and insertable
    // now that something is open.
    expect(insertBtn('Other card')).not.toBeDisabled()
  })

  it('reports saved work it could not read, and offers it back before anything else', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{not json' })
    render(App, { props: { storage } })
    expect(screen.getByRole('status')).toHaveTextContent(/could not be read/i)
    expect(screen.getByRole('button', { name: 'Copy saved work' })).toBeInTheDocument()
    expect(storage.peek(STORAGE_KEY)).toBe('{not json')
  })

  it('clears the stored payload only when a person chooses to', async () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{not json' })
    render(App, { props: { storage } })
    await fireEvent.click(screen.getByRole('button', { name: 'Discard and start empty' }))
    expect(storage.peek(STORAGE_KEY)).toBeUndefined()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('does NOT warn at start-up when the browser simply has no storage', () => {
    render(App, { props: { storage: null } })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
