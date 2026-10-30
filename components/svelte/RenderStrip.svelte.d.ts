export default RenderStrip;
type RenderStrip = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const RenderStrip: import("svelte").Component<{
    /**
     * One cell per scene or segment, in story order.
     */
    cells?: readonly {
        id: string;
        /**
         * The cell's name: the scene's number, or the segment's.
         */
        label: string;
        /**
         * The engine's state. Absent is not missing.
         */
        state?: "ready" | "stale" | "missing" | null;
    }[];
    /**
     * The selected cell's id.
     */
    selected?: string;
    /**
     * Asked with a cell's id.
     */
    onselect?: (id: string) => void;
    /**
     * The strip's accessible name.
     */
    label?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * One cell per scene or segment, in story order.
     */
    cells?: readonly {
        id: string;
        /**
         * The cell's name: the scene's number, or the segment's.
         */
        label: string;
        /**
         * The engine's state. Absent is not missing.
         */
        state?: "ready" | "stale" | "missing" | null;
    }[];
    /**
     * The selected cell's id.
     */
    selected?: string;
    /**
     * Asked with a cell's id.
     */
    onselect?: (id: string) => void;
    /**
     * The strip's accessible name.
     */
    label?: string;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};
