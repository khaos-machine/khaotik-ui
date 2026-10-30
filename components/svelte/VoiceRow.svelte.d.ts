export default VoiceRow;
type VoiceRow = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const VoiceRow: import("svelte").Component<{
    /**
     * The voice's name, and the row's accessible name.
     */
    name?: string;
    /**
     * Its language code.
     */
    language?: string;
    /**
     * Where the voice comes from: its engine, short ("Qwen3", "Gemini").
     */
    source?: string;
    /**
     * A short state shown in words: "not locked", "deleted".
     */
    status?: string;
    /**
     * The voice shown in the detail.
     */
    selected?: boolean;
    /**
     * Reports the row chosen.
     */
    onclick?: (() => void) | undefined;
}, {}, "">;
type Props = {
    /**
     * The voice's name, and the row's accessible name.
     */
    name?: string;
    /**
     * Its language code.
     */
    language?: string;
    /**
     * Where the voice comes from: its engine, short ("Qwen3", "Gemini").
     */
    source?: string;
    /**
     * A short state shown in words: "not locked", "deleted".
     */
    status?: string;
    /**
     * The voice shown in the detail.
     */
    selected?: boolean;
    /**
     * Reports the row chosen.
     */
    onclick?: (() => void) | undefined;
};
