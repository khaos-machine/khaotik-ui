export default ObjectSide;
type ObjectSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ObjectSide: import("svelte").Component<{
    /**
     * An object is selected; nothing renders otherwise.
     */
    selected?: boolean;
    /**
     * The object's name.
     */
    name?: string;
    /**
     * Where the object's design stands.
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
     * Opens the object designer.
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
        form: string;
        materials?: string;
        distinguishingDetails?: readonly string[];
    } | null;
}, {}, "">;
type Props = {
    /**
     * An object is selected; nothing renders otherwise.
     */
    selected?: boolean;
    /**
     * The object's name.
     */
    name?: string;
    /**
     * Where the object's design stands.
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
     * Opens the object designer.
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
        form: string;
        materials?: string;
        distinguishingDetails?: readonly string[];
    } | null;
};
