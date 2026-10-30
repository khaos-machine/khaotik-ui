import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ProjectCard from '@khaos-machine/khaotik-ui/components/svelte/ProjectCard.svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// The `job` prop (docs/design/project-card-progress.md, "Interface contract"):
// one prop for an import or an extraction, one row per fact, every row of the
// design's Copy table pinned here.

const parsed = { id: 'p1', title: 'Broken in Four Places', path: '/p/b4p.kspd', scene_count: 57, character_count: 27, package_stage: 'parsed' }
// An import's row has no stage, no counts: nothing is known yet.
const pending = { id: 'import:pending', title: 'broken-in-4-places' }

const card = (project, job, extra = {}) =>
  render(ProjectCard, { props: { project, job, onExtract: () => {}, onDelete: () => {}, onInitGit: () => {}, ...extra } }).container

const text = (c, sel) => c.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? null
const status = (c) => text(c, '.project__label')
const count = (c) => text(c, '.project__count')
const elapsed = (c) => text(c, '.project__elapsed')
const remaining = (c) => text(c, '.project__remaining')
const progress = { completed: 2, total: 57 }

// [kind, phase, project, status line, count shown, elapsed shown, remaining text or null]
const copy = [
  ['import', 'downloading', pending, 'Downloading from iCloud', false, true, null],
  ['import', 'starting', pending, 'Starting import…', false, true, null],
  ['import', 'queued', pending, 'Import queued', false, true, null],
  ['import', 'running', pending, 'Importing screenplay', true, true, 'about 2 min left'],
  ['import', 'failed', pending, 'Import failed', false, false, null],
  ['extract', 'starting', parsed, 'Starting extraction…', false, true, null],
  ['extract', 'queued', parsed, 'Extraction queued', false, true, null],
  ['extract', 'running', parsed, 'Extracting entities from scenes', true, true, 'about 2 min left'],
  ['extract', 'finalizing', parsed, 'Finalizing extraction…', true, true, null],
  ['extract', 'failed', parsed, 'Extraction failed', true, false, null],
]

describe('ProjectCard job: the Copy table', () => {
  it.each(copy)('%s/%s', (kind, phase, project, label, hasCount, hasElapsed, rem) => {
    const c = card(project, { kind, phase, progress, elapsedMs: 44_000, remainingMs: 90_000 })
    expect(status(c)).toBe(label)
    expect(c.querySelector('.project__status').dataset.tone).toBe(phase === 'failed' ? 'danger' : 'warning')
    expect(count(c)).toBe(hasCount ? '2/57' : null)
    expect(elapsed(c)).toBe(hasElapsed ? '0:44' : null)
    expect(remaining(c)).toBe(rem)
  })

  it('says "estimating time left" only for a running extraction with a count and no projection', () => {
    expect(remaining(card(parsed, { kind: 'extract', phase: 'running', progress, elapsedMs: 44_000 }))).toBe('estimating time left')
    expect(remaining(card(parsed, { kind: 'extract', phase: 'running', elapsedMs: 44_000 }))).toBeNull()
    expect(remaining(card(parsed, { kind: 'extract', phase: 'finalizing', progress, elapsedMs: 44_000 }))).toBeNull()
    expect(remaining(card(pending, { kind: 'import', phase: 'running', progress, elapsedMs: 44_000 }))).toBeNull()
  })

  it('renders a count only when it is valid', () => {
    for (const bad of [{ completed: 5, total: 0 }, { completed: -1, total: 10 }, { completed: 11, total: 10 }, { completed: 1.5, total: 10 }]) {
      expect(count(card(parsed, { kind: 'extract', phase: 'running', progress: bad }))).toBeNull()
    }
  })

  it('renders nothing for a duration that is negative or not finite', () => {
    for (const bad of [-5, NaN, Infinity]) {
      const c = card(parsed, { kind: 'extract', phase: 'running', progress, elapsedMs: bad, remainingMs: bad })
      expect(elapsed(c)).toBeNull()
      expect(remaining(c)).toBe('estimating time left')
    }
    // With nothing to say, the timing row is left out entirely.
    expect(card(parsed, { kind: 'extract', phase: 'starting', elapsedMs: -1 }).querySelector('.project__timing')).toBeNull()
  })
})

