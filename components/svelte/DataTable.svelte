<script>
  // DataTable — the desktop collection (data-layer plan K5; audit §2 item 2, §3.1
  // principle 5, §3.16, §4.1).
  //
  // Virtualised: only the rows in the viewport plus `overscan` on each side are in the
  // DOM (lib/table.js `rowWindow`), while `aria-rowcount` and `aria-rowindex` stay true
  // to the whole set. Review rendered 1,912 rows and 151,287px of DOM before this.
  //
  // One persistent selection, owned by the host: a click, ↑ ↓ PageUp PageDown Home End
  // and type-ahead ASK for a row through `onselect`; Return asks to open it. The grid is
  // one tab stop, the selected row (roving tabindex). Selection is neutral; gold is never
  // the selection (audit §3.1 principle 11).
  //
  // Rows are one height (24px, harvest gap 9), which is what makes the window a pure
  // function of the scroll offset. With `wrap`, a long cell wraps in full instead: each
  // rendered row is measured as it lays out, a row not yet measured counts as `rowHeight`,
  // and the window is found over the running offsets (lib/table.js `offsetWindow`).
  import { tick } from 'svelte'
  import Button from './Button.svelte'
  import { flattenGroups, itemOffsets, offsetWindow, rowWindow, visibleRows } from './lib/table.js'

  /**
   * @typedef {import('./lib/table.js').Column<any> & { cell?: import('svelte').Snippet<[any]> }} TableColumn
   */

  /**
   * @typedef {Object} Props
   * @property {readonly any[]} [rows] Every row. Only the window is rendered.
   * @property {readonly TableColumn[]} [columns] Column definitions; `cell` is an optional snippet that draws the cell from its row.
   * @property {(row: any) => string} [rowKey] A row's stable id; the selection and the `data-ui-id` use it.
   * @property {string} [label] The grid's accessible name.
   * @property {string} [selected] The selected row's id.
   * @property {(id: string) => void} [onselect] Asked with a row's id.
   * @property {(id: string) => void} [onopen] Asked with the selected row's id on Return or double-click.
   * @property {string} [filter] Rows whose any column contains this text are shown.
   * @property {{ key: string, dir: 1 | -1 } | null} [sort] The sort. Controlled when given with `onsort`.
   * @property {(sort: { key: string, dir: 1 | -1 }) => void} [onsort] Asked with the sort a header click wants.
   * @property {(row: any) => string} [groupBy] Groups rows under a header row with a count, in first-seen order.
   * @property {number} [viewportHeight] The body's height in px. 0 measures it.
   * @property {number} [rowHeight] Every row's height in px; with `wrap`, the shortest row's.
   * @property {boolean} [wrap] Wraps long cells in full, so rows grow to fit their text; each is measured as it renders. A column with a `subtitle` measures rows the same way, without wrapping.
   * @property {number} [overscan] Rows rendered beyond each edge of the viewport.
   * @property {string} [empty] What an empty table says instead of rendering nothing.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [status] The rows' read. Only a loaded read says `empty`: a table still reading says so, and a failed read shows the host's message and Try again, so a failed read never reads as an empty story. Rows already shown stay while a re-read runs or fails; a failure is said under them.
   * @property {() => void} [onretry] Try again after a failed read. Absent, the failure shows no button.
   * @property {string} [loadingLabel] What a table still reading says.
   * @property {readonly any[]} [pinned] Rows pinned above the header, set off by a hairline: never sorted, filtered or counted with the body. They take the same columns, and the keyboard walks into them from the first row.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let {
    rows = [],
    columns = [],
    rowKey = (row) => String(row?.id ?? ''),
    label = '',
    selected = '',
    onselect = undefined,
    onopen = undefined,
    filter = '',
    sort = null,
    onsort = undefined,
    groupBy = undefined,
    viewportHeight = 0,
    // 24px: harvest gap 9 (`size.row`), a literal until Andrew decides it.
    rowHeight = 24,
    overscan = 8,
    wrap = false,
    empty = 'Nothing to show.',
    pinned = [],
    status = { kind: 'loaded' },
    onretry = undefined,
    loadingLabel = 'Reading…',
    uiId = 'table',
  } = $props()

  /** @type {{ key: string, dir: 1 | -1 } | null} */
  let order = $state(null)
  $effect.pre(() => {
    order = sort
  })

  let scrollTop = $state(0)
  let measured = $state(0)
  /** @type {HTMLDivElement | undefined} */
  let scroller = $state()

  const height = $derived(viewportHeight > 0 ? viewportHeight : measured)
  const shown = $derived(visibleRows(rows, columns, filter, order?.key ?? null, order?.dir ?? 1))
  const items = $derived(flattenGroups(shown, groupBy))
  /** Measured row heights by item key, for `wrap`; replaced whole so offsets re-derive. */
  let heights = $state.raw(/** @type {Map<string, number>} */ (new Map()))
  // Each item's key: its row id, so a measured height follows the row through a sort, with an
  // occurrence suffix on a repeat. A Go producer sends a missing id as '' and never as null, so
  // ids repeat in real payloads, and a repeated key aborts the render (khaotik-ui#94).
  const keys = $derived.by(() => {
    const seen = new Map()
    return items.map((item) => {
      const base = item.kind === 'row' ? `r:${rowKey(item.row)}` : `g:${item.key}`
      const n = seen.get(base) ?? 0
      seen.set(base, n + 1)
      return n ? `${base}#${n}` : base
    })
  })
  /** @param {number} i */
  const itemKey = (i) => keys[i] ?? ''
  /** A column with a subtitle makes rows differ in height, so they are measured as wrapped rows are. */
  const variableRows = $derived(wrap || columns.some((c) => c.subtitle))
  const offsets = $derived(variableRows ? itemOffsets(items.length, (i) => heights.get(itemKey(i)), rowHeight) : null)
  const win = $derived(offsets ? offsetWindow(offsets, scrollTop, height, overscan) : rowWindow(scrollTop, height, rowHeight, items.length, overscan))
  /** Item `i`'s top edge in px. @param {number} i */
  const topOf = (i) => (offsets ? (offsets[i] ?? 0) : i * rowHeight)
  const total = $derived(offsets ? (offsets[items.length] ?? 0) : items.length * rowHeight)

  /** @type {Map<string, number>} */
  let pending = new Map()
  let flush = 0
  /** Records a rendered row's height, batched to one update per frame. @param {HTMLElement} node @param {string} key */
  function measure(node, key) {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      const h = node.offsetHeight
      if (!h || heights.get(key) === h) return
      pending.set(key, h)
      flush ||= requestAnimationFrame(() => {
        heights = new Map([...heights, ...pending])
        pending = new Map()
        flush = 0
      })
    })
    observer.observe(node)
    return { destroy: () => observer.disconnect() }
  }
  /** Item indices of the data rows, in order — what the keyboard walks. */
  const rowItems = $derived(items.flatMap((item, i) => (item.kind === 'row' ? [i] : [])))
  const tracks = $derived(columns.map((c) => c.width).join(' '))

  /** @param {number} i */
  const keyAt = (i) => {
    const item = items[i]
    return item?.kind === 'row' ? rowKey(item.row) : ''
  }
  const selectedItem = $derived(selected === '' ? -1 : items.findIndex((item) => item.kind === 'row' && rowKey(item.row) === selected))
  /** The selected pinned row's index, or -1. */
  const pinnedAt = $derived(selected === '' ? -1 : pinned.findIndex((row) => rowKey(row) === selected))
  const tabStop = $derived(selectedItem >= 0 ? selectedItem : pinnedAt >= 0 ? -1 : (rowItems[0] ?? -1))
  /** The grid itself takes Tab only when no row can. */
  const gridTabStop = $derived(tabStop < 0 && pinnedAt < 0 && pinned.length === 0)

  /** @param {TableColumn} col */
  function ariaSort(col) {
    if (order?.key !== col.key) return 'none'
    return order.dir === 1 ? 'ascending' : 'descending'
  }

  /** @param {TableColumn} col */
  function sortBy(col) {
    /** @type {{ key: string, dir: 1 | -1 }} */
    const next = { key: col.key, dir: order?.key === col.key ? (order.dir === 1 ? -1 : 1) : 1 }
    order = next
    onsort?.(next)
  }

  /** Scroll item `i` into view and focus its row once it is rendered. @param {number} i */
  async function reveal(i) {
    const top = topOf(i)
    const bottom = offsets ? topOf(i + 1) : top + rowHeight
    if (top < scrollTop) scrollTop = top
    else if (bottom > scrollTop + height) scrollTop = Math.max(0, bottom - height)
    if (scroller) scroller.scrollTop = scrollTop
    await tick()
    scroller?.querySelector(`[data-item="${i}"]`)?.focus?.()
  }

  /** @param {number} i */
  function ask(i) {
    const id = keyAt(i)
    if (!id) return
    if (id !== selected) onselect?.(id)
    void reveal(i)
  }

  /** Select pinned row `k` and focus it. @param {number} k */
  async function askPinned(k) {
    const id = rowKey(pinned[k])
    if (id !== selected) onselect?.(id)
    await tick()
    grid?.querySelector(`[data-pinned="${k}"]`)?.focus?.()
  }

  /** @type {HTMLDivElement | undefined} */
  let grid = $state()

  /**
   * The pinned row a key moves to, or -1 when it moves in the body. The pinned rows sit above
   * the first row: Home, or Up from the first row, walks into them; Down from the last leaves.
   * @param {string} k @param {number} at The selected body row's place in the walk, or -1.
   */
  function pinnedTarget(k, at) {
    if (pinned.length === 0) return -1
    if (k === 'Home') return 0
    if (pinnedAt >= 0) {
      if (k === 'ArrowUp') return Math.max(0, pinnedAt - 1)
      return k === 'ArrowDown' && pinnedAt < pinned.length - 1 ? pinnedAt + 1 : -1
    }
    return k === 'ArrowUp' && at === 0 ? pinned.length - 1 : -1
  }

  let typed = ''
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let typedTimer

  /** The next row after the selection whose first column starts with `text`, wrapping. @param {string} text */
  function typeAhead(text) {
    const first = columns[0]
    if (!first || rowItems.length === 0) return -1
    const from = Math.max(0, rowItems.indexOf(selectedItem))
    for (let step = 1; step <= rowItems.length; step += 1) {
      const i = rowItems[(from + step) % rowItems.length]
      const item = items[i]
      if (item?.kind === 'row' && String(first.value(item.row) ?? '').toLowerCase().startsWith(text)) return i
    }
    return -1
  }

  /** @param {KeyboardEvent} e */
  function key(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const at = rowItems.indexOf(selectedItem)
    const page = Math.max(1, Math.floor(height / rowHeight) - 1)
    /** @type {number | null} */
    let to = null
    const into = pinnedTarget(e.key, at)
    if (into >= 0) {
      e.preventDefault()
      void askPinned(into)
      return
    }
    if (e.key === 'ArrowDown') to = at < 0 ? 0 : Math.min(rowItems.length - 1, at + 1)
    else if (e.key === 'ArrowUp') to = at < 0 ? 0 : Math.max(0, at - 1)
    else if (e.key === 'PageDown') to = Math.min(rowItems.length - 1, Math.max(0, at) + page)
    else if (e.key === 'PageUp') to = Math.max(0, at - page)
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = rowItems.length - 1
    else if (e.key === 'Enter') {
      if (selected && (selectedItem >= 0 || pinnedAt >= 0)) {
        e.preventDefault()
        onopen?.(selected)
      }
      return
    } else if (e.key.length === 1 && e.key !== ' ') {
      clearTimeout(typedTimer)
      typed += e.key.toLowerCase()
      typedTimer = setTimeout(() => (typed = ''), 700)
      const hit = typeAhead(typed)
      if (hit >= 0) ask(hit)
      return
    }
    if (to === null || rowItems.length === 0) return
    e.preventDefault()
    ask(/** @type {number} */ (rowItems[to]))
  }
