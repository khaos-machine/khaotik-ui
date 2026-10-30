import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import FilterField from '@khaos-machine/khaotik-ui/components/svelte/FilterField.svelte'

// FilterField (#7). The count rules and the clear affordance are the whole
// component; both were hand-rolled twice in khaos-app before this existed, and
// the two copies had already drifted apart by the second one.

const source = readFileSync(
  join(import.meta.dirname, '../../../..', 'components/svelte/FilterField.svelte'),
  'utf8',
)

describe('the count', () => {
  it('shows the plain total when nothing is typed', () => {
    render(FilterField, { props: { value: '', shown: 201, total: 201 } })
    expect(screen.getByText('201')).toBeInTheDocument()
    expect(screen.queryByText('201 of 201')).not.toBeInTheDocument()
  })

  it('shows "shown of total" while filtering', () => {
    render(FilterField, { props: { value: 'diner', shown: 22, total: 201 } })
    expect(screen.getByText('22 of 201')).toBeInTheDocument()
  })

  it('still renders a count when the filter matches nothing', () => {
    // "0 of 201" is the whole reason the count exists — it distinguishes a
    // filter that hid everything from a project with no scenes.
    render(FilterField, { props: { value: 'zzz', shown: 0, total: 201 } })
    expect(screen.getByText('0 of 201')).toBeInTheDocument()
  })

  it('renders no count when the consumer passes none', () => {
    const { container } = render(FilterField, { props: { value: 'x' } })
    expect(container.querySelector('.filter__count')).toBeNull()
  })

  it('renders no count from `shown` alone — it cannot say what it is out of', () => {
    const { container } = render(FilterField, { props: { value: '', shown: 22 } })
    expect(container.querySelector('.filter__count')).toBeNull()
  })
})

describe('clearing', () => {
  it('offers no clear button when the field is empty', () => {
    render(FilterField, { props: { value: '' } })
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('reports an empty string when cleared', async () => {
    const oninput = vi.fn()
    render(FilterField, { props: { value: 'diner', label: 'Filter scenes', oninput } })

    await fireEvent.click(screen.getByRole('button', { name: 'Clear filter scenes' }))

    expect(oninput).toHaveBeenCalledWith('')
  })

  it('clears on Escape', async () => {
    const oninput = vi.fn()
    render(FilterField, { props: { value: 'diner', label: 'Filter scenes', oninput } })

    await fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Filter scenes' }), { key: 'Escape' })

    expect(oninput).toHaveBeenCalledWith('')
  })

  it('does not fire on Escape when the field is already empty', async () => {
    // Escape in an empty filter belongs to whatever is behind it — a dialog, a
    // window — and swallowing it would strand the consumer.
    const oninput = vi.fn()
    render(FilterField, { props: { value: '', label: 'Filter scenes', oninput } })

    await fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Filter scenes' }), { key: 'Escape' })

    expect(oninput).not.toHaveBeenCalled()
  })

  it('suppresses the WebKit-only native clear button', () => {
    // jsdom computes no vendor pseudo-element, so this is a source read: without
    // it macOS shows two clear affordances and Linux/Windows show one.
    expect(source).toContain('::-webkit-search-cancel-button')
  })
})

describe('accessible name', () => {
  it('names the list being filtered, not the control', () => {
    render(FilterField, { props: { value: '', label: 'Filter runs' } })
    expect(screen.getByRole('searchbox', { name: 'Filter runs' })).toBeInTheDocument()
  })
})

describe('typing', () => {
  it('reports the new value', async () => {
    const oninput = vi.fn()
    render(FilterField, { props: { value: '', label: 'Filter scenes', oninput } })

    await fireEvent.input(screen.getByRole('searchbox', { name: 'Filter scenes' }), {
      target: { value: 'din' },
    })

    expect(oninput).toHaveBeenCalledWith('din')
  })
})
