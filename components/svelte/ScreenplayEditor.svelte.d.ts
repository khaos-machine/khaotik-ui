export default ScreenplayEditor;
type ScreenplayEditor = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ScreenplayEditor: import("svelte").Component<{
    /**
     * Current story values, keyed by stable event identities.
     */
    document?: {
        title: string;
        scenes: readonly {
            id: string;
            heading: string;
            blocks: readonly {
                id: string;
                kind: string;
                text: string;
                speaker: string;
                parenthetical: string;
                centered: boolean;
                simultaneous: boolean;
                editable: boolean;
            }[];
        }[];
    } | null;
    /**
     * Draft title-page title.
     */
    title?: string;
    /**
     * Draft title-page metadata.
     */
    page?: Readonly<Record<string, string>>;
    /**
     * Ordered metadata fields.
     */
    fields?: readonly string[];
    /**
     * Draft event values keyed by identity.
     */
    texts?: Readonly<Record<string, string>>;
    /**
     * Scene identity or title-page.
     */
    selected?: string;
    /**
     * Opening the story projection.
     */
    loading?: boolean;
    /**
     * Saving authored values.
     */
    saving?: boolean;
    /**
     * Unsaved value count.
     */
    dirty?: number;
    /**
     * Actionable failure shown with the draft retained.
     */
    error?: string;
    /**
     * Last completed operation.
     */
    notice?: string;
    /**
     * Whether a prior draft is available.
     */
    canUndo?: boolean;
    /**
     * Whether an undone draft is available.
     */
    canRedo?: boolean;
    /**
     * The footer's second line. Empty leaves it out.
     */
    footnote?: string;
    /**
     * Bindable. At phone width, which pane shows: the script or the outline. Wider, both show and this is ignored.
     */
    pane?: "script" | "outline";
    /**
     * Draw Scenes, Undo, Redo, Discard and Save in the header. False when the host draws them, as ScreenplayActions, in its own toolbar.
     */
    actions?: boolean;
    /**
     * Select a scene or the title page.
     */
    onselect?: (id: string) => void;
    /**
     * Change the draft title.
     */
    ontitle?: (text: string) => void;
    /**
     * Change one title-page field.
     */
    onpage?: (key: string, value: string) => void;
    /**
     * Change an existing event value by identity.
     */
    ontext?: (id: string, value: string) => void;
    /**
     * Commit the current draft.
     */
    onsave?: () => void;
    /**
     * Restore the preceding draft.
     */
    onundo?: () => void;
    /**
     * Restore an undone draft.
     */
    onredo?: () => void;
    /**
     * Discard local changes after confirmation.
     */
    ondiscard?: () => void;
    /**
     * Retry opening the story projection.
     */
    onretry?: () => void;
}, {}, "pane">;
type Props = {
    /**
     * Current story values, keyed by stable event identities.
     */
    document?: {
        title: string;
        scenes: readonly {
            id: string;
            heading: string;
            blocks: readonly {
                id: string;
                kind: string;
                text: string;
                speaker: string;
                parenthetical: string;
                centered: boolean;
                simultaneous: boolean;
                editable: boolean;
            }[];
        }[];
    } | null;
    /**
     * Draft title-page title.
     */
    title?: string;
    /**
     * Draft title-page metadata.
     */
    page?: Readonly<Record<string, string>>;
    /**
     * Ordered metadata fields.
     */
    fields?: readonly string[];
    /**
     * Draft event values keyed by identity.
     */
    texts?: Readonly<Record<string, string>>;
    /**
     * Scene identity or title-page.
     */
    selected?: string;
    /**
     * Opening the story projection.
     */
    loading?: boolean;
    /**
     * Saving authored values.
     */
    saving?: boolean;
    /**
     * Unsaved value count.
     */
    dirty?: number;
    /**
     * Actionable failure shown with the draft retained.
     */
    error?: string;
    /**
     * Last completed operation.
     */
    notice?: string;
    /**
     * Whether a prior draft is available.
     */
    canUndo?: boolean;
    /**
     * Whether an undone draft is available.
     */
    canRedo?: boolean;
    /**
     * The footer's second line. Empty leaves it out.
     */
    footnote?: string;
    /**
     * Bindable. At phone width, which pane shows: the script or the outline. Wider, both show and this is ignored.
     */
    pane?: "script" | "outline";
    /**
     * Draw Scenes, Undo, Redo, Discard and Save in the header. False when the host draws them, as ScreenplayActions, in its own toolbar.
     */
    actions?: boolean;
    /**
     * Select a scene or the title page.
     */
    onselect?: (id: string) => void;
    /**
     * Change the draft title.
     */
    ontitle?: (text: string) => void;
    /**
     * Change one title-page field.
     */
    onpage?: (key: string, value: string) => void;
    /**
     * Change an existing event value by identity.
     */
    ontext?: (id: string, value: string) => void;
    /**
     * Commit the current draft.
     */
    onsave?: () => void;
    /**
     * Restore the preceding draft.
     */
    onundo?: () => void;
    /**
     * Restore an undone draft.
     */
    onredo?: () => void;
    /**
     * Discard local changes after confirmation.
     */
    ondiscard?: () => void;
    /**
     * Retry opening the story projection.
     */
    onretry?: () => void;
};
