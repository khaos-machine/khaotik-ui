#!/usr/bin/env node
//
// Blocked-list gate — every issue CURRENT.md names in its blocked section must
// still be open, unless the file explicitly declares otherwise.
//
// WHY IT EXISTS: CURRENT.md listed #122 as blocking after it closed, and it was
// offered to the operator as available work on that basis. The rewrite that
// carried it (#138) was done specifically to remove rot.
//
// WHY IT DOES NOT PARSE PROSE STRUCTURE. The first version read only the
// "subject" of each bullet — the text before the em dash. Review found three
// ways that silently checked NOTHING and exited 0: a subject wrapping to a
// second line (the `- ` filter never saw it), `#122/#124` without spaces (the
// `/` lookbehind dropped the second), and an owner-qualified
// `khaos-studio/khaotik-ui#122`. It also red on correct history prose whenever
// a bullet used an en dash or a hyphen. Every one of those is a consequence of
// inferring which ref is "the claim" from punctuation.
//
// So it reads EVERY reference in the section and checks all of them. Prose that
// deliberately cites a closed issue — "the destructive half is fixed by #139" —
// declares itself once, in a marker the file carries in plain sight:
//
//     <!-- check-issue-refs: allow-closed #139 #122 -->
//
// An exception you can grep beats a heuristic you have to trust, and an
// allow-list that must be edited is a place a reader looks.
//
// Cross-repo refs (`khaos-manager#166`, `owner/repo#12`) are resolved against
// THAT repo rather than skipped. Skipping them is how the first version let a
// claim about khaos-manager#166 rot within hours of being written.
//
// Exit 0 = every referenced issue is open, or explicitly allowed closed.
// Exit 1 = at least one is closed and not allowed, and it is named.
// Exit 2 = the check could not run (a missing input is never a pass).

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const DEFAULT_REPO = 'khaos-machine/khaotik-ui'
const FILE = 'CURRENT.md'
const HEADING = /^##\s+Blocked or blocking/im

let text
try {
  text = readFileSync(FILE, 'utf8')
} catch (err) {
  console.error(`check-issue-refs: CANNOT RUN — ${FILE} is unreadable: ${err.message}`)
  process.exit(2)
}

