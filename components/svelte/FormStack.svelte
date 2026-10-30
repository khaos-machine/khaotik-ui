<script>
  // FormStack — a form laid out as one column: a form-level message, the
  // fields, then the actions, spaced by the kit.
  //
  // The message slot is for the outcome of submitting, such as an
  // OutcomeBanner with the server's reason a sign-in failed. A field's own error
  // belongs on that field, where `aria-describedby` reads it out.
  //
  // Submitting calls `onsubmit` and never reloads the page. Native validation
  // still runs first, so a `required` field blocks the submit.

  /**
   * @typedef {Object} Props
   * @property {string} [label] Names the form for assistive technology, such as "Sign in". Omit it when a visible heading already does.
   * @property {() => void} [onsubmit] Called when the form is submitted and passes native validation.
   * @property {import('svelte').Snippet} [message] A form-level error or notice, shown above the fields.
   * @property {import('svelte').Snippet} [children] The fields.
   * @property {import('svelte').Snippet} [actions] The buttons, shown below the fields.
   */

  /** @type {Props} */
  let { label = undefined, onsubmit = undefined, message = undefined, children = undefined, actions = undefined } = $props()
</script>

<form
  class="kform"
  aria-label={label}
  onsubmit={(e) => {
    e.preventDefault()
    onsubmit?.()
  }}
>
  {#if message}<div class="kform__message">{@render message()}</div>{/if}
  <div class="kform__fields">{@render children?.()}</div>
  {#if actions}<div class="kform__actions">{@render actions()}</div>{/if}
</form>

<style>
  .kform {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .kform__fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .kform__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
</style>
