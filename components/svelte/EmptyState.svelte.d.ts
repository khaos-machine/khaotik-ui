export default EmptyState;
type EmptyState = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const EmptyState: import("svelte").Component<{
    /**
     * Display title.
     */
    title?: string;
    /**
     * Optional supporting copy below the title.
     */
    description?: string;
    /**
     * Optional Phosphor icon name rendered in the well.
     */
    icon?: string;
    /**
     * Optional action rendered below the copy, typically a button. Omit it and the well is copy only.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * Display title.
     */
    title?: string;
    /**
     * Optional supporting copy below the title.
     */
    description?: string;
    /**
     * Optional Phosphor icon name rendered in the well.
     */
    icon?: string;
    /**
     * Optional action rendered below the copy, typically a button. Omit it and the well is copy only.
     */
    children?: import("svelte").Snippet;
};
