<script>
  // A place's Analysis view: the story reading, the setting, the mentions and the connections,
  // as the engine wrote them. Mentions and connections are suggestions: each says who read it,
  // and nothing here decides one. Takes the analysis record khaosd serves on the place's detail;
  // `lib/place-analysis.js` reads it. Moved from Khaos App (catalog app-coverage plan, T4).
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { placeAnalysisView } from './lib/place-analysis.js'

  /**
   * @typedef {Object} Props
   * @property {Record<string, unknown> | null} [analysis] The analysis record from khaosd's `/api/dashboard/detail` (`.analysis`). Null, or a record with neither a story nor a setting reading, draws nothing.
   */

  /** @type {Props} */
  let { analysis = null } = $props()

  const view = $derived(placeAnalysisView(analysis))
  /** @param {string} decidedBy @returns {'success' | 'neutral' | 'info'} */
  const tone = (decidedBy) => (decidedBy.startsWith('Review') ? 'success' : decidedBy === 'Analysis' ? 'neutral' : 'info')
</script>

{#snippet said(/** @type {string} */ label, /** @type {string} */ text)}
  <p class="ui-place-analysis__label">{label}</p>
  <p class="ui-place-analysis__prose">{text}</p>
{/snippet}

{#if view}
  <div class="ui-place-analysis" data-ui-id="story.place.analysis">
    <InspectorSection title="Story" uiId="story.place.analysis.story">
      {#if view.summary}<p class="ui-place-analysis__prose">{view.summary}</p>{/if}
      {#if view.fromScene}<p class="ui-place-analysis__note">One scene is set here; this is that scene's own summary.</p>{/if}
      {#if view.role.weight}<PropertyRow label="Role" value={view.role.weight} />{/if}
      {#if view.role.does}<p class="ui-place-analysis__note">{view.role.does}</p>{/if}
      <PropertyRow label="Scenes" value={String(view.facts.scenes)} />
      {#if view.facts.interiorExterior}<PropertyRow label="Interior or exterior" value={view.facts.interiorExterior} />{/if}
      {#if view.facts.timeOfDay}<PropertyRow label="Time of day" value={view.facts.timeOfDay} />{/if}
      {#if view.facts.parts.length}<PropertyRow label="Parts" value={view.facts.parts.join(', ')} />{/if}
      {#if view.facts.spokenOf}<PropertyRow label="Spoken of in" value={`${view.facts.spokenOf} line${view.facts.spokenOf === 1 ? '' : 's'}`} />{/if}
    </InspectorSection>
  
    {#if view.events.length}
      <InspectorSection title="What happens here" count={view.events.length} uiId="story.place.analysis.events">
        {#each view.events as event, i (i)}{@render said(event.scene, event.what)}{/each}
      </InspectorSection>
    {/if}
  
    {#if view.change.kind || view.change.phases.length}
      <InspectorSection title="How it changes" count={view.change.phases.length} uiId="story.place.analysis.change">
        {#snippet meta()}{#if view.change.kind}<StatusPill text={view.change.kind} tone="neutral" />{/if}{/snippet}
        {#if view.change.what}<p class="ui-place-analysis__prose">{view.change.what}</p>{/if}
        {#each view.change.phases as phase, i (i)}
          <div class="ui-place-analysis__item" data-ui-id="story.place.analysis.phase">
            <PropertyRow label={`${i + 1}`} value={phase.state} />
            {#if phase.scenes}<p class="ui-place-analysis__cite">{phase.scenes}</p>{/if}
          </div>
        {/each}
      </InspectorSection>
    {/if}
  
    {#if view.setting.atmosphere || view.setting.stated.length || view.setting.changes.length || view.setting.suggested.length}
      <InspectorSection title="Setting" count={view.setting.stated.length} uiId="story.place.analysis.setting">
        {#if view.setting.atmosphere}<p class="ui-place-analysis__prose">{view.setting.atmosphere}</p>{/if}
        {#each view.setting.stated as s, i (i)}{@render said(`Script · ${s.scenes}`, s.text)}{/each}
        {#each view.setting.changes as c, i (i)}{@render said(`Changes · ${c.scenes}`, c.text)}{/each}
        {#each view.setting.suggested as s, i (i)}
          {@render said('Suggested, not in the script', s.detail)}
          {#if s.restsOn}<p class="ui-place-analysis__note">Rests on: {s.restsOn}</p>{/if}
        {/each}
      </InspectorSection>
    {/if}
  
    {#if view.connections.length}
      <InspectorSection title="Connections" count={view.connections.length} uiId="story.place.analysis.connections">
        <p class="ui-place-analysis__note">How the script places this one beside others. Suggestions, not decisions.</p>
        {#each view.connections as connection, i (i)}
          <div class="ui-place-analysis__item" data-ui-id="story.place.analysis.connection">
            <PropertyRow label={connection.sentence}><StatusPill text={connection.decidedBy} tone={tone(connection.decidedBy)} /></PropertyRow>
            {#each connection.evidence as e, j (j)}<p class="ui-place-analysis__evidence">{e.scene} · “{e.words}”</p>{/each}
          </div>
        {/each}
      </InspectorSection>
    {/if}
  
    {#if view.mentions.length}
      <InspectorSection title="Mentions" count={view.mentions.length} uiId="story.place.analysis.mentions">
        <p class="ui-place-analysis__note">What “the kitchen”, “his building” mean in this place's scenes. Suggestions, not decisions.</p>
        {#each view.mentions as mention, i (i)}
          <div class="ui-place-analysis__item" data-ui-id="story.place.analysis.mention">
            {#each mention.readings as reading, j (j)}
              <PropertyRow label={mention.wording}>
                <span class="ui-place-analysis__who">{reading.means}</span>
                <StatusPill text={reading.decidedBy} tone={tone(reading.decidedBy)} />
              </PropertyRow>
              {#each reading.lines.filter((l) => l.text) as line, k (k)}
                <p class="ui-place-analysis__evidence">{line.scene} · “{line.text}”</p>
              {/each}
            {/each}
          </div>
        {/each}
      </InspectorSection>
    {/if}
  
    {#if view.review.length}
      <InspectorSection title="Engine checks" count={view.review.length} uiId="story.place.analysis.review">
        {#each view.review as r, i (i)}{@render said(r.reading, r.finding)}{/each}
      </InspectorSection>
    {/if}
  
    {#if view.madeBy}
      <InspectorSection title="Made by" uiId="story.place.analysis.provenance">
        <PropertyRow label="Process" value={view.madeBy.process} />
        <PropertyRow label="Model" value={view.madeBy.model ?? 'Not recorded in the analysis'} />
        {#if view.madeBy.fingerprint}<PropertyRow label="Fingerprint" value={view.madeBy.fingerprint} />{/if}
      </InspectorSection>
    {/if}
  </div>
{/if}

<style>
  .ui-place-analysis {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  .ui-place-analysis__prose {
    margin: var(--spacing-xs) 0;
    font-size: var(--data-md-size);
  }
  .ui-place-analysis__label {
    margin: var(--spacing-xs) 0 0;
    color: var(--text-secondary);
    font-size: var(--data-md-size);
  }
  .ui-place-analysis__label + .ui-place-analysis__prose {
    margin-top: 0;
  }
  .ui-place-analysis__note {
    margin: 0 0 var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--data-md-size);
  }
  .ui-place-analysis__cite,
  .ui-place-analysis__evidence {
    margin: 0 0 var(--spacing-xs);
    font-family: var(--font-mono);
    font-size: var(--data-md-size);
    color: var(--text-secondary);
  }
  .ui-place-analysis__item {
    padding: var(--spacing-xs) 0;
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-place-analysis__who {
    margin-right: var(--spacing-xs);
  }
</style>
