<script>
  import { untrack } from 'svelte'
  // Dock — a split-or-tab-group tree of panels (audit §3.2, §4.1). The layout is data
  // (`lib/dock.js`): the Dock draws it, changes it through the gutters and tabs, and hands
  // every new tree to `onlayoutchange`. Where the host keeps it is the host's business —
  // the Dock reads no storage, so a host can save one layout per workspace (khaos-app A-Q3).
  //
  // Panels are the host's content, drawn through the `panel` snippet by id. A group of one
  // panel draws no tab strip: its own first row (a table header, the inspector title)
  // names it, which keeps the chrome above the work thin (audit §3.2).
  //
  // ponytail: no drag-to-re-dock and no user-defined layouts. The tree is data, so both
  // can come later without a new model (audit §3.2, "Not in this direction").
  import { minExtent, resizeSplit, selectTab, toggleSplit } from './lib/dock.js'

  /**
   * @typedef {import('./lib/dock.js').DockNode} DockNode
   * @typedef {import('./lib/dock.js').DockSplit} DockSplit
   * @typedef {import('./lib/dock.js').DockGroup} DockGroup
   * @typedef {import('./lib/dock.js').DockPanel} DockPanel
   */

  /**
   * @typedef {Object} Props
   * @property {DockNode | null} [layout] The tree to draw. Pass back what `onlayoutchange` gave you to keep it. None draws nothing.
   * @property {Record<string, DockPanel>} [panels] Every panel the layout may name: label, minimum and default size.
   * @property {import('svelte').Snippet<[string]>} [panel] Draws one panel's content, by id. Without it the panes are empty.
   * @property {(layout: DockNode) => void} [onlayoutchange] Every resize, collapse and tab change, as the whole new tree.
   * @property {string} [uiId] The `data-ui-id` prefix for gutters, tabs and panes (audit §3.14).
   */

  /** @type {Props} */
  let { layout = null, panels = {}, panel = undefined, onlayoutchange = undefined, uiId = 'dock' } = $props()

  /** @type {DockNode | null} */
  let tree = $state.raw(untrack(() => layout))
  $effect.pre(() => {
    tree = layout
  })

  /** Each split's measured extent along its own direction, for the overlay rule. */
  /** @type {Record<string, number>} */
  let extents = $state({})

  // The keyboard step. Shift is coarse (audit §3.15: ⇧ coarse, as ScrubNumber).
  const STEP = 8
  const COARSE = 4

  /** Only called from a drawn gutter or tab, so a tree exists. */
  const current = () => /** @type {DockNode} */ (tree)

  /** @param {DockNode} next */
  function commit(next) {
    if (next === tree) return
    tree = next
    onlayoutchange?.(next)
  }

  /** @param {DockSplit} split */
  const fixedChild = (split) => (split.fixed === 'start' ? split.children[0] : split.children[1])
  /** @param {DockSplit} split */
  const fillChild = (split) => (split.fixed === 'start' ? split.children[1] : split.children[0])

  /** The name a gutter carries: the panel it resizes, or its active one. @param {DockNode} node */
  function nameOf(node) {
    if (node.kind === 'group') return panels[node.active]?.label ?? node.active
    return nameOf(fixedChild(node))
  }

  /**
   * Below the room both sides need, an `overlay` split floats its fixed child over the
   * other instead of squeezing it (audit §3.4).
   * @param {DockSplit} split
   */
  function overlaid(split) {
    const extent = extents[split.id]
    if (!split.overlay || split.collapsed || extent === undefined) return false
    return extent < minExtent({ ...split, collapsed: false }, panels, split.direction)
  }

  /** Arrow keys grow the fixed side toward the gutter's far side. @param {KeyboardEvent} e @param {DockSplit} split */
  function gutterKey(e, split) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(toggleSplit(current(), split.id))
      return
    }
    const forward = split.direction === 'row' ? 'ArrowRight' : 'ArrowDown'
    const back = split.direction === 'row' ? 'ArrowLeft' : 'ArrowUp'
    if (e.key !== forward && e.key !== back) return
    e.preventDefault()
    const toward = (e.key === forward ? 1 : -1) * (split.fixed === 'start' ? 1 : -1)
    const step = STEP * (e.shiftKey ? COARSE : 1) * toward
    commit(resizeSplit(current(), split.id, (split.collapsed ? 0 : split.size) + step, panels))
  }

  /** @param {PointerEvent} e @param {DockSplit} split */
  function gutterDown(e, split) {
    const target = /** @type {HTMLElement} */ (e.currentTarget)
    const start = split.direction === 'row' ? e.clientX : e.clientY
    const from = split.collapsed ? 0 : split.size
    const sign = split.fixed === 'start' ? 1 : -1
    target.setPointerCapture?.(e.pointerId)
    /** @param {PointerEvent} ev */
    const move = (ev) => {
      const at = split.direction === 'row' ? ev.clientX : ev.clientY
      commit(resizeSplit(current(), split.id, from + (at - start) * sign, panels))
    }
    const up = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', up)
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', up)
  }
</script>

