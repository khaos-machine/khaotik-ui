import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import { timelineTurns, fittingLenses, pacing } from '@khaos-machine/khaotik-ui/components/svelte/lib/story-overview.js'
import captured from '../data/story-overview.json'

// The story timeline (operator, 2026-11-10: "Story timeline", positions from the "Structure
// profile", "Mark height = strength"). Each turn is placed where it falls in the story by
// structure.profile.scenes (KSPD analysis/structure.schema.json, $defs.inflectionPoint) and drawn
// as tall as its strength against the story's strongest. b4p's data, verbatim.

const structure = captured.structure
const points = structure.names.points
const profile = structure.profile.scenes
const base = { title: 'B4P', structure: { kind: 'loaded', data: structure } }
const timeline = () => screen.getByRole('group', { name: 'Story timeline' })

describe('timelineTurns', () => {
  it('places every profiled turn by position, tallest at the strongest, joined to its name', () => {
    const turns = timelineTurns(structure)
    expect(turns).toHaveLength(profile.length)
    expect(turns.map((t) => t.position)).toEqual([...turns.map((t) => t.position)].sort((a, b) => a - b))
    const strongest = Math.max(...profile.map((p) => p.strength))
    const top = turns.find((t) => t.height === 1)
    expect(profile.find((p) => p.sceneId === top.sceneId).strength).toBe(strongest)
    for (const t of turns) expect(t.name).toBe(points[t.point].name)
  })

  it('has nothing to place without a profile', () => {
    expect(timelineTurns({ ...structure, profile: undefined })).toBeNull()
    expect(timelineTurns(null)).toBeNull()
  })

  // Measured but not named: the turns are placed and have no names to select.
  it('places unnamed turns with no point to select', () => {
    const turns = timelineTurns({ ...structure, names: { state: 'unnamed' } })
    expect(turns).toHaveLength(profile.length)
    expect(turns.every((t) => t.point === -1 && t.name === null)).toBe(true)
  })
})

// "Where my big turns are": the four strongest, named on the chart. b4p has four tied at its top.
describe('big turns', () => {
  it('labels the four strongest turns', () => {
    const labelled = timelineTurns(structure).filter((t) => t.label).map((t) => t.name)
    expect(labelled).toEqual(['Reasons Fail to Reach Fifth', 'A Promise to Find Marlon', 'Proposal Ends in Collision', 'Jetta Leaves a Choice'])
  })
})

// "Beats a structure expects", "Every structure that fits". Ambiguous names no fit set in the
// protocol (RFC 0111 §3.4), so the operator's stand-in: "Top two by excess".
describe('fittingLenses', () => {
  it('draws the top two by excess when the fit is ambiguous', () => {
    expect(fittingLenses(structure).map((l) => l.name)).toEqual(['Story Spine', 'Three-Act Structure'])
    const spine = fittingLenses(structure)[0]
    expect(spine.beats.map((b) => b.name)).toEqual(['And every day', 'Until one day', 'Because of that', 'Because of that, again', 'Until finally', 'And ever since'])
  })

  it('draws the primary alone when one structure fit', () => {
    const inferred = { ...structure, fit: { ...structure.fit, outcome: 'inferred', primary: 'three-act' } }
    expect(fittingLenses(inferred).map((l) => l.id)).toEqual(['three-act'])
  })

  it('draws nothing when no structure fit', () => {
    for (const outcome of ['undetermined', 'insufficient-evidence', 'author-declared']) {
      expect(fittingLenses({ ...structure, fit: { ...structure.fit, outcome } })).toEqual([])
    }
  })

  it('names a structure it does not know by its id', () => {
    const lenses = structure.fit.lenses.map((l) => (l.id === 'story-spine' ? { ...l, id: 'kishotenketsu' } : l))
    expect(fittingLenses({ ...structure, fit: { ...structure.fit, lenses } })[0].name).toBe('kishotenketsu')
  })
})

// "Pacing", "Both": a density band and the busiest and quietest stretch, counted over a fifth of
// the story. b4p's opening fifth holds 10 turns; 25–45% holds 3.
describe('pacing', () => {
  it('finds the busiest and quietest fifth of the story', () => {
    const p = pacing(timelineTurns(structure))
    expect(p.busy).toEqual({ from: 0, to: 0.2 })
    expect(p.quiet).toEqual({ from: 0.25, to: 0.45 })
    expect(p.density).toHaveLength(20)
    expect(Math.max(...p.density)).toBe(1)
  })
})

describe('StoryOverview story timeline', () => {
  it('names the big turns, each fitting structure\'s beats, and the pacing on the chart', () => {
    render(StoryOverview, { props: base })
    const t = timeline()
    for (const name of ['Reasons Fail to Reach Fifth', 'Jetta Leaves a Choice']) expect(within(t).getByText(name)).toBeVisible()
    expect(within(t).getByRole('list', { name: 'Story Spine' })).toHaveTextContent('Until one day')
    expect(within(t).getByRole('list', { name: 'Three-Act Structure' })).toHaveTextContent('Midpoint')
    expect(within(t).getByText('Busiest 0–20% · Quietest 25–45%')).toBeVisible()
  })

  it('draws one mark per turn, named for it, at its position and strength', () => {
    render(StoryOverview, { props: base })
    const marks = within(timeline()).getAllByRole('button')
    expect(marks).toHaveLength(profile.length)
    const first = timelineTurns(structure)[0]
    expect(marks[0]).toHaveAccessibleName(first.name)
    expect(marks[0].style.left).toBe(`${first.position * 100}%`)
    expect(marks[0].style.getPropertyValue('--strength')).toBe(String(first.height))
  })

  it('selects the turn a mark stands for, as the list does', async () => {
    const onselect = vi.fn()
    render(StoryOverview, { props: { ...base, onselect } })
    const t = timelineTurns(structure)[5]
    await fireEvent.click(within(timeline()).getByRole('button', { name: t.name }))
    expect(onselect).toHaveBeenCalledWith({ kind: 'turn', index: t.point })
  })

  // Operator, 2026-11-10: "Fold it". The list is the timeline's detail, opened on request.
  it('folds the turns list under the timeline', async () => {
    render(StoryOverview, { props: base })
    const toggle = screen.getByRole('button', { name: /Where the story turns/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region', { name: /Where the story turns/ })).not.toBeInTheDocument()
    await fireEvent.click(toggle)
    expect(screen.getByRole('region', { name: /Where the story turns/ })).toBeVisible()
  })

  it('marks the selected turn as pressed', () => {
    const t = timelineTurns(structure)[3]
    render(StoryOverview, { props: { ...base, selected: { kind: 'turn', index: t.point } } })
    expect(within(timeline()).getByRole('button', { name: t.name })).toHaveAttribute('aria-pressed', 'true')
    expect(within(timeline()).getAllByRole('button', { pressed: true })).toHaveLength(1)
  })
})
