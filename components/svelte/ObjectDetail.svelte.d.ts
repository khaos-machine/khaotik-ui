export default ObjectDetail;
type ObjectDetail = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ObjectDetail: import("svelte").Component<{
    /**
     * The selected object's row; null when none is selected.
     */
    object?: import("./lib/places.js").ObjectRecord | null;
    /**
     * The story's scenes, to list the ones the object appears in.
     */
    scenes?: readonly {
        id: string;
        /**
         * 0-based place in the story.
         */
        index?: number;
        slugline?: string;
    }[];
    /**
     * Reports a scene to open.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * The object's images read.
     */
    images?: import("./lib/types.js").SubjectImagesRead;
    /**
     * Resolved image URLs by reference id.
     */
    imageUrls?: Readonly<Record<string, string>>;
    /**
     * Reports an activated image.
     */
    onRevealImage?: (referenceId: string) => void;
    /**
     * Reports the view chosen.
     */
    onview?: (view: "scenes" | "images") => void;
}, {}, "">;
type Props = {
    /**
     * The selected object's row; null when none is selected.
     */
    object?: import("./lib/places.js").ObjectRecord | null;
    /**
     * The story's scenes, to list the ones the object appears in.
     */
    scenes?: readonly {
        id: string;
        /**
         * 0-based place in the story.
         */
        index?: number;
        slugline?: string;
    }[];
    /**
     * Reports a scene to open.
     */
    onRevealScene?: (sceneId: string) => void;
    /**
     * The object's images read.
     */
    images?: import("./lib/types.js").SubjectImagesRead;
    /**
     * Resolved image URLs by reference id.
     */
    imageUrls?: Readonly<Record<string, string>>;
    /**
     * Reports an activated image.
     */
    onRevealImage?: (referenceId: string) => void;
    /**
     * Reports the view chosen.
     */
    onview?: (view: "scenes" | "images") => void;
};
