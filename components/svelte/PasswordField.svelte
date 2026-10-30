<script>
  // PasswordField — a labelled password input with a show/hide toggle.
  //
  // Adopted, not authored — Ark UI's PasswordInput inside FieldFrame. The
  // primitive owns the toggle: it switches the input type, keeps the toggle's
  // accessible name ("Show password" / "Hide password") in step, and reads the
  // field's ids, `invalid` and `required` from the frame.
  import {
    PasswordInputControl,
    PasswordInputIndicator,
    PasswordInputInput,
    PasswordInputRoot,
    PasswordInputVisibilityTrigger,
  } from '@ark-ui/svelte/password-input'
  import FieldFrame from './internal/FieldFrame.svelte'
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The visible label, which is also the input's accessible name.
   * @property {string} [name] The form field name.
   * @property {string} [value] The current password. Controlled — the consumer owns it.
   * @property {'current-password'|'new-password'} [autocomplete] `current-password` to sign in, `new-password` to set one, so password managers offer the right thing.
   * @property {boolean} [required] Marks the field required for the browser and screen readers.
   * @property {string} [hint] Help text under the input, such as a length rule, linked by `aria-describedby`.
   * @property {string} [error] The error message. Non-empty makes the field invalid.
   * @property {(value: string) => void} [oninput] Called with the new password on every input.
   */

  /** @type {Props} */
  let {
    label = 'Password',
    name = undefined,
    value = '',
    autocomplete = 'current-password',
    required = false,
    hint = '',
    error = '',
    oninput = undefined,
  } = $props()
</script>

<FieldFrame {label} {hint} {error} {required}>
  {#snippet children(describedby)}
    <PasswordInputRoot class="kpassword" autoComplete={autocomplete} {name}>
      <PasswordInputControl class="kfield__box">
        <PasswordInputInput
          class="kfield__text"
          {value}
          aria-describedby={describedby}
          oninput={(e) => oninput?.(e.currentTarget.value)}
        />
        <PasswordInputVisibilityTrigger class="kpassword__toggle">
          <PasswordInputIndicator>
            <Icon name="eye" />
            {#snippet fallback()}<Icon name="eye-slash" />{/snippet}
          </PasswordInputIndicator>
        </PasswordInputVisibilityTrigger>
      </PasswordInputControl>
    </PasswordInputRoot>
  {/snippet}
</FieldFrame>

<style>
  :global(.kpassword__toggle) {
    display: inline-flex;
    padding: 0;
    border: 0;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
  }

  :global(.kpassword__toggle:hover) {
    color: var(--text-primary);
  }

  :global(.kpassword__toggle:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
</style>
