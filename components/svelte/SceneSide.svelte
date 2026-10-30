<script>
  // The Scenes inspector: the scene's identity, its reads, who speaks, and who is present, named
  // and held. A selected line shows here instead, through the host's line inspector passed as the
  // `line` snippet; the scene's reads are the host's, passed as the `reads` snippet. Moved from
  // Khaos App (catalog app-coverage plan, T3).
  import BarChart from './BarChart.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import TokenField from './TokenField.svelte'
  import { sceneAccount, sceneDialogueBars, sceneRows } from './lib/scenes.js'

  /** @typedef {import('./lib/scenes.js').SceneRecord} SceneRecord */
  /** @typedef {{ id: string, name: string }} Named */

  /**
   * @typedef {Object} Props
   * @property {SceneRecord | null} [scene] The selected scene's row; null when none is selected.
   * @property {readonly Named[]} [characters] The story's characters, to name who speaks and who is present.
   * @property {readonly Named[]} [locations] The story's places, to name the scene's location and the places it names.
   * @property {readonly Named[]} [objects] The story's objects.
   * @property {import('svelte').Snippet | undefined} [line] The host's line inspector, rendered in place of everything else while a line is selected.
   * @property {import('svelte').Snippet | undefined} [reads] The host's scene reads, under Scene reads; the section is left out without it.
   */

  /** @type {Props} */
  let { scene = null, characters = [], locations = [], objects = [], line = undefined, reads = undefined } = $props()

  const row = $derived(scene ? sceneRows([scene])[0] : null)
  const account = $derived(scene ? sceneAccount(scene, { characters, locations, objects }) : null)
  const speakers = $derived(scene ? sceneDialogueBars(scene, characters) : [])
</script>

{#if line}
  {@render line()}
{:else if scene && row && account}
  <InspectorSection title="Scene" uiId="story.inspector.scene">
    {#if row.n !== null}<PropertyRow label="Number" value={row.n} />{/if}
    {#if account.location}<PropertyRow label="Location" value={account.location} />{/if}
    <PropertyRow label="Setting" value={[row.setting, row.time].filter(Boolean).join(' · ')} />
    <PropertyRow label="Words" value={row.words} />
    <PropertyRow label="Lines" value={row.lines} />
  </InspectorSection>

  {#if reads}
    <InspectorSection title="Scene reads" uiId="story.inspector.reads">
      {#key scene.id}{@render reads()}{/key}
    </InspectorSection>
  {/if}

  <InspectorSection title="Who speaks" count={speakers.length} uiId="story.inspector.speakers">
    <BarChart data={speakers} caption="Lines each character speaks in this scene, as the engine counts them." emptyLabel="The engine measured no dialogue in this scene." />
  </InspectorSection>

  {#if account.nonSpeaking.length || account.mentioned.length || account.named.length || account.objects.length}
    <InspectorSection title="Also here" uiId="story.inspector.present">
      {#if account.nonSpeaking.length}<PropertyRow label="Present, silent"><TokenField tokens={account.nonSpeaking.map((c) => c.name)} label="Present, not speaking" readonly /></PropertyRow>{/if}
      {#if account.mentioned.length}<PropertyRow label="Mentioned"><TokenField tokens={account.mentioned.map((c) => c.name)} label="Mentioned" readonly /></PropertyRow>{/if}
      {#if account.named.length}<PropertyRow label="Named here"><TokenField tokens={account.named.map((c) => c.name)} label="Named here" readonly /></PropertyRow>{/if}
      {#if account.objects.length}<PropertyRow label="Objects"><TokenField tokens={account.objects.map((c) => c.name)} label="Objects" readonly /></PropertyRow>{/if}
    </InspectorSection>
  {/if}
{/if}
