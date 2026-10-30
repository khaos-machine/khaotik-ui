export default ShotPreview;
type ShotPreview = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ShotPreview: import("svelte").Component<{
    /**
     * Active timed shot, before or after rendering.
     */
    shot?: {
        title: string;
        direction: string;
        framing: string;
    } | null;
    /**
     * Optional chosen frame.
     */
    imageUrl?: string;
    /**
     * Current playhead event.
     */
    event?: {
        label: string;
        text: string;
    } | null;
    /**
     * Frame review label.
     */
    review?: string;
}, {}, "">;
type Props = {
    /**
     * Active timed shot, before or after rendering.
     */
    shot?: {
        title: string;
        direction: string;
        framing: string;
    } | null;
    /**
     * Optional chosen frame.
     */
    imageUrl?: string;
    /**
     * Current playhead event.
     */
    event?: {
        label: string;
        text: string;
    } | null;
    /**
     * Frame review label.
     */
    review?: string;
};
