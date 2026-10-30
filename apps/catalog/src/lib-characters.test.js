import { describe, expect, it } from 'vitest'
import {
  analysisMark,
  appearanceLabel,
  characterIdentity,
  characterRows,
  coAppearanceBars,
  formatShare,
  linePosition,
  voiceChoices,
} from '@khaos-machine/khaotik-ui/components/svelte/lib/characters.js'

// The Characters destination as data. Moved from Khaos App with its assertions intact
// (catalog app-coverage plan, T2): characters.test.ts, format.test.ts and the analysisMark case.

const voices = [
  { profileId: 'v-bella', name: 'Bella' },
  { profileId: 'v-ryan', name: 'Ryan (Qwen3-TTS-1.7B)' },
  { profileId: 'v-desmond', name: 'Desmond' },
  { profileId: 'v-madison', name: 'Madison' },
]

describe('the voice picker', () => {
  it('puts the same-named voice first and suggests it (audit §3.7)', () => {
    const { items, suggested } = voiceChoices('DESMOND', voices)
    expect(suggested).toBe('v-desmond')
    expect(items[0]?.id).toBe('v-desmond')
    expect(items.map((i) => i.id)).toEqual(['v-desmond', 'v-bella', 'v-ryan', 'v-madison'])
  })

  it('suggests nothing when no voice shares the name, and keeps the listing’s order', () => {
    const { items, suggested } = voiceChoices('FIFTH', voices)
    expect(suggested).toBe('')
    expect(items.map((i) => i.id)).toEqual(['v-bella', 'v-ryan', 'v-desmond', 'v-madison'])
  })

  it('matches the whole name, not a prefix', () => {
    expect(voiceChoices('DES', voices).suggested).toBe('')
  })
})

describe('the table rows', () => {
  const characters = [
    { id: 'c1', name: 'DESMOND', dialogue_lines: 299, scene_count: 31, percentage: 28.4 },
    { id: 'c2', name: 'JETTA', dialogue_lines: 213, scene_count: 28, percentage: 20.2 },
  ]
  const castings = [{ characterId: 'c1', voiceProfileId: 'v-desmond', voiceProfileName: 'Desmond' }]

  it('carries lines, scenes, share and the cast voice, and says when a character is not cast', () => {
    const rows = characterRows(characters, castings)
    expect(rows[0]).toMatchObject({ id: 'c1', name: 'DESMOND', lines: 299, scenes: 31, share: 28.4, cast: 'Desmond' })
    expect(rows[1]).toMatchObject({ id: 'c2', cast: 'Not cast' })
  })

  it('says nothing about the cast when the castings are not read', () => {
    expect(characterRows(characters, null)[1]?.cast).toBe('')
  })
})

describe('the Identity rows', () => {
  it('carry the stats the detail no longer repeats, "Named in" among them', () => {
    const c = { id: 'c1', name: 'DESMOND', dialogue_lines: 299, scene_count: 31, percentage: 28.43, mentionedSceneIds: ['s1', 's2'] }
    expect(characterIdentity(c)).toEqual([
      ['Lines', '299'],
      ['Scenes', '31'],
      ['Share', '28.4%'],
      ['Named in', '2 scenes'],
    ])
  })

  it('leaves out what the engine did not send', () => {
    expect(characterIdentity({ id: 'c2', name: 'GUARD' })).toEqual([
      ['Lines', '0'],
      ['Scenes', '0'],
    ])
  })
})

describe('a line’s position', () => {
  it('counts the speaker’s lines in the same scene, in order, from 1', () => {
    const lines = [
      { element_id: 'a', scene_id: 's1' },
      { element_id: 'b', scene_id: 's2' },
      { element_id: 'c', scene_id: 's2' },
      { element_id: 'd', scene_id: 's2' },
    ]
    expect(linePosition(lines, 'c')).toEqual({ n: 2, of: 3 })
    expect(linePosition(lines, 'gone')).toBeNull()
  })
})

describe('formatShare', () => {
  it('is one decimal and a percent sign, with no space, for every value', () => {
    expect([28.43, 15.1, 14.5, 1.25, 0.9, 0].map(formatShare)).toEqual(['28.4%', '15.1%', '14.5%', '1.3%', '0.9%', '0.0%'])
  })
})

describe('analysisMark', () => {
  it('marks current ready and stale stale, and an absent analysis with nothing', () => {
    expect(analysisMark({ state: 'current' })).toBe('ready')
    expect(analysisMark({ state: 'stale' })).toBe('stale')
    expect(analysisMark({ state: 'none' })).toBeNull()
    expect(analysisMark(undefined)).toBeNull()
  })
})

describe('appearanceLabel', () => {
  it('says each appearance state, and an unknown one as unavailable', () => {
    expect(appearanceLabel('portrait')).toBe('Selected character headshot')
    expect(appearanceLabel('none')).toBe('No appearance yet')
    expect(appearanceLabel('surprise')).toBe('Appearance status unavailable')
    expect(appearanceLabel(undefined)).toBe('Appearance status unavailable')
  })
})

describe('coAppearanceBars', () => {
  it("ranks the engine's co-characters most-first by its own frequency, and drops a nameless one", () => {
    const graph = { co_characters: [{ name: 'JETTA', frequency: 3 }, { name: '', frequency: 9 }, { name: 'DESMOND', frequency: 12 }] }
    expect(coAppearanceBars(graph)).toEqual([
      { label: 'DESMOND', value: 12 },
      { label: 'JETTA', value: 3 },
    ])
  })

  it('is empty when the engine measured none', () => {
    expect(coAppearanceBars(null)).toEqual([])
    expect(coAppearanceBars({})).toEqual([])
  })
})
