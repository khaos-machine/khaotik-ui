export default RelationshipGraph;
type RelationshipGraph = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const RelationshipGraph: import("svelte").Component<{
    /**
     * From `relationshipGraph`.
     */
    graph: {
        nodes: readonly import("../lib/story-overview.js").GraphNode[];
        edges: readonly import("../lib/story-overview.js").GraphEdge[];
    };
    /**
     * The chosen pair's index in the relationships list, or -1.
     */
    selected?: number;
    /**
     * Reports a pair chosen.
     */
    onselect?: (index: number) => void;
}, {}, "">;
type Props = {
    /**
     * From `relationshipGraph`.
     */
    graph: {
        nodes: readonly import("../lib/story-overview.js").GraphNode[];
        edges: readonly import("../lib/story-overview.js").GraphEdge[];
    };
    /**
     * The chosen pair's index in the relationships list, or -1.
     */
    selected?: number;
    /**
     * Reports a pair chosen.
     */
    onselect?: (index: number) => void;
};
