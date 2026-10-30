import { describe, expect, it } from 'vitest'
import { sceneAnalysisView, suggestionWords } from '@khaos-machine/khaotik-ui/components/svelte/lib/scene-analysis.js'

// Moved from Khaos App with its assertions intact (catalog app-coverage plan, T3).

// The approved first-scene artifact's shape (B4P scene 1, khaos-tools v0.58.0), trimmed.
const artifact = {
  title: 'Locked Out',
  summary: 'Madison finds an eviction notice.',
  pacing: 'fast',
  narrative: { themes: ['eviction', 'isolation'], plot_beats: ['She finds the notice.'], emotional_tone: 'tense, desperate', story_role: 'setup' },
  speaking_characters: [{ name: 'MADISON', goal: 'To get inside', emotional_state: 'shocked' }],
  character_interactions: [
    { from: 'MADISON', to: 'JASON', interaction_type: 'support', emotional_valence: 'negative', significance: 'high', description: 'She calls Jason.' },
  ],
  arc_moments: [{ character: 'MADISON', arc_type: 'revelation', milestone_type: 'inciting', emotional_shift: 'expectant to shocked', description: 'She is evicted.' }],
  pending_suggestions: [{ record_id: 'appear_1', suggestion: 'bind', bind_to: 'object_lock', evidence_event_ids: ['action_1'] }],
  _pending_suggestions: [
    { record_id: 'appear_1', suggestion: 'bind', bind_to: 'object_lock', evidence_event_ids: ['action_1'], kind: 'object appearance', outcome: 'accepted' },
    { record_id: 'ref_2', suggestion: 'new', bind_to: '', evidence_event_ids: ['action_9'], kind: 'reference', outcome: 'rejected', reason: 'evidence outside this scene' },
  ],
  _provenance: {
    input: {
      prompt: { id: 'scene-analysis-first', version: '2.0.0', hash: 'sha256:p' },
      story_data: { change_id: 'change_1', sha256: 'sha256:s' },
      scene_text_sha256: 'sha256:t',
    },
    fingerprint: 'sha256:f',
  },
}

const lookup = {
  names: [{ id: 'object_lock', name: 'lock' }],
  lines: new Map([['action_1', 'There is a chain and lock on the door.']]),
}

describe('sceneAnalysisView', () => {
  it('shows every part of the body the engine serves', () => {
    const v = sceneAnalysisView(artifact, lookup)
    expect(v).toMatchObject({ title: 'Locked Out', summary: 'Madison finds an eviction notice.', pacing: 'fast', tone: 'tense, desperate', role: 'setup' })
    expect(v.themes).toEqual(['eviction', 'isolation'])
    expect(v.beats).toEqual(['She finds the notice.'])
    expect(v.speakers).toEqual([{ name: 'MADISON', goal: 'To get inside', state: 'shocked' }])
    expect(v.interactions[0]).toMatchObject({ from: 'MADISON', to: 'JASON', type: 'support', description: 'She calls Jason.' })
    expect(v.arcMoments[0]).toMatchObject({ character: 'MADISON', type: 'revelation', milestone: 'inciting', shift: 'expectant to shocked' })
  })

  it('lists every reviewed suggestion with its outcome and reason, and its evidence line', () => {
    const [accepted, rejected] = sceneAnalysisView(artifact, lookup).suggestions
    expect(accepted).toMatchObject({ recordId: 'appear_1', kind: 'object appearance', words: 'bind to lock', outcome: 'accepted', reason: '' })
    expect(accepted.evidence).toEqual(['There is a chain and lock on the door.'])
    expect(rejected).toMatchObject({ recordId: 'ref_2', words: 'new', outcome: 'rejected', reason: 'evidence outside this scene' })
    // An event the scene does not hold is named by its id, never dropped.
    expect(rejected.evidence).toEqual(['action_9'])
  })

  it('names the process that made it, and no model on an analysis from before it was recorded', () => {
    expect(sceneAnalysisView(artifact, lookup).provenance).toEqual({
      process: 'scene-analysis-first 2.0.0',
      model: null,
      storyDataChange: 'change_1',
      fingerprint: 'sha256:f',
    })
  })

  it('names the model and provider an analysis records', () => {
    const made = { ...artifact, _provenance: { ...artifact['_provenance'], made_by: { provider: 'openrouter', model: 'deepseek/deepseek-v4.1-flash', producer_version: 'khaos-tools 0.64.0' } } }
    expect(sceneAnalysisView(made, lookup).provenance.model).toBe('deepseek/deepseek-v4.1-flash · openrouter')
  })

  it('is absent when the engine sends no analysis', () => {
    expect(sceneAnalysisView(undefined, lookup)).toBeNull()
  })
})

describe('suggestionWords', () => {
  it('words each closed suggestion, and a bind by its target', () => {
    expect(suggestionWords('bind', 'object_x', [])).toBe('bind to object_x')
    expect(suggestionWords('not_present', '', [])).toBe('not present')
    expect(suggestionWords('cannot_tell', '', [])).toBe('cannot tell from this scene')
  })
})
