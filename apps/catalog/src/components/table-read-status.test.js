import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import CharacterTable from '@khaos-machine/khaotik-ui/components/svelte/CharacterTable.svelte'
import SceneTable from '@khaos-machine/khaotik-ui/components/svelte/SceneTable.svelte'
import PlaceTable from '@khaos-machine/khaotik-ui/components/svelte/PlaceTable.svelte'
import ObjectTable from '@khaos-machine/khaotik-ui/components/svelte/ObjectTable.svelte'
import DataTable from '@khaos-machine/khaotik-ui/components/svelte/DataTable.svelte'

// A failed story read must never show as an empty story. On Brick & Steel the atlas read failed
// (ATLAS_READ_FAILED) and the Characters table said "This story has no characters." Every
// table draws its empty text through DataTable, so the guard is there and each table passes
// the read through.
const tables = [
  ['CharacterTable', CharacterTable, 'This story has no characters.', 'Reading characters…'],
  ['SceneTable', SceneTable, 'This story has no scenes.', 'Reading scenes…'],
  ['PlaceTable', PlaceTable, 'This story has no places.', 'Reading places…'],
  ['ObjectTable', ObjectTable, 'This story has no objects.', 'Reading objects…'],
]

describe.each(tables)('%s with no rows', (_name, Table, empty, reading) => {
  it('says it is reading, not that the story is empty', () => {
    render(Table, { props: { status: { kind: 'loading' } } })
    expect(screen.getByRole('status')).toHaveTextContent(reading)
    expect(screen.queryByText(empty)).toBeNull()
  })

  it('shows a failed read in the host’s words, with Try again, not the empty text', async () => {
    const onretry = vi.fn()
    render(Table, { props: { status: { kind: 'failed', message: 'Khaos couldn’t read this story.' }, onretry } })
    expect(screen.getByRole('alert')).toHaveTextContent('Khaos couldn’t read this story.')
    expect(screen.queryByText(empty)).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onretry).toHaveBeenCalledOnce()
  })

  it('says the story is empty only once the read has loaded', () => {
    render(Table, { props: { status: { kind: 'loaded' } } })
    expect(screen.getByText(empty)).toBeInTheDocument()
  })
})

describe('DataTable with rows already shown', () => {
  const columns = [{ key: 'name', label: 'Name', value: (/** @type {any} */ r) => r.name }]
  const rows = [{ id: 'a', name: 'DESMOND' }]

  it('keeps them through a failed re-read, and says it failed', () => {
    const { container } = render(DataTable, { props: { rows, columns, label: 'Characters', status: { kind: 'failed', message: 'The read failed.' }, onretry: () => {} } })
    expect(screen.getByRole('alert')).toHaveTextContent('The read failed.')
    expect(container.querySelector('.table__spacer')).not.toBeNull()
  })

  it('keeps them, quietly, while a re-read runs', () => {
    render(DataTable, { props: { rows, columns, label: 'Characters', status: { kind: 'loading' } } })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
