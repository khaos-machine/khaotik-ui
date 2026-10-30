// tokens/parse.js
//
// The BrandKit token parser. THE parser — there is exactly one, and the
// catalog's brand screens read it through the package export
// (`@khaos-machine/khaotik-ui/tokens/parse.js`).
//
// It lived twice before, once in the library's Storybook stories and once in the
// catalog, and the two drifted: the warm-gray migration updated one copy's
// hardcoded family list and not the other's, so the published Storybook threw
// `colour family "grey" parsed with no rungs` at module load and every BrandKit
// story went down. Storybook has since been retired (D61) and the catalog is the
// only reader, but the rule that closed the defect is what keeps it closed: one
// module, one parse, one place to fix.
//
// Reads the library's generated BrandKit CSS (`./tokens.css` — D44: generated
// from tokens.json by build-tokens.py, never hand-edited) through a Vite raw
// import and flattens it into categorized data:
//
//   colors        primitive colour ladders — { family, rungs: [{name, value}] }
//   radius        radius-* tiers
//   spacing       spacing-* scale
//   sizes         size-* target and stroke widths
//   fonts         font-* family stacks
//   type          type scales — { name, size, line, weight, track }
//
//   utilities     the hand-authored utility roster, parsed from
//                 ./utilities.css — { name, doc, kind, declarations }
//
//   byTheme.dark  \  semantic     surface- / text- / action- / border- tokens
//   byTheme.light /  status       status-* tones (normal/warning/alarm/offline)
//                    statusCompat the legacy st-* names (st-provis excluded)
//                    all          EVERY declaration on that surface, in source
//                                 order — the categories above are views over
//                                 it, and each one drops what it does not match
//
// The split is not cosmetic. The primitives, the scale tiers and the type
// styles are declared once and mean the same thing in both modes. The semantic
// layer is declared TWICE and flips: --surface-base is indigo-950 in dark and
// grey-50 in light. Asking for a semantic token without saying which mode is
// therefore a question with no answer, which is why there is no theme-blind
// export of one.
//
// Every entry carries { name, value, resolved }: `value` is the declaration
// verbatim, `resolved` is the same value with any `var(--x)` chain followed
// through that theme's map (see resolveRef below).

// Relative, not `@khaos-machine/khaotik-ui/tokens/tokens.css?raw`: this file now sits
// beside the sheet it parses, and a package self-reference would make the
// library's own module depend on the consumer having the package installed
// under that name.
import raw from './tokens.css?raw'

// The second sheet this module reads. Hand-authored, unlike tokens.css, and
// parsed here for the same reason the tokens are: so the utility roster has ONE
// declaration site. The sheet already carries the class, the declarations and a
// prose comment; the `@kind` annotation adds the treatment. A screen or a doc
// that kept its own list would be the second site, which is the drift this
// module exists to prevent.
import utilitiesRaw from './utilities.css?raw'

// ---- the three regions -----------------------------------------------------
//
// The kit emits `:root, .dark, [data-theme="dark"]` as ONE rule — so the dark
// block is also the :root default — and then overrides a subset of it under
// `html[data-theme="light"]`, which wins on specificity (0,1,1) rather than on
// source order.
//
// The consequence, and the reason the light surface cannot be read from the
// light block alone: it redeclares 37 of the 47 names. The eight `--st-*-fg/bg`
// aliases it omits still flip, because they point at `--status-*` names it does
// override. Parsing the light block as a standalone set loses those eight rows
// entirely — and a section that renders eight rows short is the kind of silence
// this project keeps finding.
const DARK_RULE = '[data-theme="dark"]{'
const LIGHT_RULE = 'html[data-theme="light"]{'

// The body of a block, located by its opening rule. Values never contain a
// brace, and the generator closes every block with a `}` at column 0.
function region(marker) {
  const open = raw.indexOf(marker)
  if (open === -1) {
    throw new Error(`tokens.css: the \`${marker}\` block is missing — the vendored file changed shape`)
  }
  const from = open + marker.length
  const close = raw.indexOf('\n}', from)
  if (close === -1) {
    throw new Error(`tokens.css: the \`${marker}\` block is never closed at column 0`)
  }
  return { body: raw.slice(from, close), start: open, end: close }
}

