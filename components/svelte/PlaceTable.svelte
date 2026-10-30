<script>
  // Places, as a table: Name, Scenes, Pages, Named, and Analysis, the engine's standing:
  // current, stale, or nothing when there is none. Moved from Khaos App (catalog app-coverage
  // plan, T4).
  import DataTable from './DataTable.svelte'
  import RenderMark from './RenderMark.svelte'
  import { analysisMark } from './lib/characters.js'
  import { placeRows } from './lib/places.js'

  /** @typedef {import('./lib/places.js').PlaceRecord} PlaceRecord */
  /** @typedef {import('./lib/places.js').PlaceRow} PlaceRow */

  /**
   * @typedef {Object} Props
   * @property {readonly PlaceRecord[]} [places] khaosd's place rows.
   * @property {Readonly<Record<string, { state: string }>>} [standings] Each place's analysis standing by id.
   * @property {string} [selected] The selected row's id.
   * @property {string} [filter] Narrows the rows by text.
   * @property {(id: string) => void} [onselect] Reports a selected row.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [status] The places' read: a failed or unfinished read is said, never shown as an empty story.
   * @property {() => void} [onretry] Try again after a failed read.
   */

  /** @type {Props} */
  let { places = [], standings = {}, selected = '', filter = '', onselect = undefined, status = { kind: 'loaded' }, onretry = undefined } = $props()

  /** @param {string} id */
  const mark = (id) => analysisMark(standings[id])
  const columns = [
    { key: 'name', label: 'Name', width: 'minmax(160px, 1fr)', value: (/** @type {PlaceRow} */ r) => r.name },
    { key: 'scenes', label: 'Sc', width: '44px', align: /** @type {const} */ ('end'), value: (/** @type {PlaceRow} */ r) => r.scenes },
    { key: 'pages', label: 'Pages', width: '56px', align: /** @type {const} */ ('end'), value: (/** @type {PlaceRow} */ r) => (r.pages ? r.pages.toFixed(1) : r.pages) },
    { key: 'named', label: 'Named', width: '56px', align: /** @type {const} */ ('end'), value: (/** @type {PlaceRow} */ r) => r.named },
    { key: 'analysis', label: 'An', width: '36px', value: (/** @type {PlaceRow} */ r) => mark(r.id) ?? '', cell: analysisCell },
  ]
</script>

{#snippet analysisCell(/** @type {PlaceRow} */ row)}
  {@const m = mark(row.id)}
  <RenderMark state={m} label={m === 'stale' ? 'Analysis stale' : 'Analysis current'} compact />
{/snippet}

<DataTable
  rows={placeRows(places)}
  {columns}
  rowKey={(/** @type {PlaceRow} */ r) => r.id}
  label="Places"
  {selected}
  {filter}
  {onselect}
  {status}
  {onretry}
  loadingLabel="Reading places…"
  empty="This story has no places."
  uiId="story.places" />
