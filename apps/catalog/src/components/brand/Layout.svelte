<script>
  import { spacing, type } from '@khaos-machine/khaotik-ui/tokens/parse.js'
  import { copyToken, copied } from '../../lib/brand-view.svelte.js'
  import SectionHeader from '@khaos-machine/khaotik-ui/components/svelte/SectionHeader.svelte'
  import BrandScreen from './BrandScreen.svelte'
  import SpecStep from './SpecStep.svelte'

  // Layout: the measures BETWEEN elements. Shape holds the measures OF one —
  // radius, target, stroke — and the spacing scale was filed there because it
  // was a length, not because it described the same thing.
  //
  // Two of this screen's three subjects do not exist in the kit, and are stated
  // rather than drawn. A screen that renders an invented grid would assert a
  // system nobody has decided, and `tokens.css` is generated from Andrew's
  // `tokens.json` — a value shown here that is absent there is a fabrication
  // wearing the catalog's authority.

  // The type scale's line-heights, read from the kit, against the spacing step.
  // Both computed from the parsed tokens, not asserted — if Andrew's kit
  // changes either scale, this screen follows instead of going stale.
  const gcd = (a, b) => (b ? gcd(b, a % b) : a)
  const LINE_HEIGHTS = [...new Set(type.map((t) => parseInt(t.line, 10)))].filter(Number.isFinite).sort((a, b) => a - b)
  const SPACING_STEP = spacing.map((s) => parseInt(s.value, 10)).reduce(gcd)
  const offGrid = LINE_HEIGHTS.filter((h) => h % SPACING_STEP !== 0)
</script>

<BrandScreen title="Layout">
  <section>
    <SectionHeader eyebrow="Space" title="Spacing scale" />
    <!-- Drawn at the declared width, on one baseline. A table of numbers says
         4/8/12/16/24/32/48; the bars say the scale doubles at the top and steps
         by 4 at the bottom, which is the fact a spacing scale is chosen for. -->
    <div class="spec-column">
      {#each spacing as step (step.name)}
        <SpecStep token={step} axis="width" />
      {/each}
    </div>
  </section>

  <section>
    <SectionHeader eyebrow="Grid" title="Not in the kit" />
    <p class="gap">
      The BrandKit declares no grid: there is no column, gutter or container
      token in <code>tokens.css</code>. This shelf is declared and empty on
      purpose — an absent grid and a grid nobody thought to show look identical
      from the outside, and only one of them is true here.
    </p>
    <p class="gap gap--muted">
      <code>tokens.css</code> is generated from <code>tokens.json</code>, so a
      grid is a BrandKit decision rather than a catalog one. Drawing a plausible
      12-column here would put a system in the instrument that the kit does not
      have.
    </p>
  </section>

  <section>
    <SectionHeader eyebrow="Rhythm" title="No shared baseline" />
    <!-- Measured, not asserted. If a common step is ever introduced this
         paragraph goes stale silently, which is why Layout.test.js recomputes
         the same arithmetic against the live kit rather than trusting the copy. -->
    <p class="gap">
      Vertical rhythm is not declared either, and the two scales that would have
      to agree do not. The spacing scale steps by {SPACING_STEP}px; the type
      scale's line-heights are {LINE_HEIGHTS.join(' / ')}px, of which
      {offGrid.join(' and ')} are not multiples of {SPACING_STEP}. Their common
      divisor is 2, so the kit sits on a 2px step at best — which is another way
      of saying it has no baseline grid.
    </p>
    <p class="gap gap--muted">
      Line-heights are carried per type style (<code>--body-md-line</code> and
      its siblings) and are published on the Type screen. They are named here
      and not re-published, so each declaration keeps exactly one home.
    </p>
  </section>
</BrandScreen>

<style>





  /* ---- declared gaps ---- */

  .gap {
    max-width: 62ch;
    margin: 0;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
    text-wrap: pretty;
  }

  .gap + .gap {
    margin-top: var(--spacing-sm);
  }

  .gap--muted {
    color: var(--text-tertiary);
  }

  .gap code {
    font-family: var(--font-mono);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
  }
</style>
