<script>
  // PlaceBuildRounds — a Place Build, round by round, while it runs and after (khaos-app#587).
  // A filmstrip of the rounds khaosd has written, a pending tile while the job runs, and the
  // selected round's camera views below. State is carried by marks, not sentences: an accent
  // check for the submitted round, a flag for the draft written when the job stopped, a warning
  // count for a round with camera problems. The host formats every string it passes and picks
  // the selected round; it follows the newest while running, until the person picks one.
  //
  // Line art is 3:2 (khaosd renders 1536×1024), drawn whole. A round or camera with no picture
  // and not loading is an empty frame: a draft khaosd cannot build has no views to show.
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} BuildRound
   * @property {number} round The round's number, from 1.
   * @property {'draft' | 'submitted' | 'final'} kind A render round, the submitted one, or the draft written when the job stopped.
   * @property {number} problems How many camera problems its placement report has.
   * @property {string} [thumbnail] The round's line art, as a URL the host resolved.
   * @property {boolean} [loading] The thumbnail is on its way.
   */

  /**
   * @typedef {Object} RoundCamera
   * @property {string} id The camera's id.
   * @property {string} [label] What to call it; the id when absent.
   * @property {string} [url] Its line art, as a URL the host resolved.
   * @property {boolean} [loading] The line art is on its way.
   * @property {readonly string[]} problems Its placement problems, as sentences.
   */

  /**
   * @typedef {Object} RoundDetail
   * @property {readonly RoundCamera[]} cameras The selected round's camera views.
   * @property {readonly string[]} unseenRooms The rooms no camera sees, by name.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly BuildRound[]} [rounds] The rounds written so far, oldest first.
   * @property {boolean} [running] The job is queued or running: a pending tile follows the rounds.
   * @property {string} [spend] The spend so far, formatted, e.g. "$0.04".
   * @property {string} [outcome] '' while running; once the job ends, a plain line saying how.
   * @property {number} [selected] The selected round's number; the newest when absent.
   * @property {(round: number) => void} [onselect] Asked with a round's number.
   * @property {RoundDetail | null} [detail] The selected round's views.
   */

  /** @type {Props} */
  let {
    rounds = [],
    running = false,
    spend = '',
    outcome = '',
    selected = undefined,
    onselect = undefined,
    detail = null,
  } = $props()

  /** @type {HTMLElement | undefined} */
  let strip = $state()

  const newest = $derived(rounds.at(-1)?.round ?? 0)
  const current = $derived(selected ?? newest)
  // While running, the round in progress is the one after the newest written.
  const heading = $derived(running ? newest + 1 : newest)

  /** @param {number} n */
  const problemsName = (n) => (n === 1 ? '1 camera problem' : `${n} camera problems`)

  /** @param {BuildRound} r */
  function tileName(r) {
    const parts = [`Round ${r.round}`]
    if (r.kind === 'submitted') parts.push('submitted')
    if (r.kind === 'final') parts.push('stopped here')
    parts.push(r.problems > 0 ? problemsName(r.problems) : 'no camera problems')
    return parts.join(', ')
  }

  /** @param {KeyboardEvent} e */
  function onkeydown(e) {
    const step = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity }[e.key]
    if (step === undefined || rounds.length === 0) return
    e.preventDefault()
    const at = Math.max(0, rounds.findIndex((r) => r.round === current))
    const next = rounds[Math.min(rounds.length - 1, Math.max(0, at + step))]
    onselect?.(next.round)
    const tile = /** @type {HTMLElement | null | undefined} */ (strip?.querySelector(`[data-round="${next.round}"]`))
    tile?.focus()
  }

  // Keep the selected tile in view; with the newest selected, keep the end in view, pending tile and all.
  $effect(() => {
    if (!strip) return
    void rounds.length
    if (current === newest) {
      strip.scrollLeft = strip.scrollWidth
      return
    }
    strip.querySelector(`[data-round="${current}"]`)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  })
</script>

