<script>
  // FilePicker — a Button that opens the platform's file picker and hands back
  // the one file chosen.

  import Button from './Button.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The button's text, which also names the hidden file input.
   * @property {string} [accept] The input's `accept`: a hint to the picker, not a check.
   * @property {boolean} [disabled] Turns the button off, so nothing can be picked.
   * @property {boolean} [quiet] A quiet text button with no icon, in place of the secondary button with an upload icon.
   * @property {(file: File) => void} [onfile] Called with the file chosen.
   */

  /** @type {Props} */
  let { label = 'Choose a file', accept = '', disabled = false, quiet = false, onfile = undefined } = $props()

  /** @type {HTMLInputElement | undefined} */
  let input = $state()
</script>

<Button variant={quiet ? 'text' : 'secondary'} icon={quiet ? '' : 'upload-simple'} {disabled} onclick={() => input?.click()}>{label}</Button>
<input
  bind:this={input}
  type="file"
  {accept}
  aria-label={label}
  hidden
  onchange={(e) => {
    const file = e.currentTarget.files?.[0]
    // Cleared, so choosing the same file again still fires.
    e.currentTarget.value = ''
    if (file) onfile?.(file)
  }}
/>
