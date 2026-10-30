import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import * as lib from '@khaos-machine/khaotik-ui/components/svelte'
import { DEEP_ONLY, descriptors, implementationOf, SVELTE } from './descriptors.js'
import { schemas } from './props-schema.js'
import { SCHEMA_VERSION } from './document.js'

const REPO = join(import.meta.dirname, '../../../..')

describe('every published component, as a JSON descriptor', () => {
  it('has descriptors to check', () => {
    expect(Object.keys(descriptors).length).toBeGreaterThan(30)
  })

  it('describes exactly the barrel exports — none missing, none extra', () => {
    // Keyed off the barrel rather than the file glob, because the palette must
    // offer what a consumer can actually import. A component that exists but is
    // not exported would otherwise be composable here and unresolvable there.
    expect(Object.keys(descriptors).sort()).toEqual(Object.keys(lib).sort())
    const undescribed = Object.keys(schemas).filter((n) => !(n in descriptors))
    expect(undescribed.sort()).toEqual([...DEEP_ONLY].sort())
  })

  it('marks every library component a leaf with a Svelte implementation', () => {
    // `leaf: true` is the whole difference from an authored document, and it is
    // what the renderer branches on. `implementations` is a LIST so a second
    // target appends rather than forcing a schema change on every document.
    for (const [name, d] of Object.entries(descriptors)) {
      expect(d, name).toMatchObject({ schema: SCHEMA_VERSION, kind: 'component', slug: name, name, leaf: true })
      expect(d.implementations, name).toEqual([SVELTE])
    }
  })

  it('carries the props typedef through as declared inputs', () => {
    expect(descriptors.MetricCard.inputs.map((i) => i.name)).toEqual(schemas.MetricCard.map((p) => p.name))
    expect(descriptors.MetricCard.inputs.find((i) => i.name === 'tone').control)
      .toMatchObject({ kind: 'enum' })
  })

  it('points every descriptor at a source file that exists', () => {
    // The badge and the source panel both stake their claim on this path. A
    // descriptor naming a file that is not there would render a badge promising
    // code it cannot show.
    for (const [name, d] of Object.entries(descriptors)) {
      expect(d.source, name).toBe(`components/svelte/${name}.svelte`)
      expect(existsSync(join(REPO, d.source)), d.source).toBe(true)
    }
  })

  it('hands back the real component for a descriptor', () => {
    expect(implementationOf('MetricCard')).toBe(lib.MetricCard)
    expect(implementationOf('Nope')).toBeUndefined()
  })
})
