// What is wrong with a document, named.
//
// RETURNS PROBLEMS, NEVER THROWS, NEVER REPAIRS. This is the contract
// `resolveFlowSteps` already sets in this repo — `{ steps, missing }` rather
// than an exception or a silently shortened strip — and the reason is the same:
// the catalog's job is to REPORT a gap with the id in hand. A validator that
// repaired would hide the edit that caused the problem; one that threw would
// take the whole editor down over one bad node.
//
// Every check here also exists in the UI as an affordance that cannot express
// the bad state. The duplication is deliberate. The UI stops a person; this
// stops a document that arrived some other way — a stale `localStorage` payload,
// a published file edited by hand, a future importer.

import { walk } from './document.js'
import { resolveComponent, isSlug } from './resolve.js'
import { datasetIds } from './datasets.js'
import { SPACE_TOKENS } from './tokens.js'

const problem = (code, path, message) => ({ code, path, message })

const SPACE_FIELDS = ['gap', 'padding']
const LAYOUTS = ['stack', 'grid']

/** A prop value the model allows. Anything else is a raw object or array. */
function propProblem(nodeId, name, value, { inputs }) {
  if (value === null) return null
  const t = typeof value
  if (t === 'string' || t === 'number' || t === 'boolean') return null

  if (t === 'object' && !Array.isArray(value)) {
    if ('$data' in value) {
      return datasetIds.includes(value.$data)
        ? null
        : problem('unknown-dataset', `${nodeId}.${name}`, `\`${value.$data}\` names no vendored dataset. Capture one with scripts/fetch-all.sh.`)
    }
    if ('$prop' in value) {
      // A dotted path binds to the ROOT input — `scene.number` needs `scene`.
      const root = String(value.$prop).split('.')[0]
      return inputs.has(root)
        ? null
        : problem('unknown-input', `${nodeId}.${name}`, `\`${value.$prop}\` names no declared input of this document.`)
    }
  }

  // The D5 rule, enforced in the model and not only in the inspector: an array
  // or a bare object in a prop slot is fabricated data with no provenance. Bind
  // it to a capture or to an input instead.
  return problem('raw-value', `${nodeId}.${name}`, `\`${name}\` holds literal ${Array.isArray(value) ? 'array' : 'object'} data. Bind it to a dataset or an input instead.`)
}

/**
 * @param {object} doc
 * @param {Map<string, object>} [composed] Authored documents, by bare slug.
 * @returns {Array<{code: string, path: string, message: string}>}
 */
export function validate(doc, composed = new Map()) {
  const problems = []
  if (!doc?.root) return [problem('no-root', doc?.slug ?? '?', 'A document must have a root node.')]

  const inputs = new Set((doc.inputs ?? []).map((i) => i.name))
  const seen = new Set()

  for (const node of walk(doc.root)) {
    if (seen.has(node.id)) {
      problems.push(problem('duplicate-id', node.id, `Two nodes share the id \`${node.id}\`.`))
    }
    seen.add(node.id)

    if (node.type === 'layout') {
      if (!LAYOUTS.includes(node.layout)) {
        problems.push(problem('unknown-layout', node.id, `\`${node.layout}\` is not a layout. Use ${LAYOUTS.join(' or ')}.`))
      }
      for (const field of SPACE_FIELDS) {
        const value = node[field]
        if (value === undefined) continue
        if (!SPACE_TOKENS.includes(value)) {
          // The message names the scale rather than the offender alone, because
          // the mistake this catches is almost always a length (`24px`) written
          // where a name belongs.
          problems.push(problem('not-a-space-token', `${node.id}.${field}`, `\`${value}\` is not a space token. The scale is ${SPACE_TOKENS.join(', ')}.`))
        }
      }
    } else if (node.type === 'component') {
      const resolved = resolveComponent(node.component, composed)
      if (resolved.missing) {
        problems.push(problem('unresolved-slug', node.id, `\`${node.component}\` names no component.`))
      }
      for (const [name, value] of Object.entries(node.props ?? {})) {
        const found = propProblem(node.id, name, value, { inputs })
        if (found) problems.push(found)
      }
    } else {
      problems.push(problem('unknown-node', node.id ?? '?', `\`${node.type}\` is not a node type.`))
    }
  }

  problems.push(...cycleProblems(doc, composed))
  return problems
}

/**
 * A composed component that reaches itself.
 *
 * Left to the renderer this is not a wrong picture, it is an infinite one — the
 * tab stops responding and nothing says why. It is also easy to author by
 * accident the moment composed components can hold composed components, which
 * is exactly what the recursive model buys, so the cost of that model is this
 * check.
 */
function cycleProblems(doc, composed) {
  const problems = []

  const visit = (slug, stack) => {
    if (stack.includes(slug)) {
      problems.push(problem('cycle', doc.slug ?? '?', `Reference cycle: ${[...stack, slug].join(' -> ')}.`))
      return
    }
    const resolved = resolveComponent(slug, composed)
    if (resolved.kind !== 'composed') return
    for (const node of walk(resolved.document.root)) {
      if (node.type === 'component' && isSlug(node.component)) visit(node.component, [...stack, slug])
    }
  }

  const self = doc.slug ? `@${doc.slug}` : null
  for (const node of walk(doc.root)) {
    if (node.type !== 'component' || !isSlug(node.component)) continue
    visit(node.component, self ? [self] : [])
  }
  return problems
}
