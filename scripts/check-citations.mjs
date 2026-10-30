#!/usr/bin/env node
// check-citations — every `path:line` citation in a live reference document resolves.
//
// WHY THIS EXISTS. `gates.yml` ran seven checks and none of them opened a
// markdown file. A pull request of eight root documents got a green from a
// suite that read none of them, and review then found four defects in those
// documents by hand — one of which was a citation, `RULES.md:308`, pointing at
// the workspace root's file until this repository grew a `RULES.md` of its own.
// It then resolved to a real 111-line file with no line 308: the citation got
// WORSE by landing somewhere, because a reader finds a real file instead of
// nothing.
//
// THE FIRST VERSION OF THIS GATE WAS ITSELF VACUOUS, which is worth keeping in
// front of whoever edits it next. It checked exactly ONE citation in the whole
// repository — `CHANGELOG.md -> tokens/tokens.css:169` — and none at all in the
// eight documents it was written for. Three measured failures, all green:
//
//   `NOSUCHFILE.md:5`   → exit 0. A path that did not exist was counted as
//                         SKIPPED, not as a gap. That is the exact branch
//                         `RULES.md:308` arrived through, so the gate could not
//                         catch its own founding defect; it caught it only
//                         because that PR happened to create `RULES.md`.
//   `RULES.md:112`      → exit 0 against a 111-line file. `split('\n').length`
//                         counts the empty tail after the trailing newline.
//   `timeline.js:17-18` → silently skipped. A real citation in a real document,
//                         missed because the file is at
//                         `components/svelte/lib/timeline.js` and only the repo
//                         root was tried.
//
// A missing path is now a GAP. Bare filenames resolve against the tracked file
// list, and a basename two tracked files share is a gap naming both. Only paths
// matching a declared cross-repository pattern are declined, and that count is
// printed so a rising number is visible.
//
// WHAT IT STILL CANNOT DO, so nobody reads a green as more than it is:
//   - SCOPE IS THE LIVE REFERENCE DOCUMENTS: root-level `*.md` plus `docs/*.md`,
//     minus `docs/decisions.md`. Citations in `apps/`, in source comments, and
//     one directory deeper are not read — so the `timeline.js` docblock that was
//     false for months stays out of scope.
//
//     `docs/decisions.md` and `docs/plans/` are excluded ON PURPOSE, measured
//     rather than assumed: the register carries 32 citations to files that no
//     longer exist (`spec/ucs-0.6.md`, `lowering/ios.md`, `android/RichText.kt`)
//     because D1–D38 describe the retired UCS programme, and the plans carry 39
//     more of the same kind. Those citations were true when written. Gating them
//     would demand rewriting the historical record, which the register's own
//     scope note refuses — "the rows ARE the historical record and annotating
//     each one would rewrite it". A gate that can only be satisfied by falsifying
//     history is worse than no gate.
//   - It checks the cited line EXISTS, never that it says what the prose
//     claims. A citation to a line that has since changed meaning passes.
//   - It cannot see a claim with no citation at all — that same docblock,
//     "element durations summed exactly to segment duration", names no line
//     and would pass every version of this gate.
//
// Exit 0 clean · 1 named gaps · 2 could not run.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// A citation is `some/path.ext:123` or `some/path.ext:123-456`.
//
// The extension must START WITH A LETTER. Without that, `4.5:1` matches with
// path `4.5`, and `127.0.0.1:9223` with path `127.0.0.1` — both did, and the
// first version of this file carried a comment claiming they could not. They
// were invisible only because they fell through the silent-skip branch this
// version removes, so tightening the pattern and closing the skip had to happen
// in the same change.
const CITATION = /\b([A-Za-z0-9._\-/]+\.[A-Za-z][A-Za-z0-9]{0,5}):(\d+)(?:-(\d+))?\b/g

// Paths deliberately not resolved: they name a file in another repository, and
// guessing a checkout location that may not exist on the machine running this
// gate would be worse than declining. Cite those by SECTION NAME, not by line.
const CROSS_REPO = [
  /^(khaos-|KSPD|kspd|loswf-)/,
  /^(internal|cmd|code)\//,
  /^docs\/rfc\//,
  /^https?:/,
]

/** Every line-count, by path, counted the way `wc -l` counts. */
function lineCount(file) {
  const text = readFileSync(file, 'utf8')
  if (text === '') return 0
  // A trailing newline terminates the last line; it does not begin a new one.
  return text.endsWith('\n') ? text.split('\n').length - 1 : text.split('\n').length
}

