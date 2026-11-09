<script>
  // The foot of a bounded Activity feed (khaotik-ui #40), shared by Activity and the Story
  // Atlas's activity panel: the count of what is loaded out of what exists, the search and
  // refresh states, and Load older. The rows above it stay whatever the host loaded; a failed
  // read here never clears them.
  import Button from './Button.svelte'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/activity.js').ActivityFeed} [feed] What the host knows beyond the loaded rows.
   * @property {number} [loaded] Rows loaded and drawn above.
   * @property {string} [query] The query the rows answer, or ''.
   * @property {() => void} [onLoadOlder] Asks for the next older page; also the retry after a failed one.
   * @property {() => void} [onRefresh] Asks for newer changes again after a failed refresh.
   */

  /** @type {Props} */
  let { feed = {}, loaded = 0, query = '', onLoadOlder = undefined, onRefresh = undefined } = $props()

  const searching = $derived(query.trim() !== '')
  const search = $derived(feed.search?.kind ?? 'idle')
  const older = $derived(feed.older?.kind ?? 'idle')
  // The count names its total, so a partial page never reads as the whole history.
  const of = $derived(searching ? feed.matchedTotal : feed.storyTotal)
  const count = $derived(of === undefined || (searching && search !== 'idle') ? '' : `Showing ${loaded} of ${of} ${searching ? 'matching changes' : 'changes'}`)
</script>

<div class="ui-activity-feed">
  {#if feed.refresh?.kind === 'catching-up'}
    <p class="ui-activity-feed__note" role="status">Reading newer changes…</p>
  {:else if feed.refresh?.kind === 'failed'}
    <div class="ui-activity-feed__row">
      <p class="ui-activity-feed__note" role="alert">Could not check for newer changes: {feed.refresh.message}</p>
      <Button onclick={() => onRefresh?.()}>Check for newer changes again</Button>
    </div>
  {/if}

  {#if searching && feed.search?.kind === 'searching'}
    <p class="ui-activity-feed__note" role="status">Searching the whole history…</p>
  {:else if searching && feed.search?.kind === 'unsupported'}
    <p class="ui-activity-feed__note" role="status">This khaosd cannot search the story’s history. Update khaosd to search it.</p>
  {:else if searching && feed.search?.kind === 'failed'}
    <p class="ui-activity-feed__note" role="alert">Could not search: {feed.search.message}</p>
  {:else if searching && loaded === 0 && !feed.hasMore}
    <p class="ui-activity-feed__note" role="status">No changes match that search.</p>
  {/if}

  {#if count}<p class="ui-activity-feed__note">{count}</p>{/if}

  {#if feed.older?.kind === 'failed'}
    <div class="ui-activity-feed__row">
      <p class="ui-activity-feed__note" role="alert">Could not load older changes: {feed.older.message}</p>
      <Button onclick={() => onLoadOlder?.()}>Try loading older changes again</Button>
    </div>
  {:else if feed.hasMore}
    <Button disabled={older === 'loading'} onclick={() => onLoadOlder?.()}>{older === 'loading' ? 'Loading older changes…' : 'Load older changes'}</Button>
  {/if}
</div>

<style>
  .ui-activity-feed {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
    flex: 0 0 auto;
  }
  .ui-activity-feed__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm);
  }
  .ui-activity-feed__note {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
</style>
