export default Gallery;
type Gallery = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Gallery: import("svelte").Component<{
    /**
     * Array of `{ src?, caption? }` entries; `src` makes the thumbnail a real image.
     */
    images?: readonly {
        /**
         * Identity passed to `onactivate`; an entry without one is not activatable.
         */
        id?: string;
        src?: string;
        caption?: string;
        gender?: string;
        age?: string;
    }[];
    /**
     * Fallback name used by template thumbnails without a caption.
     */
    name?: string;
    /**
     * Template kind for thumbnails without a `src`.
     */
    kind?: "object" | "scene" | "person" | "location";
    /**
     * Asked with an entry's `id` when it is activated. When set, each entry with an `id` is a native button named by its caption (or `name`), so click, Return and Space all reach it.
     */
    onactivate?: (id: string) => void;
    /**
     * Passed through to `Portrait` to override the kit's shipped placeholder for entries with no `src` of their own (#23). Returning nothing falls back to the kit's own set.
     */
    figureFor?: (figure: {
        gender: string;
        age: string;
        name: string;
        identity: string;
        kind: "object" | "scene" | "person" | "location";
    }) => ({
        src: string;
        srcset?: string;
    } | string | null | undefined);
}, {}, "">;
type Props = {
    /**
     * Array of `{ src?, caption? }` entries; `src` makes the thumbnail a real image.
     */
    images?: readonly {
        /**
         * Identity passed to `onactivate`; an entry without one is not activatable.
         */
        id?: string;
        src?: string;
        caption?: string;
        gender?: string;
        age?: string;
    }[];
    /**
     * Fallback name used by template thumbnails without a caption.
     */
    name?: string;
    /**
     * Template kind for thumbnails without a `src`.
     */
    kind?: "object" | "scene" | "person" | "location";
    /**
     * Asked with an entry's `id` when it is activated. When set, each entry with an `id` is a native button named by its caption (or `name`), so click, Return and Space all reach it.
     */
    onactivate?: (id: string) => void;
    /**
     * Passed through to `Portrait` to override the kit's shipped placeholder for entries with no `src` of their own (#23). Returning nothing falls back to the kit's own set.
     */
    figureFor?: (figure: {
        gender: string;
        age: string;
        name: string;
        identity: string;
        kind: "object" | "scene" | "person" | "location";
    }) => ({
        src: string;
        srcset?: string;
    } | string | null | undefined);
};
