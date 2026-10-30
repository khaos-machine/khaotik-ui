export default ProviderMark;
type ProviderMark = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProviderMark: import("svelte").Component<{
    /**
     * The provider, matched case-insensitively against the marks the kit ships. Used only when `providerId` is absent.
     */
    provider?: string;
    /**
     * The engine's id, which RESOLVES the mark. Absent falls back to `provider`. The split is #178's: khaosd serves a provider under several spellings and a display title is not a lookup key.
     */
    providerId?: string;
    /**
     * The provider runs on this computer, as the engine reports it (D84). Draws the `desktop` glyph, after a shipped brand mark.
     */
    local?: boolean;
    /**
     * Phosphor glyph drawn when the kit ships no artwork and the provider is not local. `plugs-connected` by default — a neutral placeholder rather than an invented brand mark.
     */
    fallbackIcon?: string;
}, {}, "">;
type Props = {
    /**
     * The provider, matched case-insensitively against the marks the kit ships. Used only when `providerId` is absent.
     */
    provider?: string;
    /**
     * The engine's id, which RESOLVES the mark. Absent falls back to `provider`. The split is #178's: khaosd serves a provider under several spellings and a display title is not a lookup key.
     */
    providerId?: string;
    /**
     * The provider runs on this computer, as the engine reports it (D84). Draws the `desktop` glyph, after a shipped brand mark.
     */
    local?: boolean;
    /**
     * Phosphor glyph drawn when the kit ships no artwork and the provider is not local. `plugs-connected` by default — a neutral placeholder rather than an invented brand mark.
     */
    fallbackIcon?: string;
};
