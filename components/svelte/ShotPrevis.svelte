<script>
  // The Composer's 3D previs of one shot (shot-kit frame §7): the place, each figure and each floor
  // object placed by the blocking's rigid transforms, the door leaves swung for the shot, seen
  // through the shot camera built from its numbers (place viewer frame §4) and letterboxed to the
  // blocking's frame. The scene's models arrive as bytes the host read, once per scene (M-B3: a
  // per-scene loader); a cut only moves the camera and the parts. three.js loads by dynamic import
  // (lib/shot-scene.js), so it never enters a host's first chunk (D94). A shot that is not blocked
  // draws a plain state with readiness's reasons. Camera edits (orbit about the target, dolly, lens)
  // are drawn live and reported once, on release (frame §7.3).
  import EmptyState from './EmptyState.svelte'
  import { dolly, orbit } from './lib/shot-camera.js'

  /**
   * @typedef {import('./lib/shot-scene.js').ShotCamera} ShotCamera
   */

  /**
   * @typedef {Object} Props
   * @property {import('./lib/shot-scene.js').PrevisShot | null} [shot] The shot under the playhead, from the scene's previs read, or null.
   * @property {import('./lib/place-plan.js').PlaceDefinition | null} [definition] The place definition the shot's blocking names; its door leaves are swung from it.
   * @property {Uint8Array | null} [place] The place's `.glb` bytes, as the host read them for the scene, or null.
   * @property {Record<string, Uint8Array>} [figures] Each figure's `.glb` bytes, by build key, for every shot of the scene.
   * @property {Record<string, Uint8Array>} [objects] Each floor object's `.glb` bytes, by object definition id, for every shot of the scene.
   * @property {(camera: ShotCamera) => void} [oncamera] Reports the edited shot camera, once, when a drag, a key or the lens is released.
   * @property {(names: string[]) => void} [onload] Reports every node name in the scene's place, figure and object models, once per loaded scene; a cut does not report again.
   */

  /** @type {Props} */
  let { shot = null, definition = null, place = null, figures = {}, objects = {}, oncamera = () => {}, onload = () => {} } = $props()

  const UNREADY = {
    none: "This shot isn't blocked yet.",
    waiting: 'This shot is waiting.',
    stale: "This shot's blocking is out of date.",
    refused: "This shot's blocking didn't pass its check.",
  }

  const blocking = $derived(shot?.state === 'blocked' ? shot.blocking : null)
  // A local edit, kept only while the blocking it was made on is the one shown: a write, or a
  // reload of the head, replaces it.
  /** @type {{ blockingId: string, camera: ShotCamera } | null} */
  let draft = $state.raw(null)
  const camera = $derived(blocking ? (draft?.blockingId === blocking.id ? draft.camera : blocking.camera) : null)
  const aspect = $derived(blocking ? blocking.frame.width / blocking.frame.height : 1536 / 1024)

  // The scene's models, held so that only new bytes reload the scene: a derived passes a change on
  // only when its value is another object, so a host re-setting the same bytes, or changing only
  // the shot, never reparses.
  const placeBytes = $derived(place)
  const figureBytes = $derived(figures)
  const objectBytes = $derived(objects)

  let panel = $state({ width: 0, height: 0 })
  /** @type {Awaited<ReturnType<typeof import('./lib/shot-scene.js').createShotScene>> | null} */
  let viewer = $state.raw(null)
  let error = $state('')
  /** @type {typeof import('./lib/shot-scene.js') | null} */
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
   * Loads one scene's models into the canvas; new bytes replace the old viewer, a new shot does not.
   * @param {Uint8Array} placeBytes @param {Record<string, Uint8Array>} figureBytes @param {Record<string, Uint8Array>} objectBytes
   * @returns {(canvas: HTMLCanvasElement) => () => void}
   */
  const load = (placeBytes, figureBytes, objectBytes) => (canvas) => {
    let cancelled = false
    /** @type {typeof viewer} */
    let made = null
    error = ''
    viewer = null
    import('./lib/shot-scene.js')
      .then(async (mod) => {
        sceneModule = mod
        made = await mod.createShotScene(canvas, { place: placeBytes, figures: figureBytes, objects: objectBytes })
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
    if (viewer && blocking && definition) viewer.show(blocking, shot?.models?.figures ?? [], definition)
  })
  $effect(() => {
    if (viewer && camera && frame) viewer.frame(camera, frame.width, frame.height)
  })

  /** @param {ShotCamera} next */
  const preview = (next) => {
    if (blocking) draft = { blockingId: blocking.id, camera: next }
  }
  /** @param {ShotCamera} next */
  const commit = (next) => {
    preview(next)
    oncamera(next)
  }

  // Degrees of turn per pixel dragged, and the dolly's rate per pixel.
  const TURN = 0.3
  const DOLLY = 0.01
  /** @type {{ x: number, y: number, start: ShotCamera, dolly: boolean, moved: boolean } | null} */
  let drag = null

  /** @param {PointerEvent} event */
  function down(event) {
    if (!camera || event.button !== 0) return
    const target = /** @type {HTMLElement} */ (event.currentTarget)
    target.setPointerCapture?.(event.pointerId)
    drag = { x: event.clientX, y: event.clientY, start: camera, dolly: event.shiftKey, moved: false }
  }
  /** @param {PointerEvent} event */
  function move(event) {
    if (!drag) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!dx && !dy) return
    drag.moved = true
    preview(drag.dolly ? dolly(drag.start, Math.exp(dy * DOLLY)) : orbit(drag.start, -dx * TURN, dy * TURN))
  }
  function up() {
    if (drag?.moved && camera) oncamera(camera)
    drag = null
  }

  /** @type {Record<string, (cam: ShotCamera) => ShotCamera>} */
  const KEYS = {
    ArrowLeft: (c) => orbit(c, 5, 0),
    ArrowRight: (c) => orbit(c, -5, 0),
    ArrowUp: (c) => orbit(c, 0, 5),
    ArrowDown: (c) => orbit(c, 0, -5),
    '+': (c) => dolly(c, 0.9),
    '=': (c) => dolly(c, 0.9),
    '-': (c) => dolly(c, 1 / 0.9),
  }
  /** @param {KeyboardEvent} event */
  function key(event) {
    const step = KEYS[event.key]
    if (!step || !camera) return
    event.preventDefault()
    commit(step(camera))
  }

  /** @param {Event & { currentTarget: HTMLInputElement }} event */
  const lens = (event) => camera && { ...camera, lensMm: Number(event.currentTarget.value) }
