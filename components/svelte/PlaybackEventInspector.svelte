<script>
  // The event under the Story Player's playhead: who speaks or what happens, when it
  // starts and for how long, and which reading supplies the scene's audio. Between events
  // it says so. Every action is reported; seeking, opening data and shot work are the host's.
  import Button from './Button.svelte'
  import Portrait from './Portrait.svelte'
  import { formatTimecode } from './lib/timeline.js'

  /**
   * @typedef {Object} PlaybackEvent
   * @property {string} elementType The screenplay element: `dialogue`, `action`, …
   * @property {string} [characterName] The speaker's name as the script gives it.
   * @property {string} [parenthetical] The line's direction, if any.
   * @property {string} [text] The event's text. khaosd omits it for an event with none.
   * @property {number} start Where it starts, in seconds.
   * @property {number | null} duration How long it runs, in seconds; null when unknown.
   */

  /**
   * @typedef {Object} PlaybackRead
   * @property {string} id The reading's id.
   * @property {boolean} [chosen] Whether it is the scene's chosen reading.
   * @property {string} [createdAt] When it was made, as an ISO timestamp.
   */

  /**
   * @typedef {Object} PlaybackScene
   * @property {'scene' | string} kind The segment kind; only a scene manages readings.
   * @property {'read' | 'estimated' | string} timing Whether the timing is a measured read or estimated.
   * @property {readonly PlaybackRead[]} reads The scene's readings.
   * @property {{ takeId: string, stale?: boolean | null } | null} [audio] The reading supplying the audio, if one is chosen.
   */

  /**
   * @typedef {Object} Props
   * @property {PlaybackScene} [scene] The scene under the playhead. Defaults to a scene with no readings.
   * @property {PlaybackEvent | null} [event] The event under the playhead; null between events.
   * @property {{ id: string, name: string } | undefined} [character] The speaking character, when the event is a line.
   * @property {string} [portrait] The speaker's portrait URL.
   * @property {boolean} [auditioning] Whether the audio is an audition rather than the chosen reading.
   * @property {() => void} [onReadings] Reports Manage readings.
   * @property {() => void} [onSeek] Reports Go to event.
   * @property {() => void} [onData] Reports Open in Data.
   * @property {() => void} [onAddShot] Reports Add shot for event. Without it the action is absent.
   * @property {() => void} [onShot] Reports Inspect covering shot. Without it the action is absent.
   */

  /** @type {Props} */
  let { scene = { kind: 'scene', timing: 'estimated', reads: [], audio: null }, event = null, character = undefined, portrait = '', auditioning = false, onReadings = undefined, onSeek = undefined, onData = undefined, onAddShot = undefined, onShot = undefined } = $props()
  const reading = $derived(scene.reads.find((read) => read.id === scene.audio?.takeId))
</script>

<section class="playback-event" aria-label="Active event">
  {#if event}
    <div class="playback-event__identity">
      {#if character}<div class="playback-event__portrait"><Portrait src={portrait} name={character.name} identity={character.id} aspect="1" /></div>{/if}
      <div><span class="playback-event__kind">{event.elementType}</span><h3>{character?.name || event.characterName || (event.elementType === 'action' ? 'Narration' : 'Story event')}</h3></div>
    </div>
    {#if event.parenthetical}<p class="playback-event__direction">{event.parenthetical}</p>{/if}
    <p class="playback-event__text">{event.text ?? ''}</p>
    <dl>
      <div><dt>Starts</dt><dd>{formatTimecode(event.start)}</dd></div>
      {#if event.duration !== null}<div><dt>Duration</dt><dd>{formatTimecode(event.duration)}</dd></div>{/if}
      <div><dt>Timing</dt><dd>{scene.timing === 'read' ? 'Measured read' : 'Estimated'}</dd></div>
    </dl>
  {:else}
    <h3>Between events</h3><p class="playback-event__hint">The inspector follows the playhead. Seek to a line or action to inspect it.</p>
  {/if}
  {#if event}<div class="playback-event__reading"><Button variant="tool" icon="crosshair" onclick={() => onSeek?.()}>Go to event</Button>{#if onShot}<Button variant="tool" icon="film-strip" onclick={onShot}>Inspect covering shot</Button>{/if}{#if onAddShot}<Button variant="tool" icon="plus-square" onclick={onAddShot}>Add shot for event</Button>{/if}<Button variant="tool" icon="table" onclick={() => onData?.()}>Open in Data</Button></div>{/if}
  <details class="playback-event__reading" open={!onAddShot}><summary>Reading source</summary>
    <span class="playback-event__kind">Scene reading</span>
    {#if scene.audio}
      <strong title={scene.audio.takeId}>{auditioning ? 'Auditioning reading' : reading?.chosen ? 'Chosen reading' : 'Current reading'}</strong>
      {#if reading?.createdAt}<p class="playback-event__hint">{new Date(reading.createdAt).toLocaleString()}</p>{/if}
      {#if scene.audio.stale}<p class="playback-event__hint">The script has changed since this reading.</p>{/if}
      <p class="playback-event__hint">This reading supplies the scene’s audio.</p>
    {:else}
      <strong>No reading chosen</strong><p class="playback-event__hint">This event uses estimated timing until a reading is chosen.</p>
    {/if}
    {#if scene.kind === 'scene'}<Button variant="tool" icon="waveform" onclick={() => onReadings?.()}>Manage readings</Button>{/if}
  </details>
</section>

<style>
  .playback-event { display:flex; flex-direction:column; gap:12px; }
  .playback-event__identity { display:flex; align-items:center; gap:8px; }
  .playback-event__portrait { width:40px; flex:0 0 40px; border-radius:50%; overflow:hidden; }
  .playback-event__kind { display:block; font-size:11px; color:var(--text-secondary); text-transform:capitalize; margin-bottom:4px; }
  .playback-event h3, .playback-event p { margin:0; }
  .playback-event h3 { font-size:13px; font-weight:600; }
  .playback-event__text { font-size:12px; line-height:1.6; white-space:pre-wrap; }
  .playback-event__direction, .playback-event__hint { color:var(--text-secondary); font-size:12px; line-height:1.6; }
  .playback-event__direction { font-style:italic; }
  .playback-event dl { margin:0; padding:8px 0; border-block:1px solid var(--border-hairline); font-size:11px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
  .playback-event dl > div { display:flex; flex-direction:column; gap:4px; }
  .playback-event dt { color:var(--text-secondary); flex-shrink:0; }
  .playback-event dd { margin:0; text-align:left; font-variant-numeric:tabular-nums; }
  .playback-event__reading { padding-top:2px; display:flex; flex-direction:column; gap:8px; }
  .playback-event__reading strong { font-size:13px; font-weight:500; }
</style>
