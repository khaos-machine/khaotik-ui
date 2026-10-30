<script>
  // PasswordField — a labelled password input with a show/hide toggle.
  //
  // Adopted, not authored — Ark UI's PasswordInput inside FieldFrame. The
  // primitive switches the input type and reads the field's ids, `invalid` and
  // `required` from the frame.
  //
  // The toggle is ours to fix in three ways. zag takes it out of the tab order
  // and acts only on pointerdown, which fails WCAG 2.1.1: a keyboard user could
  // not reveal what they typed. So it takes focus, and a keyboard click (detail
  // 0, which a native button fires for Enter and Space) toggles it; a pointer
  // click is left alone because pointerdown already toggled. And it is a toggle
  // button, so it keeps one name, "Show password", with `aria-pressed` carrying
  // the state, in place of zag's changing label plus `aria-expanded`.
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

  let visible = $state(false)
</script>

<FieldFrame {label} {hint} {error} {required}>
  {#snippet children(describedby)}
    <PasswordInputRoot class="kpassword" autoComplete={autocomplete} {name} bind:visible>
      <PasswordInputControl class="kfield__box">
        <PasswordInputInput
          class="kfield__text"
          {value}
          aria-describedby={describedby}
          oninput={(e) => oninput?.(e.currentTarget.value)}
        />
        <PasswordInputVisibilityTrigger
          class="kpassword__toggle"
          tabindex={0}
          aria-label="Show password"
          aria-pressed={visible}
          aria-expanded={null}
          onclick={(e) => {
            if (e.detail === 0) visible = !visible
          }}
        >
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
