<script>
  // Toolbar — the window's one bar (data-layer plan K4; audit §1.4, §3.3, §4.1).
  //
  // Title, the WorkspaceSwitcher, buttons bound to commands, the filter field and the pane
  // toggles, with drag regions for moving the window. Commands are props (lib/commands.js),
  // the shape CommandPalette takes: the toolbar runs nothing, it asks the host by id.
  //
  // A disabled command stays focusable (`aria-disabled`, not `disabled`) so its reason can
  // be read: the reason is its accessible description and its tooltip (audit §3.16). Gold
  // is never a disabled button's colour (audit §4.2, Button).
  //
  // The drag regions hold the title and empty space only. An interactive element inside
  // a drag region would start a window drag instead of a click.
  //
  // Three groups, left to right (khaos-app#617): where you are (title, switcher, `lead`), what
  // you can do (commands, filter, panes, `tools`), and status (`status`, the settings gear)
  // at the trailing edge behind a hairline. The status group never clips: when the row
  // overflows, command labels fold to their icons one at a time, from the last, until it fits
  // (the label stays the accessible name and the tooltip); then the filter narrows, and the
  // title truncates last.
  import { flushSync } from 'svelte'
  import Icon from './Icon.svelte'
  import WorkspaceSwitcher from './WorkspaceSwitcher.svelte'

  /** @typedef {import('./lib/commands.js').Command} Command */

  /**
   * @typedef {Object} ToolbarPane
   * @property {string} id
   * @property {string} label The toggle's accessible name.
   * @property {string} [icon] Phosphor icon name.
   * @property {boolean} shown Whether the pane is shown now.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [context] Current document/scene context, right aligned before pane toggles.
   * @property {string} [title] The window's title: the story's name.
   * @property {{ value: string, label: string }[]} [modes] The workspaces, for the switcher. None hides it.
   * @property {string} [mode] The current workspace.
   * @property {(mode: string) => void} [onmode] Asked with a workspace.
   * @property {Command[]} [commands] The toolbar's command buttons, in order.
   * @property {(id: string) => void} [onrun] Asked with an enabled command's id.
   * @property {ToolbarPane[]} [panes] The pane toggles, in order.
   * @property {(id: string) => void} [ontogglepane] Asked with a pane's id.
   * @property {string | null} [filter] The filter text. `null` hides the field.
   * @property {string} [filterLabel] The filter's accessible name: name the list it filters.
   * @property {(value: string) => void} [onfilter] Called with the new filter text.
   * @property {number} [width] The toolbar's width in px. 0 measures it.
   * @property {number} [compactBelow] Below this width the switcher becomes a pop-up button.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   * @property {import('svelte').Snippet} [lead] More of where you are, right after the switcher: a workspace switch.
   * @property {import('svelte').Snippet} [tools] More of what you can do, after the pane toggles.
   * @property {import('svelte').Snippet} [status] Status at the trailing edge, before the settings gear: a failure and its Retry.
   * @property {() => void} [onsettings] Opens settings. Absent, no gear is drawn.
   * @property {string} [settingsLabel] The gear's accessible name and tooltip.
   */

  /** @type {Props} */
  let {
    title = '',
    context = '',
    modes = [],
    mode = '',
    onmode = undefined,
    commands = [],
    onrun = undefined,
    panes = [],
    ontogglepane = undefined,
    filter = '',
    filterLabel = 'Filter',
    onfilter = undefined,
    width = 0,
    compactBelow = 960,
    uiId = 'toolbar',
    lead = undefined,
    tools = undefined,
    status = undefined,
    onsettings = undefined,
    settingsLabel = 'Settings…',
  } = $props()

  let measured = $state(0)
  const room = $derived(width > 0 ? width : measured)

  // Folding is measured, not guessed from a width. Laid out in full, does the row overflow? If
  // so, labels fold to their icons one at a time, from the last command, only until it fits;
  // with every label folded and still no room, the row turns compact and the filter, then the
  // title, give way. Re-measured on a resize and on any change to what the row holds. Folding
  // only toggles classes, which the mutation observer does not watch, so it cannot retrigger
  // itself. (#617 live pass: folding every label at once freed 450px where 150 was needed.)
  let folded = $state(0)
  let compact = $state(false)
  const foldable = $derived(commands.filter((c) => c.icon).map((c) => c.id))
  /** Folded, from the last foldable command back. @param {string} id */
  const isFolded = (id) => foldable.indexOf(id) >= foldable.length - folded
  /** @param {HTMLElement} row */
  function fit(row) {
    const measure = () => {
      const overflows = () => {
        flushSync()
        return row.scrollWidth > row.clientWidth
      }
      compact = false
      folded = 0
      while (overflows() && folded < foldable.length) folded += 1
      compact = overflows()
    }
    const resized = new ResizeObserver(measure)
    const changed = new MutationObserver(measure)
    resized.observe(row)
    changed.observe(row, { childList: true, subtree: true, characterData: true })
    return () => {
      resized.disconnect()
      changed.disconnect()
    }
  }
</script>

