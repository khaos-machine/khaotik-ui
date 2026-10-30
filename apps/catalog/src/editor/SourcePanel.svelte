<script>
  // The code behind a component, shown.
  //
  // WHY IT IS NEARLY FREE: `props-schema.js` already holds every component's full
  // source, because the props parser needs it. So this is a display surface over
  // data already in hand — no new I/O, no new glob, and nothing generated.
  //
  // WHAT IT DELIBERATELY DOES NOT DO: generate Svelte for a composed document. A
  // composed component's artifact is its JSON, and emitting code from it is a
  // code generator — a real thing to want and a different piece of work. Showing
  // the JSON and SAYING that is the honest state, rather than an empty tab or a
  // button that produces something nobody has designed.
  import { componentSources, componentPaths } from './props-schema.js'

  /**
   * @property {string|null} component A library export name, if this is one.
   * @property {object|null} document A composed document, if this is one.
   */
  let { component = null, document: doc = null } = $props()

  const source = $derived(component ? componentSources[component] : null)
  const path = $derived(component ? componentPaths[component] : null)
  const json = $derived(doc ? JSON.stringify(doc, null, 2) : null)
</script>

<section class="source" aria-label="Source">
  <header class="source__head">
    <span class="source__path">{path ?? (doc ? `${doc.slug}.json` : '')}</span>
    <span class="source__kind">{component ? 'Svelte' : 'JSON'}</span>
  </header>

  {#if source}
    <pre class="source__body"><code>{source}</code></pre>
  {:else if json}
    <pre class="source__body"><code>{json}</code></pre>
    <!-- Stated, not hidden. A composed component has no Svelte implementation
         yet, and that is a fact about this kit rather than a missing feature of
         this panel. -->
    <p class="source__note">
      This component is defined in JSON. No Svelte implementation has been generated for it.
    </p>
  {:else}
    <p class="source__note">No source to show.</p>
  {/if}
</section>

<style>
  .source {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-top: 1px solid var(--border-default);
    background: var(--surface-raised);
  }

  .source__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--spacing-sm);
    padding: var(--spacing-2xs) var(--spacing-md);
    border-bottom: 1px solid var(--border-default);
  }

  /* Mono, because it is a path — the kit's rule is that anything transcribed
     takes the mono face. */
  .source__path {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .source__kind {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  .source__body {
    margin: 0;
    padding: var(--spacing-md);
    overflow: auto;
    max-height: 40vh;
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--body-md-line);
    color: var(--text-primary);
    /* The source is read, not reflowed: wrapping a line of Svelte at the pane
       edge makes indentation lie about nesting. */
    white-space: pre;
    tab-size: 2;
  }

  .source__note {
    margin: 0;
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }
</style>
