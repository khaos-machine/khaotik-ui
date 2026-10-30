<script>
  // Checkbox — one include/exclude mark (data-layer plan A6): a Review group's occurrences
  // are all decided unless one is unchecked. Controlled: a click asks `onchange` for the
  // other value and changes nothing itself, so the host's state is the only truth.

  /**
   * @typedef {Object} Props
   * @property {boolean} [checked] Controlled; the host owns the value.
   * @property {string} [label] The accessible name, and the visible label unless hidden.
   * @property {boolean} [hideLabel] Keeps the label for assistive technology only, for a checkbox in a table row whose row already says what it marks.
   * @property {boolean} [disabled] Dimmed, and asks nothing.
   * @property {(checked: boolean) => void} [onchange] Asked with the new value.
   * @property {string} [uiId] The `data-ui-id` (audit §3.14).
   */

  /** @type {Props} */
  let { checked = false, label = '', hideLabel = false, disabled = false, onchange = undefined, uiId = undefined } = $props()
</script>

<label class="checkbox" class:checkbox--disabled={disabled} data-ui-id={uiId}>
  <input
    type="checkbox"
    class="checkbox__input"
    {checked}
    {disabled}
    onchange={(e) => {
      // Controlled: the host decides. The native toggle is put back to the host's value at
      // once, and the host's answer draws the new one. Not preventDefault on click: the
      // browser undoes a cancelled click AFTER its handlers run, so a host that accepted the
      // value during the click had it drawn unticked (khaos-app, 2026-10-12).
      const next = e.currentTarget.checked
      e.currentTarget.checked = checked
      if (!disabled) onchange?.(next)
    }} />
  <span class="checkbox__label" class:checkbox__label--hidden={hideLabel}>{label}</span>
</label>

<style>
  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--data-md-size);
    color: var(--text-primary);
    cursor: pointer;
  }
  .checkbox--disabled {
    opacity: 0.4;
    cursor: default;
  }
  .checkbox__input {
    margin: 0;
    accent-color: var(--action-primary);
    cursor: inherit;
  }
  .checkbox__input:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  .checkbox__label--hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
