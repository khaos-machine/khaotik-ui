export default StatusBar;
type StatusBar = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StatusBar: import("svelte").Component<{
    /**
     * The engine's state and what the bar says about it. None renders no engine item.
     */
    engine?: {
        /**
         * Drives the dot's tone.
         */
        state: "ready" | "starting" | "offline" | string;
        /**
         * What the bar says about the engine, in the host's words.
         */
        label: string;
    } | null;
    /**
     * Running jobs, the one to show first. None renders no bar.
     */
    jobs?: readonly {
        id: string;
        label: string;
        /**
         * Real counts only. Omit when the engine has not stated them, and the bar is indeterminate.
         */
        progress?: {
            readonly completed: number;
            readonly total: number;
        };
        /**
         * How long the job has run.
         */
        elapsedMs?: number;
        /**
         * The host's projection. Omit until there is one.
         */
        remainingMs?: number;
        /**
         * Present only when the host can stop the job; adds a Cancel button.
         */
        cancel?: () => void;
    }[];
    /**
     * The last action's result.
     */
    result?: {
        /**
         * What the last action did.
         */
        text: string;
        tone?: "info" | "error";
        /**
         * Present only when the engine can reverse the write.
         */
        undo?: () => void;
        /**
         * Present when the host can withdraw the result; adds a Dismiss button.
         */
        dismiss?: () => void;
    } | null;
    /**
     * Adds a Details button.
     */
    ondetails?: () => void;
    /**
     * The story budget. None draws no budget item.
     */
    budget?: ({
        kind: "reading";
    } | {
        kind: "none";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        usd: string;
        spentUsd: string;
        remainingUsd: string;
    }) | null;
    /**
     * Opens the story's budget to set or change it.
     */
    onchangebudget?: () => void;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The engine's state and what the bar says about it. None renders no engine item.
     */
    engine?: {
        /**
         * Drives the dot's tone.
         */
        state: "ready" | "starting" | "offline" | string;
        /**
         * What the bar says about the engine, in the host's words.
         */
        label: string;
    } | null;
    /**
     * Running jobs, the one to show first. None renders no bar.
     */
    jobs?: readonly {
        id: string;
        label: string;
        /**
         * Real counts only. Omit when the engine has not stated them, and the bar is indeterminate.
         */
        progress?: {
            readonly completed: number;
            readonly total: number;
        };
        /**
         * How long the job has run.
         */
        elapsedMs?: number;
        /**
         * The host's projection. Omit until there is one.
         */
        remainingMs?: number;
        /**
         * Present only when the host can stop the job; adds a Cancel button.
         */
        cancel?: () => void;
    }[];
    /**
     * The last action's result.
     */
    result?: {
        /**
         * What the last action did.
         */
        text: string;
        tone?: "info" | "error";
        /**
         * Present only when the engine can reverse the write.
         */
        undo?: () => void;
        /**
         * Present when the host can withdraw the result; adds a Dismiss button.
         */
        dismiss?: () => void;
    } | null;
    /**
     * Adds a Details button.
     */
    ondetails?: () => void;
    /**
     * The story budget. None draws no budget item.
     */
    budget?: ({
        kind: "reading";
    } | {
        kind: "none";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        usd: string;
        spentUsd: string;
        remainingUsd: string;
    }) | null;
    /**
     * Opens the story's budget to set or change it.
     */
    onchangebudget?: () => void;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};
