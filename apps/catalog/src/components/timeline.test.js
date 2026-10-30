import { describe, it, expect } from 'vitest'
import {
  buildLanes,
  buildTimeline,
  elementAt,
  formatTimecode,
  segmentAt,
} from '@khaos-machine/khaotik-ui/components/svelte/lib/timeline.js'
import compositionData from '../data/composition.json'

// The composition → timeline projection behind StoryPlayer. Pure maths, so it is tested
// on its own: a wrong cumulative start is invisible in a screenshot and obvious here.
//
// Shapes and numbers come from khaosd's GET /api/dashboard/composition on real projects.
//
// khaosd 0.11.0 renamed the screen-time keys: `duration` -> `durationMs`, `start` ->
// `startMs`, integer milliseconds, and the old keys are GONE (#124). Every fixture below
// is on the new shape. A fixture left on the old one would be asserting that the retired
// contract still works, which is the defect rather than the guard.

/** The first two segments of "Heart of an Indie", verbatim durations, on the 0.11.0 wire. */
const REAL = [
  {
    kind: 'scene',
    sceneId: 'scn_01KJXE766H5SM1VDJ7CFEJQ3CQ',
    label: 'EXT. BROOKLYN STREET - GOLDEN HOUR',
    startMs: 0,
    durationMs: 32000,
    events: [
      { elementType: 'action', elementId: 'e1', durationMs: 20000 },
      { elementType: 'dialogue', elementId: 'e2', durationMs: 11000, characterName: 'FIONA' },
      { elementType: 'action', elementId: 'e3', durationMs: 1000 },
    ],
  },
  {
    kind: 'scene',
    sceneId: 'scn_01KJXE766HNC1VZRF62JZH3DQ4',
    label: "INT. FIONA'S CRAPPY APARTMENT - NIGHT",
    startMs: 32000,
    durationMs: 46000,
    events: [
      { elementType: 'action', elementId: 'e4', durationMs: 25000 },
      { elementType: 'dialogue', elementId: 'e5', durationMs: 21000 },
    ],
  },
]

