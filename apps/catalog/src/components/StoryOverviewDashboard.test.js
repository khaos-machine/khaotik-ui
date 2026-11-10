import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import { rubricRadar, RADAR_RADIUS } from '@khaos-machine/khaotik-ui/components/svelte/lib/story-overview.js'
import captured from '../data/story-overview.json'

// The Overview as one screen (operator, 2026-11-10): "One-screen dashboard", laid out
// "Header, band, grid", detail opening "Expand in place", placed as agreed ("Build it"): a header
// with the logline, verdict and the story's numbers; the Shape band with the timeline; and the
// panels Coverage, Characters, Production, Journeys and Relationships, each a summary whose
// "Show all" opens its full detail beneath the grid. b4p's data, verbatim; journeys and
// relationships illustrative, as in StoryOverviewJourneys.test.js.

const report = captured['coverage/report']
const loaded = (data) => ({ kind: 'loaded', data })
const MAYA = { id: 'character_a', name: 'MAYA' }
const THEO = { id: 'character_b', name: 'THEO' }
const journey = (arc_quality) => ({ beginning_state: 'A.', final_state: 'B.', emotional_progression: 'C.', arc_quality, turning_points: [], relationship_evolution: [], evidence_scene_ids: [] })
const synthesis = { relationship_type: 'siblings', trajectory: 'From resentment to trust.', turning_points: [], emotional_dynamics: [], conflict_patterns: [], relationship_arc: { beginning: 'A.', middle: 'B.', end: 'C.' }, evidence_scene_ids: [], confidence: 'medium' }
const base = {
  title: 'B4P',
  premise: loaded(captured.premise.premise),
  structure: loaded(captured.structure),
  coverage: loaded(report),
  journeys: loaded([
    { character: MAYA, journey: journey('complete') },
    { character: THEO, journey: journey('complete') },
    { character: { id: 'c', name: 'ROSA' }, journey: journey('incomplete') },
  ]),
  relationships: loaded([{ pairKey: 'a__b', characters: [MAYA, THEO], analysis: { synthesis } }]),
}
const panel = (name) => screen.getByRole('group', { name })
const showAll = (name) => screen.getByRole('button', { name: `Show all: ${name}` })