describe('ProjectCard job: rows', () => {
  it('omits the meta row for an import, and shows it for an extraction', () => {
    expect(card(pending, { kind: 'import', phase: 'running' }).querySelector('.project__meta')).toBeNull()
    expect(card(parsed, { kind: 'extract', phase: 'running' }).querySelector('.project__meta')).not.toBeNull()
  })

  it('offers no action at all during an import', () => {
    const c = card({ ...parsed, package_stage: '' }, { kind: 'import', phase: 'running' })
    expect(c.querySelector('.project__actions')).toBeNull()
  })

  it('lets the job outrank an absent or empty stage', () => {
    expect(status(card(pending, { kind: 'import', phase: 'queued' }))).toBe('Import queued')
    expect(status(card({ ...pending, package_stage: '' }, { kind: 'import', phase: 'queued' }))).toBe('Import queued')
    // and a stage that would otherwise speak
    expect(status(card({ ...parsed, package_stage: 'indexed' }, { kind: 'extract', phase: 'running' }))).toBe('Extracting entities from scenes')
  })

  it('falls back to the stage chip for an unknown phase or kind', () => {
    expect(status(card(parsed, { kind: 'extract', phase: 'downloading' }))).toBe('Parsed')
    expect(status(card(parsed, { kind: 'render', phase: 'running' }))).toBe('Parsed')
    expect(status(card(parsed, { kind: 'extract', phase: 'toString' }))).toBe('Parsed')
  })

  it('puts the count at the end of the rail, not on the status line', () => {
    const c = card(parsed, { kind: 'extract', phase: 'running', progress })
    expect(c.querySelector('.project__status .project__count')).toBeNull()
    expect(c.querySelector('.project__rail-row .project__count')).not.toBeNull()
  })

  it('fills the active segment only while a running job is counted', () => {
    const fill = (job, p = parsed) => card(p, job).querySelector('.project__stage-fill')?.style.width ?? null
    expect(fill({ kind: 'extract', phase: 'running', progress })).toBe('4%')
    expect(fill({ kind: 'extract', phase: 'finalizing', progress })).toBeNull()
    expect(fill({ kind: 'import', phase: 'running', progress }, pending)).toBe('4%')
  })

  it('places the active segment by job: import is 1 then 2, extraction is 3', () => {
    const active = (job, p) => [...card(p, job).querySelectorAll('.project__stage-step')]
      .findIndex((s) => s.className.includes('--active'))
    expect(active({ kind: 'import', phase: 'downloading' }, pending)).toBe(0)
    expect(active({ kind: 'import', phase: 'running' }, pending)).toBe(1)
    expect(active({ kind: 'extract', phase: 'running' }, parsed)).toBe(2)
  })

  it('shows a waiting segment static, and a failed one in danger', () => {
    const step = (job, p) => card(p, job).querySelector('.project__stage-step--active')
    expect(step({ kind: 'import', phase: 'queued' }, pending).className).toContain('--waiting')
    expect(step({ kind: 'extract', phase: 'queued' }, parsed).className).toContain('--waiting')
    expect(step({ kind: 'extract', phase: 'failed', progress: { completed: 31, total: 57 } }, parsed).className).toContain('--failed')
    expect(step({ kind: 'import', phase: 'failed' }, pending).className).toContain('--failed')
  })

  it('keeps the action disabled while an extraction is in flight, and enables retry on failure', () => {
    const action = (job) => card(parsed, job).querySelector('.project__action')
    expect(action({ kind: 'extract', phase: 'running' }).disabled).toBe(true)
    expect(action({ kind: 'extract', phase: 'failed' }).disabled).toBe(false)
    expect(action({ kind: 'extract', phase: 'failed' }).getAttribute('aria-label')).toBe('Retry extraction for Broken in Four Places')
  })

  it('describes the activate button with the status and count, never a time', () => {
    const c = card(parsed, { kind: 'extract', phase: 'running', progress, elapsedMs: 44_000, remainingMs: 90_000 })
    const id = c.querySelector('.project__activate').getAttribute('aria-describedby')
    expect(id).toBeTruthy()
    expect(c.querySelector(`[id="${id}"]`).textContent.trim()).toBe('Extracting entities from scenes, 2 of 57')
    expect(c.querySelector('.project__footer').getAttribute('aria-hidden')).toBe('true')
  })

  it('has no describedby when there is no job', () => {
    expect(card(parsed, undefined).querySelector('.project__activate').hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('ProjectCard: the three extraction props are gone', () => {
  const root = join(import.meta.dirname, '../../../..', 'components/svelte')
  it.each(['ProjectCard.svelte', 'ProjectCard.svelte.d.ts'])('%s names none of them', (file) => {
    const src = readFileSync(join(root, file), 'utf8')
    expect(src).not.toMatch(/extractionState|extractionProgress|extractionTiming/)
    expect(src).toMatch(/\bjob\b/)
  })

  it('caps only the label, not the status row', () => {
    const src = readFileSync(join(root, 'ProjectCard.svelte'), 'utf8')
    const block = (sel) => src.slice(src.indexOf(`${sel} {`), src.indexOf('}', src.indexOf(`${sel} {`)))
    expect(block('.project__label')).toMatch(/max-width:\s*22ch/)
    expect(block('.project__status')).not.toMatch(/max-width/)
  })
})
