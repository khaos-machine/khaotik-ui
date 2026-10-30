export default ProjectHistory;
type ProjectHistory = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProjectHistory: import("svelte").Component<{
    /**
     * The history, as the engine reports it.
     */
    view?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "untracked";
    } | {
        kind: "tracked";
        repository: {
            changedFiles: number;
        };
        checkpoints: readonly import("./lib/project-history.js").Checkpoint[];
    };
    /**
     * Named in every confirmation.
     */
    projectTitle?: string;
    /**
     * A write is running: every action waits.
     */
    busy?: boolean;
    /**
     * What the last write did.
     */
    outcome?: {
        tone: "success" | "error" | "info" | "warning";
        title: string;
        detail?: string;
    } | null;
    /**
     * A destructive write waiting on the person's yes.
     */
    pending?: import("./lib/project-history.js").PendingHistoryWrite | null;
    /**
     * Asks to start a history.
     */
    onStart?: () => void;
    /**
     * Asks for a checkpoint with this message.
     */
    onCheckpoint?: (message: string) => void;
    /**
     * Asks to discard the changes since the last checkpoint (confirmed through `pending`).
     */
    onDiscard?: () => void;
    /**
     * Asks to restore a checkpoint, keeping later changes.
     */
    onRestore?: (checkpoint: import("./lib/project-history.js").Checkpoint) => void;
    /**
     * Asks to put a checkpoint's files back.
     */
    onRestoreFiles?: (checkpoint: import("./lib/project-history.js").Checkpoint) => void;
    /**
     * The pending write's yes.
     */
    onConfirm?: () => void;
    /**
     * The pending write's no.
     */
    onCancel?: () => void;
    /**
     * Closes the outcome banner.
     */
    onDismissOutcome?: () => void;
}, {}, "">;
type Props = {
    /**
     * The history, as the engine reports it.
     */
    view?: {
        kind: "loading";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "untracked";
    } | {
        kind: "tracked";
        repository: {
            changedFiles: number;
        };
        checkpoints: readonly import("./lib/project-history.js").Checkpoint[];
    };
    /**
     * Named in every confirmation.
     */
    projectTitle?: string;
    /**
     * A write is running: every action waits.
     */
    busy?: boolean;
    /**
     * What the last write did.
     */
    outcome?: {
        tone: "success" | "error" | "info" | "warning";
        title: string;
        detail?: string;
    } | null;
    /**
     * A destructive write waiting on the person's yes.
     */
    pending?: import("./lib/project-history.js").PendingHistoryWrite | null;
    /**
     * Asks to start a history.
     */
    onStart?: () => void;
    /**
     * Asks for a checkpoint with this message.
     */
    onCheckpoint?: (message: string) => void;
    /**
     * Asks to discard the changes since the last checkpoint (confirmed through `pending`).
     */
    onDiscard?: () => void;
    /**
     * Asks to restore a checkpoint, keeping later changes.
     */
    onRestore?: (checkpoint: import("./lib/project-history.js").Checkpoint) => void;
    /**
     * Asks to put a checkpoint's files back.
     */
    onRestoreFiles?: (checkpoint: import("./lib/project-history.js").Checkpoint) => void;
    /**
     * The pending write's yes.
     */
    onConfirm?: () => void;
    /**
     * The pending write's no.
     */
    onCancel?: () => void;
    /**
     * Closes the outcome banner.
     */
    onDismissOutcome?: () => void;
};
