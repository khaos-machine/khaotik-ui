import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import captured from '../data/story-overview.json'

// The story-wide analyses (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md,
// item 4): premise, shape, the turning points and coverage, one document, each section drawn from
// its own read so one failing never blanks the others. The data is b4p's, verbatim.

const report = captured['coverage/report']
const loaded = (data) => ({ kind: 'loaded', data })
const base = {
  title: 'B4P',
  premise: loaded(captured.premise.premise),
  structure: loaded(captured.structure),
  coverage: loaded(report),
}
const region = (name) => screen.getByRole('region', { name })

describe('StoryOverview read sections', () => {
  it('heads the document with the story and when coverage was made', () => {
    render(StoryOverview, { props: base })
    expect(screen.getByText('Story')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'B4P' })).toBeVisible()
    expect(screen.getByText('Coverage made 23 Oct 2026')).toBeVisible()
  })

  it('shows the premise with its source, the model and confidence only in Advanced', () => {
    const { unmount } = render(StoryOverview, { props: base })
    const premise = region('Premise')
    expect(within(premise).getByText(captured.premise.premise.logline.value)).toBeVisible()
    expect(within(premise).getByText(captured.premise.premise.synopsis.value.replace(/\s+/g, ' ').trim())).toBeVisible()
    expect(within(premise).getAllByText('AI')).toHaveLength(2)
    unmount()
    render(StoryOverview, { props: { ...base, advanced: true } })
    expect(within(region('Premise')).getAllByText('AI · medium')).toHaveLength(2)
  })

  it('states the shape in the engine\'s words with its outcome', () => {
    render(StoryOverview, { props: base })
    const shape = region('Shape')
    expect(within(shape).getByText(captured.structure.fit.reason)).toBeVisible()
    expect(within(shape).getByText('More than one structure fits')).toBeVisible()
  })

  it('lists where the story turns in engine order and selects a turn', async () => {
    const onselect = vi.fn()
    render(StoryOverview, { props: { ...base, onselect } })
    const turns = within(region('Where the story turns')).getAllByRole('button')
    const points = captured.structure.names.points
    expect(turns).toHaveLength(points.length)
    expect(turns[0]).toHaveAccessibleName(points[0].name)
    expect(turns[0]).toHaveTextContent(points[0].turn)
    await fireEvent.click(turns[1])
    expect(onselect).toHaveBeenLastCalledWith({ kind: 'turn', index: 1 })
  })

  it('says the turns are not named yet, drawing no rows, when names are absent', () => {
    const { names, ...unnamed } = captured.structure
    render(StoryOverview, { props: { ...base, structure: loaded(unnamed) } })
    expect(screen.getByText("The turning points haven't been named yet.")).toBeVisible()
    expect(screen.queryByRole('region', { name: 'Where the story turns' })).toBeNull()
  })

  it('shows lens scores and the naming model only in Advanced', () => {
    const { unmount } = render(StoryOverview, { props: base })
    expect(screen.queryByRole('button', { name: /Show details/ })).toBeNull()
    unmount()
    render(StoryOverview, { props: { ...base, advanced: true } })
    expect(screen.getAllByRole('button', { name: /Show details/ }).length).toBeGreaterThan(0)
  })

  it('draws coverage: verdict, measures, genre and tone, its own logline and synopsis', () => {
    render(StoryOverview, { props: base })
    const coverage = region('Coverage')
    expect(within(coverage).getByText('Consider')).toBeVisible()
    expect(within(coverage).getByText('Consider').closest('[title]')).toHaveAttribute('title', report.rubric.verdict.evidence[0].citation)
    expect(within(coverage).getByRole('group', { name: 'Runtime' })).toHaveTextContent('77 min')
    expect(within(coverage).getByRole('group', { name: 'Pages' })).toHaveTextContent('52')
    expect(within(coverage).getByRole('group', { name: 'Scenes' })).toHaveTextContent('57')
    expect(within(coverage).getByText(report.genre.value)).toBeVisible()
    expect(within(coverage).getByText('Coverage logline')).toBeVisible()
    expect(within(coverage).getByText(report.logline.value)).toBeVisible()
    expect(within(coverage).getByText('Coverage synopsis')).toBeVisible()
  })

  it('says part of the coverage was not finished', () => {
    render(StoryOverview, { props: base })
    expect(screen.getByText("Part of this coverage wasn't finished: character journeys.")).toBeVisible()
  })

  it('lists the assessment and the rubric, "No score" where the engine gave none', () => {
    const dims = report.rubric.dimensions.map((d, i) => (i === 1 ? { ...d, score: { value: null, source: 'none', confidence: 'none' } } : d))
    render(StoryOverview, { props: { ...base, coverage: loaded({ ...report, rubric: { ...report.rubric, dimensions: dims } }) } })
    const strengths = within(region('Strengths')).getAllByRole('listitem')
    expect(strengths).toHaveLength(report.assessment.strengths.value.length)
    // khaosd sends the notes as prose, not a list (K, 2026-10-24: a bullet per character).
    expect(screen.getByText(report.assessment.notes.value.replace(/\s+/g, ' ').trim())).toBeVisible()
    const rubric = region('Rubric')
    expect(within(rubric).getByRole('group', { name: dims[0].name })).toHaveTextContent(`${dims[0].score.value} / 10`)
    expect(within(rubric).getByRole('group', { name: dims[1].name })).toHaveTextContent('No score')
  })

  it('tables the characters in engine order and selects one', async () => {
    const onselect = vi.fn()
    render(StoryOverview, { props: { ...base, onselect } })
    const rows = within(region('Characters')).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(report.characters.length)
    expect(rows[0]).toHaveTextContent(report.characters[0].name)
    await fireEvent.click(within(rows[2]).getByRole('button'))
    expect(onselect).toHaveBeenLastCalledWith({ kind: 'character', index: 2 })
  })

  it('lists production facts and only the flags raised', () => {
    render(StoryOverview, { props: base })
    const production = region('Production')
    expect(within(production).getByRole('group', { name: 'Locations' })).toHaveTextContent('26')
    expect(within(production).getByRole('group', { name: 'Speaking roles' })).toHaveTextContent('17')
    expect(within(production).getByText('Action-heavy scenes')).toBeVisible()
    expect(within(production).getByText('Child roles')).toBeVisible()
    expect(within(production).queryByText('Crowd scenes')).toBeNull()
    expect(within(production).getByText('Scenes in the three main places: 46%')).toBeVisible()
  })

  it('fails the production notes alone on a flag it has no label for', () => {
    const viability = { ...report.viability, productionFlags: { ...report.viability.productionFlags, laserBattles: true } }
    render(StoryOverview, { props: { ...base, coverage: loaded({ ...report, viability }) } })
    expect(screen.getByText("Khaos couldn't read this coverage's production notes.")).toBeVisible()
    expect(screen.queryByText('laserBattles')).toBeNull()
    expect(within(region('Coverage')).getByText('Consider')).toBeVisible()
  })

  it('draws each section\'s missing, loading and failed state on its own', () => {
    render(StoryOverview, { props: {
      title: 'B4P',
      premise: { kind: 'missing', reason: 'Premise needs coverage first.' },
      structure: { kind: 'missing' },
      coverage: { kind: 'failed', message: 'COVERAGE_READ_FAILED: bad json' },
    } })
    expect(screen.getByText('This story has no premise yet.')).toBeVisible()
    expect(screen.getByText('Premise needs coverage first.')).toBeVisible()
    expect(screen.getByText("This story's shape hasn't been measured yet.")).toBeVisible()
    expect(screen.getByText('COVERAGE_READ_FAILED: bad json')).toBeVisible()
  })

  it('shows the loading line per section and the shape\'s failed line', () => {
    render(StoryOverview, { props: { title: 'B4P', premise: { kind: 'loading' }, structure: { kind: 'failed', message: 'boom' }, coverage: { kind: 'loading' }, journeys: loaded([]), relationships: loaded([]) } })
    expect(screen.getAllByText("Reading this story's analyses…")).toHaveLength(2)
    expect(screen.getByText("Khaos couldn't read this story's shape.")).toBeVisible()
  })
})

