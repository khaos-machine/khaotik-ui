export default ShotPrevis;
type ShotPrevis = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ShotPrevis: import("svelte").Component<{
    /**
     * The shot under the playhead, from the scene's previs read, or null.
     */
    shot?: import("./lib/shot-scene.js").PrevisShot | null;
    /**
     * The place definition the shot's blocking names; its door leaves are swung from it.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * The place's `.glb` bytes, as the host read them for the scene, or null.
     */
    place?: Uint8Array | null;
    /**
     * Each figure's `.glb` bytes, by build key, for every shot of the scene.
     */
    figures?: Record<string, Uint8Array>;
    /**
     * Each floor object's `.glb` bytes, by object definition id, for every shot of the scene.
     */
    objects?: Record<string, Uint8Array>;
    /**
     * Reports the edited shot camera, once, when a drag, a key or the lens is released.
     */
    oncamera?: (camera: import("./lib/shot-scene.js").ShotCamera) => void;
    /**
     * Reports every node name in the scene's place, figure and object models, once per loaded scene; a cut does not report again.
     */
    onload?: (names: string[]) => void;
}, {}, "">;
type Props = {
    /**
     * The shot under the playhead, from the scene's previs read, or null.
     */
    shot?: import("./lib/shot-scene.js").PrevisShot | null;
    /**
     * The place definition the shot's blocking names; its door leaves are swung from it.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * The place's `.glb` bytes, as the host read them for the scene, or null.
     */
    place?: Uint8Array | null;
    /**
     * Each figure's `.glb` bytes, by build key, for every shot of the scene.
     */
    figures?: Record<string, Uint8Array>;
    /**
     * Each floor object's `.glb` bytes, by object definition id, for every shot of the scene.
     */
    objects?: Record<string, Uint8Array>;
    /**
     * Reports the edited shot camera, once, when a drag, a key or the lens is released.
     */
    oncamera?: (camera: import("./lib/shot-scene.js").ShotCamera) => void;
    /**
     * Reports every node name in the scene's place, figure and object models, once per loaded scene; a cut does not report again.
     */
    onload?: (names: string[]) => void;
};
