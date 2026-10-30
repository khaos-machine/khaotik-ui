<script>
  // The chrome every BrandKit screen carries: which kit this is, where it comes
  // from, and the rhythm its sections sit on.
  //
  // The four screens differ in what they document, not in how they announce it,
  // and the alternative to this component is the same header and the same
  // section rule copied four times — which is how three of them end up subtly
  // out of step with the fourth.
  let { title, blurb = '', children } = $props()

  // The identity is the REGION'S NAME, not a visible heading.
  //
  // This printed `Khaotik {title}` as an <h1> directly beneath a canvas chrome
  // whose own <h1> already says the same word — two h1s on the page, the second
  // repeating the first, with the screens' own SectionHeaders (h2) nested under
  // the wrong one. Removing it does not just dedupe the text, it repairs the
  // outline: chrome h1 → section h2, which is what it always should have been.
  //
  // The rule is on record here for the sidebar, and it is the same rule: a
  // heading is dropped when it "would only repeat the rail entry beside it, and
  // two identically-named controls with different effects is an accessibility
  // defect" (fixtures.js).
  //
  // `aria-label` rather than `aria-labelledby`: there is no longer an element
  // to point at, and the label no longer has to be unique in the document — the
  // reason the old id was derived from the title was that a test mounts several
  // of these at once.
  const label = $derived(`Khaotik ${title}`)
</script>

<section class="screen" aria-label={label}>
  <!-- The provenance line that used to sit here was hard-coded, so all five
       screens printed the same string and none of them was saying anything
       about ITSELF. It is a fact about the kit, and the Tokens screen — which
       exists to show every declaration the kit makes — states it once.
       The header now renders only when a screen has something of its own. -->
  {#if blurb}
    <header class="screen__head">
      <p class="screen__blurb">{blurb}</p>
    </header>
  {/if}

  {@render children?.()}
</section>

<style>
  .screen {
    width: 100%;
    /* full canvas, so a wide comparison table (the step axis) gets every pixel
       available — a cap here makes it scroll even on a wide display. The prose-
       and row-shaped sections carry their own reading measure instead. */
    display: flex;
    flex-direction: column;
  }

  .screen__head {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    padding-bottom: var(--spacing-lg);
    max-width: 820px;
  }



  .screen__blurb {
    margin: 0;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
    text-wrap: pretty;
  }

  /* Flat sections: a hairline rule and spacing, never a card. Declared here and
     applied to whatever the screen renders, so the four keep one rhythm — the
     `:global` is scoped by the `.screen >` on its left, so it reaches the
     caller's sections and nothing else. */
  .screen > :global(section) {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-hairline);
  }
</style>
