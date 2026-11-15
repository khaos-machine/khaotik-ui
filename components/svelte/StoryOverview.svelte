<script>
  // The story-wide analyses as one document: the premise, the story's shape and where it turns,
  // and the coverage report. Each section is drawn from its own read, so one failing or missing
  // never blanks the others. Values are shown as the engine sent them; the closed label maps in
  // lib/story-overview.js are presentation, and a value outside them fails its section, except an
  // unfinished section the protocol does not declare, which is shown exactly as sent.
  import Button from './Button.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import MeasureTable from './MeasureTable.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import SelectableRow from './SelectableRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { ARCS, MEASURED, OUTCOMES, VERDICTS, coverageReads, incompleteLabel, journeyName, journeysRead, listItems, namedPoints, pairName, productionFlags, relationshipsRead, shapeReads, timelineTurns, fittingLenses, pacing, journeyLanes, relationshipGraph, rubricRadar } from './lib/story-overview.js'
  import StoryTimeline from './internal/StoryTimeline.svelte'
  import RubricRadar from './internal/RubricRadar.svelte'
  import RelationshipGraph from './internal/RelationshipGraph.svelte'
  import JourneyLanes from './internal/JourneyLanes.svelte'
  import { dollars } from './lib/budget.js'

  /** @typedef {import('./lib/story-overview.js').Sourced} Sourced */
  /** @typedef {import('./lib/story-overview.js').OverviewSelection} OverviewSelection */
  /** @typedef {'structure' | 'structureNaming' | 'coverage' | 'premise'} Pass */
  /** @typedef {{ paid: boolean, maxCalls?: number }} Offer */
  /**
   * @typedef {{ kind: 'none' } | ({ kind: 'offer' } & Offer) | { kind: 'needs-budget' } | { kind: 'running', paid?: boolean, progress?: string } | { kind: 'blocked', reason: string } | { kind: 'budget-reached', usd?: string, spentUsd?: string, maxCalls?: number } | { kind: 'failed', message: string, offer?: Offer } | { kind: 'done', totals?: readonly { attempts: number, provider: string, model: string }[], maxCalls?: number }} Run
   */
  /**
   * A list section's pass: partial when some results are saved and the pass is not done, failed when it
   * stopped on an error. Running and none are accepted so one runs object serves the outline too; the
   * outline shows running.
   * @typedef {{ kind: 'none' } | { kind: 'running' } | { kind: 'partial' } | { kind: 'failed', message?: string }} ListRun
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
   * @property {OverviewSelection | null} [selected] The selected turn, character, journey or relationship, including skipped pairs.
   * @property {(item: OverviewSelection) => void} [onselect] Reports the selected entity's original list index.
   * @property {{ premise?: Run, structure?: Run, coverage?: Run, journeys?: ListRun, relationships?: ListRun }} [runs] Each section's run action, one click each; the story budget bounds paid runs, so nothing asks first. Journeys and relationships have no action: their run only says when the pass is partial or failed, beside whatever was saved.
   * @property {(pass: Pass) => void} [onrun] Starts a pass: `structure` (free), `structureNaming`, `coverage` or `premise`.
   * @property {() => void} [onsetbudget] Opens this story's budget.
   * @property {boolean} [showSkippedPairs] Skipped pairs as selectable rows with their reasons, outside Advanced. Off: they are listed only under Advanced's Show details, as in 0.178.5.
   * @property {boolean} [showStructureActs] The structure's acts in Shape.
   * @property {boolean} [showCoverageActs] Coverage's acts.
   * @property {boolean} [showSceneEntries] Coverage's scene entries.
   * @property {boolean} [showMeasuredStructure] Coverage's Structure measured section.
   * @property {boolean} [showPassStates] A partial or failed journeys or relationships pass (`runs.journeys`, `runs.relationships`), and failed turn naming, each said in its section.
   * @property {readonly string[]} [sceneOrder] Every scene id in story order, so the journeys can be drawn across the story. Empty: the Journeys card shows its arc count only.
   * @property {(sceneId: string) => void} [onRevealScene] Asked with an evidence scene's id from the chosen journey's or pair's detail in its card.
   * @property {boolean} [showEvidenceScenes] Every evidence scene in that detail, as StoryOverviewSide takes it. Off: a journey turning point reveals its first scene only.
   * @property {boolean} [showEmptyResults] Says when nothing was scored or named: "No dimension was scored.", a lens's "Not scored", "No turning points were named.". Off: those parts draw nothing, or "haven't been named yet", as in 0.178.5.
   */

  /** @type {Props} */
  let { title = '', premise = { kind: 'loading' }, structure = { kind: 'loading' }, coverage = { kind: 'loading' }, journeys = { kind: 'loading' }, relationships = { kind: 'loading' }, advanced = false, selected = null, onselect = undefined, runs = {}, onrun = undefined, onsetbudget = undefined, showSkippedPairs = false, showStructureActs = false, showCoverageActs = false, showSceneEntries = false, showMeasuredStructure = false, showPassStates = false, showEmptyResults = false, sceneOrder = [], onRevealScene = undefined, showEvidenceScenes = false } = $props()

  const LOADING = "Reading this story's analyses…"
  /** @param {Sourced | undefined} f */
  const sourceLabel = (f) => (!f || f.source === 'none' ? '' : f.source === 'llm' ? (advanced ? `AI · ${f.confidence}` : 'AI') : 'Counted')

  const shape = $derived(structure.kind === 'loaded' && shapeReads(structure.data) ? structure.data : null)
  // Off, named with no points reads as not named yet, as 0.178.5 drew it.
  const points = $derived(showEmptyResults ? namedPoints(shape) : shape?.names?.state === 'named' ? shape.names.points : null)
  const turns = $derived(timelineTurns(shape))

  const report = $derived(coverage.kind === 'loaded' && coverageReads(coverage.data) ? /** @type {import('./lib/story-overview.js').StoryCoverage} */ (coverage.data) : null)
  const flags = $derived(productionFlags(report))
  const characters = $derived((report?.characters ?? []).map((/** @type {Record<string, any>} */ c, /** @type {number} */ index) => ({ index, name: c.name, sceneCount: c.sceneCount, dialogueWeight: c.dialogueWeight?.value })))
  const journeyList = $derived(journeys.kind === 'loaded' && journeysRead(journeys.data) ? journeys.data : null)
  const pairList = $derived(relationships.kind === 'loaded' && relationshipsRead(relationships.data) ? relationships.data : null)
  const readPairs = $derived((pairList ?? []).map((/** @type {Record<string, any>} */ r, /** @type {number} */ index) => ({ ...r, index })).filter((r) => r.analysis.synthesis))
  const pairGraph = $derived(relationshipGraph(pairList ?? []))
  /** The pair whose detail the Relationships card shows, by its index in the list; -1 shows the stats. */
  let shownPair = $state(-1)
  const togglePair = (/** @type {number} */ index) => (shownPair = shownPair === index ? -1 : index)
  /** A row in the drawer: choose its pair, then bring the panel showing it into view. @param {number} index */
  function showRow(index) {
    togglePair(index)
    document.getElementById(`${uid}-pair`)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }
  const lanes = $derived(journeyList ? journeyLanes(journeyList, sceneOrder) : [])
  /** The journey whose detail the Journeys card shows, by its index in the list; -1 shows the stats. */
  let shownJourney = $state(-1)
  const toggleJourney = (/** @type {number} */ index) => (shownJourney = shownJourney === index ? -1 : index)
  // Operator, 2026-11-14: "hide unfinished by default"; the Arcs stat's unfinished count shows them.
  let showUnfinished = $state(false)
  const drawnLanes = $derived(showUnfinished ? lanes : lanes.filter((l) => l.arc !== 'incomplete'))
  const unfinishedCount = $derived((journeyList ?? []).filter((j) => j.journey.arc_quality === 'incomplete').length)
  /** A row in the drawer: choose its journey, showing its lane if hidden, then bring the panel showing it into view. @param {number} index */
  function showJourneyRow(index) {
    if (journeyList?.[index]?.journey.arc_quality === 'incomplete') showUnfinished = true
    toggleJourney(index)
    document.getElementById(`${uid}-journey`)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }
  const mostTurns = $derived(lanes.reduce((/** @type {import('./lib/story-overview.js').JourneyLane | null} */ a, l) => (!a || l.points.length > a.points.length ? l : a), null))
  const longest = $derived(lanes.reduce((/** @type {import('./lib/story-overview.js').JourneyLane | null} */ a, l) => (!a || l.to - l.from > a.to - a.from ? l : a), null))
  /** The cards whose list opens as a drawer inside them, toggled at their foot. */
  const DRAWERS = ['journeys', 'relationships']
  /** The read pair with the most evidence scenes. */
  const strongest = $derived(pairGraph.edges.reduce((/** @type {import('./lib/story-overview.js').GraphEdge | null} */ a, e) => (!a || e.scenes > a.scenes ? e : a), null))
  const skippedPairs = $derived((pairList ?? []).map((/** @type {Record<string, any>} */ r, /** @type {number} */ index) => ({ ...r, index })).filter((r) => r.analysis.skip))
  /** @typedef {'coverage' | 'characters' | 'production' | 'journeys' | 'relationships'} Panel */
  /** The panels in grid order, by their titles; the titles the outline names them by. @type {Readonly<Record<Panel, string>>} */
  const PANELS = { coverage: 'Coverage', characters: 'Characters', production: 'Production', journeys: 'Journeys', relationships: 'Relationships' }
  /** The panel whose detail is open beneath the grid; one at a time. */
  let open = $state(/** @type {Panel | null} */ (null))
  const uid = $props.id()
  /** Whether a panel has more than its summary to show. */
  const hasDetail = $derived({
    coverage: !!report,
    characters: characters.length > 0,
    production: !!(report && flags),
    journeys: !!journeyList?.length,
    relationships: !!pairList?.length && (readPairs.length > 0 || showSkippedPairs || advanced),
  })
  /** The characters' summary: the five with the most dialogue. */
  const topCharacters = $derived([...characters].sort((a, b) => (b.dialogueWeight ?? 0) - (a.dialogueWeight ?? 0)).slice(0, 5))
  const topWeight = $derived(topCharacters[0]?.dialogueWeight ?? 0)
  /** The journeys' summary: how many of each arc, in the arcs' order, e.g. "2 complete arcs · 1 unfinished arc". */
  const arcCounts = $derived(
    Object.keys(ARCS)
      .map((arc) => ({ arc, n: (journeyList ?? []).filter((j) => j.journey.arc_quality === arc).length, label: ARCS[arc].toLowerCase() }))
      .filter((a) => a.n > 0)
      .map((a) => ({ arc: a.arc, text: `${a.n} ${a.label}${a.n === 1 ? '' : 's'}` })),
  )
  const arcTally = $derived(arcCounts.map((a) => a.text).join(' · '))
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