describe('buildTimeline', () => {
  it('keeps the catalog capture on the RFC 0069 wire shape', () => {
    expect(compositionData.segments.length).toBeGreaterThan(0)
    for (const segment of compositionData.segments) {
      expect(segment).toHaveProperty('durationMs')
      expect(segment).toHaveProperty('startMs')
      expect(segment).not.toHaveProperty('duration')
      expect(segment).not.toHaveProperty('start')
    }
  })

  it('lays segments back-to-back from zero', () => {
    const t = buildTimeline(REAL)
    expect(t.segments.map((s) => s.start)).toEqual([0, 32])
    expect(t.total).toBe(78)
  })

  it('gives every element an ABSOLUTE start', () => {
    // The bug this guards: element starts relative to their segment look correct in
    // isolation and put every bar after scene 1 in the wrong place.
    const t = buildTimeline(REAL)
    expect(t.segments[0].events.map((e) => e.start)).toEqual([0, 20, 31])
    expect(t.segments[1].events.map((e) => e.start)).toEqual([32, 57])
  })

  it('keeps the engine fields on the way through', () => {
    const t = buildTimeline(REAL)
    expect(t.segments[0].events[1]).toMatchObject({
      elementType: 'dialogue',
      elementId: 'e2',
      characterName: 'FIONA',
    })
    expect(t.segments[0].label).toBe('EXT. BROOKLYN STREET - GOLDEN HOUR')
    // The raw millisecond fields survive the spread, so a consumer that wants
    // milliseconds has them under the name that says so (§3e).
    expect(t.segments[0].durationMs).toBe(32000)
    expect(t.segments[0].startMs).toBe(0)
  })

  it('takes the segment duration from the wire, never from the sum of its elements', () => {
    // Deriving a segment's duration from its elements lets one bad element silently
    // resize the scene. Position is a separate question and comes from `startMs` — see
    // "uses startMs for position" below.
    const t = buildTimeline([
      { kind: 'scene', startMs: 0, durationMs: 100000, events: [{ elementId: 'a', durationMs: 10000 }] },
      { kind: 'scene', startMs: 100000, durationMs: 5000, events: [] },
    ])
    expect(t.segments[0].duration).toBe(100)
    expect(t.segments[1].start).toBe(100)
    expect(t.total).toBe(105)
  })

  // T1 — the criterion test for #124.
  it('reports a segment whose durationMs key is ABSENT rather than sizing it zero (#124)', () => {
    // RFC 0069 §3.1.1: presence is the only thing that separates "measured at zero"
    // from "I am reading a version that does not carry this key".
    const t = buildTimeline([{ kind: 'scene', sceneId: 'scn_1', label: 'A', duration: 32, start: 0, events: [] }])
    // The positive half — this is a real segment and it is NOT silently dropped.
    expect(t.unreadable).toHaveLength(1)
    expect(t.unreadable[0]).toMatchObject({ index: 0, key: 'durationMs', label: 'A' })
    // And it did not become a zero-width block on the track.
    expect(t.segments).toHaveLength(0)
    expect(t.total).toBe(0)
  })

  // T2
  it('preserves a null durationMs on a scene rather than coercing it to zero', () => {
    // `null` means the index cannot measure this scene. It is a present key, so the
    // segment is readable and belongs on the track — it is its WIDTH that is unknown.
    const t = buildTimeline([
      { kind: 'scene', sceneId: 'scn_1', label: 'UNMEASURED', startMs: 0, durationMs: null, events: [] },
    ])
    expect(t.unreadable).toHaveLength(0)
    expect(t.segments).toHaveLength(1)
    expect(t.segments[0].label).toBe('UNMEASURED')
    expect(t.segments[0].duration).toBeNull()
  })

  // T3
  it('keeps durationMs 0 and durationMs null DIFFERENT on two otherwise identical scenes', () => {
    // Zero is a measurement below the model's resolution; null is no measurement at all.
    // Any coercion collapses them, and no single-value assertion can catch that.
    const t = buildTimeline([
      { kind: 'scene', sceneId: 'a', label: 'BELOW RESOLUTION', startMs: 0, durationMs: 0, events: [] },
      { kind: 'scene', sceneId: 'b', label: 'UNMEASURED', startMs: 0, durationMs: null, events: [] },
    ])
    expect(t.segments[0].duration).toBe(0)
    expect(t.segments[1].duration).toBeNull()
    expect(t.segments[0].duration).not.toEqual(t.segments[1].duration)
  })

  // T4 — the [planner] decision of §3a. If the RFC's literal scope is preferred,
  // this is the test that goes.
  it('reports an absent startMs too, because position now has no second source', () => {
    // `cursor` is deleted, so `startMs` stops being a cross-check and becomes the only
    // thing that says where a segment sits. A load-bearing value you do not assert is
    // the guard you just deleted, wearing a different key.
    const t = buildTimeline([
      { kind: 'scene', sceneId: 'scn_1', label: 'NO START', durationMs: 32000, events: [] },
    ])
    expect(t.unreadable).toHaveLength(1)
    expect(t.unreadable[0]).toMatchObject({ index: 0, key: 'startMs', label: 'NO START' })
    expect(t.segments).toHaveLength(0)
  })

  // T5
  it('uses startMs for position — not an accumulated cursor', () => {
    // The two readings agree on well-formed data (durationMs = wordCount × 240 divides
    // exactly, so the engine's startMs IS the cumulative sum), which is why a fixture
    // where they agree proves nothing. These disagree deliberately.
    const t = buildTimeline([
      { kind: 'scene', sceneId: 'a', startMs: 0, durationMs: 10000, events: [] },
      { kind: 'scene', sceneId: 'b', startMs: 100000, durationMs: 10000, events: [] },
      { kind: 'scene', sceneId: 'c', startMs: 200000, durationMs: 10000, events: [] },
    ])
    expect(t.segments.map((s) => s.start)).toEqual([0, 100, 200])
    // Not [0, 10, 20], which is what an accumulator would have produced.
    expect(t.total).toBe(210)
  })

  // T6
  it('partitions kind: section OUT of segments and into sections', () => {
    const t = buildTimeline([
      { kind: 'section', sectionId: 'act1', level: 1, label: 'ACT I', startMs: 0, durationMs: null, events: [] },
      { kind: 'scene', sceneId: 's1', label: 'ONE', startMs: 0, durationMs: 30000, events: [] },
      { kind: 'section', sectionId: 'seq1', level: 2, label: 'SEQUENCE A', startMs: 0, durationMs: null, events: [] },
      { kind: 'scene', sceneId: 's2', label: 'TWO', startMs: 30000, durationMs: 30000, events: [] },
      { kind: 'section', sectionId: 'act2', level: 1, label: 'ACT II', startMs: 60000, durationMs: null, events: [] },
    ])
    expect(t.segments).toHaveLength(2)
    expect(t.sections).toHaveLength(3)
    expect(t.segments.map((s) => s.sceneId)).toEqual(['s1', 's2'])
    expect(t.sections.map((s) => s.label)).toEqual(['ACT I', 'SEQUENCE A', 'ACT II'])
  })

  // T7
  it('gives buildLanes no synopsis lane, and a scenes lane of scenes only', () => {
    const t = buildTimeline([
      {
        kind: 'section',
        sectionId: 'act1',
        level: 1,
        label: 'ACT I',
        startMs: 0,
        durationMs: null,
        events: [{ elementType: 'synopsis', elementId: 'syn1', text: 'Fiona wants out.' }],
      },
      {
        kind: 'scene',
        sceneId: 's1',
        label: 'ONE',
        startMs: 0,
        durationMs: 30000,
        events: [{ elementType: 'action', elementId: 'a1', durationMs: 30000 }],
      },
      {
        kind: 'scene',
        sceneId: 's2',
        label: 'TWO',
        startMs: 30000,
        durationMs: 30000,
        events: [{ elementType: 'action', elementId: 'a2', durationMs: 30000 }],
      },
      { kind: 'section', sectionId: 'act2', level: 1, label: 'ACT II', startMs: 60000, durationMs: null, events: [] },
      { kind: 'section', sectionId: 'act3', level: 1, label: 'ACT III', startMs: 60000, durationMs: null, events: [] },
    ])
    const rows = buildLanes(t)
    const names = rows.map((r) => r.lane)
    // Positive half — this is a populated lane set, not an empty one.
    expect(names).toContain('action')
    expect(rows.find((r) => r.lane === 'action').items).toHaveLength(2)
    // And the synopsis lane, which is 7 items on the live project today, is gone.
    expect(names).not.toContain('synopsis')
    expect(rows.find((r) => r.lane === 'scenes').items).toHaveLength(2)
  })

  // T7b — the extras rule is NOT weakened. A section is a segment-axis fact; an
  // unknown element kind is an element-axis fact, and it still gets its own lane.
  it('still gives an unknown ELEMENT kind its own lane', () => {
    const t = buildTimeline([
      {
        kind: 'scene',
        sceneId: 's1',
        label: 'ONE',
        startMs: 0,
        durationMs: 30000,
        events: [{ elementType: 'sound', elementId: 'sfx1', durationMs: 2000 }],
      },
    ])
    const names = buildLanes(t).map((r) => r.lane)
    expect(names).toContain('sound')
  })

  // T8
  it('computes a span for each section — the next at the same level, or the total', () => {
    const t = buildTimeline([
      { kind: 'section', sectionId: 'act1', level: 1, label: 'ACT I', startMs: 0, durationMs: null, events: [] },
      { kind: 'section', sectionId: 'act2', level: 1, label: 'ACT II', startMs: 40000, durationMs: null, events: [] },
      { kind: 'scene', sceneId: 's1', label: 'ONE', startMs: 0, durationMs: 100000, events: [] },
    ])
    expect(t.total).toBe(100)
    // The middle case: bounded by the next section at the same level.
    expect(t.sections[0].span).toBe(40)
    // The last case: a separate branch, so it is asserted separately.
    expect(t.sections[1].span).toBe(60)
  })

  // T26 — the span is clamped by the PARENT. "Or shallower" is the whole rule.
  it('clamps a nested section span at the next SHALLOWER section, not the total', () => {
    const t = buildTimeline([
      { kind: 'section', sectionId: 'act1', level: 1, label: 'ACT I', startMs: 0, durationMs: null, events: [] },
      { kind: 'section', sectionId: 'seqA', level: 2, label: 'SEQ A', startMs: 0, durationMs: null, events: [] },
      { kind: 'section', sectionId: 'seqB', level: 2, label: 'SEQ B', startMs: 30000, durationMs: null, events: [] },
      { kind: 'section', sectionId: 'act2', level: 1, label: 'ACT II', startMs: 60000, durationMs: null, events: [] },
      { kind: 'scene', sceneId: 's1', label: 'ONE', startMs: 0, durationMs: 90000, events: [] },
    ])
    expect(t.total).toBe(90)
    const span = (id) => t.sections.find((s) => s.sectionId === id).span
    expect(span('act1')).toBe(60)
    expect(span('seqA')).toBe(30)
    // THE ASSERTION: the last level-2 sequence inside ACT I ends where ACT II begins.
    // A same-level-only rule finds no later level-2 section and runs it to `total` — 60,
    // overhanging ACT II and ACT III entirely.
    expect(span('seqB')).toBe(30)
    expect(span('act2')).toBe(30)
  })

  // T9
  it('leaves sections out of total — they own a range of scenes, not a duration', () => {
    const t = buildTimeline([
      { kind: 'scene', sceneId: 's1', label: 'ONE', startMs: 0, durationMs: 30000, events: [] },
      { kind: 'section', sectionId: 'act9', level: 1, label: 'CODA', startMs: 900000, durationMs: null, events: [] },
    ])
    expect(t.total).toBe(30)
  })

  // T10 — replaces the pre-0.11.0 empty/malformed block. The assertions are rewritten,
  // not merely re-keyed: the return grew two members, and a malformed row now surfaces
  // on the loud channel instead of vanishing.
  it('survives empty and malformed input, and reports the malformed row', () => {
    expect(buildTimeline([])).toEqual({ total: 0, segments: [], sections: [], unreadable: [] })
    expect(buildTimeline()).toEqual({ total: 0, segments: [], sections: [], unreadable: [] })

    const t = buildTimeline([{}])
    expect(t.total).toBe(0)
    expect(t.segments).toEqual([])
    // The positive half, and the point of the test: a row we cannot read is REPORTED.
    // A silent drop is the family of defect this whole issue is about.
    expect(t.unreadable).toHaveLength(1)
    expect(t.unreadable[0]).toMatchObject({ index: 0, key: 'durationMs' })
  })

  // T31 — the accumulator survives the fallback's deletion. `timeline.js:44` is
  // `offset += duration`; `:47` was the dead fallback. They read as one thing and are not.
  it('keeps events at their cumulative offset WITHIN a segment', () => {
    const t = buildTimeline([
      {
        kind: 'scene',
        sceneId: 's1',
        label: 'ONE',
        startMs: 0,
        durationMs: 30000,
        events: [
          { elementType: 'action', elementId: 'a', durationMs: 10000 },
          { elementType: 'action', elementId: 'b', durationMs: 10000 },
          { elementType: 'action', elementId: 'c', durationMs: 10000 },
        ],
      },
    ])
    expect(t.segments[0].events.map((e) => e.start)).toEqual([0, 10, 20])

    // The half that matters. A shared start is not a visual defect — it is the WRONG
    // BEAT, returned silently to khaos-app's Player, which imports elementAt to drive
    // its panes. Without the accumulator every one of these returns 'a'.
    expect(elementAt(t, 15).elementId).toBe('b')
    expect(elementAt(t, 25).elementId).toBe('c')
  })

  it('gives an event with no durationMs a null duration and keeps its place', () => {
    // Events carrying no duration is this wire's shape TODAY, on all 264 events of the
    // release payload. It is NOT an `unreadable` entry: RFC 0069 §3.1.1 is normative
    // about the composition model's timed rows, and asserting presence on events would
    // fire the loud channel on every healthy composition.
    const t = buildTimeline([
      {
        kind: 'scene',
        sceneId: 's1',
        label: 'ONE',
        startMs: 0,
        durationMs: 30000,
        events: [
          { elementType: 'action', elementId: 'a', durationMs: 10000 },
          { elementType: 'action', elementId: 'b' },
          { elementType: 'action', elementId: 'c', durationMs: 5000 },
        ],
      },
    ])
    expect(t.unreadable).toHaveLength(0)
    expect(t.segments[0].events.map((e) => e.duration)).toEqual([10, null, 5])
    // 'b' contributes 0 to the accumulator and keeps its place in the order.
    expect(t.segments[0].events.map((e) => e.start)).toEqual([0, 10, 10])
  })
})

