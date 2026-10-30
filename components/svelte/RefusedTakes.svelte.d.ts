export default RefusedTakes;
type RefusedTakes = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const RefusedTakes: import("svelte").Component<{
    /**
     * The takes the engine refused to list.
     */
    refused?: readonly import("./lib/recordings.js").RefusedTake[];
    /**
     * Reports a refused take's scene to open.
     */
    onRevealScene?: (sceneId: string) => void;
}, {}, "">;
type Props = {
    /**
     * The takes the engine refused to list.
     */
    refused?: readonly import("./lib/recordings.js").RefusedTake[];
    /**
     * Reports a refused take's scene to open.
     */
    onRevealScene?: (sceneId: string) => void;
};
