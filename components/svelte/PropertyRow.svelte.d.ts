export default PropertyRow;
type PropertyRow = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PropertyRow: import("svelte").Component<{
    /**
     * The property's name; the row's accessible name.
     */
    label?: string;
    /**
     * The value as text. Ignored when `children` is given.
     */
    value?: string | number | null;
    /**
     * Where the value came from, in a third column. Absent when not given.
     */
    source?: string;
    /**
     * A control drawn in place of the value.
     */
    children?: import("svelte").Snippet;
    /**
     * The row's `data-ui-id` (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The property's name; the row's accessible name.
     */
    label?: string;
    /**
     * The value as text. Ignored when `children` is given.
     */
    value?: string | number | null;
    /**
     * Where the value came from, in a third column. Absent when not given.
     */
    source?: string;
    /**
     * A control drawn in place of the value.
     */
    children?: import("svelte").Snippet;
    /**
     * The row's `data-ui-id` (audit §3.14).
     */
    uiId?: string;
};
