export default CodeField;
type CodeField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const CodeField: import("svelte").Component<{
    /**
     * The visible label for the whole code.
     */
    label?: string;
    /**
     * The form field name. The joined code is submitted under it.
     */
    name?: string;
    /**
     * How many digits the code has.
     */
    length?: number;
    /**
     * The digits entered so far. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the boxes, such as where the code was sent.
     */
    hint?: string;
    /**
     * The error message. Non-empty makes the field invalid.
     */
    error?: string;
    /**
     * Called with the digits entered so far on every change.
     */
    oninput?: (value: string) => void;
    /**
     * Called with the full code once every box is filled.
     */
    oncomplete?: (value: string) => void;
}, {}, "">;
type Props = {
    /**
     * The visible label for the whole code.
     */
    label?: string;
    /**
     * The form field name. The joined code is submitted under it.
     */
    name?: string;
    /**
     * How many digits the code has.
     */
    length?: number;
    /**
     * The digits entered so far. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the boxes, such as where the code was sent.
     */
    hint?: string;
    /**
     * The error message. Non-empty makes the field invalid.
     */
    error?: string;
    /**
     * Called with the digits entered so far on every change.
     */
    oninput?: (value: string) => void;
    /**
     * Called with the full code once every box is filled.
     */
    oncomplete?: (value: string) => void;
};
