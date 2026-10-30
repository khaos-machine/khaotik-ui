export default PlaceSide;
type PlaceSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const PlaceSide: import("svelte").Component<{
    /**
     * A place is selected; nothing renders otherwise.
     */
    selected?: boolean;
    /**
     * The place's name.
     */
    name?: string;
    /**
     * Where the place's design stands.
     */
    design?: import("./lib/types.js").DesignState;
    /**
     * What the designer is doing now, while a job runs.
     */
    activity?: string;
    /**
     * The designer's last error.
     */
    error?: string;
    /**
     * Opens the place designer.
     */
    ondesign?: (() => void) | undefined;
    /**
     * The host's identity section.
     */
    identity?: import("svelte").Snippet | undefined;
    /**
     * The drafted design direction; null before one is drafted.
     */
    direction?: {
        spatialDescription: string;
        lighting?: string;
        fixedFeatures?: readonly string[];
    } | null;
    /**
     * The place's states; listed only when there is more than one.
     */
    states?: readonly {
        /**
         * The engine's state key.
         */
        key: string;
        /**
         * The engine's display label, such as "Interior · Day".
         */
        label: string;
        /**
         * The scenes set in this state.
         */
        sceneNumbers: readonly number[];
    }[];
    /**
     * The key of the state shown.
     */
    state?: string;
    /**
     * The engine's message when the shown state could not be read.
     */
    stateError?: string;
    /**
     * Asked with the key of the state chosen.
     */
    onstate?: ((key: string) => void) | undefined;
}, {}, "">;
type Props = {
    /**
     * A place is selected; nothing renders otherwise.
     */
    selected?: boolean;
    /**
     * The place's name.
     */
    name?: string;
    /**
     * Where the place's design stands.
     */
    design?: import("./lib/types.js").DesignState;
    /**
     * What the designer is doing now, while a job runs.
     */
    activity?: string;
    /**
     * The designer's last error.
     */
    error?: string;
    /**
     * Opens the place designer.
     */
    ondesign?: (() => void) | undefined;
    /**
     * The host's identity section.
     */
    identity?: import("svelte").Snippet | undefined;
    /**
     * The drafted design direction; null before one is drafted.
     */
    direction?: {
        spatialDescription: string;
        lighting?: string;
        fixedFeatures?: readonly string[];
    } | null;
    /**
     * The place's states; listed only when there is more than one.
     */
    states?: readonly {
        /**
         * The engine's state key.
         */
        key: string;
        /**
         * The engine's display label, such as "Interior · Day".
         */
        label: string;
        /**
         * The scenes set in this state.
         */
        sceneNumbers: readonly number[];
    }[];
    /**
     * The key of the state shown.
     */
    state?: string;
    /**
     * The engine's message when the shown state could not be read.
     */
    stateError?: string;
    /**
     * Asked with the key of the state chosen.
     */
    onstate?: ((key: string) => void) | undefined;
};
