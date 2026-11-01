export default ScreenplayActions;
type ScreenplayActions = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ScreenplayActions: import("svelte").Component<{
    /**
     * Saving authored values.
     */
    saving?: boolean;
    /**
     * Unsaved value count.
     */
    dirty?: number;
    /**
     * Whether a prior draft is available.
     */
    canUndo?: boolean;
    /**
     * Whether an undone draft is available.
     */
    canRedo?: boolean;
    /**
     * Icons only, each named by its label: for a phone's toolbar row.
     */
    iconOnly?: boolean;
    /**
     * Which actions: all of them; all but Discard…; or Discard… alone.
     */
    part?: "all" | "edit" | "discard";
    /**
     * Shows the outline. Absent, no Scenes button is drawn.
     */
    onscenes?: () => void;
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
     * Discard local changes, once confirmed here.
     */
    ondiscard?: () => void;
}, {}, "">;
type Props = {
    /**
     * Saving authored values.
     */
    saving?: boolean;
    /**
     * Unsaved value count.
     */
    dirty?: number;
    /**
     * Whether a prior draft is available.
     */
    canUndo?: boolean;
    /**
     * Whether an undone draft is available.
     */
    canRedo?: boolean;
    /**
     * Icons only, each named by its label: for a phone's toolbar row.
     */
    iconOnly?: boolean;
    /**
     * Which actions: all of them; all but Discard…; or Discard… alone.
     */
    part?: "all" | "edit" | "discard";
    /**
     * Shows the outline. Absent, no Scenes button is drawn.
     */
    onscenes?: () => void;
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
     * Discard local changes, once confirmed here.
     */
    ondiscard?: () => void;
};
