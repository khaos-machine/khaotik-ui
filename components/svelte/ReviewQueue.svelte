<script>
  // Review's queue: one row per group of identical mentions, with how many there are and in how
  // many scenes. Choosing a row reports its group. Moved from Khaos App (catalog app-coverage
  // plan, T6).
  import DataTable from './DataTable.svelte'

  /** @typedef {import('./lib/review.js').MentionGroup} MentionGroup */

  /**
   * @typedef {Object} Props
   * @property {readonly MentionGroup[]} [groups] The queue, as the host grouped and filtered it.
   * @property {string} [selected] The chosen group's key, or ''.
   * @property {(key: string) => void} [onselect] Reports the group chosen.
   */

  /** @type {Props} */
  let { groups = [], selected = '', onselect = undefined } = $props()

  const columns = [
    { key: 'label', label: 'Mention', width: 'minmax(120px, 1fr)', value: (/** @type {MentionGroup} */ g) => g.label },
    { key: 'count', label: 'Times', width: '56px', align: /** @type {const} */ ('end'), value: (/** @type {MentionGroup} */ g) => g.items.length },
    { key: 'scenes', label: 'Sc', width: '44px', align: /** @type {const} */ ('end'), value: (/** @type {MentionGroup} */ g) => g.scenes },
  ]
</script>

<DataTable
  rows={groups}
  {columns}
  rowKey={(/** @type {MentionGroup} */ g) => g.key}
  label="Review queue"
  {selected}
  {onselect}
  wrap
  empty="Nothing left to review here."
  uiId="review.queue" />
