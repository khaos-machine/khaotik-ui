import { describe, expect, it } from 'vitest'
import { kindHues, outline } from '@khaos-machine/khaotik-ui/components/svelte/lib/atlas/appearance.js'

// Records the one drawing call an outline makes.
const recorder = () => {
  const calls = []
  const g = new Proxy({}, { get: (_, name) => (...args) => (calls.push([name, ...args]), g) })
  return { g, calls }
}

describe('Atlas node outlines', () => {
  it('draws a character as a circle, a place as a diamond and a scene as a square', () => {
    const shapes = Object.fromEntries(['character', 'location', 'scene'].map((kind) => {
      const { g, calls } = recorder()
      outline(g, kind, 20)
      return [kind, calls[0][0]]
    }))
    expect(shapes).toEqual({ character: 'circle', location: 'poly', scene: 'roundRect' })
  })

  it('tints every kind with its own hue', () => {
    expect(new Set(Object.values(kindHues)).size).toBe(Object.keys(kindHues).length)
  })
})
