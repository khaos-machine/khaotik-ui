/**
 * The smallest extent `node` can take along `direction` with what is collapsed hidden.
 *
 * @param {DockNode} node
 * @param {Record<string, DockPanel>} panels
 * @param {'row' | 'column'} direction
 * @returns {number}
 */
export function minExtent(node: DockNode, panels: Record<string, DockPanel>, direction: "row" | "column"): number;
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
export function resizeSplit(tree: DockNode, id: string, size: number, panels: Record<string, DockPanel>): DockNode;
/**
 * The split with `id` with its fixed child collapsed or, if it was, restored.
 *
 * @param {DockNode} tree
 * @param {string} id
 * @returns {DockNode}
 */
export function toggleSplit(tree: DockNode, id: string): DockNode;
/**
 * The group with `id` showing `panel`. A panel the group does not hold changes nothing.
 *
 * @param {DockNode} tree
 * @param {string} id
 * @param {string} panel
 * @returns {DockNode}
 */
export function selectTab(tree: DockNode, id: string, panel: string): DockNode;
/**
 * The layout as text, for the host to store.
 *
 * @param {DockNode} tree
 * @returns {string}
 */
export function serializeLayout(tree: DockNode): string;
/**
 * A stored layout read back, or `null` when it does not decode, is not a layout, or names
 * a panel this build does not have. The host loads its preset on `null`: a lost layout
 * loses convenience, never work, so it is discarded rather than migrated.
 *
 * @param {string} text
 * @param {Record<string, DockPanel>} panels
 * @returns {DockNode | null}
 */
export function parseLayout(text: string, panels: Record<string, DockPanel>): DockNode | null;
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
export const COLLAPSE_PULL: 40;
export type DockPanel = {
    /**
     * The panel's name: its tab, and the label of its region.
     */
    label: string;
    /**
     * Its minimum extent in px along the split that holds it.
     */
    min: number;
    /**
     * Its default extent in px, where a preset does not give one.
     */
    size?: number;
};
export type DockGroup = {
    kind: "group";
    id: string;
    /**
     * Panel ids, in tab order. One panel draws no tab strip.
     */
    panels: string[];
    /**
     * The panel shown. Must be one of `panels`.
     */
    active: string;
};
export type DockSplit = {
    kind: "split";
    id: string;
    /**
     * `row` puts the children side by side.
     */
    direction: "row" | "column";
    /**
     * Which child is held at `size`; the other fills.
     */
    fixed: "start" | "end";
    /**
     * The fixed child's extent in px.
     */
    size: number;
    /**
     * The fixed child is hidden; `size` is kept for its return.
     */
    collapsed?: boolean;
    /**
     * Below the room both sides need, the fixed child overlays the other instead of squeezing it (audit §3.4).
     */
    overlay?: boolean;
    children: [DockNode, DockNode];
};
export type DockNode = DockSplit | DockGroup;
