// Taxonomy gate — a component's category must be one the catalog actually
// declares, and every category must be renderable.
//
// WHY this exists: the library was classified in three places at once — the
// barrel's comment groups, the `stories/` directories, and the catalog's
// `section`/`group` fields — and they drifted. `PacingChart` was exported under
// "Screens" in the barrel, filed under `Atoms` in Storybook, and registered as
// `foundation/atoms` in the catalog. Three surfaces, three answers, nothing red.
//
// WHAT CHANGED (D61): Storybook is gone, so there is no second surface to
// disagree with. This gate originally compared the two and that half is
// deleted — the catalog registry is now the only place placement is written, and
// a single source cannot contradict itself. What remains is the half that was
// never about agreement: the registry can still name a category it never
// declared, or declare one it never labels, and both ship a broken sidebar.
//
// The lesson that built this gate still holds and is why it was trimmed rather
// than deleted: `check-stories` sat green at 37/37 while the catalog rotted, so
// an ungated surface drifts.
//
// WHAT IT CANNOT CHECK: the barrel's groups are comments. There is no way to
// gate prose, so `components/svelte/index.js` is checked only for duplicate
// exports; its grouping is documentation and stays the author's job.
//
// Exit 0 = every export is filed in a declared, labelled group.
// Exit 1 = at least one problem.
// Exit 2 = the check could not run (a missing input is never a pass).

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURES = path.join(repoRoot, 'apps/catalog/src/fixtures.js')
const BARREL = path.join(repoRoot, 'components/svelte/index.js')
const TAXONOMY = path.join(repoRoot, 'apps/catalog/src/taxonomy.js')

const cannotRun = (msg) => { console.error(`CANNOT RUN: ${msg}`); process.exit(2) }

for (const [p, what] of [[FIXTURES, 'catalog registry'], [BARREL, 'barrel'], [TAXONOMY, 'catalog taxonomy']]) {
  if (!existsSync(p)) cannotRun(`no ${what} at ${path.relative(repoRoot, p)}`)
}

const fixturesSrc = await readFile(FIXTURES, 'utf8')
const barrelSrc = await readFile(BARREL, 'utf8')

// ── load the taxonomy ────────────────────────────────────────────────────────
// Imported, not parsed: taxonomy.js is a plain module, so a computed list reads
// the same here as in the running catalog.
const { SECTION_GROUPS, SECTION_LABELS, GROUP_LABELS, GROUP_ORDER } = await import(TAXONOMY)
for (const [name, value] of Object.entries({ SECTION_GROUPS, SECTION_LABELS, GROUP_LABELS, GROUP_ORDER })) {
  if (!value) cannotRun(`taxonomy.js exports no ${name}`)
}

// ── parse the catalog registry ───────────────────────────────────────────────
// Regex rather than import: fixtures.js imports .svelte, which node cannot load.

// Each fixture's declared placement. Field order varies across the registry, so
// both orderings are matched and the union is taken.
//
// FLOWS ARE NOT EXPORTS. A flow fixture carries `kind: 'flow'` and no
// `component:` — it sequences screens by id and the barrel knows nothing about
// it — so it has no Storybook story to agree or disagree with. Left in, the
// first pattern read `name: 'Onboarding'` as a component and failed the gate
// for a missing story; `name: 'First run'` passed the same gate, because `\w+`
// stops at the space. A check whose verdict turns on whether a name contains a
// space is not checking anything, so flow entries are dropped before matching
// rather than being excluded by the shape of their name.
const withoutFlows = fixturesSrc.replace(/\{[^{}]*kind:\s*'flow'[^{}]*\}/g, '')

