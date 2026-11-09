import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import StoryOverviewSide from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewSide.svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import captured from '../data/story-overview.json'

// Schema-shaped regression inputs, not captured story facts. KSPD go/kspdprotocol/v0.136.1:
// analysis/structure.schema.json $defs.act; coverage-report.schema.json $defs.actSummary/sceneCard;
// analysis/character-journey.schema.json relationship_evolution.
const loaded = (data) => ({ kind: 'loaded', data })
const report = captured['coverage/report']
const sceneIds = ['scene_01AAAAAAAAAAAAAAAAAAAAAAAA', 'scene_01BBBBBBBBBBBBBBBBBBBBBBBB']
const characters = [{ id: 'character_a', name: 'MAYA' }, { id: 'character_b', name: 'THEO' }]
const journey = {
  beginning_state: 'Guarded', emotional_progression: 'Learning trust', final_state: 'Open', arc_quality: 'complete',
  turning_points: [{ description: 'Accepts help', evidence_scene_ids: sceneIds }],
  relationship_evolution: [{ counterpart: 'THEO', trajectory: 'Rivals to partners', evidence_scene_ids: sceneIds }],
  evidence_scene_ids: sceneIds,
}
const synthesis = {
  relationship_type: 'siblings', trajectory: 'Reconciled', confidence: 'medium',
  relationship_arc: { beginning: 'Estranged', middle: 'Together', end: 'Allies' },
  turning_points: [], emotional_dynamics: [], conflict_patterns: [], evidence_scene_ids: sceneIds,
}
const skip = { reason: 'co-appearance weight 1 is below the minimum of 2', weight: 1, min_weight: 2 }
const pairs = [
  { pairKey: 'read', characters, analysis: { synthesis } },
  { pairKey: 'skipped', characters: [characters[1], characters[0]], analysis: { skip } },
]
const region = (name) => within(screen.getByRole('region', { name }))
const pillRow = (name) => screen.getByRole('button', { name }).closest('.ui-story-outline__row')

async function revealEvery(scope, callback) {
  const buttons = scope.getAllByRole('button', { name: /Show in Scenes/ })
  expect(buttons).toHaveLength(sceneIds.length)
  for (const button of buttons) await fireEvent.click(button)
  expect(callback.mock.calls).toEqual(sceneIds.map((id) => [id]))
}

