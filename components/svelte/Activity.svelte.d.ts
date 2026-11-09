export default Activity;
type Activity = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Activity: import("svelte").Component<{
    /**
     * The activity read. `missing`: the project holds no committed story. `unsupported`: this khaosd cannot read the history a page at a time (no `story-activity-query`), with or without a query (#46).
     */
    state?: {
        kind: "loading";
    } | {
        kind: "missing";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "unsupported";
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
    /**
     * Pages the feed and makes the filter a khaosd search (#40). Set, `days` are the loaded rows that answer `query`, `rowCount` is not read, counts come from the feed's totals, and the field stays while a search matches nothing. Absent: the whole-log filter above, unchanged.
     */
    feed?: import("./lib/activity.js").ActivityFeed;
    /**
     * With `feed`: asks for the next older page, or retries a failed one.
     */
    onLoadOlder?: () => void;
    /**
     * With `feed`: retries a failed read of newer changes.
     */
    onRefresh?: () => void;
}, {}, "">;
type Props = {
    /**
     * The activity read. `missing`: the project holds no committed story. `unsupported`: this khaosd cannot read the history a page at a time (no `story-activity-query`), with or without a query (#46).
     */
    state?: {
        kind: "loading";
    } | {
        kind: "missing";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "unsupported";
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
    /**
     * Pages the feed and makes the filter a khaosd search (#40). Set, `days` are the loaded rows that answer `query`, `rowCount` is not read, counts come from the feed's totals, and the field stays while a search matches nothing. Absent: the whole-log filter above, unchanged.
     */
    feed?: import("./lib/activity.js").ActivityFeed;
    /**
     * With `feed`: asks for the next older page, or retries a failed one.
     */
    onLoadOlder?: () => void;
    /**
     * With `feed`: retries a failed read of newer changes.
     */
    onRefresh?: () => void;
};
