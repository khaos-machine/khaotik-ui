export default ScrubNumber;
type ScrubNumber = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ScrubNumber: import("svelte").Component<{
    /**
     * The current value. Controlled: pass back what `onchange` gives you.
     */
    value?: number;
    /**
     * The lowest value it will emit.
     */
    min?: number;
    /**
     * The highest value it will emit.
     */
    max?: number;
    /**
     * Every emitted value is a multiple of this from `min`; its decimals set the display.
     */
    step?: number;
    /**
     * The accessible name.
     */
    label?: string;
    /**
     * Called with a new value inside the range.
     */
    onchange?: (value: number) => void;
    /**
     * Shown but not changeable, and out of the tab order.
     */
    disabled?: boolean;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The current value. Controlled: pass back what `onchange` gives you.
     */
    value?: number;
    /**
     * The lowest value it will emit.
     */
    min?: number;
    /**
     * The highest value it will emit.
     */
    max?: number;
    /**
     * Every emitted value is a multiple of this from `min`; its decimals set the display.
     */
    step?: number;
    /**
     * The accessible name.
     */
    label?: string;
    /**
     * Called with a new value inside the range.
     */
    onchange?: (value: number) => void;
    /**
     * Shown but not changeable, and out of the tab order.
     */
    disabled?: boolean;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
};
