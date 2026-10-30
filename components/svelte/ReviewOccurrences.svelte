<script>
  // The chosen group's occurrences: each line in full, its scene, and a mark that keeps it in the
  // group's decision. Unchecked, it is left for later and decided on its own. Choosing a row
  // reports that occurrence. Moved from Khaos App (catalog app-coverage plan, T6).
  import Checkbox from './Checkbox.svelte'
  import DataTable from './DataTable.svelte'
  import EmptyState from './EmptyState.svelte'

  /** @typedef {import('./lib/review.js').MentionGroup} MentionGroup */
  /** @typedef {import('./lib/review.js').ReviewItem} ReviewItem */

  /**
   * @typedef {Object} Props
   * @property {MentionGroup | null} [group] The chosen group, with `included`; null when none is chosen.
   * @property {string} [chosen] The occurrence shown in the answer pane, by record id, or ''.
   * @property {boolean} [busy] A decision is being sent: the marks wait.
   * @property {(sceneId: string) => number | null} [sceneNumber] A scene's 1-based number, or null when the host does not hold it.
   * @property {(recordId: string) => void} [onchoose] Reports the occurrence chosen.
   * @property {(recordId: string, excluded: boolean) => void} [onexclude] Reports an occurrence left out of the decision, or put back.
   */

  /** @type {Props} */
  let { group = null, chosen = '', busy = false, sceneNumber = () => null, onchoose = undefined, onexclude = undefined } = $props()

  const includedIds = $derived(new Set((group?.included ?? group?.items ?? []).map((i) => i.record.id)))
  const included = (/** @type {ReviewItem} */ i) => includedIds.has(i.record.id)

  const columns = [
    { key: 'include', label: '', width: '32px', sortable: false, value: (/** @type {ReviewItem} */ i) => (included(i) ? 1 : 0), cell: includeCell },
    { key: 'scene', label: 'Sc', width: '40px', align: /** @type {const} */ ('end'), value: (/** @type {ReviewItem} */ i) => sceneNumber(i.record.sceneId) },
    { key: 'line', label: 'Line', width: 'minmax(160px, 1fr)', value: (/** @type {ReviewItem} */ i) => (i.kind === 'relation' ? (i.record.spans[0]?.lineText ?? '') : i.record.lineText) },
  ]
</script>

{#snippet includeCell(/** @type {ReviewItem} */ item)}
  <Checkbox
    label="Include line {item.record.lineNumber}"
    hideLabel
    checked={included(item)}
    disabled={busy || (group?.items.length ?? 0) < 2}
    onchange={(/** @type {boolean} */ on) => onexclude?.(item.record.id, !on)} />
{/snippet}

{#if group}
  <DataTable
    rows={group.items}
    {columns}
    rowKey={(/** @type {ReviewItem} */ i) => i.record.id}
    label="Occurrences of {group.label}"
    selected={chosen}
    onselect={(/** @type {string} */ id) => onchoose?.(id)}
    wrap
    uiId="review.occurrences" />
{:else}
  <EmptyState title="No mention chosen" description="Choose a mention in the queue to see every line it is on." icon="quotes" />
{/if}
