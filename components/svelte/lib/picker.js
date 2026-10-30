// The Popover picker's order (data-layer plan K13; audit §3.7: the same-named voice first).

/**
 * @typedef {Object} PickerItem
 * @property {string} id
 * @property {string} label
 * @property {string} [detail] A second, quieter line.
 */

/**
 * The items whose label contains `query` (case-insensitive), with the `suggested` item
 * first and the rest in their given order.
 *
 * @param {readonly PickerItem[]} items
 * @param {string} suggested
 * @param {string} query
 * @returns {PickerItem[]}
 */
export function pickerOrder(items, suggested, query) {
  const q = query.trim().toLowerCase()
  const hits = q ? items.filter((i) => i.label.toLowerCase().includes(q)) : [...items]
  const first = hits.findIndex((i) => i.id === suggested)
  if (first > 0) hits.unshift(...hits.splice(first, 1))
  return hits
}
