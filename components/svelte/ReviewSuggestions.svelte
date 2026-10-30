<script>
  // What scene analysis suggested for the record under review, each with what the engine made of
  // it. Accept reports the host's decision for the suggestion; Dismiss only hides it, and the
  // record stays pending. Moved from Khaos App (catalog app-coverage plan, T6).
  import Button from './Button.svelte'

  /** @typedef {import('./lib/review.js').PendingSuggestion} PendingSuggestion */

  /**
   * @typedef {Object} Props
   * @property {readonly { suggestion: PendingSuggestion, offer: import('./lib/review.js').SuggestionOffer }[]} [rows] The record's suggestions, as the host offers them.
   * @property {boolean} [busy] A decision is being sent: the buttons wait.
   * @property {(sceneId: string) => number | null} [sceneNumber] A scene's 1-based number, or null when the host does not hold it.
   * @property {(decision: unknown) => void} [onaccept] Reports the accepted decision, the host's, unchanged.
   * @property {(suggestion: PendingSuggestion, dismissed: boolean) => void} [ondismiss] Reports a suggestion dismissed, or restored.
   */

  /** @type {Props} */
  let { rows = [], busy = false, sceneNumber = () => null, onaccept = undefined, ondismiss = undefined } = $props()
</script>

{#if rows.length}
  <section class="ui-suggestions" aria-label="Scene analysis suggestions" data-ui-id="review.suggestions">
    <h3 class="ui-suggestions__title">Scene analysis suggests</h3>
    {#each rows as { suggestion: s, offer } (s.sceneId)}
      <div class="ui-suggestions__row" class:ui-suggestions__row--dismissed={s.dismissed} data-ui-id="review.suggestion">
        <p class="ui-suggestions__says">
          {offer.says}
          <span class="ui-suggestions__from">Scene {sceneNumber(s.sceneId) ?? '?'}{s.dismissed ? ' · dismissed' : ''}</span>
        </p>
        {#if offer.needs && !s.dismissed}<p class="ui-suggestions__needs">{offer.needs}</p>{/if}
        <div class="ui-suggestions__actions">
          {#if s.dismissed}
            <Button variant="text" disabled={busy} onclick={() => ondismiss?.(s, false)}>Restore</Button>
          {:else}
            {#each offer.accepts as accept, i (accept.label)}
              <Button variant={i === 0 ? 'primary' : 'secondary'} disabled={busy} onclick={() => onaccept?.(accept.decision)}>{accept.label}</Button>
            {/each}
            <Button variant="text" disabled={busy} onclick={() => ondismiss?.(s, true)}>Dismiss</Button>
          {/if}
        </div>
      </div>
    {/each}
  </section>
{/if}

<style>
  .ui-suggestions {
    margin: 0 0 var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-hairline);
  }
  .ui-suggestions__title {
    margin: 0 0 var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .ui-suggestions__row + .ui-suggestions__row {
    margin-top: var(--spacing-sm);
  }
  .ui-suggestions__row--dismissed {
    opacity: 0.6;
  }
  .ui-suggestions__says {
    margin: 0;
  }
  .ui-suggestions__from,
  .ui-suggestions__needs {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .ui-suggestions__from {
    margin-left: var(--spacing-xs);
  }
  .ui-suggestions__needs {
    margin: 2px 0 0;
  }
  .ui-suggestions__actions {
    display: flex;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
  }
</style>
