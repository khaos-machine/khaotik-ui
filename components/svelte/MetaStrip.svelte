<script>
  import Icon from './Icon.svelte'

  // MetaStrip: an inline run of metadata — a short value, optionally with a
  // glyph in front of it, repeated across a wrapping row. The scene label and
  // character name under a player's stage; the counts under a card's title.
  //
  // NOT StatusPill (that carries tone), NOT LabeledPill (that stacks an eyebrow
  // over a toned pill), and it takes no callbacks, no chrome and no truncation
  // policy. D63 records why each is excluded.
  //
  // `label` is not decoration. `Icon` is `aria-hidden` by contract
  // (`Icon.svelte:29`, declared decorative at `:2-4`), so a hand-rolled
  // `<Icon/>{value}` announces a bare value with the icon carrying the whole
  // meaning. `label` names what the glyph means and renders through the kit's
  // `.visually-hidden` utility.
  //
  // Arrangement is the CONTAINER's, never the item's: there is no per-item
  // alignment escape hatch, because "this item is not like the others" is a
  // confession that it belongs to a different run. Compose two strips instead
  // (D63's Player instruction).
  //
  // DEFERRED, named so it is not mistaken for done: in-library runs still
  // draw this by hand and are not migrated here — `ProjectCard.svelte:346-353` and
  // `ServiceStatusList.svelte:260-270`. They share no single shape and this
  // atom's spacing matches none of them, so each migration is a visual change
  // to a shipped component; it has its own issue.

  /**
   * One entry in the run.
   * @typedef {Object} MetaItem
   * @property {string} text The value to show — short, a phrase at most.
   * @property {string} [icon] Phosphor icon name (kebab-case), e.g. `film-slate`. Decorative; pair it with `label`.
   * @property {string} [label] What the GLYPH means — a category, not the whole
   *   reading: `characters`, not `27 characters`. It is announced through the
   *   `.visually-hidden` utility and sits BEFORE `text`, so the item is heard as
   *   "characters 27". Putting the complete phrase here instead makes a screen
   *   reader say "27 characters 27", which is how this was first written.
   * @property {string} [title] The pointer's tooltip — the COMPLETE reading,
   *   `27 characters`. Defaults to `label`, which is right whenever the category
   *   alone is the whole story. It is separate from `label` because the two are
   *   genuinely different jobs: one names the glyph for someone who cannot see
   *   it, the other spells out the row for someone who can see it and does not
   *   recognise the glyph.
   * @property {boolean} [numeric] Tabular figures, for a value that updates in place and must not jitter.
   */

  /**
   * @typedef {Object} Props
   * @property {MetaItem[]} [items] The run, in order. Empty renders nothing at all.
   */

  /** @type {Props} */
  let { items = [] } = $props()
</script>

{#if items.length}
  <div class="meta-strip">
    {#each items as item}
      <!-- A glyph plus `27` is legible to nobody who does not already know what
           the glyph means. The tooltip is how a POINTER user finds out; the
           visually-hidden label is how a screen-reader user does. They carry
           different strings because they sit in different places: the label
           reads before the value, the tooltip replaces the whole row. -->
      <span
        class="meta-strip__item"
        class:meta-strip__item--numeric={item.numeric}
        title={item.title ?? item.label}
      >
        {#if item.icon}<Icon name={item.icon} />{/if}
        {#if item.label}<span class="visually-hidden">{item.label}</span>{/if}
        {item.text}
      </span>
    {/each}
  </div>
{/if}

<style>
  /* The contract is decided, not observed: the four hand-rolled runs disagree
     3–2 on the colour, and D63 settled it on measured contrast. At caption size
     the WCAG bar is 4.5:1 and `--text-tertiary` clears it on only one of the
     four real backgrounds. Weight is caption's own 400 — a metadata run is
     quiet, not bolded. */
  .meta-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-weight: var(--caption-weight);
    color: var(--text-secondary);
  }

  /* The glyph takes the run's size and colour — it is 1em of the caption it
     sits in, with no size prop and no colour of its own. `min-width: 0` so a
     long value can shrink inside the flex item rather than widen the run. */
  .meta-strip__item {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2xs);
    min-width: 0;
  }

  /* D57 decided two numeral tokens — figures for tabular data and figures for
     prose — and neither ever landed; nothing in tokens.json matches
     numer/figure/tabular. So this is the honest literal, joining the twenty
     already in the kit, and the gap is recorded in
     docs/harvest-khaos-machine-tokens.md rather than guessed at as a token. */
  .meta-strip__item--numeric {
    font-variant-numeric: tabular-nums;
  }
</style>
