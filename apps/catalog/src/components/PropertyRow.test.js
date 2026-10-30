import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import PropertyRow from '@khaos-machine/khaotik-ui/components/svelte/PropertyRow.svelte'
import InspectorSection from '@khaos-machine/khaotik-ui/components/svelte/InspectorSection.svelte'

// PropertyRow and InspectorSection (data-layer plan K6; audit §3.12). The inspector's
// two parts: a label-value row that never wraps, with an optional source column, and a
// named, collapsible section with an optional count.

const LONG = 'INT. DESMOND’S APARTMENT - NIGHT, the living room with the late movie still running'

describe('PropertyRow', () => {
  it('a long value truncates on one line and its full text is the accessible name', () => {
    render(PropertyRow, { props: { label: 'Scene', value: LONG } })
    const value = screen.getByText(LONG)
    expect(value).toHaveClass('prop__value')
    expect(value).toHaveAttribute('title', LONG)
    expect(screen.getByRole('group', { name: 'Scene' })).toHaveAccessibleDescription(LONG)
  })

  it('renders its source column only when a source is given', () => {
    const { container, unmount } = render(PropertyRow, { props: { label: 'Voice', value: 'Desmond', source: 'cast' } })
    expect(container.querySelector('.prop__source')).toHaveTextContent('cast')
    unmount()
    const again = render(PropertyRow, { props: { label: 'Voice', value: 'Desmond' } })
    expect(again.container.querySelector('.prop__source')).toBeNull()
  })

  it('draws a control in place of the value when one is given', () => {
    const control = createRawSnippet(() => ({ render: () => '<input aria-label="Temperature" value="0.9" />' }))
    render(PropertyRow, { props: { label: 'Temperature', children: control } })
    expect(screen.getByRole('textbox', { name: 'Temperature' })).toBeInTheDocument()
  })
})

describe('InspectorSection', () => {
  const body = createRawSnippet(() => ({ render: () => '<p>Section body</p>' }))

  it('names itself, shows its count and its body when open', () => {
    render(InspectorSection, { props: { title: 'Aliases', count: 3, children: body } })
    const toggle = screen.getByRole('button', { name: /Aliases/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveTextContent('3')
    expect(screen.getByRole('region', { name: 'Aliases' })).toHaveTextContent('Section body')
  })

  it('reports its collapsed state to the host and hides the body when collapsed', async () => {
    const oncollapse = vi.fn()
    render(InspectorSection, { props: { title: 'Aliases', children: body, oncollapse } })
    await fireEvent.click(screen.getByRole('button', { name: /Aliases/ }))
    expect(oncollapse).toHaveBeenCalledWith(true)
    expect(screen.queryByText('Section body')).toBeNull()
  })

  it('opens collapsed when the host says so, and reports opening', async () => {
    const oncollapse = vi.fn()
    render(InspectorSection, { props: { title: 'Provenance', collapsed: true, children: body, oncollapse } })
    expect(screen.queryByText('Section body')).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: /Provenance/ }))
    expect(oncollapse).toHaveBeenCalledWith(false)
    expect(screen.getByText('Section body')).toBeInTheDocument()
  })

  it('renders no count when none is given', () => {
    const { container } = render(InspectorSection, { props: { title: 'Profile', children: body } })
    expect(container.querySelector('.section__count')).toBeNull()
  })
})
