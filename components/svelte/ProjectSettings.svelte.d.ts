export default ProjectSettings;
type ProjectSettings = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProjectSettings: import("svelte").Component<{
    /**
     * The story's budget as khaosd sends it.
     */
    budget?: {
        kind: "reading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "none";
        suggested?: {
            usd: readonly string[];
        };
    } | {
        kind: "loaded";
        usd: string;
        spentUsd: string;
        remainingUsd: string;
    };
    /**
     * The last save: `invalid` is the engine's `400 INVALID_BUDGET`.
     */
    save?: {
        kind: "idle";
    } | {
        kind: "saving";
    } | {
        kind: "invalid";
        message: string;
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * The last reset of what is spent.
     */
    reset?: {
        kind: "idle";
    } | {
        kind: "resetting";
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * Asked to save the spending limit.
     */
    onsave?: (usd: string) => void;
    /**
     * Asked to reset what is spent; the limit stays.
     */
    onreset?: () => void;
}, {}, "">;
type Props = {
    /**
     * The story's budget as khaosd sends it.
     */
    budget?: {
        kind: "reading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "none";
        suggested?: {
            usd: readonly string[];
        };
    } | {
        kind: "loaded";
        usd: string;
        spentUsd: string;
        remainingUsd: string;
    };
    /**
     * The last save: `invalid` is the engine's `400 INVALID_BUDGET`.
     */
    save?: {
        kind: "idle";
    } | {
        kind: "saving";
    } | {
        kind: "invalid";
        message: string;
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * The last reset of what is spent.
     */
    reset?: {
        kind: "idle";
    } | {
        kind: "resetting";
    } | {
        kind: "failed";
        message: string;
    };
    /**
     * Asked to save the spending limit.
     */
    onsave?: (usd: string) => void;
    /**
     * Asked to reset what is spent; the limit stays.
     */
    onreset?: () => void;
};
