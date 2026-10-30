<script>
  // Scenes, as a table: #, Scene, Words, Lines, Read as a RenderMark (ready once a read exists,
  // absent before, never "missing") and Analysis, the engine's standing: current, stale, or
  // nothing when there is none. An analysed scene leads with its analysis title and keeps its
  // heading as a subtitle. Moved from Khaos App (catalog app-coverage plan, T3).
  import DataTable from './DataTable.svelte'
  import RenderMark from './RenderMark.svelte'
  import { analysisMark } from './lib/characters.js'
  import { sceneRows } from './lib/scenes.js'

  /** @typedef {import('./lib/scenes.js').SceneRecord} SceneRecord */
  /** @typedef {import('./lib/scenes.js').SceneRow} SceneRow */

  /**
   * @typedef {Object} Props
   * @property {readonly SceneRecord[]} [scenes] khaosd's scene rows.
   * @property {Readonly<Record<string, { state: string }>>} [standings] Each scene's analysis standing by id.
   * @property {Readonly<Record<string, number>>} [reads] Read counts the host holds newer than the rows, by scene id: a read just made shows at once.
   * @property {string} [selected] The selected row's id.
   * @property {string} [filter] Narrows the rows by text.
   * @property {(id: string) => void} [onselect] Reports a selected row.
   * @property {{ kind: 'loading' } | { kind: 'failed', message: string } | { kind: 'loaded' }} [status] The scenes' read: a failed or unfinished read is said, never shown as an empty story.
   * @property {() => void} [onretry] Try again after a failed read.
   */

  /** @type {Props} */
  let { scenes = [], standings = {}, reads = {}, selected = '', filter = '', onselect = undefined, status = { kind: 'loaded' }, onretry = undefined } = $props()

  const rows = $derived(
    sceneRows(scenes).map((r) => {
      const listed = reads[r.id]
      return listed === undefined ? r : { ...r, reads: listed, read: listed > 0 ? /** @type {const} */ ('ready') : null }
    }),
  )
  /** @param {string} id */
  const mark = (id) => analysisMark(standings[id])

  const columns = [
    { key: 'n', label: '#', width: '40px', align: /** @type {const} */ ('end'), value: (/** @type {SceneRow} */ r) => r.n },
    {
      key: 'slugline',
      label: 'Scene',
      width: 'minmax(150px, 1fr)',
      value: (/** @type {SceneRow} */ r) => r.title || r.slugline,
      subtitle: (/** @type {SceneRow} */ r) => (r.title ? r.slugline : null),
    },
    { key: 'words', label: 'Words', width: '56px', align: /** @type {const} */ ('end'), value: (/** @type {SceneRow} */ r) => r.words },
    { key: 'lines', label: 'Lines', width: '48px', align: /** @type {const} */ ('end'), value: (/** @type {SceneRow} */ r) => r.lines },
    { key: 'read', label: 'Read', width: '72px', value: (/** @type {SceneRow} */ r) => r.reads, cell: readCell },
    { key: 'analysis', label: 'An', width: '36px', value: (/** @type {SceneRow} */ r) => mark(r.id) ?? '', cell: analysisCell },
  ]
</script>

{#snippet readCell(/** @type {SceneRow} */ row)}
  <RenderMark state={row.read} label={row.reads === 1 ? '1 read' : `${row.reads} reads`} />
{/snippet}

{#snippet analysisCell(/** @type {SceneRow} */ row)}
  {@const m = mark(row.id)}
  <RenderMark state={m} label={m === 'stale' ? 'Analysis stale' : 'Analysis current'} compact />
{/snippet}

<DataTable
  {rows}
  {columns}
  rowKey={(/** @type {SceneRow} */ r) => r.id}
  label="Scenes"
  {selected}
  {filter}
  {onselect}
  {status}
  {onretry}
  loadingLabel="Reading scenes…"
  empty="This story has no scenes."
  uiId="story.scenes" />
