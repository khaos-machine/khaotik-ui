export default ScreenplayText;
type ScreenplayText = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ScreenplayText: import("svelte").Component<{
    /**
     * The scene's elements, in order.
     */
    elements?: readonly {
        /**
         * The element's id, as the engine serves it.
         */
        id: string;
        kind: "slugline" | "action" | "character" | "parenthetical" | "dialogue" | "transition" | string;
        /**
         * The element's text, as written.
         */
        text: string;
    }[];
    /**
     * The selected element's id.
     */
    selected?: string;
    /**
     * Asked with an element's id.
     */
    onselect?: (id: string) => void;
    /**
     * The listbox's accessible name.
     */
    label?: string;
    /**
     * What an empty scene says.
     */
    empty?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The scene's elements, in order.
     */
    elements?: readonly {
        /**
         * The element's id, as the engine serves it.
         */
        id: string;
        kind: "slugline" | "action" | "character" | "parenthetical" | "dialogue" | "transition" | string;
        /**
         * The element's text, as written.
         */
        text: string;
    }[];
    /**
     * The selected element's id.
     */
    selected?: string;
    /**
     * Asked with an element's id.
     */
    onselect?: (id: string) => void;
    /**
     * The listbox's accessible name.
     */
    label?: string;
    /**
     * What an empty scene says.
     */
    empty?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};
