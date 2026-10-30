<script>
  // Sheet — a window-attached modal (data-layer plan K14; audit §1.14, §3.15
  // "Confirmations", §4.1). It drops from the top of its window and names what it acts on
  // (ADR-0007 rule 2): the title and the target together are its accessible name.
  //
  // The host mounts it to open it and unmounts it to close it. While mounted it holds the
  // focus: it takes it (the field of a text-input sheet, otherwise Cancel, so a stray
  // Return never confirms a destructive sheet), Tab and ⇧Tab cycle inside it, and on
  // unmount the focus returns to whatever held it before. Esc asks to cancel.
  //
  // A text-input sheet (`input`) is the Clone repository URL sheet (khaotik-ui#46). Its
  // confirm stays disabled until the field holds text, and Return in the field confirms.
  import { onMount } from 'svelte'

  /**
   * @typedef {Object} SheetInput
   * @property {string} label
   * @property {string} [placeholder]
   * @property {string} [value] The field's starting text.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [title] What the sheet asks ("Delete Read 2?").
   * @property {string} [target] What it acts on, named in full.
   * @property {string} [message] The consequence, read as the sheet's description.
   * @property {string} [confirmLabel] The confirm button's text: the verb ("Delete").
   * @property {string} [cancelLabel] The cancel button's text.
   * @property {'neutral' | 'danger'} [tone] `danger` marks a destructive confirm.
   * @property {SheetInput | null} [input] Makes it a text-input sheet.
   * @property {string} [secondaryLabel] A second action's text. It sits between Cancel and confirm, and the sheet has none without it.
   * @property {() => void} [onsecondary] Called by the second action. It confirms nothing and cancels nothing.
   * @property {(value: string) => void} [onconfirm] Called with the field's text, or '' for a plain sheet.
   * @property {() => void} [oncancel] Asked on Esc and on Cancel.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let {
    title = '',
    target = '',
    message = '',
    confirmLabel = 'OK',
    cancelLabel = 'Cancel',
    tone = 'neutral',
    input = null,
    secondaryLabel = '',
    onsecondary = undefined,
    onconfirm = undefined,
    oncancel = undefined,
    uiId = 'sheet',
  } = $props()

  const id = $props.id()
  let text = $state('')
  /** @type {HTMLDivElement | undefined} */
  let sheet = $state()
  /** @type {HTMLInputElement | undefined} */
  let field = $state()
  /** @type {HTMLButtonElement | undefined} */
  let cancel = $state()

  const blocked = $derived(!!input && text.trim() === '')

  onMount(() => {
    text = input?.value ?? ''
    const before = /** @type {HTMLElement | null} */ (document.activeElement)
    // Bindings are set before onMount runs, so the focus moves in the same frame the sheet opens.
    ;(field ?? cancel)?.focus()
    return () => before?.focus?.()
  })

  function confirm() {
    if (blocked) return
    onconfirm?.(input ? text.trim() : '')
  }

  /** @param {KeyboardEvent} e */
  function key(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      oncancel?.()
      return
    }
    if (e.key !== 'Tab' || !sheet) return
    const stops = [...sheet.querySelectorAll('input, button:not([disabled])')].map((el) => /** @type {HTMLElement} */ (el))
    if (stops.length === 0) return
    const at = stops.indexOf(/** @type {HTMLElement} */ (document.activeElement))
    const next = e.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : (at + 1) % stops.length
    e.preventDefault()
    stops[next]?.focus()
  }
</script>

<div class="sheet__scrim">
  <div
    bind:this={sheet}
    class="sheet"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="{id}-title {id}-target"
    aria-describedby={message ? `${id}-message` : undefined}
    tabindex="-1"
    data-ui-id={uiId}
    onkeydown={key}>
    <h2 class="sheet__title" id="{id}-title">{title}</h2>
    {#if target}<p class="sheet__target" id="{id}-target">{target}</p>{/if}
    {#if message}<p class="sheet__message" id="{id}-message">{message}</p>{/if}
    {#if input}
      <input
        bind:this={field}
        bind:value={text}
        class="sheet__field"
        type="text"
        aria-label={input.label}
        placeholder={input.placeholder ?? ''}
        data-ui-id="{uiId}.field"
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            confirm()
          }
        }} />
    {/if}
    <div class="sheet__actions">
      <button bind:this={cancel} type="button" class="sheet__button" data-ui-id="{uiId}.cancel" onclick={() => oncancel?.()}>{cancelLabel}</button>
      {#if secondaryLabel}
        <button type="button" class="sheet__button" data-ui-id="{uiId}.secondary" onclick={() => onsecondary?.()}>{secondaryLabel}</button>
      {/if}
      <button
        type="button"
        class="sheet__button sheet__button--confirm"
        class:sheet__button--danger={tone === 'danger'}
        disabled={blocked}
        data-ui-id="{uiId}.confirm"
        onclick={confirm}>{confirmLabel}</button>
    </div>
  </div>
</div>

<style>
  /* Window-attached: the sheet hangs from the top edge of the window it belongs to. */
  .sheet__scrim {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background: color-mix(in oklab, var(--surface-base) 40%, transparent);
  }
  .sheet {
    width: min(440px, 90vw);
    padding: var(--spacing-md);
    background: var(--surface-raised);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-top: 0;
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    color: var(--text-primary);
    font-size: var(--data-md-size);
    outline: none;
  }
  .sheet__title {
    margin: 0 0 var(--spacing-2xs);
    font-size: var(--label-md-size);
    font-weight: 600;
  }
  .sheet__target {
    margin: 0 0 var(--spacing-xs);
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .sheet__message {
    margin: 0 0 var(--spacing-sm);
    color: var(--text-secondary);
  }
  .sheet__field {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: var(--spacing-sm);
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    color: inherit;
    font: inherit;
  }
  .sheet__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-xs);
  }
  .sheet__button {
    padding: var(--spacing-2xs) var(--spacing-sm);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    color: var(--text-primary);
    font: inherit;
    cursor: default;
  }
  .sheet__button--confirm:not(:disabled) {
    border-color: var(--text-primary);
  }
  .sheet__button--danger:not(:disabled) {
    color: var(--tone-danger);
    border-color: var(--tone-danger);
  }
  .sheet__button:disabled {
    color: var(--text-secondary);
  }
  .sheet__button:focus-visible,
  .sheet__field:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
</style>
