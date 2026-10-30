<script>
  // The Story Atlas: khaosd's story graph (Story Atlas v1) laid out in five arrangements and four
  // lenses, drawn by StoryAtlasCanvas, with a selection inspector, a connection inspector
  // (StoryAtlasRelationship) and the story's activity. It imports Pixi through the canvas, so it is
  // not in the barrel: a host imports it lazily from story-atlas.js. Moved from Khaos App (catalog
  // app-coverage plan, T7).
  import { fly } from 'svelte/transition'
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import EventLog from './EventLog.svelte'
  import Menu from './Menu.svelte'
  import MetricCard from './MetricCard.svelte'
  import Portrait from './Portrait.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import StatusPill from './StatusPill.svelte'
  import StoryAtlasCanvas from './StoryAtlasCanvas.svelte'
  import StoryAtlasRelationship from './StoryAtlasRelationship.svelte'
  import { createLayouts } from './lib/atlas/layout.js'
  import { edgeKey, icons, stateLabel, tones } from './lib/atlas/appearance.js'

  /** @typedef {'all' | 'character' | 'location' | 'scene'} AtlasLens */
  /** @typedef {{ destination: 'characters' | 'places' | 'scenes', select: string }} AtlasReveal */

  /**
   * @typedef {Object} Props
   * @property {{ lenses: Record<AtlasLens, { nodes: readonly any[], edges: readonly any[] }>, neighborhoods: Record<string, { nodes: readonly any[], edges: readonly any[] }>, locationGroups: readonly { id: string, label: string, memberIds: readonly string[] }[] } | null} [atlas] khaosd's Story Atlas v1; null until it has been read.
   * @property {Record<string, string>} [portraitUrls] Resolved portrait URLs, keyed by node id.
   * @property {string} [error] Why the atlas could not be read, or ''.
   * @property {boolean} [refreshing] The atlas is being read.
   * @property {() => void} [onRetry] Asks for the atlas again.
   * @property {boolean} [active] Whether the atlas is on screen; the keyboard and renderer wait while it is not.
   * @property {AtlasLens} [lens] The lens shown.
   * @property {(lens: AtlasLens) => void} [onLensChange] Reports a lens chosen (keys 1 to 4).
   * @property {number} [cameraKey] Changing it returns the camera to the overview.
   * @property {string} [selectedRecordId] The record the host has selected, or ''.
   * @property {(at: AtlasReveal) => void} [onSelectRecord] Reports a node chosen, as the destination that holds it.
   * @property {(at: AtlasReveal) => void} [onReveal] Asks to open a node's record.
   * @property {(characterId: string) => void} [onBuildAppearance] Offered on a character when set.
   * @property {(placeId: string) => void} [onDesignPlace] Offered on a place when set.
   * @property {() => void} [onready] Called once the renderer has started.
   * @property {boolean} [diagnostics] Shows the renderer's diagnostics.
   * @property {boolean} [activityOpen] Shows the activity panel.
   * @property {(open: boolean) => void} [onActivityChange] Reports the activity panel opened or closed.
   * @property {() => void} [onOpenActivity] Asks for the activity window.
   * @property {readonly { id: string, type: string, status: string, progress?: { completed: number, total: number }, error?: string }[]} [jobs] The story's jobs.
   * @property {boolean} [jobsStale] The jobs feed is reconnecting.
   * @property {{ kind: 'loading' } | { kind: 'missing' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [activity] The committed-changes read.
   * @property {readonly any[]} [events] The committed changes, as EventLog takes them.
   */

  /** @type {Props} */
  let {
    atlas = null,
    portraitUrls = {},
    error = '',
    refreshing = false,
    onRetry = undefined,
    active = true,
    lens: lensValue = 'all',
    onLensChange = undefined,
    cameraKey = 0,
    selectedRecordId = '',
    onSelectRecord = undefined,
    onReveal = undefined,
    onBuildAppearance = undefined,
    onDesignPlace = undefined,
    onready = undefined,
    diagnostics = false,
    activityOpen = false,
    onActivityChange = undefined,
    onOpenActivity = undefined,
    jobs = [],
    jobsStale = false,
    activity = { kind: 'loading' },
    events = [],
  } = $props()

  let variant = $state('D')
  const kind = $derived(lensValue)
  let selectedId = $derived(selectedRecordId)
  let graphAnchor = $derived(selectedRecordId)
  let hoveredId = $state('')
  let selectedEdgeKey = $state('')
  const variants = [
    { value: 'D', label: 'Location clusters' },
    { value: 'E', label: 'Entity regions' },
    { value: 'A', label: 'Constellation' },
    { value: 'B', label: 'Scene spine' },
    { value: 'C', label: 'Neighborhood' },
  ]
  /** @type {AtlasLens[]} */
  const lensKeys = ['all', 'character', 'location', 'scene']
  const layouts = $derived(atlas ? createLayouts(atlas) : null)
  const nodes = $derived(layouts?.nodes ?? [])
  const selected = $derived(nodes.find((n) => n.id === selectedId))
  const hovered = $derived(nodes.find((n) => n.id === hoveredId))
  const related = $derived(layouts?.neighbors(selectedId) ?? new Set())
  const graph = $derived(
    layouts
      ? layouts.withSequence(kind === 'all' ? layouts.layout(variant, graphAnchor) : kind === 'scene' ? layouts.sequenceLayout() : layouts.contributionLayout(kind))
      : null,
  )
  const selectedEdge = $derived(graph?.edges.find((edge) => edgeKey(edge) === selectedEdgeKey) ?? null)
  const edgeSource = $derived(nodes.find((n) => n.id === selectedEdge?.source))
  const edgeTarget = $derived(nodes.find((n) => n.id === selectedEdge?.target))

  /** @param {{ kind: string }} node @returns {AtlasReveal['destination']} */
  const destinationOf = (node) => (node.kind === 'character' ? 'characters' : node.kind === 'location' ? 'places' : 'scenes')

  /** @param {string} id */
  function select(id) {
    selectedId = id
    graphAnchor = id
    selectedEdgeKey = ''
    const node = nodes.find((n) => n.id === id)
    if (node) onSelectRecord?.({ destination: destinationOf(node), select: id })
  }
  /** @param {AtlasLens} value */
  function lens(value) {
    onLensChange?.(value)
    selectedEdgeKey = ''
  }
  function clear() {
    selectedId = ''
    selectedEdgeKey = ''
  }
  /** @param {KeyboardEvent} event */
  function key(event) {
    if (!active) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === 'Escape') {
      clear()
      onActivityChange?.(false)
    }
    if (event.target instanceof HTMLElement && event.target.closest('input,textarea,button,summary,[role=radiogroup]')) return
    const index = ['1', '2', '3', '4'].indexOf(event.key)
    if (index >= 0) lens(lensKeys[index])
  }
  const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
