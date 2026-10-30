<script>
  // The Objects inspector: the object's design, its identity, and the design direction once one
  // is drafted. The identity section is the host's, passed as the `identity` snippet, since what
  // may be deleted is the host's to decide. Moved from Khaos App (catalog app-coverage plan, T4).
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import SubjectDesign from './SubjectDesign.svelte'

  /**
   * The design direction a draft holds for the object.
   * @typedef {Object} ObjectDirection
   * @property {string} form
   * @property {string} [materials]
   * @property {readonly string[]} [distinguishingDetails]
   */

  /**
   * @typedef {Object} Props
   * @property {boolean} [selected] An object is selected; nothing renders otherwise.
   * @property {string} [name] The object's name.
   * @property {import('./lib/types.js').DesignState} [design] Where the object's design stands.
   * @property {string} [activity] What the designer is doing now, while a job runs.
   * @property {string} [error] The designer's last error.
   * @property {(() => void) | undefined} [ondesign] Opens the object designer.
   * @property {import('svelte').Snippet | undefined} [identity] The host's identity section.
   * @property {ObjectDirection | null} [direction] The drafted design direction; null before one is drafted.
   */

  /** @type {Props} */
  let { selected = false, name = '', design = { kind: 'none' }, activity = '', error = '', ondesign = undefined, identity = undefined, direction = null } = $props()
</script>

{#if selected}
  <SubjectDesign kind="object" {name} {design} {activity} {error} {ondesign} />
  {@render identity?.()}
  {#if direction}
    <InspectorSection title="Design direction" uiId="story.inspector.object-design">
      <p class="ui-object-side__direction">{direction.form}</p>
      {#if direction.materials}<PropertyRow label="Materials" value={direction.materials} />{/if}
      {#if direction.distinguishingDetails?.length}
        <div class="ui-object-side__features" aria-label="Distinctive details">{#each direction.distinguishingDetails as detail (detail)}<span>{detail}</span>{/each}</div>
      {/if}
    </InspectorSection>
  {/if}
{/if}

<style>
  .ui-object-side__direction {
    margin: 0 0 var(--spacing-sm);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
  .ui-object-side__features {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }
  .ui-object-side__features span {
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-size: var(--caption-size);
  }
</style>
