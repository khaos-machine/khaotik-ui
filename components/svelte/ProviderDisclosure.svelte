<script>
  // A provider's disclosure before sign-in (khaos-app configuration records CR-A5):
  // khaosd's sentence, verbatim, with Continue and Cancel. Cancel starts no login.
  // One component, so Settings › Providers and Setup's Connect step cannot word it
  // differently.
  import ConfirmDialog from './ConfirmDialog.svelte'

  /**
   * @typedef {Object} Disclosure
   * @property {string} providerId The provider asking.
   * @property {string} title The provider's name, named in the question.
   * @property {string} text khaosd's disclosure, verbatim.
   */

  /**
   * @typedef {Object} Props
   * @property {Disclosure | null} [disclosure] The disclosure awaiting an answer. Nothing renders without one.
   * @property {() => void} [onContinue] Reports Continue. Starting the sign-in is yours.
   * @property {() => void} [onCancel] Reports Cancel. No login starts.
   */

  /** @type {Props} */
  let { disclosure = null, onContinue = undefined, onCancel = undefined } = $props()
</script>

{#if disclosure}
  <ConfirmDialog
    open
    target={disclosure.title}
    action="Sign in to"
    confirmLabel="Continue"
    cancelLabel="Cancel"
    tone="default"
    description={disclosure.text}
    onConfirm={() => onContinue?.()}
    onCancel={() => onCancel?.()} />
{/if}
