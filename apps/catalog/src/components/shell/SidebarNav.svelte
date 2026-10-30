<script>
  import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'
  import {
    GROUP_EMPTY,
    GROUP_LABELS,
    SECTION_EMPTY,
    SECTION_GROUPS,
  } from '../../fixtures.js'

  // The component list (content, not chrome). Shows ONE section's groups — the
  // section is chosen in SectionRail, which sits outside this scroll.
  //
  // It briefly rendered every section of the workspace as one tree. That put
  // the section axis inside the scroll, so a section's reach cost became the
  // combined length of everything above it: at 100 components in Foundation,
  // Components was 100 rows down. The rail exists to keep that cost constant,
  // and this list stays scoped to one section for the same reason.
  let {
    matches = [],
    selected,
    collapsed = {},
    sortMode = 'group',
    query = '',
    section = 'brandkit',
    onselect,
    ontoggle,
    // NEW, present in both modes — this is the chrome/function boundary. The row
    // itself, and its primary click, are UNCHANGED regardless of `canInsert`; only
    // whether the secondary control does anything varies. `canInsert` is the
    // mode-driven gate (compose + something open); `f.insertable` — checked per
    // row below, not here — is the row-driven gate (does this row correspond to
    // anything real). Neither is a reason to remove or restructure a row.
    oninsert = undefined,
    canInsert = false,
    // The document currently open, if any — a row cannot insert itself into
    // itself. `validate()` would also catch it, one step later, as a cycle; this
    // is the cheaper, earlier refusal, the same way the rest of this app prefers
    // not offering a control over offering one that immediately reports a problem.
    editingSlug = null,
  } = $props()

  // Collapse keys stay namespaced even though only groups collapse now:
  // `screens` is a section (fixtures.js:539) AND a group (fixtures.js:556), and
  // an un-prefixed key would be ambiguous the moment anything else starts
  // writing to this map. Gated by Sidebar.test.js "ignores an un-namespaced
  // collapse key".
  const groupKey = (g) => `group:${g}`

  // A search is global — the thing you are looking for is usually not in the
  // section you are standing in. So a query flattens the list the same way Name
  // mode does, across every workspace. This is also what keeps the `adopted`
  // empty state out of search results: the grouped branch never renders.
  const flatMode = $derived(sortMode === 'name' || query.trim() !== '')

  // Declared groups in their declared order, then any group a fixture claims
  // that the section did not declare — because a silently dropped fixture and
  // an empty section look identical from the outside.
  const groupsIn = (s) => {
    const inSection = matches.filter((f) => f.section === s)
    const seen = new Set()
    const out = []
    for (const g of SECTION_GROUPS[s] ?? []) {
      seen.add(g)
      const items = inSection.filter((f) => f.group === g)
      // an empty group renders only if it declares empty copy — that is the
      // adopted shelf, which must stay visible precisely because it is empty
      if (items.length || GROUP_EMPTY[g]) out.push([g, items])
    }
    for (const f of inSection) {
      if (seen.has(f.group)) continue
      seen.add(f.group)
      out.push([f.group, inSection.filter((x) => x.group === f.group)])
    }
    return out
  }

  const groups = $derived(groupsIn(section))

  // One group means the heading would only repeat the rail entry beside it.
  const showGroupHeadings = $derived(groups.length > 1)

  const flat = $derived.by(() => [...matches].sort((a, b) => a.name.localeCompare(b.name)))
</script>

