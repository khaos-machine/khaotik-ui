export default DateField;
type DateField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const DateField: import("svelte").Component<{
    /**
     * The visible label, which is also the input's accessible name.
     */
    label?: string;
    /**
     * The day as `YYYY-MM-DD`, or `''` when empty. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * The earliest day that can be chosen, as `YYYY-MM-DD`.
     */
    min?: string;
    /**
     * The latest day that can be chosen, as `YYYY-MM-DD`.
     */
    max?: string;
    /**
     * The error message. Non-empty makes the field invalid and is read out as the input's description.
     */
    error?: string;
    /**
     * Called with `YYYY-MM-DD` on every change, or `''` when the field is cleared. Never called with a day outside `min`/`max`.
     */
    oninput?: (value: string) => void;
    /**
     * The `data-ui-id` (audit §3.14), set on the input.
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The visible label, which is also the input's accessible name.
     */
    label?: string;
    /**
     * The day as `YYYY-MM-DD`, or `''` when empty. Controlled — the consumer owns it.
     */
    value?: string;
    /**
     * The earliest day that can be chosen, as `YYYY-MM-DD`.
     */
    min?: string;
    /**
     * The latest day that can be chosen, as `YYYY-MM-DD`.
     */
    max?: string;
    /**
     * The error message. Non-empty makes the field invalid and is read out as the input's description.
     */
    error?: string;
    /**
     * Called with `YYYY-MM-DD` on every change, or `''` when the field is cleared. Never called with a day outside `min`/`max`.
     */
    oninput?: (value: string) => void;
    /**
     * The `data-ui-id` (audit §3.14), set on the input.
     */
    uiId?: string;
};
