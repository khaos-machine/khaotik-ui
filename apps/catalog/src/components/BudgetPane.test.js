import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import BudgetPane from '@khaos-machine/khaotik-ui/components/svelte/BudgetPane.svelte'

// Project Settings › Budget: one dollar limit (K, 2026-10-24: "one fucking number ($USD) as MAX
// spend. THAT'S IT! user can increase or reset. no count caps!!!"). Illustrative amounts in
// khaosd's shape (khaos-manager #1032).

const loaded = (over = {}) => ({ kind: 'loaded', usd: '5.00', spentUsd: '1.23', remainingUsd: '3.77', ...over })
const draw = (props = {}) => render(BudgetPane, { props: { budget: loaded(), ...props } })
const field = () => screen.getByRole('textbox', { name: 'Spending limit (USD)' })
const save = () => screen.getByRole('button', { name: 'Save' })
const resetSpend = () => screen.getByRole('button', { name: 'Reset spend' })
const type = (value) => fireEvent.input(field(), { target: { value } })

describe('BudgetPane', () => {
  it('holds the limit and what is spent of it, and nothing else', () => {
    const { container } = draw()
    expect(field()).toHaveValue('5.00')
    expect(screen.getByText('$1.23 of $5.00')).toBeVisible()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(container.querySelector('p')).toBeNull()
    expect(screen.queryByText(/calls/)).toBeNull()
  })

  it('draws the spend against the limit as typed', async () => {
    const { container } = draw()
    const fill = () => container.querySelector('.ui-budget-pane__fill')
    expect(fill().style.transform).toBe(`scaleX(${1.23 / 5})`)
    await type('2.46')
    expect(fill().style.transform).toBe('scaleX(0.5)')
    await type('abc')
    expect(fill().style.transform).toBe(`scaleX(${1.23 / 5})`)
  })

  it('takes the warning tone once the engine says nothing is left', () => {
    const { container } = draw({ budget: loaded({ spentUsd: '5.00', remainingUsd: '0' }) })
    expect(container.querySelector('.ui-budget-pane__fill')).toHaveAttribute('data-spent', 'all')
  })

  it('saves only a change, as a decimal string', async () => {
    const onsave = vi.fn()
    draw({ onsave })
    expect(save()).toHaveAttribute('aria-disabled', 'true')
    await type(' 10.00 ')
    await fireEvent.click(save())
    expect(onsave).toHaveBeenCalledWith('10.00')
  })

  it('requires an amount', async () => {
    const onsave = vi.fn()
    draw({ onsave })
    await type('abc')
    expect(screen.getByText('Enter an amount like 2.50.')).toBeVisible()
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    await type('')
    expect(screen.getByText('Enter a spending limit, like 2.50.')).toBeVisible()
    await fireEvent.click(save())
    expect(onsave).not.toHaveBeenCalled()
  })

  it('resets what is spent, and offers no reset with nothing spent', async () => {
    const onreset = vi.fn()
    const { rerender } = draw({ onreset })
    await fireEvent.click(resetSpend())
    expect(onreset).toHaveBeenCalledOnce()
    rerender({ budget: loaded({ spentUsd: '0', remainingUsd: '5.00' }), onreset })
    expect(resetSpend()).toHaveAttribute('aria-disabled', 'true')
  })

  it("offers the engine's suggested amounts for a story with no budget, one filling the field", async () => {
    const onsave = vi.fn()
    draw({ budget: { kind: 'none', suggested: { usd: ['10', '25', '100'] } }, onsave })
    expect(field()).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Reset spend' })).toBeNull()
    const choices = screen.getByRole('group', { name: 'Suggested' })
    expect(within(choices).getAllByRole('button').map((b) => b.textContent.trim())).toEqual(['$10.00', '$25.00', '$100.00'])
    await fireEvent.click(within(choices).getByRole('button', { name: '$25.00' }))
    expect(field()).toHaveValue('25.00')
    await fireEvent.click(save())
    expect(onsave).toHaveBeenCalledWith('25.00')
  })

  it('starts a story with no budget and no suggestion empty', async () => {
    const onsave = vi.fn()
    draw({ budget: { kind: 'none' }, onsave })
    expect(field()).toHaveValue('')
    expect(save()).toHaveAttribute('aria-disabled', 'true')
    await type('1.50')
    await fireEvent.click(save())
    expect(onsave).toHaveBeenCalledWith('1.50')
  })

  it('shows saving, resetting, a refused budget and failures', () => {
    const { rerender } = draw({ save: { kind: 'saving' } })
    expect(screen.getByText('Saving…')).toBeVisible()
    rerender({ budget: loaded(), save: { kind: 'idle' }, reset: { kind: 'resetting' } })
    expect(screen.getByText('Resetting…')).toBeVisible()
    expect(resetSpend()).toHaveAttribute('aria-disabled', 'true')
    rerender({ budget: loaded(), reset: { kind: 'idle' }, save: { kind: 'invalid', message: 'INVALID_BUDGET: usd must be a decimal' } })
    expect(screen.getByText("Khaos didn't accept this budget.")).toBeVisible()
    expect(screen.getByText('INVALID_BUDGET: usd must be a decimal')).toBeVisible()
    rerender({ budget: loaded(), save: { kind: 'failed', message: 'connection refused' } })
    expect(screen.getByText("Khaos couldn't save this story's budget.")).toBeVisible()
    rerender({ budget: loaded(), reset: { kind: 'failed', message: 'connection refused' } })
    expect(screen.getByText("Khaos couldn't reset this story's spend.")).toBeVisible()
  })

  it('says when it could not read the budget', () => {
    draw({ budget: { kind: 'failed', message: 'BUDGET_UNREADABLE' } })
    expect(screen.getByText("Khaos couldn't read this story's budget.")).toBeVisible()
    expect(screen.getByText('BUDGET_UNREADABLE')).toBeVisible()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('shows the saved answer in the field once the host passes it', async () => {
    const { rerender } = draw()
    await type('10.00')
    rerender({ budget: loaded({ usd: '10.00', remainingUsd: '8.77' }) })
    expect(field()).toHaveValue('10.00')
    expect(save()).toHaveAttribute('aria-disabled', 'true')
  })
})
