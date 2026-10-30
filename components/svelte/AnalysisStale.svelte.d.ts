export default AnalysisStale;
type AnalysisStale = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const AnalysisStale: import("svelte").Component<{
    /**
     * The analysis's standing; undefined for an entity with no analysis. Nothing renders unless it is stale.
     */
    standing?: {
        /**
         * khaosd's analysis state. Only `stale` renders.
         */
        state: string;
        /**
         * What changed, one row each, in the engine's words.
         */
        reasons: readonly string[];
        /**
         * A note under each reason, by index. May be shorter than `reasons`.
         */
        details: readonly string[];
    } | undefined;
}, {}, "">;
type Props = {
    /**
     * The analysis's standing; undefined for an entity with no analysis. Nothing renders unless it is stale.
     */
    standing?: {
        /**
         * khaosd's analysis state. Only `stale` renders.
         */
        state: string;
        /**
         * What changed, one row each, in the engine's words.
         */
        reasons: readonly string[];
        /**
         * A note under each reason, by index. May be shorter than `reasons`.
         */
        details: readonly string[];
    } | undefined;
};
