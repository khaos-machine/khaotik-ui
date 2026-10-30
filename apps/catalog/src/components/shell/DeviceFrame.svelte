<script>
  // One screen in a device. The sized box the canvas has always drawn, plus the
  // chassis that makes 390x844 read as a handset rather than as a rectangle.
  //
  // WHY THIS IS SHELL, NOT A LAYER. The four-layer model classifies what the
  // PRODUCT is made of — BrandKit is the theming, Foundation is what we adopted,
  // Components/Screens/Flows are the organisms we build. A phone bezel is none
  // of those: it belongs to the instrument that displays the product, beside
  // ViewportPicker and SectionRail. Classified by provenance, which is the same
  // test the model already applies to Foundation.
  //
  // SO THE NUMBERS HERE ARE NOT TOKENS, DELIBERATELY. The bezel radius and the
  // status-bar height are catalog-local constants. Putting them in tokens.json
  // would let the viewer's chrome leak into every consuming app, and the kit
  // describes the product rather than the thing looking at it. The scale stops
  // at --radius-lg (8px), which is right for a card and wrong for a handset.
  //
  // It renders the same markup the canvas did — `.frame`, its two modifiers, the
  // style and the data-viewport — so the frame's contract is unchanged and its
  // tests did not have to be rewritten to follow it here.
  import { resolveFrame } from './viewports.js'

  /**
   * @property {{device: string, size: string, orientation: string, enabled?: boolean}} frame
   *   The picker's three-part choice, resolved here rather than by the caller so
   *   the canvas and a flow strip cannot resolve it differently.
   * @property {boolean} [chassis] Draw the device chassis. On by default: a row
   *   of bare rectangles does not read as devices, which is the point of showing
   *   them. Off is for comparing screens unadorned.
   * @property {boolean} [fill] Let an unsized frame stretch — a screen at "Fit"
   *   fills the canvas rather than shrink-wrapping to its content.
   * @property {import('svelte').Snippet} [children] The screen itself.
   */
  let { frame: request, chassis = true, fill = false, children } = $props()

  const frame = $derived(resolveFrame(request))

  // `null` on either axis means that axis is unconstrained, so it is left out of
  // the style rather than written as `auto` — an omitted property lets the
  // existing layout rule stand, where `auto` would replace it.
  const frameStyle = $derived(
    [
      frame.width === null ? null : `width:${frame.width}px`,
      frame.height === null ? null : `height:${frame.height}px`,
    ]
      .filter(Boolean)
      .join(';'),
  )

  // A chassis needs a device to be the chassis OF. At "Fit" and "Fill canvas"
  // there is no device — the frame is the canvas — so there is nothing to draw.
  //
  // Web is excluded for the same reason rather than as a style choice: a
  // breakpoint is a width, not a machine. Mobbin draws its web frames as plain
  // rounded rectangles with no chrome, and a browser bezel here would assert a
  // window the size never claimed.
  const chassised = $derived(chassis && frame.width !== null && frame.device !== 'web')

  // The status bar is drawn only where there is a real reference for it. The
  // handset bar is the one this repo has seen (the Rees field-app prototype
  // draws the same 44px row); a tablet's is a different shape at a different
  // height, and inventing one would put a device on screen that does not exist.
  // Tablet takes the bezel without the bar until that gap is filled.
  //
  // GENERIC IS THE ONLY PROFILE, and that is a decision rather than an oversight.
  // A notch, a Dynamic Island and an Android bar are all real chrome and all
  // belong here eventually — as a SETTING, because the catalog never claims
  // which handset a width is. `viewports.js` takes its numbers from Storybook's
  // presets and says so: the picker offers "Standard · 390", not "iPhone 14".
  // Chrome cannot be derived from a device the catalog has not named, so it has
  // to be chosen.
  //
  // None of them are drawn yet because none of them can be sourced. Every number
  // in viewports.js carries a citation — Storybook, Tailwind, Material 3 — and
  // the island's pill, the notch's corners and Android's bar height would each
  // be a number invented to look right. An empty shelf, stated, the way the
  // Layout screen declares the grid the kit does not have.
  const statusBar = $derived(chassised && frame.device === 'mobile')
</script>

