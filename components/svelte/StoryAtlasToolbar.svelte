<script>
  import SegmentedControl from './SegmentedControl.svelte'
  import Button from './Button.svelte'
  /**
   * @typedef {Object} Props
   * @property {string} [lens] Controlled visible entity type.
   * @property {(lens: string) => void} [onLensChange] Requests a different view; the host supplies its graph.
   * @property {() => void} [onRecenter] Requests the overview camera position; without it there is no Recenter, for a host whose canvas has its own.
   * @property {boolean} [disabled] Prevents navigation while a graph is unavailable.
   * @property {import('svelte').Snippet} [trailing] Optional app-owned view actions.
   */
  /** @type {Props} */
  let { lens = 'all', onLensChange = undefined, onRecenter = undefined, disabled = false, trailing = undefined } = $props()
  const lenses = [
    { value: 'all', label: 'Everything' },
    { value: 'character', label: 'Characters' },
    { value: 'location', label: 'Places' },
    { value: 'scene', label: 'Scenes' },
  ]
</script>

<div class="atlas-toolbar" role="group" aria-label="Story Atlas controls">
  <fieldset disabled={disabled}>
    <legend class="atlas-toolbar__label">Show in Story Atlas</legend>
    <SegmentedControl label="Story Atlas lens" value={lens} items={lenses} onselect={onLensChange} />
  </fieldset>
  <div class="atlas-toolbar__actions">
    {@render trailing?.()}
    {#if onRecenter}<Button icon="corners-out" {disabled} onclick={onRecenter}>Recenter</Button>{/if}
  </div>
</div>

<style>
  .atlas-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--spacing-sm); color:var(--text-primary); }
  fieldset { min-width:0; border:0; padding:0; margin:0; }
  fieldset:disabled { opacity:.5; pointer-events:none; }
  .atlas-toolbar__label { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
  .atlas-toolbar__actions { display:flex; flex-wrap:wrap; align-items:center; gap:var(--spacing-xs); }
</style>
