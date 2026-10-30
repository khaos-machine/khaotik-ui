<script>
  // EventLog — the Activity window's table (data-layer plan K16; audit §1.10, §4.1).
  //
  // One row per committed change, in the order given (the host sends newest first),
  // grouped under the reader's day with a count, on DataTable's virtualised row window, so
  // B4P's 695 changes put a viewport's worth of rows in the DOM rather than all of them.
  // The host formats time and day (they are relative: today's "Today" is tomorrow's
  // "Yesterday"); the log draws what it is given.
  import DataTable from './DataTable.svelte'

  /**
   * @typedef {Object} LogEvent
   * @property {string} id A stable id, such as the ledger sequence.
   * @property {string} [day] The day the row is grouped under, as the reader says it.
   * @property {string} time The time, formatted by the host.
   * @property {string} kind The change kind.
   * @property {string} actor Who made it.
   * @property {string} change What it changed or decided.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly LogEvent[]} [events] The changes, in the order to show them (newest first).
   * @property {string} [filter] Rows whose any column contains this text are shown.
   * @property {string} [selected] The selected event's id.
   * @property {(id: string) => void} [onselect] Asked with an event's id.
   * @property {number} [viewportHeight] The body's height in px. 0 measures it.
   * @property {string} [label] The grid's accessible name.
   * @property {string} [empty] What an empty log says.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let {
    events = [],
    filter = '',
    selected = '',
    onselect = undefined,
    viewportHeight = 0,
    label = 'Activity',
    empty = 'No changes.',
    uiId = 'log',
  } = $props()

  /** @type {import('./lib/table.js').Column<LogEvent>[]} */
  const columns = [
    { key: 'time', label: 'Time', width: '72px', value: (e) => e.time, sortable: false },
    { key: 'kind', label: 'Kind', width: '120px', value: (e) => e.kind, sortable: false },
    { key: 'actor', label: 'Actor', width: '140px', value: (e) => e.actor, sortable: false },
    { key: 'change', label: 'Change', width: 'minmax(200px, 1fr)', value: (e) => e.change, sortable: false },
  ]

  const grouped = $derived(events.some((e) => e.day))
</script>

<DataTable
  rows={events}
  {columns}
  rowKey={(e) => e.id}
  {label}
  {filter}
  {selected}
  {onselect}
  groupBy={grouped ? (e) => e.day ?? '' : undefined}
  {viewportHeight}
  {empty}
  {uiId} />
