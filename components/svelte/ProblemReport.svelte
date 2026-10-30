<script>
  // Report a Problem: one report of this install, and the ways it reaches the studio. The host
  // builds the report itself, so it works with the engine down, the case it exists for. Moved
  // from Khaos App (catalog app-coverage plan, T9).
  import Button from './Button.svelte'

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'gathering' } | { kind: 'failed', message: string } | { kind: 'ready', text: string }} [state] The report.
   * @property {boolean} [sharing] A share is in progress: the actions wait.
   * @property {string} [note] What the last share did, or ''.
   * @property {() => void} [onGather] Gathers the report again.
   * @property {() => void} [onEmail] Opens an email with the report's zip attached.
   * @property {() => void} [onSave] Saves the report's zip as a file.
   */

  /** @type {Props} */
  let {
    state = { kind: 'gathering' },
    sharing = false,
    note = '',
    onGather = undefined,
    onEmail = undefined,
    onSave = undefined,
  } = $props()

  const ready = $derived(state.kind === 'ready' && !sharing)
</script>

<main class="ui-problem-report" data-ui-id="report">
  <header>
    <h1 class="ui-problem-report__title">Report a problem</h1>
    <p class="note">
      This gathers what the studio needs to see what went wrong on this Mac: the app and engine versions, whether the
      engine is running, and every current log in full, in one zip file. It holds no keys, passwords or stories.
    </p>
  </header>

  <div class="ui-problem-report__actions">
    <Button variant="primary" disabled={!ready} onclick={() => onEmail?.()}>Email report…</Button>
    <Button variant="secondary" disabled={!ready} onclick={() => onSave?.()}>Save a file…</Button>
  </div>
  {#if note}<p class="note" role="status">{note}</p>{/if}

  {#if state.kind === 'gathering'}
    <p class="note">Gathering the report…</p>
  {:else if state.kind === 'failed'}
    <p class="note" role="alert">The report could not be gathered: {state.message}</p>
    <Button variant="secondary" onclick={() => onGather?.()}>Try again</Button>
  {:else}
    <pre class="ui-problem-report__text" aria-label="The report">{state.text}</pre>
  {/if}
</main>

<style>
  .ui-problem-report {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    height: 100vh;
    box-sizing: border-box;
    padding: var(--spacing-md);
    background: var(--surface-base);
    color: var(--text-primary);
    font-size: var(--data-md-size);
  }
  .ui-problem-report__title {
    margin: 0 0 var(--spacing-2xs);
    font-size: var(--body-md-size);
    font-weight: 600;
  }
  .ui-problem-report__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  .ui-problem-report__text {
    flex: 1;
    min-height: 0;
    margin: 0;
    overflow: auto;
    padding: var(--spacing-xs);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    white-space: pre-wrap;
  }
</style>
