export default ExtractionReview;
type ExtractionReview = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ExtractionReview: import("svelte").Component<{
    /**
     * The record under review.
     */
    item?: import("./lib/review.js").ReviewItem | null;
    /**
     * The identities the story holds.
     */
    story?: import("./lib/review.js").ReviewStory;
    /**
     * A scene's 1-based number, or null when the host does not hold it. Never invented.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * The Character menu's items, grouped as the roster groups them. Defaults to the story's characters, ungrouped.
     */
    roster?: readonly {
        value: string;
        label: string;
        group?: string;
    }[] | undefined;
    /**
     * A decision is being sent: every control waits.
     */
    busy?: boolean;
    /**
     * The single-choice answers the record asks for.
     */
    answers?: readonly import("./lib/review.js").Answer[];
    /**
     * What the record offers for the choice so far: the host's.
     */
    decisionsFor?: (choice: import("./lib/review.js").ReviewChoice) => import("./lib/review.js").Decisions | null;
    /**
     * Sends a verdict's decision; resolves true once the engine recorded it.
     */
    ondecide?: (decision: unknown, phrase: string, boundAs: string, always: import("./lib/review.js").AlwaysMatch | null) => Promise<boolean>;
    /**
     * Creates the identity and binds the record; resolves true once the engine recorded it.
     */
    oncreate?: (item: import("./lib/review.js").ReviewItem, name: string, options: {
        always: boolean;
        identityKind: "individual" | "group";
    }) => Promise<boolean>;
}, {}, "">;
type Props = {
    /**
     * The record under review.
     */
    item?: import("./lib/review.js").ReviewItem | null;
    /**
     * The identities the story holds.
     */
    story?: import("./lib/review.js").ReviewStory;
    /**
     * A scene's 1-based number, or null when the host does not hold it. Never invented.
     */
    sceneNumber?: (sceneId: string) => number | null;
    /**
     * The Character menu's items, grouped as the roster groups them. Defaults to the story's characters, ungrouped.
     */
    roster?: readonly {
        value: string;
        label: string;
        group?: string;
    }[] | undefined;
    /**
     * A decision is being sent: every control waits.
     */
    busy?: boolean;
    /**
     * The single-choice answers the record asks for.
     */
    answers?: readonly import("./lib/review.js").Answer[];
    /**
     * What the record offers for the choice so far: the host's.
     */
    decisionsFor?: (choice: import("./lib/review.js").ReviewChoice) => import("./lib/review.js").Decisions | null;
    /**
     * Sends a verdict's decision; resolves true once the engine recorded it.
     */
    ondecide?: (decision: unknown, phrase: string, boundAs: string, always: import("./lib/review.js").AlwaysMatch | null) => Promise<boolean>;
    /**
     * Creates the identity and binds the record; resolves true once the engine recorded it.
     */
    oncreate?: (item: import("./lib/review.js").ReviewItem, name: string, options: {
        always: boolean;
        identityKind: "individual" | "group";
    }) => Promise<boolean>;
};
