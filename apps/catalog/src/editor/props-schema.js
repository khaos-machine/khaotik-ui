// What a library component's props ARE, read out of the component itself.
//
// WHY DERIVED rather than a hand-authored manifest: a manifest is a second copy
// of a fact the components already state, and this repo has the scar three
// times — `tokens/parse.js` (two parsers drifted and shipped a crash),
// `icon-inventory.js` (a transcribed glyph list goes stale silently), and
// `lib/types.js`. A props manifest would go stale the first time a prop is
// renamed, and it would go stale INVISIBLY: the editor still renders, it just
// offers a control for a prop nobody accepts.
//
// WHY THE JSDoc `Props` TYPEDEF is the source, rather than the shipped `.d.ts`:
//
//   - The `.d.ts` is TypeScript text, not importable at runtime — it would have
//     to be read `?raw` anyway, so the technique is identical and the source is
//     one derivation further from the truth.
//   - `build-types` GENERATES the `.d.ts` from this very block. It is upstream,
//     not a parallel description.
//   - `emitDts` flattens `import('./lib/types.js').StatusTone` into an import
//     reference that would have to be chased back to source regardless.
//
// WHY IT IS SAFE, which matters because this repo gates against drift
// everywhere: all 49 components carry a `Props` typedef; `check-consumer`
// already fails the build when a prop reaches the shipped `.d.ts` without a
// JSDoc description, so an undocumented prop cannot exist; and the measured
// drift between the `$props()` destructure and the typedef is currently zero,
// held there by `props-typedef-parity.test.js`.
//
// WHERE THIS LIVES. `import.meta.glob` is Vite-only, and `icon-inventory.js`'s
// header draws the line this module inherits: it is a landmine in the SHIPPED
// library (esbuild bundles it with exit 0, then it throws in the consumer's
// browser) and it is ordinary dev tooling in the catalog, where Vite is
// guaranteed and it is not public surface. `check-compile` is what proves it.

const sources = import.meta.glob('../../../../components/svelte/*.svelte', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Shared named types — `StatusTone` and friends. Resolved so a prop declared
// `StatusTone` offers its seven values rather than a text box.
const sharedTypes = import.meta.glob('../../../../components/svelte/lib/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** `{a, {b}}` from position `start` — brace-balanced, so a nested type survives. */
function readBraced(text, start) {
  if (text[start] !== '{') return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth -= 1
      if (depth === 0) return { value: text.slice(start + 1, i), end: i + 1 }
    }
  }
  return null
}

/** A JSDoc block with its comment furniture removed, one fact per line. */
const undecorate = (block) =>
  block
    .split('\n')
    .map((line) => line.replace(/^\s*\*ic?\s?/, '').replace(/^\s*\*\s?/, ''))
    .join('\n')

/**
 * The `Props` typedef block of a component, undecorated — or null.
 *
 * Scoped to the block that declares `@typedef {Object} Props` rather than
 * scanning the whole file, because several components declare OTHER typedefs
 * beside it (MetaStrip's `MetaItem`, Settings' `Category`), and their
 * `@property` lines are not props.
 */
export function propsBlock(source) {
  for (const [, body] of source.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const text = undecorate(body)
    if (/@typedef\s*\{Object\}\s*Props\b/.test(text)) return text
  }
  return null
}

/**
 * `[{ name, type, optional, default, description }]` for one component's source.
 *
 * THE TYPE MATCHER MUST BALANCE BRACES. `@property {{lines?: number}} [stats]`
 * defeats a `\{[^}]*\}` matcher, which stops at the inner `}` and reads the
 * name as `number}}`. Real props across the kit are that shape — object-typed
 * options such as `stats` and `images` — so the naive matcher does not fail
 * loudly, it silently mis-reads part of the surface.
 */
export function parseProps(source) {
  const text = propsBlock(source)
  if (!text) return []

  const out = []
  const marker = /@property\s+/g
  let match
  while ((match = marker.exec(text))) {
    const braced = readBraced(text, match.index + match[0].length)
    if (!braced) continue

    const rest = text.slice(braced.end)
    // `[name]`, `[name=default]`, or a bare `name`.
    const named = /^\s*(?:\[(\w+)(?:=([^\]]*))?\]|(\w+))\s*/.exec(rest)
    if (!named) continue

    const [whole, optionalName, defaultValue, requiredName] = named
    // Everything up to the next tag is this prop's prose. Multi-line
    // descriptions are real — several run to two lines.
    const description = rest
      .slice(whole.length)
      .split(/\n\s*@/)[0]
      .replace(/\s+/g, ' ')
      .trim()

    out.push({
      name: optionalName ?? requiredName,
      type: braced.value.replace(/\s+/g, ' ').trim(),
      optional: Boolean(optionalName),
      ...(defaultValue === undefined ? {} : { default: defaultValue }),
      description,
    })
    marker.lastIndex = braced.end
  }
  return out
}

/**
 * Top-level entries of `let { … } = $props()`, comments stripped.
 *
 * Lifted from `props-optionality.test.js`, which has needed exactly this loop
 * since #31 and balances brackets for the same reason `parseProps` balances
 * braces — a default value can itself be an object, an array or an arrow. It is
 * exported from here and imported back by that test so the two cannot drift.
 */
