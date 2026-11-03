import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ProjectCard from '@khaos-machine/khaotik-ui/components/svelte/ProjectCard.svelte'
import WelcomeWindow from '@khaos-machine/khaotik-ui/components/svelte/WelcomeWindow.svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Source-level: jsdom does no layout. lib-0.73.0 shipped the rail with 4px of
// padding inside a border-box `height: 3px`, so every segment measured 0px and
// the bar vanished in khaos-app — found live, invisible to every test here.
describe('ProjectCard rail: the hit area does not eat the bar', () => {
  it('sizes the rail by its content, so padding adds to the 3px rather than taking it', () => {
    const src = readFileSync(join(import.meta.dirname, '../../../..', 'components/svelte/ProjectCard.svelte'), 'utf8')
    const at = src.indexOf('.project__stage-rail {')
    const block = src.slice(at, src.indexOf('}', at))
    expect(block).toMatch(/height:\s*3px/)
    expect(block).toMatch(/padding-block:\s*4px/)
    expect(block).toMatch(/box-sizing:\s*content-box/)
  })
})

// The rail is eleven segments in a fixed order: the three import stages, the
// three analyses, then the five story passes. The first three keep their
// stage/job behaviour; the last eight come from `analyses` (what the host
// knows) or a live analysis `job`.

const indexed = { id: 'p1', title: 'Broken in Four Places', path: '/p/b4p.kspd', scene_count: 54, package_stage: 'indexed' }
const card = (props) => render(ProjectCard, { props: { project: indexed, ...props } }).container
const steps = (c) => [...c.querySelectorAll('.project__stage-step')]
const titles = (c) => steps(c).map((s) => s.getAttribute('title'))
const has = (s, mod) => s.classList.contains(`project__stage-step--${mod}`)

describe('ProjectCard rail: eleven segments', () => {
  it('names each segment in order, with what is known about it', () => {
    expect(titles(card({}))).toEqual([
      'Import: done',
      'Parse: done',
      'Index: done',
      'Analyze scenes: not reported',
      'Analyze characters: not reported',
      'Analyze places: not reported',
      'Analyze character journeys: not reported',
      'Analyze relationships: not reported',
      'Analyze story structure: not reported',
      'Analyze premise: not reported',
      'Analyze coverage: not reported',
    ])
  })

  it('draws each analysis state the host reports', () => {
    const c = card({
      analyses: [
        { kind: 'scenes', state: 'in-progress', progress: { completed: 30, total: 54 } },
        { kind: 'characters', state: 'not-started' },
        { kind: 'places', state: 'done' },
      ],
    })
    const [, , , scenes, characters, places] = steps(c)
    expect(titles(c).slice(3, 6)).toEqual([
      'Analyze scenes: in progress, 30 of 54',
      'Analyze characters: not started',
      'Analyze places: done',
    ])
    expect(has(scenes, 'active') && has(scenes, 'measured')).toBe(true)
    expect(scenes.querySelector('.project__stage-fill').style.width).toBe('56%')
    expect(has(characters, 'complete') || has(characters, 'active')).toBe(false)
    expect(has(places, 'complete')).toBe(true)
  })

  it('draws a partly analysed segment measured and still, never as work running', () => {
    const c = card({ analyses: [{ kind: 'scenes', state: 'partial', progress: { completed: 1, total: 4 } }] })
    const scenes = steps(c)[3]
    expect(scenes.getAttribute('title')).toBe('Analyze scenes: partly done, 1 of 4')
    expect(has(scenes, 'measured')).toBe(true)
    expect(has(scenes, 'active')).toBe(false)
    expect(scenes.querySelector('.project__stage-fill').style.width).toBe('25%')
  })

  it('places each analysis by its kind, not its position in the list', () => {
    const c = card({ analyses: [{ kind: 'places', state: 'done' }, { kind: 'scenes', state: 'done' }] })
    expect(steps(c).map((s) => has(s, 'complete'))).toEqual([true, true, true, true, false, true, false, false, false, false, false])
  })

  it('shows a failed analysis in danger, keeping its count', () => {
    const c = card({ analyses: [{ kind: 'scenes', state: 'failed', progress: { completed: 12, total: 54 } }] })
    const scenes = steps(c)[3]
    expect(has(scenes, 'failed')).toBe(true)
    expect(scenes.getAttribute('title')).toBe('Analyze scenes: failed, 12 of 54')
  })

  it('makes no claim from an analysis it does not recognise', () => {
    const c = card({
      analyses: [
        { kind: 'toString', state: 'done' },
        { kind: 'scenes', state: 'toString' },
        { kind: 'places', state: 'in-progress', progress: { completed: 9, total: 3 } },
      ],
    })
    expect(titles(c).slice(3, 6)).toEqual([
      'Analyze scenes: not reported',
      'Analyze characters: not reported',
      'Analyze places: in progress',
    ])
    expect(c.querySelector('.project__stage-fill')).toBeNull()
  })

  it('keeps the import stages unchanged beside the analyses', () => {
    const c = card({ project: { ...indexed, package_stage: 'imported' }, analyses: [{ kind: 'scenes', state: 'done' }] })
    expect(steps(c).map((s) => has(s, 'complete'))).toEqual([true, false, false, true, false, false, false, false, false, false, false])
  })
})

