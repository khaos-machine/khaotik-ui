<script>
  // FilterField — the bottom-of-sidebar filter box (#7).
  //
  // Authored rather than adopted: Ark's Field orchestrates a label, helper text
  // and an error message around an input, and a filter box has none of those —
  // its label is visually implicit and its only feedback is the result count.
  // Adopting it would mean styling four parts away to keep one. The behaviour
  // that *is* here (clear, Escape) is two lines, not a primitive's worth (D39).
  //
  // The count is the point: khaos.machine.x's Resource Library pairs the field
  // with "22 of 201" so a filter that hides everything reads as a filter and not
  // as an empty project. Consumers that pass no `total` get no count.
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [value] The current filter text. Controlled — the consumer owns it.
   * @property {string} [label] Accessible name. The visible label is implicit, so this is what a screen reader announces — name the list being filtered ("Filter scenes"), not the control.
   * @property {string} [placeholder] Placeholder text.
   * @property {number|null} [shown] Rows surviving the filter. With `total`, renders the count; alone, renders nothing.
   * @property {number|null} [total] Rows before filtering. Omit both to hide the count.
   * @property {(value: string) => void} [oninput] Called with the new string. Also called with `""` by the clear button and by Escape.
   */

  /** @type {Props} */
  let {
    value = '',
    // Named because the label is visually hidden — a filter box that announces
    // only "search" tells a screen-reader user nothing about which list it
    // filters, and both of ours sit next to a second list.
    label = 'Filter',
    placeholder = 'Filter…',
    // How many rows survive the filter, and how many exist. Both required for a
    // count; `shown` alone cannot say what it is out of.
    shown = null,
    total = null,
    oninput = undefined,
  } = $props()

  const filtered = $derived(value.trim() !== '')

  // Unfiltered, "201 of 201" is noise — the plain total is what the reader wants.
  const count = $derived(
    shown === null || total === null ? '' : filtered ? `${shown} of ${total}` : `${total}`,
  )

  function clear() {
    oninput?.('')
  }
</script>

<div class="filter">
  <Icon name="magnifying-glass" />
  <input
    class="filter__input"
    type="search"
    aria-label={label}
    {placeholder}
    {value}
    oninput={(e) => oninput?.(e.currentTarget.value)}
    onkeydown={(e) => { if (e.key === 'Escape' && filtered) { e.preventDefault(); clear() } }}
  />

  {#if filtered}
    <!-- WebKit draws its own clear affordance for type=search and Gecko does
         not, so the native one is suppressed below and this is drawn on every
         platform. A control that exists on one of the three is worse than none. -->
    <button class="filter__clear" type="button" aria-label="Clear {label.toLowerCase()}" onclick={clear}>
      <Icon name="x" />
    </button>
  {/if}

  {#if count}
    <span class="filter__count">{count}</span>
  {/if}
</div>

<style>
  .filter {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-secondary);
  }

  .filter:focus-within {
    outline: 2px solid var(--border-focus);
    outline-offset: -1px;
  }

  .filter__input {
    flex: 1 1 auto;
    /* without this a long placeholder forces the row wider than its sidebar */
    min-width: 0;
    border: 0;
    background: transparent;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .filter__input:focus {
    outline: none;
  }

  /* the button above replaces it — see the comment there */
  .filter__input::-webkit-search-cancel-button {
    appearance: none;
  }

  .filter__clear {
    display: inline-flex;
    padding: 0;
    border: 0;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .filter__clear:hover {
    color: var(--text-primary);
  }

  .filter__count {
    font-size: var(--caption-size);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
</style>