{#snippet fact(/** @type {string} */ label, /** @type {string | number} */ value)}
  <div class="ui-story-overview__fact" role="group" aria-label={label}><span class="ui-story-overview__label">{label}</span> {value}</div>
{/snippet}

{#snippet none(/** @type {string} */ text, /** @type {string} */ detail = '')}
  <p class="ui-story-overview__none">{text}{#if detail}<span>{detail}</span>{/if}</p>
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
    <Button onclick={() => onsetbudget?.()}>Change budget…</Button>
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

{#snippet pass(/** @type {'journeys' | 'relationships'} */ section)}
  {@const r = showPassStates ? runs[section] : undefined}
  {#if r?.kind === 'partial'}
    <p class="ui-story-overview__note" role="note">This pass hasn't finished, so some results are missing.</p>
  {:else if r?.kind === 'failed'}
    {@render line("This analysis didn't finish.", r.message)}
  {/if}
{/snippet}

<!-- Operator, 2026-11-14: "Buttons in the card": the chosen journey or pair opens its evidence scenes
     from the card, as the inspector did. -->
{#snippet scenes(/** @type {readonly string[] | undefined} */ ids)}
  {#if ids?.length}
    <div class="ui-story-overview__scenes">
      {#each ids as sceneId, i (`${sceneId}:${i}`)}
        <Button variant="secondary" icon="film-slate" onclick={() => onRevealScene?.(sceneId)}>Show in Scenes{ids.length > 1 ? ` · ${i + 1}` : ''}</Button>
      {/each}
    </div>
  {/if}
{/snippet}

{#snippet entries(/** @type {string} */ name, /** @type {readonly { text: string, scenes: readonly string[] }[]} */ items)}
  {#if items.length}
    <InspectorSection title={name} count={items.length}>
      {#each items as e, i (i)}<p class="ui-story-overview__line">{e.text}</p>{@render scenes(e.scenes)}{/each}
    </InspectorSection>
  {/if}
{/snippet}

{#snippet evidenceScenes(/** @type {readonly string[] | undefined} */ ids)}
  {#if showEvidenceScenes && ids?.length}
    <InspectorSection title="Evidence scenes" count={ids.length}>{@render scenes(ids)}</InspectorSection>
  {/if}
{/snippet}

{#snippet list(/** @type {string} */ name, /** @type {readonly string[]} */ items)}
  {#if items.length}
    <InspectorSection title={name} count={items.length}>
      <ul class="ui-story-overview__list">{#each items as item, i (i)}<li>{item}</li>{/each}</ul>
    </InspectorSection>
  {/if}
{/snippet}

<div class="ui-story-overview__host"><div class="ui-story-overview">
  <SectionHeader eyebrow="Story" {title}>
    {#snippet trailing()}
      {#if report}<span class="ui-story-overview__verdict" title={report.rubric.verdict.evidence?.[0]?.citation ?? ''}><StatusPill text={VERDICTS[report.rubric.verdict.value].text} tone={VERDICTS[report.rubric.verdict.value].tone} /></span>{/if}
      {#if madeOn}<span class="ui-story-overview__made">Coverage made {madeOn}</span>{/if}
    {/snippet}
  </SectionHeader>

  <!-- The header's body: the logline, the story's numbers, the synopsis folded. -->
  <section class="ui-story-overview__premise" aria-label="Premise" data-ui-id="story.overview.premise">
    {#if premise.kind === 'loading'}{@render none(LOADING)}
    {:else if premise.kind === 'missing'}{@render none('This story has no premise yet.', premise.reason)}
    {:else if premise.kind === 'failed'}{@render line(premise.message)}
    {:else}
      {@render sourced('', premise.data.logline)}
    {/if}
    {#if report}
      <div class="ui-story-overview__facts">
        {@render fact('Genre', report.genre.value)}
        {@render fact('Tone', report.tone.value)}
        {@render fact('Runtime', `${Math.round(report.structure.estimatedRuntimeMs.value / 60000)} min`)}
        {@render fact('Pages', report.structure.pageCount.value)}
        {@render fact('Scenes', report.structure.sceneCount.value)}
      </div>
    {/if}
    {#if premise.kind === 'loaded'}
      <InspectorSection title="Synopsis" collapsed>{@render sourced('', premise.data.synopsis)}</InspectorSection>
    {/if}
    {@render run('premise')}
  </section>

  <InspectorSection title="Shape" uiId="story.overview.shape">
    {#if structure.kind === 'loading'}{@render none(LOADING)}
    {:else if structure.kind === 'missing'}{@render none("This story's shape hasn't been measured yet.", structure.reason)}
    {:else if structure.kind === 'failed' || !shape}{@render line("Khaos couldn't read this story's shape.", structure.kind === 'failed' ? structure.message : '')}
    {:else}
      <p class="ui-story-overview__headline">{shape.fit.reason}</p>
      <StatusPill text={OUTCOMES[shape.fit.outcome]} tone="info" />
      {#if turns}
        <StoryTimeline {turns} lenses={fittingLenses(shape)} pacing={pacing(turns)} selected={selected?.kind === 'turn' ? selected.index : -1} onselect={(index) => onselect?.({ kind: 'turn', index })} />
      {/if}
      {#if showStructureActs && shape.acts?.length}
        <InspectorSection title="Acts" count={shape.acts.length} uiId="story.overview.shape.acts">
          {#each shape.acts as act (act)}
            <InspectorSection title={act.name}>
              <PropertyRow label="Scene indices (inclusive)" value="{act.startIndex}–{act.endIndex}" />
              <PropertyRow label="Word share" value="{Math.round(act.fraction * 100)}%" />
            </InspectorSection>
          {/each}
        </InspectorSection>
      {/if}
      {#if showEmptyResults ? points?.length : points}
        <!-- Folded under the timeline, which draws these same turns (operator, 2026-11-10: "Fold it"). -->
        <InspectorSection title="Where the story turns" count={points.length} collapsed={!!turns} uiId="story.overview.turns">
          {#each points as p, i (i)}
            <SelectableRow title={p.name} subtitle={p.turn} selected={selected?.kind === 'turn' && selected.index === i} onclick={() => onselect?.({ kind: 'turn', index: i })} />
          {/each}
        </InspectorSection>
      {:else if points}
        {@render line('No turning points were named.')}
      {:else if showPassStates && shape.names?.state === 'failed'}
        {@render line("Naming the turning points didn't finish.")}
      {:else}
        {@render line("The turning points haven't been named yet.")}
      {/if}
      {#if advanced}
        <InspectorSection title="Show details" collapsed uiId="story.overview.shape-details">
          {#each shape.fit.lenses as l (l.id)}
            {#if showEmptyResults}<PropertyRow label={l.id} value={[l.score === undefined ? '' : `score ${l.score.toFixed(2)}`, l.p === undefined ? '' : `p ${l.p.toFixed(3)}`].filter(Boolean).join(' · ') || 'Not scored'} />
            {:else if l.score !== undefined && l.p !== undefined}<PropertyRow label={l.id} value="score {l.score.toFixed(2)} · p {l.p.toFixed(3)}" />{/if}
          {/each}
          {#if shape._provenance?.made_by?.model}<PropertyRow label="Turns named by" value={shape._provenance.made_by.model} />{/if}
        </InspectorSection>
      {/if}
    {/if}
    {@render run('structure')}
  </InspectorSection>

  <!-- The panels: a summary each; "Show all" opens one panel's full detail beneath the grid
       (operator, 2026-11-10: "Header, band, grid", "Expand in place"). Each keeps the data-ui-id
       a host's outline jumps to. -->
  <div class="ui-story-overview__grid">
    {@render panel('coverage', report ? coverageSummary : coverageAbsent)}
    {@render panel('characters', report ? charactersSummary : fromCoverage)}
    {@render panel('production', report ? productionSummary : fromCoverage)}
    {@render panel('journeys', journeysSummary)}
    {@render panel('relationships', relationshipsSummary)}
  </div>

  {#if open && !DRAWERS.includes(open) && hasDetail[open]}
    <section id="{uid}-{open}" class="ui-story-overview__expanded" aria-label={PANELS[open]}>
      <h3 class="ui-story-overview__panel-title">{PANELS[open]}</h3>
      {#if open === 'coverage'}{@render coverageDetail()}
      {:else if open === 'characters'}{@render charactersDetail()}
      {:else if open === 'production'}{@render productionDetail()}
      {:else if open === 'journeys'}{@render journeysDetail()}
      {:else}{@render relationshipsDetail()}{/if}
    </section>
  {/if}
</div></div>

{#snippet panel(/** @type {Panel} */ id, /** @type {import('svelte').Snippet} */ summary)}
  <div class="ui-story-overview__panel ui-story-overview__panel--{id}" class:ui-story-overview__panel--open={open === id} role="group" aria-label={PANELS[id]} data-ui-id="story.overview.{id}">
    <div class="ui-story-overview__panel-head">
      <h3 class="ui-story-overview__panel-title">{PANELS[id]}</h3>
      {#if hasDetail[id] && !DRAWERS.includes(id)}
        <button type="button" class="ui-story-overview__more" aria-label="Show all: {PANELS[id]}" aria-expanded={open === id} aria-controls="{uid}-{id}" onclick={() => (open = open === id ? null : id)}>Show all</button>
      {/if}
    </div>
    {@render summary()}
    <!-- Operator, 2026-11-14: the list is part of the Relationships card, a drawer Show all opens and closes, closed by default. -->
    {#if DRAWERS.includes(id) && open === id}<div id="{uid}-{id}" class="ui-story-overview__drawer" role="region" aria-label={PANELS[id]}>{#if id === 'journeys'}{@render journeysDetail()}{:else}{@render relationshipsDetail()}{/if}</div>{/if}
    <!-- Operator, 2026-11-14: its toggle sits at the bottom of the card and says what it will do. -->
    {#if DRAWERS.includes(id) && hasDetail[id]}
      <button type="button" class="ui-story-overview__more ui-story-overview__more--foot" aria-label="{open === id ? 'Hide all' : 'Show all'}: {PANELS[id]}" aria-expanded={open === id} aria-controls="{uid}-{id}" onclick={() => (open = open === id ? null : id)}>{open === id ? 'Hide all' : 'Show all'}</button>
    {/if}
  </div>
{/snippet}

{#snippet coverageAbsent()}
  {#if coverage.kind === 'loading'}{@render none(LOADING)}
  {:else if coverage.kind === 'missing'}{@render none("There's no coverage for this story yet.", coverage.reason)}
  {:else}{@render line(coverage.kind === 'failed' ? coverage.message : "Khaos couldn't read this story's coverage.")}{/if}
  <!-- With no coverage to open, its run is the panel's whole point, so it is not behind Show all. -->
  {@render run('coverage')}
{/snippet}

<!-- Characters and Production come from coverage: they say its state, and leave its message and its
     action to the Coverage panel rather than repeating them. -->
{#snippet fromCoverage()}
  {#if coverage.kind === 'loading'}{@render none(LOADING)}
  {:else if coverage.kind === 'missing'}{@render none("There's no coverage for this story yet.")}
  {:else}{@render line("Khaos couldn't read this story's coverage.")}{/if}
{/snippet}

{#snippet coverageSummary()}
  {@const dimensions = report?.rubric.dimensions ?? []}
  <!-- Operator, 2026-11-10: "Coverage as a chart", then "Radar" — bars made it "indifferent
       from Characters panel". -->
  {#if dimensions.length}
    <RubricRadar spokes={rubricRadar(dimensions)} />
  {:else if showEmptyResults}
    {@render none('No dimension was scored.')}
  {/if}
{/snippet}

{#snippet coverageDetail()}
  {#if report}
    {#if report.incompleteSections?.length}<p class="ui-story-overview__note" role="note">Part of this coverage wasn't finished: {report.incompleteSections.map(incompleteLabel).join(', ')}.</p>{/if}
    {@render sourced('Coverage logline', report.logline)}
    {@render sourced('Coverage synopsis', report.synopsis)}
    {#if report.structure.pacingNotes?.value}{@render sourced('Pacing', report.structure.pacingNotes)}{/if}
    {@render list('Strengths', listItems(report.assessment.strengths))}
    {@render list('Concerns', listItems(report.assessment.concerns))}
    {@render sourced('Notes', report.assessment.notes)}
    {#if showEmptyResults || report.rubric.dimensions}
      {@const dimensions = report.rubric.dimensions ?? []}
      <InspectorSection title="Rubric" count={dimensions.length} uiId="story.overview.rubric">
        {#each dimensions as d (d.name)}
          <PropertyRow label={d.name} value={d.score.source === 'none' ? 'No score' : `${d.score.value} / 10`} />
          {#if d.summary?.value}<p class="ui-story-overview__detail">{d.summary.value}</p>{/if}
        {:else}
          {#if showEmptyResults}{@render none('No dimension was scored.')}{/if}
        {/each}
      </InspectorSection>
    {/if}
    {#if showMeasuredStructure && report.structure.measured}
      {@const m = report.structure.measured}
      <InspectorSection title="Structure measured" uiId="story.overview.coverage.measured">
        {#if Object.hasOwn(MEASURED, m.outcome)}
          <StatusPill text={MEASURED[m.outcome]} tone="info" />
          {@render line(m.reason)}
          {#if m.document}<PropertyRow label="Read from" value={m.document} />{/if}
        {:else}
          {@render line("Khaos couldn't read how this story's structure was measured.")}
        {/if}
      </InspectorSection>
    {/if}
    {#if showCoverageActs && report.structure.acts?.length}
      <InspectorSection title="Acts" count={report.structure.acts.length} uiId="story.overview.coverage.acts">
        {#each report.structure.acts as act (act)}
          <InspectorSection title={act.name}>
            {#if act.percentage !== undefined}<PropertyRow label="Word share" value="{Math.round(act.percentage * 100)}%" />{/if}
            {#if act.sceneCount !== undefined}<PropertyRow label="Scenes" value={act.sceneCount} />{/if}
            {#if act.durationMs !== undefined}<PropertyRow label="Runtime" value="{act.durationMs / 60000} min" />{/if}
          </InspectorSection>
        {/each}
      </InspectorSection>
    {/if}
    {#if showSceneEntries && report.scenes?.length}
      <InspectorSection title="Scene entries" count={report.scenes.length} uiId="story.overview.coverage.scenes">
        {#each report.scenes as scene (scene)}
          <InspectorSection title={scene.slugline}>
            {#if scene.index !== undefined}<PropertyRow label="Scene index" value={scene.index} />{/if}
            {@render sourced('Summary', scene.summary)}
            {@render sourced('Narrative role', scene.narrativeRole)}
            {#if scene.characters?.length}<PropertyRow label="Characters" value={scene.characters.join(', ')} />{/if}
            <PropertyRow label="Runtime" value="{scene.durationMs.value / 60000} min" source={sourceLabel(scene.durationMs)} />
          </InspectorSection>
        {/each}
      </InspectorSection>
    {/if}
    {#if advanced && report.warnings?.length}
      <InspectorSection title="Show details" collapsed uiId="story.overview.coverage-details">
        <ul class="ui-story-overview__list">{#each report.warnings as w, i (i)}<li>{w}</li>{/each}</ul>
      </InspectorSection>
    {/if}
  {/if}
  {@render run('coverage')}
{/snippet}

{#snippet charactersSummary()}
  <ul class="ui-story-overview__picks">
    {#each topCharacters as c (c.index)}
      <li>
        <button type="button" class="ui-story-overview__pick" aria-label={c.name} aria-pressed={selected?.kind === 'character' && selected.index === c.index} onclick={() => onselect?.({ kind: 'character', index: c.index })}>
          <span>{c.name}</span>
          {#if c.dialogueWeight !== undefined}
            <!-- Operator, 2026-11-10: "Characters as a chart". The bar is drawn against the lead's
                 share; the percentage beside it carries the value for a screen reader. -->
            <span class="ui-story-overview__bar" aria-hidden="true" style:--share={topWeight ? c.dialogueWeight / topWeight : 0}></span>
            <span class="ui-story-overview__detail">{Math.round(c.dialogueWeight * 100)}%</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
  <p class="ui-story-overview__detail">{characters.length} {characters.length === 1 ? 'character' : 'characters'}</p>
{/snippet}

{#snippet charactersDetail()}
  <MeasureTable
    rows={characters}
    labelKey="name"
    sortKey=""
    measures={[{ key: 'sceneCount', label: 'Scenes' }, { key: 'dialogueWeight', label: 'Dialogue weight', format: (v) => `${Math.round(v * 100)}%` }]}
    selectedKey={selected?.kind === 'character' ? characters[selected.index]?.name : undefined}
    onSelect={(row) => onselect?.({ kind: 'character', index: row.index })} />
{/snippet}

{#snippet productionSummary()}
  {#if !flags || !report}
    {@render line("Khaos couldn't read this coverage's production notes.")}
  {:else}
    <PropertyRow label="Cast size" value={report.viability.castSize} />
    <PropertyRow label="Locations" value={report.viability.uniqueLocations} />
    <PropertyRow label="Complexity" value={report.viability.complexityTier?.value} />
    <p class="ui-story-overview__label">Flagged</p>
    {#if flags.raised.length}
      <div class="ui-story-overview__pills">{#each flags.raised as f (f)}<StatusPill text={f} tone="warning" />{/each}</div>
    {:else}
      {@render line('Nothing flagged.')}
    {/if}
  {/if}
{/snippet}

{#snippet productionDetail()}
  {#if flags && report}
    <PropertyRow label="Speaking roles" value={report.viability.speakingRoles} />
    {#if flags.contained}
      <div class="ui-story-overview__sourced" title={flags.contained.evidence?.[0]?.citation ?? ''}>
        <p>Scenes in the three main places: {Math.round(flags.contained.value * 100)}%</p>
        {#if sourceLabel(flags.contained)}<StatusPill text={sourceLabel(flags.contained)} />{/if}
      </div>
    {/if}
  {/if}
{/snippet}

{#snippet journeysSummary()}
  {@render pass('journeys')}
  {#if journeys.kind === 'loading'}{@render none(LOADING)}
  {:else if journeys.kind === 'missing' || (journeyList && !journeyList.length)}{@render none('No character journeys yet.', journeys.kind === 'missing' ? journeys.reason : '')}
  {:else if journeys.kind === 'failed' || !journeyList}{@render line("Khaos couldn't read this story's journeys.", journeys.kind === 'failed' ? journeys.message : '')}
  {:else if !lanes.length}
    <p class="ui-story-overview__line">{arcTally}</p>
  {:else}
    <!-- Operator, 2026-11-14: Journeys as Relationships: its own row, the lanes beside a panel that
         shows the stats by default and the chosen journey's detail. -->
    {@const shown = journeyList[shownJourney]}
    <div class="ui-story-overview__split ui-story-overview__split--wide">
      <div class="ui-story-overview__split-figure"><JourneyLanes lanes={drawnLanes} selected={shownJourney} onselect={toggleJourney} /></div>
      <div id="{uid}-journey" class="ui-story-overview__split-side" aria-live="polite">
        {#if shown}
          {@const j = shown.journey}
          <h4 class="ui-story-overview__pair-name">{journeyName(shown.character)}</h4>
          <StatusPill text={ARCS[j.arc_quality]} />
          {#each [['Starts', j.beginning_state], ['Changes', j.emotional_progression], ['Ends', j.final_state]] as [label, text] (label)}
            <div class="ui-story-overview__arc" role="group" aria-label={label}><span class="ui-story-overview__label">{label}</span><p class="ui-story-overview__line">{text}</p></div>
          {/each}
          {@render entries('Turning points', j.turning_points.map((/** @type {{ description: string, evidence_scene_ids?: string[] }} */ t) => ({ text: t.description, scenes: showEvidenceScenes ? (t.evidence_scene_ids ?? []) : (t.evidence_scene_ids ?? []).slice(0, 1) })))}
          {@render entries('Relationships', j.relationship_evolution.map((/** @type {{ counterpart: string, trajectory: string, evidence_scene_ids?: string[] }} */ r) => ({ text: `${r.counterpart}: ${r.trajectory}`, scenes: showEvidenceScenes ? (r.evidence_scene_ids ?? []) : [] })))}
          {@render evidenceScenes(j.evidence_scene_ids)}
        {:else}
          <div class="ui-story-overview__stats">
            {#if unfinishedCount}
              <PropertyRow label="Arcs">
                <span class="ui-story-overview__arcs">
                  {#each arcCounts as a, i (a.arc)}
                    {#if i}<span aria-hidden="true">·</span>{/if}
                    {#if a.arc === 'incomplete'}
                      <Button variant="secondary" title={showUnfinished ? 'Hide unfinished lanes' : 'Show unfinished lanes'} onclick={() => (showUnfinished = !showUnfinished)}>{a.text}</Button>
                    {:else}<span>{a.text}</span>{/if}
                  {/each}
                </span>
              </PropertyRow>
            {:else}<PropertyRow label="Arcs" value={arcTally} />{/if}
            <PropertyRow label="Journeys read" value={journeyList.length} />
            {#if mostTurns}<PropertyRow label="Most turning points" value="{mostTurns.name} · {mostTurns.points.length}" />{/if}
            {#if longest}<PropertyRow label="Longest journey" value={longest.name} />{/if}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/snippet}

{#snippet journeysDetail()}
  {#each journeyList ?? [] as j, i (j.character.id)}
    <SelectableRow title={journeyName(j.character)} subtitle="Ends: {j.journey.final_state}" selected={shownJourney === i} onclick={() => showJourneyRow(i)}>
      {#snippet trailing()}<StatusPill text={ARCS[j.journey.arc_quality]} />{/snippet}
    </SelectableRow>
  {/each}
{/snippet}

{#snippet relationshipsSummary()}
  {@render pass('relationships')}
  {#if relationships.kind === 'loading'}{@render none(LOADING)}
  {:else if relationships.kind === 'missing' || (pairList && !pairList.length)}{@render none('No relationships have been read yet.', relationships.kind === 'missing' ? relationships.reason : '')}
  {:else if relationships.kind === 'failed' || !pairList}{@render line("Khaos couldn't read this story's relationships.", relationships.kind === 'failed' ? relationships.message : '')}
  {:else if readPairs.length}
    <!-- Operator, 2026-11-14: the card takes its own row, the graph beside a panel that shows the
         stats by default and the detail of the relationship once a line is chosen. -->
    {@const shown = [...readPairs, ...skippedPairs].find((r) => r.index === shownPair)}
    <div class="ui-story-overview__split">
      <div class="ui-story-overview__split-figure"><RelationshipGraph graph={pairGraph} selected={shownPair} onselect={togglePair} /></div>
      <div id="{uid}-pair" class="ui-story-overview__split-side" aria-live="polite">
        {#if shown?.analysis.skip}
          <h4 class="ui-story-overview__pair-name">{pairName(shown.characters)}</h4>
          <StatusPill text="Skipped" tone="skipped" />
          <p class="ui-story-overview__line">{shown.analysis.skip.reason}</p>
          <div class="ui-story-overview__stats">
            <PropertyRow label="Co-appearance weight" value={shown.analysis.skip.weight} />
            <PropertyRow label="Minimum weight" value={shown.analysis.skip.min_weight} />
          </div>
        {:else if shown}
          {@const s = shown.analysis.synthesis}
          <h4 class="ui-story-overview__pair-name">{pairName(shown.characters)}</h4>
          <StatusPill text={s.relationship_type} />
          <p class="ui-story-overview__line">{s.trajectory}</p>
          {#each [['Beginning', s.relationship_arc.beginning], ['Middle', s.relationship_arc.middle], ['End', s.relationship_arc.end]] as [label, text] (label)}
            <div class="ui-story-overview__arc" role="group" aria-label={label}><span class="ui-story-overview__label">{label}</span><p class="ui-story-overview__line">{text}</p></div>
          {/each}
          {@render entries('Turning points', s.turning_points.map((/** @type {{ scene_id: string, description: string }} */ t) => ({ text: t.description, scenes: [t.scene_id] })))}
          {@render list('Emotional dynamics', s.emotional_dynamics)}
          {@render list('Conflict patterns', s.conflict_patterns)}
          {@render evidenceScenes(s.evidence_scene_ids)}
        {:else}
          <div class="ui-story-overview__stats">
            <PropertyRow label="Pairs read" value={readPairs.length} />
            {#if skippedPairs.length}<PropertyRow label="Skipped" value={skippedPairs.length} />{/if}
            <PropertyRow label="Characters paired" value={pairGraph.nodes.length} />
            <PropertyRow label="Most connected" value="{pairGraph.nodes[0].name} · {pairGraph.nodes[0].pairs} {pairGraph.nodes[0].pairs === 1 ? 'pair' : 'pairs'}" />
            {#if strongest}<PropertyRow label="Most evidence" value="{strongest.name} · {strongest.scenes}" />{/if}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    {@render line('No pair of characters shares enough scenes to read yet.')}
  {/if}
{/snippet}

{#snippet relationshipsDetail()}
  {#each readPairs as r (r.pairKey)}
    <!-- The type is free text and often long, so it is the row's second line, not a pill; the trajectory is in the panel. -->
    <SelectableRow title={pairName(r.characters)} subtitle={r.analysis.synthesis.relationship_type} selected={shownPair === r.index} onclick={() => showRow(r.index)} />
  {/each}
  {#if showSkippedPairs && skippedPairs.length}
    <!-- Operator, 2026-11-14: skipped pairs out of the list, folded beneath it by default. -->
    <InspectorSection title="Skipped" count={skippedPairs.length} collapsed uiId="story.overview.relationships-skipped">
      {#each skippedPairs as r (r.pairKey)}
        <SelectableRow title={pairName(r.characters)} subtitle={r.analysis.skip.reason} selected={shownPair === r.index} onclick={() => showRow(r.index)} />
      {/each}
    </InspectorSection>
  {:else if advanced && skippedPairs.length}
    <InspectorSection title="Show details" collapsed uiId="story.overview.relationships-details">
      <ul class="ui-story-overview__list">{#each skippedPairs as r (r.pairKey)}<li>{pairName(r.characters)}: {r.analysis.skip.reason}</li>{/each}</ul>
    </InspectorSection>
  {/if}
{/snippet}

<style>
  /* Wide enough for the band and a row of panels on a desktop pane; a document column was 760. */
  .ui-story-overview {
    max-width: 1280px;
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
  .ui-story-overview__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin: var(--spacing-sm) 0;
  }
  .ui-story-overview__premise {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }
  /* The story's numbers on one wrapping line, each labelled. */
  .ui-story-overview__facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2xs) var(--spacing-md);
    font-size: var(--body-md-size);
  }
  .ui-story-overview__fact .ui-story-overview__label {
    margin: 0;
  }
  /* As many panels to a row as fit at a readable width; one column on a phone. */
  .ui-story-overview__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--spacing-2xl) * 5), 1fr));
    gap: var(--spacing-sm);
  }
  /* Relationships takes a row of its own: the graph, and beside it the stats or the chosen pair. */
  .ui-story-overview__arcs {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-2xs);
  }
  .ui-story-overview__panel--journeys,
  .ui-story-overview__panel--relationships {
    grid-column: 1 / -1;
  }
  .ui-story-overview__split {
    display: grid;
    grid-template-columns: minmax(0, 460px) minmax(0, 1fr);
    gap: var(--spacing-md);
    align-items: start;
  }
  /* Lanes read across the story, so they take the wider share. */
  .ui-story-overview__split--wide {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  }
  .ui-story-overview__drawer {
    margin-top: var(--spacing-xs);
    padding-top: var(--spacing-xs);
    border-top: var(--size-stroke-hairline) solid var(--border-default);
  }
  .ui-story-overview__split-side {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2xs);
    min-width: 0;
  }
  .ui-story-overview__stats {
    align-self: stretch;
  }
  .ui-story-overview__pair-name {
    margin: 0;
    font-size: var(--body-md-size);
    font-weight: var(--label-md-weight);
    color: var(--text-primary);
  }
  .ui-story-overview__arc .ui-story-overview__label {
    display: block;
    margin: var(--spacing-2xs) 0 0;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .ui-story-overview__arc .ui-story-overview__line {
    margin: 0;
  }
  /* On a narrow panel the stats or pair sit under the graph. */
  @container (max-width: 640px) {
    .ui-story-overview__split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .ui-story-overview__panel,
  .ui-story-overview__expanded {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    padding: var(--spacing-sm);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
  }
  .ui-story-overview__panel--open {
    border-color: var(--text-secondary);
  }
  .ui-story-overview__panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-xs);
  }
  .ui-story-overview__panel-title {
    margin: 0;
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    font-weight: var(--label-md-weight);
    color: var(--text-primary);
  }
  .ui-story-overview__more--foot {
    align-self: center;
    margin-top: var(--spacing-xs);
  }
  .ui-story-overview__more {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    color: var(--text-secondary);
    cursor: pointer;
  }
  .ui-story-overview__more:hover,
  .ui-story-overview__more[aria-expanded='true'] {
    color: var(--text-primary);
  }
  .ui-story-overview__more:focus-visible,
  .ui-story-overview__pick:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: 2px;
  }
  .ui-story-overview__picks {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* Name, bar, percentage: the bars share one track width so their lengths compare. */
  .ui-story-overview__pick {
    display: grid;
    grid-template-columns: calc(var(--spacing-2xl) * 2) 1fr auto;
    align-items: center;
    width: 100%;
    gap: var(--spacing-xs);
    padding: var(--spacing-2xs) 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: var(--body-md-size);
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
  }
  .ui-story-overview__pick > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ui-story-overview__pick .ui-story-overview__detail {
    margin: 0;
    text-align: right;
  }
  .ui-story-overview__bar {
    height: var(--spacing-xs);
    width: calc(var(--share) * 100%);
    border-radius: var(--radius-sm);
    background: var(--text-secondary);
  }
  .ui-story-overview__pick[aria-pressed='true'] .ui-story-overview__bar {
    background: var(--text-primary);
  }
  .ui-story-overview__pick[aria-pressed='true'] {
    font-weight: var(--label-md-weight);
  }
  .ui-story-overview__scenes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }
  .ui-story-overview__list {
    margin: 0;
    padding-left: var(--spacing-md);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
  /* A section with nothing yet says so in one quiet line, so it takes less weight than one
     with content. */
  .ui-story-overview__none {
    margin: 0 0 var(--spacing-2xs);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .ui-story-overview__none span {
    display: block;
  }
  /* Phone width: the title is already in the window's bar, so the header keeps only its date,
     and the sections sit closer. */
  .ui-story-overview__host {
    container-type: inline-size;
  }
  @container (max-width: 599px) {
    .ui-story-overview {
      gap: 0;
    }
    .ui-story-overview :global(.section-header__text) {
      display: none;
    }
    .ui-story-overview :global(.section-header) {
      padding: var(--spacing-2xs) var(--spacing-xs) 0;
    }
    .ui-story-overview :global(.section__body) {
      padding: 0 var(--spacing-xs) var(--spacing-2xs);
    }
    .ui-story-overview :global(.section__toggle) {
      padding: 0 var(--spacing-xs);
    }
  }
</style>
