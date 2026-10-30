<script>
  // A project's history, shown while project history is on: what changed since the last
  // checkpoint, the checkpoints newest first, and the writes the engine performs. Discard,
  // restore and putting files back go through a ConfirmDialog naming the project; the host
  // runs none of them without it. Moved from Khaos App (catalog app-coverage plan, T9).
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import EmptyState from './EmptyState.svelte'
  import OutcomeBanner from './OutcomeBanner.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import Sheet from './Sheet.svelte'
  import { checkpointTime, historyConfirmation, repositoryLine } from './lib/project-history.js'

  /** @typedef {import('./lib/project-history.js').Checkpoint} Checkpoint */

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'untracked' } | { kind: 'tracked', repository: { changedFiles: number }, checkpoints: readonly Checkpoint[] }} [view] The history, as the engine reports it.
   * @property {string} [projectTitle] Named in every confirmation.
   * @property {boolean} [busy] A write is running: every action waits.
   * @property {{ tone: 'success' | 'error' | 'info' | 'warning', title: string, detail?: string } | null} [outcome] What the last write did.
   * @property {import('./lib/project-history.js').PendingHistoryWrite | null} [pending] A destructive write waiting on the person's yes.
   * @property {() => void} [onStart] Asks to start a history.
   * @property {(message: string) => void} [onCheckpoint] Asks for a checkpoint with this message.
   * @property {() => void} [onDiscard] Asks to discard the changes since the last checkpoint (confirmed through `pending`).
   * @property {(checkpoint: Checkpoint) => void} [onRestore] Asks to restore a checkpoint, keeping later changes.
   * @property {(checkpoint: Checkpoint) => void} [onRestoreFiles] Asks to put a checkpoint's files back.
   * @property {() => void} [onConfirm] The pending write's yes.
   * @property {() => void} [onCancel] The pending write's no.
   * @property {() => void} [onDismissOutcome] Closes the outcome banner.
   */

  /** @type {Props} */
  let {
    view = { kind: 'loading' },
    projectTitle = '',
    busy = false,
    outcome = null,
    pending = null,
    onStart = undefined,
    onCheckpoint = undefined,
    onDiscard = undefined,
    onRestore = undefined,
    onRestoreFiles = undefined,
    onConfirm = undefined,
    onCancel = undefined,
    onDismissOutcome = undefined,
  } = $props()

  let naming = $state(false)
  const confirmation = $derived(pending ? historyConfirmation(pending, projectTitle) : null)
</script>

<section class="ui-project-history" aria-label="History">
  <SectionHeader title="History">
    {#snippet trailing()}
      {#if view.kind === 'tracked'}
        <Button variant="secondary" icon="arrow-counter-clockwise" disabled={busy || view.repository.changedFiles === 0} onclick={() => onDiscard?.()}>Discard changes…</Button>
        <Button variant="primary" icon="flag" disabled={busy || view.repository.changedFiles === 0} onclick={() => (naming = true)}>Checkpoint…</Button>
      {:else if view.kind === 'untracked'}
        <Button variant="primary" icon="clock-counter-clockwise" disabled={busy} onclick={() => onStart?.()}>Start history</Button>
      {/if}
    {/snippet}
  </SectionHeader>

  {#if outcome}
    <OutcomeBanner tone={outcome.tone} title={outcome.title} detail={outcome.detail} dismissible onDismiss={() => onDismissOutcome?.()} />
  {/if}

  {#if view.kind === 'loading'}
    <p class="ui-project-history__line">Reading the history…</p>
  {:else if view.kind === 'failed'}
    <OutcomeBanner tone="error" title="Could not read the history" detail={view.message} dismissible={false} />
  {:else if view.kind === 'untracked'}
    <EmptyState title="No history yet" description="Start a history to make checkpoints you can return to." icon="clock-counter-clockwise" />
  {:else}
    <p class="ui-project-history__line">{repositoryLine(view.repository)}</p>
    <ul class="ui-project-history__list" aria-label="Checkpoints">
      {#each view.checkpoints as checkpoint, i (checkpoint.commit)}
        <li class="ui-project-history__row">
          <span class="ui-project-history__message">{checkpoint.message}</span>
          <span class="ui-project-history__time">{checkpointTime(checkpoint.at)}</span>
          {#if i > 0}
            {#if checkpoint.restorable}
              <Button variant="text" disabled={busy} onclick={() => onRestore?.(checkpoint)}>Restore, keeping later changes…</Button>
            {/if}
            <Button variant="text" disabled={busy} onclick={() => onRestoreFiles?.(checkpoint)}>Put files back…</Button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#if naming}
  <Sheet
    title="New checkpoint"
    target="in {projectTitle}"
    message="Records every change since the last checkpoint."
    confirmLabel="Checkpoint"
    input={{ label: 'Message', placeholder: 'What changed' }}
    oncancel={() => (naming = false)}
    onconfirm={(/** @type {string} */ message) => {
      naming = false
      onCheckpoint?.(message)
    }} />
{/if}

<ConfirmDialog
  open={confirmation !== null}
  action={confirmation?.action ?? ''}
  target={confirmation?.target ?? ''}
  description={confirmation?.description ?? ''}
  confirmLabel={confirmation?.confirmLabel ?? ''}
  cancelLabel="Cancel"
  onConfirm={() => onConfirm?.()}
  onCancel={() => onCancel?.()}
  onOpenChange={(/** @type {boolean} */ open) => {
    if (!open) onCancel?.()
  }} />

<style>
  /* Desktop density: rows divided by a rule, not cards. */
  .ui-project-history {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 8px);
    min-height: 0;
  }
  .ui-project-history__line {
    margin: 0;
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }
  .ui-project-history__list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    min-height: 0;
  }
  .ui-project-history__row {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm, 12px);
    padding: var(--spacing-xs, 8px) 0;
    border-bottom: 1px solid var(--border-default);
    font-size: var(--body-md-size);
  }
  .ui-project-history__message {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .ui-project-history__time {
    font-size: var(--caption-size);
    color: var(--text-secondary);
    white-space: nowrap;
  }
</style>
