<script>
  // The candidates competing to become one component, and a way to start another.
  //
  // ONE AT A TIME, switched. A variant is a candidate replacement, so the
  // question it answers is "should this become the thing?" — which you ask of one
  // at a time against the thing itself. Laying them all out together is the other
  // useful view and is a different control; this is the one that has to exist
  // first, because without it a variant cannot be looked at at all.
  //
  // THE PARENT IS ALWAYS THE FIRST TAB, and it is what you are comparing against.
  // It is labelled by what backs it rather than by its name, which is already in
  // the heading beside this: "Svelte" for a published component, "Published" for
  // a committed document, "Draft" for one that is neither.
  let {
    variants = [],
    index = 0,
    baseLabel = 'Published',
    canCreate = false,
    onselect = undefined,
    oncreate = undefined,
  } = $props()
</script>

{#if variants.length || canCreate}
  <!-- ONE STRIP, not a strip beside a button (D70). `New variant` used to sit
       outside the border as its own pill, declaring the same padding, type,
       radius and background as `.variants__tab.active` and differing only by a
       border — so an ACTION rendered as a selected TAB, in tab position. It is
       now a trailing `+` inside the border: it reads as "add a tab", and the
       tab it makes appears where it was pressed.

       The tablist wraps ONLY the tabs. `+` is a sibling inside the visual
       container rather than a child of `role="tablist"`, because a tablist
       whose children are not all tabs misreports the set to assistive tech —
       the visual grouping and the semantic grouping are deliberately not the
       same element. -->
  <div class="variants">
    {#if variants.length}
      <div class="variants__tabs" role="tablist" aria-label="Variants">
        <button
          type="button"
          class="variants__tab focus-ring focus-ring--inset"
          class:active={index === 0}
          role="tab"
          aria-selected={index === 0}
          onclick={() => onselect?.(0)}
        >{baseLabel}</button>

        {#each variants as variant, i (variant.id)}
          <button
            type="button"
            class="variants__tab focus-ring focus-ring--inset"
            class:active={index === i + 1}
            role="tab"
            aria-selected={index === i + 1}
            onclick={() => onselect?.(i + 1)}
          >{variant.name}</button>
        {/each}
      </div>
    {/if}

    {#if canCreate}
      {#if variants.length}
        <span class="variants__divider" aria-hidden="true"></span>
      {/if}
      <!-- The glyph is `+`; the ACCESSIBLE NAME stays "New variant". A control
           whose visible label is a symbol has to say what it does somewhere, and
           the same split is already how SidebarNav labels its row inserts. -->
      <button
        type="button"
        class="variants__new focus-ring focus-ring--inset"
        aria-label="New variant"
        title="New variant"
        onclick={() => oncreate?.()}
      >+</button>
    {/if}
  </div>
{/if}

<style>
  /* The bordered container is now the whole control — this was
     `.variants__tabs`, which held only the tabs while the create button sat
     outside it. */
  .variants {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: color-mix(in oklab, var(--text-primary) 4%, transparent);
    flex-shrink: 0;
  }

  .variants__tabs {
    display: inline-flex;
    gap: 2px;
  }

  .variants__divider {
    width: 1px;
    align-self: stretch;
    margin: 2px 2px;
    background: var(--border-default);
  }

  .variants__tab {
    padding: 3px 10px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }

  .variants__tab.active {
    background: var(--surface-base);
    color: var(--text-primary);
    font-weight: var(--label-md-weight);
  }

  /* DELIBERATELY NOT `.variants__tab.active`'s treatment. No surface, no
     border, no weight — an action inside a selector has to be legible as the
     one element that does not select anything. */
  .variants__new {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    padding: 3px 6px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    /* SECONDARY, not tertiary, and not merely to match the tabs beside it:
       `--label-md-size` is 13px, far below D64's 24px large-text threshold,
       where `--text-tertiary` measures 3.29:1 on a dark raised pane against a
       4.5:1 bar. The inactive tabs' tertiary predates D64 and is left alone
       here — sweeping them is that row's scope, not this one's — but a NEW
       rule does not get to add a known failure. */
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }

  .variants__new:hover {
    background: var(--surface-base);
    color: var(--text-primary);
  }
</style>
