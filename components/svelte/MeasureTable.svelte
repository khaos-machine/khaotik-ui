<script>
  // Several measures for many items, in one screen.
  //
  // THE FORM IS CHOSEN, NOT INHERITED. `BarChart` takes `[{ label, value }]` —
  // one measure per item — so three measures across 27 characters meant three
  // charts and vertical scrolling, and comparing a character's lines against its
  // words meant holding two pictures in your head. Past roughly seven items that
  // all carry meaning, the readable form for several measures is a table, with
  // the chart living inside the cells rather than beside them.
  //
  // EVERY COLUMN HAS ITS OWN SCALE, and this is the whole reason the component
  // exists rather than being a wide `BarChart`. Measured on the live capture:
  // word counts run to 4024 while scene counts run to 29. On one shared scale
  // every scene bar is under a pixel and the column reads as empty — a chart
  // that says "no data" about data it was given. Two measures of different scale
  // never share an axis; here each column is normalised against its own maximum,
  // which is that rule applied inside a table.
  //
  // So a bar is honest ACROSS a column and meaningless ACROSS a row. The number
  // beside it is the value; the bar is only ever "where does this item sit among
  // the others, for this measure".

  /**
   * @typedef {Object} Measure
   * @property {string} key The field to read off each row.
   * @property {string} label Column heading, and what a sort control announces.
   * @property {(value: number) => string} [format] Renders the number. Counts by default; a duration or a percentage belongs to the caller.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Record<string, any>[]} [rows] One object per item. Each carries a label field plus a numeric field per measure. Rows the kit cannot read a number from render the label and an empty cell rather than a zero — an absent measurement is not a measurement of zero.
   * @property {string} [labelKey] Which field is the row's name. `label` by default, so a caller with a differently-named field maps once rather than reshaping every row.
   * @property {readonly Measure[]} [measures] The columns, in the order given. Order is editorial and never inferred.
   * @property {string} [sortKey] Measure key to sort by, when the HOST owns sorting. Omit and the table sorts itself. `''` means the rows' own order, which is a real choice a host makes — the screenplay's order is not the same claim as "unsorted".
   * @property {'asc'|'desc'} [sortDir] Direction, when the host owns sorting.
   * @property {(sort: { key: string, dir: 'asc'|'desc' }) => void} [onSort] Called when a heading is activated. A host that only wants to OBSERVE sorting can pass this alone.
   * @property {string} [selectedKey] Label of the emphasised row. The rest recede rather than disappearing — context is the point of showing all of them.
   * @property {(row: Record<string, any>) => void} [onSelect] Called with the row the user picked. Omit it and rows are not interactive, so a read-only table announces no controls it does not have.
   * @property {string} [caption] Describes the table, announced as its accessible description.
   * @property {string} [emptyLabel] Rendered instead of the table when there is nothing to draw. A zeroed table reads as a measurement of nothing rather than as nothing measured.
   */

  /** @type {Props} */
  let {
    rows = [],
    labelKey = 'label',
    measures = [],
    sortKey: sortKeyProp = undefined,
    sortDir: sortDirProp = undefined,
    onSort = undefined,
    selectedKey = '',
    onSelect = undefined,
    caption = '',
    emptyLabel = 'Nothing to compare yet.',
  } = $props()

  // Controlled when the host passes `sortKey`, otherwise held here. `undefined`
  // is the uncontrolled signal rather than `''`, because `''` is a meaningful
  // value meaning the rows' own order — collapsing the two would make asking for
  // the original order indistinguishable from giving up control.
  let ownKey = $state('')
  let ownDir = $state('desc')
  const sortKey = $derived(sortKeyProp !== undefined ? sortKeyProp : ownKey)
  const sortDir = $derived(sortDirProp !== undefined ? sortDirProp : ownDir)

  const num = (row, key) => (Number.isFinite(row?.[key]) ? row[key] : null)

  // Per-column maxima. Computed over the rows as given, so a filtered set
  // rescales to what is on screen rather than to a total the reader cannot see.
  const maxima = $derived(
    Object.fromEntries(
      measures.map((m) => [m.key, Math.max(0, ...rows.map((r) => num(r, m.key) ?? 0))]),
    ),
  )

  const sorted = $derived.by(() => {
    if (!sortKey) return rows
    const dir = sortDir === 'asc' ? 1 : -1
    // A row missing this measure sorts last in BOTH directions. Treating absent
    // as zero would rank it among the real zeroes and claim a measurement.
    return [...rows].sort((a, b) => {
      const x = num(a, sortKey)
      const y = num(b, sortKey)
      if (x === null && y === null) return 0
      if (x === null) return 1
      if (y === null) return -1
      return (x - y) * dir
    })
  })

  function toggle(key) {
    const dir = sortKey === key && sortDir === 'desc' ? 'asc' : 'desc'
    if (sortKeyProp === undefined) {
      ownKey = key
      ownDir = dir
    }
    onSort?.({ key, dir })
  }

  const ariaSort = (key) => (sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none')
  const pct = (row, m) => {
    const v = num(row, m.key)
    const max = maxima[m.key]
    return v === null || max <= 0 ? 0 : (v / max) * 100
  }
</script>

{#if !rows.length || !measures.length}
  <p class="mtable__empty">{emptyLabel}</p>
{:else}
  <table class="mtable">
    {#if caption}<caption class="mtable__caption">{caption}</caption>{/if}
    <thead>
      <tr>
        <th scope="col" class="mtable__name">Name</th>
        {#each measures as m (m.key)}
          <th scope="col" class="mtable__head" aria-sort={ariaSort(m.key)}>
            <button type="button" class="mtable__sort" onclick={() => toggle(m.key)}>
              {m.label}<span class="mtable__arrow" aria-hidden="true"
                >{sortKey === m.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span
              >
            </button>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sorted as row (row[labelKey])}
        {@const name = row[labelKey]}
        <tr
          class="mtable__row"
          class:mtable__row--selected={Boolean(selectedKey) && name === selectedKey}
          class:mtable__row--dimmed={Boolean(selectedKey) && name !== selectedKey}
        >
          <th scope="row" class="mtable__name">
            {#if onSelect}
              <button type="button" class="mtable__pick" onclick={() => onSelect(row)}>{name}</button>
            {:else}{name}{/if}
          </th>
          {#each measures as m (m.key)}
            {@const value = num(row, m.key)}
            <td class="mtable__cell">
              {#if value === null}
                <span class="mtable__absent" title="Not measured">—</span>
              {:else}
                <span class="mtable__value">{m.format ? m.format(value) : value}</span>
                <!-- aria-hidden: the number is right beside it, so announcing the
                     bar would read the same fact twice. -->
                <span class="mtable__track" aria-hidden="true"
                  ><span
                    class="mtable__fill"
                    class:mtable__fill--present={value > 0}
                    style="width: {pct(row, m)}%"
                  ></span></span
                >
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .mtable {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .mtable__caption {
    text-align: left;
    padding-bottom: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .mtable__head,
  .mtable__name {
    text-align: left;
    font-weight: var(--label-sm-weight);
    color: var(--text-secondary);
    padding: var(--spacing-2xs) var(--spacing-sm) var(--spacing-2xs) 0;
    border-bottom: 1px solid var(--border-default);
    white-space: nowrap;
  }

  .mtable__sort {
    all: unset;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    letter-spacing: var(--label-sm-track);
  }

  .mtable__sort:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  /* Reserves the arrow's width at all times, so sorting a column does not shift
     every heading beside it. */
  .mtable__arrow {
    display: inline-block;
    min-width: 0.75em;
  }

  .mtable__row--dimmed {
    opacity: 0.55;
  }

  /* The emphasis is carried by the others receding plus a heavier fill, NOT by
     a hue. Gold is reserved for the brand and primary actions, and a selected
     row is neither. */
  .mtable__row--selected .mtable__fill {
    background: color-mix(in oklab, var(--text-primary) 80%, transparent);
  }

  .mtable__row--selected .mtable__name {
    font-weight: var(--label-sm-weight);
  }

  tbody .mtable__name {
    font-weight: 400;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-hairline);
  }

  .mtable__pick {
    all: unset;
    cursor: pointer;
  }

  .mtable__pick:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .mtable__cell {
    padding: var(--spacing-2xs) var(--spacing-sm) var(--spacing-2xs) 0;
    border-bottom: 1px solid var(--border-hairline);
    white-space: nowrap;
  }

  .mtable__value {
    display: inline-block;
    min-width: 3.5ch;
    text-align: right;
    font-variant-numeric: tabular-nums; /* D57's numeral tokens never landed */
    color: var(--text-primary);
  }

  /* A track under every cell, not only filled ones, so a short bar reads as a
     small share rather than as a rendering failure. */
  .mtable__track {
    display: inline-block;
    width: 4rem;
    height: 6px;
    margin-left: var(--spacing-xs);
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--text-primary) 10%, transparent);
    vertical-align: middle;
    overflow: hidden;
  }

  .mtable__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: color-mix(in oklab, var(--text-primary) 45%, transparent);
  }

  /* A FLOOR FOR ANY NON-ZERO VALUE, and only for non-zero. Measured in the
     catalog: 13 lines against a column maximum of 297 is 4.4% of a 4rem track —
     about 3px, which the border-radius rounds into something that reads as a
     rendering artifact rather than as a small quantity.
     That is the same "under a pixel reads as nothing" failure this component was
     built to avoid, appearing WITHIN a column instead of across two. The number
     beside the bar carries the precision, so a floor costs no accuracy a reader
     was relying on — but it must never apply to a real zero, which has to stay
     visibly empty. */
  .mtable__fill--present {
    min-width: 3px;
  }

  .mtable__absent {
    color: var(--text-secondary);
  }

  .mtable__empty {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }
</style>
