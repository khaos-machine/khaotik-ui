export default AudioSide;
type AudioSide = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const AudioSide: import("svelte").Component<{
    /**
     * The selected recording; null when none is.
     */
    recording?: import("./lib/recordings.js").Recording | null;
    /**
     * The host's line inspector, rendered in place of the facts while a read's line is followed.
     */
    line?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The selected recording; null when none is.
     */
    recording?: import("./lib/recordings.js").Recording | null;
    /**
     * The host's line inspector, rendered in place of the facts while a read's line is followed.
     */
    line?: import("svelte").Snippet | undefined;
};
