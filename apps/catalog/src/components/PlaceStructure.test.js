import { it, expect, vi } from 'vitest'
import { createRawSnippet } from 'svelte'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/svelte'
import PlaceStructure from '@khaos-machine/khaotik-ui/components/svelte/PlaceStructure.svelte'

// The presets, places and kinds are khaosd's (internal/placebuild/structure.go, v0.192.0).
const presets = [{ value: 'studio', label: 'Studio' }, { value: '1br1ba', label: '1 bed, 1 bath' }]
const places = ['apartment', 'brownstone', 'house']
const kinds = ['living', 'kitchen', 'bedroom', 'bathroom']
const areas = [{ id: 'kitchen', label: 'Kitchen' }]
const base = { presets, places, kinds }

const menuItem = (label) => [...document.querySelectorAll('[data-part="item"]')].find((el) => el.querySelector('[data-part="item-text"]')?.textContent.trim() === label)

it('asks for a size, then a building, then a layout', async () => {
  const onpreset = vi.fn(), onplace = vi.fn(), onlayout = vi.fn()
  const { rerender } = render(PlaceStructure, { ...base, first: true, canLayOut: false, onpreset, onplace, onlayout })
  expect(screen.getByRole('button', { name: /^Building/ })).toHaveAttribute('data-disabled')
  expect(screen.getByRole('button', { name: 'Lay out' })).toHaveAttribute('aria-disabled', 'true')
  await fireEvent.click(screen.getByRole('radio', { name: 'Studio' }))
  expect(onpreset).toHaveBeenCalledWith('studio')
  await rerender({ ...base, first: true, preset: 'studio', place: 'apartment', canLayOut: true, onpreset, onplace, onlayout })
  await fireEvent.click(screen.getByRole('button', { name: /^Building/ }))
  await fireEvent.click(menuItem('brownstone'))
  await waitFor(() => expect(onplace).toHaveBeenCalledWith('brownstone'))
  await fireEvent.click(screen.getByRole('button', { name: 'Lay out' }))
  expect(onlayout).toHaveBeenCalledOnce()
})

it('offers another layout once one exists, and none while one is running', async () => {
  const onlayout = vi.fn()
  const { rerender } = render(PlaceStructure, { ...base, preset: 'studio', place: 'apartment', another: true, onlayout })
  await fireEvent.click(screen.getByRole('button', { name: 'Another layout' }))
  expect(onlayout).toHaveBeenCalledOnce()
  await rerender({ ...base, preset: 'studio', place: 'apartment', another: true, busy: true, onlayout })
  await fireEvent.click(screen.getByRole('button', { name: 'Another layout' }))
  expect(onlayout).toHaveBeenCalledOnce()
})

it("sets an area's kind, and clears it with —", async () => {
  const onkind = vi.fn()
  render(PlaceStructure, { ...base, preset: 'studio', place: 'apartment', areas, areaKinds: { kitchen: 'kitchen' }, onkind })
  await fireEvent.click(screen.getByRole('button', { name: /^Kitchen/ }))
  await fireEvent.click(menuItem('living'))
  await waitFor(() => expect(onkind).toHaveBeenCalledWith('kitchen', 'living'))
  await fireEvent.click(screen.getByRole('button', { name: /^Kitchen/ }))
  await fireEvent.click(menuItem('—'))
  await waitFor(() => expect(onkind).toHaveBeenCalledWith('kitchen', ''))
})

it('shows each area by name beside its menu, announced once by the menu', () => {
  render(PlaceStructure, { ...base, preset: 'studio', areas })
  const row = screen.getByRole('group', { name: 'Areas' })
  expect(row.textContent).toContain('Kitchen')
  expect(within(row).getByText('Kitchen')).toHaveAttribute('aria-hidden', 'true')
  expect(within(row).getByRole('button', { name: /^Kitchen/ })).toBeInTheDocument()
})

// Live pass at 1440 (khaos-app#628): Menu's trigger fills its container, so in the size row
// Building took the whole line (1399px) and Lay out wrapped below. jsdom lays nothing out, so
// the rule is asserted in the source; measured in Chrome, the row is one line with it.
it('keeps each menu as wide as its value inside the rows', () => {
  const source = readFileSync(resolve(import.meta.dirname, '../../../../components/svelte/PlaceStructure.svelte'), 'utf8')
  expect(source).toMatch(/\.ui-structure__row :global\(\.ui-menu__trigger\) \{\s*width: auto;/)
})

it('draws no area row and no problems when there are none', () => {
  render(PlaceStructure, { ...base, preset: 'studio' })
  expect(screen.queryByRole('group', { name: 'Areas' })).toBeNull()
  expect(screen.queryByRole('status')).toBeNull()
})

it("says the host's problems, and renders the review below", () => {
  const children = createRawSnippet(() => ({ render: () => '<section aria-label="Place review">plan</section>' }))
  render(PlaceStructure, { ...base, preset: 'studio', problems: ['4 rooms do not fit a 600 sqft apartment at their minimum size'], children })
  expect(within(screen.getByRole('status')).getByText('4 rooms do not fit a 600 sqft apartment at their minimum size')).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Place review' })).toBeInTheDocument()
})
