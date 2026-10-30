export default SoundStudio;
type SoundStudio = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SoundStudio: import("svelte").Component<{
    /**
     * Sound-effect takes, newest first.
     */
    sfxTakes?: readonly {
        /**
         * The engine's generation id.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2".
         */
        label: string;
        /**
         * When it was generated, as an ISO 8601 timestamp.
         */
        createdAt: string;
        /**
         * What made it, in words: the prompt or caption.
         */
        voiceName: string;
        /**
         * Playable audio. Without it the take's player is disabled.
         */
        src?: string;
        /**
         * Why the engine made nothing, verbatim.
         */
        error?: string;
    }[];
    /**
     * Music takes, newest first.
     */
    musicTakes?: readonly {
        /**
         * The engine's generation id.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2".
         */
        label: string;
        /**
         * When it was generated, as an ISO 8601 timestamp.
         */
        createdAt: string;
        /**
         * What made it, in words: the prompt or caption.
         */
        voiceName: string;
        /**
         * Playable audio. Without it the take's player is disabled.
         */
        src?: string;
        /**
         * Why the engine made nothing, verbatim.
         */
        error?: string;
    }[];
    /**
     * Which kind is generating, if any. Disables both Generates: the host generates one at a time.
     */
    generating?: "sfx" | "music" | null;
    /**
     * Generate a sound effect. Without it that tab's Generate is disabled.
     */
    onSfx?: (kind: "sfx", spec: {
        /**
         * A concrete, scene-level description of the sound.
         */
        prompt: string;
        durationSeconds: number;
    }) => void;
    /**
     * Generate music. Without it that tab's Generate is disabled.
     */
    onMusic?: (kind: "music", spec: {
        /**
         * What the music is: style, instruments, mood.
         */
        caption: string;
        /**
         * True for music without words.
         */
        instrumental: boolean;
        /**
         * The words, trimmed. Empty when instrumental.
         */
        lyrics: string;
        /**
         * Seconds, up to the supplied `maxDurationSeconds`.
         */
        duration: number;
        /**
         * 1 to the supplied `maxSteps`. Absent unless the storyteller opened the finer controls.
         */
        steps?: number;
        /**
         * Absent unless set. 0 is a real seed.
         */
        seed?: number;
    }) => void;
    /**
     * Why a sound effect cannot be generated now, in the host's words.
     */
    sfxReason?: string;
    /**
     * Why music cannot be generated now, in the host's words.
     */
    musicReason?: string;
    /**
     * The engine's music bounds, as the host has them. Without them music does not generate.
     */
    musicLimits?: {
        /**
         * The longest piece the engine makes, in seconds.
         */
        maxDurationSeconds: number;
        /**
         * The most steps the engine takes.
         */
        maxSteps: number;
    };
    /**
     * Asks for a failed take again, of either kind (D85).
     */
    onRetryTake?: (id: string) => void;
    /**
     * How far the generation in flight has got, in the host's words (D87).
     */
    progress?: string;
}, {}, "">;
type Props = {
    /**
     * Sound-effect takes, newest first.
     */
    sfxTakes?: readonly {
        /**
         * The engine's generation id.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2".
         */
        label: string;
        /**
         * When it was generated, as an ISO 8601 timestamp.
         */
        createdAt: string;
        /**
         * What made it, in words: the prompt or caption.
         */
        voiceName: string;
        /**
         * Playable audio. Without it the take's player is disabled.
         */
        src?: string;
        /**
         * Why the engine made nothing, verbatim.
         */
        error?: string;
    }[];
    /**
     * Music takes, newest first.
     */
    musicTakes?: readonly {
        /**
         * The engine's generation id.
         */
        id: string;
        /**
         * The take's name, e.g. "Take 2".
         */
        label: string;
        /**
         * When it was generated, as an ISO 8601 timestamp.
         */
        createdAt: string;
        /**
         * What made it, in words: the prompt or caption.
         */
        voiceName: string;
        /**
         * Playable audio. Without it the take's player is disabled.
         */
        src?: string;
        /**
         * Why the engine made nothing, verbatim.
         */
        error?: string;
    }[];
    /**
     * Which kind is generating, if any. Disables both Generates: the host generates one at a time.
     */
    generating?: "sfx" | "music" | null;
    /**
     * Generate a sound effect. Without it that tab's Generate is disabled.
     */
    onSfx?: (kind: "sfx", spec: {
        /**
         * A concrete, scene-level description of the sound.
         */
        prompt: string;
        durationSeconds: number;
    }) => void;
    /**
     * Generate music. Without it that tab's Generate is disabled.
     */
    onMusic?: (kind: "music", spec: {
        /**
         * What the music is: style, instruments, mood.
         */
        caption: string;
        /**
         * True for music without words.
         */
        instrumental: boolean;
        /**
         * The words, trimmed. Empty when instrumental.
         */
        lyrics: string;
        /**
         * Seconds, up to the supplied `maxDurationSeconds`.
         */
        duration: number;
        /**
         * 1 to the supplied `maxSteps`. Absent unless the storyteller opened the finer controls.
         */
        steps?: number;
        /**
         * Absent unless set. 0 is a real seed.
         */
        seed?: number;
    }) => void;
    /**
     * Why a sound effect cannot be generated now, in the host's words.
     */
    sfxReason?: string;
    /**
     * Why music cannot be generated now, in the host's words.
     */
    musicReason?: string;
    /**
     * The engine's music bounds, as the host has them. Without them music does not generate.
     */
    musicLimits?: {
        /**
         * The longest piece the engine makes, in seconds.
         */
        maxDurationSeconds: number;
        /**
         * The most steps the engine takes.
         */
        maxSteps: number;
    };
    /**
     * Asks for a failed take again, of either kind (D85).
     */
    onRetryTake?: (id: string) => void;
    /**
     * How far the generation in flight has got, in the host's words (D87).
     */
    progress?: string;
};
