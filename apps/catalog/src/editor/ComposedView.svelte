<script>
  // A whole document, rendered — the entry point NodeView recurses beneath.
  //
  // Separate from NodeView because a DOCUMENT and a NODE are different things to
  // be handed: a document carries declared inputs that have to be defaulted
  // before its tree can be walked, and it is what a registry entry, a flow step
  // and the canvas all actually hold. Folding the two together would make every
  // caller do the defaulting itself, which is where copies drift.
  import NodeView from './NodeView.svelte'
  import { withDefaults } from './bindings.js'

  /**
   * @property {object} document The composed document.
   * @property {Record<string, unknown>} [props] Values for its declared inputs.
   * @property {Map<string, object>} [composed] Other authored documents, by bare slug.
   */
  let { document: doc, props = {}, composed = new Map() } = $props()

  const inputs = $derived(withDefaults(doc?.inputs, props))
</script>

{#if doc?.root}
  <NodeView node={doc.root} {inputs} {composed} />
{:else}
  <p class="empty">{doc?.name ?? 'This document'} has no content yet.</p>
{/if}

<style>
  .empty {
    margin: auto;
    padding: var(--spacing-2xl);
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-tertiary);
  }
</style>
