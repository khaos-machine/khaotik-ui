import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import PlaceSide from '@khaos-machine/khaotik-ui/components/svelte/PlaceSide.svelte'
import captured from '../data/place-builder-states.json'

// Place states (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 1): the
// inspector lists how the place appears, one row per state in the engine's order, and asks the
// host to change state. The rows are the captured DESMOND'S APARTMENT states, verbatim.

const states = captured.states
const base = { selected: true, name: captured.name, design: { kind: 'chosen', image: { url: '/sheet.png' } } }

describe('PlaceSide place states', () => {
  it('lists each state with its scenes, the shown state checked', () => {
    render(PlaceSide, { props: { ...base, states, state: 'INT|DAY|' } })
    const group = screen.getByRole('radiogroup', { name: 'How it appears' })
    const radios = within(group).getAllByRole('radio')
    expect(radios.map(r => r.getAttribute('value'))).toEqual(states.map(s => s.key))
    for (const s of states) expect(within(group).getByRole('radio', { name: s.label })).toBeInTheDocument()
    expect(within(group).getByRole('radio', { name: 'Interior · Day' })).toBeChecked()
    expect(within(group).getByRole('radio', { name: 'Exterior · Night' })).toHaveAccessibleDescription('Scene 19')
    expect(within(group).getByRole('radio', { name: 'Interior · Night' })).toHaveAccessibleDescription('Scenes 20, 27, 29, 46, 48')
    expect(screen.getByRole('button', { name: /How it appears/ })).toHaveTextContent('4')
  })

  it('names the shown state under the design', () => {
    render(PlaceSide, { props: { ...base, states, state: 'INT|DAY|' } })
    expect(within(screen.getByRole('region', { name: 'Place design' })).getByText('Interior · Day')).toBeVisible()
  })

  it('asks the host for a state on click and on arrow keys, changing nothing itself', async () => {
    const onstate = vi.fn()
    render(PlaceSide, { props: { ...base, states, state: 'EXT|NIGHT|', onstate } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Interior · Day' }))
    expect(onstate).toHaveBeenLastCalledWith('INT|DAY|')
    expect(screen.getByRole('radio', { name: 'Exterior · Night' })).toBeChecked()
    const shown = screen.getByRole('radio', { name: 'Exterior · Night' })
    shown.focus()
    await fireEvent.keyDown(shown, { key: 'ArrowDown' })
    expect(onstate).toHaveBeenLastCalledWith('INT|NIGHT|')
  })

  it('draws no states and no caption for a place with one state', () => {
    render(PlaceSide, { props: { ...base, states: states.slice(0, 1), state: states[0].key } })
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.queryByText(states[0].label)).toBeNull()
  })

  it('says a state could not be read, keeping the rows to pick another', () => {
    render(PlaceSide, { props: { ...base, states, state: 'INT|DAY|', stateError: 'PLACE_BUILDER_FAILED: unknown state' } })
    expect(screen.getByText("This version of the place couldn't be read.")).toBeVisible()
    expect(screen.getByText('PLACE_BUILDER_FAILED: unknown state')).toBeVisible()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })
})
