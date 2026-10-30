export default FilterField;
type FilterField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const FilterField: import("svelte").Component<{
    /**
     * The current filter text. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * Accessible name. The visible label is implicit, so this is what a screen reader announces — name the list being filtered ("Filter scenes"), not the control.
     */
    label?: string;
    /**
     * Placeholder text.
     */
    placeholder?: string;
    /**
     * Rows surviving the filter. With `total`, renders the count; alone, renders nothing.
     */
    shown?: number | null;
    /**
     * Rows before filtering. Omit both to hide the count.
     */
    total?: number | null;
    /**
     * Called with the new string. Also called with `""` by the clear button and by Escape.
     */
    oninput?: (value: string) => void;
}, {}, "">;
type Props = {
    /**
     * The current filter text. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * Accessible name. The visible label is implicit, so this is what a screen reader announces — name the list being filtered ("Filter scenes"), not the control.
     */
    label?: string;
    /**
     * Placeholder text.
     */
    placeholder?: string;
    /**
     * Rows surviving the filter. With `total`, renders the count; alone, renders nothing.
     */
    shown?: number | null;
    /**
     * Rows before filtering. Omit both to hide the count.
     */
    total?: number | null;
    /**
     * Called with the new string. Also called with `""` by the clear button and by Escape.
     */
    oninput?: (value: string) => void;
};
