export default SpeechControls;
type SpeechControls = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SpeechControls: import("svelte").Component<{
    /**
     * Sampling temperature, 0–2. Defaults to 0.9.
     */
    temperature?: number;
    /**
     * Top-k sampling, 1–100. Defaults to 50.
     */
    topK?: number;
    /**
     * Top-p (nucleus) sampling, 0–1. Defaults to 1.
     */
    topP?: number;
    /**
     * Repetition penalty, 1–2. Defaults to 1.05.
     */
    repetitionPenalty?: number;
    /**
     * Called with the changed parameter's key and new value.
     */
    onchange?: (key: "temperature" | "top_k" | "top_p" | "repetition_penalty", value: number) => void;
}, {}, "">;
type Props = {
    /**
     * Sampling temperature, 0–2. Defaults to 0.9.
     */
    temperature?: number;
    /**
     * Top-k sampling, 1–100. Defaults to 50.
     */
    topK?: number;
    /**
     * Top-p (nucleus) sampling, 0–1. Defaults to 1.
     */
    topP?: number;
    /**
     * Repetition penalty, 1–2. Defaults to 1.05.
     */
    repetitionPenalty?: number;
    /**
     * Called with the changed parameter's key and new value.
     */
    onchange?: (key: "temperature" | "top_k" | "top_p" | "repetition_penalty", value: number) => void;
};
