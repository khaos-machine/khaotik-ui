import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import { objectRows, placeRows } from '@khaos-machine/khaotik-ui/components/svelte/lib/places.js'
import ObjectTable from '@khaos-machine/khaotik-ui/components/svelte/ObjectTable.svelte'

// The data layer's Places and Objects sections (data-layer plan A5; audit §1.7, §1.8). Moved
// from Khaos App with its assertions intact (catalog app-coverage plan, T4).

describe('Objects, empty', () => {
  it('says it is empty instead of rendering nothing (0 on B4P, audit §1.8)', () => {
    render(ObjectTable, { props: { objects: [], selected: '', filter: '', onselect: () => {} } })
    expect(screen.getByText('This story has no objects.')).toBeInTheDocument()
  })
})

describe('the rows', () => {
  it('a place carries its scenes, its pages and where it is only named', () => {
    const places = [{ id: 'l1', name: 'THE BRONX', scene_count: 0, page_count: 0, mentionedSceneIds: ['s1', 's2'], origin: 'parsed' }]
    expect(placeRows(places)[0]).toEqual({ id: 'l1', name: 'THE BRONX', scenes: 0, pages: 0, named: 2, origin: 'parsed' })
  })

  it('an object says when it is a group, or which group it belongs to, by name', () => {
    const objects = [
      { id: 'o1', name: 'glasses', scene_count: 2, identityKind: 'group', members: ['o2', 'o3'] },
      { id: 'o2', name: 'red glass', scene_count: 1, memberOf: ['o1'] },
      { id: 'o3', name: 'phone', scene_count: 3 },
    ]
    expect(objectRows(objects).map((r) => [r.name, r.scenes, r.group])).toEqual([
      ['glasses', 2, 'group of 2'],
      ['red glass', 1, 'one of glasses'],
      ['phone', 3, ''],
    ])
  })
})
