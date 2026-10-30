export default SegmentedControl;
type SegmentedControl = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SegmentedControl: import("svelte").Component<{
    /**
     * Names the axis being chosen; becomes the group `aria-label`.
     */
    label?: string;
    /**
     * Selected item `value`.
     */
    value?: string;
    /**
     * Segment array: `{ value, label }`. **Values must be distinct** — this list is keyed on `value`, so a duplicate throws `each_key_duplicate` and the control does not render. The same rule a `<select>` has always had.
     */
    items?: readonly {
        /**
         * The value reported to `onselect`, and matched against `value`.
         */
        value: string;
        /**
         * The visible segment text.
         */
        label: string;
    }[];
    /**
     * Called with the new `value` when a segment is chosen.
     */
    onselect?: (value: string) => void;
}, {}, "">;
type Props = {
    /**
     * Names the axis being chosen; becomes the group `aria-label`.
     */
    label?: string;
    /**
     * Selected item `value`.
     */
    value?: string;
    /**
     * Segment array: `{ value, label }`. **Values must be distinct** — this list is keyed on `value`, so a duplicate throws `each_key_duplicate` and the control does not render. The same rule a `<select>` has always had.
     */
    items?: readonly {
        /**
         * The value reported to `onselect`, and matched against `value`.
         */
        value: string;
        /**
         * The visible segment text.
         */
        label: string;
    }[];
    /**
     * Called with the new `value` when a segment is chosen.
     */
    onselect?: (value: string) => void;
};
