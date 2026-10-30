<script>
  // The plan of one shot (shot-kit frame §7.3): the place as PlacePlan draws it, with the shot's
  // door swings, and over it each figure as a puck with a facing handle, each floor prop as its
  // footprint, and the shot camera as a lens cone. Dragging a puck moves its figure and dragging
  // the handle turns it; either reports the whole figure once, on release. The inspector part holds
  // the selected figure's pose picker. It draws from the blocking's own numbers and builds nothing;
  // the maths is lib/shot-plan.js, held to the kit's conformance shot.
  import EmptyState from './EmptyState.svelte'
  import PlacePlan from './PlacePlan.svelte'
  import { lensCone } from './lib/place-plan.js'
  import { clientToPlan, facingOf, facingVector, objectFootprint, POSES } from './lib/shot-plan.js'

  /**
   * @typedef {import('./lib/shot-scene.js').ShotFigure} ShotFigure
   * @typedef {Object} Props
   * @property {'plan' | 'inspector'} [part] Which part to draw: the plan, or the selected figure's inspector with its pose picker.
   * @property {import('./lib/shot-scene.js').ShotBlocking | null} [blocking] The shot's head blocking, from the scene's previs read, or null.
   * @property {import('./lib/place-plan.js').PlaceDefinition | null} [definition] The place definition the blocking names.
   * @property {Record<string, { parts: { size: number[], position: number[], rotationDegrees: number[] }[] }>} [objectDefinitions] Each floor object's definition, by object definition id, for its footprint.
   * @property {Record<string, string>} [names] Each subject's display name, by subject id; a subject without one shows its id.
   * @property {string} [selected] The selected figure's or object's subject id, or ''.
   * @property {(id: string) => void} [onselect] Reports a figure or object chosen by click.
   * @property {(figure: ShotFigure) => void} [onfigure] Reports an edited figure, whole, once, when a drag, a key or the pose picker is released.
   */

  /** @type {Props} */
  let { part = 'plan', blocking = null, definition = null, objectDefinitions = {}, names = {}, selected = '', onselect = () => {}, onfigure = () => {} } = $props()

  const uid = $props.id()
  const PUCK = 0.25
  const HANDLE = 0.5
  const STEP = 0.1
  const TURN = 5

  // The place under the shot: its door leaves at the shot's swings, and none of its own cameras.
  const place = $derived(
    definition && blocking
      ? {
          ...definition,
          cameras: [],
          fixtures: definition.fixtures.map((f) => {
            const door = blocking.doors.find((d) => d.fixture === f.id)
            return door ? { ...f, swingDegrees: door.swingDegrees } : f
          }),
        }
      : null,
  )

  // A local edit, kept only while the blocking it was made on is the one shown.
  /** @type {{ blockingId: string, figure: ShotFigure } | null} */
  let draft = $state.raw(null)
  const figures = $derived(
    blocking ? blocking.figures.map((f) => (draft?.blockingId === blocking.id && draft.figure.subject.id === f.subject.id ? draft.figure : f)) : [],
  )
  const floorObjects = $derived(
    blocking
      ? blocking.objects.flatMap((o) => {
          const def = objectDefinitions[o.objectDefinitionId]
          return o.placement.floor && def ? [{ id: o.subject.id, points: objectFootprint(def, o.placement.floor) }] : []
        })
      : [],
  )
  const cone = $derived(blocking ? lensCone(blocking.camera) : null)
  const inspected = $derived(figures.find((f) => f.subject.id === selected) ?? null)

  /** @param {string} id */
  const nameOf = (id) => names[id] ?? id
  /** @param {number[][]} points */
  const poly = (points) => points.map((p) => `${p[0]},${p[1]}`).join(' ')

  /** @param {ShotFigure} figure */
  const preview = (figure) => {
    if (blocking) draft = { blockingId: blocking.id, figure }
  }
  /** @param {ShotFigure} figure */
  const commit = (figure) => {
    preview(figure)
    onfigure(figure)
  }

  /** @type {{ kind: 'move' | 'turn', start: ShotFigure, from: number[], rect: DOMRect, viewBox: number[], moved: boolean } | null} */
  let drag = null

  /** @param {PointerEvent} event @param {ShotFigure} figure @param {'move' | 'turn'} kind */
  function down(event, figure, kind) {
    if (event.button !== 0) return
    const target = /** @type {SVGGraphicsElement} */ (event.currentTarget)
    const svg = target.ownerSVGElement
    if (!svg) return
    target.setPointerCapture?.(event.pointerId)
    const rect = svg.getBoundingClientRect()
    const viewBox = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number)
    drag = { kind, start: figure, rect, viewBox, from: clientToPlan(rect, viewBox, event.clientX, event.clientY), moved: false }
  }
  /** @param {PointerEvent} event */
  function move(event) {
    if (!drag) return
    const p = clientToPlan(drag.rect, drag.viewBox, event.clientX, event.clientY)
    const f = drag.start
    if (drag.kind === 'move') {
      const dx = p[0] - drag.from[0]
      const dy = p[1] - drag.from[1]
      if (!dx && !dy) return
      drag.moved = true
      preview({ ...f, position: [round(f.position[0] + dx), round(f.position[1] + dy), f.position[2]] })
    } else {
      const dx = p[0] - f.position[0]
      const dy = p[1] - f.position[1]
      if (!dx && !dy) return
      drag.moved = true
      preview({ ...f, facingDegrees: facingOf(dx, dy) })
    }
  }
  function up() {
    const id = drag?.start.subject.id
    const edited = figures.find((f) => f.subject.id === id)
    if (drag?.moved && edited) onfigure(edited)
    drag = null
  }

  /** @param {number} v */
  const round = (v) => Math.round(v * 1e6) / 1e6

  /** @type {Record<string, [number, number]>} */
  const MOVES = { ArrowUp: [0, STEP], ArrowDown: [0, -STEP], ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0] }
  /** @param {KeyboardEvent} event @param {ShotFigure} f */
  function moveKey(event, f) {
    const d = MOVES[event.key]
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onselect(f.subject.id)
    }
    if (!d) return
    event.preventDefault()
    commit({ ...f, position: [round(f.position[0] + d[0]), round(f.position[1] + d[1]), f.position[2]] })
  }
  /** @param {KeyboardEvent} event @param {ShotFigure} f */
  function turnKey(event, f) {
    const d = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? TURN : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? -TURN : 0
    if (!d) return
    event.preventDefault()
    commit({ ...f, facingDegrees: facingOf(...facingVector(f.facingDegrees + d)) })
  }
