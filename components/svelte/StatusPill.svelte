<script>
  import Icon from './Icon.svelte'

  /** @typedef {import('./lib/types.js').StatusTone} StatusTone */

  /**
   * @typedef {Object} Props
   * @property {string} [text] The pill label.
   * @property {StatusTone} [tone] Maps to `--tone-*`. A value outside the seven renders with no tint rather than falling back.
   * @property {string} [icon] Optional leading Phosphor icon name (fill weight).
   */

  /** @type {Props} */
  let { text = '', tone = 'neutral', icon = '' } = $props()
</script>

<span class="pill" data-tone={tone}>
  {#if icon}<Icon name={icon} weight="fill" />{/if}
  {text}
</span>

<style>
  /* Quiet status badge: a tinted background + text, no border. The dot + text
     pattern (ProjectCard) is preferred in dense contexts; this
     badge stays for the chip list in inspectors. */
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border: 0;
    border-radius: var(--radius-sm);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: 600;
    letter-spacing: var(--caption-track);
    background: color-mix(in oklab, currentColor 10%, transparent);
  }

  /* The design system's seven StatusTone values map onto the BrandKit where the
     colour matches (success→normal is green, warning→warning, danger→alarm).
     `info`, `accent` and `skipped` are BrandKit gaps (see
     docs/harvest-khaos-machine-tokens.md #1) and fall back to raw palette until
     Andrew defines them. */
  .pill[data-tone='neutral'] { color: var(--tone-neutral); }
  .pill[data-tone='success'] { color: var(--tone-success); }
  .pill[data-tone='warning'] { color: var(--tone-warning); }
  .pill[data-tone='danger']  { color: var(--tone-danger); }
  .pill[data-tone='info']    { color: var(--tone-info); }
  .pill[data-tone='accent']  { color: var(--tone-accent); }
  .pill[data-tone='skipped'] { color: var(--tone-skipped); }
</style>
