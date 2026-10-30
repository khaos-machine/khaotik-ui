export default Composer;
type Composer = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Composer: import("svelte").Component<{
    /**
     * Which part to draw.
     */
    part?: "stage" | "tools" | "planning" | "scene";
    /**
     * How the stage draws the shot under the playhead: `previs`, its 3D previs, or `rendered`, its frame.
     */
    view?: "previs" | "rendered";
    /**
     * PictureTimingReview's props, for `scene` and `tools`.
     */
    timing?: Record<string, any> | null;
    /**
     * The shot under the playhead and its frame, for the `rendered` view; null draws nothing.
     */
    stage?: {
        key: string;
        shot: any;
        imageUrl?: string;
        review?: string;
        event?: {
            label: string;
            text: string;
        } | null;
    } | null;
    /**
     * ShotPrevis's props, for the `previs` view: the shot under the playhead from the scene's previs read, and the scene's models; null draws nothing.
     */
    previs?: {
        shot: import("./lib/shot-scene.js").PrevisShot | null;
        definition: import("./lib/place-plan.js").PlaceDefinition | null;
        place: Uint8Array | null;
        figures: Record<string, Uint8Array>;
        objects: Record<string, Uint8Array>;
        oncamera?: (camera: import("./lib/shot-scene.js").ShotCamera) => void;
        onload?: (names: string[]) => void;
    } | null;
    /**
     * SceneShotPlanner's props, for `planning` and `scene`.
     */
    planner?: Record<string, any> | null;
    /**
     * ShotInspector's props, for `tools`.
     */
    inspector?: Record<string, any> | null;
    /**
     * The image filtering choice, for `tools`.
     */
    moderation?: {
        value: "auto" | "low";
        disabled?: boolean;
        onchange?: (value: "auto" | "low") => void;
    } | null;
    /**
     * What a running operation is doing, or ''.
     */
    phase?: string;
}, {}, "">;
type Props = {
    /**
     * Which part to draw.
     */
    part?: "stage" | "tools" | "planning" | "scene";
    /**
     * How the stage draws the shot under the playhead: `previs`, its 3D previs, or `rendered`, its frame.
     */
    view?: "previs" | "rendered";
    /**
     * PictureTimingReview's props, for `scene` and `tools`.
     */
    timing?: Record<string, any> | null;
    /**
     * The shot under the playhead and its frame, for the `rendered` view; null draws nothing.
     */
    stage?: {
        key: string;
        shot: any;
        imageUrl?: string;
        review?: string;
        event?: {
            label: string;
            text: string;
        } | null;
    } | null;
    /**
     * ShotPrevis's props, for the `previs` view: the shot under the playhead from the scene's previs read, and the scene's models; null draws nothing.
     */
    previs?: {
        shot: import("./lib/shot-scene.js").PrevisShot | null;
        definition: import("./lib/place-plan.js").PlaceDefinition | null;
        place: Uint8Array | null;
        figures: Record<string, Uint8Array>;
        objects: Record<string, Uint8Array>;
        oncamera?: (camera: import("./lib/shot-scene.js").ShotCamera) => void;
        onload?: (names: string[]) => void;
    } | null;
    /**
     * SceneShotPlanner's props, for `planning` and `scene`.
     */
    planner?: Record<string, any> | null;
    /**
     * ShotInspector's props, for `tools`.
     */
    inspector?: Record<string, any> | null;
    /**
     * The image filtering choice, for `tools`.
     */
    moderation?: {
        value: "auto" | "low";
        disabled?: boolean;
        onchange?: (value: "auto" | "low") => void;
    } | null;
    /**
     * What a running operation is doing, or ''.
     */
    phase?: string;
};
