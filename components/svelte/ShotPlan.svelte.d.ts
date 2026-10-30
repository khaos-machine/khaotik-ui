export default ShotPlan;
type ShotPlan = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ShotPlan: import("svelte").Component<{
    /**
     * Which part to draw: the plan, or the selected figure's inspector with its pose picker.
     */
    part?: "plan" | "inspector";
    /**
     * The shot's head blocking, from the scene's previs read, or null.
     */
    blocking?: import("./lib/shot-scene.js").ShotBlocking | null;
    /**
     * The place definition the blocking names.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * Each floor object's definition, by object definition id, for its footprint.
     */
    objectDefinitions?: Record<string, {
        parts: {
            size: number[];
            position: number[];
            rotationDegrees: number[];
        }[];
    }>;
    /**
     * Each subject's display name, by subject id; a subject without one shows its id.
     */
    names?: Record<string, string>;
    /**
     * The selected figure's or object's subject id, or ''.
     */
    selected?: string;
    /**
     * Reports a figure or object chosen by click.
     */
    onselect?: (id: string) => void;
    /**
     * Reports an edited figure, whole, once, when a drag, a key or the pose picker is released.
     */
    onfigure?: (figure: import("./lib/shot-scene.js").ShotFigure) => void;
}, {}, "">;
type Props = {
    /**
     * Which part to draw: the plan, or the selected figure's inspector with its pose picker.
     */
    part?: "plan" | "inspector";
    /**
     * The shot's head blocking, from the scene's previs read, or null.
     */
    blocking?: import("./lib/shot-scene.js").ShotBlocking | null;
    /**
     * The place definition the blocking names.
     */
    definition?: import("./lib/place-plan.js").PlaceDefinition | null;
    /**
     * Each floor object's definition, by object definition id, for its footprint.
     */
    objectDefinitions?: Record<string, {
        parts: {
            size: number[];
            position: number[];
            rotationDegrees: number[];
        }[];
    }>;
    /**
     * Each subject's display name, by subject id; a subject without one shows its id.
     */
    names?: Record<string, string>;
    /**
     * The selected figure's or object's subject id, or ''.
     */
    selected?: string;
    /**
     * Reports a figure or object chosen by click.
     */
    onselect?: (id: string) => void;
    /**
     * Reports an edited figure, whole, once, when a drag, a key or the pose picker is released.
     */
    onfigure?: (figure: import("./lib/shot-scene.js").ShotFigure) => void;
};
