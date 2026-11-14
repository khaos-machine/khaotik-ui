export default JourneyLanes;
type JourneyLanes = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const JourneyLanes: import("svelte").Component<{
    /**
     * From `journeyLanes`.
     */
    lanes: readonly import("../lib/story-overview.js").JourneyLane[];
    /**
     * The chosen journey's index in the list, or -1.
     */
    selected?: number;
    /**
     * Reports a journey chosen.
     */
    onselect?: (index: number) => void;
}, {}, "">;
type Props = {
    /**
     * From `journeyLanes`.
     */
    lanes: readonly import("../lib/story-overview.js").JourneyLane[];
    /**
     * The chosen journey's index in the list, or -1.
     */
    selected?: number;
    /**
     * Reports a journey chosen.
     */
    onselect?: (index: number) => void;
};