describe('segmentAt / elementAt', () => {
  const t = buildTimeline(REAL)

  it('finds the segment and element under a time', () => {
    expect(segmentAt(t, 10).sceneId).toBe(REAL[0].sceneId)
    expect(elementAt(t, 10).elementId).toBe('e1')
    expect(elementAt(t, 25).elementId).toBe('e2')
    expect(elementAt(t, 60).elementId).toBe('e5')
  })

  it('treats a boundary as belonging to what STARTS there', () => {
    // Half-open [start, start+duration). A playhead exactly on a cut is in the new scene.
    expect(segmentAt(t, 32).sceneId).toBe(REAL[1].sceneId)
    expect(elementAt(t, 20).elementId).toBe('e2')
  })

  it('returns null outside the composition', () => {
    expect(segmentAt(t, -1)).toBeNull()
    expect(segmentAt(t, 78)).toBeNull()
    expect(elementAt(t, 999)).toBeNull()
  })

  it('reports a gap rather than snapping to a neighbour', () => {
    // A segment longer than its elements is a data problem; returning the nearest element
    // would hide it and show the operator the wrong line. This is a second, independent
    // guard on the accumulator: the event's durationMs is present and bounded, so a
    // null here means a real gap and not a lost offset.
    const gappy = buildTimeline([
      { kind: 'scene', startMs: 0, durationMs: 100000, events: [{ elementId: 'a', durationMs: 10000 }] },
    ])
    expect(segmentAt(gappy, 50)).not.toBeNull()
    expect(elementAt(gappy, 50)).toBeNull()
  })

  it('skips a null-duration row rather than getting the right answer by accident', () => {
    // `time < start + null` is `time < start`, false for every time at or past the
    // start — today's code is right for the wrong reason. Made explicit so a later
    // refactor cannot lose it.
    const t2 = buildTimeline([
      {
        kind: 'scene',
        sceneId: 'u',
        label: 'UNMEASURED',
        startMs: 0,
        durationMs: null,
        events: [{ elementType: 'action', elementId: 'x' }],
      },
      { kind: 'scene', sceneId: 'm', label: 'MEASURED', startMs: 10000, durationMs: 10000, events: [] },
    ])
    expect(segmentAt(t2, 0)).toBeNull()
    expect(elementAt(t2, 0)).toBeNull()
    // The positive half — the measured neighbour is still found, so this is not an
    // assertion about a projection that returned nothing.
    expect(segmentAt(t2, 12).sceneId).toBe('m')
  })
})

