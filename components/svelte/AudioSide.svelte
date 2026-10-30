<script>
  // The selected recording's facts, compact, in the inspector. While the selected scene read
  // plays on its timeline, the host's line inspector shows its line instead, passed as the
  // `line` snippet. Moved from Khaos App (catalog app-coverage plan, T5).
  import EmptyState from './EmptyState.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import { NOT_IN_A_SCENE, linesLabel, nameOf, sceneGroup } from './lib/recordings.js'

  /**
   * @typedef {Object} Props
   * @property {import('./lib/recordings.js').Recording | null} [recording] The selected recording; null when none is.
   * @property {import('svelte').Snippet | undefined} [line] The host's line inspector, rendered in place of the facts while a read's line is followed.
   */

  /** @type {Props} */
  let { recording = null, line = undefined } = $props()
</script>

{#if line}
  {@render line()}
{:else if !recording}
  <EmptyState title="No recording selected" description="Its facts show here." icon="waveform" />
{:else}
  <InspectorSection title={recording.kind === 'line' ? 'Line take' : 'Scene read'} uiId="story.audio.inspector">
    <PropertyRow label="Scene" value={recording.scene ? sceneGroup(recording) : NOT_IN_A_SCENE} />
    {#if recording.kind === 'line'}
      {#if recording.character}<PropertyRow label="Character" value={nameOf(recording.character)} />{/if}
    {:else}
      <PropertyRow label="Lines" value={linesLabel(recording.lineCount ?? 0)} />
    {/if}
    <PropertyRow label="Voice" value={recording.voices.map(nameOf).join(', ')} />
    <PropertyRow label="Chosen" value={recording.chosen ? 'Yes' : 'No'} />
    <PropertyRow label="Stale" value={recording.stale === undefined ? 'Not known' : recording.stale ? 'Yes' : 'No'} />
  </InspectorSection>
{/if}
