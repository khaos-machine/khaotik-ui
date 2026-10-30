<script>
  import { copyToken, copied, paint, surface } from '../../lib/brand-view.svelte.js'
  import SectionHeader from '@khaos-machine/khaotik-ui/components/svelte/SectionHeader.svelte'
  import BrandScreen from './BrandScreen.svelte'

  // Tokens: the index. Every declaration on the active surface, in the order
  // the generated file declares them — no categories, nothing filtered out.
  //
  // This is the screen the other three cannot be. Color, Type and Shape are
  // each a predicate over the same parse, and a predicate's silence has the two
  // causes this project keeps paying for: the token is absent, or the predicate
  // never matched it. Measured against today's kit, six declarations reach no
  // category — --hairline, --quiet-fill, --scrim, --illustration-ink, and the
  // two st-provis-* aliases Color excludes by contract. They are in the kit,
  // components can reference them, and without this screen the catalog would
  // document the kit while showing no sign that they exist.
  let { query: initialQuery = '' } = $props()

  const active = surface()
  const all = $derived(active.tokens.all)

  // A seed, not a binding: the reader types into this box, so the prop cannot
  // own it. The initial reference is deliberate, hence the ignore.
  // svelte-ignore state_referenced_locally
  let query = $state(initialQuery)

  // …but the catalog switches a fixture's example state by changing props on a
  // mounted component (Canvas.svelte:32-35 does not key on the example), so a
  // seed read once would leave the "Filtered" example showing the unfiltered
  // list. This re-seeds on a prop change and on nothing else — it reads
  // `initialQuery` and never `query`, so typing does not re-trigger it.
  $effect(() => {
    query = initialQuery
  })

  // Name, declared value and resolved value all match: looking up "#ffcc00" to
  // find what references it is the same question as looking up "gold-400", and
  // an index that only matched names would answer one and not the other.
  const rows = $derived.by(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (token) =>
        token.name.toLowerCase().includes(q) ||
        token.value.toLowerCase().includes(q) ||
        String(token.resolved).toLowerCase().includes(q),
    )
  })

  // A divider whenever the leading segment changes, derived from the name
  // rather than from a kept list of roots — a list would go stale the first
  // time Andrew's build emits a root nobody here anticipated, and it would go
  // stale silently, by dropping that root's rows into whatever bucket came
  // last. The runs are contiguous because the file declares them that way; where
  // it does not (--hairline and --quiet-fill sit inside the st-* block,
  // tokens.css:209-210) the divider repeats, which is the file's own shape and
  // not an error to smooth over.
  const rooted = $derived(
    rows.map((token, i) => {
      const root = token.name.split('-')[0]
      return { token, root, opensRun: i === 0 || rows[i - 1].name.split('-')[0] !== root }
    }),
  )
</script>

<BrandScreen
  title="Tokens"
  blurb="Every declaration the vendored kit makes, on the surface the shell is currently in. Color, Type and Shape each show a slice; this is the whole of it, in declaration order."
>
  <!-- The kit's origin, stated once. It sat in BrandScreen's header, which
       printed it identically on all five screens; it is a fact about where the
       values come from, and this is the screen that shows all of them. -->
  <p class="source">khaos-studio/khaotik-3 · tokens.json → tokens.css</p>
  <section>
    <SectionHeader eyebrow="Index" title="Every declaration">
      {#snippet trailing()}
        <span class="count spec-value">
          {rows.length === all.length
            ? `${all.length} on the ${active.theme} surface`
            : `${rows.length} of ${all.length}`}
        </span>
      {/snippet}
    </SectionHeader>

    <div class="filter">
      <label class="filter__label" for="token-filter">Filter</label>
      <input
        id="token-filter"
        class="filter__input"
        type="search"
        placeholder="name, reference or hex — try “gold” or “#ffcc00”"
        bind:value={query}
      />
    </div>

    {#if rows.length === 0}
      <p class="empty">Nothing in the kit matches “{query.trim()}”.</p>
    {:else}
      <div class="index">
        {#each rooted as { token, root, opensRun } (token.name)}
          {#if opensRun}
            <span class="index__root">{root}</span>
          {/if}
          <button
            class="index__row focus-ring focus-ring--inset"
            type="button"
            aria-label={`Copy --${token.name}: ${token.value}`}
            onclick={() => copyToken(token)}
          >
            <span class="index__chip spec-chip" style:background-color={paint(token)}></span>
            <span class="index__name">--{token.name}</span>
            <span class="index__value" class:copied={copied.is(token.name)}>
              {copied.is(token.name) ? 'copied' : token.value}
            </span>
            <!-- only where following the chain says something the declaration
                 does not: a literal resolves to itself, and repeating it would
                 make every primitive row claim a reference it never had -->
            <span class="index__resolved">
              {token.resolved === token.value ? '' : token.resolved}
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </section>
</BrandScreen>

<style>
  .source {
    margin: 0 0 var(--spacing-lg);
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-tertiary);
  }


  .filter {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
    max-width: 820px;
  }

  .filter__label {
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    letter-spacing: var(--label-sm-track);
    color: var(--text-secondary);
  }

  .filter__input {
    flex: 1;
    min-width: 0;
    padding: 6px 10px;
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    font: inherit;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-primary);
  }

  .filter__input::placeholder {
    color: var(--text-tertiary);
  }

  .filter__input:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 1px;
  }

  .empty {
    margin: 0;
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-secondary);
  }

  /* One grid for the whole index, and subgrid rows inside it, so all 151 rows
     share four columns — a per-row grid resolves per row and the values land on
     a ragged edge as soon as one name outgrows its neighbours. */
  .index {
    display: grid;
    grid-template-columns: 14px minmax(200px, max-content) minmax(160px, 1fr) minmax(0, 1fr);
    column-gap: var(--spacing-md);
    align-items: center;
    max-width: 980px;
  }

  .index__root {
    grid-column: 1 / -1;
    margin-top: var(--spacing-md);
    padding-bottom: 2px;
    border-bottom: 1px solid var(--border-hairline);
    font-size: var(--label-sm-size);
    line-height: var(--label-sm-line);
    font-weight: var(--label-sm-weight);
    letter-spacing: var(--label-sm-track);
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .index__root:first-child {
    margin-top: 0;
  }

  .index__row {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
    gap: var(--spacing-md);
    width: 100%;
    padding: 3px 0;
    background: none;
    border: 0;
    text-align: left;
    cursor: pointer;
  }

  .index__row:hover {
    background: color-mix(in oklab, var(--text-primary) 5%, transparent);
  }

  .index__name {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }

  .index__value,
  .index__resolved {
    font-size: var(--caption-size);
    line-height: var(--caption-line);
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    color: var(--text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .index__resolved {
    color: var(--text-secondary);
  }

  .index__value.copied {
    color: var(--text-brand);
  }
</style>
