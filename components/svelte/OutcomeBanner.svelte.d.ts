export default OutcomeBanner;
type OutcomeBanner = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const OutcomeBanner: import("svelte").Component<{
    /**
     * One or the other. An outcome is done or it failed; a component that also took `info` or `warning` would invite reporting a mutation as neither. Drives the tint, the icon, and whether a screen reader is interrupted (`alert`) or waits (`status`).
     */
    tone?: "success" | "error";
    /**
     * The short human summary — "Project deleted", "Could not delete project". Yours, because only you know what was attempted.
     */
    title?: string;
    /**
     * The engine's message, verbatim. Rendered monospace and **never truncated** — an error clipped mid-sentence reads as complete, which is worse than showing none.
     */
    detail?: string;
    /**
     * Whether to render the dismiss control.
     */
    dismissible?: boolean;
    /**
     * Reports a dismiss. Removing the banner is yours.
     */
    onDismiss?: () => void;
}, {}, "">;
type Props = {
    /**
     * One or the other. An outcome is done or it failed; a component that also took `info` or `warning` would invite reporting a mutation as neither. Drives the tint, the icon, and whether a screen reader is interrupted (`alert`) or waits (`status`).
     */
    tone?: "success" | "error";
    /**
     * The short human summary — "Project deleted", "Could not delete project". Yours, because only you know what was attempted.
     */
    title?: string;
    /**
     * The engine's message, verbatim. Rendered monospace and **never truncated** — an error clipped mid-sentence reads as complete, which is worse than showing none.
     */
    detail?: string;
    /**
     * Whether to render the dismiss control.
     */
    dismissible?: boolean;
    /**
     * Reports a dismiss. Removing the banner is yours.
     */
    onDismiss?: () => void;
};
