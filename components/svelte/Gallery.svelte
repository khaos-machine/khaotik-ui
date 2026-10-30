<script>
  import Portrait from './Portrait.svelte'

  // The reference gallery (character sheet / location reference): a list of
  // thumbnails, each a Portrait with an optional caption — the spec's
  // "list of thumbnail components" imagery vocabulary.
  // `figureFor` covers entries with no `src` of their own — see Portrait (#23).
  /**
   * @typedef {'person'|'scene'|'location'|'object'} EntityKind
   */

  /**
   * One gallery entry. `src` makes the thumbnail a real image; `gender` and `age`
   * pick the placeholder figure when it does not.
   * @typedef {Object} GalleryImage
   * @property {string} [id] Identity passed to `onactivate`; an entry without one is not activatable.
   * @property {string} [src]
   * @property {string} [caption]
   * @property {string} [gender]
   * @property {string} [age]
   */

  /**
   * @typedef {Object} Props
   * @property {readonly GalleryImage[]} [images] Array of `{ src?, caption? }` entries; `src` makes the thumbnail a real image.
   * @property {string} [name] Fallback name used by template thumbnails without a caption.
   * @property {EntityKind} [kind] Template kind for thumbnails without a `src`.
   * @property {(id: string) => void} [onactivate] Asked with an entry's `id` when it is activated. When set, each entry with an `id` is a native button named by its caption (or `name`), so click, Return and Space all reach it.
   * @property {(figure: { gender: string, age: string, name: string, identity: string, kind: EntityKind }) => ({ src: string, srcset?: string }|string|null|undefined)} [figureFor] Passed through to `Portrait` to override the kit's shipped placeholder for entries with no `src` of their own (#23). Returning nothing falls back to the kit's own set.
   */

  /** @type {Props} */
  let { images = [], name = '', kind = 'person', figureFor = undefined, onactivate = undefined } = $props()
</script>

{#if images.length}
  <div class="gallery">
    <!-- Keyed by index. The key was `img.src ?? img.caption ?? i`, and an entry
         with no artwork carries `src: ''` rather than no `src` at all — which
         `??` cannot see — so a set of placeholder-only images all keyed as ''
         and the gallery threw `each_key_duplicate`. Not an id here, but the
         same empty-string-is-not-absent mistake. -->
    {#each images as img, i (i)}
      {#if onactivate && img.id}
        <!-- A native button, not a figure with role="button": the browser
             gives it focus, Return and Space, which a figure has to fake. -->
        <button type="button" class="gallery__item gallery__item--button" aria-label={img.caption || name} onclick={() => onactivate(img.id)}>
          <Portrait src={img.src ?? ''} name={img.caption ?? name} gender={img.gender ?? ''} age={img.age ?? ''} {figureFor} aspect="1 / 1" {kind} />
          {#if img.caption}
            <span class="gallery__caption" aria-hidden="true">{img.caption}</span>
          {/if}
        </button>
      {:else}
        <figure class="gallery__item">
          <Portrait src={img.src ?? ''} name={img.caption ?? name} gender={img.gender ?? ''} age={img.age ?? ''} {figureFor} aspect="1 / 1" {kind} />
          {#if img.caption}
            <figcaption class="gallery__caption">{img.caption}</figcaption>
          {/if}
        </figure>
      {/if}
    {/each}
  </div>
{:else}
  <p class="gallery__empty">No reference images yet.</p>
{/if}

<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: var(--spacing-sm);
  }

  .gallery__item {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }

  .gallery__item--button {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: inherit;
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  .gallery__item--button:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: 2px;
  }

  .gallery__caption {
    font-size: var(--caption-size);
    color: var(--text-secondary);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .gallery__empty {
    margin: 0;
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }
</style>
