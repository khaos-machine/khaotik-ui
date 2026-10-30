import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import App from './App.svelte'
import { fixtures, SECTION_ORDER } from './fixtures.js'

// The field is behind a click now: the icon sits on the list column's title row
// and expands in place. Tests go through the button because that is the only
// path a user has — a field rendered-but-hidden would let every one of these
// pass over a control nobody can reach, which is the silent-negative shape.
const search = async () => {
  const open = screen.queryByRole('button', { name: 'Search components' })
  if (open) await fireEvent.click(open)
  return screen.getByRole('searchbox')
}

const typeSearch = async (value) => fireEvent.input(await search(), { target: { value } })

describe('catalog shell', () => {
  // Derived from the registry, not transcribed from it. This was a literal list
  // of 33 names that had to be hand-extended on every addition — and when nine
  // components were added to the library without reaching the catalog, the
  // literal agreed with the nav and stayed green, because both were missing the
  // same nine. A list maintained alongside the thing it checks cannot catch the
  // thing it is there to catch.
  //
  // What this asserts now is a round trip: everything registered is reachable
  // through the rail, and nothing else is. That the registry itself is complete
  // is `npm run check-catalog`, measured against the library's barrel.
  const names = fixtures.filter((f) => SECTION_ORDER.includes(f.section)).map((f) => f.name)

  // Rail controls carry a suffixed accessible name ("BrandKit section"). The
  // visible label is contained in the accessible name, so WCAG 2.5.3 still
  // holds.
  //
  // The suffix was written for a collision that has since ended: "BrandKit" the
  // section against "BrandKit" the fixture, which stopped existing when that
  // screen split into Color / Type / Shape / Tokens. It stays for two reasons —
  // `Screens` still names a workspace AND a section, and the rail applies the
  // rule to every entry, so dropping it for one section would make the naming
  // depend on which fixtures happen to be registered that week.
  //
  // There is no workspace helper any more: that axis was deleted, and its two
  // live destinations are rail entries reached the same way as any other.
  const goSection = (name) =>
    fireEvent.click(screen.getByRole('button', { name: `${name} section` }))

  // The nav button's accessible name is its text nodes only — the "screen"
  // badge span is aria-hidden. Reading the text nodes directly gives the same
  // answer as getByRole without 28 role queries per view.
  //
  // Scoped to `.nav__open` — the name-bearing button — because each row is now
  // TWO buttons (open + a permanently-present insert control), and a bare
  // `ul button` selector would pick up the insert button's own "+" as a phantom
  // extra row.
  const listed = () =>
    [...document.querySelectorAll('.sidebar__content ul button.nav__open')].map((b) =>
      [...b.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join('')
        .trim(),
    )

  // Four acts, all of them the same act now that the workspace level is gone:
  // four rail clicks, one per destination. An earlier arrangement got this to
  // two by rendering every section at once, which traded a fixed cost for one
  // that grows — with 100 components in Foundation, Components sat 100 rows
  // down. Constant-cost clicks beat fewer clicks that degrade with size.
  it('reaches every registered fixture across the nav', async () => {
    render(App)
    const seen = new Set()
    const collect = () => listed().forEach((n) => seen.add(n))

    collect() // BrandKit, the default
    await goSection('Foundation')
    collect()
    await goSection('Components')
    collect()
    await goSection('Screens')
    collect()

    expect([...seen].sort()).toEqual([...names].sort())
  })

  // Flows is a real destination with nothing in it, and says so. Playground is
  // not a destination at all any more — it was deleted from the data rather
  // than left declared and unrendered.
  // Flows carried "no flows yet" until `first-run` was published (#60) — the same
  // flip Foundation took when Ark UI's Menu was adopted, ten lines below. The
  // principle the shelf pins is that an empty section DECLARES its emptiness rather
  // than rendering a blank pane; what changed is that this section is no longer the
  // one demonstrating it.
  it('lists the published flow instead of the empty shelf', async () => {
    render(App)
    await goSection('Flows')
    expect(screen.queryByText(/no flows yet/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'First run' })).toBeInTheDocument()
  })

  // Foundation is adopted work only, and it is now ONE group — so it renders no
  // heading at all. That is deliberate: this product's foundations are Ark UI
  // throughout, so an "Adopted (Ark UI)" label would classify a set with
  // nothing to distinguish it from. The section name already says it.
  it('lists Foundation flat, with no shelf heading to classify against', async () => {
    render(App)
    await goSection('Foundation')
    // the shelf carried "nothing adopted yet" until Ark UI's Menu was adopted
    expect(screen.queryByText(/nothing adopted yet/i)).not.toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'Adopted (Ark UI)' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Icons (Phosphor)' })).not.toBeInTheDocument()
    for (const name of ['ConfirmDialog', 'EditableField', 'Menu', 'SegmentedControl', 'Toggle']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    // the icon sheet went to the BrandKit, and the hand-authored elements to
    // Components; neither is here
    expect(screen.queryByRole('button', { name: 'Icon' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'StatusPill' })).not.toBeInTheDocument()
  })

  it('hides a shelf empty state while a search is active', async () => {
    render(App)
    await goSection('Flows')
    expect(screen.getByRole('button', { name: 'First run' })).toBeInTheDocument()

    // search is global and flattens the list, so the grouped branch — and with it
    // the section's own contents — is not rendered at all. This asserted the
    // disappearance of "no flows yet" until #60 published a flow; the mechanism it
    // pins is the flattening, so it now watches a row that exists rather than an
    // empty state that no longer does.
    await typeSearch('Status')
    expect(screen.queryByRole('button', { name: 'First run' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'StatusPill' })).toBeInTheDocument()
  })

  // The BrandKit splits in two: the kit's own specimens, and the assets that
  // carry the mark. KhaosLogo is not a specimen of anything — it is the mark
  // itself, vendored from khaos-ui/brand — and it sat with Color/Type/Shape
  // only because BrandKit had one shelf to sit on.
  it('shelves brand assets apart from the kit specimens', () => {
    render(App)

    const assets = screen.getByRole('button', { name: 'Brand assets' })
    const logo = screen.getByRole('button', { name: 'KhaosLogo' })
    const color = screen.getByRole('button', { name: 'Color' })

    // the logo is under the assets heading; the specimens are above it
    expect(assets.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(color.compareDocumentPosition(assets) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  // BrandKit held one group until the assets shelf was added, so it rendered no
  // heading at all — which is why `Brand` is a label that had never been
  // displayed until now. Screens still holds one and still renders none.
  // Layout is the between-element half of what Shape used to hold. Shape keeps
  // the measures OF an element — radius, target, stroke; Layout takes the
  // measures BETWEEN them, starting with the spacing scale.
  it('carries Layout as a brand screen, holding the spacing scale', () => {
    render(App)

    expect(screen.getByRole('button', { name: 'Layout' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Layout' }))
  })

  it('renders group headings only where a section holds more than one group', async () => {
    render(App)
    expect(screen.getByRole('button', { name: 'Brand' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Brand assets' })).toBeInTheDocument()

    await goSection('Screens')
    expect(screen.queryByRole('button', { name: 'Screens' })).not.toBeInTheDocument()

    // Foundation holds one group now, so it renders none either — the same rule
    // Screens has always been the example of.
    await goSection('Foundation')
    expect(screen.queryByRole('button', { name: 'Adopted (Ark UI)' })).not.toBeInTheDocument()

    // Components is where the headings are, nine of them.
    await goSection('Components')
    expect(screen.getByRole('button', { name: 'Labels' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Charts' })).toBeInTheDocument()
  })

  it('shows the first fixture by default and switches on click', async () => {
    render(App)
    expect(screen.getByRole('heading', { name: 'Color' })).toBeInTheDocument()

    await goSection('Components')
    await fireEvent.click(screen.getByRole('button', { name: 'MetricCard' }))
    expect(screen.getByRole('heading', { name: 'MetricCard' })).toBeInTheDocument()
  })

  it('switches between example states', async () => {
    render(App)
    await goSection('Components')
    await fireEvent.click(screen.getByRole('button', { name: 'StatusPill' }))
    expect(screen.getByRole('tab', { name: 'Success' })).toHaveAttribute('aria-selected', 'true')

    await fireEvent.click(screen.getByRole('tab', { name: 'Skipped' }))
    expect(screen.getByRole('tab', { name: 'Skipped' })).toHaveAttribute('aria-selected', 'true')
  })

  it('collapses a sidebar group on its header click', async () => {
    render(App)
    await goSection('Components')
    expect(screen.getByRole('button', { name: 'StatusPill' })).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: 'Labels' }))
    expect(screen.queryByRole('button', { name: 'StatusPill' })).not.toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: 'Labels' }))
    expect(screen.getByRole('button', { name: 'StatusPill' })).toBeInTheDocument()
  })

  it('filters fixtures by search query, across every workspace', async () => {
    render(App)
    await typeSearch('Voice')
    // VoiceDesignPanel lives in Components and VoiceStudio in Screens — neither
    // is the active section, so a section-scoped search would find nothing
    expect(screen.getByRole('button', { name: 'VoiceDesignPanel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'VoiceStudio' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'StatusPill' })).not.toBeInTheDocument()
  })

  it('sorts alphabetically in Name mode, across every fixture', async () => {
    render(App)
    await fireEvent.click(screen.getByRole('button', { name: 'Sort by name' }))

    // Read the rendered order once, in document order, rather than resolving
    // every name through getByRole twice per adjacent pair. That form computed
    // ~66 accessible names over the whole tree — which now includes the Color
    // screen's 96 labelled controls on the canvas — and hit the 5s timeout.
    // The cost was the query count, not a defect, and the claim below is
    // strictly stronger than the pairwise-position one it replaces: exact
    // order AND exact membership, not just "each follows the last".
    //
    // `listed()` reads text nodes only, which IS the accessible name here (the
    // "screen" badge is aria-hidden). The first case in this file pins that
    // equivalence by comparing listed() against `names`. It matters: an older
    // form of this test filtered on `names.includes(textContent.trim())`, and a
    // screen fixture's textContent is "Color\n  screen" — .trim() strips only
    // the ends, so every screen fixture silently dropped out.
    // PUBLISHED DOCUMENTS ARE IN THE LIST AND NOT IN `fixtures`. `names` is derived
    // from fixtures.js alone, but the shell also renders every document under
    // `components/composed/*.json` — since #60 that is the `first-run` flow. A flow
    // is authored as a document precisely because a `kind: 'flow'` entry in
    // fixtures.js reaches no renderer, so it can never appear in `fixtures`.
    //
    // Derived from the same glob the shell uses rather than hard-coded, so the next
    // published document is covered without anyone remembering this line exists.
    const documentNames = Object.values(
      import.meta.glob('../../../components/composed/*.json', { eager: true }),
    ).map((m) => (m.default ?? m).name)

    const alphabetical = [...names, ...documentNames].sort((a, b) => a.localeCompare(b))
    expect(listed()).toEqual(alphabetical)
    // Guards the derivation itself: if either source ever came back empty, the
    // equality above would hold against a short list and assert less than it reads.
    expect(alphabetical.length).toBe(fixtures.length + documentNames.length)
    expect(documentNames.length).toBeGreaterThan(0)
  })

  it('opens the settings sheet', async () => {
    render(App)
    await fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Version \d+\.\d+\.\d+/)).toBeInTheDocument()
  })
})

// The nav redesign — docs/plans/2026-08-14-catalog-nav.md.
//
// One axis, in fixed chrome. The rail holds every destination and every view
// control; the banner holds identity; the list column holds search and the list.
// Nothing that navigates lives inside anything that scrolls.
describe('nav structure', () => {
  const goSection = (name) =>
    fireEvent.click(screen.getByRole('button', { name: `${name} section` }))

  // Queried by name, and the name is not cosmetic. dom-accessibility-api 0.5.16
  // maps `header` to `banner` from a flat table (dist/getRole.js:40) with no
  // ancestry check, so Canvas's <header> inside <main> (Canvas.svelte:7-8)
  // computes as a second banner here. Per HTML-AAM it is `generic` — a header
  // descended from main is not a banner — so this is a gap in the test's role
  // computation, not a defect in Canvas, and Canvas is left alone.
  it('keeps product identity in the banner, out of the nav', () => {
    render(App)
    const banner = screen.getByRole('banner', { name: 'Catalog' })
    const nav = screen.getByRole('navigation', { name: 'Components' })

    expect(banner).toHaveTextContent('Khaotik')
    expect(nav).not.toHaveTextContent('Khaotik')
  })

  // The empty-state guard. It exists so an empty destination and a missing one
  // do not look identical (fixtures.js SECTION_EMPTY) — Flows is reachable,
  // renders nothing, and says why.
  // Was: "states why Flows is empty rather than showing a blank pane". #60 published
  // `first-run`, so the section has contents and the explanatory copy is correctly
  // gone. What is worth pinning now is that a flow is REACHABLE IN BROWSE at all —
  // before FlowView, Browse fell through to Canvas, which mounts on
  // `selected.component`; a flow carries none, so it rendered "not yet wired".
  it('renders a flow in Browse rather than falling through to the canvas', async () => {
    render(App)
    await goSection('Flows')
    await fireEvent.click(screen.getByRole('button', { name: 'First run' }))
    expect(screen.queryByText(/not yet wired/i)).not.toBeInTheDocument()
    expect(screen.getByText(/3 steps/)).toBeInTheDocument()

    // The count above comes from FlowView reading `flow.steps.length` — the raw
    // document — so it is true whether or not a single step RESOLVED. Deleting
    // <FlowStrip> from FlowView left the whole suite green on those two assertions
    // alone. Assert the frames, which only FlowStrip renders.
    expect(
      document.querySelectorAll('.flow__step').length,
      'FlowView rendered no step frames — FlowStrip is not mounted',
    ).toBe(3)
    expect(
      document.querySelector('.flow__missing'),
      'a step named a screen that does not exist',
    ).toBeNull()
  })

  // Sections live in a rail OUTSIDE the scrolling list. Putting them inside it
  // — as headings in one tree — made sibling sections unreachable: with 100
  // components in Foundation, Components sits 100 rows below and cannot be
  // reached without first collapsing what precedes it.
  //
  // The rule this pins, taken from Vapi and Supabase: the section control's
  // reach cost is independent of how many items any section holds. It can only
  // hold if the control is not in the scroll.
  it('puts sections in a rail outside the scrolling list', () => {
    render(App)
    const rail = screen.getByRole('navigation', { name: 'Sections' })
    const list = document.querySelector('.sidebar__content')

    for (const s of ['BrandKit', 'Foundation', 'Components']) {
      const control = screen.getByRole('button', { name: `${s} section` })
      expect(rail).toContainElement(control)
      // the load-bearing half: a section control inside the scrolling list
      // would inherit that list's length as its reach cost
      expect(list).not.toContainElement(control)
    }
  })

  // Theme, sort and settings are app-level view controls, not properties of the
  // list. They join the sections in the fixed rail, which leaves the list column
  // holding nothing but search and the list.
  // The workspace bar is gone from the banner entirely — no radiogroup, no
  // segmented control, nothing. Its four entries collapsed into the rail as
  // peers of the sections, so the nav is one axis rather than two.
  //
  // The banner carries a MODE control now, and that is not the thing this case
  // was written against. The workspace bar was a second NAVIGATION axis — four
  // destinations competing with the rail's — and it is still gone. Browse and
  // Compose are not destinations: they say what you are doing to whatever the
  // rail has selected, and they outlive the selection the way the viewport does.
  // The guard stays; it now names the one radiogroup that is allowed.
  it('carries no second navigation axis, only a mode', () => {
    render(App)
    expect(screen.queryByRole('radiogroup', { name: 'Workspace' })).not.toBeInTheDocument()
    for (const w of ['System', 'Playground']) {
      expect(screen.queryByRole('button', { name: w })).not.toBeInTheDocument()
    }

    const groups = screen.getAllByRole('radiogroup')
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveAccessibleName('Mode')
    // By accessible name, not text: the visible label is a sibling of the input
    // in Ark's segmented control, so reading textContent off the radio finds
    // nothing and would pass against a control with no labels at all.
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('radio', { name: 'Catalog' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Composer' })).toBeInTheDocument()
  })

  it('reaches Screens and Flows from the rail, as peers of the sections', async () => {
    render(App)
    await fireEvent.click(screen.getByRole('button', { name: 'Screens section' }))
    expect(screen.getByRole('button', { name: 'ProjectWindow' })).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: 'Flows section' }))
    expect(screen.getByRole('button', { name: 'First run' })).toBeInTheDocument()
  })

  it('puts the view controls in the rail, not the list column', () => {
    render(App)
    const rail = screen.getByRole('navigation', { name: 'Sections' })
    const list = screen.getByRole('navigation', { name: 'Components' })

    for (const name of ['Switch to light theme', 'Sort by name', 'Settings']) {
      const control = screen.getByRole('button', { name })
      expect(rail).toContainElement(control)
      expect(list).not.toContainElement(control)
    }
  })

  // The rail is icon-only, so every control's name comes from aria-label and
  // nothing else. The failure mode is silent — a glyph renders perfectly and
  // reads as nothing — so this is the only assertion that would notice.
  //
  // Visible labels were added here and taken back out. The title is what
  // carries the cost they were answering: palette for BrandKit and cube for
  // Foundation are assignments, not conventions, so the destinations are
  // learn-by-hover and the tooltip is not decoration.
  it('names every rail control despite showing only a glyph', () => {
    render(App)
    const rail = screen.getByRole('navigation', { name: 'Sections' })

    const buttons = [...rail.querySelectorAll('button')]
    expect(buttons.length).toBeGreaterThan(0)
    for (const b of buttons) {
      expect(b.getAttribute('aria-label')).toBeTruthy()
      expect(b.getAttribute('title')).toBeTruthy()
      expect(b.textContent.trim(), 'a visible label is back on the rail').toBe('')
    }
  })

  it('states the theme it will switch to, and switches it', async () => {
    render(App)
    expect(document.documentElement.dataset.theme).toBe('dark')

    await fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
  })

  // With the rail icon-only, the active destination's NAME appears nowhere: the
  // banner carries brand and search, the rail carries glyphs, the list starts
  // at a group heading and the canvas names the fixture. The column title is
  // the one place the word is said.
  it('heads the list column with the active destination', async () => {
    render(App)
    const nav = screen.getByRole('navigation', { name: 'Components' })
    expect(nav).toHaveTextContent('BrandKit')

    await fireEvent.click(screen.getByRole('button', { name: 'Foundation section' }))
    expect(nav).toHaveTextContent('Foundation')
    expect(nav).not.toHaveTextContent('BrandKit')
  })

  // It must not read as another group heading — those are 10px uppercase. Two
  // headings stacked is the mistake the workspace bar made above the section
  // bar, in a different costume.
  it('sets the column title a level above the group headings', () => {
    const { container } = render(App)
    const title = container.querySelector('.sidebar__title')
    const group = screen.getByRole('button', { name: 'Brand' })

    expect(title).toBeTruthy()
    expect(getComputedStyle(title).textTransform).not.toBe('uppercase')
    expect(getComputedStyle(group).textTransform).toBe('uppercase')
    // and it is chrome, not content — the list scrolls under it
    expect(container.querySelector('.sidebar__content')).not.toContainElement(title)
  })

  it('lists one section at a time, and switches on a rail click', async () => {
    render(App)
    expect(screen.getByRole('button', { name: 'Color' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'StatusPill' })).not.toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: 'Components section' }))
    expect(screen.getByRole('button', { name: 'StatusPill' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Color' })).not.toBeInTheDocument()
  })

  it('marks the active section in the rail', async () => {
    render(App)
    expect(screen.getByRole('button', { name: 'BrandKit section' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Foundation section' })).not.toHaveAttribute('aria-current')

    await fireEvent.click(screen.getByRole('button', { name: 'Foundation section' }))
    expect(screen.getByRole('button', { name: 'Foundation section' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'BrandKit section' })).not.toHaveAttribute('aria-current')
  })

  // Search sat here, moved to the banner, and has come back to the title row.
  // The banner's stated reason — "it filters the whole registry, so it belongs
  // in the region that spans everything" — conflated what search filters OVER
  // with where the result lands. The result only ever lands in this column;
  // search never touches the canvas or the rail, and the banner spans both.
  //
  // What was actually wrong with the old placement was never the column. It was
  // the word "Foundation" standing above cross-section results, and that defect
  // outlived the move — it is what the next case pins.
  //
  // Containment, not DOM order: the banner also precedes the list, so an order
  // assertion cannot tell the two placements apart and would pass unchanged
  // through this move in either direction.
  it('puts search on the list column title row, not in the banner', async () => {
    render(App)
    const banner = screen.getByRole('banner', { name: 'Catalog' })
    const nav = screen.getByRole('navigation', { name: 'Components' })

    const toggle = screen.getByRole('button', { name: 'Search components' })
    expect(nav).toContainElement(toggle)
    expect(banner).not.toContainElement(toggle)
    // chrome, not content — it must not scroll away with the list, which is the
    // reach-cost rule the rail exists to enforce
    expect(document.querySelector('.sidebar__content')).not.toContainElement(toggle)

    const input = await search()
    expect(nav).toContainElement(input)
    expect(banner).not.toContainElement(input)
    // the click that opens it must also land the caret in it — otherwise the
    // control costs two clicks where the old always-open field cost none, and
    // the failure is silent: the field looks ready and swallows the first keys
    expect(input).toHaveFocus()
  })

  // GATE A — the defect this move is really for, measured before it landed:
  // with `Voice` typed, the list held a Screens fixture and a Components
  // fixture while the title above it read "BrandKit", a
  // section holding neither. It was true in the banner arrangement too.
  //
  // The repair is that the title yields its row to the field for exactly as
  // long as the query is live, so the word is absent precisely when it would be
  // wrong. The first assertion is the control: without it, a column that never
  // named anything would pass this.
  it('names no section while a search is active', async () => {
    render(App)
    const nav = screen.getByRole('navigation', { name: 'Components' })
    expect(nav).toHaveTextContent('BrandKit')

    await typeSearch('Voice')
    expect(screen.getByRole('button', { name: 'VoiceStudio' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'VoiceDesignPanel' })).toBeInTheDocument()

    expect(nav).not.toHaveTextContent('BrandKit')
    expect(document.querySelector('.sidebar__title')).toBeNull()
  })

  // The behaviour the placement claims. Unchanged by the move and deliberately
  // so: if search ever became section-scoped, the title-row home would be
  // right for a different reason and this case is what would have to be
  // rewritten first. It pins the reason, not the position.
  it('searches across sections, not just the active one', async () => {
    render(App)
    // StatusPill is in Components; the default section is BrandKit
    await typeSearch('StatusPill')
    expect(screen.getByRole('button', { name: 'StatusPill' })).toBeInTheDocument()
  })

  // GATE C. A collapsed icon sitting over a live query is the "why is my list
  // empty" trap: a filter you cannot see is a filter you forget is on. Blur is
  // the moment it would happen, so blur is what this drives.
  it('keeps the field open once a query is live', async () => {
    render(App)
    const input = await search()
    await fireEvent.input(input, { target: { value: 'Voice' } })
    await fireEvent.blur(input)

    expect(screen.getByRole('searchbox')).toHaveValue('Voice')
    expect(screen.queryByRole('button', { name: 'Search components' })).not.toBeInTheDocument()
  })

  // GATE D, the other half. An always-open field would satisfy C on its own,
  // so C alone cannot tell "stays open because the query is live" from "never
  // closes". This is the silence case for that guard.
  it('collapses back to an icon when the query is empty', async () => {
    render(App)
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()

    const input = await search()
    expect(input).toBeInTheDocument()
    await fireEvent.blur(input)
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  // GATE E. Clearing is the only way back to the section name, so it is the
  // only thing standing between a live query and a column that has lost its
  // heading for good.
  it('clears back to the section title and the full section list', async () => {
    render(App)
    await typeSearch('Voice')
    await fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(document.querySelector('.sidebar__title')).toHaveTextContent('BrandKit')
    expect(screen.getByRole('button', { name: 'Color' })).toBeInTheDocument()
  })

  // GATE F. Same doctrine as SECTION_EMPTY for Flows: a destination that is
  // empty and one that failed to render look identical from the outside. A
  // search matching nothing rendered an empty <ul> and said nothing at all.
  it('states that nothing matched instead of showing a blank column', async () => {
    render(App)
    await typeSearch('qqzzx')

    expect(document.querySelectorAll('.sidebar__content ul button')).toHaveLength(0)
    expect(screen.getByText(/nothing matches/i)).toBeInTheDocument()
  })
})
