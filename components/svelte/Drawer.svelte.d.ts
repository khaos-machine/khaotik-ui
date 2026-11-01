export default Drawer;
type Drawer = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Drawer: import("svelte").Component<{
    /**
     * The heading, which also names the region.
     */
    title?: string;
    /**
     * The close button's accessible name.
     */
    closeLabel?: string;
    /**
     * Called by the close button.
     */
    onclose?: () => void;
    /**
     * The body. It fills the drawer and scrolls itself.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * The heading, which also names the region.
     */
    title?: string;
    /**
     * The close button's accessible name.
     */
    closeLabel?: string;
    /**
     * Called by the close button.
     */
    onclose?: () => void;
    /**
     * The body. It fills the drawer and scrolls itself.
     */
    children?: import("svelte").Snippet;
};
