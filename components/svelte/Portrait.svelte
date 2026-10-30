<script>
  import { AvatarFallback, AvatarImage, AvatarRoot } from '@ark-ui/svelte/avatar'
  import Icon from './Icon.svelte'
  import { identityColor } from './lib/identity.js'
  import { ageBucket, genderBucket } from './lib/demographics.js'

  // The kit's twelve placeholder figures. Statically imported so the bundler
  // fingerprints and emits them — a runtime-built path would resolve at dev time
  // and 404 in a production build, which is the classic way an asset map breaks.
  import s_female_young from '../../assets/placeholders/silhouettes/female-young.webp'
  import s_female_adult from '../../assets/placeholders/silhouettes/female-adult.webp'
  import s_female_senior from '../../assets/placeholders/silhouettes/female-senior.webp'
  import s_male_young from '../../assets/placeholders/silhouettes/male-young.webp'
  import s_male_adult from '../../assets/placeholders/silhouettes/male-adult.webp'
  import s_male_senior from '../../assets/placeholders/silhouettes/male-senior.webp'
  import s_nonbinary_young from '../../assets/placeholders/silhouettes/nonbinary-young.webp'
  import s_nonbinary_adult from '../../assets/placeholders/silhouettes/nonbinary-adult.webp'
  import s_nonbinary_senior from '../../assets/placeholders/silhouettes/nonbinary-senior.webp'
  import s_unknown_young from '../../assets/placeholders/silhouettes/unknown-young.webp'
  import s_unknown_adult from '../../assets/placeholders/silhouettes/unknown-adult.webp'
  import s_unknown_senior from '../../assets/placeholders/silhouettes/unknown-senior.webp'

  const SILHOUETTES = {
    'female-young': s_female_young,
    'female-adult': s_female_adult,
    'female-senior': s_female_senior,
    'male-young': s_male_young,
    'male-adult': s_male_adult,
    'male-senior': s_male_senior,
    'nonbinary-young': s_nonbinary_young,
    'nonbinary-adult': s_nonbinary_adult,
    'nonbinary-senior': s_nonbinary_senior,
    'unknown-young': s_unknown_young,
    'unknown-adult': s_unknown_adult,
    'unknown-senior': s_unknown_senior,
  }

  // An entity image. Real image when `src` is set; otherwise a template with a
  // deterministic identity colour and a Phosphor glyph by kind:
  //   person   → user (characters)
  //   scene    → film-slate
  //   location → map-pin
  //   object   → cube
  //   relation → arrows-left-right (two entities and the tie between them)
  //
  // Review lists these four side by side — characters, places, objects and
  // relationships — so each kind needs a glyph of its own in the one shared
  // frame. Every glyph is fill weight on the identity colour.
  //
  // `identity` is what the colour is derived from. Pass a STABLE entity key (an id) when
  // one exists: deriving from `name` ties the colour to a label, so it changes whenever
  // the label does, and two entities sharing a label share a colour. Defaults to `name`,
  // so existing callers are unaffected.
  /**
   * @typedef {'person'|'scene'|'location'|'object'|'relation'} PortraitKind
   */

  /**
   * The fallback-figure resolver's argument — the entity, as this component knows it.
   * @typedef {Object} FigureRequest
   * @property {string} gender
   * @property {string} age
   * @property {string} name
   * @property {string} identity
   * @property {PortraitKind} kind
   */

  /**
   * @typedef {Object} Figure
   * @property {string} src
   * @property {string} [srcset]
   */

  /**
   * @typedef {Object} Props
   * @property {string} [src] Optional image URL; replaces the template. **Wins over `figureFor`** — real artwork must not be second-guessed by a placeholder resolver.
   * @property {string} [srcset] Optional 1x/2x candidates. Omitted rather than emitted empty when unset, since an empty srcset is a candidate list a browser can fail to resolve.
   * @property {string} [name] Entity name. Used as the alt text, and as the colour seed only when `identity` is absent.
   * @property {string} [identity] What the template colour is derived from. Pass a **stable entity key** (an id) where one exists — seeding from the name ties the colour to a label, so it changes whenever the label does and two entities sharing a name share a colour. Falls back to `name`.
   * @property {string} [aspect] CSS aspect-ratio (e.g. `3 / 4`, `16 / 9`).
   * @property {PortraitKind} [kind] `person` takes a silhouette from the kit's placeholder set; `scene`, `location`, `object` and `relation` take a glyph (`film-slate` / `map-pin` / `cube` / `arrows-left-right`), since a human figure would be worse than the glyph it replaced.
   * @property {string} [iconSize] Template glyph size (CSS length).
   * @property {string} [gender] Demographic passed to `figureFor`. Rendered by nothing on its own — this component draws no gendered figure, and does not decide what one looks like. It does select the kit's own silhouette bucket: female | male | nonbinary | anything else → unknown.
   * @property {string} [age] Demographic passed to `figureFor`, alongside `gender`. Buckets for the kit's own silhouettes as young | adult | senior | anything else → adult; both demographics empty is the COMMON case and lands on unknown/adult, a real figure rather than a degraded one.
   * @property {(request: FigureRequest) => Figure | string | null | undefined} [figureFor] Resolves the fallback figure: `({ gender, age, name, identity, kind }) => ({ src, srcset }) | string | null`. Returning nothing is normal and falls through to the glyph.
   *
   * A resolver rather than bundled artwork, following `coverFor` on WelcomeWindow. Figure sets are **pre-production placeholders** that get replaced by user-supplied or generated images, and that replacement must be a change in the consuming app rather than a release of this library. Because the engine returns real art per character, placeholders and real images appear in the same list — which is why `src` wins per Portrait rather than there being one global mode.
   */

  /** @type {Props} */
  let {
    src = '',
    // 1x/2x candidates. Omitted rather than emitted empty when unset — an empty
    // srcset is a candidate list a browser can fail to resolve.
    srcset = '',
    name = '',
    identity = '',
    aspect = '3 / 4',
    kind = 'person',
    iconSize = '2.6rem',
    // #23. Two inspectors and Gallery:14 all passed
    // these and this component declared NEITHER, so Svelte dropped them in
    // silence — the call sites read as if a figure varied by demographic while
    // every character got the same glyph, and twelve silhouettes built against
    // that contract were unreachable.
    //
    // `gender`: female | male | nonbinary | anything else → unknown
    // `age`:    young | adult | senior     | anything else → adult
    // Both empty is the COMMON case — 21 of 27 characters in the real data carry
    // no demographics — and lands on unknown/adult, which is a real figure and
    // not a degraded one.
    gender = '',
    age = '',
    // Override the shipped placeholder: `({ gender, age, name, identity, kind })
    // => ({ src, srcset }) | string | null`. Returning nothing falls back to the
    // kit's own set, so a consumer can override some buckets and not others.
    //
    // The kit ships defaults (assets/placeholders/silhouettes) so a component has
    // something honest to render out of the box, for the reason utilities.css
    // ships the classes the atoms render: a fallback every app hand-rolls is a
    // fallback that drifts between them. An app with its own art sets it here.
    figureFor = undefined,
  } = $props()

  // Precedence, and it is load-bearing rather than incidental:
  //   1. `src`       — real or generated artwork the caller already holds
  //   2. `figureFor` — the consuming app's own placeholder set
  //   3. the kit's shipped silhouette for the gender/age bucket
  //   4. the glyph   — for kinds that have no figure set (scene, location)
  //
  // Real art must win, because the placeholder era ends PER ENTITY, not all at
  // once: a project where the engine has generated art for four of twenty
  // characters has to render those four for real and the rest as placeholders, in
  // the same list, without the caller switching modes.
  const artwork = $derived(
    src ? { src, srcset } : normalise(figureFor?.({ gender, age, name, identity, kind })),
  )

  // The kit's own placeholder. Not part of `artwork` because it renders
  // differently: over the identity colour, not instead of it.
  //
  // Resolved whether or not there is artwork. This used to short-circuit to null
  // as soon as `artwork` existed, which was sound while the template only
  // rendered in the no-artwork branch — but the template is now also what shows
  // when artwork FAILS to load, and a character whose generated portrait 404s
  // should land on their own silhouette, not on the generic glyph. Keeping the
  // short-circuit made the fallback worse than the placeholder it replaced.
  const silhouette = $derived(defaultFigure(kind, gender, age))

  // Only `person` has a figure set. A scene or a location rendering a human
  // silhouette would be worse than the glyph it replaces, so those fall through.
  function defaultFigure(entityKind, g, a) {
    if (entityKind !== 'person') return null
    return SILHOUETTES[`${genderBucket(g)}-${ageBucket(a)}`]
  }

  function normalise(figure) {
    if (!figure) return null
    if (typeof figure === 'string') return { src: figure, srcset: '' }
    return figure.src ? { src: figure.src, srcset: figure.srcset ?? '' } : null
  }

  // Shared with ProjectCard: one entity, one hue, everywhere. See lib/identity.js.
  const color = $derived(identityColor(identity || name))

  const icon = $derived(kind === 'scene' ? 'film-slate' : kind === 'location' ? 'map-pin' : kind === 'object' ? 'cube' : kind === 'relation' ? 'arrows-left-right' : 'user')

  // Written as one style string rather than three `style:` directives, because
  // those are not valid on a component — the frame is Avatar's root now, not a
  // plain element (svelte.dev/e/component_invalid_directive).
  const frameStyle = $derived(
    `aspect-ratio: ${aspect}; --identity: ${color}; --icon-size: ${iconSize}`,
  )
