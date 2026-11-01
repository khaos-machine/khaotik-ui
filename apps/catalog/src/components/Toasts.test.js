import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import Toasts from '@khaos-machine/khaotik-ui/components/svelte/Toasts.svelte'

// Toasts: outcomes over the page that dismiss themselves (Khaos Cloud backfill).

const saved = { id: 't1', tone: 'success', title: 'Project saved' }
const failed = { id: 't2', tone: 'error', title: 'Could not save project', detail: 'repository is read-only' }

describe('Toasts', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders each toast as an outcome, a failure as an alert, in one named region', () => {
    render(Toasts, { props: { toasts: [saved, failed] } })
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Project saved')
    expect(screen.getByRole('alert')).toHaveTextContent('repository is read-only')
  })

  it('reports a toast once its time runs out, and not before', () => {
    const ondismiss = vi.fn()
    render(Toasts, { props: { toasts: [saved], duration: 3000, ondismiss } })
    vi.advanceTimersByTime(2999)
    expect(ondismiss).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(ondismiss).toHaveBeenCalledExactlyOnceWith('t1')
  })

  it('a toast of its own duration overrides the stack, and 0 keeps it', () => {
    const ondismiss = vi.fn()
    render(Toasts, { props: { toasts: [{ ...saved, duration: 0 }, { ...failed, duration: 1000 }], duration: 3000, ondismiss } })
    vi.advanceTimersByTime(60_000)
    expect(ondismiss.mock.calls).toEqual([['t2']])
  })

  it('reports the dismiss button', async () => {
    const ondismiss = vi.fn()
    render(Toasts, { props: { toasts: [failed], duration: 0, ondismiss } })
    await fireEvent.click(screen.getByRole('button', { name: 'Dismiss: Could not save project' }))
    expect(ondismiss).toHaveBeenCalledExactlyOnceWith('t2')
  })

  it('holds the timers while the pointer is over the stack', async () => {
    const ondismiss = vi.fn()
    render(Toasts, { props: { toasts: [saved], duration: 1000, ondismiss } })
    const region = screen.getByRole('region', { name: 'Notifications' })
    await fireEvent.pointerEnter(region)
    vi.advanceTimersByTime(5000)
    expect(ondismiss).not.toHaveBeenCalled()
    await fireEvent.pointerLeave(region)
    vi.advanceTimersByTime(1000)
    expect(ondismiss).toHaveBeenCalledOnce()
  })

  it('holds the timers while the focus is inside the stack', async () => {
    const ondismiss = vi.fn()
    render(Toasts, { props: { toasts: [saved], duration: 1000, ondismiss } })
    await fireEvent.focusIn(screen.getByRole('button', { name: 'Dismiss: Project saved' }))
    vi.advanceTimersByTime(5000)
    expect(ondismiss).not.toHaveBeenCalled()
  })
})
