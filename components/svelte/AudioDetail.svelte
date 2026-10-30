<script>
  // A recording's detail: the player, one row per fact the engine sent, Chosen and Stale marks,
  // and links to its scene, line, character and voices. A line take plays on AudioPlayback with
  // its waveform; a scene read opens on its own timeline, the host's, passed as the `read`
  // snippet. Moved from Khaos App (catalog app-coverage plan, T5).
  import AudioPlayback from './AudioPlayback.svelte'
  import Button from './Button.svelte'
  import EmptyState from './EmptyState.svelte'
  import InspectorSection from './InspectorSection.svelte'
  import PropertyRow from './PropertyRow.svelte'
  import StatusPill from './StatusPill.svelte'
  import { formatBytes } from './lib/bytes.js'
  import { NOT_IN_A_SCENE, linesLabel, nameOf, sceneGroup, takesLabel } from './lib/recordings.js'

  /** @typedef {import('./lib/recordings.js').Recording} Recording */
  /** @typedef {{ version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[] }} Peaks */

  /**
   * @typedef {Object} Props
   * @property {Recording | null} [recording] The selected recording; null when none is.
   * @property {{ kind: 'loading' } | { kind: 'ready', url: string } | { kind: 'failed', message: string }} [playback] A line take's audio, as the host resolved it.
   * @property {{ kind: 'loading' } | { kind: 'loaded', peaks: Peaks } | { kind: 'failed', message: string }} [peaks] A line take's waveform peaks.
   * @property {import('svelte').Snippet | undefined} [read] The host's read timeline, for a scene read.
   * @property {(sceneId: string) => void} [onRevealScene] Reports the recording's scene to show.
   * @property {(characterId: string) => void} [onRevealCharacter] Reports the take's speaker to show.
   * @property {(voiceProfileId: string) => void} [onOpenVoice] Reports a voice to open.
   */

  /** @type {Props} */
  let {
    recording = null,
    playback = { kind: 'loading' },
    peaks = { kind: 'loading' },
    read = undefined,
    onRevealScene = undefined,
    onRevealCharacter = undefined,
    onOpenVoice = undefined,
  } = $props()
</script>

{#if !recording}
  <EmptyState title="No recording selected" description="Select a recording in the table." icon="waveform" />
{:else}
  {@const scene = recording.scene}
  <div class="ui-audio-detail">
    <h2 class="ui-audio-detail__label">{recording.kind === 'line' ? (recording.line?.text ?? '') : `Scene read of ${scene ? sceneGroup(recording) : 'a scene'}`}</h2>
    <div class="ui-audio-detail__marks">
      {#if recording.chosen}<StatusPill text="Chosen" tone="success" />{/if}
      {#if recording.stale}<StatusPill text="Stale" tone="warning" />{/if}
    </div>
    {#if recording.kind === 'scene'}
      {#if scene}
        <div class="ui-audio-detail__timeline">{@render read?.()}</div>
      {:else}
        <p class="ui-audio-detail__note">khaosd placed this read in no scene, so its timeline cannot open.</p>
      {/if}
    {:else if playback.kind === 'ready'}
      <AudioPlayback
        src={playback.url}
        label="Line take"
        peaks={peaks.kind === 'loaded' ? peaks.peaks : null}
        peaksError={peaks.kind === 'failed' ? peaks.message : ''} />
    {:else if playback.kind === 'failed'}
      <p class="ui-audio-detail__note">{playback.message}</p>
    {:else}
      <p class="ui-audio-detail__note">Reading the recording…</p>
    {/if}
    <InspectorSection title="Recording" uiId="story.audio.facts">
      <PropertyRow label="Scene">
        {#if scene}
          <Button variant="text" onclick={() => onRevealScene?.(scene.id)}>{sceneGroup(recording)}</Button>
        {:else}
          {NOT_IN_A_SCENE}
        {/if}
      </PropertyRow>
      {#if recording.kind === 'line'}
        <PropertyRow label="Line">
          {#if scene}
            <!-- The host reveals a scene, not a line inside it. -->
            <Button variant="text" onclick={() => onRevealScene?.(scene.id)}>{recording.line?.text ?? ''}</Button>
          {:else}
            {recording.line?.text ?? ''}
          {/if}
        </PropertyRow>
        <PropertyRow label="Line kind" value={recording.line?.kind ?? ''} />
        {#if recording.character}
          {@const character = recording.character}
          <PropertyRow label="Character">
            <Button variant="text" onclick={() => onRevealCharacter?.(character.id)}>{nameOf(character)}</Button>
          </PropertyRow>
        {/if}
      {:else}
        <PropertyRow label="Lines" value={linesLabel(recording.lineCount ?? 0)} />
      {/if}
      <PropertyRow label={recording.voices.length === 1 ? 'Voice' : 'Voices'}>
        {#each recording.voices as voice (voice.id)}
          <Button variant="text" onclick={() => onOpenVoice?.(voice.id)}>{nameOf(voice)}</Button>
        {/each}
      </PropertyRow>
      <PropertyRow label="Created" value={recording.createdAt} />
      {#if recording.kind === 'line' && recording.direction}
        <PropertyRow label="Direction" value="{recording.direction.text} ({recording.direction.applied})" />
      {/if}
      {#if recording.kind === 'line' && recording.generationId}
        <PropertyRow label="Generation" value={recording.generationId} />
      {/if}
    </InspectorSection>
    {#if recording.media}
      {@const media = recording.media}
      <InspectorSection title="Media" uiId="story.audio.media">
        <PropertyRow label="Format" value={media.format.toUpperCase()} />
        <PropertyRow label="Size" value={formatBytes(media.sizeBytes)} />
        {#if media.assembledFrom}
          <PropertyRow label="Assembled from" value={takesLabel(media.assembledFrom.length)} />
        {:else}
          <PropertyRow label="Provider" value={media.provider} />
          {#if media.providerModel}<PropertyRow label="Model" value={media.providerModel} />{/if}
        {/if}
      </InspectorSection>
    {/if}
  </div>
{/if}

<style>
  /* The app's copy spaced this with --space-2 and --space-3, which the kit does not define, so
     their 8px and 12px fallbacks always applied; these are the kit's 8px and 12px steps. */
  .ui-audio-detail {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--spacing-sm);
  }
  .ui-audio-detail__label {
    margin: 0;
    font: inherit;
    font-weight: 600;
  }
  .ui-audio-detail__marks {
    display: flex;
    gap: var(--spacing-xs);
  }
  .ui-audio-detail__timeline {
    flex: none;
  }
  .ui-audio-detail__note {
    margin: 0;
    color: var(--text-secondary);
  }
</style>
