<script>
  import { fixtures, APP_VERSION } from './fixtures.js'
  import { load as loadCompose, defaultStorage, STORAGE_KEY } from './editor/storage.js'
  import { composedRegistry } from './editor/registry.js'
  import { descriptors } from './editor/descriptors.js'
  import ComposeBanner from './editor/ComposeBanner.svelte'
  import ComposeCanvas from './editor/ComposeCanvas.svelte'
  import ComposeEmpty from './editor/ComposeEmpty.svelte'
  import FlowCanvas from './editor/FlowCanvas.svelte'
  import { save as saveCompose } from './editor/storage.js'
  import { createDocument, SCHEMA_VERSION } from './editor/document.js'
  import { mergeDocuments, publishedSlugs, publish } from './editor/published.js'
  import { attachVariants } from './editor/registry.js'
  import SegmentedControl from '@khaos-machine/khaotik-ui/components/svelte/SegmentedControl.svelte'
  import KhaosLogo from '@khaos-machine/khaotik-ui/components/svelte/KhaosLogo.svelte'
  import SectionRail from './components/shell/SectionRail.svelte'
  import Sidebar from './components/shell/Sidebar.svelte'
  import Canvas from './components/shell/Canvas.svelte'
  import FlowView from './components/shell/FlowView.svelte'
  import Settings from './components/shell/Settings.svelte'
  import ViewportPicker from './components/shell/ViewportPicker.svelte'
  import {
    DEFAULT_DEVICE,
    DEFAULT_ORIENTATION,
    defaultSizeFor,
  } from './components/shell/viewports.js'

  // `storage` is a prop so a test can hand in a fake. main.js passes nothing and
  // gets the browser's; reaching for the global from inside the component
  // instead would make every test that mounts App depend on the environment
  // having one — and jsdom does not.
  let { storage = defaultStorage() } = $props()

  // The composed documents, read once at start-up. Held here beside `selected`
  // and `section` because the SIDEBAR needs them — this is already the shell's
  // state home, and a rune module of its own would put shell state somewhere the
  // shell does not currently look, for one consumer.
  //
  // A read problem is kept rather than swallowed: unreadable saved work is
  // reported with the payload still intact, never quietly replaced with an empty
  // workspace (see editor/storage.js).
  // svelte-ignore state_referenced_locally
  // Read ONCE, deliberately. The warning is about props being reactive, and this
  // one is not meant to be: saved work is restored at start-up, and re-reading it
  // when the prop changed would throw away whatever has been composed since.
  const restored = loadCompose(storage)
  let documents = $state(restored.documents)

  // ONLY A PROBLEM THAT PUTS WORK AT RISK is raised here. `storage.js` also
  // reports `unavailable` — a private window, a hardened webview — and at
  // start-up that is not news: nothing has been composed yet, so nothing is
  // lost, and a warning before the first edit is noise. The honest moment to say
  // "this will not be remembered" is when a SAVE fails, which is where it is
  // said. A problem carrying `raw` is the other case: stored work exists and
  // could not be read, and that must never pass silently.
  let storageProblem = $state(restored.problem?.raw ? restored.problem : null)

  // BROWSE or COMPOSE. A mode rather than a destination: what you are looking at
  // is the rail's job, and what you are doing to it is this. Compose was a rail
  // section, which put authored components in a different room from the
  // published ones they are made of — the exact split the recursive model exists
  // to remove, since a composed component IS a component.
  //
  // Held here, and beside the viewport rather than in the rail, because it
  // OUTLIVES THE SELECTION the way the device size does: you stay in Compose
  // while you walk from one component to the next. That is the same argument
  // ViewportPicker's placement already makes.
  let mode = $state('browse')

  // No section-narrowing, no selection-correction effect. Both used to exist to
  // route around BrandKit being unreachable while composing — one kept `section`
  // in range of a shrinking rail, the other rescued you from a dead BrandKit
  // screen with no sidebar to leave it from. Neither problem exists once the
  // rail and sidebar render every section, identically, in both modes (D1/D2 —
  // see the plan). Deleting patches that existed only to route around a mistake
  // is not a judgment call.
  const MODES = [
    { value: 'browse', label: 'Catalog' },
    { value: 'compose', label: 'Composer' },
  ]

  // THE COMPOSER OPENS ON A BLANK CANVAS (D69). Entering it used to inherit the
  // Catalog's selection, which is how the authoring surface came to open onto a
  // read-only BrandKit specimen it could not author — with no create control in
  // that section and every row insert disabled, i.e. nothing to do and no
  // visible way out.
  //
  // A FUNCTION, NOT AN `$effect`. An effect watching `mode` and writing
  // `selected` would also fire when something else invalidated it, and would
  // count whatever it read while running as its own dependency — the exact
  // shape that made the insert effect retrigger itself. This runs once, where
  // the transition actually happens.
  //
  // `createNew` deliberately does NOT come through here: it sets `mode` itself
  // and then selects the thing it just made, which is the whole point of having
  // pressed it.
  function setMode(next) {
    if (next === mode) return
    mode = next
    // Only on the way IN. Returning to the Catalog keeps what you were looking
    // at, because the Catalog can show anything — it is the surface with no
    // precondition on its selection.
    if (next === 'compose') {
      selected = null
      variantIndex = 0
      exampleIndex = 0
    }
  }

  let selected = $state(fixtures[0])
  let exampleIndex = $state(0)
  // Which candidate is on the canvas. 0 is the thing itself; 1..n are its
  // variants. Held as an INDEX ON THE PARENT rather than by selecting the
  // variant, so the nav stays coherent — a variant is deliberately not listed
  // beside what it is competing to become, so selecting one would leave the
  // sidebar highlighting nothing.
  let variantIndex = $state(0)
  let theme = $state('dark')
  let collapsed = $state({})
  let query = $state('')
  let sortMode = $state('group') // 'group' | 'name'
  let settingsOpen = $state(false)
  // The canvas frame. Held here rather than in Canvas because it must SURVIVE a
  // change of fixture — the question a viewport answers is "does this hold up
  // at 390?", and you ask it of one component after another. Resetting on
  // select, the way exampleIndex does below, would make you re-choose the
  // viewport for every component you compared, which is the whole task. That it
  // outlives the selection is also why its control sits in the app bar rather
  // than on the canvas chrome.
  //
  // Three fields, because it is three independent choices (see viewports.js).
  // Size is per-device, so changing device resets it to that device's own
  // default — carrying `2xl` from Web over to Mobile would name a size the mobile
  // list does not have.
  let device = $state(DEFAULT_DEVICE)
  let size = $state(defaultSizeFor(DEFAULT_DEVICE))
  let orientation = $state(DEFAULT_ORIENTATION)

  // BrandKit is the palette, type, shape and token screens — documentation of
  // the system rather than product surfaces, with no responsive behaviour to
  // playtest. Framing them at 390 would be a control doing something pointless
  // rather than nothing, so the whole feature switches off there.
  const framing = $derived(section !== 'brandkit')

  function pickDevice(d) {
    device = d
    size = defaultSizeFor(d)
  }
  // The nav's one axis. It lives in the rail, outside the scroll, so reaching
  // any destination costs the same whether it holds 3 components or 300.
  let section = $state('brandkit')

  // The search filter is the shell's one piece of derived state; grouping and
  // name-sorting are the nav's concern (SidebarNav).
  // The published kit plus whatever has been composed. One list, because a
  // composed component IS a component: the sidebar, the canvas and the flow
  // strip should not be able to tell which half an entry came from.
  // The published kit, the documents committed to the repo, and the local
  // drafts. A draft wins over the published file of the same slug, because a
  // draft is what is being edited — showing the committed version while someone
  // types into it would be the surprise.
  const allDocuments = $derived(mergeDocuments(documents))

  // Variants hang off what they are a variant of rather than filing beside it:
  // four candidate MetricCards are four variants OF MetricCard, not four entries
  // in the Cards group. `orphans` is a variant whose parent has been renamed —
  // reported rather than dropped, because it is work that would otherwise vanish
  // from the app without saying so.
  const attached = $derived(
    attachVariants([...fixtures, ...composedRegistry(allDocuments)], allDocuments),
  )
  // DRAFT IS A PROPERTY OF AN ENTRY, not a place. A composed document with no
  // committed file is unshipped; a published export and a committed document are
  // both shipped, whatever they are made of. Marked here because this is the only
  // level that knows both halves — the registry does not know what has been
  // written to the repo, and the nav should not have to ask.
  //
  // INSERTABLE IS ALSO A PROPERTY OF AN ENTRY, computed the same way and for the
  // same reason — it is what the row's insert control in SidebarNav reads to
  // decide whether it is EVER functional, in any mode. True for anything with a
  // real document (a composed component) or a real barrel export (a published
  // one); false for a catalog-local specimen with neither — the BrandKit screens
  // that document the system (Color, Type, Shape, Layout, Tokens) rather than
  // holding a piece of it. This is what replaced the old section-level exclusion
  // of BrandKit: the distinction was never "which section", it was "does this
  // row correspond to something real", and that question has the same answer
  // regardless of section or mode.
  const registry = $derived(
    attached.registry.map((entry) => ({
      ...entry,
      ...(entry.document && !publishedNow.has(entry.id) ? { draft: true } : {}),
      insertable: Boolean(entry.document) || Boolean(descriptors[entry.name]),
    })),
  )

  const matches = $derived.by(() => {
    const q = query.trim().toLowerCase()
    if (!q) return registry
    return registry.filter((f) => f.name.toLowerCase().includes(q))
  })

  // `selected` holds an ENTRY OBJECT, and the registry rebuilds into new ones
  // whenever a document changes — so the stored object goes stale the moment you
  // edit anything. It is an identity; the live entry is looked up by it.
  //
  // Without this, creating a variant appeared to do nothing: the document was
  // added and the registry gained the variant, while `selected` still pointed at
  // the entry from before it existed.
  const current = $derived(registry.find((f) => f.id === selected?.id) ?? selected)

  /** The entry actually on the canvas: the selection, or one of its variants. */
  const shown = $derived(
    variantIndex > 0 ? current?.variants?.[variantIndex - 1] ?? current : current,
  )

  const active = $derived(shown?.examples?.[exampleIndex] ?? null)

  /** What the first tab is called — named by what backs it, not by its name. */
  const baseLabel = $derived(
    !current?.document ? 'Svelte' : publishedNow.has(current.id) ? 'Published' : 'Draft',
  )

  /** A variant can be started from anything that has a name to compete with. */
  const canCreateVariant = $derived(
    mode === 'compose' && Boolean(current) && current.kind !== 'flow' && current.section !== 'brandkit',
  )

  function createVariant() {
    const of = current.document ? current.id : current.name
    const slug = mintSlug(`${current.id}-variant`)
    // Counted BEFORE the document is added. `current` is derived from
    // `documents`, so reading the length afterwards already includes the new
    // variant and lands one tab past the end.
    const opensAt = (current.variants?.length ?? 0) + 1

    // A VARIANT OF A DOCUMENT STARTS AS A COPY OF IT. You are varying something,
    // so an empty canvas is the wrong starting point — it makes the first act
    // rebuilding what you were about to change.
    //
    // A variant of a published SVELTE component starts empty, and that is not an
    // oversight: a leaf has no body to copy. What it does have is a name, which
    // is what the variant is competing for.
    const parent = current.document
    documents = [...documents, {
      ...createDocument({ kind: current.kind === 'screen' ? 'screen' : 'component', slug, name: slug }),
      ...(parent ? { inputs: structuredClone($state.snapshot(parent.inputs ?? [])), root: structuredClone($state.snapshot(parent.root)) } : {}),
      variantOf: of,
    }]
    // Show it immediately: it is the last tab, and the reason you pressed the
    // button was to work on it.
    variantIndex = opensAt
  }

  // Keys arrive namespaced from SidebarNav (`section:foundation`,
  // `group:atoms`) because the two levels share a namespace — `screens` is both
  // a section and a group. Passing them through opaquely keeps that the nav's
  // concern rather than duplicating the rule here.
  // The document open in Compose. A composed entry carries its `document`, so
  // this reads it off the selection rather than holding a second pointer that
  // could disagree with it.
  // What Compose can actually open: a document. A published Svelte component has
  // no body to edit — it is a leaf — so selecting one in Compose falls through to
  // the read-only canvas, which still badges it and shows its source. Compose
  // does not hide it; there is simply nothing to arrange.
  const editing = $derived(
    mode === 'compose' && shown?.document && shown.kind !== 'flow'
      ? allDocuments.find((d) => d.slug === shown.id) ?? null
      : null,
  )

  // A flow is edited in the Flows section, the way a component is edited in
  // Compose. Same document store, same save, different surface — because a flow
  // is a sequence rather than a tree, and a node inspector has nothing to say
  // about one.
  const editingFlow = $derived(
    mode === 'compose' && selected?.kind === 'flow'
      ? allDocuments.find((d) => d.slug === selected.id) ?? null
      : null,
  )

  // The mode-driven half of a row's insert gate (SidebarNav reads the other
  // half, `f.insertable`, directly off the row). `editing` already folds in
  // `mode === 'compose'`, so this is just "and there is somewhere to put it".
  const canInsert = $derived(mode === 'compose' && Boolean(editing))

  // The Composer with nothing open — the state that renders ComposeEmpty, which
  // carries its own create action. Derived from the same condition the render
  // branch below tests, so the two cannot disagree about when that canvas is up.
  const composerIsEmpty = $derived(mode === 'compose' && !selected)
  const editingSlug = $derived(editing?.slug ?? null)

  // A request to insert something into whatever ComposeCanvas currently has
  // open. Sidebar's row and ComposeCanvas are siblings; App relays between them
  // the same way it already relays `selected`, `documents`, everything else —
  // not a new coordination idiom, the same one this file uses throughout.
  let insertRequest = $state(null)

  function insertFromRow(f) {
    // The same rule `attachVariants` already uses to match a variant to its
    // parent — reused, not re-derived: a composed document is addressed by its
    // slug, a published export by its name. A row is always a component (or
    // screen, which is a component) — a layout node has no row to originate
    // from, and is inserted directly from ComposeCanvas's own chrome instead.
    insertRequest = { slug: f.document ? `@${f.document.slug}` : `@${f.name}` }
  }

  function updateDocument(next) {
    // Editing a PUBLISHED document that has no draft yet creates one. The
    // committed file is untouched until Publish is pressed, so an edit is never
    // a write to the repo by accident.
    documents = documents.some((d) => d.slug === next.slug)
      ? documents.map((d) => (d.slug === next.slug ? next : d))
      : [...documents, next]
  }

  /** Slugs that already exist as files, so the control can say Publish or Update. */
  let publishedNow = $state(publishedSlugs)

  async function publishDocument(doc) {
    const result = await publish(doc)
    if (result.ok) publishedNow = new Set([...publishedNow, doc.slug])
    return result
  }

  /** A unique kebab slug. Numbered rather than random so two sessions read alike. */
  function mintSlug(base) {
    const taken = new Set(documents.map((d) => d.slug))
    if (!taken.has(base)) return base
    let n = 2
    while (taken.has(`${base}-${n}`)) n += 1
    return `${base}-${n}`
  }

  const NEW = {
    component: { slug: 'new-component', name: 'New component', section: 'components' },
    screen: { slug: 'new-screen', name: 'New screen', section: 'screens' },
    flow: { slug: 'new-flow', name: 'New flow', section: 'flows' },
  }

  function createNew(kind) {
    const spec = NEW[kind]
    const slug = mintSlug(spec.slug)
    // A flow has steps rather than a tree, so it is not a `createDocument`.
    const doc = kind === 'flow'
      ? { schema: SCHEMA_VERSION, kind: 'flow', slug, name: spec.name, steps: [] }
      : createDocument({ kind, slug, name: spec.name })
    documents = [...documents, doc]
    section = spec.section
    // Creating something is composing it. Anything else would leave you looking
    // at a new empty document with no way to put anything in it.
    mode = 'compose'
    // Selecting the new document is the point of creating it. The registry entry
    // does not exist until `registry` recomputes, so this waits a tick.
    queueMicrotask(() => {
      selected = registry.find((f) => f.id === slug) ?? selected
    })
  }

  // Saved on a trailing debounce rather than on every keystroke: a props field
  // fires an edit per character, and each one serialises the whole workspace.
  //
  // A FAILED SAVE IS REPORTED. This is the moment the `unavailable` case is
  // finally news — work exists now, and it is not being kept — which is why
  // start-up stays quiet about it.
  let saveTimer
  $effect(() => {
    const snapshot = $state.snapshot(documents)
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      const { problem } = saveCompose({ documents: snapshot, app: APP_VERSION }, storage)
      if (problem) storageProblem = problem
    }, 400)
    return () => clearTimeout(saveTimer)
  })

  /** Destructive, explicit, and never automatic — the only path that clears the key. */
  function discardSavedWork() {
    try {
      storage?.removeItem(STORAGE_KEY)
    } catch {
      // Nothing to do: the store that would not read is the store that will not
      // clear, and saying the discard failed is the honest end of it.
    }
    documents = []
    storageProblem = null
  }

  function toggle(key) {
    collapsed = { ...collapsed, [key]: !collapsed[key] }
  }

  $effect(() => {
    document.documentElement.dataset.theme = theme
  })

  // reset the example index whenever the selected fixture changes
  $effect(() => {
    void selected
    exampleIndex = 0
    variantIndex = 0
  })