describe('StoryOverview dashboard', () => {
  it('heads the story with its logline, verdict and numbers, the synopsis folded', () => {
    render(StoryOverview, { props: base })
    const premise = screen.getByRole('region', { name: 'Premise' })
    expect(within(premise).getByText(captured.premise.premise.logline.value)).toBeVisible()
    expect(screen.getByText('Consider')).toBeVisible()
    expect(screen.getByRole('group', { name: 'Genre' })).toHaveTextContent(report.genre.value)
    expect(screen.getByRole('group', { name: 'Runtime' })).toHaveTextContent('77 min')
    expect(screen.getByRole('group', { name: 'Pages' })).toHaveTextContent('52')
    expect(screen.getByRole('group', { name: 'Scenes' })).toHaveTextContent('57')
    expect(screen.getByRole('button', { name: 'Synopsis' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('lays out the five panels in order, under the Shape band', () => {
    render(StoryOverview, { props: base })
    const names = screen.getAllByRole('group').filter((g) => g.classList.contains('ui-story-overview__panel')).map((g) => g.getAttribute('aria-label'))
    expect(names).toEqual(['Coverage', 'Characters', 'Production', 'Journeys', 'Relationships'])
    expect(screen.getByRole('group', { name: 'Story timeline' })).toBeVisible()
  })

  it('summarises coverage as its rubric scores', () => {
    render(StoryOverview, { props: base })
    expect(within(panel('Coverage')).getByRole('group', { name: 'Premise' })).toHaveTextContent('6 / 10')
    expect(within(panel('Coverage')).getByRole('group', { name: 'Dialogue' })).toHaveTextContent('5 / 10')
  })

  it('summarises the characters as the top five by dialogue weight, each selectable', async () => {
    const onselect = vi.fn()
    render(StoryOverview, { props: { ...base, onselect } })
    const c = panel('Characters')
    expect(within(c).getAllByRole('button').filter((b) => !b.textContent.includes('Show all')).map((b) => b.getAttribute('aria-label'))).toEqual(['DESMOND', 'JETTA', 'FIFTH', 'MADISON', 'SIDNEY'])
    expect(within(c).getByText('27 characters')).toBeVisible()
    await fireEvent.click(within(c).getByRole('button', { name: 'JETTA' }))
    expect(onselect).toHaveBeenCalledWith({ kind: 'character', index: report.characters.findIndex((x) => x.name === 'JETTA') })
  })

  // Operator, 2026-11-10: "Coverage as a chart", then "Radar" — not bars, which made it
  // "indifferent from Characters panel". One spoke per dimension, clockwise from the top; a score
  // sits its tenth of the way out; an unscored dimension keeps its spoke and has no point.
  it('places each rubric score on its spoke, out of ten, clockwise from the top', () => {
    const dims = [
      { name: 'A', score: { value: 10, source: 'llm' } },
      { name: 'B', score: { value: 5, source: 'llm' } },
      { name: 'C', score: { value: 0, source: 'none' } },
      { name: 'D', score: { value: 0, source: 'llm' } },
    ]
    const r = rubricRadar(dims)
    const near = (a, b) => expect(a).toBeCloseTo(b, 6)
    near(r[0].x, 50); near(r[0].y, 50 - RADAR_RADIUS)
    near(r[1].x, 50 + RADAR_RADIUS / 2); near(r[1].y, 50)
    expect(r[2].score).toBeNull()
    near(r[2].spokeX, 50); near(r[2].spokeY, 50 + RADAR_RADIUS)
    near(r[3].x, 50); near(r[3].y, 50)
    expect(r.map((d) => d.side)).toEqual(['middle', 'start', 'middle', 'end'])
  })

  it('draws the rubric as a radar, each dimension named with its score', () => {
    render(StoryOverview, { props: base })
    const c = panel('Coverage')
    expect(within(c).getByRole('img', { name: 'Rubric scores' })).toBeInTheDocument()
    expect(c.querySelector('.ui-story-overview__bar')).toBeNull()
    const scored = report.rubric.dimensions.filter((d) => d.score.source !== 'none')
    expect(c.querySelector('polygon.ui-rubric-radar__shape').getAttribute('points').trim().split(/\s+/)).toHaveLength(scored.length)
    for (const d of report.rubric.dimensions) {
      expect(within(c).getByRole('group', { name: d.name })).toHaveTextContent(d.score.source === 'none' ? 'No score' : `${d.score.value} / 10`)
    }
  })

  // Operator, 2026-11-10: "Characters as a chart". Each bar's length is the character's dialogue
  // weight against the top one's, so the lead fills the track; the percentage stays as text.
  it('draws the top five as dialogue-share bars, the largest filling the track', () => {
    render(StoryOverview, { props: base })
    const weights = report.characters.map((c) => c.dialogueWeight.value).sort((a, b) => b - a).slice(0, 5)
    const bars = panel('Characters').querySelectorAll('.ui-story-overview__bar')
    expect([...bars].map((b) => Number(b.style.getPropertyValue('--share')))).toEqual(weights.map((w) => w / weights[0]))
    bars.forEach((b) => expect(b).toHaveAttribute('aria-hidden', 'true'))
    expect(within(panel('Characters')).getByRole('button', { name: 'DESMOND' })).toHaveTextContent(`${Math.round(weights[0] * 100)}%`)
  })

  it('summarises production, journeys and relationships', () => {
    render(StoryOverview, { props: base })
    expect(within(panel('Production')).getByRole('group', { name: 'Cast size' })).toHaveTextContent(String(report.viability.castSize))
    expect(within(panel('Production')).getByRole('group', { name: 'Locations' })).toHaveTextContent(String(report.viability.uniqueLocations))
    expect(within(panel('Journeys')).getByText('2 complete arcs · 1 unfinished arc')).toBeVisible()
    expect(within(panel('Relationships')).getByText('1 pair read')).toBeVisible()
  })

  it('expands one panel\'s full detail beneath the grid, one at a time', async () => {
    render(StoryOverview, { props: base })
    expect(screen.queryByRole('region', { name: 'Characters' })).not.toBeInTheDocument()
    await fireEvent.click(showAll('Characters'))
    expect(screen.getByRole('region', { name: 'Characters' })).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Characters' })).getAllByRole('row')).toHaveLength(report.characters.length + 1)
    expect(showAll('Characters')).toHaveAttribute('aria-expanded', 'true')
    await fireEvent.click(showAll('Journeys'))
    expect(screen.queryByRole('region', { name: 'Characters' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Journeys' })).toBeVisible()
  })

  // The Outline jumps by scrolling to these ids (khaos-app src/ui/shell/StoryOverviewOutline.svelte:16).
  it('keeps the ids the Outline jumps to on the panels', () => {
    const { container } = render(StoryOverview, { props: base })
    for (const id of ['premise', 'shape', 'coverage', 'characters', 'production', 'journeys', 'relationships']) {
      expect(container.querySelector(`[data-ui-id="story.overview.${id}"]`)).toBeInTheDocument()
    }
  })
})
