export default Dock;
type Dock = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Dock: import("svelte").Component<{
    /**
     * The tree to draw. Pass back what `onlayoutchange` gave you to keep it. None draws nothing.
     */
    layout?: import("./lib/dock.js").DockNode | null;
    /**
     * Every panel the layout may name: label, minimum and default size.
     */
    panels?: Record<string, import("./lib/dock.js").DockPanel>;
    /**
     * Draws one panel's content, by id. Without it the panes are empty.
     */
    panel?: import("svelte").Snippet<[string]>;
    /**
     * Every resize, collapse and tab change, as the whole new tree.
     */
    onlayoutchange?: (layout: import("./lib/dock.js").DockNode) => void;
    /**
     * The `data-ui-id` prefix for gutters, tabs and panes (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The tree to draw. Pass back what `onlayoutchange` gave you to keep it. None draws nothing.
     */
    layout?: import("./lib/dock.js").DockNode | null;
    /**
     * Every panel the layout may name: label, minimum and default size.
     */
    panels?: Record<string, import("./lib/dock.js").DockPanel>;
    /**
     * Draws one panel's content, by id. Without it the panes are empty.
     */
    panel?: import("svelte").Snippet<[string]>;
    /**
     * Every resize, collapse and tab change, as the whole new tree.
     */
    onlayoutchange?: (layout: import("./lib/dock.js").DockNode) => void;
    /**
     * The `data-ui-id` prefix for gutters, tabs and panes (audit §3.14).
     */
    uiId?: string;
};
