export default StaleSheet;
type StaleSheet = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StaleSheet: import("svelte").Component<{
    /**
     * What was refused, in the engine's plain words.
     */
    headline?: string;
    /**
     * Why, in the engine's plain words.
     */
    detail?: string;
    /**
     * The project it happened in.
     */
    projectTitle?: string;
    /**
     * The view fix's words ("View stale scenes"); '' when there is none.
     */
    viewLabel?: string;
    /**
     * The resolve fix's words ("Resolve…"); '' when Resolve could not clear the gate.
     */
    resolveLabel?: string;
    /**
     * View stale scenes.
     */
    onView?: () => void;
    /**
     * Resolve…: the host clears what blocks the analysis.
     */
    onResolve?: () => void;
    /**
     * The sheet was closed.
     */
    onCancel?: () => void;
}, {}, "">;
type Props = {
    /**
     * What was refused, in the engine's plain words.
     */
    headline?: string;
    /**
     * Why, in the engine's plain words.
     */
    detail?: string;
    /**
     * The project it happened in.
     */
    projectTitle?: string;
    /**
     * The view fix's words ("View stale scenes"); '' when there is none.
     */
    viewLabel?: string;
    /**
     * The resolve fix's words ("Resolve…"); '' when Resolve could not clear the gate.
     */
    resolveLabel?: string;
    /**
     * View stale scenes.
     */
    onView?: () => void;
    /**
     * Resolve…: the host clears what blocks the analysis.
     */
    onResolve?: () => void;
    /**
     * The sheet was closed.
     */
    onCancel?: () => void;
};