describe('ProjectCard rail: an analysis job fills its own segment live', () => {
  const progress = { completed: 7, total: 54 }

  it.each([
    ['analyze-scenes', 3, 'Analyzing scenes'],
    ['analyze-characters', 4, 'Analyzing characters'],
    ['analyze-places', 5, 'Analyzing places'],
  ])('%s fills segment %i', (kind, index, label) => {
    const c = card({ job: { kind, phase: 'running', progress, elapsedMs: 5_000 } })
    const s = steps(c)
    expect(s.findIndex((x) => has(x, 'active'))).toBe(index)
    expect(s[index].querySelector('.project__stage-fill').style.width).toBe('13%')
    expect(c.querySelector('.project__label').textContent).toBe(label)
    expect(c.querySelector('.project__count').textContent).toBe('7/54')
    // the import stages stay as the package stage says; earlier analyses are not claimed done
    expect(s.slice(0, 3).every((x) => has(x, 'complete'))).toBe(true)
    expect(s.slice(3, index).some((x) => has(x, 'complete'))).toBe(false)
  })

  it('outranks what the host reported for that segment', () => {
    const c = card({
      analyses: [{ kind: 'scenes', state: 'done' }],
      job: { kind: 'analyze-scenes', phase: 'queued' },
    })
    const scenes = steps(c)[3]
    expect(has(scenes, 'waiting')).toBe(true)
    expect(scenes.getAttribute('title')).toBe('Analyze scenes: queued')
  })

  it.each([
    ['starting', 'Starting scene analysis…'],
    ['queued', 'Scene analysis queued'],
    ['running', 'Analyzing scenes'],
    ['finalizing', 'Finalizing scene analysis…'],
    ['failed', 'Scene analysis failed'],
  ])('labels the scenes job %s', (phase, label) => {
    expect(card({ job: { kind: 'analyze-scenes', phase } }).querySelector('.project__label').textContent).toBe(label)
  })

  it('keeps the extract action, not an extraction retry, over a failed analysis job', () => {
    const c = card({
      project: { ...indexed, package_stage: 'parsed' },
      onExtract: () => {},
      job: { kind: 'analyze-scenes', phase: 'failed' },
    })
    const action = c.querySelector('.project__action')
    expect(action.getAttribute('aria-label')).toBe('Extract Broken in Four Places')
    expect(action.disabled).toBe(false)
  })
})

// khaotik-ui#27: the five story passes khaosd runs after the three analyses,
// each with its own segment after the three analyses.
const passes = [
  ['character-journeys', 6, 'Analyze character journeys', 'Analyzing character journeys', 'Character journey analysis failed'],
  ['relationship-synthesis', 7, 'Analyze relationships', 'Analyzing relationships', 'Relationship analysis failed'],
  ['story-structure', 8, 'Analyze story structure', 'Analyzing story structure', 'Story structure analysis failed'],
  ['premise', 9, 'Analyze premise', 'Analyzing the premise', 'Premise analysis failed'],
  ['coverage-report', 10, 'Analyze coverage', 'Analyzing coverage', 'Coverage analysis failed'],
]

