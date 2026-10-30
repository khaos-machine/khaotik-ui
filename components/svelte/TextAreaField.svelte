<script>
  // TextAreaField — a labelled multiline input with a hint and an error.
  //
  // Adopted, not authored — Ark UI's Field textarea, through FieldFrame, with
  // Ark's `autoresize` growing it to fit its text. Enter opens a new line;
  // Cmd+Enter (Ctrl+Enter off Apple) calls `onsubmit`, the same chord
  // ScreenplayEditor uses.
  import { FieldTextarea } from '@ark-ui/svelte/field'
  import FieldFrame from './internal/FieldFrame.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [label] The visible label, which is also the textarea's accessible name.
   * @property {string} [name] The form field name.
   * @property {string} [value] The current text. Controlled — the consumer owns it.
   * @property {number} [rows] The height in lines before the text grows it.
   * @property {boolean} [required] Marks the field required for the browser and screen readers.
   * @property {string} [hint] Help text under the textarea, linked by `aria-describedby`.
   * @property {string} [error] The error message. Non-empty makes the field invalid.
   * @property {(value: string) => void} [oninput] Called with the new text on every input.
   * @property {(value: string) => void} [onsubmit] Called with the text on Cmd+Enter (Ctrl+Enter off Apple).
   */

  /** @type {Props} */
  let {
    label = '',
    name = undefined,
    value = '',
    rows = 3,
    required = false,
    hint = '',
    error = '',
    oninput = undefined,
    onsubmit = undefined,
  } = $props()
</script>

<FieldFrame {label} {hint} {error} {required}>
  {#snippet children(describedby)}
    <div class="kfield__box">
      <FieldTextarea
        class="kfield__text"
        autoresize
        {name}
        {value}
        {rows}
        aria-describedby={describedby}
        oninput={(e) => oninput?.(e.currentTarget.value)}
        onkeydown={(e) => {
          if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey) || e.altKey) return
          e.preventDefault()
          onsubmit?.(e.currentTarget.value)
        }}
      />
    </div>
  {/snippet}
</FieldFrame>

<style>
  :global(textarea.kfield__text) {
    resize: none;
    line-height: var(--body-md-line);
  }
</style>
