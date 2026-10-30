export default SceneDetail;
type SceneDetail = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SceneDetail: import("svelte").Component<{
    /**
     * The selected scene's row; null when none is selected.
     */
    scene?: import("./lib/scenes.js").SceneRecord | null;
    /**
     * The scene's composition segment; null when it has none.
     */
    segment?: import("./lib/scenes.js").CompositionSegment | null;
    /**
     * The scene's raw text, shown when there is no segment.
     */
    sceneText?: {
        kind: "none";
    } | {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "text";
        text: string;
    };
    /**
     * The selected element's id.
     */
    selectedLine?: string;
    /**
     * Reports a selected line.
     */
    onselectline?: (elementId: string) => void;
    /**
     * The scene's analysis record from khaosd.
     */
    analysis?: Record<string, unknown> | null;
    /**
     * Characters, objects and places, for the analysis's suggestions.
     */
    names?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The analysis's standing.
     */
    standing?: import("./lib/types.js").SceneStanding | undefined;
    /**
     * A read of this scene is open or opening: the Read view is offered.
     */
    readOpen?: boolean;
    /**
     * The read is opening: the Read view opens itself.
     */
    readOpening?: boolean;
    /**
     * The host's read timeline.
     */
    read?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The selected scene's row; null when none is selected.
     */
    scene?: import("./lib/scenes.js").SceneRecord | null;
    /**
     * The scene's composition segment; null when it has none.
     */
    segment?: import("./lib/scenes.js").CompositionSegment | null;
    /**
     * The scene's raw text, shown when there is no segment.
     */
    sceneText?: {
        kind: "none";
    } | {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "text";
        text: string;
    };
    /**
     * The selected element's id.
     */
    selectedLine?: string;
    /**
     * Reports a selected line.
     */
    onselectline?: (elementId: string) => void;
    /**
     * The scene's analysis record from khaosd.
     */
    analysis?: Record<string, unknown> | null;
    /**
     * Characters, objects and places, for the analysis's suggestions.
     */
    names?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The analysis's standing.
     */
    standing?: import("./lib/types.js").SceneStanding | undefined;
    /**
     * A read of this scene is open or opening: the Read view is offered.
     */
    readOpen?: boolean;
    /**
     * The read is opening: the Read view opens itself.
     */
    readOpening?: boolean;
    /**
     * The host's read timeline.
     */
    read?: import("svelte").Snippet | undefined;
};
