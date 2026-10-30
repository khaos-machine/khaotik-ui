<script>
  // TextField — a labelled text or email input with a hint and an error.
  //
  // Adopted, not authored — Ark UI's Field, through FieldFrame. The error is
  // the consumer's: pass the message and the field turns invalid, announces it
  // through `aria-describedby`, and sets `aria-invalid`. Pass "" to clear it.
  import { FieldInput } from '@ark-ui/svelte/field'
  import FieldFrame from './internal/FieldFrame.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The visible label, which is also the input's accessible name.
   * @property {'text'|'email'} [type] The input type.
   * @property {string} [name] The form field name.
   * @property {string} [value] The current text. Controlled — the consumer owns it.
   * @property {string} [autocomplete] The `autocomplete` token, such as `email` or `username`.
   * @property {boolean} [required] Marks the field required for the browser and screen readers.
   * @property {string} [hint] Help text under the input, linked by `aria-describedby`.
   * @property {string} [error] The error message. Non-empty makes the field invalid.
   * @property {(value: string) => void} [oninput] Called with the new text on every input.
   */

  /** @type {Props} */
  let {
    label = '',
    type = 'text',
    name = undefined,
    value = '',
    autocomplete = undefined,
    required = false,
    hint = '',
    error = '',
    oninput = undefined,
  } = $props()
</script>

<FieldFrame {label} {hint} {error} {required}>
  {#snippet children(describedby)}
    <div class="kfield__box">
      <FieldInput
        class="kfield__text"
        {type}
        {name}
        {value}
        aria-describedby={describedby}
        {autocomplete}
        oninput={(e) => oninput?.(e.currentTarget.value)}
      />
    </div>
  {/snippet}
</FieldFrame>
