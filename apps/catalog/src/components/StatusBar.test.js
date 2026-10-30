import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import StatusBar from '@khaos-machine/khaotik-ui/components/svelte/StatusBar.svelte'

// StatusBar (data-layer plan K12; audit §1.15, §3.15, §3.16, §4.1). The window's bottom
// line: the engine's state, the running jobs, and the last action's result. Undo is
// offered only where the host can reverse the write, which is only when the engine
// serves an inverse (khaos-manager #688), so the bar draws Undo only when it is given one.
//
// A running job is a progress bar pinned to the bar's right edge (operator, 2026-10-11:
// "embed temporal progress bar in our dashboard's footer/statusbar ... maybe pin bar to
// right edge of status bar"): its label, done/total, elapsed and time left.

const engine = { state: 'ready', label: 'khaosd 0.91.0 ready' }

const analysing = {
  id: 'j1',
  label: 'Analysing scenes',
  progress: { completed: 12, total: 54 },
  elapsedMs: 83_000,
  remainingMs: 290_000,
}

describe('StatusBar', () => {
  it('is a status live region carrying the engine state', () => {
    render(StatusBar, { props: { engine } })
    expect(screen.getByRole('status')).toHaveTextContent('khaosd 0.91.0 ready')
  })

  it('no Undo control without an action', () => {
    render(StatusBar, { props: { engine, result: { text: 'Cast DESMOND to Desmond' } } })
    expect(screen.getByText('Cast DESMOND to Desmond')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Undo/ })).toBeNull()
  })

  it('an Undo control when the host passes one, which asks the host', async () => {
    const undo = vi.fn()
    render(StatusBar, { props: { engine, result: { text: 'Decided 116 mentions', undo } } })
    await fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(undo).toHaveBeenCalled()
  })

  it('no Dismiss control unless the host can withdraw the result', () => {
    render(StatusBar, { props: { engine, result: { text: 'Cast DESMOND to Desmond' } } })
    expect(screen.queryByRole('button', { name: /Dismiss/ })).toBeNull()
  })

  // Launcher, 2026-10-14: a notice stayed on screen with nothing to clear it.
  it('a Dismiss control when the host passes one, which asks the host', async () => {
    const dismiss = vi.fn()
    render(StatusBar, { props: { engine, result: { text: 'Not indexed yet', tone: 'error', dismiss } } })
    await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(dismiss).toHaveBeenCalled()
  })

  it('a running job is a determinate bar with its count, elapsed and time left', () => {
    const { container } = render(StatusBar, { props: { engine, jobs: [analysing] } })
    const bar = screen.getByRole('progressbar', { name: 'Analysing scenes' })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '54')
    expect(bar).toHaveAttribute('aria-valuenow', '12')
    expect(bar).toHaveAttribute('aria-valuetext', '12 of 54, about 5 min left')
    const job = container.querySelector('[data-ui-id="status.job"]')
    expect(job).toHaveTextContent('Analysing scenes')
    expect(job).toHaveTextContent('12/54')
    expect(job).toHaveTextContent('1:23')
    expect(job).toHaveTextContent('about 5 min left')
  })

  it('the bar sits after the live region, at the right edge, so a ticking clock is never announced', () => {
    const { container } = render(StatusBar, { props: { engine, jobs: [analysing] } })
    const footer = container.querySelector('footer')
    expect(footer.lastElementChild).toBe(container.querySelector('[data-ui-id="status.job"]'))
    expect(screen.getByRole('status')).not.toHaveTextContent('1:23')
  })

  it('announces that a job is running, without its clock', () => {
    render(StatusBar, { props: { engine, jobs: [analysing] } })
    expect(screen.getByRole('status')).toHaveTextContent('Analysing scenes')
  })

  it('is indeterminate with no count, and says nothing about time it was not told', () => {
    const { container } = render(StatusBar, { props: { engine, jobs: [{ id: 'j1', label: 'Extracting entities' }] } })
    const bar = screen.getByRole('progressbar', { name: 'Extracting entities' })
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(bar).not.toHaveAttribute('aria-valuemax')
    expect(bar).toHaveAttribute('data-indeterminate', 'true')
    expect(container.querySelector('[data-ui-id="status.job"]')).not.toHaveTextContent('left')
  })

  it('a count that is not real renders as indeterminate rather than a wrong fill', () => {
    render(StatusBar, { props: { engine, jobs: [{ id: 'j1', label: 'X', progress: { completed: 9, total: 3 } }] } })
    expect(screen.getByRole('progressbar', { name: 'X' })).not.toHaveAttribute('aria-valuenow')
  })

  it('says "estimating time left" while a count moves and no projection exists yet', () => {
    const { container } = render(StatusBar, { props: { engine, jobs: [{ ...analysing, remainingMs: undefined }] } })
    expect(container.querySelector('[data-ui-id="status.job"]')).toHaveTextContent('estimating time left')
  })

  it('with several jobs, shows the first and counts the others, listing them on hover', () => {
    const jobs = [analysing, { id: 'j2', label: 'Extracting entities', progress: { completed: 3, total: 57 } }, { id: 'j3', label: 'Reading S48' }]
    render(StatusBar, { props: { engine, jobs } })
    expect(screen.getAllByRole('progressbar')).toHaveLength(1)
    const more = screen.getByText('+2')
    expect(more).toHaveAttribute('title', 'Extracting entities, 3 of 57\nReading S48')
    expect(more).toHaveAccessibleName('2 more running: Extracting entities, 3 of 57; Reading S48')
  })

  it('none when no jobs are given', () => {
    const { rerender } = render(StatusBar, { props: { engine, jobs: [analysing] } })
    rerender({ engine, jobs: [] })
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('a Cancel control for a job the host can cancel, which asks the host; none otherwise', async () => {
    const cancel = vi.fn()
    const { rerender } = render(StatusBar, { props: { engine, jobs: [{ id: 'j1', label: 'Adjudication', cancel }] } })
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel Adjudication' }))
    expect(cancel).toHaveBeenCalled()
    rerender({ engine, jobs: [{ id: 'j1', label: 'Adjudication' }] })
    expect(screen.queryByRole('button', { name: /Cancel/ })).toBeNull()
  })

  it('an engine detail is offered through a button the host handles', async () => {
    const ondetails = vi.fn()
    render(StatusBar, { props: { engine, ondetails } })
    await fireEvent.click(screen.getByRole('button', { name: 'Details' }))
    expect(ondetails).toHaveBeenCalled()
  })
})

