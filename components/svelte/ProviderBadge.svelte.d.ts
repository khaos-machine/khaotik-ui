export default ProviderBadge;
type ProviderBadge = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProviderBadge: import("svelte").Component<{
    /**
     * Provider name. Rendered VERBATIM beside its mark, and — only when `providerId` is absent — matched case-insensitively against the marks the kit ships.
     */
    provider?: string;
    /**
     * The engine's id for this provider, used to RESOLVE the mark. Absent falls back to `provider`, so every existing caller is unchanged.
     *
     * **This exists because the label and the lookup key are not the same thing, and treating them as one produced the same defect four times.** khaosd serves a provider under several spellings — an engine id on `/api/v1/settings`, a display name in the voice catalogue, a `providerId` on each voice row, an analysis id on a prompt trace, and a `title` for a Settings pane. #157, #163, #165 and #178 were each one of those spellings arriving without artwork, and each was answered with another alias.
     *
     * `title` is what broke the pattern: khaosd calls `openai` **"OpenAI Platform"**, which lowercases to a key no table will ever hold unless someone adds it by hand. A host wanting the pane to READ "OpenAI Platform" had to choose between the right label and the right mark.
     *
     * So it stops being a spelling problem. Pass the id you already have and the label you want; the kit resolves one and prints the other, and a title khaosd invents next month needs no change here.
     */
    providerId?: string;
    /**
     * The tier, rendered as quiet text after the chip. VERBATIM and lowercased by CSS, not by code — `standard` and `premium` are the producer's words. Absent renders nothing. Worth knowing before deciding to pass it: the live capture is 324 `premium` to 47 `standard`, so showing it on every voice tells a reader very little.
     */
    qualityTier?: "" | "standard" | "premium";
}, {}, "">;
type Props = {
    /**
     * Provider name. Rendered VERBATIM beside its mark, and — only when `providerId` is absent — matched case-insensitively against the marks the kit ships.
     */
    provider?: string;
    /**
     * The engine's id for this provider, used to RESOLVE the mark. Absent falls back to `provider`, so every existing caller is unchanged.
     *
     * **This exists because the label and the lookup key are not the same thing, and treating them as one produced the same defect four times.** khaosd serves a provider under several spellings — an engine id on `/api/v1/settings`, a display name in the voice catalogue, a `providerId` on each voice row, an analysis id on a prompt trace, and a `title` for a Settings pane. #157, #163, #165 and #178 were each one of those spellings arriving without artwork, and each was answered with another alias.
     *
     * `title` is what broke the pattern: khaosd calls `openai` **"OpenAI Platform"**, which lowercases to a key no table will ever hold unless someone adds it by hand. A host wanting the pane to READ "OpenAI Platform" had to choose between the right label and the right mark.
     *
     * So it stops being a spelling problem. Pass the id you already have and the label you want; the kit resolves one and prints the other, and a title khaosd invents next month needs no change here.
     */
    providerId?: string;
    /**
     * The tier, rendered as quiet text after the chip. VERBATIM and lowercased by CSS, not by code — `standard` and `premium` are the producer's words. Absent renders nothing. Worth knowing before deciding to pass it: the live capture is 324 `premium` to 47 `standard`, so showing it on every voice tells a reader very little.
     */
    qualityTier?: "" | "standard" | "premium";
};
