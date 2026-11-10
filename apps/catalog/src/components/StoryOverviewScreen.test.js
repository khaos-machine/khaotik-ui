import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import StoryOverviewScreen from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewScreen.svelte'
import captured from '../data/story-overview.json'

// The Overview as one screen (operator, 2026-11-10: "let's assemble the full overview screen with
// sidebar, header and such for review in catalog", placed in the kit: "New kit component"). It is
// khaos-app's Overview (khaos-app src/ui/shell/Shell.svelte, overviewView): the strip, then the
// outline, the document and the side pane, the selection shared between the document and the side.
// b4p's captured reads, verbatim.

const loaded = (data) => ({ kind: 'loaded', data })
const report = captured['coverage/report']
const reads = {
  title: 'B4P',
  premise: loaded(captured.premise.premise),
  structure: loaded(captured.structure),
  coverage: loaded(report),
}
const strip = { coverage: { verdict: report.rubric.verdict.value } }
const loading = { kind: 'loading' }

afterEach(() => vi.restoreAllMocks())

describe('StoryOverviewScreen', () => {
  it('draws the strip over the outline, the document and the side pane', () => {
    render(StoryOverviewScreen, { props: { ...reads, strip } })
    expect(screen.getByRole('button', { name: 'Coverage: Consider' })).toBeVisible()
    expect(screen.getByRole('group', { name: 'Overview' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Premise' })).toBeVisible()
    expect(screen.getByText('Select a turning point, a character, a journey or a relationship to see more here.')).toBeVisible()
  })

  it('shows what is selected in the document in the side pane', async () => {
    const onselect = vi.fn()
    render(StoryOverviewScreen, { props: { ...reads, onselect } })
    await fireEvent.click(within(screen.getByRole('group', { name: 'Characters' })).getByRole('button', { name: 'JETTA' }))
    const index = report.characters.findIndex((c) => c.name === 'JETTA')
    expect(onselect).toHaveBeenCalledWith({ kind: 'character', index })
    expect(screen.getByRole('heading', { name: 'JETTA' })).toBeVisible()
  })

  it('jumps the document to the section chosen in the outline', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    render(StoryOverviewScreen, { props: reads })
    await fireEvent.click(within(screen.getByRole('group', { name: 'Overview' })).getByRole('button', { name: 'Coverage' }))
    expect(scroll.mock.contexts[0]).toBe(document.querySelector('[data-ui-id="story.overview.coverage"]'))
    expect(within(screen.getByRole('group', { name: 'Overview' })).getByRole('button', { name: 'Coverage' })).toHaveAttribute('aria-current', 'true')
  })

  it('says it is reading while premise, shape and coverage all load', () => {
    render(StoryOverviewScreen, { props: { title: 'B4P', premise: loading, structure: loading, coverage: loading } })
    expect(screen.getByText("Reading this story's analyses…")).toBeVisible()
    expect(screen.queryByRole('group', { name: 'Overview' })).toBeNull()
  })

  it('draws no strip when the host passes none', () => {
    render(StoryOverviewScreen, { props: reads })
    expect(screen.queryByRole('button', { name: /^Coverage:/ })).toBeNull()
  })
})