describe('ProjectCard: a story pass job', () => {
  it.each(passes)('%s fills segment %i, running and failed', (kind, index, segment, running, failed) => {
    const run = card({ job: { kind, phase: 'running', progress: { completed: 3, total: 9 } } })
    expect(run.querySelector('.project__label').textContent).toBe(running)
    expect(run.querySelector('.project__count').textContent).toBe('3/9')
    const s = steps(run)
    expect(s.findIndex((x) => has(x, 'active'))).toBe(index)
    expect(s[index].getAttribute('title')).toBe(`${segment}: in progress, 3 of 9`)
    expect(s[index].querySelector('.project__stage-fill').style.width).toBe('33%')
    expect(s.slice(0, 3).every((x) => has(x, 'complete'))).toBe(true)
    const fail = card({ job: { kind, phase: 'failed' } })
    expect(fail.querySelector('.project__label').textContent).toBe(failed)
    expect(fail.querySelector('.project__status').dataset.tone).toBe('danger')
    expect(has(steps(fail)[index], 'failed')).toBe(true)
  })
})

describe('ProjectCard: a reported story pass', () => {
  const three = [{ kind: 'scenes', state: 'done' }, { kind: 'characters', state: 'done' }, { kind: 'places', state: 'done' }]
  const label = (analyses) => card({ analyses }).querySelector('.project__label').textContent

  it.each(passes)('%s draws in segment %i', (kind, index, segment) => {
    const c = card({ analyses: [{ kind, state: 'done' }] })
    expect(has(steps(c)[index], 'complete')).toBe(true)
    expect(steps(c)[index].getAttribute('title')).toBe(`${segment}: done`)
  })

  it('reads Complete once the three analyses are done, when the host reports no story pass', () => {
    expect(label(three)).toBe('Complete')
  })

  it('reads Complete only once every reported story pass is done too', () => {
    expect(label([...three, { kind: 'premise', state: 'done' }])).toBe('Complete')
    expect(label([...three, { kind: 'coverage-report', state: 'failed' }])).toBe('Coverage analysis failed')
    expect(label([...three, { kind: 'story-structure', state: 'in-progress' }])).toBe('Analyzing story structure')
    expect(label([...three, { kind: 'relationship-synthesis', state: 'partial', progress: { completed: 2, total: 5 } }])).toBe('Relationship analysis partly done')
  })

  it('lets the stage speak for a reported story pass not yet started', () => {
    expect(label([...three, { kind: 'premise', state: 'not-started' }])).toBe('Indexed')
  })
})

// khaotik-ui#28: a failed analysis job offers a retry through `onRetry`.
describe('ProjectCard: retrying a failed analysis', () => {
  const retry = (c) => [...c.querySelectorAll('.project__action')].find((b) => b.getAttribute('aria-label').startsWith('Retry'))

  it.each([
    ['analyze-characters', 'Retry character analysis for Broken in Four Places'],
    ['coverage-report', 'Retry coverage analysis for Broken in Four Places'],
  ])('offers a retry for a failed %s job and invokes onRetry', (kind, label) => {
    let calls = 0
    const c = card({ job: { kind, phase: 'failed' }, onRetry: () => calls++ })
    const button = retry(c)
    expect(button.getAttribute('aria-label')).toBe(label)
    button.click()
    expect(calls).toBe(1)
  })

  it('offers no retry without onRetry, for a job still running, or for an extraction', () => {
    expect(retry(card({ job: { kind: 'analyze-scenes', phase: 'failed' } }))).toBeUndefined()
    expect(retry(card({ job: { kind: 'analyze-scenes', phase: 'running' }, onRetry: () => {} }))).toBeUndefined()
    const extract = card({ project: { ...indexed, package_stage: 'parsed' }, job: { kind: 'extract', phase: 'failed' }, onRetry: () => {}, onExtract: () => {} })
    expect([...extract.querySelectorAll('.project__action')].map((b) => b.getAttribute('aria-label'))).toEqual(['Retry extraction for Broken in Four Places'])
  })
})

describe('analysesFor reaches the card', () => {
  const analysesFor = () => [{ kind: 'scenes', state: 'done' }]
  it('on WelcomeWindow', () => {
    const c = render(WelcomeWindow, { props: { projects: [indexed], analysesFor } }).container
    expect(c.querySelectorAll('.project__stage-step')[3].getAttribute('title')).toBe('Analyze scenes: done')
  })
})
