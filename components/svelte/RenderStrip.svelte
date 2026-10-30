<script>
  // RenderStrip — one cell per scene or segment, coloured by its render state (data-layer
  // plan K15; audit §3.6, §4.1). Perform's strip under the tables: the whole story's render
  // state at a glance, and a way to jump to a scene.
  //
  // A cell's state is RenderMark's: ready, stale or missing, named in the cell's accessible
  // name as well as its colour. A cell with no state is ABSENT, not missing: no tone and no
  // state in its name (audit §3.13). A click ASKS the host with the cell's id.
  /**
   * @typedef {Object} StripCell
   * @property {string} id
   * @property {string} label The cell's name: the scene's number, or the segment's.
   * @property {'ready' | 'stale' | 'missing' | null} [state] The engine's state. Absent is not missing.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly StripCell[]} [cells] One cell per scene or segment, in story order.
   * @property {string} [selected] The selected cell's id.
   * @property {(id: string) => void} [onselect] Asked with a cell's id.
   * @property {string} [label] The strip's accessible name.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { cells = [], selected = '', onselect = undefined, label = 'Render state', uiId = 'strip' } = $props()

  const NAMES = { ready: 'Ready', stale: 'Stale', missing: 'Missing' }

  /** @param {StripCell} cell */
  const known = (cell) => (cell.state && Object.hasOwn(NAMES, cell.state) ? cell.state : null)
</script>

<div class="strip" role="group" aria-label={label} data-ui-id={uiId}>
  {#each cells as cell (cell.id)}
    {@const state = known(cell)}
    <button
      type="button"
      class="strip__cell"
      data-state={state ?? undefined}
      aria-label={state ? `${cell.label}, ${NAMES[state]}` : cell.label}
      aria-pressed={cell.id === selected}
      title={state ? `${cell.label}: ${NAMES[state]}` : cell.label}
      data-ui-id="{uiId}.cell.{cell.id}"
      onclick={() => onselect?.(cell.id)}></button>
  {/each}
</div>

<style>
  .strip {
    display: flex;
    gap: 1px;
    height: 12px;
    min-width: 0;
  }
  .strip__cell {
    flex: 1;
    min-width: 2px;
    padding: 0;
    border: 0;
    background: var(--surface-raised);
    cursor: default;
  }
  .strip__cell[data-state='ready'] {
    background: var(--tone-success);
  }
  .strip__cell[data-state='stale'] {
    background: var(--tone-warning);
  }
  .strip__cell[data-state='missing'] {
    background: var(--text-secondary);
  }
  .strip__cell[aria-pressed='true'] {
    box-shadow: inset 0 0 0 var(--size-stroke-focus) var(--text-primary);
  }
  .strip__cell:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
  }
</style>
