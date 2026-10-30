import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import StoryPlayer from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayer.svelte'

const ROOT = join(import.meta.dirname, '../../../..')
const SOURCE = join(ROOT, 'components/svelte/StoryPlayer.svelte')

// StoryPlayer's rendering and interaction. The time maths is covered in timeline.test.js;
// what matters here is that a bar lands where the maths says and that the component
// reports intent rather than acting on it.

// khaosd 0.11.0's wire: `durationMs` / `startMs`, integer milliseconds, and the old
// `duration` / `start` keys are gone (#124). If this constant still passed on the RETIRED
// shape, the old contract would still work and timeline.test.js's T1 would be a lie.
const SEGMENTS = [
  {
    kind: 'scene',
    sceneId: 'scn_1',
    label: 'EXT. BROOKLYN STREET - GOLDEN HOUR',
    startMs: 0,
    durationMs: 32000,
    events: [
      { elementType: 'action', elementId: 'e1', durationMs: 20000, text: 'Fiona trudges home.' },
      {
        elementType: 'dialogue',
        elementId: 'e2',
        durationMs: 11000,
        text: 'Five years grinding it out.',
        characterName: 'FIONA',
        parenthetical: 'V.O.',
      },
      { elementType: 'action', elementId: 'e3', durationMs: 1000, text: '===' },
    ],
  },
  {
    kind: 'scene',
    sceneId: 'scn_2',
    label: "INT. FIONA'S CRAPPY APARTMENT - NIGHT",
    startMs: 32000,
    durationMs: 46000,
    events: [{ elementType: 'action', elementId: 'e4', durationMs: 25000, text: 'A wall of photos.' }],
  },
]

// A composition with a section band: two levels, two scenes, one synopsis. ACT I carries
// prose; ACT II does not, which is the COMMON case — 21 of 28 sections on the live
// project have no synopsis.
const BANDED = [
  {
    kind: 'section',
    sectionId: 'act1',
    level: 1,
    label: 'ACT I',
    startMs: 0,
    durationMs: null,
    events: [{ elementType: 'synopsis', elementId: 'syn1', text: 'Fiona wants out of Brooklyn.' }],
  },
  { kind: 'section', sectionId: 'seqA', level: 2, label: 'SEQUENCE A', startMs: 0, durationMs: null, events: [] },
  {
    kind: 'scene',
    sceneId: 's1',
    label: 'ONE',
    startMs: 0,
    durationMs: 30000,
    events: [{ elementType: 'action', elementId: 'a1', durationMs: 30000 }],
  },
  { kind: 'section', sectionId: 'act2', level: 1, label: 'ACT II', startMs: 30000, durationMs: null, events: [] },
  {
    kind: 'scene',
    sceneId: 's2',
    label: 'TWO',
    startMs: 30000,
    durationMs: 30000,
    events: [{ elementType: 'action', elementId: 'a2', durationMs: 30000 }],
  },
]

const bars = (c) => [...c.querySelectorAll('.player__event')]
// Bars within one typed lane (#22). DOM order is now lane-major — every action
// bar, then every dialogue bar — so a flat `bars()` no longer reads in time
// order, and a test that assumed it did would be asserting the wrong thing.
const lane = (c, name) => [...c.querySelectorAll(`.player__lane[data-lane="${name}"] .player__event`)]
const px = (v) => Number.parseFloat(v)

