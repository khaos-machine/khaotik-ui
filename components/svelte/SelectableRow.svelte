<script>
  import Icon from './Icon.svelte'
  import Portrait from './Portrait.svelte'

  // khaos-ui KSelectableRow: a full-width row button (title + optional subtitle,
  // trailing meta, optional content) with a selected state. D52: the button is
  // named by the title; inner text is aria-hidden. `thumb` renders a small
  // landscape thumbnail instead of the leading icon.
  // ThumbKind is exactly Portrait's kind, pinned so by the consumer gate
  // (scripts/check-consumer.mjs). It once also accepted `place`, which Portrait
  // never drew: every place row rendered a person.
  /**
   * @typedef {'person'|'scene'|'location'|'object'|'relation'} ThumbKind
   */

  /**
   * @typedef {Object} Props
   * @property {string} [title] Row title, and the accessible name of the button (D52).
   * @property {string} [subtitle] Optional second line, `aria-hidden`.
   * @property {string} [subtitlePrefix] Optional tabular prefix rendered before the subtitle — `S1`, `S2`.
   * @property {string} [icon] Optional leading Phosphor icon name (fill weight).
   * @property {boolean} [selected] Draws the selected border and background, and sets `aria-current` so a screen-reader user can tell which row is chosen. D52 names the row; it does not excuse dropping state.
   * @property {string} [thumb] Entity name for a leading square `Portrait` thumbnail, instead of `icon`.
   * @property {ThumbKind} [thumbKind] Which template glyph the thumbnail falls back to.
   * @property {string} [thumbIdentity] Stable entity key (an id) seeding the thumbnail colour. Without it the colour derives from `thumb`, so it changes whenever the label does and two entities sharing a name share a colour.
   * @property {(event: MouseEvent) => void} [onclick] Called when the row is activated. Optional — an unwired row renders and does nothing.
   * @property {import('svelte').Snippet} [leading] Snippet rendered in the leading slot, INSTEAD of `thumb` or `icon`. For marks the kit cannot name as a Phosphor glyph — a provider's artwork, a brand lozenge, a custom badge.
   *
   *   Added for #179, reported from khaos-app: a provider row wants the provider's mark beside a title that is already the provider's name. `thumb` takes a `Portrait` and `icon` takes a Phosphor glyph name, so neither could carry it — and passing a glyph name would mean inventing a provider-to-glyph table, which both repositories refuse.
   *
   *   `aria-hidden` like the other decorations: the row's accessible name is `title` (D52), so anything here is seen and never announced. A caller whose mark carries information the title does not has the wrong component.
   * @property {import('svelte').Snippet} [trailing] Snippet rendered at the end of the title line (counts, status). `aria-hidden`.
   * @property {import('svelte').Snippet} [children] Snippet rendered below the subtitle, inside the row's body.
   */

  /** @type {Props} */
  let { title = '', subtitle = '', icon = '', selected = false, leading = undefined, trailing = undefined, children = undefined, onclick = undefined, thumb = '', thumbKind = 'person', thumbIdentity = '', subtitlePrefix = '' } = $props()
</script>

<!-- aria-current carries the selected state to assistive tech. Without it the
     state lived only in `class:selected` and CSS, so every single-select list
     in the kit — characters, locations, scenes, dialogue — told a screen-reader
     user nothing about which row was chosen, while sighted users got a border
     and a wash. D52 covers naming the row and hiding its inner text; it does
     not excuse dropping state. -->
