import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// SOURCE-READ, because nothing else can see this.
//
// The bundle's identity is metadata: it is compiled into the signed app and
// shown by Finder, Gatekeeper and the Get Info panel, but it is never rendered,
// never imported, and never touched by a test that mounts a component. So the
// Tauri scaffold's defaults — description "A Tauri App", authors ["you"], empty
// license and repository — shipped inside FOUR signed, notarized, publicly
// distributed builds without one gate going red. That is the same defect class
// CLAUDE.md names for CSS that does not ship: invisible to the build, and
// therefore green until a human happens to read the file.
//
// Two files, and the second is the trap: Tauri falls through to Cargo.toml's
// [package] fields when the matching bundle key in tauri.conf.json is null. So
// fixing tauri.conf.json alone still ships "A Tauri App" for anything that
// reads the crate metadata, and fixing Cargo.toml alone leaves the bundle keys
// unset. Both are asserted here.

const TAURI = join(import.meta.dirname, '../src-tauri')
const REPO = 'https://github.com/khaos-machine/khaotik-ui'

const conf = JSON.parse(readFileSync(join(TAURI, 'tauri.conf.json'), 'utf8'))

// The [package] table only — dependency metadata further down must not be able
// to satisfy these by accident.
const pkg = readFileSync(join(TAURI, 'Cargo.toml'), 'utf8').split(/^\[/m)[1]
const field = (name) => pkg.match(new RegExp(`^${name}\\s*=\\s*(?:"([^"]*)"|\\[([^\\]]*)\\])`, 'm'))

// The exact strings `tauri init` writes. Anything matching one of these is the
// scaffold talking, not us.
const SCAFFOLD = ['A Tauri App', 'you', '']

describe('the signed bundle says who published it', () => {
  it.each(['publisher', 'copyright', 'category', 'shortDescription', 'longDescription'])(
    'declares bundle.%s',
    (key) => {
      expect(conf.bundle?.[key], `bundle.${key} is unset, so Tauri falls back to a default`)
        .toBeTruthy()
    },
  )

  it('names Khaos Studio as the publisher', () => {
    expect(conf.bundle.publisher).toBe('Khaos Studio')
  })

  it('carries a copyright line naming a holder and a year', () => {
    expect(conf.bundle.copyright).toMatch(/©\s*\d{4}\s+\S/)
  })
})

describe('the crate metadata Tauri falls back to', () => {
  it.each(['description', 'license', 'repository'])('sets a real %s', (name) => {
    const value = field(name)?.[1]

    expect(value, `Cargo.toml ${name} is missing`).toBeDefined()
    expect(SCAFFOLD, `Cargo.toml ${name} is still the scaffold value`).not.toContain(value)
  })

  it('credits an author who is not the scaffold placeholder', () => {
    const authors = field('authors')?.[2]

    expect(authors).toBeDefined()
    expect(authors).not.toMatch(/"you"/)
    expect(authors).toMatch(/\S/)
  })

  it('points at the repository this is actually built from', () => {
    expect(field('repository')?.[1]).toBe(REPO)
  })

  // The licence is asserted against the file that grants it. A manifest naming
  // a licence the repo does not ship is a claim with nothing behind it, and
  // this repo shipped with no LICENSE at all until the identity was fixed.
  it('names a licence the repository actually carries', () => {
    const declared = field('license')?.[1]
    const license = readFileSync(join(import.meta.dirname, '../../../LICENSE'), 'utf8')

    expect(declared).toBe('Apache-2.0')
    expect(license).toMatch(/Apache License\s+Version 2\.0/)
  })
})
