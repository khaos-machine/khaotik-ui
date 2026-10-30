export default ImageDetail;
type ImageDetail = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ImageDetail: import("svelte").Component<{
    /**
     * The selected image; null when none is.
     */
    row?: import("./lib/images.js").ImageRow | null;
    /**
     * The image's URL, as the host resolved it. Empty draws the placeholder.
     */
    src?: string;
    /**
     * Reports the image's subject to show.
     */
    onRevealSubject?: (subject: {
        kind: "character" | "location" | "object";
        id: string;
    }) => void;
}, {}, "">;
type Props = {
    /**
     * The selected image; null when none is.
     */
    row?: import("./lib/images.js").ImageRow | null;
    /**
     * The image's URL, as the host resolved it. Empty draws the placeholder.
     */
    src?: string;
    /**
     * Reports the image's subject to show.
     */
    onRevealSubject?: (subject: {
        kind: "character" | "location" | "object";
        id: string;
    }) => void;
};
