<script>
  // Which implementations a component has, and a way into the code.
  //
  // THE BADGE CARRIES INFORMATION ONLY BECAUSE THE ANSWER VARIES. Every one of
  // the 49 published components is a hand-authored Svelte file; a composed
  // component is JSON with no native implementation at all. If everything were
  // one or the other this would be decoration. It is also why the underlying
  // field is a LIST — `implementations: ['svelte']` — rather than a boolean: a
  // second target appends to it rather than forcing a schema change on every
  // document already written.
  let { implementations = [], expanded = false, onToggle = undefined } = $props()
</script>

{#if implementations.length}
  <button
    type="button"
    class="badge focus-ring"
    aria-expanded={expanded}
    onclick={() => onToggle?.()}
  >
    {implementations.map((i) => (i === 'svelte' ? 'Svelte' : i)).join(' · ')}
  </button>
{:else}
  <!-- No implementation is a REAL STATE, not an absence to hide: this component
       exists as JSON and nothing has been generated from it. -->
  <span class="badge badge--none">JSON only</span>
{/if}

<style>
  .badge {
    padding: 1px 8px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-full);
    background: var(--surface-raised);
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    cursor: pointer;
    flex-shrink: 0;
  }

  .badge--none {
    color: var(--text-tertiary);
    cursor: default;
  }
</style>
