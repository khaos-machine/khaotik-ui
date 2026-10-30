#!/usr/bin/env node
// check-export-count — a document that states how many components the library
// exports must state the number the library actually exports.
//
// WHY THIS EXISTS. `README.md` said **48 exports** in two places while
// `components/svelte/index.js` carried 52, and had done for long enough that
// nobody could say when it drifted. `AGENTS.md` and `docs/using-the-library.md`
// said 52. Three live documents, two answers, no gate reading any of them.
//
// THE CLASS, which is why this is a gate and not a one-line edit. A prose count
// is wrong the next time anything runs, and it reads exactly as authoritative
// when wrong as when right. This repository lost real time to that shape three
// times in a single day, each found by a consumer rather than by a check:
//
//   `routes[].icon`     said the kit carries no provider-to-glyph table, in the
//                       package that ships one. khaos-app briefed a builder off
//                       it and nearly built the table the prop exists to
//                       prevent.
//   `docs/decisions.md` D60 said `/api/story/graph` has no component while
//                       `StoryGraph` was exported. khaos-app filed an issue
//                       AGAINST THEMSELVES on the strength of it.
//   CHANGELOG           said khaosd serves no `google` provider at any
//                       spelling. It serves `gcp-tts`.
//
// The repository already holds the rule that prevents it — `CURRENT.md`: *"No
// counts and no run tallies. A number written here is wrong the next time
// anything runs. Record the command that answers it."* The rule was stated and
// then not enforced, which is the same as not having it. Closes #128.
//
// WHAT IT CANNOT DO, so nobody reads a green as more than it is:
//   - It matches `N exports` only. A document phrasing the same fact as
//     "52 components" or "every component in the barrel" is not read — see the
//     note at CLAIM for why that narrowing was deliberate.
//   - Scope is root `*.md` plus `docs/*.md`, minus the historical records
//     (`CHANGELOG.md`, `docs/decisions.md`) — see the note at HISTORICAL.
//   - It checks the NUMBER, never the claim around it. "52 exports, all of them
//     charts" passes.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const INDEX = 'components/svelte/index.js'
const actual = (readFileSync(INDEX, 'utf8').match(/^export /gm) ?? []).length

// A zero here would make every assertion below vacuously true — the failure
// mode this repository keeps hitting, where an instrument reports clean by
// examining nothing.
if (actual === 0) {
  console.error(`check-export-count: read 0 exports from ${INDEX}. Refusing to compare against nothing.`)
  process.exit(2)
}

// HISTORICAL RECORDS ARE EXCLUDED, and the list is two rather than one because
// the second was found by this gate failing on its own release notes.
//
// `docs/decisions.md` records decisions as taken: D61's "46 exports" was true in
// August, and the register is annotated rather than edited when a row is
// overtaken (see D60's OVERTAKEN clause).
//
// `CHANGELOG.md` is the same shape and more so — EVERY entry is a statement
// about what was true at a version. An entry describing this very drift ("README
// claimed 48 exports against a barrel of 52") is an accurate account of a past
// state, and rewriting it to satisfy a gate would falsify the record the gate
// exists to protect.
//
// That is the second false-positive class this gate has had, both found by
// running it rather than by reasoning about it: the first was the noun
// `components`, the second is the tense. A gate that fires on true statements
// gets switched off, so each narrowing is recorded here with its reason rather
// than quietly applied.
const HISTORICAL = new Set(['CHANGELOG.md', join('docs', 'decisions.md')])

const docs = [
  ...readdirSync('.').filter((f) => f.endsWith('.md')),
  ...readdirSync('docs').filter((f) => f.endsWith('.md')).map((f) => join('docs', f)),
].filter((f) => !HISTORICAL.has(f))

// `48 exports`, `all 52 exports`, `**52** exported components`.
//
// THE NOUN IS `exports`, DELIBERATELY, AND `components` IS NOT MATCHED. The
// first version of this gate accepted both and was wrong on half its hits: it
// flagged "65 rules across 29 components now use `--text-secondary`" in the
// CHANGELOG and the same sentence in the harvest doc. Both are accurate counts
// of components affected by one past change, and neither is a claim about the
// barrel at all.
//
// That matters more than the coverage it costs. A gate with a 50% false rate
// gets ignored, or gets its scope quietly narrowed by whoever it next
// inconveniences — and `components` is a noun this repository uses for subsets
// constantly. `exports` names the barrel and nothing else. A document phrasing
// the total as "52 components" is missed, and that is the trade.
const CLAIM = /(\d{1,3})\*{0,2}\s+(?:exported\s+)?exports?\b/gi
const NOUN_OK = /\bexport/i

let checked = 0
const gaps = []

for (const doc of docs) {
  const text = readFileSync(doc, 'utf8')
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(CLAIM)) {
      if (!NOUN_OK.test(m[0])) continue
      const claimed = Number(m[1])
      // Small numbers next to these nouns are prose, not inventories —
      // "two components", "3 exports from this file". The library has never had
      // fewer than ten.
      if (claimed < 10) continue
      checked += 1
      if (claimed !== actual) {
        gaps.push(`  ${doc}:${i + 1} claims ${claimed}, ${INDEX} exports ${actual} — "${m[0].trim()}"`)
      }
    }
  })
}

if (gaps.length) {
  console.error(`check-export-count: ${gaps.length} stale count(s)`)
  console.error()
  for (const g of gaps) console.error(g)
  console.error()
  console.error(`  Prefer deleting the number over correcting it. CURRENT.md: "No counts`)
  console.error(`  and no run tallies. Record the command that answers it."`)
  console.error(`    grep -c '^export' ${INDEX}`)
  process.exit(1)
}

console.log(
  `check-export-count: ${checked} count claim(s) across ${docs.length} live reference documents all read ${actual}.`,
)
