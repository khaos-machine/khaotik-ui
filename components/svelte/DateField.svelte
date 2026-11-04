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
  // The box is NOT put back while the field is being typed in. Chromium fires
  // input after every year digit, so typing 2026 reports 0002, 0020 and 0202
  // first, each below any real `min`; resetting on those threw the keystrokes
  // away and no day could be typed at all. A refused day stays in the box,
  // unreported, until the field is left, and then goes back to `value`.
  import { FieldInput } from '@ark-ui/svelte/field'
  import FieldFrame from './internal/FieldFrame.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The visible label, which is also the input's accessible name.
   * @property {string} [value] The day as `YYYY-MM-DD`, or `''` when empty. Controlled — the consumer owns it.
   * @property {string} [min] The earliest day that can be chosen, as `YYYY-MM-DD`.
   * @property {string} [max] The latest day that can be chosen, as `YYYY-MM-DD`.
   * @property {string} [error] The error message. Non-empty makes the field invalid and is read out as the input's description.
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

  /** @param {Event & { currentTarget: HTMLInputElement }} e */
  function report(e) {
    const day = e.currentTarget.value
    if (!outside(day)) oninput?.(day)
  }

  /** @param {FocusEvent & { currentTarget: HTMLInputElement }} e */
  function settle(e) {
    if (outside(e.currentTarget.value)) e.currentTarget.value = value
  }
</script>

<FieldFrame {label} {error}>
  {#snippet children(describedby)}
    <div class="kfield__box">
      <FieldInput
        class="kfield__text"
        type="date"
        {value}
        {min}
        {max}
        aria-describedby={describedby}
        data-ui-id={uiId}
        oninput={report}
        onblur={settle}
      />
    </div>
  {/snippet}
</FieldFrame>
