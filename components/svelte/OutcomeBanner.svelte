<script>
  // The result of a mutation, reported back to the person who asked for it.
  //
  // khaos-app's ADR-0007 rule 3 requires every mutation to report its outcome —
  // and on failure to show THE ENGINE'S OWN MESSAGE, not a generic one. That is
  // the constraint this component is shaped around: khaosd's errors are specific
  // ("projectPath query param required", "project is not a git repository"), and
  // replacing them with "Something went wrong" throws away the only part that
  // tells anyone what to do next.
  //
  // Authored rather than adopted: Ark has no equivalent, and there is no
  // behaviour here to get wrong — it is a labelled region with a dismiss button.
  import Icon from './Icon.svelte'

  /**
   * @typedef {'success'|'error'} OutcomeTone
   */

  /**
   * @typedef {Object} Props
   * @property {OutcomeTone} [tone] One or the other. An outcome is done or it failed; a component that also took `info` or `warning` would invite reporting a mutation as neither. Drives the tint, the icon, and whether a screen reader is interrupted (`alert`) or waits (`status`).
   * @property {string} [title] The short human summary — "Project deleted", "Could not delete project". Yours, because only you know what was attempted.
   * @property {string} [detail] The engine's message, verbatim. Rendered monospace and **never truncated** — an error clipped mid-sentence reads as complete, which is worse than showing none.
   * @property {boolean} [dismissible] Whether to render the dismiss control.
   * @property {() => void} [onDismiss] Reports a dismiss. Removing the banner is yours.
   */

  /** @type {Props} */
  let {
    // 'success' | 'error'. Nothing else: an outcome is one or the other, and a
    // component that also accepted 'info' or 'warning' would invite callers to
    // report a mutation as neither done nor failed.
    tone = 'success',
    // The short human summary — "Project deleted", "Could not delete project".
    // The caller writes it, because only the caller knows what was attempted.
    title = '',
    // The engine's message, verbatim. Rendered in the monospace face and NOT
    // truncated: an error clipped mid-sentence is worse than no error, because
    // it reads as complete.
    detail = '',
    dismissible = true,
    onDismiss = undefined,
  } = $props()

  const icon = $derived(tone === 'error' ? 'warning-circle' : 'check-circle')

  // `alert` for a failure, so a screen reader is interrupted — a mutation that
  // did not happen is worth interrupting for. `status` for success, which is
  // polite and waits its turn.
  const role = $derived(tone === 'error' ? 'alert' : 'status')
</script>

<div class="outcome" data-tone={tone} {role}>
  <span class="outcome__icon" aria-hidden="true"><Icon name={icon} weight="fill" /></span>

  <div class="outcome__body">
    {#if title}<p class="outcome__title">{title}</p>{/if}
    {#if detail}
      <!-- The engine's words, presented as quoted material rather than as our
           prose, so a reader can tell which half came from where. -->
      <p class="outcome__detail">{detail}</p>
    {/if}
  </div>

  {#if dismissible}
    <button
      type="button"
      class="outcome__dismiss"
      aria-label={title ? `Dismiss: ${title}` : 'Dismiss'}
      onclick={() => onDismiss?.()}
    >
      <Icon name="x" />
    </button>
  {/if}
</div>

<style>
  .outcome {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border: 1px solid;
    border-radius: var(--radius-md);
  }

  /* Tinted from the tone rather than filled with it: a solid block of colour
     competes with the surface it is reporting on, and this sits inside a working
     view rather than replacing it. */
  .outcome[data-tone='success'] {
    border-color: color-mix(in oklab, var(--tone-success) 40%, transparent);
    background: color-mix(in oklab, var(--tone-success) 12%, transparent);
  }

  .outcome[data-tone='error'] {
    border-color: color-mix(in oklab, var(--tone-danger) 45%, transparent);
    background: color-mix(in oklab, var(--tone-danger) 12%, transparent);
  }

  .outcome__icon {
    flex: 0 0 auto;
    display: flex;
    font-size: 1.05rem;
    line-height: 1;
  }

  .outcome[data-tone='success'] .outcome__icon { color: var(--tone-success); }
  .outcome[data-tone='error'] .outcome__icon { color: var(--tone-danger); }

  .outcome__body {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .outcome__title {
    margin: 0;
    font-size: var(--body-md-size);
    color: var(--text-primary);
  }

  /* Monospace and wrapping. NOT truncated and NOT single-line: the engine's
     message is the actionable part, and an ellipsis in the middle of
     "projectPath query param required" leaves the reader with nothing. */
  .outcome__detail {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .outcome__dismiss {
    flex: 0 0 auto;
    display: flex;
    padding: 2px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-secondary);
    font: inherit;
    cursor: pointer;
  }

  .outcome__dismiss:hover {
    color: var(--text-primary);
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
  }

  .outcome__dismiss:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }
</style>
