export default PasswordField;
type PasswordField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PasswordField: import("svelte").Component<{
    /**
     * The visible label, which is also the input's accessible name.
     */
    label?: string;
    /**
     * The form field name.
     */
    name?: string;
    /**
     * The current password. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * `current-password` to sign in, `new-password` to set one, so password managers offer the right thing.
     */
    autocomplete?: "current-password" | "new-password";
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the input, such as a length rule, linked by `aria-describedby`.
     */
    hint?: string;
    /**
     * The error message. Non-empty makes the field invalid.
     */
    error?: string;
    /**
     * Called with the new password on every input.
     */
    oninput?: (value: string) => void;
}, {}, "">;
type Props = {
    /**
     * The visible label, which is also the input's accessible name.
     */
    label?: string;
    /**
     * The form field name.
     */
    name?: string;
    /**
     * The current password. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * `current-password` to sign in, `new-password` to set one, so password managers offer the right thing.
     */
    autocomplete?: "current-password" | "new-password";
    /**
     * Marks the field required for the browser and screen readers.
     */
    required?: boolean;
    /**
     * Help text under the input, such as a length rule, linked by `aria-describedby`.
     */
    hint?: string;
    /**
     * The error message. Non-empty makes the field invalid.
     */
    error?: string;
    /**
     * Called with the new password on every input.
     */
    oninput?: (value: string) => void;
};
