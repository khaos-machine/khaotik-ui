<script>
  // CommandPalette — ⌘K (data-layer plan K11; audit §3.11, §3.16).
  //
  // The host owns the commands (khaos-app A-Q1: the registry is the app's) and passes them
  // as props; the palette searches label and group (lib/commands.js `matchCommands`) and
  // ASKS the host to run one by id. A disabled command is listed, with its reason as text
  // and as its accessible description, and never runs (audit §3.17).
  //
  // A combobox controlling a listbox, with the active option as `aria-activedescendant`.
  // The input takes focus when the palette mounts; Esc asks the host to close it, and the
  // focus returns to whatever held it before, so a host that unmounts on close gets the
  // focus return for free.
  import { onMount } from 'svelte'
  import { matchCommands } from './lib/commands.js'

  /** @typedef {import('./lib/commands.js').Command} Command */

  /**
   * @typedef {Object} Props
   * @property {readonly Command[]} [commands] Every command the host offers, enabled or not.
   * @property {(id: string) => void} [onrun] Asked with an enabled command's id.
   * @property {() => void} [onclose] Asked on Esc, and after a command runs.
   * @property {string} [placeholder] The search field's placeholder.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { commands = [], onrun = undefined, onclose = undefined, placeholder = 'Run a command', uiId = 'palette' } = $props()

  const id = $props.id()
  let query = $state('')
  let active = $state(0)
  /** @type {HTMLInputElement | undefined} */
  let input = $state()

  const matches = $derived(matchCommands(commands, query))

  onMount(() => {
    const before = /** @type {HTMLElement | null} */ (document.activeElement)
    input?.focus()
    return () => before?.focus?.()
  })

  /** @param {Command | undefined} command */
  function run(command) {
    if (!command || command.disabledReason) return
    onrun?.(command.id)
    onclose?.()
  }

  /** @param {KeyboardEvent} e */
  function key(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      active = Math.min(matches.length - 1, active + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      active = Math.max(0, active - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(matches[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onclose?.()
    }
  }
</script>

<div class="palette" role="dialog" aria-label="Command palette" data-ui-id={uiId}>
  <input
    bind:this={input}
    class="palette__input"
    type="text"
    role="combobox"
    aria-label="Run a command"
    aria-expanded="true"
    aria-controls="{id}-list"
    aria-autocomplete="list"
    aria-activedescendant={matches[active] ? `${id}-opt-${active}` : undefined}
    {placeholder}
    value={query}
    data-ui-id="{uiId}.input"
    oninput={(e) => {
      query = e.currentTarget.value
      active = 0
    }}
    onkeydown={key} />
  <ul class="palette__list" role="listbox" id="{id}-list" aria-label="Commands">
    {#each matches as command, i (command.id)}
      {@const disabled = !!command.disabledReason}
      <!-- svelte-ignore a11y_click_events_have_key_events -- the combobox handles the keys for every option -->
      <li
        class="palette__option"
        class:palette__option--active={i === active}
        role="option"
        id="{id}-opt-{i}"
        aria-selected={i === active}
        aria-disabled={disabled ? 'true' : undefined}
        aria-describedby={disabled ? `${id}-why-${i}` : undefined}
        data-command={command.id}
        data-ui-id="{uiId}.command.{command.id}"
        onclick={() => run(command)}>
        <span class="palette__label">{command.label}</span>
        {#if command.group}<span class="palette__group">{command.group}</span>{/if}
        {#if command.shortcut}<kbd class="palette__shortcut">{command.shortcut}</kbd>{/if}
        {#if disabled}<span class="palette__why" id="{id}-why-{i}">{command.disabledReason}</span>{/if}
      </li>
    {/each}
  </ul>
  {#if matches.length === 0}
    <p class="palette__empty">No command matches “{query.trim()}”.</p>
  {/if}
</div>

<style>
  .palette {
    display: flex;
    flex-direction: column;
    width: min(560px, 90vw);
    max-height: 60vh;
    background: var(--surface-raised);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    overflow: hidden;
    color: var(--text-primary);
    font-size: var(--data-md-size);
  }
  .palette__input {
    flex: none;
    padding: var(--spacing-sm);
    border: 0;
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
    background: none;
    color: inherit;
    font: inherit;
    font-size: var(--label-md-size);
    outline: none;
  }
  .palette__list {
    list-style: none;
    margin: 0;
    padding: var(--spacing-2xs) 0;
    overflow: auto;
  }
  .palette__option {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    column-gap: var(--spacing-sm);
    /* 24px: harvest gap 9 (`size.row`), a literal until Andrew decides it. */
    min-height: 24px;
    padding: 0 var(--spacing-sm);
    cursor: default;
  }
  .palette__option--active {
    background: var(--surface-base);
  }
  .palette__option[aria-disabled='true'] .palette__label {
    color: var(--text-secondary);
  }
  .palette__group,
  .palette__shortcut {
    color: var(--text-secondary);
    font-size: var(--caption-size);
    font-family: inherit;
  }
  .palette__why {
    grid-column: 1 / -1;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .palette__empty {
    margin: 0;
    padding: var(--spacing-sm);
    color: var(--text-secondary);
  }
</style>
