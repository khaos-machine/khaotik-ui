import { describe, it, expect } from 'vitest'
import { schemas, parseProps, propsBlock, classify, componentSources, componentPaths } from './props-schema.js'

const control = (component, prop) => schemas[component].find((p) => p.name === prop).control

describe('the props schema, read out of the components', () => {
  it('has components and props to check', () => {
    // Guards the guard: a wrong glob path would make every assertion below
    // vacuous, and this suite has been caught by exactly that twice.
    expect(Object.keys(schemas).length).toBeGreaterThan(30)
    expect(Object.values(schemas).flat().length).toBeGreaterThan(200)
  })

  it('parses props for every component, with no silent empties', () => {
    const empty = Object.entries(schemas).filter(([, props]) => props.length === 0).map(([n]) => n)
    expect(empty).toEqual([])
  })

  it('reads MetricCard exactly as its typedef declares it', () => {
    expect(schemas.MetricCard.map((p) => p.name)).toEqual(['value', 'label', 'icon', 'tone', 'sub'])
    expect(schemas.MetricCard[0].description).toBe('The metric readout; tabular numerals.')
    expect(schemas.MetricCard.every((p) => p.optional)).toBe(true)
  })

  it('resolves a shared named union to its values', () => {
    // `StatusTone` lives in lib/types.js, so the inspector can offer seven
    // choices rather than a text box that accepts anything.
    expect(control('MetricCard', 'tone')).toEqual({
      kind: 'enum',
      values: ['neutral', 'success', 'warning', 'danger', 'info', 'accent', 'skipped'],
      raw: 'StatusTone',
    })
  })

  it('resolves an inline union of string literals', () => {
    expect(control('Button', 'variant')).toMatchObject({ kind: 'enum', values: ['primary', 'secondary', 'text', 'tool'] })
  })

  it('classifies collections, callbacks, snippets and scalars', () => {
    expect(control('SceneTable', 'scenes')).toMatchObject({ kind: 'collection', entity: 'SceneRecord' })
    expect(control('SceneTable', 'onselect').kind).toBe('callback')
    expect(control('Shell', 'builderOpen').kind).toBe('boolean')
    expect(control('Shell', 'table').kind).toBe('snippet')
    expect(control('MetricCard', 'value').kind).toBe('string')
  })

  it('classifies imported record arrays without guessing their contents', () => {
    expect(control('SceneShotPlanner', 'coverage')).toMatchObject({kind: 'collection', entity: 'CoverageItem'})
    expect(control('ProjectCard', 'analyses')).toMatchObject({kind: 'collection', entity: 'ProjectAnalysis'})
  })

  it('parses a type whose braces nest', () => {
    // `@property {{lines?: number, …}} [stats]` defeats a `\{[^}]*\}` matcher,
    // which stops at the inner brace and reads the NAME as `number}}`. Real props
    // across the kit are this shape, so a naive matcher does not fail loudly —
    // it silently mis-reads a slice of the surface.
    const bodyMeta = schemas.ResourceCatalog.find((p) => p.name === 'bodyMeta')
    expect(bodyMeta.type).toBe('{version?: string, source?: string, hash?: string}')
  })

  it('takes only the Props typedef, not another typedef in the same file', () => {
    // MetaStrip declares `MetaItem` beside `Props`; its `@property` lines are
    // fields of an item, not props of the component.
    expect(schemas.MetaStrip.map((p) => p.name)).toEqual(['items'])
    expect(propsBlock('/** @typedef {Object} Other\n * @property {string} x d */')).toBeNull()
  })

  it('treats an optional-null type as the control for the type itself', () => {
    expect(classify('Voice | null')).toMatchObject({ kind: 'entity', entity: 'Voice' })
    expect(classify('number | null')).toMatchObject({ kind: 'number' })
  })

  it('leaves genuinely opaque types unknown, rather than guessing a control', () => {
    // `any` and `Record<string, any>` carry no shape to build a control from.
    // Four props are this, and calling them `string` would offer a text box for
    // a map — a wrong answer presented as a right one.
    const unknowns = Object.entries(schemas).flatMap(([c, ps]) =>
      ps.filter((p) => p.control.kind === 'unknown').map((p) => `${c}.${p.name}`))
    //
    // `Composed`'s six are opaque BY DESIGN rather than by omission: they are the
    // maps a host supplies — the barrel, the other documents, the data — and the
    // whole point is that the library does not know their shape. A control for
    // them would be a control for "your app's scenes", which is not a thing the
    // catalog can offer.
    expect(unknowns.sort()).toEqual([
      // The Images and Audio destinations' records, peaks and resolved URLs: the engine's or
      // the host's, never typed in.
      'AudioSide.recording', 'AudioTable.peaks',
      // khaosd's analysis record, read by lib/character-analysis.js: the engine's, never typed in.
      'CharacterAnalysis.analysis',
      // Identity-keyed drafts are opaque maps, not freeform catalog controls.
      // Host-resolved media and interaction lock maps have no literal editor control.
      'CharacterAppearanceWorkbench.imageURLs',
      'CharacterAppearanceWorkbench.lookLocks',
      // The Characters destination's reads and per-character maps, keyed by the engine's ids or
      // carrying its records: measured by the host, never typed in.
      'CharacterDetail.imageUrls', 'CharacterDetail.images', 'CharacterDetail.recordings',
      'CharacterSide.graphContext', 'CharacterSide.mentions', 'CharacterSide.voiceBrief',
      'CharacterTable.appearance', 'CharacterTable.portraits', 'CharacterTable.readiness', 'CharacterTable.standings',
      'Composed.components',
      'Composed.data',
      'Composed.document',
      'Composed.documents',
      'Composed.node',
      'Composed.props',
      // The Composer's children's props, passed whole by the host from its composer model; each
      // child's own fixture shows its controls.
      'Composer.inspector', 'Composer.planner', 'Composer.timing',
      // The panels map is the host's own panel set, keyed by the ids its layout names,
      // opaque for the same reason as `Composed`'s maps.
      // A refusal and its fixes, built by the host from the engine's outcome: no literal control.
      'DialogueInspector.offer',
      'Dock.panels',
      // The Review destination's records, their group and the story's identities: the engine's,
      // never typed in.
      'ExtractionReview.story',
      'ImageDetail.row', 'ImageSide.row', 'ImageTable.urls',
      // The launcher's startup checks and status-bar lines: the host's, in the engine's shapes.
      'LauncherWindow.checks', 'LauncherWindow.statusEngine', 'LauncherWindow.statusResult',
      // `rows` is whatever the host measured — one object per item with a label
      // and a numeric field per declared measure. The library cannot know its
      // shape any more than it knows an analysis map's, so there is no control
      // to offer and guessing one would be worse than admitting it.
      'MeasureTable.rows',
      'ObjectAppearanceWorkbench.imageURLs',
      // The Places and Objects destinations' reads, designs and standings: the engine's or the
      // host's, never typed in.
      'ObjectDetail.imageUrls', 'ObjectDetail.images', 'ObjectSide.design',
      'PlaceAnalysis.analysis',
      'PlaceAppearanceWorkbench.imageURLs',
      'PlaceDetail.areas', 'PlaceDetail.imageUrls', 'PlaceDetail.images',
      // A place definition: khaosd's, read through KSPD, never typed in.
      'PlacePlan.definition',
      // Review comparison URLs/labels are host-owned maps. Definition and draft are a
      // named entity (ReviewedPlaceDefinition), bound rather than typed in.
      'PlaceReview.lineArt', 'PlaceReview.sheetLabels', 'PlaceReview.sheets',
      'PlaceSide.design',
      // Each area's kind, keyed by the host's area ids: a map, never typed in.
      'PlaceStructure.areaKinds',
      'PlaceTable.standings',
      'PlaceViewer.definition',
      // A job is a host's object — kind, phase, counts and clocks together —
      // and a control for one prop of it would demo half a state. The catalog
      // shows every job state as its own fixture instead.
      'ProjectCard.job',
      // A destructive history write waiting on the person's yes: the engine's preview, never typed in.
      'ProjectHistory.pending',
      // The data-layer window's status: StatusBar's own result and jobs, passed through.
      'ProjectStatusHUD.jobs', 'ProjectStatusHUD.result',
      // khaosd's waveform peaks, as StoryPlayer.waveforms: measured data, never typed in.
      'ReadTimeline.peaks',
      'RefusalOffer.offer',
      'ReviewSide.group', 'ReviewSide.item',
      // The Scenes destination's analysis records, standings and per-scene read counts: the
      // engine's or measured by the host, never typed in.
      'SceneAnalysis.analysis', 'SceneDetail.analysis', 'SceneDetail.standing',
      'SceneReads.offer',
      'SceneTable.reads', 'SceneTable.standings',
      // Runtime media keyed by the host's scene ids has no literal editor control.
      'ScreenplayEditor.page', 'ScreenplayEditor.texts',
      // What an install row installs, by the host's acting provider id: the host's requirement names.
      'SetupConnect.installNames',
      // The data-layer window's frame: what it passes to its Toolbar, Dock, SourceList, StatusBar
      // and CommandPalette, each the host's records or the layout's tree, never typed in.
      'Shell.budget', 'Shell.commands', 'Shell.engine', 'Shell.jobs', 'Shell.layout', 'Shell.modes', 'Shell.onchangebudget',
      'Shell.paletteCommands', 'Shell.panels', 'Shell.panes', 'Shell.result', 'Shell.sections',
      'ShotInspector.referenceImages',
      // A shot's plan: its blocking, place and object definitions from khaosd, and the host's names.
      'ShotPlan.blocking', 'ShotPlan.definition', 'ShotPlan.names', 'ShotPlan.objectDefinitions',
      // A scene's previs: khaosd's previs read and place definition, and the .glb bytes the host
      // read for the scene, by build key and by object definition, never typed in.
      'ShotPrevis.definition', 'ShotPrevis.figures', 'ShotPrevis.objects', 'ShotPrevis.shot',
      // The Story Atlas's resolved portraits and the layout's neighbor set: the host's and the
      // layout's, never typed in.
      'StoryAtlas.portraitUrls', 'StoryAtlasCanvas.portraits', 'StoryAtlasCanvas.related',
      // The story-wide analyses: khaosd's premise, structure and coverage reads, and a selection
      // by index into them. Never typed in.
      'StoryOverview.coverage', 'StoryOverview.journeys', 'StoryOverview.premise', 'StoryOverview.relationships', 'StoryOverview.structure',
      'StoryOverviewOutline.coverage', 'StoryOverviewOutline.journeys', 'StoryOverviewOutline.premise', 'StoryOverviewOutline.relationships', 'StoryOverviewOutline.structure',
      'StoryOverviewSide.coverage', 'StoryOverviewSide.journeys', 'StoryOverviewSide.relationships', 'StoryOverviewSide.selected', 'StoryOverviewSide.structure',
      'StoryPlayback.portraits', 'StoryPlayer.waveforms',
      // Resolved image URLs keyed by the host's reference ids: no literal control.
      'SubjectImages.urls',
    ])
  })

  it('keeps a source and a repo-relative path for every component', () => {
    // What the D11 source panel and the badge both stake their claim on.
    expect(Object.keys(componentSources).sort()).toEqual(Object.keys(schemas).sort())
    expect(componentPaths.MetricCard).toBe('components/svelte/MetricCard.svelte')
    expect(componentSources.MetricCard).toContain('$props()')
  })

  it('returns nothing for a source with no Props typedef, rather than throwing', () => {
    expect(parseProps('<script>let { a } = $props()</script>')).toEqual([])
  })
})
