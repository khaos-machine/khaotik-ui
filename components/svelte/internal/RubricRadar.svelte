<script>
  // The coverage rubric as one shape (operator, 2026-11-10: "Radar"): a spoke per dimension, the
  // score a tenth of the way out per point, so the script's strengths read as the shape's reach
  // and a weak dimension as a dent. Rings at five and ten give the scale. An unscored dimension
  // keeps a dashed spoke and no point, and its label says "No score".
  //
  // The shape is one image; each label is a group naming its dimension and score, in HTML so the
  // text stays at reading size whatever width the panel is.

  /**
   * @typedef {Object} Props
   * @property {readonly import('../lib/story-overview.js').RadarSpoke[]} spokes From `rubricRadar`.
   */

  /** @type {Props} */
  let { spokes } = $props()

  const at = (/** @type {number} */ k) => spokes.map((s) => `${50 + (s.spokeX - 50) * k},${50 + (s.spokeY - 50) * k}`).join(' ')
  const shape = $derived(spokes.filter((s) => s.score !== null).map((s) => `${s.x},${s.y}`).join(' '))
</script>

<div class="ui-rubric-radar">
  <svg class="ui-rubric-radar__chart" viewBox="0 0 100 100" role="img" aria-label="Rubric scores">
    <polygon class="ui-rubric-radar__ring" points={at(1)} />
    <polygon class="ui-rubric-radar__ring" points={at(0.5)} />
    {#each spokes as s (s.name)}
      <line class="ui-rubric-radar__spoke" class:ui-rubric-radar__spoke--open={s.score === null} x1="50" y1="50" x2={s.spokeX} y2={s.spokeY} />
    {/each}
    {#if shape}<polygon class="ui-rubric-radar__shape" points={shape} />{/if}
    {#each spokes as s (s.name)}
      {#if s.score !== null}<circle class="ui-rubric-radar__point" cx={s.x} cy={s.y} r="1.2" />{/if}
    {/each}
  </svg>
  {#each spokes as s (s.name)}
    <div class="ui-rubric-radar__label ui-rubric-radar__label--{s.side}" role="group" aria-label={s.name} style:left="{s.labelX}%" style:top="{s.labelY}%">
      <span class="ui-rubric-radar__name">{s.name}</span>
      <span class="ui-rubric-radar__score">{s.score === null ? 'No score' : `${s.score} / 10`}</span>
    </div>
  {/each}
</div>

<style>
  .ui-rubric-radar {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
  }
  .ui-rubric-radar__chart {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .ui-rubric-radar__ring,
  .ui-rubric-radar__spoke {
    fill: none;
    stroke: var(--border-default);
    stroke-width: 0.4;
  }
  .ui-rubric-radar__spoke--open {
    stroke-dasharray: 1.5 1.5;
  }
  .ui-rubric-radar__shape {
    fill: var(--text-secondary);
    fill-opacity: 0.25;
    stroke: var(--text-primary);
    stroke-width: 0.8;
    stroke-linejoin: round;
  }
  .ui-rubric-radar__point {
    fill: var(--text-primary);
  }
  /* A label hangs off its spoke's end, reading away from the centre. */
  .ui-rubric-radar__label {
    position: absolute;
    display: flex;
    flex-direction: column;
    max-width: 30%;
    font-size: var(--caption-size);
    line-height: 1.25;
    color: var(--text-secondary);
  }
  .ui-rubric-radar__label--start {
    transform: translate(0, -50%);
    text-align: left;
  }
  .ui-rubric-radar__label--end {
    transform: translate(-100%, -50%);
    align-items: flex-end;
    text-align: right;
  }
  .ui-rubric-radar__label--middle {
    transform: translate(-50%, -50%);
    align-items: center;
    text-align: center;
  }
  .ui-rubric-radar__score {
    font-weight: var(--label-md-weight);
    color: var(--text-primary);
  }
</style>
