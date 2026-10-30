import { describe, it, expect } from 'vitest'
import {
  fixtures,
  resolveFlowSteps,
  APP_GROUPS_IN_APP,
  GROUP_LABELS,
  GROUP_ORDER,
  SECTION_EMPTY,
  SECTION_GROUPS,
  SECTION_ORDER,
} from './fixtures.js'
import engineData from './data/engine.json'
import * as kit from '@khaos-machine/khaotik-ui/components/svelte'
import { componentSources } from './editor/props-schema.js'

// The registry's structural contract. `section` is carried per fixture rather
// than derived from `group`, because a group→section map cannot express "this
// group is ours-generic but this one member is not" — which is exactly the
// KhaosLogo case below, and exactly the D46 error (judge per item, per row).
describe('fixture registry placement', () => {
  const sections = SECTION_ORDER

  it('gives every fixture a section the rail can reach', () => {
    for (const f of fixtures) {
      expect(sections, `${f.name} has an unreachable section "${f.section}"`).toContain(f.section)
    }
  })

  // Asserted as an invariant rather than against a literal count. The literal
  // was 33 and had to be hand-bumped on every addition, which is a number
  // nobody remembers and which says nothing about what is missing — it went
  // nine fixtures out of date without failing, because nothing was ADDED to
  // trip it. What it was really guarding (no export left unplayable) is now
  // `npm run check-catalog`, which measures against the library's own barrel
  // instead of a number in a test.
  it('reaches every fixture across the nav, each exactly once', () => {
    const reached = fixtures.filter((f) => sections.includes(f.section))
    expect(reached.length).toBe(fixtures.length)
    expect(new Set(fixtures.map((f) => f.id)).size).toBe(fixtures.length)
  })

  // The split put four screens where one was — the BrandKit did not move, it
  // came apart — and they keep the order the axes are read in. KhaosLogo left
  // this group for `assets`: it is an artifact the kit ships, not a view of it.
  // Five screens.
  // Icon joined them: iconography is named in the BrandKit's own definition,
  // between type scale and photography, and choosing an icon set fixes stroke
  // weight and optical size across every surface the way a typeface does. It
  // reads in the diary order — colour, type, icons, then the measures.
  it('carries the BrandKit as six screens in one group', () => {
    expect(fixtures.filter((f) => f.group === 'brand').map((f) => f.name))
      .toEqual(['Color', 'Type', 'Icon', 'Shape', 'Layout', 'Tokens'])
    for (const name of ['Color', 'Type', 'Icon', 'Shape', 'Layout', 'Tokens']) {
      const screen = fixtures.find((f) => f.name === name)
      expect(screen.section).toBe('brandkit')
      expect(screen.kind).toBe('screen')
    }
  })

  it('shelves KhaosLogo as a brand asset, not as an atom or a specimen', () => {
    // KhaosLogo.svelte:2-6 — "The Khaos brand mark ... vendored from
    // khaos-ui/brand ... Do not edit the path." It is brand content, and it has
    // moved twice for the same reason: judged per item rather than by the group
    // it happened to sit in. Out of `atoms` because it is not a building block,
    // and out of `brand` because that group holds views OF the kit while this
    // is an artifact the kit ships.
    const logo = fixtures.find((f) => f.name === 'KhaosLogo')
    expect(logo.section).toBe('brandkit')
    expect(logo.group).toBe('assets')
  })

  // The assets shelf is declared to grow — logos and whatever else the kit
  // ships. Today it holds one thing, and that is stated rather than left to be
  // inferred from a passing count somewhere else.
  // The shelf holds ARTIFACTS the kit ships, and it holds more than one now.
  // Exact list rather than `toContain`, so a new entry has to be a decision
  // someone made here — the same reason the icon inventory keeps an exact list.
  // Both members pass the shelf's test: Color, Type and Tokens are each a
  // predicate over the token parse, and neither a brand mark nor a provider's
  // logo is a predicate over anything.
  it('declares the assets shelf inside BrandKit, holding what the kit ships', () => {
    expect(SECTION_GROUPS.brandkit).toEqual(['brand', 'assets'])
    expect(fixtures.filter((f) => f.group === 'assets').map((f) => f.name)).toEqual([
      'KhaosLogo',
      'Providers',
    ])
  })

  // The workspace level is gone: Screens and Flows are peers of the System
  // sections, in one ordered axis. Playground was deleted rather than left
  // declared-and-unrendered, which would have been the worse half of both
  // options — an entry that exists in the data and nowhere else.
  //
  // Compose sits between what it consumes and what it feeds — the published kit
  // on one side, flows on the other — so the axis reads as a pipeline and the
  // four learned layers keep their order. Flows gained its groups declaration in
  // the same change: it was `[]` while nothing could reach it, and a section
  // that now holds authored flows declares the shelf they file on.
  //
  // Compose came and went as a destination. It was a section for one release and
  // is a MODE now: the rail says what you are looking at, and a mode says what
  // you are doing to it. As a section it put authored components in a different
  // room from the published ones they are made of, which is the split the
  // recursive model exists to remove.
  it('declares one flat axis, with Compose a mode rather than a place', () => {
    expect(SECTION_ORDER).toEqual(['brandkit', 'foundation', 'components', 'screens', 'flows'])
    expect(SECTION_ORDER).not.toContain('compose')
    expect(SECTION_GROUPS.compose).toBeUndefined()
    expect(SECTION_GROUPS.flows).toEqual(['flows'])
    expect(SECTION_EMPTY.flows).toMatch(/no flows yet/i)
    expect(SECTION_ORDER).not.toContain('playground')
    expect(SECTION_EMPTY.playground).toBeUndefined()
  })

  // Every destination in the rail must be renderable — declared in
  // SECTION_GROUPS — or the rail offers a click that leads to a blank pane.
  it('gives every railed destination a groups declaration', () => {
    for (const s of SECTION_ORDER) {
      expect(SECTION_GROUPS[s], `${s} is railed but has no groups declaration`).toBeDefined()
    }
  })

  // Layer 2 is what we did NOT build. Foundation therefore holds adopted work
  // and nothing else: Ark UI's primitives and Phosphor's icons. It was 22
  // fixtures when "looks generic" was the test; the other 15 were hand-authored
  // and are layer 3 however primitive they look.
  it('keeps Foundation to what was adopted rather than authored', () => {
    // One group, so the sidebar renders no heading — and none is wanted. The
    // section IS the adopted tier, and this product's foundations are Ark UI
    // throughout, so a classifier would separate the set from nothing.
    expect(SECTION_GROUPS.foundation).toEqual(['adopted'])
    const foundation = fixtures.filter((f) => f.section === 'foundation').map((f) => f.name)
    expect(foundation.sort()).toEqual(
      ['ConfirmDialog', 'EditableField', 'Menu', 'SegmentedControl', 'Toggle'],
    )
    // The tell is the import, not the look: every one of these wraps a
    // dependency. If a fixture lands here without one, it was authored.
    expect(SECTION_GROUPS.foundation).not.toContain('icons')
  })

  it('puts what has actually been adopted on the adopted shelf', () => {
    expect(GROUP_ORDER).toContain('adopted')
    // The shelf was declared-and-empty until Ark UI's Menu was adopted. It
    // stays honest either way: what is on the shelf is what is imported from
    // @ark-ui/svelte. SegmentedControl (Segment Group) joined it when the
    // banner's workspace axis stopped being a dropdown; Menu remains adopted
    // and shelved even though the shell no longer calls it, because the shelf
    // records provenance and not current usage.
    // ConfirmDialog joined for khaos-app's first permitted mutation (#26) — its
    // focus trap, Escape, focus restore and ARIA wiring are Ark's, and only the
    // question and the button treatment are ours.
    //
    // Toggle joined when khaos-app needed a control for a boolean (#18): Ark
    // UI's Switch, dressed in tokens. It is on this shelf and not among the
    // atoms for the same reason the other two are — the shelf records what was
    // adopted, and the checkbox semantics, hidden input, keyboard activation
    // and disabled handling are all the primitive's.
    //
    // EditableField joined last, and differently from the others: it was
    // already in the kit, hand-rolled against a primitive we already depended
    // on. Rebuilding it on Ark's Editable moved it out of Components — the
    // layer-2 test is provenance, so adopting a primitive is what promotes a
    // component to this shelf.
    expect(fixtures.filter((f) => f.group === 'adopted').map((f) => f.name))
      .toEqual(['EditableField', 'Menu', 'SegmentedControl', 'Toggle', 'ConfirmDialog'])
  })

  // The visualisations had no shelf, so they were placed one at a time and
  // ended up in three different places: some among the Foundation atoms, others
  // among the Components inspectors. Nothing was wrong per fixture — there was simply no group that
  // named what they are, and "leaf component" pulled two of them into `atoms`
  // while "renders an entity's relationships" pulled the other two into
  // `inspectors`.
  //
  // A chart is a component, not an atom: it composes nothing, but it encodes
  // editorial rules about what a mark is allowed to claim — BarChart drops a
  // non-finite value rather than drawing it as zero, both refuse to render a
  // zeroed axis when there is no data. That is a tier above a token-dressed
  // primitive, and it is the same judgement in all four.
  it('shelves the visualisations together, under Components', () => {
    expect(GROUP_ORDER).toContain('charts')
    // `composition` joined the shelf with `Composed` — the interpreter that makes
    // a published JSON document renderable by a consuming app. It is its own group
    // because it is neither a visualisation nor a surface: it is the thing that
    // turns a document INTO one.
    // `drafts` is a waiting room for a composed component that has not been
    // filed yet, not a shelf for everything authored here — give one a group and
    // it moves to sit beside its peers.
    // `shell` holds the desktop window's chrome (data-layer plan, Phase K): the dock, the
    // source list, the toolbar and the bars around the work, none of which is a list, a
    // card or an inspector.
    expect(SECTION_GROUPS.components).toEqual(['labels', 'fields', 'media', 'feedback', 'cards', 'rows', 'lists', 'charts', 'inspectors', 'composition', 'shell', 'drafts'])
    // The Story Atlas toolbar and relationship card moved to Screens → Story · Atlas,
    // where the app renders them (catalog app-coverage plan, choice 4).
    expect(fixtures.filter((f) => f.group === 'charts').map((f) => f.name).sort())
      .toEqual(['BarChart', 'MeasureTable', 'RenderStrip'])
    // Every chart is in Components, not Foundation. This is the assertion that
    // fails if one is filed by "it composes nothing" again.
    for (const f of fixtures.filter((c) => c.group === 'charts')) {
      expect(f.section, `${f.name} is a chart but sits in "${f.section}"`).toBe('components')
    }
  })
})

