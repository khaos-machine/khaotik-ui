import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import PlaceDetail from '@khaos-machine/khaotik-ui/components/svelte/PlaceDetail.svelte'
import captured from '../data/place-builder-states.json'

// The Areas view (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 2) sits
// beside the place's other views and draws the areas the host passes.

const place = { id: 'location_01M5MJB4BPSTAAFR77ADHVD4SF', name: captured.name }

describe('PlaceDetail areas view', () => {
  it('offers Areas beside the other views', () => {
    render(PlaceDetail, { props: { place } })
    const views = screen.getAllByRole('radio').map((r) => r.getAttribute('value'))
    expect(views).toEqual(['analysis', 'cast', 'headings', 'images', 'areas'])
    expect(screen.getByRole('radio', { name: 'Areas' })).toBeInTheDocument()
  })

  it('reports the view and draws the areas passed', async () => {
    const onview = vi.fn()
    render(PlaceDetail, { props: { place, areas: { kind: 'loaded', areas: captured.preparation.areas }, onview } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Areas' }))
    expect(onview).toHaveBeenLastCalledWith('areas')
    expect(screen.getByRole('button', { name: /Kitchen/ })).toHaveTextContent('10')
  })
})
