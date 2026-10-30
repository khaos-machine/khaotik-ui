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
export function pickerOrder(items: readonly PickerItem[], suggested: string, query: string): PickerItem[];
export type PickerItem = {
    id: string;
    label: string;
    /**
     * A second, quieter line.
     */
    detail?: string;
};