</script>

{#if !shot}
  <EmptyState title="No shot to show." icon="video-camera" />
{:else}
  <div class="shot-previs" style:aspect-ratio={aspect} {@attach measure}>
    {#if place && definition}
      <!-- The canvas stays while the scene does, through unready shots, so a cut never reloads. -->
      <!-- An application region: drag and the arrow keys move the camera, as its label says. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <div
        class="shot-previs__frame"
        hidden={!blocking}
        role="application"
        tabindex="0"
        aria-label="Shot previs. Drag to turn the camera around what it looks at, or Shift-drag to move it closer. Arrow keys turn it; plus and minus move it."
        style:width="{frame?.width ?? 0}px"
        style:height="{frame?.height ?? 0}px"
        style:left="{frame?.left ?? 0}px"
        style:top="{frame?.top ?? 0}px"
        onpointerdown={down}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
        onkeydown={key}
      >
        <canvas {@attach load(placeBytes, figureBytes, objectBytes)}></canvas>
      </div>
    {/if}
    {#if !blocking}
      <div class="shot-previs__state">
        <EmptyState title={UNREADY[shot.state === 'blocked' ? 'none' : shot.state]} icon="video-camera-slash">
          {#if shot.reasons?.length}
            <ul class="shot-previs__reasons">
              {#each shot.reasons as reason, i (i)}<li>{reason.message}</li>{/each}
            </ul>
          {/if}
        </EmptyState>
      </div>
    {:else if !place || !definition}
      <div class="shot-previs__state"><EmptyState title="This scene's models aren't loaded." icon="cube" /></div>
    {:else if error}
      <div class="shot-previs__state"><EmptyState title="Couldn't show the previs" description={error} icon="warning" /></div>
    {:else if !viewer}
      <div class="shot-previs__state"><EmptyState title="Loading the previs…" icon="circle-notch" /></div>
    {/if}
    {#if blocking && camera && place && definition}
      <div class="shot-previs__lens">
        <label
          >Lens <input
            type="range"
            min="12"
            max="200"
            step="1"
            value={camera.lensMm}
            oninput={(event) => {
              const next = lens(event)
              if (next) preview(next)
            }}
            onchange={(event) => {
              const next = lens(event)
              if (next) commit(next)
            }}
          /></label
        >
        <output>{camera.lensMm} mm</output>
      </div>
    {/if}
  </div>
{/if}

<style>
  .shot-previs {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* The passepartout: the panel outside the shot's frame. */
    background: var(--surface-base);
  }
  .shot-previs__frame {
    position: absolute;
    background: var(--surface-raised);
    outline: 1px solid var(--border-hairline);
    touch-action: none;
    cursor: grab;
  }
  .shot-previs__frame:focus-visible {
    outline: 2px solid var(--border-focus);
  }
  .shot-previs__frame[hidden] {
    display: none;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .shot-previs__state {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }
  .shot-previs__reasons {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .shot-previs__lens {
    position: absolute;
    right: 8px;
    bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--surface-base);
    border: 1px solid var(--border-hairline);
    border-radius: 4px;
  }
  .shot-previs__lens label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
