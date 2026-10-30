<script>
  // The Overview's strip (khaos-app#617): four figures in a row, each a way in. Coverage's
  // verdict, the budget's spend, what needs review, and the next step. Figures, no sentences.
  // Each of the first three is a MetricCard under a stretched button that carries its name (D52);
  // the next step is a real button with its own label.
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
   * @property {{ label: string, icon?: string } | null} [next] The next step; null draws no fourth figure.
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

{#snippet figure(/** @type {string} */ name, /** @type {(() => void) | undefined} */ open, /** @type {import('svelte').ComponentProps<typeof MetricCard>} */ metric)}
  <div class="ui-strip__card">
    <button type="button" class="ui-strip__open" aria-label={name} onclick={() => open?.()}></button>
    <span class="ui-strip__figure" aria-hidden="true"><MetricCard {...metric} /></span>
  </div>
{/snippet}

<div class="ui-strip" data-ui-id="overview.strip">
  {@render figure(
    `Coverage: ${verdict?.text ?? 'Not made'}`,
    oncoverage,
    { value: verdict?.text ?? 'Not made', label: 'Coverage', icon: verdict ? 'circle' : 'circle-dashed', tone: /** @type {any} */ (verdict?.tone ?? 'neutral') },
  )}
  {#if budget}
    {@render figure(
      `Budget: ${budgetText(budget)}`,
      onbudget,
      { value: budgetValue, label: budgetLabel, icon: 'coins', tone: budgetSpent(budget) ? 'warning' : 'neutral' },
    )}
  {/if}
  {@render figure(
    `Needs review: ${review}`,
    onreview,
    { value: review, label: 'Needs review', icon: 'list-checks', tone: review > 0 ? 'warning' : 'neutral' },
  )}
  {#if next}
    <div class="ui-strip__card ui-strip__card--next">
      <span class="ui-strip__next" aria-hidden="true">Next</span>
      <Button icon={next.icon ?? ''} onclick={() => onnext?.()}>{next.label}</Button>
    </div>
  {/if}
</div>

<style>
  .ui-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }
  .ui-strip__card {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    min-width: 0;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
  }
  /* The stretched button takes the whole card's click; the figure under it is drawn only. */
  .ui-strip__open {
    position: absolute;
    inset: 0;
    border: var(--size-stroke-hairline) solid transparent;
    border-radius: inherit;
    background: none;
    cursor: pointer;
  }
  .ui-strip__open:hover {
    border-color: var(--border-default);
  }
  .ui-strip__open:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
  .ui-strip__figure {
    min-width: 0;
    pointer-events: none;
  }
  .ui-strip__next {
    color: var(--text-secondary);
    font-size: var(--body-md-size);
  }
</style>
