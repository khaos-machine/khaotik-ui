import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import StoryOverviewSide from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewSide.svelte'

// The Overview's journeys and relationships (khaos.machine docs/designs/2026-10-24-stage3-
// analysis-display.md, "Revision 2026-10-25: journeys and relationships"). The reads are shaped as
// khaosd's GET /api/journeys and GET /api/relationships answer them (khaos-manager#1058): each
// character with the story's name for it, null when the story no longer has that character.

const loaded = (data) => ({ kind: 'loaded', data })
const region = (name) => screen.getByRole('region', { name })
const MAYA = { id: 'character_a', name: 'MAYA' }
const THEO = { id: 'character_b', name: 'THEO' }

const journey = (over = {}) => ({
  beginning_state: 'A mechanic who trusts no one.',
  final_state: 'She hands her brother the keys.',
  emotional_progression: 'Guarded, then open.',
  arc_quality: 'complete',
  turning_points: [{ description: 'She takes the loan.', evidence_scene_ids: ['scene_3'] }],
  relationship_evolution: [{ counterpart: 'Theo', trajectory: 'From rivals to partners.', evidence_scene_ids: ['scene_5'] }],
  evidence_scene_ids: ['scene_3', 'scene_5'],
  ...over,
})
const journeys = [
  { character: THEO, journey: journey({ arc_quality: 'incomplete', final_state: 'He is still waiting.' }) },
  { character: MAYA, journey: journey() },
  { character: { id: 'character_gone', name: null }, journey: journey({ arc_quality: 'ambiguous' }) },
]

const synthesis = {
  relationship_type: 'siblings',
  trajectory: 'From resentment to trust.',
  turning_points: [{ scene_id: 'scene_7', description: 'He covers for her.' }],
  emotional_dynamics: ['Protective'],
  conflict_patterns: ['Money'],
  relationship_arc: { beginning: 'Estranged.', middle: 'Forced together.', end: 'Allies.' },
  evidence_scene_ids: ['scene_7'],
  confidence: 'medium',
}
const relationships = [
  { pairKey: 'character_a__character_b', characters: [MAYA, THEO], analysis: { synthesis } },
  { pairKey: 'character_a__character_gone', characters: [MAYA, { id: 'character_gone', name: null }], analysis: { skip: { reason: 'co-appearance weight 1 is below the minimum of 2', weight: 1, min_weight: 2 } } },
]
const base = { journeys: loaded(journeys), relationships: loaded(relationships) }

describe('StoryOverview journeys', () => {
  it('lists each journey in engine order with its arc and where it ends, and selects one', async () => {
    const onselect = vi.fn()
    render(StoryOverview, { props: { ...base, onselect } })
    const rows = within(region('Journeys')).getAllByRole('button')
    expect(rows.map((r) => r.getAttribute('aria-label'))).toEqual(['THEO', 'MAYA', 'A character no longer in this story'])
    expect(rows[0]).toHaveTextContent('Ends: He is still waiting.')
    expect(within(region('Journeys')).getByText('Unfinished arc')).toBeVisible()
    expect(within(region('Journeys')).getByText('Complete arc')).toBeVisible()
    expect(within(region('Journeys')).getByText('Unclear arc')).toBeVisible()
    await fireEvent.click(rows[1])
    expect(onselect).toHaveBeenLastCalledWith({ kind: 'journey', index: 1 })
  })

  it('says when there are none, when the read failed, and fails on an arc it has no label for', () => {
    const { unmount } = render(StoryOverview, { props: { journeys: loaded([]), relationships: loaded([]) } })
    expect(within(region('Journeys')).getByText('No character journeys yet.')).toBeVisible()
    expect(within(region('Relationships')).getByText('No relationships have been read yet.')).toBeVisible()
    unmount()
    const odd = [{ character: MAYA, journey: journey({ arc_quality: 'heroic' }) }]
    render(StoryOverview, { props: { journeys: loaded(odd), relationships: { kind: 'failed', message: 'JOURNEYS_UNREADABLE' } } })
    expect(within(region('Journeys')).getByText("Khaos couldn't read this story's journeys.")).toBeVisible()
    expect(within(region('Relationships')).getByText("Khaos couldn't read this story's relationships.")).toBeVisible()
  })
})

