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
  // at the trailing edge behind a hairline. When the row overflows, command labels fold to their
  // icons one at a time, from the last, until it fits (the label stays the accessible name and
  // the tooltip); then the filter narrows, and the title truncates last. At phone width the
  // title keeps a floor and the row scrolls; where the status group and that floor cannot both
  // fit, the status gives way: the message the host marks `data-toolbar-message` truncates with
  // an ellipsis (keeping its accessible name and role), while everything else in it (Retry, the
  // gear, any wrapper) stays whole and reachable. Unmarked, nothing in the status truncates.
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
   * @property {import('svelte').Snippet} [status] Status at the trailing edge, before the settings gear: a failure and its Retry, as direct children. Mark the message `data-toolbar-message`: at phone width, short of room, it alone truncates with an ellipsis (its text, accessible name and role kept). Everything else, a wrapper included, stays whole.
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

  // A row that scrolls sideways at phone width (the row itself, and the host's tools). The side
  // that is cut off fades, and only while it is (`--toolbar-cut-start` / `-end`, 1 or 0, read by
  // the mask); a vertical wheel scrolls it sideways until it reaches that end; and a focused
  // control is scrolled clear of the fade. Where the row does not scroll (`overflow-x: hidden`,
  // wider than a phone) the wheel and focus leave it alone.
  /** @param {HTMLElement} row */
  function scrollRow(row) {
    /** @param {string} name @param {boolean} on */
    const set = (name, on) => {
      if (row.style.getPropertyValue(name) !== (on ? '1' : '0')) row.style.setProperty(name, on ? '1' : '0')
    }
    const cue = () => {
      set('--toolbar-cut-start', row.scrollLeft > 0.5)
      set('--toolbar-cut-end', row.scrollLeft + row.clientWidth < row.scrollWidth - 0.5)
    }
    /** @param {WheelEvent} e */
    const wheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || getComputedStyle(row).overflowX === 'hidden') return
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      const next = Math.min(row.scrollWidth - row.clientWidth, Math.max(0, row.scrollLeft + delta))
      if (Math.abs(next - row.scrollLeft) < 0.5) return // at that end: the page scrolls instead
      e.preventDefault()
      row.scrollLeft = next
      cue()
    }
    // A focused control is scrolled fully clear of the fade, a fade's width from each side that is
    // cut off; the fade stays on while focus is in the row.
    // What is measured is what the user sees: a segment's focus lands on a 1px hidden radio, so
    // the nearest enclosing box of real size (the segment's label) is the one brought into view.
    /** @param {FocusEvent} e */
    const focus = (e) => {
      if (!(e.target instanceof HTMLElement) || e.target === row || getComputedStyle(row).overflowX === 'hidden') return
      /** @type {HTMLElement} */
      let shown = e.target
      let b = shown.getBoundingClientRect()
      while ((b.width < 2 || b.height < 2) && shown.parentElement && shown.parentElement !== row) {
        shown = shown.parentElement
        b = shown.getBoundingClientRect()
      }
      const r = row.getBoundingClientRect()
      const fade = parseFloat(getComputedStyle(row).getPropertyValue('--spacing-lg')) || 24
      const max = row.scrollWidth - row.clientWidth
      const at = row.scrollLeft
      const x = b.left - r.left + at // the box's start, in the row's scrolled content
      // A side fades only while it is cut off: none at the row's true start or end.
      /** @param {number} s */ const startFade = (s) => (s > 0.5 ? fade : 0)
      /** @param {number} s */ const endFade = (s) => (s < max - 0.5 ? fade : 0)
      let to = at
      if (x - at < startFade(at)) to = Math.max(0, x - fade)
      else if (x + b.width - at > r.width - endFade(at)) to = Math.min(max, x + b.width - r.width + fade)
      row.scrollLeft = to
      cue()
    }
    const resized = new ResizeObserver(cue)
    const changed = new MutationObserver(cue)
    resized.observe(row)
    changed.observe(row, { childList: true, subtree: true, characterData: true, attributeFilter: ['class'] })
    row.addEventListener('scroll', cue, { passive: true })
    row.addEventListener('wheel', wheel, { passive: false })
    row.addEventListener('focusin', focus)
    cue()
    return () => {
      resized.disconnect()
      changed.disconnect()
      row.removeEventListener('scroll', cue)
      row.removeEventListener('wheel', wheel)
      row.removeEventListener('focusin', focus)
    }
  }

  // The status's floor: the width of everything in it but the message marked
  // `data-toolbar-message`, so giving way truncates that message and never cuts a control.
  // Measured, not left to the browser: a flex container's own minimum counts a message at its
  // full text and lets a wrapper's text wrap, so it held a message whole or clipped a Retry.
  /** @param {HTMLElement} group */
  function holdStatus(group) {
    const measure = () => {
      const kids = [...group.children].filter((c) => c.getClientRects().length > 0)
      const whole = kids.filter((c) => !c.matches('[data-toolbar-message]'))
      const gap = parseFloat(getComputedStyle(group).columnGap) || 0
      const floor = whole.reduce((w, c) => w + c.getBoundingClientRect().width, 0) + gap * Math.max(0, kids.length - 1)
      const value = `${Math.ceil(floor)}px`
      if (group.style.getPropertyValue('--toolbar-status-floor') !== value) group.style.setProperty('--toolbar-status-floor', value)
    }
    const resized = new ResizeObserver(measure)
    const changed = new MutationObserver(measure)
    resized.observe(group)
    changed.observe(group, { childList: true, subtree: true, characterData: true })
    measure()
    return () => {
      resized.disconnect()
      changed.disconnect()
    }
  }
</script>

