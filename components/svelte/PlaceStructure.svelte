<script>
  // A place's Structure step, first on the Place Builder rail: choose a size and a building,
  // lay out a deterministic floor plan, say what each analysed area is, then review the plan
  // the host renders below (khaos-manager#1072, khaos-app#589). The host owns every value
  // and all copy but the control labels; the engine lays the plan out.
  import Button from './Button.svelte'
  import Menu from './Menu.svelte'
  import SegmentedControl from './SegmentedControl.svelte'

  /**
   * @typedef {Object} Props
   * @property {readonly {value:string,label:string}[]} [presets] The sizes the engine offers.
   * @property {string} [preset] The chosen size; '' when none is chosen.
   * @property {(value:string)=>void} [onpreset] Asked to choose a size.
   * @property {readonly string[]} [places] The kinds of building the engine lays out.
   * @property {string} [place] The chosen building.
   * @property {(value:string)=>void} [onplace] Asked to choose a building.
   * @property {()=>void} [onlayout] Asked to lay out a plan, or another one.
   * @property {boolean} [first] Nothing is laid out yet, so laying out is the primary action.
   * @property {boolean} [another] A plan exists; the action lays out another.
   * @property {boolean} [canLayOut] The host can lay out with what is chosen.
   * @property {boolean} [busy] A layout is in progress.
   * @property {readonly {id:string,label:string}[]} [areas] The place's analysed areas.
   * @property {readonly string[]} [kinds] The room kinds an area can be.
   * @property {Record<string,string>} [areaKinds] Each area's kind by id; absent or '' is none.
   * @property {(areaId:string,kind:string)=>void} [onkind] Asked to set an area's kind; '' clears it.
   * @property {readonly string[]} [problems] What stops or limits the layout, in the host's words.
   * @property {import('svelte').Snippet} [children] The plan's review, below the controls.
   */

  /** @type {Props} */
  let { presets = [], preset = '', onpreset = undefined, places = [], place = '', onplace = undefined, onlayout = undefined, first = false, another = false, canLayOut = true, busy = false, areas = [], kinds = [], areaKinds = {}, onkind = undefined, problems = [], children = undefined } = $props()

  const placeItems = $derived(places.map((p) => ({ value: p, label: p })))
  const kindItems = $derived([{ value: '', label: '—' }, ...kinds.map((k) => ({ value: k, label: k }))])
</script>

<div class="ui-structure" data-ui-id="place.structure">
  <div class="ui-structure__row" role="group" aria-label="Size">
    <SegmentedControl label="Size" value={preset} items={presets} onselect={(value) => onpreset?.(value)} />
    <Menu label="Building" value={place} items={placeItems} disabled={!preset} onselect={(value) => onplace?.(value)} />
    <Button variant={first ? 'primary' : 'secondary'} disabled={!canLayOut || busy} onclick={() => onlayout?.()}>{another ? 'Another layout' : 'Lay out'}</Button>
  </div>
  {#if areas.length}
    <div class="ui-structure__row" role="group" aria-label="Areas">
      {#each areas as area (area.id)}
        <!-- The name is seen here and announced by the trigger ("Kitchen: —"), so it is hidden
             from assistive technology rather than read twice. -->
        <span class="ui-structure__area">
          <span aria-hidden="true">{area.label}</span>
          <Menu label={area.label} value={areaKinds[area.id] ?? ''} items={kindItems} onselect={(kind) => onkind?.(area.id, kind)} />
        </span>
      {/each}
    </div>
  {/if}
  {#if problems.length}
    <ul class="ui-structure__problems" role="status">
      {#each problems as problem, i (i)}<li>{problem}</li>{/each}
    </ul>
  {/if}
  {#if children}<div class="ui-structure__review">{@render children()}</div>{/if}
</div>

<style>
  .ui-structure {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .ui-structure__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-bottom: 1px solid var(--border-default);
  }
  /* Menu's trigger fills its container (width: 100%), which in a wrapping row takes a
     whole line; in these rows each menu is as wide as its value. */
  .ui-structure__row :global(.ui-menu__trigger) {
    width: auto;
  }
  .ui-structure__area {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }
  .ui-structure__problems {
    margin: 0;
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) var(--spacing-xl);
    font-size: var(--body-md-size);
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-default);
  }
  .ui-structure__review {
    flex: 1;
    min-height: 0;
  }
</style>
