<script>
  // The top-down plan of a place definition, drawn as SVG from the definition's own numbers
  // (place viewer frame §3): room outlines, openings as wall segments, each door leaf's swing,
  // fixture footprints, and each camera with its lens cone. It needs no build, so it follows
  // every local edit. The placement maths is lib/place-plan.js, held to the kit's build report.
  import EmptyState from './EmptyState.svelte'
  import { planOf } from './lib/place-plan.js'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/place-plan.js').PlaceDefinition | null} [definition] The place definition: rooms, openings, fixtures and cameras, as khaosd's `GET /api/places/definitions/{id}` returns it.
   * @property {string} [selected] The selected element's id (a room, opening, fixture or camera), or ''.
   * @property {(id: string) => void} [onselect] Reports an element chosen by click or keyboard.
   * @property {(id: string, pose: { position: number[], target: number[] }, done: boolean) => void} [onmovecamera] Cameras can be moved: dragging a camera moves its position, dragging the selected camera's target handle moves where it looks, and with a camera focused the arrow keys nudge its position by 0.1 m (with Shift, its target). Reports the plan pose, x and y in metres, as it moves; `done` is true once per drag, on release, and on every nudge. Absent, cameras only select.
   * @property {import('svelte').Snippet} [children] Drawn over the place, in the definition's frame (metres, +y north): how a shot's plan puts its figures, props and camera on it.
   */

  /** @type {Props} */
  let { definition = null, selected = '', onselect = () => {}, onmovecamera = undefined, children = undefined } = $props()

  const uid = $props.id()
  const hint = `${uid}-move`
  const plan = $derived(definition ? planOf(definition) : null)
  const MARGIN = 0.5
  const NUDGE = 0.1
  // The definition's frame is +y north; SVG's is +y down, so the drawing is flipped about y.
  const fitted = $derived(
    plan
      ? [plan.bounds.minX - MARGIN, -plan.bounds.maxY - MARGIN, plan.bounds.maxX - plan.bounds.minX + 2 * MARGIN, plan.bounds.maxY - plan.bounds.minY + 2 * MARGIN].join(' ')
      : '',
  )

  /**
   * The drag in progress: which camera, which end, the pointer's offset from that end, where the
   * press began on screen, and the frame held still so the plan does not refit under the pointer.
   * @type {{ id: string, end: 'position' | 'target', grab: number[], from: number[], viewBox: string, pose: { position: number[], target: number[] } | null } | null}
   */
  let drag = $state(null)
  // Screen pixels a press must travel before it is a drag. Below it, it is a click: it selects
  // and moves nothing, so a click never writes an edit (khaos-app#634).
  const DRAG_THRESHOLD = 3
  const viewBox = $derived(drag?.viewBox ?? fitted)

  /** @type {SVGGElement | undefined} */
  let frame = $state()

  /** @param {PointerEvent} event @returns {number[]} */
  function toPlan(event) {
    const matrix = frame?.getScreenCTM?.()
    if (!matrix) return [0, 0]
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    return [p.x, p.y]
  }

  /** @param {string} id */
  const cameraOf = (id) => plan?.cameras.find((c) => c.id === id)

  /** @param {string} id @param {'position' | 'target'} end @returns {(event: PointerEvent) => void} */
  const startDrag = (id, end) => (event) => {
    const camera = cameraOf(id)
    if (!onmovecamera || !camera || event.button !== 0) return
    const at = toPlan(event)
    drag = { id, end, grab: [camera[end][0] - at[0], camera[end][1] - at[1]], from: [event.clientX, event.clientY], viewBox: fitted, pose: null }
    const handle = /** @type {Element} */ (event.currentTarget)
    handle.setPointerCapture?.(event.pointerId)
  }

  /** @param {PointerEvent} event */
  function moveDrag(event) {
    const camera = drag && cameraOf(drag.id)
    if (!drag || !camera) return
    if (!drag.pose && Math.hypot(event.clientX - drag.from[0], event.clientY - drag.from[1]) < DRAG_THRESHOLD) return
    const at = toPlan(event)
    const point = [at[0] + drag.grab[0], at[1] + drag.grab[1]]
    const pose = { position: [...camera.position], target: [...camera.target], [drag.end]: point }
    drag.pose = pose
    onmovecamera?.(drag.id, pose, false)
  }

  function endDrag() {
    if (drag?.pose) onmovecamera?.(drag.id, drag.pose, true)
    drag = null
  }

  /** @type {Record<string, number[]>} */
  const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }

  /** @param {string} id @returns {(event: KeyboardEvent) => void} */
  const onCameraKey = (id) => (event) => {
    const step = ARROWS[event.key]
    const camera = cameraOf(id)
    if (!step || !onmovecamera || !camera) return onkey(id)(event)
    event.preventDefault()
    const end = event.shiftKey ? 'target' : 'position'
    const pose = { position: [...camera.position], target: [...camera.target] }
    pose[end] = [camera[end][0] + step[0] * NUDGE, camera[end][1] + step[1] * NUDGE]
    onmovecamera(id, pose, true)
  }

  /** @param {number[][]} points */
  const poly = (points) => points.map((p) => `${p[0]},${p[1]}`).join(' ')

  /** @param {{ hinge: number[], radius: number, closed: number[], open: number[], clockwise: boolean }} s */
  const swingPath = (s) =>
    `M${s.hinge[0]},${s.hinge[1]} L${s.closed[0]},${s.closed[1]} A${s.radius},${s.radius} 0 0 ${s.clockwise ? 0 : 1} ${s.open[0]},${s.open[1]} Z`

  /** @param {string} id @returns {(event: KeyboardEvent) => void} */
  const onkey = (id) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onselect(id)
    }
  }
