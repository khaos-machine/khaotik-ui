<script>
  // WorkspaceSwitcher — the toolbar's mode control (data-layer plan K3; audit §3.2, §3.15).
  //
  // At full width it is the adopted SegmentedControl. Below `compactBelow` it is a
  // pop-up button: a native <select>, which is what a macOS pop-up button is and needs no
  // re-implementation, with the same modes and the same selection. The modes are props,
  // so which workspaces exist is the host's choice (the short-term four, a later Assemble).
  //
  // ⌃⌘1 to ⌃⌘n select by position (audit §3.15). The host turns them off with
  // `shortcuts={false}` where its menu already owns those keys, so a keypress never fires
  // twice (audit §3.17).
  //
  // `width` is the room the host gives the switcher. An unmeasured width (0) is full,
  // never compact, so a first frame does not flash the pop-up.
  import SegmentedControl from './SegmentedControl.svelte'

  /**
   * @typedef {Object} WorkspaceMode
   * @property {string} value
   * @property {string} label
   */

  /**
   * @typedef {Object} Props
   * @property {readonly WorkspaceMode[]} [modes] The workspaces, in order. Their positions are the ⌃⌘ digits.
   * @property {string} [value] The current workspace.
   * @property {(value: string) => void} [onselect] Asked with a workspace's `value`.
   * @property {number} [width] The width in px the host gives the switcher. 0 means unmeasured.
   * @property {number} [compactBelow] Below this width the switcher is a pop-up button.
   * @property {boolean} [shortcuts] Bind ⌃⌘1 to ⌃⌘n. Off where the host's menu owns them.
   * @property {string} [label] The control's accessible name.
   * @property {string} [uiId] The `data-ui-id` (audit §3.14).
   */

  /** @type {Props} */
  let {
    modes = [],
    value = '',
    onselect = undefined,
    width = 0,
    compactBelow = 360,
    shortcuts = true,
    label = 'Workspace',
    uiId = 'workspace',
  } = $props()

  const compact = $derived(width > 0 && width < compactBelow)
  const items = $derived(modes.map((m) => ({ value: m.value, label: m.label })))

  /** @param {string} next */
  function choose(next) {
    if (next !== value && modes.some((m) => m.value === next)) onselect?.(next)
  }

  /** @param {KeyboardEvent} e */
  function key(e) {
    if (!shortcuts || !e.ctrlKey || !e.metaKey || e.altKey || e.shiftKey) return
    const digit = /^Digit([1-9])$/.exec(e.code)
    if (!digit) return
    const mode = modes[Number(digit[1]) - 1]
    if (!mode) return
    e.preventDefault()
    choose(mode.value)
  }
</script>

<svelte:window onkeydown={key} />

<div class="switcher" data-ui-id={uiId}>
  {#if compact}
    <select class="switcher__popup" aria-label={label} {value} onchange={(e) => choose(e.currentTarget.value)}>
      {#each modes as mode (mode.value)}
        <option value={mode.value}>{mode.label}</option>
      {/each}
    </select>
  {:else}
    <SegmentedControl {label} {value} {items} onselect={choose} />
  {/if}
</div>

<style>
  .switcher {
    display: inline-flex;
    min-width: 0;
  }
  .switcher__popup {
    font: inherit;
    font-size: var(--label-md-size);
    color: var(--text-primary);
    background: var(--surface-raised);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: var(--spacing-2xs) var(--spacing-xs);
  }
  .switcher__popup:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
</style>
