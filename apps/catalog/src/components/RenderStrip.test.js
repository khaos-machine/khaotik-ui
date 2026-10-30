import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import RenderStrip from '@khaos-machine/khaotik-ui/components/svelte/RenderStrip.svelte'

// RenderStrip (data-layer plan K15; audit §3.6, §4.1). One cell per scene or segment,
// coloured by its RenderMark state, click to select. A cell the engine said nothing about
// is absent, not missing (audit §3.13), exactly as RenderMark is.

const cells = [
  { id: 'S47', label: 'S47', state: 'ready' },
  { id: 'S48', label: 'S48', state: 'stale' },
  { id: 'S49', label: 'S49', state: 'missing' },
  { id: 'S50', label: 'S50' },
]

describe('RenderStrip', () => {
  it('a cell with no state renders as absent, not missing', () => {
    render(RenderStrip, { props: { cells, label: 'Scene reads' } })
    const absent = screen.getByRole('button', { name: 'S50' })
    expect(absent).not.toHaveAttribute('data-state')
    expect(absent).not.toHaveAccessibleName(/Missing/)
    expect(screen.getByRole('button', { name: 'S49, Missing' })).toHaveAttribute('data-state', 'missing')
  })

  it('a cell with a state names it, never by colour alone', () => {
    render(RenderStrip, { props: { cells, label: 'Scene reads' } })
    expect(screen.getByRole('button', { name: 'S47, Ready' })).toHaveAttribute('data-state', 'ready')
    expect(screen.getByRole('button', { name: 'S48, Stale' })).toHaveAttribute('data-state', 'stale')
  })

  it('clicking a cell emits its id, and the selected cell is pressed', async () => {
    const onselect = vi.fn()
    render(RenderStrip, { props: { cells, label: 'Scene reads', selected: 'S48', onselect } })
    expect(screen.getByRole('button', { name: 'S48, Stale' })).toHaveAttribute('aria-pressed', 'true')
    await fireEvent.click(screen.getByRole('button', { name: 'S50' }))
    expect(onselect).toHaveBeenCalledWith('S50')
  })

  it('is a named group with automation ids', () => {
    render(RenderStrip, { props: { cells, label: 'Scene reads' } })
    expect(screen.getByRole('group', { name: 'Scene reads' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'S50' })).toHaveAttribute('data-ui-id', 'strip.cell.S50')
  })
})
