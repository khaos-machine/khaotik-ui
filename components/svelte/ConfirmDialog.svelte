<script>
  // Adopted, not authored (D39, D50, P3) — Ark UI's Dialog, dressed in BrandKit
  // tokens. Nothing here re-implements dialog behaviour: the focus trap, focus
  // restore on close, Escape to dismiss, the inert background, `aria-modal` and
  // the labelled/described wiring all come from the primitive.
  //
  // Confirmation rather than a general Dialog on purpose. A general modal is a
  // container and would leave every consumer to invent its own question, button
  // order and destructive treatment — which is how the same dialog ends up
  // reading three different ways across three surfaces.
  // The dialog module's export names are INCONSISTENT — `DialogBackdrop`,
  // `DialogContent` and `DialogDescription` carry the prefix while `Root`,
  // `Positioner` and `Title` do not (dist/components/dialog/index.js). Importing
  // the prefixed spelling for all six fails at RUNTIME with "DialogRoot is not a
  // function", not at build: the module resolves, the binding is undefined, and
  // the compile gate (`check-compile`, `build-storybook` before D61) is happy
  // either way. Aliased so the markup below still reads uniformly.
  import {
    DialogBackdrop,
    DialogContent,
    DialogCloseTrigger,
    DialogDescription,
    Positioner as DialogPositioner,
    Root as DialogRoot,
    Title as DialogTitle,
  } from '@ark-ui/svelte/dialog'

  /**
   * @typedef {'danger'|'default'} ConfirmTone
   */

  /**
   * @typedef {Object} Props
   * @property {boolean} [open] Controlled. The consumer owns it, so a failed mutation can keep the dialog up and show why.
   * @property {string} [target] What is being acted on, named in the question. Rendered whole and wrapped, never elided — the name is the load-bearing part. With none, it asks the bare question rather than inventing "this project".
   * @property {string} [action] The verb. Becomes "{action} {target}?" and labels the confirm button.
   * @property {string} [description] What actually happens, and whether it can be undone. Under the question, not in it.
   * @property {ConfirmTone} [tone] Defaults to `danger`, because that is what a confirmation is for. Only the confirm button takes the destructive treatment — colouring the whole dialog makes cancel read as dangerous too, and cancel is the safe thing in here.
   * @property {string} [confirmLabel] Overrides the verb on the confirm button. Avoid "OK": the verb is what the reader is agreeing to.
   * @property {string} [cancelLabel] The dismiss label.
   * @property {() => void} [onConfirm] Reports intent. It does not close the dialog and it does not act — both are yours.
   * @property {() => void} [onCancel] Fires for every close, including Escape and the backdrop.
   * @property {(open: boolean) => void} [onOpenChange] Ark's own open state. Wire this or `open` sticks true after an Escape.
   * @property {import('svelte').Snippet} [children] A choice the reader makes before agreeing, rendered between the description and the buttons: which of two ways to do the thing. The host's control and the host's state. Omit it and the dialog is the question alone.
   */

  /** @type {Props} */
  let {
    open = false,
    // The thing being acted on. NOT optional in practice: khaos-app's ADR-0007
    // rule 2 requires a confirmation to name its target — "Delete Heart of an
    // Indie?", never "Delete this project?" — because a modal that does not say
    // what it will destroy is one the reader has to trust their own memory for,
    // and the whole point of the step is to catch the case where that memory is
    // wrong. `title` is built from it rather than passed whole so the naming
    // cannot be skipped by a caller in a hurry.
    target = '',
    // The verb, lowercase — "Delete", "Discard", "Reset". Becomes "{action}
    // {target}?".
    action = 'Delete',
    // Optional prose under the question: what actually happens, and whether it
    // can be undone. Say it here rather than in the title.
    description = '',
    // `danger` is the default because that is what a confirmation is FOR. A
    // confirmation for a reversible action is usually a confirmation that should
    // not exist.
    tone = 'danger',
    confirmLabel = '',
    cancelLabel = 'Cancel',
    // Reports intent; it does not act. The consumer owns the mutation, and
    // whether the dialog closes — a delete that fails should be able to keep the
    // dialog open and show why.
    onConfirm = undefined,
    onCancel = undefined,
    // Ark reports every open/close, including Escape and backdrop clicks. A
    // consumer that only wires onCancel would leave `open` stuck true after
    // Escape, which is the classic way an adopted dialog becomes unclosable.
    onOpenChange = undefined,
    // D78. A confirmation sometimes carries one decision inside it — install with
    // Homebrew or with curl. A snippet, because which control fits is the host's.
    children = undefined,
  } = $props()

  const heading = $derived(target ? `${action} ${target}?` : `${action}?`)
  const confirm = $derived(confirmLabel || action)
