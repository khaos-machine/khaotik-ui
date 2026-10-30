<script>
  // What a refused action offers beside khaosd's words: each fix in order, and Report a
  // Problem… always. The host chooses the fixes from khaosd's fields; this draws them.
  import Button from './Button.svelte'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/types.js').Refusal} [offer] The refusal and its fixes.
   * @property {(fix: import('./lib/types.js').RefusalFix) => void} [onFix] Reports a chosen fix.
   * @property {() => void} [onReport] Reports Report a Problem….
   */

  /** @type {Props} */
  let { offer = { headline: '', fixes: [] }, onFix = undefined, onReport = undefined } = $props()
</script>

<div class="refusal-offer" role="group" aria-label={offer.headline} data-ui-id="refusal-offer">
  <p class="refusal-offer__line"><strong>{offer.headline}</strong></p>
  {#if offer.detail}<p class="refusal-offer__detail">{offer.detail}</p>{/if}
  <div class="refusal-offer__actions">
    {#each offer.fixes as fix (fix.kind)}
      <Button variant="secondary" onclick={() => onFix?.(fix)}>{fix.label}</Button>
    {/each}
    <Button variant="text" onclick={() => onReport?.()}>Report a Problem…</Button>
  </div>
</div>

<style>
  .refusal-offer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-top: 1px solid var(--border-default);
  }

  .refusal-offer__line,
  .refusal-offer__detail {
    margin: 0;
  }

  .refusal-offer__detail {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
  }

  .refusal-offer__actions {
    display: flex;
    gap: var(--spacing-xs);
  }
</style>
