/**
 * One column. `value` drives filtering, sorting and the default cell.
 *
 * @template T
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} label
 * @property {string} width A CSS grid track, such as `56px` or `minmax(120px, 1fr)`.
 * @property {'end'} [align] `end` right-aligns the column, for numbers.
 * @property {(row: T) => string | number | null | undefined} value
 * @property {boolean} [sortable] False turns sorting off for this column. Sortable by default.
 * @property {(row: T) => string | null | undefined} [subtitle] A second, quieter line under the cell, for the rows that have one. Filtered on, never sorted on.
 */
/**
 * The rows whose any column value contains `query` (case-insensitive), sorted by the
 * column `sortKey` in direction `dir`. Numbers sort as numbers, text by locale with
 * numeric collation, and an unknown key leaves the order alone.
 *
 * @template T
 * @param {readonly T[]} rows
 * @param {readonly Column<T>[]} columns
 * @param {string} query
 * @param {string | null} sortKey
 * @param {1 | -1} dir
 * @returns {T[]}
 */
export function visibleRows<T>(rows: readonly T[], columns: readonly Column<T>[], query: string, sortKey: string | null, dir: 1 | -1): T[];
/**
 * Which rows to render: the ones in the viewport plus `overscan` on each side,
 * as `[start, end)` over a list of `count` rows of equal height.
 *
 * @param {number} scrollTop
 * @param {number} viewportHeight
 * @param {number} rowHeight
 * @param {number} count
 * @param {number} overscan
 * @returns {{ start: number, end: number }}
 */
export function rowWindow(scrollTop: number, viewportHeight: number, rowHeight: number, count: number, overscan: number): {
    start: number;
    end: number;
};
/**
 * @template T
 * @typedef {{ kind: 'group', key: string, label: string, count: number } | { kind: 'row', row: T }} TableItem
 */
/**
 * The rows as one list with a header item before each group, groups in the order
 * their first row appears. Without `groupBy` every item is a row.
 *
 * @template T
 * @param {readonly T[]} rows
 * @param {((row: T) => string) | undefined} groupBy
 * @returns {TableItem<T>[]}
 */
export function flattenGroups<T>(rows: readonly T[], groupBy: ((row: T) => string) | undefined): TableItem<T>[];
/**
 * Each item's top edge, and the total height last: `count + 1` running offsets over rows
 * whose heights differ (DataTable `wrap`). A row not yet measured counts as `estimate`.
 *
 * @param {number} count
 * @param {(i: number) => number | undefined} heightAt A measured height, or undefined.
 * @param {number} estimate
 * @returns {Float64Array}
 */
export function itemOffsets(count: number, heightAt: (i: number) => number | undefined, estimate: number): Float64Array;
/**
 * Which rows to render over running `offsets` (from `itemOffsets`): the rows the viewport
 * crosses plus `overscan` on each side, as `[start, end)`. Binary search, so a scroll costs
 * O(log n) however long the list.
 *
 * @param {Float64Array} offsets
 * @param {number} scrollTop
 * @param {number} viewportHeight
 * @param {number} overscan
 * @returns {{ start: number, end: number }}
 */
export function offsetWindow(offsets: Float64Array, scrollTop: number, viewportHeight: number, overscan: number): {
    start: number;
    end: number;
};
/**
 * One column. `value` drives filtering, sorting and the default cell.
 */
export type Column<T> = {
    key: string;
    label: string;
    /**
     * A CSS grid track, such as `56px` or `minmax(120px, 1fr)`.
     */
    width: string;
    /**
     * `end` right-aligns the column, for numbers.
     */
    align?: "end";
    value: (row: T) => string | number | null | undefined;
    /**
     * False turns sorting off for this column. Sortable by default.
     */
    sortable?: boolean;
    /**
     * A second, quieter line under the cell, for the rows that have one. Filtered on, never sorted on.
     */
    subtitle?: (row: T) => string | null | undefined;
};
export type TableItem<T> = {
    kind: "group";
    key: string;
    label: string;
    count: number;
} | {
    kind: "row";
    row: T;
};
