<script>
  import SidebarNav from './SidebarNav.svelte'
  import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'
  import { SECTION_LABELS, CREATABLE_IN } from '../../fixtures.js'

  // The catalog sidebar: the title row, and the scrollable list for ONE
  // section. State + handlers are passed in; this component owns only layout
  // and one piece of local UI state (whether the search field is expanded).
  //
  // Brand moved to the banner; the section axis and the view controls moved to
  // SectionRail beside this column. Both left for the same reason — they are
  // fixed-cost controls, and anything inside `sidebar__content` inherits the
  // list's scroll length as its reach cost.
  //
  // Search left too and has come back, onto the title row. The reason it left
  // ("it filters the whole registry, so the one-section column understated it")
  // conflated what search filters OVER with where the result lands. The result
  // only ever lands here; search never touches the canvas or the rail, and the
  // banner spanned both. What was genuinely wrong was the word "Foundation"
  // standing above cross-section results — see the title row below.
  //
  // The query itself still lives in App: this column hosts the control and
  // forwards changes up, it does not own the filter.
  let {
    matches = [],
    selected,
    collapsed = {},
    query = '',
    sortMode = 'group',
    section = 'brandkit',
    onselect,
    ontoggle,
    onquery,
    // Compose is the one section you ADD to, so it is the one section whose
    // title row carries a create control. Rendered only there rather than
    // everywhere-and-disabled: a permanently inert button on four other
    // sections is a control that teaches nothing.
    oncreate = undefined,
    // Suppresses the create control because the CANVAS is already offering it
    // (D69/D70). Two buttons with the same accessible name on screen at once is
    // the defect that retired Palette.svelte, and the empty Composer canvas
    // carries create by design — so while it is showing, this row stands down.
    //
    // Not a mode gate. The create control is still section-gated and nothing
    // else; it returns the moment the canvas has something open and stops
    // offering create itself.
    createElsewhere = false,
    // Forwarded straight to SidebarNav — this component owns layout, not the
    // function decision. See SidebarNav's own header for what each gates.
    oninsert = undefined,
    canInsert = false,
    editingSlug = null,
  } = $props()

  // Local, and only about presentation. `expanded` is deliberately NOT just
  // `open`: a live query holds the field open on its own, so a filter can never
  // be in force behind a collapsed icon. That is the "why is my list empty"
  // trap, and it is the one thing Figma's version of this control is careful
  // about. Gated by App.test.js — the pair, not either half: an always-open
  // field would satisfy the stays-open case by itself.
  let open = $state(false)
  let input = $state(null)

  const expanded = $derived(open || query !== '')

  function clear() {
    open = false
    onquery?.('')
  }

  $effect(() => {
    if (expanded) input?.focus()
  })
</script>

<nav class="sidebar" aria-label="Components">
  <!-- Chrome, not content: the list scrolls under this row.

       Idle, it is the one place the active destination is named. The rail is
       icon-only and its glyphs are assignments — palette for BrandKit, cube for
       Foundation — so without this the word appears nowhere: the banner carries
       brand, the list starts at a group heading, and the canvas names the
       fixture rather than the section.

       Searching, the title yields the row entirely. That is not a space saving.
       A query flattens the list across every section (SidebarNav), so a row
       reading "BrandKit" over results drawn from Screens and Components was
       naming a section that held none of them — measured, and true of the
       banner arrangement too. The word is absent for exactly as long as it
       would be wrong. -->
  <div class="sidebar__head">
    {#if expanded}
      <div class="sidebar__search">
        <Icon name="magnifying-glass" />
        <input
          bind:this={input}
          type="search"
          placeholder="Search all sections"
          aria-label="Search components"
          value={query}
          oninput={(e) => onquery?.(e.currentTarget.value)}
          onblur={() => (open = false)}
          onkeydown={(e) => e.key === 'Escape' && clear()}
        />
        <button
          type="button"
          class="sidebar__clear focus-ring focus-ring--inset hover-fill"
          aria-label="Clear search"
          title="Clear search"
          onclick={clear}
        >
          <Icon name="x" />
        </button>
      </div>
    {:else}
      <h2 class="sidebar__title">{SECTION_LABELS[section] ?? section}</h2>
      <!-- The create control belongs to the SECTION, because that is what says
           what kind of thing you would be making. Compose is a mode now, so
           there is no one place that means "author something" — Components makes
           a component, Screens a screen, Flows a flow. -->
      {#if oncreate && CREATABLE_IN[section] && !createElsewhere}
        <button
          type="button"
          class="sidebar__search-toggle focus-ring focus-ring--inset hover-fill"
          aria-label={CREATABLE_IN[section].label}
          title={CREATABLE_IN[section].label}
          onclick={() => oncreate(CREATABLE_IN[section].kind)}
        >
          <Icon name="plus" />
        </button>
      {/if}
      <button
        type="button"
        class="sidebar__search-toggle focus-ring focus-ring--inset hover-fill"
        aria-label="Search components"
        title="Search components"
        onclick={() => (open = true)}
      >
        <Icon name="magnifying-glass" />
      </button>
    {/if}
  </div>

  <div class="sidebar__content">
    <SidebarNav
      {matches}
      {selected}
      {collapsed}
      {sortMode}
      {query}
      {section}
      {onselect}
      {ontoggle}
      {oninsert}
      {canInsert}
      {editingSlug}
    />
  </div>
</nav>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    background: var(--surface-base);
    border-right: 1px solid var(--border-hairline);
    padding: var(--spacing-md);
    overflow: hidden;
  }

  /* One row, two states. The height is fixed rather than derived from whichever
     child is mounted: the title and the field have different intrinsic heights,
     and letting the row take them would make the entire list jump a few pixels
     on every expand and collapse. */
  .sidebar__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xs);
    flex-shrink: 0;
    height: 30px;
    margin-bottom: var(--spacing-sm);
  }

  /* Sentence case and a clear step above the group headings, which are 10px
     uppercase. A title that looked like one would stack two headings — the
     mistake the workspace bar made above the section bar, in a new costume. */
  .sidebar__title {
    margin: 0;
    padding: 0 var(--spacing-xs);
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    font-weight: var(--label-md-weight);
    letter-spacing: var(--label-md-track);
    color: var(--text-primary);
  }

  /* Right margin of the row. Sized under the rail's 36px because that rail is
     the app's navigation and this is a filter on one column — matching it would
     claim a peer's weight. */
  .sidebar__search-toggle,
  .sidebar__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }



  .sidebar__search-toggle :global(.ph),
  .sidebar__clear :global(.ph) {
    font-size: 0.95rem;
  }

  /* Takes the whole row. The column is 248px wide, so a field sharing the row
     with the title would leave neither enough to read — and the title has
     nothing to say while a query is live anyway. */
  .sidebar__search {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 4px 0 8px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    background: color-mix(in oklab, var(--text-primary) 3%, transparent);
    color: var(--text-tertiary);
  }

  .sidebar__search:focus-within {
    border-color: var(--border-focus);
  }

  .sidebar__search :global(.ph) {
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .sidebar__search input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: none;
    font: inherit;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-primary);
    outline: none;
  }

  .sidebar__search input::placeholder {
    color: var(--text-tertiary);
  }

  /* Safari paints its own clear affordance inside type="search"; ours is a
     labelled button, and two of them in one field is one too many. */
  .sidebar__search input::-webkit-search-cancel-button {
    display: none;
  }

  /* The column is the list, and the list scrolls. */
  .sidebar__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

</style>
