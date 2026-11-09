export default ActivityFeedStatus;
type ActivityFeedStatus = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ActivityFeedStatus: import("svelte").Component<{
    /**
     * What the host knows beyond the loaded rows.
     */
    feed?: import("./lib/activity.js").ActivityFeed;
    /**
     * Rows loaded and drawn above.
     */
    loaded?: number;
    /**
     * The query the rows answer, or ''.
     */
    query?: string;
    /**
     * Asks for the next older page; also the retry after a failed one.
     */
    onLoadOlder?: () => void;
    /**
     * Asks for newer changes again after a failed refresh.
     */
    onRefresh?: () => void;
}, {}, "">;
type Props = {
    /**
     * What the host knows beyond the loaded rows.
     */
    feed?: import("./lib/activity.js").ActivityFeed;
    /**
     * Rows loaded and drawn above.
     */
    loaded?: number;
    /**
     * The query the rows answer, or ''.
     */
    query?: string;
    /**
     * Asks for the next older page; also the retry after a failed one.
     */
    onLoadOlder?: () => void;
    /**
     * Asks for newer changes again after a failed refresh.
     */
    onRefresh?: () => void;
};