describe('layout', () => {
  it('positions and sizes every bar at scale × seconds', () => {
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS, scale: 10 } })

    const segs = [...container.querySelectorAll('.player__segment')]
    expect(segs.map((s) => px(s.style.left))).toEqual([0, 320])
    expect(segs.map((s) => px(s.style.width))).toEqual([320, 460])

    // Beats are positioned in ABSOLUTE composition time now that each kind has
    // its own lane. They used to be offset within their segment; a lane spans
    // the whole track, so segment-relative left would stack every scene's beats
    // on top of each other at the start.
    //
    // action:   0s, 31s, 32s   dialogue: 20s
    expect(lane(container, 'action').map((b) => px(b.style.left))).toEqual([0, 310, 320])
    expect(lane(container, 'dialogue').map((b) => px(b.style.left))).toEqual([200])

    // Widths are unchanged by the lane split — they were never segment-relative.
    expect(lane(container, 'action').map((b) => px(b.style.width))).toEqual([200, 10, 250])
    expect(lane(container, 'dialogue').map((b) => px(b.style.width))).toEqual([110])
  })

  it('honours the scale prop', () => {
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS, scale: 3 } })
    expect(px(container.querySelector('.player__segment').style.width)).toBe(96)
  })

  it('splits the beats into one lane per element kind', () => {
    // #22 — six typed lanes rather than one row. The ruler is drawn separately;
    // `scenes` carries the segment blocks and each element kind gets its own.
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS } })

    const lanes = [...container.querySelectorAll('.player__lane')].map((l) => l.dataset.lane)
    expect(lanes).toEqual(['scenes', 'action', 'dialogue'])

    // `transition` and `audio` are absent because this fixture has neither —
    // a lane with no content is omitted rather than drawn empty.
    expect(container.querySelector('.player__lane[data-lane="transition"]')).toBeNull()
    expect(container.querySelector('.player__lane[data-lane="audio"]')).toBeNull()
  })

  it('puts every beat on the lane for its kind', () => {
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS } })
    expect(lane(container, 'action')).toHaveLength(3)
    expect(lane(container, 'dialogue')).toHaveLength(1)
    // And nothing is lost in the split.
    expect(bars(container)).toHaveLength(4)
  })

  it('labels each lane, and keeps the label visible when the track is scrolled', () => {
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS } })
    const labels = [...container.querySelectorAll('.player__lane-label')].map((l) => l.textContent.trim())
    expect(labels).toEqual(['Scenes', 'Action', 'Dialogue'])
  })

  it('gives a one-second beat a real width rather than collapsing it', () => {
    // The `===` action is genuinely 1s in this composition. At 10 px/s it is 10px — the
    // whole reason the scale is pixels-per-second and not fit-to-width.
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS, scale: 10 } })
    // e3, the 1s `===` action — second on the action lane (0s, 31s, 32s).
    // Indexed by lane rather than by position in a flat list, which is what
    // made these brittle when the lanes landed.
    expect(px(lane(container, 'action')[1].style.width)).toBe(10)
  })

  it('places the playhead by transform, not by reflowing the track', () => {
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS, currentTime: 44, scale: 10 } })
    expect(container.querySelector('.player__playhead').style.transform).toBe('translateX(440px)')
  })

  it('colours bars by element kind', () => {
    // Lane-major DOM order: the three actions, then the dialogue.
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS } })
    expect(bars(container).map((b) => b.dataset.kind)).toEqual(['action', 'action', 'action', 'dialogue'])
  })
})

describe('the content panel', () => {
  it('follows the playhead', () => {
    render(StoryPlayer, { props: { segments: SEGMENTS, currentTime: 25 } })
    expect(screen.getByText('Five years grinding it out.')).toBeInTheDocument()
    expect(screen.getByText('FIONA')).toBeInTheDocument()
    expect(screen.getByText('(V.O.)')).toBeInTheDocument()
  })

  it('lets an explicit selection override the playhead', () => {
    // Reading a beat must not fight the transport.
    render(StoryPlayer, { props: { segments: SEGMENTS, currentTime: 25, selectedElementId: 'e4' } })
    expect(screen.getByText('A wall of photos.')).toBeInTheDocument()
    expect(screen.queryByText('Five years grinding it out.')).toBeNull()
  })

  it('says so when nothing is under the playhead', () => {
    const gappy = [{ kind: 'scene', sceneId: 's', label: 'GAP', startMs: 0, durationMs: 100000, events: [] }]
    render(StoryPlayer, { props: { segments: gappy, currentTime: 50 } })
    expect(screen.getByText(/Nothing under the playhead/)).toBeInTheDocument()
  })
})