// One-click runs under the story budget (design :796-827, :937-939): no dialog, no checkbox.
describe('StoryOverview run actions', () => {
  const missing = { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' } }
  const none = { kind: 'none' }
  const runs = (over) => ({ premise: none, structure: none, coverage: none, ...over })
  const draw = (over, extra = {}) => render(StoryOverview, { props: { ...missing, runs: runs(over), ...extra } })
  const noDialog = () => {
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
  }

  it('offers the free Measure with its hint and runs it in one click', async () => {
    const onrun = vi.fn()
    draw({ structure: { kind: 'offer', paid: false } }, { onrun })
    const shape = region('Shape')
    expect(within(shape).getByText('Free. Finds where the story turns from the scene and character analyses.')).toBeVisible()
    await fireEvent.click(within(shape).getByRole('button', { name: 'Measure the shape' }))
    expect(onrun).toHaveBeenCalledOnce()
    expect(onrun).toHaveBeenCalledWith('structure')
    noDialog()
  })

  it('offers each paid pass in one click with its call count', async () => {
    const onrun = vi.fn()
    draw({
      structure: { kind: 'offer', paid: true, maxCalls: 3 },
      coverage: { kind: 'offer', paid: true, maxCalls: 1 },
      premise: { kind: 'offer', paid: true, maxCalls: 3 },
    }, { onrun })
    expect(within(region('Shape')).getByText('Uses up to 3 text calls.')).toBeVisible()
    expect(within(region('Coverage')).getByText('Uses up to 1 text call.')).toBeVisible()
    expect(within(region('Premise')).getByText('Uses up to 3 text calls.')).toBeVisible()
    await fireEvent.click(screen.getByRole('button', { name: 'Name the turning points' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Write coverage' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Write a premise' }))
    expect(onrun.mock.calls).toEqual([['structureNaming'], ['coverage'], ['premise']])
    noDialog()
  })

  it('says no turning points were found when naming would make no calls', () => {
    draw({ structure: { kind: 'offer', paid: true, maxCalls: 0 } })
    expect(screen.getByText('No turning points were found to name.')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Name the turning points' })).toBeNull()
  })

  it('asks for a budget in place of the action when the story has none', async () => {
    const onsetbudget = vi.fn()
    draw({ coverage: { kind: 'needs-budget' } }, { onsetbudget })
    const coverage = region('Coverage')
    expect(within(coverage).getByText('No budget set.')).toBeVisible()
    expect(within(coverage).queryByRole('button', { name: 'Write coverage' })).toBeNull()
    await fireEvent.click(within(coverage).getByRole('button', { name: 'Set budget…' }))
    expect(onsetbudget).toHaveBeenCalledOnce()
  })

  it('says the budget stopped the run, in dollars when sent, and keeps the action', async () => {
    const onsetbudget = vi.fn()
    const { unmount } = draw({ premise: { kind: 'budget-reached', usd: '10.00', spentUsd: '10.00', maxCalls: 3 } }, { onsetbudget })
    const premise = region('Premise')
    expect(within(premise).getByText('Stopped at the budget: $10.00 of $10.00 spent.')).toBeVisible()
    expect(within(premise).getByRole('button', { name: 'Write a premise' })).toBeVisible()
    await fireEvent.click(within(premise).getByRole('button', { name: 'Change budget…' }))
    expect(onsetbudget).toHaveBeenCalledOnce()
    unmount()
    draw({ premise: { kind: 'budget-reached' } })
    expect(screen.getByText('Stopped at the budget.')).toBeVisible()
  })

  it('draws running, blocked and failed, offering a failed run again in one click', async () => {
    const onrun = vi.fn()
    draw({
      structure: { kind: 'running', paid: true, progress: 'Scene 4 of 57' },
      coverage: { kind: 'blocked', reason: 'Another analysis is running on this story. This one can start when it finishes.' },
      premise: { kind: 'failed', message: 'provider timed out', offer: { paid: true, maxCalls: 3 } },
    }, { onrun })
    expect(screen.getByText('Naming the turning points…')).toBeVisible()
    expect(screen.getByText('Scene 4 of 57')).toBeVisible()
    expect(screen.getByText('Another analysis is running on this story. This one can start when it finishes.')).toBeVisible()
    const premise = region('Premise')
    expect(within(premise).getByText("This analysis didn't finish.")).toBeVisible()
    expect(within(premise).getByText('provider timed out')).toBeVisible()
    await fireEvent.click(within(premise).getByRole('button', { name: 'Write a premise' }))
    expect(onrun).toHaveBeenCalledWith('premise')
  })

  it('names each running pass in its own words', () => {
    draw({ structure: { kind: 'running', paid: false }, coverage: { kind: 'running', paid: true }, premise: { kind: 'running', paid: true } })
    expect(screen.getByText('Measuring the shape…')).toBeVisible()
    expect(screen.getByText('Writing coverage…')).toBeVisible()
    expect(screen.getByText('Writing a premise…')).toBeVisible()
  })

  it('reports a finished run one line per provider entry, never summed', () => {
    const totals = [{ attempts: 2, provider: 'openrouter', model: 'qwen/qwen3' }, { attempts: 1, provider: 'openai', model: 'gpt-5' }]
    const { unmount } = draw({ coverage: { kind: 'done', totals, maxCalls: 3 } })
    expect(screen.getByText('2 calls made')).toBeVisible()
    expect(screen.getByText('1 call made')).toBeVisible()
    expect(screen.getByText('Up to 3 were allowed.')).toBeVisible()
    unmount()
    const advanced = draw({ coverage: { kind: 'done', totals, maxCalls: 3 } }, { advanced: true })
    expect(screen.getByText('2 calls to openrouter (qwen/qwen3)')).toBeVisible()
    expect(screen.getByText('1 call to openai (gpt-5)')).toBeVisible()
    advanced.unmount()
    draw({ coverage: { kind: 'done' } })
    expect(screen.getByText('Done.')).toBeVisible()
  })

  it('declares no consent props', async () => {
    const source = (await import('../../../../components/svelte/StoryOverview.svelte?raw')).default
    expect(source).not.toMatch(/\bconsent\b|onconfirm|oncancel|ConfirmDialog|Checkbox/)
  })
})