</script>

{#snippet failure(/** @type {string} */ message)}
  <div class="table__failed" role="alert" data-ui-id="{uiId}.failed">
    <p>{message}</p>
    {#if onretry}<Button onclick={() => onretry?.()}>Try again</Button>{/if}
  </div>
{/snippet}

{#snippet cells(/** @type {any} */ row)}
  {#each columns as col (col.key)}
    <div class="table__cell" class:table__cell--end={col.align === 'end'} role="gridcell">
      {#if col.cell}{@render col.cell(row)}{:else}{col.value(row) ?? ''}{/if}
      {#if col.subtitle?.(row)}<span class="table__subtitle" data-subtitle>{col.subtitle(row)}</span>{/if}
    </div>
  {/each}
{/snippet}

<div
  class="table"
  class:table--wrap={wrap}
  class:table--measured={variableRows}
  role="grid"
  aria-label={label}
  aria-rowcount={pinned.length + items.length + 1}
  aria-colcount={columns.length}
  data-ui-id={uiId}
  style:--table-cols={tracks}
  style:--table-row={`${rowHeight}px`}
  tabindex={gridTabStop ? 0 : -1}
  bind:this={grid}
  onkeydown={key}>
  {#if pinned.length}
    <div class="table__pinned" role="rowgroup">
      {#each pinned as row, k (rowKey(row))}
        {@const id = rowKey(row)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="table__row table__data"
          class:table__data--selected={selected !== '' && id === selected}
          role="row"
          aria-rowindex={k + 1}
          aria-selected={selected !== '' && id === selected}
          tabindex={pinnedAt === k || (pinnedAt < 0 && tabStop < 0 && k === 0) ? 0 : -1}
          data-pinned={k}
          data-ui-id="{uiId}.row.{id}"
          onclick={() => {
            if (id !== selected) onselect?.(id)
          }}
          ondblclick={() => onopen?.(id)}>
          {@render cells(row)}
        </div>
      {/each}
    </div>
  {/if}
  <div class="table__head" role="rowgroup">
    <div class="table__row" role="row" aria-rowindex={pinned.length + 1}>
      {#each columns as col (col.key)}
        <div class="table__header" class:table__cell--end={col.align === 'end'} role="columnheader" aria-sort={ariaSort(col)} data-ui-id="{uiId}.header.{col.key}">
          {#if col.sortable === false}
            {col.label}
          {:else}
            <button type="button" class="table__sort" tabindex="-1" onclick={() => sortBy(col)}>
              {col.label}{#if order?.key === col.key}<span aria-hidden="true">{order.dir === 1 ? ' ▴' : ' ▾'}</span>{/if}
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div
    class="table__body"
    role="rowgroup"
    data-body
    data-scroller
    bind:this={scroller}
    bind:clientHeight={measured}
    style:height={viewportHeight > 0 ? `${viewportHeight}px` : undefined}
    onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}>
    {#if items.length === 0 && status.kind === 'loading'}
      <p class="table__empty" role="status">{loadingLabel}</p>
    {:else if items.length === 0 && status.kind === 'failed'}
      {@render failure(status.message)}
    {:else if items.length === 0}
      <p class="table__empty">{empty}</p>
    {:else}
      <div class="table__spacer" style:height="{total}px">
        <div class="table__window" style:transform="translateY({topOf(win.start)}px)">
          {#each items.slice(win.start, win.end) as item, j (itemKey(win.start + j))}
            {@const i = win.start + j}
            {#if item.kind === 'group'}
              <div class="table__row table__group" use:measure={itemKey(i)} role="row" aria-rowindex={pinned.length + i + 2} data-ui-id="{uiId}.group.{item.key}">
                <div class="table__cell table__group-cell" role="gridcell" aria-colspan={columns.length}>
                  <span>{item.label}</span> <span class="table__count">{item.count}</span>
                </div>
              </div>
            {:else}
              {@const id = rowKey(item.row)}
              <!-- The grid owns the keyboard (role="grid" with onkeydown and a roving tabindex);
                   a row's click is the pointer's shortcut to the same selection. -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div
                class="table__row table__data"
                use:measure={itemKey(i)}
                class:table__data--selected={selected !== '' && id === selected}
                role="row"
                aria-rowindex={pinned.length + i + 2}
                aria-selected={selected !== '' && id === selected}
                tabindex={i === tabStop ? 0 : -1}
                data-item={i}
                data-ui-id="{uiId}.row.{id}"
                onclick={() => {
                  if (id !== selected) onselect?.(id)
                }}
                ondblclick={() => onopen?.(id)}>
                {@render cells(item.row)}
              </div>
            {/if}
          {/each}
        </div>
      </div>
      <!-- A re-read that failed keeps the rows it has, and says so under them: after the spacer,
           so no row's offset moves, and stuck to the bottom of the view. -->
      {#if status.kind === 'failed'}{@render failure(status.message)}{/if}
    {/if}
  </div>
</div>

<style>
  .table {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    flex: 1;
    font-size: var(--data-md-size);
    color: var(--text-primary);
    outline: none;
  }
  .table__pinned {
    flex: none;
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .table__head {
    flex: none;
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .table__body {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .table__spacer {
    position: relative;
  }
  .table__window {
    position: absolute;
    inset: 0 0 auto 0;
  }
  .table__row {
    display: grid;
    grid-template-columns: var(--table-cols);
    height: var(--table-row);
    align-items: center;
  }
  .table__header,
  .table__cell {
    padding: 0 var(--spacing-xs);
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Wrapped rows grow to fit their text; a single line still sits on the 24px row. A
     table with subtitles grows only the rows that have one, and its cells do not wrap. */
  .table--measured .table__row {
    height: auto;
    min-height: var(--table-row);
  }
  .table--measured .table__cell {
    padding-block: calc((var(--table-row) - 1lh) / 2);
  }
  .table__subtitle {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .table--wrap .table__row {
    height: auto;
    min-height: var(--table-row);
    align-items: start;
  }
  .table--wrap .table__cell {
    white-space: normal;
    overflow-wrap: anywhere;
    padding-block: calc((var(--table-row) - 1lh) / 2);
  }
  .table__cell--end {
    text-align: end;
    /* D57's tabular numeral token has not landed (harvest gap 7). */
    font-variant-numeric: tabular-nums;
  }
  .table__header {
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .table__sort {
    all: unset;
    cursor: default;
  }
  .table__data {
    cursor: default;
    outline: none;
  }
  /* Neutral selection on an existing surface while harvest gap 12 is open. */
  .table__data--selected {
    background: var(--surface-raised);
  }
  .table__data:focus-visible {
    box-shadow: inset 0 0 0 var(--size-stroke-focus) var(--border-focus);
  }
  .table__group {
    grid-template-columns: 1fr;
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-weight: 600;
  }
  .table__count {
    margin-left: var(--spacing-xs);
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  .table__failed {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--surface-base);
    border-top: var(--size-stroke-hairline) solid var(--border-default);
    color: var(--text-primary);
  }
  .table__failed p {
    margin: 0;
    flex: 1;
    min-width: 0;
  }
  .table__empty {
    margin: 0;
    padding: var(--spacing-sm);
    color: var(--text-secondary);
  }
</style>
