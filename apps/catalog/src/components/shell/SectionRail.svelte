<script>
  import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'
  import { SECTION_LABELS, SECTION_ORDER } from '../../fixtures.js'

  // The fixed chrome column: every navigable destination at the top, app-level
  // view controls at the foot. Everything here is icon-only.
  //
  // This is now the app's ONLY navigation axis. The workspace bar above it is
  // gone: Screens and Flows are peers of the System sections here, which is
  // what they were to anyone actually looking for a component.
  //
  // This is the whole point of the component: a control that lives in the
  // scrolling list inherits that list's length as its reach cost. With 100
  // components in Foundation, Components sat 100 rows below and could not be
  // reached without first collapsing what preceded it. Out here, reaching
  // anything is one click at any catalog size.
  //
  // Shape taken from Vapi and Supabase — a fixed rail for the axes, an
  // independently scrolling pane for the items they select.
  let {
    section = '',
    theme = 'dark',
    sortMode = 'group',
    onsection,
    ontheme,
    onsortmode,
    onopensettings,
    /** The destinations to rail. Defaults to all of them; Compose passes fewer. */
    sections = undefined,
  } = $props()

  // Icon-only means the glyph carries no name of its own, so each control needs
  // an explicit one. Sections keep the " section" suffix.
  //
  // Both collisions it was written for have now ENDED. "BrandKit" the section
  // against "BrandKit" the fixture stopped existing when that screen split into
  // Color / Type / Shape / Tokens; "Screens" the workspace against "Screens"
  // the section stopped existing when the workspace axis was deleted.
  //
  // It stays for a third reason that outlives both: `screens` still names a
  // section AND a group (SECTION_GROUPS.screens), and that pair is only
  // invisible today because a one-group section renders no group heading. The
  // suffix applies the rule to every entry rather than to whichever labels
  // happen to clash this week, which is what stops it needing revisiting each
  // time the vocabulary moves.
  const sectionName = (s) => `${SECTION_LABELS[s] ?? s} section`

  // Icon-only. Every control therefore needs an explicit accessible name and a
  // title: a glyph renders fine and reads as nothing, so an unnamed one fails
  // silently.
  //
  // Visible labels were tried here and taken back out. The cost they were
  // answering is real and remains — palette for BrandKit and cube for
  // Foundation are assignments rather than conventions, so the destinations are
  // learn-by-hover. The tooltip is what carries that, and it is not optional.
  // Which destinations exist is the caller's answer, because it depends on the
  // MODE: BrandKit documents the system rather than holding parts of it, so it
  // is not somewhere you go while composing.
  const railed = $derived(sections ?? SECTION_ORDER)

  const SECTION_ICONS = {
    brandkit: 'palette',
    foundation: 'cube',
    components: 'squares-four',
    screens: 'browsers',
    flows: 'flow-arrow',
  }

  // Both toggles name the state they move TO, not the one they are in. A single
  // button that reads "Dark" while dark is on is ambiguous — it could be a
  // label or an action — and the two readings imply opposite clicks.
  const nextTheme = $derived(theme === 'dark' ? 'light' : 'dark')
  const nextSort = $derived(sortMode === 'group' ? 'name' : 'group')
</script>

<nav class="rail" aria-label="Sections">
  <div class="rail__group">
    {#each railed as s (s)}
      <button
        type="button"
        class="rail__item focus-ring focus-ring--inset hover-fill"
        class:active={section === s}
        aria-current={section === s ? 'true' : undefined}
        aria-label={sectionName(s)}
        title={SECTION_LABELS[s] ?? s}
        onclick={() => onsection?.(s)}
      >
        <Icon name={SECTION_ICONS[s] ?? 'circle'} />
      </button>
    {/each}
  </div>

  <div class="rail__group rail__group--foot">
    <button
      type="button"
      class="rail__item focus-ring focus-ring--inset hover-fill"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      onclick={() => ontheme?.(nextTheme)}
    >
      <Icon name={nextTheme === 'light' ? 'sun' : 'moon'} />
    </button>

    <button
      type="button"
      class="rail__item focus-ring focus-ring--inset hover-fill"
      aria-label={nextSort === 'name' ? 'Sort by name' : 'Group by tier'}
      title={nextSort === 'name' ? 'Sort by name' : 'Group by tier'}
      onclick={() => onsortmode?.(nextSort)}
    >
      <Icon name={nextSort === 'name' ? 'sort-ascending' : 'list-bullets'} />
    </button>

    <button
      type="button"
      class="rail__item focus-ring focus-ring--inset hover-fill"
      aria-label="Settings"
      title="Settings"
      onclick={() => onopensettings?.()}
    >
      <Icon name="gear-six" />
    </button>
  </div>
</nav>

<style>
  .rail {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0;
    background: var(--surface-base);
    border-right: 1px solid var(--border-hairline);
    overflow: hidden;
  }

  .rail__group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-2xs);
  }

  .rail__group--foot {
    /* pinned to the foot by the parent's space-between; the margin keeps it off
       the window edge when the section list is short */
    margin-top: auto;
  }

  .rail__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }

  .rail__item :global(.ph) {
    font-size: 1.15rem;
  }


  .rail__item.active {
    background: var(--surface-raised);
    color: var(--text-primary);
  }
</style>
