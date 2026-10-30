<script>
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'
  /**
   * @typedef {Object} AtlasEndpoint
   * @property {string} id Engine identity, reported unchanged on selection.
   * @property {string} label Supplied human-readable name.
   * @property {string} [kind] Supplied entity kind, e.g. character or scene.
   */
  /**
   * @typedef {Object} Props
   * @property {AtlasEndpoint | null} [source] First endpoint; null means no selected connection.
   * @property {AtlasEndpoint | null} [target] Second endpoint.
   * @property {string} [label] Supplied connection meaning, not inferred from endpoint kinds.
   * @property {string} [evidence] Optional supplied supporting evidence. No count or narrative relationship is invented.
   * @property {(id: string) => void} [onSelectEndpoint] Requests selection of an endpoint.
   * @property {() => void} [onClear] Requests clearing the connection selection.
   */
  /** @type {Props} */
  let { source = null, target = null, label = '', evidence = '', onSelectEndpoint = undefined, onClear = undefined } = $props()
</script>

<div class="atlas-relationship" aria-label="Selected connection details">
  {#if source && target}
    <div class="atlas-relationship__heading"><span class="eyebrow">Connection</span><Button variant="text" onclick={onClear}>Clear connection</Button></div>
    <h2>{label || 'Story connection'}</h2>
    <div class="atlas-relationship__endpoints">
      <div><span class="atlas-relationship__kind">{source.kind ?? ''}</span><Button onclick={() => onSelectEndpoint?.(source.id)}>{source.label}</Button></div>
      <Icon name="link" />
      <div><span class="atlas-relationship__kind">{target.kind ?? ''}</span><Button onclick={() => onSelectEndpoint?.(target.id)}>{target.label}</Button></div>
    </div>
    {#if evidence}<p>{evidence}</p>{/if}
  {:else}
    <h2>Explore a connection</h2>
    <p>Select a line between story elements to see what connects them.</p>
  {/if}
</div>

<style>
  .atlas-relationship { display:flex; flex-direction:column; gap:var(--spacing-md); color:var(--text-primary); }
  .atlas-relationship__heading { display:flex; align-items:center; justify-content:space-between; gap:var(--spacing-xs); }
  h2 { margin:0; font-size:var(--heading-md-size); line-height:var(--heading-md-line); font-weight:var(--heading-md-weight); letter-spacing:var(--heading-md-track); }
  p { margin:0; max-width:65ch; color:var(--text-secondary); font-size:var(--body-md-size); line-height:var(--body-md-line); font-weight:var(--body-md-weight); letter-spacing:var(--body-md-track); }
  .atlas-relationship__endpoints { display:flex; flex-direction:column; align-items:flex-start; gap:var(--spacing-xs); }
  .atlas-relationship__endpoints>div { display:flex; flex-direction:column; align-items:flex-start; gap:var(--spacing-2xs); max-width:100%; }
  .atlas-relationship__kind { color:var(--text-secondary); font-size:var(--caption-size); line-height:var(--caption-line); font-weight:var(--caption-weight); letter-spacing:var(--caption-track); }
</style>
