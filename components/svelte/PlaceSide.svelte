<script>
  // The Places inspector: the place's design, its identity, and the design direction once one is
  // drafted. The identity section is the host's, passed as the `identity` snippet, since what may
  // be deleted is the host's to decide. Moved from Khaos App (catalog app-coverage plan, T4).
  //
  // A place with more than one state (setting and time of day) lists them under "How it appears",
  // in the engine's order. Choosing one asks the host through `onstate`; the host re-reads the
  // place for that state and passes it back as `state`.
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import RadioChoiceList from './RadioChoiceList.svelte'
  import SubjectDesign from './SubjectDesign.svelte'

  /**
   * One way the place appears, as the engine names it.
   * @typedef {Object} PlaceState
   * @property {string} key The engine's state key.
   * @property {string} label The engine's display label, such as "Interior · Day".
   * @property {readonly number[]} sceneNumbers The scenes set in this state.
   */

  /**
   * The design direction a draft holds for the place.
   * @typedef {Object} PlaceDirection
   * @property {string} spatialDescription
   * @property {string} [lighting]
   * @property {readonly string[]} [fixedFeatures]
   */

  /**
   * @typedef {Object} Props
   * @property {boolean} [selected] A place is selected; nothing renders otherwise.
   * @property {string} [name] The place's name.
   * @property {import('./lib/types.js').DesignState} [design] Where the place's design stands.
   * @property {string} [activity] What the designer is doing now, while a job runs.
   * @property {string} [error] The designer's last error.
   * @property {(() => void) | undefined} [ondesign] Opens the place designer.
   * @property {import('svelte').Snippet | undefined} [identity] The host's identity section.
   * @property {PlaceDirection | null} [direction] The drafted design direction; null before one is drafted.
   * @property {readonly PlaceState[]} [states] The place's states; listed only when there is more than one.
   * @property {string} [state] The key of the state shown.
   * @property {string} [stateError] The engine's message when the shown state could not be read.
   * @property {((key: string) => void) | undefined} [onstate] Asked with the key of the state chosen.
   */

  /** @type {Props} */
  let { selected = false, name = '', design = { kind: 'none' }, activity = '', error = '', ondesign = undefined, identity = undefined, direction = null, states = [], state = '', stateError = '', onstate = undefined } = $props()

  const several = $derived(states.length > 1)
  const shown = $derived(several ? states.find((s) => s.key === state)?.label ?? '' : '')
  const options = $derived(
    states.map((s) => ({ value: s.key, title: s.label, caption: `${s.sceneNumbers.length === 1 ? 'Scene' : 'Scenes'} ${s.sceneNumbers.join(', ')}` })),
  )
</script>

{#if selected}
  <SubjectDesign kind="location" {name} {design} {activity} {error} {ondesign} caption={shown} />
  {#if several}
    <InspectorSection title="How it appears" count={states.length} uiId="story.inspector.place-states">
      {#if stateError}
        <div class="ui-place-side__state-error" role="alert"><p>This version of the place couldn't be read.</p><p>{stateError}</p></div>
      {/if}
      <RadioChoiceList label="How it appears" value={state} {options} onchange={(key) => onstate?.(key)} uiId="story.inspector.place-states.list" />
    </InspectorSection>
  {/if}
  {@render identity?.()}
  {#if direction}
    <InspectorSection title="Design direction" uiId="story.inspector.place-design">
      <p class="ui-place-side__direction">{direction.spatialDescription}</p>
      {#if direction.lighting}<PropertyRow label="Light" value={direction.lighting} />{/if}
      {#if direction.fixedFeatures?.length}
        <div class="ui-place-side__features" aria-label="Fixed features">{#each direction.fixedFeatures as feature (feature)}<span>{feature}</span>{/each}</div>
      {/if}
    </InspectorSection>
  {/if}
{/if}

<style>
  .ui-place-side__state-error {
    margin: 0 0 var(--spacing-sm);
    font-size: var(--caption-size);
    color: var(--tone-danger);
  }
  .ui-place-side__state-error p {
    margin: 0;
  }
  .ui-place-side__direction {
    margin: 0 0 var(--spacing-sm);
    font-size: var(--body-md-size);
    line-height: 1.5;
  }
  .ui-place-side__features {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }
  .ui-place-side__features span {
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    font-size: var(--caption-size);
  }
</style>
