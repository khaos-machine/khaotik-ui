<script>
  // CodeField — a one-time code, one box per digit: email confirmation,
  // password reset, an authenticator app.
  //
  // Adopted, not authored — Ark UI's PinInput inside FieldFrame. The primitive
  // owns the hard parts: a pasted code fills every box at once, typing moves to
  // the next box and Backspace to the previous, `otp` sets
  // `autocomplete="one-time-code"` so the platform can offer the code from a
  // message, and `type="numeric"` sets `inputmode="numeric"` and refuses letters.
  import {
    PinInputControl,
    PinInputHiddenInput,
    PinInputInput,
    PinInputRoot,
  } from '@ark-ui/svelte/pin-input'
  import FieldFrame from './internal/FieldFrame.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The visible label for the whole code.
   * @property {string} [name] The form field name. The joined code is submitted under it.
   * @property {number} [length] How many digits the code has.
   * @property {string} [value] The digits entered so far. Controlled — the consumer owns it.
   * @property {boolean} [required] Marks the field required for the browser and screen readers.
   * @property {string} [hint] Help text under the boxes, such as where the code was sent.
   * @property {string} [error] The error message. Non-empty makes the field invalid.
   * @property {(value: string) => void} [oninput] Called with the digits entered so far on every change.
   * @property {(value: string) => void} [oncomplete] Called with the full code once every box is filled.
   */

  /** @type {Props} */
  let {
    label = 'Code',
    name = undefined,
    length = 6,
    value = '',
    required = false,
    hint = '',
    error = '',
    oninput = undefined,
    oncomplete = undefined,
  } = $props()

  const digits = $derived(Array.from({ length }, (_, i) => value[i] ?? ''))
  const boxes = $derived(Array.from({ length }, (_, i) => i))
</script>

<FieldFrame {label} {hint} {error} {required}>
  {#snippet children(describedby)}
    <PinInputRoot
      class="kcode"
      otp
      type="numeric"
      count={length}
      {name}
      value={digits}
      onValueChange={(details) => oninput?.(details.valueAsString)}
      onValueComplete={(details) => oncomplete?.(details.valueAsString)}
    >
      <PinInputControl class="kcode__control">
        {#each boxes as index (index)}
          <PinInputInput class="kcode__digit" {index} aria-describedby={describedby} />
        {/each}
      </PinInputControl>
      <PinInputHiddenInput />
    </PinInputRoot>
  {/snippet}
</FieldFrame>

<style>
  :global(.kcode__control) {
    display: flex;
    gap: var(--spacing-xs);
  }

  :global(.kcode__digit) {
    width: 2.25rem;
    height: 2.75rem;
    padding: 0;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--body-md-size);
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  :global(.kcode__digit:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: -1px;
  }

  :global(.kcode__digit[data-invalid]) {
    border-color: var(--tone-danger);
  }
</style>
