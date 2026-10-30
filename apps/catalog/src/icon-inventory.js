// The kit's icon vocabulary, harvested from the components that render it.
//
// WHY derived rather than listed: a hand-kept list is a second copy of a fact
// the components already state, and this repo has the scar. `tokens/parse.js`
// exists because the token parser lived twice, the two drifted, and the drift
// shipped a crash to the published Storybook. An icon sheet transcribed by hand
// goes stale the first time someone swaps a glyph, and it goes stale silently —
// the sheet still renders, it just documents a set nobody uses any more.
//
// So the sheet reads the components, the same way the palette screens read
// tokens.css. A glyph cannot appear here without a component rendering it, and
// cannot be rendered without appearing here.
//
// WHAT IT CANNOT SEE, and this is a real limit rather than a rounding error:
// several components take the icon as a PROP — EmptyState, StatusPill,
// MetricCard and SelectableRow — and Settings renders whatever its `categories`
// data carries. Those names belong to the calling app, not to the kit, so they
// are absent by definition and `callerSupplied` below names the components that
// ask for one. A sheet claiming to be the complete set would be lying about the
// half it cannot know.
//
// WHERE THIS LIVES, and why it moved. It shipped inside the library at
// `components/svelte/lib/`, reachable as a deep import, and its header called
// `import.meta.glob` "Vite-only, like parse.js's `?raw` import". Those two fail
// very differently, and the difference is the whole point:
//
//   parse.js     ./tokens.css?raw is an unresolvable SPECIFIER. Every bundler
//                errors at build time, naming the file.
//   this module  import.meta.glob is valid JavaScript that only Vite rewrites.
//                esbuild bundles it with exit 0 and no warning; the module then
//                throws TypeError in the consumer's browser. Measured in four
//                contexts: plain node, esbuild, Vite SSR — all broken; only a
//                Vite CLIENT build works.
//
// CLAUDE.md names "a module that throws at evaluation" as one of two defect
// classes invisible to the build. `check-consumer` catches it now — but the
// real fix is that this never belonged in the shipped library. Only the catalog
// reads it, it exists to document the kit rather than to be part of it, and a
// module that globs the library's sources is dev tooling. So it lives in the
// catalog, where Vite is guaranteed and it is not public surface.

const sources = import.meta.glob('../../../components/svelte/*.svelte', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// `name="literal"` or `name={anything}`. The braces branch is captured whole so
// the literals inside a ternary survive — `{playing ? 'pause' : 'play'}` is two
// real icons, and taking only the attribute's text would drop both.
const NAME_ATTR = /name=(?:"([a-z][a-z0-9-]*)"|\{([^}]*)\})/g

// An `icon` resolved in the script block and handed to <Icon name={icon}>:
// OutcomeBanner's error/success pair, Portrait's scene/location/person glyphs.
// Without this the tag scan finds `{icon}` and resolves nothing.
const DERIVED_ICON = /\bicon\s*=\s*\$derived\(([\s\S]*?)\n?\s*\)/g

// An icon handed to a component as a PROP — `icon: 'clock'` in a fixture, a
// Settings category, a nav row. The library has none of these (its components
// declare `icon = ''` and take the name from the caller), so adding it does not
// move the kit's own count; it is what lets a CONSUMER index itself.
// The VALUE expression, not just a bare literal. `icon: 'clock'` was matched;
// `icon: ICONS[kind] ?? 'file'` was not, so ResourceCatalog's fallback glyph —
// what every unrecognised kind actually renders — never reached the sheet.
// Run through comparisons() like the derived path, so an operand is not
// mistaken for a glyph.
const ICON_PROP = /\bicon:\s*([^,\n}]+)/g

// A lookup of names keyed by something else — `SECTION_ICONS = { brandkit:
// 'palette', ... }` in the rail. Convention, and the only one that works: the
// values are bare strings, indistinguishable from any other map without it.
// `[A-Z][A-Z_]*ICONS` REQUIRED a prefix, so a bare `const ICONS = {…}` was
// skipped — ResourceCatalog declares exactly that, and six glyphs the kit
// genuinely renders (chat-text, gear, brackets-curly, file-text, ruler) were
// absent from the sheet while the module's own lede promised "cannot be
// rendered without appearing here". The prefix is now optional.
const ICON_MAP = /\b(?:[A-Z][A-Z_]*_)?ICONS\s*=\s*\{([^}]*)\}/g

