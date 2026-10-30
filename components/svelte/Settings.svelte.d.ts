export default Settings;
type Settings = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Settings: import("svelte").Component<{
    /**
     * `[{ id, label, icon? }]`, rendered in the order given. **Values must be distinct** — this list is keyed on `id`, so a duplicate throws `each_key_duplicate` and the control does not render. The same rule a `<select>` has always had.
     */
    categories?: readonly {
        id: string;
        label: string;
        /**
         * Phosphor icon name.
         */
        icon?: string;
    }[];
    /**
     * The category id being shown. Falls back to the first when unset or unknown.
     */
    selected?: string;
    /**
     * Called with the chosen category id.
     */
    onSelect?: (id: string) => void;
    /**
     * The pane for the selected category, supplied by the host.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * `[{ id, label, icon? }]`, rendered in the order given. **Values must be distinct** — this list is keyed on `id`, so a duplicate throws `each_key_duplicate` and the control does not render. The same rule a `<select>` has always had.
     */
    categories?: readonly {
        id: string;
        label: string;
        /**
         * Phosphor icon name.
         */
        icon?: string;
    }[];
    /**
     * The category id being shown. Falls back to the first when unset or unknown.
     */
    selected?: string;
    /**
     * Called with the chosen category id.
     */
    onSelect?: (id: string) => void;
    /**
     * The pane for the selected category, supplied by the host.
     */
    children?: import("svelte").Snippet;
};