{#if flatMode && !flat.length}
  <!-- Same doctrine as SECTION_EMPTY for Flows: a destination that is empty and
       one that failed to render look identical from the outside. A query
       matching nothing used to render an empty <ul> and say nothing at all.
       The second sentence is the scope statement — without it a miss reads as
       "not in this section", which is the one thing this search is not. -->
  <p class="nav__empty nav__empty--section">
    {#if query.trim()}
      Nothing matches “{query.trim()}”. Search covers every section.
    {:else}
      Nothing to list.
    {/if}
  </p>
{:else if flatMode}
  <div class="nav__group">
    <ul>
      {#each flat as f (f.id)}
        <li>
          <button
            class="nav__open hover-fill focus-ring focus-ring--inset"
            class:active={f.id === selected?.id}
            aria-current={f.id === selected?.id ? 'true' : undefined}
            onclick={() => onselect?.(f)}
          >
            {f.name}{@render marks(f)}
          </button>
          {@render insert(f)}
        </li>
      {/each}
    </ul>
  </div>
{:else if !groups.length}
  <p class="nav__empty nav__empty--section">{SECTION_EMPTY[section] ?? 'Nothing here yet.'}</p>
{:else}
  {#each groups as [group, items] (group)}
    <div class="nav__group">
      {#if showGroupHeadings}
        <button
          class="nav__group-title hover-fill"
          type="button"
          aria-expanded={!collapsed[groupKey(group)]}
          onclick={() => ontoggle?.(groupKey(group))}
        >
          <Icon name={collapsed[groupKey(group)] ? 'caret-right' : 'caret-down'} />
          {GROUP_LABELS[group] ?? group}
        </button>
      {/if}
      {#if !showGroupHeadings || !collapsed[groupKey(group)]}
        {#if items.length}
          <ul>
            {#each items as f (f.id)}
              <li>
                <button
                  class="nav__open hover-fill focus-ring focus-ring--inset"
                  class:active={f.id === selected?.id}
                  aria-current={f.id === selected?.id ? 'true' : undefined}
                  onclick={() => onselect?.(f)}
                >
                  {f.name}{@render marks(f)}
                </button>
                {@render insert(f)}
              </li>
            {/each}
          </ul>
        {:else}
          <p class="nav__empty">{GROUP_EMPTY[group]}</p>
        {/if}
      {/if}
    </div>
  {/each}
{/if}

{#snippet insert(f)}
  <!-- ALWAYS RENDERED — in Browse, in Compose, whether or not this row has
       anything real to offer. Only `disabled` varies, and it is two independent
       facts rather than one opaque flag: `canInsert` (mode + something open) and
       `f.insertable` (does this row correspond to a real export or document — a
       property of the row, computed once in App.svelte, true or false the same
       way in every section). A colour-ramp specimen and a real component sit
       side by side in BrandKit; only one of them has anything to insert, and
       that has nothing to do with which mode is active. -->
  <button
    type="button"
    class="nav__insert focus-ring"
    disabled={!canInsert || !f.insertable || f.id === editingSlug}
    aria-label={`Insert ${f.name}`}
    onclick={(e) => {
      e.stopPropagation()
      // The `disabled` attribute is not trusted alone: a synthetic click
      // (jsdom's `fireEvent`, or an assistive-tech path a real browser might
      // not block the same way) can still reach this handler even when the
      // button is disabled. The condition is restated here rather than assumed
      // from the DOM state.
      if (!canInsert || !f.insertable || f.id === editingSlug) return
      oninsert?.(f)
    }}
  >+</button>
{/snippet}

{#snippet marks(f)}
  {#if f.draft}
    <!-- Unshipped: composed here and not committed to the repo. The dot carries
         it visually and `.visually-hidden` carries it into the accessible name,
         because "this is not live yet" is information rather than decoration —
         the same call D63 makes about MetaStrip's labels. -->
    <span class="nav__dot" aria-hidden="true"></span>
    <span class="visually-hidden"> draft</span>
  {/if}
  {#if f.variants?.length}
    <!-- Candidates competing to become this. Counted rather than listed: the
         list belongs on the canvas, where you can see them. -->
    <span class="nav__count">{f.variants.length}</span>
    <span class="visually-hidden"> {f.variants.length} variant{f.variants.length === 1 ? '' : 's'}</span>
  {/if}
{/snippet}

<style>
  /* Unshipped. A dot rather than a word: it sits at the end of every draft row,
     and a repeated word would read as part of the name. */
  .nav__dot {
    display: inline-block;
    width: var(--spacing-2xs);
    height: var(--spacing-2xs);
    margin-left: var(--spacing-2xs);
    border-radius: var(--radius-full);
    background: var(--tone-warning);
    vertical-align: middle;
    flex-shrink: 0;
  }

  .nav__count {
    margin-left: var(--spacing-2xs);
    padding: 0 5px;
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--text-primary) 10%, transparent);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  /* Two different jobs, so two different values.
     Between collapsed peers this gap is pure separation between one-word
     headings; after an OPEN group it has to terminate a block of rows and
     out-signal the 8px between the rows inside it. One token doing both put a
     collapsed group at a 40px pitch — more vertical space than the 27.5px
     component row it indexes.
     A collapsed group renders no `ul` (the `{#if}` above omits it), so open and
     closed are distinguishable without a class. */
  .nav__group {
    margin-top: var(--spacing-xs);
  }

  .nav__group:has(> ul) + .nav__group,
  .nav__group:has(> .nav__empty) + .nav__group {
    margin-top: var(--spacing-md);
  }

  .nav__group:first-of-type {
    margin-top: 0;
  }

  .nav__group-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    width: 100%;
    padding: var(--spacing-2xs) var(--spacing-xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    /* --label-sm is the kit's smallest label: 12px/600 at 0.06em, a caps
       micro-label by design. This referenced --label-xs, which the kit has
       never shipped — all four declarations were invalid at computed-value
       time, so this heading inherited 16px/400 and outsized the page titles
       beside it. The 0.68rem it replaced was at least visible. */
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    letter-spacing: var(--label-sm-track);
    text-transform: uppercase;
    color: var(--text-tertiary);
    cursor: pointer;
  }

  .nav__group-title:hover {
    color: var(--text-secondary);
  }

  .nav__group-title :global(.ph) {
    font-size: 0.75rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Two buttons per row now — open (flex, takes the space) and insert (fixed,
     small). The li is the flex row so neither button needs to know about the
     other's width. */
  li {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .nav__open {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xs);
    flex: 1;
    min-width: 0;
    /* Children align under the parent's LABEL, not its caret: 8px base + the
       12px caret + the 4px gap puts item text on the same x as the group
       heading. Left of that, a row reads as a peer of the group rather than a
       member of it — the containment the disclosure caret is claiming. */
    padding: var(--spacing-2xs) var(--spacing-xs) var(--spacing-2xs) var(--spacing-lg);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    text-align: left;
    font: inherit;
    /* data-md, not body-md, and the reason is the panel rather than the row.
       The kit ships exactly one style with an 18px line (body-md) and puts
       every label tier on 16 — label-md 13/16, label-sm 12/16, data-md 13/16.
       A row set in body-md was the only 18px leading in a 16px panel, so
       nothing in the column shared a measure. On 16 the row box is 24px, which
       is what the group heading already was.
       The kit declares no baseline grid (BrandKit → Layout → "No shared
       baseline"); this rhythm comes from its type styles agreeing, not from a
       step imposed over them. */
    font-size: var(--data-md-size);
    line-height: var(--data-md-line);
    font-weight: var(--data-md-weight);
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }


  /* data-md and label-md are the same 13/16 at different weights, so selecting
     a row steps between two real kit styles instead of hand-setting a 600 that
     produced 13/18/600 — a style the kit does not ship. Identical metrics also
     mean selecting a row cannot reflow the column. */
  .nav__open.active {
    background: var(--surface-raised);
    color: var(--text-primary);
    font-weight: var(--label-md-weight);
  }

  /* Present in every row, in every mode. Only the disabled/enabled state is
     mode- or row-driven — the button itself never appears or disappears. */
  .nav__insert {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    cursor: pointer;
    opacity: 0.35;
  }

  .nav__insert:not(:disabled) {
    opacity: 1;
    color: var(--action-primary);
  }

  .nav__insert:not(:disabled):hover {
    background: color-mix(in oklab, var(--action-primary) 12%, transparent);
  }

  .nav__insert:disabled {
    cursor: default;
  }



  /* A declared shelf that happens to be empty. It reads as deliberately empty,
     not as a rendering failure — which is the whole point of showing it. */
  .nav__empty {
    margin: 0;
    padding: var(--spacing-2xs) var(--spacing-xs);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    text-wrap: pretty;
  }

  .nav__empty--section {
    padding-top: var(--spacing-xs);
  }
</style>
