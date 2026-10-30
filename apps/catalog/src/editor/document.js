// The document model: what a composed component IS, and the operations that
// change one.
//
// THE MODEL IS RECURSIVE, NOT TIERED. A composed component is a component. It
// holds published components and other composed components; a page is a
// composed component that happens to be screen-shaped; a flow is an ordered
// list of them. One node type, one reference syntax, one renderer, all the way
// up. The alternative — a separate Page type above a Component type — was
// rejected because every operation would then exist twice and the second copy
// is where the two drift.
//
// EVERY OPERATION IS PURE and returns a new root. That is not ceremony:
// `$state` in Svelte 5 tracks reassignment, so returning a new tree makes
// reactivity fall out of the data structure rather than out of a mutation
// protocol nobody can see. It also makes undo a stack of roots and makes every
// test here a pure input/output assertion with no DOM.
//
// WHAT IS DELIBERATELY ABSENT, and the reason is the same for all of them:
// `class`, `style`, any px, any colour, any raw CSS, any free-form `data`.
// Those are the doors a code generator escapes through. A document that can
// carry arbitrary CSS is a document only a web target can honour, and the whole
// point of the format is that it does not know what it will be rendered by.

export const SCHEMA_VERSION = 1

/**
 * @typedef {Object} ComponentNode
 * @property {'component'} type
 * @property {string} id Unique within the document. Stable across edits.
 * @property {string} component A SLUG — '@MetricCard' or '@scene-card'.
 * @property {Record<string, PropValue>} props
 */

/**
 * @typedef {Object} LayoutNode
 * @property {'layout'} type
 * @property {string} id
 * @property {'stack'|'grid'} layout
 * @property {'row'|'column'} [direction] stack only
 * @property {number} [columns] grid only
 * @property {SpaceToken} [gap] A TOKEN NAME. Never a length.
 * @property {SpaceToken} [padding] A TOKEN NAME. Never a length.
 * @property {'start'|'center'|'end'|'stretch'} [align]
 * @property {Array<LayoutNode|ComponentNode>} children
 */

/** @typedef {LayoutNode|ComponentNode} Node */
/** @typedef {string|number|boolean|null|DataRef|PropRef} PropValue */

/**
 * A vendored dataset, named rather than inlined.
 *
 * `slice` because the registry already does exactly this (`fixtures.js` —
 * `scenesData.slice(0, 6)`): a real subset is honest, a hand-typed row is not.
 *
 * `at` addresses ONE element, which ten props across the kit need — SceneDetail
 * takes a `scene`, ProjectCard a `project`, Portrait a `name`. Without it
 * every single-entity prop would be unbindable and half the rows and cards
 * could not be composed at all. It is an index into the capture, not a value
 * copied out of it, so the row still comes from the daemon.
 *
 * @typedef {{ $data: string, slice?: [number, number], at?: number }} DataRef
 */

/**
 * An input of the ENCLOSING document. A dotted path is allowed
 * (`{ $prop: 'scene.number' }`) because a card that takes a `scene` and shows
 * `scene.number` is the ordinary case. PROPERTY ACCESS ONLY — no operators, no
 * calls, no conditionals. An expression language is a programming language, and
 * putting one in the document format is code generation wearing a disguise.
 * @typedef {{ $prop: string }} PropRef
 */

/** @typedef {'2xs'|'xs'|'sm'|'md'|'lg'|'xl'|'2xl'} SpaceToken */

/** Depth-first, parents before children. The one traversal everything else uses. */
export function* walk(node) {
  if (!node) return
  yield node
  for (const child of node.children ?? []) yield* walk(child)
}

/**
 * The next free `nN` id for a tree.
 *
 * Counted from the ids already present rather than drawn from a random source,
 * so the same sequence of edits produces the same document. A random id would
 * make every test assert around a value it cannot predict, and would make two
 * people's copies of one document differ in bytes while being identical in
 * meaning.
 */
export function mintId(root) {
  let highest = -1
  for (const node of walk(root)) {
    const match = /^n(\d+)$/.exec(node.id ?? '')
    if (match) highest = Math.max(highest, Number(match[1]))
  }
  return `n${highest + 1}`
}

/** A layout node. `children` always an array, so no caller has to guard it. */
export const layoutNode = (partial = {}) => ({
  type: 'layout',
  id: partial.id ?? 'n0',
  layout: partial.layout ?? 'stack',
  ...(partial.layout === 'grid' ? { columns: partial.columns ?? 2 } : { direction: partial.direction ?? 'column' }),
  gap: partial.gap ?? 'md',
  ...(partial.padding ? { padding: partial.padding } : {}),
  ...(partial.align ? { align: partial.align } : {}),
  children: partial.children ?? [],
})

