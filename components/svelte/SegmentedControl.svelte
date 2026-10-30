<script>
  // Adopted, not authored (D39, D50, P3) — Ark UI's Segment Group, dressed in
  // BrandKit tokens. Nothing here re-implements the behaviour: radio semantics
  // (exactly one selected), arrow-key roving, Home/End, the hidden inputs and
  // the moving indicator all come from the primitive.
  //
  // Segment Group rather than Tabs: a segmented control selects a value, it does
  // not reveal a panel. Ark's TabTrigger emits `aria-controls` at a TabContent,
  // and for an axis whose "panel" is the whole window that reference would
  // dangle.
  import {
    SegmentGroupIndicator,
    SegmentGroupItem,
    SegmentGroupItemControl,
    SegmentGroupItemHiddenInput,
    SegmentGroupItemText,
    SegmentGroupRoot,
  } from '@ark-ui/svelte/segment-group'

  /**
   * @typedef {Object} Segment
   * @property {string} value The value reported to `onselect`, and matched against `value`.
   * @property {string} label The visible segment text.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [label] Names the axis being chosen; becomes the group `aria-label`.
   * @property {string} [value] Selected item `value`.
   * @property {readonly Segment[]} [items] Segment array: `{ value, label }`. **Values must be distinct** — this list is keyed on `value`, so a duplicate throws `each_key_duplicate` and the control does not render. The same rule a `<select>` has always had.
   * @property {(value: string) => void} [onselect] Called with the new `value` when a segment is chosen.
   */

  /** @type {Props} */
  let {
    // names the axis being chosen ("Workspace"), so the group announces what the
    // selection means and not just its members
    label = '',
    value = '',
    items = [],
    onselect = undefined,
  } = $props()
</script>

<!-- Classes on an Ark component are forwarded to the rendered element, so
     Svelte scopes them as unused — they are styled :global below
     (catalog/AGENTS.md, "Svelte 5 gotchas"). -->
<SegmentGroupRoot
  {value}
  onValueChange={(details) => onselect?.(details.value)}
  orientation="horizontal"
  aria-label={label}
  class="ui-segmented"
>
  <SegmentGroupIndicator class="ui-segmented__indicator" />
  {#each items as item (item.value)}
    <SegmentGroupItem value={item.value} class="ui-segmented__item">
      <SegmentGroupItemText>{item.label}</SegmentGroupItemText>
      <SegmentGroupItemControl />
      <SegmentGroupItemHiddenInput />
    </SegmentGroupItem>
  {/each}
</SegmentGroupRoot>

<style>
  :global(.ui-segmented) {
    position: relative;
    display: inline-flex;
    padding: 2px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
  }

  /* The primitive measures the selected item and hands its geometry over as --left and
     --width; it sets `left` itself but not the width, so without `width` here the
     indicator is 0px wide and the selection shows only as bold text. The fill is a tint
     of the text colour, so it reads in light and dark alike — --surface-raised is within
     a shade of the dark ground and vanished there. */
  :global(.ui-segmented__indicator) {
    position: absolute;
    top: 2px;
    left: var(--left, 0);
    width: var(--width, 0);
    height: calc(100% - 4px);
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--text-primary) 12%, transparent);
    transition: left 180ms ease, width 180ms ease;
  }

  /* The primitive's hidden radio is clipped to 1px, but WebKit still paints a native
     radio into that pixel — a dot under every label. Never painted; still focusable. */
  :global(.ui-segmented__item input) {
    appearance: none;
    opacity: 0;
  }

  :global(.ui-segmented__item) {
    position: relative;
    z-index: 1;
    padding: 4px 12px;
    border-radius: var(--radius-sm);
    font-size: var(--caption-size);
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
    transition: color 150ms ease;
  }

  :global(.ui-segmented__item:hover) {
    color: var(--text-secondary);
  }

  :global(.ui-segmented__item[data-state='checked']) {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* focus lands on the item's hidden input; show it on the visible segment */
  :global(.ui-segmented__item:has(:focus-visible)) {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }
</style>
