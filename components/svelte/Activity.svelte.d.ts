export default Activity;
type Activity = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Activity: import("svelte").Component<{
    /**
     * The activity read. `missing`: the project holds no committed story.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "missing";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The project the window shows, as its heading.
     */
    projectTitle?: string;
    /**
     * The ledger's count of committed changes.
     */
    total?: number;
    /**
     * Changes read, before the filter.
     */
    rowCount?: number;
    /**
     * The changes that match the filter, by day.
     */
    days?: readonly import("./lib/activity.js").ActivityDay[];
    /**
     * The filter.
     */
    query?: string;
    /**
     * Reports the filter typed.
     */
    onQuery?: (query: string) => void;
}, {}, "">;
type Props = {
    /**
     * The activity read. `missing`: the project holds no committed story.
     */
    state?: {
        kind: "loading";
    } | {
        kind: "missing";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
    };
    /**
     * The project the window shows, as its heading.
     */
    projectTitle?: string;
    /**
     * The ledger's count of committed changes.
     */
    total?: number;
    /**
     * Changes read, before the filter.
     */
    rowCount?: number;
    /**
     * The changes that match the filter, by day.
     */
    days?: readonly import("./lib/activity.js").ActivityDay[];
    /**
     * The filter.
     */
    query?: string;
    /**
     * Reports the filter typed.
     */
    onQuery?: (query: string) => void;
};
