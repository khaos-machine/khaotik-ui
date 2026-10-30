export default ReviewSide;
type ReviewSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ReviewSide: import("svelte").Component<{
    /**
     * The occurrence under review; null when none is chosen.
     */
    item?: import("./lib/review.js").ReviewItem | null;
    /**
     * Its group, with `included`.
     */
    group?: import("./lib/review.js").MentionGroup | null;
    /**
     * Records still pending; null until the queue has been read.
     */
    count?: number | null;
    /**
     * The host's suggestions and answer for `item`.
     */
    answer?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The occurrence under review; null when none is chosen.
     */
    item?: import("./lib/review.js").ReviewItem | null;
    /**
     * Its group, with `included`.
     */
    group?: import("./lib/review.js").MentionGroup | null;
    /**
     * Records still pending; null until the queue has been read.
     */
    count?: number | null;
    /**
     * The host's suggestions and answer for `item`.
     */
    answer?: import("svelte").Snippet | undefined;
};
