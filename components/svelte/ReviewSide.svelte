<script>
  // Review's answer pane: the line saying which occurrences the answer decides, then the host's
  // answer for the chosen occurrence, passed as the `answer` snippet; or why there is none.
  // Moved from Khaos App (catalog app-coverage plan, T6).
  import EmptyState from './EmptyState.svelte'
  import { groupNote } from './lib/review.js'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/review.js').ReviewItem | null} [item] The occurrence under review; null when none is chosen.
   * @property {import('./lib/review.js').MentionGroup | null} [group] Its group, with `included`.
   * @property {number | null} [count] Records still pending; null until the queue has been read.
   * @property {import('svelte').Snippet | undefined} [answer] The host's suggestions and answer for `item`.
   */

  /** @type {Props} */
  let { item = null, group = null, count = null, answer = undefined } = $props()

  const note = $derived(groupNote(group))
  // A refusal that names what a non-person mention is cites claims on one line only.
  const single = $derived(item?.kind === 'entityAppearance' && !!item.classifiedAs)
</script>

{#if item}
  <div class="ui-review-side">
    {#if note}<p class="ui-review-side__note" role="status">{note}{single ? ' A refusal saying what it is applies to this line only.' : ''}</p>{/if}
    {@render answer?.()}
  </div>
{:else if count === 0}
  <EmptyState title="Nothing to review" description="Every mention the engine proposed has been decided." icon="check-circle" />
{:else}
  <EmptyState title="No mention chosen" description="Choose a mention in the queue." icon="flag" />
{/if}

<style>
  .ui-review-side {
    padding: var(--spacing-sm);
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .ui-review-side__note {
    margin: 0 0 var(--spacing-sm);
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
</style>
