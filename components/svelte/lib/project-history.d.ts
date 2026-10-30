/**
 * The confirmation for a destructive history write, in plain words. Discard and putting files
 * back are KSPD writes: the work they remove stays in the story's history, so Restore brings it
 * back. Wording approved by the operator 2026-10-16.
 * @param {PendingHistoryWrite} pending @param {string} projectTitle @returns {HistoryConfirmation}
 */
export function historyConfirmation(pending: PendingHistoryWrite, projectTitle: string): HistoryConfirmation;
/** The changes since the last checkpoint in a few words. @param {{ changedFiles: number }} repository */
export function repositoryLine(repository: {
    changedFiles: number;
}): string;
/** When a checkpoint was made, in the reader's locale; a missing time is said, not invented. @param {string | null} at */
export function checkpointTime(at: string | null): string;
export type ProjectRepository = {
    kind: "untracked";
} | {
    kind: "tracked";
    changedFiles: number;
};
/**
 * One checkpoint. `at` is RFC 3339, or null when khaosd recorded no time; `restorable` when
 * khaosd can restore it as a new change that keeps later ones (KSPD RFC 0106).
 */
export type Checkpoint = {
    commit: string;
    message: string;
    at: string | null;
    restorable: boolean;
};
export type RestorePreview = {
    token: string;
    files: readonly string[];
};
/**
 * A destructive write waiting on the person's yes (ADR-0007 rule 2).
 */
export type PendingHistoryWrite = {
    kind: "discard";
} | {
    kind: "restore";
    checkpoint: Checkpoint;
    preview: RestorePreview;
} | {
    kind: "files";
    checkpoint: Checkpoint;
};
export type HistoryConfirmation = {
    action: string;
    target: string;
    description: string;
    confirmLabel: string;
};
