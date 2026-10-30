<script>
  import Icon from './Icon.svelte'
  import { markFor } from './lib/provider-marks.js'

  // A provider's artwork, alone — for rows where the provider's NAME is already
  // on screen and a badge would print it twice.
  //
  // WHY THIS IS AN ATOM RATHER THAN A FLAG ON ProviderBadge. The SVG was inlined
  // in two places, `ProviderBadge` and the launcher's routing plate, both written
  // here and both carrying the same `viewBox`/`fill-rule`/`currentColor`
  // reasoning in a comment. A third caller (#179) would have been a third copy.
  // Extracting it means one implementation and one place for that reasoning.
  //
  // khaos-app proposed a `markOnly` prop on `ProviderBadge` instead. Declined,
  // and the reason is not style: a flag that turns a component into a different
  // component is misusable exactly where the kit's own position says it must not
  // be used. `ProviderBadge` documents that the mark sits WITH the name because
  // an identical placeholder on every row distinguishes nothing, so the glyph
  // cannot be the only carrier. A `markOnly` prop offers that footgun to every
  // caller; a separate atom whose contract SAYS the caller must carry the name
  // does not.
  //
  // IT IS `aria-hidden` BY CONTRACT, like `Icon`. This component never announces
  // the provider. A caller that has no name on screen has no business using it.

  /**
   * @typedef {Object} Props
   * @property {string} [provider] The provider, matched case-insensitively against the marks the kit ships. Used only when `providerId` is absent.
   * @property {string} [providerId] The engine's id, which RESOLVES the mark. Absent falls back to `provider`. The split is #178's: khaosd serves a provider under several spellings and a display title is not a lookup key.
   * @property {boolean} [local] The provider runs on this computer, as the engine reports it (D84). Draws the `desktop` glyph, after a shipped brand mark.
   * @property {string} [fallbackIcon] Phosphor glyph drawn when the kit ships no artwork and the provider is not local. `plugs-connected` by default — a neutral placeholder rather than an invented brand mark.
   */

  /** @type {Props} */
  let { provider = '', providerId = '', local = false, fallbackIcon = 'plugs-connected' } = $props()

  // D84: a provider that runs on this computer is identified as local rather than by a
  // brand: the storyteller's question is "is this running here", and one glyph answers it.
  // Whether it is local is the engine's to say (khaosd v0.56.0 `local`), so it is a prop, not
  // a list kept here. A shipped brand mark still wins; the host's fallbackIcon comes after.
  const mark = $derived(markFor(providerId || provider))
</script>

{#if mark}
  <!-- INLINE, not an `<img>` and not a CSS mask: an SVG loaded as an image
       resolves `currentColor` against its own root and paints black, which is
       invisible on the dark default. Inline path data also needs no asset
       resolution, so it survives any bundler. -->
  <svg class="pmark" viewBox={mark.viewBox} fill="currentColor" aria-hidden="true"
    ><path d={mark.d} fill-rule={mark.fillRule ?? 'nonzero'} /></svg
  >
{:else if local}
  <Icon name="desktop" />
{:else}
  <Icon name={fallbackIcon} />
{/if}

<style>
  .pmark {
    flex: none;
    width: 1em;
    height: 1em;
    opacity: 0.9;
  }
</style>
