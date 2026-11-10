import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import StoryOverviewSide from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewSide.svelte'
import captured from '../data/story-overview.json'

// The Overview's table and inspector panes (khaos.machine docs/designs/2026-10-24-stage3-analysis-
// display.md, item 4, Q4): an outline row per section with its state, and the selected turn or
// character. The data is b4p's, verbatim.

const report = captured['coverage/report']
const loaded = (data) => ({ kind: 'loaded', data })
const reads = { premise: loaded(captured.premise.premise), structure: loaded(captured.structure), coverage: loaded(report) }

describe('StoryOverviewOutline', () => {
  // Operator, 2026-11-10: "Outline less listy", as "Grouped by question" — Story, Verdict and
  // People, each section a dot for its state rather than a pill; the state is still each item's
  // description, and its text.
  it('groups the sections by the question they answer, each with its state', () => {
    render(StoryOverviewOutline, { props: { ...reads, turnsTitle: 'Turns', showIncompleteCoverage: true } })
    const group = (name) => within(screen.getByRole('group', { name })).getAllByRole('button').map((b) => b.getAttribute('aria-label'))
    expect(group('Story')).toEqual(['Premise', 'Shape', 'Turns'])
    expect(group('Verdict')).toEqual(['Coverage', 'Production'])
    expect(group('People')).toEqual(['Characters', 'Journeys', 'Relationships'])
    for (const name of ['Premise', 'Shape', 'Turns']) expect(screen.getByRole('button', { name })).toHaveAccessibleDescription('Ready')
    for (const name of ['Coverage', 'Production', 'Characters']) expect(screen.getByRole('button', { name })).toHaveAccessibleDescription('Incomplete')
    expect(screen.getByRole('button', { name: 'Premise' }).querySelector('.ui-story-outline__dot[data-tone="success"]')).not.toBeNull()
    expect(screen.queryByText('Ready', { selector: '.pill, .pill *' })).toBeNull()
  })

  it('reads missing, failed and loading as the sections do', () => {
    const { names, ...unnamed } = captured.structure
    render(StoryOverviewOutline, { props: { premise: { kind: 'missing' }, structure: loaded(unnamed), coverage: { kind: 'failed', message: 'x' }, turnsTitle: 'Turns' } })
    const pill = (name) => screen.getByRole('button', { name }).closest('.ui-story-outline__row')
    expect(pill('Premise')).toHaveTextContent('Not ready')
    expect(pill('Shape')).toHaveTextContent('Ready')
    expect(pill('Turns')).toHaveTextContent('Not ready')
    expect(pill('Coverage')).toHaveTextContent("Couldn't read")
    expect(pill('Production')).toHaveTextContent("Couldn't read")
  })

  it('fails Production alone on an unlabelled flag', () => {
    const viability = { ...report.viability, productionFlags: { ...report.viability.productionFlags, laserBattles: true } }
    render(StoryOverviewOutline, { props: { ...reads, coverage: loaded({ ...report, viability }), showIncompleteCoverage: true } })
    expect(screen.getByRole('button', { name: 'Coverage' }).closest('.ui-story-outline__row')).toHaveTextContent('Incomplete')
    expect(screen.getByRole('button', { name: 'Production' }).closest('.ui-story-outline__row')).toHaveTextContent("Couldn't read")
  })

  it('asks the host to show a section', async () => {
    const onjump = vi.fn()
    render(StoryOverviewOutline, { props: { ...reads, onjump } })
    await fireEvent.click(screen.getByRole('button', { name: 'Coverage' }))
    expect(onjump).toHaveBeenLastCalledWith('coverage')
  })
})

describe('StoryOverviewSide', () => {
  it('asks the host to select something when nothing is', () => {
    render(StoryOverviewSide, { props: reads })
    expect(screen.getByText('Select a turning point, a character, a journey or a relationship to see more here.')).toBeVisible()
  })

  it('shows a turn and reveals its scene', async () => {
    const onRevealScene = vi.fn()
    const p = captured.structure.names.points[3]
    render(StoryOverviewSide, { props: { ...reads, selected: { kind: 'turn', index: 3 }, onRevealScene } })
    expect(screen.getByText(p.name)).toBeVisible()
    expect(screen.getByText(p.turn)).toBeVisible()
    await fireEvent.click(screen.getByRole('button', { name: 'Show in Scenes' }))
    expect(onRevealScene).toHaveBeenLastCalledWith(p.sceneId)
  })

  it('shows a character with importance, arc, strengths and concerns, "No answer" for an empty arc', () => {
    const i = report.characters.findIndex((c) => c.strengths.value.length > 0)
    const c = report.characters[i]
    render(StoryOverviewSide, { props: { ...reads, selected: { kind: 'character', index: i } } })
    expect(screen.getByText(c.name)).toBeVisible()
    expect(screen.getByRole('group', { name: 'Importance' })).toHaveAccessibleDescription(c.importance.value)
    expect(screen.getByRole('group', { name: 'Arc' })).toHaveAccessibleDescription(c.arcSummary.source === 'none' ? 'No answer' : c.arcSummary.value)
    expect(within(screen.getByRole('region', { name: 'Strengths' })).getAllByRole('listitem')).toHaveLength(c.strengths.value.length)
  })
})
