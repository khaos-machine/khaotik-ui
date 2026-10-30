<script>
  // The preset speakers a speech request can target (Qwen3-TTS CustomVoice).
  // Controlled: the host owns the selected id and receives the choice, so a
  // VoiceDesign panel and a Clone panel can mount the same picker without
  // forking it. Chips rather than a <select> — nine voices are small enough to
  // scan at a glance, and a select hides the set behind a click.
  //
  // `disabled` is aria-disabled, never the native attribute, as on the kit's
  // Button: the chips stay in the Tab order and the selection stays drawn while a
  // host holds the picker (#264). Every activation — click, Enter, Space — arrives
  // as a click, so the one guard in `choose` covers all three.
  /**
   * @typedef {Object} Speaker
   * @property {string} id The speaker id (e.g. `aiden`).
   * @property {string} name The display name (e.g. `Aiden`).
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Speaker[]} [speakers] The speakers to choose from.
   * @property {string} [selected] The selected speaker id.
   * @property {(id: string) => void} [onselect] Called with the chosen speaker id.
   * @property {string} [label] Accessible name for the group. Defaults to "Speakers".
   * @property {boolean} [disabled] Every chip renders `aria-disabled="true"`, stays focusable, and never calls `onselect`. The selection stays drawn.
   * @property {string} [pendingId] The id of the speaker whose choice the host has sent and is waiting on. That chip renders `aria-busy` and a spinner, and the picker takes no other choice until it clears. **Consumer-driven, never inferred**, the same contract as `ServiceStatusList.pendingId`.
   */

  /** @type {Props} */
  let {
    speakers = [],
    selected = '',
    onselect = undefined,
    label = 'Speakers',
    disabled = false,
    pendingId = '',
  } = $props()

  const held = $derived(disabled || !!pendingId)

  /** @param {string} id */
  function choose(id) {
    if (held) return
    onselect?.(id)
  }
</script>

<div class="ui-speaker-picker" role="group" aria-label={label}>
  {#each speakers as s (s.id)}
    <button
      type="button"
      class="ui-speaker-picker__chip"
      aria-pressed={s.id === selected}
      aria-disabled={held ? 'true' : undefined}
      aria-busy={pendingId && s.id === pendingId ? 'true' : undefined}
      class:selected={s.id === selected}
      onclick={() => choose(s.id)}
    >
      {#if pendingId && s.id === pendingId}<span class="ui-speaker-picker__spinner" aria-hidden="true"></span>{/if}
      {s.name}
    </button>
  {/each}
</div>

<style>
  .ui-speaker-picker {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .ui-speaker-picker__chip {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: 4px 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    font: inherit;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .ui-speaker-picker__chip:hover:not(.selected):not([aria-disabled='true']) {
    border-color: var(--border-focus);
  }

  .ui-speaker-picker__chip:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }

  .ui-speaker-picker__chip.selected {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    border-color: var(--border-focus);
    color: var(--text-primary);
  }

  /* Held: the unchosen chips recede, the chosen one keeps its fill so the
     current selection reads while a write is in flight (#264). */
  .ui-speaker-picker__chip[aria-disabled='true'] {
    color: var(--action-on-disabled);
    cursor: default;
  }

  .ui-speaker-picker__chip.selected[aria-disabled='true'] {
    color: var(--text-primary);
  }

  .ui-speaker-picker__spinner {
    flex: none;
    width: 11px;
    height: 11px;
    border: var(--size-stroke-focus) solid var(--border-default);
    border-top-color: var(--tone-info);
    border-radius: 50%;
    animation: speaker-picker-spin 0.9s linear infinite;
  }

  @keyframes speaker-picker-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-speaker-picker__spinner { animation: none; }
  }
</style>
