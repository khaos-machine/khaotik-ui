<script>
  // RenderMark — whether a thing is rendered (data-layer plan K7; audit §3.13, §4.1).
  //
  // ready, stale or missing, as a glyph and a label (never colour alone, audit §3.16).
  // With no state, or one this kit does not know, the mark is ABSENT: the engine not
  // saying is not the engine saying there is nothing, so absent is never drawn as
  // "missing" (audit §3.13).
  //
  // `compact` hides the label visually for a table cell and keeps it for assistive
  // technology and as the tooltip.
  import Icon from './Icon.svelte'

  /** @typedef {'ready' | 'stale' | 'missing'} RenderState */

  /**
   * @typedef {Object} Props
   * @property {'ready' | 'stale' | 'missing' | null} [state] The engine's state. Absent renders nothing, and so does a state this kit does not know.
   * @property {string} [label] The host's wording for this state, in place of the default.
   * @property {boolean} [compact] Glyph only on screen; the label stays for assistive technology and as the tooltip.
   * @property {string} [uiId] The `data-ui-id` (audit §3.14).
   */

  /** @type {Props} */
  let { state = null, label = '', compact = false, uiId = undefined } = $props()

  const MARKS = {
    ready: { icon: 'check-circle', text: 'Ready' },
    stale: { icon: 'clock-counter-clockwise', text: 'Stale' },
    missing: { icon: 'circle-dashed', text: 'Missing' },
  }

  const mark = $derived(state && Object.hasOwn(MARKS, state) ? MARKS[/** @type {RenderState} */ (state)] : null)
  const text = $derived(label || mark?.text || '')
</script>

{#if mark}
  <span class="mark" data-state={state} title={compact ? text : undefined} data-ui-id={uiId}>
    <span class="mark__glyph" aria-hidden="true"><Icon name={mark.icon} weight={state === 'ready' ? 'fill' : 'regular'} /></span>
    <span class="mark__label" class:mark__label--hidden={compact}>{text}</span>
  </span>
{/if}

<style>
  .mark {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    font-size: var(--data-md-size);
    white-space: nowrap;
  }
  .mark[data-state='ready'] .mark__glyph {
    color: var(--tone-success);
  }
  .mark[data-state='stale'] .mark__glyph {
    color: var(--tone-warning);
  }
  .mark[data-state='missing'] .mark__glyph {
    color: var(--text-secondary);
  }
  .mark__label--hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
