<script>
  // Swift SectionHeader: an Eyebrow over a title, with an optional trailing
  // control (e.g. a refresh button beside a list).
  /**
   * @typedef {Object} Props
   * @property {string} [eyebrow] Uppercase caption above the title (the `.eyebrow` utility).
   * @property {string} [title] The section title. Rendered as an `h2`; the kit declares exactly one `h1` and it is the screen's.
   * @property {import('svelte').Snippet} [trailing] Snippet rendered opposite the title — actions, counts, a filter.
   */

  /** @type {Props} */
  let { eyebrow = '', title = '', trailing = undefined } = $props()
</script>

<header class="section-header">
  <div class="section-header__text">
    {#if eyebrow}<span class="eyebrow">{eyebrow}</span>{/if}
    <h2 class="section-header__title">{title}</h2>
  </div>
  {#if trailing}<div class="section-header__trailing">{@render trailing()}</div>{/if}
</header>

<style>
  .section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .section-header__text {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
  }

  .section-header__title {
    margin: 0;
    font-size: var(--heading-md-size);
    line-height: var(--heading-md-line);
    font-weight: 600;
    color: var(--text-primary);
  }

  .section-header__trailing {
    display: flex;
    align-items: center;
    color: var(--text-secondary);
  }
</style>
