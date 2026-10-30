import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// `components/svelte/lib/types.js` must not declare the same typedef twice.
//
// That file exists BECAUSE a shape had already drifted across copies, and its
// own docblock says it exists *"precisely so the second copy never gets
// written"*. A duplicate typedef is therefore not untidiness — it is the exact
// defect the file was created to prevent, reproduced inside the file.
//
// NOTHING ELSE HERE CAN SEE IT, which is why this gate had to be written rather
// than assumed. `check-consumer`'s probe reaches these types through
// `ComponentProps`, not by deep-importing `lib/types.js`, so `tsc` never
// reports the duplicate identifier — and `Requirement` shipped declared twice,
// two byte-identical blocks back to back, through every gate in the repository.
//
// A source read is the only instrument available: JSDoc typedefs are comments,
// so there is no binding for a compiler to collide on and no export for a
// runtime check to inspect.

const TYPES = join(import.meta.dirname, '../../..', 'components/svelte/lib/types.js')

describe('lib/types.js declares each shape exactly once', () => {
  const source = readFileSync(TYPES, 'utf8')
  const names = [...source.matchAll(/@typedef\s+\{Object\}\s+(\w+)/g)].map((m) => m[1])

  it('finds typedefs at all — the positive control', () => {
    // Without this, a changed docblock convention would turn the check below
    // into an assertion about an empty list, which passes against anything.
    expect(names.length).toBeGreaterThan(5)
  })

  it('declares no shape more than once', () => {
    const seen = new Map()
    for (const n of names) seen.set(n, (seen.get(n) ?? 0) + 1)

    const duplicated = [...seen.entries()].filter(([, count]) => count > 1)
    expect(duplicated).toEqual([])
  })
})
