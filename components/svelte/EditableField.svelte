<script>
  // Adopted, not authored (D39, D50, P3) — Ark UI's Editable, dressed in
  // BrandKit tokens.
  //
  // This was hand-rolled against a primitive the kit already depended on: an
  // `isEditing` flag, a staged buffer, and three functions reproducing what
  // `@ark-ui/svelte/editable` ships. The house rule is explicit that this is
  // not allowed — "do not add a hand-rolled version of a component Ark ships"
  // (.claude/skills/design-iteration) — and nothing in the file acknowledged
  // the primitive existed.
  //
  // What now comes from the machine rather than from us: the edit/read mode
  // transition, showing and hiding the preview, the input and all three
  // triggers, the value commit/revert cycle, the label association, and
  // Escape-to-cancel — which the hand-rolled version did not have at all, so
  // the only way out of edit mode was the mouse.
  //
  // What stays ours: the shape (read-only prose with a hover-revealed pencil,
  // not a bare form input), the tokens, and the Copy button — Editable has no
  // such part.
  import {
    EditableArea,
    EditableCancelTrigger,
    EditableContext,
    EditableEditTrigger,
    EditableInput,
    EditableLabel,
    EditablePreview,
    EditableRoot,
    EditableSubmitTrigger,
  } from '@ark-ui/svelte/editable'
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [value] The prose value shown read-only; `—` when empty.
   * @property {string} [label] The field caption (right-aligned). Also disambiguates the Edit and Copy buttons' accessible names, so two fields on one page do not both read "Edit".
   * @property {string} [placeholder] Textarea placeholder while editing.
   * @property {(value: string) => void} [onsave] Called with the edited value on Save, and on click-away — Ark's default commits a blur rather than discarding it.
   * @property {() => void} [oncancel] Called on Cancel and on Escape. NOT called for click-away: leaving the field commits the draft, it does not destroy it.
   */

  /** @type {Props} */
  let { value = '', label = '', placeholder = 'Add a note…', onsave = undefined, oncancel = undefined } = $props()

  // The staged edit buffer, seeded when the machine ENTERS edit mode and
  // nowhere else — the same single seeding point the old `startEdit()` was, and
  // for the same reason. Do NOT initialise it from `value`: reading a prop in a
  // `$state` initialiser captures only that prop's first value
  // (`state_referenced_locally`), which then needs a second mechanism to stay
  // correct. This file carried exactly that pair once — an initialiser plus a
  // re-syncing `$effect` — and the pair is what went wrong.
  //
  // The preview does not read this buffer at all; it renders `value` directly,
  // so an upstream change to the prop is on screen whether or not the buffer
  // has caught up. There is nothing to keep in sync between edits.
  let draft = $state('')

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // clipboard may be unavailable (e.g. non-secure context); ignore
    }
  }
</script>

<!-- activationMode="none": only the pencil opens the editor. Clicking or
     focusing the prose must not start an edit — this renders analysis a caller
     may not have permission to change, and a stray click is not intent.

     submitMode: Ark's default ("both"), deliberately, after this shipped as
     "none" and was caught in review.

     The reasoning for "none" was that a textarea needs Enter to insert a
     newline, and that "enter" or "both" would submit the moment someone started
     a second paragraph. That is not what Ark does — the connect handler refuses
     plain Enter on a textarea unless the platform submit modifier is held:

       // @zag-js/editable/dist/editable.connect.mjs:117
       if (localName === "textarea") {
         const submitMod = isApple() ? event.metaKey : event.ctrlKey
         if (!submitMod) return
       }

     So Enter opens a line under every submitMode, and the setting solved a
     problem that did not exist. What it DID do was invert click-away: the edit
     state runs trackInteractOutside, which branches on submitOnBlur —

       // editable.machine.mjs:145
       send({ type: computed("submitOnBlur") ? "SUBMIT" : "CANCEL", … })

     — and submitOnBlur is false for "none". Measured: with focus moved to an
     outside control mid-edit, onsave fired 0 times, oncancel 1, and the draft
     was gone. A user typing half a paragraph into Summary and clicking the Arc
     field's pencil lost the text with no confirmation. The hand-rolled version
     this replaced had no blur handling at all — the editor simply stayed open —
     so "none" was a regression, not a preserved behaviour.

     Escape still cancels; the machine handles that outside submitMode.

     Classes on an Ark component are forwarded to the rendered element, so
     Svelte scopes them as unused — they are styled :global below
     (catalog/AGENTS.md, "Svelte 5 gotchas"). -->
<EditableRoot
  value={draft}
  onValueChange={(details) => (draft = details.value)}
  onEditChange={(details) => { if (details.edit) draft = value }}
  onValueCommit={(details) => onsave?.(details.value)}
  onValueRevert={() => oncancel?.()}
  activationMode="none"
  placeholder={{ edit: placeholder, preview: '—' }}
  class="editable"
