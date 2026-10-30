<script>
  // A scene's Analysis view: everything the engine's scene analysis wrote, its standing and
  // what made it; the suggestions it made for pending records, each with the engine's verdict
  // and reason, and no control to decide them: character analysis settles them. Takes the
  // analysis record khaosd serves on the scene's detail; `lib/scene-analysis.js` reads it.
  // Moved from Khaos App (catalog app-coverage plan, T3).
  import AnalysisStale from './AnalysisStale.svelte'
  import EmptyState from './EmptyState.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import RenderMark from './RenderMark.svelte'
  import StatusPill from './StatusPill.svelte'
  import TokenField from './TokenField.svelte'
  import { sceneAnalysisView } from './lib/scene-analysis.js'

  /** @typedef {import('./lib/types.js').SceneStanding} SceneStanding */

  /**
   * @typedef {Object} Props
   * @property {Record<string, unknown> | null} [analysis] The analysis record from khaosd's `/api/dashboard/detail` (`.analysis`); null when there is none.
   * @property {readonly { id: string, name: string }[]} [names] Characters, objects and places, to name a suggestion's bind target.
   * @property {readonly { elementId: string, text?: string }[]} [events] The scene's composition events, to quote a suggestion's evidence.
   * @property {SceneStanding | undefined} [standing] The analysis's standing; undefined for a scene the engine has not analysed.
   */

  /** @type {Props} */
  let { analysis = null, names = [], events = [], standing = undefined } = $props()

  const view = $derived(sceneAnalysisView(analysis, { names, lines: new Map(events.map((e) => [e.elementId, e.text ?? ''])) }))
  const stale = $derived(
    standing ? { state: standing.state, reasons: standing.reasons ?? [], details: standing.details ?? [] } : undefined,
  )

  /** @type {Record<string, 'success' | 'info' | 'danger'>} */
  const OUTCOME_TONE = { accepted: 'success', statement: 'info', rejected: 'danger' }
</script>

{#if !view}
  <EmptyState
    title="No analysis"
    description={standing?.refusal ?? 'The engine has not analysed this scene. Analyse Scene in the toolbar runs it.'}
    icon="hourglass" />
{:else}
  <div class="ui-scene-analysis" data-ui-id="story.scene.analysis">
    <AnalysisStale standing={stale} />

    <InspectorSection title={view.title || 'Scene analysis'} uiId="story.analysis.scene">
      {#snippet meta()}{#if standing?.state === 'current'}<RenderMark state="ready" label="Analysis current" />{/if}{/snippet}
      {#if view.summary}<p class="ui-scene-analysis__prose">{view.summary}</p>{/if}
      {#if view.role}<PropertyRow label="Story role" value={view.role} />{/if}
      {#if view.tone}<PropertyRow label="Tone" value={view.tone} />{/if}
      {#if view.pacing}<PropertyRow label="Pacing" value={view.pacing} />{/if}
      {#if view.themes.length}<PropertyRow label="Themes"><TokenField tokens={view.themes} label="Themes" readonly /></PropertyRow>{/if}
    </InspectorSection>

    {#if view.beats.length}
      <InspectorSection title="Plot beats" count={view.beats.length} uiId="story.analysis.beats">
        <ol class="ui-scene-analysis__list">{#each view.beats as beat, i (i)}<li>{beat}</li>{/each}</ol>
      </InspectorSection>
    {/if}

    {#if view.speakers.length}
      <InspectorSection title="Speaking characters" count={view.speakers.length} uiId="story.analysis.speakers">
        {#each view.speakers as s, i (i)}
          <PropertyRow label={s.name} value={s.state} />
          {#if s.goal}<p class="ui-scene-analysis__note">Goal: {s.goal}</p>{/if}
        {/each}
      </InspectorSection>
    {/if}

    {#if view.interactions.length}
      <InspectorSection title="Interactions" count={view.interactions.length} uiId="story.analysis.interactions">
        {#each view.interactions as x, i (i)}
          <PropertyRow label="{x.from} → {x.to}" value={[x.type, x.valence, x.significance].filter(Boolean).join(' · ')} />
          {#if x.description}<p class="ui-scene-analysis__note">{x.description}</p>{/if}
        {/each}
      </InspectorSection>
    {/if}

    {#if view.arcMoments.length}
      <InspectorSection title="Arc moments" count={view.arcMoments.length} uiId="story.analysis.arcs">
        {#each view.arcMoments as m, i (i)}
          <PropertyRow label={m.character} value={[m.type, m.milestone, m.shift].filter(Boolean).join(' · ')} />
          {#if m.description}<p class="ui-scene-analysis__note">{m.description}</p>{/if}
        {/each}
      </InspectorSection>
    {/if}

    {#if view.suggestions.length}
      <InspectorSection title="Suggestions for pending records" count={view.suggestions.length} uiId="story.analysis.suggestions">
        <p class="ui-scene-analysis__note">Suggestions, not decisions. Character analysis weighs them after every scene.</p>
        {#each view.suggestions as s (s.recordId)}
          <div class="ui-scene-analysis__suggestion" data-ui-id="story.analysis.suggestion">
            <PropertyRow label={s.kind || 'Record'} value={s.words} />
            <p class="ui-scene-analysis__id">{s.recordId}</p>
            <PropertyRow label="Engine">
              <StatusPill text={s.outcome || 'not reviewed'} tone={OUTCOME_TONE[s.outcome] ?? 'neutral'} />
            </PropertyRow>
            {#if s.reason}<PropertyRow label="Reason" value={s.reason} />{/if}
            {#each s.evidence as line, i (i)}<p class="ui-scene-analysis__evidence">{line}</p>{/each}
          </div>
        {/each}
      </InspectorSection>
    {/if}

    {#if view.provenance}
      <InspectorSection title="Made by" uiId="story.analysis.provenance">
        <PropertyRow label="Process" value={view.provenance.process} />
        <PropertyRow label="Model" value={view.provenance.model ?? 'Not recorded in the analysis'} />
        {#if view.provenance.storyDataChange}<PropertyRow label="Stage 1 data" value={view.provenance.storyDataChange} />{/if}
        {#if view.provenance.fingerprint}<PropertyRow label="Fingerprint" value={view.provenance.fingerprint} />{/if}
      </InspectorSection>
    {/if}
  </div>
{/if}

<style>
  .ui-scene-analysis {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  .ui-scene-analysis__prose {
    margin: var(--spacing-xs) 0;
    font-size: var(--data-md-size);
  }
  .ui-scene-analysis__list {
    margin: var(--spacing-xs) 0;
    padding-left: var(--spacing-lg);
    font-size: var(--data-md-size);
  }
  .ui-scene-analysis__note {
    margin: 0 0 var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--data-md-size);
  }
  .ui-scene-analysis__suggestion {
    padding: var(--spacing-xs) 0;
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-scene-analysis__id {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--data-md-size);
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
  .ui-scene-analysis__evidence {
    margin: var(--spacing-xs) 0 0;
    font-family: var(--font-mono);
    font-size: var(--data-md-size);
    color: var(--text-secondary);
  }
</style>
