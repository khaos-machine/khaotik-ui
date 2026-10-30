import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PROVIDER_MARKS, markFor } from '../../../components/svelte/lib/provider-marks.js'
import providerStatus from './data/provider-status.json'
import voicesRaw from './data/voices.json'

const ASSETS = join(import.meta.dirname, '../../..', 'assets/providers')

// WHY THIS FILE EXISTS: a provider mark keyed on a spelling nothing uses is not
// an error. `markFor` is an exact lookup after lowercasing, so the key is never
// asked for and the caller falls back to the same placeholder a provider with
// genuinely no artwork gets. Artwork degrading silently to "no artwork" is
// invisible to every build.
//
// WHAT THIS FILE GOT WRONG, TWICE, and why the shape below changed:
//
// The captures carry FOUR columns of provider spelling between them, and each
// pass read one. #157 fixed `provider-status[].id` against `voices[].provider`.
// The next pass added the analysis ids. Neither read `voices[].providerId` --
// the NEXT COLUMN of a file this test already imports -- where `aws-polly`,
// `gcp-tts` and `gemini-tts` were drawing placeholders against artwork the kit
// ships. An assertion in this file recorded the first of them as INTENTIONALLY
// unmatched.
//
// So the old assertions were a PIN, not a property: they hardcoded the two ids
// already known to be broken, and ran only keys -> vocabulary. The reverse is
// the entire defect class -- a spelling khaosd serves, for which artwork
// exists, resolving to nothing -- and nothing here tested it. The mirror
// property below does, derived from the CAPTURE rather than from the alias
// table, so it fails on the next one instead of on the last one.
//
// Found by khaos-app's reviewer reading the #157 commit from the consumer seat.

const engineIds = providerStatus.map((p) => p.id)
const voices = Array.isArray(voicesRaw) ? voicesRaw : Object.values(voicesRaw).find(Array.isArray)

// Every (display name, voice id) pair the capture carries. THE CAPTURE asserts
// these two spellings are one provider -- not this file, and not the alias
// table under test. Deriving the equivalence from the table would make the
// mirror assertion test only that the table agrees with itself.
const spellingPairs = [
  ...new Map(
    voices
      .filter((v) => v?.provider && v?.providerId)
      .map((v) => [v.providerId, [v.provider, v.providerId]]),
  ).values(),
]

const displayNames = [...new Set(voices.map((v) => v?.provider).filter(Boolean))]
const voiceIds = [...new Set(voices.map((v) => v?.providerId).filter(Boolean))]

// The one transcribed thing in a file whose header argues against
// transcription. khaos-tools stamps `data.provider` on a prompt trace, and no
// prompt trace exists on any machine available to this project, so there is
// nothing to capture. Only the two the kit has artwork for are listed, because
// those are the only ones an assertion can be about.
// KILLED BY: a capture containing a real prompt trace.
const ANALYSIS_IDS_WITH_ARTWORK = { 'openai-codex': 'openai', 'claude-ai': 'anthropic' }

