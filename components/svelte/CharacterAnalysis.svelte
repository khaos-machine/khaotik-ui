<script>
  // A character's Analysis view: the story reading, the casting profile and the ties, as the
  // engine's three readings wrote them. The ties are suggestions: each says who settled it, and
  // nothing here decides one. Takes the analysis record khaosd serves on the character's detail;
  // `lib/character-analysis.js` reads it. Moved from Khaos App (catalog app-coverage plan, T2).
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { characterAnalysisView } from './lib/character-analysis.js'

  /**
   * @typedef {Object} Props
   * @property {Record<string, unknown> | null} [analysis] The analysis record from khaosd's `/api/dashboard/detail` (`.analysis`). Null, or a record with neither a story nor a casting reading, draws nothing.
   */

  /** @type {Props} */
  let { analysis = null } = $props()

  const view = $derived(characterAnalysisView(analysis))

  /** @type {Record<string, 'success' | 'info' | 'neutral'>} */
  const DECIDED_TONE = { Review: 'success', Analysis: 'neutral' }
  /** @param {string} decidedBy */
  const tone = (decidedBy) => DECIDED_TONE[decidedBy] ?? 'info'
  const profile = $derived(
    view?.voiceProfile ? [view.voiceProfile.register, view.voiceProfile.pace, view.voiceProfile.energy].filter(Boolean).join(' · ') : '',
  )
</script>

