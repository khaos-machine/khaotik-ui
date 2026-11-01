<script>
  // AccountMenu — a round avatar that opens a panel: who is signed in, then the
  // places the host lists, then Sign out last. Places are links and Sign out is
  // a Button (buttons are not links).
  //
  // Menu is a single-choice list with no avatar trigger, identity header or row
  // icons, so this is a disclosure panel on the native popover: the top layer
  // clears any overflow on the bar, and Esc and click-away close it. Up and Down
  // walk the rows; Home and End jump to the ends.

  import Avatar from './Avatar.svelte'
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'

  /**
   * @typedef {Object} AccountPlace
   * @property {string} label
   * @property {string} href
   * @property {string} [icon] A Phosphor glyph name.
   */

  /**
   * @typedef {Object} Props
   * @property {string} [name] The signed-in person's name, or '' when they have not given one.
   * @property {string} [email] Their email, shown under the name, or alone when there is no name.
   * @property {string} [label] Names the trigger and the panel.
   * @property {readonly AccountPlace[]} [places] The panel's links, in order.
   * @property {string} [signOutLabel] The Sign out button's text.
   * @property {() => void} [onsignout] Called by Sign out, after the panel closes.
   */

  /** @type {Props} */
  let { name = '', email = '', label = 'Account', places = [], signOutLabel = 'Sign out', onsignout = undefined } = $props()

  const id = $props.id()
  /** @type {HTMLButtonElement | undefined} */
  let trigger = $state()
  /** @type {HTMLDivElement | undefined} */
  let panel = $state()
  let open = $state(false)
  let top = $state(0)
  let right = $state(0)

  const rows = () => [...(panel?.querySelectorAll('a, button') ?? [])].map((el) => /** @type {HTMLElement} */ (el))
  const close = () => panel?.hidePopover()

  /** @param {ToggleEvent} event */
  function place(event) {
    if (event.newState !== 'open' || !trigger) return
    const box = trigger.getBoundingClientRect()
    top = box.bottom + 6
    right = window.innerWidth - box.right
  }

  /** @param {ToggleEvent} event */
  function toggled(event) {
    open = event.newState === 'open'
    if (open) rows()[0]?.focus()
  }

  /** @param {KeyboardEvent} event */
  function walk(event) {
    const all = rows()
    const at = all.indexOf(/** @type {HTMLElement} */ (document.activeElement))
    const to = /** @type {Record<string, number>} */ ({ ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: all.length - 1 })[event.key]
    if (to === undefined) return
    event.preventDefault()
    all[(to + all.length) % all.length]?.focus()
  }
</script>

<button bind:this={trigger} class="ui-account__trigger" type="button" popovertarget={id} aria-label={label} aria-expanded={open} aria-controls={id}>
  <Avatar {name} {email} />
</button>

<div
  bind:this={panel}
  {id}
  class="ui-account__panel"
  popover="auto"
  style:top="{top}px"
  style:right="{right}px"
  aria-label={label}
  role="dialog"
  tabindex="-1"
  onbeforetoggle={place}
  ontoggle={toggled}
  onkeydown={walk}
>
  <div class="ui-account__identity">
    <Avatar {name} {email} size={36} />
    <div class="ui-account__who">
      {#if name}
        <strong>{name}</strong>
        <span>{email}</span>
      {:else}
        <strong>{email}</strong>
      {/if}
    </div>
  </div>
  {#if places.length}
    <nav class="ui-account__group" aria-label={label}>
      {#each places as row (row.href)}
        <a class="ui-account__row" href={row.href} onclick={close}>{#if row.icon}<Icon name={row.icon} />{/if}{row.label}</a>
      {/each}
    </nav>
  {/if}
  <div class="ui-account__group ui-account__out">
    <Button icon="sign-out" onclick={() => (close(), onsignout?.())}>{signOutLabel}</Button>
  </div>
</div>

<style>
  .ui-account__trigger {
    display: inline-flex;
    padding: 2px;
    border: 0;
    border-radius: 50%;
    background: none;
    cursor: pointer;
  }

  .ui-account__trigger:hover :global(.ui-avatar),
  .ui-account__trigger[aria-expanded='true'] :global(.ui-avatar) {
    box-shadow: inset 0 0 0 var(--size-stroke-hairline) var(--gold-400);
  }

  .ui-account__trigger:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: 1px;
  }

  .ui-account__panel {
    position: fixed;
    inset: auto;
    margin: 0;
    width: 260px;
    padding: var(--spacing-2xs);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    color: var(--text-primary);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.45);
  }

  .ui-account__identity {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
  }

  .ui-account__who {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ui-account__who > * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ui-account__who strong {
    font-size: var(--body-md-size);
    font-weight: 600;
  }

  .ui-account__who span {
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  .ui-account__group {
    display: flex;
    flex-direction: column;
    padding-top: var(--spacing-2xs);
    margin-top: var(--spacing-2xs);
    border-top: var(--size-stroke-hairline) solid var(--border-hairline);
  }

  /* Rows: the link and the Button share one row shape. */
  .ui-account__row,
  .ui-account__out :global(.ui-button) {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
    min-height: 32px;
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-primary);
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    text-decoration: none;
  }

  .ui-account__row :global(.ph),
  .ui-account__out :global(.ph) {
    font-size: 16px;
    color: var(--text-secondary);
  }

  .ui-account__row:hover,
  .ui-account__row:focus-visible,
  .ui-account__out :global(.ui-button:hover),
  .ui-account__out :global(.ui-button:focus-visible) {
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    outline: none;
  }
</style>
