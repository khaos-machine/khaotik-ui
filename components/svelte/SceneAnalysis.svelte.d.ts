export default SceneAnalysis;
type SceneAnalysis = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SceneAnalysis: import("svelte").Component<{
    /**
     * The analysis record from khaosd's `/api/dashboard/detail` (`.analysis`); null when there is none.
     */
    analysis?: Record<string, unknown> | null;
    /**
     * Characters, objects and places, to name a suggestion's bind target.
     */
    names?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The scene's composition events, to quote a suggestion's evidence.
     */
    events?: readonly {
        elementId: string;
        text?: string;
    }[];
    /**
     * The analysis's standing; undefined for a scene the engine has not analysed.
     */
    standing?: import("./lib/types.js").SceneStanding | undefined;
}, {}, "">;
type Props = {
    /**
     * The analysis record from khaosd's `/api/dashboard/detail` (`.analysis`); null when there is none.
     */
    analysis?: Record<string, unknown> | null;
    /**
     * Characters, objects and places, to name a suggestion's bind target.
     */
    names?: readonly {
        id: string;
        name: string;
    }[];
    /**
     * The scene's composition events, to quote a suggestion's evidence.
     */
    events?: readonly {
        elementId: string;
        text?: string;
    }[];
    /**
     * The analysis's standing; undefined for a scene the engine has not analysed.
     */
    standing?: import("./lib/types.js").SceneStanding | undefined;
};