<div class="toolbar" class:toolbar--compact={compact} role="toolbar" aria-label={title || 'Toolbar'} data-ui-id={uiId} bind:clientWidth={measured}>
  <!-- Where you are and what you can do. It takes any overflow, so the status never does. -->
  <div class="toolbar__main" {@attach fit}>
  <div class="toolbar__drag toolbar__title" data-tauri-drag-region>
    {#if title}<h1 class="toolbar__heading">{title}</h1>{/if}
  </div>

  {#if modes.length}
    <WorkspaceSwitcher {modes} value={mode} onselect={onmode} width={room} {compactBelow} uiId="{uiId}.workspace" />
  {/if}
  {@render lead?.()}

  <div class="toolbar__drag toolbar__spacer" data-tauri-drag-region></div>

  {#each commands as command (command.id)}
    {@const disabled = !!command.disabledReason}
    <button
      type="button"
      class="toolbar__button"
      aria-label={command.label}
      aria-disabled={disabled ? 'true' : undefined}
      aria-describedby={disabled ? `${uiId}-why-${command.id}` : undefined}
      title={disabled ? command.disabledReason : command.shortcut ? `${command.label} (${command.shortcut})` : command.label}
      data-command={command.id}
      data-ui-id="{uiId}.command.{command.id}"
      onclick={() => {
        if (!disabled) onrun?.(command.id)
      }}>
      {#if command.icon}<Icon name={command.icon} />{/if}
      <span class="toolbar__label" class:toolbar__label--folded={isFolded(command.id)}>{command.label}</span>
    </button>
    {#if disabled}<span class="toolbar__why" id="{uiId}-why-{command.id}">{command.disabledReason}</span>{/if}
  {/each}

  {#if filter !== null}
    <input
      class="toolbar__filter"
      type="search"
      aria-label={filterLabel}
      placeholder={filterLabel}
      value={filter}
      data-ui-id="{uiId}.filter"
      oninput={(e) => onfilter?.(e.currentTarget.value)} />
  {/if}

  {#if context}<span class="toolbar__context" title={context}>{context}</span>{/if}

  {#each panes as pane (pane.id)}
    <button
      type="button"
      class="toolbar__toggle"
      aria-label={pane.label}
      aria-pressed={pane.shown}
      title={pane.label}
      data-ui-id="{uiId}.pane.{pane.id}"
      onclick={() => ontogglepane?.(pane.id)}>
      <Icon name={pane.icon ?? 'square'} />
    </button>
  {/each}
  {@render tools?.()}
  </div>

  {#if status || onsettings}
    <div class="toolbar__status" data-ui-id="{uiId}.status">
      {@render status?.()}
      {#if onsettings}
        <button
          type="button"
          class="toolbar__toggle"
          aria-label={settingsLabel}
          title={settingsLabel}
          data-ui-id="{uiId}.settings"
          onclick={() => onsettings?.()}>
          <Icon name="gear-six" />
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    /* 52px: harvest gap 11 (`size.toolbar`), a literal until Andrew decides it. */
    height: 52px;
    padding: 0 var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
    background: var(--surface-base);
    color: var(--text-primary);
    flex: none;
    min-width: 0;
    overflow: hidden;
  }
  /* Nothing in the row shrinks, so a row too short overflows, and the overflow is what turns it
     compact. Only the spacer gives way, and when compact, the filter and then the title. A
     shrinking item would wrap its label or overlap its neighbour instead (#617, measured). */
  .toolbar__main {
    display: flex;
    align-items: center;
    align-self: stretch;
    gap: var(--spacing-xs);
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .toolbar__main > :global(*) {
    flex-shrink: 0;
  }
  .toolbar__drag {
    align-self: stretch;
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .toolbar__spacer {
    flex: 1;
  }
  /* Compact, the title is the last thing to give way. */
  .toolbar--compact .toolbar__title {
    flex-shrink: 1;
  }
  .toolbar__label--folded {
    display: none;
  }
  .toolbar__status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex: none;
    padding-left: var(--spacing-xs);
    border-left: var(--size-stroke-hairline) solid var(--border-default);
  }
  .toolbar__heading {
    margin: 0;
    font-size: var(--label-md-size);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .toolbar__context { min-width:0; max-width:45%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:right; color:var(--text-secondary); font-size:var(--caption-size); }
  .toolbar__button,
  .toolbar__toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: var(--spacing-2xs) var(--spacing-xs);
    background: none;
    border: var(--size-stroke-hairline) solid transparent;
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--label-md-size);
    white-space: nowrap;
    cursor: default;
  }
  .toolbar__button:hover,
  .toolbar__toggle:hover {
    border-color: var(--border-default);
  }
  .toolbar__button[aria-disabled='true'] {
    color: var(--text-secondary);
  }
  .toolbar__toggle[aria-pressed='true'] {
    background: var(--surface-raised);
  }
  .toolbar__button:focus-visible,
  .toolbar__toggle:focus-visible,
  .toolbar__filter:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
  /* The reason is read through aria-describedby and shown as the tooltip. */
  .toolbar__why {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .toolbar__filter {
    width: 200px;
    font: inherit;
    font-size: var(--data-md-size);
    color: var(--text-primary);
    background: var(--surface-raised);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: var(--spacing-2xs) var(--spacing-xs);
  }
  /* Shrink is shared by weight, so the filter's 100 to the title's 1 narrows the filter to its
     floor before the title gives a pixel. */
  .toolbar--compact .toolbar__filter {
    flex: 0 100 200px;
    width: auto;
    min-width: 96px;
  }
</style>
