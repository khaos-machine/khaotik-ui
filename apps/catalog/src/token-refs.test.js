import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Every `var(--token)` a component references must be a token the kit ships.
//
// This is invisible to every other check here. jsdom resolves no stylesheets, so
// a rendered assertion passes whether or not the property exists;
// `build-storybook` compiles the CSS without resolving custom properties; and the
// browser does not warn — it silently applies the CSS-wide "invalid at
// computed-value time" rule, which is NOT "ignore the declaration":
//
//   --border-strong  ProjectCard:122, `border-color` on hover. border-color is
//                    not inherited, so IACVT resolves it to `initial` —
//                    `currentColor`. The hover border took the TEXT colour.
//   --body-sm-size   Settings, Toggle and StoryPlayer. No such tier exists; the
//                    scale is body-md 13px / caption 11px. Font size fell back
//                    to whatever was inherited.
//
// Both shipped. StoryPlayer's went out in 0.11.0, signed and notarized.
//
// A `var(--x, fallback)` is fine — the fallback is the contract. A property the
// component declares itself, or sets inline with `style:--x={…}`, is fine too.

const LIB = join(import.meta.dirname, '../../..', 'components/svelte')
const TOKENS = join(import.meta.dirname, '../../..', 'tokens')

const tokenCss = ['tokens.css', 'tokens-extra.css', 'utilities.css']
  .map((f) => readFileSync(join(TOKENS, f), 'utf8'))
  .join('\n')

const declared = (css) => new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))

const shipped = declared(tokenCss)

const components = readdirSync(LIB).filter((f) => f.endsWith('.svelte'))

// The same check, applied to a source file from either tree.
const unresolvedIn = (source) => {
    // Comments stripped first. These components explain their tokens in prose
    // that names the very properties under test — ProjectCard's hover rule
    // records the `--border-strong` it no longer uses — so scanning raw text
    // would flag the explanation. regressions.test.js:22 learned this the same
    // way, counting a `z-index` that only appeared in a comment.
    const style = (source.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '')
      .replace(/\/\*[\s\S]*?\*\//g, '')

    // Declared by the component itself, or handed to it inline as
    // `style:--hue={hue}` (ProviderBadge).
    const local = declared(style)
    for (const m of source.matchAll(/style:(--[\w-]+)/g)) local.add(m[1])

    // ...or inline as one style STRING. A `style:` directive is not valid on a
    // COMPONENT, so anything whose outer element is an Ark part has to build the
    // string itself — Portrait does, since its frame became Ark's AvatarRoot.
    // Without this the property reads as unshipped and the component is failed
    // for setting its own variable.
    for (const m of source.matchAll(/(--[\w-]+)\s*:\s*\$\{/g)) local.add(m[1])

    // The trailing group distinguishes `var(--x)` from `var(--x, fallback)`.
    const unresolved = [...style.matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)]
      .filter(([, name, next]) => next === ')' && !shipped.has(name) && !local.has(name))
      .map(([, name]) => name)

  return [...new Set(unresolved)]
}

describe('every token a component references is one the kit ships', () => {
  it.each(components)('%s', (file) => {
    expect(unresolvedIn(readFileSync(join(LIB, file), 'utf8'))).toEqual([])
  })
})

// The catalog was outside this gate, and the gap was not theoretical.
//
// `--label-xs-{size,line,weight,track}` was referenced by SidebarNav's group
// heading and Settings' section eyebrow. The kit has never shipped that tier —
// it ships label-lg/md/sm — so all eight declarations were invalid at
// computed-value time and both rules fell back to inherited 16px/400. The nav's
// folder headings rendered LARGER than the page titles beside them, and the
// catalog's own suite was green throughout: jsdom resolves no custom
// properties, so every rendered assertion agreed with the broken CSS.
//
// The library half of this file has caught this class twice (--border-strong,
// --body-sm-size). The catalog runs the same risk against the same token set
// and imports the same three stylesheets, so it gets the same gate.
const CATALOG = import.meta.dirname

const catalogComponents = readdirSync(CATALOG, { recursive: true })
  .filter((f) => f.endsWith('.svelte'))
  .sort()

describe('every token a CATALOG component references is one the kit ships', () => {
  it('finds the catalog components to check', () => {
    // a read that quietly returned nothing would make every case below
    // vacuously true — the same trap shell-type.test.js guards
    expect(catalogComponents.length).toBeGreaterThan(10)
  })

  it.each(catalogComponents)('%s', (file) => {
    expect(unresolvedIn(readFileSync(join(CATALOG, file), 'utf8'))).toEqual([])
  })
})

// ── the decided visual contract for MetaStrip (#56, D63) ────────────────────
//
// The gate above proves every `var()` names a shipped token. It would pass
// `--text-tertiary` happily — and that is the drift this atom exists to stop.
// The four in-library runs disagree 3–2 on the colour, and the ruling settled
// it on measured contrast rather than a head count: at `--caption-size` (11px)
// the WCAG bar is 4.5:1, `--text-secondary` measures 6.86 / 7.53 / 8.29 / 7.44
// across the four real backgrounds and `--text-tertiary` measures
// 3.29 / 3.61 / 4.56 / 4.09 — a live AA failure on three of the four, filed as
// issue #66.
//
// Nothing else can see this. jsdom resolves no stylesheets, so no rendered
// assertion notices a colour, a size or a gap that moved.
// `--caption-weight` is in the list because D63 says "400 — the value is not
// bolded". Without it, drifting `font-weight` to `--label-sm-weight` (600)
// passed — and 600 with 0.06em tracking is exactly the direction all six
// hand-rolled eyebrow copies drifted, which is the fragmentation #56 exists
// to stop.
const CONTRACT = [
  '--caption-size',
  '--caption-line',
  '--caption-weight',
  '--text-secondary',
  '--spacing-sm',
  '--spacing-2xs',
]

describe('MetaStrip holds the visual contract D63 decided', () => {
  const style = (readFileSync(join(LIB, 'MetaStrip.svelte'), 'utf8')
    .match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  it('has a style block to read', () => {
    // a read that quietly returned nothing would make every case below
    // vacuously true
    expect(style.length).toBeGreaterThan(50)
  })

  it.each(CONTRACT)('references %s', (token) => {
    expect(style).toContain(`var(${token})`)
  })

  it('pins no size in raw px', () => {
    expect(style.match(/\b\d+(\.\d+)?px\b/g) ?? []).toEqual([])
  })

  it('pins no colour outside the token set', () => {
    expect(style.match(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch|oklab)\(/g) ?? []).toEqual([])
  })

  // The cases above prove each token appears SOMEWHERE in the block, which is
  // what the plan specified and is not enough for the two gaps: both are
  // `gap:`, both are present, so swapping them between the run and the item
  // left every case green while the rendered spacing inverted. These two read
  // inside the rule that has to carry the value.
  const ruleBody = (selector) =>
    style.match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? null

  it.each([
    ['.meta-strip', '--spacing-sm'],
    ['.meta-strip__item', '--spacing-2xs'],
  ])('%s carries gap: var(%s)', (selector, token) => {
    const body = ruleBody(selector)
    expect(body, `${selector} has no rule to read`).not.toBeNull()
    expect(body).toMatch(new RegExp(`gap:\\s*var\\(${token}\\)`))
  })
})
