<script>
  // A reference's image in Portrait. The whole image at its measured aspect, or a fixed
  // square for a table row, where a row has one height and a thumbnail may crop. Until the
  // host has the bytes, `src` is empty and Portrait draws its placeholder.
  import Portrait from './Portrait.svelte'

  /**
   * @typedef {Object} Props
   * @property {string} [src] The image URL the host resolved. Empty draws the placeholder.
   * @property {string} [name] What the image is of, for its accessible name.
   * @property {'character' | 'location' | 'object'} [kind] The subject's kind, which picks the placeholder.
   * @property {number} [width] The image's measured width, for its aspect.
   * @property {number} [height] The image's measured height, for its aspect.
   * @property {boolean} [square] A fixed 40px square, for a table row.
   */

  /** @type {Props} */
  let { src = '', name = '', kind = 'character', width = 1, height = 1, square = false } = $props()
  const portraitKind = $derived(kind === 'character' ? 'person' : kind)
</script>

{#if square}
  <div class="image-thumb__square"><Portrait {src} {name} aspect="1 / 1" kind={portraitKind} /></div>
{:else}
  <Portrait {src} {name} aspect="{width} / {height}" kind={portraitKind} />
{/if}

<style>
  .image-thumb__square {
    width: 40px;
  }
</style>
