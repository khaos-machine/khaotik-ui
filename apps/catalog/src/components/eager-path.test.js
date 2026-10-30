import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// D94: the library may carry a rendering engine only off the barrel's eager path. three.js is
// reached through a dynamic import of a scene module, never a static one.

const kit = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../components/svelte')

/**
 * Every module reached from file by static imports and re-exports only: the eager path a bundler
 * puts in the importing chunk. A dynamic `import()` starts a separate chunk, so it is not followed.
 * @param {string} file
 * @param {Set<string>} seen
 */
function eagerGraph(file, seen = new Set()) {
  if (seen.has(file)) return seen
  seen.add(file)
  if (!file.startsWith('/')) return seen
  const text = readFileSync(file, 'utf8')
  for (const [, spec] of text.matchAll(/^\s*(?:import|export)\s+(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
    eagerGraph(spec.startsWith('.') ? resolve(dirname(file), spec) : spec, seen)
  }
  return seen
}

const engine = (/** @type {string} */ m) => m === 'three' || m.startsWith('three/') || m.endsWith('place-scene.js') || m.endsWith('shot-scene.js')

describe('the eager path (D94)', () => {
  it.each([
    ['index.js', 'ShotPrevis.svelte'],
    ['PlaceReview.svelte', 'PlaceViewer.svelte'],
    ['ShotPrevis.svelte', 'lib/shot-camera.js'],
    ['ShotPlan.svelte', 'PlacePlan.svelte'],
  ])('from %s reaches %s but no three.js and no lazy scene module', (entry, reachable) => {
    const reached = [...eagerGraph(resolve(kit, entry))]
    expect(reached).toContain(resolve(kit, reachable))
    expect(reached.filter(engine)).toEqual([])
  })

  it.each(['lib/place-scene.js', 'lib/shot-scene.js'])('would see three.js on %s, which imports it eagerly (positive control)', (entry) => {
    expect([...eagerGraph(resolve(kit, entry))].some((m) => m === 'three' || m.startsWith('three/'))).toBe(true)
  })
})
