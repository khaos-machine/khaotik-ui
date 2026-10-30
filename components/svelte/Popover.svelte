<script>
  // Popover — an anchored, searchable picker (data-layer plan K13; audit §3.1 principle 8,
  // §3.7, §3.15, §4.1). The inspector's Voice pop-up: a trigger showing the current value,
  // and a floating panel with a search field and a list, the suggested item first
  // (lib/picker.js). The panel is fixed-position under its trigger, so nothing in the
  // document flow moves when it opens.
  //
  // Esc, a pick or a click outside closes it, and the focus returns to the trigger.
  // Picking ASKS the host through `onpick`; the trigger shows whatever `value` the host
  // passes back.
  import { tick } from 'svelte'
  import { pickerOrder } from './lib/picker.js'

  /** @typedef {import('./lib/picker.js').PickerItem} PickerItem */

  /**
   * @typedef {Object} Props
   * @property {string} [label] What is being picked ("Voice"); names the trigger, the panel and the search.
   * @property {string} [value] The trigger's text: the current choice, in the host's words.
   * @property {readonly PickerItem[]} [items] What can be picked, in order; the suggested item is moved first.
   * @property {string} [suggested] The id listed first and marked as suggested.
   * @property {(id: string) => void} [onpick] Asked with the picked item's id.
   * @property {string} [disabledReason] Present when picking is unavailable; the trigger carries it.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { label = 'Pick', value = '', items = [], suggested = '', onpick = undefined, disabledReason = '', uiId = 'popover' } = $props()

  const id = $props.id()
  // The panel's width and tallest height; the window keeps EDGE px clear around it.
  const PANEL_WIDTH = 280
  const PANEL_MAX_HEIGHT = 320
  const EDGE = 8

  let open = $state(false)
  let query = $state('')
  let active = $state(0)
  /** @type {HTMLButtonElement | undefined} */
  let trigger = $state()
  /** @type {HTMLInputElement | undefined} */
  let search = $state()
  /** @type {{ top: number, left: number, maxHeight: number }} */
  let at = $state({ top: 0, left: 0, maxHeight: PANEL_MAX_HEIGHT })

  const shown = $derived(pickerOrder(items, suggested, query))

  /**
   * Under the trigger, held inside the window: a trigger at the window's right edge (the
   * inspector's) opens its panel leftward instead of off-screen, and a panel near the bottom
   * gets shorter rather than running past it.
   * @param {DOMRect | undefined} rect @param {number} width @param {number} height
   */
  function placePanel(rect, width, height) {
    const top = (rect?.bottom ?? 0) + 4
    const left = Math.max(EDGE, Math.min(rect?.left ?? 0, (width || Infinity) - PANEL_WIDTH - EDGE))
    const maxHeight = height ? Math.max(120, Math.min(PANEL_MAX_HEIGHT, height - top - EDGE)) : PANEL_MAX_HEIGHT
    return { top, left, maxHeight }
  }

  async function show() {
    if (disabledReason) return
    const rect = trigger?.getBoundingClientRect()
    at = placePanel(rect, globalThis.innerWidth ?? 0, globalThis.innerHeight ?? 0)
    query = ''
    active = 0
    open = true
    await tick()
    search?.focus()
  }

  function close() {
    open = false
    trigger?.focus()
  }

  /** @param {PickerItem | undefined} item */
  function pick(item) {
    if (!item) return
    onpick?.(item.id)
    close()
  }

  /** @param {KeyboardEvent} e */
  function key(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      active = Math.min(shown.length - 1, active + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      active = Math.max(0, active - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(shown[active])
    } else if (e.key === 'Tab') {
      // The panel traps focus: the search is its one tab stop.
      e.preventDefault()
    }
  }

  /** @param {PointerEvent} e */
  function outside(e) {
    if (!open) return
    const target = /** @type {Node} */ (e.target)
    if (trigger?.contains(target) || document.getElementById(`${id}-panel`)?.contains(target)) return
    open = false
  }
</script>

<svelte:document onpointerdown={outside} />

<button
  bind:this={trigger}
  type="button"
  class="pop__trigger"
  aria-haspopup="dialog"
  aria-expanded={open}
  aria-label="{label}: {value}"
  aria-disabled={disabledReason ? 'true' : undefined}
  title={disabledReason || undefined}
  data-ui-id="{uiId}.trigger"
  onclick={() => (open ? close() : show())}>
  <span class="pop__value">{value}</span><span class="pop__chevron" aria-hidden="true">▾</span>
</button>

{#if open}
  <div
    class="pop__panel"
    id="{id}-panel"
    role="dialog"
    aria-label={label}
    style:position="fixed"
    style:top="{at.top}px"
    style:left="{at.left}px"
    style:max-height="{at.maxHeight}px"
    data-ui-id="{uiId}.panel">
    <input
      bind:this={search}
      class="pop__search"
      type="search"
      aria-label="Search {label.toLowerCase()}"
      aria-controls="{id}-list"
      aria-activedescendant={shown[active] ? `${id}-opt-${active}` : undefined}
      placeholder="Search"
      value={query}
      oninput={(e) => {
        query = e.currentTarget.value
        active = 0
      }}
      onkeydown={key} />
    <ul class="pop__list" role="listbox" id="{id}-list" aria-label={label}>
      {#each shown as item, i (item.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -- the search field handles the keys for every option -->
        <li
          class="pop__option"
          class:pop__option--active={i === active}
          role="option"
          id="{id}-opt-{i}"
          aria-selected={i === active}
          data-ui-id="{uiId}.option.{item.id}"
          onclick={() => pick(item)}>
          <span class="pop__label">{item.label}</span>
          {#if item.id === suggested}<span class="pop__tag">Suggested</span>{/if}
          {#if item.detail}<span class="pop__detail">{item.detail}</span>{/if}
        </li>
      {/each}
    </ul>
    {#if shown.length === 0}<p class="pop__empty">Nothing matches.</p>{/if}
  </div>
{/if}

<style>
  .pop__trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    max-width: 100%;
    padding: 0 var(--spacing-xs);
    height: 20px;
    background: var(--surface-raised);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--data-md-size);
    cursor: default;
  }
  .pop__trigger[aria-disabled='true'] {
    color: var(--text-secondary);
  }
  .pop__trigger:focus-visible,
  .pop__search:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
  .pop__value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pop__chevron {
    color: var(--text-secondary);
  }
  .pop__panel {
    z-index: 20;
    display: flex;
    flex-direction: column;
    width: 280px;
    background: var(--surface-raised);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: var(--data-md-size);
    overflow: hidden;
  }
  .pop__search {
    margin: var(--spacing-xs);
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    color: inherit;
    font: inherit;
  }
  .pop__list {
    list-style: none;
    margin: 0;
    padding: 0 0 var(--spacing-2xs);
    overflow: auto;
  }
  .pop__option {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    /* 24px: harvest gap 9 (`size.row`), a literal until Andrew decides it. */
    min-height: 24px;
    padding: 0 var(--spacing-sm);
    cursor: default;
  }
  .pop__option--active {
    background: var(--surface-base);
  }
  .pop__tag,
  .pop__detail {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .pop__detail {
    grid-column: 1 / -1;
  }
  .pop__empty {
    margin: 0;
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--text-secondary);
  }
</style>
