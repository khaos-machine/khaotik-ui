import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import SceneAnalysis from '@khaos-machine/khaotik-ui/components/svelte/SceneAnalysis.svelte'
import SceneDetail from '@khaos-machine/khaotik-ui/components/svelte/SceneDetail.svelte'
import SceneSide from '@khaos-machine/khaotik-ui/components/svelte/SceneSide.svelte'
import SceneTable from '@khaos-machine/khaotik-ui/components/svelte/SceneTable.svelte'
import destination from '../data/scenes-destination.json'

// Khaos App's Scenes panes, moved into the kit (catalog app-coverage plan, T3). Each is checked
// for what it reports and for its empty state; the host's models stay in the app. The
// SceneAnalysis cases are the app's, fed the artifact khaosd serves rather than its view.

// The approved first-scene artifact's shape (B4P scene 1, khaos-tools v0.58.0), trimmed.
const artifact = {
  title: 'Locked Out',
  summary: 'Madison finds an eviction notice.',
  pacing: 'fast',
  narrative: { themes: ['eviction'], plot_beats: ['She finds the notice.'], emotional_tone: 'tense', story_role: 'setup' },
  _pending_suggestions: [
    { record_id: 'ref_2', suggestion: 'new', bind_to: '', evidence_event_ids: ['action_9'], kind: 'reference', outcome: 'rejected', reason: 'evidence outside this scene' },
  ],
  _provenance: { input: { prompt: { id: 'scene-analysis-first', version: '2.0.0' }, story_data: { change_id: 'change_1' } }, fingerprint: 'sha256:f' },
}

describe('SceneAnalysis', () => {
  it('renders a served suggestion with its reason and no control to decide it', () => {
    render(SceneAnalysis, { props: { analysis: artifact, standing: { state: 'current', reasons: [], details: [] } } })
    const section = /** @type {HTMLElement} */ (document.querySelector('[data-ui-id^="story.analysis.suggestions"]'))
    expect(within(section).getByText('evidence outside this scene')).toBeTruthy()
    expect(within(section).getByText('rejected')).toBeTruthy()
    expect(within(section).queryAllByRole('button').filter((b) => !b.getAttribute('aria-expanded'))).toEqual([])
  })

  it('keeps a stale analysis visible, marked stale with what changed', () => {
    render(SceneAnalysis, { props: { analysis: artifact, standing: { state: 'stale', reasons: ['stage 1 story data changed'], details: ['a Stage 1 record changed'] } } })
    expect(screen.getByText('stage 1 story data changed')).toBeTruthy()
    expect(screen.getByText('a Stage 1 record changed')).toBeTruthy()
    expect(screen.getByText('Locked Out')).toBeTruthy()
  })

  it('names the process that made it and says the model is not recorded', () => {
    render(SceneAnalysis, { props: { analysis: artifact } })
    expect(screen.getByText('scene-analysis-first 2.0.0')).toBeTruthy()
    expect(screen.getByText('Not recorded in the analysis')).toBeTruthy()
  })

  it("shows the engine's refusal where there is no analysis", () => {
    render(SceneAnalysis, { props: { analysis: null, standing: { state: 'none', reasons: [], details: [], refusal: 'scene 2 is not analysed: …' } } })
    expect(screen.getByText('scene 2 is not analysed: …')).toBeTruthy()
  })

  it('draws the captured analysis of the first scene', () => {
    render(SceneAnalysis, { props: { analysis: destination.focus.analysis } })
    expect(screen.getByText(/** @type {string} */ (destination.focus.analysis.title))).toBeTruthy()
  })
})