</script>

{#if !plan}
  <EmptyState title="No place to draw." icon="map-trifold" />
{:else}
  <svg class="place-plan" {viewBox} role="group" aria-label="Place plan" data-dragging={drag ? '' : undefined}>
    <g transform="scale(1 -1)" bind:this={frame}>
      {#each plan.rooms as room (room.id)}
        <polygon
          class={['place-plan__room', { 'place-plan--selected': selected === room.id }]}
          points={poly(room.points)}
          role="button"
          tabindex="0"
          aria-label="{room.id}, room"
          aria-pressed={selected === room.id}
          onclick={() => onselect(room.id)}
          onkeydown={onkey(room.id)}
        />
      {/each}
      {#each plan.fixtures as f (f.id)}
        <polygon
          class={['place-plan__fixture', { 'place-plan--selected': selected === f.id }]}
          points={poly(f.points)}
          role="button"
          tabindex="0"
          aria-label="{f.id}, {f.kind}"
          aria-pressed={selected === f.id}
          onclick={() => onselect(f.id)}
          onkeydown={onkey(f.id)}
        />
      {/each}
      {#each plan.swings as s (s.id)}
        <path class="place-plan__swing" d={swingPath(s)} aria-hidden="true" />
      {/each}
      {#each plan.openings as o (o.id)}
        <line
          class={['place-plan__opening', { 'place-plan--selected': selected === o.id }]}
          x1={o.a[0]}
          y1={o.a[1]}
          x2={o.b[0]}
          y2={o.b[1]}
          role="button"
          tabindex="0"
          aria-label="{o.id}, {o.kind} opening"
          aria-pressed={selected === o.id}
          onclick={() => onselect(o.id)}
          onkeydown={onkey(o.id)}
        />
      {/each}
      {#each plan.cameras as c (c.id)}
        <g
          class={['place-plan__camera', { 'place-plan--selected': selected === c.id, 'place-plan--movable': !!onmovecamera }]}
          role="button"
          tabindex="0"
          aria-label="{c.id}, camera"
          aria-pressed={selected === c.id}
          aria-describedby={onmovecamera ? hint : undefined}
          onclick={() => onselect(c.id)}
          onkeydown={onCameraKey(c.id)}
          onpointerdown={startDrag(c.id, 'position')}
          onpointermove={moveDrag}
          onpointerup={endDrag}
          onpointercancel={endDrag}
        >
          <polygon class="place-plan__cone" points={poly([c.position, c.left, c.right])} />
          <circle cx={c.position[0]} cy={c.position[1]} r="0.08" />
        </g>
        {#if onmovecamera && selected === c.id}
          <line class="place-plan__aim" x1={c.position[0]} y1={c.position[1]} x2={c.target[0]} y2={c.target[1]} aria-hidden="true" />
          <circle
            class="place-plan__target"
            cx={c.target[0]}
            cy={c.target[1]}
            r="0.1"
            aria-hidden="true"
            onpointerdown={startDrag(c.id, 'target')}
            onpointermove={moveDrag}
            onpointerup={endDrag}
            onpointercancel={endDrag}
          />
        {/if}
      {/each}
      {@render children?.()}
    </g>
  </svg>
  {#if onmovecamera}
    <p id={hint} hidden>Drag to move. Arrow keys move the camera; Shift with the arrow keys moves where it looks.</p>
  {/if}
{/if}

<style>
  .place-plan {
    display: block;
    width: 100%;
    height: 100%;
    background: var(--surface-base);
  }
  .place-plan :is(polygon, line, path, circle) {
    vector-effect: non-scaling-stroke;
    stroke-width: 1px;
  }
  .place-plan [role='button'] {
    cursor: pointer;
    outline: none;
  }
  .place-plan [role='button']:focus-visible {
    stroke: var(--border-focus);
    stroke-width: 2px;
  }
  .place-plan__room {
    fill: var(--surface-raised);
    stroke: var(--text-secondary);
  }
  .place-plan__fixture {
    fill: var(--border-hairline);
    stroke: var(--text-secondary);
  }
  .place-plan .place-plan__opening {
    stroke: var(--surface-base);
    stroke-width: 4px;
  }
  .place-plan__swing {
    fill: none;
    stroke: var(--text-secondary);
    stroke-dasharray: 3 3;
  }
  .place-plan__camera .place-plan__cone {
    fill: var(--tone-info);
    fill-opacity: 0.12;
    stroke: var(--tone-info);
  }
  .place-plan__camera circle {
    fill: var(--tone-info);
  }
  .place-plan .place-plan--selected,
  .place-plan__camera.place-plan--selected .place-plan__cone {
    stroke: var(--action-primary);
    stroke-width: 2px;
  }
  .place-plan__camera.place-plan--movable,
  .place-plan__target {
    cursor: grab;
    touch-action: none;
  }
  .place-plan[data-dragging],
  .place-plan[data-dragging] [role='button'] {
    cursor: grabbing;
  }
  .place-plan__aim {
    stroke: var(--action-primary);
    stroke-dasharray: 4 3;
    pointer-events: none;
  }
  .place-plan__target {
    fill: var(--surface-base);
    stroke: var(--action-primary);
    stroke-width: 2px;
    cursor: grab;
  }
  .place-plan__fixture.place-plan--selected {
    fill: var(--action-primary);
    fill-opacity: 0.35;
  }
</style>
