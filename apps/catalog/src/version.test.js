import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { APP_VERSION } from './fixtures.js'

// The catalog's version lives in three places and nothing enforced their
// agreement — `apps/catalog/AGENTS.md` said "keep it in sync ... on release",
// which is an instruction to a human, not a gate.
//
// The sidebar brand and the About panel read APP_VERSION, while the updater
// compares `tauri.conf.json`'s version against the feed. Bump the config and
// forget the constant and the app misreports itself: it says 0.10.0 in the
// window while the updater considers 0.11.0 installed, so it offers no update
// and the user has no way to tell which build they are running.
//
// Nothing here is rendered — this is a source read of the four files, because
// three of them are not JavaScript the suite would otherwise touch.
//
// Cargo.lock was added after the fact: it was checked in pinning `app` at
// 0.8.0 while the app shipped 0.12.4, five releases of drift that nothing
// noticed because `cargo build` simply rewrites the entry and carries on. The
// cost is not a broken build — it is that the committed lockfile stops being a
// record of what was built, so a release cannot be reproduced from the tag.

const TAURI = join(import.meta.dirname, '../src-tauri')

const SEMVER = /^\d+\.\d+\.\d+$/

const tauriConf = JSON.parse(readFileSync(join(TAURI, 'tauri.conf.json'), 'utf8'))

// The [package] version — the first `version = "…"` in the file. Dependency
// versions further down must not be mistaken for it.
const cargoVersion = readFileSync(join(TAURI, 'Cargo.toml'), 'utf8')
  .split(/^\[/m)[1]                      // the [package] table
  .match(/^version\s*=\s*"([^"]+)"/m)?.[1]

// The `app` package's own entry in the lockfile — matched on the [[package]]
// block whose name is `app`, so a dependency that happens to share a version
// string cannot satisfy this by accident.
const lockVersion = readFileSync(join(TAURI, 'Cargo.lock'), 'utf8')
  .match(/^name = "app"\nversion = "([^"]+)"/m)?.[1]

describe('the catalog version agrees across its four sources', () => {
  it('is a bare semver in fixtures.js', () => {
    expect(APP_VERSION).toMatch(SEMVER)
  })

  it('matches tauri.conf.json — what the updater compares against', () => {
    expect(tauriConf.version).toBe(APP_VERSION)
  })

  it('matches Cargo.toml — what the bundled binary carries', () => {
    expect(cargoVersion).toBe(APP_VERSION)
  })

  it('matches Cargo.lock — what makes the build reproducible from the tag', () => {
    expect(lockVersion).toBe(APP_VERSION)
  })
})
