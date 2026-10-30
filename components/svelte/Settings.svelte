<script>
  // The Settings screen (khaos.machine.x SettingsView): a category sidebar and a pane.
  //
  // Props-driven and content-agnostic on purpose. What belongs in Settings differs per
  // consumer and per milestone — khaos.machine.x has Providers / Local Services / Engine /
  // General / Updates, and khaos-app starts with fewer — so this owns the SHAPE (sidebar,
  // selection, pane scrolling, the settings-row grammar) and the host supplies the rows.
  // Baking the categories in would mean editing the library every time an app gained a
  // preference.
  import Icon from './Icon.svelte'

  /**
   * A sidebar category.
   * @typedef {Object} Category
   * @property {string} id
   * @property {string} label
   * @property {string} [icon] Phosphor icon name.
   */

  /**
   * @typedef {Object} Props
   * @property {readonly Category[]} [categories] `[{ id, label, icon? }]`, rendered in the order given. **Values must be distinct** — this list is keyed on `id`, so a duplicate throws `each_key_duplicate` and the control does not render. The same rule a `<select>` has always had.
   * @property {string} [selected] The category id being shown. Falls back to the first when unset or unknown.
   * @property {(id: string) => void} [onSelect] Called with the chosen category id.
   * @property {import('svelte').Snippet} [children] The pane for the selected category, supplied by the host.
   */

  /** @type {Props} */
  let {
    // `[{ id, label, icon? }]`, rendered in the order given.
    categories = [],
    selected = '',
    // camelCase because this is authored. The lowercase `onselect` this arrived
    // with is the ADOPTED convention — Menu and SegmentedControl take it because
    // Ark UI does — while what was hand-written here took `onSelect`
    // (SceneList and SceneRow, since retired). Two spellings of the same callback
    // across one library is what D58 was a breaking change to fix; renaming it
    // before it ships costs nothing, and after it ships costs that again.
    onSelect = undefined,
    // The pane for the selected category. Compose it from the existing atoms —
    // LabeledField is already the label–value row, Toggle and SegmentedControl are the
    // controls. No settings-specific row atom was added because one already exists.
    children = undefined,
  } = $props()

  const current = $derived(categories.find((c) => c.id === selected) ?? categories[0])
</script>

<div class="settings" class:settings--single={categories.length < 2}>
  <!-- One category leaves nothing to choose, so it draws no rail and the pane takes the window. -->
  {#if categories.length > 1}
    <nav class="settings__rail" aria-label="Settings categories">
      {#each categories as category (category.id)}
        <button
          class="settings__category"
          class:settings__category--on={category.id === current?.id}
          type="button"
          aria-current={category.id === current?.id ? 'page' : undefined}
          onclick={() => onSelect?.(category.id)}>
          {#if category.icon}<Icon name={category.icon} />{/if}
          <span>{category.label}</span>
        </button>
      {/each}
    </nav>
  {/if}

  <div class="settings__pane">
    {#if current}
      <!-- The window is already titled Settings, so the pane names only its category. -->
      <header class="settings__header"><h1 class="settings__title">{current.label}</h1></header>
    {/if}
    <div class="settings__content">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  /* A desktop preferences window: a source-list rail, a titled pane, and padding on every
     edge so no control meets the window frame. Text is the kit's body size throughout;
     the host's pane content inherits it rather than the browser's 16px default. */
  .settings {
    display: grid;
    grid-template-columns: 188px minmax(0, 1fr);
    height: 100%;
    min-height: 0;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
  }

  .settings--single {
    grid-template-columns: minmax(0, 1fr);
  }

  .settings__rail {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    /* A settings rail is a source list, not a toolbar: it keeps its own edge so the pane
       reads as the thing being edited. */
    border-right: 1px solid var(--border-default);
    background: var(--surface-raised);
    padding: var(--spacing-sm) var(--spacing-xs);
    overflow-y: auto;
  }

  .settings__category {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    min-height: 28px;
    padding: 0 var(--spacing-xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-secondary);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .settings__category:hover {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
  }

  .settings__category--on {
    background: color-mix(in oklab, var(--text-primary) 10%, transparent);
    color: var(--text-primary);
    font-weight: 600;
  }

  .settings__category:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: -2px;
  }

  .settings__pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .settings__header {
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-sm);
    border-bottom: 1px solid var(--border-subtle, var(--border-default));
  }

  .settings__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: var(--heading-md-weight);
    color: var(--text-primary);
  }

  /* Only the pane scrolls. The rail stays put, so you never lose your place in the
     categories while reading a long one — the same rule the WelcomeWindow rail follows. The
     padding is inside the scroller, so content scrolls under the header, not past the
     window's edge. */
  /* The containing block for anything positioned in a pane: a hidden label otherwise escapes
     this scroller and scrolls the whole window. */
  .settings__content {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
  }
</style>