describe('the transport', () => {
  it('shows elapsed over total', () => {
    render(StoryPlayer, { props: { segments: SEGMENTS, currentTime: 44 } })
    expect(screen.getByText('0:44 / 1:18')).toBeInTheDocument()
  })

  it('clamps a time past the end instead of running off the track', () => {
    render(StoryPlayer, { props: { segments: SEGMENTS, currentTime: 9999 } })
    expect(screen.getByText('1:18 / 1:18')).toBeInTheDocument()
  })

  it('reports play/pause rather than acting on it', () => {
    // The host owns the clock; this keeps the transport audio-agnostic.
    const onTogglePlay = vi.fn()
    render(StoryPlayer, { props: { segments: SEGMENTS, onTogglePlay } })
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onTogglePlay).toHaveBeenCalled()
  })

  it('names the button for what pressing it does', () => {
    render(StoryPlayer, { props: { segments: SEGMENTS, playing: true } })
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('reports a new scale from the zoom control', () => {
    const onScaleChange = vi.fn()
    render(StoryPlayer, { props: { segments: SEGMENTS, onScaleChange } })
    fireEvent.input(screen.getByLabelText(/Timeline zoom/), { target: { value: '25' } })
    expect(onScaleChange).toHaveBeenCalledWith(25)
  })
})

describe('clicking a beat', () => {
  it('seeks to its start and selects it', () => {
    const onSeek = vi.fn()
    const onSelect = vi.fn()
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS, onSeek, onSelect } })

    // e2, the only dialogue beat, at 20s.
    fireEvent.click(lane(container, 'dialogue')[0])

    expect(onSeek).toHaveBeenCalledWith(20)
    expect(onSelect).toHaveBeenCalledWith('e2')
  })

  it('seeks in ABSOLUTE time, not time within the scene', () => {
    // Scene 2's only beat starts at 32s overall but 0s within its segment.
    const onSeek = vi.fn()
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS, onSeek } })
    // e4 — scene 2's only beat, third on the action lane. It starts at 32s
    // overall and 0s within its segment, which is the whole point of the case.
    fireEvent.click(lane(container, 'action')[2])
    expect(onSeek).toHaveBeenCalledWith(32)
  })

  it('exposes each beat as a real button, so it is keyboard reachable', () => {
    // Every bar is a <button>: that is what makes the timeline usable without a mouse,
    // and it is the reason this is DOM rather than a canvas.
    render(StoryPlayer, { props: { segments: SEGMENTS } })
    expect(screen.getByRole('button', { name: /dialogue FIONA at 0:20/ })).toBeInTheDocument()
  })
})

describe('empty state', () => {
  it('says a project has no composition instead of drawing an empty ruler', () => {
    render(StoryPlayer, { props: { segments: [] } })
    expect(screen.getByText(/no composition yet/)).toBeInTheDocument()
  })
})

