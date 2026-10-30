<script>
  // Adopted, not authored (D39, D50, P3) — Ark UI's Switch, dressed in BrandKit tokens.
  // Nothing here re-implements the behaviour: the checkbox semantics, the hidden input
  // that makes it work in a form, Space/Enter activation and the disabled handling all
  // come from the primitive.
  //
  // Switch rather than a styled checkbox: this turns a setting on or off and takes effect
  // immediately. A checkbox implies a pending state you later submit, which is the wrong
  // promise for a preference that applies as you flip it.
  import { SwitchControl, SwitchHiddenInput, SwitchLabel, SwitchRoot, SwitchThumb } from '@ark-ui/svelte/switch'

  /**
   * @typedef {Object} Props
   * @property {string} [label] What the setting is.
   * @property {string} [hint] Supporting line under the label, for a setting whose consequence is not obvious from its name. Not a tooltip — that would hide it from the person reading the settings screen to find out.
   * @property {boolean} [checked] Controlled — the host owns the value.
   * @property {boolean} [disabled] Renders dimmed and ignores input.
   * @property {(checked: boolean) => void} [onchange] Called with the new boolean.
   */

  /** @type {Props} */
  let {
    label = '',
    hint = '',
    checked = false,
    disabled = false,
    onchange = undefined,
  } = $props()
</script>

<!-- Classes on an Ark component are forwarded to the rendered element, so Svelte scopes
     them as unused — they are styled :global below (catalog/AGENTS.md, "Svelte 5 gotchas"). -->
<SwitchRoot
  {checked}
  {disabled}
  onCheckedChange={(details) => onchange?.(details.checked)}
  class="ui-toggle"
>
  <div class="ui-toggle__text">
    <SwitchLabel class="ui-toggle__label">{label}</SwitchLabel>
    {#if hint}<span class="ui-toggle__hint">{hint}</span>{/if}
  </div>
  <SwitchControl class="ui-toggle__control">
    <SwitchThumb class="ui-toggle__thumb" />
  </SwitchControl>
  <SwitchHiddenInput />
</SwitchRoot>

<style>
  :global(.ui-toggle) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    cursor: pointer;
  }

  :global(.ui-toggle[data-disabled]) {
    cursor: default;
  }

  .ui-toggle__text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  :global(.ui-toggle__label) {
    font-size: var(--body-md-size);
    color: var(--text-primary);
  }

  :global(.ui-toggle[data-disabled] .ui-toggle__label) {
    color: var(--text-tertiary);
  }

  .ui-toggle__hint {
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  /* The track. Sized in px rather than tokens: a switch is a physical control whose
     proportions carry its meaning, not a box that should grow with the type scale. */
  :global(.ui-toggle__control) {
    position: relative;
    flex: 0 0 auto;
    width: 34px;
    height: 20px;
    padding: 2px;
    border-radius: 999px;
    background: color-mix(in oklab, var(--text-primary) 18%, transparent);
    transition: background 150ms ease;
  }

  :global(.ui-toggle__control[data-state='checked']) {
    background: var(--tone-success);
  }

  :global(.ui-toggle[data-disabled] .ui-toggle__control) {
    opacity: 0.5;
  }

  /* focus lands on the hidden input; show it on the visible track */
  :global(.ui-toggle:has(:focus-visible) .ui-toggle__control) {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  :global(.ui-toggle__thumb) {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--surface-raised);
    transition: transform 150ms ease;
  }

  :global(.ui-toggle__control[data-state='checked'] .ui-toggle__thumb) {
    transform: translateX(14px);
  }
</style>
