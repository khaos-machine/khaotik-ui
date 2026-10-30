<script>
  // The splash: the brand mark, and along the foot one line per system check as it runs. It is
  // the whole of the first window Khaos App opens, and what its launcher shows where there is no
  // window manager to hide it behind. Moved from Khaos App (catalog app-coverage plan, T9).
  import KhaosLogo from './KhaosLogo.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [appVersion] The app's version, under the name.
   * @property {readonly { name: string, state: 'pending' | 'ok' | 'failed' | 'skipped' | 'none', detail: string }[]} [checks] The startup checks, in the order they run.
   */

  /** @type {Props} */
  let { appVersion = '', checks = [] } = $props()

  // The state column, in the fixed-width words a boot log uses.
  const MARK = { pending: '  ..  ', ok: '  OK  ', failed: 'FAILED', skipped: ' SKIP ', none: '  --  ' }
</script>

<div class="ui-splash">
  <div class="ui-splash__brand">
    <span class="ui-splash__mark"><KhaosLogo size={88} /></span>
    <h1 class="ui-splash__name">Khaos Machine</h1>
    <p class="ui-splash__version">{appVersion}</p>
  </div>
  <ol class="ui-splash__activity" aria-live="polite" aria-label="Startup checks">
    {#each checks as check (check.name)}
      <li class="ui-splash__check" data-state={check.state}>
        <span class="ui-splash__state">{MARK[check.state]}</span>
        <span class="ui-splash__check-name">{check.name}</span>
        <span class="ui-splash__detail">{check.detail}</span>
      </li>
    {/each}
  </ol>
</div>

<style>
  /* The mark in the middle of whatever window holds it, the activity view pinned to its foot. */
  .ui-splash {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--surface-base);
    color: var(--text-primary);
  }

  .ui-splash__brand {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .ui-splash__mark {
    color: var(--text-brand);
  }

  .ui-splash__name {
    margin: var(--spacing-sm) 0 0;
    font-size: var(--heading-md-size);
    font-weight: 600;
  }

  .ui-splash__version {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  .ui-splash__activity {
    margin: 0;
    padding: var(--spacing-sm) var(--spacing-md);
    list-style: none;
    border-top: 1px solid var(--border-hairline);
    background: var(--surface-raised);
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .ui-splash__check {
    display: grid;
    grid-template-columns: 8ch 18ch minmax(0, 1fr);
    gap: var(--spacing-xs);
    white-space: pre;
  }

  .ui-splash__state::before {
    content: '[';
  }

  .ui-splash__state::after {
    content: ']';
  }

  .ui-splash__check[data-state='ok'] .ui-splash__state {
    color: var(--tone-success);
  }

  .ui-splash__check[data-state='failed'] .ui-splash__state {
    color: var(--tone-danger);
  }

  .ui-splash__check-name {
    color: var(--text-primary);
  }

  .ui-splash__detail {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
