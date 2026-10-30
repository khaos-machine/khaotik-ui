import { describe, expect, it } from 'vitest'
import { placeAnalysisView } from '@khaos-machine/khaotik-ui/components/svelte/lib/place-analysis.js'

// Moved from Khaos App with its assertions intact (catalog app-coverage plan, T4).

// The shape khaos-tools stores for a place (measured on B4P's FIFTH'S LOFT, 2026-10-11).
const loft = {
  _scenes: { S1: { number: 18, slugline: "EXT. FIFTH'S LOFT - NIGHT" }, S2: { number: 21, slugline: "INT/EXT. FIFTH'S LOFT - DAY" } },
  _facts: {
    scenes: [{ label: 'S1' }, { label: 'S2' }],
    interior_exterior: { EXT: 1, INT: 7 },
    time_of_day: { DAY: 5, NIGHT: 4 },
    parts: [{ id: 'l2', name: 'ROOFTOP', scenes: 1 }],
    spoken_of: [],
  },
  _response_review: { mentions: ['W19 L1: Review bound this wording to JASON\'S APARTMENT'], story: [] },
  story: {
    summary: "Fifth's loft is where Fifth lives; in S2 Madison confronts him.",
    role: { weight: 'main', function: 'The home base.' },
    events: [{ scene: 'S2', what: 'Madison confronts Fifth.' }],
    change: { kind: 'state', what: 'It empties.', scenes: ['S2'], phases: [{ state: 'lived in', scenes: ['S1'] }, { state: 'empty', scenes: ['S2'] }] },
  },
  setting: {
    atmosphere: 'Luxurious.',
    stated: [{ detail: 'a loft', scenes: ['S1', 'S2'] }],
    changes: [],
    suggested: [{ detail: 'Modern.', rests_on: 'S2' }],
  },
  mentions: {
    wordings: [
      {
        record: 'W1', wording: 'his brownstone', why: 'x',
        lines: [{ label: 'L1', scene: 'S1', text: 'He pulls up to his brownstone.' }],
        readings: [{ lines: ['L1'], reading: 'other_place', which: 'O7', name: "DESMOND'S APARTMENT", decided_by: 'analysis' }],
      },
      {
        record: 'W2', wording: 'the lobby', why: 'x',
        lines: [{ label: 'L1', scene: 'S1', text: 'They walk into the lobby.' }],
        readings: [{ lines: ['L1'], reading: 'part_of_this_place', which: '', decided_by: 'both', probability: 0.88 }],
      },
      {
        record: 'W3', wording: 'the street', why: 'x',
        lines: [{ label: 'L1', scene: 'S2', text: 'Out on the street.' }],
        readings: [{ lines: ['L1'], reading: 'elsewhere', which: 'the street', decided_by: 'analysis' }],
      },
    ],
  },
  connections: [
    { a: 'O22', a_name: 'ROOFTOP', b: 'THIS', b_name: "FIFTH'S LOFT", relation: 'inside', decided_by: 'mention', probability: 0.93, evidence: [{ scene: 'S2', words: 'exits the roof' }] },
    { a: 'THIS', a_name: "FIFTH'S LOFT", b: 'O3', b_name: "SIDNEY'S APARTMENT", relation: 'above', decided_by: 'decision', probability: 0.95, evidence: [] },
  ],
}

describe('placeAnalysisView', () => {
  const view = placeAnalysisView(loft)

  it('shows the story with scene labels as the script’s numbers, in lists and in prose', () => {
    expect(view.summary).toBe("Fifth's loft is where Fifth lives; in Sc 21 Madison confronts him.")
    expect(view.events).toEqual([{ scene: 'Sc 21', what: 'Madison confronts Fifth.' }])
    expect(view.change.phases).toEqual([{ state: 'lived in', scenes: 'Sc 18' }, { state: 'empty', scenes: 'Sc 21' }])
    expect(view.role).toEqual({ weight: 'main', does: 'The home base.' })
  })

  it('gives the engine’s counts, largest first', () => {
    expect(view.facts).toEqual({ scenes: 2, interiorExterior: 'INT 7 · EXT 1', timeOfDay: 'DAY 5 · NIGHT 4', parts: ['ROOFTOP'], spokenOf: 0 })
  })

  it('says what each wording means and who read it', () => {
    expect(view.mentions.map((m) => [m.wording, m.readings[0].means, m.readings[0].decidedBy])).toEqual([
      ['his brownstone', "DESMOND'S APARTMENT", 'Analysis'],
      ['the lobby', 'Part of this place', 'Both readers 0.88'],
      ['the street', 'Elsewhere: the street', 'Analysis'],
    ])
    expect(view.mentions[0].readings[0].lines).toEqual([{ scene: 'Sc 18', text: 'He pulls up to his brownstone.' }])
  })

  it('states each connection as a sentence, with who decided it and the lines', () => {
    expect(view.connections).toEqual([
      { sentence: "ROOFTOP is inside FIFTH'S LOFT", decidedBy: 'Mentions 0.93', evidence: [{ scene: 'Sc 21', words: 'exits the roof' }] },
      { sentence: "FIFTH'S LOFT is above SIDNEY'S APARTMENT", decidedBy: 'Decision model 0.95', evidence: [] },
    ])
  })

  it('carries the engine’s own findings and no change kind for "none"', () => {
    expect(view.review).toEqual([{ reading: 'mentions', finding: "W19 L1: Review bound this wording to JASON'S APARTMENT" }])
    expect(placeAnalysisView({ story: { change: { kind: 'none' }, source: 'scene' } })).toMatchObject({ change: { kind: '' }, fromScene: true })
  })

  // The shape khaos-tools wrote before 0.66: one flat object with `description`, `atmosphere`…
  it('is null for an analysis in the older shape, and for none', () => {
    expect(placeAnalysisView({ description: 'A loft', atmosphere: 'dark' })).toBeNull()
    expect(placeAnalysisView(null)).toBeNull()
  })
})
