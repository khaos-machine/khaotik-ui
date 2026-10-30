<script>
  // The first adopted component. Ark UI's Menu, dressed in BrandKit tokens —
  // adopted, not authored (D39, D50, P3). Nothing here re-implements menu
  // behaviour: open/close, focus trap and restore, Escape, outside-click,
  // arrow-key roving, typeahead and the full ARIA menu pattern all come from
  // the primitive.
  //
  // Single-select across one or more radio groups, controlled: exactly one item
  // is checked, the checkmark is the indicator, and it moves only when the
  // caller updates `value` (#223, C2).
  import {
    MenuContent,
    MenuItemGroupLabel,
    MenuItemIndicator,
    MenuItemText,
    MenuPositioner,
    MenuRadioItem,
    MenuRadioItemGroup,
    MenuRoot,
    MenuTrigger,
  } from '@ark-ui/svelte/menu'
  import Icon from './Icon.svelte'
  import ProviderMark from './ProviderMark.svelte'

  /**
   * @typedef {Object} MenuItem
   * @property {string} value Matched against `value`. **Unique across the whole list, groups included** — Menu throws naming the duplicate; compose `provider/id` when groups share an id. `""` is legitimate and never truth-tested.
   * @property {string} label Visible text; also what typeahead matches.
   * @property {string} [group] Heading the item sits under; groups render in first-appearance order. Absent: the unlabelled group.
   * @property {string} [groupMark] Provider id for a `ProviderMark` beside the heading, read from the group's first item. The heading text carries the name; the mark is `aria-hidden` (ProviderMark.svelte:23-24).
   * @property {boolean} [unavailable] Shown, reachable by arrow keys and typeahead, announced — never selected: choosing it keeps the menu open and calls nothing.
   * @property {string} [reason] Why it is unavailable; rendered under the label and announced via `aria-describedby`. Ignored unless `unavailable`.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [label] Names what is being chosen ("Workspace"); prefixes the trigger `aria-label`, so the trigger announces both the control and its current value.
   * @property {string} [value] Selected item `value`; may match no item (see `currentLabel`). Controlled: choosing calls `onselect` and moves nothing until the caller updates `value`.
   * @property {readonly MenuItem[]} [items] See MenuItem.
   * @property {string} [currentLabel] What the trigger shows when `value` matches no item (a stored value nothing serves). A matching item's `label` wins.
   * @property {boolean} [disabled] The whole control, e.g. while a save is in flight: the trigger stays focusable and is announced disabled, cannot open, and no selection is accepted.
   * @property {(value: string) => void} [onselect] Called with the new `value` when an item is chosen.
   */

  /** @type {Props} */
  let {
    label = '',
    value = '',
    items = [],
    currentLabel = '',
    disabled = false,
    onselect = undefined,
  } = $props()

  const uid = $props.id()

  // THE INTERNAL KEY (M1, M-C). zag ids an item by its value and its
  // `getItemEl` returns null for a falsy one (@zag-js/menu menu.dom.mjs:31), so
  // a literal `""` value would be unreachable. The `v_` prefix makes every key
  // truthy; encodeURIComponent keeps it a space-free IDREF. Keys map back to
  // items through `byKey`, never by decoding.
  const keyFor = (/** @type {string} */ v) => `v_${encodeURIComponent(v)}`

  // M2: values are unique across the whole list. Thrown here, naming the value,
  // rather than left to Svelte's each_key_duplicate — the {#each} key is the
  // encoded key, and a duplicate would otherwise surface as a duplicate id.
  const byKey = $derived.by(() => {
    const map = new Map()
    for (const item of items) {
      const key = keyFor(item.value)
      if (map.has(key)) {
        throw new Error(`Menu: duplicate item value "${item.value}" — values must be unique across the whole list, groups included`)
      }
      map.set(key, item)
    }
    return map
  })

  // Groups in first-appearance order; the unlabelled group is ''.
  const groups = $derived.by(() => {
    const out = new Map()
    for (const [key, item] of byKey) {
      const name = item.group ?? ''
      if (!out.has(name)) out.set(name, { name, mark: item.groupMark ?? '', entries: [] })
      out.get(name).entries.push({ item, key })
    }
    return [...out.values()]
  })

  // `''` matches no key, since every real key starts with `v_`.
  const keyOf = (/** @type {string} */ v) => (byKey.has(keyFor(v)) ? keyFor(v) : '')

  // The binding's setter (C2). Ark's radio group writes through it; nothing is
  // stored, so the check stays where `value` puts it. An unknown key, an
  // unavailable item, and any choice while disabled are discarded.
  function choose(/** @type {string} */ k) {
    const item = byKey.get(k)
    if (!item || item.unavailable || disabled) return
    onselect?.(item.value)
  }

  // M3. Tab passes so the trigger can be left; every other key is stopped
  // before zag sees it. This handler runs first: Ark merges props with
  // node_modules/@zag-js/svelte/dist/merge-props.js, which delegates handlers to
  // @zag-js/core `mergeProps` — callAll(local, zag) — and zag's own keydown
  // returns on `defaultPrevented` (menu.connect.mjs:249).
  function blockKeys(/** @type {KeyboardEvent} */ e) {
    if (e.key !== 'Tab') e.preventDefault()
  }

  const current = $derived(items.find((i) => i.value === value))
  const shown = $derived(current ? current.label : currentLabel)
  const reason = $derived(current?.unavailable ? (current.reason ?? '') : '')
  // G2: keyed on `current?.unavailable`, not on the reason — an unavailable
  // current value says so whether or not a reason was captured.
  const triggerName = $derived(
    current?.unavailable
      ? reason
        ? `${label}: ${shown}, unavailable: ${reason}`
        : `${label}: ${shown}, unavailable`
      : `${label}: ${shown}`,
  )
