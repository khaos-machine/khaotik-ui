<script>
  // The line takes the engine refused to list, each with what to do, the engine's own reason
  // under Details, and a way to its scene. Scene reads are left out: their scene says so. Moved
  // from Khaos App (catalog app-coverage plan, T5).
  import Button from './Button.svelte'
  import { refusalText, sceneGroup } from './lib/recordings.js'

  /**
   * @typedef {Object} Props
   * @property {readonly import('./lib/recordings.js').RefusedTake[]} [refused] The takes the engine refused to list.
   * @property {(sceneId: string) => void} [onRevealScene] Reports a refused take's scene to open.
   */

  /** @type {Props} */
  let { refused = [], onRevealScene = undefined } = $props()

  const lineRefusals = $derived(refused.filter((take) => take.kind === 'line'))
</script>

{#if lineRefusals.length > 0}
  <ul class="ui-refused-takes" aria-label="Recordings that need attention">
    {#each lineRefusals as take (take.id)}
      <li class="ui-refused-takes__item" role="status">
        <p class="ui-refused-takes__line"><strong>{sceneGroup(take)}</strong> {refusalText(take)}</p>
        <details>
          <summary>Details</summary>
          <code>{take.reason}</code>
        </details>
        {#if take.scene}
          {@const scene = take.scene}
          <Button variant="text" onclick={() => onRevealScene?.(scene.id)}>Open scene</Button>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  /* The app's copy sized the text with --body-sm-size, which no token defines, behind
     hard-coded fallbacks for every token; the kit's own tokens stand alone here. */
  .ui-refused-takes {
    list-style: none;
    margin: var(--spacing-sm);
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  .ui-refused-takes__item {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-default);
    border-left: 3px solid var(--tone-warning);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
  .ui-refused-takes__item strong {
    color: var(--text-primary);
  }
  .ui-refused-takes__line {
    margin: 0;
  }
  .ui-refused-takes__item details {
    margin-top: var(--spacing-xs);
  }
  .ui-refused-takes__item code {
    overflow-wrap: anywhere;
  }
</style>
