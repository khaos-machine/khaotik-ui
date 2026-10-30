<script>
  // A scene's working document: a Screenplay | Analysis switch, and a Read view while a read of
  // this scene is open. Screenplay is the scene's elements as the composition serves them, each
  // a selectable line; without a composition, the engine's raw text. The Read view is the
  // host's read timeline, passed as the `read` snippet, and opens itself when the read does.
  // Moved from Khaos App (catalog app-coverage plan, T3).
  import { untrack } from 'svelte'
  import EmptyState from './EmptyState.svelte'
  import SceneAnalysis from './SceneAnalysis.svelte'
  import ScreenplayText from './ScreenplayText.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import { screenplayElements } from './lib/scenes.js'

  /** @typedef {import('./lib/scenes.js').SceneRecord} SceneRecord */
  /** @typedef {import('./lib/scenes.js').CompositionSegment} CompositionSegment */
  /** @typedef {'screenplay' | 'analysis' | 'read'} SceneView */

  /**
   * The scene's raw text, read when it has no composition.
   * @typedef {{ kind: 'none' } | { kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'text', text: string }} SceneTextRead
   */

  /**
   * @typedef {Object} Props
   * @property {SceneRecord | null} [scene] The selected scene's row; null when none is selected.
   * @property {CompositionSegment | null} [segment] The scene's composition segment; null when it has none.
   * @property {SceneTextRead} [sceneText] The scene's raw text, shown when there is no segment.
   * @property {string} [selectedLine] The selected element's id.
   * @property {(elementId: string) => void} [onselectline] Reports a selected line.
   * @property {Record<string, unknown> | null} [analysis] The scene's analysis record from khaosd.
   * @property {readonly { id: string, name: string }[]} [names] Characters, objects and places, for the analysis's suggestions.
   * @property {import('./lib/types.js').SceneStanding | undefined} [standing] The analysis's standing.
   * @property {boolean} [readOpen] A read of this scene is open or opening: the Read view is offered.
   * @property {boolean} [readOpening] The read is opening: the Read view opens itself.
   * @property {import('svelte').Snippet | undefined} [read] The host's read timeline.
   */

  /** @type {Props} */
  let {
    scene = null,
    segment = null,
    sceneText = { kind: 'none' },
    selectedLine = '',
    onselectline = undefined,
    analysis = null,
    names = [],
    standing = undefined,
    readOpen = false,
    readOpening = false,
    read = undefined,
  } = $props()

  /** @type {SceneView} */
  let tab = $state('screenplay')
  const view = $derived(tab === 'read' && !readOpen ? 'screenplay' : tab)

  // The Read view opens itself when a read of this scene does.
  $effect(() => {
    if (readOpening) untrack(() => (tab = 'read'))
  })

  const elements = $derived(segment ? screenplayElements(segment) : [])
</script>

{#if !scene}
  <EmptyState title="No scene selected" description="Select a scene in the table. ↑ and ↓ move the selection; it is kept when you switch away." icon="film-slate" />
{:else}
  <div class="ui-scene-detail">
    <header class="ui-scene-detail__head">
      <SegmentedControl
        label="Scene view"
        value={view}
        items={[
          { value: 'screenplay', label: 'Screenplay' },
          { value: 'analysis', label: 'Analysis' },
          ...(readOpen ? [{ value: 'read', label: 'Read' }] : []),
        ]}
        onselect={(/** @type {string} */ v) => (tab = /** @type {SceneView} */ (v))} />
    </header>
    <div class="ui-scene-detail__body">
      {#if view === 'read'}
        {@render read?.()}
      {:else if view === 'screenplay'}
        {#if elements.length}
          <ScreenplayText {elements} selected={selectedLine} onselect={onselectline} label={scene.slugline ?? 'Scene'} uiId="story.scene.text" />
        {:else if sceneText.kind === 'text'}
          <!-- No composition for this scene: the engine's raw text. -->
          <pre class="ui-scene-detail__raw">{sceneText.text}</pre>
        {:else if sceneText.kind === 'loading'}
          <EmptyState title="Loading scene text…" icon="circle-notch" />
        {:else if sceneText.kind === 'failed'}
          <EmptyState title="Could not read the scene text" description={sceneText.message} icon="warning" />
        {:else}
          <EmptyState title="No scene text" description="The engine has no screenplay text for this scene." icon="text-align-left" />
        {/if}
      {:else}
        <SceneAnalysis {analysis} {names} events={segment?.events ?? []} {standing} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .ui-scene-detail {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .ui-scene-detail__head {
    flex: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  /* The view switch is the header: it takes the full width, one equal segment per view. */
  .ui-scene-detail__head :global(.ui-segmented) {
    display: flex;
  }
  .ui-scene-detail__head :global(.ui-segmented__item) {
    flex: 1;
    text-align: center;
  }
  .ui-scene-detail__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .ui-scene-detail__raw {
    margin: 0;
    padding: var(--spacing-sm);
    white-space: pre-wrap;
    font-family: var(--font-mono);
    font-size: var(--data-md-size);
  }
</style>
