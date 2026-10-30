<script>
  // A story's own settings window (khaos.machine stage 3 display plan A6). K, 2026-10-24:
  // "nothing project level should go into app settings", so a story's settings are their own
  // window, one per story, framed like SettingsWindow. Budget is its one pane; the host reads,
  // saves and resets the budget and passes the answers back, as with BudgetPane. The window's
  // title names the story, so nothing here repeats it.
  import BudgetPane from './BudgetPane.svelte'
  import Settings from './Settings.svelte'

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'reading' } | { kind: 'failed', message: string } | { kind: 'none', suggested?: { usd: readonly string[] } } | { kind: 'loaded', usd: string, spentUsd: string, remainingUsd: string }} [budget] The story's budget as khaosd sends it.
   * @property {{ kind: 'idle' } | { kind: 'saving' } | { kind: 'invalid', message: string } | { kind: 'failed', message: string }} [save] The last save: `invalid` is the engine's `400 INVALID_BUDGET`.
   * @property {{ kind: 'idle' } | { kind: 'resetting' } | { kind: 'failed', message: string }} [reset] The last reset of what is spent.
   * @property {(usd: string) => void} [onsave] Asked to save the spending limit.
   * @property {() => void} [onreset] Asked to reset what is spent; the limit stays.
   */

  /** @type {Props} */
  let { budget = { kind: 'reading' }, save = { kind: 'idle' }, reset = { kind: 'idle' }, onsave = undefined, onreset = undefined } = $props()

  const PANES = [{ id: 'budget', label: 'Budget', icon: 'wallet' }]
</script>

<main>
  <Settings categories={PANES} selected="budget">
    <BudgetPane {budget} {save} {reset} {onsave} {onreset} />
  </Settings>
</main>

<style>
  /* SettingsWindow's frame. */
  main {
    height: 100vh;
    background: var(--surface-base, transparent);
    color: var(--text-primary);
  }
</style>
