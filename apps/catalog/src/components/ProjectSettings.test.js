import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ProjectSettings from '@khaos-machine/khaotik-ui/components/svelte/ProjectSettings.svelte'

// A story's own settings window (khaos.machine stage 3 display plan A6). K, 2026-10-24: "nothing
// project level should go into app settings". Illustrative amounts in khaosd's shape.

const budget = { kind: 'loaded', usd: '5.00', spentUsd: '1.23', remainingUsd: '3.77' }
const draw = (props = {}) => render(ProjectSettings, { props: { budget, ...props } })

describe('ProjectSettings', () => {
  // The window's title names the story, and Budget is the only pane, so there is one heading and
  // no rail to choose it from.
  it('opens on Budget with one heading and no rail', () => {
    draw()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Budget'])
    expect(screen.getByRole('textbox', { name: 'Spending limit (USD)' })).toHaveValue('5.00')
  })

  it('passes a save and a reset through to the host', async () => {
    const onsave = vi.fn()
    const onreset = vi.fn()
    draw({ onsave, onreset })
    await fireEvent.input(screen.getByRole('textbox', { name: 'Spending limit (USD)' }), { target: { value: '8.00' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onsave).toHaveBeenCalledWith('8.00')
    await fireEvent.click(screen.getByRole('button', { name: 'Reset spend' }))
    expect(onreset).toHaveBeenCalledOnce()
  })
})
