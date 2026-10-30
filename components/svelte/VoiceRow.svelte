<script>
  // One voice in a list, at the desktop row height (24px, the kit's row): its name, a status word
  // where it has one, then where it comes from and its language in mono. Moved from Khaos App
  // (catalog app-coverage plan, T9).
  //
  // ponytail: a plain list of buttons, not the virtualised DataTable. A voice library is tens of
  // rows, and every row stays a button named by its voice. Move to DataTable when a library runs
  // to hundreds.

  /**
   * @typedef {Object} Props
   * @property {string} [name] The voice's name, and the row's accessible name.
   * @property {string} [language] Its language code.
   * @property {string} [source] Where the voice comes from: its engine, short ("Qwen3", "Gemini").
   * @property {string} [status] A short state shown in words: "not locked", "deleted".
   * @property {boolean} [selected] The voice shown in the detail.
   * @property {(() => void) | undefined} [onclick] Reports the row chosen.
   */

  /** @type {Props} */
  let { name = '', language = '', source = '', status = '', selected = false, onclick = undefined } = $props()
</script>

<button type="button" class="ui-voice-row" class:ui-voice-row--selected={selected} aria-label={name} aria-pressed={selected} {onclick}>
  <span class="ui-voice-row__name">{name}</span>
  {#if status}<span class="ui-voice-row__status">{status}</span>{/if}
  <span class="ui-voice-row__source">{source}</span>
  <span class="ui-voice-row__lang">{language}</span>
</button>

<style>
  .ui-voice-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 52px 56px;
    align-items: center;
    gap: var(--spacing-xs);
    /* 24px: the kit's row height (DataTable, SourceList). */
    min-height: 24px;
    padding: 0 var(--spacing-xs);
    border: 0;
    border-radius: var(--radius-sm, 4px);
    background: transparent;
    color: var(--text-primary);
    font: inherit;
    font-size: var(--data-md-size);
    text-align: left;
    cursor: default;
  }
  .ui-voice-row:hover {
    background: var(--surface-raised);
  }
  /* Selection is neutral; gold is never the selection. */
  .ui-voice-row--selected,
  .ui-voice-row--selected:hover {
    background: var(--surface-selected, var(--surface-raised));
  }
  .ui-voice-row:focus-visible {
    outline: var(--size-stroke-hairline, 1px) solid var(--border-focus, var(--text-secondary));
    outline-offset: -1px;
  }
  .ui-voice-row__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ui-voice-row__status,
  .ui-voice-row__source,
  .ui-voice-row__lang {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    white-space: nowrap;
  }
  /* Each in its own column whether or not the others are there, so sources and languages
     line up down the list. */
  .ui-voice-row__status {
    grid-column: 2;
  }
  .ui-voice-row__source {
    grid-column: 3;
    font-family: var(--font-mono);
  }
  .ui-voice-row__lang {
    grid-column: 4;
    font-family: var(--font-mono);
    text-align: right;
  }
</style>
