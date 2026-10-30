<script>
  // The Story Atlas's Pixi canvas: the graph a host's layout placed, drawn with WebGL, with pan,
  // zoom, focus and selection. Pixi loads with this module, so a host that wants it out of its
  // first chunk imports it lazily from story-atlas.js; neither it nor StoryAtlas is in the
  // barrel. Moved from Khaos App's PixiGraphCanvas (catalog app-coverage plan, T7).
  import { onMount } from 'svelte'
  import Button from './Button.svelte'
  import { createAtlas } from './lib/atlas/pixi-atlas.js'

  /**
   * @typedef {Object} Props
   * @property {boolean} [active] Whether the canvas is on screen; a hidden one stops rendering.
   * @property {() => void} [onready] Called once the renderer has started.
   * @property {Record<string, string>} [portraits] Resolved portrait URLs, keyed by node id.
   * @property {{ nodes: readonly any[], edges: readonly any[] } | null} [graph] The positioned graph, from `createLayouts`.
   * @property {string} [selectedId] The selected node's id, or ''.
   * @property {Set<string>} [related] The ids next to the selected node.
   * @property {string} [variant] The arrangement: 'A' to 'E'.
   * @property {string} [kind] The lens: 'all', 'character', 'location' or 'scene'.
   * @property {number} [cameraKey] Changing it returns the camera to the overview.
   * @property {{ source: string, target: string, kind: string, evidence: string } | null} [selectedEdge] The selected connection.
   * @property {(id: string) => void} [onSelect] Reports a node chosen.
   * @property {(edge: { source: string, target: string, kind: string, evidence: string }) => void} [onSelectEdge] Reports a connection chosen.
   * @property {(id: string) => void} [onHover] Reports the node under the pointer, or ''.
   * @property {boolean} [diagnostics] Shows the renderer's node count, frame rate and zoom.
   */

  /** @type {Props} */
  let {
    active = true,
    onready = undefined,
    portraits = {},
    graph = null,
    selectedId = '',
    related = new Set(),
    variant = 'D',
    kind = 'all',
    cameraKey = 0,
    selectedEdge = null,
    onSelect = () => {},
    onSelectEdge = () => {},
    onHover = () => {},
    diagnostics = false,
  } = $props()

  /** @type {HTMLDivElement | undefined} */
  let host = $state()
  /** @type {Awaited<ReturnType<typeof createAtlas>> | null} */
  let atlas = $state.raw(null)
  let error = $state('')
  let stats = $state({ fps: null, zoom: null, nodes: 0 })
  onMount(() => {
    let cancelled = false
    createAtlas(host, {
      onSelect: (/** @type {string} */ id) => onSelect(id),
      onSelectEdge: (/** @type {any} */ edge) => onSelectEdge(edge),
      onHover: (/** @type {string} */ id) => onHover(id),
      onStats: (/** @type {any} */ value) => (stats = value),
    })
      .then((result) => {
        if (cancelled) result.destroy()
        else {
          atlas = result
          onready?.()
        }
      })
      .catch((reason) => {
        if (!cancelled) error = reason instanceof Error ? reason.message : String(reason)
      })
    return () => {
      cancelled = true
      atlas?.destroy()
    }
  })
  $effect(() => {
    atlas?.setActive(active)
  })
  $effect(() => {
    atlas?.update({ graph, portraits, selectedId, related, variant, kind, cameraKey, selectedEdge, onSelectEdge })
  })
</script>

<div
  class="ui-atlas-canvas"
  data-ui-id="story.atlas.canvas"
  role="region"
  aria-label="Interactive Pixi story graph. Drag to pan, scroll to zoom, double-click a node to focus."
  bind:this={host}
></div>
{#if error}
  <div class="ui-atlas-canvas__message" role="alert">Pixi could not start: {error}</div>
{:else if !atlas}
  <div class="ui-atlas-canvas__message" role="status">Preparing the story atlas…</div>
{/if}
<div class="ui-atlas-canvas__tools" aria-label="Pixi graph navigation">
  <Button disabled={!atlas} onclick={() => atlas?.zoom(1 / 1.25)}>Zoom out</Button>
  <Button icon="crosshair" disabled={!atlas} onclick={() => atlas?.fit()}>Recenter</Button>
  <Button disabled={!atlas} onclick={() => atlas?.zoom(1.25)}>Zoom in</Button>
  <Button disabled={!atlas || !graph?.nodes.some((n) => n.id === selectedId)} onclick={() => atlas?.focus(selectedId)}>Focus</Button>
</div>
{#if diagnostics}<div class="ui-atlas-canvas__diagnostics" aria-label="Atlas renderer diagnostics">
    PIXI / WEBGL <span>{stats.nodes} nodes</span><span>{stats.fps ?? '—'} fps</span><span>{stats.zoom ?? '—'}% zoom</span>
  </div>{/if}

<style>
  .ui-atlas-canvas {
    position: absolute;
    inset: 0;
    min-width: 0;
    overflow: hidden;
    touch-action: none;
    cursor: grab;
    z-index: 2;
  }
  .ui-atlas-canvas:active {
    cursor: grabbing;
  }
  .ui-atlas-canvas :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  /* Pixi's accessibility layer, which it adds to the page itself. */
  :global(.atlas-accessibility button:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: 3px;
  }
  .ui-atlas-canvas__tools {
    position: absolute;
    z-index: 6;
    left: var(--spacing-md);
    bottom: var(--spacing-md);
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
    background: var(--surface-base);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
  }
  .ui-atlas-canvas__message {
    position: absolute;
    z-index: 6;
    left: 35px;
    top: 160px;
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    letter-spacing: var(--label-sm-track);
    color: var(--text-primary);
    max-width: 500px;
  }
  .ui-atlas-canvas__diagnostics {
    position: absolute;
    top: 180px;
    left: 35px;
    z-index: 6;
    display: flex;
    gap: 14px;
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    letter-spacing: var(--label-sm-track);
    color: var(--text-brand);
    pointer-events: none;
  }
  .ui-atlas-canvas__diagnostics span {
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }
</style>
