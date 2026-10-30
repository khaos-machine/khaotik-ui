<script>
  // A composed document, rendered.
  //
  // WHY THIS SHIPS. A composed component is JSON, and JSON nobody can interpret
  // is not publishable in any useful sense — an app that installs the kit needs
  // something that turns `components/composed/scene-card.json` into pixels. This
  // is that something, and it is deliberately ONE export rather than a family:
  // the kit still ships no Stack, no Grid and no Spacer, because layout lives in
  // the document as metadata rather than as components to import.
  //
  // THE HOST SUPPLIES WHAT IS HOST-SPECIFIC. Three maps come in as props and
  // none of them are guessed at here:
  //
  //   components  name -> component. Pass the barrel namespace.
  //   documents   slug -> another composed document.
  //   data        dataset id -> rows.
  //
  // `data` is the one that matters for portability. A document says
  // `{ $data: 'scenes' }`, which means "the scenes collection" and not "the
  // catalog's captured scenes" — the catalog binds its captures, an app binds its
  // live query, and the same document renders both. Baking a dataset in here
  // would turn a portable format into a catalog file format.
  //
  // `components` is a prop rather than an import of `./index.js` because this
  // component is itself exported from that barrel, and importing it back would
  // be a cycle. Explicit is also honest: the host decides what a slug may name.
  //
  // STYLES SHIP SEPARATELY, in `./lib/compose.css` — two renderers emit these
  // classes (this one and the catalog's editor), so scoped styles would give each
  // its own copy of what `gap` means. Import it alongside `tokens.css`.
  // Imported under a different name than the component's own: a self-import that
  // shares the export name makes the GENERATED declaration collide with itself
  // ("Import declaration conflicts with local declaration"), which `check-consumer`
  // catches and a consumer would have hit as a type error.
  import Self from './Composed.svelte'
  import {
    resolveComponent, resolveProps, withDefaults, layoutStyle, alignFor,
  } from './lib/compose.js'

  /**
   * @typedef {Object} Props
   * @property {object} [document] The composed document to render.
   * @property {object} [props] Values for the document's declared inputs.
   * @property {object} [components] Export name to component. Pass the barrel namespace.
   * @property {object} [documents] Slug to composed document, for nested references.
   * @property {object} [data] Dataset id to rows, for `$data` bindings.
   * @property {object} [node] INTERNAL. The node to render; recursion sets it.
   * @property {number} [depth] INTERNAL. Recursion guard; never set by a caller.
   */

  /** @type {Props} */
  let {
    document: doc = undefined,
    props = {},
    components = {},
    documents = {},
    data = {},
    node = undefined,
    depth = 0,
  } = $props()

  // A document that references itself is not a wrong picture, it is an infinite
  // one — the tab stops responding and nothing says why. Easy to author by
  // accident once composed components can hold composed components, which is
  // exactly what the model buys, so the cost of the model is this guard.
  const MAX_DEPTH = 32

  const inputs = $derived(node ? props : withDefaults(doc?.inputs, props))
  const current = $derived(node ?? doc?.root)
  const context = $derived({ inputs, data })
  const shared = $derived({ components, documents, data })

  const resolved = $derived(
    current?.type === 'component' ? resolveComponent(current.component, { components, documents }) : null,
  )
  const bound = $derived(
    current?.type === 'component' ? resolveProps(current.props, context) : { props: {}, missing: [] },
  )
</script>

{#if depth > MAX_DEPTH}
  <p class="node-gap">Stopped at {MAX_DEPTH} levels — this document references itself.</p>
{:else if current?.type === 'layout'}
  <div
    class="node node--{current.layout}"
    class:node--row={current.layout === 'stack' && current.direction === 'row'}
    style={layoutStyle(current)}
    style:align-items={alignFor(current)}
    data-node={current.id}
  >
    {#each current.children ?? [] as child, i (i)}
      <Self node={child} props={inputs} {...shared} depth={depth + 1} />
    {/each}
  </div>
{:else if current?.type === 'component'}
  {#if resolved?.kind === 'library'}
    {@const Implementation = resolved.component}
    <Implementation {...bound.props} />
  {:else if resolved?.kind === 'composed'}
    <!-- The recursion, and the whole model in one branch: the call site's props
         become the nested document's inputs, filled in from its own declared
         defaults where the call site said nothing. -->
    <Self
      document={resolved.document}
      props={bound.props}
      {...shared}
      depth={depth + 1}
    />
  {:else}
    <p class="node-gap">{current.component} names no component.</p>
  {/if}

  {#if bound.missing.length}
    <p class="node-gap">
      {bound.missing.length} binding{bound.missing.length === 1 ? '' : 's'} resolved to nothing:
      {bound.missing.join(', ')}
    </p>
  {/if}
{:else if current}
  <p class="node-gap">{current.type} is not a node type.</p>
{:else}
  <p class="node-gap">{doc?.name ?? 'This document'} has no content yet.</p>
{/if}
