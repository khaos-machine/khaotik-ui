export default PlaceViewer;
type PlaceViewer = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceViewer: import("svelte").Component<{
    /**
     * The place definition the model was built from; its cameras frame the view.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * The model's bytes: khaosd's `.../model.glb` for this definition, as the host read it, or null when there is none.
     */
    model?: Uint8Array | null;
    /**
     * The id of the definition camera to look through; '' is the first.
     */
    camera?: string;
    /**
     * The guides' width over height, from the Guides manifest. The kit renders guides at 1536 by 1024.
     */
    aspect?: number;
    /**
     * Reports the room or fixture id under a click.
     */
    onselect?: (id: string) => void;
    /**
     * Reports the loaded model's node names.
     */
    onload?: (names: string[]) => void;
}, {}, "">;
type Props = {
    /**
     * The place definition the model was built from; its cameras frame the view.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * The model's bytes: khaosd's `.../model.glb` for this definition, as the host read it, or null when there is none.
     */
    model?: Uint8Array | null;
    /**
     * The id of the definition camera to look through; '' is the first.
     */
    camera?: string;
    /**
     * The guides' width over height, from the Guides manifest. The kit renders guides at 1536 by 1024.
     */
    aspect?: number;
    /**
     * Reports the room or fixture id under a click.
     */
    onselect?: (id: string) => void;
    /**
     * Reports the loaded model's node names.
     */
    onload?: (names: string[]) => void;
};