describe('formatTimecode', () => {
  it('uses m:ss for short material', () => {
    expect(formatTimecode(0)).toBe('0:00')
    expect(formatTimecode(596)).toBe('9:56') // Heart of an Indie, whole composition
  })

  it('grows an hours field only when there are hours', () => {
    // Real compositions here run to five hours; a fixed m:ss prints "311:46".
    expect(formatTimecode(10374)).toBe('2:52:54') // BROKEN IN 4 PLACES
    expect(formatTimecode(3600)).toBe('1:00:00')
    expect(formatTimecode(3599)).toBe('59:59')
  })

  it('floors fractional seconds and clamps below zero', () => {
    // T11. Load-bearing after `seconds()` is deleted: the clamp here is a RANGE clamp on
    // a computed scalar, not a plausibility guard on a JSON field read by key. An
    // argument has no key, so there is no presence for it to assert.
    expect(formatTimecode(65.9)).toBe('1:05')
    expect(formatTimecode(-5)).toBe('0:00')
    expect(formatTimecode(undefined)).toBe('0:00')
    expect(formatTimecode(null)).toBe('0:00')
  })
})

// P1-U3: a scene read's lines carry their place in the joined audio (RFC 0085 amendment 3),
// so an event with `startMs` sits at the segment's start + `startMs` and the pauses between
// lines are kept. An event without it keeps the cumulative placement.
describe('buildTimeline places an event that carries startMs', () => {
  const read = [
    {
      kind: 'scene', sceneId: 'scene_1', label: 'A read', startMs: 2000, durationMs: 5000,
      events: [
        { elementType: 'action', elementId: 'a', startMs: 0, durationMs: 1000 },
        { elementType: 'dialogue', elementId: 'b', startMs: 1500, durationMs: 800 },
        { elementType: 'dialogue', elementId: 'c', startMs: 2800, durationMs: 1200 },
      ],
    },
  ]

  it('at the segment start plus its startMs, keeping the gaps', () => {
    const [segment] = buildTimeline(read).segments
    expect(segment.events.map((e) => [e.start, e.duration])).toEqual([[2, 1], [3.5, 0.8], [4.8, 1.2]])
  })

  it('finds the line under the playhead, and nothing in a pause', () => {
    const timeline = buildTimeline(read)
    expect(elementAt(timeline, 3.6)?.elementId).toBe('b')
    expect(elementAt(timeline, 3.2)).toBeNull()
  })

  it('keeps the cumulative placement for events without startMs', () => {
    const [segment] = buildTimeline([{ ...read[0], events: read[0].events.map(({ startMs, ...e }) => e) }]).segments
    expect(segment.events.map((e) => e.start)).toEqual([2, 3, 3.8])
  })
})
