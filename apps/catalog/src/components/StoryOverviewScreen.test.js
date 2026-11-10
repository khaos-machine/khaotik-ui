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
  it('draws the strip over the outline and the document, with no side pane until something is selected', () => {
    render(StoryOverviewScreen, { props: { ...reads, strip } })
    expect(screen.getByRole('button', { name: 'Coverage: Consider' })).toBeVisible()
    expect(screen.getByRole('group', { name: 'Overview' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Premise' })).toBeVisible()
    expect(screen.queryByText('Select a turning point, a character, a journey or a relationship to see more here.')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  // Operator, 2026-11-10: "Side pane on demand", as a "Column opens": a selection opens the side
  // pane beside the document; Close or Esc clears the selection, which closes it.
  it('opens the side pane on a selection and closes it with Close or Esc', async () => {
    const onselect = vi.fn()
    render(StoryOverviewScreen, { props: { ...reads, onselect } })
    const pick = () => within(screen.getByRole('group', { name: 'Characters' })).getByRole('button', { name: 'JETTA' })
    await fireEvent.click(pick())
    await fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: 'JETTA' })).toBeNull()
    expect(onselect).toHaveBeenLastCalledWith(null)
    await fireEvent.click(pick())
    expect(screen.getByRole('heading', { name: 'JETTA' })).toBeVisible()
    await fireEvent.keyDown(pick(), { key: 'Escape' })
    expect(screen.queryByRole('heading', { name: 'JETTA' })).toBeNull()
    expect(onselect).toHaveBeenLastCalledWith(null)
  })

  // Operator, 2026-11-10: the outline, "make it hidable" — hidden, it leaves a rail with the one
  // button that brings it back, and the document takes the width.
  it('hides the outline and brings it back', async () => {
    render(StoryOverviewScreen, { props: reads })
    await fireEvent.click(screen.getByRole('button', { name: 'Hide outline' }))
    expect(screen.queryByRole('group', { name: 'Overview' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Premise' })).toBeVisible()
    await fireEvent.click(screen.getByRole('button', { name: 'Show outline' }))
    expect(screen.getByRole('group', { name: 'Overview' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Show outline' })).toBeNull()
  })

  // Operator, 2026-11-10: "might as well make use of the sidebar and add project settings button
  // at the bottom" — at the foot of the outline, and of its rail when hidden; none without a host.
  it('offers Project Settings at the foot of the outline, shown or hidden', async () => {
    const onProjectSettings = vi.fn()
    const { unmount } = render(StoryOverviewScreen, { props: { ...reads, onProjectSettings } })
    await fireEvent.click(screen.getByRole('button', { name: 'Project Settings' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Hide outline' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Project Settings' }))
    expect(onProjectSettings).toHaveBeenCalledTimes(2)
    unmount()
    render(StoryOverviewScreen, { props: reads })
    expect(screen.queryByRole('button', { name: 'Project Settings' })).toBeNull()
  })

  it('leaves Esc alone outside the screen', async () => {
    render(StoryOverviewScreen, { props: { ...reads, selected: { kind: 'character', index: 0 } } })
    await fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible()
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
