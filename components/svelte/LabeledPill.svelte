<script>
  import StatusPill from './StatusPill.svelte'

  // Swift LabeledPill: an eyebrow over a StatusPill — compact labeled facts
  // (mood, type, time…).
  /** @typedef {import('./lib/types.js').StatusTone} StatusTone */

  /**
   * @typedef {Object} Props
   * @property {string} [label] Eyebrow caption above the pill (the `.eyebrow` utility).
   * @property {string} [value] StatusPill text.
   * @property {StatusTone} [tone] StatusPill tone; maps to `--tone-*`.
   */

  /** @type {Props} */
  let { label = '', value = '', tone = 'neutral' } = $props()
</script>

<div class="labeled-pill">
  <span class="eyebrow">{label}</span>
  <StatusPill text={value} {tone} />
</div>

<style>
  .labeled-pill {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }
</style>
