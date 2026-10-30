import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// EXECUTES the gate against mutated trees rather than reading its source.
//
// `check-export-count` fires only when a document has drifted, so on a healthy
// repository it exits 0 forever and nothing here would notice it had stopped
// working. That is the shape this repository keeps meeting — an instrument that
// reports clean by never being asked — and the reason the gate exists at all is
// that `README.md` claimed 48 exports against a barrel of 52 with no check
// reading either.
//
// Each case copies the two files the gate reads into a temp tree, mutates one,
// and runs the real script there. Nothing touches the working tree.

const ROOT = join(import.meta.dirname, '../../..')
const SCRIPT = join(ROOT, 'scripts/check-export-count.mjs')

/** Run the real gate against a throwaway copy of the tree's two inputs. */
function runAgainst({ readme, index }) {
  const dir = mkdtempSync(join(tmpdir(), 'export-count-'))
  try {
    cpSync(join(ROOT, 'docs'), join(dir, 'docs'), { recursive: true })
    cpSync(join(ROOT, 'components/svelte/index.js'), join(dir, 'components/svelte/index.js'), {
      recursive: true,
    })
    for (const f of ['README.md', 'AGENTS.md', 'CHANGELOG.md', 'CURRENT.md']) {
      cpSync(join(ROOT, f), join(dir, f))
    }
    if (readme !== undefined) writeFileSync(join(dir, 'README.md'), readme)
    if (index !== undefined) writeFileSync(join(dir, 'components/svelte/index.js'), index)

    try {
      const stdout = execFileSync('node', [SCRIPT], { cwd: dir, encoding: 'utf8' })
      return { code: 0, out: stdout }
    } catch (e) {
      return { code: e.status, out: `${e.stdout ?? ''}${e.stderr ?? ''}` }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('check-export-count fails on the thing it exists to catch', () => {
  it('exits 0 on the tree as it stands', () => {
    const { code, out } = runAgainst({})
    expect(code, out).toBe(0)
    expect(out).toMatch(/all read \d+/)
  })

  it('exits 1 and names the file when a count has drifted', () => {
    const { code, out } = runAgainst({ readme: 'The catalog imports all 48 exports.\n' })
    expect(code).toBe(1)
    expect(out).toContain('README.md:1')
    expect(out).toContain('claims 48')
  })

  it('exits 2 rather than 0 when the barrel reads empty', () => {
    // The vacuous-green guard. With no exports every comparison would be
    // against zero, and a gate that passes because it examined nothing is the
    // defect this repository has hit repeatedly. The 0/1/2 contract makes this
    // a CANNOT RUN, not a clean pass and not a named gap.
    const { code, out } = runAgainst({ index: '' })
    expect(code).toBe(2)
    expect(out).toContain('Refusing to compare against nothing')
  })

  it('does not fire on a count of components affected by a past change', () => {
    // The first version of this gate matched `components` as well as `exports`
    // and was wrong on half its hits — "65 rules across 29 components now use
    // --text-secondary" is an accurate historical count, not a claim about the
    // barrel. A gate with a 50% false rate gets ignored or quietly narrowed by
    // whoever it next inconveniences.
    const { code } = runAgainst({
      readme: 'A change moved 65 rules across 29 components to `--text-secondary`.\n',
    })
    expect(code).toBe(0)
  })

  it('ignores small numbers, which are prose rather than inventories', () => {
    const { code } = runAgainst({ readme: 'This file has 3 exports.\n' })
    expect(code).toBe(0)
  })
})
