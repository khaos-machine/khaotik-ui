<script>
  // Objects, as a table: Name, Scenes, Named, Group. A story with none says so rather than
  // rendering nothing. Moved from Khaos App (catalog app-coverage plan, T4).
  import DataTable from './DataTable.svelte'
  import { objectRows } from './lib/places.js'

  /** @typedef {import('./lib/places.js').ObjectRecord} ObjectRecord */
  /** @typedef {import('./lib/places.js').ObjectRow} ObjectRow */

  /**
   * @typedef {Object} Props
   * @property {readonly ObjectRecord[]} [objects] khaosd's object rows.
   * @property {string} [selected] The selected row's id.
   * @property {string} [filter] Narrows the rows by text.
   * @property {(id: string) => void} [onselect] Reports a selected row.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [status] The objects' read: a failed or unfinished read is said, never shown as an empty story.
   * @property {() => void} [onretry] Try again after a failed read.
   */

  /** @type {Props} */
  let { objects = [], selected = '', filter = '', onselect = undefined, status = { kind: 'loaded' }, onretry = undefined } = $props()

  const columns = [
    { key: 'name', label: 'Name', width: 'minmax(160px, 1fr)', value: (/** @type {ObjectRow} */ r) => r.name },
    { key: 'scenes', label: 'Sc', width: '44px', align: /** @type {const} */ ('end'), value: (/** @type {ObjectRow} */ r) => r.scenes },
    { key: 'named', label: 'Named', width: '56px', align: /** @type {const} */ ('end'), value: (/** @type {ObjectRow} */ r) => r.named },
    { key: 'group', label: 'Group', width: 'minmax(80px, 140px)', value: (/** @type {ObjectRow} */ r) => r.group },
  ]
</script>

<DataTable
  rows={objectRows(objects)}
  {columns}
  rowKey={(/** @type {ObjectRow} */ r) => r.id}
  label="Objects"
  {selected}
  {filter}
  {onselect}
  {status}
  {onretry}
  loadingLabel="Reading objects…"
  empty="This story has no objects."
  uiId="story.objects" />