>
  <EditableLabel class="editable__label">{label}</EditableLabel>

  <div class="editable__value-wrap">
    <div class="editable__row">
      <EditableArea class="editable__area">
        <EditablePreview>
          {#snippet asChild(props)}
            <p {...props({ class: 'editable__value' })}>{value || '—'}</p>
          {/snippet}
        </EditablePreview>
        <EditableInput>
          {#snippet asChild(props)}
            <textarea {...props({ class: 'editable__input', rows: 3 })}></textarea>
          {/snippet}
        </EditableInput>
      </EditableArea>

      <span class="editable__field-actions">
        <!-- Named by the field, not just the verb. An inspector can render
             two EditableFields on one page (Summary, Beginning), so a
             screen-reader user navigating by button previously heard
             "Edit, Edit, Copy, Copy" with no way to tell them apart. The
             component already holds the disambiguator in `label`. The name is
             passed explicitly because Ark's own translation would say only
             "edit". -->
        <EditableEditTrigger
          class="editable__action"
          title="Edit"
          aria-label={label ? `Edit ${label}` : 'Edit'}
        >
          <Icon name="pencil-simple" />
        </EditableEditTrigger>
        <!-- Editable has no Copy part, so this one is ours — including the job
             the machine does for its own triggers, which is to be gone while
             editing. Taken out of the DOM rather than hidden with CSS: an
             invisible button is still tabbable, and there is nothing to copy
             from a field you are already looking at in an editor. -->
        <EditableContext>
          {#snippet render(editable)}
            {#if !editable().editing}
              <button
                class="editable__action editable__copy"
                type="button"
                title="Copy"
                aria-label={label ? `Copy ${label}` : 'Copy'}
                onclick={copyValue}
              >
                <Icon name="copy" />
              </button>
            {/if}
          {/snippet}
        </EditableContext>
      </span>
    </div>

    <!-- Both carry an explicit aria-label because Ark's default translations
         set one — "submit" and "cancel", lowercase — and an aria-label wins
         over the visible text. That leaves a button reading "Save" and
         announcing "submit", which is the WCAG 2.5.3 (Label in Name) mismatch
         the rail's `sectionName` suffix was written to avoid elsewhere. The
         name is the label here, so it is stated rather than translated. -->
    <div class="editable__actions">
      <EditableSubmitTrigger class="editable__save" aria-label="Save">Save</EditableSubmitTrigger>
      <EditableCancelTrigger class="editable__cancel" aria-label="Cancel">Cancel</EditableCancelTrigger>
    </div>
  </div>
</EditableRoot>

<style>
  :global(.editable) {
    display: grid;
    grid-template-columns: 128px minmax(0, 1fr);
    gap: var(--spacing-md);
    align-items: baseline;
  }

  :global(.editable__label) {
    font-size: var(--caption-size);
    color: var(--text-tertiary);
    text-align: right;
  }

  .editable__value-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
    min-width: 0;
    width: 100%;
  }

  .editable__row {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    width: 100%;
  }

  /* Sized to its content while reading, so the pencil and Copy sit just after
     the prose rather than out at the right edge — the area is a wrapper the
     primitive needs, and it must not behave like a column. It takes the row
     only while editing, which is when the textarea needs the width.
     `data-focus` is on the AREA, not the root. */
  :global(.editable__area) {
    min-width: 0;
  }

  :global(.editable__area[data-focus]) {
    flex: 1;
  }

  :global(.editable__value) {
    display: inline;
    margin: 0;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
  }

  .editable__field-actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    opacity: 0;
    transition: opacity 120ms ease;
  }

  :global(.editable:hover) .editable__field-actions,
  .editable__field-actions:focus-within {
    opacity: 1;
  }

  .editable__action,
  :global(.editable__action) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-tertiary);
    cursor: pointer;
  }

  .editable__action:hover,
  :global(.editable__action:hover) {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    color: var(--text-primary);
  }

  :global(.editable__action .ph) {
    font-size: 0.85em;
  }

  :global(.editable__input) {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--body-md-size);
    resize: vertical;
  }

  :global(.editable__input:focus) {
    outline: 1px solid var(--border-focus);
  }

  .editable__actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  :global(.editable__save),
  :global(.editable__cancel) {
    padding: 4px 12px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font: inherit;
    font-size: var(--caption-size);
    cursor: pointer;
  }

  :global(.editable__save) {
    background: var(--action-primary);
    border-color: var(--action-primary);
    color: var(--action-on-primary);
  }

  :global(.editable__cancel) {
    background: none;
    color: var(--text-secondary);
  }

  /* LAST, and load-bearing. The machine hides the preview, the input and each
     trigger with the HTML `hidden` attribute, which only works because the UA
     stylesheet says `[hidden] { display: none }` — so ANY author `display`
     beats it. `.editable__value` sets `display: inline` and `.editable__action`
     sets `display: inline-flex`, which meant the prose and the pencil both
     stayed on screen underneath the open editor.

     jsdom cannot see this: `getByRole` honours the `hidden` attribute through
     the accessibility tree and never resolves the stylesheet, so every test
     passed against a visibly broken component. It was caught by looking at it.
     Restated here, last in the cascade, so hidden means hidden. */
  :global(.editable [hidden]) {
    display: none;
  }
</style>
