<script>
  // The data-layer window's frame: the toolbar row, the docked panes with the source list, the
  // status bar and the command palette, with the atlas, player, screenplay and subject builders
  // layered over the data, one shown at a time. Moved from Khaos App's src/ui/shell/Shell.svelte
  // (catalog app-coverage plan, T8). Every value is the host's, and every pane, layer and dialog
  // is the host's own view, passed as a snippet: the table, detail and side panes by name, any
  // other pane through `pane`.
  //
  // The Data window follows the Overview screen (operator, 2026-11-10: "Match the Overview"). The
  // source column hides from a button at its top to a rail that brings it back, through the same
  // `onTogglePane('source')` the toolbar toggle sent; Project Settings sits at its foot, not in the
  // toolbar ("Sidebar foot, both"). The source column is the fixed side of the split with id
  // `source`, or else of the split holding the panel `source`, whichever panel that is (#56). The inspector is there only while something is selected ("Yes,
  // host says when"): `hasSelection` closes it without touching the host's layout.
  //
  // Narrow, by the window's own width (operator, 2026-11-10, the window measured unusable below
  // 900): a phone is a "Drill-down stack" — the source list, the destination's table, then the
  // selection — and a tablet is "Rail + two columns", the source list held to its rail. The
  // phone's toolbar is "Title + pop-up + More": one row that never scrolls, the presentations as a
  // pop-up, the commands named in a More menu, the filter under the stack's Back row, and no pane
  // toggles, which the stack replaces ("i don't know what mic + play buttons are").
  import Button from './Button.svelte'
  import CommandMenu from './CommandMenu.svelte'
  import CommandPalette from './CommandPalette.svelte'
  import Dock from './Dock.svelte'
  import FilterField from './FilterField.svelte'
  import ProjectStatusHUD from './ProjectStatusHUD.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import SourceList from './SourceList.svelte'
  import StatusBar from './StatusBar.svelte'
  import StoryAtlasToolbar from './StoryAtlasToolbar.svelte'
  import Toolbar from './Toolbar.svelte'
  import { paneSplit, shownPanels, toggleSplit } from './lib/dock.js'

  /** @typedef {'overview' | 'data' | 'atlas' | 'player' | 'screenplay'} Presentation */
  /** @typedef {import('svelte').ComponentProps<typeof Toolbar>} ToolbarProps */
  /** @typedef {import('svelte').ComponentProps<typeof Dock>} DockProps */
  /** @typedef {import('svelte').ComponentProps<typeof StatusBar>} StatusBarProps */

  /**
   * @typedef {Object} Props
   * @property {string} [title] The window's title: the story's name.
   * @property {string} [context] What the player is on, right-aligned in the toolbar.
   * @property {ToolbarProps['modes']} [modes] Data, Atlas, Player or Composer, Screenplay: the presentations offered.
   * @property {Presentation} [presentation] The presentation shown.
   * @property {(mode: string) => void} [onPresentation] A presentation was chosen.
   * @property {ToolbarProps['panes']} [panes] The pane toggles.
   * @property {(id: string) => void} [onTogglePane] A pane toggle was pressed.
   * @property {import('./lib/commands.js').Command[]} [commands] The toolbar's commands.
   * @property {(id: string) => void} [onRun] An enabled command was chosen.
   * @property {string | null} [filter] The filter text; null hides the field.
   * @property {string} [filterLabel] The filter's accessible name.
   * @property {(value: string) => void} [onFilter] The filter text changed.
   * @property {(event: MouseEvent) => void} [onToolbarClick] A click anywhere in the toolbar row, so the host can say why a disabled command is disabled.
   * @property {string} [snapshotError] Why the shared story read failed; '' when it did not.
   * @property {() => void} [onRetrySnapshot] Retry was pressed after the story read failed.
   * @property {() => void} [onProjectSettings] Opens the story's Project Settings, from the foot of the source list, or its rail while the list is hidden. Absent, no button is drawn.
   * @property {string} [atlasLens] The atlas lens, shown while the atlas is.
   * @property {(lens: string) => void} [onAtlasLens] An atlas lens was chosen.
   * @property {string} [workspace] The data workspace: story or review.
   * @property {readonly { value: string, label: string }[]} [workspaces] The data workspaces offered.
   * @property {(workspace: string) => void} [onWorkspace] A workspace was chosen.
   * @property {DockProps['layout']} [layout] The panes' layout.
   * @property {DockProps['panels']} [panels] Every pane the layout may name.
   * @property {(layout: import('./lib/dock.js').DockNode) => void} [onLayoutChange] The panes were resized, moved or collapsed.
   * @property {import('svelte').ComponentProps<typeof SourceList>['sections']} [sections] The source list's destinations.
   * @property {string} [destination] The destination shown.
   * @property {boolean} [hasSelection] Something is selected in the data. While nothing is, the inspector is closed; the host's layout keeps its own state for when it returns.
   * @property {(destination: string) => void} [onDestination] A destination was chosen in the source list.
   * @property {() => void} [onDeselect] On a phone, Back from the selection: the host clears it.
   * @property {boolean} [builderOpen] A subject builder covers the window: everything else is hidden and inert.
   * @property {StatusBarProps['engine']} [engine] The status bar's engine line.
   * @property {StatusBarProps['jobs']} [jobs] Running jobs.
   * @property {StatusBarProps['result']} [result] The last action's result.
   * @property {StatusBarProps['budget']} [budget] The story budget in the status bar.
   * @property {StatusBarProps['onchangebudget']} [onchangebudget] Opens the story's budget.
   * @property {boolean} [paletteOpen] The command palette is open.
   * @property {import('svelte').ComponentProps<typeof CommandPalette>['commands']} [paletteCommands] What the palette offers.
   * @property {(id: string) => void} [onPaletteRun] A palette command was chosen.
   * @property {() => void} [onPaletteClose] The palette was dismissed.
   * @property {import('svelte').Snippet | undefined} [table] The table pane for the destination shown.
   * @property {import('svelte').Snippet | undefined} [detail] The detail pane.
   * @property {import('svelte').Snippet | undefined} [side] The inspector pane.
   * @property {import('svelte').Snippet<[string]> | undefined} [pane] Any other pane, by id: the review workspace's.
   * @property {import('svelte').Snippet | undefined} [notice] What a refused action offers. It shows above every layer, open builders included, so the surface that was refused shows its fix.
   * @property {import('svelte').Snippet | undefined} [overview] The overview layer, with the status bar under it as under the data.
   * @property {import('svelte').Snippet | undefined} [atlas] The atlas layer; absent, it is not offered.
   * @property {import('svelte').Snippet | undefined} [player] The player layer.
   * @property {import('svelte').Snippet | undefined} [screenplay] The screenplay layer.
   * @property {import('svelte').Snippet | undefined} [builders] The subject builders. They cover the window while one is open; the host hides each one that is not.
   * @property {import('svelte').Snippet | undefined} [dialogs] The host's sheets and confirmations.
   */

  /** @type {Props} */
  let {
    title = '',
    context = '',
    modes = [],
    presentation = 'data',
    onPresentation = undefined,
    panes = [],
    onTogglePane = undefined,
    commands = [],
    onRun = undefined,
    filter = null,
    filterLabel = '',
    onFilter = undefined,
    onToolbarClick = undefined,
    snapshotError = '',
    onRetrySnapshot = undefined,
    onProjectSettings = undefined,
    atlasLens = '',
    onAtlasLens = undefined,
    workspace = 'story',
    workspaces = [],
    onWorkspace = undefined,
    layout = null,
    panels = {},
    onLayoutChange = undefined,
    sections = [],
    destination = '',
    onDestination = undefined,
    onDeselect = undefined,
    hasSelection = true,
    builderOpen = false,
    engine = null,
    jobs = [],
    result = null,
    budget = null,
    onchangebudget = undefined,
    paletteOpen = false,
    paletteCommands = [],
    onPaletteRun = undefined,
    onPaletteClose = undefined,
    table = undefined,
    detail = undefined,
    side = undefined,
    pane = undefined,
    notice = undefined,
    overview = undefined,
    atlas = undefined,
    player = undefined,
    screenplay = undefined,
    builders = undefined,
    dialogs = undefined,
  } = $props()

  let toolbarHeight = $state(48)
  let statusHeight = $state(0)
  /** The status bar sits under the overview and the data; the canvases show a status over themselves instead. */
  const statusShown = $derived(!builderOpen && (presentation === 'data' || presentation === 'overview'))
  /** Shown over the atlas, player and screenplay while they are, and something is running or has a result. */
  const canvasStatus = $derived(!builderOpen && !statusShown && Boolean(result || (jobs?.length ?? 0) > 0))
  /** @param {Presentation} layer */
  const hidden = (layer) => builderOpen || presentation !== layer

  /** In the Data window the source list's toggle is in the pane; elsewhere (the player's composer sidebar) it stays in the toolbar. */
  const toolbarPanes = $derived(presentation === 'data' ? panes.filter((p) => p.id !== 'source') : panes)
  /** The window's width; 0 until measured, which counts as wide, so a host that never lays it out sees no change. */
  let width = $state(0)
  const mode = $derived(width === 0 || width > 900 ? 'wide' : width < 600 ? 'phone' : 'tablet')
  /** On a tablet the source list keeps to its rail unless opened from it; the host's layout is not touched. */
  let sourceOpen = $state(false)
  /** On a phone, the stack is back at the source list. */
  let atSource = $state(false)

  /**
   * The split with `id`.
   * @param {import('./lib/dock.js').DockNode | null} tree @param {string} id
   * @returns {import('./lib/dock.js').DockSplit | null}
   */
  const splitById = (tree, id) => (!tree || tree.kind === 'group' ? null : tree.id === id ? tree : splitById(tree.children[0], id) ?? splitById(tree.children[1], id))
  /**
   * The source column's split: the one the toolbar's `source` toggle names (khaotik-ui#56) — the split
   * with that id, or else the one holding the panel `source`. Its fixed side is the source column,
   * whichever panel the host puts there.
   * @param {import('./lib/dock.js').DockNode | null} tree
   */
  const sourceSplit = (tree) => splitById(tree, 'source') ?? paneSplit(tree, 'source')
  const sourcePanels = $derived.by(() => {
    const split = sourceSplit(layout)
    const fixed = split && (split.fixed === 'start' ? split.children[0] : split.children[1])
    return fixed?.kind === 'group' ? fixed.panels : []
  })

  /** The inspector's split, closed while nothing is selected and the inspector is the tab shown. */
  const inspectorClosed = $derived.by(() => {
    const split = paneSplit(layout, 'inspector')
    if (!split || split.collapsed || hasSelection) return false
    const fixed = split.fixed === 'start' ? split.children[0] : split.children[1]
    return fixed.kind === 'group' && fixed.active === 'inspector'
  })
  const sourceClosed = $derived.by(() => {
    const split = sourceSplit(layout)
    return mode === 'tablet' && !sourceOpen && !!split && !split.collapsed
  })
  /** The splits the window closes for itself, by id, whatever the host's layout says. */
  const closedHere = $derived([inspectorClosed && paneSplit(layout, 'inspector')?.id, sourceClosed && sourceSplit(layout)?.id].filter((id) => typeof id === 'string'))
  const dockLayout = $derived(closedHere.reduce((tree, id) => (tree ? toggleSplit(tree, id) : tree), layout))
  const sourceHidden = $derived(sourceSplit(dockLayout)?.collapsed ?? false)

  /** Hands the host back its own state for the panes the window closed, so the closing stays the window's. @param {import('./lib/dock.js').DockNode} next */
  function layoutChanged(next) {
    onLayoutChange?.(closedHere.reduce((tree, id) => (splitById(tree, id)?.collapsed ? toggleSplit(tree, id) : tree), next))
  }

  /** The source column's own Hide and the rail's Show: on a tablet the window's, elsewhere the host's. */
  function toggleSource() {
    if (mode !== 'tablet') return onTogglePane?.('source')
    if (sourceSplit(layout)?.collapsed) {
      sourceOpen = true
      onTogglePane?.('source')
    } else sourceOpen = sourceHidden
  }

  /** The phone's stack: the table first, then the rest with the selection, the inspector at its top ("Inspector first"). */
  const stacked = $derived(shownPanels(layout).filter((p) => p !== 'source'))
  const selection = $derived(stacked.slice(1).sort((a, b) => Number(b === 'inspector') - Number(a === 'inspector')))
  const view = $derived(atSource ? 'source' : hasSelection && stacked.length > 1 ? 'selection' : 'list')
  const destinationLabel = $derived(sections.flatMap((s) => s.items).find((i) => i.id === destination)?.label ?? '')
  const phone = $derived(mode === 'phone')
  const workspaceLabel = $derived(workspaces.find((w) => w.value === workspace)?.label ?? 'Sources')
