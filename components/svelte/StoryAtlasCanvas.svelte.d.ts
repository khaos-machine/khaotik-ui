export default StoryAtlasCanvas;
type StoryAtlasCanvas = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryAtlasCanvas: import("svelte").Component<{
    /**
     * Whether the canvas is on screen; a hidden one stops rendering.
     */
    active?: boolean;
    /**
     * Called once the renderer has started.
     */
    onready?: () => void;
    /**
     * Resolved portrait URLs, keyed by node id.
     */
    portraits?: Record<string, string>;
    /**
     * The positioned graph, from `createLayouts`.
     */
    graph?: {
        nodes: readonly any[];
        edges: readonly any[];
    } | null;
    /**
     * The selected node's id, or ''.
     */
    selectedId?: string;
    /**
     * The ids next to the selected node.
     */
    related?: Set<string>;
    /**
     * The arrangement: 'A' to 'E'.
     */
    variant?: string;
    /**
     * The lens: 'all', 'character', 'location' or 'scene'.
     */
    kind?: string;
    /**
     * Changing it returns the camera to the overview.
     */
    cameraKey?: number;
    /**
     * The selected connection.
     */
    selectedEdge?: {
        source: string;
        target: string;
        kind: string;
        evidence: string;
    } | null;
    /**
     * Reports a node chosen.
     */
    onSelect?: (id: string) => void;
    /**
     * Reports a connection chosen.
     */
    onSelectEdge?: (edge: {
        source: string;
        target: string;
        kind: string;
        evidence: string;
    }) => void;
    /**
     * Reports the node under the pointer, or ''.
     */
    onHover?: (id: string) => void;
    /**
     * Shows the renderer's node count, frame rate and zoom.
     */
    diagnostics?: boolean;
}, {}, "">;
type Props = {
    /**
     * Whether the canvas is on screen; a hidden one stops rendering.
     */
    active?: boolean;
    /**
     * Called once the renderer has started.
     */
    onready?: () => void;
    /**
     * Resolved portrait URLs, keyed by node id.
     */
    portraits?: Record<string, string>;
    /**
     * The positioned graph, from `createLayouts`.
     */
    graph?: {
        nodes: readonly any[];
        edges: readonly any[];
    } | null;
    /**
     * The selected node's id, or ''.
     */
    selectedId?: string;
    /**
     * The ids next to the selected node.
     */
    related?: Set<string>;
    /**
     * The arrangement: 'A' to 'E'.
     */
    variant?: string;
    /**
     * The lens: 'all', 'character', 'location' or 'scene'.
     */
    kind?: string;
    /**
     * Changing it returns the camera to the overview.
     */
    cameraKey?: number;
    /**
     * The selected connection.
     */
    selectedEdge?: {
        source: string;
        target: string;
        kind: string;
        evidence: string;
    } | null;
    /**
     * Reports a node chosen.
     */
    onSelect?: (id: string) => void;
    /**
     * Reports a connection chosen.
     */
    onSelectEdge?: (edge: {
        source: string;
        target: string;
        kind: string;
        evidence: string;
    }) => void;
    /**
     * Reports the node under the pointer, or ''.
     */
    onHover?: (id: string) => void;
    /**
     * Shows the renderer's node count, frame rate and zoom.
     */
    diagnostics?: boolean;
};