</script>

<svelte:window onkeydown={key} />
<div class="ui-story-atlas" aria-label="Story Atlas" data-ui-id="story.atlas">
  <main class="ui-story-atlas__canvas">
    {#if error}<div class="ui-story-atlas__feedback" role="alert">
        {error}
        <Button onclick={() => onRetry?.()}>Try again</Button>
      </div>{/if}
    {#if graph}
      <StoryAtlasCanvas
        {active}
        {onready}
        portraits={portraitUrls}
        {graph}
        {selectedId}
        {related}
        {variant}
        {kind}
        {cameraKey}
        {selectedEdge}
        {diagnostics}
        onSelectEdge={(edge) => {
          selectedEdgeKey = edgeKey(edge)
          selectedId = ''
        }}
        onSelect={select}
        onHover={(id) => (hoveredId = id)} />
    {:else if refreshing}<div class="ui-story-atlas__empty">
        <EmptyState title="Reading your story…" icon="circle-notch" />
      </div>
    {:else if !error}<div class="ui-story-atlas__empty">
        <EmptyState title="Your story has no Atlas nodes yet" description="Import a screenplay to explore its characters, locations and scenes." icon="graph" />
      </div>{/if}
    {#if hovered && hovered.id !== selectedId}<div class="ui-story-atlas__hover" role="status">
        <b>{hovered.label}</b><span>{stateLabel[hovered.state]}</span>
      </div>{/if}
  </main>
  {#if selected || selectedEdge}
    <aside class="ui-story-atlas__inspector" aria-label="Atlas selection" data-ui-id="story.atlas.inspector">
      {#key selectedId || `${selectedEdge?.source}:${selectedEdge?.target}`}
        <div in:fly={{ x: 18, duration: reducedMotion() ? 0 : 320 }}>
          {#if selected}
            <Button onclick={clear}>Close details</Button>
            {#if portraitUrls[selected.id]}<div class="ui-story-atlas__portrait"><Portrait src={portraitUrls[selected.id]} name={selected.label} identity={selected.id} aspect="1 / 1" /></div>{/if}
            <SectionHeader eyebrow={selected.kind === 'scene' ? `Scene ${selected.number}` : selected.kind} title={selected.label} />
            <StatusPill tone={tones[selected.state]} text={stateLabel[selected.state]} />
            {#each selected.reasons as reason, index (index)}<p>{reason}</p>{/each}
            <div class="ui-story-atlas__metrics" data-ui-id="story.atlas.metrics">
              {#if selected.kind === 'scene'}<MetricCard value={String(selected.raw.word_count)} label="Words" /><MetricCard value={String(selected.raw.line_count)} label="Lines" />
              {:else}<MetricCard value={String(selected.raw.scene_count)} label="Scenes" />{#if selected.kind === 'character'}<MetricCard value={String(selected.raw.dialogue_lines)} label="Dialogue lines" />{/if}{/if}
            </div>
            {#if selected.kind === 'scene'}<p>{selected.raw.slugline}</p>{/if}
            <div class="ui-story-atlas__actions" data-ui-id="story.atlas.actions">
              {#if selected.kind === 'location' && onDesignPlace}<Button icon="paint-brush" onclick={() => onDesignPlace(selected.id)}>Design place…</Button>{/if}
              {#if selected.kind === 'character' && onBuildAppearance}<Button icon="user-focus" onclick={() => onBuildAppearance(selected.id)}>Build appearance…</Button>{/if}
              <Button variant="primary" onclick={() => onReveal?.({ destination: destinationOf(selected), select: selected.id })}>Open {selected.kind}</Button>
              <Button
                onclick={() => {
                  lens('all')
                  variant = 'C'
                  graphAnchor = selected.id
                }}>Explore connections</Button>
            </div>
            <SectionHeader eyebrow="Connected" />
            <div class="ui-story-atlas__connections">
              {#each atlas?.neighborhoods[selected.id]?.nodes ?? [] as node (node.id)}{#if node.id !== selected.id}<Button
                    icon={portraitUrls[node.id] ? undefined : icons[node.kind]}
                    onclick={() => {
                      lens('all')
                      select(node.id)
                    }}>{#if portraitUrls[node.id]}<span class="ui-story-atlas__connection-portrait"><Portrait src={portraitUrls[node.id]} name={node.label} identity={node.id} aspect="1 / 1" /></span>{/if}{node.kind === 'scene' ? `${node.number}. ` : ''}{node.label}</Button>{/if}{/each}
            </div>
          {:else if selectedEdge && edgeSource && edgeTarget}
            <StoryAtlasRelationship
              source={{ id: edgeSource.id, label: edgeSource.label, kind: edgeSource.kind }}
              target={{ id: edgeTarget.id, label: edgeTarget.label, kind: edgeTarget.kind }}
              label={selectedEdge.kind}
              evidence={selectedEdge.evidence}
              onSelectEndpoint={select}
              onClear={clear} />
          {/if}
        </div>
      {/key}
    </aside>
  {/if}
  {#if activityOpen}
    <aside class="ui-story-atlas__activity" aria-label="Story activity">
      <SectionHeader title="Activity" />
      <Button onclick={() => onOpenActivity?.()}>Open activity window</Button>
      <Button onclick={() => onActivityChange?.(false)}>Close activity</Button>
      <SectionHeader eyebrow="Jobs" />
      {#if jobsStale}<p role="status">Job feedback disconnected. Reconnecting…</p>{/if}
      {#each jobs as job (job.id)}<p>
          {job.type} · {job.status}{#if job.progress}
            · {job.progress.completed}/{job.progress.total}{/if}{#if job.error}
            · {job.error}{/if}
        </p>{/each}
      <SectionHeader eyebrow="Committed changes" />
      {#if activity.kind === 'failed'}<p role="alert">{activity.message}</p>
      {:else if activity.kind === 'missing'}<EmptyState title="No committed activity yet" />
      {:else if activity.kind === 'loading'}<p role="status">Reading activity…</p>
      {:else}<EventLog {events} viewportHeight={240} label="Story changes" />{/if}
    </aside>
  {/if}
  <div class="ui-story-atlas__arrangement">
    <Menu
      label="Atlas arrangement"
      value={variant}
      items={variants}
      onselect={(/** @type {string} */ value) => {
        variant = value
        lens('all')
        selectedEdgeKey = ''
      }} />
  </div>
</div>

<style>
  .ui-story-atlas {
    height: 100dvh;
    position: relative;
    overflow: hidden;
    background: var(--surface-base);
    color: var(--text-primary);
    font: var(--body-md-size) / var(--body-md-line) var(--font-sans);
  }
  .ui-story-atlas__canvas {
    position: absolute;
    inset: 0;
    min-width: 0;
  }
  .ui-story-atlas__inspector {
    position: absolute;
    z-index: 6;
    top: calc(var(--shell-toolbar-height, 48px) + var(--spacing-md));
    right: var(--spacing-md);
    width: 290px;
    max-height: calc(100% - 180px);
    overflow: auto;
    padding: var(--spacing-md);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
  }
  .ui-story-atlas__hover {
    position: absolute;
    z-index: 6;
    left: 50%;
    bottom: 80px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    pointer-events: none;
    max-width: 70%;
  }
  .ui-story-atlas__hover span {
    color: var(--text-secondary);
  }
  .ui-story-atlas__portrait {
    width: min(160px, 100%);
    margin: 0 auto var(--spacing-md);
  }
  .ui-story-atlas__connection-portrait {
    display: inline-block;
    width: 24px;
    flex: none;
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .ui-story-atlas__actions,
  .ui-story-atlas__metrics {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
    margin-block: var(--spacing-md);
  }
  .ui-story-atlas__connections {
    display: grid;
    gap: var(--spacing-xs);
  }
  .ui-story-atlas__arrangement {
    position: absolute;
    bottom: var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    z-index: 7;
    background: var(--surface-raised);
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    max-width: calc(100% - 260px);
  }
  .ui-story-atlas__feedback {
    position: absolute;
    top: 80px;
    left: var(--spacing-md);
    z-index: 9;
    background: var(--surface-raised);
    padding: var(--spacing-sm);
    max-width: 65ch;
  }
  .ui-story-atlas__empty {
    position: absolute;
    inset: 20%;
    display: grid;
    place-items: center;
  }
  .ui-story-atlas__activity {
    max-height: calc(100% - 180px);
    overflow: auto;
    position: absolute;
    left: var(--spacing-md);
    bottom: 80px;
    width: min(760px, calc(100% - 32px));
    z-index: 8;
    background: var(--surface-raised);
    border: 1px solid var(--border-default);
    padding: var(--spacing-md);
    border-radius: var(--radius-sm);
  }
</style>
