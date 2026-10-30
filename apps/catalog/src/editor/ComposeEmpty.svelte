<script>
  // What the Composer opens on (D69).
  //
  // WHY THIS EXISTS AT ALL. Entering the Composer used to inherit whatever the
  // Catalog had selected, and from where the app actually lands — the
  // `brandkit` section, with no saved documents — that meant a read-only
  // BrandKit specimen on the canvas, no create control anywhere (the sidebar's
  // only appears in the three sections `CREATABLE_IN` declares), and every row
  // insert disabled because nothing was open to insert INTO. Measured: 0 of 7.
  // So the authoring surface opened onto something it could not author, with no
  // visible route out. This is that route.
  //
  // ALL THREE KINDS, NOT THE CURRENT SECTION'S. Mirroring `CREATABLE_IN` here
  // would rebuild the dead end one layer up — from BrandKit or Foundation there
  // would again be nothing to press. `createNew` already sets `section` itself,
  // so offering all three costs nothing and removes the section dependency
  // entirely: the rail follows the choice rather than gating it.
  import EmptyState from '@khaos-machine/khaotik-ui/components/svelte/EmptyState.svelte'

  /**
   * @typedef {Object} Props
   * @property {(kind: 'component' | 'screen' | 'flow') => void} [oncreate] Called with the kind to create.
   */

  /** @type {Props} */
  let { oncreate = undefined } = $props()

  // Order is smallest-to-largest, matching the recursive model: a screen is a
  // component that happens to be screen-shaped, a flow is an ordered list of
  // them. Reading the row is reading the ladder.
  const KINDS = [
    { kind: 'component', label: 'New component' },
    { kind: 'screen', label: 'New screen' },
    { kind: 'flow', label: 'New flow' },
  ]
</script>

<main class="compose-empty">
  <EmptyState
    icon="stack-simple"
    title="Nothing open"
    description="The Composer assembles published components into components, pages and flows. Start one, or pick something already composed from the list."
  >
    <div class="compose-empty__actions">
      {#each KINDS as k (k.kind)}
        <button
          type="button"
          class="compose-empty__action focus-ring"
          onclick={() => oncreate?.(k.kind)}
        >{k.label}</button>
      {/each}
    </div>
  </EmptyState>
</main>

<style>
  .compose-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    overflow: auto;
    background: var(--surface-base);
  }

  .compose-empty__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .compose-empty__action {
    padding: 6px 14px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    font: inherit;
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    font-weight: var(--label-md-weight);
    color: var(--text-primary);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
  }

  .compose-empty__action:hover {
    border-color: var(--action-primary);
  }
</style>
