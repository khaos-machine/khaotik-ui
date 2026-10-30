// Moved from Khaos App's src/ui/atlas/layout.test.ts (catalog app-coverage plan, T7), assertions unchanged.
import { describe, expect, it } from 'vitest'
import { createLayouts } from '@khaos-machine/khaotik-ui/components/svelte/lib/atlas/layout.js'
const character = {
  id: 'character_a',
  kind: 'character',
  label: 'A',
  number: 0,
  state: 'missing',
  reasons: [],
  raw: {
    scene_count: 0,
    dialogue_lines: 0,
    word_count: 0,
    line_count: 0,
    slugline: '',
    content: '',
    kind: '',
    aliases: [],
  },
}
const empty = { nodes: [], edges: [] }
const atlas = {
  schemaVersion: 1,
  lenses: {
    all: { nodes: [character], edges: [] },
    character: { nodes: [character], edges: [] },
    location: empty,
    scene: empty,
  },
  neighborhoods: { character_a: { nodes: [character], edges: [] } },
  locationGroups: [{ id: 'unplaced', label: 'No linked location', memberIds: ['character_a'] }],
}
describe('Atlas geometry on small stories', () => {
  it('positions an isolated character in every arrangement', () => {
    const layouts = createLayouts(atlas)
    for (const variant of ['A', 'B', 'C', 'D', 'E']) {
      const graph = layouts.layout(variant, character.id)
      expect(graph.nodes).toHaveLength(1)
      expect(
        graph.nodes.every(
          (n) => Number.isFinite(n.x) && Number.isFinite(n.y),
        ),
      ).toBe(true)
      expect(Number.isFinite(graph.width) && graph.width > 0).toBe(true)
    }
  })
  it('keeps an empty lens finite', () => {
    const graph = createLayouts(atlas).contributionLayout('location')
    expect(graph.nodes).toEqual([])
    expect(Number.isFinite(graph.width) && graph.width > 0).toBe(true)
  })
})