<div class="ui-build-rounds" data-ui-id="build-rounds">
  <div class="ui-build-rounds__header">
    {#if running}<span class="ui-build-rounds__progress"><Icon name="circle-notch" /></span>{/if}
    {#if heading > 0}<span class="ui-build-rounds__round">Round {heading}</span>{/if}
    <span class="ui-build-rounds__status" role="status">{running || !outcome ? spend : outcome}</span>
  </div>

  {#if rounds.length > 0 || running}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="ui-build-rounds__strip" role="group" aria-label="Build rounds" bind:this={strip} {onkeydown}>
      {#each rounds as r (r.round)}
        <button
          type="button"
          class="ui-build-rounds__tile"
          data-round={r.round}
          data-kind={r.kind}
          data-problems={r.problems > 0 ? '' : undefined}
          aria-label={tileName(r)}
          aria-pressed={r.round === current}
          tabindex={r.round === current ? 0 : -1}
          onclick={() => onselect?.(r.round)}>
          <span class="ui-build-rounds__frame" data-loading={r.loading ? '' : undefined} aria-hidden="true">
            {#if r.thumbnail}<img src={r.thumbnail} alt="" />{/if}
          </span>
          <span class="ui-build-rounds__badge" aria-hidden="true">{r.round}</span>
          <span class="ui-build-rounds__marks" aria-hidden="true">
            {#if r.problems > 0}
              <span class="ui-build-rounds__warn"><Icon name="warning" weight="fill" />{r.problems}</span>
            {/if}
            {#if r.kind === 'submitted'}
              <span class="ui-build-rounds__mark" data-tone="accent"><Icon name="check-circle" weight="fill" /></span>
            {:else if r.kind === 'final'}
              <span class="ui-build-rounds__mark"><Icon name="flag-checkered" weight="fill" /></span>
            {:else if r.problems === 0}
              <span class="ui-build-rounds__mark" data-tone="neutral"><Icon name="circle" /></span>
            {/if}
          </span>
        </button>
      {/each}
      {#if running}
        <div class="ui-build-rounds__tile ui-build-rounds__tile--pending" role="img" aria-label="Round {newest + 1}, in progress">
          <span class="ui-build-rounds__frame" data-loading=""></span>
          <span class="ui-build-rounds__badge" aria-hidden="true">{newest + 1}</span>
        </div>
      {/if}
    </div>
  {/if}

  {#if detail}
    <div class="ui-build-rounds__views" role="group" aria-label="Round {current} views">
      {#each detail.cameras as cam (cam.id)}
        {@const name = cam.label || cam.id}
        <figure class="ui-build-rounds__view" data-problems={cam.problems.length > 0 ? '' : undefined}>
          <div class="ui-build-rounds__frame" data-loading={cam.loading ? '' : undefined}>
            {#if cam.url}<img src={cam.url} alt={name} />{/if}
          </div>
          <figcaption class="ui-build-rounds__caption">
            <span class="ui-build-rounds__name">{name}</span>
            {#if cam.problems.length > 0}
              <details class="ui-build-rounds__problems">
                <summary aria-label="{name}: {problemsName(cam.problems.length)}">
                  <span class="ui-build-rounds__warn" aria-hidden="true"><Icon name="warning" weight="fill" />{cam.problems.length}</span>
                </summary>
                <ul>
                  {#each cam.problems as problem, i (i)}<li>{problem}</li>{/each}
                </ul>
              </details>
            {/if}
          </figcaption>
        </figure>
      {/each}
    </div>
    {#if detail.unseenRooms.length > 0}
      <ul class="ui-build-rounds__unseen" aria-label="Rooms no camera sees">
        <li class="ui-build-rounds__unseen-mark" aria-hidden="true"><Icon name="eye-slash" /></li>
        {#each detail.unseenRooms as room (room)}<li class="ui-build-rounds__chip">{room}</li>{/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  .ui-build-rounds {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    min-width: 0;
    color: var(--text-primary);
    font-size: var(--data-md-size);
  }

  .ui-build-rounds__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
  .ui-build-rounds__round {
    font-weight: 600;
  }
  .ui-build-rounds__status {
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }
  .ui-build-rounds__progress {
    display: inline-flex;
    color: var(--tone-accent);
    animation: ui-build-rounds-spin 1s linear infinite;
  }

  .ui-build-rounds__strip {
    display: flex;
    gap: var(--spacing-xs);
    overflow-x: auto;
    padding-bottom: var(--spacing-2xs);
    scroll-behavior: smooth;
  }
  .ui-build-rounds__tile {
    position: relative;
    flex: 0 0 auto;
    width: 120px;
    padding: 0;
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .ui-build-rounds__tile[data-problems] {
    border-color: var(--tone-warning);
  }
  /* After the warning edge: the selected round reads as selected whatever its state. */
  .ui-build-rounds__tile[aria-pressed='true'] {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 1px var(--border-focus);
  }
  .ui-build-rounds__tile:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  .ui-build-rounds__tile--pending {
    cursor: default;
    border-style: dashed;
  }

  .ui-build-rounds__frame {
    display: block;
    aspect-ratio: 3 / 2;
    overflow: hidden;
    border-radius: var(--radius-sm);
    background: var(--surface-base);
  }
  .ui-build-rounds__frame img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .ui-build-rounds__frame[data-loading] {
    animation: ui-build-rounds-pulse 1.6s ease-in-out infinite;
  }

  .ui-build-rounds__badge {
    position: absolute;
    top: var(--spacing-2xs);
    left: var(--spacing-2xs);
    min-width: 1.4em;
    padding: 0 var(--spacing-2xs);
    border-radius: var(--radius-full);
    background: var(--surface-raised);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }
  .ui-build-rounds__marks {
    position: absolute;
    top: var(--spacing-2xs);
    right: var(--spacing-2xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
  }
  .ui-build-rounds__mark {
    display: inline-flex;
    padding: 1px;
    border-radius: var(--radius-full);
    background: var(--surface-raised);
    color: var(--text-primary);
  }
  .ui-build-rounds__mark[data-tone='accent'] {
    color: var(--tone-accent);
  }
  .ui-build-rounds__mark[data-tone='neutral'] {
    color: var(--tone-neutral);
  }
  .ui-build-rounds__warn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0 var(--spacing-2xs);
    border-radius: var(--radius-full);
    background: var(--surface-raised);
    color: var(--tone-warning);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-variant-numeric: tabular-nums;
  }

  .ui-build-rounds__views {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }
  .ui-build-rounds__view {
    margin: 0;
    padding: var(--spacing-2xs);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
  }
  .ui-build-rounds__view[data-problems] {
    border-color: var(--tone-warning);
    box-shadow: inset 3px 0 0 var(--tone-warning);
  }
  .ui-build-rounds__caption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-2xs);
    padding-top: var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }
  .ui-build-rounds__name {
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
  .ui-build-rounds__problems {
    display: contents;
  }
  .ui-build-rounds__problems summary {
    cursor: pointer;
    list-style: none;
  }
  .ui-build-rounds__problems summary::-webkit-details-marker {
    display: none;
  }
  .ui-build-rounds__problems summary:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
    border-radius: var(--radius-full);
  }
  .ui-build-rounds__problems ul {
    flex-basis: 100%;
    margin: 0;
    padding-left: var(--spacing-md);
    color: var(--text-primary);
  }

  .ui-build-rounds__unseen {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }
  .ui-build-rounds__chip {
    padding: 0 var(--spacing-xs);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-full);
  }

  @keyframes ui-build-rounds-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes ui-build-rounds-pulse {
    50% {
      opacity: 0.5;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ui-build-rounds__progress,
    .ui-build-rounds__frame[data-loading] {
      animation: none;
    }
    .ui-build-rounds__strip {
      scroll-behavior: auto;
    }
  }
</style>
