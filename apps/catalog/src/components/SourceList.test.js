import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import SourceList from '@khaos-machine/khaotik-ui/components/svelte/SourceList.svelte'

// SourceList (data-layer plan K2; audit §4.1). The window's sidebar: sections of
// destinations, each with an icon and an optional count, the active one marked by a
// thin gold bar. The host owns which row is active; the list only asks to change it.

const sections = [
  {
    id: 'story', label: 'Story',
    items: [
      { id: 'characters', label: 'Characters', icon: 'user', count: 27 },
      { id: 'scenes', label: 'Scenes', icon: 'film-slate', count: 57 },
      { id: 'objects', label: 'Objects', icon: 'cube', count: 0 },
    ],
  },
  { id: 'work', label: 'Work', items: [{ id: 'review', label: 'Review', icon: 'flag' }] },
]

const row = (name) => screen.getByRole('button', { name: new RegExp(`^${name}`) })

describe('counts', () => {
  it('renders a count exactly as given, zero included', () => {
    render(SourceList, { props: { sections, active: 'characters' } })
    expect(row('Characters')).toHaveTextContent('27')
    expect(row('Objects')).toHaveTextContent('0')
  })

  it('renders no count when none is given', () => {
    render(SourceList, { props: { sections, active: 'characters' } })
    expect(row('Review').querySelector('.source__count')).toBeNull()
  })
})

describe('the active row', () => {
  it('is the current page, and the only row in the tab order', () => {
    render(SourceList, { props: { sections, active: 'scenes' } })
    expect(row('Scenes')).toHaveAttribute('aria-current', 'page')
    expect(row('Scenes')).toHaveAttribute('tabindex', '0')
    expect(row('Characters')).toHaveAttribute('tabindex', '-1')
    expect(row('Characters')).not.toHaveAttribute('aria-current')
  })

  it('↓ asks for the next row, across a section boundary', async () => {
    const onselect = vi.fn()
    render(SourceList, { props: { sections, active: 'objects', onselect } })
    await fireEvent.keyDown(row('Objects'), { key: 'ArrowDown' })
    expect(onselect).toHaveBeenCalledWith('review')
  })

  it('↑ asks for the previous row, and stops at the first', async () => {
    const onselect = vi.fn()
    render(SourceList, { props: { sections, active: 'scenes', onselect } })
    await fireEvent.keyDown(row('Scenes'), { key: 'ArrowUp' })
    expect(onselect).toHaveBeenLastCalledWith('characters')
    onselect.mockClear()
    await fireEvent.keyDown(row('Characters'), { key: 'ArrowUp' })
    expect(onselect).not.toHaveBeenCalled()
  })

  it('Home and End ask for the first and last rows', async () => {
    const onselect = vi.fn()
    render(SourceList, { props: { sections, active: 'scenes', onselect } })
    await fireEvent.keyDown(row('Scenes'), { key: 'End' })
    expect(onselect).toHaveBeenLastCalledWith('review')
    await fireEvent.keyDown(row('Scenes'), { key: 'Home' })
    expect(onselect).toHaveBeenLastCalledWith('characters')
  })

  it('a click asks for that row', async () => {
    const onselect = vi.fn()
    render(SourceList, { props: { sections, active: 'characters', onselect } })
    await fireEvent.click(row('Review'))
    expect(onselect).toHaveBeenCalledWith('review')
  })
})

describe('structure', () => {
  it('is a named navigation landmark with a heading per section and automation ids', () => {
    render(SourceList, { props: { sections, active: 'characters', label: 'Story destinations' } })
    expect(screen.getByRole('navigation', { name: 'Story destinations' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Work' })).toBeInTheDocument()
    expect(row('Scenes')).toHaveAttribute('data-ui-id', 'source.scenes')
  })
})
