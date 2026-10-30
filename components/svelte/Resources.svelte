<script>
  // The Resource Library window: the engine's resource registry, read. ResourceCatalog is the
  // catalogue; this is the window, the header and the counts. Read-only: the registry ships
  // inside the engine. Moved from Khaos App (catalog app-coverage plan, T9).
  import EmptyState from './EmptyState.svelte'
  import ResourceCatalog from './ResourceCatalog.svelte'
  import { RESOURCE_KIND_ORDER, artifactsByKind, resourceKindLabel } from './lib/resources.js'

  /**
   * @typedef {Object} Props
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [state] The registry read.
   * @property {readonly any[]} [artifacts] The registry's artifacts, as ResourceCatalog takes them.
   * @property {string} [selectedId] The artifact shown, or ''.
   * @property {string} [selectedKind] Its kind.
   * @property {string} [selectedVersion] Its version shown.
   * @property {string} [body] The selected artifact's body.
   * @property {{ version?: string, source?: string, hash?: string } | undefined} [bodyMeta] Where the shown body came from.
   * @property {string} [bodyUnavailable] Why there is no body, when there is none; ResourceCatalog shows it as listed, not previewable.
   * @property {(artifact: { id: string, kind: string }, version?: string) => void} [onSelect] Reports an artifact, or a version of it, chosen.
   */

  /** @type {Props} */
  let {
    state = { kind: 'loading' },
    artifacts = [],
    selectedId = '',
    selectedKind = '',
    selectedVersion = '',
    body = '',
    bodyMeta = undefined,
    bodyUnavailable = '',
    onSelect = undefined,
  } = $props()

  // Counted from the artifacts, so a kind the engine added appears with its real count.
  const counts = $derived(artifactsByKind(artifacts))
</script>

<main class="ui-resources">
  <header class="ui-resources__head">
    <h1 class="ui-resources__title">Resource Library</h1>
    {#if state.kind === 'loaded'}
      <p class="ui-resources__counts" data-ui-id="resources.counts">
        {#each counts as count (count.kind)}
          <span class="ui-resources__count"><strong>{count.count}</strong>&nbsp;{resourceKindLabel(count.kind).toLowerCase()}{count.count === 1 ? '' : 's'}</span>
        {/each}
      </p>
    {/if}
    <p class="ui-resources__note">
      The instructions Khaos sends to AI models. Each job runs with a prompt (what to do), a system message (how to
      behave) and a schema (the shape of the answer). Read only.
    </p>
  </header>

  {#if state.kind === 'loading'}
    <EmptyState title="Reading the engine's resource registry…" icon="circle-notch" />
  {:else if state.kind === 'failed'}
    <!-- The engine's own words, never a message the host invented. -->
    <EmptyState title="Could not read the resource registry" description={state.message} icon="warning" />
  {:else if artifacts.length === 0}
    <!-- Not a filtered list: the registry is built into the engine, so an empty one is about its build. -->
    <EmptyState
      title="The engine has no resources registered"
      description="The registry ships inside khaos-tools. An empty list means this daemon's toolchain registered none; this app does not carry a copy."
      icon="books" />
  {:else}
    <div class="ui-resources__body">
      <ResourceCatalog
        {artifacts}
        {selectedId}
        {selectedKind}
        {selectedVersion}
        onSelect={(/** @type {{ id: string, kind: string }} */ artifact, /** @type {string | undefined} */ version) => onSelect?.(artifact, version)}
        {body}
        {...bodyMeta ? { bodyMeta } : {}}
        {bodyUnavailable}
        kindOrder={RESOURCE_KIND_ORDER} />
    </div>
  {/if}
</main>

<style>
  /* A desktop window: a fixed header bar, and the catalogue fills the rest, exactly the window's
     height, so its own index and detail panes scroll rather than the window. */
  .ui-resources {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface-base, transparent);
    color: var(--text-primary);
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
  }
  .ui-resources__head {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-bottom: 1px solid var(--border-default);
  }
  .ui-resources__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
  }
  .ui-resources__counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--spacing-sm);
    margin: 0;
    color: var(--text-secondary);
    font-variant-numeric: tabular-nums;
  }
  .ui-resources__count + .ui-resources__count::before {
    content: '·';
    margin-right: var(--spacing-sm);
    color: var(--text-secondary);
  }
  .ui-resources__counts strong {
    color: var(--text-primary);
    font-weight: 600;
  }
  .ui-resources__note {
    flex-basis: 100%;
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .ui-resources__body {
    flex: 1 1 auto;
    min-height: 0;
    padding: var(--spacing-md) var(--spacing-lg) 0;
  }
</style>
