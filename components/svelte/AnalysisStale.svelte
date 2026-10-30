<script>
  // Why an analysis is stale, in the engine's words: the same section above a scene's, a
  // character's and a place's analysis. Nothing for one that is current or absent.
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import RenderMark from './RenderMark.svelte'

  /**
   * @typedef {Object} AnalysisStanding
   * @property {string} state khaosd's analysis state. Only `stale` renders.
   * @property {readonly string[]} reasons What changed, one row each, in the engine's words.
   * @property {readonly string[]} details A note under each reason, by index. May be shorter than `reasons`.
   */

  /**
   * @typedef {Object} Props
   * @property {AnalysisStanding | undefined} [standing] The analysis's standing; undefined for an entity with no analysis. Nothing renders unless it is stale.
   */

  /** @type {Props} */
  let { standing = undefined } = $props()
</script>

{#if standing?.state === 'stale'}
  <InspectorSection title="Stale" uiId="story.analysis.stale">
    {#snippet meta()}<RenderMark state="stale" label="Analysis stale" />{/snippet}
    {#each standing.reasons as reason, i (reason)}
      <PropertyRow label="Changed" value={reason} />
      {#if standing.details[i]}<p class="stale__note">{standing.details[i]}</p>{/if}
    {/each}
  </InspectorSection>
{/if}

<style>
  .stale__note {
    margin: 0 0 var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--data-md-size);
  }
</style>
