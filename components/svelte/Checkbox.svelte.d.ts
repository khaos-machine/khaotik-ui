export default Checkbox;
type Checkbox = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Checkbox: import("svelte").Component<{
    /**
     * Controlled; the host owns the value.
     */
    checked?: boolean;
    /**
     * The accessible name, and the visible label unless hidden.
     */
    label?: string;
    /**
     * Keeps the label for assistive technology only, for a checkbox in a table row whose row already says what it marks.
     */
    hideLabel?: boolean;
    /**
     * Dimmed, and asks nothing.
     */
    disabled?: boolean;
    /**
     * Asked with the new value.
     */
    onchange?: (checked: boolean) => void;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * Controlled; the host owns the value.
     */
    checked?: boolean;
    /**
     * The accessible name, and the visible label unless hidden.
     */
    label?: string;
    /**
     * Keeps the label for assistive technology only, for a checkbox in a table row whose row already says what it marks.
     */
    hideLabel?: boolean;
    /**
     * Dimmed, and asks nothing.
     */
    disabled?: boolean;
    /**
     * Asked with the new value.
     */
    onchange?: (checked: boolean) => void;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
};
