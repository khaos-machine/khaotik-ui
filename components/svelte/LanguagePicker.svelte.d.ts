export default LanguagePicker;
type LanguagePicker = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const LanguagePicker: import("svelte").Component<{
    /**
     * Language codes to offer, in order (`auto`, `en`, `de`, …).
     */
    languages?: readonly string[];
    /**
     * The chosen code.
     */
    value?: string;
    /**
     * Called with the chosen code.
     */
    onselect?: (code: string) => void;
    /**
     * The visible label. Defaults to "Language".
     */
    label?: string;
}, {}, "">;
type Props = {
    /**
     * Language codes to offer, in order (`auto`, `en`, `de`, …).
     */
    languages?: readonly string[];
    /**
     * The chosen code.
     */
    value?: string;
    /**
     * Called with the chosen code.
     */
    onselect?: (code: string) => void;
    /**
     * The visible label. Defaults to "Language".
     */
    label?: string;
};
