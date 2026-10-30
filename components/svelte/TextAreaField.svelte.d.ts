export default TextAreaField;
type TextAreaField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const TextAreaField: import("svelte").Component<{
    /**
     * The visible label, which is also the textarea's accessible name.
     */
    label?: string;
    /**
     * The form field name.
     */
    name?: string;
    /**
     * The current text. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * The height in lines before the text grows it.
     */
    rows?: number;
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the textarea, linked by `aria-describedby`.
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
    /**
     * Called with the text on Cmd+Enter (Ctrl+Enter off Apple).
     */
    onsubmit?: (value: string) => void;
}, {}, "">;
type Props = {
    /**
     * The visible label, which is also the textarea's accessible name.
     */
    label?: string;
    /**
     * The form field name.
     */
    name?: string;
    /**
     * The current text. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * The height in lines before the text grows it.
     */
    rows?: number;
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the textarea, linked by `aria-describedby`.
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
    /**
     * Called with the text on Cmd+Enter (Ctrl+Enter off Apple).
     */
    onsubmit?: (value: string) => void;
};
