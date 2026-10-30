export default ReviewOccurrences;
type ReviewOccurrences = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ReviewOccurrences: import("svelte").Component<{
    /**
     * The chosen group, with `included`; null when none is chosen.
     */
    group?: import("./lib/review.js").MentionGroup | null;
    /**
     * The occurrence shown in the answer pane, by record id, or ''.
     */
    chosen?: string;
    /**
     * A decision is being sent: the marks wait.
     */
    busy?: boolean;
    /**
     * A scene's 1-based number, or null when the host does not hold it.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * Reports the occurrence chosen.
     */
    onchoose?: (recordId: string) => void;
    /**
     * Reports an occurrence left out of the decision, or put back.
     */
    onexclude?: (recordId: string, excluded: boolean) => void;
}, {}, "">;
type Props = {
    /**
     * The chosen group, with `included`; null when none is chosen.
     */
    group?: import("./lib/review.js").MentionGroup | null;
    /**
     * The occurrence shown in the answer pane, by record id, or ''.
     */
    chosen?: string;
    /**
     * A decision is being sent: the marks wait.
     */
    busy?: boolean;
    /**
     * A scene's 1-based number, or null when the host does not hold it.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * Reports the occurrence chosen.
     */
    onchoose?: (recordId: string) => void;
    /**
     * Reports an occurrence left out of the decision, or put back.
     */
    onexclude?: (recordId: string, excluded: boolean) => void;
};
