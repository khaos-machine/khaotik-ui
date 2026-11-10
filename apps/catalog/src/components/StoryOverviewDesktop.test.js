import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import StoryOverviewSide from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewSide.svelte'
import captured from '../data/story-overview.json'
import cloudEmpty from './fixtures/khaos-cloud-coverage-empty.json'

// The desktop's Overview is what kit 0.178.5 drew (#49; K, 2026-11-10: "Restore the old desktop
// Overview"). Every render here passes only the props khaos-app passes (khaos-app main
// src/ui/shell/StoryOverview.svelte, StoryOverviewOutline.svelte, StoryOverviewSide.svelte, and
// Shell.svelte's overviewView). None of them passes runs or any opt-in, so these pin the defaults.

const loaded = (data) => ({ kind: 'loaded', data })
const report = captured['coverage/report']
const region = (name) => within(screen.getByRole('region', { name }))
// Opens a dashboard panel's full detail beneath the grid (operator, 2026-11-10: "Expand in place").
const showAll = (name) => fireEvent.click(screen.getByRole('button', { name: `Show all: ${name}` }))
// A dashboard panel: its summary, and the pass note when a host opts in.
const panel = (name) => within(screen.getByRole('group', { name }))
const pill = (name) => screen.getByRole('button', { name }).closest('.ui-story-outline__row')
const MAYA = { id: 'character_a', name: 'MAYA' }
const THEO = { id: 'character_b', name: 'THEO' }
const ids = ['scene_1', 'scene_2']
const skip = { reason: 'co-appearance weight 1 is below the minimum of 2', weight: 1, min_weight: 2 }
const synthesis = {
  relationship_type: 'siblings', trajectory: 'Reconciled', confidence: 'medium',
  relationship_arc: { beginning: 'Estranged', middle: 'Together', end: 'Allies' },
  turning_points: [], emotional_dynamics: [], conflict_patterns: [], evidence_scene_ids: ids,
}
const pairs = loaded([
  { pairKey: 'read', characters: [MAYA, THEO], analysis: { synthesis } },
  { pairKey: 'skipped', characters: [THEO, MAYA], analysis: { skip } },
])
const journeys = loaded([{
  character: MAYA,
  journey: {
    beginning_state: 'Guarded', emotional_progression: 'Learning trust', final_state: 'Open', arc_quality: 'complete',
    turning_points: [{ description: 'Accepts help', evidence_scene_ids: ids }],
    relationship_evolution: [{ counterpart: 'THEO', trajectory: 'Rivals to partners', evidence_scene_ids: ids }],
    evidence_scene_ids: ids,
  },
}])
const withNames = (names) => loaded({ ...captured.structure, names })

/** StoryOverview as khaos-app renders it. */
const overview = (over = {}) =>
  render(StoryOverview, { title: 'Story', premise: { kind: 'missing' }, structure: loaded(captured.structure), coverage: loaded(report), journeys, relationships: pairs, advanced: false, selected: null, onselect: vi.fn(), ...over })
/** StoryOverviewOutline as khaos-app renders it. */
const outline = (over = {}) =>
  render(StoryOverviewOutline, { premise: { kind: 'missing' }, structure: loaded(captured.structure), coverage: loaded(report), journeys, relationships: pairs, current: null, onjump: vi.fn(), ...over })
/** StoryOverviewSide as khaos-app renders it. */
const side = (over = {}) =>
  render(StoryOverviewSide, { structure: loaded(captured.structure), coverage: loaded(report), journeys, relationships: pairs, advanced: false, selected: null, onRevealScene: vi.fn(), ...over })

describe('desktop Overview: skipped pairs only in Advanced', () => {
  it('draws no skipped pair outside Advanced', async () => {
    overview()
    await showAll('Relationships')
    expect(region('Relationships').getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['MAYA and THEO'])
    expect(screen.queryByText(/below the minimum/)).toBeNull()
  })

  it('lists skips with their reasons under Show details in Advanced, not as rows', async () => {
    overview({ advanced: true })
    await showAll('Relationships')
    expect(screen.queryByRole('button', { name: 'THEO and MAYA' })).toBeNull()
    const details = region('Relationships').getByRole('button', { name: 'Show details' })
    await fireEvent.click(details)
    expect(screen.getByText(`THEO and MAYA: ${skip.reason}`)).toBeInTheDocument()
  })

  it('the side pane draws nothing for a selected skipped pair', () => {
    side({ selected: { kind: 'relationship', index: 1 }, advanced: true })
    expect(screen.queryByRole('group', { name: 'Co-appearance weight' })).toBeNull()
    expect(screen.getByText(/Select a turning point/)).toBeVisible()
  })
})

