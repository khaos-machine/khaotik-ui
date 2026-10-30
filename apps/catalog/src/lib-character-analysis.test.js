import { describe, expect, it } from 'vitest'
import { characterAnalysisView } from '@khaos-machine/khaotik-ui/components/svelte/lib/character-analysis.js'

// Moved from Khaos App with its assertions intact (catalog app-coverage plan, T2).
// The shape khaos-tools' character analysis stores, read from a scratch khaosd's
// /api/dashboard/detail for B4P's Desmond on 2026-10-11.
const served = {
  story: {
    summary: 'Desmond grieves his brother.',
    role: { weight: 'main', function: 'He drives the plot.' },
    want: { goal: 'Find the killer.', obstacle: 'His past.', scenes: ['S2', 'S9'] },
    arc: {
      shape: 'changes',
      start: { state: 'He mourns.', scenes: ['S1'] },
      end: { state: 'He takes Ray at gunpoint.', scenes: ['S9'] },
      turns: [{ scene: 'S2', kind: 'realisation', change: 'He learns Pop was killed.' }],
    },
    relationships: [{ with: 'C1', name: 'MADISON', basis: 'recurring', nature: 'close', development: 'He carries her out.', scenes: ['S1', 'S2'] }],
  },
  casting: {
    appearance: { casting_note: 'A worn man.', stated: [{ detail: 'Black', scenes: ['S1'] }], changes: [], suggested: [{ detail: '30s', rests_on: 'a long past' }] },
    demographics: { gender: { value: 'male', basis: 'stated', scenes: ['S1'] }, age: { value: 'not stated', basis: 'not stated', scenes: [] } },
    voice: { manner: 'Direct.', habits: ['Blunt'], scenes: [] },
    voice_profile: {
      design_note: 'Weary, clipped.',
      register: 'casual',
      pace: 'measured',
      energy: 'low',
      talks: 'a lot',
      accent: { value: 'not stated', scenes: [] },
      audition_lines: [{ line: "I can't lose her", scene: 'S9' }],
      suggested: [],
    },
  },
  ties: {
    pending: [
      {
        record: 'P1',
        tie: 'brother',
        why: 'The dead man at the funeral.',
        people: [
          { lines: ['L1'], reading: 'character', who: 'C14', name: 'POP', decided_by: 'review' },
          { lines: ['L2'], reading: 'character', who: 'C14', name: 'POP', decided_by: 'decision', probability: 0.95 },
        ],
        lines: [
          { label: 'L1', scene: 'S1', wording: 'his baby brother', text: 'He is holding the hand of the deceased.' },
          { label: 'L2', scene: 'S2', speaker: 'DESMOND', wording: 'my little brother', text: 'My little brother.' },
        ],
      },
      { record: 'P3', tie: 'mother', why: '', people: [{ lines: ['L1'], reading: 'offscreen', who: '', decided_by: 'analysis' }], lines: [{ label: 'L1', scene: 'S2', speaker: 'JETTA', wording: 'your mother', text: 'How is your mother?' }] },
    ],
  },
  _response_review: { story: ['6 turns; at most five were asked for'], casting: [], ties: [] },
  _scenes: { S1: { id: 'scene_a', number: 1, slugline: 'INT. FUNERAL HOME' }, S2: { id: 'scene_b', number: 4, slugline: 'EXT. GATE' }, S9: { id: 'scene_c', number: 57, slugline: 'EXT. QUEENS' } },
  _provenance: { fingerprint: 'abc', input: { prompt: { id: 'character-story', version: '1.0.0' } }, made_by: { provider: 'openrouter', model: 'deepseek/deepseek-v4.1-flash' } },
}

describe('characterAnalysisView', () => {
  const view = characterAnalysisView(served)

  it("cites scenes by the script's number, not the request's label", () => {
    // S9 is the ninth scene the character is in, and scene 57 of the script.
    expect(view.arc.end.scenes).toBe('Sc 57')
    expect(view.want.scenes).toBe('Sc 4, Sc 57')
    expect(view.arc.turns[0]).toEqual({ scene: 'Sc 4', kind: 'realisation', change: 'He learns Pop was killed.' })
    expect(view.voiceProfile?.auditionLines[0]?.scene).toBe('Sc 57')
  })

  it("turns a scene label inside a sentence into the script's number too", () => {
    const v = characterAnalysisView({
      story: { summary: 'In S2 he vows revenge; by S9 he has Ray.', relationships: [{ with: 'C1', development: 'They argue (S2).' }] },
      casting: { appearance: { suggested: [{ detail: 'tired', rests_on: 'He weeps in S1, and in S99.' }] } },
      _scenes: served._scenes,
    })
    expect(v.summary).toBe('In Sc 4 he vows revenge; by Sc 57 he has Ray.')
    expect(v.relationships[0].development).toBe('They argue (Sc 4).')
    // A label the analysis does not explain is left as written.
    expect(v.appearance.suggested[0].restsOn).toBe('He weeps in Sc 1, and in S99.')
  })

  it('names a relationship by the character, and keeps a label only when no name was stored', () => {
    expect(view.relationships[0]).toMatchObject({ name: 'MADISON', basis: 'recurring', scenes: 'Sc 1, Sc 4' })
    expect(characterAnalysisView({ story: { relationships: [{ with: 'C2' }] } }).relationships[0].name).toBe('C2')
  })

  it('says who each tie line means, who settled it, and shows the line', () => {
    const [brother, mother] = view.ties
    expect(brother.tie).toBe('brother')
    expect(brother.people.map((p) => [p.who, p.decidedBy])).toEqual([
      ['POP', 'Review'],
      ['POP', 'Decision model 0.95'],
    ])
    expect(brother.people[1].lines[0]).toEqual({ scene: 'Sc 4', speaker: 'DESMOND', wording: 'my little brother', text: 'My little brother.' })
    expect(mother.people[0]).toMatchObject({ who: 'Never brought on', decidedBy: 'Analysis' })
  })

  it('shows what the script does not state as nothing', () => {
    expect(view.demographics).toEqual({ gender: 'male', age: '' })
    expect(view.voiceProfile?.accent).toBe('')
  })

  it("carries the engine's own findings and what made the analysis", () => {
    expect(view.review).toEqual([{ reading: 'story', finding: '6 turns; at most five were asked for' }])
    expect(view.madeBy).toEqual({ process: 'character-story 1.0.0', model: 'deepseek/deepseek-v4.1-flash · openrouter', fingerprint: 'abc' })
  })

  it('is null for no analysis and for one in the shape the engine no longer writes', () => {
    expect(characterAnalysisView(null)).toBeNull()
    expect(characterAnalysisView({ name: 'FIONA', analysis: { profile: {} } })).toBeNull()
  })

  it('reads a character who never speaks', () => {
    const silent = characterAnalysisView({ story: { summary: 's' }, casting: { voice: null, voice_profile: null } })
    expect(silent.voice).toBeNull()
    expect(silent.voiceProfile).toBeNull()
  })
})