</script>

<MenuRoot positioning={{ placement: 'bottom-start', gutter: 4 }}>
  <!-- Classes on an Ark component are forwarded to the rendered element, so
       Svelte scopes them as unused — they are styled :global below
       (catalog/AGENTS.md, "Svelte 5 gotchas"). -->
  <MenuTrigger
    class="ui-menu__trigger"
    aria-label={triggerName}
    aria-disabled={disabled ? 'true' : undefined}
    data-disabled={disabled ? '' : undefined}
    onkeydown={disabled ? blockKeys : undefined}
  >
    <span class="ui-menu__value">{shown}</span>
    {#if current?.unavailable}
      <span class="ui-menu__warn"><Icon name="warning-circle" weight="fill" /></span>
    {/if}
    <Icon name="caret-down" />
  </MenuTrigger>
  <MenuPositioner>
    <MenuContent class="ui-menu__content">
      {#each groups as group (group.name)}
        <!-- An unlabelled group passes `aria-labelledby={null}`: zag always
             points a group at a label id (menu.connect.mjs:454), and the
             mergeProps in node_modules/@zag-js/svelte/dist/merge-props.js
             (via @zag-js/core) keeps zag's value over a local `undefined` but
             not over `null` — and Svelte omits a `null` attribute. -->
        <MenuRadioItemGroup
          class="ui-menu__group"
          aria-labelledby={group.name ? undefined : null}
          bind:value={() => keyOf(value), (k) => choose(k)}
        >
          {#if group.name}
            <MenuItemGroupLabel class="ui-menu__group-label eyebrow">
              {#if group.mark}<ProviderMark providerId={group.mark} />{/if}
              {group.name}
            </MenuItemGroupLabel>
          {/if}
          {#each group.entries as { item, key } (key)}
            {@const reasonId = item.unavailable && item.reason ? `${uid}-${key}` : undefined}
            <!-- C1: an unavailable item gets no zag `disabled`, so it stays
                 navigable and its reason is heard; the setter discards it. -->
            <MenuRadioItem
              value={key}
              valueText={item.label}
              class="ui-menu__item"
              closeOnSelect={item.unavailable ? false : undefined}
              aria-disabled={item.unavailable ? 'true' : undefined}
              data-unavailable={item.unavailable ? '' : undefined}
              aria-describedby={reasonId}
            >
              <span class="ui-menu__check">
                {#if item.unavailable}
                  <span class="ui-menu__warn"><Icon name="warning-circle" weight="fill" /></span>
                {:else}
                  <MenuItemIndicator><Icon name="check" /></MenuItemIndicator>
                {/if}
              </span>
              <span class="ui-menu__text">
                <MenuItemText>{item.label}</MenuItemText>
                {#if reasonId}
                  <span id={reasonId} class="ui-menu__reason" aria-hidden="true">{item.reason}</span>
                {/if}
              </span>
            </MenuRadioItem>
          {/each}
        </MenuRadioItemGroup>
      {/each}
    </MenuContent>
  </MenuPositioner>
</MenuRoot>

<style>
  :global(.ui-menu__trigger) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xs);
    width: 100%;
    padding: 6px 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font: inherit;
    font-size: var(--body-md-size);
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    transition: border-color 150ms ease;
  }

  :global(.ui-menu__trigger:not([data-disabled]):hover) {
    border-color: var(--border-focus);
  }

  /* M3: the whole control disabled — still focusable, announced disabled */
  :global(.ui-menu__trigger[data-disabled]) {
    opacity: 0.4;
    cursor: default;
  }

  :global(.ui-menu__value) {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: start;
  }

  :global(.ui-menu__trigger:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }

  /* the caret turns over when the menu is open — the primitive stamps the state */
  :global(.ui-menu__trigger .ph) {
    color: var(--text-tertiary);
    transition: transform 150ms ease;
  }

  :global(.ui-menu__trigger[data-state='open'] .ph) {
    transform: rotate(180deg);
  }

  :global(.ui-menu__content) {
    min-width: 200px;
    padding: var(--spacing-2xs);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.35);
    z-index: 40;
    /* G1 (#223, Q7). zag sets --available-height on the positioner at runtime
       (@zag-js/popper get-placement.mjs), so a long list scrolls inside the
       room the window actually has. 50vh is the bound when zag has not set it.
       Not `none`: it bounds nothing (SetupProgress.svelte:428-430), and every
       item past the window edge becomes unreachable. */
    max-height: var(--available-height, 50vh);
    overflow-y: auto;
    /* border-box so the padding and border sit inside that cap rather than
       outside it (step 17d measured 409px against a 399px cap). */
    box-sizing: border-box;
  }

  :global(.ui-menu__item) {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    font-size: var(--body-md-size);
    color: var(--text-secondary);
    cursor: pointer;
  }

  /* highlight follows the primitive's roving focus, so it tracks the keyboard
     as well as the pointer */
  :global(.ui-menu__item[data-highlighted]) {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    color: var(--text-primary);
  }

  :global(.ui-menu__item[data-state='checked']) {
    color: var(--text-primary);
    font-weight: 600;
  }

  :global(.ui-menu__check) {
    display: inline-flex;
    justify-content: center;
    width: 1rem;
    color: var(--text-brand);
  }

  /* C1. After the highlighted and checked rules so it wins on equal
     specificity: an unavailable item stays --text-secondary even when
     highlighted, which is what keeps its highlight distinct from an enabled
     item's. The state is carried by the icon, the reason and aria-disabled —
     never by colour alone. */
  :global(.ui-menu__item[data-unavailable]) {
    color: var(--text-secondary);
    cursor: default;
  }

  /* The warning icon shares `.ph` with the caret; this rule comes after the
     caret's two and matches their specificity, so the warning is neither greyed
     nor turned over when the menu opens. */
  :global(.ui-menu__warn),
  :global(.ui-menu__trigger .ui-menu__warn .ph) {
    display: inline-flex;
    color: var(--tone-warning);
    transform: none;
  }

  :global(.ui-menu__text) {
    min-width: 0;
  }

  :global(.ui-menu__reason) {
    display: block;
    margin-top: 2px;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  :global(.ui-menu__group + .ui-menu__group) {
    border-top: 1px solid var(--border-hairline);
  }

  :global(.ui-menu__group-label) {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 6px 10px;
  }
</style>
