#!/usr/bin/env node
//
// Consumer smoke gate — play the consumer, because nothing else here does.
//
// This repo tests the library from inside itself: vitest imports components
// through a workspace symlink, the catalog is JavaScript and never type-checks
// its own usage, and `check-types` compares the declarations against the
// components — so when both agree on a wrong answer, both are green. Every
// defect below reached a published release for the same reason: the artifact a
// consumer receives was never once loaded the way a consumer loads it.
//
//   · 67 props shipped marked REQUIRED that were optional in fact (#31). A
//     consumer got errors for rendering components exactly as intended. Nothing
//     here could see it — the components behave identically either way.
//   · `lib/icon-inventory.js` evaluates `import.meta.glob`, which only Vite
//     rewrites. esbuild and webpack pass it through with no warning, so the
//     build is green and the page throws in the browser.
//   · Four signed releases described themselves as "A Tauri App".
//
// What makes the second one nastier than it looks, and why check 2 exists:
// `tokens/parse.js` is Vite-only too, but it fails on an unresolvable
// SPECIFIER (`./tokens.css?raw`), so every bundler errors loudly at build time
// pointing at the file. `import.meta.glob` is syntactically valid JavaScript.
// A Vite-only module is acceptable when it breaks loudly; it is a landmine when
// it compiles clean and throws later.
//
// Exit 0 = a consumer can load and type-check what we publish.
// Exit 1 = at least one check failed.
// Exit 2 = the check could not run (a missing input is never a pass).

