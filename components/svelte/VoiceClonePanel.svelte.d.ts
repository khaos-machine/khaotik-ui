export default VoiceClonePanel;
type VoiceClonePanel = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const VoiceClonePanel: import("svelte").Component<{
    /**
     * Initial reference clip (data URI or URL).
     */
    refAudio?: string;
    /**
     * Initial reference transcript.
     */
    refText?: string;
    /**
     * Initial target text.
     */
    text?: string;
    /**
     * 0–2. Defaults to 0.9.
     */
    temperature?: number;
    /**
     * 1–100. Defaults to 50.
     */
    topK?: number;
    /**
     * 0–1. Defaults to 1.
     */
    topP?: number;
    /**
     * 1–2. Defaults to 1.05.
     */
    repetitionPenalty?: number;
    /**
     * Language codes the engine clones in (D88). Empty hides the picker.
     */
    languages?: readonly string[];
    /**
     * The clone models the host can run, best first (D88). Two or more show a choice.
     */
    models?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * The generated clip to audition.
     */
    result?: {
        /**
         * Audio URL of the generated clip.
         */
        src: string;
        /**
         * True while the host is synthesizing.
         */
        generating?: boolean;
    } | null;
    /**
     * Called with the full spec when Generate is pressed.
     */
    ongenerate?: (spec: {
        /**
         * The target text to synthesize.
         */
        text: string;
        /**
         * The reference clip as a data URI or URL.
         */
        refAudio: string;
        /**
         * The reference transcript (optional; timbre-only when empty).
         */
        refText: string;
        /**
         * The chosen language code, or '' when the host offers none (D88).
         */
        lang: string;
        /**
         * The chosen model's id, or '' when the host offers none (D88).
         */
        cloneModel: string;
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    }) => void;
}, {}, "">;
type Props = {
    /**
     * Initial reference clip (data URI or URL).
     */
    refAudio?: string;
    /**
     * Initial reference transcript.
     */
    refText?: string;
    /**
     * Initial target text.
     */
    text?: string;
    /**
     * 0–2. Defaults to 0.9.
     */
    temperature?: number;
    /**
     * 1–100. Defaults to 50.
     */
    topK?: number;
    /**
     * 0–1. Defaults to 1.
     */
    topP?: number;
    /**
     * 1–2. Defaults to 1.05.
     */
    repetitionPenalty?: number;
    /**
     * Language codes the engine clones in (D88). Empty hides the picker.
     */
    languages?: readonly string[];
    /**
     * The clone models the host can run, best first (D88). Two or more show a choice.
     */
    models?: readonly {
        id: string;
        label: string;
    }[];
    /**
     * The generated clip to audition.
     */
    result?: {
        /**
         * Audio URL of the generated clip.
         */
        src: string;
        /**
         * True while the host is synthesizing.
         */
        generating?: boolean;
    } | null;
    /**
     * Called with the full spec when Generate is pressed.
     */
    ongenerate?: (spec: {
        /**
         * The target text to synthesize.
         */
        text: string;
        /**
         * The reference clip as a data URI or URL.
         */
        refAudio: string;
        /**
         * The reference transcript (optional; timbre-only when empty).
         */
        refText: string;
        /**
         * The chosen language code, or '' when the host offers none (D88).
         */
        lang: string;
        /**
         * The chosen model's id, or '' when the host offers none (D88).
         */
        cloneModel: string;
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    }) => void;
};
