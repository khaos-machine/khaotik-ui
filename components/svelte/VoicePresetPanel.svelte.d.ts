export default VoicePresetPanel;
type VoicePresetPanel = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const VoicePresetPanel: import("svelte").Component<{
    /**
     * The engine's preset speakers.
     */
    speakers?: readonly {
        /**
         * The speaker id the engine takes.
         */
        id: string;
        /**
         * The display name.
         */
        name: string;
    }[];
    /**
     * Why there are no speakers to choose from, in the host's words. Shown in place of the picker.
     */
    speakersReason?: string;
    /**
     * Language codes the preset speakers speak (D88). Empty hides the picker.
     */
    languages?: readonly string[];
    /**
     * The generating flag; a workbench host passes an empty `src`.
     */
    result?: {
        /**
         * Audio URL of the generated clip. Empty hides the player.
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
         * The chosen speaker's id.
         */
        speaker: string;
        /**
         * The style direction, or '' for none.
         */
        instruct: string;
        /**
         * The line to speak.
         */
        text: string;
        /**
         * The chosen language code, or '' when the host offers none (D88).
         */
        lang: string;
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    }) => void;
}, {}, "">;
type Props = {
    /**
     * The engine's preset speakers.
     */
    speakers?: readonly {
        /**
         * The speaker id the engine takes.
         */
        id: string;
        /**
         * The display name.
         */
        name: string;
    }[];
    /**
     * Why there are no speakers to choose from, in the host's words. Shown in place of the picker.
     */
    speakersReason?: string;
    /**
     * Language codes the preset speakers speak (D88). Empty hides the picker.
     */
    languages?: readonly string[];
    /**
     * The generating flag; a workbench host passes an empty `src`.
     */
    result?: {
        /**
         * Audio URL of the generated clip. Empty hides the player.
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
         * The chosen speaker's id.
         */
        speaker: string;
        /**
         * The style direction, or '' for none.
         */
        instruct: string;
        /**
         * The line to speak.
         */
        text: string;
        /**
         * The chosen language code, or '' when the host offers none (D88).
         */
        lang: string;
        temperature: number;
        topK: number;
        topP: number;
        repetitionPenalty: number;
    }) => void;
};