{#snippet group(/** @type {DockGroup} */ g)}
  {#if g.panels.length > 1}
    <div class="dock__group">
      <div class="dock__tabs" role="tablist" aria-label={`${panels[g.active]?.label ?? ''} group`}>
        {#each g.panels as id (id)}
          <button
            type="button"
            role="tab"
            class="dock__tab"
            id="{uiId}-tab-{id}"
            aria-selected={g.active === id}
            aria-controls="{uiId}-tabpanel-{g.id}"
            tabindex={g.active === id ? 0 : -1}
            data-ui-id="{uiId}.tab.{id}"
            onclick={() => commit(selectTab(current(), g.id, id))}>{panels[id]?.label ?? id}</button>
        {/each}
      </div>
      <div
        class="dock__pane"
        role="tabpanel"
        id="{uiId}-tabpanel-{g.id}"
        aria-labelledby="{uiId}-tab-{g.active}"
        data-ui-id="{uiId}.pane.{g.active}">
        <!-- Keyed: another tab is another panel, not the same one with a new argument. -->
        {#key g.active}{@render panel?.(g.active)}{/key}
      </div>
    </div>
  {:else}
    <section class="dock__pane" aria-label={panels[g.active]?.label ?? g.active} data-ui-id="{uiId}.pane.{g.active}">
      {@render panel?.(g.active)}
    </section>
  {/if}
{/snippet}

{#snippet node(/** @type {DockNode} */ n)}
  {#if n.kind === 'group'}
    {@render group(n)}
  {:else}
    {@const fixed = fixedChild(n)}
    {@const fill = fillChild(n)}
    {@const over = overlaid(n)}
    {@const min = minExtent(fixed, panels, n.direction)}
    {@const extent = extents[n.id]}
    {#snippet fixedSide()}
      {#if !n.collapsed}
        <div
          class="dock__fixed"
          class:dock__fixed--overlay={over}
          class:dock__fixed--end={n.fixed === 'end'}
          style:flex-basis="{n.size}px">
          {@render node(fixed)}
        </div>
      {/if}
    {/snippet}
    {#snippet gutter()}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <div
        class="dock__gutter"
        role="separator"
        tabindex="0"
        aria-orientation={n.direction === 'row' ? 'vertical' : 'horizontal'}
        aria-label="Resize {nameOf(fixed)}"
        aria-valuenow={n.collapsed ? 0 : n.size}
        aria-valuemin={min}
        aria-valuemax={extent === undefined ? undefined : Math.max(min, extent - minExtent(fill, panels, n.direction))}
        data-ui-id="{uiId}.gutter.{n.id}"
        onkeydown={(e) => gutterKey(e, n)}
        onpointerdown={(e) => gutterDown(e, n)}></div>
    {/snippet}
    <div
      class="dock__split"
      class:dock__split--column={n.direction === 'column'}
      bind:clientWidth={null, (w) => n.direction === 'row' && (extents[n.id] = w)}
      bind:clientHeight={null, (h) => n.direction === 'column' && (extents[n.id] = h)}>
      {#if n.fixed === 'start'}
        {@render fixedSide()}
        {@render gutter()}
        <div class="dock__fill">{@render node(fill)}</div>
      {:else}
        <div class="dock__fill">{@render node(fill)}</div>
        {@render gutter()}
        {@render fixedSide()}
      {/if}
    </div>
  {/if}
{/snippet}

<div class="dock">{#if tree}{@render node(tree)}{/if}</div>

<style>
  .dock {
    display: flex;
    flex: 1;
    min-width: 0;
    min-height: 0;
    height: 100%;
  }
  .dock__split {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
  .dock__split--column {
    flex-direction: column;
  }
  .dock__fixed {
    flex: none;
    display: flex;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .dock__fill {
    flex: 1;
    display: flex;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  /* Panes sit flush with hairline dividers and no shadow; an overlay is the one floating
     surface, and its shadow is the diffuse one harvest gap 15 asks Andrew about. */
  .dock__fixed--overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    background: var(--surface-raised);
    border-right: var(--size-stroke-hairline) solid var(--border-default);
  }
  .dock__fixed--overlay.dock__fixed--end {
    left: auto;
    right: 0;
    border-right: 0;
    border-left: var(--size-stroke-hairline) solid var(--border-default);
  }
  .dock__gutter {
    flex: none;
    position: relative;
    width: var(--size-stroke-hairline);
    background: var(--border-hairline);
    cursor: col-resize;
    outline: none;
  }
  .dock__split--column > .dock__gutter {
    width: auto;
    height: var(--size-stroke-hairline);
    cursor: row-resize;
  }
  /* The drag hit area is wider than the line: --spacing-xs either side (audit §4.3, "Gutter"). */
  .dock__gutter::after {
    content: '';
    position: absolute;
    inset: 0 calc(var(--spacing-xs) / -2);
  }
  .dock__split--column > .dock__gutter::after {
    inset: calc(var(--spacing-xs) / -2) 0;
  }
  .dock__gutter:hover,
  .dock__gutter:focus-visible {
    background: var(--text-secondary);
  }
  .dock__gutter:focus-visible {
    box-shadow: 0 0 0 var(--size-stroke-focus) var(--border-focus);
  }
  .dock__group,
  .dock__pane {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
  .dock__pane {
    overflow: auto;
  }
  .dock__tabs {
    display: flex;
    flex: none;
    /* 32px: harvest gap 10 (`size.tab`), a literal until Andrew decides it. */
    height: 32px;
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .dock__tab {
    padding: 0 var(--spacing-sm);
    background: none;
    border: 0;
    border-bottom: var(--size-stroke-focus) solid transparent;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--label-md-size);
    cursor: pointer;
  }
  .dock__tab[aria-selected='true'] {
    color: var(--text-primary);
    border-bottom-color: var(--text-primary);
  }
  .dock__tab:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: -2px;
  }
</style>
