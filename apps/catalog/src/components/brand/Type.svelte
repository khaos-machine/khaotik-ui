<script>
  import { fonts, type, utilities } from '@khaos-machine/khaotik-ui/tokens/parse.js'
  import { copyText, copyToken, copied } from '../../lib/brand-view.svelte.js'
  import SectionHeader from '@khaos-machine/khaotik-ui/components/svelte/SectionHeader.svelte'
  import BrandScreen from './BrandScreen.svelte'

  // Type: the three family stacks and the eight styles built on them. Off the
  // theme axis entirely — the kit declares both once, outside either theme
  // block, so there is no light/dark reading of a type scale to get wrong.

  // A stack is a fallback chain, and the fallbacks are the load-bearing part:
  // "Sora" is what renders if it loaded, and the four names after it are what
  // actually renders if it did not. Both samples are drawn in the same stack
  // the token declares, so what you see is what the chain resolved to here.
  const stackHead = (value) => value.split(',')[0].replace(/^"|"$/g, '')

  // The four declarations are copied together because a type style is one
  // thing, not four loose values — the shape the kit declares and the shape
  // that ports (tokens.css:147-148).
  const copyScale = (scale) =>
    copyText(
      scale.name,
      `--${scale.name}-size:${scale.size}; --${scale.name}-line:${scale.line}; --${scale.name}-weight:${scale.weight}; --${scale.name}-track:${scale.track};`,
    )

  // The utility roster, parsed out of utilities.css by the same module. This
  // screen holds no list of its own — the sheet carries the class, the prose and
  // the `@kind` treatment, and a second list here is precisely the drift the
  // parser exists to prevent.
  //
  // A utility has no `--token` name, so the copy affordance is named after the
  // class and hands back the declarations. That is a new convention, chosen
  // rather than inherited.
  const declarationText = (utility) =>
    utility.declarations.map((d) => `${d.prop}: ${d.value};`).join(' ')

  const copyUtility = (utility) => copyText(utility.name, declarationText(utility))
</script>

