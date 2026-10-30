export default ReviewQueue;
type ReviewQueue = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ReviewQueue: import("svelte").Component<{
    /**
     * The queue, as the host grouped and filtered it.
     */
    groups?: readonly import("./lib/review.js").MentionGroup[];
    /**
     * The chosen group's key, or ''.
     */
    selected?: string;
    /**
     * Reports the group chosen.
     */
    onselect?: (key: string) => void;
}, {}, "">;
type Props = {
    /**
     * The queue, as the host grouped and filtered it.
     */
    groups?: readonly import("./lib/review.js").MentionGroup[];
    /**
     * The chosen group's key, or ''.
     */
    selected?: string;
    /**
     * Reports the group chosen.
     */
    onselect?: (key: string) => void;
};
