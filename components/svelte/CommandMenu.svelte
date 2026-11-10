<script>
  // A More menu of commands, each named: what a toolbar short of room holds instead of drawing a
  // command as a bare icon (operator, 2026-11-10: "i don't know what mic + play buttons are").
  // Toolbar fills it with the commands that do not fit; a phone's Shell with all of them.
  //
  // The platform's own popover: the trigger opens it, a click outside or Esc closes it, and it
  // sits in the top layer, anchored under the trigger. A command that cannot run stays in the
  // list, says why under its label, and does nothing when chosen.
  import Icon from './Icon.svelte'

  /** @typedef {import('./lib/commands.js').Command} Command */

  /**
   * @typedef {Object} Props
   * @property {readonly Command[]} [commands] The commands it offers, in order.
   * @property {(id: string) => void} [onrun] Asked with an enabled command's id.
   * @property {string} [label] The trigger's accessible name and tooltip.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { commands = [], onrun = undefined, label = 'More', uiId = 'more' } = $props()
  const id = $props.id()

  /** @param {MouseEvent} event @param {Command} command */
  function run(event, command) {
    if (command.disabledReason) return
    /** @type {HTMLElement} */ (event.currentTarget).closest('[popover]')?.hidePopover?.()
    onrun?.(command.id)
  }
</script>

<button type="button" class="ui-command-menu__trigger" popovertarget="{id}-menu" aria-label={label} title={label} data-ui-id={uiId}>
  <Icon name="dots-three" />
</button>
<div class="ui-command-menu" id="{id}-menu" popover>
  {#each commands as command (command.id)}
    <button
      type="button"
      class="ui-command-menu__item"
      data-command={command.id}
      data-ui-id="{uiId}.command.{command.id}"
      aria-disabled={command.disabledReason ? 'true' : undefined}
      aria-describedby={command.disabledReason ? `${id}-why-${command.id}` : undefined}
      onclick={(event) => run(event, command)}>
      {#if command.icon}<Icon name={command.icon} />{/if}
      <span class="ui-command-menu__label">{command.label}</span>
      {#if command.disabledReason}<span class="ui-command-menu__why" id="{id}-why-{command.id}" aria-hidden="true">{command.disabledReason}</span>{/if}
    </button>
  {/each}
</div>

<style>
  .ui-command-menu__trigger {
    anchor-name: --ui-command-menu;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    padding: 5px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
  }
  .ui-command-menu__trigger:hover { color: var(--text-primary); }
  .ui-command-menu__trigger:focus-visible { outline: var(--size-stroke-focus) solid var(--border-focus); }
  .ui-command-menu {
    position-anchor: --ui-command-menu;
    inset: auto;
    top: anchor(bottom);
    right: anchor(right);
    margin: var(--spacing-2xs) 0 0;
    min-width: 180px;
    padding: var(--spacing-2xs);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    color: var(--text-primary);
  }
  .ui-command-menu__item {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    column-gap: var(--spacing-xs);
    width: 100%;
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: var(--body-md-size);
    text-align: left;
    cursor: pointer;
  }
  /* Menu's own highlight (Menu.svelte, .ui-menu__item[data-highlighted]). */
  .ui-command-menu__item:hover:not([aria-disabled='true']) { background: color-mix(in oklab, var(--text-primary) 8%, transparent); }
  .ui-command-menu__item:focus-visible { outline: var(--size-stroke-focus) solid var(--border-focus); }
  .ui-command-menu__item[aria-disabled='true'] { color: var(--text-secondary); cursor: default; }
  .ui-command-menu__label { grid-column: 2; }
  .ui-command-menu__why { grid-column: 2; font-size: var(--caption-size); color: var(--text-secondary); }
</style>
