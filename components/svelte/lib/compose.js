/**
 * Reading a composed document: the parts that are the same wherever it renders.
 *
 * A composed document is JSON — a tree of layout nodes and component references
 * with token names for its dimensions and symbolic references for its data. Two
 * surfaces render one: `Composed.svelte` here, which is what a consuming app
 * mounts, and the catalog's editor, which draws the same tree with selection
 * chrome around every node.
 *
 * THIS MODULE IS WHY THERE IS ONE OF THEM AND NOT TWO. Left to themselves the
 * two renderers would each carry their own copy of "what `gap: 'lg'` means" and
 * "how a `$prop` resolves", and this repo has the scar from exactly that shape:
 * `tokens/parse.js` exists because the token parser lived twice, the copies
 * drifted, and the drift shipped a crash. The pattern that replaced it is the
 * one used here — one implementation, each surface points it at itself.
 *
 * IT IS PURE, AND IT HAS TO BE. It ships inside the library, so it is evaluated
 * in every consumer that imports it. No bundler-specific module globbing, no raw
 * text imports, no filesystem, no framework — `icon-inventory.js`'s header
 * records what happens otherwise: a Vite-only construct bundles clean under
 * esbuild and throws in the consumer's browser, a defect class the build cannot
 * see. (`check-consumer` greps for those constructs as text, so naming them
 * literally here would trip it; that it cannot tell a comment from code is a
 * small gap in the gate, noted rather than worked around further.)
 *
 * WHAT IS DELIBERATELY NOT HERE: anything that resolves a slug to a COMPONENT,
 * or a dataset id to ROWS. Both are host questions. The catalog answers them
 * from its barrel and its captures; an app answers them from its own imports and
 * its own live data. Baking either in would make a document mean "the catalog's
 * scenes" rather than "the scenes", which is the difference between a portable
 * format and a catalog file format.
 */

/** Depth-first, parents before children. The one traversal both renderers use. */
export function* walk(node) {
  if (!node) return
  yield node
  for (const child of node.children ?? []) yield* walk(child)
}

/** `@Name` — the sigil marks a reference, so a bare string is never mistaken for one. */
export const isSlug = (value) => typeof value === 'string' && /^@[A-Za-z]/.test(value)

/** `@MetricCard` -> `MetricCard`. */
export const bareSlug = (slug) => (isSlug(slug) ? slug.slice(1) : slug)

/**
 * A library slug is the PascalCase half of the namespace.
 *
 * The whole collision story rests on this one character: published exports are
 * PascalCase and authored slugs are kebab-case, so the two halves of a single
 * flat namespace cannot overlap — no lookup, no precedence rule, and no
 * possibility of an authored document shadowing an export.
 */
export const isLibrarySlug = (slug) => /^@[A-Z]/.test(slug ?? '')

/** Every slug a tree references, deduplicated. */
export function slugsIn(root) {
  const found = new Set()
  for (const node of walk(root)) {
    if (node.type === 'component' && node.component) found.add(node.component)
  }
  return [...found]
}

/**
 * A token name -> the custom property that carries it.
 *
 * The ONE place a name becomes CSS, and the reason a document holds `lg` rather
 * than `24px`: a web target substitutes `var(--spacing-lg)`, and a target with
 * no CSS at all substitutes its own scale from the same name. A length in the
 * document would have decided that for every platform at once.
 */
export const spaceVar = (name) => (name ? `var(--spacing-${name})` : null)

/** Layout intent -> flexbox alignment. */
export const ALIGN = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch' }

/** The alignment a stack applies, defaulting to stretch. Meaningless on a grid. */
export const alignFor = (node) =>
  node?.layout === 'stack' ? (ALIGN[node.align] ?? 'stretch') : null

/**
 * A layout node -> the custom properties its rule reads.
 *
 * Custom properties rather than direct declarations, so the CSS lives in a
 * stylesheet where it can be read and reviewed, and the inline style carries
 * only the three values that vary per node.
 */
export const layoutStyle = (node) =>
  [
    node.gap ? `--node-gap:${spaceVar(node.gap)}` : null,
    node.padding ? `--node-padding:${spaceVar(node.padding)}` : null,
    node.layout === 'grid' ? `--node-columns:${node.columns ?? 2}` : null,
  ]
    .filter(Boolean)
    .join(';')