</script>

{#if !place || !blocking}
  <EmptyState title="No shot to plan." icon="map-trifold" />
{:else if part === 'inspector'}
  {#if inspected}
    <div class="shot-plan__inspector">
      <h4>{nameOf(inspected.subject.id)}</h4>
      <label for="{uid}-pose">Pose</label>
      <select
        id="{uid}-pose"
        value={inspected.pose}
        onchange={(event) => {
          if (inspected) commit({ ...inspected, pose: event.currentTarget.value })
        }}
      >
        {#each POSES as pose (pose.value)}<option value={pose.value}>{pose.label}</option>{/each}
      </select>
    </div>
  {:else}
    <EmptyState title="Select a figure on the plan." icon="person-simple" />
  {/if}
{:else}
  <PlacePlan definition={place}>
    {#each floorObjects as o (o.id)}
      <polygon
        class={['shot-plan__object', { 'shot-plan--selected': selected === o.id }]}
        points={poly(o.points)}
        role="button"
        tabindex="0"
        aria-label="{nameOf(o.id)}, object"
        aria-pressed={selected === o.id}
        onclick={() => onselect(o.id)}
        onkeydown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onselect(o.id)
          }
        }}
      />
    {/each}
    {#if cone}
      <g class="shot-plan__camera" aria-hidden="true">
        <polygon points={poly([cone.position, cone.left, cone.right])} />
        <circle cx={cone.position[0]} cy={cone.position[1]} r="0.08" />
      </g>
    {/if}
    {#each figures as f (f.subject.id)}
      {@const face = facingVector(f.facingDegrees)}
      <g
        class={['shot-plan__figure', { 'shot-plan--selected': selected === f.subject.id }]}
        role="button"
        tabindex="0"
        aria-label="{nameOf(f.subject.id)}, figure"
        aria-pressed={selected === f.subject.id}
        onclick={() => onselect(f.subject.id)}
        onkeydown={(event) => moveKey(event, f)}
        onpointerdown={(event) => down(event, f, 'move')}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
      >
        <circle cx={f.position[0]} cy={f.position[1]} r={PUCK} />
      </g>
      <g
        class="shot-plan__handle"
        role="slider"
        tabindex="0"
        aria-label="{nameOf(f.subject.id)}'s facing"
        aria-valuemin={-180}
        aria-valuemax={180}
        aria-valuenow={f.facingDegrees}
        aria-valuetext="{Math.round(f.facingDegrees)} degrees"
        onkeydown={(event) => turnKey(event, f)}
        onpointerdown={(event) => down(event, f, 'turn')}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
      >
        <line x1={f.position[0]} y1={f.position[1]} x2={f.position[0] + face[0] * HANDLE} y2={f.position[1] + face[1] * HANDLE} />
        <circle cx={f.position[0] + face[0] * HANDLE} cy={f.position[1] + face[1] * HANDLE} r="0.09" />
      </g>
    {/each}
  </PlacePlan>
{/if}

<style>
  /* Drawn inside PlacePlan's SVG, from this component's markup, so these stay scoped here. */
  circle,
  line,
  polygon {
    vector-effect: non-scaling-stroke;
    stroke-width: 1px;
  }
  .shot-plan__figure,
  .shot-plan__handle,
  .shot-plan__object {
    cursor: pointer;
    outline: none;
    touch-action: none;
  }
  .shot-plan__figure:focus-visible circle,
  .shot-plan__handle:focus-visible circle,
  .shot-plan__object:focus-visible {
    stroke: var(--border-focus);
    stroke-width: 2px;
  }
  .shot-plan__figure circle {
    fill: var(--tone-accent);
    fill-opacity: 0.35;
    stroke: var(--tone-accent);
  }
  .shot-plan__handle line {
    stroke: var(--tone-accent);
    stroke-width: 2px;
  }
  .shot-plan__handle circle {
    fill: var(--tone-accent);
  }
  .shot-plan__object {
    fill: var(--tone-neutral);
    fill-opacity: 0.3;
    stroke: var(--text-secondary);
  }
  .shot-plan__camera polygon {
    fill: var(--tone-info);
    fill-opacity: 0.12;
    stroke: var(--tone-info);
  }
  .shot-plan__camera circle {
    fill: var(--tone-info);
  }
  .shot-plan--selected circle,
  .shot-plan__object.shot-plan--selected {
    stroke: var(--action-primary);
    stroke-width: 2px;
  }
  .shot-plan__inspector {
    display: grid;
    gap: 6px;
    padding: 8px 10px;
    font-size: 12px;
  }
  .shot-plan__inspector h4 {
    margin: 0;
    font-size: 13px;
  }
  .shot-plan__inspector select {
    font: inherit;
    color: inherit;
    background: transparent;
    border: 1px solid var(--border-hairline);
    border-radius: 2px;
    padding: 2px 4px;
    height: 24px;
  }
</style>
