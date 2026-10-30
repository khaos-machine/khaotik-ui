#!/usr/bin/env node
// Regenerates components/svelte/lib/provider-marks.js from assets/providers/*.svg.
// The SVG files are the source of record; the module is derived so path data
// cannot drift from the artwork by hand-copying.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, basename, extname } from 'node:path'

// FOUR vocabularies reach this table, all khaosd's, and the count went 2 -> 3
// -> 4 across one day because each sweep stopped at the column in front of it.
//
//   engine id      `provider-status.json[].id` — `EngineDetails`' `routes[].provider`.
//   display name   `voices.json[].provider` — what `ProviderBadge` is passed.
//   VOICE ID       `voices.json[].providerId` — the same rows, the NEXT COLUMN.
//                  Published as part of the `Voice` shape a host supplies, so a
//                  host may reasonably pass it.
//   analysis id    what khaos-tools stamps on a prompt trace.
//
// THE VOICE ID COLUMN WAS MISSED TWICE, in the file the fix was built on and
// the file the test imports. `aws-polly`, `gcp-tts` and `gemini-tts` drew the
// placeholder while this kit shipped their exact artwork, and a test assertion
// recorded the first of them as INTENTIONALLY unmatched. Found by khaos-app's
// reviewer reading the #157 commit from the consumer seat.
//
// `gcp-tts` also refutes a claim that stood here, in the test, and in a shipped
// CHANGELOG: that khaosd serves no `google` provider at any spelling. It serves
// one. The assertion encoding that claim passed because it filtered for the
// substring `google`, which `gcp-tts` does not contain — true in its mechanics,
// wrong in its reasoning. `gcp-tts.svg` is now the canonical file.
//
// THE RULE, unchanged and now applied to every column rather than one per
// capture: a key here is a spelling MEASURED in khaosd's own responses.
//
// Lowercase only. `markFor` lowercases its argument, so a key with any capital
// is unreachable through EVERY spelling; refused below rather than emitted at
// exit 0.
const ALIASES = {
  polly: ['aws polly', 'aws-polly'],
  gemini: ['gemini tts', 'gemini-tts'],
  'gcp-tts': ['google cloud tts'],
  openai: ['openai-codex'],
  anthropic: ['claude-ai'],
}

// Aliases are looked up lowercased too, so a capital in one is the same silent
// hazard as a capital in a filename.
for (const [k, list] of Object.entries(ALIASES)) {
  for (const a of [k, ...list]) {
    if (a !== a.toLowerCase()) {
      console.error(`build-provider-marks: ALIASES entry "${a}" has a capital; markFor() lowercases, so it is unreachable.`)
      process.exit(2)
    }
  }
}

const DIR = 'assets/providers'
const marks = {}
for (const f of readdirSync(DIR).filter((n) => n.endsWith('.svg')).sort()) {
  const t = readFileSync(join(DIR, f), 'utf8')
  const viewBox = t.match(/viewBox="([^"]+)"/)?.[1]
  const d = t.match(/<path[^>]*\sd="([^"]+)"/)?.[1]
  if (!viewBox || !d) {
    console.error(`build-provider-marks: ${f} has no single <path> with a viewBox — inline it by hand or simplify the artwork.`)
    process.exit(2)
  }
  // REFUSE a file the single-path model cannot represent, rather than taking the
  // first <path> and shipping the rest of the glyph as nothing.
  //
  // It did exactly that until 2026-09-23. Probed with a deliberate rect + path +
  // circle: it emitted one mark, exited 0, and dropped two thirds of the shape.
  // Google's Text-to-Speech icon is a rect, two polygons and a path, so the real
  // consequence was a mark rendering as a fragment while every gate stayed
  // green — the same class as an instrument reporting success over the wrong
  // artifact, which this repository has now hit repeatedly.
  //
  // Flattening to one path is a legitimate answer and is how the shipped Google
  // and ElevenLabs marks were made, but it is a DECISION, not something a build
  // script should make silently on someone's behalf.
  const shapes = [...t.matchAll(/<(path|rect|circle|ellipse|polygon|polyline|line)\b/g)].map((m) => m[1])
  const extra = shapes.filter((x) => x !== 'path')
  if (shapes.filter((x) => x === 'path').length > 1 || extra.length) {
    console.error(`build-provider-marks: ${f} holds ${shapes.length} shapes (${[...new Set(shapes)].join(', ')}).`)
    console.error(`  This model ships ONE <path>. Flatten the artwork to a single path — the`)
    console.error(`  shipped Google and ElevenLabs marks were flattened losslessly — or leave the`)
    console.error(`  provider without a mark, which renders the neutral placeholder rather than a`)
    console.error(`  fragment of its logo.`)
    process.exit(2)
  }

  const fillRule = t.match(/<path[^>]*fill-rule="([^"]+)"/)?.[1]
  const key = basename(f, extname(f))
  // A capital here is fatal and used to be silent: `markFor` lowercases its
  // argument, so `Gemini.svg` emits a `Gemini` key that NO spelling can reach.
  // Probed: the mark vanished from every lookup and the generator exited 0,
  // reporting one fewer mark as though that were the artwork's fault.
  if (key !== key.toLowerCase()) {
    console.error(`build-provider-marks: ${f} has a capital in its name.`)
    console.error(`  markFor() lowercases its argument, so this key is unreachable through`)
    console.error(`  EVERY spelling. Rename the file to "${key.toLowerCase()}${extname(f)}".`)
    process.exit(2)
  }
  const mark = fillRule ? { viewBox, d, fillRule } : { viewBox, d }
  for (const k of [key, ...(ALIASES[key] ?? [])]) {
    // A collision means two marks claim one spelling and the later sort order
    // would silently win. Refuse rather than pick.
    if (k in marks) {
      console.error(`build-provider-marks: "${k}" is claimed twice — by ${marks[k].__from} and by ${f}.`)
      process.exit(2)
    }
    marks[k] = { ...mark, __from: f }
  }
}
// An ALIASES key naming no file is an alias that does nothing, announced as
// success — the #157 failure mode inside the fix for #157. Probed: adding
// `'amazon-polly': ['polly v2']` with no such file exited 0 and inflated the
// headline count by one.
const orphans = Object.keys(ALIASES).filter((k) => !(k in marks))
if (orphans.length) {
  console.error(`build-provider-marks: ALIASES names ${orphans.length} key(s) with no artwork file:`)
  for (const o of orphans) console.error(`  "${o}" - expected assets/providers/${o}.svg`)
  console.error(`  An alias on a key that does not exist is silently ignored at runtime.`)
  process.exit(2)
}

for (const m of Object.values(marks)) delete m.__from

const target = 'components/svelte/lib/provider-marks.js'
const existing = readFileSync(target, 'utf8')
const header = existing.slice(0, existing.indexOf('export const PROVIDER_MARKS'))
writeFileSync(target, header + 'export const PROVIDER_MARKS = ' + JSON.stringify(marks, null, 2) + '\n\n' + existing.slice(existing.indexOf('/** The mark for a provider')))
const files = Object.keys(marks).length - Object.values(ALIASES).flat().length
console.log(`build-provider-marks: ${files} marks under ${Object.keys(marks).length} spellings -> ${target}`)
