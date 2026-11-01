<script>
  // FormSheet — a form on a sheet: Sheet's look, hanging from the window's top
  // edge, with a body the host writes. Sheet itself asks a question; this holds
  // a form. A native modal dialog holds the focus, answers Esc and gives the
  // focus back when it closes. Every way out goes through `close`, so `onclose`
  // hears all of them.

  /**
   * @typedef {Object} Props
   * @property {string} [title] The sheet's heading, which names the dialog.
   * @property {boolean} [busy] Esc does nothing while this is set.
   * @property {boolean} [modal] Opens as a modal over the page. Off, it opens in place without trapping the focus, as the catalog shows it.
   * @property {() => void} [onclose] Called once the sheet has closed, however it closed.
   * @property {import('svelte').Snippet<[close: () => void]>} [children] The form. It is handed `close`.
   */

  /** @type {Props} */
  let { title = '', busy = false, modal = true, onclose = undefined, children = undefined } = $props()
  const id = $props.id()

  /** @type {HTMLDialogElement | undefined} */
  let dialog = $state()
</script>

<dialog
  bind:this={dialog}
  class="ui-form-sheet"
  open={!modal}
  {@attach (node) => {
    if (modal) /** @type {HTMLDialogElement} */ (node).showModal()
  }}
  aria-labelledby={id}
  oncancel={(e) => {
    if (busy) e.preventDefault()
  }}
  onclose={() => onclose?.()}
>
  <h2 {id}>{title}</h2>
  {@render children?.(() => dialog?.close())}
</dialog>

<style>
  .ui-form-sheet {
    width: min(440px, 100vw);
    max-height: 100dvh;
    margin: 0 auto;
    padding: var(--spacing-md);
    overflow: auto;
    background: var(--surface-raised);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-top: 0;
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    color: var(--text-primary);
    font-size: var(--data-md-size);
  }

  .ui-form-sheet::backdrop {
    background: color-mix(in oklab, var(--surface-base) 40%, transparent);
  }

  h2 {
    margin: 0 0 var(--spacing-sm);
    font-size: var(--label-md-size);
    font-weight: 600;
  }
</style>
