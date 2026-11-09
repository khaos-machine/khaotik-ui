import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import StoryOverviewSide from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewSide.svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import captured from '../data/story-overview.json'
import cloudEmpty from './fixtures/khaos-cloud-coverage-empty.json'

// Reports KSPD allows must render. KSPD go/kspdprotocol/v0.136.1:
// coverage-report.schema.json $defs.attributedStringList (:280, value ["array","null"]),
// $defs.rubric (:312, only verdict required), $defs.measuredStructure (:391, document optional);
// analysis/structure.schema.json $defs.lensFit score/p (:371, :379, absent when not scored),
// $defs.names (:387, only state required); analysis/character-journey.schema.json evidence_scene_ids (:83).
const loaded = (data) => ({ kind: 'loaded', data })
const report = captured['coverage/report']
const region = (name) => within(screen.getByRole('region', { name }))
const none = { value: null, source: 'none', confidence: 'none' }
const withAssessment = (over) => ({ ...report, assessment: { ...report.assessment, ...over } })
const withMeasured = (measured) => ({ ...report, structure: { ...report.structure, measured } })

describe('Overview on conforming coverage', () => {
  it('renders Khaos Cloud engine golden "empty" without throwing', () => {
    render(StoryOverview, { coverage: loaded(cloudEmpty.report) })
    const coverage = region('Coverage')
    expect(coverage.getByText('No verdict')).toBeVisible()
    expect(coverage.queryByRole('region', { name: 'Strengths' })).toBeNull()
    expect(coverage.queryByRole('region', { name: 'Concerns' })).toBeNull()
    expect(region('Rubric').getByText('No dimension was scored.')).toBeVisible()
    expect(region('Structure measured').getByText('Not measured')).toBeVisible()
  })

  it('renders the golden in the outline and the side pane without throwing', () => {
    render(StoryOverviewOutline, { coverage: loaded(cloudEmpty.report) })
    expect(screen.getByRole('button', { name: 'Coverage' }).closest('.ui-story-outline__row')).toHaveTextContent('Ready')
    render(StoryOverviewSide, { coverage: loaded(cloudEmpty.report), selected: { kind: 'character', index: 0 } })
    expect(screen.getByText(/Select a turning point/)).toBeVisible()
  })

  it('null strengths render as nothing and keep the rest of the report', () => {
    render(StoryOverview, { coverage: loaded(withAssessment({ strengths: none })) })
    expect(screen.queryByRole('region', { name: 'Strengths' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Concerns' })).toBeVisible()
  })

  it('null concerns render as nothing and keep the rest of the report', () => {
    render(StoryOverview, { coverage: loaded(withAssessment({ concerns: none })) })
    expect(screen.queryByRole('region', { name: 'Concerns' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Strengths' })).toBeVisible()
  })

  it('absent rubric dimensions say none were scored', () => {
    const { dimensions: _dimensions, ...rubric } = report.rubric
    render(StoryOverview, { coverage: loaded({ ...report, rubric }) })
    expect(region('Rubric').getByText('No dimension was scored.')).toBeVisible()
    expect(screen.getByRole('region', { name: 'Characters' })).toBeVisible()
  })

  it('draws structure.measured with the document it read', () => {
    render(StoryOverview, { coverage: loaded(withMeasured({ outcome: 'inferred', reason: 'Three-Act Structure fits.', document: 'analysis/structure/structure.json' })) })
    const measured = region('Structure measured')
    expect(measured.getByText('Fits one structure')).toBeVisible()
    expect(measured.getByText('Three-Act Structure fits.')).toBeVisible()
    expect(measured.getByRole('group', { name: 'Read from' })).toHaveAccessibleDescription('analysis/structure/structure.json')
  })

  it('draws structure.measured without a document', () => {
    render(StoryOverview, { coverage: loaded(withMeasured({ outcome: 'not-measured', reason: 'No story structure has been measured for this package.' })) })
    const measured = region('Structure measured')
    expect(measured.getByText('Not measured')).toBeVisible()
    expect(measured.getByText('No story structure has been measured for this package.')).toBeVisible()
    expect(measured.queryByRole('group', { name: 'Read from' })).toBeNull()
  })

  it('an unknown measured outcome fails only its own block', () => {
    render(StoryOverview, { coverage: loaded(withMeasured({ outcome: 'toString', reason: 'x' })) })
    expect(region('Structure measured').getByText("Khaos couldn't read how this story's structure was measured.")).toBeVisible()
    expect(screen.getByRole('region', { name: 'Characters' })).toBeVisible()
  })

  it('unscored lenses and named turns without points render', async () => {
    const fit = { ...captured.structure.fit, lenses: [{ id: 'three-act' }] }
    render(StoryOverview, { structure: loaded({ ...captured.structure, fit, names: { state: 'named' } }), advanced: true })
    expect(region('Shape').getByText('No turning points were named.')).toBeVisible()
    await fireEvent.click(screen.getByRole('button', { name: 'Show details' }))
    expect(screen.getByRole('group', { name: 'three-act' })).toHaveAccessibleDescription('Not scored')
  })

  it('reveals every journey-level evidence scene, in order', async () => {
    const ids = ['scene_01AAAAAAAAAAAAAAAAAAAAAAAA', 'scene_01BBBBBBBBBBBBBBBBBBBBBBBB', 'scene_01CCCCCCCCCCCCCCCCCCCCCCCC']
    const journey = { beginning_state: 'Guarded', emotional_progression: 'Opens', final_state: 'Open', arc_quality: 'complete', turning_points: [], relationship_evolution: [], evidence_scene_ids: ids }
    const onRevealScene = vi.fn()
    render(StoryOverviewSide, { journeys: loaded([{ character: { id: 'character_a', name: 'MAYA' }, journey }]), selected: { kind: 'journey', index: 0 }, onRevealScene })
    const buttons = region('Evidence scenes').getAllByRole('button', { name: /Show in Scenes/ })
    expect(buttons).toHaveLength(3)
    for (const b of buttons) await fireEvent.click(b)
    expect(onRevealScene.mock.calls).toEqual(ids.map((id) => [id]))
  })
})
