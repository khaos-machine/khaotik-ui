import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import StoryAtlasToolbar from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlasToolbar.svelte'
import StoryAtlasRelationship from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlasRelationship.svelte'

describe('Story Atlas controls', () => {
  it('reports a lens change and recenter request without owning the graph', async () => {
    const onLensChange = vi.fn(), onRecenter = vi.fn()
    render(StoryAtlasToolbar, { props: { lens: 'all', onLensChange, onRecenter } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Scenes' }))
    expect(onLensChange).toHaveBeenCalledWith('scene')
    await fireEvent.click(screen.getByRole('button', { name: 'Recenter' }))
    expect(onRecenter).toHaveBeenCalledOnce()
  })
  it('prevents recenter while the graph is unavailable', async () => {
    const onRecenter = vi.fn()
    render(StoryAtlasToolbar, { props: { disabled: true, onRecenter } })
    await fireEvent.click(screen.getByRole('button', { name: 'Recenter' }))
    expect(onRecenter).not.toHaveBeenCalled()
    expect(screen.getByRole('group', { name: 'Show in Story Atlas' })).toBeDisabled()
  })
})

describe('Story Atlas relationship disclosure', () => {
  const source = { id: 'source', label: 'DESMOND', kind: 'character' }
  const target = { id: 'target', label: 'MADISON', kind: 'character' }
  it('opens either endpoint and clears the relationship', async () => {
    const onSelectEndpoint = vi.fn(), onClear = vi.fn()
    render(StoryAtlasRelationship, { props: { source, target, label: 'Shared scenes', evidence: 'Supplied scene evidence', onSelectEndpoint, onClear } })
    await fireEvent.click(screen.getByRole('button', { name: 'DESMOND' }))
    await fireEvent.click(screen.getByRole('button', { name: 'MADISON' }))
    expect(onSelectEndpoint.mock.calls).toEqual([['source'], ['target']])
    await fireEvent.click(screen.getByRole('button', { name: 'Clear connection' }))
    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.getByText('Supplied scene evidence')).toBeInTheDocument()
  })
  it('adds no supporting claim when evidence is absent', () => {
    const { container } = render(StoryAtlasRelationship, { props: { source, target, label: 'Speaking appearance' } })
    expect(container.querySelector('p')).toBeNull()
  })
  it('teaches edge selection when no complete connection is selected', () => {
    render(StoryAtlasRelationship, { props: { source } })
    expect(screen.getByText('Explore a connection')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'DESMOND' })).toBeNull()
  })
})

describe('Story Atlas toolbar, as Khaos App uses it', () => {
  it('names the location lens Places, as the app does', () => {
    render(StoryAtlasToolbar, { props: { lens: 'all' } })
    expect(screen.getByRole('radio', { name: 'Places' })).toBeInTheDocument()
  })
  it('draws no Recenter for a host whose canvas has its own', () => {
    render(StoryAtlasToolbar, { props: { lens: 'all', onLensChange: vi.fn() } })
    expect(screen.queryByRole('button', { name: 'Recenter' })).toBeNull()
  })
})
