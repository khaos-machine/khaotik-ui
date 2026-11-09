<script>
  // The Overview's table pane: one row per section of StoryOverview, in document order, each with
  // its state. Choosing a row asks the host to show that section. The states restate each
  // section's own read; nothing is counted.
  import SelectableRow from './SelectableRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { coverageReads, journeysRead, namedPoints, productionFlags, relationshipsRead, shapeReads } from './lib/story-overview.js'

  /** @typedef {'premise' | 'shape' | 'turns' | 'coverage' | 'characters' | 'production' | 'journeys' | 'relationships'} OverviewSection */

  /**
   * @typedef {Object} Props
   * @property {import('./lib/story-overview.js').SectionRead<import('./lib/story-overview.js').StoryPremise>} [premise] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<import('./lib/story-overview.js').StoryStructure>} [structure] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<Record<string, any>>} [coverage] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [journeys] As StoryOverview takes it.
   * @property {import('./lib/story-overview.js').SectionRead<readonly Record<string, any>[]>} [relationships] As StoryOverview takes it.
   * @property {{ premise?: { kind: string }, structure?: { kind: string }, coverage?: { kind: string }, journeys?: { kind: string }, relationships?: { kind: string } }} [runs] Current section runs, as StoryOverview takes them; running overrides a previous result.
   * @property {OverviewSection | null} [current] The section shown.
   * @property {(section: OverviewSection) => void} [onjump] Asked with the section chosen.
   */

  /** @type {Props} */
  let { premise = { kind: 'loading' }, structure = { kind: 'loading' }, coverage = { kind: 'loading' }, journeys = { kind: 'loading' }, relationships = { kind: 'loading' }, runs = {}, current = null, onjump = undefined } = $props()

  /** @type {Record<string, { text: string, tone: 'success' | 'neutral' | 'danger' | 'info' | 'warning' }>} */
  const PILLS = { running: { text: 'Running', tone: 'info' }, incomplete: { text: 'Incomplete', tone: 'warning' }, ready: { text: 'Ready', tone: 'success' }, missing: { text: 'Not ready', tone: 'neutral' }, failed: { text: "Couldn't read", tone: 'danger' } }

  /**
   * @param {{ kind: string, data?: any }} read
   * @param {(data: any) => boolean} reads
   */
  const state = (read, reads) => (read.kind === 'loaded' ? (reads(read.data) ? 'ready' : 'failed') : read.kind === 'loading' ? '' : read.kind)

  /**
   * A list section: missing when it is empty, as the section says.
   * @param {{ kind: string, data?: any }} read
   * @param {(data: any) => boolean} reads
   */
  const listState = (read, reads) => (read.kind === 'loaded' && reads(read.data) && !read.data.length ? 'missing' : state(read, reads))

  const shape = $derived(state(structure, shapeReads))
  const cover = $derived(state(coverage, coverageReads) === 'ready' && coverage.kind === 'loaded' && coverage.data.incompleteSections?.length ? 'incomplete' : state(coverage, coverageReads))
  const rows = $derived([
    { id: 'premise', title: 'Premise', state: state(premise, () => true) },
    { id: 'shape', title: 'Shape', state: shape },
    { id: 'turns', title: 'Turns', state: shape === 'ready' ? (namedPoints(structure.kind === 'loaded' ? structure.data : null) ? 'ready' : 'missing') : shape },
    { id: 'coverage', title: 'Coverage', state: cover },
    { id: 'characters', title: 'Characters', state: cover },
    { id: 'production', title: 'Production', state: cover === 'ready' || cover === 'incomplete' ? (productionFlags(coverage.kind === 'loaded' ? coverage.data : null) ? cover : 'failed') : cover },
    { id: 'journeys', title: 'Journeys', state: listState(journeys, journeysRead) },
    { id: 'relationships', title: 'Relationships', state: listState(relationships, relationshipsRead) },
  ].map((row) => ({ ...row, state: runs[({ shape: 'structure', turns: 'structure', characters: 'coverage', production: 'coverage' })[row.id] ?? row.id]?.kind === 'running' ? 'running' : row.state })))
</script>

<div class="ui-story-outline" role="group" aria-label="Overview">
  {#each rows as r (r.id)}
    <div class="ui-story-outline__row">
      <SelectableRow title={r.title} selected={current === r.id} onclick={() => onjump?.(/** @type {OverviewSection} */ (r.id))}>
        {#snippet trailing()}{#if PILLS[r.state]}<StatusPill text={PILLS[r.state].text} tone={PILLS[r.state].tone} />{/if}{/snippet}
      </SelectableRow>
    </div>
  {/each}
</div>