/**
 * A component node. Props start EMPTY, not pre-filled with the component's
 * defaults: every prop in the kit carries an explicit default already
 * (props-optionality.test.js pins it), so an absent prop and a prop set to its
 * default render identically — and only one of the two says "nobody chose
 * this". Copying defaults in would freeze them, so a later change to the
 * component's default would not reach documents written before it.
 */
export const componentNode = (slug, partial = {}) => ({
  type: 'component',
  id: partial.id ?? 'n0',
  component: slug,
  props: partial.props ?? {},
})

/**
 * A new document.
 *
 * `kind` is 'component' or 'screen', and the two differ ONLY in where the entry
 * files in the nav — same shape, same renderer, same operations. That is the
 * recursive model paying off: a screen is not a container for components, it is
 * one.
 *
 * `component` covers everything below screen-size — a card, a row, a panel, a
 * sidebar. No third name is minted for the middle sizes, because a name earns
 * its place from an observed need and "a panel is not a card" has not yet cost
 * anything.
 *
 * `variantOf` names the thing this document is competing to become. A variant is
 * a candidate replacement rather than a new thing, so it does not file in the nav
 * on its own — it hangs off what it is a variant of. See registry.js.
 */
export const createDocument = ({ kind = 'component', slug, name, frame } = {}) => ({
  schema: SCHEMA_VERSION,
  kind,
  slug,
  name: name ?? slug,
  inputs: [],
  ...(frame ? { frame } : {}),
  root: layoutNode({ id: 'n0', layout: 'stack', direction: 'column', gap: 'md' }),
})

/** The node with this id, or null. */
export function findNode(root, id) {
  for (const node of walk(root)) if (node.id === id) return node
  return null
}

/** The layout node holding this id, or null when it is the root or absent. */
export function parentOf(root, id) {
  for (const node of walk(root)) {
    if ((node.children ?? []).some((c) => c.id === id)) return node
  }
  return null
}

/** Rebuild a tree, replacing the children of one node. The shared spine of every edit below. */
function rewrite(node, id, children) {
  if (node.type !== 'layout') return node
  if (node.id === id) return { ...node, children }
  return { ...node, children: node.children.map((c) => rewrite(c, id, children)) }
}

/** Rebuild a tree, replacing one node wholesale. */
function replace(node, id, next) {
  if (node.id === id) return next
  if (node.type !== 'layout') return node
  return { ...node, children: node.children.map((c) => replace(c, id, next)) }
}

/**
 * Insert `node` into `parentId` at `index` (default: last).
 *
 * Returns the root unchanged when the parent does not exist or is not a layout
 * node — silently inserting at the root instead would put the node somewhere
 * the caller did not ask for, and looking correct is the failure mode this repo
 * keeps paying for.
 */
export function insertNode(root, node, { parentId, index } = {}) {
  const parent = findNode(root, parentId ?? root.id)
  if (!parent || parent.type !== 'layout') return root
  const children = [...parent.children]
  children.splice(index ?? children.length, 0, node)
  return rewrite(root, parent.id, children)
}

/** Remove one node. The root itself cannot be removed — a document always has one. */
export function removeNode(root, id) {
  if (id === root.id) return root
  const parent = parentOf(root, id)
  if (!parent) return root
  return rewrite(root, parent.id, parent.children.filter((c) => c.id !== id))
}

/**
 * Move a node by `delta` within its own parent. Clamped rather than wrapped:
 * "move up" on the first child should do nothing, not send it to the bottom.
 */
export function moveNode(root, id, delta) {
  const parent = parentOf(root, id)
  if (!parent) return root
  const from = parent.children.findIndex((c) => c.id === id)
  const to = from + delta
  if (to < 0 || to >= parent.children.length) return root
  const children = [...parent.children]
  const [moved] = children.splice(from, 1)
  children.splice(to, 0, moved)
  return rewrite(root, parent.id, children)
}

/**
 * Set one prop on a component node. A `null` value REMOVES the prop rather than
 * writing null, so "cleared" and "explicitly null" stay distinguishable — the
 * component's own default takes over, which is the behaviour clearing a field
 * should have.
 */
export function setProp(root, id, name, value) {
  const node = findNode(root, id)
  if (!node || node.type !== 'component') return root
  const props = { ...node.props }
  if (value === null || value === undefined || value === '') delete props[name]
  else props[name] = value
  return replace(root, id, { ...node, props })
}

/** Patch a layout node's layout fields. Unknown keys are ignored, not stored. */
const LAYOUT_KEYS = ['layout', 'direction', 'columns', 'gap', 'padding', 'align']
export function setLayout(root, id, patch) {
  const node = findNode(root, id)
  if (!node || node.type !== 'layout') return root
  const next = { ...node }
  for (const key of LAYOUT_KEYS) {
    if (!(key in patch)) continue
    if (patch[key] === null || patch[key] === undefined) delete next[key]
    else next[key] = patch[key]
  }
  return replace(root, id, next)
}
