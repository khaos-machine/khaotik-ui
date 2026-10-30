<script>
  // A project's recordings, as a table grouped by scene. Rows arrive in the engine's order: by
  // scene, its reads before its lines, unplaced lines last. A row's waveform peaks are asked for
  // once, as its cell renders, and the table renders only the rows in view, so only those are
  // fetched; the host keeps them and hands them back. Moved from Khaos App (catalog
  // app-coverage plan, T5).
  import { untrack } from 'svelte'
  import DataTable from './DataTable.svelte'
  import Waveform from './Waveform.svelte'
  import { nameOf, recordingText, sceneGroup } from './lib/recordings.js'
  import { peaksSeconds } from './lib/waveform.js'

  /** @typedef {import('./lib/recordings.js').Recording} Recording */
  /** @typedef {{ version: number, channels: number, sample_rate: number, samples_per_pixel: number, bits: number, length: number, data: number[] }} Peaks */
  /** @typedef {{ kind: 'loaded', peaks: Peaks } | { kind: 'failed', message: string }} PeaksRead */

  /**
   * @typedef {Object} Props
   * @property {readonly Recording[]} [rows] The project's recordings, as khaosd lists them.
   * @property {Readonly<Record<string, PeaksRead>>} [peaks] Each row's waveform peaks, or why they could not be read, by recording id.
   * @property {(id: string) => void} [onpeaks] Asked for a row's peaks once, as its cell renders.
   * @property {string} [selected] The selected row's id.
   * @property {string} [filter] Narrows the rows by text.
   * @property {(id: string) => void} [onselect] Reports a selected row.
   */

  /** @type {Props} */
  let { rows = [], peaks = {}, onpeaks = undefined, selected = '', filter = '', onselect = undefined } = $props()

  /** @param {boolean | undefined} on */
  const yes = (on) => (on ? 'Yes' : on === false ? '' : '—')
  const columns = [
    { key: 'kind', label: 'Kind', width: '88px', value: (/** @type {Recording} */ r) => (r.kind === 'line' ? (r.line?.kind ?? '') : 'scene read') },
    { key: 'waveform', label: 'Waveform', width: '120px', value: () => '', cell: waveform },
    { key: 'text', label: 'Line', width: 'minmax(180px, 1fr)', value: recordingText },
    { key: 'character', label: 'Character', width: '104px', value: (/** @type {Recording} */ r) => (r.kind === 'line' && r.character ? nameOf(r.character) : '') },
    { key: 'voice', label: 'Voice', width: '120px', value: (/** @type {Recording} */ r) => r.voices.map(nameOf).join(', ') },
    { key: 'created', label: 'Created', width: '168px', value: (/** @type {Recording} */ r) => r.createdAt },
    { key: 'chosen', label: 'Chosen', width: '64px', value: (/** @type {Recording} */ r) => yes(r.chosen) },
    { key: 'stale', label: 'Stale', width: '56px', value: (/** @type {Recording} */ r) => yes(r.stale) },
  ]
</script>

{#snippet waveform(/** @type {Recording} */ r)}
  {@const state = peaks[r.id]}
  <!-- Asked for once as the cell mounts. Untracked: a failed fetch must not re-run it in a loop. -->
  <span class="ui-audio-table__waveform" {@attach () => untrack(() => onpeaks?.(r.id))}>
    {#if state?.kind === 'loaded'}
      <!-- The whole clip: the kit's default window is empty and draws nothing. -->
      <Waveform peaks={state.peaks} from={0} to={peaksSeconds(state.peaks)} />
    {:else if state?.kind === 'failed'}
      <span class="ui-audio-table__failure">{state.message}</span>
    {/if}
  </span>
{/snippet}

<DataTable
  {rows}
  {columns}
  rowKey={(/** @type {Recording} */ r) => r.id}
  label="Audio"
  {selected}
  {onselect}
  {filter}
  groupBy={sceneGroup}
  empty="This project has no recordings."
  uiId="story.audio" />

<style>
  .ui-audio-table__waveform {
    display: block;
    width: 100%;
    height: 20px;
  }
  .ui-audio-table__failure {
    color: var(--text-secondary);
    font-size: var(--caption-size);
  }
</style>
