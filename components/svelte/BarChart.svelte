<script>
  // A ranked categorical bar chart (#28).
  //
  // Hand-rolled, and that was a measured decision rather than a preference.
  // Prototyped against LayerCake — the strongest of four candidates — on the
  // same real data and the same build:
  //
  //   hand-rolled   70 lines   15,133 B gzipped
  //   LayerCake     79 lines   32,599 B gzipped, +9 transitive d3 packages
  //
  // The dependency produced MORE code, because LayerCake is headless: it gives
  // you scales and a measured container and you still draw every rectangle. What
  // it replaced was the arithmetic on line ~60 that turns a value into a width.
  // The full comparison, including why Unovis and LayerChart were ruled out, is
  // on issue #28.
  //
  // Sized to what the data actually holds. Measured on BROKEN IN 4 PLACES:
  // time-of-day is DAY 34 / NIGHT 20, scene type is INT 41 / EXT 12 / INT-EXT 1,
  // and location occupants is a top-heavy ranking of 27. Two bars, three bars,
  // and a list — which is the reason a charting dependency did not earn its
  // 17.5 KB here.

  /** @typedef {import('./lib/types.js').StatusTone} StatusTone */

  /**
   * One bar: a label and the value it measures.
   * @typedef {Object} Bar
   * @property {string} label
   * @property {number} value
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Bar[]} [data] `[{ label, value }]`, **already ordered by you**. Ranking is editorial — most-first, alphabetical and the screenplay's own order are each correct somewhere, and none is this component's to choose. An entry whose `value` is not finite is **dropped**, not drawn as zero: an entity the engine did not measure is not an entity measured at zero.
   * @property {string} [emptyLabel] Rendered instead of a chart when there is nothing to draw. Not decoration — a zeroed axis reads as *a measurement of nothing* rather than *an absence of measurement*.
   * @property {(value: number) => string} [format] Formats the number beside each bar. Counts by default; a percentage or a duration belongs to the caller.
   * @property {StatusTone} [tone] Bar colour, from the seven-way StatusTone scale.
   * @property {string} [caption] Optional caption, announced as the table's description.
   */

  /** @type {Props} */
  let {
    data = [],
    emptyLabel = 'No data yet.',
    format = (value) => String(value),
    tone = 'accent',
    caption = '',
  } = $props()

  // A non-finite value is dropped rather than drawn as zero. An entity the engine
  // did not measure is not an entity measured at zero, and a bar is a claim.
  const rows = $derived(data.filter((d) => d && Number.isFinite(d.value)))

  // Bars are proportional to the LARGEST value present, not to a total: these are
  // counts of different things, and a percentage-of-total would imply they sum to
  // something meaningful. They usually do not — a character appears in many
  // scenes, so occupant counts overlap.
  const max = $derived(Math.max(...rows.map((r) => r.value), 0))
</script>

{#if rows.length}
  <!-- A table rather than an SVG. The data IS tabular — labelled categories with
       counts — so a screen reader gets the numbers with no extra work, and it
       stays readable with no CSS at all, which an SVG chart does not. The bar is
       decoration over the real value in the next cell, and is aria-hidden for
       exactly that reason. -->
  <table class="barchart">
    {#if caption}<caption class="barchart__caption">{caption}</caption>{/if}
    <tbody>
      <!-- Index-keyed: this value is producer output and nothing makes it unique. -->
      {#each rows as row, i (i)}
        <tr class="barchart__row">
          <th scope="row" class="barchart__label">{row.label}</th>
          <td class="barchart__cell">
            <span
              class="barchart__bar"
              data-tone={tone}
              style:width={max > 0 ? `${(row.value / max) * 100}%` : '0%'}
              aria-hidden="true"
            ></span>
          </td>
          <td class="barchart__value">{format(row.value)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p class="barchart__empty">{emptyLabel}</p>
{/if}

<style>
  .barchart {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--body-md-size);
  }

  .barchart__caption {
    margin-bottom: var(--spacing-2xs);
    color: var(--text-tertiary);
    font-size: var(--caption-size);
    text-align: left;
  }

  /* The label column is as wide as its longest label and no wider — these are
     words ("INT/EXT", a character name), and a fixed column either truncates the
     long ones or wastes the row on the short ones. */
  .barchart__label {
    width: 1%;
    padding: 3px var(--spacing-xs) 3px 0;
    color: var(--text-secondary);
    font-weight: 400;
    text-align: left;
    white-space: nowrap;
  }

  .barchart__cell {
    width: 100%;
    padding: 3px 0;
  }

  .barchart__bar {
    display: block;
    height: 14px;
    /* A real but tiny value still has to be visible. This changes how narrow a
       bar may LOOK, never what it represents — INT/EXT is 1 of 54 and must not
       vanish into the axis. */
    min-width: 2px;
    border-radius: 2px;
    background: var(--tone-accent);
  }

  .barchart__bar[data-tone='success'] { background: var(--tone-success); }
  .barchart__bar[data-tone='warning'] { background: var(--tone-warning); }
  .barchart__bar[data-tone='danger'] { background: var(--tone-danger); }
  .barchart__bar[data-tone='info'] { background: var(--tone-info); }
  .barchart__bar[data-tone='neutral'] { background: var(--tone-neutral); }
  .barchart__bar[data-tone='skipped'] { background: var(--tone-skipped); }

  .barchart__value {
    padding: 3px 0 3px var(--spacing-xs);
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .barchart__empty {
    margin: 0;
    color: var(--text-tertiary);
    font-size: var(--body-md-size);
  }
</style>
