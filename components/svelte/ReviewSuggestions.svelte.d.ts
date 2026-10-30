export default ReviewSuggestions;
type ReviewSuggestions = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ReviewSuggestions: import("svelte").Component<{
    /**
     * The record's suggestions, as the host offers them.
     */
    rows?: readonly {
        suggestion: import("./lib/review.js").PendingSuggestion;
        offer: import("./lib/review.js").SuggestionOffer;
    }[];
    /**
     * A decision is being sent: the buttons wait.
     */
    busy?: boolean;
    /**
     * A scene's 1-based number, or null when the host does not hold it.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * Reports the accepted decision, the host's, unchanged.
     */
    onaccept?: (decision: unknown) => void;
    /**
     * Reports a suggestion dismissed, or restored.
     */
    ondismiss?: (suggestion: import("./lib/review.js").PendingSuggestion, dismissed: boolean) => void;
}, {}, "">;
type Props = {
    /**
     * The record's suggestions, as the host offers them.
     */
    rows?: readonly {
        suggestion: import("./lib/review.js").PendingSuggestion;
        offer: import("./lib/review.js").SuggestionOffer;
    }[];
    /**
     * A decision is being sent: the buttons wait.
     */
    busy?: boolean;
    /**
     * A scene's 1-based number, or null when the host does not hold it.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * Reports the accepted decision, the host's, unchanged.
     */
    onaccept?: (decision: unknown) => void;
    /**
     * Reports a suggestion dismissed, or restored.
     */
    ondismiss?: (suggestion: import("./lib/review.js").PendingSuggestion, dismissed: boolean) => void;
};
