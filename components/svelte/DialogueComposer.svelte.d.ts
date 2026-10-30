export default DialogueComposer;
type DialogueComposer = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const DialogueComposer: import("svelte").Component<{
    /**
     * Initial `Name: line` script.
     */
    script?: string;
    /**
     * Initial pause, 0–3 seconds. Defaults to 0.
     */
    pauseSeconds?: number;
    /**
     * The merged clip to audition.
     */
    result?: {
        /**
         * Audio URL of the merged clip.
         */
        src: string;
        /**
         * True while the host is synthesizing.
         */
        generating?: boolean;
    } | null;
    /**
     * Called with the script and pause when Generate is pressed.
     */
    ongenerate?: (spec: {
        /**
         * The dialogue as `Name: line` pairs, one per line.
         */
        script: string;
        /**
         * Silence between lines, in seconds.
         */
        pauseSeconds: number;
    }) => void;
}, {}, "">;
type Props = {
    /**
     * Initial `Name: line` script.
     */
    script?: string;
    /**
     * Initial pause, 0–3 seconds. Defaults to 0.
     */
    pauseSeconds?: number;
    /**
     * The merged clip to audition.
     */
    result?: {
        /**
         * Audio URL of the merged clip.
         */
        src: string;
        /**
         * True while the host is synthesizing.
         */
        generating?: boolean;
    } | null;
    /**
     * Called with the script and pause when Generate is pressed.
     */
    ongenerate?: (spec: {
        /**
         * The dialogue as `Name: line` pairs, one per line.
         */
        script: string;
        /**
         * Silence between lines, in seconds.
         */
        pauseSeconds: number;
    }) => void;
};