export function propEntries(source) {
  const match = source.match(/let\s*\{(.*?)\}\s*=\s*\$props\(\)/s)
  if (!match) return []

  const body = match[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

  const parts = []
  let depth = 0
  let current = ''
  for (const ch of body) {
    if ('([{'.includes(ch)) depth++
    if (')]}'.includes(ch)) depth--
    if (ch === ',' && depth === 0) {
      parts.push(current)
      current = ''
    } else current += ch
  }
  parts.push(current)

  return parts.map((p) => p.trim()).filter(Boolean)
}

/**
 * Just the names from `propEntries`.
 *
 * The PROP is the key, not the local binding: `document: doc = undefined` is a
 * prop called `document` that the component reads as `doc`. Splitting on `=`
 * alone yielded `document: doc`, which failed the word test and dropped the prop
 * entirely — so a component using a renamed destructure looked to the parity gate
 * like it declared a prop it does not take. Found by `Composed`, which is the
 * first component in the kit to rename one.
 */
export const propNames = (source) =>
  propEntries(source).map((entry) => entry.split(/[:=]/)[0].trim()).filter((n) => /^\w+$/.test(n))

// Every union of string literals declared anywhere in the shared types module,
// so `StatusTone` resolves to its seven values instead of falling through to a
// text box. Local unions (ConfirmDialog's `ConfirmTone`) are resolved from the
// component's own source at classify time.
const UNION_TYPEDEF = /@typedef\s*\{([^}]*)\}\s*(\w+)/g
function unionsIn(source) {
  const found = new Map()
  for (const [, body, name] of source.matchAll(UNION_TYPEDEF)) {
    const values = [...body.matchAll(/'([^']+)'/g)].map((m) => m[1])
    // A union, not a shape: every arm has to be a string literal, or
    // `{Object}` typedefs would register as enums with no values.
    if (values.length > 1 && values.length === body.split('|').length) found.set(name, values)
  }
  return found
}

const SHARED_UNIONS = new Map(
  Object.values(sharedTypes).flatMap((src) => [...unionsIn(src)]),
)

/**
 * A declared type -> the control the inspector can draw for it.
 *
 * `kind` is what the inspector switches on. The three that matter for the
 * no-fabrication rule are `collection`, `entity` and `unknown`: those offer a
 * dataset or `$prop` binding and NO free-text field, so a caller cannot type a
 * scene into a page.
 */
export function classify(type, { localUnions = new Map() } = {}) {
  const raw = type
  // `X | null` and `X | undefined` are the same control as `X`.
  const bare = raw.replace(/\s*\|\s*(null|undefined)\b/g, '').trim()

  if (/^import\(['"]svelte['"]\)\.Snippet/.test(bare)) return { kind: 'snippet', raw }
  if (/=>/.test(bare)) return { kind: 'callback', raw }

  const inline = bare.split('|').map((s) => s.trim())
  if (inline.length > 1 && inline.every((s) => /^'[^']*'$/.test(s))) {
    return { kind: 'enum', values: inline.map((s) => s.slice(1, -1)), raw }
  }

  // A named union, shared or local. `import('./lib/types.js').StatusTone` and a
  // bare `StatusTone` are the same type written two ways.
  const named = /(?:^|\.)(\w+)$/.exec(bare)?.[1]
  const union = localUnions.get(named) ?? SHARED_UNIONS.get(named)
  if (union) return { kind: 'enum', values: union, raw }

  if (bare === 'boolean') return { kind: 'boolean', raw }
  if (bare === 'number') return { kind: 'number', raw }
  if (bare === 'string' || bare === 'string|number' || /^string \| number$/.test(bare)) {
    return { kind: 'string', raw }
  }

  // An array of ANONYMOUS objects — `readonly {src?: string}[]`. Still a
  // collection, and classifying it `unknown` would be a quiet demotion: both
  // offer a binding rather than a text box, but only `collection` lets the
  // inspector match a dataset by shape. Three real props are this shape.
  if (/^(?:readonly\s+)?\{[\s\S]*\}\s*\[\]$/.test(bare)) return { kind: 'collection', entity: null, raw }

  // Imported record arrays carry the same collection shape as named arrays.
  const importedCollection = /^(?:readonly\s+)?import\(['"][^'"]+['"]\)\.(\w+)\[\]$/.exec(bare)
  if (importedCollection) return { kind: 'collection', entity: importedCollection[1], raw }

  const collection = /^(?:readonly\s+)?(\w[\w.]*)\[\]$/.exec(bare) ?? /^(?:readonly\s+)?Array<(.+)>$/.exec(bare)
  if (collection) return { kind: 'collection', entity: collection[1].split('.').pop(), raw }

  if (/^Record</.test(bare) || bare === 'any' || bare === 'Object' || bare === 'object') {
    return { kind: 'unknown', raw }
  }
  if (bare.startsWith('{')) return { kind: 'entity', entity: null, raw }
  if (/^(?:Readonly<)?\w+>?$/.test(bare)) {
    return { kind: 'entity', entity: bare.replace(/^Readonly<|>$/g, ''), raw }
  }
  return { kind: 'unknown', raw }
}

/** `path/Name.svelte` -> `Name`. */
const nameOf = (path) => path.split('/').pop().replace('.svelte', '')

/** `{ Name: [{ name, type, control, … }] }` for every library component. */
export const schemas = Object.fromEntries(
  Object.entries(sources).map(([path, src]) => {
    const localUnions = unionsIn(src)
    return [
      nameOf(path),
      parseProps(src).map((prop) => ({ ...prop, control: classify(prop.type, { localUnions }) })),
    ]
  }),
)

/** `{ Name: source }` — the raw component sources, for the D11 source panel. */
export const componentSources = Object.fromEntries(
  Object.entries(sources).map(([path, src]) => [nameOf(path), src]),
)

/** `{ Name: 'components/svelte/Name.svelte' }` — repo-relative, for the source panel's caption. */
export const componentPaths = Object.fromEntries(
  Object.keys(sources).map((path) => [nameOf(path), `components/svelte/${nameOf(path)}.svelte`]),
)
