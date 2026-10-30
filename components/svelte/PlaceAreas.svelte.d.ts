export default PlaceAreas;
type PlaceAreas = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceAreas: import("svelte").Component<{
    /**
     * The place's areas read.
     */
    read?: import("./lib/places.js").PlaceAreasRead;
}, {}, "">;
type Props = {
    /**
     * The place's areas read.
     */
    read?: import("./lib/places.js").PlaceAreasRead;
};
