export default SubjectImages;
type SubjectImages = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SubjectImages: import("svelte").Component<{
    /**
     * Where the read is. Loading until the host says otherwise.
     */
    read?: import("./lib/types.js").SubjectImagesRead;
    /**
     * Resolved image URLs by reference id. A missing one draws the placeholder.
     */
    urls?: Readonly<Record<string, string>>;
    /**
     * The subject's kind, which picks the placeholder.
     */
    kind?: "character" | "location" | "object";
    /**
     * Reports an activated image.
     */
    onRevealImage?: (referenceId: string) => void;
}, {}, "">;
type Props = {
    /**
     * Where the read is. Loading until the host says otherwise.
     */
    read?: import("./lib/types.js").SubjectImagesRead;
    /**
     * Resolved image URLs by reference id. A missing one draws the placeholder.
     */
    urls?: Readonly<Record<string, string>>;
    /**
     * The subject's kind, which picks the placeholder.
     */
    kind?: "character" | "location" | "object";
    /**
     * Reports an activated image.
     */
    onRevealImage?: (referenceId: string) => void;
};
