<script>
  // The story-wide analyses as one document: the premise, the story's shape and where it turns,
  // and the coverage report. Each section is drawn from its own read, so one failing or missing
  // never blanks the others. Values are shown as the engine sent them; the closed label maps in
  // lib/story-overview.js are presentation, and a value outside them fails its section.
  import Button from './Button.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import LabeledPill from './LabeledPill.svelte'
  import MeasureTable from './MeasureTable.svelte'
  import MetricCard from './MetricCard.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import SelectableRow from './SelectableRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { ARCS, INCOMPLETE, OUTCOMES, VERDICTS, coverageReads, journeyName, journeysRead, namedPoints, pairName, productionFlags, relationshipsRead, shapeReads } from './lib/story-overview.js'
  import { dollars } from './lib/budget.js'

  /** @typedef {import('./lib/story-overview.js').Sourced} Sourced */
  /** @typedef {import('./lib/story-overview.js').OverviewSelection} OverviewSelection */
  /** @typedef {'structure' | 'structureNaming' | 'coverage' | 'premise'} Pass */
  /** @typedef {{ paid: boolean, maxCalls?: number }} Offer */
  /**
   * @typedef {{ kind: 'none' } | ({ kind: 'offer' } & Offer) | { kind: 'needs-budget' } | { kind: 'running', paid?: boolean, progress?: string } | { kind: 'blocked', reason: string } | { kind: 'budget-reached', usd?: string, spentUsd?: string, maxCalls?: number } | { kind: 'failed', message: string, offer?: Offer } | { kind: 'done', totals?: readonly { attempts: number, provider: string, model: string }[], maxCalls?: number }} Run
   */

  /**
   * @typedef {Object} Props
   * @property {string} [title] The project's title.
   * @property {import('./lib/story-overview.js').SectionRead<import('./lib/story-overview.js').StoryPremise>} [premise] `GET /api/v1/premise`'s `premise`.
   * @property {import('./lib/story-overview.js').SectionRead<import('./lib/story-overview.js').StoryStructure>} [structure] `GET /api/v1/structure`.
   * @property {import('./lib/story-overview.js').SectionRead<Record<string, any>>} [coverage] `GET /api/v1/coverage/report`.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [journeys] `GET /api/v1/journeys`'s `journeys`: each character's journey, in story order.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [relationships] `GET /api/v1/relationships`'s `relationships`: each pair, read or skipped.
   * @property {boolean} [advanced] Advanced mode: models, confidence, lens scores and warnings.
   * @property {OverviewSelection | null} [selected] The selected turn or character.
   * @property {(item: OverviewSelection) => void} [onselect] Reports a turn or character chosen.
   * @property {{ premise?: Run, structure?: Run, coverage?: Run }} [runs] Each section's run action, one click each; the story budget bounds paid runs, so nothing asks first.
   * @property {(pass: Pass) => void} [onrun] Starts a pass: `structure` (free), `structureNaming`, `coverage` or `premise`.
   * @property {() => void} [onsetbudget] Opens this story's budget.
   */

  /** @type {Props} */
  let { title = '', premise = { kind: 'loading' }, structure = { kind: 'loading' }, coverage = { kind: 'loading' }, journeys = { kind: 'loading' }, relationships = { kind: 'loading' }, advanced = false, selected = null, onselect = undefined, runs = {}, onrun = undefined, onsetbudget = undefined } = $props()

  const LOADING = "Reading this story's analyses…"
  /** @param {Sourced | undefined} f */
  const sourceLabel = (f) => (!f || f.source === 'none' ? '' : f.source === 'llm' ? (advanced ? `AI · ${f.confidence}` : 'AI') : 'Counted')

  const shape = $derived(structure.kind === 'loaded' && shapeReads(structure.data) ? structure.data : null)
  const points = $derived(namedPoints(shape))

  const report = $derived(coverage.kind === 'loaded' && coverageReads(coverage.data) ? coverage.data : null)
  const flags = $derived(productionFlags(report))
  const characters = $derived((report?.characters ?? []).map((/** @type {Record<string, any>} */ c, /** @type {number} */ index) => ({ index, name: c.name, sceneCount: c.sceneCount, dialogueWeight: c.dialogueWeight?.value })))
  const journeyList = $derived(journeys.kind === 'loaded' && journeysRead(journeys.data) ? journeys.data : null)
  const pairList = $derived(relationships.kind === 'loaded' && relationshipsRead(relationships.data) ? relationships.data : null)
  const readPairs = $derived((pairList ?? []).map((/** @type {Record<string, any>} */ r, /** @type {number} */ index) => ({ ...r, index })).filter((r) => r.analysis.synthesis))
  const skippedPairs = $derived((pairList ?? []).filter((/** @type {Record<string, any>} */ r) => r.analysis.skip))
  const madeOn = $derived(
    report?.generatedAt ? new Date(report.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '',
  )

  /** Each section's action, by whether it is paid. Coverage and premise have only a paid pass. */
  const ACTIONS = {
    structure: { free: { pass: 'structure', label: 'Measure the shape', running: 'Measuring the shape…' }, paid: { pass: 'structureNaming', label: 'Name the turning points', running: 'Naming the turning points…' } },
    coverage: { paid: { pass: 'coverage', label: 'Write coverage', running: 'Writing coverage…' } },
    premise: { paid: { pass: 'premise', label: 'Write a premise', running: 'Writing a premise…' } },
  }
  /** @param {'premise' | 'structure' | 'coverage'} section @param {boolean} paid */
  const action = (section, paid) => (paid ? ACTIONS[section].paid : (ACTIONS[section].free ?? ACTIONS[section].paid))
  /** @param {number} n */
  const calls = (n) => `${n} ${n === 1 ? 'call' : 'calls'}`
  /** @param {Offer} o */
  const caption = (o) =>
    !o.paid
      ? 'Free. Finds where the story turns from the scene and character analyses.'
      : o.maxCalls === undefined ? '' : `Uses up to ${o.maxCalls} text ${o.maxCalls === 1 ? 'call' : 'calls'}.`
</script>

{#snippet line(/** @type {string} */ text, /** @type {string} */ detail = '')}
  <p class="ui-story-overview__line">{text}</p>
  {#if detail}<p class="ui-story-overview__detail">{detail}</p>{/if}
{/snippet}

{#snippet sourced(/** @type {string} */ label, /** @type {Sourced} */ f)}
  <div class="ui-story-overview__sourced">
    {#if label}<p class="ui-story-overview__label">{label}</p>{/if}
    <p>{f.value}</p>
    {#if sourceLabel(f)}<StatusPill text={sourceLabel(f)} />{/if}
  </div>
{/snippet}


{#snippet offer(/** @type {'premise' | 'structure' | 'coverage'} */ section, /** @type {Offer} */ o)}
  {#if o.paid && o.maxCalls === 0}
    {@render line('No turning points were found to name.')}
  {:else}
    {@const a = action(section, o.paid)}
    <div class="ui-story-overview__run">
      <Button variant="secondary" onclick={() => onrun?.(/** @type {Pass} */ (a.pass))}>{a.label}</Button>
      {#if caption(o)}<p class="ui-story-overview__detail">{caption(o)}</p>{/if}
    </div>
  {/if}
{/snippet}

{#snippet run(/** @type {'premise' | 'structure' | 'coverage'} */ section)}
  {@const r = /** @type {Run} */ (runs[section] ?? { kind: 'none' })}
  {#if r.kind === 'offer'}
    {@render offer(section, r)}
  {:else if r.kind === 'needs-budget'}
    {@render line('No budget set.')}
    <Button variant="secondary" onclick={() => onsetbudget?.()}>Set budget…</Button>
  {:else if r.kind === 'running'}
    {@render line(action(section, r.paid ?? true).running, r.progress)}
  {:else if r.kind === 'blocked'}
    {@render line(r.reason)}
  {:else if r.kind === 'budget-reached'}
    {@render line(r.usd !== undefined && r.spentUsd !== undefined ? `Stopped at the budget: ${dollars(r.spentUsd)} of ${dollars(r.usd)} spent.` : 'Stopped at the budget.')}
    <Button variant="text" onclick={() => onsetbudget?.()}>Change budget…</Button>
    {@render offer(section, { paid: true, maxCalls: r.maxCalls })}
  {:else if r.kind === 'failed'}
    {@render line("This analysis didn't finish.", r.message)}
    {#if r.offer}{@render offer(section, r.offer)}{/if}
  {:else if r.kind === 'done'}
    {#if r.totals?.length}
      {#each r.totals as t, i (i)}{@render line(advanced ? `${calls(t.attempts)} to ${t.provider} (${t.model})` : `${calls(t.attempts)} made`)}{/each}
      {#if r.maxCalls !== undefined}{@render line(`Up to ${r.maxCalls} were allowed.`)}{/if}
    {:else}
      {@render line('Done.')}
    {/if}
  {/if}
{/snippet}

{#snippet list(/** @type {string} */ name, /** @type {readonly string[]} */ items)}
  {#if items.length}
    <InspectorSection title={name} count={items.length}>
      <ul class="ui-story-overview__list">{#each items as item, i (i)}<li>{item}</li>{/each}</ul>
    </InspectorSection>
  {/if}
{/snippet}

<div class="ui-story-overview">
  <SectionHeader eyebrow="Story" {title}>
    {#snippet trailing()}{#if madeOn}<span class="ui-story-overview__made">Coverage made {madeOn}</span>{/if}{/snippet}
  </SectionHeader>

  <InspectorSection title="Premise" uiId="story.overview.premise">
    {#if premise.kind === 'loading'}{@render line(LOADING)}
    {:else if premise.kind === 'missing'}{@render line('This story has no premise yet.', premise.reason)}
    {:else if premise.kind === 'failed'}{@render line(premise.message)}
    {:else}
      {@render sourced('', premise.data.logline)}
      {@render sourced('', premise.data.synopsis)}
    {/if}
    {@render run('premise')}
  </InspectorSection>

  <InspectorSection title="Shape" uiId="story.overview.shape">
    {#if structure.kind === 'loading'}{@render line(LOADING)}
    {:else if structure.kind === 'missing'}{@render line("This story's shape hasn't been measured yet.", structure.reason)}
    {:else if structure.kind === 'failed' || !shape}{@render line("Khaos couldn't read this story's shape.", structure.kind === 'failed' ? structure.message : '')}
    {:else}
      <p class="ui-story-overview__headline">{shape.fit.reason}</p>
      <StatusPill text={OUTCOMES[shape.fit.outcome]} tone="info" />
      {#if points}
        <InspectorSection title="Where the story turns" count={points.length} uiId="story.overview.turns">
          {#each points as p, i (i)}
            <SelectableRow title={p.name} subtitle={p.turn} selected={selected?.kind === 'turn' && selected.index === i} onclick={() => onselect?.({ kind: 'turn', index: i })} />
          {/each}
        </InspectorSection>
      {:else}
        {@render line("The turning points haven't been named yet.")}
      {/if}
      {#if advanced}
        <InspectorSection title="Show details" collapsed uiId="story.overview.shape-details">
          {#each shape.fit.lenses as l (l.id)}<PropertyRow label={l.id} value="score {l.score.toFixed(2)} · p {l.p.toFixed(3)}" />{/each}
          {#if shape._provenance?.made_by?.model}<PropertyRow label="Turns named by" value={shape._provenance.made_by.model} />{/if}
        </InspectorSection>
      {/if}
    {/if}
    {@render run('structure')}
  </InspectorSection>

  <InspectorSection title="Coverage" uiId="story.overview.coverage">
    {#if coverage.kind === 'loading'}{@render line(LOADING)}
    {:else if coverage.kind === 'missing'}{@render line("There's no coverage for this story yet.", coverage.reason)}
    {:else if coverage.kind === 'failed' || !report}{@render line(coverage.kind === 'failed' ? coverage.message : "Khaos couldn't read this story's coverage.")}
    {:else}
      {#if report.incompleteSections?.length}<p class="ui-story-overview__note" role="note">Part of this coverage wasn't finished: {report.incompleteSections.map((/** @type {string} */ s) => INCOMPLETE[s]).join(', ')}.</p>{/if}
      <span class="ui-story-overview__verdict" title={report.rubric.verdict.evidence?.[0]?.citation ?? ''}><StatusPill text={VERDICTS[report.rubric.verdict.value].text} tone={VERDICTS[report.rubric.verdict.value].tone} /></span>
      <div class="ui-story-overview__metrics">
        <MetricCard label="Runtime" value="{Math.round(report.structure.estimatedRuntimeMs.value / 60000)} min" />
        <MetricCard label="Pages" value={report.structure.pageCount.value} />
        <MetricCard label="Scenes" value={report.structure.sceneCount.value} />
      </div>
      <div class="ui-story-overview__pills">
        <LabeledPill label="Genre" value={report.genre.value} />
        <LabeledPill label="Tone" value={report.tone.value} />
      </div>
      {@render sourced('Coverage logline', report.logline)}
      {@render sourced('Coverage synopsis', report.synopsis)}
      {#if report.structure.pacingNotes?.value}{@render sourced('Pacing', report.structure.pacingNotes)}{/if}
      {@render list('Strengths', report.assessment.strengths.value)}
      {@render list('Concerns', report.assessment.concerns.value)}
      {@render sourced('Notes', report.assessment.notes)}
      <InspectorSection title="Rubric" count={report.rubric.dimensions.length} uiId="story.overview.rubric">
        {#each report.rubric.dimensions as d (d.name)}
          <PropertyRow label={d.name} value={d.score.source === 'none' ? 'No score' : `${d.score.value} / 10`} />
          {#if d.summary?.value}<p class="ui-story-overview__detail">{d.summary.value}</p>{/if}
        {/each}
      </InspectorSection>
      <InspectorSection title="Characters" count={characters.length} uiId="story.overview.characters">
        <MeasureTable
          rows={characters}
          labelKey="name"
          sortKey=""
          measures={[{ key: 'sceneCount', label: 'Scenes' }, { key: 'dialogueWeight', label: 'Dialogue weight', format: (v) => `${Math.round(v * 100)}%` }]}
          selectedKey={selected?.kind === 'character' ? characters[selected.index]?.name : undefined}
          onSelect={(row) => onselect?.({ kind: 'character', index: row.index })} />
      </InspectorSection>
      <InspectorSection title="Production" uiId="story.overview.production">
        {#if !flags}
          {@render line("Khaos couldn't read this coverage's production notes.")}
        {:else}
          <PropertyRow label="Locations" value={report.viability.uniqueLocations} />
          <PropertyRow label="Cast size" value={report.viability.castSize} />
          <PropertyRow label="Speaking roles" value={report.viability.speakingRoles} />
          <PropertyRow label="Complexity" value={report.viability.complexityTier?.value} />
          {#if flags.contained}
            <div class="ui-story-overview__sourced" title={flags.contained.evidence?.[0]?.citation ?? ''}>
              <p>Scenes in the three main places: {Math.round(flags.contained.value * 100)}%</p>
              {#if sourceLabel(flags.contained)}<StatusPill text={sourceLabel(flags.contained)} />{/if}
            </div>
          {/if}
          <p class="ui-story-overview__label">Flagged</p>
          {#if flags.raised.length}
            <div class="ui-story-overview__pills">{#each flags.raised as f (f)}<StatusPill text={f} tone="warning" />{/each}</div>
          {:else}
            {@render line('Nothing flagged.')}
          {/if}
        {/if}
      </InspectorSection>
      {#if advanced && report.warnings?.length}
        <InspectorSection title="Show details" collapsed uiId="story.overview.coverage-details">
          <ul class="ui-story-overview__list">{#each report.warnings as w, i (i)}<li>{w}</li>{/each}</ul>
        </InspectorSection>
      {/if}
    {/if}
    {@render run('coverage')}
  </InspectorSection>

  <InspectorSection title="Journeys" uiId="story.overview.journeys">
    {#if journeys.kind === 'loading'}{@render line(LOADING)}
    {:else if journeys.kind === 'missing' || (journeyList && !journeyList.length)}{@render line('No character journeys yet.', journeys.kind === 'missing' ? journeys.reason : '')}
    {:else if journeys.kind === 'failed' || !journeyList}{@render line("Khaos couldn't read this story's journeys.", journeys.kind === 'failed' ? journeys.message : '')}
    {:else}
      {#each journeyList as j, i (j.character.id)}
        <SelectableRow title={journeyName(j.character)} subtitle="Ends: {j.journey.final_state}" selected={selected?.kind === 'journey' && selected.index === i} onclick={() => onselect?.({ kind: 'journey', index: i })}>
          {#snippet trailing()}<StatusPill text={ARCS[j.journey.arc_quality]} />{/snippet}
        </SelectableRow>
      {/each}
    {/if}
  </InspectorSection>

  <InspectorSection title="Relationships" uiId="story.overview.relationships">
    {#if relationships.kind === 'loading'}{@render line(LOADING)}
    {:else if relationships.kind === 'missing' || (pairList && !pairList.length)}{@render line('No relationships have been read yet.', relationships.kind === 'missing' ? relationships.reason : '')}
    {:else if relationships.kind === 'failed' || !pairList}{@render line("Khaos couldn't read this story's relationships.", relationships.kind === 'failed' ? relationships.message : '')}
    {:else}
      {#each readPairs as r (r.pairKey)}
        <SelectableRow title={pairName(r.characters)} subtitle={r.analysis.synthesis.trajectory} selected={selected?.kind === 'relationship' && selected.index === r.index} onclick={() => onselect?.({ kind: 'relationship', index: r.index })}>
          {#snippet trailing()}<StatusPill text={r.analysis.synthesis.relationship_type} />{/snippet}
        </SelectableRow>
      {:else}
        {@render line('No pair of characters shares enough scenes to read yet.')}
      {/each}
      {#if advanced && skippedPairs.length}
        <InspectorSection title="Show details" collapsed uiId="story.overview.relationships-details">
          <ul class="ui-story-overview__list">{#each skippedPairs as r (r.pairKey)}<li>{pairName(r.characters)}: {r.analysis.skip.reason}</li>{/each}</ul>
        </InspectorSection>
      {/if}
    {/if}
  </InspectorSection>
</div>

<style>
  .ui-story-overview {
    max-width: 760px;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  .ui-story-overview__made,
  .ui-story-overview__label,
  .ui-story-overview__detail {
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .ui-story-overview__line,
  .ui-story-overview__detail,
  .ui-story-overview__label {
    margin: var(--spacing-xs) 0;
  }
  .ui-story-overview__headline {
    margin: 0 0 var(--spacing-xs);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
  .ui-story-overview__sourced {
    margin: var(--spacing-xs) 0 var(--spacing-sm);
  }
  .ui-story-overview__sourced p {
    margin: 0 0 var(--spacing-2xs);
    white-space: pre-line;
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
  .ui-story-overview__sourced .ui-story-overview__label {
    font-size: var(--caption-size);
  }
  .ui-story-overview__note {
    margin: var(--spacing-xs) 0;
    font-size: var(--caption-size);
    color: var(--tone-info);
  }
  .ui-story-overview__run {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2xs);
    margin: var(--spacing-xs) 0;
  }
  .ui-story-overview__verdict {
    display: inline-flex;
  }
  .ui-story-overview__metrics,
  .ui-story-overview__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin: var(--spacing-sm) 0;
  }
  .ui-story-overview__list {
    margin: 0;
    padding-left: var(--spacing-md);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
</style>