describe('desktop Overview: the outline', () => {
  it('names the turns row "Where the story turns"', () => {
    outline()
    expect(screen.getByRole('button', { name: 'Where the story turns' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Turns' })).toBeNull()
  })

  it('reads coverage with unfinished sections as Ready, never Incomplete', () => {
    expect(report.incompleteSections.length).toBeGreaterThan(0)
    outline()
    for (const name of ['Coverage', 'Characters', 'Production']) expect(pill(name)).toHaveTextContent('Ready')
    expect(screen.queryByText('Incomplete')).toBeNull()
  })

  it('reads failed naming, and named turns without points, as Not ready', () => {
    const { unmount } = outline({ structure: withNames({ state: 'failed' }) })
    expect(pill('Where the story turns')).toHaveTextContent('Not ready')
    expect(screen.queryByText("Didn't finish")).toBeNull()
    unmount()
    outline({ structure: withNames({ state: 'named' }) })
    expect(pill('Where the story turns')).toHaveTextContent('Not ready')
  })
})

describe('desktop Overview: the document', () => {
  it('draws no Structure measured section', () => {
    expect(report.structure.measured).toBeTruthy()
    overview()
    expect(screen.queryByRole('region', { name: 'Structure measured' })).toBeNull()
  })

  it('draws no structure acts, coverage acts or scene entries', () => {
    const sourced = (value) => ({ value, source: 'derived', confidence: 'high' })
    overview({
      structure: loaded({ ...captured.structure, acts: [{ name: 'Opening', startIndex: 0, endIndex: 3, fraction: 0.25 }] }),
      coverage: loaded({ ...report, structure: { ...report.structure, acts: [{ name: 'Opening', percentage: 0.5 }] }, scenes: [{ slugline: 'INT. WORKSHOP - DAY', summary: sourced('s'), narrativeRole: sourced('r'), durationMs: sourced(60000) }] }),
    })
    expect(screen.queryByRole('region', { name: 'Acts' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Scene entries' })).toBeNull()
    expect(screen.queryByText('INT. WORKSHOP - DAY')).toBeNull()
  })

  it('says failed naming, and named turns without points, have not been named yet', () => {
    const { unmount } = overview({ structure: withNames({ state: 'failed' }) })
    expect(region('Shape').getByText("The turning points haven't been named yet.")).toBeVisible()
    expect(screen.queryByText("Naming the turning points didn't finish.")).toBeNull()
    unmount()
    overview({ structure: withNames({ state: 'named' }) })
    expect(region('Shape').getByText("The turning points haven't been named yet.")).toBeVisible()
    expect(screen.queryByText('No turning points were named.')).toBeNull()
  })
})

describe('desktop Overview: conforming input 0.178.5 could not draw draws nothing for that part', () => {
  it('absent rubric dimensions draw no Rubric section and keep the rest', async () => {
    const { dimensions: _dimensions, ...rubric } = report.rubric
    overview({ coverage: loaded({ ...report, rubric }) })
    await showAll('Coverage')
    expect(screen.queryByRole('region', { name: 'Rubric' })).toBeNull()
    expect(screen.queryByText('No dimension was scored.')).toBeNull()
    expect(screen.getByRole('group', { name: 'Characters' })).toBeVisible()
  })

  it('an unscored lens draws no row in Advanced; a scored one draws as before', async () => {
    const fit = { ...captured.structure.fit, lenses: [{ id: 'three-act' }, { id: 'spine', score: 0.5, p: 0.01 }] }
    overview({ structure: loaded({ ...captured.structure, fit }), advanced: true })
    await fireEvent.click(region('Shape').getByRole('button', { name: 'Show details' }))
    expect(screen.queryByRole('group', { name: 'three-act' })).toBeNull()
    expect(screen.queryByText('Not scored')).toBeNull()
    expect(screen.getByRole('group', { name: 'spine' })).toHaveAccessibleDescription('score 0.50 · p 0.010')
  })

  it('the Khaos Cloud "empty" golden renders without throwing and without the Cloud additions', async () => {
    overview({ coverage: loaded(cloudEmpty.report) })
    expect(screen.getByText('No verdict')).toBeVisible()
    await showAll('Coverage')
    expect(screen.queryByRole('region', { name: 'Structure measured' })).toBeNull()
    expect(screen.queryByText('No dimension was scored.')).toBeNull()
  })
})

// The desktop passes no runs today. 0.178.5's StoryOverview already took runs for premise, structure
// and coverage, so a host that adds them back (a retry, say) must still get 0.178.5's outline and lists.
describe('desktop Overview: runs alone change nothing 0.178.5 drew', () => {
  const runs = { coverage: { kind: 'running' }, structure: { kind: 'running' }, journeys: { kind: 'partial' }, relationships: { kind: 'failed', message: 'PAIR_TIMEOUT' } }

  it('the outline reads no Running, Incomplete or Didn\'t finish', () => {
    outline({ coverage: loaded({ ...report, incompleteSections: [] }), runs })
    for (const name of ['Shape', 'Where the story turns', 'Coverage', 'Characters', 'Production', 'Journeys', 'Relationships']) expect(pill(name)).toHaveTextContent('Ready')
  })

  it('the journeys and relationships sections say nothing about their pass', async () => {
    overview({ runs })
    await showAll('Journeys')
    expect(panel('Journeys').queryByRole('note')).toBeNull()
    expect(region('Journeys').queryByRole('note')).toBeNull()
    expect(screen.queryByText('PAIR_TIMEOUT')).toBeNull()
  })
})

describe('desktop Overview: the side pane', () => {
  it('a journey shows its first turning-point scene only, relationships as rows, and no Evidence scenes', async () => {
    const onRevealScene = vi.fn()
    side({ selected: { kind: 'journey', index: 0 }, onRevealScene })
    expect(screen.queryByRole('region', { name: 'Evidence scenes' })).toBeNull()
    const buttons = screen.getAllByRole('button', { name: /Show in Scenes/ })
    expect(buttons).toHaveLength(1)
    await fireEvent.click(buttons[0])
    expect(onRevealScene.mock.calls).toEqual([['scene_1']])
    expect(region('Relationships').getByRole('group', { name: 'THEO' })).toHaveAccessibleDescription('Rivals to partners')
  })

  it('a relationship shows no Evidence scenes', () => {
    side({ selected: { kind: 'relationship', index: 0 } })
    expect(screen.getByRole('heading', { name: 'MAYA and THEO' })).toBeVisible()
    expect(screen.queryByRole('region', { name: 'Evidence scenes' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Show in Scenes/ })).toBeNull()
  })
})
