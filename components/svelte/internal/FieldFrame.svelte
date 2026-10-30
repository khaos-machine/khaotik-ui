<script>
  // FieldFrame — the label, hint and error shared by TextField, PasswordField
  // and CodeField. Not exported: each field puts its own control in the middle.
  //
  // Adopted, not authored — Ark UI's Field. It gives the control its id, points
  // the label's `for` at it, and sets `aria-invalid` and `required` on it. Ark's
  // PasswordInput and PinInput read the same context, so all three fields are
  // wired one way.
  //
  // Ark puts only the hint in `aria-describedby` and points `aria-errormessage`
  // at the error, which screen readers announce unevenly. So the frame names the
  // ids itself and hands each control a `describedby` carrying both, which the
  // field sets on its input.
  import {
    FieldErrorText,
    FieldHelperText,
    FieldLabel,
    FieldRequiredIndicator,
    FieldRoot,
  } from '@ark-ui/svelte/field'

  let { label = '', hint = '', error = '', required = false, children } = $props()

  const id = $props.id()
  const ids = { control: `${id}-control`, label: `${id}-label`, helperText: `${id}-hint`, errorText: `${id}-error` }
  const describedby = $derived(
    [hint && ids.helperText, error && ids.errorText].filter(Boolean).join(' ') || undefined,
  )
</script>

<!-- Classes on an Ark component are forwarded to the rendered element, so
     Svelte scopes them as unused — they are styled :global below. -->
<FieldRoot class="kfield" invalid={error !== ''} {required} {ids}>
  <FieldLabel class="kfield__label">
    {label}<FieldRequiredIndicator class="kfield__required">*</FieldRequiredIndicator>
  </FieldLabel>
  {@render children?.(describedby)}
  {#if hint}<FieldHelperText class="kfield__hint">{hint}</FieldHelperText>{/if}
  <FieldErrorText class="kfield__error">{error}</FieldErrorText>
</FieldRoot>

<style>
  :global(.kfield) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  :global(.kfield__label) {
    color: var(--text-primary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  :global(.kfield__required) {
    margin-left: 2px;
    color: var(--text-secondary);
  }

  :global(.kfield__hint) {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  :global(.kfield__error) {
    color: var(--tone-danger);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  /* The text box every field draws: TextField's input, PasswordField's control. */
  :global(.kfield__box) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
  }

  :global(.kfield__box:focus-within) {
    outline: 2px solid var(--border-focus);
    outline-offset: -1px;
  }

  :global(.kfield[data-invalid] .kfield__box),
  :global(.kfield__box[data-invalid]) {
    border-color: var(--tone-danger);
  }

  :global(.kfield__text) {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--body-md-size);
  }

  :global(.kfield__text:focus) {
    outline: none;
  }
</style>
