import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/svelte'
import SceneReadStatus from '@khaos-machine/khaotik-ui/components/svelte/SceneReadStatus.svelte'
const workflow = { id: 'read-a', state: 'partial', counts: { total: 4, reused: 1, completed: 2, remaining: 1 }, resume: { allowed: true }, message: 'Completed lines are kept.' }
describe('SceneReadStatus', () => {
  it('renders retained partial counts and resumes only through explicit workflow intent', async () => {
    const onResume = vi.fn()
    render(SceneReadStatus, { workflow, onResume })
    expect(screen.getByText('2 completed lines kept · 1 reused · 1 remaining')).toBeInTheDocument()
    expect(onResume).not.toHaveBeenCalled()
    await fireEvent.click(screen.getByRole('button', { name: 'Resume scene read' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Resume scene read' }))
    expect(onResume).toHaveBeenCalledExactlyOnceWith('read-a')
  })
  it.each(['indeterminate', 'running', 'completed', 'retired'])('shows %s without guessing a retry from remaining lines', async (state) => {
    const onResume = vi.fn()
    render(SceneReadStatus, { workflow: { ...workflow, state, resume: { allowed: false, reason: 'Resume is not authorized' } }, onResume })
    expect(screen.getByText('Resume is not authorized')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume scene read' })).toBeNull()
    expect(onResume).not.toHaveBeenCalled()
  })
  it('shows a stop message once when it is also the resume reason', () => {
    const sentence = 'Making voices on this Mac is part of Advanced'
    render(SceneReadStatus, { workflow: { ...workflow, message: sentence, resume: { allowed: false, reason: ` ${sentence} ` } } })
    expect(screen.getAllByText(sentence)).toHaveLength(1)
  })
  it('shows both when the stop message and resume reason differ', () => {
    render(SceneReadStatus, { workflow: { ...workflow, message: 'The read stopped.', resume: { allowed: false, reason: 'Resume is not authorized' } } })
    expect(screen.getByText('The read stopped.')).toBeInTheDocument()
    expect(screen.getByText('Resume is not authorized')).toBeInTheDocument()
  })
  it('uses server resume eligibility instead of deriving it from zero remaining counts', async () => {
    const onResume = vi.fn()
    render(SceneReadStatus, { workflow: { ...workflow, counts: { total: 4, reused: 1, completed: 3, remaining: 0 } }, onResume })
    await fireEvent.click(screen.getByRole('button', { name: 'Resume scene read' }))
    expect(onResume).toHaveBeenCalledWith('read-a')
  })
  it('blocks parent-controlled resuming actions and renders absent workflow honestly', async () => {
    const onResume = vi.fn()
    const { rerender } = render(SceneReadStatus, { workflow, onResume, resuming: true })
    await fireEvent.click(screen.getByRole('button', { name: 'Resuming scene read…' }))
    expect(onResume).not.toHaveBeenCalled()
    await rerender({ workflow: undefined, onResume })
    expect(screen.getByText('No scene read workflow reported.')).toBeInTheDocument()
  })
})
