<script>
  // One row of a spec scale: the token's name, a bar drawn at its declared
  // value, and the value itself — the whole row a button that copies the token.
  //
  // Layout and Shape had written this twice, byte for byte: the same grid, the
  // same three children, the same copy handler, differing only in which axis the
  // bar is drawn on. A scale is read by comparing its steps, so the bar is drawn
  // at the real length rather than described — and both screens had reached that
  // conclusion separately.
  import { copyToken, copied } from '../../lib/brand-view.svelte.js'

  /**
   * @property {{ name: string, value: string }} token The token to draw and copy.
   * @property {'width'|'height'} axis Which dimension the bar expresses. Space
   *   reads along the row; a radius or a stroke reads across it.
   */
  let { token, axis = 'width' } = $props()
</script>

<button
  class="spec-step focus-ring"
  type="button"
  aria-label={`Copy --${token.name}: ${token.value}`}
  onclick={() => copyToken(token)}
>
  <span class="spec-name">--{token.name}</span>
  <span
    class="spec-step__bar"
    class:spec-step__bar--tall={axis === 'height'}
    style:width={axis === 'width' ? token.value : null}
    style:height={axis === 'height' ? token.value : null}
  ></span>
  <span class="spec-value spec-step__value" class:copied={copied.is(token.name)}>
    {copied.is(token.name) ? 'copied' : token.value}
  </span>
</button>

