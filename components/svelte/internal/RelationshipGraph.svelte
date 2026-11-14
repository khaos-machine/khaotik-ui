<script>
  // The read pairs as one picture (operator, 2026-11-14: "Graph in the card"): every character in
  // a read pair sits on one ring, the most connected at the top, and each read pair is a line
  // between its two, thicker the more evidence scenes it has. Choosing a line chooses that pair,
  // as a row in the list does. Names are HTML, as in RubricRadar, so they stay at reading size.

  /**
   * @typedef {Object} Props
   * @property {{ nodes: readonly import('../lib/story-overview.js').GraphNode[], edges: readonly import('../lib/story-overview.js').GraphEdge[] }} graph From `relationshipGraph`.
   * @property {number} [selected] The chosen pair's index in the relationships list, or -1.
   * @property {(index: number) => void} [onselect] Reports a pair chosen.
   */

  /** @type {Props} */
  let { graph, selected = -1, onselect = undefined } = $props()

  const most = $derived(Math.max(1, ...graph.edges.map((e) => e.scenes)))
  const chosen = $derived(graph.edges.find((e) => e.index === selected))
  const width = (/** @type {number} */ scenes) => 0.4 + (1.2 * scenes) / most
  /** @param {KeyboardEvent} event @param {number} index */
  function key(event, index) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onselect?.(index)
  }
</script>

<div class="ui-relationship-graph">
  <svg class="ui-relationship-graph__chart" viewBox="0 0 100 100" role="group" aria-label="Relationship graph">
    {#each graph.edges as e (e.index)}
      <g
        class="ui-relationship-graph__edge"
        class:ui-relationship-graph__edge--chosen={e.index === selected}
        class:ui-relationship-graph__edge--faded={!!chosen && e.index !== selected}
        role="button"
        tabindex="0"
        aria-label="{e.name}: {e.type}"
        aria-pressed={e.index === selected}
        onclick={() => onselect?.(e.index)}
        onkeydown={(event) => key(event, e.index)}
      >
        <title>{e.name}: {e.type}</title>
        <line class="ui-relationship-graph__hit" x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} />
        <line class="ui-relationship-graph__line" x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke-width={width(e.scenes)} />
      </g>
    {/each}
    {#each graph.nodes as n (n.id)}
      <circle class="ui-relationship-graph__node" class:ui-relationship-graph__node--chosen={chosen?.from.id === n.id || chosen?.to.id === n.id} cx={n.x} cy={n.y} r={1 + Math.min(n.pairs, 6) * 0.3} />
    {/each}
  </svg>
  {#each graph.nodes as n (n.id)}
    <span
      class="ui-relationship-graph__name ui-relationship-graph__name--{n.side}"
      class:ui-relationship-graph__name--chosen={chosen?.from.id === n.id || chosen?.to.id === n.id}
      class:ui-relationship-graph__name--faded={!!chosen && chosen.from.id !== n.id && chosen.to.id !== n.id}
      style:left="{n.labelX}%"
      style:top="{n.labelY}%">{n.name}</span>
  {/each}
</div>

<style>
  .ui-relationship-graph {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
  }
  .ui-relationship-graph__chart {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .ui-relationship-graph__edge {
    cursor: pointer;
    outline: none;
  }
  .ui-relationship-graph__hit {
    stroke: transparent;
    stroke-width: 3;
  }
  .ui-relationship-graph__line {
    stroke: var(--text-secondary);
    stroke-linecap: round;
    opacity: 0.7;
  }
  .ui-relationship-graph__edge:hover .ui-relationship-graph__line,
  .ui-relationship-graph__edge:focus-visible .ui-relationship-graph__line {
    stroke: var(--text-primary);
    opacity: 1;
  }
  .ui-relationship-graph__edge--chosen .ui-relationship-graph__line {
    stroke: var(--action-primary);
    opacity: 1;
  }
  .ui-relationship-graph__edge--faded .ui-relationship-graph__line {
    opacity: 0.25;
  }
  .ui-relationship-graph__node {
    fill: var(--text-secondary);
  }
  .ui-relationship-graph__node--chosen {
    fill: var(--text-primary);
  }
  /* A name hangs off its node, reading away from the centre. */
  .ui-relationship-graph__name {
    position: absolute;
    max-width: 28%;
    font-size: var(--caption-size);
    line-height: 1.25;
    color: var(--text-secondary);
    pointer-events: none;
    overflow-wrap: anywhere;
  }
  .ui-relationship-graph__name--chosen {
    color: var(--text-primary);
    font-weight: var(--label-md-weight);
  }
  .ui-relationship-graph__name--faded {
    opacity: 0.5;
  }
  .ui-relationship-graph__name--start {
    transform: translate(0, -50%);
    text-align: left;
  }
  .ui-relationship-graph__name--end {
    transform: translate(-100%, -50%);
    text-align: right;
  }
  .ui-relationship-graph__name--middle {
    transform: translate(-50%, -50%);
    text-align: center;
  }
</style>