{#snippet said(/** @type {string} */ label, /** @type {string} */ text)}
  <p class="ui-character-analysis__label">{label}</p>
  <p class="ui-character-analysis__prose">{text}</p>
{/snippet}

{#if view}
  <div class="ui-character-analysis" data-ui-id="story.character.analysis">
    <InspectorSection title="Story" uiId="story.character.analysis.story">
      {#if view.summary}<p class="ui-character-analysis__prose">{view.summary}</p>{/if}
      {#if view.role.weight}<PropertyRow label="Role" value={view.role.weight} />{/if}
      {#if view.role.does}<p class="ui-character-analysis__note">{view.role.does}</p>{/if}
      {#if view.want.goal}{@render said('Wants', view.want.goal)}{/if}
      {#if view.want.obstacle}{@render said('In the way', view.want.obstacle)}{/if}
      {#if view.want.scenes}<p class="ui-character-analysis__cite">{view.want.scenes}</p>{/if}
    </InspectorSection>

    {#if view.arc.start.text || view.arc.turns.length || view.arc.end.text}
      <InspectorSection title="Arc" count={view.arc.turns.length} uiId="story.character.analysis.arc">
        {#snippet meta()}{#if view.arc.shape}<StatusPill text={view.arc.shape} tone="neutral" />{/if}{/snippet}
        {#if view.arc.start.text}{@render said(`Starts · ${view.arc.start.scenes}`, view.arc.start.text)}{/if}
        {#each view.arc.turns as turn, i (i)}
          {@render said(`${turn.scene} · ${turn.kind}`, turn.change)}
        {/each}
        {#if view.arc.end.text}{@render said(`Ends · ${view.arc.end.scenes}`, view.arc.end.text)}{/if}
      </InspectorSection>
    {/if}

    {#if view.relationships.length}
      <InspectorSection title="Relationships" count={view.relationships.length} uiId="story.character.analysis.relationships">
        {#each view.relationships as r, i (i)}
          <div class="ui-character-analysis__item">
            <PropertyRow label={r.name} value={[r.nature, r.basis === 'pivotal' ? 'one pivotal scene' : ''].filter(Boolean).join(' · ')} />
            {#if r.development}<p class="ui-character-analysis__note">{r.development}</p>{/if}
            {#if r.scenes}<p class="ui-character-analysis__cite">{r.scenes}</p>{/if}
          </div>
        {/each}
      </InspectorSection>
    {/if}

    <InspectorSection title="Appearance" uiId="story.character.analysis.appearance">
      {#if view.appearance.castingNote}<p class="ui-character-analysis__prose">{view.appearance.castingNote}</p>{/if}
      {#if view.demographics.gender}<PropertyRow label="Gender" value={view.demographics.gender} />{/if}
      {#if view.demographics.age}<PropertyRow label="Age" value={view.demographics.age} />{/if}
      {#each view.appearance.stated as s, i (i)}{@render said(`Script · ${s.scenes}`, s.text)}{/each}
      {#each view.appearance.changes as c, i (i)}{@render said(`Changes · ${c.scenes}`, c.text)}{/each}
      {#each view.appearance.suggested as s, i (i)}
        {@render said('Suggested, not in the script', s.detail)}
        {#if s.restsOn}<p class="ui-character-analysis__note">Rests on: {s.restsOn}</p>{/if}
      {/each}
    </InspectorSection>

    {#if view.voice || view.voiceProfile}
      <InspectorSection title="Voice" uiId="story.character.analysis.voice">
        {#if view.voiceProfile?.designNote}<p class="ui-character-analysis__prose">{view.voiceProfile.designNote}</p>{/if}
        {#if view.voice?.manner}{@render said('Manner', view.voice.manner)}{/if}
        {#if profile}<PropertyRow label="Delivery" value={profile} />{/if}
        {#if view.voiceProfile?.talks}<PropertyRow label="Talks" value={view.voiceProfile.talks} />{/if}
        {#if view.voiceProfile?.accent}<PropertyRow label="Accent" value={view.voiceProfile.accent} />{/if}
        {#if view.voice?.habits.length}
          <ul class="ui-character-analysis__list">{#each view.voice.habits as habit, i (i)}<li>{habit}</li>{/each}</ul>
        {/if}
        {#each view.voiceProfile?.suggested ?? [] as s, i (i)}
          {@render said('Suggested, not in their lines', s.detail)}
          {#if s.restsOn}<p class="ui-character-analysis__note">Rests on: {s.restsOn}</p>{/if}
        {/each}
        {#each view.voiceProfile?.auditionLines ?? [] as l, i (i)}
          <p class="ui-character-analysis__evidence">{l.scene} · “{l.line}”</p>
        {/each}
      </InspectorSection>
    {/if}

    {#if view.ties.length}
      <InspectorSection title="Ties" count={view.ties.length} uiId="story.character.analysis.ties">
        <p class="ui-character-analysis__note">Who the script's “my brother”, “your son” mean. Suggestions, not decisions.</p>
        {#each view.ties as tie, i (i)}
          <div class="ui-character-analysis__item" data-ui-id="story.character.analysis.tie">
            {#each tie.people as person, j (j)}
              <PropertyRow label={tie.tie}>
                <span class="ui-character-analysis__who">{person.who}</span>
                <StatusPill text={person.decidedBy} tone={tone(person.decidedBy)} />
              </PropertyRow>
              {#each person.lines.filter((l) => l.wording) as line, k (k)}
                <p class="ui-character-analysis__evidence">{[line.scene, line.speaker || 'the script'].filter(Boolean).join(' · ')} · “{line.wording}”</p>
              {/each}
            {/each}
          </div>
        {/each}
      </InspectorSection>
    {/if}

    {#if view.review.length}
      <InspectorSection title="Engine checks" count={view.review.length} uiId="story.character.analysis.review">
        {#each view.review as r, i (i)}{@render said(r.reading, r.finding)}{/each}
      </InspectorSection>
    {/if}

    {#if view.madeBy}
      <InspectorSection title="Made by" uiId="story.character.analysis.provenance">
        <PropertyRow label="Process" value={view.madeBy.process} />
        <PropertyRow label="Model" value={view.madeBy.model ?? 'Not recorded in the analysis'} />
        {#if view.madeBy.fingerprint}<PropertyRow label="Fingerprint" value={view.madeBy.fingerprint} />{/if}
      </InspectorSection>
    {/if}
  </div>
{/if}

<style>
  .ui-character-analysis {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  .ui-character-analysis__prose {
    margin: var(--spacing-xs) 0;
    font-size: var(--data-md-size);
  }
  .ui-character-analysis__label {
    margin: var(--spacing-xs) 0 0;
    color: var(--text-secondary);
    font-size: var(--data-md-size);
  }
  .ui-character-analysis__label + .ui-character-analysis__prose {
    margin-top: 0;
  }
  .ui-character-analysis__list {
    margin: var(--spacing-xs) 0;
    padding-left: var(--spacing-lg);
    font-size: var(--data-md-size);
  }
  .ui-character-analysis__note {
    margin: 0 0 var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--data-md-size);
  }
  .ui-character-analysis__cite,
  .ui-character-analysis__evidence {
    margin: 0 0 var(--spacing-xs);
    font-family: var(--font-mono);
    font-size: var(--data-md-size);
    color: var(--text-secondary);
  }
  .ui-character-analysis__item {
    padding: var(--spacing-xs) 0;
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-character-analysis__who {
    margin-right: var(--spacing-xs);
  }
</style>
