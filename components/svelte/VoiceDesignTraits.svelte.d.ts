export default VoiceDesignTraits;
type VoiceDesignTraits = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const VoiceDesignTraits: import("svelte").Component<{
    /**
     * Explicit creative traits.
     */
    value?: {
        age?: string;
        gender?: string;
        languageCode?: string;
        regionCode?: string;
        accent?: string;
        pitch?: string;
        timbre?: string;
        persona?: string;
        context?: string;
        delivery?: string;
    };
    /**
     * A request prevents edits.
     */
    disabled?: boolean;
    /**
     * Edit traits without generating audio.
     */
    onchange?: (patch: {
        age?: string;
        gender?: string;
        languageCode?: string;
        regionCode?: string;
        accent?: string;
        pitch?: string;
        timbre?: string;
        persona?: string;
        context?: string;
        delivery?: string;
    }) => void;
}, {}, "">;
type Props = {
    /**
     * Explicit creative traits.
     */
    value?: {
        age?: string;
        gender?: string;
        languageCode?: string;
        regionCode?: string;
        accent?: string;
        pitch?: string;
        timbre?: string;
        persona?: string;
        context?: string;
        delivery?: string;
    };
    /**
     * A request prevents edits.
     */
    disabled?: boolean;
    /**
     * Edit traits without generating audio.
     */
    onchange?: (patch: {
        age?: string;
        gender?: string;
        languageCode?: string;
        regionCode?: string;
        accent?: string;
        pitch?: string;
        timbre?: string;
        persona?: string;
        context?: string;
        delivery?: string;
    }) => void;
};
