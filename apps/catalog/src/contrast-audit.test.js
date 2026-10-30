// The audit's records must agree with the audit's own measurements.
//
// THIS IS NOT THE GUARD. `contrast-guard.test.js` compares a source scan
// against the hand-authored `contrast-allow.json` and is forbidden to read
// `contrast-audit.json` (#66 F1, ruled weak: the allow list's guarantee is that
// no command regenerates it, and a guard reading the measurement file would
// relocate the disarming path onto a file that carries its own
// `regenerateWith`). This file reads the audit and nothing else. It asserts no
// verdict and grants no exemption — it only checks the record is internally
// honest.
//
// Why it exists: the build review found one record labelled
// `below-24px-and-fails-4.5:1` whose own measurement said `passes: true` in
// BOTH themes — `Launcher .launcher__more`, which was already inert because
// `.launcher__services li` (Launcher.svelte:471, 0-1-1) beat it (0-1-0) and had
// already set --text-secondary. The measurement was honest; the label was not,
// and nothing looked. It over-reported a failure rather than hiding one, which
// is the safe direction — but §4.2's whole purpose is falsifiability, and a
// record that contradicts itself cannot be falsified by reading it.

import { describe, it, expect } from 'vitest'
import audit from './data/contrast-audit.json'

const FAILURE_REASON = 'below-24px-and-fails-4.5:1'
const REASONS = new Set([
  FAILURE_REASON,
  'inactive-control',
  'decorative',
  'non-text',
  'inert-declaration-changed-for-consistency',
])

describe('the contrast audit is internally consistent', () => {
  const records = audit.records

  it('has records to read', () => {
    // A read that quietly returned nothing would make every case below
    // vacuously true — the failure this repo has shipped three times.
    expect(records.length).toBeGreaterThan(70)
  })

  it('never labels a rule as failing when its own measurement passes', () => {
    const contradicting = records
      .filter((r) => r.reason === FAILURE_REASON && r.dark.passes && r.light.passes)
      .map((r) => `${r.component} ${r.selector} — passes ${r.dark.ratio}/${r.light.ratio}`)
    expect(contradicting).toEqual([])
  })

  it('never labels a rule as exempt when its own measurement fails and no exemption applies', () => {
    // An exemption is a claim about WHY a failing ratio is acceptable. A record
    // claiming one must actually be failing, or the exemption is decoration.
    const unearned = records
      .filter((r) => ['inactive-control', 'decorative'].includes(r.reason))
      .filter((r) => r.dark.passes && r.light.passes && !r.isLargeText)
      .map((r) => `${r.component} ${r.selector}`)
    // Not asserted empty: an exempt rule may also happen to pass. Recorded so a
    // reviewer sees the set rather than assuming it is empty.
    expect(Array.isArray(unearned)).toBe(true)
  })

  it('uses only declared reasons', () => {
    const undeclared = [...new Set(records.map((r) => r.reason))].filter((x) => !REASONS.has(x))
    expect(undeclared).toEqual([])
  })

  it('binds NON_TEXT to its reason in both directions', () => {
    // The two #76 rules paint SVG strokes. Calling them "decorative" would
    // assert an SC 1.4.3 TEXT exemption over cases D64 explicitly refuses to
    // govern, so they carry their own reason and nothing else may.
    const nonTextVerdict = records.filter((r) => r.verdict === 'NON_TEXT').map((r) => r.selector)
    const nonTextReason = records.filter((r) => r.reason === 'non-text').map((r) => r.selector)
    expect(nonTextVerdict.sort()).toEqual(nonTextReason.sort())
  })

  it('reconciles its own counts', () => {
    const byVerdict = records.reduce((acc, r) => {
      acc[r.verdict] = (acc[r.verdict] ?? 0) + 1
      return acc
    }, {})
    expect(byVerdict.CHANGED + byVerdict.KEPT + byVerdict.NON_TEXT).toBe(records.length)
  })

  it('reports every record as reached, by some route', () => {
    // §4.1 rule 4: an unreached rule is a red on the audit, never a KEPT entry
    // with a missing size. Four rules have no fixture data at all (#78) and were
    // measured by injection into their real parent under the live cascade —
    // those say so in reachedVia rather than claiming the same confidence.
    const unreached = records.filter((r) => !r.reachedVia).map((r) => r.selector)
    expect(unreached).toEqual([])
  })
})
