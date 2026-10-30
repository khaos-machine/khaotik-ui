// Generates the TypeScript declarations the library ships (issue #21).
//
// WHY this exists at all: the package shipped `.svelte` source and an
// `index.js` barrel with no `.d.ts` and no `types` in `package.json`, so a TS
// consumer got no module resolution and hand-wrote a `declare module` block in
// which every component was `Component<Record<string, unknown>>` — no prop
// checked, and the export list drifted out of date without anything failing
// (khaos-app's had been missing `FilterField` and `StoryPlayer` for several
// milestones while the app ran fine, because Vite resolves at runtime).
//
// WHY in place rather than a `dist/`: `@sveltejs/package` wants `src/lib` in
// and `dist` out, which would move every published path and break the
// documented contract that consumers compile our `.svelte` source straight out
// of `node_modules` (docs/using-the-library.md §1) — including `Portrait`'s
// twelve static `.webp` imports through the `./assets/*` export. Emitting
// `X.svelte.d.ts` beside `X.svelte` is the same file-naming convention
// svelte-package uses, so TypeScript finds them identically, and not one
// consumer path changes. We use svelte-package's own engine (`svelte2tsx`'s
// `emitDts`) — only the output location differs.
//
// WHY committed rather than generated in CI: the package is consumed as a git
// dependency (no npm publish step to hang generation off), so anything not in
// the tree does not reach a consumer. Committed output is only safe if it
// cannot go stale, hence `--check`: `npm run check-types` regenerates into a
// temp directory and fails on any difference. That gate is the whole point —
// a `.d.ts` that drifts from its component is issue #21 again, one repo to the
// left.
//
// Usage:
//   node scripts/build-types.mjs           # write declarations into the tree
//   node scripts/build-types.mjs --check   # fail if the tree is out of date

import { createRequire } from 'node:module'
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, cp } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { emitDts } from 'svelte2tsx'

const require = createRequire(import.meta.url)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const libRoot = path.join(repoRoot, 'components/svelte')

const check = process.argv.includes('--check')

/** Every `.d.ts` under `dir`, as paths relative to it, sorted for a stable diff. */
async function declarations(dir) {
  const out = []
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.name.endsWith('.d.ts')) out.push(path.relative(dir, full))
    }
  }
  if (existsSync(dir)) await walk(dir)
  return out.sort()
}

const staging = await mkdtemp(path.join(tmpdir(), 'khaotik-types-'))

try {
  await emitDts({
    libRoot,
    declarationDir: staging,
    // Named, not `tsconfig.json` — see the comment at the top of that file.
    tsconfig: 'tsconfig.types.json',
    // Svelte 5 still ships the v4 shims under this name; svelte2tsx resolves
    // the runes typings from the `svelte` package itself.
    svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
  })

  const generated = await declarations(staging)
  if (generated.length === 0) {
    console.error('build-types: emitDts produced no declarations — refusing to treat that as success')
    process.exit(2)
  }

  const existing = await declarations(libRoot)

  if (check) {
    const problems = []
    for (const rel of generated) {
      const target = path.join(libRoot, rel)
      if (!existsSync(target)) {
        problems.push(`missing:  ${rel}`)
        continue
      }
      const [want, have] = await Promise.all([
        readFile(path.join(staging, rel), 'utf8'),
        readFile(target, 'utf8'),
      ])
      if (want !== have) problems.push(`stale:    ${rel}`)
    }
    for (const rel of existing) {
      if (!generated.includes(rel)) problems.push(`orphaned: ${rel}`)
    }

    if (problems.length) {
      console.error('The shipped declarations do not match the components they describe:\n')
      for (const p of problems) console.error(`  ${p}`)
      console.error('\nRun `npm run build-types` and commit the result.')
      process.exit(1)
    }
    console.log(`check-types: ${generated.length} declarations up to date.`)
  } else {
    // Prune first: a component that is deleted or renamed must not leave its
    // declaration behind claiming an export that no longer exists.
    for (const rel of existing) {
      if (!generated.includes(rel)) await rm(path.join(libRoot, rel))
    }
    for (const rel of generated) {
      const target = path.join(libRoot, rel)
      await mkdir(path.dirname(target), { recursive: true })
      await cp(path.join(staging, rel), target)
    }
    console.log(`build-types: wrote ${generated.length} declarations into components/svelte/.`)
  }
} finally {
  await rm(staging, { recursive: true, force: true })
}
