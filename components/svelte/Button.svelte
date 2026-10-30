<script>
  // The kit's button (#237), as specified in khaos-app's review-surface design §8.
  // Authored, not adopted: Ark UI has no button primitive, because a native
  // <button> already is one.
  //
  // `disabled` is aria-disabled, never the native attribute. A natively disabled
  // button leaves the Tab order, and the review surface's Bind must stay reachable
  // so a keyboard user hears, through `describedby`, why it is not available yet.
  // Every activation — click, Enter, Space — arrives as a click, so the one guard
  // in `activate` covers all three, and it also stops a disabled submit button
  // from posting its form.
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} Props
   * @property {'primary'|'secondary'|'text'|'tool'} [variant] `primary` is the one amber action on a screen; `secondary` is every other action; `text` is the inline link look, for an action inside a sentence or a banner.
   * @property {string} [title] Tooltip for compact tools and unavailable-action explanations.
   * @property {boolean} [disabled] Renders `aria-disabled="true"`, stays focusable, and never calls `onclick`.
   * @property {string} [icon] Leading Phosphor glyph name (kebab-case), `aria-hidden`.
   * @property {'button'|'submit'} [type] The native button type.
   * @property {string} [describedby] Passed through as `aria-describedby` — the id of the line that explains this action, or why it is unavailable.
   * @property {(event: MouseEvent) => void} [onclick] Called on activation, unless disabled.
   * @property {import('svelte').Snippet} [children] The label, and the accessible name. Always pass one: optional only in type, like every prop in the kit (props-optionality.test.js).
   */

  /** @type {Props} */
  let {
    variant = 'secondary',
    disabled = false,
    icon = '',
    title = undefined,
    type = 'button',
    describedby = undefined,
    onclick = undefined,
    children = undefined,
  } = $props()

  /** @param {MouseEvent} event */
  function activate(event) {
    if (disabled) {
      event.preventDefault()
      return
    }
    onclick?.(event)
  }
</script>

<button
  {type}
  {title}
  class="ui-button"
  data-variant={variant}
  aria-disabled={disabled ? 'true' : undefined}
  aria-describedby={describedby}
  onclick={activate}
>
  {#if icon}<Icon name={icon} />{/if}
  {@render children?.()}
</button>

<style>
  .ui-button {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: var(--spacing-2xs) var(--spacing-sm);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    white-space: nowrap;
    cursor: pointer;
  }

  .ui-button[data-variant='tool'] {
    height:28px; min-width:28px; justify-content:center; flex-shrink:0;
    padding:var(--spacing-2xs) var(--spacing-xs);
    border-color:transparent; border-radius:var(--radius-sm);
    font-size:var(--caption-size); line-height:1; text-decoration:none;
  }
  .ui-button[data-variant='tool'] :global(.ph) { font-size:16px; }
  .ui-button[data-variant='tool']:hover:not([aria-disabled='true']) {
    background:color-mix(in oklab,var(--text-primary) 8%,transparent); border-color:var(--border-default);
  }
  .ui-button[data-variant='tool']:active:not([aria-disabled='true']) {
    background:color-mix(in oklab,var(--text-primary) 14%,transparent);
  }

  .ui-button:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-button[data-variant='secondary']:hover:not([aria-disabled='true']) {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }

  .ui-button[data-variant='primary'] {
    background: var(--action-primary);
    color: var(--action-on-primary);
    border-color: var(--action-primary-border);
    font-weight: var(--label-md-weight);
  }

  .ui-button[data-variant='primary']:active:not([aria-disabled='true']) {
    background: var(--action-primary-pressed);
  }

  /* The inline link look: no box, so it sits inside a line of text without
     pushing the line apart. Underlined so it reads as actionable without colour. */
  .ui-button[data-variant='text'] {
    padding: 0;
    border-color: transparent;
    font-size: inherit;
    line-height: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: normal;
  }

  .ui-button[aria-disabled='true'] {
    color: var(--action-on-disabled);
    cursor: default;
  }

  .ui-button[data-variant='primary'][aria-disabled='true'] {
    background: var(--action-disabled);
    color: var(--action-on-disabled);
    border-color: var(--action-disabled);
  }
</style>
