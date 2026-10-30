<script>
  // InspectorSection — a named, collapsible inspector section (data-layer plan K6; audit
  // §3.12). The header is a disclosure button with an optional count; the body is a named
  // region. The section keeps its own open state so it works uncontrolled, starts from the
  // host's `collapsed`, and reports every change through `oncollapse` so a host can
  // remember it.
  /**
   * @typedef {Object} Props
   * @property {string} [title] The section's name.
   * @property {number | null} [count] Shown beside the name, exactly as given. Absent when not given.
   * @property {boolean} [collapsed] Whether the section starts collapsed.
   * @property {(collapsed: boolean) => void} [oncollapse] Called with the new collapsed state.
   * @property {import('svelte').Snippet} [meta] A reading drawn at the end of the header, such as a status pill. Absent when not given.
   * @property {import('svelte').Snippet} [children] The section's body.
   * @property {string} [uiId] The `data-ui-id` prefix (audit §3.14).
   */

  /** @type {Props} */
  let { title = '', count = null, collapsed = false, oncollapse = undefined, meta = undefined, children = undefined, uiId = undefined } = $props()

  const id = $props.id()
  let closed = $state(false)
  $effect.pre(() => {
    closed = collapsed
  })

  function toggle() {
    closed = !closed
    oncollapse?.(closed)
  }
</script>

<section class="section" data-ui-id={uiId}>
  <h3 class="section__heading">
    <button
      type="button"
      class="section__toggle"
      aria-expanded={!closed}
      aria-controls="{id}-body"
      data-ui-id={uiId ? `${uiId}.toggle` : undefined}
      onclick={toggle}>
      <span class="section__chevron" aria-hidden="true">{closed ? '▸' : '▾'}</span>
      <span class="section__title" id="{id}-title">{title}</span>
      {#if typeof count === 'number'}<span class="section__count">{count}</span>{/if}
      {#if meta}<span class="section__meta">{@render meta()}</span>{/if}
    </button>
  </h3>
  {#if !closed}
    <div class="section__body" id="{id}-body" role="region" aria-labelledby="{id}-title">
      {@render children?.()}
    </div>
  {/if}
</section>

<style>
  .section {
    border-bottom: var(--size-stroke-hairline) solid var(--border-default);
  }
  .section__heading {
    margin: 0;
    font: inherit;
  }
  .section__toggle {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    width: 100%;
    /* 24px: harvest gap 9 (`size.row`), a literal until Andrew decides it. */
    height: 24px;
    padding: 0 var(--spacing-sm);
    font-size: var(--caption-size);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: default;
  }
  .section__toggle:focus-visible {
    outline: var(--size-stroke-focus) solid var(--border-focus);
    outline-offset: calc(-1 * var(--size-stroke-focus));
  }
  .section__chevron {
    width: 1em;
  }
  .section__title {
    flex: 1;
  }
  .section__meta {
    display: inline-flex;
    font-weight: normal;
    text-transform: none;
    letter-spacing: normal;
  }
  .section__count {
    font-variant-numeric: tabular-nums;
  }
  .section__body {
    padding: 0 var(--spacing-sm) var(--spacing-xs);
  }
</style>
