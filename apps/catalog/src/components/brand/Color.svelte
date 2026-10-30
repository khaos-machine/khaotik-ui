<script>
  import { colors } from '@khaos-machine/khaotik-ui/tokens/parse.js'
  import { copyToken, copied, paint, surface } from '../../lib/brand-view.svelte.js'
  import SectionHeader from '@khaos-machine/khaotik-ui/components/svelte/SectionHeader.svelte'
  import BrandScreen from './BrandScreen.svelte'

  // Colour: the primitive ladders, the semantic layer that references them, and
  // the status tones. One screen because they are one subject read at three
  // depths — a semantic row is only legible next to the ladder it points into.
  //
  // Catalog chrome, not a D52 fixture: it documents the kit, so its controls are
  // plain copy-to-clipboard buttons and its headings carry the section names.
  let { showCompat = true } = $props()

  const active = surface()
  const tokens = $derived(active.tokens)

  // ---- the shared step axis -------------------------------------------------
  //
  // The families do not cover the same range: grey stops at 150, gold starts at
  // 400, indigo carries 14 rungs and blue 4. Laid out as independent wrapped
  // rows that is invisible — every family looks like a full ladder. So the
  // rungs are placed on ONE axis of every step any family declares, and a
  // family's missing steps stay empty. The raggedness is a fact about the kit,
  // and this is the view that shows it rather than flattening it away.
  //
  // Derived from the parsed tokens, never a hand-kept list: a new rung in
  // tokens.css adds its column here on the next build.
  const STEP = /-(\d+)$/

  const STEPS = [
    ...new Set(
      colors.flatMap(({ rungs }) =>
        rungs.map((rung) => Number(STEP.exec(rung.name)?.[1])).filter(Number.isFinite),
      ),
    ),
  ].sort((a, b) => a - b)

  // Per family: its rungs keyed to a column on that axis, each flagged with
  // whether it starts or ends a contiguous run. Adjacency is measured against
  // the shared axis, not against ±50 — green-50's neighbour on the axis is 100
  // (grey's), which green does not have, so green-50 is a run of one.
  const ramps = colors.map(({ family, rungs }) => {
    const byStep = new Map()
    for (const rung of rungs) {
      const step = Number(STEP.exec(rung.name)?.[1])
      if (Number.isFinite(step)) byStep.set(step, rung)
    }
    const cells = STEPS.map((step, i) => {
      const rung = byStep.get(step)
      if (!rung) return null
      return {
        ...rung,
        // +1 for CSS's 1-based columns, +1 again for the family-label column
        column: i + 2,
        runStart: !byStep.has(STEPS[i - 1]),
        runEnd: !byStep.has(STEPS[i + 1]),
      }
    }).filter((cell) => cell !== null)
    return { family, cells }
  })

  // Semantic tokens, grouped by their role prefix for labelled rows.
  const SEMANTIC_GROUPS = [
    { prefix: 'surface-', label: 'surface' },
    { prefix: 'text-', label: 'text' },
    { prefix: 'action-', label: 'action' },
    { prefix: 'border-', label: 'border' },
  ]

  const semanticGroups = $derived(
    SEMANTIC_GROUPS.map((group) => ({
      ...group,
      tokens: tokens.semantic.filter((token) => token.name.startsWith(group.prefix)),
    })),
  )

  // status-normal-fg → "normal": the fg/bg/mark triplet grouped per tone.
  const statusTones = $derived.by(() => {
    const groups = new Map()
    for (const token of tokens.status) {
      const tone = token.name.replace(/^status-/, '').replace(/-(fg|bg|mark)$/, '')
      if (!groups.has(tone)) groups.set(tone, [])
      groups.get(tone).push(token)
    }
    return [...groups].map(([tone, tokens]) => ({ tone, tokens }))
  })
</script>

