<script>
  // A project's images, as a table grouped by subject. A row's thumbnail is asked for as its
  // cell renders, and the table renders only the rows in view, so only those are fetched; the
  // host resolves each and hands the URL back. Moved from Khaos App (catalog app-coverage plan,
  // T5).
  import DataTable from './DataTable.svelte'
  import ImageThumb from './ImageThumb.svelte'
  import { formatBytes } from './lib/bytes.js'

  /** @typedef {import('./lib/images.js').ImageRow} ImageRow */

  /**
   * @typedef {Object} Props
   * @property {readonly ImageRow[]} [rows] One row per committed image; `imageRows` in `lib/images.js` builds them from khaosd's subjects.
   * @property {Readonly<Record<string, string>>} [urls] Resolved thumbnail URLs by reference id.
   * @property {(referenceId: string) => void} [onthumb] Asked for a row's thumbnail once its cell renders without one.
   * @property {string} [selected] The selected row's reference id.
   * @property {string} [filter] Narrows the rows by text.
   * @property {(referenceId: string) => void} [onselect] Reports a selected row.
   */

  /** @type {Props} */
  let { rows = [], urls = {}, onthumb = undefined, selected = '', filter = '', onselect = undefined } = $props()

  const columns = [
    { key: 'thumb', label: '', width: '48px', value: () => '', cell: thumbCell },
    { key: 'label', label: 'Label', width: 'minmax(140px, 1fr)', value: (/** @type {ImageRow} */ r) => r.label },
    { key: 'subject', label: 'Subject', width: '96px', value: (/** @type {ImageRow} */ r) => r.subjectName },
    { key: 'origin', label: 'Origin', width: '80px', value: (/** @type {ImageRow} */ r) => r.origin },
    { key: 'size', label: 'Size', width: '72px', align: /** @type {const} */ ('end'), value: (/** @type {ImageRow} */ r) => formatBytes(r.sizeBytes) },
    { key: 'dimensions', label: 'Dimensions', width: '96px', align: /** @type {const} */ ('end'), value: (/** @type {ImageRow} */ r) => `${r.width} × ${r.height}` },
  ]

  /** Asks for a thumbnail once, as its cell mounts. @param {string} referenceId */
  const askFor = (referenceId) => () => {
    if (!urls[referenceId]) onthumb?.(referenceId)
  }
</script>

{#snippet thumbCell(/** @type {ImageRow} */ row)}
  <span class="ui-image-table__thumb" {@attach askFor(row.referenceId)}>
    <ImageThumb src={urls[row.referenceId] ?? ''} width={row.width} height={row.height} name={row.label} kind={row.subjectKind} square />
  </span>
{/snippet}

<DataTable
  {rows}
  {columns}
  rowKey={(/** @type {ImageRow} */ r) => r.referenceId}
  label="Images"
  {selected}
  {onselect}
  {filter}
  groupBy={(/** @type {ImageRow} */ r) => r.subjectName}
  rowHeight={48}
  empty="This project has no images."
  uiId="story.images" />

<style>
  .ui-image-table__thumb {
    display: contents;
  }
</style>
