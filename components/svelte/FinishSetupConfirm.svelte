<script>
  // "Run it"'s one confirmation (khaos-app ADR-0007 amendment 13). Nothing is sent before
  // Install. One component, so the launcher and Setup ask in the same words. Under Basic
  // it names no command or program (operator-approved sentences, 2026-10-16); Advanced
  // keeps the step and khaosd's command.
  import ConfirmDialog from './ConfirmDialog.svelte'

  /**
   * @typedef {Object} Props
   * @property {boolean} [open] Whether the confirmation is asking.
   * @property {boolean} [basic] Whether khaosd says the setup path is Basic, which picks the wording.
   * @property {() => void} [onConfirm] Reports Install. Running it is yours.
   * @property {() => void} [onCancel] Reports Cancel, or a dismissal. Nothing is sent.
   */

  /** @type {Props} */
  let { open = false, basic = false, onConfirm = undefined, onCancel = undefined } = $props()
</script>

<ConfirmDialog
  {open}
  target={basic ? 'Khaos' : 'the provider definitions'}
  action={basic ? 'Finish setting up' : 'Install'}
  confirmLabel="Install"
  cancelLabel="Cancel"
  tone="default"
  description={basic
    ? "Khaos will add the list of AI services it can connect to. It doesn't touch any key or account, and it's safe to run again."
    : 'khaosd will run: khaos-tools providers install. It writes which providers exist and how ' +
      'each is set up, and touches no API key. Running it again is safe.'}
  onConfirm={() => onConfirm?.()}
  onCancel={() => onCancel?.()}
  onOpenChange={(next) => { if (!next) onCancel?.() }}
/>
