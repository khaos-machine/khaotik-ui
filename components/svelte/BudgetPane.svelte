<script>
  // Project Settings › Budget: one story's spending limit in dollars (K, 2026-10-24: "one fucking
  // number ($USD) as MAX spend. THAT'S IT! user can increase or reset. no count caps!!!"). The
  // writer sets the limit and can reset what is spent; the engine keeps the history.
  //
  // The field holds the limit the host passes; an edit is kept against that budget, and a new
  // budget from the host (the saved answer) replaces it. Saving and resetting ASK the host through
  // `onsave` and `onreset`; the host passes the answers back. A story with no budget offers the
  // engine's suggested amounts (K: "simple budgets like $10 or $25"); one fills the field. No
  // explanatory sentences: the pane is its controls (K: "this isn't a fucking website").
  import Button from './Button.svelte'
  import OutcomeBanner from './OutcomeBanner.svelte'
  import { dollars } from './lib/budget.js'

  /**
   * @typedef {{ kind: 'reading' } | { kind: 'failed', message: string } | { kind: 'none', suggested?: { usd: readonly string[] } } | { kind: 'loaded', usd: string, spentUsd: string, remainingUsd: string }} PaneBudget
   */

  /**
   * @typedef {{ kind: 'idle' } | { kind: 'saving' } | { kind: 'invalid', message: string } | { kind: 'failed', message: string }} PaneSave
   */

  /**
   * @typedef {{ kind: 'idle' } | { kind: 'resetting' } | { kind: 'failed', message: string }} PaneReset
   */

  /**
   * @typedef {Object} Props
   * @property {PaneBudget} [budget] The story's budget as khaosd sends it.
   * @property {PaneSave} [save] The last save: `invalid` is the engine's `400 INVALID_BUDGET`.
   * @property {PaneReset} [reset] The last reset of what is spent.
   * @property {(usd: string) => void} [onsave] Asked to save the spending limit, a decimal string.
   * @property {() => void} [onreset] Asked to reset what is spent to $0.00; the limit stays.
   */

  /** @type {Props} */
  let { budget = { kind: 'reading' }, save = { kind: 'idle' }, reset = { kind: 'idle' }, onsave = undefined, onreset = undefined } = $props()

  const id = $props.id()
  const AMOUNT = /^\d+(\.\d+)?$/

  const loaded = $derived(budget.kind === 'loaded' ? budget : null)
  const suggested = $derived(budget.kind === 'none' ? budget.suggested : undefined)
  const base = $derived(loaded?.usd ?? '')

  /** The edit, kept only against the budget it was made on. Raw, so `against` stays that object. */
  let edit = $state.raw(/** @type {{ against: PaneBudget | null, value: string }} */ ({ against: null, value: '' }))
  const touched = $derived(edit.against === budget)
  const value = $derived(touched ? edit.value : base)
  const problem = $derived(value.trim() === '' ? 'Enter a spending limit, like 2.50.' : AMOUNT.test(value.trim()) ? '' : 'Enter an amount like 2.50.')
  const error = $derived(touched ? problem : '')
  const canSave = $derived(value !== base && !problem && save.kind !== 'saving')
  const busy = $derived(save.kind === 'saving' || reset.kind === 'resetting')

  /** How much of the limit is spent, 0 to 1, against the field while it holds an amount. */
  const used = $derived.by(() => {
    if (!loaded) return 0
    const spent = Number(loaded.spentUsd)
    const limit = Number(problem ? loaded.usd : value)
    if (!(limit > 0)) return spent > 0 ? 1 : 0
    return Math.min(1, spent / limit)
  })
  /** The engine says nothing is left; the pane doesn't compare the amounts to decide it. */
  const exhausted = $derived(!!loaded && Number(loaded.remainingUsd) === 0)

  function submit() {
    if (canSave) onsave?.(value.trim())
  }
</script>

