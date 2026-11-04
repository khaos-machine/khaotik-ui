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
  // A refusal is judged when the entry is COMMITTED — blur or Enter — never on
  // a keystroke. Chromium fires input after every year digit, so typing 2026
  // reports 0002, 0020 and 0202 first, each a real day before any `min`;
  // judging those flashed the field invalid mid-word. A refused day STAYS in
  // the box and nothing resets it, which also kept a reset from throwing the
  // keystrokes away.
  //
  // A valid complete day is reported through `oninput` the moment it is typed,
  // with no commit needed. The field writes no message of its own: on commit
  // it tells the host what was typed and why it was refused (`oninvalid`), and
  // the host words it through `error`, the only text read out. The field's own
  // invalid state belongs to the exact text it was raised for, so any edit —
  // or a new `value` from the host — clears it.
  import { FieldContext } from '@ark-ui/svelte/field'
  import FieldFrame from './internal/FieldFrame.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The visible label, which is also the input's accessible name.
   * @property {string} [value] The day as `YYYY-MM-DD`, or `''` when empty. Controlled — the consumer owns it.
   * @property {string} [min] The earliest day that can be chosen, as `YYYY-MM-DD`.
   * @property {string} [max] The latest day that can be chosen, as `YYYY-MM-DD`.
   * @property {string} [error] The error message, worded by the host. Non-empty makes the field invalid and is read out as the input's description. It is the only text the field reads out: the field never writes a message of its own.
   * @property {(value: string) => void} [oninput] Called with `YYYY-MM-DD` as soon as a valid day is typed or picked, with no commit needed, or with `''` when the field is cleared. Never called with a value that is not a valid choice. When a valid day replaces a refused one, this is the call that says so: the field's own invalid state clears, and the host clears its `error`.
   * @property {(detail: { typed: string, reason: 'before_min' | 'after_max' | 'unreadable' }) => void} [oninvalid] Called when the entry is **committed** — on blur or Enter, never on a keystroke — holding a value that is not a valid choice. The field turns invalid and keeps the text; nothing resets it. `typed` is the value as the input reported it. `reason` is `before_min` (a day earlier than `min`), `after_max` (later than `max`), or `unreadable` (non-empty, but not a real calendar day in `YYYY-MM-DD`: `2026-02-30`, `2026-10`, or the raw text a browser that draws the date input as a text box reports). A year typed digit by digit, which Chromium reports as `0002-…`, `0020-…`, `0202-…`, fires nothing and leaves the field valid until it is committed. Set `error` from it, worded for your reader; the field writes no message of its own.
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
    oninvalid = undefined,
    uiId = undefined,
  } = $props()

  // A real calendar day: the shape, and a date that survives a round trip
  // (2026-02-30 does not).
  const readable = (day) =>
    /^\d{4}-\d{2}-\d{2}$/.test(day) && new Date(`${day}T00:00:00Z`).toISOString().startsWith(day)

  /** Why `day` is not a valid choice, or `null` when it is. `YYYY-MM-DD` orders as text. */
  const refusal = (day) =>
    day === '' ? null
      : !readable(day) ? 'unreadable'
      : min && day < min ? 'before_min'
      : max && day > max ? 'after_max'
      : null

  // What the box holds: the host's value until something is typed, and again
  // whenever the host sets a new one.
  let typed = $derived(value)
  // The text a commit refused. Invalid only while the box still holds exactly
  // that text: any edit, or a new `value`, clears it.
  /** @type {string | null} */
  let flagged = $state(null)
  const refused = $derived(flagged !== null && flagged === typed)

  // The box is written by hand, and only with a value the host set on its own.
  // Chromium reports '' the moment a segment is emptied mid-edit, while the
  // other segments still hold their digits. Writing that '' back into the
  // input wipes the segments, and every later key lands in an empty box.
  // Ark's FieldInput did it on its own: it keeps a copy of the value, sets it
  // from each input event and spreads it back onto the element, with or
  // without a host echo. So the input here is a plain <input> wearing the
  // Field's props (FieldContext), and the box is written only with a host
  // value other than the one just reported.
  /** @type {string | undefined} */
  let reported
  // No "is the box already showing it" check: mid-edit Chromium reads '' while
  // the segments hold digits, so that comparison cannot protect the edit. The
  // echo skip is the guard.
  /** Re-runs whenever `value` changes. @param {HTMLInputElement} input */
  const show = (input) => {
    if (value === reported) return
    reported = undefined
    input.value = value
  }

  /** @param {Event & { currentTarget: HTMLInputElement }} e */
  function report(e) {
    typed = e.currentTarget.value
    if (refusal(typed) !== null) return
    reported = typed
    oninput?.(typed)
  }

  function commit() {
    const reason = refusal(typed)
    if (!reason) {
      flagged = null
      return
    }
    // Enter then blur commits the same text twice; the host hears it once.
    if (flagged === typed) return
    flagged = typed
    oninvalid?.({ typed, reason })
  }

  /** @param {KeyboardEvent} e */
  const onkeydown = (e) => e.key === 'Enter' && commit()
</script>

<FieldFrame {label} {error} invalid={refused || error !== ''}>
  {#snippet children(describedby)}
    <div class="kfield__box">
      <FieldContext>
        {#snippet render(field)}
          <input
            {...field().getInputProps()}
            class="kfield__text kfield__date"
            type="date"
            {@attach show}
            {min}
            {max}
            aria-describedby={describedby}
            data-ui-id={uiId}
            oninput={report}
            onblur={commit}
            {onkeydown}
          />
        {/snippet}
      </FieldContext>
    </div>
  {/snippet}
</FieldFrame>

<style>
  /* Desktop density matches TextField. Chromium pads the date input's fields
     wrapper 1px above and below, which made this box 2px taller than
     TextField's (35.5px against 33.5px, measured in the catalog at 1440px;
     zeroing the edit area, the fields or the picker icon changed nothing).
     :global because the class also carries FieldFrame's shared .kfield__text
     rules, and a pseudo-element rule stays with them. */
  :global(.kfield__date::-webkit-datetime-edit-fields-wrapper) {
    padding: 0;
  }
</style>
