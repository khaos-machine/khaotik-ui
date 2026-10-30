<script>
  import FlowStrip from './FlowStrip.svelte'

  // The read-only sibling of `FlowCanvas`, exactly as `Canvas` is `ComposeCanvas`'s.
  //
  // Without it a flow is visible only in Compose. Browse — the default mode — routes
  // every selection to `Canvas`, which mounts `FixtureView` on `selected.component`;
  // a flow carries no component, so it printed "First run — not yet wired". A flow
  // that renders only in the authoring mode is a flow most people never see.
  //
  // It lives beside `Canvas` in `App.svelte` rather than inside it because `Canvas`'s
  // `describable` / `composedDoc` deriveds would badge a flow with an empty
  // implementation list — a flow implements nothing, it sequences.

  /**
   * @typedef {Object} Props
   * @property {{ name?: string, steps?: readonly string[] }} flow The flow document.
   * @property {{ device: string, size: string, orientation: string, enabled: boolean }} [frame] Device framing, forwarded to FlowStrip.
   * @property {readonly object[]} [registry] Every registry entry, so FlowStrip can resolve a step id to a screen. It reports a step it cannot resolve rather than dropping it.
   */

  /** @type {Props} */
  let { flow, frame = undefined, registry = [] } = $props()
</script>

<div class="flow-view">
  <header class="flow-view__head">
    <p class="eyebrow">Flow</p>
    <h1 class="flow-view__title">{flow?.name ?? 'Flow'}</h1>
    {#if flow?.steps?.length}
      <p class="flow-view__count note">
        {flow.steps.length}
        {flow.steps.length === 1 ? 'step' : 'steps'}
      </p>
    {/if}
  </header>

  {#if flow?.steps?.length}
    <FlowStrip {flow} {frame} {registry} />
  {:else}
    <!-- A published flow with no steps is a real state and not an error: the
         document exists and declares nothing yet. Said plainly rather than
         rendered as an empty strip, which would read as a failure to draw. -->
    <p class="flow-view__empty note">This flow declares no steps yet.</p>
  {/if}
</div>

<style>
  .flow-view {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    min-width: 0;
  }

  .flow-view__head {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .flow-view__title {
    margin: 0;
    font-size: var(--heading-md-size);
    font-weight: var(--heading-md-weight);
    line-height: var(--heading-md-line);
    letter-spacing: var(--heading-md-track);
    color: var(--text-primary);
  }

  .flow-view__count,
  .flow-view__empty {
    margin: 0;
  }
</style>
