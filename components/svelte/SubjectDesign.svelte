<script>
  // A place's or object's design, at the head of its inspector: the chosen reference sheet, or
  // where the design stands, and the way into the designer. Shared by PlaceSide and ObjectSide,
  // which drew the same panel twice in Khaos App (catalog app-coverage plan, T4).
  import Button from './Button.svelte'
  import Icon from './Icon.svelte'
  import StatusPill from './StatusPill.svelte'

  /** @typedef {import('./lib/types.js').DesignState} DesignState */

  /**
   * @typedef {Object} Props
   * @property {'location' | 'object'} [kind] Which designer this is.
   * @property {string} [name] The subject's name, for the image's alternative text.
   * @property {DesignState} [design] Where the design stands.
   * @property {string} [activity] What the designer is doing now, while a job runs; empty otherwise.
   * @property {string} [error] The designer's last error; empty when there is none.
   * @property {(() => void) | undefined} [ondesign] Opens the designer; the action is left out without it.
   * @property {string} [caption] Names which version of the subject the design is for, such as a place state; nothing when empty.
   */

  /** @type {Props} */
  let { kind = 'location', name = '', design = { kind: 'none' }, activity = '', error = '', ondesign = undefined, caption = '' } = $props()

  const noun = $derived(kind === 'object' ? 'object' : 'place')
  const Noun = $derived(kind === 'object' ? 'Object' : 'Place')
  const image = $derived(design.kind === 'chosen' ? design.image : null)
  const status = $derived(
    design.kind === 'reading' ? 'Reading design…' : design.kind === 'chosen' ? 'Design in use' : design.kind === 'awaiting' ? 'Designs awaiting selection' : 'Not designed',
  )
</script>

<section class="ui-subject-design" aria-label="{Noun} design">
  {#if image?.url}
    <button class="ui-subject-design__preview" type="button" title="Open {noun} designer" onclick={() => ondesign?.()}><img src={image.url} alt={`${name || Noun} selected reference sheet`} /></button>
  {:else if image?.error}
    <p class="ui-subject-design__error" role="alert">{image.error}</p>
  {:else}
    <div class="ui-subject-design__empty">
      <Icon name={kind === 'object' ? 'cube' : 'map-pin'} />
      <span>{image ? 'Reading artwork…' : design.kind === 'reading' ? `Reading ${noun} design…` : `No ${noun} design chosen`}</span>
    </div>
  {/if}
  {#if caption}<p class="ui-subject-design__caption">{caption}</p>{/if}
  <div class="ui-subject-design__status">
    <StatusPill text={status} tone="neutral" />
    {#if activity}<span role="status">{activity}</span>{/if}
  </div>
  {#if ondesign}
    <Button variant="secondary" icon="paint-brush" onclick={() => ondesign()}>{design.kind === 'chosen' ? `Edit ${noun} design…` : `Design ${noun}…`}</Button>
  {/if}
  {#if error}<p class="ui-subject-design__error" role="alert">{error}</p>{/if}
</section>

<style>
  .ui-subject-design {
    padding: var(--spacing-sm);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    border-bottom: 1px solid var(--border-default);
  }
  .ui-subject-design__preview {
    padding: 0;
    display: block;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: var(--surface-base);
    overflow: hidden;
    cursor: pointer;
  }
  .ui-subject-design__preview img {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 2;
    object-fit: contain;
  }
  .ui-subject-design__preview:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  .ui-subject-design__empty {
    min-height: 115px;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: center;
    justify-content: center;
    background: var(--surface-raised);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
  .ui-subject-design__caption {
    margin: 0;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .ui-subject-design__status {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .ui-subject-design__error {
    margin: 0;
    font-size: var(--caption-size);
    color: var(--tone-danger);
  }
</style>
