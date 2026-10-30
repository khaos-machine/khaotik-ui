<script>
  // StatusBar — the window's bottom line (data-layer plan K12; audit §1.15, §3.15, §3.16).
  //
  // The engine's state, the running jobs and the last action's result, in a `status` live
  // region. The result's Undo exists only when the host passes one: a host offers Undo
  // only where the engine can reverse the write (audit §3.17; khaos-manager #688), so the
  // bar never draws an Undo it cannot honour. Clearing a transient result after a few
  // seconds is the host's timing, not the bar's; so is withdrawing it, which the
  // host offers by passing `dismiss` (launcher, 2026-10-14: a notice with no way off).
  //
  // `ondetails` adds a Details button, where the launcher hangs its engine popover (A11).
  //
  // A running job is a progress bar pinned to the right edge (operator, 2026-10-11): its
  // label, done/total, elapsed and time left. The first job is the one shown; the others
  // are a "+N" whose tooltip and accessible name list them. Determinate only with a real
  // count, indeterminate otherwise. The bar sits outside the live region, so a clock that
  // ticks every second is never announced; the live region names the running jobs once.
  // Its Cancel exists only when the host passes one: the host offers it only where the
  // engine can stop that job. Time left is the host's projection — the bar formats it
  // (`lib/duration.js`, the card's formatter) and never computes one.
  import { budgetSpent, budgetText } from './lib/budget.js'
  import { formatElapsed, formatRemaining } from './lib/duration.js'
  /**
   * @typedef {Object} StatusEngine
   * @property {'ready' | 'starting' | 'offline' | string} state Drives the dot's tone.
   * @property {string} label What the bar says about the engine, in the host's words.
   */

  /**
   * @typedef {Object} StatusJob
   * @property {string} id
   * @property {string} label
   * @property {{ readonly completed: number, readonly total: number }} [progress] Real counts only. Omit when the engine has not stated them, and the bar is indeterminate.
   * @property {number} [elapsedMs] How long the job has run.
   * @property {number} [remainingMs] The host's projection. Omit until there is one.
   * @property {() => void} [cancel] Present only when the host can stop the job; adds a Cancel button.
   */

  /**
   * @typedef {Object} StatusResult
   * @property {string} text What the last action did.
   * @property {'info' | 'error'} [tone]
   * @property {() => void} [undo] Present only when the engine can reverse the write.
   * @property {() => void} [dismiss] Present when the host can withdraw the result; adds a Dismiss button.
   */

  /**
   * @typedef {{ kind: 'reading' } | { kind: 'none' } | { kind: 'failed', message: string } | { kind: 'loaded', usd: string, spentUsd: string, remainingUsd: string }} StatusBudget The story budget as khaosd sends it (`GET /api/v1/projects/budget`): one dollar limit, what is spent and what is left.
   */

  /**
   * @typedef {Object} Props
   * @property {StatusEngine | null} [engine] The engine's state and what the bar says about it. None renders no engine item.
   * @property {readonly StatusJob[]} [jobs] Running jobs, the one to show first. None renders no bar.
   * @property {StatusResult | null} [result] The last action's result.
   * @property {() => void} [ondetails] Adds a Details button.
   * @property {StatusBudget | null} [budget] The story budget. None draws no budget item.
   * @property {() => void} [onchangebudget] Opens the story's budget to set or change it.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { engine = null, jobs = [], result = null, ondetails = undefined, budget = null, onchangebudget = undefined, uiId = 'status' } = $props()

  /** @param {StatusJob['progress']} p */
  const validCount = (p) =>
    p && Number.isInteger(p.completed) && Number.isInteger(p.total) && p.total > 0 && p.completed >= 0 && p.completed <= p.total
      ? p
      : null

  /** @param {StatusJob} job */
  const described = (job) => {
    const count = validCount(job.progress)
    return count ? `${job.label}, ${count.completed} of ${count.total}` : job.label
  }

  const active = $derived(jobs[0] ?? null)
  const others = $derived(jobs.slice(1))
  const count = $derived(active ? validCount(active.progress) : null)
  const elapsed = $derived(active ? formatElapsed(active.elapsedMs ?? NaN) : '')
  const remaining = $derived.by(() => {
    const text = active ? formatRemaining(active.remainingMs ?? NaN) : ''
    return text ? `${text} left` : count ? 'estimating time left' : ''
  })
  const valueText = $derived(
    count ? `${count.completed} of ${count.total}` + (remaining ? `, ${remaining}` : '') : remaining || undefined,
  )

  // The story budget: one dollar limit (K, 2026-10-24: "one fucking number ($USD) as MAX spend").
  // The item reads "$1.23 of $5.00" and opens the story's budget. It takes the warning tone when
  // the engine says nothing is left; the bar doesn't compare the two amounts itself.
  const budgetLine = $derived(budgetText(budget))
  const exhausted = $derived(budgetSpent(budget))
</script>

