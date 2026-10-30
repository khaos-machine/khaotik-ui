<script>
  // The quit prompt (khaos-app A17; operator ruling "Ask on quit", 2026-10-16). Shown only
  // while something is running. Its words, its two choices and the standard Cancel are the
  // operator's, approved 2026-10-16. ConfirmDialog has two buttons, so the second choice
  // sits in its choice slot.
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'

  /**
   * @typedef {Object} Props
   * @property {boolean} [open] Whether the prompt is asking.
   * @property {string} [sentence] What is still running, as the host words it.
   * @property {boolean} [busy] A choice is being carried out; Let It Finish is disabled and a dismissal is ignored.
   * @property {() => void} [onStopAndQuit] Reports Stop and Quit.
   * @property {() => void} [onLetFinish] Reports Quit and Let It Finish.
   * @property {() => void} [onDismiss] Reports Cancel, or a dismissal while not busy.
   */

  /** @type {Props} */
  let { open = false, sentence = '', busy = false, onStopAndQuit = undefined, onLetFinish = undefined, onDismiss = undefined } = $props()
</script>

<ConfirmDialog
  {open}
  action="Quit"
  target="Khaos"
  tone="default"
  description={sentence}
  confirmLabel="Stop and Quit"
  cancelLabel="Cancel"
  onConfirm={() => onStopAndQuit?.()}
  onCancel={() => onDismiss?.()}
  onOpenChange={(next) => { if (!next && !busy) onDismiss?.() }}
>
  <Button disabled={busy} onclick={() => onLetFinish?.()}>Quit and Let It Finish</Button>
</ConfirmDialog>