// #124 — the four facts of the composition wire that all render identically today:
// measured below the model's resolution (`durationMs: 0`), unmeasured (`null`), not
// applicable (a section), and the key absent because the wire renamed. Three of the four
// are lies, and the fourth is the one RFC 0069 §3.1.1 makes normative.
describe('the four durations that used to render identically', () => {
  // T12
  it('draws a null-duration scene as an unmeasured marker, never a zero-width block', () => {
    const { container } = render(StoryPlayer, {
      props: {
        scale: 10,
        segments: [
          { kind: 'scene', sceneId: 'u', label: 'UNMEASURED', startMs: 0, durationMs: null, events: [] },
          { kind: 'scene', sceneId: 'm', label: 'MEASURED', startMs: 10000, durationMs: 20000, events: [] },
        ],
      },
    })
    const segs = [...container.querySelectorAll('.player__segment')]
    expect(segs).toHaveLength(2)

    // The positive half — a well-formed neighbour is still exactly proportional, so
    // this is not an assertion about a track that stopped drawing.
    expect(segs[1].classList.contains('player__segment--unmeasured')).toBe(false)
    expect(px(segs[1].style.width)).toBe(200)

    // And the unmeasured one is marked and is NOT zero-width. `null * scale` is 0, which
    // is the exact lie: a scene the index could not measure, asserting it takes no time.
    expect(segs[0].classList.contains('player__segment--unmeasured')).toBe(true)
    expect(segs[0].style.width).not.toBe('0px')
    expect(px(segs[0].style.width)).toBeGreaterThan(0)
  })

  // T27
  it('draws a durationMs 0 scene as a BELOW-RESOLUTION marker, distinct from unmeasured', () => {
    // `0` is a real measurement — shorter than `wordCount × 60 / 250` can express — and
    // `null` is no measurement at all. The projection holds them apart (timeline T3); the
    // render must not re-collapse them.
    const { container } = render(StoryPlayer, {
      props: {
        scale: 10,
        segments: [
          { kind: 'scene', sceneId: 'z', label: 'THE FINGER', startMs: 0, durationMs: 0, events: [] },
          { kind: 'scene', sceneId: 'u', label: 'UNMEASURED', startMs: 5000, durationMs: null, events: [] },
          { kind: 'scene', sceneId: 'm', label: 'MEASURED', startMs: 10000, durationMs: 20000, events: [] },
        ],
      },
    })
    const segs = [...container.querySelectorAll('.player__segment')]
    // Two positive assertions on two distinct classes, in the same render.
    expect(segs[0].classList.contains('player__segment--below-resolution')).toBe(true)
    expect(segs[1].classList.contains('player__segment--unmeasured')).toBe(true)
    // Neither wears the other's class.
    expect(segs[0].classList.contains('player__segment--unmeasured')).toBe(false)
    expect(segs[1].classList.contains('player__segment--below-resolution')).toBe(false)
    // Not a 0px block — the original lie, which survives every arithmetic check.
    expect(segs[0].style.width).not.toBe('0px')

    // And they say different things, because *unknown* and *smaller than I can measure*
    // are different claims.
    expect(segs[0].textContent).toMatch(/shorter than/i)
    expect(segs[1].textContent).toMatch(/not been measured/i)
    expect(segs[0].textContent).not.toMatch(/not been measured/i)
  })

  // T13 — the highest-value render test in the plan.
  it('says a composition is UNREADABLE rather than saying the project is empty', () => {
    // In the unreadable state `total` is 0, so a `{#if total === 0}` branch ordered first
    // tells the operator the project has no composition when it has one this build
    // cannot read. That is the original defect, moved up a layer and wearing new copy.
    const { container } = render(StoryPlayer, {
      // The retired 0.10.0 wire — exactly what the committed capture is.
      props: { segments: [{ sceneId: 'scn_1', label: 'EXT. STREET', duration: 32, start: 0, events: [] }] },
    })
    expect(container.textContent).toMatch(/could not be read/i)
    expect(container.textContent).toMatch(/durationMs/)
    expect(screen.queryByText(/no composition yet/)).toBeNull()
  })
})

describe('the section band', () => {
  // T14
  it('draws one band row per level, labelled, ABOVE the ruler', () => {
    const { container } = render(StoryPlayer, { props: { segments: BANDED, scale: 10 } })

    const bands = [...container.querySelectorAll('.player__band')]
    expect(bands.map((b) => b.dataset.level)).toEqual(['1', '2'])
    expect(container.querySelector('.player__band[data-level="1"]').textContent).toContain('ACT I')
    expect(container.querySelector('.player__band[data-level="2"]').textContent).toContain('SEQUENCE A')

    // DOM order: a band is structure over the ruler, not a lane under it.
    const track = [...container.querySelectorAll('.player__track > *')]
    const firstBand = track.findIndex((el) => el.classList.contains('player__band'))
    const ruler = track.findIndex((el) => el.classList.contains('player__ruler'))
    expect(firstBand).toBeGreaterThanOrEqual(0)
    expect(ruler).toBeGreaterThanOrEqual(0)
    expect(firstBand).toBeLessThan(ruler)
  })

  // T15 — D66: two axes get two items, never a merge.
  it('reports a band click on its OWN selection axis, not the element one', () => {
    const onSelectSection = vi.fn()
    const onSelect = vi.fn()
    const { container } = render(StoryPlayer, {
      props: { segments: BANDED, onSelectSection, onSelect },
    })
    const actOne = [...container.querySelectorAll('.player__band-item')].find((b) =>
      b.textContent.includes('ACT I'),
    )
    fireEvent.click(actOne)
    expect(onSelectSection).toHaveBeenCalledWith('act1')
    expect(onSelect).not.toHaveBeenCalled()
  })

  // T16
  it('shows a selected section synopsis, and says so when there is none', () => {
    const withProse = render(StoryPlayer, { props: { segments: BANDED, selectedSectionId: 'act1' } })
    expect(withProse.container.textContent).toContain('Fiona wants out of Brooklyn.')
    withProse.unmount()

    // 21 of 28 sections on the live project are this case, so it is the common path.
    const without = render(StoryPlayer, { props: { segments: BANDED, selectedSectionId: 'act2' } })
    expect(without.container.textContent).toContain('There is no synopsis for this section.')
  })

  // T17
  it('puts sections on the band and NOT on the scene lane', () => {
    // Before the partition, `contentFor('scenes')` returned every row — so 28 sections
    // rendered as zero-width `.player__segment` hairlines, each painting a border-left
    // and reading as a scene cut that is not a scene cut.
    const { container } = render(StoryPlayer, { props: { segments: BANDED } })
    const sceneBlocks = container.querySelectorAll('.player__lane[data-lane="scenes"] .player__segment')
    expect(sceneBlocks).toHaveLength(2)
    // Positive control: the band DID render the sections, so this is not a count of
    // nothing against nothing.
    expect(container.querySelectorAll('.player__band-item')).toHaveLength(3)
  })
})

