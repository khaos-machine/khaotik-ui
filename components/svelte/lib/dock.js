// The Dock's layout, as plain data (audit §3.2: storytold's DockNode with no egui code).
//
// A node is a SPLIT, two children side by side (`row`) or stacked (`column`), one of
// them held at a fixed size and the other taking what is left; or a GROUP, an ordered
// list of panel ids with the active one. Panel data (label, minimum, default size)
// lives beside the tree, not in it, so a saved layout never carries a stale minimum.
//
// Every function here returns a new tree and leaves its input alone, so a host can keep
// the previous layout (Memento) and hand the new one back.

/**
 * @typedef {Object} DockPanel
 * @property {string} label The panel's name: its tab, and the label of its region.
 * @property {number} min Its minimum extent in px along the split that holds it.
 * @property {number} [size] Its default extent in px, where a preset does not give one.
 */

/**
 * @typedef {Object} DockGroup
 * @property {'group'} kind
 * @property {string} id
 * @property {string[]} panels Panel ids, in tab order. One panel draws no tab strip.
 * @property {string} active The panel shown. Must be one of `panels`.
 */

/**
 * @typedef {Object} DockSplit
 * @property {'split'} kind
 * @property {string} id
 * @property {'row' | 'column'} direction `row` puts the children side by side.
 * @property {'start' | 'end'} fixed Which child is held at `size`; the other fills.
 * @property {number} size The fixed child's extent in px.
 * @property {boolean} [collapsed] The fixed child is hidden; `size` is kept for its return.
 * @property {boolean} [overlay] Below the room both sides need, the fixed child overlays the other instead of squeezing it (audit §3.4).
 * @property {[DockNode, DockNode]} children
 */

/** @typedef {DockSplit | DockGroup} DockNode */

/**
 * How far past a pane's minimum a drag must pull before the pane collapses. Without it a
 * gutter nudged one pixel under the minimum would snap the pane shut.
 */
export const COLLAPSE_PULL = 40

/**
 * The smallest extent `node` can take along `direction` with what is collapsed hidden.
 *
 * @param {DockNode} node
 * @param {Record<string, DockPanel>} panels
 * @param {'row' | 'column'} direction
 * @returns {number}
 */
export function minExtent(node, panels, direction) {
  if (node.kind === 'group') {
    return direction === 'row' ? Math.max(0, ...node.panels.map((id) => panels[id]?.min ?? 0)) : 0
  }
  const [a, b] = node.children
  const fixedChild = node.fixed === 'start' ? a : b
  const fillChild = node.fixed === 'start' ? b : a
  const fill = minExtent(fillChild, panels, direction)
  const fixed = node.collapsed ? 0 : minExtent(fixedChild, panels, direction)
  return node.direction === direction ? fill + fixed : Math.max(fill, fixed)
}

/**
 * Apply `change` to the split or group with `id`, rebuilding only the path to it.
 *
 * @param {DockNode} node
 * @param {string} id
 * @param {(node: DockNode) => DockNode} change
 * @returns {DockNode}
 */
function update(node, id, change) {
  if (node.id === id) return change(node)
  if (node.kind === 'group') return node
  const [a, b] = node.children
  const na = update(a, id, change)
  const nb = update(b, id, change)
  return na === a && nb === b ? node : { ...node, children: [na, nb] }
}

/**
 * The split with `id` resized so its fixed child is `size` px. Below that child's
 * minimum by more than `COLLAPSE_PULL` it collapses and keeps its old size for its
 * return; otherwise it clamps to the minimum.
 *
 * @param {DockNode} tree
 * @param {string} id
 * @param {number} size
 * @param {Record<string, DockPanel>} panels
 * @returns {DockNode}
 */
export function resizeSplit(tree, id, size, panels) {
  return update(tree, id, (node) => {
    if (node.kind !== 'split') return node
    const min = minExtent(node.fixed === 'start' ? node.children[0] : node.children[1], panels, node.direction)
    if (size < min - COLLAPSE_PULL) return { ...node, collapsed: true }
    return { ...node, size: Math.round(Math.max(min, size)), collapsed: false }
  })
}

/**
 * The split with `id` with its fixed child collapsed or, if it was, restored.
 *
 * @param {DockNode} tree
 * @param {string} id
 * @returns {DockNode}
 */
export function toggleSplit(tree, id) {
  return update(tree, id, (node) => (node.kind === 'split' ? { ...node, collapsed: !node.collapsed } : node))
}

/**
 * The group with `id` showing `panel`. A panel the group does not hold changes nothing.
 *
 * @param {DockNode} tree
 * @param {string} id
 * @param {string} panel
 * @returns {DockNode}
 */
export function selectTab(tree, id, panel) {
  return update(tree, id, (node) =>
    node.kind === 'group' && node.panels.includes(panel) && node.active !== panel ? { ...node, active: panel } : node,
  )
}

/**
 * The layout as text, for the host to store.
 *
 * @param {DockNode} tree
 * @returns {string}
 */
export function serializeLayout(tree) {
  return JSON.stringify(tree)
}

/**
 * A stored layout read back, or `null` when it does not decode, is not a layout, or names
 * a panel this build does not have. The host loads its preset on `null`: a lost layout
 * loses convenience, never work, so it is discarded rather than migrated.
 *
 * @param {string} text
 * @param {Record<string, DockPanel>} panels
 * @returns {DockNode | null}
 */
export function parseLayout(text, panels) {
  let value
  try {
    value = JSON.parse(text)
  } catch {
    return null
  }
  return isNode(value, panels) ? value : null
}

/**
 * @param {unknown} value
 * @param {Record<string, DockPanel>} panels
 * @returns {value is DockNode}
 */
function isNode(value, panels) {
  if (typeof value !== 'object' || value === null) return false
  const node = /** @type {Record<string, unknown>} */ (value)
  if (typeof node.id !== 'string') return false
  if (node.kind === 'group') {
    return (
      Array.isArray(node.panels) &&
      node.panels.length > 0 &&
      node.panels.every((id) => typeof id === 'string' && Object.hasOwn(panels, id)) &&
      typeof node.active === 'string' &&
      node.panels.includes(node.active)
    )
  }
  if (node.kind === 'split') {
    return (
      (node.direction === 'row' || node.direction === 'column') &&
      (node.fixed === 'start' || node.fixed === 'end') &&
      typeof node.size === 'number' &&
      Number.isFinite(node.size) &&
      Array.isArray(node.children) &&
      node.children.length === 2 &&
      node.children.every((child) => isNode(child, panels))
    )
  }
  return false
}
