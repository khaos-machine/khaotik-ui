<script>
  // A per-day bar series for ONE measure.
  //
  // One measure because two measures of different scale never share an axis
  // (MeasureTable's header): spend and calls are two TimeCharts over the same
  // days, not one chart with two series. The rest are BarChart's rules, kept:
  //
  // - a value that is not finite draws NO bar and reads as absent. A day with
  //   no measurement is not a day measured at zero, and a bar is a claim;
  // - bars are scaled to the largest finite value, never to a total;
  // - the figures live in a VISIBLE table, so every day and value is on screen
  //   and reachable without a pointer, as BarChart's are. The columns drawn
  //   above it are aria-hidden: they repeat the table's facts as a shape, and
  //   announcing them would read every figure twice. Nothing is in a hover
  //   title alone.
  //
  // Hand-rolled DOM, like BarChart: charts stay DOM/SVG (RULES.md, "Design-system
  // invariants"), and a column is a sized box.

  /** @typedef {import('./lib/types.js').StatusTone} StatusTone */

  /**
   * One day of the series.
   * @typedef {Object} Point
   * @property {string} day The calendar day, `YYYY-MM-DD`. What the day means (UTC or local) is the host's.
   * @property {number | null} value The measure for that day. `null` draws no bar and reads as absent, never as zero.
   * @property {boolean} [floor] The value is a lower bound: drawn distinctly and announced with `≥` before it.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Point[]} [points] One entry per day, **in your order** — the chart neither sorts nor fills gaps.
   * @property {(value: number) => string} [format] Renders a value. Counts by default; money or a duration belongs to the caller.
   * @property {string} [label] The chart's accessible name.
   * @property {string} [caption] Shown as the table's caption and announced as the chart's description.
   * @property {string} [emptyLabel] Rendered instead of an empty chart when there are no points.
   * @property {StatusTone} [tone] Bar colour, from the seven-way StatusTone scale.
   */

  /** @type {Props} */
  let {
    points = [],
    format = (value) => String(value),
    label = '',
    caption = '',
    emptyLabel = 'No data yet.',
    tone = 'accent',
  } = $props()

  const measured = (p) => p != null && Number.isFinite(p.value)
  const max = $derived(Math.max(0, ...points.filter(measured).map((p) => /** @type {number} */ (p.value))))
  const text = (p) => (measured(p) ? `${p.floor ? '≥ ' : ''}${format(p.value)}` : 'Not measured')

  // Day labels thin to the width: every `step`th one shows, and the first and
  // last always do. Before the plot is measured (or where nothing lays out, as
  // in jsdom) every label shows.
  // ponytail: a fixed label slot, not a measured one — fits the short "Nov 4"
  // form at caption size. Measure the rendered labels if a longer format arrives.
  const LABEL_SLOT_PX = 48
  const uid = $props.id()
  const captionId = `${uid}-caption`
  let width = $state(0)
  const step = $derived(width > 0 ? Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(width / LABEL_SLOT_PX)))) : 1)
  const ticked = (i) => {
    const last = points.length - 1
    return i === 0 || i === last || (i % step === 0 && last - i >= step)
  }

  // The day is read as UTC so the label never shifts by the reader's offset;
  // it is a calendar day, not an instant.
  const short = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const dayLabel = (day) => {
    const at = new Date(`${day}T00:00:00Z`)
    return Number.isNaN(at.getTime()) ? day : short.format(at)
  }
</script>

{#if points.length}
  <div class="timechart">
    <!-- Index-keyed throughout: `day` is the host's and nothing makes it unique. -->
    <div class="timechart__plot" aria-hidden="true" bind:clientWidth={width}>
      {#each points as p, i (i)}
        <div class="timechart__slot">
          {#if measured(p)}
            <span
              class="timechart__bar"
              data-day={p.day}
              data-tone={tone}
              data-floor={p.floor ? 'true' : undefined}
              style:height={max > 0 ? `${(/** @type {number} */ (p.value) / max) * 100}%` : '0%'}
              title={`${p.day}: ${text(p)}`}
            ></span>
          {/if}
        </div>
      {/each}
    </div>
    <div class="timechart__axis" aria-hidden="true">
      {#each points as p, i (i)}
        <div class="timechart__slot">
          {#if ticked(i)}<span class="timechart__tick" data-day={p.day}>{dayLabel(p.day)}</span>{/if}
        </div>
      {/each}
    </div>
    <!-- The caption is visible and also referenced by aria-describedby: with an
         aria-label naming the table, engines compute a <caption>'s role as the
         description unevenly, and the reference makes it explicit. -->
    <table class="timechart__table" aria-label={label || undefined} aria-describedby={caption ? captionId : undefined}>
      {#if caption}<caption class="timechart__caption" id={captionId}>{caption}</caption>{/if}
      <tbody>
        {#each points as p, i (i)}
          <tr class="timechart__row">
            <th scope="row" class="timechart__day">{p.day}</th>
            <td class="timechart__value">{text(p)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="timechart__empty">{emptyLabel}</p>
{/if}

<style>
  .timechart {
    position: relative;
    width: 100%;
  }

  .timechart__plot,
  .timechart__axis {
    display: flex;
    gap: 1px;
  }

  .timechart__plot {
    align-items: flex-end;
    height: 96px;
    border-bottom: 1px solid var(--border-default);
  }

  .timechart__slot {
    display: flex;
    flex: 1 1 0;
    justify-content: center;
    align-items: flex-end;
    min-width: 0;
    height: 100%;
  }

  .timechart__bar {
    --bar: var(--tone-accent);
    display: block;
    width: 100%;
    max-width: 24px;
    /* A real but tiny value still shows; it changes how short a bar may LOOK,
       never what it represents (BarChart's floor). */
    min-height: 2px;
    border-radius: 2px 2px 0 0;
    background: var(--bar);
  }

  .timechart__bar[data-tone='success'] { --bar: var(--tone-success); }
  .timechart__bar[data-tone='warning'] { --bar: var(--tone-warning); }
  .timechart__bar[data-tone='danger'] { --bar: var(--tone-danger); }
  .timechart__bar[data-tone='info'] { --bar: var(--tone-info); }
  .timechart__bar[data-tone='neutral'] { --bar: var(--tone-neutral); }
  .timechart__bar[data-tone='skipped'] { --bar: var(--tone-skipped); }

  /* A lower bound: a pale column under a solid cap, so it reads as "at least
     this high" rather than as a measured height. */
  .timechart__bar[data-floor='true'] {
    border-top: 2px solid var(--bar);
    background: color-mix(in oklab, var(--bar) 35%, transparent);
  }

  .timechart__axis .timechart__slot {
    overflow: visible;
  }

  .timechart__tick {
    padding-top: var(--spacing-2xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* BarChart's table: day and figure, dense, numbers right-aligned. */
  .timechart__table {
    width: 100%;
    margin-top: var(--spacing-xs);
    border-collapse: collapse;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .timechart__caption {
    padding-bottom: var(--spacing-2xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    text-align: left;
  }

  .timechart__day {
    padding: 2px var(--spacing-xs) 2px 0;
    border-bottom: 1px solid var(--border-hairline);
    color: var(--text-secondary);
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    text-align: left;
    white-space: nowrap;
  }

  .timechart__value {
    padding: 2px 0;
    border-bottom: 1px solid var(--border-hairline);
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .timechart__empty {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
</style>