const QUOTED = /'([a-z][a-z0-9-]*)'/g

// A ternary tests one string and returns another, and only the returned one is
// an icon. `tone === 'error' ? 'warning-circle' : 'check-circle'` names two
// icons and one TONE; `kind === 'location' ? 'map-pin' : 'user'` names two
// icons and one KIND. Taking every quoted string put `error` and `location` on
// the sheet as glyphs that render nothing, which is exactly the kind of
// confident-and-wrong entry a hand-written list would also have produced —
// caught by looking at the sheet, not by the tests.
const comparisons = (expression) => expression.replace(/[=!]==?\s*'[^']*'/g, '')

/** Every icon name a literal in `src` hands to <Icon>, or names as one. */
export function harvest(src) {
  const found = new Set()

  for (const tag of src.match(/<Icon\b[^>]*>/g) ?? []) {
    for (const [, literal, expression] of tag.matchAll(NAME_ATTR)) {
      if (literal) found.add(literal)
      // A weight is quoted the same way a name is, so only the `name` slot is
      // read — scanning the whole tag would list `fill` as an icon.
      else for (const [, q] of comparisons(expression ?? '').matchAll(QUOTED)) found.add(q)
    }
  }

  for (const [, expression] of src.matchAll(DERIVED_ICON)) {
    for (const [, q] of comparisons(expression).matchAll(QUOTED)) found.add(q)
  }

  for (const [, expression] of src.matchAll(ICON_PROP)) {
    for (const [, q] of comparisons(expression).matchAll(QUOTED)) found.add(q)
  }

  for (const [, body] of src.matchAll(ICON_MAP)) {
    for (const [, q] of body.matchAll(QUOTED)) found.add(q)
  }

  return found
}

/**
 * `{ path: source }` → `[{ name, usedBy }]`, alphabetical.
 *
 * Exported so a CONSUMER can run the same parse over its own files. The kit
 * cannot glob its consumers — that is backwards, and it could only ever see the
 * one it shipped with. This is parse.js's shape: the library owns the parser,
 * each surface points it at itself.
 */
export function index(sources) {
  const byName = new Map()
  for (const [path, src] of Object.entries(sources)) {
    const where = path.split('/').pop().replace(/\.(svelte|js)$/, '')
    for (const icon of harvest(src)) {
      if (!byName.has(icon)) byName.set(icon, new Set())
      byName.get(icon).add(where)
    }
  }
  return [...byName.entries()]
    .map(([name, used]) => ({ name, usedBy: [...used].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** The kit's own band: `[{ name, usedBy }]`, alphabetical. */
export const icons = index(sources)

/**
 * Components that take an icon name as a prop. Their glyphs are the calling
 * app's choice and cannot appear above — stated so the sheet's silence about
 * them reads as a boundary rather than as an omission.
 */
export const callerSupplied = [...Object.entries(sources)]
  // Two shapes, because an icon reaches a component two ways and only one of
  // them is a destructured prop.
  //
  // 1. `icon = ''` in the destructure. `,` OR `}` after the default: StatusPill
  //    declares it last, so requiring a trailing comma silently dropped it.
  // 2. An `icon` declared on a typedef the component takes as a prop —
  //    MetaStrip's `MetaItem`, Settings' `Category`. The glyph arrives inside a
  //    collection, so there is no destructured `icon` to find, and both were
  //    missing from this band while the first shape was the only one read.
  // 3. An `icon?: string` on an inline object type in a prop's JSDoc —
  //    EngineDetails' `routes`, SettingsWindow's `panes`. The same glyph in a
  //    collection, with no named typedef for the second shape to read.
  //
  // The property name is matched WHOLE (`[icon]` or `icon `). `\[?icon\]?`
  // also matches `[iconSize]`, which put Portrait in this band — and Portrait
  // picks its glyph from three literals in its own source, so it is harvestable
  // and belongs in the band above. ResourceCatalog is the same case via a local
  // `ICONS[kind]` map: a bound `name={x.icon}` is not evidence on its own.
  .filter(
    ([, src]) =>
      /\bicon = ''\s*[,}]/.test(src) || /@property \{string\} (\[icon\]|icon )/.test(src) || /@property \{[^}]*\bicon\?: string\b/.test(src),
  )
  .map(([path]) => path.split('/').pop().replace('.svelte', ''))
  .sort()

/** The weights Icon accepts. Phosphor ships six; the kit renders two. */
export const weights = ['regular', 'fill']
