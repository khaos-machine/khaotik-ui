<script>
  import Icon from './Icon.svelte'

  // A dense metric readout (value + label inline), not a padded tile.
  /** @typedef {import('./lib/types.js').StatusTone} StatusTone */

  /**
   * @typedef {Object} Props
   * @property {string|number} [value] The metric readout; tabular numerals.
   * @property {string} [label] Inline label; also the accessible name of the group.
   * @property {string} [icon] Optional leading Phosphor icon (fill weight).
   * @property {StatusTone} [tone] Tints the leading icon (`--tone-*`).
   * @property {string|number} [sub] Optional trailing sub-value.
   */

  /** @type {Props} */
  let { value = '', label = '', icon = '', tone = 'neutral', sub = '' } = $props()
</script>

<span class="metric" data-tone={tone} role="group" aria-label={label}>
  {#if icon}<Icon name={icon} weight="fill" />{/if}
  <span class="metric__value">{value}</span>
  <span class="metric__label">{label}</span>
  {#if sub}<span class="metric__sub">{sub}</span>{/if}
</span>

<style>
  .metric {
    display: inline-flex;
    align-items: baseline;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  .metric :global(.ph) {
    font-size: var(--caption-size);
    color: var(--tone-neutral);
  }
  /* All seven StatusTones (AGENTS.md). `neutral` is the base rule above, so it
     needs no override; `skipped` was missing entirely, which meant
     tone="skipped" was accepted and silently rendered as neutral grey — the
     caller got no signal that the tone had been dropped. StatusPill
     implements all seven; this was the odd one out. */
  .metric[data-tone='success'] :global(.ph) { color: var(--tone-success); }
  .metric[data-tone='warning'] :global(.ph) { color: var(--tone-warning); }
  .metric[data-tone='danger']  :global(.ph) { color: var(--tone-danger); }
  .metric[data-tone='info']    :global(.ph) { color: var(--tone-info); }
  .metric[data-tone='accent']  :global(.ph) { color: var(--tone-accent); }
  .metric[data-tone='skipped'] :global(.ph) { color: var(--tone-skipped); }

  .metric__value {
    font-size: var(--body-md-size);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }

  .metric__label {
    font-size: var(--caption-size);
    color: var(--text-tertiary);
  }

  .metric__sub {
    font-size: var(--caption-size);
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }
</style>
