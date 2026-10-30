export default BarChart;
type BarChart = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const BarChart: import("svelte").Component<{
    /**
     * `[{ label, value }]`, **already ordered by you**. Ranking is editorial — most-first, alphabetical and the screenplay's own order are each correct somewhere, and none is this component's to choose. An entry whose `value` is not finite is **dropped**, not drawn as zero: an entity the engine did not measure is not an entity measured at zero.
     */
    data?: readonly {
        label: string;
        value: number;
    }[];
    /**
     * Rendered instead of a chart when there is nothing to draw. Not decoration — a zeroed axis reads as *a measurement of nothing* rather than *an absence of measurement*.
     */
    emptyLabel?: string;
    /**
     * Formats the number beside each bar. Counts by default; a percentage or a duration belongs to the caller.
     */
    format?: (value: number) => string;
    /**
     * Bar colour, from the seven-way StatusTone scale.
     */
    tone?: import("./lib/types.js").StatusTone;
    /**
     * Optional caption, announced as the table's description.
     */
    caption?: string;
}, {}, "">;
type Props = {
    /**
     * `[{ label, value }]`, **already ordered by you**. Ranking is editorial — most-first, alphabetical and the screenplay's own order are each correct somewhere, and none is this component's to choose. An entry whose `value` is not finite is **dropped**, not drawn as zero: an entity the engine did not measure is not an entity measured at zero.
     */
    data?: readonly {
        label: string;
        value: number;
    }[];
    /**
     * Rendered instead of a chart when there is nothing to draw. Not decoration — a zeroed axis reads as *a measurement of nothing* rather than *an absence of measurement*.
     */
    emptyLabel?: string;
    /**
     * Formats the number beside each bar. Counts by default; a percentage or a duration belongs to the caller.
     */
    format?: (value: number) => string;
    /**
     * Bar colour, from the seven-way StatusTone scale.
     */
    tone?: import("./lib/types.js").StatusTone;
    /**
     * Optional caption, announced as the table's description.
     */
    caption?: string;
};
