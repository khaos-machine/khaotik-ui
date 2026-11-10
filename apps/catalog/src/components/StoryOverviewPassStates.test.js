import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import captured from '../data/story-overview.json'

// A pass that stopped part way, or failed, never reads as complete (khaos-cloud #193), and failed
// turn naming reads as failed, not as not yet run (khaos-cloud #194). names.state is KSPD's
// (go/kspdprotocol/v0.136.1 schemas/KSPD/analysis/structure.schema.json, $defs.names); the
// per-pass partial is the Cloud engine's (crates/core/src/runner.rs, not-started | partial | done | stale).

const loaded = (data) => ({ kind: 'loaded', data })
const region = (name) => screen.getByRole('region', { name })
// The dashboard: a panel's summary carries the pass note; Show all opens its rows beneath the grid.
const panel = (name) => screen.getByRole('group', { name })
const showAll = (name) => fireEvent.click(screen.getByRole('button', { name: `Show all: ${name}` }))
const pill = (name) => screen.getByRole('button', { name }).closest('.ui-story-outline__row')

const journey = (id, name) => ({
  character: { id, name },
  journey: { beginning_state: 'b', final_state: `${name} ends.`, emotional_progression: 'p', arc_quality: 'complete', turning_points: [], relationship_evolution: [], evidence_scene_ids: [] },
})
// Three saved journeys from a pass that has not finished.
const saved = loaded([journey('a', 'MAYA'), journey('b', 'THEO'), journey('c', 'ROSA')])
const pairs = loaded([{ pairKey: 'a__b', characters: [{ id: 'a', name: 'MAYA' }, { id: 'b', name: 'THEO' }], analysis: { synthesis: { relationship_type: 'siblings', trajectory: 'From resentment to trust.' } } }])
const withNames = (names) => loaded({ ...captured.structure, names })

describe('a partial or failed Journeys or Relationships pass', () => {
  it('reads a partial Journeys pass as Incomplete in the outline, not Ready', () => {
    render(StoryOverviewOutline, { props: { journeys: saved, relationships: pairs, runs: { journeys: { kind: 'partial' } }, showPassStates: true } })
    expect(pill('Journeys')).toHaveTextContent('Incomplete')
    expect(pill('Journeys')).not.toHaveTextContent('Ready')
    expect(pill('Relationships')).toHaveTextContent('Ready')
  })

  it('shows the three saved journeys and says the pass is not finished', async () => {
    render(StoryOverview, { props: { journeys: saved, relationships: pairs, runs: { journeys: { kind: 'partial' } }, showPassStates: true } })
    expect(within(panel('Journeys')).getByRole('note')).toHaveTextContent("This pass hasn't finished, so some results are missing.")
    expect(within(panel('Relationships')).queryByRole('note')).toBeNull()
    await showAll('Journeys')
    expect(within(region('Journeys')).getAllByRole('button')).toHaveLength(3)
  })

  it('reads a failed Relationships pass as failed in the outline, not Ready', () => {
    render(StoryOverviewOutline, { props: { journeys: saved, relationships: pairs, runs: { relationships: { kind: 'failed', message: 'PAIR_TIMEOUT' } }, showPassStates: true } })
    expect(pill('Relationships')).toHaveTextContent("Didn't finish")
    expect(pill('Relationships')).not.toHaveTextContent('Ready')
    expect(pill('Journeys')).toHaveTextContent('Ready')
  })

  it('says a failed Relationships pass did not finish, with its message, beside what was saved', async () => {
    render(StoryOverview, { props: { journeys: saved, relationships: pairs, runs: { relationships: { kind: 'failed', message: 'PAIR_TIMEOUT' } }, showPassStates: true } })
    expect(within(panel('Relationships')).getByText("This analysis didn't finish.")).toBeVisible()
    expect(within(panel('Relationships')).getByText('PAIR_TIMEOUT')).toBeVisible()
    await showAll('Relationships')
    expect(within(region('Relationships')).getByRole('button', { name: 'MAYA and THEO' })).toBeVisible()
  })

  it('still reads running over a partial result', () => {
    render(StoryOverviewOutline, { props: { journeys: saved, relationships: pairs, runs: { journeys: { kind: 'running' } }, showRunning: true } })
    expect(pill('Journeys')).toHaveTextContent('Running')
  })
})

describe('failed turn naming', () => {
  it('says naming failed, distinct from not yet named', () => {
    const { unmount } = render(StoryOverview, { props: { structure: withNames({ state: 'failed' }), showPassStates: true } })
    expect(within(region('Shape')).getByText("Naming the turning points didn't finish.")).toBeVisible()
    expect(within(region('Shape')).queryByText("The turning points haven't been named yet.")).toBeNull()
    unmount()
    render(StoryOverview, { props: { structure: withNames({ state: 'not-run' }), showPassStates: true } })
    expect(within(region('Shape')).getByText("The turning points haven't been named yet.")).toBeVisible()
    expect(within(region('Shape')).queryByText("Naming the turning points didn't finish.")).toBeNull()
  })

  it('reads failed naming as failed in the outline, not yet named as Not ready, named as Ready', () => {
    const { unmount } = render(StoryOverviewOutline, { props: { structure: withNames({ state: 'failed' }), turnsTitle: 'Turns', showPassStates: true } })
    expect(pill('Turns')).toHaveTextContent("Didn't finish")
    expect(pill('Shape')).toHaveTextContent('Ready')
    unmount()
    const second = render(StoryOverviewOutline, { props: { structure: withNames({ state: 'not-run' }), turnsTitle: 'Turns', showPassStates: true } })
    expect(pill('Turns')).toHaveTextContent('Not ready')
    second.unmount()
    render(StoryOverviewOutline, { props: { structure: loaded(captured.structure), turnsTitle: 'Turns', showPassStates: true } })
    expect(pill('Turns')).toHaveTextContent('Ready')
  })
})