describe('SceneTable', () => {
  it('has a Read and an Analysis column, and a row for every captured scene', () => {
    render(SceneTable, { props: { scenes: destination.scenes } })
    expect(screen.getByRole('grid', { name: 'Scenes' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Read' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'An' })).toBeInTheDocument()
  })

  it('is a table that says so for a story with no scenes', () => {
    render(SceneTable, { props: { scenes: [] } })
    expect(screen.getByText('This story has no scenes.')).toBeInTheDocument()
  })
})

const scene = { id: 'scn_1', index: 0, slugline: 'INT. LOFT - DAY', type: 'INT', timeOfDay: 'DAY', word_count: 40, line_count: 3, locationId: 'loc_1', dialogue_counts: { c1: 2, c2: 1 }, nonSpeaking: ['c3'] }
const segment = {
  kind: 'scene',
  sceneId: 'scn_1',
  label: 'INT. LOFT - DAY',
  events: [
    { elementType: 'action', elementId: 'act_1', text: 'Madison paints.' },
    { elementType: 'dialogue', elementId: 'dia_1', text: 'Hello', characterId: 'c1', characterName: 'MADISON' },
  ],
}
const lists = {
  characters: [{ id: 'c1', name: 'MADISON' }, { id: 'c2', name: 'FIFTH' }, { id: 'c3', name: 'JETTA' }],
  locations: [{ id: 'loc_1', name: 'THE LOFT' }],
  objects: [],
}
/** @param {string} text */
const snippet = (text) => createRawSnippet(() => ({ render: () => `<p>${text}</p>` }))

describe('SceneDetail', () => {
  it('shows the scene as selectable lines and reports the one chosen', async () => {
    const onselectline = vi.fn()
    render(SceneDetail, { props: { scene, segment, onselectline } })
    await fireEvent.click(screen.getByText('Madison paints.'))
    expect(onselectline).toHaveBeenCalledWith('act_1')
  })

  it('offers a Read view only while a read is open, and opens it when the read does', () => {
    const { unmount } = render(SceneDetail, { props: { scene, segment } })
    expect(screen.queryByRole('radio', { name: 'Read' })).toBeNull()
    unmount()
    render(SceneDetail, { props: { scene, segment, readOpen: true, readOpening: true, read: snippet('the read timeline') } })
    expect(screen.getByRole('radio', { name: 'Read' })).toBeInTheDocument()
    expect(screen.getByText('the read timeline')).toBeInTheDocument()
  })

  it("shows the engine's raw text when the scene has no composition", () => {
    render(SceneDetail, { props: { scene, segment: null, sceneText: { kind: 'text', text: 'FADE IN.' } } })
    expect(screen.getByText('FADE IN.')).toBeInTheDocument()
  })

  it('is empty with no scene selected', () => {
    render(SceneDetail, { props: { scene: null } })
    expect(screen.getByText('No scene selected')).toBeInTheDocument()
  })
})

describe('SceneSide', () => {
  it('names the location, who speaks most-first and who is present, silent', () => {
    render(SceneSide, { props: { scene, ...lists } })
    expect(screen.getByText('THE LOFT')).toBeInTheDocument()
    const speakers = within(/** @type {HTMLElement} */ (document.querySelector('[data-ui-id^="story.inspector.speakers"]')))
    expect(speakers.getByText('MADISON')).toBeInTheDocument()
    expect(speakers.getByText('FIFTH')).toBeInTheDocument()
    expect(screen.getByText('JETTA')).toBeInTheDocument()
  })

  it("shows the host's line inspector in place of the scene while a line is selected", () => {
    render(SceneSide, { props: { scene, ...lists, line: snippet('the line inspector') } })
    expect(screen.getByText('the line inspector')).toBeInTheDocument()
    expect(screen.queryByText('THE LOFT')).toBeNull()
  })

  it("puts the host's reads under Scene reads, and leaves the section out without them", () => {
    const { unmount } = render(SceneSide, { props: { scene, ...lists, reads: snippet('the reads') } })
    expect(screen.getByText('the reads')).toBeInTheDocument()
    unmount()
    render(SceneSide, { props: { scene, ...lists } })
    expect(screen.queryByText('Scene reads')).toBeNull()
  })

  it('is empty with nothing selected', () => {
    const { container } = render(SceneSide, { props: { scene: null } })
    expect(container.textContent?.trim()).toBe('')
  })
})
