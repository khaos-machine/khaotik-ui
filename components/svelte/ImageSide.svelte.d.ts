export default ImageSide;
type ImageSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ImageSide: import("svelte").Component<{
    /**
     * The selected image; null when none is.
     */
    row?: import("./lib/images.js").ImageRow | null;
}, {}, "">;
type Props = {
    /**
     * The selected image; null when none is.
     */
    row?: import("./lib/images.js").ImageRow | null;
};
