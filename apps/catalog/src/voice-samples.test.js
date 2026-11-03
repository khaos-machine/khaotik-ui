import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import voices from './data/voices.json'

// Every catalog voice auditions a clip this repo hosts in public/samples/
// (fetch-voices.sh assigns them). A sample pointing anywhere else, or at a file
// that is not committed, is a silent audition button on the catalog. The path
// is relative, so it resolves under whatever base path the build is served
// from; a root-absolute /samples/ 404s under GitHub Pages' /khaotik-ui/.
const PUBLIC = join(import.meta.dirname, '..', 'public')

describe('catalog voice samples', () => {
  it('has voices to check', () => {
    expect(voices.length).toBeGreaterThan(0)
  })

  it('points every voice at a committed clip under samples/, relative to the base', () => {
    const broken = voices
      .filter((v) => !/^samples\/[a-z0-9-]+\.m4a$/.test(v.sampleURL ?? '') || !existsSync(join(PUBLIC, v.sampleURL)))
      .map((v) => `${v.name}: ${JSON.stringify(v.sampleURL)}`)
    expect(broken).toEqual([])
  })
})
