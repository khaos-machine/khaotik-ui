// DataTable's pure parts (data-layer plan K5), carried from the khaos-app desktop
// prototype's `table.ts` (`Column`, `visibleRows`) and joined by the row window that
// virtualises the table, and by grouping.

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
export function visibleRows(rows, columns, query, sortKey, dir) {
  const q = query.trim().toLowerCase()
  const out = q ? rows.filter((r) => columns.some((c) => [c.value(r), c.subtitle?.(r)].some((v) => String(v ?? '').toLowerCase().includes(q)))) : [...rows]
  const col = columns.find((c) => c.key === sortKey)
  if (!col) return out
  return out.sort((a, b) => {
    const x = col.value(a) ?? ''
    const y = col.value(b) ?? ''
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * dir
  })
}

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
export function rowWindow(scrollTop, viewportHeight, rowHeight, count, overscan) {
  if (count <= 0 || rowHeight <= 0) return { start: 0, end: 0 }
  const first = Math.min(count, Math.max(0, Math.floor(scrollTop / rowHeight)))
  const visible = Math.ceil(Math.max(0, viewportHeight) / rowHeight)
  return { start: Math.max(0, first - overscan), end: Math.min(count, first + visible + overscan) }
}

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
export function flattenGroups(rows, groupBy) {
  if (!groupBy) return rows.map((row) => ({ kind: 'row', row }))
  /** @type {Map<string, T[]>} */
  const groups = new Map()
  for (const row of rows) {
    const key = groupBy(row)
    const list = groups.get(key)
    if (list) list.push(row)
    else groups.set(key, [row])
  }
  /** @type {TableItem<T>[]} */
  const out = []
  for (const [key, list] of groups) {
    out.push({ kind: 'group', key, label: key, count: list.length })
    for (const row of list) out.push({ kind: 'row', row })
  }
  return out
}

/**
 * Each item's top edge, and the total height last: `count + 1` running offsets over rows
 * whose heights differ (DataTable `wrap`). A row not yet measured counts as `estimate`.
 *
 * @param {number} count
 * @param {(i: number) => number | undefined} heightAt A measured height, or undefined.
 * @param {number} estimate
 * @returns {Float64Array}
 */
export function itemOffsets(count, heightAt, estimate) {
  const out = new Float64Array(Math.max(0, count) + 1)
  for (let i = 0; i < count; i += 1) out[i + 1] = out[i] + (heightAt(i) ?? estimate)
  return out
}

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
export function offsetWindow(offsets, scrollTop, viewportHeight, overscan) {
  const count = offsets.length - 1
  if (count <= 0 || viewportHeight <= 0) return { start: 0, end: 0 }
  /** The first item whose top is above `y`'s next item: the last i with offsets[i] <= y. @param {number} y */
  const at = (y) => {
    let lo = 0
    let hi = count - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (offsets[mid] <= y) lo = mid
      else hi = mid - 1
    }
    return lo
  }
  const first = at(Math.max(0, scrollTop))
  const last = at(Math.max(0, scrollTop + viewportHeight - 1))
  return { start: Math.max(0, first - overscan), end: Math.min(count, last + 1 + overscan) }
}
