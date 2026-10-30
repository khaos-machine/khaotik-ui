export default InspectorSection;
type InspectorSection = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const InspectorSection: import("svelte").Component<{
    /**
     * The section's name.
     */
    title?: string;
    /**
     * Shown beside the name, exactly as given. Absent when not given.
     */
    count?: number | null;
    /**
     * Whether the section starts collapsed.
     */
    collapsed?: boolean;
    /**
     * Called with the new collapsed state.
     */
    oncollapse?: (collapsed: boolean) => void;
    /**
     * A reading drawn at the end of the header, such as a status pill. Absent when not given.
     */
    meta?: import("svelte").Snippet;
    /**
     * The section's body.
     */
    children?: import("svelte").Snippet;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
}, {}, "">;
type Props = {
    /**
     * The section's name.
     */
    title?: string;
    /**
     * Shown beside the name, exactly as given. Absent when not given.
     */
    count?: number | null;
    /**
     * Whether the section starts collapsed.
     */
    collapsed?: boolean;
    /**
     * Called with the new collapsed state.
     */
    oncollapse?: (collapsed: boolean) => void;
    /**
     * A reading drawn at the end of the header, such as a status pill. Absent when not given.
     */
    meta?: import("svelte").Snippet;
    /**
     * The section's body.
     */
    children?: import("svelte").Snippet;
    /**
     * The `data-ui-id` prefix (audit §3.14).
     */
    uiId?: string;
};