<!-- The frame is always present, even at "Fit", where it carries no size and no
     border. Mounting and unmounting a wrapper around the preview would remount
     the component with it, throwing away whatever state the thing being
     playtested had accumulated — the opposite of what a playtest surface is for.
     The chassis toggles classes on this element rather than wrapping it, for the
     same reason. -->
<div
  class="frame"
  class:frame--sized={frame.width !== null}
  class:frame--fill={frame.width === null && fill}
  class:frame--chassis={chassised}
  style={frameStyle}
  data-viewport={`${frame.device}:${frame.size}${frame.rotated ? ':landscape' : ''}`}
>
  {#if statusBar}
    <!-- Decoration, and hidden from the accessible tree accordingly: it names no
         control and reading "9:41" to a screen reader between the chrome and the
         screen would be noise.

         9:41 is fixed, not the wall clock. It is the convention every device
         mockup uses, and a live clock would make two screenshots of the same
         screen differ for no reason and add a timer to a surface that has no
         other reason to tick. -->
    <div class="statusbar" aria-hidden="true">
      <span class="statusbar__time">9:41</span>
      <span class="statusbar__indicators"></span>
    </div>
  {/if}

  {@render children?.()}
</div>

<style>
  .frame {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    /* The containing block for an example's fixed-position overlays: a modal or sheet an
       example opens draws inside the frame, not over the catalog. */
    transform: translateZ(0);
  }

  /* Only a sized frame draws itself. The border is what makes the size legible
     as a boundary — without it, "Mobile" on a component narrower than 390px
     looks identical to "Fill canvas" and the control appears not to work. */
  .frame--sized {
    max-width: none;
    flex-shrink: 0;
    overflow: auto;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-base);

    /* What makes the frame answer the components' `@container` queries, so a
       workspace collapses at 390 inside a 1440 window. Only on the SIZED frame:
       inline-size containment makes an element's width independent of its
       contents, which is free here because the width is explicit, and would
       break the unsized frame, whose width is exactly what its contents make it.

       NAMED, and the components query it by name. An unnamed `@container` binds
       to the nearest ancestor carrying a container-type — whatever it was
       established for — so a consuming app that already containerises a pane for
       its own reasons would silently start collapsing the workspaces inside it,
       with no tag and no signal (the library is consumed straight from main).
       The name makes the binding explicit, and makes "additive only" true. */
    container-type: inline-size;
    container-name: viewport;
  }

  /* Unframed, a SCREEN fills the canvas and a COMPONENT is centred. Both are
     right: a pill or a card centred in the space reads as the object it is,
     where a screen shrink-wrapped to its content and floated in the middle
     reads as a screen that does not fit. The column centres by default, so
     without this a screen whose widest track is `1fr` has nothing to resolve
     against and collapses — the icon sheet's grid did exactly that, landing
     135px right of the title above it. `kind` still carries the distinction,
     though the chrome no longer prints it. */
  .frame--fill {
    align-self: stretch;
    width: 100%;
  }

  /* The chassis. 34px is the handset corner and 18px the tablet's — catalog-local
     constants, not tokens, for the reason in the header. They are ratios read off
     the devices rather than a scale: a 12mm corner is a large fraction of a 64mm
     phone and a small one of a 195mm tablet, so one value for both would make the
     tablet look like a toy.

     `overflow: hidden` rather than `auto`: a rounded chassis whose content
     scrolls past the corner is the tell that it is a rectangle with a radius. The
     screen scrolls INSIDE, which is why the content below gets its own scroller. */
  .frame--chassis {
    border-radius: 34px;
    overflow: hidden;
  }

  .frame--chassis[data-viewport^='tablet'] {
    border-radius: 18px;
  }

  /* Landscape turns the device, and the corner turns with it — the radius is a
     property of the case, not of the axis. Stated because the rotated frame
     swaps width and height and nothing else would say so. */

  .statusbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: none;
    height: 44px;
    padding: 0 26px;
    font-size: var(--label-md-size);
    line-height: var(--label-md-line);
    font-weight: var(--label-md-weight);
    color: var(--text-primary);
  }

  /* The right cluster is a shape, not a claim. Drawing signal bars and a battery
     would state a connection state and a charge level the catalog does not know;
     an empty reserved space says "the indicators live here" and lies about
     nothing. */
  .statusbar__indicators {
    width: 54px;
    height: 12px;
    border-radius: var(--radius-full);
    background: color-mix(in oklab, var(--text-primary) 18%, transparent);
  }
</style>
