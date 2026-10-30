export default VoiceDesignPanel;
type VoiceDesignPanel = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const VoiceDesignPanel: import("svelte").Component<{
    /**
     * Initial target text.
     */
    text?: string;
    /**
     * Initial voice description.
     */
    instruct?: string;
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
     * Language codes the engine designs in (D88). Empty hides the picker.
     */
    languages?: readonly string[];
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
         * The natural-language voice description.
         */
        instruct: string;
        /**
         * How to say this line, apart from who is saying it (D88). '' for none.
         */
        direction: string;
        /**
         * The chosen language code, or '' when the host offers none (D88).
         */
        lang: string;
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    }) => void;
    /**
     * The description is `instruct` and cannot be edited, so the line is where the work starts: the Text field takes focus on open (D90).
     */
    readonlyDescription?: boolean;
}, {}, "">;
type Props = {
    /**
     * Initial target text.
     */
    text?: string;
    /**
     * Initial voice description.
     */
    instruct?: string;
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
     * Language codes the engine designs in (D88). Empty hides the picker.
     */
    languages?: readonly string[];
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
         * The natural-language voice description.
         */
        instruct: string;
        /**
         * How to say this line, apart from who is saying it (D88). '' for none.
         */
        direction: string;
        /**
         * The chosen language code, or '' when the host offers none (D88).
         */
        lang: string;
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    }) => void;
    /**
     * The description is `instruct` and cannot be edited, so the line is where the work starts: the Text field takes focus on open (D90).
     */
    readonlyDescription?: boolean;
};