// The engine plate (EngineDetails, in the welcome window) takes a `components` list (#17)
// and maps three legacy fields onto it for backwards compatibility. The fixture once fed it
// the LEGACY shape, so the only thing the catalog demonstrated was the compatibility path —
// the real one was unplayable, and nothing was red.
//
// It also carried a hand-maintained `DAEMON_VERSION` that went stale twice in one
// day: 0.4.11 against a daemon on 0.6.1, then 0.6.1 against 0.6.5.
describe('the engine plate fixture shows the real path, from real data', () => {
  const welcome = fixtures.find((f) => f.name === 'WelcomeWindow')
  const populated = welcome.examples.find((e) => e.label === 'Basic')

  it('passes a components list rather than the legacy three fields', () => {
    expect(populated.props.engine.components, 'engine.components').toBeInstanceOf(Array)
    expect(populated.props.engine.appVersion).toBeUndefined()
    expect(populated.props.engine.daemonVersion).toBeUndefined()
    expect(populated.props.engine.wflAvailable).toBeUndefined()
  })

  it('carries the daemon and every tool /api/health reported', () => {
    const names = populated.props.engine.components.map((c) => c.name)
    expect(names).toContain('khaosd')
    for (const tool of engineData.tools) expect(names).toContain(tool.id)
  })

  it('reports a version where the daemon gave one, and a status where it did not', () => {
    // Every tool reports a semver as of khaosd 0.6.5 — `git` and `ollama` were
    // presence-only when #17 was written. The distinction is the component's own
    // contract, so it must not quietly become "always a version".
    for (const c of populated.props.engine.components) {
      const hasOne = Boolean(c.version) !== Boolean(c.status)
      expect(hasOne, `${c.name} should carry exactly one of version/status`).toBe(true)
    }
  })

  it('takes its versions from the capture, not from a constant', () => {
    const khaosd = populated.props.engine.components.find((c) => c.name === 'khaosd')
    expect(khaosd.version).toBe(engineData.daemonVersion)
    expect(khaosd.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})

// A flow names screens by id, so the failure mode is a name that no longer
// resolves — a screen renamed or retired out from under a sequence that still
// claims it. That is invisible at runtime (a strip simply renders shorter) and
// invisible to every other gate here, so it is asserted directly.
//
// The resolver is exercised against a STATED registry rather than against the
// live one, so these cases hold whatever flows ship and cannot pass by having
// nothing to check. The published flows are checked against the live registry below.
describe('a flow resolves to the screens it names', () => {
  const registry = [
    { id: 'launcher-window', name: 'LauncherWindow', section: 'screens' },
    { id: 'shell', name: 'Shell', section: 'screens' },
    { id: 'status-pill', name: 'StatusPill', section: 'components' },
  ]

  it('resolves every step, in the order the flow states', () => {
    const { steps, missing } = resolveFlowSteps({ steps: ['shell', 'launcher-window'] }, registry)
    expect(steps.map((s) => s.id)).toEqual(['shell', 'launcher-window'])
    expect(missing).toEqual([])
  })

  it('reports an id that resolves to nothing instead of dropping it', () => {
    const { steps, missing } = resolveFlowSteps({ steps: ['launcher-window', 'retired-screen'] }, registry)
    expect(steps.map((s) => s.id)).toEqual(['launcher-window'])
    expect(missing).toEqual(['retired-screen'])
  })

  // A flow sequences SCREENS. A component id is not a step, and resolving one
  // would put a StatusPill in a device frame.
  it('does not resolve a step to a fixture outside the screens section', () => {
    const { steps, missing } = resolveFlowSteps({ steps: ['status-pill'] }, registry)
    expect(steps).toEqual([])
    expect(missing).toEqual(['status-pill'])
  })

  it('treats a flow with no steps as empty rather than erroring', () => {
    expect(resolveFlowSteps({}, registry)).toEqual({ steps: [], missing: [] })
  })

  // FLOWS LIVE IN `components/composed/*.json`, NOT IN `fixtures.js`, and reading the
  // wrong source is what made the guard below vacuous for one commit.
  //
  // A `kind: 'flow'` entry in fixtures.js reaches no renderer in either mode (D72), so
  // `fixtures.filter(f => f.kind === 'flow')` is empty BY CONSTRUCTION and always will
  // be. Both tests here iterated exactly that. The pair was written to make filling the
  // section "a deliberate change to this test rather than a silent one" — and then #60
  // filled it, through a document, in total silence.
  //
  // Proven vacuous in review by replacing the loop body with an assertion that cannot
  // pass; the file stayed green. Read from the same glob the shell reads.
  const flowDocuments = Object.values(
    import.meta.glob('../../../components/composed/*.json', { eager: true }),
  )
    .map((m) => m.default ?? m)
    .filter((d) => d.kind === 'flow')

  it('publishes at least one flow, as a document rather than a fixture', () => {
    expect(fixtures.filter((f) => f.kind === 'flow'), 'a flow in fixtures.js renders nowhere').toEqual([])
    expect(flowDocuments.length, 'no flow document found — the guard below would assert nothing').toBeGreaterThan(0)
  })

  // The guard that matters. A step id naming a screen that does not exist renders
  // FlowStrip's red "names a screen that no longer exists" banner, and before this read
  // documents, renaming a step in first-run.json passed the entire suite AND
  // check-coverage.
  it.each(flowDocuments.map((f) => [f.slug ?? f.name, f]))(
    'leaves no unresolved step in the %s flow',
    (_slug, flow) => {
      const { missing, steps } = resolveFlowSteps(flow)
      expect(missing, `${flow.name} names screens that do not exist`).toEqual([])
      // Guards the resolution itself: with every id unresolvable, `missing` would be
      // non-empty and caught above — but with an EMPTY steps array both are [] and the
      // assertion above passes while proving nothing.
      expect(steps.length).toBe(flow.steps.length)
      expect(steps.length).toBeGreaterThan(0)
    },
  )
})

// The Screens section is Khaos App's own structure (catalog app-coverage plan,
// choice 4): one group per window or shell area, in the order a user meets them,
// so a reviewer finds a pane where the app puts it.
describe('the Screens section follows the app', () => {
  const APP_STRUCTURE = [
    'launcherWindow', 'splashWindow', 'setupWindow', 'settingsWindow', 'projectSettingsWindow', 'voicesWindow', 'resourcesWindow',
    'activityWindow', 'problemReportWindow', 'projectWindow', 'dataLayer', 'storyAtlas', 'storyPlayer',
    'storyScreenplay', 'characters', 'scenes', 'places', 'objects', 'images', 'audio', 'review',
  ]
  const groupOf = (name) => fixtures.find((f) => f.name === name)?.group

  it('declares the app groups in order, with drafts last', () => {
    expect(SECTION_GROUPS.screens).toEqual([...APP_STRUCTURE, 'drafts'])
  })

  it('labels and orders every app group', () => {
    for (const g of APP_STRUCTURE) {
      expect(GROUP_LABELS[g], `${g} has no label`).toBeTruthy()
      expect(GROUP_ORDER, `${g} has no order`).toContain(g)
    }
  })

  it.each([
    ['WelcomeWindow', 'launcherWindow'], ['Settings', 'settingsWindow'],
    ['VoiceStudio', 'voicesWindow'], ['SoundStudio', 'voicesWindow'], ['VoicePresetPanel', 'voicesWindow'],
    ['ResourceCatalog', 'resourcesWindow'], ['ScreenplayEditor', 'storyScreenplay'], ['StoryPlayer', 'storyPlayer'],
    ['CharacterAppearanceWorkbench', 'characters'], ['PlaceAppearanceWorkbench', 'places'], ['ObjectAppearanceWorkbench', 'objects'],
    ['StoryAtlasToolbar', 'storyAtlas'], ['StoryAtlasRelationship', 'storyAtlas'], ['ComposerExportDialog', 'dataLayer'],
  ])('files %s under %s', (name, group) => {
    expect(groupOf(name)).toBe(group)
  })

  it('files nothing in the Screens section outside a declared group', () => {
    for (const f of fixtures.filter((x) => x.section === 'screens')) {
      expect(SECTION_GROUPS.screens, `${f.name} is filed under ${f.group}`).toContain(f.group)
    }
  })
})

// Choice 6: a reviewer sees every app pane populated and empty. A component that
// cannot be empty says why instead.
describe('every app-group fixture shows its empty state', () => {
  const appFixtures = fixtures.filter((f) => APP_GROUPS_IN_APP.includes(f.group))

  it('covers at least the fixtures filed so far', () => {
    expect(appFixtures.length).toBeGreaterThanOrEqual(14)
  })

  it.each(appFixtures.map((f) => [f.name, f]))('%s has an Empty example or says why it cannot', (_name, f) => {
    const hasEmpty = (f.examples ?? []).some((e) => e.label === 'Empty')
    const reason = typeof f.emptyNotApplicable === 'string' && f.emptyNotApplicable.trim().length > 0
    expect(hasEmpty || reason).toBe(true)
  })
})

// Choice 6b: a view that changes with khaosd's setup path shows every state it
// takes — Basic, Advanced, and Advanced with each switch it honours — so a
// reviewer sees what the Advanced path adds without switching an engine.
describe('a view that changes with the setup path shows each state', () => {
  const STATES = {
    path: ['Basic', 'Advanced'],
    history: ['Advanced · Project history'],
    gitSync: ['Advanced · Git sync'],
  }
  const modal = fixtures.filter((f) => f.modes)

  it('declares the views measured to change with it', () => {
    expect(modal.map((f) => f.name).sort()).toEqual(expect.arrayContaining(['Settings', 'WelcomeWindow']))
  })

  it.each(modal.map((f) => [f.name, f]))('%s carries an example for every state it declares', (_name, f) => {
    for (const mode of f.modes) {
      expect(STATES[mode], `${f.name} declares an unknown mode "${mode}"`).toBeDefined()
      for (const label of STATES[mode]) {
        expect(f.examples.map((e) => e.label), `${f.name} has no "${label}" example`).toContain(label)
      }
    }
  })

  it('shows Routing, On-device Engines and Models in Settings only on Advanced', () => {
    const settings = fixtures.find((f) => f.name === 'Settings')
    const panes = (label) => settings.examples.find((e) => e.label === label).props.categories.map((c) => c.id)
    expect(panes('Basic')).toEqual(['providers', 'engine', 'general'])
    expect(panes('Advanced')).toEqual(['providers', 'routing', 'engines', 'models', 'engine', 'general'])
  })

  it('offers on-device engines on the launcher only on Advanced, and Clone only with Git sync', () => {
    const welcome = fixtures.find((f) => f.name === 'WelcomeWindow')
    const props = (label) => welcome.examples.find((e) => e.label === label).props
    expect(props('Basic').services).toBeUndefined()
    expect(props('Advanced').services?.length).toBeGreaterThan(0)
    expect(props('Advanced').clone).toBe(false)
    expect(props('Advanced · Git sync').clone).toBe(true)
    expect(props('Advanced · Project history').onInitGit).toBeTypeOf('function')
    expect(props('Advanced').onInitGit).toBeUndefined()
  })
})

// check-catalog reads fixtures.js as text, so an entry written into a pane array that never
// reaches `fixtures` read as covered: unregistering all five Review panes (T6) passed it and this
// suite. This asks the registry itself.
describe('every export the barrel ships is registered', () => {
  it.each(Object.entries(kit).filter(([, value]) => typeof value === 'function'))('%s', (name, component) => {
    expect(fixtures.some((f) => f.component === component || (f.plays ?? []).includes(name))).toBe(true)
  })

  // A component a consumer imports by deep path (StoryAtlas, StoryAtlasCanvas) is not in the
  // barrel, so the case above cannot see it: every component file is asked for by name.
  it.each(Object.keys(componentSources))('%s, imported by any path', (name) => {
    expect(fixtures.some((f) => f.name === name || (f.plays ?? []).includes(name))).toBe(true)
  })
})