// The story budget: one dollar limit (K, 2026-10-24: "one fucking number ($USD) as MAX spend").
// Illustrative amounts in khaosd's shape (khaos-manager #1032).
describe('StatusBar story budget', () => {
  const loaded = (over = {}) => ({ kind: 'loaded', usd: '5.00', spentUsd: '1.23', remainingUsd: '3.77', ...over })
  const item = () => screen.getByRole('button', { name: /^Story budget/ })

  it('draws what is spent of the limit, and opens the budget', async () => {
    const onchangebudget = vi.fn()
    render(StatusBar, { props: { budget: loaded(), onchangebudget } })
    expect(item()).toHaveTextContent('$1.23 of $5.00')
    expect(item()).toHaveAccessibleName('Story budget: $1.23 of $5.00')
    expect(item()).not.toHaveAttribute('data-tone')
    await fireEvent.click(item())
    expect(onchangebudget).toHaveBeenCalledOnce()
  })

  it('takes the warning tone once the engine says nothing is left', () => {
    render(StatusBar, { props: { budget: loaded({ spentUsd: '5.00', remainingUsd: '0' }) } })
    expect(item()).toHaveAttribute('data-tone', 'warning')
  })

  it('says when the budget is being read, missing or unreadable, and draws nothing without one', () => {
    const { rerender } = render(StatusBar, { props: { budget: { kind: 'reading' } } })
    expect(item()).toHaveTextContent(/^Budget$/)
    rerender({ budget: { kind: 'none' } })
    expect(item()).toHaveTextContent('No budget set')
    rerender({ budget: { kind: 'failed', message: 'boom' } })
    expect(item()).toHaveTextContent('Budget unavailable')
    rerender({ budget: null })
    expect(screen.queryByRole('button', { name: /^Story budget/ })).toBeNull()
  })
})
