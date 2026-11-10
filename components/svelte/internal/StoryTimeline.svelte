<script>
  // The story as one line, start to end, answering three questions (operator, 2026-11-10):
  // "Where my big turns are" — every turn marked where it falls, as tall as its strength against
  // the story's strongest, the four strongest named; "Beats a structure expects" — a row of beats
  // for each structure that fits, on the same line; "Pacing" — a band shaded by how densely the
  // story turns, and the busiest and quietest fifth said in words.
  //
  // A named turn is a button that selects it, as its row in the list does; a turn that has not
  // been named is drawn and has nothing to select.

  /**
   * @typedef {Object} Props
   * @property {readonly import('../lib/story-overview.js').TimelineTurn[]} turns The turns, from `timelineTurns`.
   * @property {readonly { id: string, name: string, beats: readonly { name: string, position: number }[] }[]} [lenses] The structures that fit, from `fittingLenses`.
   * @property {ReturnType<typeof import('../lib/story-overview.js').pacing>} [pacing] From `pacing`.
   * @property {number} [selected] The selected named point's index, -1 for none.
   * @property {(point: number) => void} [onselect] Reports the named point's index.
   */

  /** @type {Props} */
  let { turns, lenses = [], pacing = null, selected = -1, onselect = undefined } = $props()

  /** The turn under the pointer or focus, whose name the caption shows over the selection's. */
  let active = $state(/** @type {import('../lib/story-overview.js').TimelineTurn | null} */ (null))
  const caption = $derived(active?.name ?? turns.find((t) => t.point !== -1 && t.point === selected)?.name ?? '')

  // The big turns are numbered at their marks and named in a key under the line. Names printed at
  // the marks collide whenever two strong turns sit close, which they do (b4p's last two are a
  // tenth of the story apart), and more so the narrower the frame; a number never does.
  const labels = $derived(turns.filter((t) => t.label).map((t, i) => ({ ...t, n: i + 1 })))

  const pct = (/** @type {number} */ n) => `${Math.round(n * 100)}%`
  const stretch = (/** @type {{ from: number, to: number }} */ s) => `${Math.round(s.from * 100)}–${Math.round(s.to * 100)}%`
</script>

