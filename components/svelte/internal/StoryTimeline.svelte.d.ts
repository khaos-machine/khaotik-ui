export default StoryTimeline;
type StoryTimeline = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const StoryTimeline: import("svelte").Component<{
    /**
     * The turns, from `timelineTurns`.
     */
    turns: readonly import("../lib/story-overview.js").TimelineTurn[];
    /**
     * The structures that fit, from `fittingLenses`.
     */
    lenses?: readonly {
        id: string;
        name: string;
        beats: readonly {
            name: string;
            position: number;
        }[];
    }[];
    /**
     * From `pacing`.
     */
    pacing?: ReturnType<typeof import("../lib/story-overview.js").pacing>;
    /**
     * The selected named point's index, -1 for none.
     */
    selected?: number;
    /**
     * Reports the named point's index.
     */
    onselect?: (point: number) => void;
}, {}, "">;
type Props = {
    /**
     * The turns, from `timelineTurns`.
     */
    turns: readonly import("../lib/story-overview.js").TimelineTurn[];
    /**
     * The structures that fit, from `fittingLenses`.
     */
    lenses?: readonly {
        id: string;
        name: string;
        beats: readonly {
            name: string;
            position: number;
        }[];
    }[];
    /**
     * From `pacing`.
     */
    pacing?: ReturnType<typeof import("../lib/story-overview.js").pacing>;
    /**
     * The selected named point's index, -1 for none.
     */
    selected?: number;
    /**
     * Reports the named point's index.
     */
    onselect?: (point: number) => void;
};