<footer class="status" data-ui-id={uiId}>
  <div class="status__live" role="status">
    {#if engine}
      <span class="status__engine" data-state={engine.state}>
        <span class="status__dot" aria-hidden="true"></span>{engine.label}
      </span>
    {/if}
    {#if jobs.length}
      <span class="visually-hidden">Running: {jobs.map((job) => job.label).join(', ')}</span>
    {/if}
    {#if result}
      <span class="status__result" class:status__result--error={result.tone === 'error'}>{result.text}</span>
    {/if}
  </div>
  {#if result?.undo}
    <button type="button" class="status__button" data-ui-id="{uiId}.undo" onclick={() => result?.undo?.()}>Undo</button>
  {/if}
  {#if result?.dismiss}
    <button type="button" class="status__button" data-ui-id="{uiId}.dismiss" onclick={() => result?.dismiss?.()}>Dismiss</button>
  {/if}
  {#if ondetails}
    <button type="button" class="status__button" data-ui-id="{uiId}.details" onclick={() => ondetails?.()}>Details</button>
  {/if}
  {#if budget}
    <button
      type="button"
      class="status__budget"
      data-ui-id="{uiId}.budget"
      aria-label="Story budget: {budgetLine}"
      data-tone={exhausted ? 'warning' : undefined}
      onclick={() => onchangebudget?.()}>{budgetLine}</button>
  {/if}
  {#if active}
    <div class="status__job" data-ui-id="{uiId}.job">
      <span class="status__job-label">{active.label}</span>
      {#if others.length}
        <span
          class="status__more"
          title={others.map(described).join('\n')}
          aria-label="{others.length} more running: {others.map(described).join('; ')}">+{others.length}</span>
      {/if}
      <div
        class="status__bar"
        role="progressbar"
        aria-label={active.label}
        aria-valuemin={count ? 0 : undefined}
        aria-valuemax={count?.total}
        aria-valuenow={count?.completed}
        aria-valuetext={valueText}
        data-indeterminate={count ? undefined : 'true'}>
        <div class="status__fill" style:width={count ? `${(count.completed / count.total) * 100}%` : undefined}></div>
      </div>
      {#if count}<span class="status__count">{count.completed}/{count.total}</span>{/if}
      {#if elapsed}<span class="status__count">{elapsed}</span>{/if}
      {#if remaining}<span>{remaining}</span>{/if}
      {#if active.cancel}
        <button type="button" class="status__button" data-ui-id="{uiId}.cancel" aria-label="Cancel {active.label}" onclick={() => active.cancel?.()}>Cancel</button>
      {/if}
    </div>
  {/if}
</footer>

<style>
  .status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    /* 24px: harvest gap 9 (`size.row`), a literal until Andrew decides it. */
    height: 24px;
    padding: 0 var(--spacing-sm);
    border-top: var(--size-stroke-hairline) solid var(--border-default);
    background: var(--surface-base);
    color: var(--text-secondary);
    font-size: var(--caption-size);
    flex: none;
    min-width: 0;
  }
  .status__budget {
    flex: none;
    padding: 0 var(--spacing-xs);
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-secondary);
    font: inherit;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    cursor: default;
  }
  .status__budget:hover {
    color: var(--text-primary);
  }
  .status__budget:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
  .status__budget[data-tone='warning'] {
    color: var(--tone-warning);
  }
  .status__live {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
  }
  .status__engine {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
  }
  .status__dot {
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--text-secondary);
  }
  .status__engine[data-state='ready'] .status__dot {
    background: var(--tone-success);
  }
  .status__engine[data-state='starting'] .status__dot {
    background: var(--tone-warning);
  }
  .status__engine[data-state='offline'] .status__dot {
    background: var(--tone-danger);
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .status__job {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex: none;
    margin-left: auto;
    white-space: nowrap;
  }
  .status__job-label {
    color: var(--text-primary);
  }
  .status__more {
    color: var(--text-secondary);
  }
  .status__count {
    font-variant-numeric: tabular-nums;
  }
  .status__bar {
    position: relative;
    width: 120px;
    height: 4px;
    overflow: hidden;
    border-radius: var(--radius-full);
    background: var(--border-default);
  }
  .status__fill {
    height: 100%;
    border-radius: inherit;
    background: var(--tone-warning);
    transition: width 200ms ease-out;
  }
  .status__bar[data-indeterminate] .status__fill {
    width: 30%;
    animation: status-indeterminate 1.4s ease-in-out infinite;
  }
  @keyframes status-indeterminate {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(340%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .status__fill {
      transition: none;
    }
    .status__bar[data-indeterminate] .status__fill {
      width: 100%;
      opacity: 0.4;
      animation: none;
    }
  }
  .status__result {
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status__result--error {
    color: var(--tone-danger);
  }
  .status__button {
    background: none;
    border: 0;
    padding: 0 var(--spacing-2xs);
    color: var(--text-primary);
    font: inherit;
    text-decoration: underline;
    cursor: default;
  }
  .status__button:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
</style>