const darkRegion = region(DARK_RULE)
const lightRegion = region(LIGHT_RULE)

if (darkRegion.start > lightRegion.start) {
  throw new Error('tokens.css: the light block now precedes the dark one — the overlay order is reversed')
}

// everything OUTSIDE both theme blocks: the primitive ladders, the scale tiers,
// and the trailing computed :root block. Sliced around the two rather than cut
// at the first one, so the trailing block is not silently filed under light.
const baseRegion =
  raw.slice(0, darkRegion.start) +
  raw.slice(darkRegion.end, lightRegion.start) +
  raw.slice(lightRegion.end)

// Every declaration in the generated file is `--name:value;` — values never
// contain a semicolon, and no comment contains the `--name:` shape.
const DECLARATION = /--([a-z0-9-]+)\s*:\s*([^;]+?)\s*;/g

const declarations = (css) =>
  new Map([...css.matchAll(DECLARATION)].map((match) => [match[1], match[2]]))

const baseDecls = declarations(baseRegion)
const darkDecls = declarations(darkRegion.body)
const lightDecls = declarations(lightRegion.body)

// dark IS the default; light is the default with an overlay on top. Later
// entries win, and a re-set key keeps its original position — so both maps
// carry the semantic names in the same source order.
const themeMaps = {
  dark: new Map([...baseDecls, ...darkDecls]),
  light: new Map([...baseDecls, ...darkDecls, ...lightDecls]),
}

export const THEMES = ['dark', 'light']

// ---- reference resolution --------------------------------------------------
//
// Every semantic, status and st-* token is a `var(--primitive)` reference, and
// some are two hops (st-normal-fg -> status-normal-fg -> green-450). A view
// that paints from the literal paints nothing, so the chain is walked here —
// through the map of the theme being asked about, which is what makes the same
// alias resolve green-450 in dark and green-850 in light.
//
// A reference the map cannot reach comes back unchanged rather than resolved to
// a guess: the caller decides what an unresolvable value looks like. The same
// holds for anything that is not a bare `var(...)` — a color-mix() or an oklch()
// is a computation, not a reference, and is returned as written.
const REFERENCE = /^var\(\s*--([a-z0-9-]+)\s*\)$/

export function resolveRef(value, map = themeMaps.dark) {
  let current = value
  const seen = new Set()
  for (;;) {
    const match = REFERENCE.exec(current ?? '')
    if (match === null) return current
    const target = match[1]
    // a missing target, or one already walked, ends the chain where it stands
    if (seen.has(target) || !map.has(target)) return current
    seen.add(target)
    current = map.get(target)
  }
}

// source-order entries matching a predicate, as { name, value, resolved }
const entriesFrom = (map, predicate) =>
  [...map.entries()]
    .filter(([name]) => predicate(name))
    .map(([name, value]) => ({ name, value, resolved: resolveRef(value, map) }))

// ---- primitive colour ladders (one declaration, both modes) -----------------

// A rung is `--<family>-<digits>` (e.g. --warm-950). The families are DERIVED
// from the generated file, in declaration order — never hardcoded.
//
// This list used to be spelled out, and it rotted exactly as you would expect:
// the warm-gray migration (d4dcfdd, 4d9c25d) deleted the `grey` and `indigo`
// ladders and added `warm`, and the story copy of this parser was not updated.
// `grey` then parsed zero rungs and threw at module load, taking every BrandKit
// story down with it, while `warm` — the family the whole theme is built on —
// never rendered at all. Deriving means the palette view tracks `tokens.json`
// by construction.
const RUNG = /^([a-z]+)-(\d+)$/

const FAMILIES = [
  ...new Set([...baseDecls.keys()].map((name) => RUNG.exec(name)?.[1]).filter(Boolean)),
]

export const colors = FAMILIES.map((family) => ({
  family,
  rungs: entriesFrom(baseDecls, (name) => {
    const match = RUNG.exec(name)
    return match !== null && match[1] === family
  }),
}))

