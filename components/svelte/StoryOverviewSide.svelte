<script>
  // The Overview's inspector pane: the turning point or coverage character selected in
  // StoryOverview. A turn reveals its scene through the host; a character shows coverage's own
  // view of them, as sent.
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { coverageReads, journeyName, journeysRead, namedPoints, pairName, relationshipsRead, shapeReads } from './lib/story-overview.js'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/story-overview.js').SectionRead<import('./lib/story-overview.js').StoryStructure>} [structure] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<Record<string, any>>} [coverage] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [journeys] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [relationships] As StoryOverview takes it.
   * @property {boolean} [advanced] Advanced mode: a relationship's confidence.
   * @property {import('./lib/story-overview.js').OverviewSelection | null} [selected] The selected turn, character, journey or relationship.| null} [selected] The selected turn or character.
   * @property {(sceneId: string) => void} [onRevealScene] Asked with the turn's scene.
   */

  /** @type {Props} */
  let { structure = { kind: 'loading' }, coverage = { kind: 'loading' }, journeys = { kind: 'loading' }, relationships = { kind: 'loading' }, advanced = false, selected = null, onRevealScene = undefined } = $props()

  const turn = $derived(
    selected?.kind === 'turn' && structure.kind === 'loaded' && shapeReads(structure.data) ? namedPoints(structure.data)?.[selected.index] : undefined,
  )
  const character = $derived(
    selected?.kind === 'character' && coverage.kind === 'loaded' && coverageReads(coverage.data) ? coverage.data.characters?.[selected.index] : undefined,
  )
  const journey = $derived(
    selected?.kind === 'journey' && journeys.kind === 'loaded' && journeysRead(journeys.data) ? journeys.data[selected.index] : undefined,
  )
  const pair = $derived(
    selected?.kind === 'relationship' && relationships.kind === 'loaded' && relationshipsRead(relationships.data) ? relationships.data[selected.index] : undefined,
  )
</script>

{#if turn}
  <InspectorSection title={turn.name} uiId="story.overview.side.turn">
    <p class="ui-story-side__text">{turn.turn}</p>
    <Button variant="secondary" icon="film-slate" onclick={() => onRevealScene?.(turn.sceneId)}>Show in Scenes</Button>
  </InspectorSection>
{:else if character}
  <InspectorSection title={character.name} uiId="story.overview.side.character">
    <PropertyRow label="Importance" value={character.importance?.value} />
    <PropertyRow label="Arc" value={character.arcSummary?.source === 'none' ? 'No answer' : character.arcSummary?.value} />
  </InspectorSection>
  {#each [['Strengths', character.strengths?.value ?? []], ['Concerns', character.concerns?.value ?? []]] as [title, items] (title)}
    {#if items.length}
      <InspectorSection {title} count={items.length}>
        <ul class="ui-story-side__list">{#each items as item, i (i)}<li>{item}</li>{/each}</ul>
      </InspectorSection>
    {/if}
  {/each}
{:else if journey}
  {@const j = journey.journey}
  <InspectorSection title={journeyName(journey.character)} uiId="story.overview.side.journey">
    <PropertyRow label="Starts" value={j.beginning_state} />
    <PropertyRow label="Changes" value={j.emotional_progression} />
    <PropertyRow label="Ends" value={j.final_state} />
  </InspectorSection>
  {#if j.turning_points.length}
    <InspectorSection title="Turning points" count={j.turning_points.length}>
      {#each j.turning_points as t, i (i)}
        <p class="ui-story-side__text">{t.description}</p>
        {#if t.evidence_scene_ids[0]}<Button variant="secondary" icon="film-slate" onclick={() => onRevealScene?.(t.evidence_scene_ids[0])}>Show in Scenes</Button>{/if}
      {/each}
    </InspectorSection>
  {/if}
  {#if j.relationship_evolution.length}
    <InspectorSection title="Relationships" count={j.relationship_evolution.length}>
      {#each j.relationship_evolution as r, i (i)}<PropertyRow label={r.counterpart} value={r.trajectory} />{/each}
    </InspectorSection>
  {/if}
{:else if pair?.analysis.synthesis}
  {@const s = pair.analysis.synthesis}
  <InspectorSection title={pairName(pair.characters)} uiId="story.overview.side.relationship">
    <div class="ui-story-side__pills"><StatusPill text={s.relationship_type} />{#if advanced}<StatusPill text="AI · {s.confidence}" />{/if}</div>
    <p class="ui-story-side__text">{s.trajectory}</p>
    <PropertyRow label="Beginning" value={s.relationship_arc.beginning} />
    <PropertyRow label="Middle" value={s.relationship_arc.middle} />
    <PropertyRow label="End" value={s.relationship_arc.end} />
  </InspectorSection>
  {#if s.turning_points.length}
    <InspectorSection title="Turning points" count={s.turning_points.length}>
      {#each s.turning_points as t, i (i)}
        <p class="ui-story-side__text">{t.description}</p>
        <Button variant="secondary" icon="film-slate" onclick={() => onRevealScene?.(t.scene_id)}>Show in Scenes</Button>
      {/each}
    </InspectorSection>
  {/if}
  {#each [['Emotional dynamics', s.emotional_dynamics], ['Conflict patterns', s.conflict_patterns]] as [title, items] (title)}
    {#if items.length}
      <InspectorSection {title} count={items.length}>
        <ul class="ui-story-side__list">{#each items as item, i (i)}<li>{item}</li>{/each}</ul>
      </InspectorSection>
    {/if}
  {/each}
{:else}
  <EmptyState title="Select a turning point, a character, a journey or a relationship to see more here." icon="compass" />
{/if}

<style>
  .ui-story-side__text {
    margin: 0 0 var(--spacing-sm);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
  .ui-story-side__pills {
    display: flex;
    gap: var(--spacing-xs);
    margin: 0 0 var(--spacing-xs);
  }
  .ui-story-side__list {
    margin: 0;
    padding-left: var(--spacing-md);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
</style>
