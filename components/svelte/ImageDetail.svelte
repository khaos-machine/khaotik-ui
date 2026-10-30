<script>
  // An image's detail: the whole image at its measured aspect, its label, and one row per
  // recorded fact. A generated image adds its provenance; a recipe the engine did not send was
  // not recorded when the image was made, and says so. Moved from Khaos App (catalog
  // app-coverage plan, T5).
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import ImageThumb from './ImageThumb.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import { formatBytes } from './lib/bytes.js'
  import { formatName } from './lib/images.js'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/images.js').ImageRow | null} [row] The selected image; null when none is.
   * @property {string} [src] The image's URL, as the host resolved it. Empty draws the placeholder.
   * @property {(subject: { kind: 'character' | 'location' | 'object', id: string }) => void} [onRevealSubject] Reports the image's subject to show.
   */

  /** @type {Props} */
  let { row = null, src = '', onRevealSubject = undefined } = $props()

  const NOT_RECORDED = 'Not recorded'
</script>

{#if !row}
  <EmptyState title="No image selected" description="Select an image in the table." icon="image" />
{:else}
  <div class="ui-image-detail">
    <h2 class="ui-image-detail__label">{row.label}</h2>
    <div class="ui-image-detail__image">
      <ImageThumb {src} width={row.width} height={row.height} name={row.label} kind={row.subjectKind} />
    </div>
    <InspectorSection title="Image" uiId="story.image.facts">
      <PropertyRow label="Subject">
        <Button variant="text" onclick={() => onRevealSubject?.(row.subject)}>{row.subjectName}</Button>
      </PropertyRow>
      <PropertyRow label="Kind" value={row.subjectKind} />
      <PropertyRow label="Origin" value={row.origin} />
      <PropertyRow label="Dimensions" value="{row.width} × {row.height}" />
      <PropertyRow label="Size" value={formatBytes(row.sizeBytes)} />
      <PropertyRow label="Format" value={formatName(row.mimeType)} />
      <PropertyRow label="Created" value={row.createdAt} />
      <PropertyRow label="SHA-256" value={row.sha256} />
    </InspectorSection>
    {#if row.provenance}
      {@const p = row.provenance}
      <InspectorSection title="Provenance" uiId="story.image.provenance">
        <PropertyRow label="Generation" value={p.generationId} />
        <PropertyRow label="Provider" value={p.providerId} />
        <PropertyRow label="Model" value={p.modelId} />
        <PropertyRow label="Model revision" value={p.modelRevision ?? NOT_RECORDED} />
        <PropertyRow label="Prompt digest" value={p.promptDigest} />
        <PropertyRow label="Inputs" value="{p.inputDigests.length} {p.inputDigests.length === 1 ? 'input' : 'inputs'}" />
        <PropertyRow label="Profile" value={p.profile ? `${p.profile.id} r${p.profile.revision}` : NOT_RECORDED} />
        <PropertyRow label="Style" value={p.style ? `${p.style.id} r${p.style.revision}` : NOT_RECORDED} />
        <PropertyRow label="Template" value={p.template ? `${p.template.id} r${p.template.revision}` : NOT_RECORDED} />
      </InspectorSection>
    {/if}
  </div>
{/if}

<style>
  /* The app's copy spaced this with --space-3, which the kit does not define, so its 12px
     fallback always applied; --spacing-sm is the kit's 12px step. */
  .ui-image-detail {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--spacing-sm);
  }
  .ui-image-detail__label {
    margin: 0;
    font: inherit;
    font-weight: 600;
  }
  .ui-image-detail__image {
    max-width: 100%;
  }
</style>
