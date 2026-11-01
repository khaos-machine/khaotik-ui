<script>
  // Toasts — outcomes that float over the page instead of pushing it down, and
  // go away by themselves. Each one is an OutcomeBanner, so the tones, the
  // engine's verbatim detail and the screen-reader roles are the banner's
  // (`alert` for a failure, `status` for a success). The host owns the list and
  // removes a toast when `ondismiss` reports it; one stack means none overlap.
  //
  // A pointer over the stack, or the focus inside it, holds every timer, so a
  // toast cannot vanish while someone is reading or reaching for it.

  import OutcomeBanner from './OutcomeBanner.svelte'

  /**
   * @typedef {Object} Toast
   * @property {string} id
   * @property {'success'|'error'} [tone]
   * @property {string} [title]
   * @property {string} [detail] The engine's message, verbatim.
   * @property {number} [duration] Milliseconds before it dismisses itself; 0 keeps it until dismissed. Overrides the stack's.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Toast[]} [toasts] Newest last.
   * @property {number} [duration] Milliseconds before a toast dismisses itself; 0 keeps them until dismissed.
   * @property {string} [label] Names the stack's region.
   * @property {(id: string) => void} [ondismiss] Reports a toast whose time ran out or whose dismiss button was pressed. Removing it is yours.
   */

  /** @type {Props} */
  let { toasts = [], duration = 5000, label = 'Notifications', ondismiss = undefined } = $props()

  let hovered = $state(false)
  let focused = $state(false)

  /** @param {Toast} toast */
  const expires = (toast) => () => {
    const ms = toast.duration ?? duration
    // ponytail: a held timer restarts in full when released; track the remainder if that reads short.
    if (!ms || hovered || focused) return
    const timer = setTimeout(() => ondismiss?.(toast.id), ms)
    return () => clearTimeout(timer)
  }
</script>

<section
  class="ui-toasts"
  aria-label={label}
  onpointerenter={() => (hovered = true)}
  onpointerleave={() => (hovered = false)}
  onfocusin={() => (focused = true)}
  onfocusout={(e) => (focused = e.currentTarget.contains(/** @type {Node | null} */ (e.relatedTarget)))}
>
  {#each toasts as toast (toast.id)}
    <div class="ui-toasts__toast" {@attach expires(toast)}>
      <OutcomeBanner tone={toast.tone} title={toast.title} detail={toast.detail} onDismiss={() => ondismiss?.(toast.id)} />
    </div>
  {/each}
</section>

<style>
  /* Out of the flow, so nothing under it moves. Only the toasts take the pointer. */
  .ui-toasts {
    position: fixed;
    right: var(--spacing-md);
    bottom: var(--spacing-md);
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    width: min(360px, calc(100% - 2 * var(--spacing-md)));
    pointer-events: none;
  }

  /* The banner's tint is translucent; over the page it needs a surface beneath. */
  .ui-toasts__toast {
    pointer-events: auto;
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.45);
  }
</style>
