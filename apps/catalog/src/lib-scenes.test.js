import { describe, expect, it } from 'vitest'
import { sceneAccount, sceneRows, screenplayElements } from '@khaos-machine/khaotik-ui/components/svelte/lib/scenes.js'

// The data layer's Scenes section (data-layer plan A4; audit §1.6, §3.13). Moved from Khaos App
// with its assertions intact (catalog app-coverage plan, T3).

/** @param {number} i @param {Record<string, unknown>} [extra] */
const scene = (i, extra = {}) =>
  ({
    id: `scn_${i}`,
    index: i,
    slugline: `INT. ROOM ${i} - DAY`,
    type: 'INT',
    timeOfDay: 'DAY',
    word_count: 10 * i,
    line_count: i,
    durationMs: 1000,
    dialogue_counts: {},
    dialogue_word_counts: {},
    scene_take_count: 0,
    line_take_count: 0,
    analysis_title: '',
    ...extra,
  })

describe('the scene rows', () => {
  it('numbers every scene from 1 and keeps all 57 of B4P addressable', () => {
    const rows = sceneRows(Array.from({ length: 57 }, (_, i) => scene(i)))
    expect(rows).toHaveLength(57)
    expect(rows[0]).toMatchObject({ id: 'scn_0', n: 1, slugline: 'INT. ROOM 0 - DAY', setting: 'INT', time: 'DAY', words: 0, lines: 0 })
    expect(rows[56]?.n).toBe(57)
  })

  it('marks a scene with a read as ready, and leaves one with none absent, never "missing"', () => {
    const [read, none] = sceneRows([scene(1, { scene_take_count: 2, line_take_count: 6 }), scene(2)])
    expect(read).toMatchObject({ read: 'ready', reads: 2, takes: 6 })
    expect(none?.read).toBeNull()
  })

  it('carries the title the scene\'s analysis gave it, and none for an unanalysed scene', () => {
    const [analysed, unanalysed] = sceneRows([scene(1, { analysis_title: 'Locked Out' }), scene(2)])
    expect(analysed).toMatchObject({ title: 'Locked Out', slugline: 'INT. ROOM 1 - DAY' })
    expect(unanalysed?.title).toBe('')
  })

  it('keeps a scene with no index unnumbered rather than inventing one', () => {
    const { index: _dropped, ...unnumbered } = scene(3)
    expect(sceneRows([unnumbered])[0]?.n).toBeNull()
  })
})

describe('the scene text', () => {
  const segment = {
    kind: 'scene',
    sceneId: 'scn_48',
    label: "INT. DESMOND'S APARTMENT - NIGHT",
    startMs: 0,
    durationMs: 8000,
    events: [
      { elementType: 'action', elementId: 'act_1', text: 'Des is watching a late movie.' },
      { elementType: 'dialogue', elementId: 'dia_1', text: 'Hello', characterId: 'chr_des', characterName: 'DESMOND', parenthetical: '(sleepy)' },
      { elementType: 'transition', elementId: 'tr_1', text: 'JUMP CUT TO:' },
    ],
  }

  it('is the slugline, then each element as written, with a cue and a parenthetical before a line', () => {
    expect(screenplayElements(segment).map((e) => [e.kind, e.text])).toEqual([
      ['slugline', "INT. DESMOND'S APARTMENT - NIGHT"],
      ['action', 'Des is watching a late movie.'],
      ['character', 'DESMOND'],
      ['parenthetical', '(sleepy)'],
      ['dialogue', 'Hello'],
      ['transition', 'JUMP CUT TO:'],
    ])
  })

  it('keeps the engine’s element id on each line, so a selection names a real element', () => {
    const ids = screenplayElements(segment).map((e) => e.id)
    expect(ids).toContain('act_1')
    expect(ids).toContain('dia_1')
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('a scene’s accounts', () => {
  it('joins the ids the row serves to names, and drops one the lists do not hold', () => {
    const s = scene(4, { locationId: 'loc_1', nonSpeaking: ['c2'], mentioned: ['c3', 'gone'], objects: ['o1'], mentionedObjects: ['o2'], mentionedLocations: ['loc_2'] })
    const account = sceneAccount(s, {
      characters: [{ id: 'c2', name: 'JETTA' }, { id: 'c3', name: 'MADISON' }],
      locations: [{ id: 'loc_1', name: "DESMOND'S APARTMENT" }, { id: 'loc_2', name: 'AIRPORT' }],
      objects: [{ id: 'o1', name: 'phone' }, { id: 'o2', name: 'car' }],
    })
    expect(account).toEqual({
      location: "DESMOND'S APARTMENT",
      nonSpeaking: [{ id: 'c2', name: 'JETTA' }],
      mentioned: [{ id: 'c3', name: 'MADISON' }],
      named: [{ id: 'o2', name: 'car' }, { id: 'loc_2', name: 'AIRPORT' }],
      objects: [{ id: 'o1', name: 'phone' }],
    })
  })
})
