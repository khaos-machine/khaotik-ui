<script>
  // A single Phosphor glyph. `name` is the Phosphor icon name (kebab-case);
  // `weight` is one of regular|thin|light|bold|fill|duotone. Decorative by
  // default — the surrounding control carries the accessible name (D52).
  /**
   * A Phosphor glyph weight. All six exist in `@phosphor-icons/web`, but only
   * the weights whose stylesheet the host imports actually render, so a weight
   * this app never imports renders as nothing. The kit's
   * `assets/icons/phosphor.css` loads `regular` and `fill`; a consumer wanting
   * the other four imports them from `@phosphor-icons/web` itself.
   * @typedef {'regular'|'thin'|'light'|'bold'|'fill'|'duotone'} IconWeight
   */

  /**
   * @typedef {Object} Props
   * @property {string} [name] Phosphor icon name (kebab-case), e.g. `sparkle`, `film-slate`.
   * @property {IconWeight} [weight] Phosphor glyph weight; `regular` emits the bare `ph` class.
   */

  /** @type {Props} */
  let { name = '', weight = 'regular' } = $props()

  // Always include the base `ph` class so downstream `:global(.ph)` selectors
  // (tone tints, sizing) match every weight, not just regular. The weight's
  // own stylesheet is imported after the regular one, so its font-family wins.
  const cls = $derived(weight === 'regular' ? `ph ph-${name}` : `ph ph-${weight} ph-${name}`)
</script>

<i class={cls} aria-hidden="true"></i>
