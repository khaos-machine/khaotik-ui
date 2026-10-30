<script>
  // A character's recordings: their line takes, as khaosd's one-character route lists them
  // (`/api/v1/audio/assets?characterId`), grouped by scene. Activating one is reported, for the
  // host to reveal it. Read-only. Moved from Khaos App (catalog app-coverage plan, T2).
  import DataTable from './DataTable.svelte'
  import EmptyState from './EmptyState.svelte'
  import { nameOf, sceneGroup } from './lib/recordings.js'

  /** @typedef {import('./lib/recordings.js').Recording} Recording */
  /** @typedef {import('./lib/types.js').RecordingsRead} RecordingsRead */

  /**
   * @typedef {Object} Props
   * @property {RecordingsRead} [read] Where the read is. Loading until the host says otherwise.
   * @property {string} [characterName] Whose recordings, for the table's label and its empty line.
   * @property {(id: string) => void} [onRevealRecording] Reports an activated recording.
   */

  /** @type {Props} */
  let { read = { kind: 'loading' }, characterName = '', onRevealRecording = undefined } = $props()

  /** @param {boolean | undefined} on */
  const yes = (on) => (on ? 'Yes' : '')
  const columns = [
    { key: 'text', label: 'Line', width: 'minmax(180px, 1fr)', value: (/** @type {Recording} */ r) => (r.kind === 'line' ? (r.line?.text ?? '') : '') },
    { key: 'voice', label: 'Voice', width: '120px', value: (/** @type {Recording} */ r) => r.voices.map(nameOf).join(', ') },
    { key: 'created', label: 'Created', width: '168px', value: (/** @type {Recording} */ r) => r.createdAt },
    { key: 'chosen', label: 'Chosen', width: '64px', value: (/** @type {Recording} */ r) => yes(r.chosen) },
    { key: 'stale', label: 'Stale', width: '56px', value: (/** @type {Recording} */ r) => yes(r.stale) },
  ]
</script>

{#if read.kind === 'failed'}
  <EmptyState title="Recordings could not be read" description={read.message} icon="warning" />
{:else if read.kind === 'loaded'}
  <DataTable
    rows={read.recordings}
    {columns}
    rowKey={(/** @type {Recording} */ r) => r.id}
    label="Recordings of {characterName}"
    onselect={onRevealRecording}
    groupBy={sceneGroup}
    empty="{characterName} has no recordings."
    uiId="story.character.recordings" />
{:else}
  <EmptyState title="Reading recordings…" icon="circle-notch" />
{/if}