</script>

<!-- `lazyMount` + `unmountOnExit`: without them Ark keeps the content mounted
     while closed, so "Delete Heart of an Indie?" sits in the DOM of a page whose
     user never opened a dialog — readable by a screen reader walking the
     document, and findable by any query. A confirmation that is present but
     invisible is the wrong half of both states. -->
<DialogRoot
  {open}
  lazyMount
  unmountOnExit
  role="alertdialog"
  onOpenChange={(details) => {
    onOpenChange?.(details.open)
    if (!details.open) onCancel?.()
  }}
>
  <DialogBackdrop class="ui-confirm__backdrop" />
  <DialogPositioner class="ui-confirm__positioner">
    <DialogContent class="ui-confirm" data-tone={tone}>
      <DialogTitle class="ui-confirm__title">{heading}</DialogTitle>
      {#if description}
        <DialogDescription class="ui-confirm__description">{description}</DialogDescription>
      {/if}
      {#if children}
        <div class="ui-confirm__choice">{@render children()}</div>
      {/if}
      <div class="ui-confirm__actions">
        <!-- Cancel first in the DOM so it takes initial focus: the safe choice
             should be the one an Enter press lands on. Visual order is reversed
             in CSS to keep the confirm button where a pointer expects it.
             A CloseTrigger rather than a plain button, so cancelling goes through
             the same path as Escape and the backdrop — one close pipeline, with
             the primitive's focus restore — instead of a second one that only
             our own button knows about. -->
        <DialogCloseTrigger class="ui-confirm__cancel">
          {cancelLabel}
        </DialogCloseTrigger>
        <button type="button" class="ui-confirm__confirm" onclick={() => onConfirm?.()}>
          {confirm}
        </button>
      </div>
    </DialogContent>
  </DialogPositioner>
</DialogRoot>

<style>
  /* Ark forwards `class` to the rendered element, so Svelte scopes these as
     unused — they are styled :global (catalog/AGENTS.md, "Svelte 5 gotchas"). */
  /* Above Sheet (30) and every ProjectCard layer: a confirmation sits over whatever it
     confirms. Without it a positioned card painted over the dialog (Khaos App A17). */
  :global(.ui-confirm__backdrop) {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: var(--scrim);
  }

  :global(.ui-confirm__positioner) {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
  }

  :global(.ui-confirm) {
    width: min(420px, 100%);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    background: var(--surface-raised);
  }

  :global(.ui-confirm__title) {
    margin: 0;
    font-size: var(--heading-md-size);
    font-weight: 600;
    color: var(--text-primary);
    /* The target name can be long and is not ours to truncate — a confirmation
       that elides the thing it names defeats itself. */
    overflow-wrap: anywhere;
  }

  :global(.ui-confirm__description) {
    margin: 0;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
  }

  /* Cancel is first in the DOM so it takes initial focus, and in normal flow
     that ALSO puts it on the left with confirm on the right — the platform
     convention. An earlier `row-reverse` here was solving a problem that did not
     exist and inverted the pair: Delete rendered on the left, where a reader
     reaching for the rightmost button hits the destructive one.
     Only visible in a browser — jsdom computes no layout, and the DOM-order test
     passed the whole time it was wrong. */
  .ui-confirm__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
  }

  /* :global for the descendant button too. Cancel is a DialogCloseTrigger, so
     Ark renders it and it never carries Svelte's scope hash — a scoped
     `.ui-confirm__actions button` matches our confirm button and silently misses
     the cancel one, shipping a dialog with two buttons that look nothing alike.
     jsdom computes no styles, so nothing in the suite would have noticed;
     token-refs and the source-read guard in ConfirmDialog.test.js are what
     cover it. */
  :global(.ui-confirm__actions button) {
    padding: 6px 14px;
    border-radius: var(--radius-sm);
    font: inherit;
    font-size: var(--body-md-size);
    cursor: pointer;
  }

  :global(.ui-confirm__actions button:focus-visible) {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  :global(.ui-confirm__cancel) {
    border: 1px solid var(--border-default);
    background: none;
    color: var(--text-primary);
  }

  :global(.ui-confirm__cancel:hover) {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }

  .ui-confirm__confirm {
    border: 1px solid transparent;
    background: var(--action-primary);
    color: var(--action-on-primary);
  }

  /* The destructive treatment is on the confirm button only. Colouring the whole
     dialog red makes the cancel button read as dangerous too, which is the one
     thing in here that is safe. */
  :global(.ui-confirm[data-tone='danger']) .ui-confirm__confirm {
    background: var(--tone-danger);
    color: var(--surface-base);
  }

  .ui-confirm__confirm:hover {
    filter: brightness(1.08);
  }
</style>