// Fenced code is illustration, not assertion. The header below PRINTS a
// ready-made marker line for a reader to paste, and review confirmed that
// block was granting a real exemption from inside a ``` fence.
// Line-based, not a regex. The regex anchored on `^``` , so an INDENTED fence,
// a `~~~` fence, or a fence nested in a list item all left a marker live — and
// CURRENT.md's own style puts ```sh blocks inside list items, so the file's
// normal shape was the uncovered one. Blanking rather than deleting preserves
// byte offsets, which the section search depends on.
const stripFences = (t) => {
  const lines = t.split('\n')
  const blank = new Array(lines.length).fill(false)
  let open = null // { index, char }
  lines.forEach((line, i) => {
    const m = line.match(/^\s*(```+|~~~+)/)
    if (!m) return
    if (open === null) { open = { index: i, char: m[1][0] }; return }
    if (m[1][0] === open.char) {
      for (let j = open.index; j <= i; j++) blank[j] = true
      open = null
    }
  })
  // An opener with no closer is NOT a fence. Blanking from it to end-of-file
  // would hide every reference after a stray backtick line — a fail-open, and
  // one the previous regex did not have because a lazy match needs its closer.
  return lines.map((line, i) => (blank[i] ? line.replace(/[^\n]/g, ' ') : line)).join('\n')
}
text = stripFences(text)

const start = text.search(HEADING)
if (start === -1) {
  console.error(`check-issue-refs: CANNOT RUN — no "## Blocked or blocking" section in ${FILE}`)
  process.exit(2)
}
const rest = text.slice(start)
const end = rest.slice(1).search(/^##\s/m)
const section = end === -1 ? rest : rest.slice(0, end + 1)

// Explicitly allowed-closed refs, declared anywhere in the file.
const allowed = new Set(
  [...text.matchAll(/<!--\s*check-issue-refs:\s*allow-closed([^>]*?)-->/g)]
    .flatMap((m) => [...m[1].matchAll(/((?:[\w.-]+\/)?[\w.-]+)?#(\d+)/g)])
    .map((m) => `${m[1] ? (m[1].includes('/') ? m[1] : `khaos-studio/${m[1]}`) : DEFAULT_REPO}#${m[2]}`)
)

// EVERY reference in the section: bare `#12`, `repo#12`, `owner/repo#12`.
const refs = new Map()
// The repo must be ADJACENT to the `#`. With `\s*` between them, `removed
// #124` read "removed" as a repository name and the gate exited 2.
for (const m of section.matchAll(/(?:\b([\w.-]+(?:\/[\w.-]+)?))?#(\d+)\b/g)) {
  const owner = m[1]
  const repo = !owner ? DEFAULT_REPO : owner.includes('/') ? owner : `khaos-studio/${owner}`
  refs.set(`${repo}#${m[2]}`, { repo, number: m[2] })
}

if (refs.size === 0) {
  console.log(`check-issue-refs: the blocked section carries no issue references.`)
  process.exit(0)
}

// EVERY ref is queried, allow-listed or not. `allow-closed` suppresses the
// closed-failure; it does NOT mean "skip". Skipping made the marker a blind
// spot exactly where it hurts: CURRENT.md names "khaos-manager reversing the
// retirement" as #61's kill condition, and that reversal REOPENS
// khaos-manager#166 — the one event the entry turns on was the one event a
// skipping gate could never see.
const bad = []
const unverified = []
let checked = 0
let confirmedClosed = 0
for (const [key, { repo, number }] of refs) {
  let info
  try {
    info = JSON.parse(
      execFileSync('gh', ['api', `repos/${repo}/issues/${number}`, '--jq', '{state:.state,title:.title}'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    )
  } catch (err) {
    if (repo !== DEFAULT_REPO) {
      // A repo-scoped GITHUB_TOKEN cannot read another repository's issues, so
      // this is expected in CI and must NOT read as verified. It is a named
      // gap, not a pass and not a crash.
      unverified.push(`${key} — could not be read from here (a repo-scoped token cannot see another repository)`)
      continue
    }
    console.error(`check-issue-refs: CANNOT RUN — could not read ${key}`)
    console.error(String(err.stderr || err.message).trim().split('\n')[0])
    process.exit(2)
  }
  checked++
  const open = info?.state === 'open'
  if (!open && !allowed.has(key)) bad.push(`${key} is ${info?.state ?? 'unknown'} — ${info?.title ?? ''}`)
  if (open && allowed.has(key)) bad.push(`${key} is OPEN but is on the allow-closed list — the marker is stale`)
  if (!open && allowed.has(key)) confirmedClosed++
}

// BOTH lists print before exiting. Returning on `unverified` first let a token
// limitation hide a genuinely closed same-repo reference — the founding defect,
// concealed behind an unrelated failure.
if (bad.length > 0 || unverified.length > 0) {
  if (bad.length > 0) {
    console.error(`check-issue-refs: FAIL — ${FILE}'s blocked section references issues that are not open:`)
    for (const b of bad) console.error(`  \u00b7 ${b}`)
    console.error(`  Remove it, say what still blocks, or if the prose cites it deliberately add:`)
    console.error(`      <!-- check-issue-refs: allow-closed ${bad.map((b) => b.split(' ')[0]).join(' ')} -->`)
  }
  if (unverified.length > 0) {
    console.error(`check-issue-refs: FAIL — cross-repository references it could not verify:`)
    for (const u of unverified) console.error(`  \u00b7 ${u}`)
    console.error(`  A repo-scoped CI token cannot read another repository and no scope widens`)
    console.error(`  it. Move the entry out of the blocked section rather than adding one.`)
  }
  process.exit(1)
}

console.log(
  `check-issue-refs: ${checked} referenced issue(s) verified` +
    (confirmedClosed ? `, ${confirmedClosed} allowed closed and confirmed closed` : '') + '.'
)
