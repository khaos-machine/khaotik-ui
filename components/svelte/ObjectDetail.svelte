<script>
  // An object's working document: a Scenes | Images switch. Scenes are the scenes it appears in,
  // as the engine served them; Images are its committed images. Its name and counts are the
  // inspector's. A view chosen is reported, so the host reads images only when they open. Moved
  // from Khaos App (catalog app-coverage plan, T4).
  import DataTable from './DataTable.svelte'
  import EmptyState from './EmptyState.svelte'
  import SegmentedControl from './SegmentedControl.svelte'
  import SubjectImages from './SubjectImages.svelte'

  /** @typedef {import('./lib/places.js').ObjectRecord} ObjectRecord */
  /** @typedef {'scenes' | 'images'} ObjectView */

  /**
   * A scene as the dashboard lists it.
   * @typedef {Object} SceneSummary
   * @property {string} id
   * @property {number} [index] 0-based place in the story.
   * @property {string} [slugline]
   */

  /**
   * @typedef {Object} Props
   * @property {ObjectRecord | null} [object] The selected object's row; null when none is selected.
   * @property {readonly SceneSummary[]} [scenes] The story's scenes, to list the ones the object appears in.
   * @property {(sceneId: string) => void} [onRevealScene] Reports a scene to open.
   * @property {import('./lib/types.js').SubjectImagesRead} [images] The object's images read.
   * @property {Readonly<Record<string, string>>} [imageUrls] Resolved image URLs by reference id.
   * @property {(referenceId: string) => void} [onRevealImage] Reports an activated image.
   * @property {(view: ObjectView) => void} [onview] Reports the view chosen.
   */

  /** @type {Props} */
  let { object = null, scenes = [], onRevealScene = undefined, images = { kind: 'loading' }, imageUrls = {}, onRevealImage = undefined, onview = undefined } = $props()

  /** @type {ObjectView} */
  let tab = $state('scenes')

  const appearsIn = $derived(
    /** @type {SceneSummary[]} */ ((object?.appearances ?? []).map((a) => scenes.find((s) => s.id === a.sceneId)).filter(Boolean)),
  )
  const columns = [
    { key: 'n', label: '#', width: '40px', align: /** @type {const} */ ('end'), value: (/** @type {SceneSummary} */ s) => (s.index === undefined ? null : s.index + 1) },
    { key: 'slugline', label: 'Scene', width: 'minmax(200px, 1fr)', value: (/** @type {SceneSummary} */ s) => s.slugline ?? s.id },
  ]
  const VIEWS = [
    { value: 'scenes', label: 'Scenes' },
    { value: 'images', label: 'Images' },
  ]
</script>

{#if !object}
  <EmptyState title="No object selected" description="Select an object in the table." icon="cube" />
{:else}
  <div class="ui-object-detail">
    <header class="ui-object-detail__head">
      <SegmentedControl
        label="Object view"
        value={tab}
        items={VIEWS}
        onselect={(/** @type {string} */ v) => {
          tab = /** @type {ObjectView} */ (v)
          onview?.(tab)
        }} />
    </header>
    {#if tab === 'images'}
      <div class="ui-object-detail__images"><SubjectImages read={images} urls={imageUrls} kind="object" {onRevealImage} /></div>
    {:else}
      <DataTable rows={appearsIn} {columns} rowKey={(/** @type {SceneSummary} */ s) => s.id} label="Scenes with {object.name}" onopen={onRevealScene} empty="The engine places {object.name} in no scene." uiId="story.object.scenes" />
    {/if}
  </div>
{/if}

<style>
  .ui-object-detail {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .ui-object-detail__head {
    flex: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  /* The view switch is the header: it takes the full width, one equal segment per view. */
  .ui-object-detail__head :global(.ui-segmented) {
    display: flex;
  }
  .ui-object-detail__head :global(.ui-segmented__item) {
    flex: 1;
    text-align: center;
  }
  .ui-object-detail__images {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--spacing-sm);
  }
</style>
