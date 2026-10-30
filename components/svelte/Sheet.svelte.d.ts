export default Sheet;
type Sheet = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Sheet: import("svelte").Component<{
    /**
     * What the sheet asks ("Delete Read 2?").
     */
    title?: string;
    /**
     * What it acts on, named in full.
     */
    target?: string;
    /**
     * The consequence, read as the sheet's description.
     */
    message?: string;
    /**
     * The confirm button's text: the verb ("Delete").
     */
    confirmLabel?: string;
    /**
     * The cancel button's text.
     */
    cancelLabel?: string;
    /**
     * `danger` marks a destructive confirm.
     */
    tone?: "neutral" | "danger";
    /**
     * Makes it a text-input sheet.
     */
    input?: {
        label: string;
        placeholder?: string;
        /**
         * The field's starting text.
         */
        value?: string;
    } | null;
    /**
     * A second action's text. It sits between Cancel and confirm, and the sheet has none without it.
     */
    secondaryLabel?: string;
    /**
     * Called by the second action. It confirms nothing and cancels nothing.
     */
    onsecondary?: () => void;
    /**
     * Called with the field's text, or '' for a plain sheet.
     */
    onconfirm?: (value: string) => void;
    /**
     * Asked on Esc and on Cancel.
     */
    oncancel?: () => void;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * What the sheet asks ("Delete Read 2?").
     */
    title?: string;
    /**
     * What it acts on, named in full.
     */
    target?: string;
    /**
     * The consequence, read as the sheet's description.
     */
    message?: string;
    /**
     * The confirm button's text: the verb ("Delete").
     */
    confirmLabel?: string;
    /**
     * The cancel button's text.
     */
    cancelLabel?: string;
    /**
     * `danger` marks a destructive confirm.
     */
    tone?: "neutral" | "danger";
    /**
     * Makes it a text-input sheet.
     */
    input?: {
        label: string;
        placeholder?: string;
        /**
         * The field's starting text.
         */
        value?: string;
    } | null;
    /**
     * A second action's text. It sits between Cancel and confirm, and the sheet has none without it.
     */
    secondaryLabel?: string;
    /**
     * Called by the second action. It confirms nothing and cancels nothing.
     */
    onsecondary?: () => void;
    /**
     * Called with the field's text, or '' for a plain sheet.
     */
    onconfirm?: (value: string) => void;
    /**
     * Asked on Esc and on Cancel.
     */
    oncancel?: () => void;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};