<BrandScreen title="Color">
  <!-- (a) primitive colour ladders, on the shared step axis -->
  <section class="palette">
    <SectionHeader eyebrow="Palette" title="Primitive colours" />
    <div class="ramps">
      <div
        class="ramps__grid"
        style="grid-template-columns: var(--ramp-label) repeat({STEPS.length}, minmax(var(--ramp-cell), 1fr))"
      >
        <span class="ramps__corner" style="grid-row: 1; grid-column: 1"></span>
        {#each STEPS as step, i (step)}
          <span class="ruler" style="grid-row: 1; grid-column: {i + 2}">{step}</span>
        {/each}

        {#each ramps as ramp, row (ramp.family)}
          <!-- the empty track: a family's gaps are visible as unfilled axis -->
          <span class="ramp__track" style="grid-row: {row + 2}; grid-column: 2 / -1"></span>
          {#each ramp.cells as cell (cell.name)}
            <button
              class="swatch focus-ring--mark"
              class:is-start={cell.runStart}
              class:is-end={cell.runEnd}
              type="button"
              style="grid-row: {row + 2}; grid-column: {cell.column}"
              aria-label={`Copy --${cell.name}: ${cell.value}`}
              onclick={() => copyToken(cell)}
            >
              <span class="swatch__chip focus-mark" style:background-color={paint(cell)}></span>
              <span class="swatch__meta">
                <span class="swatch__name">--{cell.name}</span>
                <span class="swatch__value spec-value" class:copied={copied.is(cell.name)}>
                  {copied.is(cell.name) ? 'copied' : cell.value}
                </span>
              </span>
            </button>
          {/each}
          <span class="family__name" style="grid-row: {row + 2}; grid-column: 1">{ramp.family}</span>
        {/each}
      </div>
    </div>
  </section>

  <!-- (b) semantic — surface / text / action / border as labelled rows -->
  <section>
    <SectionHeader eyebrow="Semantic" title="Semantic tokens" />
    {#each semanticGroups as group (group.prefix)}
      <div class="token-group">
        <span class="token-group__label">{group.label}</span>
        <div class="token-group__rows">
          {#each group.tokens as token (token.name)}
            <button
              class="token-row focus-ring--mark"
              type="button"
              aria-label={`Copy --${token.name}: ${token.value}`}
              onclick={() => copyToken(token)}
            >
              <span class="token-row__name">--{token.name}</span>
              <span class="token-row__chip focus-mark spec-chip" style:background-color={paint(token)}></span>
              <span class="token-row__value spec-value spec-value--truncate" class:copied={copied.is(token.name)}>
                {copied.is(token.name) ? 'copied' : token.value}
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </section>

  <!-- (c) status tones -->
  <section>
    <SectionHeader eyebrow="Status" title="Status tones" />
    {#each statusTones as group (group.tone)}
      <div class="token-group">
        <span class="token-group__label">{group.tone}</span>
        <div class="token-group__rows">
          {#each group.tokens as token (token.name)}
            <button
              class="token-row focus-ring--mark"
              type="button"
              aria-label={`Copy --${token.name}: ${token.value}`}
              onclick={() => copyToken(token)}
            >
              <span class="token-row__name">--{token.name}</span>
              <span class="token-row__chip focus-mark spec-chip" style:background-color={paint(token)}></span>
              <span class="token-row__value spec-value spec-value--truncate" class:copied={copied.is(token.name)}>
                {copied.is(token.name) ? 'copied' : token.value}
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
    {#if showCompat && tokens.statusCompat.length}
      <div class="token-group">
        <span class="token-group__label">legacy st-*</span>
        <div class="token-group__rows">
          {#each tokens.statusCompat as token (token.name)}
            <button
              class="token-row focus-ring--mark"
              type="button"
              aria-label={`Copy --${token.name}: ${token.value}`}
              onclick={() => copyToken(token)}
            >
              <span class="token-row__name">--{token.name}</span>
              <span class="token-row__chip focus-mark spec-chip" style:background-color={paint(token)}></span>
              <span class="token-row__value spec-value spec-value--truncate" class:copied={copied.is(token.name)}>
                {copied.is(token.name) ? 'copied' : token.value}
              </span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </section>
</BrandScreen>

<style>
  /* ---- (a) primitive colour ladders, on the shared step axis ---- */

  .palette {
    /* the ramps are a comparison table; they get the full column, while the
       reading-width sections below keep their measure */
    --ramp-label: 72px;
    --ramp-cell: 72px;
    --ramp-chip: 60px;
  }

  .ramps {
    /* 20 steps do not fit every viewport. Scrolling the axis is honest; a
       wrapped ladder that hides which step a swatch sits on is not. */
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: var(--spacing-2xs);
  }

  .ramps__grid {
    display: grid;
    /* grid-template-columns is set inline from STEPS.length */
    row-gap: var(--spacing-lg);
    align-items: start;
    width: max-content;
    min-width: 100%;
    /* names are wider than a cell and overflow into the space beside them —
       the last column has none, so the grid carries a trailing gutter */
    padding-right: var(--spacing-lg);
  }

  /* the family label stays put while the axis scrolls under it */
  .ramps__corner,
  .family__name {
    position: sticky;
    left: 0;
    z-index: 2;
    background: var(--surface-base);
    padding-right: var(--spacing-xs);
  }

  .family__name {
    align-self: start;
    padding-top: calc(var(--ramp-chip) / 2 - var(--label-sm-line) / 2);
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    color: var(--text-secondary);
  }

  .ruler {
    padding: 0 var(--spacing-2xs) var(--spacing-2xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--text-tertiary);
  }

  .ramp__track {
    height: var(--ramp-chip);
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
  }

  .swatch {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    padding: 0;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
  }

  .swatch__chip {
    --edge: var(--border-hairline);
    --edge-l: 0;
    --edge-r: 0;
    height: var(--ramp-chip);
    background: var(--surface-raised); /* neutral fallback for non-hex values */
    /* a hairline on the run's outside edges only — an inset border on every
       chip would draw a 2px seam between adjacent steps and break the ramp */
    box-shadow:
      inset 0 1px 0 var(--edge),
      inset 0 -1px 0 var(--edge),
      inset var(--edge-l) 0 0 var(--edge),
      inset var(--edge-r) 0 0 var(--edge);
  }

  .swatch.is-start .swatch__chip {
    --edge-l: 1px;
    border-top-left-radius: var(--radius-sm);
    border-bottom-left-radius: var(--radius-sm);
  }

  .swatch.is-end .swatch__chip {
    --edge-r: -1px;
    border-top-right-radius: var(--radius-sm);
    border-bottom-right-radius: var(--radius-sm);
  }

  .swatch:hover .swatch__chip {
    --edge: var(--border-default);
  }

  .swatch__meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: var(--spacing-2xs) var(--spacing-2xs) 0;
    min-width: 0;
  }

  .swatch__name {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    white-space: nowrap;
  }


  .swatch__value.copied {
    color: var(--text-brand);
  }

  /* ---- (b) semantic + (c) status rows ---- */

  .token-group {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: var(--spacing-md);
    align-items: start;
    max-width: 820px;
  }

  .token-group__label {
    padding-top: 1px;
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    color: var(--text-secondary);
  }

  /* One grid for the whole group, not one per row. The chip sits between the
     name and the reference it paints, so the name column has to resolve to the
     same width on every row — `max-content` on a per-row grid resolves per row,
     and the chips land on a ragged edge the moment one name outgrows the floor.

     160px is a floor, not a fit. Measured in Chrome, the longest name
     (--action-primary-pressed) is ~144px, so today every group clears it and
     all of them land on the same column. `max-content` is what guarantees a
     longer name is never clipped, and subgrid is what holds the rows aligned
     to each other when that happens. */
  .token-group__rows {
    display: grid;
    grid-template-columns: minmax(160px, max-content) 14px 1fr;
    /* the same value the rows declare, so a subgrid row and its parent agree on
       the gutters and nothing shifts between them */
    column-gap: var(--spacing-xs);
  }

  .token-row {
    display: grid;
    /* fallback for engines without subgrid: the same tracks, resolved per row */
    grid-template-columns: minmax(160px, max-content) 14px 1fr;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
    padding: 2px 0;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
  }

  .token-row:hover .token-row__chip {
    border-color: var(--border-default);
  }

  .token-row__name {
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-primary);
  }


  .token-row__value.copied {
    color: var(--text-brand);
  }
</style>