// ---- shape & space (one declaration, both modes) ---------------------------

export const radius = entriesFrom(baseDecls, (name) => name.startsWith('radius-'))
export const spacing = entriesFrom(baseDecls, (name) => name.startsWith('spacing-'))

// The touch target and the two stroke widths. They sit beside radius and
// spacing in the generated file (tokens.css:140-142) and are the same kind of
// claim — a measurement the kit makes once, for both modes.
export const sizes = entriesFrom(baseDecls, (name) => name.startsWith('size-'))

// ---- the semantic layer, per theme -----------------------------------------

// What values are FOR, grouped by role in source order.
const SEMANTIC_PREFIXES = ['surface-', 'text-', 'action-', 'border-']

// `st-` does not match `status-`: the third character is a hyphen in one and an
// `a` in the other. st-provis is excluded by contract (a blue alias, not a tone
// the main scale defines).
// `all` is the unfiltered surface, and it is not a convenience. Every other
// export here is a filter, and a filter's silence has the two causes this
// project keeps paying for: the token is absent, or the predicate never matched
// it. Measured today, four declarations — --hairline, --quiet-fill, --scrim,
// --illustration-ink — match no category above, and st-provis-fg/bg are
// excluded from statusCompat by contract. Without `all` those six are parsed
// and then silently dropped, and no view can show what it never receives.
const themeView = (map) => ({
  semantic: entriesFrom(map, (name) => SEMANTIC_PREFIXES.some((p) => name.startsWith(p))),
  status: entriesFrom(map, (name) => name.startsWith('status-')),
  statusCompat: entriesFrom(map, (name) => name.startsWith('st-') && !name.startsWith('st-provis')),
  all: entriesFrom(map, () => true),
})

export const byTheme = {
  dark: themeView(themeMaps.dark),
  light: themeView(themeMaps.light),
}

// ---- type (one declaration, both modes) ------------------------------------

// The three family stacks, whole. A stack is a fallback chain and the fallbacks
// are the interesting part — "Sora" is what you get if it loaded, and the four
// names after it are what the type actually renders as if it did not.
export const fonts = entriesFrom(baseDecls, (name) => name.startsWith('font-'))

// One object per style rather than four loose values — the shape the kit
// declares (`--<scale>-size/-line/-weight/-track`).
const TYPE_SCALES = [
  'heading-md',
  'label-lg',
  'label-md',
  'label-sm',
  'body-md',
  'caption',
  'data-md',
  'data-input',
]

export const type = TYPE_SCALES.map((scale) => ({
  name: scale,
  size: baseDecls.get(`${scale}-size`) ?? '',
  line: baseDecls.get(`${scale}-line`) ?? '',
  weight: baseDecls.get(`${scale}-weight`) ?? '',
  track: baseDecls.get(`${scale}-track`) ?? '',
}))

// ---- the utility roster ----------------------------------------------------
//
// utilities.css writes a prose comment above every rule already, so the sheet
// carries the class name, the declarations AND the explanation. What it did not
// carry is the treatment — whether a class can be shown as a rendered specimen
// at all — so a `@kind` annotation goes on its own line inside that same
// comment. No new syntax: it is the JSDoc idiom the kit already uses on all 46
// components (D61), in the comment shape the file already has.
//
//   /* Eyebrow: the uppercase caption that labels a section or metric.
//      @kind sample */
//
// There is NO DEFAULT. A missing or unrecognised annotation yields
// `kind: undefined`, which the catalog's roster test reds — so a new utility
// cannot land without choosing a treatment.

// A rule, with the comment block immediately above it if there is one.
//
// The comment body is `(?:[^*]|\*(?!\/))*` — every character that is not a
// comment terminator — rather than a lazy `[\s\S]*?`. That is not a
// micro-optimisation, it is the correctness of the first rule. `.surface` sits
// under the sheet's twenty-line header, and a lazy body BACKTRACKS across the
// header's `*/` when the following `\s*\.name\s*\{` does not match, swallowing
// both comments and putting the whole file preamble on the Type screen as the
// class's explanation. Forbidding `*/` inside makes each comment atomic, so the
// match can only ever start at the rule's own comment.
const UTILITY_RULE = /(?:\/\*((?:[^*]|\*(?!\/))*)\*\/\s*)?\.([a-z][a-z0-9-]*)\s*\{([^}]*)\}/g

