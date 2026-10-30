<script>
  // A fixture example, rendered. Nothing else — no frame, no chrome, no
  // selection. Both the canvas and a flow strip mount this, so a screen looks
  // the same in a row of ten as it does on its own.
  //
  // It exists because many screens cannot be rendered by spreading props. A
  // component whose job is to WRAP or to STAND IN FOR content — Settings' pane,
  // a workspace overview, an app window's table, detail and side panes — renders
  // as an empty box without its snippets. So an example names them:
  //
  //   snippets: { children: [{ component, props }], table: [...], side: [...] }
  //
  // Each key is the snippet prop the component declares. A snippet prop cannot
  // be minted from data without Svelte internals, so each supported name has a
  // thin wrapper below over one shared renderer; a key with no wrapper fails
  // loudly rather than rendering a blank region.

  /**
   * @property {{component?: unknown, name?: string}} fixture The registry entry.
   * @property {{props?: object, snippets?: Record<string, Array<{component: unknown, props?: object}>>}} [example]
   *   The example state to render. Each `snippets` key becomes that snippet prop.
   */
  let { fixture, example = null } = $props()

  const named = { children, overview, table, detail, side, dialogue, line, read, reads, identity, answer, monitor, inspector, timeline, preview, voiceStudio, history, welcome, structure, message, actions }

  const snippetProps = $derived.by(() => {
    const keys = Object.keys(example?.snippets ?? {})
    const unknown = keys.filter((k) => !(k in named))
    if (unknown.length) throw new Error(`FixtureView: no snippet wrapper for ${unknown.join(', ')} — add one beside the others`)
    return Object.fromEntries(keys.map((k) => [k, named[k]]))
  })
</script>

{#if fixture?.component}
  {@const Component = fixture.component}
  {#if example}
    <Component {...example.props} {...snippetProps} />
  {/if}
{:else}
  <p class="placeholder">{fixture?.name} — not yet wired</p>
{/if}

{#snippet items(key)}
  {#each example?.snippets?.[key] ?? [] as item, i (i)}
    {@const Item = item.component}
    <Item {...item.props} />
  {/each}
{/snippet}

{#snippet children()}{@render items('children')}{/snippet}
{#snippet overview()}{@render items('overview')}{/snippet}
{#snippet table()}{@render items('table')}{/snippet}
{#snippet detail()}{@render items('detail')}{/snippet}
{#snippet side()}{@render items('side')}{/snippet}
{#snippet dialogue()}{@render items('dialogue')}{/snippet}
{#snippet line()}{@render items('line')}{/snippet}
{#snippet read()}{@render items('read')}{/snippet}
{#snippet reads()}{@render items('reads')}{/snippet}
{#snippet identity()}{@render items('identity')}{/snippet}
{#snippet answer()}{@render items('answer')}{/snippet}
{#snippet monitor()}{@render items('monitor')}{/snippet}
{#snippet inspector()}{@render items('inspector')}{/snippet}
{#snippet timeline()}{@render items('timeline')}{/snippet}
{#snippet preview()}{@render items('preview')}{/snippet}
{#snippet voiceStudio()}{@render items('voiceStudio')}{/snippet}
{#snippet history()}{@render items('history')}{/snippet}
{#snippet welcome()}{@render items('welcome')}{/snippet}
{#snippet structure()}{@render items('structure')}{/snippet}
{#snippet message()}{@render items('message')}{/snippet}
{#snippet actions()}{@render items('actions')}{/snippet}

<style>
  .placeholder {
    margin: auto;
    padding: var(--spacing-2xl);
    font-size: var(--body-md-size);
    line-height: var(--body-md-line);
    color: var(--text-tertiary);
  }
</style>