describe('every provider mark is reachable from every spelling khaosd serves', () => {
  it('has both captures, with all their columns, to measure against', () => {
    // A capture that arrived empty makes every assertion below vacuously true.
    // `voiceIds` is checked explicitly because that column EXISTING is the thing
    // two earlier passes failed to notice.
    expect(engineIds.length).toBeGreaterThan(20)
    expect(displayNames.length).toBeGreaterThan(5)
    expect(voiceIds.length).toBeGreaterThan(5)
    expect(spellingPairs.length).toBeGreaterThan(5)
    expect(engineIds).toContain('polly')
    expect(displayNames).toContain('AWS Polly')
    expect(voiceIds).toContain('aws-polly')
  })

  // THE MIRROR PROPERTY -- the assertion this file was missing.
  //
  // For every provider the capture spells two ways, the spellings must AGREE
  // about whether artwork exists. One resolving while the other does not IS the
  // defect class in general form. It is a property rather than a pin, so a
  // sixteenth provider entering the capture with a mark under one spelling reds
  // this with nobody editing the test.
  it('agrees across every spelling of the same provider', () => {
    for (const [display, id] of spellingPairs) {
      const byDisplay = markFor(display)
      const byId = markFor(id)
      if (!byDisplay && !byId) continue // no artwork for this provider at all

      expect(
        byDisplay,
        `"${id}" resolves to a mark but "${display}" does not -- one provider, ` +
          `one spelling drawing the placeholder.`,
      ).toBeDefined()
      expect(
        byId,
        `"${display}" resolves to a mark but "${id}" does not. A host passing ` +
          `providerId -- which the voice catalog publishes as part of the Voice shape ` +
          `-- renders the placeholder as though the kit shipped nothing.`,
      ).toBeDefined()
      expect(byDisplay, `"${display}" and "${id}" resolve to DIFFERENT artwork`).toEqual(byId)
    }
  })

  it('answers to a spelling one of the vocabularies actually uses', () => {
    const spoken = new Set(
      [...engineIds, ...displayNames, ...voiceIds, ...Object.keys(ANALYSIS_IDS_WITH_ARTWORK)].map(
        (s) => s.toLowerCase(),
      ),
    )
    for (const key of Object.keys(PROVIDER_MARKS)) {
      expect(
        spoken.has(key),
        `"${key}" is a key nothing spells, in any column of either capture. It ` +
          `will never be looked up, and the caller renders the placeholder as ` +
          `though the kit shipped no artwork at all.`,
      ).toBe(true)
    }
  })

  it('resolves the analysis ids that are the same brand under a different id', () => {
    // No capture pairs these, so the mirror property cannot reach them until a
    // prompt trace is captured. Explicit until then.
    for (const [id, parent] of Object.entries(ANALYSIS_IDS_WITH_ARTWORK)) {
      expect(markFor(id), `${id} draws the placeholder while ${parent} has artwork`).toBeDefined()
      expect(markFor(id)).toEqual(markFor(parent))
    }
  })

  it('does not invent artwork for providers the kit has none for', () => {
    // The counterweight. `mock` is reachable on a real ledger via
    // `--provider mock` and is a legitimate placeholder, not a gap; an alias
    // added to shorten this list would be the fabrication the generator's
    // header warns against.
    for (const id of ['ollama', 'mistral', 'groq', 'lmstudio', 'mock', 'bark', 'kokoro']) {
      expect(markFor(id), `${id} resolved to a mark the kit should not have`).toBeUndefined()
    }
  })

  it('draws DeepSeek under every spelling khaosd serves it by', () => {
    // `deepseek` is the engine id (provider-status.json) and the analysis id
    // (khaos-tools `ProviderDeepseek`); `DeepSeek` is the catalog title and model
    // publisher. No voice rows carry it. One key covers all of them.
    expect(engineIds).toContain('deepseek')
    expect(markFor('deepseek'), 'deepseek draws the placeholder').toBeDefined()
    expect(markFor('DeepSeek')).toEqual(markFor('deepseek'))
  })

  it('matches case-insensitively, which is the only normalisation it promises', () => {
    expect(markFor('OpenAI')).toEqual(markFor('openai'))
    expect(markFor('ELEVENLABS')).toEqual(markFor('elevenlabs'))
    // No trimming, no punctuation stripping, no fuzzy matching.
    //
    // `aws-polly` used to be the example here, asserted undefined. It is a real
    // `providerId` in the capture imported above, so that assertion PINNED A
    // LIVE DEFECT AS INTENTIONAL. The example is now a string no column holds.
    expect(markFor('amazon polly')).toBeUndefined()
    expect(markFor(undefined)).toBeUndefined()
    expect(markFor('')).toBeUndefined()
  })

  it('ships one entry per artwork file, and no file it cannot reach', () => {
    const files = readdirSync(ASSETS)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => f.replace(/\.svg$/, ''))
    for (const f of files) {
      expect(PROVIDER_MARKS[f], `${f}.svg has no entry -- regenerate the module`).toBeDefined()
      expect(f, `${f}.svg has a capital; markFor lowercases, so it is unreachable`).toBe(
        f.toLowerCase(),
      )
    }
  })

  it('carries no generator bookkeeping into the shipped module', () => {
    expect(JSON.stringify(PROVIDER_MARKS)).not.toContain('__from')
  })

  it('draws every mark from its own artwork, with no geometry shared between two brands', () => {
    // Checked at the ARTWORK rather than in the table, because aliases make
    // several keys legitimately carry identical path data. Catches a bad copy or
    // a botched flatten -- two providers with the same geometry renders as the
    // WRONG brand rather than as an error.
    const files = readdirSync(ASSETS).filter((n) => n.endsWith('.svg'))
    const byPath = new Map()
    for (const f of files) {
      const d = readFileSync(join(ASSETS, f), 'utf8').match(/<path[^>]*\sd="([^"]+)"/)?.[1]
      expect(d, `${f} has no <path d="...">`).toBeDefined()
      expect(byPath.get(d), `${f} and ${byPath.get(d)} are the same shape`).toBeUndefined()
      byPath.set(d, f)
    }
    // NO `expect(byPath.size).toBe(files.length)` here. It stood in an earlier
    // version and CANNOT FAIL: if every insert above found no prior entry, the
    // map's size is the file count by construction. It is the same redundancy
    // khaos-app's reviewer found twice in this file, which is why it is named
    // rather than quietly deleted -- the shape recurs, and an assertion that
    // restates its own loop reads like extra rigour.
    expect(files.length, 'no artwork files found at all').toBeGreaterThan(0)
  })

  it('gives every entry a well-formed viewBox and real path data', () => {
    for (const [key, m] of Object.entries(PROVIDER_MARKS)) {
      expect(m.viewBox, `${key} has no viewBox`).toMatch(/^[-\d.]+( [-\d.]+){3}$/)
      expect(m.d.length, `${key} has suspiciously little path data`).toBeGreaterThan(20)
    }
  })
})