// Property names include the vendor-prefixed shapes (-webkit-…) and custom
// properties, so the leading hyphens are part of the name.
const UTILITY_DECLARATION = /(-{0,2}[a-z][a-z0-9-]*)\s*:\s*([^;]+?)\s*;/g

const KIND_ANNOTATION = /^[ \t*]*@kind[ \t]+([a-z-]+)[ \t]*$/m

// The comment, minus the annotation line, minus the per-line comment furniture,
// minus the `Name:` label the house style opens with — the label is the class
// name again, and the roster already has that field.
function prose(comment, name) {
  const text = (comment ?? '')
    .replace(KIND_ANNOTATION, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*?\s?/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.replace(new RegExp(`^${name.replace(/-/g, '[ -]')}:\\s*`, 'i'), '')
}

export const utilities = [...utilitiesRaw.matchAll(UTILITY_RULE)].map(
  ([, comment, name, body]) => ({
    name,
    doc: prose(comment, name),
    kind: KIND_ANNOTATION.exec(comment ?? '')?.[1],
    declarations: [...body.matchAll(UTILITY_DECLARATION)].map(([, prop, value]) => ({
      prop,
      value,
    })),
  }),
)

// ---- fail loudly, not silently ---------------------------------------------
//
// This module's contract is these categories. An empty one is a parse defect
// (the vendored file changed shape), not a data fact — so it throws instead of
// letting the palette view render an empty section.
if (baseDecls.size === 0) {
  throw new Error('tokens.css: parsed zero root declarations — the declaration shape may have changed')
}

for (const theme of THEMES) {
  for (const [label, list] of Object.entries(byTheme[theme])) {
    if (list.length === 0) {
      throw new Error(`tokens.css: parsed zero ${label} tokens for the ${theme} theme`)
    }
  }
}

// Its own probe rather than a row in the loop below: that loop's message names
// tokens.css's root block, and this roster comes from a different sheet.
if (utilities.length === 0) {
  throw new Error('utilities.css: parsed zero utility rules — the sheet may have changed shape')
}

for (const [label, list] of Object.entries({ colors, radius, spacing, sizes, fonts, type })) {
  if (list.length === 0) {
    throw new Error(`tokens.css: parsed zero ${label} tokens — the root block may have changed shape`)
  }
}

// Reach probe for the overlay. Two maps built by a split that has quietly
// stopped matching would be IDENTICAL and would render without complaint — the
// theme switch would just do nothing, which is the defect this parse exists to
// fix. So require at least one name the light block genuinely overrides.
const overridden = [...lightDecls].filter(
  ([name, value]) => darkDecls.has(name) && darkDecls.get(name) !== value,
)
if (overridden.length === 0) {
  throw new Error(
    'tokens.css: the light block overrides nothing the dark block declares — the two theme surfaces parsed identical',
  )
}

// Kept, though deriving FAMILIES from the same map the rungs are filtered out
// of makes it unreachable by construction: it is the tripwire for the two ever
// being fed from different surfaces again, which is precisely how the `grey`
// crash happened. The `colors` entry in the loop above catches the other half —
// the rung shape changing so that nothing parses at all.
if (colors.some(({ rungs }) => rungs.length === 0)) {
  const empty = colors.find(({ rungs }) => rungs.length === 0)
  throw new Error(`tokens.css: colour family "${empty.family}" parsed with no rungs`)
}

for (const scale of type) {
  if (!scale.size || !scale.line || !scale.weight || !scale.track) {
    throw new Error(
      `tokens.css: type scale "${scale.name}" is missing its -size/-line/-weight/-track declarations`,
    )
  }
}

export default { colors, byTheme, radius, spacing, sizes, fonts, type, utilities, THEMES }