<div class="ui-budget-pane" data-ui-id="settings.budget">
  {#if budget.kind === 'reading'}
    <span class="ui-budget-pane__caption" role="status">Reading…</span>
  {:else if budget.kind === 'failed'}
    <OutcomeBanner tone="error" title="Khaos couldn't read this story's budget." detail={budget.message} />
  {:else}
    <form class="ui-budget-pane__group" onsubmit={(e) => (e.preventDefault(), submit())}>
      <div class="ui-budget-pane__row">
        <label class="ui-budget-pane__label" for="{id}-usd">Spending limit</label>
        <div class="ui-budget-pane__control">
          <span class="ui-budget-pane__unit" aria-hidden="true">$</span>
          <input
            id="{id}-usd"
            class="ui-budget-pane__input"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            placeholder="10.00"
            aria-label="Spending limit (USD)"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            {value}
            oninput={(e) => (edit = { against: budget, value: e.currentTarget.value })} />
        </div>
        <Button variant="primary" disabled={!canSave} onclick={submit}>Save</Button>
        {#if error}<span class="ui-budget-pane__error" id="{id}-error">{error}</span>{/if}
      </div>
      {#if suggested?.usd.length}
        <div class="ui-budget-pane__row">
          <span class="ui-budget-pane__label" id="{id}-suggested">Suggested</span>
          <div class="ui-budget-pane__choices" role="group" aria-labelledby="{id}-suggested">
            {#each suggested.usd as usd (usd)}
              <Button variant="secondary" onclick={() => (edit = { against: budget, value: Number(usd).toFixed(2) })}>{dollars(usd)}</Button>
            {/each}
          </div>
        </div>
      {/if}
      {#if loaded}
        <div class="ui-budget-pane__row">
          <span class="ui-budget-pane__label">Spent</span>
          <div class="ui-budget-pane__usage">
            <span class="ui-budget-pane__track" aria-hidden="true">
              <span class="ui-budget-pane__fill" data-spent={exhausted ? 'all' : undefined} style:transform="scaleX({used})"></span>
            </span>
            <span class="ui-budget-pane__amount" data-tone={exhausted ? 'warning' : undefined}>{dollars(loaded.spentUsd)} of {dollars(loaded.usd)}</span>
          </div>
          <Button variant="secondary" disabled={busy || Number(loaded.spentUsd) === 0} onclick={() => onreset?.()}>Reset spend</Button>
        </div>
      {/if}
    </form>
    {#if busy}
      <span class="ui-budget-pane__caption" role="status">{save.kind === 'saving' ? 'Saving…' : 'Resetting…'}</span>
    {/if}
    {#if save.kind === 'invalid'}
      <OutcomeBanner tone="error" title="Khaos didn't accept this budget." detail={save.message} />
    {:else if save.kind === 'failed'}
      <OutcomeBanner tone="error" title="Khaos couldn't save this story's budget." detail={save.message} />
    {/if}
    {#if reset.kind === 'failed'}
      <OutcomeBanner tone="error" title="Khaos couldn't reset this story's spend." detail={reset.message} />
    {/if}
  {/if}
</div>

<style>
  /* A grouped preferences form: two rows in one inset group, each a label, a value and an action.
     Figures are tabular so the amounts align. */
  .ui-budget-pane {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-width: 560px;
  }

  .ui-budget-pane__group {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr) max-content;
    column-gap: var(--spacing-md);
    margin: 0;
    padding: var(--spacing-2xs) var(--spacing-md);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
  }

  .ui-budget-pane__row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    align-items: center;
    row-gap: var(--spacing-2xs);
    padding-block: var(--spacing-sm);
  }

  .ui-budget-pane__row + .ui-budget-pane__row {
    border-top: var(--size-stroke-hairline) solid var(--border-hairline);
  }

  .ui-budget-pane__label {
    color: var(--text-primary);
    font-size: var(--body-md-size);
  }

  .ui-budget-pane__control {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 8rem;
  }

  /* The dollar sign sits inside the field, ahead of the amount. */
  .ui-budget-pane__unit {
    position: absolute;
    inset-inline-start: var(--spacing-xs);
    color: var(--text-secondary);
    pointer-events: none;
  }

  .ui-budget-pane__input {
    inline-size: 100%;
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: var(--size-stroke-hairline) solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--body-md-size);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .ui-budget-pane__input::placeholder {
    color: var(--text-secondary);
  }

  .ui-budget-pane__input:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: 1px;
  }

  .ui-budget-pane__input[aria-invalid='true'] {
    border-color: var(--tone-danger);
  }

  .ui-budget-pane__choices {
    grid-column: 2 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .ui-budget-pane__usage {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-width: 0;
  }

  .ui-budget-pane__track {
    flex: 0 0 6rem;
    block-size: 4px;
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--text-primary) 12%, transparent);
    overflow: hidden;
  }

  .ui-budget-pane__fill {
    display: block;
    block-size: 100%;
    background: var(--tone-accent);
    transform-origin: left;
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ui-budget-pane__fill[data-spent='all'] {
    background: var(--tone-warning);
  }

  .ui-budget-pane__amount {
    color: var(--text-secondary);
    font-size: var(--body-md-size);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .ui-budget-pane__amount[data-tone='warning'] {
    color: var(--tone-warning);
  }

  .ui-budget-pane__error {
    grid-column: 2 / -1;
    color: var(--tone-danger);
    font-size: var(--caption-size);
  }

  .ui-budget-pane__caption {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-budget-pane__fill {
      transition: none;
    }
  }
</style>
