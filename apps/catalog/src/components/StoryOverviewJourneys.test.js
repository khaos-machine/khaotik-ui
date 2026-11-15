import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import StoryOverviewSide from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewSide.svelte'
import { journeyLanes, relationshipGraph } from '@khaos-machine/khaotik-ui/components/svelte/lib/story-overview.js'

// The Overview's journeys and relationships (khaos.machine docs/designs/2026-10-24-stage3-
// analysis-display.md, "Revision 2026-10-25: journeys and relationships"). The reads are shaped as
// khaosd's GET /api/journeys and GET /api/relationships answer them (khaos-manager#1058): each
// character with the story's name for it, null when the story no longer has that character.

const loaded = (data) => ({ kind: 'loaded', data })
const region = (name) => screen.getByRole('region', { name })
// A dashboard panel's summary, and its full detail opened beneath the grid (operator, 2026-11-10:
// "Expand in place").
const panel = (name) => screen.getByRole('group', { name })
const open = async (name) => {
  await fireEvent.click(screen.getByRole('button', { name: `Show all: ${name}` }))
  return region(name)
}
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
const SCENES = ['scene_1', 'scene_2', 'scene_3', 'scene_4', 'scene_5', 'scene_6', 'scene_7']

describe('StoryOverview journeys', () => {
  // Operator, 2026-11-14: a row chooses its journey in the card, as its lane does.
  it('lists each journey in engine order with its arc and where it ends, and shows the chosen one in the card', async () => {
    render(StoryOverview, { props: { ...base, sceneOrder: SCENES } })
    const detail = await open('Journeys')
    const rows = within(detail).getAllByRole('button')
    expect(rows.map((r) => r.getAttribute('aria-label'))).toEqual(['THEO', 'MAYA', 'A character no longer in this story'])
    expect(rows[0]).toHaveTextContent('Ends: He is still waiting.')
    expect(within(detail).getByText('Unfinished arc')).toBeVisible()
    expect(within(detail).getByText('Complete arc')).toBeVisible()
    expect(within(detail).getByText('Unclear arc')).toBeVisible()
    await fireEvent.click(rows[1])
    expect(rows[1]).toHaveAttribute('aria-current', 'true')
    expect(within(panel('Journeys')).getByRole('heading', { name: 'MAYA' })).toBeVisible()
    expect(within(panel('Journeys')).getByText('A mechanic who trusts no one.')).toBeVisible()
  })

  it('says when there are none, when the read failed, and fails on an arc it has no label for', () => {
    const { unmount } = render(StoryOverview, { props: { journeys: loaded([]), relationships: loaded([]) } })
    expect(within(panel('Journeys')).getByText('No character journeys yet.')).toBeVisible()
    expect(within(panel('Relationships')).getByText('No relationships have been read yet.')).toBeVisible()
    unmount()
    const odd = [{ character: MAYA, journey: journey({ arc_quality: 'heroic' }) }]
    render(StoryOverview, { props: { journeys: loaded(odd), relationships: { kind: 'failed', message: 'JOURNEYS_UNREADABLE' } } })
    expect(within(panel('Journeys')).getByText("Khaos couldn't read this story's journeys.")).toBeVisible()
    expect(within(panel('Relationships')).getByText("Khaos couldn't read this story's relationships.")).toBeVisible()
  })
})

describe('StoryOverview relationships', () => {
  // Operator, 2026-11-14: "remove skipped from list and still make it collapsed by default"; a row
  // chooses its pair in the card, as its line in the graph does.
  it('lists each read pair by its names and type, folds the skipped beneath, and shows the chosen pair in the card', async () => {
    render(StoryOverview, { props: { ...base, showSkippedPairs: true } })
    const detail = await open('Relationships')
    const rows = within(detail).getAllByRole('button', { name: /^MAYA and/ })
    expect(rows.map((r) => r.getAttribute('aria-label'))).toEqual(['MAYA and THEO'])
    expect(rows[0]).toHaveTextContent('siblings')
    expect(within(detail).queryByText(/below the minimum/)).toBeNull()
    await fireEvent.click(rows[0])
    expect(within(panel('Relationships')).getByRole('heading', { name: 'MAYA and THEO' })).toBeVisible()
    expect(within(panel('Relationships')).getByText('From resentment to trust.')).toBeVisible()
    await fireEvent.click(within(detail).getByRole('button', { name: /^Skipped/ }))
    await fireEvent.click(within(detail).getByRole('button', { name: 'MAYA and a character no longer in this story' }))
    expect(within(panel('Relationships')).getByRole('heading', { name: 'MAYA and a character no longer in this story' })).toBeVisible()
  })

  it('says so when every pair was skipped, and shows selectable skips and their reasons once unfolded', async () => {
    const skipped = loaded([relationships[1]])
    const { unmount } = render(StoryOverview, { props: { ...base, relationships: skipped, showSkippedPairs: true } })
    expect(within(panel('Relationships')).getByText('No pair of characters shares enough scenes to read yet.')).toBeVisible()
    await open('Relationships')
    await fireEvent.click(screen.getByRole('button', { name: /^Skipped/ }))
    expect(screen.getByText(/below the minimum/)).toBeVisible()
    unmount()
    render(StoryOverview, { props: { ...base, relationships: skipped, advanced: true, showSkippedPairs: true } })
    await open('Relationships')
    await fireEvent.click(screen.getByRole('button', { name: /^Skipped/ }))
    expect(screen.getByRole('button', { name: 'MAYA and a character no longer in this story' })).toBeVisible()
    expect(screen.getByText(/below the minimum/)).toBeVisible()
  })
})

