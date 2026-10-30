import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// SOURCE-READ, over the library's gate script rather than the catalog.
//
// `scripts/check-consumer.mjs` writes a generated probe, compiles it with tsc,
// and deletes it in a `finally`. Two defects lived in that sequence, and both
// are invisible to every other check here: the gate exits 0 on a healthy tree
// either way, so nothing rendered, built or type-checked can see them.
//
// 1. THE PROBE PATH WAS FIXED (`probe.ts`). Two runs of the gate at once — a
//    watch loop beside a terminal, or a CI job that parallelises the gates —
//    shared that one file, and whichever finished first deleted it out from
//    under the other's tsc. The window is narrow, which is worse than wide: it
//    fails once, is not reproducible, and gets waved through as a flake.
//
// 2. A MISSING PROBE WAS REPORTED AS A TYPE ERROR. With no input, tsc emits
//    TS18003 "No inputs were found" and exits non-zero. That landed in the
//    catch as `fail()` — exit 1, under the message "the published types do not
//    satisfy a consumer rendering every component with no props". So an
//    infrastructure failure read as a declarations failure and sent the reader
//    into the components, and it reported a 1 (a named gap) where the contract
//    says 2 (could not run, a red).
//
// Asserted by reading the source rather than by running the gate: reproducing
// either one means racing a subprocess or suppressing its write, and the gate
// shells out to tsc over all 46 exports — too slow to run twice in this suite
// for what is, in the end, a two-line invariant.
const GATE = join(__dirname, '../../../scripts/check-consumer.mjs')

describe('check-consumer gate', () => {
  const source = readFileSync(GATE, 'utf8')

  it('writes its probe to a path unique per run', () => {
    const assignment = source.match(/const probePath = .*/)?.[0]
    expect(assignment, 'probePath is no longer assigned in one statement').toBeTruthy()
    expect(
      assignment,
      'probePath must vary per process — a fixed name lets one run delete another run\'s input',
    ).toContain('process.pid')
  })

  it('classifies "no inputs" as CANNOT RUN, not as a type failure', () => {
    expect(
      source,
      'TS18003 means the probe never reached tsc — the check did not run',
    ).toContain('TS18003')

    const branch = source.slice(source.indexOf('TS18003'))
    const cannotRunAt = branch.indexOf('cannotRun')
    const failAt = branch.indexOf('fail(')
    expect(cannotRunAt, 'the TS18003 branch must call cannotRun').toBeGreaterThan(-1)
    expect(
      cannotRunAt,
      'TS18003 must reach cannotRun (exit 2) before falling through to fail (exit 1)',
    ).toBeLessThan(failAt === -1 ? Infinity : failAt)
  })

  it('still removes the probe in a finally', () => {
    expect(source, 'a leftover probe becomes the next run\'s stale input').toMatch(
      /finally\s*\{\s*rmSync\(probePath/,
    )
  })
})
