<script>
  // ScrubNumber — drag to scrub, click to type (data-layer plan K10; audit §3.12, §3.15,
  // §3.16).
  //
  // A `spinbutton`. ↑ ↓ step it, PageUp and PageDown step ten, Home and End go to the
  // bounds; ⇧ makes a key or a drag ten times coarser and ⌥ makes a drag ten times finer.
  // A click without a drag opens a text field: Return or leaving it commits, Esc reverts.
  // Every value is snapped to the step and held inside [min, max] before it is emitted
  // (lib/scrub.js), so a value outside the range never reaches the host; a value equal to
  // the current one is not emitted at all. Controlled: the host passes the new value back.
  import { clampStep, decimals } from './lib/scrub.js'

  /**
   * @typedef {Object} Props
   * @property {number} [value] The current value. Controlled: pass back what `onchange` gives you.
   * @property {number} [min] The lowest value it will emit.
   * @property {number} [max] The highest value it will emit.
   * @property {number} [step] Every emitted value is a multiple of this from `min`; its decimals set the display.
   * @property {string} [label] The accessible name.
   * @property {(value: number) => void} [onchange] Called with a new value inside the range.
   * @property {boolean} [disabled] Shown but not changeable, and out of the tab order.
   * @property {string} [uiId] The `data-ui-id` (audit §3.14).
   */

  /** @type {Props} */
  let { value = 0, min = 0, max = 100, step = 1, label = '', onchange = undefined, disabled = false, uiId = undefined } = $props()

  // How many px of drag make one step; ⇧ and ⌥ scale it.
  const PX_PER_STEP = 4

  let editing = $state(false)
  let draft = $state('')
  let dragged = false
  const shown = $derived(value.toFixed(decimals(step)))

  /** @param {number} next */
  function emit(next) {
    const v = clampStep(next, min, max, step)
    if (v !== value) onchange?.(v)
  }

  /** @param {KeyboardEvent} e */
  function key(e) {
    if (disabled) return
    const coarse = e.shiftKey ? 10 : 1
    /** @type {number | null} */
    let next = null
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = value + step * coarse
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = value - step * coarse
    else if (e.key === 'PageUp') next = value + step * 10
    else if (e.key === 'PageDown') next = value - step * 10
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else if (e.key === 'Enter') {
      e.preventDefault()
      open()
      return
    }
    if (next === null) return
    e.preventDefault()
    emit(next)
  }

  /** @param {PointerEvent} e */
  function down(e) {
    if (disabled) return
    const target = /** @type {HTMLElement} */ (e.currentTarget)
    const startX = e.clientX
    const from = value
    dragged = false
    target.setPointerCapture?.(e.pointerId)
    /** @param {PointerEvent} ev */
    const move = (ev) => {
      const dx = ev.clientX - startX
      if (Math.abs(dx) > 2) dragged = true
      const scale = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1
      emit(from + (dx / PX_PER_STEP) * step * scale)
    }
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }

  function open() {
    if (disabled) return
    draft = shown
    editing = true
  }

  function commit() {
    if (!editing) return
    editing = false
    const parsed = Number.parseFloat(draft)
    if (Number.isFinite(parsed)) emit(parsed)
  }

  /** @param {KeyboardEvent} e */
  function editKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      editing = false
    }
  }

  /** @param {HTMLInputElement} node */
  function focusOnMount(node) {
    node.focus()
    node.select()
  }
</script>

{#if editing}
  <input
    class="scrub scrub__input"
    type="text"
    inputmode="decimal"
    aria-label={label}
    bind:value={draft}
    data-ui-id={uiId}
    onkeydown={editKey}
    onblur={commit}
    use:focusOnMount />
{:else}
  <span
    class="scrub"
    class:scrub--disabled={disabled}
    role="spinbutton"
    tabindex={disabled ? -1 : 0}
    aria-label={label}
    aria-valuenow={value}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-disabled={disabled ? 'true' : undefined}
    data-ui-id={uiId}
    onkeydown={key}
    onpointerdown={down}
    onclick={() => {
      if (!dragged) open()
      dragged = false
    }}>{shown}</span>
{/if}

<style>
  .scrub {
    display: inline-block;
    min-width: 4ch;
    padding: 0 var(--spacing-2xs);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: var(--data-md-size);
    /* D57's tabular numeral token has not landed (harvest gap 7). */
    font-variant-numeric: tabular-nums;
    text-align: end;
    cursor: ew-resize;
    user-select: none;
  }
  .scrub:hover {
    background: var(--surface-raised);
  }
  .scrub:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
  .scrub--disabled {
    color: var(--text-secondary);
    cursor: default;
  }
  .scrub__input {
    width: 8ch;
    font: inherit;
    font-size: var(--data-md-size);
    border: var(--size-stroke-hairline) solid var(--border-focus);
    background: var(--surface-base);
    cursor: text;
    user-select: text;
  }
</style>
