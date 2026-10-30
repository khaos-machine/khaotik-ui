export default FormStack;
type FormStack = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const FormStack: import("svelte").Component<{
    /**
     * Names the form for assistive technology, such as "Sign in". Omit it when a visible heading already does.
     */
    label?: string;
    /**
     * Called when the form is submitted and passes native validation.
     */
    onsubmit?: () => void;
    /**
     * A form-level error or notice, shown above the fields.
     */
    message?: import("svelte").Snippet;
    /**
     * The fields.
     */
    children?: import("svelte").Snippet;
    /**
     * The buttons, shown below the fields.
     */
    actions?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * Names the form for assistive technology, such as "Sign in". Omit it when a visible heading already does.
     */
    label?: string;
    /**
     * Called when the form is submitted and passes native validation.
     */
    onsubmit?: () => void;
    /**
     * A form-level error or notice, shown above the fields.
     */
    message?: import("svelte").Snippet;
    /**
     * The fields.
     */
    children?: import("svelte").Snippet;
    /**
     * The buttons, shown below the fields.
     */
    actions?: import("svelte").Snippet;
};
