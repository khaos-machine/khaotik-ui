<script>
  // The project window: a doorway. The project's totals, and a category control whose every
  // entry opens the data-layer window, where the story's sections are worked. Moved from Khaos
  // App's src/ui/Dashboard.svelte (catalog app-coverage plan, T9). Story Player and Activity keep
  // their own windows. The project's history, when it is on, is the host's, passed as a snippet.
  import EmptyState from './EmptyState.svelte'
  import MetricCard from './MetricCard.svelte'
  import SegmentedControl from './SegmentedControl.svelte'

  /**
   * One section's totals. `analyzed` null is the engine declining to say, which must not print
   * as "0 analysed" beside a real total.
   * @typedef {{ section: string, total: number, analyzed: number | null }} OverviewRow
   */

  /**
   * @typedef {Object} Props
   * @property {string} [projectTitle] The window's title: the project's name.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [status] The project's read; a failure is the engine's own words.
   * @property {readonly OverviewRow[]} [overview] One card per section, in the host's order.
   * @property {readonly { value: string, label: string }[]} [categories] The category control's entries, in the host's order.
   * @property {(value: string) => void} [onCategory] A category was chosen; the host opens it in the data-layer window.
   * @property {() => void} [onOpenPlayer] Story Player, in its own window.
   * @property {() => void} [onOpenActivity] Activity, in its own window.
   * @property {import('svelte').Snippet | undefined} [history] The project's history, below the control; absent, the window says where the story is.
   */

  /** @type {Props} */
  let {
    projectTitle = '',
    status = { kind: 'loaded' },
    overview = [],
    categories = [],
    onCategory = undefined,
    onOpenPlayer = undefined,
    onOpenActivity = undefined,
    history = undefined,
  } = $props()

  /** The control shows no section of its own, so it is redrawn after each hand-over. */
  let categoryRedraw = $state(0)
  /** @param {string} s */
  const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
</script>

<div class="ui-project-window">
  <header class="ui-project-window__bar">
    <h1 class="ui-project-window__title">{projectTitle}</h1>
    <button class="ui-project-window__activity" type="button" onclick={() => onOpenPlayer?.()}>Story Player</button>
    <button class="ui-project-window__activity" type="button" onclick={() => onOpenActivity?.()}>Activity</button>
  </header>

  {#if status.kind === 'loading'}
    <EmptyState title="Loading project…" icon="circle-notch" />
  {:else if status.kind === 'failed'}
    <EmptyState title="Could not read this project" description={status.message} icon="warning" />
  {:else}
    <section class="ui-project-window__overview">
      {#each overview as row (row.section)}
        <MetricCard
          value={String(row.total)}
          label={titleCase(row.section)}
          sub={row.analyzed === null ? 'analysis state unknown' : `${row.analyzed} analysed`}
          tone={row.analyzed !== null && row.analyzed === row.total && row.total > 0 ? 'success' : 'neutral'} />
      {/each}
    </section>

    <!-- Keyed: an entry opens the data-layer window and leaves this one where it was, so the
         control is redrawn showing no section. -->
    {#key categoryRedraw}
      <SegmentedControl
        label="Category"
        value=""
        items={categories}
        onselect={(value) => {
          onCategory?.(value)
          categoryRedraw += 1
        }} />
    {/key}

    {#if history}
      {@render history()}
    {:else}
      <EmptyState
        title="This story is in the data-layer window"
        description="Choose a section above to open it there: Characters, Scenes, Places, Objects and Review."
        icon="squares-four" />
    {/if}
  {/if}
</div>

<style>
  /* The window is the viewport: a fixed height, so the chrome stays put and nothing overflows. */
  .ui-project-window {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.75rem);
    height: 100vh;
    overflow: hidden;
    padding: var(--spacing-md, 1rem);
    background: var(--surface-base);
    color: var(--text-primary);
  }

  .ui-project-window__bar,
  .ui-project-window__overview {
    flex: 0 0 auto;
  }

  .ui-project-window__bar {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 1rem);
  }

  .ui-project-window__activity {
    background: none;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm, 6px);
    color: var(--text-secondary);
    cursor: pointer;
    font: inherit;
    font-size: var(--label-md-size);
    padding: var(--spacing-xs, 0.35rem) var(--spacing-sm, 0.6rem);
  }

  .ui-project-window__activity:hover {
    color: var(--text-primary);
  }

  /* The title takes the free space, so the window buttons sit together at the end. */
  .ui-project-window__title {
    margin: 0 auto 0 0;
    font-size: var(--heading-md-size);
  }

  .ui-project-window__overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--spacing-sm, 0.75rem);
  }
</style>
