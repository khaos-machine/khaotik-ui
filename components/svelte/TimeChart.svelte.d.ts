export default TimeChart;
type TimeChart = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const TimeChart: import("svelte").Component<{
    /**
     * One entry per day, **in your order** — the chart neither sorts nor fills gaps.
     */
    points?: readonly {
        /**
         * The calendar day, `YYYY-MM-DD`. What the day means (UTC or local) is the host's.
         */
        day: string;
        /**
         * The measure for that day. `null` draws no bar and reads as absent, never as zero.
         */
        value: number | null;
        /**
         * The value is a lower bound: drawn distinctly and announced with `≥` before it.
         */
        floor?: boolean;
    }[];
    /**
     * Renders a value. Counts by default; money or a duration belongs to the caller.
     */
    format?: (value: number) => string;
    /**
     * The chart's accessible name.
     */
    label?: string;
    /**
     * Shown as the table's caption and announced as the chart's description.
     */
    caption?: string;
    /**
     * Rendered instead of an empty chart when there are no points.
     */
    emptyLabel?: string;
    /**
     * Bar colour, from the seven-way StatusTone scale.
     */
    tone?: import("./lib/types.js").StatusTone;
}, {}, "">;
type Props = {
    /**
     * One entry per day, **in your order** — the chart neither sorts nor fills gaps.
     */
    points?: readonly {
        /**
         * The calendar day, `YYYY-MM-DD`. What the day means (UTC or local) is the host's.
         */
        day: string;
        /**
         * The measure for that day. `null` draws no bar and reads as absent, never as zero.
         */
        value: number | null;
        /**
         * The value is a lower bound: drawn distinctly and announced with `≥` before it.
         */
        floor?: boolean;
    }[];
    /**
     * Renders a value. Counts by default; money or a duration belongs to the caller.
     */
    format?: (value: number) => string;
    /**
     * The chart's accessible name.
     */
    label?: string;
    /**
     * Shown as the table's caption and announced as the chart's description.
     */
    caption?: string;
    /**
     * Rendered instead of an empty chart when there are no points.
     */
    emptyLabel?: string;
    /**
     * Bar colour, from the seven-way StatusTone scale.
     */
    tone?: import("./lib/types.js").StatusTone;
};
