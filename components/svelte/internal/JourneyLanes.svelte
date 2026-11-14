<script>
  // Every journey as a lane across the story (operator, 2026-11-14: "Story lanes"): the lane runs
  // from the character's first evidence scene to the last, with a point at each turning point, and
  // its line says the arc: solid for complete, faint for unfinished, dashed for unclear. Choosing a
  // lane chooses that journey, as a row in the list does.

  /**
   * @typedef {Object} Props
   * @property {readonly import('../lib/story-overview.js').JourneyLane[]} lanes From `journeyLanes`.
   * @property {number} [selected] The chosen journey's index in the list, or -1.
   * @property {(index: number) => void} [onselect] Reports a journey chosen.
   */

  /** @type {Props} */
  let { lanes, selected = -1, onselect = undefined } = $props()

  const pct = (/** @type {number} */ n) => `${n * 100}%`
  const ARC_WORD = /** @type {Readonly<Record<string, string>>} */ ({ complete: 'complete arc', incomplete: 'unfinished arc', ambiguous: 'unclear arc' })
</script>

<div class="ui-journey-lanes" role="group" aria-label="Journey lanes">
  {#each lanes as l (l.index)}
    <button
      type="button"
      class="ui-journey-lanes__lane ui-journey-lanes__lane--{l.arc}"
      class:ui-journey-lanes__lane--chosen={l.index === selected}
      class:ui-journey-lanes__lane--faded={selected !== -1 && l.index !== selected}
      aria-label="{l.name}, {ARC_WORD[l.arc] ?? l.arc}, {l.points.length} turning {l.points.length === 1 ? 'point' : 'points'}"
      aria-pressed={l.index === selected}
      onclick={() => onselect?.(l.index)}
    >
      <span class="ui-journey-lanes__name">{l.name}</span>
      <span class="ui-journey-lanes__track">
        <span class="ui-journey-lanes__line" style:left={pct(l.from)} style:width={pct(l.to - l.from)}></span>
        {#each l.points as p, i (i)}<span class="ui-journey-lanes__point" style:left={pct(p)}></span>{/each}
      </span>
    </button>
  {/each}
  <div class="ui-journey-lanes__axis" aria-hidden="true"><span></span><span class="ui-journey-lanes__ends"><span>Start</span><span>End</span></span></div>
</div>

<style>
  .ui-journey-lanes {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .ui-journey-lanes__lane,
  .ui-journey-lanes__axis {
    display: grid;
    grid-template-columns: minmax(0, 8.5rem) minmax(0, 1fr);
    align-items: center;
    gap: var(--spacing-xs);
  }
  .ui-journey-lanes__lane {
    height: 20px;
    padding: 0 var(--spacing-2xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    text-align: left;
    color: var(--text-secondary);
    cursor: pointer;
  }
  .ui-journey-lanes__lane:hover,
  .ui-journey-lanes__lane:focus-visible {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
    color: var(--text-primary);
  }
  .ui-journey-lanes__lane--chosen {
    color: var(--text-primary);
    font-weight: var(--label-md-weight);
  }
  .ui-journey-lanes__lane--faded {
    opacity: 0.45;
  }
  .ui-journey-lanes__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--caption-size);
  }
  .ui-journey-lanes__track {
    position: relative;
    height: 100%;
  }
  .ui-journey-lanes__line {
    position: absolute;
    top: 50%;
    border-top: 2px solid var(--text-secondary);
    transform: translateY(-50%);
  }
  .ui-journey-lanes__lane--complete .ui-journey-lanes__line {
    border-top-color: var(--text-primary);
  }
  .ui-journey-lanes__lane--incomplete .ui-journey-lanes__line {
    opacity: 0.6;
  }
  .ui-journey-lanes__lane--ambiguous .ui-journey-lanes__line {
    border-top-style: dashed;
  }
  .ui-journey-lanes__lane--chosen .ui-journey-lanes__line {
    border-top-color: var(--action-primary);
    opacity: 1;
  }
  .ui-journey-lanes__point {
    position: absolute;
    top: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--text-primary);
    transform: translate(-50%, -50%);
  }
  .ui-journey-lanes__lane--chosen .ui-journey-lanes__point {
    background: var(--action-primary);
  }
  .ui-journey-lanes__axis {
    padding: var(--spacing-2xs) var(--spacing-2xs) 0;
  }
  .ui-journey-lanes__ends {
    display: flex;
    justify-content: space-between;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
</style>
