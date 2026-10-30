export default ConfirmDialog;
type ConfirmDialog = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ConfirmDialog: import("svelte").Component<{
    /**
     * Controlled. The consumer owns it, so a failed mutation can keep the dialog up and show why.
     */
    open?: boolean;
    /**
     * What is being acted on, named in the question. Rendered whole and wrapped, never elided — the name is the load-bearing part. With none, it asks the bare question rather than inventing "this project".
     */
    target?: string;
    /**
     * The verb. Becomes "{action} {target}?" and labels the confirm button.
     */
    action?: string;
    /**
     * What actually happens, and whether it can be undone. Under the question, not in it.
     */
    description?: string;
    /**
     * Defaults to `danger`, because that is what a confirmation is for. Only the confirm button takes the destructive treatment — colouring the whole dialog makes cancel read as dangerous too, and cancel is the safe thing in here.
     */
    tone?: "danger" | "default";
    /**
     * Overrides the verb on the confirm button. Avoid "OK": the verb is what the reader is agreeing to.
     */
    confirmLabel?: string;
    /**
     * The dismiss label.
     */
    cancelLabel?: string;
    /**
     * Reports intent. It does not close the dialog and it does not act — both are yours.
     */
    onConfirm?: () => void;
    /**
     * Fires for every close, including Escape and the backdrop.
     */
    onCancel?: () => void;
    /**
     * Ark's own open state. Wire this or `open` sticks true after an Escape.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * A choice the reader makes before agreeing, rendered between the description and the buttons: which of two ways to do the thing. The host's control and the host's state. Omit it and the dialog is the question alone.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * Controlled. The consumer owns it, so a failed mutation can keep the dialog up and show why.
     */
    open?: boolean;
    /**
     * What is being acted on, named in the question. Rendered whole and wrapped, never elided — the name is the load-bearing part. With none, it asks the bare question rather than inventing "this project".
     */
    target?: string;
    /**
     * The verb. Becomes "{action} {target}?" and labels the confirm button.
     */
    action?: string;
    /**
     * What actually happens, and whether it can be undone. Under the question, not in it.
     */
    description?: string;
    /**
     * Defaults to `danger`, because that is what a confirmation is for. Only the confirm button takes the destructive treatment — colouring the whole dialog makes cancel read as dangerous too, and cancel is the safe thing in here.
     */
    tone?: "danger" | "default";
    /**
     * Overrides the verb on the confirm button. Avoid "OK": the verb is what the reader is agreeing to.
     */
    confirmLabel?: string;
    /**
     * The dismiss label.
     */
    cancelLabel?: string;
    /**
     * Reports intent. It does not close the dialog and it does not act — both are yours.
     */
    onConfirm?: () => void;
    /**
     * Fires for every close, including Escape and the backdrop.
     */
    onCancel?: () => void;
    /**
     * Ark's own open state. Wire this or `open` sticks true after an Escape.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * A choice the reader makes before agreeing, rendered between the description and the buttons: which of two ways to do the thing. The host's control and the host's state. Omit it and the dialog is the question alone.
     */
    children?: import("svelte").Snippet;
};