</script>

<div
  class="ui-shell"
  class:ui-shell--canvas-status={canvasStatus}
  data-ui-id="shell"
  data-presentation={presentation}
  data-mode={mode}
  bind:clientWidth={width}
  style:--ui-shell-toolbar-height={`${toolbarHeight}px`}
  style:--ui-shell-status-height={`${statusHeight}px`}>
  <!-- The toolbar's buttons take the keys; a key on one is a click here. -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    class="ui-shell__toolbar"
    class:ui-shell__toolbar--hidden={builderOpen}
    inert={builderOpen}
    aria-hidden={builderOpen ? 'true' : undefined}
    bind:clientHeight={toolbarHeight}
    onclick={(event) => onToolbarClick?.(event)}>
    <!-- Three groups (khaos-app#617): where you are, what you can do, and status. -->
    <Toolbar
      {title}
      {context}
      compactBelow={phone ? 600 : 0}
      width={phone ? width : 0}
      {modes}
      mode={presentation}
      onmode={(mode) => onPresentation?.(mode)}
      panes={phone ? [] : toolbarPanes}
      ontogglepane={(id) => onTogglePane?.(id)}
      commands={phone ? [] : commands}
      onrun={(id) => onRun?.(id)}
      filter={phone ? null : filter}
      {filterLabel}
      onfilter={(value) => onFilter?.(value)}
      status={snapshotError ? snapshotStatus : undefined}>
      {#snippet lead()}
        <!-- Not on a phone ("Drop it on phone"): Review is in the source list. -->
        {#if presentation === 'data' && !phone}
          <SegmentedControl label="Data workspace" value={workspace} items={workspaces} onselect={(value) => onWorkspace?.(value)} />
        {/if}
      {/snippet}
      {#snippet tools()}
        {#if phone && commands.length > 0}
          <CommandMenu {commands} onrun={(id) => onRun?.(id)} uiId="{workspace}.more" />
        {/if}
        {#if presentation === 'atlas'}
          <div class="ui-shell__atlas-tools" aria-label="Atlas controls">
            <StoryAtlasToolbar lens={atlasLens} onLensChange={(value) => onAtlasLens?.(value)} />
          </div>
        {/if}
      {/snippet}
    </Toolbar>
  </div>

  {#snippet snapshotStatus()}
    <span class="ui-shell__snapshot-status" role="status" data-toolbar-message title={snapshotError}>Story update failed</span>
    <Button icon="arrow-clockwise" onclick={() => onRetrySnapshot?.()}>Retry</Button>
  {/snippet}

  <!-- Each pane by id, for the Dock and the phone's stack alike. -->
  {#snippet panelBody(/** @type {string} */ id)}
    {#if sourcePanels.includes(id)}
      {@render sourceColumn(true, id)}
    {:else}
      {@render panelContent(id)}
    {/if}
  {/snippet}

  {#snippet panelContent(/** @type {string} */ id)}
    {#if id === 'source'}
      <SourceList {sections} active={destination} onselect={(d) => { atSource = false; onDestination?.(d) }} label="Story destinations" uiId="{workspace}.source" />
    {:else if id === 'table'}
      {@render table?.()}
    {:else if id === 'detail'}
      {@render detail?.()}
    {:else if id === 'inspector'}
      {@render side?.()}
    {:else}
      {@render pane?.(id)}
    {/if}
  {/snippet}

  <!-- The source column — the source list, or whichever pane the host docks there — with Project
       Settings at its foot; docked, it hides from a button at its top. -->
  {#snippet sourceColumn(/** @type {boolean} */ docked, /** @type {string} */ id = 'source')}
    <div class="ui-shell__source">
      {#if docked}
        <div class="ui-shell__toggle">
          <Button variant="tool" icon="sidebar-simple" title="Hide source list" onclick={toggleSource}><span class="visually-hidden">Hide source list</span></Button>
        </div>
      {/if}
      <div class="ui-shell__source-list">
        {@render panelContent(id)}
      </div>
      {#if onProjectSettings}
        <div class="ui-shell__foot">
          <Button variant="tool" icon="gear" onclick={() => onProjectSettings?.()}>Project Settings</Button>
        </div>
      {/if}
    </div>
  {/snippet}

  {#if overview}
    <div class="ui-shell__overview" hidden={hidden('overview')} inert={hidden('overview')}>{@render overview()}</div>
  {/if}

  <div
    class="ui-shell__data"
    class:ui-shell__data--hidden={hidden('data')}
    inert={hidden('data')}
    aria-hidden={hidden('data') ? 'true' : undefined}>
    <div class="ui-shell__dock">
      {#if mode === 'phone'}
        <div class="ui-shell__stack">
          {#if view === 'source'}
            {@render sourceColumn(false)}
          {:else}
            <div class="ui-shell__stack-head">
              {#if view === 'list'}
                <Button variant="tool" icon="caret-left" onclick={() => (atSource = true)}>{workspaceLabel}</Button>
                <h2 class="ui-shell__stack-title">{destinationLabel}</h2>
              {:else}
                <Button variant="tool" icon="caret-left" onclick={() => onDeselect?.()}>{destinationLabel}</Button>
              {/if}
            </div>
            {#if view === 'list' && filter !== null}
              <div class="ui-shell__stack-filter"><FilterField value={filter} label={filterLabel} oninput={(value) => onFilter?.(value)} /></div>
            {/if}
            <div class="ui-shell__stack-body">
              {#each view === 'list' ? stacked.slice(0, 1) : selection as id (id)}
                <section class="ui-shell__stack-pane" aria-label={panels[id]?.label ?? id}>{@render panelBody(id)}</section>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        {#if sourceHidden}
          <div class="ui-shell__rail">
            <Button variant="tool" icon="sidebar-simple" title="Show source list" onclick={toggleSource}><span class="visually-hidden">Show source list</span></Button>
            <div class="ui-shell__source-list">
              <SourceList {sections} active={destination} onselect={(d) => onDestination?.(d)} label="Story destinations" uiId="{workspace}.source" compact />
            </div>
            {#if onProjectSettings}
              <div class="ui-shell__foot">
                <Button variant="tool" icon="gear" title="Project Settings" onclick={() => onProjectSettings?.()}><span class="visually-hidden">Project Settings</span></Button>
              </div>
            {/if}
          </div>
        {/if}
        {#key workspace}
          <Dock layout={dockLayout} {panels} onlayoutchange={layoutChanged} uiId="{workspace}.dock" panel={panelBody} />
        {/key}
      {/if}
    </div>
  </div>
  <!-- One status bar, under whichever of the overview and the data is shown. -->
  <div class="ui-shell__status" hidden={!statusShown} bind:clientHeight={statusHeight}>
    <StatusBar {engine} {jobs} {result} {budget} {onchangebudget} />
  </div>

  {#if atlas}
    <div
      class="ui-shell__atlas"
      class:ui-shell__atlas--hidden={hidden('atlas')}
      inert={hidden('atlas')}
      aria-hidden={hidden('atlas') ? 'true' : undefined}>
      {@render atlas()}
    </div>
  {/if}
  {#if screenplay}
    <div class="ui-shell__screenplay" hidden={hidden('screenplay')} inert={hidden('screenplay')}>{@render screenplay()}</div>
  {/if}
  {#if player}
    <div
      class="ui-shell__player"
      class:ui-shell__player--hidden={hidden('player')}
      inert={hidden('player')}
      aria-hidden={hidden('player') ? 'true' : undefined}>
      {@render player()}
    </div>
  {/if}
  {#if builders}
    <!-- Each builder stays mounted once visited, so it keeps its state; the host hides the closed ones. -->
    <div class="ui-shell__builders" hidden={!builderOpen}>{@render builders()}</div>
  {/if}
  <div class="ui-shell__canvas-status" hidden={builderOpen || statusShown}>
    <ProjectStatusHUD active={!builderOpen && !statusShown} {result} {jobs} />
  </div>
  {#if notice}
    <!-- Above the builders and every presentation; it clears the status bar or the canvas status when either shows. -->
    <div class="ui-shell__notice" class:ui-shell__notice--raised={statusShown || canvasStatus}>{@render notice()}</div>
  {/if}
</div>

{@render dialogs?.()}

{#if paletteOpen}
  <div class="ui-shell__palette">
    <CommandPalette commands={paletteCommands} onrun={(id) => onPaletteRun?.(id)} onclose={() => onPaletteClose?.()} />
  </div>
{/if}

<style>
  .ui-shell {
    position: relative;
    display: flex;
    flex-direction: column;
    /* Its container's height, not the window's: the host gives it one. */
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--surface-base);
    color: var(--text-primary);
  }
  .ui-shell__toolbar {
    position: relative;
    z-index: 10;
    flex: none;
    background: color-mix(in srgb, var(--surface-base) 90%, transparent);
    backdrop-filter: blur(16px);
  }
  .ui-shell__toolbar--hidden { visibility: hidden; pointer-events: none; }
  .ui-shell__atlas-tools { display: flex; align-items: center; gap: var(--spacing-xs); flex: none; }
  .ui-shell__snapshot-status { color: var(--text-secondary); font-size: var(--caption-size); white-space: nowrap; }

  /* The layers share the space under the toolbar; one is shown at a time. The overview and the
     data stop above the status bar. */
  .ui-shell__data { position: absolute; inset: var(--ui-shell-toolbar-height) 0 var(--ui-shell-status-height); display: flex; flex-direction: column; min-height: 0; }
  .ui-shell__overview { position: absolute; inset: var(--ui-shell-toolbar-height) 0 var(--ui-shell-status-height); min-height: 0; overflow: auto; }
  .ui-shell__status { position: absolute; inset: auto 0 0; }
  .ui-shell__dock { display: flex; flex: 1; min-height: 0; }
  .ui-shell__dock > :global(.dock) { flex: 1; min-width: 0; }
  /* The source list as the Overview's outline: its toggle, the list scrolling, Project Settings
     pinned to the foot. The rail keeps Show, each destination's icon and the gear while it is
     hidden (operator, 2026-11-10: "display the icons for each entry in sidebar when collapsed"). */
  .ui-shell__source { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .ui-shell__source-list { flex: 1; min-height: 0; }
  .ui-shell__toggle { display: flex; justify-content: flex-end; padding: var(--spacing-xs) var(--spacing-xs) 0; }
  .ui-shell__foot { margin-top: auto; padding: var(--spacing-xs); }
  .ui-shell__rail { display: flex; flex-direction: column; flex: none; padding-top: var(--spacing-xs); border-right: var(--size-stroke-hairline) solid var(--border-default); }
  .ui-shell__rail > :global(:first-child) { margin: 0 var(--spacing-xs); }
  /* The phone's stack: one level at a time, under a row with Back and the level's name. */
  .ui-shell__stack { display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0; }
  .ui-shell__stack-head { display: flex; align-items: center; gap: var(--spacing-xs); flex: none; padding: var(--spacing-2xs) var(--spacing-xs); border-bottom: var(--size-stroke-hairline) solid var(--border-default); }
  .ui-shell__stack-title { margin: 0; font-size: var(--body-md-size); font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .ui-shell__stack-body { flex: 1; min-height: 0; overflow: auto; }
  .ui-shell__stack-pane + .ui-shell__stack-pane { border-top: var(--size-stroke-hairline) solid var(--border-default); }
  .ui-shell__stack-filter { flex: none; padding: var(--spacing-xs); border-bottom: var(--size-stroke-hairline) solid var(--border-default); }
  .ui-shell__atlas { position: absolute; inset: 0; }
  .ui-shell__player { position: absolute; inset: var(--ui-shell-toolbar-height) 0 0; min-height: 0; opacity: 1; transition: opacity 200ms ease-out, visibility 0s; }
  .ui-shell__screenplay { position: absolute; inset: var(--ui-shell-toolbar-height) 0 0; min-height: 0; }
  .ui-shell__data, .ui-shell__atlas { transition: opacity 200ms ease-out, visibility 0s; }
  .ui-shell__data.ui-shell__data--hidden,
  .ui-shell__atlas.ui-shell__atlas--hidden { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 200ms ease-out, visibility 0s 200ms; }
  .ui-shell__player--hidden { opacity: 0; visibility: hidden; pointer-events: none; }
  .ui-shell--canvas-status .ui-shell__player,
  .ui-shell--canvas-status .ui-shell__atlas { bottom: 24px; }
  .ui-shell__canvas-status { position: absolute; inset: auto 0 0; z-index: 10; }
  .ui-shell__notice { position: absolute; inset: auto 0 0; z-index: 11; background: var(--surface-base); }
  .ui-shell__notice--raised { bottom: 24px; }

  /* The subject builders cover the window; each fills it, and a closed one stays mounted, hidden. */
  .ui-shell__builders { position: absolute; inset: 0; z-index: 4; display: grid; }
  .ui-shell__builders[hidden] { display: none; }
  .ui-shell__builders > :global(*) { grid-area: 1 / 1; min-height: 0; }
  .ui-shell__builders > :global([hidden]) { display: none; }

  .ui-shell__palette {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 12vh;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-shell__data, .ui-shell__atlas, .ui-shell__player,
    .ui-shell__data.ui-shell__data--hidden, .ui-shell__atlas.ui-shell__atlas--hidden { transition: none; }
  }
</style>