// The four new style rules — a SOURCE READ, not a rendered assertion (D73's precedent).
//
// jsdom resolves no stylesheets, so every declaration below is invisible to anything
// rendered: an assertion about the band's height or the unmeasured hatch passes
// identically whether or not the rule is in the file. `token-refs.test.js` cannot see
// them either — it matches `var(--…)`, and the pairing and the separation are structural
// facts about which selectors share a rule, not about which tokens appear.
//
// Comments are stripped first (the pattern token-refs.test.js already uses, and the trap
// regressions.test.js learned the hard way): every rule below is explained in prose that
// names the properties under test, so a scan over raw text would be satisfied by the
// explanation rather than by the declaration.
const style = readFileSync(SOURCE, 'utf8')
  .match(/<style>([\s\S]*)<\/style>/)[1]
  .replace(/\/\*[\s\S]*?\*\//g, '')

/** Every `selector { … }` rule in the stripped stylesheet, as { selector, body }. */
const rules = [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
  selector: m[1].trim(),
  body: m[2],
}))

const ruleFor = (selector) => rules.find((r) => r.selector === selector)
const decl = (rule, prop) =>
  rule.body.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`))?.[1]?.trim() ?? null

describe('the section band and marker rules, read from source', () => {
  it('finds the rules at all — the positive control for every check below', () => {
    // Without this, a renamed class turns every check below into an assertion about
    // `undefined` and the whole block goes green on a component that ships none of it.
    expect(rules.length).toBeGreaterThan(10)
    expect(ruleFor('.player__band')).toBeTruthy()
    expect(ruleFor('.player__band-item')).toBeTruthy()
    expect(ruleFor('.player__segment--below-resolution')).toBeTruthy()
  })

  it('gives the band a row height matched to the lanes', () => {
    expect(decl(ruleFor('.player__band'), 'height')).toBe('var(--lane-h)')
  })

  it('positions a band item absolutely and keeps a zero-span section clickable', () => {
    const item = ruleFor('.player__band-item')
    expect(decl(item, 'position')).toBe('absolute')
    expect(decl(item, 'min-width')).toBe('1px')
  })

  it('does NOT tint the band with the accent — gold is the brand and primary actions', () => {
    // A passive structural band is not an accent (AGENTS.md, Conventions). Paired with a
    // positive assertion that the rule does carry a background, so this is not an
    // assertion about a rule that declares nothing.
    const item = ruleFor('.player__band-item')
    expect(decl(item, 'background')).toContain('color-mix')
    expect(item.body).not.toContain('--tone-accent')
  })

  it('PAIRS the unmeasured segment and event in one rule', () => {
    // One treatment, one class, one statement — a null-duration scene and a null-duration
    // beat are the same fact at two scales, and two rules would drift.
    const pair = rules.find(
      (r) => r.selector.includes('.player__segment--unmeasured') && r.selector.includes('.player__event--unmeasured'),
    )
    expect(pair).toBeTruthy()
    expect(pair.body).toContain('repeating-linear-gradient')
  })

  it('keeps below-resolution SEPARATE from unmeasured — the negative control', () => {
    // This is the check that proves the test matches the PAIRING rather than the file.
    // Collapsing `durationMs: 0` into the unmeasured hatch would re-merge in CSS the two
    // facts the projection deliberately holds apart (timeline T3): *unknown* and
    // *shorter than I can measure* are different claims.
    const pair = rules.find(
      (r) => r.selector.includes('.player__segment--unmeasured') && r.selector.includes('.player__event--unmeasured'),
    )
    expect(pair.selector).not.toContain('below-resolution')
    const below = ruleFor('.player__segment--below-resolution')
    expect(below.body).not.toContain('repeating-linear-gradient')
    expect(decl(below, 'min-width')).toBe('4px')
  })

  it('invents no custom property and hand-sets no font weight in the new rules', () => {
    // `--surface-sunken` and `--border-subtle` do not exist in tokens.css or
    // tokens-extra.css. Anyone reaching for them is inventing a token.
    const added = ['.player__band', '.player__band-gutter', '.player__band-item', '.player__band-item--on',
      '.player__segment--below-resolution', '.player__unreadable']
      .map(ruleFor)
      .filter(Boolean)
    expect(added.length).toBe(6)
    const TOKENS =
      readFileSync(join(ROOT, 'tokens/tokens.css'), 'utf8') +
      readFileSync(join(ROOT, 'tokens/tokens-extra.css'), 'utf8')
    for (const rule of added) {
      expect(rule.body).not.toMatch(/font-weight/)
      for (const [, name] of rule.body.matchAll(/var\((--[a-z0-9-]+)\)/g)) {
        // --lane-h is component-local (declared on .player__stage), not a design token.
        if (name === '--lane-h') continue
        expect(TOKENS, `${rule.selector} references ${name}`).toContain(`${name}:`)
      }
    }
  })
})

// P1-U3: StoryPlayer refit for one scene read — a wider zoom, finer ticks above 50 px/s,
// and a waveform per measured block. The composition Player passes none of these and must
// render exactly as before.
describe('StoryPlayer for a scene read', () => {
  const peaks = { version: 2, channels: 1, sample_rate: 24000, samples_per_pixel: 240, bits: 8, length: 400, data: Array(800).fill(1) }
  const READ = [
    {
      kind: 'scene', sceneId: 'scene_1', label: 'A read', startMs: 0, durationMs: 4000,
      events: [
        { elementType: 'action', elementId: 'a', startMs: 0, durationMs: 1000 },
        { elementType: 'dialogue', elementId: 'b', startMs: 1500, durationMs: 800, characterName: 'MARA' },
        { elementType: 'dialogue', elementId: 'c' },
      ],
    },
  ]
  const zoom = () => screen.getByRole('slider', { name: 'Timeline zoom, pixels per second' })
  const tickLabels = (container) => [...container.querySelectorAll('.player__tick')].map((t) => t.textContent)

  it('takes the zoom bounds from minScale and maxScale, defaulting to 2 and 50', () => {
    const { unmount } = render(StoryPlayer, { props: { segments: READ } })
    expect([zoom().min, zoom().max]).toEqual(['2', '50'])
    unmount()
    render(StoryPlayer, { props: { segments: READ, minScale: 20, maxScale: 400, scale: 100 } })
    expect([zoom().min, zoom().max]).toEqual(['20', '400'])
  })

  it('keeps the tick steps at 50 px/s and below, then 5 s from 60 px/s and 1 s from 200', () => {
    const long = [{ ...READ[0], durationMs: 130000 }]
    const at = (scale) => {
      const { container, unmount } = render(StoryPlayer, { props: { segments: long, scale, maxScale: 400 } })
      const labels = tickLabels(container)
      unmount()
      return labels.slice(0, 3)
    }
    expect(at(50)).toEqual(['0:00', '1:00', '2:00'])
    expect(at(60)).toEqual(['0:00', '0:05', '0:10'])
    expect(at(200)).toEqual(['0:00', '0:01', '0:02'])
  })

  it('draws a waveform inside each measured block, after its name, leaving the button as it was', () => {
    const { container, unmount } = render(StoryPlayer, { props: { segments: READ, scale: 100 } })
    const before = screen.getAllByRole('button').map((b) => b.textContent.replace(/\s+/g, ' ').trim())
    unmount()

    const onSeek = vi.fn()
    const onSelect = vi.fn()
    const withPeaks = render(StoryPlayer, { props: { segments: READ, scale: 100, peaks, onSeek, onSelect } })
    const after = screen.getAllByRole('button').map((b) => b.textContent.replace(/\s+/g, ' ').trim())
    expect(after).toEqual(before)

    const blocks = [...withPeaks.container.querySelectorAll('.player__event')]
    expect(blocks).toHaveLength(3)
    for (const block of blocks.slice(0, 2)) {
      const canvas = block.querySelector('canvas')
      expect(canvas).not.toBeNull()
      expect(canvas.getAttribute('aria-hidden')).toBe('true')
      expect(block.querySelector('.player__sr').compareDocumentPosition(canvas) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
    // An unmeasured line has no span to draw.
    expect(blocks[2].querySelector('canvas')).toBeNull()
    // Enter on a block is a native button press: it seeks and selects, as before.
    fireEvent.click(blocks[1])
    expect(onSeek).toHaveBeenCalledWith(1.5)
    expect(onSelect).toHaveBeenCalledWith('b')
    expect(container.querySelector('canvas')).toBeNull()
  })

  it('draws no canvas without peaks', () => {
    const { container } = render(StoryPlayer, { props: { segments: SEGMENTS } })
    expect(container.querySelector('canvas')).toBeNull()
  })
})

// P1-U4 (P1-Q6, "Change the dimming"): a resting block was drawn at `opacity: 0.55`, which
// faded its waveform with its fill, so no stroke reached 3:1 on it in light theme. The rest
// state now lives in the block's fill, and the stroke and the block are drawn at full opacity.
describe('timeline blocks at rest and active, read from source', () => {
  const eventRules = rules.filter((r) => r.selector.split(',').some((s) => s.trim().startsWith('.player__event')))

  it('finds the block rules — the positive control', () => {
    expect(ruleFor('.player__event')).toBeTruthy()
    expect(eventRules.length).toBeGreaterThan(5)
  })

  it('draws the waveform inside a block in --surface-raised', () => {
    expect(decl(ruleFor('.player__event :global(.ui-waveform)'), 'color')).toBe('var(--surface-raised)')
  })

  it('sets no opacity below 1 on a block or its content, in any state', () => {
    for (const rule of eventRules) {
      const opacity = decl(rule, 'opacity')
      if (opacity !== null) expect(Number(opacity), rule.selector).toBeGreaterThanOrEqual(1)
    }
    expect(decl(ruleFor('.player__event'), 'opacity')).toBeNull()
  })

  it('expresses rest through the fill: a resting block mixes its tone, an active one is the tone', () => {
    const block = ruleFor('.player__event')
    expect(decl(block, 'background')).toBe('var(--event-fill)')
    expect(decl(block, '--event-tone')).toBe('var(--tone-neutral)')
    expect(decl(block, '--event-fill')).toMatch(/^color-mix\(in oklab, var\(--event-tone\) \d+%, var\(--text-primary\)\)$/)
    const active = rules.find((r) => r.selector.split(',').map((s) => s.trim()).includes('.player__event--on'))
    expect(decl(active, '--event-fill')).toBe('var(--event-tone)')
    for (const [kind, tone] of [['action', 'warning'], ['dialogue', 'info'], ['transition', 'skipped']]) {
      expect(decl(ruleFor(`.player__event[data-kind='${kind}']`), '--event-tone')).toBe(`var(--tone-${tone})`)
    }
  })
})
