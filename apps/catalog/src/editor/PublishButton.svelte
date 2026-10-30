<script>
  // Publish, or hand the document over.
  //
  // TWO STATES, AND BOTH ARE HONEST. Under the dev server this writes
  // `components/composed/<slug>.json` and says where it went. In the built app —
  // the static site, where there is no repo to write to — it says so and offers
  // the JSON to copy. A control that silently did nothing on one of the two
  // surfaces would be worse than either.
  //
  // "Update" rather than "Publish" once a file exists, because the two are
  // different acts to the person doing them even though they are one write.
  let { document: doc, isPublished = false, onPublish = undefined } = $props()

  let state = $state(null)

  async function go() {
    state = { kind: 'working' }
    const result = await onPublish?.(doc)
    state = result?.ok
      ? { kind: 'done', detail: result.path }
      : { kind: 'failed', detail: result?.error ?? 'Publishing failed.' }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(doc, null, 2))
      state = { kind: 'copied' }
    } catch {
      state = { kind: 'failed', detail: 'This browser would not give access to the clipboard.' }
    }
  }
</script>

<div class="publish">
  {#if state?.kind === 'done'}
    <span class="publish__note">Wrote {state.detail}</span>
  {:else if state?.kind === 'copied'}
    <span class="publish__note">Copied</span>
  {:else if state?.kind === 'failed'}
    <span class="publish__note publish__note--failed">{state.detail}</span>
  {/if}

  <button type="button" class="publish__action focus-ring" onclick={copy}>Copy JSON</button>
  <button
    type="button"
    class="publish__action publish__action--primary focus-ring"
    disabled={state?.kind === 'working'}
    onclick={go}
  >
    {state?.kind === 'working' ? 'Publishing…' : isPublished ? 'Update' : 'Publish'}
  </button>
</div>

<style>
  .publish {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    margin-left: auto;
    flex-shrink: 0;
  }

  .publish__note {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    max-width: 32ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .publish__note--failed {
    color: var(--tone-danger);
  }

  .publish__action {
    padding: 3px 10px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
    cursor: pointer;
  }

  .publish__action--primary {
    border-color: var(--action-primary);
    color: var(--action-primary);
  }

  .publish__action:disabled {
    color: var(--text-tertiary);
    cursor: default;
  }
</style>
