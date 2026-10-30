export default ImageThumb;
type ImageThumb = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ImageThumb: import("svelte").Component<{
    /**
     * The image URL the host resolved. Empty draws the placeholder.
     */
    src?: string;
    /**
     * What the image is of, for its accessible name.
     */
    name?: string;
    /**
     * The subject's kind, which picks the placeholder.
     */
    kind?: "character" | "location" | "object";
    /**
     * The image's measured width, for its aspect.
     */
    width?: number;
    /**
     * The image's measured height, for its aspect.
     */
    height?: number;
    /**
     * A fixed 40px square, for a table row.
     */
    square?: boolean;
}, {}, "">;
type Props = {
    /**
     * The image URL the host resolved. Empty draws the placeholder.
     */
    src?: string;
    /**
     * What the image is of, for its accessible name.
     */
    name?: string;
    /**
     * The subject's kind, which picks the placeholder.
     */
    kind?: "character" | "location" | "object";
    /**
     * The image's measured width, for its aspect.
     */
    width?: number;
    /**
     * The image's measured height, for its aspect.
     */
    height?: number;
    /**
     * A fixed 40px square, for a table row.
     */
    square?: boolean;
};
