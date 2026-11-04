<script>
  // DateField — a labelled calendar-day input with an error.
  //
  // Adopted, not authored — Ark UI's Field, through FieldFrame, exactly as
  // TextField is, around the browser's own date input. The browser draws the
  // picker, greys out the days outside `min`/`max`, and follows the theme
  // through `color-scheme` (tokens/utilities.css). Ark's DatePicker would draw a
  // calendar of its own and needs `@internationalized/date`, a dependency the
  // kit does not carry, to do what the platform already does.
  //
  // The value is a calendar day, `YYYY-MM-DD`, with no time zone; what the day
  // means is the host's. It is controlled: a day outside the bounds is never
  // reported, because the native picker stops a pointer from choosing one but
  // not a keyboard from typing one.
  //
  // A typed day outside the bounds STAYS in the box and turns the field invalid
  // at once; nothing resets it. Resetting threw keystrokes away: Chromium fires
  // input after every year digit, so typing 2026 reports 0002, 0020 and 0202
  // first, each below any real `min`. Those partial years read invalid for a
  // moment, and reporting resumes the moment the day is back in range.
  //
  // The host never hears of a day it is not sent, so it cannot word the
  // problem: the field supplies its own range message when the host's `error`
  // is empty. A host `error` takes its place, and the field is invalid while
  // either holds.
  import { FieldInput } from '@ark-ui/svelte/field'
  import FieldFrame from './internal/FieldFrame.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The visible label, which is also the input's accessible name.
   * @property {string} [value] The day as `YYYY-MM-DD`, or `''` when empty. Controlled — the consumer owns it.
   * @property {string} [min] The earliest day that can be chosen, as `YYYY-MM-DD`.
   * @property {string} [max] The latest day that can be chosen, as `YYYY-MM-DD`.
   * @property {string} [error] The error message. Non-empty makes the field invalid and is read out as the input's description. While a typed day is outside `min`/`max` and this is empty, the field shows its own range message instead.
   * @property {(value: string) => void} [oninput] Called with `YYYY-MM-DD` on every change, or `''` when the field is cleared. Never called with a day outside `min`/`max`.
   * @property {string} [uiId] The `data-ui-id` (audit §3.14), set on the input.
   */

  /** @type {Props} */
  let {
    label = '',
    value = '',
    min = undefined,
    max = undefined,
    error = '',
    oninput = undefined,
    uiId = undefined,
  } = $props()

  // `YYYY-MM-DD` orders as text, so the bounds compare as strings.
  const outside = (day) => day !== '' && ((min && day < min) || (max && day > max))

  // What the box holds: the host's value until something is typed, and again
  // whenever the host sets a new one.
  let typed = $derived(value)
  const range = $derived(
    !outside(typed) ? ''
      : min && max ? `Choose a day from ${min} to ${max}.`
      : min ? `Choose a day on or after ${min}.`
      : `Choose a day on or before ${max}.`,
  )

  /** @param {Event & { currentTarget: HTMLInputElement }} e */
  function report(e) {
    typed = e.currentTarget.value
    if (!outside(typed)) oninput?.(typed)
  }
</script>

<FieldFrame {label} error={error || range}>
  {#snippet children(describedby)}
    <div class="kfield__box">
      <FieldInput
        class="kfield__text kfield__date"
        type="date"
        {value}
        {min}
        {max}
        aria-describedby={describedby}
        data-ui-id={uiId}
        oninput={report}
      />
    </div>
  {/snippet}
</FieldFrame>

<style>
  /* Desktop density matches TextField. Chromium pads the date input's fields
     wrapper 1px above and below, which made this box 2px taller than
     TextField's (35.5px against 33.5px, measured in the catalog at 1440px;
     zeroing the edit area, the fields or the picker icon changed nothing).
     The class is on an Ark component, so the rule is :global. */
  :global(.kfield__date::-webkit-datetime-edit-fields-wrapper) {
    padding: 0;
  }
</style>
