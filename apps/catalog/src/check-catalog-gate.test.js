import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// MUTATION TEST over `scripts/check-catalog-coverage.sh` — the gate that runs
// FIRST in the `&&` chain at package.json:14, which `gates.yml` runs on every
// pull request and before every signed release. When it dies, the three gates
// behind it never run.
//
// The point is the second deletion. Deleting the ASSERTION asks whether the
// suite notices the check is gone; deleting the SUBJECT THE ASSERTION MEASURES
// AGAINST asks whether the check notices its own input vanished. Almost
// everyone runs only the first, because the second feels like testing the
// product rather than testing the test. This gate passed the first and failed
// the second in four separate ways, all measured (khaos.machine#256):
//
//   - Delete the `plays:` declarations, and it died at the assignment with an
//     EMPTY log and exit 1 — indistinguishable from a real coverage gap.
//   - Delete every export, and the same silent death reported exit 1 where the
//     contract at the script's :19 promises exit 2.
//   - COMMENT OUT every export, and it reported full coverage, exit 0, GREEN.
//     The barrel was matched as raw text while only fixtures.js was
//     comment-stripped, so a commented-out export still counted as shipped.
//   - Write a fake export INSIDE a comment, and that was the one thing that
//     could redden the gate.
//
// Cause: `set -euo pipefail` plus `X="$(grep … )"`. A grep that matches
// nothing exits 1, and the assignment kills the script before it can reach the
// CANNOT RUN guards that name that exact condition. The guards were unreachable
// for their own stated cause.
//
// A fifth case was found by writing this test rather than by the audit, which
// mutated `plays:` and not `component:`: with the registry's shape destroyed,
// one surviving `plays:` entry kept the merged set non-empty, so the gate
// skipped its guard and reported "48 components have no fixture" — a confident
// wrong number where the contract promises exit 2.
//
// Executed rather than source-read, unlike check-consumer-gate.test.js. That
// gate shells out to tsc over every export and is too slow to run twice here;
// this one is a few greps and answers in milliseconds, so the stronger form is
// affordable. An assertion about what a script SAYS is weaker than one about
// what it DOES.
const ROOT = join(__dirname, '../../..')
const SCRIPT = join(ROOT, 'scripts/check-catalog-coverage.sh')
const INDEX = join(ROOT, 'components/svelte/index.js')
const FIXTURES = join(ROOT, 'apps/catalog/src/fixtures.js')

// The script resolves its own inputs from `dirname $0/..`, so a mutation is
// applied by building a miniature tree and pointing nothing at the real repo.
// Nothing here writes inside the working tree.
function runGateOn({ index, fixtures } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-gate-'))
  try {
    mkdirSync(join(dir, 'scripts'), { recursive: true })
    mkdirSync(join(dir, 'components/svelte'), { recursive: true })
    mkdirSync(join(dir, 'apps/catalog/src'), { recursive: true })
    copyFileSync(SCRIPT, join(dir, 'scripts/check-catalog-coverage.sh'))

    const indexSource = readFileSync(INDEX, 'utf8')
    const fixturesSource = readFileSync(FIXTURES, 'utf8')
    writeFileSync(join(dir, 'components/svelte/index.js'), index ? index(indexSource) : indexSource)
    writeFileSync(
      join(dir, 'apps/catalog/src/fixtures.js'),
      fixtures ? fixtures(fixturesSource) : fixturesSource,
    )

    const r = spawnSync('bash', [join(dir, 'scripts/check-catalog-coverage.sh')], {
      encoding: 'utf8',
    })
    return { status: r.status, output: `${r.stdout}${r.stderr}` }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const dropExports = (s) =>
  s
    .split('\n')
    .filter((l) => !l.includes('export { default as'))
    .join('\n')

const commentOutExports = (s) => s.replace(/^export \{ default as/gm, '// export { default as')

describe('check-catalog-coverage gate', () => {
  it('passes on the real tree, and says how many it checked', () => {
    const { status, output } = runGateOn()
    expect(status, output).toBe(0)
    expect(output).toMatch(/catalog coverage: \d+\/\d+ exported components playable/)
  })

  // --- deleting the SUBJECT: the gate must report that it could not run ---

  it('exits 2 when the barrel yields no exports, rather than dying silently', () => {
    const { status, output } = runGateOn({ index: dropExports })
    expect(status, `expected CANNOT RUN (2), got ${status} with: ${output}`).toBe(2)
    expect(output).toContain('parsed zero exports')
  })

  it('exits 2 when every export is commented out — a comment is not a shipped export', () => {
    const { status, output } = runGateOn({ index: commentOutExports })
    expect(
      status,
      `a commented-out barrel once reported FULL COVERAGE and exit 0; got: ${output}`,
    ).toBe(2)
    expect(output).toContain('parsed zero exports')
  })

  it('exits 2 when the registry yields no `component:` entries', () => {
    const { status, output } = runGateOn({
      fixtures: (s) => s.replace(/component:/g, 'componentXX:'),
    })
    expect(
      status,
      `an unparseable registry once reported a 48-component coverage gap; got: ${output}`,
    ).toBe(2)
    expect(output).toContain("the registry's shape may have changed")
  })

  // --- an absent declaration is a GAP, not a crash ---

  it('reports a named gap when the `plays:` declarations are removed', () => {
    const { status, output } = runGateOn({
      fixtures: (s) => s.replace(/plays: \[[^\]]*\],?/gs, ''),
    })
    expect(status, `expected a named gap (1), got ${status} with: ${output}`).toBe(1)
    expect(output, 'the gap must NAME the component — this once printed nothing at all').toContain(
      'Icon',
    )
  })

  it('reports a named gap when one component loses its fixture', () => {
    const { status, output } = runGateOn({
      fixtures: (s) => s.replace(/component: StatusPill,/g, 'component: StatusPillGONE,'),
    })
    expect(status, output).toBe(1)
    expect(output).toContain('StatusPill')
  })

  // --- and prose must not be able to move the number in either direction ---

  it('ignores an export that exists only inside a comment', () => {
    const { status, output } = runGateOn({
      index: (s) => `${s}\n// export { default as GhostComponent } from './Ghost.svelte'\n`,
    })
    expect(
      status,
      `a fake export written in prose once reddened the gate; got: ${output}`,
    ).toBe(0)
    expect(output).not.toContain('GhostComponent')
  })
})