</script>

<!-- Ark UI's Avatar carries the image layer (D39, D50, P3). It is adopted for
     exactly one thing this component did not do: the load-status machine. The
     old markup chose between art and the template at RENDER time, on whether
     `src` was a non-empty string — so a src that resolved to nothing rendered
     the browser's broken-image icon and no placeholder.

     That case is not hypothetical here, it is the design premise. Artwork
     arrives per entity as the engine generates it, so a reference that exists
     but fails to load is the ordinary state of this component, not an edge.
     Avatar shows the fallback while loading and on error, which turns a broken
     image into the silhouette it was always supposed to be.

     Everything above this line stays ours — Avatar has no notion of a four-level
     precedence, a shipped silhouette set, or an identity colour. -->
<AvatarRoot class="portrait" style={frameStyle}>
  {#if artwork}
    <!-- Real or app-supplied art fills the frame on its own — it is a picture OF
         the entity, so the kit has no business tinting it. -->
    <AvatarImage
      class="portrait__img"
      src={artwork.src}
      srcset={artwork.srcset || undefined}
      alt=""
    />
  {/if}

  <!-- The template: the entity's identity colour, with either the kit's
       silhouette or the kind glyph on top. Rendered unconditionally and hidden
       by the machine once the image loads — with no image it simply never
       hides, which is the no-artwork case.
       The silhouette sits OVER the colour rather than replacing the template,
       because the identity hue is a feature in its own right (#9) — one entity,
       one colour, everywhere. Dropping the template for people would have made
       that colour invisible for exactly the entities it was built for, and the
       silhouettes carry alpha precisely so they can be composited. -->
  <AvatarFallback class="portrait__template" aria-hidden="true">
    {#if silhouette}
      <img class="portrait__figure" src={silhouette} alt="" />
    {:else}
      <Icon name={icon} weight="fill" />
    {/if}
  </AvatarFallback>
</AvatarRoot>

<style>
  /* The frame. Was the <img> itself; it is now Avatar's root, because the image
     and the template have to occupy the same box and only one of them is on
     screen at a time. Classes on an Ark component are forwarded to the rendered
     element, so Svelte scopes them as unused — hence :global
     (catalog/AGENTS.md, "Svelte 5 gotchas"). */
  :global(.portrait) {
    display: block;
    width: 100%;
    overflow: hidden;
    border-radius: var(--radius-sm);
  }

  :global(.portrait__img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Sits on the identity colour, not over the whole frame: the gradient must stay
     readable at the edges or the colour stops being a recognisable identity. */
  .portrait__figure {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: bottom;
  }

  :global(.portrait__template) {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: var(--icon-size, 2.6rem);
    background: linear-gradient(
      165deg,
      color-mix(in oklab, var(--identity) 86%, white 14%) 0%,
      var(--identity) 55%,
      color-mix(in oklab, var(--identity) 78%, black 22%) 100%
    );
  }

  :global(.portrait__template .ph) {
    color: color-mix(in oklab, white 76%, transparent);
  }

  /* Light mode: lift the background to a pastel of the identity colour and drop
     the glyph to the darker identity, so the placeholder keeps contrast against
     the silver light surface. */
  :global(html[data-theme="light"] .portrait__template) {
    background: linear-gradient(
      165deg,
      color-mix(in oklab, var(--identity) 26%, white 74%) 0%,
      color-mix(in oklab, var(--identity) 32%, white 68%) 55%,
      color-mix(in oklab, var(--identity) 40%, white 60%) 100%
    );
  }

  :global(html[data-theme="light"] .portrait__template .ph) {
    color: color-mix(in oklab, var(--identity) 78%, black 22%);
  }

  /* LAST, and load-bearing. Avatar swaps the image and the fallback with the
     HTML `hidden` attribute, which works only because the UA stylesheet says
     `[hidden] { display: none }` — so any author `display` beats it. Both
     children set one (`block` and `flex`), which without this rule renders the
     template UNDERNEATH every loaded portrait. Same defect this repo just hit
     in EditableField; stated here rather than rediscovered a third time. */
  :global(.portrait [hidden]) {
    display: none;
  }
</style>