<div class="toolbar" class:toolbar--compact={compact} role="toolbar" aria-label={title || 'Toolbar'} data-ui-id={uiId} bind:clientWidth={measured}>
  <!-- Where you are and what you can do. It takes the overflow, folding and then scrolling; at
       phone width the status gives way first, its marked message truncating, its controls whole. -->
  <div class="toolbar__main" {@attach fit} {@attach scrollRow}>
  <!-- No title, no cell: an empty one would hold a gap before the switcher. -->
  {#if title}
    <div class="toolbar__drag toolbar__title" data-tauri-drag-region><h1 class="toolbar__heading">{title}</h1></div>
  {/if}

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
  {#if tools}<div class="toolbar__tools" {@attach scrollRow}>{@render tools()}</div>{/if}
  </div>

  {#if status || onsettings}
    <div class="toolbar__status" data-ui-id="{uiId}.status" {@attach holdStatus}>
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
    /* 52px: harvest gap 11 (`size.toolbar`), a literal until Andrew decides it. A height, not a
       floor: the row never wraps, so nothing needs it taller, and a host may fix its bar at 52. */
    height: 52px;
    box-sizing: border-box;
    container-type: inline-size;
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
  /* An empty spacer takes no gap of its own: the gap before it is given back. */
  .toolbar__spacer {
    flex: 1;
    margin-left: calc(-1 * var(--spacing-xs));
  }
  /* Compact, the title is the last thing to give way. */
  .toolbar--compact .toolbar__title {
    flex-shrink: 1;
  }
  .toolbar__label--folded {
    display: none;
  }
  /* The host's tools are one group, so the row never splits them. */
  .toolbar__tools {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
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
  /* Phone width: still one row, never wrapped. A wrapped row grows the bar past 52 and over
     whatever the host draws below it. A row that overflows folds its labels, narrows the filter
     and truncates the title to its floor, as at any width; still short, it scrolls, as the tools
     do, with a fade on the side cut off, so every command, the filter and the panes stay
     reachable. */
  @container (max-width: 599px) {
    .toolbar__main {
      overflow-x: auto;
      scrollbar-width: none;
      /* 3px: a 44pt row plus this and the hairline stays inside the 52 floor, so one row is 52
         with or without touch targets. */
      padding-block: 3px;
      gap: var(--spacing-2xs);
    }
    .toolbar__spacer {
      margin-left: calc(-1 * var(--spacing-2xs));
    }
    /* The tools stay on the first row, whatever the room: short of it, they scroll within the
       row rather than wrap, so the bar never changes height between views. Ends right; `safe`
       starts them left when they overflow, where plain flex-end would put the first out of reach. */
    .toolbar__main > .toolbar__tools {
      flex: 1 1 0;
      min-width: 0;
      justify-content: safe flex-end;
      align-self: stretch;
      overflow-x: auto;
      scrollbar-width: none;
      gap: var(--spacing-2xs);
    }
    /* The tools and the filter take the room the spacer would; the tools end right by themselves. */
    .toolbar__main:has(> .toolbar__tools) > .toolbar__spacer,
    .toolbar__main:has(> .toolbar__filter) > .toolbar__spacer {
      flex: none;
    }
    /* The cue: the side cut off fades over --spacing-lg, and only while it is cut off (scrollRow).
       The mask is alpha alone, so it reads the same in light and dark. It stays on while focus
       is in the row; a focused control is scrolled clear of it. */
    .toolbar__main,
    .toolbar__main > .toolbar__tools {
      mask-image: linear-gradient(
        to right,
        transparent,
        black calc(var(--toolbar-cut-start, 0) * var(--spacing-lg)),
        black calc(100% - var(--toolbar-cut-end, 0) * var(--spacing-lg)),
        transparent
      );
    }
    /* The title stays readable: it truncates to this floor and no further, and the rest of the
       row scrolls instead. Its full text is still the toolbar's accessible name. */
    .toolbar__title {
      min-width: calc(2 * var(--spacing-2xl));
    }
    /* Short of room, the status gives way before the row: shrink is shared by weight, so the
       status's 100 to the row's 1 takes the status down to its floor (holdStatus: everything in
       it but the marked message) before the row narrows below the title's floor and one fade
       beyond it, the room that keeps the end fade off the title's ellipsis. */
    .toolbar__main {
      flex: 1 1 calc(2 * var(--spacing-2xl) + var(--spacing-lg));
    }
    .toolbar__status {
      flex: 0 100 auto;
      min-width: var(--toolbar-status-floor, auto);
    }
    /* In the status only the message the host marks `data-toolbar-message` truncates; every
       other child, a wrapper included, stays whole. Host markup, so `:global`. */
    .toolbar__status > :global(*) {
      flex-shrink: 0;
    }
    .toolbar__status > :global([data-toolbar-message]) {
      flex-shrink: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Lenses at 4px a side: a picker and four lenses fit 320. */
    .toolbar__tools :global(.ui-segmented__item) {
      padding-inline: 4px;
    }
    .toolbar__main::-webkit-scrollbar,
    .toolbar__tools::-webkit-scrollbar {
      display: none;
    }
    /* The filter takes the room the row has left, down to the compact floor; short of that the
       row overflows, and the overflow folds labels first. In a row too narrow for the floor and a
       fade on each side, it narrows to fit between the fades, so focused it shows whole. */
    .toolbar__filter,
    .toolbar--compact .toolbar__filter {
      min-width: min(96px, calc(100% - 2 * var(--spacing-lg)));
    }
    .toolbar__filter {
      flex: 1 1 0;
      width: auto;
    }
    /* A phone is touched: every button in the row is a 44pt target. */
    .toolbar__main :global(.ui-button),
    .toolbar__button,
    .toolbar__toggle {
      box-sizing: border-box;
      min-width: 44px;
      height: 44px;
      justify-content: center;
    }
  }
</style>
