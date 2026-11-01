<script>
  // The screenplay's actions: Scenes (back to the outline, at phone width), Undo, Redo, Discard…
  // with its confirmation, and Save. ScreenplayEditor draws them in its header; a host that puts
  // them in its own toolbar draws this there instead, `iconOnly`, and passes the editor
  // `actions={false}`. A phone's row has no room for five: the host draws `part="edit"` there,
  // and the editor offers Discard… in its outline (`part="discard"`).
  import Button from './Button.svelte'
  import Sheet from './Sheet.svelte'

  /**
   * @typedef {Object} Props
   * @property {boolean} [saving] Saving authored values.
   * @property {number} [dirty] Unsaved value count.
   * @property {boolean} [canUndo] Whether a prior draft is available.
   * @property {boolean} [canRedo] Whether an undone draft is available.
   * @property {boolean} [iconOnly] Icons only, each named by its label: for a phone's toolbar row.
   * @property {'all'|'edit'|'discard'} [part] Which actions: all of them; all but Discard…; or Discard… alone.
   * @property {()=>void} [onscenes] Shows the outline. Absent, no Scenes button is drawn.
   * @property {()=>void} [onsave] Commit the current draft.
   * @property {()=>void} [onundo] Restore the preceding draft.
   * @property {()=>void} [onredo] Restore an undone draft.
   * @property {()=>void} [ondiscard] Discard local changes, once confirmed here.
   */

  /** @type {Props} */
  let { saving = false, dirty = 0, canUndo = false, canRedo = false, iconOnly = false, part = 'all', onscenes = undefined, onsave = undefined, onundo = undefined, onredo = undefined, ondiscard = undefined } = $props()
  let discarding = $state(false)
  const edit = $derived(part !== 'discard')
</script>

{#snippet label(/** @type {string} */ text)}<span class:visually-hidden={iconOnly}>{text}</span>{/snippet}

{#if edit && onscenes}<Button variant="tool" icon="list" onclick={onscenes}>{@render label('Scenes')}</Button>{/if}
{#if edit}
<Button variant="tool" icon="arrow-u-up-left" title="Undo (⌘Z)" disabled={!canUndo || saving} onclick={onundo}>{@render label('Undo')}</Button>
<Button variant="tool" icon="arrow-u-up-right" title="Redo (⇧⌘Z)" disabled={!canRedo || saving} onclick={onredo}>{@render label('Redo')}</Button>
{/if}
{#if part !== 'edit'}<Button variant={iconOnly ? 'tool' : 'secondary'} icon="arrow-counter-clockwise" title={iconOnly ? 'Discard…' : undefined} disabled={!dirty || saving} onclick={() => (discarding = true)}>{@render label('Discard…')}</Button>{/if}
{#if edit}<Button variant="primary" icon="floppy-disk" title={iconOnly ? 'Save (⌘S)' : undefined} disabled={!dirty || saving} onclick={onsave}>{@render label(saving ? 'Saving…' : 'Save')}</Button>{/if}
{#if discarding}<Sheet title="Discard screenplay changes?" message="Your saved screenplay and existing media will be kept." confirmLabel="Discard changes" tone="danger" oncancel={() => (discarding = false)} onconfirm={() => { ondiscard?.(); discarding = false }} />{/if}
