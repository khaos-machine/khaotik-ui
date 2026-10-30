<script>
  // A place's built model, seen through one of its cameras (place viewer frame §4). The .glb is
  // the kit's build, served by khaosd at `GET /api/places/definitions/{id}/model.glb`; the host
  // reads it and passes the bytes, which are parsed here, never fetched (viewer rulings, Gap 5).
  // Cameras come from the definition, since the .glb carries none. The frame is letterboxed to the
  // guides' aspect with a passepartout around it, never stretched to the panel. three.js loads
  // by dynamic import (lib/place-scene.js), so it never enters a host's first chunk. A click on
  // the model selects the element under it; it never moves anything (edits are definition edits).
  import EmptyState from './EmptyState.svelte'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/place-plan.js').PlaceDefinition | null} [definition] The place definition the model was built from; its cameras frame the view.
   * @property {Uint8Array | null} [model] The model's bytes: khaosd's `.../model.glb` for this definition, as the host read it, or null when there is none.
   * @property {string} [camera] The id of the definition camera to look through; '' is the first.
   * @property {number} [aspect] The guides' width over height, from the Guides manifest. The kit renders guides at 1536 by 1024.
   * @property {(id: string) => void} [onselect] Reports the room or fixture id under a click.
   * @property {(names: string[]) => void} [onload] Reports the loaded model's node names.
   */

  /** @type {Props} */
  let { definition = null, model = null, camera = '', aspect = 1536 / 1024, onselect = () => {}, onload = () => {} } = $props()

  const cam = $derived(definition ? (camera ? definition.cameras.find((c) => c.id === camera) : definition.cameras[0]) : undefined)

  let panel = $state({ width: 0, height: 0 })
  /** @type {Awaited<ReturnType<typeof import('./lib/place-scene.js').createPlaceScene>> | null} */
  let viewer = $state.raw(null)
  let error = $state('')
  /** @type {typeof import('./lib/place-scene.js') | null} */
  let sceneModule = $state.raw(null)
  const frame = $derived(sceneModule && panel.width && panel.height ? sceneModule.fitFrame(panel.width, panel.height, aspect) : null)

  /** @param {HTMLElement} node */
  function measure(node) {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      panel = { width: entry.contentRect.width, height: entry.contentRect.height }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }

  /**
   * Loads the model's bytes into the canvas; new bytes replace the old viewer.
   * @param {Uint8Array} bytes
   * @returns {(canvas: HTMLCanvasElement) => () => void}
   */
  const load = (bytes) => (canvas) => {
    let cancelled = false
    /** @type {typeof viewer} */
    let made = null
    error = ''
    viewer = null
    import('./lib/place-scene.js')
      .then(async (mod) => {
        sceneModule = mod
        made = await mod.createPlaceScene(canvas, bytes)
        if (cancelled) return made.dispose()
        viewer = made
        onload(made.names())
      })
      .catch((/** @type {Error} */ e) => {
        if (!cancelled) error = e.message
      })
    return () => {
      cancelled = true
      made?.dispose()
    }
  }

  $effect(() => {
    if (viewer && cam && frame) viewer.frame(cam, frame.width, frame.height)
  })

  /** @param {MouseEvent} event */
  function pick(event) {
    if (!viewer || !frame) return
    const id = viewer.pick(event.offsetX, event.offsetY, frame.width, frame.height)
    if (id) onselect(id)
  }
</script>

{#if !model || !definition}
  <EmptyState title="No model to show." icon="cube" />
{:else if !cam}
  <EmptyState title={camera ? `This place has no camera ${camera}.` : 'This place has no camera.'} icon="video-camera-slash" />
{:else}
  <div class="place-viewer" style:aspect-ratio={aspect} {@attach measure}>
    <!-- A click picks an element in the model; the keyboard path to the same selection is
         PlacePlan, which names every element. -->
    <canvas
      {@attach load(model)}
      aria-label="The built model of {definition.location ?? 'this place'}, through camera {cam.id}"
      style:width="{frame?.width ?? 0}px"
      style:height="{frame?.height ?? 0}px"
      style:left="{frame?.left ?? 0}px"
      style:top="{frame?.top ?? 0}px"
      onclick={pick}
    ></canvas>
    {#if error}
      <div class="place-viewer__state"><EmptyState title="Could not show the model" description={error} icon="warning" /></div>
    {:else if !viewer}
      <div class="place-viewer__state"><EmptyState title="Loading the model…" icon="circle-notch" /></div>
    {/if}
  </div>
{/if}

<style>
  .place-viewer {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* The passepartout: the panel outside the guides' frame. A host that gives the panel no
       height gets the guides' aspect (the inline aspect-ratio); one that does gets a letterbox. */
    background: var(--surface-base);
  }
  canvas {
    position: absolute;
    display: block;
    background: var(--surface-raised);
    outline: 1px solid var(--border-hairline);
  }
  .place-viewer__state {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }
</style>
