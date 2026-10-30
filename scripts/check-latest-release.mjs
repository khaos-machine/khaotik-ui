#!/usr/bin/env node
//
// Latest-pointer gate — `releases/latest` must be an installable catalog build.
//
// GitHub resolves `latest` REPO-WIDE by publish time, and this repository ships
// two tag families: `v*` is the signed, notarized catalog DMG, `lib-*` is a
// library marker carrying no assets at all. So publishing a `lib-*` release
// without `--latest=false` silently moves the pointer off the catalog — and
// `releases/latest` is the link AGENTS.md hands a person who wants the app.
//
// This has fired SIX times. `lib-0.11.0` through `lib-0.15.0` each held the
// pointer until the next `v*` tag took it back, and `lib-0.20.0` held it from
// 2026-09-21 until it was found by hand on 2026-09-22 and restored to v0.17.0.
// (The first five are inherited from the written record and are NOT
// independently verifiable — the API exposes only the current `isLatest`, never
// its history. The sixth was measured directly.)
//
// `scripts/release-lib.sh` already guards the library release path. It cannot
// guard the REACHABLE path: a `gh release create` typed by hand takes the
// pointer exactly as before, and no script it declined to run can stop it.
// That is why this is a gate rather than another line in a script — it watches
// the ARTIFACT, so it does not care how the artifact got that way.
//
// Wired to `release: published`, so a hand-typed release is caught within
// seconds of publishing, and to a daily cron as the backstop for anything that
// changes the pointer without publishing (a `gh release edit --latest`, a
// deletion that promotes the next release down the list).
//
// Exit 0 = `latest` is a catalog release with assets.
// Exit 1 = `latest` is wrong, and the message says how to restore it.
// Exit 2 = the check could not run (a missing input is never a pass).

import { execFileSync } from 'node:child_process'

const REPO = 'khaos-machine/khaotik-ui'
const CATALOG_TAG = /^v\d+\.\d+\.\d+$/

function gh(...args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

let latest
try {
  latest = JSON.parse(gh('api', `repos/${REPO}/releases/latest`))
} catch (err) {
  // Exit 2, never 0. A failed read and a healthy repo are not the same thing,
  // and collapsing them is how a check reports clean having looked at nothing.
  console.error('check-latest-release: CANNOT RUN — could not read releases/latest')
  console.error(String(err.stderr || err.message).trim().split('\n').slice(0, 3).join('\n'))
  process.exit(2)
}

const tag = latest?.tag_name
const assets = latest?.assets?.length ?? 0

if (typeof tag !== 'string' || tag === '') {
  console.error('check-latest-release: CANNOT RUN — releases/latest returned no tag_name')
  process.exit(2)
}

const problems = []
if (!CATALOG_TAG.test(tag)) {
  problems.push(
    `'latest' is ${tag}, which is not a catalog release.\n` +
    `      Only a v* tag may hold it; lib-* is a library marker and is never valid at any age.\n` +
    `      Restore it with:  gh release edit <newest v* tag> --latest\n` +
    `      Then clear the wrong one:  gh release edit ${tag} --latest=false`
  )
}
if (assets === 0) {
  problems.push(
    `'latest' (${tag}) carries no assets, so anyone following the download link gets nothing installable.`
  )
}

if (problems.length > 0) {
  console.error('check-latest-release: FAIL')
  for (const p of problems) console.error(`  · ${p}`)
  process.exit(1)
}

console.log(`check-latest-release: 'latest' is ${tag} with ${assets} asset(s) — a catalog build.`)
