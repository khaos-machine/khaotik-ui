export default TextField;
type TextField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const TextField: import("svelte").Component<{
    /**
     * The visible label, which is also the input's accessible name.
     */
    label?: string;
    /**
     * The input type.
     */
    type?: "text" | "email";
    /**
     * The form field name.
     */
    name?: string;
    /**
     * The current text. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * The `autocomplete` token, such as `email` or `username`.
     */
    autocomplete?: string;
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the input, linked by `aria-describedby`.
     */
    hint?: string;
    /**
     * The error message. Non-empty makes the field invalid.
     */
    error?: string;
    /**
     * Called with the new text on every input.
     */
    oninput?: (value: string) => void;
}, {}, "">;
type Props = {
    /**
     * The visible label, which is also the input's accessible name.
     */
    label?: string;
    /**
     * The input type.
     */
    type?: "text" | "email";
    /**
     * The form field name.
     */
    name?: string;
    /**
     * The current text. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * The `autocomplete` token, such as `email` or `username`.
     */
    autocomplete?: string;
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the input, linked by `aria-describedby`.
     */
    hint?: string;
    /**
     * The error message. Non-empty makes the field invalid.
     */
    error?: string;
    /**
     * Called with the new text on every input.
     */
    oninput?: (value: string) => void;
};
