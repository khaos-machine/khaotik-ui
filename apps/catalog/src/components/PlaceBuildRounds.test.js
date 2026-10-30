import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import PlaceBuildRounds from '@khaos-machine/khaotik-ui/components/svelte/PlaceBuildRounds.svelte'

const rounds = [
  { round: 1, kind: 'draft', problems: 0 },
  { round: 2, kind: 'draft', problems: 2, thumbnail: '/r2.png' },
  { round: 3, kind: 'submitted', problems: 0, thumbnail: '/r3.png' },
]

describe('PlaceBuildRounds', () => {
  it('names every tile by its round, state and problems', () => {
    render(PlaceBuildRounds, { props: { rounds, outcome: 'Built in 3 rounds' } })
    const strip = screen.getByRole('group', { name: 'Build rounds' })
    expect(within(strip).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'Round 1, no camera problems',
      'Round 2, 2 camera problems',
      'Round 3, submitted, no camera problems',
    ])
    expect(screen.getByRole('status').textContent).toBe('Built in 3 rounds')
  })

  it('shows a pending round and the spend while running', () => {
    render(PlaceBuildRounds, { props: { rounds, running: true, spend: '$0.02' } })
    expect(screen.getByRole('img', { name: 'Round 4, in progress' })).toBeTruthy()
    expect(screen.getByText('Round 4')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('$0.02')
  })

  it('selects the newest by default and moves with the arrow keys', async () => {
    const onselect = vi.fn()
    render(PlaceBuildRounds, { props: { rounds, onselect } })
    const newest = screen.getByRole('button', { name: /^Round 3/ })
    expect(newest.getAttribute('aria-pressed')).toBe('true')
    expect(newest.tabIndex).toBe(0)
    await fireEvent.keyDown(newest, { key: 'ArrowLeft' })
    expect(onselect).toHaveBeenLastCalledWith(2)
    await fireEvent.keyDown(newest, { key: 'Home' })
    expect(onselect).toHaveBeenLastCalledWith(1)
    await fireEvent.click(screen.getByRole('button', { name: /^Round 2/ }))
    expect(onselect).toHaveBeenLastCalledWith(2)
  })

  it('keeps problem sentences behind a per-camera expand, and lists unseen rooms', () => {
    const detail = {
      cameras: [
        { id: 'A', label: 'Kitchen', url: '/a.png', problems: ['The camera is inside a fixture.'] },
        { id: 'B', url: '/b.png', problems: [] },
      ],
      unseenRooms: ['Linen closet'],
    }
    render(PlaceBuildRounds, { props: { rounds, selected: 2, detail } })
    expect(screen.getByRole('img', { name: 'Kitchen' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'B' })).toBeTruthy()
    const summary = screen.getByLabelText('Kitchen: 1 camera problem')
    expect(summary.closest('details')?.open).toBe(false)
    expect(within(screen.getByRole('list', { name: 'Rooms no camera sees' })).getByText('Linen closet')).toBeTruthy()
  })

  it('draws a round with no picture as an empty frame', () => {
    const { container } = render(PlaceBuildRounds, { props: { rounds: [rounds[0]] } })
    expect(container.querySelector('img')).toBeNull()
  })
})
