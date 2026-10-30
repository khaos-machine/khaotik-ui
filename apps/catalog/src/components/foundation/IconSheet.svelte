<script>
  import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'
  import { icons as kitIcons, index, callerSupplied } from '../../icon-inventory.js'

  // The catalog indexing ITSELF with the kit's parser. The library cannot glob
  // its consumers — it would only ever see the one it shipped with — so each
  // surface points the shared parse at its own files, the way both palette
  // views call the one tokens parser.
  //
  // This is the band the kit genuinely cannot know: four components take the
  // icon as a prop, and everything that enters through that seam is the app's
  // choice. Without it the sheet showed 27 while ~45 were in use.
  const appSources = import.meta.glob(
    ['../../**/*.svelte', '../../**/*.js', '!../../**/*.test.js'],
    { query: '?raw', import: 'default', eager: true },
  )

  // One sheet for the whole set, rather than one page per glyph. Icon is a
  // single component with one variable — the name — so a page that renders one
  // glyph at a time answers "what does Icon do" and never answers "which icon
  // do I want", which is the only question anyone opens this to ask.
  //
  // NO FILTER, and no title of its own. Both were copied from
  // phosphoricons.com without checking that we had its problem: that site
  // searches 9,072 icons, this sheet holds 45 in about seven rows, nearly all
  // on screen at once. A second search field also sat a few hundred pixels from
  // the sidebar's, filtering a different thing in the same shape. The heading
  // went for the reason the sidebar drops its group heading at one group — it
  // "would only repeat the rail entry beside it" (fixtures.js) — and here the
  // chrome already prints Icon directly above. Phosphor is the only fact it
  // carried, so it moved into the lede.
  //
  // If the set passes ~100, a filter earns its place again — in the chrome, as
  // the only one on screen.
  //
  // `weight` arrives from the chrome. The canvas already renders a per-fixture
  // control — the example tablist — and a weight is a discrete choice, which is
  // exactly what that tablist is for. Owning a SegmentedControl down here
  // duplicated a channel the shell already provides, and put a control in the
  // content that belongs in the chrome. Portrait's Person/Place tabs are the
  // same mechanism.
  //
  // One glyph per tile, at that weight — not both at once. Showing the pair
  // side by side was meant to make the choice visible and instead read as two
  // different icons: at `caret-down`, `caret-right` and `play` the fill weight
  // changes the SILHOUETTE, so a chevron sat next to a filled triangle with
  // nothing saying they were the same glyph.
  let { weight = 'regular' } = $props()

  // Only what the kit does NOT already render — an icon in both is the kit's,
  // and listing it twice would overstate the app's vocabulary.
  const kitNames = new Set(kitIcons.map((i) => i.name))
  const appIcons = index(appSources).filter((i) => !kitNames.has(i.name))

  let copied = $state('')
  async function copyName(name) {
    try {
      await navigator.clipboard.writeText(name)
      copied = name
      setTimeout(() => { if (copied === name) copied = '' }, 1200)
    } catch {
      // clipboard may be unavailable (e.g. non-secure context); ignore
    }
  }
</script>

<div class="sheet">
  <p class="sheet__lede">
    Phosphor, read from source rather than listed by hand — a name cannot appear
    here without something rendering it. Split by who chose it: the kit
    hard-codes the first band, and a surface passes the second in through an
    icon prop.
  </p>

  {#snippet band(title, note, list)}
    {#if list.length}
      <section class="band">
        <h3 class="band__title">
          <span class="eyebrow">{title}</span>
          <span class="band__count">{list.length}</span>
        </h3>
        <p class="band__note">{note}</p>
        <ul class="sheet__grid">
          {#each list as icon (icon.name)}
            <li>
              <button
                type="button"
                class="cell hover-fill focus-ring focus-ring--inset"
                class:copied={copied === icon.name}
                title={`Used by ${icon.usedBy.join(', ')}`}
                aria-label={`Copy ${icon.name}`}
                onclick={() => copyName(icon.name)}
              >
                <span class="cell__glyph"><Icon name={icon.name} {weight} /></span>
                <span class="cell__name">{copied === icon.name ? 'Copied' : icon.name}</span>
              </button>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/snippet}

  {@render band(
    'Rendered by the kit',
    'Hard-coded in the library’s components. Every consumer gets these.',
    kitIcons,
  )}
  {@render band(
    'Passed in by this surface',
    'The catalog’s own choices, through the icon prop. Another app’s set would differ.',
    appIcons,
  )}

  <div class="sheet__note">
    <span class="eyebrow">Not on this sheet</span>
    <p>
      {callerSupplied.join(', ')} take the icon as a prop. Those glyphs are the
      calling app's choice, so the kit cannot name them here.
    </p>
  </div>
</div>

<style>
  /* No padding of its own. `.canvas__content` already pads by --spacing-lg, so
     a second one stepped the whole sheet in from the title above it — the brand
     screens beside it add vertical padding only, and this was the odd one out.
     `width: 100%` because the canvas centres its child. */
  .sheet {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
    min-width: 0;
  }

  .sheet__lede {
    margin: 0;
    max-width: 62ch;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
  }






  .band {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }

  .band + .band {
    margin-top: var(--spacing-lg);
  }

  .band__title {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
    margin: 0;
    padding-bottom: var(--spacing-2xs);
    border-bottom: 1px solid var(--border-hairline);
  }

  .band__count {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .band__note {
    margin: 0 0 var(--spacing-xs);
    max-width: 62ch;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  /* Borderless, the way phosphoricons.com lays its set out. 27 bordered tiles
     put 27 rectangles between the reader and the glyphs, which is the opposite
     of what a specimen sheet is for — the icons should be the only marks with
     edges. The hover wash is what carries the target instead. */
  .sheet__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
    gap: var(--spacing-xs) var(--spacing-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-md) var(--spacing-xs);
    border: 0;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-tertiary);
    font: inherit;
    cursor: pointer;
    transition: background 120ms ease, color 120ms ease;
  }


  .cell.copied {
    color: var(--text-brand);
  }

  .cell__glyph {
    display: inline-flex;
    align-items: center;
    color: var(--text-primary);
  }

  .cell__glyph :global(.ph) {
    font-size: 1.75rem;
  }

  .cell__name {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    text-align: center;
    overflow-wrap: anywhere;
  }


  .sheet__note {
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-hairline);
  }

  .sheet__note p {
    margin: var(--spacing-2xs) 0 0;
    max-width: 62ch;
    font-size: var(--caption-size);
    color: var(--text-tertiary);
    line-height: var(--body-md-line);
  }
</style>
