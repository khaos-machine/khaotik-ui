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
     * The error message, worded by the host. Non-empty makes the field invalid and is read out as the input's description. It is the only text the field reads out: the field never writes a message of its own.
     */
    error?: string;
    /**
     * Called with `YYYY-MM-DD` as soon as a valid day is typed or picked, with no commit needed, or with `''` when the field is cleared. Never called with a value that is not a valid choice. When a valid day replaces a refused one, this is the call that says so: the field's own invalid state clears, and the host clears its `error`.
     */
    oninput?: (value: string) => void;
    /**
     * Called when the entry is **committed** — on blur or Enter, never on a keystroke — holding a value that is not a valid choice. The field turns invalid and keeps the text; nothing resets it. `typed` is the value as the input reported it. `reason` is `before_min` (a day earlier than `min`), `after_max` (later than `max`), or `unreadable` (non-empty, but not a real calendar day in `YYYY-MM-DD`: `2026-02-30`, `2026-10`, or the raw text a browser that draws the date input as a text box reports). A year typed digit by digit, which Chromium reports as `0002-…`, `0020-…`, `0202-…`, fires nothing and leaves the field valid until it is committed. Set `error` from it, worded for your reader; the field writes no message of its own.
     */
    oninvalid?: (detail: {
        typed: string;
        reason: "before_min" | "after_max" | "unreadable";
    }) => void;
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
     * The error message, worded by the host. Non-empty makes the field invalid and is read out as the input's description. It is the only text the field reads out: the field never writes a message of its own.
     */
    error?: string;
    /**
     * Called with `YYYY-MM-DD` as soon as a valid day is typed or picked, with no commit needed, or with `''` when the field is cleared. Never called with a value that is not a valid choice. When a valid day replaces a refused one, this is the call that says so: the field's own invalid state clears, and the host clears its `error`.
     */
    oninput?: (value: string) => void;
    /**
     * Called when the entry is **committed** — on blur or Enter, never on a keystroke — holding a value that is not a valid choice. The field turns invalid and keeps the text; nothing resets it. `typed` is the value as the input reported it. `reason` is `before_min` (a day earlier than `min`), `after_max` (later than `max`), or `unreadable` (non-empty, but not a real calendar day in `YYYY-MM-DD`: `2026-02-30`, `2026-10`, or the raw text a browser that draws the date input as a text box reports). A year typed digit by digit, which Chromium reports as `0002-…`, `0020-…`, `0202-…`, fires nothing and leaves the field valid until it is committed. Set `error` from it, worded for your reader; the field writes no message of its own.
     */
    oninvalid?: (detail: {
        typed: string;
        reason: "before_min" | "after_max" | "unreadable";
    }) => void;
    /**
     * The `data-ui-id` (audit §3.14), set on the input.
     */
    uiId?: string;
};
