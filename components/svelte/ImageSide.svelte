<script>
  // The selected image's facts, compact, in the inspector. Moved from Khaos App (catalog
  // app-coverage plan, T5).
  import EmptyState from './EmptyState.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import { formatBytes } from './lib/bytes.js'
  import { formatName } from './lib/images.js'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/images.js').ImageRow | null} [row] The selected image; null when none is.
   */

  /** @type {Props} */
  let { row = null } = $props()
</script>

{#if !row}
  <EmptyState title="No image selected" description="Its facts show here." icon="image" />
{:else}
  <InspectorSection title={row.label} uiId="story.image.inspector">
    <PropertyRow label="Subject" value={row.subjectName} />
    <PropertyRow label="Origin" value={row.origin} />
    <PropertyRow label="Dimensions" value="{row.width} × {row.height}" />
    <PropertyRow label="Size" value={formatBytes(row.sizeBytes)} />
    <PropertyRow label="Format" value={formatName(row.mimeType)} />
  </InspectorSection>
{/if}
