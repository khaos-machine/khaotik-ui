<script>
  // What the shell says when saved work could not be read.
  //
  // It exists because the alternative is silence. `storage.js` refuses to repair
  // or clear a payload it cannot read, which is the right call and is also
  // invisible: without this, an unreadable payload looks exactly like an empty
  // workspace, and the first anyone hears of it is noticing their work is gone.
  //
  // TWO ACTIONS, and only two. Copy hands the raw payload over before anything
  // else can happen — nothing is destroyed without a copy in the author's hand.
  // Discard is destructive, explicit, and never automatic; it is the only path
  // that clears the key, and a person has to choose it.
  import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'

  /**
   * @property {{kind: string, detail: string, raw?: string}|null} problem
   * @property {() => void} [onDiscard] Clears the stored payload. Destructive.
   * @property {() => void} [onDismiss] Hides the banner, leaving the payload alone.
   */
  let { problem, onDiscard = undefined, onDismiss = undefined } = $props()

  let copied = $state(false)

  async function copy() {
    // Guarded rather than assumed: jsdom has no clipboard, and neither does a
    // page served without a secure context. A copy button that throws is worse
    // than one that says it could not.
    try {
      await navigator.clipboard.writeText(problem.raw)
      copied = true
    } catch {
      copied = false
    }
  }
</script>

{#if problem}
  <div class="banner" role="status">
    <Icon name="warning-circle" weight="fill" />
    <p class="banner__detail">{problem.detail}</p>

    <div class="banner__actions">
      {#if problem.raw}
        <button type="button" class="banner__action focus-ring" onclick={copy}>
          {copied ? 'Copied' : 'Copy saved work'}
        </button>
      {/if}
      {#if onDiscard}
        <button type="button" class="banner__action banner__action--danger focus-ring" onclick={onDiscard}>
          Discard and start empty
        </button>
      {/if}
      {#if onDismiss}
        <button type="button" class="banner__action focus-ring" aria-label="Dismiss" onclick={onDismiss}>
          <Icon name="x" />
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .banner {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-md);
    border-bottom: 1px solid var(--border-default);
    background: color-mix(in oklab, var(--tone-warning) 12%, var(--surface-raised));
    color: var(--text-primary);
  }

  .banner :global(.ph) {
    color: var(--tone-warning);
    flex-shrink: 0;
  }

  .banner__detail {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    text-wrap: pretty;
  }

  .banner__actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    flex-shrink: 0;
  }

  .banner__action {
    padding: 3px 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    cursor: pointer;
  }

  .banner__action--danger {
    color: var(--tone-danger);
  }
</style>
