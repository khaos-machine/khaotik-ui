export default MetricCard;
type MetricCard = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const MetricCard: import("svelte").Component<{
    /**
     * The metric readout; tabular numerals.
     */
    value?: string | number;
    /**
     * Inline label; also the accessible name of the group.
     */
    label?: string;
    /**
     * Optional leading Phosphor icon (fill weight).
     */
    icon?: string;
    /**
     * Tints the leading icon (`--tone-*`).
     */
    tone?: import("./lib/types.js").StatusTone;
    /**
     * Optional trailing sub-value.
     */
    sub?: string | number;
}, {}, "">;
type Props = {
    /**
     * The metric readout; tabular numerals.
     */
    value?: string | number;
    /**
     * Inline label; also the accessible name of the group.
     */
    label?: string;
    /**
     * Optional leading Phosphor icon (fill weight).
     */
    icon?: string;
    /**
     * Tints the leading icon (`--tone-*`).
     */
    tone?: import("./lib/types.js").StatusTone;
    /**
     * Optional trailing sub-value.
     */
    sub?: string | number;
};
