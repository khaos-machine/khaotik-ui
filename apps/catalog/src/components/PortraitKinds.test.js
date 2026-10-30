import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Portrait from '@khaos-machine/khaotik-ui/components/svelte/Portrait.svelte'
import SelectableRow from '@khaos-machine/khaotik-ui/components/svelte/SelectableRow.svelte'

// Review lists four kinds side by side — characters, places, objects and
// relationships — and each must be told apart at a glance while sharing one
// frame. khaos-app 0.20.0 drew every place as a person: SelectableRow accepted
// `thumbKind="place"`, Portrait knew no such kind, and its fallback was `user`.

const glyph = (container) => container.querySelector('.portrait__template .ph-fill')

describe('Portrait renders a distinct glyph per kind', () => {
  for (const [kind, name] of [['location', 'map-pin'], ['object', 'cube'], ['relation', 'arrows-left-right'], ['scene', 'film-slate']]) {
    it(`${kind} renders ${name}`, () => {
      const { container } = render(Portrait, { props: { name: 'Thing', kind } })
      expect(glyph(container)?.classList.contains(`ph-${name}`)).toBe(true)
    })
  }

  it('person still renders a silhouette, not a glyph', () => {
    const { container } = render(Portrait, { props: { name: 'Mara', kind: 'person' } })
    expect(container.querySelector('.portrait__figure')).not.toBeNull()
    expect(glyph(container)).toBeNull()
  })
})

describe('SelectableRow passes its thumbnail kind through', () => {
  it('a location row renders the map pin', () => {
    const { container } = render(SelectableRow, { props: { title: 'the bedroom', thumb: 'the bedroom', thumbKind: 'location' } })
    expect(glyph(container)?.classList.contains('ph-map-pin')).toBe(true)
  })

  it('defaults to a person', () => {
    const { container } = render(SelectableRow, { props: { title: 'Mara', thumb: 'Mara' } })
    expect(container.querySelector('.portrait__figure')).not.toBeNull()
  })
})
