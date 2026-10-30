// A project's history as khaosd reports it (ADR-0007 amendment 22), in words: the line under
// the header, a checkpoint's time, and what a destructive write's confirmation says. Moved from
// Khaos App's src/domain/project-history.ts (catalog app-coverage plan, T9).

/** @typedef {{ kind: 'untracked' } | { kind: 'tracked', changedFiles: number }} ProjectRepository */
/**
 * One checkpoint. `at` is RFC 3339, or null when khaosd recorded no time; `restorable` when
 * khaosd can restore it as a new change that keeps later ones (KSPD RFC 0106).
 * @typedef {{ commit: string, message: string, at: string | null, restorable: boolean }} Checkpoint
 */
/** @typedef {{ token: string, files: readonly string[] }} RestorePreview */
/**
 * A destructive write waiting on the person's yes (ADR-0007 rule 2).
 * @typedef {{ kind: 'discard' } | { kind: 'restore', checkpoint: Checkpoint, preview: RestorePreview } | { kind: 'files', checkpoint: Checkpoint }} PendingHistoryWrite
 */
/** @typedef {{ action: string, target: string, description: string, confirmLabel: string }} HistoryConfirmation */

/** @param {number} n @param {string} one @param {string} many */
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`

/**
 * The confirmation for a destructive history write, in plain words. Discard and putting files
 * back are KSPD writes: the work they remove stays in the story's history, so Restore brings it
 * back. Wording approved by the operator 2026-10-16.
 * @param {PendingHistoryWrite} pending @param {string} projectTitle @returns {HistoryConfirmation}
 */
export function historyConfirmation(pending, projectTitle) {
  switch (pending.kind) {
    case 'discard':
      return {
        action: 'Discard changes in',
        target: projectTitle,
        confirmLabel: 'Discard changes',
        description:
          'Returns the story to the last checkpoint. Anything added since is removed. ' +
          "The work stays in the story's history, and Restore brings it back.",
      }
    case 'restore': {
      const files = pending.preview.files.length
      return {
        action: 'Restore',
        target: `${projectTitle} to “${pending.checkpoint.message}”`,
        confirmLabel: 'Restore',
        description:
          'The story goes back to how it was at this checkpoint, recorded as a new change. ' +
          'Later changes are kept in the history, and so are the checkpoints after it. ' +
          (files === 0 ? 'Nothing in the story differs from it.' : `${count(files, 'story file changes', 'story files change')}.`),
      }
    }
    case 'files':
      return {
        action: 'Put back the files of',
        target: `${projectTitle} as at “${pending.checkpoint.message}”`,
        confirmLabel: 'Put files back',
        description:
          'Returns the story to this checkpoint. Anything added since is removed. ' +
          "Later work stays in the story's history, and Restore brings it back.",
      }
  }
}

/** The changes since the last checkpoint in a few words. @param {{ changedFiles: number }} repository */
export function repositoryLine(repository) {
  const changes = repository.changedFiles
  return changes === 0 ? 'No changes since the last checkpoint' : `${count(changes, 'file', 'files')} changed since the last checkpoint`
}

/** When a checkpoint was made, in the reader's locale; a missing time is said, not invented. @param {string | null} at */
export function checkpointTime(at) {
  const when = at === null ? Number.NaN : Date.parse(at)
  return Number.isNaN(when) ? 'Time not recorded' : new Date(when).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}
