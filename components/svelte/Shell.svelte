<script>
  // The data-layer window's frame: the toolbar row, the docked panes with the source list, the
  // status bar and the command palette, with the atlas, player, screenplay and subject builders
  // layered over the data, one shown at a time. Moved from Khaos App's src/ui/shell/Shell.svelte
  // (catalog app-coverage plan, T8). Every value is the host's, and every pane, layer and dialog
  // is the host's own view, passed as a snippet: the table, detail and side panes by name, any
  // other pane through `pane`.
  import Button from './Button.svelte'
  import CommandPalette from './CommandPalette.svelte'
  import Dock from './Dock.svelte'
  import ProjectStatusHUD from './ProjectStatusHUD.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import SourceList from './SourceList.svelte'
  import StatusBar from './StatusBar.svelte'
  import StoryAtlasToolbar from './StoryAtlasToolbar.svelte'
  import Toolbar from './Toolbar.svelte'

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
   * @property {ToolbarProps['commands']} [commands] The toolbar's commands.
   * @property {(id: string) => void} [onRun] An enabled command was chosen.
   * @property {string | null} [filter] The filter text; null hides the field.
   * @property {string} [filterLabel] The filter's accessible name.
   * @property {(value: string) => void} [onFilter] The filter text changed.
   * @property {(event: MouseEvent) => void} [onToolbarClick] A click anywhere in the toolbar row, so the host can say why a disabled command is disabled.
   * @property {string} [snapshotError] Why the shared story read failed; '' when it did not.
   * @property {() => void} [onRetrySnapshot] Retry was pressed after the story read failed.
   * @property {() => void} [onProjectSettings] Opens the story's Project Settings, from the gear at the toolbar's trailing edge. Absent, no gear is drawn.
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
   * @property {(destination: string) => void} [onDestination] A destination was chosen in the source list.
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
</script>

<div
  class="ui-shell"
  class:ui-shell--canvas-status={canvasStatus}
  data-ui-id="shell"
  data-presentation={presentation}
  style:--ui-shell-toolbar-height={`${toolbarHeight}px`}
  style:--ui-shell-status-height={`${statusHeight}px`}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -- the toolbar's buttons take the keys; a key on one is a click here -->
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
      compactBelow={0}
      {modes}
      mode={presentation}
      onmode={(mode) => onPresentation?.(mode)}
      {panes}
      ontogglepane={(id) => onTogglePane?.(id)}
      {commands}
      onrun={(id) => onRun?.(id)}
      {filter}
      {filterLabel}
      onfilter={(value) => onFilter?.(value)}
      status={snapshotError ? snapshotStatus : undefined}
      onsettings={onProjectSettings}
      settingsLabel="Project Settings…">
      {#snippet lead()}
        {#if presentation === 'data'}
          <SegmentedControl label="Data workspace" value={workspace} items={workspaces} onselect={(value) => onWorkspace?.(value)} />
        {/if}
      {/snippet}
      {#snippet tools()}
        {#if presentation === 'atlas'}
          <div class="ui-shell__atlas-tools" aria-label="Atlas controls">
            <StoryAtlasToolbar lens={atlasLens} onLensChange={(value) => onAtlasLens?.(value)} />
          </div>
        {/if}
      {/snippet}
    </Toolbar>
  </div>

  {#snippet snapshotStatus()}
    <span class="ui-shell__snapshot-status" role="status" title={snapshotError}>Story update failed</span>
    <Button icon="arrow-clockwise" onclick={() => onRetrySnapshot?.()}>Retry</Button>
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
      {#key workspace}
        <Dock {layout} {panels} onlayoutchange={(next) => onLayoutChange?.(next)} uiId="{workspace}.dock">
          {#snippet panel(id)}
            {#if id === 'source'}
              <SourceList {sections} active={destination} onselect={(d) => onDestination?.(d)} label="Story destinations" uiId="{workspace}.source" />
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
        </Dock>
      {/key}
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
    height: 100vh;
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