</script>

<div class="catalog">
  <!-- App chrome: identity, and only identity.

       Search was here, on the argument that a filter over the whole registry
       belongs in the region that spans everything. That conflated what search
       filters OVER with where the result lands: the result only ever lands in
       the list column, and search touches neither the canvas nor the rail,
       which the banner also spans. It now sits on that column's title row. -->
  <header class="appbar" aria-label="Catalog">
    <!-- The version lived here as `v{APP_VERSION}`; it is one click away in
         Settings (the About section already states it), and repeating it in
         the one row that is on screen every second was the wrong trade — a
         fact nobody reads every day, taking up room the wordmark could use to
         actually read as a wordmark instead of a compressed inline label. -->
    <div class="appbar__brand">
      <span class="appbar__logo"><KhaosLogo size={28} /></span>
      <span class="appbar__name">Khaotik</span>
    </div>

    <!-- Left-aligned, beside the wordmark rather than grouped with the
         viewport controls on the right: this picker names which app you're
         in — Khaotik Catalog or Khaotik Composer — and that's identity, not
         a control to reach for. It earns the place by outliving everything
         to its right too: the frame holds while you walk the catalog, so it
         is a property of the session rather than of the selection. -->
    <SegmentedControl label="Mode" items={MODES} value={mode} onselect={setMode} />

    <span class="appbar__spacer"></span>

    <ViewportPicker
      {device}
      {size}
      {orientation}
      enabled={framing}
      ondevice={pickDevice}
      onsize={(s) => (size = s)}
      onorientation={(o) => (orientation = o)}
    />
  </header>

  <!-- Only when saved work could not be read. `storage.js` refuses to repair or
       clear such a payload, which is invisible without something that says so —
       an unreadable payload otherwise looks exactly like an empty workspace. -->
  <ComposeBanner
    problem={storageProblem}
    onDiscard={discardSavedWork}
    onDismiss={() => (storageProblem = null)}
  />

  <SectionRail
    {section}
    {theme}
    {sortMode}
    onsection={(s) => (section = s)}
    ontheme={(t) => (theme = t)}
    onsortmode={(m) => (sortMode = m)}
    onopensettings={() => (settingsOpen = true)}
  />

  <!-- Unconditional, identical, in both modes — the chrome. What varies is the
       FUNCTION available from a row (oninsert/canInsert), never the row itself. -->
  <Sidebar
    {matches}
    {selected}
    {collapsed}
    {query}
    {sortMode}
    {section}
    onselect={(f) => (selected = f)}
    ontoggle={toggle}
    onquery={(q) => (query = q)}
    oncreate={createNew}
    createElsewhere={composerIsEmpty}
    oninsert={insertFromRow}
    {canInsert}
    {editingSlug}
  />
  {#if editingFlow}
    <FlowCanvas
      flow={editingFlow}
      registry={registry}
      frame={{ device, size, orientation, enabled: framing }}
      onChange={updateDocument}
      isPublished={publishedNow.has(editingFlow.slug)}
      onPublish={publishDocument}
    />
  {:else if editing}
    <!-- The same DeviceFrame, the same renderer and the same viewport picker as
         the read-only canvas — so what is arranged here is what is seen
         everywhere else, rather than an approximation of it. -->
    <ComposeCanvas
      variants={current?.variants ?? []}
      variantIndex={variantIndex}
      {baseLabel}
      canCreateVariant={canCreateVariant}
      onvariant={(i) => (variantIndex = i)}
      oncreatevariant={createVariant}
      document={editing}
      documents={allDocuments}
      frame={{ device, size, orientation, enabled: framing }}
      onChange={updateDocument}
      isPublished={publishedNow.has(editing.slug)}
      onPublish={publishDocument}
      {insertRequest}
      onInsertHandled={() => (insertRequest = null)}
    />
  {:else if composerIsEmpty}
    <!-- The Composer with nothing open (D69). Not the read-only Canvas holding
         a null selection — that renders an empty heading and a blank frame,
         which looks like a failure rather than a starting point. -->
    <ComposeEmpty oncreate={createNew} />
  {:else if shown?.kind === 'flow'}
    <!-- A flow read-only, the sibling of FlowCanvas one branch up. Without this a
         flow renders only in Compose: Browse falls through to Canvas, which mounts
         FixtureView on `selected.component`, and a flow carries none — so it printed
         "not yet wired". A flow nobody can see outside the authoring mode is not
         delivered.

         Here rather than inside Canvas because Canvas's `describable`/`composedDoc`
         deriveds would badge a flow with an empty implementation list. A flow
         implements nothing; it sequences. -->
    <FlowView
      flow={shown.document ?? shown}
      registry={registry}
      frame={{ device, size, orientation, enabled: framing }}
    />
  {:else}
    <Canvas
      selected={shown}
      variants={current?.variants ?? []}
      variantIndex={variantIndex}
      {baseLabel}
      canCreateVariant={canCreateVariant}
      onvariant={(i) => (variantIndex = i)}
      oncreatevariant={createVariant}
      {active}
      {exampleIndex}
      frame={{ device, size, orientation, enabled: framing }}
      onexample={(i) => (exampleIndex = i)}
    />
  {/if}
</div>

<Settings open={settingsOpen} version={APP_VERSION} onClose={() => (settingsOpen = false)} />

<style>
  .catalog {
    display: grid;
    /* rail | list | canvas. The rail holds every fixed-cost control — the
       section axis and the view controls — so its size is a function of the
       control count, which is small and stable, never of the component count,
       which is neither. Icon-only, hence 56px. */
    grid-template-columns: 56px 248px 1fr;
    /* The banner is a row of its own, spanning all three columns. It holds
       only identity now, but it still spans: a brand block boxed inside the
       rail's 56px would be a different design, not the same one narrower. */
    grid-template-rows: auto 1fr;
    height: 100vh;
    overflow: hidden;
  }

  .appbar {
    grid-column: 1 / -1;
    display: grid;
    /* brand | mode | spacer | viewport. Brand and mode sit together on the
       left — the mode names which app you're in, so it reads as identity
       beside the wordmark, not as a control grouped with the viewport picker.
       The spacer (not the brand) takes the slack, so the viewport controls
       still sit against the right margin at any window width.
       A grid rather than a flex row with `margin-left: auto` on the controls:
       placement is the bar's business, and a child that positions itself has to
       be found and edited every time the bar's composition changes. */
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xs) var(--spacing-md);
    border-bottom: 1px solid var(--border-default);
    background: var(--surface-base);
  }

  .appbar__spacer {
    min-width: 0;
  }

  /* The fixed `width: calc(56px + 248px - …)` here held the brand across the
     two nav columns so the banner read as two regions rather than one ragged
     row. There is no second region any more — search left — so it was pinning a
     block against nothing. */
  .appbar__brand {
    display: flex;
    /* CENTER, not baseline: with the version gone this is a two-element icon +
       wordmark lockup, and an SVG mark has no text baseline of its own to line
       up against — baseline alignment left it looking like it was floating
       rather than sitting with the word. */
    align-items: center;
    gap: var(--spacing-xs);
    /* so a long wordmark shrinks rather than pushing the controls off the edge */
    min-width: 0;
  }

  .appbar__logo {
    display: inline-flex;
    color: var(--action-primary);
  }

  .appbar__name {
    /* A wordmark, not a label riding beside a version — the bigger mark
       (28px, was 22px) needed a step up in the type to stay in the same
       register as its neighbour rather than reading as a caption under it.
       `heading-md` is the kit's only heading step (16px/600) — there is no
       `heading-sm` to reach for instead. */
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
    letter-spacing: var(--heading-md-track);
    color: var(--text-primary);
  }

</style>
