<script>
  // A place's areas, as the engine's place builder prepares them: one block per area in the
  // engine's order, its brief as labelled rows, then the screenplay lines that support it,
  // grouped by field. Blocks start open when there are three or fewer. Read-only.
  import EmptyState from './EmptyState.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'

  /** @typedef {import('./lib/places.js').PlaceAreasRead} PlaceAreasRead */
  /** @typedef {import('./lib/places.js').AreaCitation['field']} CitedField */

  /**
   * @typedef {Object} Props
   * @property {PlaceAreasRead} [read] The place's areas read.
   */

  /** @type {Props} */
  let { read = { kind: 'loading' } } = $props()

  const id = $props.id()

  /** @type {ReadonlyArray<[CitedField, string]>} */
  const FIELDS = [
    ['space', 'Space'],
    ['fixedFeature', 'Fixed features'],
    ['dressing', 'Dressing'],
    ['lighting', 'Lighting'],
  ]

  const areas = $derived(read.kind === 'loaded' ? (read.areas ?? []) : [])

  /** @param {readonly number[]} n */
  const scenes = (n) => `${n.length === 1 ? 'Scene' : 'Scenes'} ${n.join(', ')}`
</script>

{#if read.kind === 'failed'}
  <EmptyState title="Areas not read" description={read.message} icon="warning" />
{:else if read.kind === 'loading'}
  <EmptyState title="Reading the areas…" icon="circle-notch" />
{:else if areas.length === 0}
  <EmptyState title="No separate areas were found for this place." icon="map-pin" />
{:else}
  {#each areas as area, i (i)}
    <InspectorSection title={area.name} count={area.cited.length} collapsed={areas.length > 3} uiId="place.areas.area">
      <PropertyRow label="Space" value={area.brief.spatialDescription} />
      {#if area.brief.fixedFeatures.length}<PropertyRow label="Fixed features" value={area.brief.fixedFeatures.join('; ')} />{/if}
      {#if area.brief.dressing}<PropertyRow label="Dressing" value={area.brief.dressing} />{/if}
      {#if area.brief.lighting}<PropertyRow label="Lighting" value={area.brief.lighting} />{/if}
      {#if area.brief.unknowns.length}<PropertyRow label="Still open" value={area.brief.unknowns.join('; ')} />{/if}
      {#if area.cited.length === 0}
        <p class="ui-place-areas__none">No screenplay lines are cited for this area.</p>
      {:else}
        <div class="ui-place-areas__cited" role="group" aria-labelledby="{id}-{i}-cited">
          <p class="ui-place-areas__heading" id="{id}-{i}-cited">From the screenplay</p>
          {#each FIELDS as [field, label] (field)}
            {@const lines = area.cited.filter((c) => c.field === field)}
            {#if lines.length}
              <p class="ui-place-areas__field" id="{id}-{i}-{field}">{label}</p>
              <ul class="ui-place-areas__lines" aria-labelledby="{id}-{i}-{field}">
                {#each lines as c, j (j)}
                  <li>{c.detail}{#if c.sceneNumbers?.length}<span class="ui-place-areas__scenes">{scenes(c.sceneNumbers)}</span>{/if}</li>
                {/each}
              </ul>
            {/if}
          {/each}
        </div>
      {/if}
    </InspectorSection>
  {/each}
{/if}

<style>
  .ui-place-areas__none,
  .ui-place-areas__heading,
  .ui-place-areas__field {
    margin: var(--spacing-sm) 0 var(--spacing-xs);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .ui-place-areas__lines {
    margin: 0 0 var(--spacing-xs);
    padding-left: var(--spacing-md);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
  .ui-place-areas__scenes {
    margin-left: var(--spacing-xs);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
</style>