const placement = new Map() // component name -> { section, group }
for (const re of [
  /name:\s*'(\w+)'[^{}]*?section:\s*'(\w+)',\s*group:\s*'(\w+)'/g,
  /section:\s*'(\w+)',\s*group:\s*'(\w+)',[^{}]*?component:\s*(\w+)/g,
]) {
  for (const m of withoutFlows.matchAll(re)) {
    const [name, section, group] = re.source.startsWith('name')
      ? [m[1], m[2], m[3]]
      : [m[3], m[1], m[2]]
    if (!placement.has(name)) placement.set(name, { section, group })
  }
}
if (!placement.size) cannotRun('parsed zero fixtures — the registry shape may have changed')

// ── parse the barrel ─────────────────────────────────────────────────────────
const exported = [...barrelSrc.matchAll(/export \{ default as (\w+) \}/g)].map((m) => m[1])
if (!exported.length) cannotRun('parsed zero exports from the barrel')

// ── checks ───────────────────────────────────────────────────────────────────
const problems = []

// 1. A group its section never declared still renders — appended after the
//    declared ones, under its raw slug, because SidebarNav would rather show a
//    misplaced fixture than drop it. Honest, but it is not the intended order
//    and the heading is a slug rather than a label.
//
//    Catalog-only views (the BrandKit screens) are checked too: they are not
//    library exports, but they are rows in the same sidebar.
for (const [name, { section, group }] of placement) {
  const declared = SECTION_GROUPS[section]
  if (!declared) {
    problems.push(`${name}: section "${section}" is not in SECTION_GROUPS`)
  } else if (!declared.includes(group)) {
    problems.push(
      `${name}: group "${group}" is not declared in SECTION_GROUPS.${section} ` +
      `(${declared.join(', ')}) — it renders last, under its raw slug`,
    )
  }
}

// 2. A section or group with no label renders its slug as the heading, and a
//    group missing from GROUP_ORDER sorts arbitrarily.
for (const [section, groups] of Object.entries(SECTION_GROUPS)) {
  if (!SECTION_LABELS[section]) problems.push(`section "${section}" has no SECTION_LABELS entry`)
  for (const g of groups) {
    if (!GROUP_LABELS[g]) problems.push(`group "${g}" (${section}) has no GROUP_LABELS entry`)
    if (!GROUP_ORDER.includes(g)) problems.push(`group "${g}" (${section}) is missing from GROUP_ORDER`)
  }
}

// 3. A duplicate export is a static error in ESM, so it fails a build rather
//    than shipping — but it fails it a long way from here, with a message about
//    a binding rather than about the barrel. Named at the source instead.
const dupes = exported.filter((n, i) => exported.indexOf(n) !== i)
for (const d of new Set(dupes)) problems.push(`${d}: exported more than once from the barrel`)

// ── report ───────────────────────────────────────────────────────────────────
const checked = exported.filter((n) => placement.has(n)).length

// A PARTIAL check is a CANNOT RUN, not a pass.
//
// The guard above catches only the case where the registry parses to ZERO
// fixtures. The placement regexes want an exact field shape, so reformatting
// SOME fixtures drops exactly those from the check while the rest still parse —
// and the gate reported success. Measured before this gate existed:
// reformatting the four chart fixtures and then filing BarChart in an undeclared
// group gave `42/46 exports` at exit 0, with every other gate green and a real
// misfiling in the tree. The count silently fell from 46 to 42 and nothing read
// it, which is precisely the failure this gate exists to end.
if (checked !== exported.length) {
  const missing = exported.filter((n) => !placement.has(n))
  cannotRun(
    `only ${checked} of ${exported.length} exports could be checked — ` +
      `no placement parsed for: ${missing.join(', ')}. ` +
      `A partial check cannot report agreement it never measured.`,
  )
}

if (!problems.length) {
  console.log(`taxonomy: ${checked}/${exported.length} exports filed in a declared, labelled group`)
  process.exit(0)
}

console.error(`taxonomy: ${problems.length} problem(s) across ${checked} checked exports\n`)
for (const p of problems) console.error(`  ${p}`)
console.error('\nThe catalog registry is the source of truth for placement; fix it there.')
process.exit(1)