/** Tracked files, for resolving a citation that names no directory. */
function trackedByBasename() {
  const out = new Map()
  const listed = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  for (const path of listed.split('\n')) {
    if (!path) continue
    const key = basename(path)
    if (!out.has(key)) out.set(key, [])
    out.get(key).push(path)
  }
  return out
}

// The live reference set: root `*.md` and `docs/*.md`, minus the register.
// Not recursive — `docs/plans/`, `docs/rfc/` and `docs/audits/` are records of
// what was true when written, not claims about the tree as it stands now.
const HISTORICAL = new Set(['docs/decisions.md'])

// CHANGELOG.md is live only above its first released section. A released entry
// records what was true when it shipped, the same as a decision row: a later
// release that deletes a cited file must not demand rewriting it. [Unreleased]
// still describes the tree as it stands, so it stays checked.
const RELEASED_SECTION = /^## \[\d+\.\d+\.\d+\]/
const liveLines = (doc, lines) => {
  if (doc !== 'CHANGELOG.md') return lines
  const end = lines.findIndex((l) => RELEASED_SECTION.test(l))
  return end < 0 ? lines : lines.slice(0, end)
}

function liveDocs() {
  const mdIn = (dir) => {
    const abs = join(ROOT, dir)
    if (!existsSync(abs)) return []
    return readdirSync(abs)
      .filter((f) => f.endsWith('.md'))
      .map((f) => (dir === '.' ? f : `${dir}/${f}`))
      .filter((rel) => statSync(join(ROOT, rel)).isFile())
      .filter((rel) => !HISTORICAL.has(rel))
  }
  return [...mdIn('.'), ...mdIn('docs')].sort()
}

function main() {
  let docs
  let byBasename
  try {
    docs = liveDocs()
    byBasename = trackedByBasename()
  } catch (error) {
    console.error(`check-citations: could not read the repository — ${error.message}`)
    return 2
  }

  if (docs.length === 0) {
    // A gate that checks nothing must say so rather than exit 0. An empty
    // population is the shape every vacuous check in this repository took.
    console.error('check-citations: no live reference documents found — refusing to pass on an empty set')
    return 2
  }

  const gaps = []
  let checked = 0
  let crossRepo = 0

  for (const doc of docs) {
    const lines = liveLines(doc, readFileSync(join(ROOT, doc), 'utf8').split('\n'))

    lines.forEach((line, i) => {
      for (const [, path, startRaw, endRaw] of line.matchAll(CITATION)) {
        const at = `${doc}:${i + 1}`

        if (CROSS_REPO.some((re) => re.test(path))) {
          crossRepo += 1
          continue
        }

        // Resolve: as given, then by basename against the tracked file list.
        let target = null
        let resolvedAs = path
        if (existsSync(join(ROOT, path))) {
          target = join(ROOT, path)
        } else {
          const matches = byBasename.get(basename(path)) ?? []
          if (matches.length === 1) {
            target = join(ROOT, matches[0])
            resolvedAs = matches[0]
          } else if (matches.length > 1) {
            gaps.push(`${at} cites ${path}, which is ambiguous — ${matches.length} tracked files share that name: ${matches.join(', ')}`)
            continue
          }
        }

        if (!target) {
          // NOT a silent skip. This is the branch RULES.md:308 arrived through.
          gaps.push(`${at} cites ${path}, which is not a file in this repository (and matches no cross-repository pattern)`)
          continue
        }

        checked += 1
        const count = lineCount(target)
        const highest = Number(endRaw ?? startRaw)
        if (highest > count) {
          const cited = `${path}:${startRaw}${endRaw ? `-${endRaw}` : ''}`
          const via = resolvedAs === path ? '' : ` (resolved to ${resolvedAs})`
          gaps.push(`${at} cites ${cited}${via}, but that file has ${count} lines`)
        }
      }
    })
  }

  if (gaps.length) {
    console.error(`check-citations: ${gaps.length} citation(s) do not resolve\n`)
    for (const gap of gaps) console.error(`  ${gap}`)
    console.error(`\n  ${checked} in-repo citations checked across ${docs.length} live reference documents.`)
    return 1
  }

  console.log(
    `check-citations: ${checked}/${checked} in-repo citations resolve across ` +
      `${docs.length} live reference documents (${crossRepo} cross-repository, declined by pattern).`,
  )
  return 0
}

process.exit(main())
