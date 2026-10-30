import { describe, it, expect } from 'vitest'
import { schemas, componentSources, propNames } from './props-schema.js'

// SOURCE-READ, over the library rather than the catalog.
//
// The editor's props panel is generated from each component's JSDoc `Props`
// typedef. That is only trustworthy while the typedef and the `$props()`
// destructure agree — a prop destructured but not documented would be invisible
// in the editor, and a prop documented but not destructured would offer a
// control that goes nowhere.
//
// Nothing in this repo could see either today. `check-consumer` fails a prop
// that reaches the shipped `.d.ts` with no description, which catches the first
// case only once the declarations are rebuilt; `check-types` compares the
// declarations to the components and both would agree on the wrong answer; and
// the catalog is JavaScript, so it never type-checks its own usage.
//
// Measured drift when this landed: ZERO, across all 49 components. This test
// exists to hold that, and it closes a hole that is real whether or not Compose
// ships.

describe('every prop is documented, and every documented prop exists', () => {
  it('has components to check', () => {
    expect(Object.keys(componentSources).length).toBeGreaterThan(30)
  })

  it('has no prop destructured without a @property line', () => {
    const undocumented = Object.entries(componentSources).flatMap(([name, src]) => {
      const declared = new Set(schemas[name].map((p) => p.name))
      return propNames(src).filter((n) => !declared.has(n)).map((n) => `${name}.${n}`)
    })
    expect(undocumented).toEqual([])
  })

  it('has no @property line for a prop the component does not take', () => {
    const phantom = Object.entries(componentSources).flatMap(([name, src]) => {
      const actual = new Set(propNames(src))
      return schemas[name].map((p) => p.name).filter((n) => !actual.has(n)).map((n) => `${name}.${n}`)
    })
    expect(phantom).toEqual([])
  })
})