describe('complete Overview results', () => {
  it('gap 1: reveals every evidence scene for a journey turning point', async () => {
    const onRevealScene = vi.fn()
    render(StoryOverviewSide, { journeys: loaded([{ character: characters[0], journey }]), selected: { kind: 'journey', index: 0 }, onRevealScene })
    await revealEvery(region('Turning points'), onRevealScene)
  })

  it('gap 2: renders each relationship evolution with all its evidence', async () => {
    const onRevealScene = vi.fn()
    render(StoryOverviewSide, { journeys: loaded([{ character: characters[0], journey }]), selected: { kind: 'journey', index: 0 }, onRevealScene })
    expect(region('Relationships').getByText('THEO')).toBeVisible()
    expect(region('Relationships').getByText('Rivals to partners')).toBeVisible()
    await revealEvery(region('Relationships'), onRevealScene)
  })

  it('gap 3: reveals every synthesis evidence scene even without turning points', async () => {
    const onRevealScene = vi.fn()
    render(StoryOverviewSide, { relationships: loaded(pairs), selected: { kind: 'relationship', index: 0 }, onRevealScene })
    await revealEvery(region('Evidence scenes'), onRevealScene)
  })

  it('gap 4a: renders coverage acts including zero values and optional omissions', () => {
    render(StoryOverview, { coverage: loaded({ ...report, structure: { ...report.structure, acts: [{ name: 'Opening', percentage: 0, sceneCount: 0, durationMs: 0 }, { name: 'Ending' }] } }) })
    const acts = region('Acts')
    expect(acts.getByText('Opening')).toBeVisible()
    expect(acts.getByText('Ending')).toBeVisible()
    expect(acts.getByRole('group', { name: 'Word share' })).toHaveAccessibleDescription('0%')
    expect(acts.getByRole('group', { name: 'Scenes' })).toHaveAccessibleDescription('0')
    expect(acts.getByRole('group', { name: 'Runtime' })).toHaveAccessibleDescription('0 min')
    expect(acts.getAllByRole('group')).toHaveLength(3)
  })

  it('gap 4b: renders every coverage scene entry and its supplied fields', () => {
    const sourced = (value) => ({ value, source: 'derived', confidence: 'high' })
    const scenes = [
      { index: 0, slugline: 'INT. WORKSHOP - DAY', summary: sourced('She asks for help.'), narrativeRole: sourced('Setup'), characters: ['MAYA', 'THEO'], durationMs: sourced(90000) },
      { slugline: 'EXT. ROAD - NIGHT', summary: sourced('They leave together.'), narrativeRole: sourced('Resolution'), durationMs: sourced(0) },
    ]
    render(StoryOverview, { coverage: loaded({ ...report, scenes }) })
    const entries = region('Scene entries')
    for (const text of ['INT. WORKSHOP - DAY', 'She asks for help.', 'Setup', 'MAYA, THEO', 'EXT. ROAD - NIGHT', 'They leave together.', 'Resolution']) expect(entries.getByText(text)).toBeVisible()
    expect(entries.getByRole('group', { name: 'Scene index' })).toHaveAccessibleDescription('0')
    entries.getAllByRole('group', { name: 'Runtime' }).forEach((row, i) => expect(row).toHaveAccessibleDescription(['1.5 min', '0 min'][i]))
  })

  it('gap 5: renders every structure act with its inclusive range and word share', () => {
    render(StoryOverview, { structure: loaded({ ...captured.structure, acts: [{ name: 'Opening', startIndex: 0, endIndex: 3, fraction: 0.25 }, { name: 'Ending', startIndex: 4, endIndex: 9, fraction: 0.75 }] }) })
    const acts = region('Acts')
    expect(acts.getByText('Opening')).toBeVisible()
    expect(acts.getByText('Ending')).toBeVisible()
    acts.getAllByRole('group', { name: 'Scene indices (inclusive)' }).forEach((row, i) => expect(row).toHaveAccessibleDescription(['0–3', '4–9'][i]))
    acts.getAllByRole('group', { name: 'Word share' }).forEach((row, i) => expect(row).toHaveAccessibleDescription(['25%', '75%'][i]))
  })

  it('gap 6: selects a skipped pair with its original list index and inspects its reason', async () => {
    const onselect = vi.fn()
    const view = render(StoryOverview, { relationships: loaded(pairs), selected: { kind: 'relationship', index: 1 }, onselect })
    const row = region('Relationships').getByRole('button', { name: 'THEO and MAYA' })
    expect(row).toHaveAttribute('aria-current', 'true')
    await fireEvent.click(row)
    expect(onselect).toHaveBeenLastCalledWith({ kind: 'relationship', index: 1 })
    view.unmount()
    render(StoryOverviewSide, { relationships: loaded(pairs), selected: { kind: 'relationship', index: 1 } })
    expect(screen.getByRole('heading', { name: 'THEO and MAYA' })).toBeVisible()
    expect(screen.getByText(skip.reason)).toBeVisible()
    expect(screen.getByRole('group', { name: 'Co-appearance weight' })).toHaveAccessibleDescription('1')
    expect(screen.getByRole('group', { name: 'Minimum weight' })).toHaveAccessibleDescription('2')
  })

  it('gap 7a: names the outline section Turns', () => {
    render(StoryOverviewOutline)
    expect(screen.getByRole('button', { name: 'Turns' })).toBeVisible()
  })

  it('gap 7b: shows running sections over previous results and updates when the run finishes', async () => {
    const view = render(StoryOverviewOutline, { coverage: loaded(report), runs: { coverage: { kind: 'running' } } })
    for (const name of ['Coverage', 'Characters', 'Production']) expect(pillRow(name)).toHaveTextContent('Running')
    await view.rerender({ coverage: loaded({ ...report, incompleteSections: [] }), runs: {} })
    expect(pillRow('Coverage')).toHaveTextContent('Ready')
  })

  it('gap 7c: marks incomplete coverage honestly and preserves its results', () => {
    render(StoryOverviewOutline, { coverage: loaded({ ...report, incompleteSections: ['scene-analysis', 'future-layer'] }) })
    expect(pillRow('Coverage')).toHaveTextContent('Incomplete')
    expect(pillRow('Coverage')).not.toHaveTextContent('Ready')
  })
})