<div class="ui-story-timeline" role="group" aria-label="Story timeline">
  {#each lenses as lens (lens.id)}
    <div class="ui-story-timeline__row">
      <span class="ui-story-timeline__name">{lens.name}</span>
      <ul class="ui-story-timeline__beats" aria-label={lens.name}>
        {#each lens.beats as beat, i (i)}
          <li
            class="ui-story-timeline__beat"
            style:left={pct(beat.position)}
            style:width={pct((lens.beats[i + 1]?.position ?? 1) - beat.position)}
            title="{beat.name} · {pct(beat.position)}"
          >{beat.name}</li>
        {/each}
      </ul>
    </div>
  {/each}

  {#if labels.length}
    <div class="ui-story-timeline__row">
      <span></span>
      <div class="ui-story-timeline__numbers" aria-hidden="true">
        {#each labels as t (t.sceneId)}<span class="ui-story-timeline__number" style:left="{t.position * 100}%">{t.n}</span>{/each}
      </div>
    </div>
  {/if}

  <div class="ui-story-timeline__row">
    <span class="ui-story-timeline__name">{lenses.length ? 'This story' : ''}</span>
    <div class="ui-story-timeline__track">
      {#each [0.25, 0.5, 0.75] as q (q)}<span class="ui-story-timeline__grid" style:left={pct(q)} aria-hidden="true"></span>{/each}
      {#each turns as t (t.sceneId)}
        {#if t.point === -1}
          <span class="ui-story-timeline__mark" style:left="{t.position * 100}%" style:--strength={t.height} aria-hidden="true"><span class="ui-story-timeline__bar"></span></span>
        {:else}
          <button
            type="button"
            class="ui-story-timeline__mark"
            style:left="{t.position * 100}%"
            style:--strength={t.height}
            aria-label={t.name}
            aria-pressed={t.point === selected}
            onclick={() => onselect?.(t.point)}
            onpointerenter={() => (active = t)}
            onpointerleave={() => (active = null)}
            onfocus={() => (active = t)}
            onblur={() => (active = null)}
          ><span class="ui-story-timeline__bar"></span></button>
        {/if}
      {/each}
    </div>
  </div>

  {#if pacing}
    <div class="ui-story-timeline__row">
      <span></span>
      <div class="ui-story-timeline__density" aria-hidden="true">
        {#each pacing.density as d, i (i)}<span style:--density={d}></span>{/each}
      </div>
    </div>
  {/if}

  <div class="ui-story-timeline__row">
    <span></span>
    <div class="ui-story-timeline__axis" aria-hidden="true">
      <span>Start</span>
      <span class="ui-story-timeline__caption">{caption}</span>
      <span>End</span>
    </div>
  </div>

  {#if labels.length}
    <div class="ui-story-timeline__row">
      <span></span>
      <!-- The marks are the controls and carry the names; the key repeats them for the eye. -->
      <ol class="ui-story-timeline__key" aria-hidden="true">
        {#each labels as t (t.sceneId)}<li><span class="ui-story-timeline__n">{t.n}</span>{t.name}</li>{/each}
      </ol>
    </div>
  {/if}

  {#if pacing}
    <div class="ui-story-timeline__row">
      <span></span>
      <p class="ui-story-timeline__pacing">Busiest {stretch(pacing.busy)} · Quietest {stretch(pacing.quiet)}</p>
    </div>
  {/if}
</div>

<style>
  .ui-story-timeline {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  /* Every row shares one x-axis: a name column, then the story from start to end. */
  .ui-story-timeline__row {
    display: grid;
    grid-template-columns: calc(var(--spacing-2xl) * 2) minmax(0, 1fr);
    gap: var(--spacing-xs);
    align-items: end;
  }

  .ui-story-timeline__name {
    color: var(--text-secondary);
  }

  .ui-story-timeline__beats {
    position: relative;
    height: var(--caption-line);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* A beat runs from where the structure expects it to the next beat, its start a hairline. */
  .ui-story-timeline__beat {
    position: absolute;
    top: 0;
    bottom: 0;
    padding-left: var(--spacing-2xs);
    border-left: var(--size-stroke-hairline) solid var(--border-default);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-story-timeline__track {
    position: relative;
    height: var(--spacing-2xl);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }

  /* A strip under the line, brighter where the story turns more often, so a busy stretch reads
     before any mark is counted. Under the marks rather than behind them, where it muddied them. */
  .ui-story-timeline__density {
    display: flex;
    height: var(--spacing-2xs);
    border-radius: 1px;
    overflow: hidden;
  }

  .ui-story-timeline__density span {
    flex: 1;
    background: color-mix(in oklab, var(--text-primary) calc(var(--density) * 45%), transparent);
  }

  /* A big turn's number, above its bar. */
  .ui-story-timeline__numbers {
    position: relative;
    height: var(--caption-line);
  }

  .ui-story-timeline__number {
    position: absolute;
    transform: translateX(-50%);
    color: var(--text-primary);
    font-weight: var(--label-md-weight);
  }

  .ui-story-timeline__key {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2xs) var(--spacing-md);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--text-primary);
  }

  .ui-story-timeline__key li {
    display: flex;
    gap: var(--spacing-2xs);
  }

  .ui-story-timeline__n {
    color: var(--text-secondary);
    font-weight: var(--label-md-weight);
  }

  /* Quarters, so a mark reads as early, middle or late without a scale to count. */
  .ui-story-timeline__grid {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: var(--size-stroke-hairline) dashed var(--border-hairline);
  }

  /* The mark is wider than its bar so it is a target a pointer can hit, centred on its position. */
  .ui-story-timeline__mark {
    position: absolute;
    bottom: 0;
    height: 100%;
    width: var(--spacing-xs);
    transform: translateX(-50%);
    padding: 0;
    border: 0;
    background: none;
  }

  button.ui-story-timeline__mark {
    cursor: pointer;
  }

  .ui-story-timeline__mark:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: 2px;
  }

  /* At least a few pixels, so the weakest turn is still a mark rather than nothing. */
  .ui-story-timeline__bar {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 3px;
    height: max(calc(var(--strength) * 100%), var(--spacing-2xs));
    transform: translateX(-50%);
    border-radius: 1px 1px 0 0;
    background: var(--text-secondary);
    transition: background 120ms ease;
  }

  button.ui-story-timeline__mark:hover .ui-story-timeline__bar,
  button.ui-story-timeline__mark:focus-visible .ui-story-timeline__bar,
  .ui-story-timeline__mark[aria-pressed='true'] .ui-story-timeline__bar {
    background: var(--text-primary);
  }

  .ui-story-timeline__mark[aria-pressed='true'] .ui-story-timeline__bar {
    width: 5px;
  }

  .ui-story-timeline__axis {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--spacing-xs);
  }

  .ui-story-timeline__caption {
    text-align: center;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-story-timeline__pacing {
    margin: 0;
  }
</style>