<!-- A BUTTON ONLY WHEN IT CAN ACT (#193). This was unconditionally a
     `<button>`, so a read-only list offered a screen-reader user N controls
     that did nothing and made a keyboard user tab through every one of them.
     The prop doc already conceded it — "an unwired row renders and does
     nothing" — which describes the defect rather than excusing it.

     The kit takes the opposite position one component away, in `MeasureTable`:
     "Omit it and rows are not interactive, so a read-only table announces no
     controls it does not have." Same principle, opposite implementation, and
     that inconsistency is what makes this a defect rather than a preference —
     the same shape as #171, where the lists declared a selection contract the
     compositions built out of them did not. Reported by khaos-app, who
     rendered co-appearance ties as plain spans rather than ship the phantom
     controls.

     `<svelte:element>` rather than two branches: an element cannot be opened in
     one `{#if}` arm and closed in another, and duplicating the whole row body
     to switch one tag is how the two copies drift.

     `aria-label` is deliberately NOT set on the non-button. It names a control;
     on a generic element it is specified as ignored, so writing one would be a
     name that may never be announced — the trap #156 already cost us. The title
     text is unhidden instead, so the row reads as its own content.

     `aria-current` IS kept on both: a row can legitimately be the current one
     in a read-only list reflecting a selection made elsewhere. -->
<svelte:element
  this={onclick ? 'button' : 'div'}
  type={onclick ? 'button' : undefined}
  class="selectable"
  class:selected
  class:selectable--static={!onclick}
  aria-label={onclick ? title : undefined}
  aria-current={selected ? 'true' : undefined}
  {...onclick ? { onclick } : {}}
>
  <!-- `leading` wins over both, because a caller that supplies it has a mark the
       kit cannot express as a glyph name or a Portrait. Ordered first rather
       than last so a row cannot render two leading decorations at once. -->
  {#if leading}
    <span class="selectable__leading" aria-hidden="true">{@render leading()}</span>
  {:else if thumb}
    <span class="selectable__thumb"><Portrait name={thumb} identity={thumbIdentity} aspect="1 / 1" kind={thumbKind} /></span>
  {:else if icon}
    <Icon name={icon} weight="fill" />
  {/if}
  <div class="selectable__body">
    <div class="selectable__head">
      <!-- `aria-hidden` only while a button names the row by `aria-label`
           (D52). With no button there is no such name, so hiding the title
           would leave the row with nothing to announce at all. -->
      <span class="selectable__title" aria-hidden={onclick ? 'true' : undefined}>{title}</span>
      {#if trailing}<span class="selectable__trailing" aria-hidden="true">{@render trailing()}</span>{/if}
    </div>
    <!-- `subtitlePrefix` alone is enough to draw this line. A caller with a meaningful
         prefix (a scene number) but no distinct subtitle would otherwise lose the prefix
         too, which is not what "no subtitle" should mean. -->
    {#if subtitle || subtitlePrefix}
      <span class="selectable__subtitle" aria-hidden="true">
        {#if subtitlePrefix}<span class="selectable__subtitle-prefix">{subtitlePrefix}</span>{/if}
        {subtitle}
      </span>
    {/if}
    {#if children}<div class="selectable__content" aria-hidden="true">{@render children()}</div>{/if}
  </div>
</svelte:element>

<style>
  .selectable {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    text-align: left;
    font: inherit;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 120ms ease;
  }

  .selectable:hover {
    background: color-mix(in oklab, var(--text-primary) 6%, transparent);
    color: var(--text-primary);
  }

  .selectable.selected {
    border-color: var(--border-default);
    background: color-mix(in oklab, var(--text-primary) 8%, transparent);
    color: var(--text-primary);
  }

  .selectable :global(.ph) {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 1.05em;
    color: var(--text-secondary);
  }

  /* Sized like the glyph slot rather than like the thumbnail: a provider mark
     is an inline mark beside a title, not a portrait. */
  /* No affordance on a row that cannot be activated: no pointer, no hover
     wash, no focus ring. The border and padding stay, because the row is still
     a row. */
  .selectable--static {
    cursor: default;
  }

  .selectable__leading {
    display: inline-flex;
    flex: none;
    align-items: center;
    font-size: 1.15em;
  }

  .selectable__thumb {
    width: 48px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .selectable__body {
    min-width: 0;
    flex: 1;
  }

  .selectable__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .selectable__title {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--body-md-size);
    font-weight: 500;
    color: var(--text-primary);
  }

  .selectable__subtitle {
    display: block;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--caption-size);
    color: var(--text-secondary);
  }

  .selectable__subtitle-prefix {
    margin-right: 4px;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
  }

  .selectable__trailing {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--caption-size);
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
  }

  .selectable__content {
    margin-top: var(--spacing-xs);
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
</style>
