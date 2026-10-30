<script>
  // Activity: a story's committed changes, newest first, under the reader's day, in its own
  // window. Read-only. The filter is the host's; the days it passes are the rows that match.
  // Moved from Khaos App (catalog app-coverage plan, T9).
  import EmptyState from './EmptyState.svelte'
  import EventLog from './EventLog.svelte'
  import FilterField from './FilterField.svelte'
  import MetricCard from './MetricCard.svelte'
  import { logEvents } from './lib/activity.js'

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'loading' } | { kind: 'missing' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [state] The activity read. `missing`: the project holds no committed story.
   * @property {string} [projectTitle] The project the window shows, as its heading.
   * @property {number} [total] The ledger's count of committed changes.
   * @property {number} [rowCount] Changes read, before the filter.
   * @property {readonly import('./lib/activity.js').ActivityDay[]} [days] The changes that match the filter, by day.
   * @property {string} [query] The filter.
   * @property {(query: string) => void} [onQuery] Reports the filter typed.
   */

  /** @type {Props} */
  let { state = { kind: 'loading' }, projectTitle = '', total = 0, rowCount = 0, days = [], query = '', onQuery = undefined } = $props()

  /** `2026-10-06T02:36:55Z` → a compact local time. The day is already the heading. @param {string} at */
  function stamp(at) {
    const date = new Date(at)
    if (Number.isNaN(date.getTime())) return at
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
  }

  const events = $derived(logEvents(days, stamp))
  const shown = $derived(days.reduce((sum, day) => sum + day.rows.length, 0))
</script>

<div class="ui-activity">
  <header class="ui-activity__bar">
    <h1 class="ui-activity__title">{projectTitle}</h1>
    <p class="ui-activity__sub">Activity</p>

    {#if state.kind === 'loaded'}
      <div class="ui-activity__counts">
        <MetricCard value={String(total)} label="Changes" icon="list-bullets" />
      </div>
    {/if}
  </header>

  {#if state.kind === 'loading'}
    <EmptyState title="Reading activity…" icon="circle-notch" />
  {:else if state.kind === 'missing'}
    <EmptyState title="No committed story" description="This project holds no committed story yet, so it has no activity. Import its screenplay to start one." icon="clock-counter-clockwise" />
  {:else if state.kind === 'failed'}
    <EmptyState title="Could not read the activity" description={state.message} icon="warning" />
  {:else if rowCount === 0}
    <EmptyState title="No committed changes" icon="clock-counter-clockwise" />
  {:else}
    <div class="ui-activity__filter">
      <FilterField label="Filter changes" placeholder="Filter kinds, actors, decisions, documents…" value={query} {shown} total={rowCount} oninput={(/** @type {string} */ v) => onQuery?.(v)} />
    </div>

    <div class="ui-activity__list">
      {#if shown === 0}
        <p class="ui-activity__hint">No changes match that filter.</p>
      {:else}
        <EventLog {events} label="Activity" empty="No committed changes" uiId="activity.log" />
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Window-height layout: chrome pinned, only the feed scrolls. */
  .ui-activity {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    height: 100vh;
    overflow: hidden;
    padding: var(--spacing-md);
    background: var(--surface-base);
    color: var(--text-primary);
  }
  .ui-activity__bar,
  .ui-activity__filter {
    flex: 0 0 auto;
  }
  .ui-activity__title {
    margin: 0;
    font-size: var(--heading-md-size);
    font-weight: var(--heading-md-weight);
  }
  .ui-activity__sub,
  .ui-activity__hint {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
  .ui-activity__counts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }
  /* The EventLog scrolls its own rows; this only gives it the window's remaining height. */
  .ui-activity__list {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
  }
</style>
