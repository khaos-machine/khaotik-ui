import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { propEntries } from './editor/props-schema.js'
import { join } from 'node:path'

// SOURCE-READ, over the library rather than the catalog.
//
// svelte2tsx marks a `$props()` member REQUIRED when it has no default value.
// Svelte does not agree: an absent prop is simply `undefined`, and every
// callback and snippet in this kit is invoked as `onSelect?.()` or guarded with
// `{#if trailing}`. So a prop with no default produced a declaration that lied,
// and the lie only surfaced downstream — #31 reported 21 errors across 4 files
// in khaos-app, all of the shape "Property 'children' is missing ... but
// required", for components that work perfectly well without them.
//
// Nothing in this repo could see it. The components behave identically either
// way, so no rendered test changes; `check-types` compares the declarations to
// the components and both agreed on the wrong answer; and the catalog is
// JavaScript, so it never type-checks its own usage. The defect existed only in
// the artifact consumers read.
//
// The rule this pins: every prop carries an explicit default, `= undefined`
// where there is nothing better to say. That is a no-op at runtime — the
// destructuring result is identical — and it is the whole fix.

const LIB = join(import.meta.dirname, '../../../components/svelte')

// A prop that genuinely cannot work when absent belongs here, with the reason.
// Empty on purpose: every prop in the kit today is optional in fact, and a
// component that truly requires one should say so by throwing, not by a type
// its own runtime does not enforce.
const REQUIRED_BY_DESIGN = {}

const components = readdirSync(LIB)
  .filter((f) => f.endsWith('.svelte'))
  .map((f) => ({ name: f, source: readFileSync(join(LIB, f), 'utf8') }))

// `propEntries` used to live here. It now lives in the editor's props-schema
// module, which needs the same parse to build the inspector's controls, and is
// imported back so the two cannot drift — the scar this repo carries is a parser
// that existed twice (`tokens/parse.js`) and shipped a crash when the copies
// disagreed. The import direction is deliberate: the parser belongs where it is
// used at runtime, and a test is not a home for shared code.

const declarations = readdirSync(LIB).filter((f) => f.endsWith('.svelte.d.ts'))

describe('the library declares every prop optional, because every prop is', () => {
  it('has components and declarations to check', () => {
    // Guards the guard: a wrong LIB path would make everything below vacuous.
    expect(components.length).toBeGreaterThan(30)
    expect(declarations.length).toBeGreaterThan(30)
  })

  it('gives every prop an explicit default', () => {
    const bare = components.flatMap(({ name, source }) =>
      propEntries(source)
        .filter((e) => !e.includes('=') && !e.startsWith('...'))
        .filter((e) => REQUIRED_BY_DESIGN[name]?.includes(e) !== true)
        .map((e) => `${name}: ${e}`),
    )

    // Named rather than counted, so the failure says which prop to fix.
    expect(bare).toEqual([])
  })

  it('emits no required prop into any declaration', () => {
    // The symptom, checked separately from the cause: if the generator changes
    // how it reads defaults, the source rule above could hold while the
    // artifact consumers read still says required.
    const required = declarations.flatMap((name) => {
      const props = readFileSync(join(LIB, name), 'utf8').match(/^\s{4}(\w+)(\??):/gm) ?? []
      return props
        .filter((p) => !p.includes('?:'))
        .map((p) => `${name}: ${p.trim()}`)
    })

    expect(required).toEqual([])
  })
})
