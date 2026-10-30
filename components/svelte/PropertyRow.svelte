<script>
  // PropertyRow — the inspector's label-value row (data-layer plan K6; audit §3.12).
  //
  // One line, never wrapping: the value truncates with an ellipsis, and its full text
  // stays in the DOM, as the tooltip, and as the row's accessible description, so
  // truncation hides nothing from a reader. An optional source column says where the
  // value came from (parsed, cast, the engine). A control (a ScrubNumber, a picker
  // trigger) can take the value's place through `children`.
  /**
   * @typedef {Object} Props
   * @property {string} [label] The property's name; the row's accessible name.
   * @property {string | number | null} [value] The value as text. Ignored when `children` is given.
   * @property {string} [source] Where the value came from, in a third column. Absent when not given.
   * @property {import('svelte').Snippet} [children] A control drawn in place of the value.
   * @property {string} [uiId] The row's `data-ui-id` (audit §3.14).
   */

  /** @type {Props} */
  let { label = '', value = null, source = undefined, children = undefined, uiId = undefined } = $props()

  const id = $props.id()
  const text = $derived(value === null || value === undefined ? '' : String(value))
</script>

<div class="prop" role="group" aria-labelledby="{id}-label" aria-describedby={children ? undefined : `${id}-value`} data-ui-id={uiId}>
  <span class="prop__label" id="{id}-label">{label}</span>
  {#if children}
    <span class="prop__control">{@render children()}</span>
  {:else}
    <span class="prop__value" id="{id}-value" title={text}>{text}</span>
  {/if}
  {#if source}<span class="prop__source">{source}</span>{/if}
</div>

<style>
  .prop {
    display: grid;
    grid-template-columns: minmax(80px, 40%) minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--spacing-xs);
    /* 24px: harvest gap 9 (`size.row`), a literal until Andrew decides it. */
    min-height: 24px;
    font-size: var(--data-md-size);
  }
  .prop__label {
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .prop__value {
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  .prop__control {
    display: flex;
    min-width: 0;
  }
  .prop__source {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    white-space: nowrap;
  }
</style>
