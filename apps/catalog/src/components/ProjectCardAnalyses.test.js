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

// The rail is six segments in a fixed order: the three import stages, then the
// three analyses. The first three keep their stage/job behaviour; the last
// three come from `analyses` (what the host knows) or a live analysis `job`.

const indexed = { id: 'p1', title: 'Broken in Four Places', path: '/p/b4p.kspd', scene_count: 54, package_stage: 'indexed' }
const card = (props) => render(ProjectCard, { props: { project: indexed, ...props } }).container
const steps = (c) => [...c.querySelectorAll('.project__stage-step')]
const titles = (c) => steps(c).map((s) => s.getAttribute('title'))
const has = (s, mod) => s.classList.contains(`project__stage-step--${mod}`)

describe('ProjectCard rail: six segments', () => {
  it('names each segment in order, with what is known about it', () => {
    expect(titles(card({}))).toEqual([
      'Import: done',
      'Parse: done',
      'Index: done',
      'Analyze scenes: not reported',
      'Analyze characters: not reported',
      'Analyze places: not reported',
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
    expect(titles(c).slice(3)).toEqual([
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
    expect(steps(c).map((s) => has(s, 'complete'))).toEqual([true, true, true, true, false, true])
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
    expect(titles(c).slice(3)).toEqual([
      'Analyze scenes: not reported',
      'Analyze characters: not reported',
      'Analyze places: in progress',
    ])
    expect(c.querySelector('.project__stage-fill')).toBeNull()
  })

  it('keeps the import stages unchanged beside the analyses', () => {
    const c = card({ project: { ...indexed, package_stage: 'imported' }, analyses: [{ kind: 'scenes', state: 'done' }] })
    expect(steps(c).map((s) => has(s, 'complete'))).toEqual([true, false, false, true, false, false])
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

  it('does not offer extraction or retry over an analysis job', () => {
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

describe('analysesFor reaches the card', () => {
  const analysesFor = () => [{ kind: 'scenes', state: 'done' }]
  it('on WelcomeWindow', () => {
    const c = render(WelcomeWindow, { props: { projects: [indexed], analysesFor } }).container
    expect(c.querySelectorAll('.project__stage-step')[3].getAttribute('title')).toBe('Analyze scenes: done')
  })
})
