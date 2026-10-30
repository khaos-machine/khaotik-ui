export default LabeledField;
type LabeledField = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const LabeledField: import("svelte").Component<{
    /**
     * The field label, right-aligned in a fixed 128px column.
     */
    label?: string;
    /**
     * The value, as slot content — text, or chips that wrap within the value column.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * The field label, right-aligned in a fixed 128px column.
     */
    label?: string;
    /**
     * The value, as slot content — text, or chips that wrap within the value column.
     */
    children?: import("svelte").Snippet;
};
