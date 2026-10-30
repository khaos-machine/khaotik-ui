<script>
  // One scene read on its own timeline: StoryPlayer over the read's action and dialogue
  // lanes, each line a block where the engine recorded it, with its stretch of the read's
  // waveform. The host owns the clock and the selection; this reports seeks and picks.
  import EmptyState from './EmptyState.svelte'
  import StoryPlayer from './StoryPlayer.svelte'

  /**
   * @typedef {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} ReadState
   */

  /**
   * @typedef {Object} Props
   * @property {ReadState} [state] Where the read is. A loaded read with no measured length is still opening.
   * @property {readonly any[]} [segments] The read as StoryPlayer segments.
   * @property {any} [peaks] The read's waveform peaks, in khaosd's shape; null when not fetched.
   * @property {string} [peaksError] khaosd's words when the peaks failed. The read still plays; this shows under the timeline.
   * @property {number} [currentTime] The playhead, in seconds.
   * @property {boolean} [playing] Whether the read is playing.
   * @property {number} [scale] Pixels per second.
   * @property {number} [minScale] The narrowest zoom.
   * @property {number} [maxScale] The widest zoom.
   * @property {string} [selectedElementId] The followed line's element id.
   * @property {(seconds: number) => void} [onSeek] Reports a seek.
   * @property {(eventId: string) => void} [onSelect] Reports a picked line.
   * @property {() => void} [onTogglePlay] Reports play or pause.
   * @property {(scale: number) => void} [onScaleChange] Reports a zoom.
   */

  /** @type {Props} */
  let {
    state = { kind: 'loading' }, segments = [], peaks = null, peaksError = '', currentTime = 0, playing = false,
    scale = undefined, minScale = undefined, maxScale = undefined, selectedElementId = '',
    onSeek = undefined, onSelect = undefined, onTogglePlay = undefined, onScaleChange = undefined,
  } = $props()
</script>

<!-- Until the audio reports its length the read has no extent to draw, and StoryPlayer
     would call that "no composition"; it is still opening. -->
{#if state.kind === 'loading' || (state.kind === 'loaded' && segments[0]?.durationMs === null)}
  <EmptyState title="Opening the read…" icon="circle-notch" />
{:else if state.kind === 'failed'}
  <EmptyState title="The read could not be opened" description={state.message} icon="warning" />
{:else if state.kind === 'loaded'}
  <!-- A column, so the message takes its own row: StoryPlayer fills its parent's height. -->
  <div class="read-timeline">
    <div class="read-timeline__player">
      <StoryPlayer
        {segments}
        lanes={['action', 'dialogue']}
        {peaks}
        {currentTime}
        {playing}
        {scale}
        {minScale}
        {maxScale}
        {selectedElementId}
        onSeek={(seconds) => onSeek?.(seconds)}
        onSelect={(eventId) => onSelect?.(eventId)}
        onTogglePlay={() => onTogglePlay?.()}
        onScaleChange={(next) => onScaleChange?.(next)} />
    </div>
    <!-- A read whose peaks failed still plays: khaosd's words, verbatim, where the waveform
         would be, and no control (#366). -->
    {#if peaksError}
      <p class="read-timeline__peaks-error" role="status">{peaksError}</p>
    {/if}
  </div>
{/if}

<style>
  .read-timeline {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 8px);
    height: 100%;
    min-height: 0;
  }
  .read-timeline__player {
    flex: 1;
    min-height: 0;
  }
  .read-timeline__peaks-error {
    margin: 0;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
</style>
