import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import PlaceAreas from '@khaos-machine/khaotik-ui/components/svelte/PlaceAreas.svelte'
import captured from '../data/place-builder-states.json'

// Area citations (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 2): one
// block per area in the engine's order, the brief as labelled rows, then the screenplay lines
// that support it, grouped by field. The areas are the captured DESMOND'S APARTMENT areas.

const areas = captured.preparation.areas
const loaded = (list) => ({ read: { kind: 'loaded', areas: list } })

describe('PlaceAreas', () => {
  it('draws one block per area in engine order, each headed by its citation count', () => {
    render(PlaceAreas, { props: loaded(areas) })
    const toggles = screen.getAllByRole('button')
    expect(toggles).toHaveLength(areas.length)
    areas.forEach((a, i) => {
      expect(toggles[i]).toHaveTextContent(a.name)
      expect(toggles[i]).toHaveTextContent(String(a.cited.length))
    })
    expect(screen.getByRole('button', { name: /Kitchen/ })).toHaveTextContent('10')
  })

  it('starts collapsed with more than three areas', () => {
    render(PlaceAreas, { props: loaded(areas) })
    for (const b of screen.getAllByRole('button')) expect(b).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('starts expanded with three or fewer areas', () => {
    render(PlaceAreas, { props: loaded(areas.slice(0, 3)) })
    for (const b of screen.getAllByRole('button')) expect(b).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('region')).toHaveLength(3)
  })

  it('shows the brief as labelled rows, with no Still open row when nothing is unknown', async () => {
    render(PlaceAreas, { props: loaded(areas) })
    await fireEvent.click(screen.getByRole('button', { name: /Kitchen/ }))
    const kitchen = screen.getByRole('region', { name: 'Kitchen' })
    expect(within(kitchen).getByRole('group', { name: 'Space' })).toHaveAccessibleDescription("A kitchen in Desmond's apartment.")
    expect(within(kitchen).getByRole('group', { name: 'Fixed features' })).toHaveAccessibleDescription('The kitchen has a counter.; There is a window in the bedroom, described as open.')
    expect(within(kitchen).getByRole('group', { name: 'Dressing' })).toHaveAccessibleDescription(areas[0].brief.dressing)
    expect(within(kitchen).getByRole('group', { name: 'Lighting' })).toHaveAccessibleDescription(areas[0].brief.lighting)
    expect(within(kitchen).queryByRole('group', { name: 'Still open' })).toBeNull()
  })

  it('shows Still open when the engine lists unknowns', () => {
    const area = { ...areas[1], brief: { ...areas[1].brief, unknowns: ['Whether the sofa faces the window.'] } }
    render(PlaceAreas, { props: loaded([area]) })
    expect(screen.getByRole('group', { name: 'Still open' })).toHaveAccessibleDescription('Whether the sofa faces the window.')
  })

  it('groups the screenplay lines by field in a fixed order, the detail alone without scene numbers', async () => {
    render(PlaceAreas, { props: loaded(areas) })
    await fireEvent.click(screen.getByRole('button', { name: /Kitchen/ }))
    const cited = within(screen.getByRole('region', { name: 'Kitchen' })).getByRole('group', { name: 'From the screenplay' })
    const lists = within(cited).getAllByRole('list')
    expect(lists.map((l) => l.previousElementSibling.textContent)).toEqual(['Space', 'Fixed features', 'Dressing', 'Lighting'])
    const dressing = within(within(cited).getByRole('list', { name: 'Dressing' })).getAllByRole('listitem')
    expect(dressing.map((li) => li.textContent.trim())).toEqual(areas[0].cited.filter((c) => c.field === 'dressing').map((c) => c.detail))
  })

  it('names the scenes when a citation carries scene numbers', () => {
    const area = { name: 'Hall', brief: { spatialDescription: 'A hall.', fixedFeatures: [], dressing: '', lighting: '', unknowns: [] }, cited: [{ field: 'space', detail: 'A hall.', sceneIds: ['a', 'b'], sceneNumbers: [20, 22] }] }
    render(PlaceAreas, { props: loaded([area]) })
    expect(screen.getByRole('listitem')).toHaveTextContent('A hall.Scenes 20, 22')
  })

  it('says so when an area cites no screenplay lines', () => {
    render(PlaceAreas, { props: loaded([{ ...areas[1], cited: [] }]) })
    expect(screen.getByText('No screenplay lines are cited for this area.')).toBeVisible()
    expect(screen.getByRole('group', { name: 'Space' })).toBeInTheDocument()
  })

  it('says so when the place has no areas', () => {
    render(PlaceAreas, { props: loaded([]) })
    expect(screen.getByText('No separate areas were found for this place.')).toBeVisible()
  })

  it('shows the loading line and the failed message', () => {
    const { unmount } = render(PlaceAreas, { props: { read: { kind: 'loading' } } })
    expect(screen.getByText('Reading the areas…')).toBeVisible()
    unmount()
    render(PlaceAreas, { props: { read: { kind: 'failed', message: 'PLACE_BUILDER_FAILED: no such place' } } })
    expect(screen.getByText('Areas not read')).toBeVisible()
    expect(screen.getByText('PLACE_BUILDER_FAILED: no such place')).toBeVisible()
  })
})
