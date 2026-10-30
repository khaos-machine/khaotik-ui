<script>
  // A subject's committed images: one section shared by the character, place and object
  // details. The host reads this subject's images and resolves each URL; until one
  // arrives the placeholder stands. Activating an image is reported.
  import EmptyState from './EmptyState.svelte'
  import Gallery from './Gallery.svelte'

  /** @typedef {import('./lib/types.js').SubjectImagesRead} SubjectImagesRead */

  /**
   * @typedef {Object} Props
   * @property {SubjectImagesRead} [read] Where the read is. Loading until the host says otherwise.
   * @property {Readonly<Record<string, string>>} [urls] Resolved image URLs by reference id. A missing one draws the placeholder.
   * @property {'character' | 'location' | 'object'} [kind] The subject's kind, which picks the placeholder.
   * @property {(referenceId: string) => void} [onRevealImage] Reports an activated image.
   */

  /** @type {Props} */
  let { read = { kind: 'loading' }, urls = {}, kind = 'character', onRevealImage = undefined } = $props()

  const KIND = { character: 'person', location: 'location', object: 'object' }
</script>

{#if read.kind === 'failed'}
  <EmptyState title="Images could not be read" description={read.message} icon="warning" />
{:else if read.kind === 'loaded'}
  <Gallery
    images={read.rows.map((r) => ({ id: r.referenceId, src: urls[r.referenceId] ?? '', caption: r.label }))}
    kind={KIND[kind]}
    onactivate={(id) => onRevealImage?.(id)} />
{:else}
  <EmptyState title="Reading images…" icon="circle-notch" />
{/if}
