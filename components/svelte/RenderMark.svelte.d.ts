export default RenderMark;
type RenderMark = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const RenderMark: import("svelte").Component<{
    /**
     * The engine's state. Absent renders nothing, and so does a state this kit does not know.
     */
    state?: "ready" | "stale" | "missing" | null;
    /**
     * The host's wording for this state, in place of the default.
     */
    label?: string;
    /**
     * Glyph only on screen; the label stays for assistive technology and as the tooltip.
     */
    compact?: boolean;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The engine's state. Absent renders nothing, and so does a state this kit does not know.
     */
    state?: "ready" | "stale" | "missing" | null;
    /**
     * The host's wording for this state, in place of the default.
     */
    label?: string;
    /**
     * Glyph only on screen; the label stays for assistive technology and as the tooltip.
     */
    compact?: boolean;
    /**
     * The `data-ui-id` (audit §3.14).
     */
    uiId?: string;
};