<BrandScreen title="Type">
  <section>
    <SectionHeader eyebrow="Family" title="Font families" />
    <div class="fonts">
      {#each fonts as font (font.name)}
        <button
          class="font focus-ring"
          type="button"
          aria-label={`Copy --${font.name}: ${font.value}`}
          onclick={() => copyToken(font)}
        >
          <span class="font__name">--{font.name}</span>
          <span class="font__sample" style:font-family={font.value}>
            {stackHead(font.value)} — Khaotik 0123
          </span>
          <span class="font__stack" class:copied={copied.is(font.name)}>
            {copied.is(font.name) ? 'copied' : font.value}
          </span>
        </button>
      {/each}
    </div>
  </section>

  <section>
    <SectionHeader eyebrow="Scale" title="Type scale" />
    <div class="types">
      {#each type as scale (scale.name)}
        <button
          class="type-row focus-ring"
          type="button"
          aria-label={`Copy --${scale.name} type declarations`}
          onclick={() => copyScale(scale)}
        >
          <span class="type-row__name">{scale.name}</span>
          <span
            class="type-row__sample"
            style:font-size={scale.size}
            style:line-height={scale.line}
            style:font-weight={scale.weight}
            style:letter-spacing={scale.track}
          >Khaotik type sample</span>
          <span class="type-row__meta spec-value" class:copied={copied.is(scale.name)}>
            {copied.is(scale.name)
              ? 'copied'
              : `${scale.size} · ${scale.line} · ${scale.weight} · ${scale.track}`}
          </span>
        </button>
      {/each}
    </div>
  </section>

  <section>
    <SectionHeader eyebrow="Utility" title="Utilities" />
    <div class="utilities">
      {#each utilities as utility (utility.name)}
        <button
          class="utility focus-ring"
          type="button"
          aria-label={`Copy .${utility.name}`}
          onclick={() => copyUtility(utility)}
        >
          <span class="utility__name">.{utility.name}</span>

          <span class="utility__specimen">
            {#if utility.kind === 'sample'}
              <span class={utility.name}>Khaotik {utility.name} sample</span>
            {:else if utility.kind === 'demo'}
              <!-- Absence is the observable. Showing the word vanish beats
                   faking a specimen for a class whose whole effect is that you
                   cannot see it.

                   GENERIC ON PURPOSE, and this is where it will be violated:
                   the screen is driven by the roster and holds no class list,
                   so the demo applies `{utility.name}` to the FIRST WORD of a
                   fixed line. It reads correctly for `.visually-hidden`, the
                   only `demo` member today. A second `demo` class with a
                   different shape needs this branch revisited — do not add one
                   and assume the line still says something true. -->
              <span class="utility__demo">
                <span class={utility.name}>Scene</span> INT. KITCHEN
              </span>
              <span class="utility__aside">a screen reader still announces the hidden word</span>
            {/if}
          </span>

          <span class="utility__doc">{utility.doc}</span>

          <!-- NOT .spec-value, though it looks like the neighbouring meta rows:
               that class is a single value in a column and carries
               `white-space: nowrap`, which here pushed the row to 1446px inside
               an 820px section. A declaration block is a wrapping paragraph. -->
          <span class="utility__decls" class:copied={copied.is(utility.name)}>
            {copied.is(utility.name) ? 'copied' : declarationText(utility)}
          </span>
        </button>
      {/each}
    </div>
  </section>
</BrandScreen>

<style>
  /* ---- font families ---- */

  .fonts {
    display: flex;
    flex-direction: column;
    max-width: 820px;
  }

  .font {
    display: grid;
    grid-template-columns: 108px 1fr;
    align-items: baseline;
    gap: 2px var(--spacing-md);
    width: 100%;
    padding: var(--spacing-xs) 0;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
  }

  .font + .font {
    border-top: 1px solid var(--border-hairline);
  }

  .font__name {
    grid-row: 1 / span 2;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-secondary);
  }

  .font__sample {
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    color: var(--text-primary);
    /* the stack is the point; a clipped sample would hide which face won */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* the whole chain, wrapped — an ellipsised stack hides the fallbacks, which
     are exactly what this row exists to show */
  .font__stack {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    overflow-wrap: anywhere;
  }

  .font__stack.copied {
    color: var(--text-brand);
  }

  /* ---- type scale ---- */

  .types {
    display: flex;
    flex-direction: column;
    max-width: 820px;
  }

  .type-row {
    display: grid;
    grid-template-columns: 96px 1fr auto;
    align-items: baseline;
    gap: var(--spacing-md);
    width: 100%;
    padding: var(--spacing-xs) 0;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
  }

  .type-row + .type-row {
    border-top: 1px solid var(--border-hairline);
  }

  .type-row__name {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .type-row__sample {
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  .type-row__meta.copied {
    color: var(--text-brand);
  }

  /* ---- utilities ---- */

  .utilities {
    display: flex;
    flex-direction: column;
    max-width: 820px;
  }

  .utility {
    display: grid;
    grid-template-columns: 132px 1fr;
    align-items: baseline;
    gap: var(--spacing-2xs) var(--spacing-md);
    width: 100%;
    padding: var(--spacing-sm) 0;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
  }

  .utility + .utility {
    border-top: 1px solid var(--border-hairline);
  }

  .utility__name {
    grid-row: 1 / span 3;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-secondary);
  }

  /* the specimen is drawn by the class itself — that is the whole point, so it
     carries no type of its own to override what it is demonstrating */
  .utility__specimen {
    display: block;
    color: var(--text-primary);
  }

  .utility__aside {
    display: block;
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-tertiary);
  }

  .utility__doc {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    color: var(--text-secondary);
  }

  .utility__decls {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    overflow-wrap: anywhere;
  }

  .utility__decls.copied {
    color: var(--text-brand);
  }
</style>
