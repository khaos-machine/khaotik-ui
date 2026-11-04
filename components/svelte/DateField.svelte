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
  // means is the host's. It is controlled: a typed day outside the bounds is
  // refused — not reported, and put back to `value` — because the native picker
  // stops a pointer from choosing one but not a keyboard from typing one.
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
    if (outside(day)) {
      e.currentTarget.value = value
      return
    }
    oninput?.(day)
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
      />
    </div>
  {/snippet}
</FieldFrame>