/**
 * One prop value, resolved.
 *
 * THREE KINDS, and the split is the no-fabrication rule made structural:
 *
 *   a scalar      'Runtime', 42, true — a label is not fabricated data
 *   { $data }     a named collection the HOST supplies
 *   { $prop }     an input of the enclosing document
 *
 * There is deliberately no fourth. A literal array or object in a prop slot is
 * invented data with no provenance, and it is refused rather than rendered.
 *
 * A MISS IS REPORTED, not resolved to undefined: a component handed `undefined`
 * falls back to its own default and draws its empty state, which reads as a
 * design decision rather than a broken binding.
 *
 * @param {unknown} value
 * @param {{inputs?: object, data?: object}} context
 * @returns {{value: unknown} | {missing: string}}
 */
export function resolveValue(value, { inputs = {}, data = {} } = {}) {
  if (value === null || typeof value !== 'object') return { value }

  if ('$data' in value) {
    if (!(value.$data in data)) return { missing: value.$data }
    let rows = data[value.$data]

    // `at` addresses ONE element, which the single-entity props need — SceneDetail
    // takes a scene, not scenes. Without it those props could not be bound at
    // all and half the rows and cards would be uncomposable.
    if (typeof value.at === 'number') {
      if (!Array.isArray(rows) || value.at < 0 || value.at >= rows.length) {
        return { missing: `${value.$data}[${value.at}]` }
      }
      return { value: rows[value.at] }
    }
    // `slice` because a real subset is honest and a hand-typed row is not.
    if (Array.isArray(value.slice) && Array.isArray(rows)) rows = rows.slice(value.slice[0], value.slice[1])
    return { value: rows }
  }

  if ('$prop' in value) {
    // Property access along a dotted path, and nothing else. `scene.number` is
    // the ordinary case — a card takes a `scene` and shows a field of it. No
    // operators, no calls, no conditionals: an expression language is a
    // programming language, and one in a document format is code generation
    // wearing a disguise.
    let current = inputs
    for (const segment of String(value.$prop).split('.')) {
      if (current === null || typeof current !== 'object') return { missing: value.$prop }
      current = current[segment]
    }
    return current === undefined ? { missing: value.$prop } : { value: current }
  }

  return { value }
}

/**
 * Every prop of a node.
 *
 * A prop that misses is OMITTED and named in `missing`, so the component falls
 * back to its own default while the renderer still has something to report.
 *
 * @returns {{props: object, missing: string[]}}
 */
export function resolveProps(props, context = {}) {
  const resolved = {}
  const missing = []
  for (const [name, value] of Object.entries(props ?? {})) {
    const found = resolveValue(value, context)
    if ('missing' in found) missing.push(`${name} → ${found.missing}`)
    else resolved[name] = found.value
  }
  return { props: resolved, missing }
}

/**
 * The inputs a composed component is invoked with, filled in from its own
 * declared defaults where the call site said nothing.
 *
 * Its OWN declaration, because a composed document has no component to fall back
 * to — that declaration is the only place one of its defaults can live.
 */
export function withDefaults(declared, given = {}) {
  const out = { ...given }
  for (const input of declared ?? []) {
    if (out[input.name] === undefined && input.default !== undefined) out[input.name] = input.default
  }
  return out
}

/**
 * A slug -> what it names, given what the host has.
 *
 * The host supplies both maps. `components` is name -> component (a barrel
 * namespace object does); `documents` is slug -> authored document.
 *
 * Returns `{missing}` rather than throwing — the contract `resolveFlowSteps`
 * already sets in this repo. A renamed component should surface as a named gap
 * the author can act on, not as an empty box that reads as a layout bug.
 */
export function resolveComponent(slug, { components = {}, documents = {} } = {}) {
  if (!isSlug(slug)) return { missing: String(slug ?? '') }
  const name = bareSlug(slug)

  if (isLibrarySlug(slug)) {
    const component = components[name]
    return component ? { kind: 'library', slug, component } : { missing: slug }
  }

  const document = documents instanceof Map ? documents.get(name) : documents[name]
  return document ? { kind: 'composed', slug, document } : { missing: slug }
}
