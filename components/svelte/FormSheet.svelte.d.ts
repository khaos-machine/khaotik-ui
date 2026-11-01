export default FormSheet;
type FormSheet = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const FormSheet: import("svelte").Component<{
    /**
     * The sheet's heading, which names the dialog.
     */
    title?: string;
    /**
     * Esc does nothing while this is set.
     */
    busy?: boolean;
    /**
     * Opens as a modal over the page. Off, it opens in place without trapping the focus, as the catalog shows it.
     */
    modal?: boolean;
    /**
     * Called once the sheet has closed, however it closed.
     */
    onclose?: () => void;
    /**
     * The form. It is handed `close`.
     */
    children?: import("svelte").Snippet<[close: () => void]>;
}, {}, "">;
type Props = {
    /**
     * The sheet's heading, which names the dialog.
     */
    title?: string;
    /**
     * Esc does nothing while this is set.
     */
    busy?: boolean;
    /**
     * Opens as a modal over the page. Off, it opens in place without trapping the focus, as the catalog shows it.
     */
    modal?: boolean;
    /**
     * Called once the sheet has closed, however it closed.
     */
    onclose?: () => void;
    /**
     * The form. It is handed `close`.
     */
    children?: import("svelte").Snippet<[close: () => void]>;
};