describe('StoryOverview relationships', () => {
  it('lists each read pair by its names with its type and trajectory; a skipped pair is not a row', async () => {
    const onselect = vi.fn()
    render(StoryOverview, { props: { ...base, onselect } })
    const rows = within(region('Relationships')).getAllByRole('button')
    expect(rows.map((r) => r.getAttribute('aria-label'))).toEqual(['MAYA and THEO'])
    expect(rows[0]).toHaveTextContent('From resentment to trust.')
    expect(within(region('Relationships')).getByText('siblings')).toBeVisible()
    await fireEvent.click(rows[0])
    expect(onselect).toHaveBeenLastCalledWith({ kind: 'relationship', index: 0 })
  })

  it('says so when every pair was skipped, and lists the skips with their reasons only in Advanced', async () => {
    const skipped = loaded([relationships[1]])
    const { unmount } = render(StoryOverview, { props: { ...base, relationships: skipped } })
    expect(within(region('Relationships')).getByText('No pair of characters shares enough scenes to read yet.')).toBeVisible()
    expect(screen.queryByText(/below the minimum/)).toBeNull()
    unmount()
    render(StoryOverview, { props: { ...base, relationships: skipped, advanced: true } })
    await fireEvent.click(screen.getByRole('button', { name: 'Show details' }))
    expect(screen.getByText('MAYA and a character no longer in this story: co-appearance weight 1 is below the minimum of 2')).toBeInTheDocument()
  })
})

describe('StoryOverviewOutline journeys and relationships', () => {
  it('ends the outline with Journeys and Relationships, each with its state', () => {
    render(StoryOverviewOutline, { props: { premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' }, journeys: loaded(journeys), relationships: loaded([]) } })
    const rows = screen.getAllByRole('button')
    expect(rows.slice(-2).map((r) => r.getAttribute('aria-label'))).toEqual(['Journeys', 'Relationships'])
    expect(rows.at(-2).closest('.ui-story-outline__row')).toHaveTextContent('Ready')
    expect(rows.at(-1).closest('.ui-story-outline__row')).toHaveTextContent('Missing')
  })
})

describe('StoryOverviewSide journeys and relationships', () => {
  it('shows a journey in the engine\'s words and reveals a turning point\'s scene', async () => {
    const onRevealScene = vi.fn()
    render(StoryOverviewSide, { props: { ...base, selected: { kind: 'journey', index: 1 }, onRevealScene } })
    expect(screen.getByRole('heading', { name: 'MAYA' })).toBeVisible()
    for (const text of ['A mechanic who trusts no one.', 'Guarded, then open.', 'She hands her brother the keys.', 'She takes the loan.', 'Theo', 'From rivals to partners.']) {
      expect(screen.getByText(text)).toBeVisible()
    }
    await fireEvent.click(screen.getAllByRole('button', { name: 'Show in Scenes' })[0])
    expect(onRevealScene).toHaveBeenLastCalledWith('scene_3')
  })

  it('shows a relationship with its arc, turning points, dynamics and conflicts, confidence only in Advanced', async () => {
    const onRevealScene = vi.fn()
    const { unmount } = render(StoryOverviewSide, { props: { ...base, selected: { kind: 'relationship', index: 0 }, onRevealScene } })
    expect(screen.getByRole('heading', { name: 'MAYA and THEO' })).toBeVisible()
    for (const text of ['From resentment to trust.', 'Estranged.', 'Forced together.', 'Allies.', 'He covers for her.', 'Protective', 'Money']) {
      expect(screen.getByText(text)).toBeVisible()
    }
    expect(screen.queryByText('AI · medium')).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Show in Scenes' }))
    expect(onRevealScene).toHaveBeenLastCalledWith('scene_7')
    unmount()
    render(StoryOverviewSide, { props: { ...base, selected: { kind: 'relationship', index: 0 }, advanced: true } })
    expect(screen.getByText('AI · medium')).toBeVisible()
  })
})