describe('StoryOverviewOutline journeys and relationships', () => {
  it('ends the outline with Journeys and Relationships, each with its state', () => {
    render(StoryOverviewOutline, { props: { premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' }, journeys: loaded(journeys), relationships: loaded([]) } })
    const rows = screen.getAllByRole('button')
    expect(rows.slice(-2).map((r) => r.getAttribute('aria-label'))).toEqual(['Journeys', 'Relationships'])
    expect(rows.at(-2).closest('.ui-story-outline__row')).toHaveTextContent('Ready')
    expect(rows.at(-1).closest('.ui-story-outline__row')).toHaveTextContent('Not ready')
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
    await fireEvent.click(within(region('Turning points')).getByRole('button', { name: 'Show in Scenes' }))
    expect(onRevealScene).toHaveBeenLastCalledWith('scene_7')
    unmount()
    render(StoryOverviewSide, { props: { ...base, selected: { kind: 'relationship', index: 0 }, advanced: true } })
    expect(screen.getByText('AI · medium')).toBeVisible()
  })
})

// Operator, 2026-11-14: Journeys and Relationships each take a row: a figure beside a panel that shows
// the stats by default and the chosen item's detail, with the list in a drawer closed by default.
describe('StoryOverview Journeys lanes', () => {
  const lanes = () => within(screen.getByRole('group', { name: 'Journey lanes' })).getAllByRole('button').map((b) => b.getAttribute('aria-label'))
  const GONE = 'A character no longer in this story, unclear arc, 1 turning point'

  // "hide unfinished by default"; the Arcs stat's unfinished count shows them. A journey with nothing to
  // draw (no turning point, one place) is left out of the lanes and kept in the list.
  it('hides unfinished lanes until their count is pressed, and leaves out a lane with nothing to draw', async () => {
    const flat = { character: { id: 'character_c', name: 'NOOR' }, journey: journey({ arc_quality: 'incomplete', turning_points: [], relationship_evolution: [], evidence_scene_ids: ['scene_4'] }) }
    render(StoryOverview, { props: { ...base, journeys: loaded([...journeys, flat]), sceneOrder: SCENES } })
    expect(lanes()).toEqual(['MAYA, complete arc, 1 turning point', GONE])
    const unfinished = screen.getByRole('button', { name: '2 unfinished arcs' })
    await fireEvent.click(unfinished)
    expect(lanes()).toEqual(['THEO, unfinished arc, 1 turning point', 'MAYA, complete arc, 1 turning point', GONE])
    await fireEvent.click(unfinished)
    expect(lanes()).toEqual(['MAYA, complete arc, 1 turning point', GONE])
    expect(await open('Journeys')).toHaveTextContent('NOOR')
  })

  it('shows a chosen lane\'s journey in the card, and the stats again when it is chosen again', async () => {
    render(StoryOverview, { props: { ...base, sceneOrder: SCENES } })
    const card = within(panel('Journeys'))
    expect(card.getByRole('group', { name: 'Journeys read' })).toHaveAccessibleDescription('3')
    const maya = screen.getByRole('button', { name: /^MAYA,/ })
    await fireEvent.click(maya)
    expect(maya).toHaveAttribute('aria-pressed', 'true')
    expect(card.getByRole('heading', { name: 'MAYA' })).toBeVisible()
    expect(card.getByText('She takes the loan.')).toBeVisible()
    await fireEvent.click(maya)
    expect(card.queryByRole('heading', { name: 'MAYA' })).toBeNull()
    expect(card.getByRole('group', { name: 'Journeys read' })).toBeVisible()
  })

  it('shows an unfinished journey\'s lane when its row is chosen in the list', async () => {
    render(StoryOverview, { props: { ...base, sceneOrder: SCENES } })
    await fireEvent.click(within(await open('Journeys')).getByRole('button', { name: 'THEO' }))
    expect(screen.getByRole('button', { name: /^THEO,/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('places each lane from its first scene to its last, with a point at each turning point', () => {
    expect(journeyLanes([journeys[1]], SCENES)).toEqual([{ index: 0, name: 'MAYA', arc: 'complete', from: 2 / 6, to: 4 / 6, points: [2 / 6] }])
  })
})

describe('StoryOverview relationship graph', () => {
  it('keeps the list closed under a Show all at the foot that says what it will do', async () => {
    render(StoryOverview, { props: base })
    expect(screen.queryByRole('region', { name: 'Relationships' })).toBeNull()
    await open('Relationships')
    const hide = screen.getByRole('button', { name: 'Hide all: Relationships' })
    expect(hide).toHaveAttribute('aria-expanded', 'true')
    await fireEvent.click(hide)
    expect(screen.queryByRole('region', { name: 'Relationships' })).toBeNull()
  })

  it('shows a chosen line\'s pair in the card, and the stats again when it is chosen again', async () => {
    render(StoryOverview, { props: base })
    const card = within(panel('Relationships'))
    expect(card.getByRole('group', { name: 'Pairs read' })).toHaveAccessibleDescription('1')
    const line = within(screen.getByRole('group', { name: 'Relationship graph' })).getByRole('button', { name: 'MAYA and THEO: siblings' })
    await fireEvent.click(line)
    expect(card.getByRole('heading', { name: 'MAYA and THEO' })).toBeVisible()
    for (const text of ['From resentment to trust.', 'Estranged.', 'Forced together.', 'Allies.']) expect(card.getByText(text)).toBeVisible()
    await fireEvent.click(line)
    expect(card.queryByRole('heading', { name: 'MAYA and THEO' })).toBeNull()
  })

  it('rings the most connected character first and weighs each line by its evidence', () => {
    const graph = relationshipGraph([relationships[0]])
    expect(graph.nodes.map((n) => [n.name, n.pairs])).toEqual([['MAYA', 1], ['THEO', 1]])
    expect(graph.edges.map((e) => [e.name, e.type, e.scenes])).toEqual([['MAYA and THEO', 'siblings', 1]])
  })
})

// Operator, 2026-11-14: "Buttons in the card": the chosen journey or pair opens its evidence scenes from
// its card's detail, as StoryOverviewSide does.
describe('StoryOverview evidence scenes in the card', () => {
  const reveals = () => within(panel('Journeys')).queryAllByRole('button', { name: /^Show in Scenes/ })

  it('reveals a journey turning point\'s first scene, and with every evidence scene shown, all of them', async () => {
    const onRevealScene = vi.fn()
    const { unmount } = render(StoryOverview, { props: { ...base, sceneOrder: SCENES, onRevealScene } })
    await fireEvent.click(screen.getByRole('button', { name: /^MAYA,/ }))
    expect(reveals()).toHaveLength(1)
    await fireEvent.click(reveals()[0])
    expect(onRevealScene).toHaveBeenLastCalledWith('scene_3')
    unmount()
    render(StoryOverview, { props: { ...base, sceneOrder: SCENES, onRevealScene, showEvidenceScenes: true } })
    await fireEvent.click(screen.getByRole('button', { name: /^MAYA,/ }))
    // The turning point's scene, the relationship's, and the journey's own two.
    expect(reveals()).toHaveLength(4)
    expect(within(panel('Journeys')).getByRole('button', { name: /^Evidence scenes/ })).toBeVisible()
    await fireEvent.click(reveals()[1])
    expect(onRevealScene).toHaveBeenLastCalledWith('scene_5')
  })

  it('shows a pair\'s turning points and reveals each one\'s scene, and its evidence scenes when shown', async () => {
    const onRevealScene = vi.fn()
    const { unmount } = render(StoryOverview, { props: { ...base, onRevealScene } })
    await fireEvent.click(screen.getByRole('button', { name: 'MAYA and THEO: siblings' }))
    const card = within(panel('Relationships'))
    expect(card.getByText('He covers for her.')).toBeVisible()
    await fireEvent.click(card.getByRole('button', { name: 'Show in Scenes' }))
    expect(onRevealScene).toHaveBeenLastCalledWith('scene_7')
    unmount()
    render(StoryOverview, { props: { ...base, onRevealScene, showEvidenceScenes: true } })
    await fireEvent.click(screen.getByRole('button', { name: 'MAYA and THEO: siblings' }))
    expect(within(panel('Relationships')).getAllByRole('button', { name: /^Show in Scenes/ })).toHaveLength(2)
  })
})
