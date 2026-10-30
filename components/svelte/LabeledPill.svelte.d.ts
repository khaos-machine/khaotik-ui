export default LabeledPill;
type LabeledPill = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const LabeledPill: import("svelte").Component<{
    /**
     * Eyebrow caption above the pill (the `.eyebrow` utility).
     */
    label?: string;
    /**
     * StatusPill text.
     */
    value?: string;
    /**
     * StatusPill tone; maps to `--tone-*`.
     */
    tone?: import("./lib/types.js").StatusTone;
}, {}, "">;
type Props = {
    /**
     * Eyebrow caption above the pill (the `.eyebrow` utility).
     */
    label?: string;
    /**
     * StatusPill text.
     */
    value?: string;
    /**
     * StatusPill tone; maps to `--tone-*`.
     */
    tone?: import("./lib/types.js").StatusTone;
};
