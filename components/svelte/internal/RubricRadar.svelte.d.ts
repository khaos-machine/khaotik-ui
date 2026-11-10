export default RubricRadar;
type RubricRadar = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const RubricRadar: import("svelte").Component<{
    /**
     * From `rubricRadar`.
     */
    spokes: readonly import("../lib/story-overview.js").RadarSpoke[];
}, {}, "">;
type Props = {
    /**
     * From `rubricRadar`.
     */
    spokes: readonly import("../lib/story-overview.js").RadarSpoke[];
};