import { readdirSync, readFileSync, existsSync, writeFileSync, rmSync, mkdtempSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PKG = '@khaos-machine/khaotik-ui'

const problems = []
const notes = []
const fail = (m) => problems.push(m)

function cannotRun(message) {
  console.error(`CANNOT RUN: ${message}`)
  process.exit(2)
}

// ---------------------------------------------------------------- inputs

const pkgPath = join(ROOT, 'package.json')
if (!existsSync(pkgPath)) cannotRun(`no ${pkgPath}`)
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
if (!pkg.exports) cannotRun('package.json declares no "exports" — there is no consumer surface to check')

// The self-symlink (node_modules/@khaos-machine/khaotik-ui -> ../..) is what lets this
// script resolve the package by its published specifier rather than by a
// relative path. Without it every import below would silently test nothing.
if (!existsSync(join(ROOT, 'node_modules', PKG))) {
  cannotRun(`${PKG} does not resolve from node_modules — run npm install`)
}

const barrelPath = join(ROOT, 'components/svelte/index.js')
if (!existsSync(barrelPath)) cannotRun(`no ${barrelPath}`)

const exported = [
  ...readFileSync(barrelPath, 'utf8').matchAll(/export \{ default as ([A-Za-z0-9_]+) \}/g),
].map((m) => m[1])
if (!exported.length) cannotRun('parsed zero exports from the barrel — its shape may have changed')

// Shipped JavaScript a consumer can deep-import. `.svelte` and `.svelte.js` are
// excluded on purpose: both require the Svelte compiler by definition, so
// failing to evaluate them in plain node says nothing about a real consumer.
const shippedJs = [
  ...readdirSync(join(ROOT, 'components/svelte/lib'))
    .filter((f) => f.endsWith('.js') && !f.endsWith('.svelte.js'))
    .map((f) => `components/svelte/lib/${f}`),
  ...readdirSync(join(ROOT, 'tokens'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => `tokens/${f}`),
]
if (!shippedJs.length) cannotRun('found zero shipped JS modules — the layout may have changed')

// Modules that legitimately require a Vite transform. Each must FAIL LOUDLY
// outside Vite — an unresolvable specifier — never evaluate-then-throw. Listing
// one here asserts that; check 1 fails if it stops being true.
const VITE_ONLY = {
  'tokens/parse.js':
    'imports ./tokens.css?raw and ./utilities.css?raw — unresolvable specifiers outside Vite, so every bundler errors at build time pointing at this file',
}

// ------------------------------------------------- 1. plain-node evaluation

for (const rel of shippedJs) {
  const spec = `${PKG}/${rel}`
  const allowed = VITE_ONLY[rel]
  let outcome
  try {
    await import(spec)
    outcome = { kind: 'ok' }
  } catch (err) {
    // Loud vs silent is the whole distinction, and it is about the SPECIFIER,
    // not the error's severity. These three all mean a loader refused the
    // import by name — node says which file and stops, and so does every
    // bundler. A module that gets past resolution and then throws is the
    // dangerous kind, because a bundler has already emitted it by then.
    const LOUD = new Set([
      'ERR_MODULE_NOT_FOUND',
      'ERR_UNSUPPORTED_DIR_IMPORT',
      'ERR_UNKNOWN_FILE_EXTENSION',
    ])
    outcome = { kind: LOUD.has(err.code) ? 'unresolvable' : 'throws', err }
  }

  if (outcome.kind === 'throws') {
    fail(
      `${rel} throws when evaluated outside Vite: ${outcome.err.constructor.name}: ${outcome.err.message.split('\n')[0]}\n` +
        `      This is the silent class — non-Vite bundlers compile it with no warning and it throws in the consumer's browser.`,
    )
  } else if (outcome.kind === 'unresolvable' && !allowed) {
    fail(
      `${rel} cannot be resolved outside Vite and is not declared in VITE_ONLY.\n` +
        `      If that is intended, add it there with the reason; otherwise it is broken for consumers.`,
    )
  } else if (outcome.kind === 'ok' && allowed) {
    fail(`${rel} is listed in VITE_ONLY but evaluates fine — the entry is stale, remove it.`)
  }
}

// --------------------------------------- 2. bundler-invisible Vite syntax

// Banned outright rather than allowlisted. `?raw` is a specifier and fails
// loudly; `import.meta.glob` is valid JS that non-Vite bundlers pass straight
// through, so it cannot be made safe by declaring it.
for (const rel of shippedJs) {
  const source = readFileSync(join(ROOT, rel), 'utf8')
  if (/import\.meta\.glob\b/.test(source)) {
    fail(
      `${rel} uses import.meta.glob, which only Vite rewrites.\n` +
        `      esbuild/webpack/rollup emit it verbatim with no warning, so the consumer's build is green and the module throws at runtime.`,
    )
  }
}

// -------------------------------------------- 3. consumer-side type-check

// Generated from the barrel rather than listed, so a component added tomorrow
// is covered without anyone remembering. Every export is instantiated with no
// props: in Svelte an absent prop is `undefined`, so a declaration that marks
// one required is claiming something the runtime does not enforce (#31).
const consumerDir = join(ROOT, 'scripts/consumer')
if (!existsSync(join(consumerDir, 'tsconfig.json'))) cannotRun(`no ${consumerDir}/tsconfig.json`)

// BOTH IMPORT FORMS, because they fail differently.
//
// This probed only `import * as kit` until #44. A namespace import reaches every
// name through a property access, and a name the barrel fails to export
// degrades quietly rather than erroring — so the gate could report a healthy
// consumer surface while `import { LabeledField } from …` was the form every
// real consumer actually writes. #44 was filed as 25 of 46 exports not
// resolving, and nothing here could confirm or refute it.
//
// (#44's cause turned out to be a consumer-side `declare module` shadowing the
// real declarations, not the barrel — but the gate should have been able to say
// so, and could not.)
const probe = [
  '// GENERATED by scripts/check-consumer.mjs — do not edit, do not commit.',
  `import * as kit from '${PKG}/components/svelte'`,
  `import { ${exported.join(', ')} } from '${PKG}/components/svelte'`,
  "import type { ComponentProps } from 'svelte'",
  '',
  // The named bindings have to be USED or `verbatimModuleSyntax`-style elision
  // could drop them before they are ever resolved.
  `export const _named = [${exported.join(', ')}]`,
  '',
  ...exported.map(
    (name, i) => `export const _${i}: ComponentProps<typeof kit.${name}> = {} // ${name}`,
  ),
  '',
  // `_Exact` is mutual assignability. `[A] extends [B]` is tupled to stop the
  // conditional distributing over a union, which would make it answer
  // per-member and pass for any subset.
  'type _Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false',
  "type _Project = NonNullable<ComponentProps<typeof kit.ProjectCard>['project']>",
  '',
  // W-11. `package_stage` is `string`, and this pins that deliberately so the
  // next person to "tighten" it meets the reason first.
  //
  // `package_stage` names the set
  // THIS BUILD knows: a future member arrives unfiltered because
  // `StageForPackage` returns `record.PackageStage` straight from decoded JSON
  // with no parse step (kspdprotocol package_stage.go:297), and `''` ships for
  // every package the reader could not place, since khaos-manager's field
  // carries no `omitempty` (internal/projects/projects.go:45) — `''` meaning NO
  // CLAIM, which is not the `empty` member. A closed union would be false about
  // the wire, not merely strict.
  //
  // Closing it like a producer-complete set was the first instinct and it was
  // wrong. That encodes an assumption — that the producer names the complete
  // set — and the assumption is the thing to check, not the shape.
  //
  // `'empty'|…|'enriched'|(string & {})` was the second attempt, on the usual
  // claim that it opens the type while editors still suggest the five. Measured
  // through this package, `Extract<…, 'empty'>` is `never` — the members do not
  // reach a consumer at all, so the trick bought a false comment and nothing
  // else. Two earlier assertions here "confirmed" it and were VACUOUS: `const
  // x: Extract<…> = e` passes when the extract is `never`, since `never` is
  // assignable to everything. A tuple assignment is the form that can fail.
  "type _Stage = NonNullable<_Project['package_stage']>",
  '',
  // Pinned as exactly `string`. Measured, both directions: closing the union
  // reddens this (exit 1); the `(string & {})` intersection does NOT, because it
  // measures as `string` anyway.
  //
  // An earlier version of this comment claimed it caught both. It does not, and
  // saying so was worse than saying nothing — a reader would take a guarantee
  // that is not here. The intersection is unreachable-by-gate, which is exactly
  // why the docblock rather than this line carries the five members.
  "export const _stageIsString: _Exact<_Stage, string> = true",
  '',
  // #63. `SetupStep.state` is `string`, pinned for the same measured reason and
  // following the W-11 block immediately above.
  //
  // The first draft of #63's plan typed it `(string & {})` and cited
  // `Service.state` as the precedent. That citation names the side its own
  // source rejects: `lib/types.js:127-143` records the MEASUREMENT that through
  // this package `Extract<Project['package_stage'], 'empty'>` resolves to
  // `never` from a consumer's side — the named members do not survive to the
  // people the trick exists to help. `Service.state` predates that measurement;
  // it is the case that has not been revisited, not the case that refutes it.
  //
  // And this case does not differ from `package_stage` in the way that would
  // matter. `StepState` (khaos-manager internal/localservices/manager.go:30-35)
  // is OPEN AT THE PRODUCER — khaos-manager can add a member and this client
  // receives it unfiltered — so a closed union would be false about the wire,
  // not merely strict. The four members are named in the component's docblock
  // either way. `string` says exactly what is true.
  //
  // Measured, both directions: closing the union to the four members reddens
  // this (exit 1); the `(string & {})` intersection does NOT, because it
  // measures as `string` anyway — which is the whole point, and the reason the
  // docblock rather than this line carries the four members.
  "type _Step = NonNullable<ComponentProps<typeof kit.SetupProgress>['steps']>[number]",
  "export const _stepStateExact: _Exact<NonNullable<_Step['state']>, string> = true",
  '',
  // A row's thumbnail kind is exactly what Portrait draws. It once also took
  // `place`, which Portrait mapped to a person, so every place in khaos-app's
  // Review rendered a figure. Pinned closed both ways, against the literal set
  // and against Portrait's own kind, so neither can gain a member alone.
  "type _PortraitKind = NonNullable<ComponentProps<typeof kit.Portrait>['kind']>",
  "export const _portraitKindExact: _Exact<_PortraitKind, 'person' | 'scene' | 'location' | 'object' | 'relation'> = true",
  "export const _thumbKindExact: _Exact<NonNullable<ComponentProps<typeof kit.SelectableRow>['thumbKind']>, _PortraitKind> = true",
  '',
].join('\n')

// The probe name carries the pid because the path used to be a fixed
// `probe.ts`. Two runs of this gate at once — a watch loop beside a terminal,
// or a CI job that parallelises the gates — shared that one file, and the first
// to finish deleted it out from under the second's tsc. The tsconfig globs
// `*.ts`, so BOTH names are compiled either way; the pid only stops one run's
// cleanup from erasing another's input.
const probePath = join(consumerDir, `probe.${process.pid}.ts`)
writeFileSync(probePath, probe)

try {
  execFileSync(join(ROOT, 'node_modules/.bin/tsc'), ['--project', join(consumerDir, 'tsconfig.json')], {
    cwd: ROOT,
    stdio: 'pipe',
  })
} catch (err) {
  const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim()
  if (!out) cannotRun('tsc produced no output — it may not be installed')
  // TS18003 is tsc saying it found nothing to compile, which means the probe
  // never reached it — the check did not run. Reported as a type error it reads
  // as "your declarations are broken" and sends the reader into the components,
  // and a 1 is a gap while a 2 is a red. Classify it as what it is.
  if (out.includes('TS18003')) {
    cannotRun(`tsc found no inputs — ${probePath} did not reach it:\n      ${out.split('\n')[0]}`)
  }
  const lines = out.split('\n').filter(Boolean)
  fail(
    `the published types do not satisfy a consumer rendering every component with no props:\n` +
      lines.slice(0, 12).map((l) => `      ${l.replace(/^.*scripts\/consumer\//, '')}`).join('\n') +
      (lines.length > 12 ? `\n      …and ${lines.length - 12} more` : ''),
  )
} finally {
  rmSync(probePath, { force: true })
}

// ------------------------------------------- 4. the exports map resolves

// A types condition that points at a file which does not exist degrades to
// `any` rather than erroring, so a consumer loses type safety silently.
for (const name of exported) {
  const dts = join(ROOT, `components/svelte/${name}.svelte.d.ts`)
  if (!existsSync(dts)) fail(`${name} is exported but ships no ${name}.svelte.d.ts — a consumer gets no types for it.`)
}

for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (subpath.includes('*')) continue // wildcards are checked per-file above
  const file = typeof target === 'string' ? target : target.default
  if (file && !existsSync(join(ROOT, file))) fail(`exports "${subpath}" points at ${file}, which does not exist.`)
}

// ------------------------------------------- 5. every prop is documented

// This replaced `check-stories`, which gated that every export had a Storybook
// page. Storybook has since been retired (D61) and its argTypes prose — the
// library's per-prop API reference — moved onto the components, where
// `build-types` carries it into the shipped .d.ts and a consumer reads it on
// hover.
//
// Stronger than what it replaces, in two ways. It gates per PROP rather than
// per component, so a component can no longer document six of its eight and
// count as covered. And it measures the artifact a consumer receives rather
// than a site they would have to visit.
//
// The check is for a JSDoc block immediately above each prop, which is what
// `@property` on the Props typedef produces. A prop with no description is
// public API nobody explained.
const undocumented = []

for (const name of exported) {
  const dts = join(ROOT, `components/svelte/${name}.svelte.d.ts`)
  if (!existsSync(dts)) continue // already reported by check 4

  // Read the Component<{…}> props object, not the Props typedef below it —
  // the former is what a consumer's ComponentProps<> resolves to.
  const block = readFileSync(dts, 'utf8').match(
    /declare const \w+: import\("svelte"\)\.Component<\{([\s\S]*?)\n\}, /,
  )
  if (!block) continue

  const lines = block[1].split('\n')
  for (const [i, line] of lines.entries()) {
    const prop = line.match(/^\s{4}(\w+)\??:/)
    if (!prop) continue
    // The line before a documented prop closes its JSDoc block.
    if (!/^\s*\*\//.test(lines[i - 1] ?? '')) undocumented.push(`${name}.${prop[1]}`)
  }
}

if (undocumented.length) {
  fail(
    `${undocumented.length} prop(s) ship with no description — public API nobody explained:\n` +
      `      ${undocumented.slice(0, 20).join(', ')}` +
      (undocumented.length > 20 ? `\n      …and ${undocumented.length - 20} more` : ''),
  )
}

// ------------------------------------------------- a fresh install builds
//
// Everything above resolves the package through this repo's node_modules, so
// it sees the lockfile's dependency versions and never what a consumer's
// fresh install resolves. 0.163.0 and 0.164.0 shipped `"@ark-ui/svelte":
// "^5.23.0"`; ark-ui 5.25.0 then shipped with SvelteKit's `$lib/` imports
// unrewritten, and every fresh consumer's `vite build` failed while this gate
// passed. So: every dependency is exact, and the packed tarball is installed
// into an empty Vite + Svelte app with no lockfile and built.

const ranged = Object.entries(pkg.dependencies ?? {}).filter(([, v]) => !/^\d+\.\d+\.\d+$/.test(v))
if (ranged.length) {
  fail(
    `dependencies must be exact, or a consumer installs whatever upstream ships next:\n` +
      `      ${ranged.map(([n, v]) => `${n}@${v}`).join(', ')}`,
  )
}

const fresh = mkdtempSync(join(tmpdir(), 'khaotik-consumer-'))
try {
  const run = (cmd, args) => execFileSync(cmd, args, { cwd: fresh, encoding: 'utf8', stdio: 'pipe' })
  const tarball = join(fresh, run('npm', ['pack', ROOT, '--silent']).trim().split('\n').pop())
  mkdirSync(join(fresh, 'src'))
  writeFileSync(join(fresh, 'package.json'), '{"name":"consumer","private":true,"type":"module"}')
  writeFileSync(
    join(fresh, 'vite.config.js'),
    "import { svelte } from '@sveltejs/vite-plugin-svelte'\nexport default { plugins: [svelte()], logLevel: 'error' }\n",
  )
  writeFileSync(join(fresh, 'index.html'), '<script type="module" src="/src/main.js"></script>\n')
  writeFileSync(
    join(fresh, 'src/main.js'),
    [
      `import * as kit from '${PKG}/components/svelte'`,
      `import '${PKG}/tokens/tokens.css'`,
      `import '${PKG}/tokens/tokens-extra.css'`,
      `import '${PKG}/tokens/utilities.css'`,
      `import '${PKG}/assets/icons/phosphor.css'`,
      'console.log(Object.keys(kit).length)',
    ].join('\n'),
  )
  try {
    run('npm', ['install', '--no-audit', '--no-fund', '--no-package-lock', tarball, 'svelte', 'vite', '@sveltejs/vite-plugin-svelte'])
  } catch (e) {
    cannotRun(`npm install in a fresh consumer failed:\n${e.stderr || e.message}`)
  }
  try {
    run('npx', ['vite', 'build'])
    notes.push('a fresh install of the packed tarball builds with vite')
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`
    const lines = out.split('\n').filter((l) => l.trim())
    const why = lines.find((l) => /failed to resolve/i.test(l)) ?? lines.find((l) => /error/i.test(l)) ?? out.slice(0, 400)
    fail(`a fresh install of the packed tarball does not build with vite:\n      ${why.trim()}`)
  }
} finally {
  rmSync(fresh, { recursive: true, force: true })
}

// ------------------------------------------------------------------ report

const checked = `${shippedJs.length} modules · ${exported.length} exports`

if (problems.length) {
  console.error(`\ncheck-consumer: ${problems.length} problem(s) — ${checked}\n`)
  for (const p of problems) console.error(`  ✗ ${p}\n`)
  process.exit(1)
}

for (const n of notes) console.log(`  · ${n}`)
console.log(`check-consumer: a consumer can load and type-check what we publish — ${checked}`)
process.exit(0)
