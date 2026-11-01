<script>
  // The Overview's strip (khaos-app#617). The next step comes first, as the screen's primary
  // action, when there is one. Then the figures, each a way in: Coverage's verdict, the
  // budget's spend and what needs review. Figures, no sentences, no card chrome: one compact
  // row split by hairlines, each figure a button named for what it opens (D52).
  import Button from './Button.svelte'
  import MetricCard from './MetricCard.svelte'
  import { budgetSpent, budgetText } from './lib/budget.js'
  import { VERDICTS } from './lib/story-overview.js'

  /** @typedef {import('./StatusBar.svelte').StatusBudget} StatusBudget */

  /**
   * @typedef {Object} Props
   * @property {{ verdict: 'recommend' | 'consider' | 'pass' } | null} [coverage] Coverage's verdict; null before coverage is made.
   * @property {StatusBudget | null} [budget] The story budget, as the status bar takes it.
   * @property {number} [review] How many things need review.
   * @property {{ label: string, icon?: string } | null} [next] The next step, drawn first as the primary action; null draws none.
   * @property {() => void} [oncoverage] Opens coverage.
   * @property {() => void} [onbudget] Opens the story's budget, to set or change it.
   * @property {() => void} [onreview] Opens what needs review.
   * @property {() => void} [onnext] Takes the next step.
   */

  /** @type {Props} */
  let {
    coverage = null,
    budget = null,
    review = 0,
    next = null,
    oncoverage = undefined,
    onbudget = undefined,
    onreview = undefined,
    onnext = undefined,
  } = $props()

  const verdict = $derived(coverage ? VERDICTS[coverage.verdict] : null)
  const budgetValue = $derived(budget?.kind === 'reading' ? '' : budgetText(budget))
  const budgetLabel = $derived(budget?.kind === 'none' ? 'Set budget…' : 'Budget')
</script>

{#snippet figure(/** @type {string} */ name, /** @type {(() => void) | undefined} */ open, /** @type {boolean} */ none, /** @type {import('svelte').ComponentProps<typeof MetricCard>} */ metric)}
  <button type="button" class="ui-strip__figure" class:ui-strip__figure--none={none} aria-label={name} onclick={() => open?.()}>
    <span aria-hidden="true"><MetricCard stacked {...metric} /></span>
  </button>
{/snippet}

<div class="ui-strip__host"><div class="ui-strip" data-ui-id="overview.strip">
  {#if next}
    <span class="ui-strip__next"><Button variant="primary" icon={next.icon ?? ''} onclick={() => onnext?.()}>{next.label}</Button></span>
  {/if}
  <div class="ui-strip__figures">
    {@render figure(
      `Coverage: ${verdict?.text ?? 'Not made'}`,
      oncoverage,
      !verdict,
      { value: verdict?.text ?? 'Not made', label: 'Coverage', icon: verdict ? 'circle' : 'circle-dashed', tone: /** @type {any} */ (verdict?.tone ?? 'neutral') },
    )}
    {#if budget}
      {@render figure(
        `Budget: ${budgetText(budget)}`,
        onbudget,
        budget.kind === 'none',
        { value: budgetValue, label: budgetLabel, icon: 'coins', tone: budgetSpent(budget) ? 'warning' : 'neutral' },
      )}
    {/if}
    {@render figure(
      `Needs review: ${review}`,
      onreview,
      review === 0,
      { value: review, label: 'Needs review', icon: 'list-checks', tone: review > 0 ? 'warning' : 'neutral' },
    )}
  </div>
</div></div>

<style>
  .ui-strip__host {
    container-type: inline-size;
  }
  .ui-strip {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  .ui-strip__next :global(.ui-button) {
    white-space: normal;
  }
  .ui-strip__figures {
    display: flex;
    min-width: 0;
  }
  /* Plain figures, split by a hairline. Hover and focus mark the one you are on. */
  .ui-strip__figure {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: var(--spacing-2xs) var(--spacing-sm);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .ui-strip__figure + .ui-strip__figure {
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    box-shadow: inset var(--size-stroke-hairline) 0 0 var(--border-default);
  }
  .ui-strip__figure:hover {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }
  .ui-strip__figure:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
  .ui-strip__figure > span {
    display: flex;
    min-width: 0;
    pointer-events: none;
  }
  /* Nothing there yet ("Not made", nothing to review, no budget) reads as a state, not a figure. */
  .ui-strip__figure--none :global(.metric__value) {
    color: var(--text-secondary);
    font-weight: 400;
  }
  /* Phone width: the next step takes the full width, and the figures share one row under it,
     each a 44pt target. */
  @container (max-width: 599px) {
    .ui-strip {
      flex-direction: column;
      align-items: stretch;
      gap: var(--spacing-xs);
    }
    .ui-strip__next :global(.ui-button) {
      width: 100%;
      min-height: 44px;
      justify-content: center;
    }
    .ui-strip__figure {
      flex: 1 1 auto;
      min-height: 44px;
      padding-inline: var(--spacing-2xs);
    }
  }
</style>
