<script>
  // SourceList — the window's sidebar (data-layer plan K2; audit §4.1, harvest `:35-39`).
  //
  // Sections of destinations, each row an icon, a label and an optional count. The host
  // owns which row is active: a click or an arrow key ASKS for a row through `onselect`,
  // and the host passes the new `active` back. Selection is neutral; the thin gold bar on
  // the active row is the only gold here (audit §3.1 principle 11).
  //
  // One tab stop: the active row. ↑ ↓ Home End move through every row in order, across
  // section boundaries.
  //
  // ponytail: no nested children and no badges beyond the count; add when a destination
  // needs them.
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} SourceItem
   * @property {string} id
   * @property {string} label
   * @property {string} [icon] Phosphor icon name.
   * @property {number | null} [count] Rendered exactly as given, zero included. Absent when not given.
   */

  /**
   * @typedef {Object} SourceSection
   * @property {string} id
   * @property {string} label
   * @property {SourceItem[]} items
   */

  /**
   * @typedef {Object} Props
   * @property {SourceSection[]} [sections] The destinations, in sections, in order. ↑ ↓ walk them across section boundaries.
   * @property {string} [active] The active row's id.
   * @property {(id: string) => void} [onselect] Asked with a row's id on click and on ↑ ↓ Home End.
   * @property {string} [label] The navigation landmark's name.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { sections = [], active = '', onselect = undefined, label = 'Sources', uiId = 'source' } = $props()

  const order = $derived(sections.flatMap((s) => s.items.map((i) => i.id)))

  /** @type {Record<string, HTMLButtonElement>} */
  const buttons = {}

  /** @param {KeyboardEvent} e @param {string} id */
  function key(e, id) {
    const at = order.indexOf(id)
    const to =
      e.key === 'ArrowDown' ? at + 1 : e.key === 'ArrowUp' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? order.length - 1 : null
    if (to === null) return
    e.preventDefault()
    const next = order[to]
    if (next === undefined || next === id) return
    onselect?.(next)
    buttons[next]?.focus()
  }
</script>

<nav class="source" aria-label={label} data-ui-id={uiId}>
  {#each sections as section (section.id)}
    <h3 class="source__heading">{section.label}</h3>
    <ul class="source__list">
      {#each section.items as item (item.id)}
        <li>
          <button
            bind:this={buttons[item.id]}
            type="button"
            class="source__row"
            class:source__row--active={item.id === active}
            aria-current={item.id === active ? 'page' : undefined}
            tabindex={item.id === active || (!order.includes(active) && item.id === order[0]) ? 0 : -1}
            data-ui-id="{uiId}.{item.id}"
            onclick={() => onselect?.(item.id)}
            onkeydown={(e) => key(e, item.id)}>
            {#if item.icon}<span class="source__icon"><Icon name={item.icon} /></span>{/if}
            <span class="source__label">{item.label}</span>
            {#if typeof item.count === 'number'}<span class="source__count">{item.count}</span>{/if}
          </button>
        </li>
      {/each}
    </ul>
  {/each}
</nav>

<style>
  .source {
    height: 100%;
    overflow: auto;
    padding: var(--spacing-xs) 0;
    font-size: var(--data-md-size);
  }
  .source__heading {
    margin: var(--spacing-xs) var(--spacing-sm) var(--spacing-2xs);
    font-size: var(--caption-size);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .source__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .source__row {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
    /* 24px: harvest gap 9 (`size.row`), a literal until Andrew decides it. */
    height: 24px;
    padding: 0 var(--spacing-sm);
    border-left: var(--size-stroke-focus) solid transparent;
    color: var(--text-primary);
    cursor: default;
  }
  .source__row:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: calc(-1 * var(--size-stroke-focus));
  }
  /* Neutral selection on an existing surface (harvest gap 12 is open); the bar is the gold. */
  .source__row--active {
    background: var(--surface-raised);
    border-left-color: var(--text-brand);
  }
  .source__icon {
    display: inline-flex;
    color: var(--text-secondary);
  }
  .source__label {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .source__count {
    color: var(--text-secondary);
    /* D57's tabular numeral token has not landed (harvest gap 7). */
    font-variant-numeric: tabular-nums;
  }
</style>
