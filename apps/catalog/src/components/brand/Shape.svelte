<script>
  import { radius, sizes } from '@khaos-machine/khaotik-ui/tokens/parse.js'
  import { copyToken, copied } from '../../lib/brand-view.svelte.js'
  import SectionHeader from '@khaos-machine/khaotik-ui/components/svelte/SectionHeader.svelte'
  import BrandScreen from './BrandScreen.svelte'
  import SpecStep from './SpecStep.svelte'

  // Shape: the measures OF an element. Corner radii, target size and stroke
  // width — what a single thing looks like at its edges.
  //
  // The spacing scale used to be here and is now on Layout. It was filed with
  // these because it is a length, which is a property of its type rather than
  // of its subject: radius describes one element, spacing describes the gap
  // between two. Same reasoning as KhaosLogo leaving the specimen shelf.
  //
  // Off the theme axis: both are declared once, outside both theme blocks.
</script>

<BrandScreen title="Shape">
  <section>
    <SectionHeader eyebrow="Shape" title="Radius" />
    <div class="radii">
      {#each radius as tier (tier.name)}
        <button
          class="radius focus-ring--mark"
          type="button"
          aria-label={`Copy --${tier.name}: ${tier.value}`}
          onclick={() => copyToken(tier)}
        >
          <span class="radius__box focus-mark" style:border-radius={tier.value}></span>
          <span class="radius__name">--{tier.name}</span>
          <span class="radius__value" class:copied={copied.is(tier.name)}>
            {copied.is(tier.name) ? 'copied' : tier.value}
          </span>
        </button>
      {/each}
    </div>
  </section>

  <section>
    <SectionHeader eyebrow="Size" title="Target & stroke" />
    <!-- One rendering for all three, not a branch on the name: every one of
         these is a length, so every one is drawn AS that length — a bar whose
         height is the declared value. 48px reads as a block and 1px reads as a
         hairline because that is what they are, not because the view sorted
         them into two kinds first. -->
    <div class="spec-column">
      {#each sizes as size (size.name)}
        <SpecStep token={size} axis="height" />
      {/each}
    </div>
  </section>
</BrandScreen>

<style>
  /* ---- radius tiers ---- */

  .radii {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .radius {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    padding: 0;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
  }

  .radius__box {
    width: var(--spacing-2xl);
    height: var(--spacing-2xl);
    border: 1px solid var(--border-default);
    background: var(--surface-raised);
  }

  .radius:hover .radius__box {
    border-color: var(--border-focus);
  }

  .radius__name {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-primary);
  }

  .radius__value {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-tertiary);
  }

  .radius__value.copied {
    color: var(--text-brand);
  }



</style>
